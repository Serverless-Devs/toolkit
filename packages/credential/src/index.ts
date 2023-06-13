import setCredential from './actions/set'
import renameCredential from './actions/rename'
import removeCredential from './actions/remove'

export default class Credential {
  static async get() {

  }

  static set = setCredential;

  static remove = removeCredential;

  static rename = renameCredential;

  static async decrypt() {
    
  }

  static async default() {
    // return 'default';
  }
}
