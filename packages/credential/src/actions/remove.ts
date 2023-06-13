import inquirer from "inquirer";
import { getYamlContent, parseArgv, writeData } from "../utils";
import { hasIn, unset } from "lodash";

export default async () => {
  const { access, help } = parseArgv();

  if (help) { return }

  const content = await getYamlContent();

  if (access) {
    if (!hasIn(content, access)) {
      console.error(`Not found alias name: ${access}`);
      return;
    }
    unset(content, access);
  } else {
    const aliasNames = Object.keys(content);
    
    const { aliasName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'aliasName',
        message: 'Alias already exists. Please select a type:',
        choices: aliasNames.map((alias: string) => ({
          name: alias, value: alias
        })),
      },
    ]);
    unset(content, aliasName);
  }

  await writeData(content);
}