import artTemplate from "@serverless-devs/art-template";
import yaml from "js-yaml";
import { set, get } from "lodash";
import YAML from "yaml";
import util from "util";
import logger from "./logger";

const TYPE = {
  PARAM: 'param',
  EXP: 'exp',
  STR: 'str',
};

const getMagicParameters = (v: any, properties: Object) => {
  if (v === '' || v === null || v === undefined) return [];
  const { result } = artTemplate.analyze(v);
  const context = result.context;
  const variables = context.map(item => item.name).filter(item => {
    const list = ['$$out', '$$line', '$escape'];
    return !list.includes(item);
  });
  const r = new Set();
  for (const kVar of variables) {
    if (Object.keys(properties).includes(kVar)) {
      r.add(kVar);
    }
  }
  return Array.from(r);
};

const replaceKeysToArtParams = (yamlString: string, path: string[], suffix: string = '') => {
  const obj = YAML.parseDocument(yamlString) as any;
  const keys = obj.getIn(path).items;
  keys.map((item: any) => item.key.value = `\\{{${suffix ? suffix : ''}${item.key.value}}}\\`);
  return obj.toString();
}

// 针对语句进行分析
const parseExpression = (res: Record<string, any>, compiler: any) => {
  let newYaml = '';
  const expressionParamsPosition = {} as Record<string, any>;
  for (const i in res.scripts) {
    if (getScriptItemType(res.scripts[i]) === TYPE.PARAM) {
      // 将{{}}变量替换为常量，只分析语句
      newYaml += `${res.scripts[i].tplToken.script.code}`
    } else if (getScriptItemType(res.scripts[i]) === TYPE.STR) {
      newYaml += `${res.scripts[i].source}`
    } else if (getScriptItemType(res.scripts[i]) === TYPE.EXP) {
      // 获取语句中的变量
      let params = compiler.getVariables(
        compiler.getEsTokens(res.scripts[i].tplToken.script.code)
      );
      
      params.map((item: string) => {
        // 获取语句的行index
        if (expressionParamsPosition[item]) {
          expressionParamsPosition[item].push(res.scripts[i].tplToken.line);
        } else {
          expressionParamsPosition[item] = [res.scripts[i].tplToken.line];
        }
      })
    }
  }

  // 如果没有语句
  if (Object.keys(expressionParamsPosition).length == 0) return {vars: [], services: {}};

  // 将一级key和services下面的服务名转变为art-template变量
  let newYamlString = replaceKeysToArtParams(newYaml, ['resources']);
  newYamlString = replaceKeysToArtParams(newYamlString, [], 'lev1.');
  const { result: serviceRes } = artTemplate.analyze(newYamlString);
  // 包含各services开头的行index和各个一级key的行index
  const scripts = serviceRes.scripts;
  const servicesPositions = {} as Record<string, any>;
  let highestLine = 0;

  // 获取services末尾的行index
  for (const index in scripts) {
    const item = scripts[index];
    if (getScriptItemType(item) === TYPE.PARAM) {
      if (item.tplToken.script.code.startsWith('lev1.') && item.tplToken.script.code !== 'lev1.resources') {
        highestLine = item.tplToken.line;
      }
    }
  }

  // 获取所有services的起始行index
  const _scripts = scripts.filter(item => getScriptItemType(item) === TYPE.PARAM && !item.tplToken.script.code.startsWith('lev1.'));
  // 第一个service的起始行index
  const lowestLine = _scripts[0].tplToken.line;
  // 如果services就是最后一个一级key
  if (highestLine < lowestLine) highestLine = Infinity;

  // 获取每个service的范围
  for (const index in _scripts) {
    const item = _scripts[index];
    servicesPositions[item.tplToken.script.code] = [item.tplToken.line, _scripts[Number(index) + 1] ? _scripts[Number(index) + 1].tplToken.line : highestLine];
  }
  
  const result = {vars: [] as string[], services: {} as Record<string, any>}
  for (const i of Object.keys(expressionParamsPosition)) {
    // 语句中变量出现的所有位置
    // 如果变量有出现在services外，则为全局变量
    if (expressionParamsPosition[i].find((item: number) => item <= lowestLine || item >= highestLine)) {
      result.vars.push(i);
      continue;
    }
    for (const j of Object.keys(servicesPositions)) {
      // 有否有出现在当前service中
      const positionRes = expressionParamsPosition[i].filter((item: number) => item >= servicesPositions[j][0] && item <= servicesPositions[j][1]);
      // 全部出现在当前service中，则该变量为当前service的变量
      if (positionRes.length == expressionParamsPosition[i].length) {
        result.services[j] = i;
      // 全部不出现在当前service中，待定
      } else if (positionRes.length === 0) {
        continue;
      // 部分出现在当前service中，则该变量为全局变量
      } else {
        result.vars.push(i);
        break;
      }
    }
  }
  return result;
}

const parseYaml = (curDict: Record<string, any>, yamlObj: any, properties: Record<string, any>) => {
  if (typeof yamlObj === "object" && yamlObj !== null) {
    for (const [, v] of Object.entries(yamlObj)) {
      if (typeof v === "object" && v !== null) {
        parseYaml(curDict, v, properties);
      } else if (typeof v === "string") {
        const v2 = v.trim();
        const parameters = getMagicParameters(v2, properties);
        for (const p of parameters) {
          curDict[p as string] = p;
        }
      }
    }
  } else if (Array.isArray(yamlObj)) {
    for (const v of yamlObj) {
      if (typeof v === "object" && v !== null) {
        parseYaml(curDict, v, properties);
      } else if (typeof v === "string") {
        const v2 = v.trim();
        const parameters = getMagicParameters(v2, properties);
        for (const p of parameters) {
          curDict[p as string] = p;
        }
      }
    }
  } else {
    throw Error(`Error: ${JSON.stringify(yamlObj)}`);
  }
};

const getScriptItemType = (scriptItem: any) => {
  if (scriptItem.tplToken.type == 'expression') {
    if (scriptItem.tplToken.script.output == 'escape') {
      return TYPE.PARAM;
    }
    return TYPE.EXP;
  }
  return TYPE.STR;
};

function checkDuplicateTemplateVariables(_data: any) {
  const variableCounts = {} as Record<string, any>;

  function traverse(data: any) {
    if (Array.isArray(data)) {
      for (const item of data) {
        traverse(item);
      }
    } else if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        if (key === "component") {
          continue;
        }
        traverse(value);
      }
    } else if (typeof data === 'string') {
      const variable = data.trim();
      if (variable in variableCounts) {
        variableCounts[variable] += 1;
      } else {
        variableCounts[variable] = 1;
      }
    }
  }

  traverse(_data);

  // 检查是否有变量出现了多次
  const duplicates = Object.entries(variableCounts).reduce((acc, [varName, count]) => {
    if (count > 1) {
      set(acc, varName, count);
    }
    return acc;
  }, {});

  if (Object.keys(duplicates).length > 0) {
    return { result: true, msg: {
      message: `Duplicate template variables found: ${util.inspect(duplicates)}. Please add them into vars and use \${vars.} to reference them.`,
      code: "failed",
    }};
  }

  return { result: true, msg: { message: "No duplicate template variables found.", code: "success" }};
}

export const validateTemplateParameters = (sYamlText: string, publishYamlText: string) => {
  const publishYamlObj = yaml.load(publishYamlText) as Record<string, any>;
  const parameters = publishYamlObj.Parameters;
  const properties = parameters.properties;

  const { result: res, compiler } = artTemplate.analyze(sYamlText);
  let formattedSYaml = '';

  // 遍历解析结果，确保yaml合法
  for (const i in res.scripts) {
    if (getScriptItemType(res.scripts[i]) === TYPE.PARAM) {
      formattedSYaml += `/{{${res.scripts[i].tplToken.script.code}}}/`;
    } else if (getScriptItemType(res.scripts[i]) === TYPE.EXP) {
      continue;
    } else {
      formattedSYaml += res.scripts[i].source;
    }
  }

  let sYamlDict: any;
  try {
    sYamlDict = yaml.load(formattedSYaml);
  } catch(e) {
    // return hackGetParamsLoc(tplLi[0], properties);
    logger.debug('s.yaml format error.');
    logger.debug(formattedSYaml);
    return { valid: false, errInfo: { code: 'failed', message: `s.yaml format error: \n${e}` }};
  }

  const result = { global: {} as Record<string, any>, services: {} as Record<string, any> };
  if (!sYamlDict.vars) {
    sYamlDict.vars = {};
  }
  if (!sYamlDict.resources) {
    return { valid: false, errInfo: { code: 'failed', message: 'Invalid s.yaml, no resources.' }};
  }
  parseYaml(result.global, sYamlDict.vars, properties);

  for (const [k, v] of Object.entries(sYamlDict.resources)) {
    result.services[k] = { component: get(v, 'component'), parameters: {} };
    parseYaml(result.services[k].parameters, get(v, 'props'), properties);
  }

  // 语句分析结果
  const expRes = parseExpression(res, compiler);
  // 将语句分析结果加入到result
  for (const glp of expRes.vars) {
    if (glp in result.global) continue;
    set(result.global, glp, glp);
  }
  for (const glp of Object.keys(expRes.services)) {
    if (glp in result.services) continue;
    set(result.services, `${glp}.parameters.${expRes.services[glp]}`, expRes.services[glp]);
  }

  // 检查变量重复
  const { result: valid, msg: errInfo } = checkDuplicateTemplateVariables(result);
  return { valid, errInfo };
  // if (!valid) {
  //   logger.error(JSON.stringify(errInfo, null, 2));
  //   return errInfo;
  // }
};
