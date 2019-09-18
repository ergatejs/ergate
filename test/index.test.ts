import path from 'path';
import coffee from 'coffee';

describe('index.test.ts', () => {
  const cwd = path.join(__dirname);
  const bin = path.join(__dirname, '../bin/cli.js');

  test('main', async () => {
    const proc: any = coffee
      .fork(bin, [], {
        cwd,
        env: process.env,
      })
      // .beforeScript('ts-node/register')
      .debug();

    await proc.end();
    expect(proc.stdout).toContain('cli.js analysis');
  });
});
