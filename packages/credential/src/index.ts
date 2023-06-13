import setCredential from './actions/set'
import renameCredential from './actions/rename'
import removeCredential from './actions/remove'
import decryptCredential from './actions/decrypt'

export default class Credential {
  static async get() {

  }

  static set = setCredential;

  static remove = removeCredential;

  static rename = renameCredential;

  static decrypt = decryptCredential;

  static async default() {
    // return 'default';
  }
}
