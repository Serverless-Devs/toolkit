import setCredential from './actions/set'
import getCredential from './actions/get'
import getAllCredential from './actions/get-all'
import renameCredential from './actions/rename'
import removeCredential from './actions/remove'
import decryptCredential from './actions/decrypt'
import defaultCredential from './actions/default'

export default class Credential {
  static get = getCredential;

  static getAll = getAllCredential;

  static set = setCredential;

  static remove = removeCredential;

  static rename = renameCredential;

  static decrypt = decryptCredential;

  static default = defaultCredential;
}
