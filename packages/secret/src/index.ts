import { mac } from 'address';

class SecretManager {
  private static CRYPTO_STRING: string = '';
  private static secret: Record<string, any> = {};

  constructor () {
    if (!SecretManager.CRYPTO_STRING) {
      mac((err, addr) => {
        if (err) {
          throw err;
        }
        if (!addr) {
          throw new Error('mac address not found');
        }
        SecretManager.CRYPTO_STRING = addr;
      });
    }
  }
  private static getCryptoString() {
    return SecretManager.CRYPTO_STRING;
  }
  static getCrypto() {
    return SecretManager.getCryptoString();
  }
  static getSecrets() {
    return this.secret;
  }
  static initSecrets(secrets: Record<string, any>) {
    this.secret = secrets;
  }
  static getSecretKeys() {
    return Object.keys(this.secret);
  }
  static getSecret(key: string) {
    return this.secret[key];
  }
  // setSecret(key: string, value: string) {
  //   secret 
  // }
}