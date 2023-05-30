import ignoreWalk from '../src';
import path from 'path';

const codePath = path.join(__dirname, 'fixtures', 'ignore-code');

test('ignore walk', async () => {
  const zipFiles = await ignoreWalk({
    ignoreFiles: ['.fcignore'],
    path: codePath,
    includeEmpty: true,
  });

  console.log('zipFiles: ', zipFiles, (zipFiles as any).includes('keep-empty-dir'))
  
  expect(zipFiles).toEqual(expect.arrayContaining([
    '.fcignore',
    'apt-get.list',
    'dir-2/.hide-dir/apt-get.list',
    'dir-2/no-ignore/file',
    'empty-dir',
    'ignore-non-root-dir/index',
    'index.js',
    // 'keep-empty-dir'
  ]));

  // await expect().rejects.toThrow('url is required');
});
