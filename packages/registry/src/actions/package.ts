import zip from '@serverless-devs/zip';
import { getRootHome, registry } from '@serverless-devs/utils';
import fs from 'fs';
import { getYamlContentText, getContentText, request } from '../util';
import { PUBLISH_URL, PRIVATE_LIST_URL } from '../request-url';
import logger from '../util/logger';
import path from 'path';
import yaml from 'js-yaml';
import querystring from 'querystring';
import { forEach, get, isEmpty, includes, keys, difference } from 'lodash';
import chalk from 'chalk';
import { publishSchema } from './constant';
import Ajv from 'ajv';
import { validateTemplateParameters } from '../util/validate';

interface IRequest {
  /**
   * 版本信息，如果指定了优先使用，如果不指定则优先使用publish参数中的version
   */
  package_version?: string;
  /**
   * Publish.yaml
   */
  publish: string;
  /**
   * 英文版 Publish.yaml
   */
  publish_en?: string;
  /**
   * readme
   */
  readme?: string;
  /**
   * 英文版 readme
   */
  readme_en?: string;
  /**
   * s.yaml
   */
  syaml?: string;
  /**
   * s.yaml
   */
  flowyaml?: string;
  /**
   * 英文版 s.yaml
   */
  syaml_en?: string;
  /**
   * 版本信息
   */
  version_body?: string;
  /**
   * 英文版版本信息
   */
  version_body_en?: string;
}

function checkEdition(str: string) {
  if (!str) {
    throw new Error('Need to publish YAML content');
  }
  const { Edition } = yaml.load(str) as Record<string, any>;
  if (Edition !== '3.0.0') {
    let message: string;
    if (!Edition || Edition === '2.0.0' || Edition === '1.0.0') {
      message = `Edition be 2.0.0 / 1.0.0 version, please use 's cli registry publish'`;
    } else {
      message = 'Edition must be 3.0.0 version.';
    }
    throw new Error(message);
  }
}

function getFlowsYaml(str: string | undefined, codeUri: string) {
  if (!str) {
    return {};
  }
  // fix: s.yaml maybe contain if/else magic code
  try {
    const { resources } = yaml.load(str) as Record<string, any>;
    const definitionPaths: any = {};
    forEach(resources, (value: any, key: string) => {
      const component: string = get(value, 'component', '');
      const definition: string = get(value, 'props.definition', '');
      const fnfComponents = ['devsapp/fnf', 'fnf', 'devsapp/fnf@dev', 'fnf@dev'];
      if (includes(fnfComponents, component) && definition) {
        definitionPaths[key] = definition;
      }
    });
    if (isEmpty(definitionPaths)) return [];
    const flowsYaml: any[] = [];
    forEach(definitionPaths, (value: string, key: string) => {
      flowsYaml.push({ [key]: getYamlContentText(path.join(codeUri, 'src', value)) });
    });
    return flowsYaml;
  } catch (error) {
    return []
  }
}

async function getUploadUrl(codeUri: string): Promise<string> {
  const publishYaml = getYamlContentText(path.join(codeUri, 'publish')) as string;

  const publishEnYaml = getYamlContentText(path.join(codeUri, 'publish_en'));
  const sYaml = getYamlContentText(path.join(codeUri, 'src', 's'));
  const flowYaml = getFlowsYaml(sYaml, codeUri);
  const sEnYaml = getYamlContentText(path.join(codeUri, 'src', 's_en'));
  const versionMd = getContentText(path.join(codeUri, 'version.md'));
  const versionEnMd = getContentText(path.join(codeUri, 'version_body_en.md'));
  const readme = getContentText(path.join(codeUri, 'readme.md'));
  const readmeEn = getContentText(path.join(codeUri, 'readme_en.md'));
  const requestBodyIRequest: IRequest = {
    publish: publishYaml,
    publish_en: publishEnYaml,
    version_body: versionMd,
    version_body_en: versionEnMd,
    flowyaml: JSON.stringify(flowYaml),
    syaml: sYaml,
    syaml_en: sEnYaml,
    readme_en: readmeEn,
    readme,
  };

  const { body, request_id } = await request.new_request_post(PUBLISH_URL, requestBodyIRequest);
  logger.debug(`Publish responseId: ${request_id}`);
  if (typeof body === 'string') {
    throw new Error(body);
  }
  logger.debug(`Publish res body: ${JSON.stringify(body)}`);
  return body.url;
}

function getNameAndVersion(codeUri: string): string {
  const publishYaml = getYamlContentText(path.join(codeUri, 'publish')) as string;
  const { Version, Name } = yaml.load(publishYaml) as Record<string, any>;
  return `${Name}@${Version}`;
}

export interface IList {
  category?: string;
  tag?: string;
  search?: string;
  page?: string;
  private?: boolean;
}

export const list = async (options?: IList) => {
  const headers = registry.getSignHeaders();
  const { private: _private, ...rest } = options || {};
  const qs = querystring.stringify((rest || {}) as any);
  const uri = _private ? `${PRIVATE_LIST_URL}?${qs}` : `${PUBLISH_URL}?${qs}`;

  logger.debug(`Get registry list uri: ${uri}`);
  const { body, request_id } = await request.new_request_get(uri, headers);
  logger.debug(`Get registry list responseId: ${request_id}`);

  if (typeof body === 'string') {
    throw new Error(body);
  }

  return body;
};

// yaml validate before publish
const validate = (codeUri: string) => {
  const publishYaml = getYamlContentText(path.join(codeUri, 'publish')) as string;
  checkEdition(publishYaml);

  try {
    yaml.load(publishYaml) as Record<string, any>;
  } catch (error) {
    throw new Error(`Publish.yaml format error, please check the yaml.`);
  }
  const yamlObject = yaml.load(publishYaml) as Record<string, any>;
  const errorMsg = `Publish.yaml illegal.
  Application dev: https://manual.serverless-devs.com/dev-guide/application/
  Component dev: https://manual.serverless-devs.com/dev-guide/component/
  Plugin dev: https://manual.serverless-devs.com/dev-guide/plugin/
  `  
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(publishSchema);
  if(!validate(yamlObject)) {
    const errors = validate.errors;
    if(errors) {
      errors.forEach((error) => {
        const {schemaPath, message} = error;
        logger.error(`Publish.yaml illegal:\nyamlPath: ${path.join(codeUri, 'publish.yaml')}\nschemaPath: ${schemaPath}\nmessage: ${message}`)
      })
      throw new Error(errorMsg);
    }
  }
  if(yamlObject.Type === 'Component' && (!yamlObject.Commands || yamlObject.Commands.length === 0)) {
    logger.write('Publish.yaml illegal, \'Commands\' should be defined in Component\'s publish.yaml , please check the yaml.')
    throw new Error(errorMsg);
  }

  let services: string[] = [];
  const sYaml = getYamlContentText(path.join(codeUri, 'src', 's')) as string;
  if (sYaml != undefined) {
    try {
      const sObj = yaml.load(sYaml) as Record<string, any>;
      services = keys(get(sObj, 'resources'));
    } catch {
      // throw Error('s.yaml format error.');
    }
  }
  // build.yaml check
  const buildYaml = getYamlContentText(path.join(codeUri, 'src', 'build')) as string;
  if (buildYaml != undefined) {
    // 1. format check
    try {
      yaml.load(buildYaml) as Record<string, any>;
    } catch {
      throw Error('build.yaml format error.');
    }
    // 2. check build.yaml services
    const buildObj = yaml.load(buildYaml) as Record<string, any>;
    const buildServices = keys(buildObj);
    if (services.length > 0) {
      // if buildServices are not in services, throw error
      const errorServices = difference(buildServices, services);
      if (errorServices.length > 0) {
        throw Error(`build.yaml services: ${errorServices.join(',')} are not in s.yaml services: ${services.join(',')}`);
      }
    } 
  }
  // variables.yaml check
  const variablesYaml = getYamlContentText(path.join(codeUri, 'src', 'variables')) as string;
  if (variablesYaml != undefined) {
    // 1. format check
    try {
      yaml.load(variablesYaml) as Record<string, any>;
    } catch {
      throw Error('variables.yaml format error.');
    }
    // 2. check variables.yaml services
    const variablesObj = yaml.load(variablesYaml) as Record<string, any>;
    const variablesServices = keys(get(variablesObj, 'services'));
    if (services.length > 0) {
      // if variablesServices are not in services, throw error
      const errorServices = difference(variablesServices, services);
      if (errorServices.length > 0) {
        throw Error(`variables.yaml services: ${errorServices.join(',')} are not in s.yaml services: ${services.join(',')}`);
      }
    }
  }
  const { valid, errInfo } = validateTemplateParameters(sYaml, publishYaml);
  if (!valid) {
    throw new Error(errInfo?.message);
  } else if (valid && errInfo?.code === 'failed') {
    logger.warn(errInfo?.message);
  }
}

export const publish = async (codeUri: string) => {
  // 发布前校验
  validate(codeUri);
  // 发布版本，获取上传文件地址
  const uploadUrl = await getUploadUrl(codeUri);
  logger.debug(`Publish upload url: ${uploadUrl}`);
  const packageInfo = getNameAndVersion(codeUri);
  logger.debug(`Publish package info: ${packageInfo}`);

  // 压缩文件
  const zipResult = await zip({
    codeUri,
    outputFilePath: path.join(getRootHome(), 'cache', 'registry', 'publish'),
    logger
  });
  logger.debug(`Zip file size: ${zipResult.compressedSize}`);
  logger.debug(`Zip file count: ${zipResult.count}`);
  logger.debug(`Zip file outputFile: ${zipResult.outputFile}`);

  // if size > 10MB, show warning, > 20MB, show error
  if (zipResult.compressedSize > 10 * 1024 * 1024 && zipResult.compressedSize <= 20 * 1024 * 1024) {
    logger.warn(`Package size is ${zipResult.compressedSize / 1024 / 1024}MB, which is larger than 10MB.`);
  } else if (zipResult.compressedSize > 20 * 1024 * 1024) {
    logger.error(`Package size is ${zipResult.compressedSize / 1024 / 1024}MB, which is larger than 20MB.`);
    throw new Error('Package size is larger than 20MB. Please optimize your package.');
  }

  // 上传压缩文件
  await request.request_put(uploadUrl, zipResult.outputFile);
  logger.write(`${chalk.green(`Publish package ${packageInfo} success.`)}`);

  // 删除压缩文件
  fs.unlinkSync(zipResult.outputFile);
};
