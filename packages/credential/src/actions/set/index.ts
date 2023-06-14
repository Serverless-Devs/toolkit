import { each, keys, set, intersection, get, isEmpty, merge, isNumber, cloneDeep } from "lodash";
import { getYamlContent, writeData, Alibaba, IAliCredential } from "../../utils";
import { CRYPTO_STRING, PROVIDER, PROVIDER_CREDENTIAL_KEYS } from "../../constant";
import * as inquirer from "./inquirer";

const Crypto = require('crypto-js');

class SetCredential {
  async run(options: Record<string, any>): Promise<undefined | Record<string, string>>{
    const { argvData, credInformation } = this.handlerArgv(options);
    const { access, force } = argvData;

    // 没有通过参数指定，交互式设置
    if (isEmpty(credInformation)) {
      const result = await inquirer.inputCredentials();
      merge(credInformation || {}, result);
    }

    const aliasName = await inquirer.getAlias({ access, force });
    if (aliasName === false) { return }

    // 如果是 ali 密钥则手动添加设置一些可获取密钥
    if (Alibaba.isAlibaba(credInformation)) {
      if (argvData.SecurityToken) {
        set(credInformation, 'SecurityToken', argvData.SecurityToken);
      }
      await this.setAccountId(argvData, credInformation);
    }

    const content = await getYamlContent();

    // 加密字段
    const info = {};
    Object.keys(credInformation).forEach((key: string) => {
      const value = String(get(credInformation, key));
      const cipherText = Crypto.AES.encrypt(value, CRYPTO_STRING);
      set(info, key, cipherText.toString());
    });
  
    merge(content, { [aliasName as string]: info });

    await writeData(content);
    return credInformation;
  }

  // 先判断用户指定的参数，如果指定参数是 number 类型，则先转为 string 类型
  // 通过 ak、sk 获取 uid
  //   如果获取到了 uid 并且用户指定了 uid，则先对比一下。使用通过接口获取到的 uid
  //   如果没有获取 uid，如果没有传入 uid，抛出异常。如果传入了 uid，使用传入的
  private async setAccountId(argvData: Record<string, string>, credInformation: Record<string, string>) {
    let uid = argvData.AccountID;
    if (isNumber(uid)) {
      uid = `${uid}`;
    }

    try {
      const accountId = await Alibaba.getAccountId(credInformation as unknown as IAliCredential);
      if (uid && uid !== accountId) {
        console.warn('The inputted AccountID does not match the actual obtained value, using the actual value');
      }
      set(credInformation, 'AccountID', accountId);
    } catch (ex) {
      if (!uid) {
        throw ex;
      }
      set(credInformation, 'AccountID', uid);
    }
  }

  private handlerArgv(argvData: Record<string, string>): { credInformation: Record<string, string>; argvData: Record<string, any> } {
    const argvKeys = keys(argvData); 
    // 处理已知密钥对支持
    for (const provider in PROVIDER_CREDENTIAL_KEYS) {
      const keys = get(PROVIDER_CREDENTIAL_KEYS, provider);
      // 完整包含 keys
      if (intersection(argvKeys, keys).length === keys.length) {
        const credInformation = { __provider: provider };
        each(keys, key => set(credInformation, key, argvData[key]));

        return {
          credInformation,
          argvData,
        };
      }
    }
    // 处理自定义
    const { keyList, infoList } = argvData;
    if (keyList && infoList) {
      const infoKeyList = keyList.split(',');
      const infoValueList = infoList.split(',');

      if (infoKeyList.length === infoValueList.length) {
        const credInformation = { __provider: PROVIDER.custom };
        each(infoKeyList, (value, index) => {
          set(credInformation, value, infoValueList[index]);
        })
        return { argvData, credInformation };
      } else {
        throw new Error('Please make sure --kl/--keyList is as long as --il/--infoList');
      }
    }

    // TODO: 多余的参数怎么警告
    return { argvData, credInformation: {} };
  }
}

export default async (options: Record<string, any>) => {
  const setCredential = new SetCredential();
  return await setCredential.run(cloneDeep(options));
}
