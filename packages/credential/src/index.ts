import setCredential from './actions/set'
import renameCredential from './actions/rename'
import removeCredential from './actions/remove'
import decryptCredential from './actions/decrypt'
import defaultCredential from './actions/default'

export default class Credential {
  static async get(access?: string) {
    // 优先级处理: 环境变量、access.yaml
    // 如果 access 不存在
    /**
     * yaml
     */
  }

  static set = setCredential;

  static remove = removeCredential;

  static rename = renameCredential;

  static decrypt = decryptCredential;

  static default = defaultCredential;
}
