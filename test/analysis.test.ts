import path from 'path';
import coffee from 'coffee';

describe('analysis.test.ts', () => {
  const cwd = path.join(__dirname);
  const bin = path.join(__dirname, '../bin/cli.js');

  test('analysis', async () => {
    const proc: any = coffee
      .fork(bin, [ 'analysis', '--workspace=..' ], {
        cwd,
        env: process.env,
      })
      // .beforeScript('ts-node/register')
      .debug();

    await proc.end();
    expect(proc.stdout).toContain('[log]');
  });
});
