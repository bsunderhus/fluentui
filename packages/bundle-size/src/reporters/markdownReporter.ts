import { blue } from 'chalk';
import { promises as fs } from 'fs';
import { resolve, join } from 'path';
import { format } from 'prettier';
import { findPackageRoot } from 'workspace-tools';
import { DiffByMetric } from '../utils/calculateDiffByMetric';
import { ComparedReport } from '../utils/compareResultsInReports';

import getChangedEntriesInReport from '../utils/getChangedEntriesInReport';
import { formatBytes } from '../utils/helpers';

const icons = {
  increase: 'IncreaseYellow.svg',
  decrease: 'Decrease.svg',
};

function getDirectionSymbol(value: number) {
  const img = (iconName: string) =>
    `<img aria-hidden="true" src="https://microsoft.github.io/sizeAuditor-website/images/icons/${iconName}" />`;

  if (value < 0) {
    return img(icons.decrease);
  }

  if (value > 0) {
    return img(icons.increase);
  }

  return '';
}

function formatDelta({ delta }: DiffByMetric) {
  if (delta === 0) {
    return '';
  }

  return `\`${formatBytes(delta)}\` ${getDirectionSymbol(delta)}`;
}

export default async function markdownReporter(result: ComparedReport, commitSHA: string, quiet: boolean) {
  const packageRoot = findPackageRoot(__dirname);

  if (!packageRoot) {
    throw new Error(
      [
        'Failed to find a package root (directory that contains "package.json" file)',
        `Lookup start in: ${__dirname}`,
      ].join('\n'),
    );
  }

  const artifactsDir = resolve(packageRoot, 'dist');
  const artifactsFilename = join(artifactsDir, 'bundle-size.md');

  const report = [];

  report.push('## 📊 Bundle size report');
  report.push('');

  const { changedEntries, unchangedEntries } = getChangedEntriesInReport(result);

  if (changedEntries.length > 0) {
    report.push('| Package & Exports | Baseline (minified/GZIP) | PR    | Change     |');
    report.push('| :---------------- | -----------------------: | ----: | ---------: |');

    changedEntries.forEach(entry => {
      const title = `<samp>${entry.packageName}</samp> <br /> <abbr title='${entry.path}'>${entry.name}</abbr>`;
      const before = entry.diff.empty
        ? [`\`${formatBytes(0)}\``, '<br />', `\`${formatBytes(0)}\``].join('')
        : [
            `\`${formatBytes(entry.minifiedSize - entry.diff.minified.delta)}\``,
            '<br />',
            `\`${formatBytes(entry.gzippedSize - entry.diff.gzip.delta)}\``,
          ].join('');
      const after = [`\`${formatBytes(entry.minifiedSize)}\``, '<br />', `\`${formatBytes(entry.gzippedSize)}\``].join(
        '',
      );
      const difference = entry.diff.empty
        ? '🆕 New entry'
        : [`${formatDelta(entry.diff.minified)}`, '<br />', `${formatDelta(entry.diff.gzip)}`].join('');

      report.push(`| ${title} | ${before} | ${after} | ${difference}|`);
    });

    report.push('');
  }

  if (unchangedEntries.length > 0) {
    report.push('<details>');
    report.push('<summary>Unchanged fixtures</summary>');
    report.push('');

    report.push('| Package & Exports | Size (minified/GZIP) |');
    report.push('| ----------------- | -------------------: |');

    unchangedEntries.forEach(entry => {
      const title = `<samp>${entry.packageName}</samp> <br /> <abbr title='${entry.path}'>${entry.name}</abbr>`;
      const size = [`\`${formatBytes(entry.minifiedSize)}\``, '<br />', `\`${formatBytes(entry.gzippedSize)}\``].join(
        '',
      );

      report.push(`| ${title} | ${size} |`);
    });

    report.push('</details>');
  }

  report.push(
    `<sub>🤖 This report was generated against <a href='https://github.com/microsoft/fluentui/commit/${commitSHA}'>${commitSHA}</a></sub>`,
  );

  await fs.mkdir(artifactsDir, { recursive: true });
  await fs.writeFile(artifactsFilename, format(report.join('\n'), { parser: 'markdown' }));

  if (!quiet) {
    console.log([blue('[i]'), `A report file was written to ${artifactsFilename}`].join(' '));
  }
}
