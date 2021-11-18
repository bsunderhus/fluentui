import { promises as fs } from 'fs';
import { relative } from 'path';
import process, { env } from 'process';
import { dirSync, fileSync } from 'tmp';

import readConfig from './readConfig';

/**
 * @param pwdNesting How many folders to nest the pwd
 * @return Returns a relative path to a config file
 */
async function setup(configContent: string, pwdNesting = 0) {
  let packageDir = dirSync({ prefix: 'test-package', unsafeCleanup: true });
  const config = fileSync({ dir: packageDir.name, name: 'bundle-size.config.js' });

  for (let i = 0; i < pwdNesting; i++) {
    packageDir = dirSync({ dir: packageDir.name, prefix: 'nested', unsafeCleanup: true });
  }
  const spy = jest.spyOn(process, 'cwd');
  spy.mockReturnValue(packageDir.name);

  await fs.writeFile(config.name, configContent);

  return relative(packageDir.name, config.name);
}

describe('prepareFixture', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should read config from package', async () => {
    await setup(`module.exports = { webpack: (config) => { config.foo = 'bar'; return config; } }`);

    const config = await readConfig();

    expect(config.webpack({})).toEqual({ foo: 'bar' });
  });

  it('should return default webpack config if no config file defined', async () => {
    const config = await readConfig();

    expect(config.webpack({})).toEqual({});
  });

  it('should cache config', async () => {
    env.NODE_ENV = 'nottest';

    await setup(`module.exports = { webpack: (config) => config }`);
    const firstConfig = await readConfig();
    await setup(`module.exports = { webpack: (config) => { config.foo = 'bar'; return config; } }`);
    const config = await readConfig();

    expect(firstConfig).toBe(config);
    expect(config.webpack({})).toEqual({});

    env.NODE_ENV = 'test';
  });

  it.each([1, 2, 3])('should cache config for %i layers of nesting', async nesting => {
    await setup(`module.exports = { webpack: (config) => { config.foo = 'bar'; return config; } }`, nesting);
    const config = await readConfig();

    expect(config.webpack({})).toEqual({ foo: 'bar' });
  });
});
