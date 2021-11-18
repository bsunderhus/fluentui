import { promises as fs } from 'fs';
import { sync } from 'glob';
import { resolve, basename } from 'path';
import { findGitRoot, findPackageRoot } from 'workspace-tools';
import { BuildResult } from './buildFixture';

export interface BundleSizeReportEntry extends BuildResult {
  packageName: string;
}

export type BundleSizeReport = BundleSizeReportEntry[];

async function readReportForPackage(reportFile: string) {
  const reportFilePath = resolve(process.cwd(), reportFile);
  const packageRoot = findPackageRoot(reportFilePath);

  if (!packageRoot) {
    throw new Error(
      [
        'Failed to find a package root (directory that contains "package.json" file)',
        `Report file location: ${reportFile}`,
      ].join('\n'),
    );
  }

  const packageName = basename(packageRoot);
  const packageReportJSON = await fs.readFile(reportFilePath, 'utf8');

  try {
    const packageReport: BuildResult[] = JSON.parse(packageReportJSON);

    return { packageName, packageReport };
  } catch (e) {
    throw new Error([`Failed to read JSON from "${reportFilePath}":`, e.toString()].join('\n'));
  }
}

/**
 * Collects all reports for packages to a single one.
 */
export default async function collectLocalReport(): Promise<BundleSizeReport> {
  const reportFiles: string[] = sync('packages/*/dist/bundle-size/bundle-size.json', {
    // FIXME: assert findGitRoot invocation
    cwd: findGitRoot(process.cwd()) as string,
  });

  const reports = await Promise.all(reportFiles.map(readReportForPackage));

  return reports.reduce((acc, { packageName, packageReport }) => {
    const processedReport = packageReport.map(reportEntry => ({ packageName, ...reportEntry }));

    return [...acc, ...processedReport];
  }, [] as BundleSizeReport);
}
