import inquirer from "inquirer";
import { getYamlContent, parseArgv, writeData } from "../utils";
import { hasIn, transform, set } from "lodash";
import { CRYPTO_STRING } from "../constant";

const Crypto = require('crypto-js');

export default async () => {
  const { access, help } = parseArgv();

  if (help) { return }

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
    const { aliasName } = await inquirer.prompt([
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