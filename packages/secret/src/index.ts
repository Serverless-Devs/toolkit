import { networkInterfaces } from 'macaddress';
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
  static getInstance(): SecretManager {
    if (!this.instance) {
      this.initCrypto();
      this.instance = new SecretManager();
    }
    return this.instance;
  }

  /**
   * Init crypto string.
   * @returns Promise<void>
   */
  static initCrypto() {
    // DANGEROUS: default crypto string 
    let crypto = 'key123';
    const allNetInfo = networkInterfaces();
    if (Object.keys(allNetInfo).length > 0) {
      const firstInterface = Object.keys(allNetInfo)[0];
      const mac = allNetInfo[firstInterface].mac;
      crypto = mac;
    }
    this.CRYPTO_STRING = crypto;
  }

  /**
   * Init secrets.
   * @returns void
   */
  private initSecrets() {
    if (fs.pathExistsSync(secretsPath)) {
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

  /**
   * Decrypts the secret using the specified key.
   * 
   * This function is designed to retrieve a specific piece of encrypted information based on a given key. It utilizes the AES encryption algorithm to decrypt the data,
   * ensuring the security of the information. The decryption process involves the use of a predefined encryption string for decryption operations,
   * and finally converts the decrypted data into a UTF-8 string format for return.
   * 
   * @param key The key used to locate the specific encrypted information in the storage.
   * @returns Returns the decrypted information as a UTF-8 string.
   */
  getSecret(key: string) {
    // use AES algorithm to decrypt the secret
    if (!this.secrets[key]) return undefined;
    return Crypto.AES.decrypt(this.secrets[key], SecretManager.CRYPTO_STRING).toString(Crypto.enc.Utf8);
  }

  /**
   * Delete a secret.
   * @param key
   * @returns void
   */
  deleteSecret(key: string) {
    delete this.secrets[key];
    this.writeToFile();
  }
}

export default SecretManager;
