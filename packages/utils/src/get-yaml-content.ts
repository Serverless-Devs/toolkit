import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import DevsError, { ETrackerType } from './devs-error';

export const getAbsolutePath = (filePath: string = '', basePath: string = process.cwd()) => {
  if (!filePath) return filePath;
  return path.isAbsolute(filePath) ? filePath : path.join(basePath, filePath);
};

export function getYamlPath(filePath: string) {
  const parse = path.parse(filePath);
  const newPath = path.join(parse.dir, parse.name);

  const yamlPath = newPath + '.yaml';
  if (fs.existsSync(yamlPath)) return yamlPath;

  const YAMLPath = newPath + '.YAML';
  if (fs.existsSync(YAMLPath)) return YAMLPath;

  const YMLPath = newPath + '.YML';
  if (fs.existsSync(YMLPath)) return YMLPath;

  const ymlPath = newPath + '.yml';
  if (fs.existsSync(ymlPath)) return ymlPath;
}

export default function getYamlContent(filePath: string): Record<string, any> {
  const yamlPath = getYamlPath(filePath);
  const arr = ['.yaml', '.yml'];
  if (!arr.includes(path.extname(filePath))) {
    throw new Error(`${filePath} file should be yaml or yml file.`);
  }
  if (yamlPath) {
    try {
      return yaml.load(fs.readFileSync(filePath, 'utf8')) as Record<string, any>;
    } catch (e) {
      const error = e as Error;
      const filename = path.basename(filePath);
      let message = `${filename} format is incorrect`;
      if (error.message) message += `: ${error.message}`;
      throw new DevsError(message, {
        tips: `Please check the configuration of ${filename}, Serverless Devs' Yaml specification document can refer to：'https://docs.serverless-devs.com/user-guide/spec/'`,
        trackerType: ETrackerType.parseException,
      });
    }
  }
  return {};
}
