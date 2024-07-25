import { one } from 'macaddress';
import { secretsPath } from './constant';
import fs from 'fs-extra';
import jsYaml from 'js-yaml';
import { getRootHome } from '@serverless-devs/utils';
const Crypto = require('crypto-js');

class SecretManager {
  private static instance: SecretManager | null = null;
  private static CRYPTO_STRING: string = '';
  private secrets: Record<string, any> = {};

  private constructor() {
    // init secrets
    this.initSecrets();
  }

  /**
   * Init a Secret Manager instance. Use singleton pattern.
   * @returns Promise<SecretManager>
   */
  static async getInstance(): Promise<SecretManager> {
    if (!this.instance) {
      await this.initCrypto();
      this.instance = new SecretManager();
    }
    return this.instance;
  }

  /**
   * Init crypto string.
   * @returns Promise<void>
   */
  static async initCrypto() {
    this.CRYPTO_STRING = await one();
  }

  /**
   * Init secrets.
   * @returns void
   */
  private initSecrets() {
    if (fs.pathExistsSync(secretsPath)) {
      console.log(secretsPath);
      this.secrets = jsYaml.load(fs.readFileSync(secretsPath, 'utf8')) || {};
    } else {
      fs.ensureDirSync(getRootHome());
      fs.writeFileSync(secretsPath, jsYaml.dump({}));
      this.secrets = {};
    }
  }

  /**
   * Write secrets to file.
   * @returns void
   */
  private writeToFile() {
    fs.writeFileSync(secretsPath, jsYaml.dump(this.secrets));
  }

  /**
   * Add a secret.
   * @param key
   * @param value
   * @returns void
   */
  addSecret(key: string, value: string) {
    // use AES algorithm to encrypt the secret
    this.secrets[key] = Crypto.AES.encrypt(value, SecretManager.CRYPTO_STRING).toString();
    this.writeToFile();
  }

  /**
   * Get all secrets.
   * @returns Record<string, any>
   */
  getAllSecrets() {
    return this.secrets;
  }

  getSecret(key: string) {
    // use AES algorithm to decrypt the secret
    return Crypto.AES.decrypt(this.secrets[key], SecretManager.CRYPTO_STRING).toString(Crypto.enc.Utf8);
  }
}

export default SecretManager;
