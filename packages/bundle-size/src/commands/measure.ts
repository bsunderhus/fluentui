import chalk from 'chalk';
import Table from 'cli-table3';
import { promises as fs } from 'fs';
import del from 'del';
import glob from 'glob';
import path from 'path';
import { CommandModule } from 'yargs';
import { CLIArguments } from '..';

import buildFixture from '../utils/buildFixture';
import { formatBytes, hrToSeconds } from '../utils/helpers';
import prepareFixture from '../utils/prepareFixture';

async function measure(options: CLIArguments) {
  const { quiet } = options;

  const startTime = process.hrtime();
  const artifactsDir = path.resolve(process.cwd(), 'dist', 'bundle-size');

  await del(artifactsDir);

  if (!quiet) {
    console.log(`${chalk.blue('[i]')} artifacts dir is cleared`);
  }

  const fixtures = glob.sync('bundle-size/*.fixture.js', {
    cwd: process.cwd(),
  });

  if (!quiet) {
    console.log(`${chalk.blue('[i]')} Measuring bundle size for ${fixtures.length} fixture(s)...`);
    console.log(fixtures.map(fixture => `  - ${fixture}`).join('\n'));
  }

  const preparedFixtures = await Promise.all(fixtures.map(prepareFixture));
  const measurements = await Promise.all(preparedFixtures.map(preparedFixture => buildFixture(preparedFixture, quiet)));

  await fs.writeFile(
    path.resolve(process.cwd(), 'dist', 'bundle-size', 'bundle-size.json'),
    JSON.stringify(measurements),
  );

  if (!quiet) {
    const table = new Table({
      head: ['Fixture', 'Minified size', 'GZIP size'],
    });
    const sortedMeasurements = [...measurements].sort((a, b) => a.path.localeCompare(b.path));

    sortedMeasurements.forEach(r => {
      table.push([r.name, formatBytes(r.minifiedSize), formatBytes(r.gzippedSize)]);
    });

    console.log(table.toString());
    console.log(`Completed in ${hrToSeconds(process.hrtime(startTime))}`);
  }
}

// ---

const api: CommandModule<CLIArguments, CLIArguments> = {
  command: 'measure',
  describe: 'builds bundle size fixtures and generates JSON report',
  handler: measure,
};

export default api;
