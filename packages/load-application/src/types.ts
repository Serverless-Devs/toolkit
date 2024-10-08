export interface IOptions {
  /**
   * Path to where your file will be written.
   *
   * @default process.cwd()
   */
  dest?: string;
  /**
   * The logger
   */
  logger?: any;
  /**
   * Name of the saved file.
   *
   * @default componentName (e.g. template为 devsapp/start-fc-http-nodejs14时，componentName为start-fc-http-nodejs14)
   */
  projectName?: string;
  /**
   * The template parameters, which will be passed to the s.yaml file
   *
   * @default publish.yaml 里的 parameters 默认值
   */
  parameters?: Record<string, any>;
  /**
   * The template appName, which will be passed to the s.yaml file (name field)
   */
  appName?: string;
  /**
   * The template access, which will be passed to the s.yaml file (access field)
   *
   * @default default
   */
  access?: string;
  /**
   * Use specify uri, Eg: remote url, local dir, local zip file
   */
  uri?: string;
  /**
   * Assume that the answer to any question which would be asked is yes
   */
  y?: boolean;
  /**
   * Whether overwrite all files in the destination directory
   */
  overwrite?: boolean;
  /**
   * Whether to use for inner apis
   */
  inner?: boolean;
}

export enum IProvider {
  DEVSAPP = 'devsapp',
  PERSONAL = 'personal',
}
