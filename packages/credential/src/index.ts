import setCredential from './actions/set'
import getCredential from './actions/get'
import renameCredential from './actions/rename'
import removeCredential from './actions/remove'
import decryptCredential from './actions/decrypt'
import defaultCredential from './actions/default'

export default class Credential {
  static get = getCredential;

  static set = setCredential;

  static remove = removeCredential;

  static rename = renameCredential;

  static decrypt = decryptCredential;

  static default = defaultCredential;
}
