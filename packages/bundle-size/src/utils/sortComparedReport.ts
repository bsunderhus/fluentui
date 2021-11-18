import type { ComparedReportEntry, ComparedReport } from './compareResultsInReports';

function compareReports(a: ComparedReportEntry, b: ComparedReportEntry) {
  return a.packageName.localeCompare(b.packageName) || a.path.localeCompare(b.path);
}

/**
 * Sorts entries in a report by "packageName" & "path".
 */
export default function sortComparedReport(report: ComparedReport) {
  return report.slice().sort(compareReports);
}
