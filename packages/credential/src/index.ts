import setCredential from './actions/set'
import removeCredential from './actions/remove'

export default class Credential {
  static async get() {

  }

  static set = setCredential;

  static remove = removeCredential;

  static async rename() {
    
  }

  static async decrypt() {
    
  }

  static async default() {
    // return 'default';
  }
}
