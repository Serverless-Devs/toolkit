import SecretManager from '../src/index';

// test cases
describe('SecretManager', () => {
  it('should add secret', async () => {
    const manager = await SecretManager.getInstance();
    manager.addSecret('test', 'test');
    expect(manager.getSecret('test')).toBe('test');
  });
  it('should get all secrets', async () => {
    const manager = await SecretManager.getInstance();
    manager.addSecret('test', 'test');
    expect(JSON.stringify(manager.getAllSecrets())).toMatch(/{"test":.*/g);
  });
  it('should get secret', async () => {
    const manager = await SecretManager.getInstance();
    manager.addSecret('test', 'test');
    expect(manager.getSecret('test')).toBe('test');
  });
  it('should delete secret', async () => {
    const manager = await SecretManager.getInstance();
    manager.addSecret('test', 'test');
    manager.deleteSecret('test');
    expect(manager.getSecret('test')).toBeUndefined();
  });
});
