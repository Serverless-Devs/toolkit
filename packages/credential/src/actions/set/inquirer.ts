import inquirer from 'inquirer';
import { PROVIDER_LIST, PROVIDER_CREDENTIAL_KEYS, PROVIDER, PROVIDER_DOCS } from '../../constant';
import { get, set, isEmpty, merge, hasIn, isNil } from 'lodash';
import { ICredentials } from './type';
import { getAliasDefault, getYamlContent } from '../../utils';

async function addCustom(info: Record<string, string>) {
  const { type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Please select a type:',
      choices: [
        { name: 'Add key-value pairs', value: 'add' },
        { name: 'End of adding key-value pairs', value: 'over' },
      ],
    },
  ]);

  if (type === 'add') {
    const { key, value } = await inquirer.prompt([
      {
        type: 'input',
        message: 'Please enter key: ',
        name: 'key',
        validate: (input: string) => isEmpty(input) ? 'Cannot be empty' : true,
      },
      {
        type: 'input',
        message: 'Please enter value: ',
        name: 'value',
        validate: (input: string) => isEmpty(input) ? 'Cannot be empty' : true,
      },
    ]);

    set(info, key, value)
    await addCustom(info);
  }
}

/**
 * 密钥设置处理
 * @returns 
 */
export async function inputCredentials (): Promise<ICredentials> {
  const { provider } = await inquirer.prompt(PROVIDER_LIST);

  const docs = get(PROVIDER_DOCS, provider);
  if (docs) {
    console.log(`🧭 Refer to the document for ${provider} key: ${docs}`);
  }

  const credentials: ICredentials = { __provider: provider };
  if (provider === PROVIDER['custom']) {
    await addCustom(credentials as Record<string, string>);
  } else {
    const promptKeys = get(PROVIDER_CREDENTIAL_KEYS, provider, []);
    const promptList = promptKeys.map((key: string) => ({
      type: 'input',
      message: `${key}: `,
      name: key,
      validate: (input: string) => isEmpty(input) ? 'Cannot be empty' : true,
    }));
    const result = await inquirer.prompt(promptList);
    merge(credentials, result);
  }

  return credentials;
}

/**
 * 获取别名
 * @returns 
 */
export async function getAlias(options: { access?: string; force?: boolean }): Promise<string | boolean> {
  const { access, force } = options || {};
  let a;

  if (isNil(access)) {
    const { aliasName } = await inquirer.prompt([
      {
        type: 'input',
        message: 'Please create alias for key pair. If not, please enter to skip',
        name: 'aliasName',
        default: await getAliasDefault(),
      }
    ]);
    a = aliasName;
  }

  // 如果判断存在命名冲突
  const content = getYamlContent();
  if (hasIn(content, a) && force !== true) {
    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Alias already exists. Please select a type:',
        choices: [
          { name: 'overwrite', value: 'overwrite' },
          { name: 'rename', value: 'rename' },
          { name: 'exit', value: 'exit' },
        ],
      },
    ]);
    
    if (type === 'rename') {
      return await getAlias(options);
    } else if (type === 'exit') {
      return false;
    }
  }

  return a;
}
