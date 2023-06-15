import { cloneDeep } from 'lodash';
import Logger from './logger';
import SetCredential, { IResult } from './actions/set';
import GetCredential from './actions/get';
import getAllCredential from './actions/get-all';
import renameCredential from './actions/rename';
import removeCredential from './actions/remove';
import decryptCredential from './actions/decrypt';
import defaultCredential from './actions/default';


export default class Credential {
  constructor({ logger }: { logger?: any} = {}) {
    Logger.set(logger);
  }

  public async get(access?: string): Promise<IResult> {
    const getAccess = new GetCredential(access);
    return await getAccess.run();
  };

  public async set(options?: Record<string, any>): Promise<IResult | undefined> {
    const setCredential = new SetCredential();
    return await setCredential.run(cloneDeep(options || {}));
  };

  public getAll = getAllCredential;

  public remove = removeCredential;

  public rename = renameCredential;

  public decrypt = decryptCredential;

  public default = defaultCredential;
}
