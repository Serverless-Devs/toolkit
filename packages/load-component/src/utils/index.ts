import path from 'path';
import fs from 'fs-extra';
import { get, includes, find, split, filter, isEmpty } from 'lodash';
import axios from 'axios';
import { getRootHome, getYamlContent, registry, isDevsDebugMode } from '@serverless-devs/utils';
import { BASE_URL } from '../constant';
import assert from 'assert';
const debug = isDevsDebugMode() ? require('@serverless-cd/debug')('serverless-devs:load-component') : (i: any) => {};
const getUrlWithLatest = (name: string) => `${BASE_URL}/packages/${name}/release/latest`;
const getUrlWithVersion = (name: string, versionId: string) => `${BASE_URL}/packages/${name}/release/tags/${versionId}`;

export function readJsonFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    try {
      return JSON.parse(data);
    } catch (error) { }
  }
}

const getEntryFile = async (componentPath: string) => {
  const fsStat = await fs.stat(componentPath);
  if (fsStat.isFile() || !fsStat.isDirectory()) return componentPath;
  const packageInfo: any = readJsonFile(path.resolve(componentPath, 'package.json'));
  // First look for main under the package json file
  let entry = get(packageInfo, 'main');
  if (entry) return path.resolve(componentPath, entry);
  // Second check the out dir under the tsconfig json file
  const tsconfigPath = path.resolve(componentPath, 'tsconfig.json');
  const tsconfigInfo = readJsonFile(tsconfigPath);
  entry = get(tsconfigInfo, 'compilerOptions.outDir');
  if (entry) return path.resolve(componentPath, entry);
  // Third look for src index js
  const srcIndexPath = path.resolve(componentPath, './src/index.js');
  if (fs.existsSync(srcIndexPath)) return srcIndexPath;
  const indexPath = path.resolve(componentPath, './index.js');
  if (fs.existsSync(indexPath)) return indexPath;
  throw new Error(
    'The component cannot be required. Please check whether the setting of the component entry file is correct. In the current directory, first look for main under the package json file, secondly look for compiler options out dir under the tsconfig json file, thirdly look for src index js, and finally look for index js',
  );
};

export const buildComponentInstance = async (componentPath: string, params?: any, cleanCache: boolean = false) => {
  const requirePath = await getEntryFile(componentPath);
  // bug: `- component: fc invoke` timeout. Delete require cache
  if (cleanCache && require.cache[requirePath]) {
    try {
      delete require.cache[requirePath];
    } catch {}
  }
  const baseChildComponent = await require(requirePath);

  const ChildComponent = baseChildComponent.default || baseChildComponent;
  try {
    const componentInstance = new ChildComponent(params);
    if (componentInstance) {
      componentInstance.__path = componentPath;
      const publishData = getYamlContent(path.join(componentPath, 'publish.yaml'));
      const schema = get(publishData, 'Schema');
      componentInstance.schemaPath = schema ? path.join(componentPath, schema) : undefined;
      const version = get(publishData, 'Version');
      if (version) {
        componentInstance.__version = version;
        componentInstance.__info = `${get(publishData, 'Name')}@${version}`;
      }
    }
    return componentInstance;
  } catch (error) {
    return ChildComponent;
  }
};

export function getProvider(name: string) {
  if (isValidUrl(name)) {
    return [name, 'CUSTOM'];
  }
  assert(!includes(name, '/'), `The component name ${name} cannot contain /`);
  const [componentName, componentVersion] = split(name, '@');
  const { core_load_serverless_devs_component } = process.env;
  if (core_load_serverless_devs_component) {
    const componentList = filter(split(core_load_serverless_devs_component, ';'), v => includes(v, '@'));
    const componentNames = [];
    const obj: any = {};
    for (const item of componentList) {
      const [n, v] = split(item, '@');
      componentNames.push(n);
      obj[n] = v;
    }
    const key = componentName;
    if (find(componentNames, v => v === key)) {
      return [componentName, obj[key]];
    }
  }
  return [componentName, componentVersion];
}

export const getZipballUrl = async (componentName: string, componentVersion?: string) => {
  if(componentVersion === 'CUSTOM') {
    return {};
  }
  const url = componentVersion ? getUrlWithVersion(componentName, componentVersion) : getUrlWithLatest(componentName);
  debug(`url: ${url}`);
  try {
    const res = await axios.get(url, { headers: registry.getSignHeaders() });
    debug(`res: ${JSON.stringify(res.data)}`);
    const zipball_url = get(res, 'data.body.zipball_url');
    if (isEmpty(zipball_url)) throw new Error(`url: ${url} is not found`);
    return { zipballUrl: zipball_url, version: get(res, 'data.body.tag_name') };
  } catch (error) {
    if (get(error, 'response.status') === 404) {
      const name = componentVersion ? `${componentName}@${componentVersion}` : componentName;
      throw new Error(`Component or plugin ${name} is not found`);
    }
    throw error;
  }
};

export const getComponentCachePath = (componentName: string, componentVersion?: string) => {
  componentName = isValidUrl(componentName) ? componentName.split('/').pop()?.split('.')[0] || '' : componentName;
  return path.join(getRootHome(), 'components', 'devsapp.cn', 'v3', componentVersion ? `${componentName}@${componentVersion}` : componentName);
};

export function isValidUrl(s: string) {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
}
