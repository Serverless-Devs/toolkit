import inquirer from "inquirer";
import { getYamlContent, parseArgv, validateInput, writeData } from "../utils";
import { hasIn, unset, set, trim } from "lodash";


export default async () => {
  const { source, target, help } = parseArgv({
    alias: {
      source: 's',
      target: 't',
    },
    string: ['source', 'target'],
  });

  if (help) { return }

  const content = await getYamlContent();

  let sourceName = source;
  if (source) {
    if (!hasIn(content, source)) {
      console.error(`Not found source alias name: ${source}`);
      return;
    }
  } else {
    const aliasNames = Object.keys(content);
    
    const { aliasName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'aliasName',
        message: 'Please select need rename alias name:',
        choices: aliasNames.map((alias: string) => ({
          name: alias, value: alias
        })),
      },
    ]);
    sourceName = aliasName;
  }

  let targetName = target;
  if (!target) {
    const { aliasName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'aliasName',
        message: 'Please select need rename alias name:',
        validate: validateInput,
      },
    ]);
    targetName = trim(aliasName);
  }

  set(content, targetName, content[sourceName]);
  unset(content, sourceName);

  await writeData(content);
}
