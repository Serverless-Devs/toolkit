import { hasIn, transform, set } from "lodash";
import { prompt, getYamlContent, writeData } from "../utils";
import { CRYPTO_STRING } from "../constant";

const Crypto = require('crypto-js');

export default async (access?: string) => {
  const content = await getYamlContent();

  let alias = access;
  if (access) {
    if (!hasIn(content, access)) {
      console.error(`Not found alias name: ${access}`);
      return;
    }
  } else {
    const aliasNames = Object.keys(content);
    console.log('You can choose an access to set as the default.');
    const { aliasName } = await prompt([
      {
        type: 'list',
        name: 'aliasName',
        message: 'Please select an access:',
        choices: aliasNames.map((alias: string) => ({
          name: alias, value: alias
        })),
      },
    ]);
    alias = aliasName;
  }

  const trueStr = Crypto.AES.encrypt('true', CRYPTO_STRING);
  const falseStr = Crypto.AES.encrypt('falseStr', CRYPTO_STRING);

  transform(content, (result: Record<string, Record<string, string>>, value, key) => {
    if (value.__default === trueStr) {
      value.__default = falseStr;
    }
    set(result, key, value);
  })

  set(content, `${alias}.__default`, trueStr);
  await writeData(content);
}