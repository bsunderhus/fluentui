import { promises as fs } from 'fs';
import { relative } from 'path';
import process from 'process';
import { dirSync, fileSync } from 'tmp';

import buildFixture from './buildFixture';
import { PreparedFixture } from './prepareFixture';

async function setup(fixtureContent: string): Promise<PreparedFixture> {
  const packageDir = dirSync({ prefix: 'buildFixture', unsafeCleanup: true });

  const spy = jest.spyOn(process, 'cwd');
  spy.mockReturnValue(packageDir.name);

  const fixtureDir = dirSync({ dir: packageDir.name, name: 'bundle-size', unsafeCleanup: true });
  const fixture = fileSync({ dir: fixtureDir.name, name: 'test-fixture.js' });

  await fs.writeFile(fixture.name, fixtureContent);

  return {
    absolutePath: fixture.name,
    relativePath: relative(packageDir.name, fixture.name),

    name: 'Test fixture',
  };
}

describe('buildFixture', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('builds fixtures and returns minified & GZIP sizes', async () => {
    const fixturePath = await setup(`console.log('Hello world')`);
    const buildResult = await buildFixture(fixturePath, true);

    expect(buildResult.name).toBe('Test fixture');
    expect(buildResult.path).toMatch(/bundle-size[\\|/]test-fixture.js/);

    expect(buildResult.minifiedSize).toBeGreaterThan(1);
    expect(buildResult.gzippedSize).toBeGreaterThan(1);
  });

  it('should throw on compilation errors', async () => {
    const fixturePath = await setup(`import something from 'unknown-pkg'`);
    expect(buildFixture(fixturePath, true)).rejects.toThrow();
  });
});
