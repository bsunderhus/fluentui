import calculateDiffByMetric from './calculateDiffByMetric';
import type { DiffByMetric } from './calculateDiffByMetric';
import type { BundleSizeReportEntry, BundleSizeReport } from './collectLocalReport';

export interface DiffForEntry {
  empty: boolean;
  minified: DiffByMetric;
  gzip: DiffByMetric;
}

export interface ComparedReportEntry extends BundleSizeReportEntry {
  diff: DiffForEntry;
}

export type ComparedReport = ComparedReportEntry[];

export const emptyDiff: DiffForEntry = Object.freeze({
  empty: true,

  minified: { delta: 1, percent: '100%' },
  gzip: { delta: 1, percent: '100%' },
});

export function compareResultsInReports(localReport: BundleSizeReport, remoteReport: BundleSizeReport): ComparedReport {
  return localReport.map(localEntry => {
    const remoteEntry = remoteReport.find(
      entry => localEntry.packageName === entry.packageName && localEntry.path === entry.path,
    );
    const diff = remoteEntry
      ? {
          empty: false,
          minified: calculateDiffByMetric(localEntry, remoteEntry, 'minifiedSize'),
          gzip: calculateDiffByMetric(localEntry, remoteEntry, 'gzippedSize'),
        }
      : emptyDiff;

    return {
      ...localEntry,
      diff,
    };
  });
}
