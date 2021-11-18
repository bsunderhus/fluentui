import type { ComparedReport } from './compareResultsInReports';
import sortComparedReport from './sortComparedReport';

export default function getChangedEntriesInReport(report: ComparedReport) {
  const { changedEntries, unchangedEntries } = report.reduce(
    (acc, reportEntry) => {
      if (reportEntry.diff.gzip.delta === 0 && reportEntry.diff.minified.delta === 0) {
        acc.unchangedEntries.push(reportEntry);
        return acc;
      }

      acc.changedEntries.push(reportEntry);
      return acc;
    },
    { changedEntries: [] as ComparedReport, unchangedEntries: [] as ComparedReport },
  );

  return {
    changedEntries: sortComparedReport(changedEntries),
    unchangedEntries: sortComparedReport(unchangedEntries),
  };
}
