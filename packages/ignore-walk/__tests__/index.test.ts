import ignoreWalk from '../src';
import path from 'path';
import { Minimatch, minimatch } from 'minimatch';

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

test.only('ignore walk', async () => {
  const zipFiles = await ignoreWalk({
    ignoreFiles: ['.fcignore'],
    path: path.join(__dirname, 'fixtures', 'ignore-2'),
    includeEmpty: true,
  });

  console.log('zipFiles: ', zipFiles, (zipFiles as any).includes('keep-empty-dir'))
});

test('xx', () => {
  const m = new Minimatch('keep-empty-dir/**', { matchBase: true, dot: true, flipNegate: true, nocase: true });
  console.log(m.match('keep-empty-dir/ignore-file'));
  console.log(m.match('keep-empty-dir/'));
  console.log(m.match('/keep-empty-dir'));
  console.log(m.match('keep-empty-dir'));
})
