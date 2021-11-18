import { red, green, bold, cyan } from 'chalk';
import Table from 'cli-table3';
import { DiffByMetric } from '../utils/calculateDiffByMetric';
import { ComparedReport } from '../utils/compareResultsInReports';

import getChangedEntriesInReport from '../utils/getChangedEntriesInReport';
import { formatBytes } from '../utils/helpers';

function getDirectionSymbol(value: number): string {
  if (value < 0) {
    return '↓';
  }

  if (value > 0) {
    return '↑';
  }

  return '';
}

function formatDelta({ delta, percent }: DiffByMetric) {
  if (delta === 0) {
    return '';
  }

  const colorFn = delta > 0 ? red : green;

  return colorFn(percent + getDirectionSymbol(delta));
}

export default async function cliReporter(report: ComparedReport) {
  const result = new Table({
    colAligns: ['left', 'right', 'right'],
    head: ['Fixture', 'Before', 'After (minified/GZIP)'],
  });
  const { changedEntries } = getChangedEntriesInReport(report);

  changedEntries.forEach(entry => {
    const { diff, gzippedSize, minifiedSize, name, packageName } = entry;
    const fixtureColumn = bold(packageName) + '\n' + name + (diff.empty ? cyan(' (new)') : '');

    const minifiedBefore = diff.empty ? 'N/A' : formatBytes(minifiedSize - diff.minified.delta);
    const gzippedBefore = diff.empty ? 'N/A' : formatBytes(gzippedSize - diff.gzip.delta);

    const minifiedAfter = formatBytes(minifiedSize);
    const gzippedAfter = formatBytes(gzippedSize);

    const beforeColumn = minifiedBefore + '\n' + gzippedBefore;
    const afterColumn =
      formatDelta(diff.minified) + ' ' + minifiedAfter + '\n' + formatDelta(diff.gzip) + ' ' + gzippedAfter;

    result.push([fixtureColumn, beforeColumn, afterColumn]);
  });

  if (result.length > 0) {
    console.log(result.toString());
    return;
  }

  console.log(`${green('[✔]')} No changes found`);
}
