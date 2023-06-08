import ComponentManager from '../src';
import path from "path";

// 模拟 yaml
const yamlConfig: any = {
  'a': {
    component: 'fc',
    props: { },
  },
  'b': {
    component: 'nas',
    props: { },
  },
  'c': {
    component: 'fc',
    props: { },
  },
};

// 模拟 engine 组件加载
const getRunConfigs = async () => await Promise.all(
  Object.keys(yamlConfig).map(async (key: string) => {
    const inputs: any = yamlConfig[key];
  
    // 下载组件以及其他的一些处理
    // await load(app);
    // ...
  
    // 组件地址
    const componentPath = path.join(__dirname, 'fixtures', inputs.component)
    const Component = require(componentPath).default;
    return {
      Component,
      commands: Component.commands,
      props: inputs.props,
    };
  }
));

test('解析 commands', async () => {
  const runConfigs = await getRunConfigs();
  const args = ['deploy', 'service', '--use-local', '--type', 'test', '--help']; // cli 的参数

  const res = await Promise.all(
    runConfigs.map(async (runConfig: any) => {
      const { props, commands } = runConfig;
      try {
        const componentManager = new ComponentManager({
          commands,
          props,
          args,
        });
        return await componentManager.parseCommands();
      } catch (ex) {
        console.error('Error parsing: ', ex);
      }
    })
  );

  console.log(JSON.stringify(res, null, 2));
  // expect(zipFiles).not.toEqual(expect.arrayContaining([]));
});
