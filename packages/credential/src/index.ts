import setCredential from './actions/set'
import renameCredential from './actions/rename'
import removeCredential from './actions/remove'
import decryptCredential from './actions/decrypt'
import defaultCredential from './actions/default'

export default class Credential {
  static async get() {

  }

  static set = setCredential;

  static remove = removeCredential;

  static rename = renameCredential;

  static decrypt = decryptCredential;

  static default = defaultCredential;
}
