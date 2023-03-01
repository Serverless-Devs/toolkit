import loadApplication from '../src';
import path from 'path';

test('loadApplication template is empty', async () => {
  await expect(loadApplication({ template: '' })).rejects.toThrow('template is required');
});

test('loadApplication template is not devsapp', async () => {
  await expect(loadApplication({ template: 'xsahxl/start-fc-http-nodejs14' })).rejects.toThrow(
    'xsahxl is not supported, only support devsapp',
  );
});

describe('loadApplication template is devsapp without version', () => {
  const dest = path.join(__dirname, '_temp');
  test('baisc', async () => {
    const appPath = await loadApplication({
      template: 'start-fc-http-nodejs14',
      dest,
    });
    expect(appPath).toBe(path.join(dest, 'start-fc-http-nodejs14'));
  });
  test('baisc with provider', async () => {
    const appPath = await loadApplication({
      template: 'devsapp/start-fc-http-nodejs14',
      dest,
    });
    expect(appPath).toBe(path.join(dest, 'start-fc-http-nodejs14'));
  });
  test('loadApplication template with projectName', async () => {
    const appPath = await loadApplication(
      {
        template: 'start-fc-http-nodejs14',
        dest,
      },
      {
        projectName: 'custom-project-name',
      },
    );
    expect(appPath).toBe(path.join(dest, 'custom-project-name'));
  });
  test('loadApplication template with appName', async () => {
    const appPath = await loadApplication(
      {
        template: 'start-fc-http-nodejs14',
        dest,
      },
      {
        projectName: 'custom-app-name',
        appName: 'custom-app-name',
      },
    );
    expect(appPath).toBe(path.join(dest, 'custom-app-name'));
  });
  test('loadApplication template with parameters', async () => {
    const appPath = await loadApplication(
      {
        template: 'start-fc-http-nodejs14',
        dest,
      },
      {
        projectName: 'custom-parameters',
        parameters: { region: 'cn-chengdu' },
      },
    );
    expect(appPath).toBe(path.join(dest, 'custom-parameters'));
  });
  test('loadApplication template with access', async () => {
    const appPath = await loadApplication(
      {
        template: 'start-fc-http-nodejs14',
        dest,
      },
      {
        projectName: 'custom-access',
        access: 'custom-access',
      },
    );
    expect(appPath).toBe(path.join(dest, 'custom-access'));
  });
});

describe('loadApplication template is devsapp with version', () => {
  const dest = path.join(__dirname, '_temp', 'version');
  test('baisc', async () => {
    const appPath = await loadApplication({
      template: 'start-fc-http-nodejs14@1.1.14',
      dest,
    });
    expect(appPath).toBe(path.join(dest, 'start-fc-http-nodejs14'));
  });
  test('baisc with provider', async () => {
    const appPath = await loadApplication({
      template: 'devsapp/start-fc-http-nodejs14@1.1.14',
      dest,
    });
    expect(appPath).toBe(path.join(dest, 'start-fc-http-nodejs14'));
  });
  test('loadApplication template with projectName', async () => {
    const appPath = await loadApplication(
      {
        template: 'start-fc-http-nodejs14@1.1.14',
        dest,
      },
      {
        projectName: 'custom-project-name',
      },
    );
    expect(appPath).toBe(path.join(dest, 'custom-project-name'));
  });
  test('loadApplication template with appName', async () => {
    const appPath = await loadApplication(
      {
        template: 'start-fc-http-nodejs14@1.1.14',
        dest,
      },
      {
        projectName: 'custom-app-name',
        appName: 'custom-app-name',
      },
    );
    expect(appPath).toBe(path.join(dest, 'custom-app-name'));
  });
  test('loadApplication template with parameters', async () => {
    const appPath = await loadApplication(
      {
        template: 'start-fc-http-nodejs14@1.1.14',
        dest,
      },
      {
        projectName: 'custom-parameters',
        parameters: { region: 'cn-chengdu' },
      },
    );
    expect(appPath).toBe(path.join(dest, 'custom-parameters'));
  });
  test('loadApplication template with access', async () => {
    const appPath = await loadApplication(
      {
        template: 'start-fc-http-nodejs14@1.1.14',
        dest,
      },
      {
        projectName: 'custom-access',
        access: 'custom-access',
      },
    );
    expect(appPath).toBe(path.join(dest, 'custom-access'));
  });
});
