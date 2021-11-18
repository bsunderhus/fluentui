import chalk from 'chalk';
import fetch from 'node-fetch';
import { BundleSizeReport, BundleSizeReportEntry } from './collectLocalReport';

const MAX_HTTP_ATTEMPT_COUNT = 5 as const;
const REPORT_API_ENDPOINT = `https://fluentbundlesize.azurewebsites.net/api/latest` as const;

/**
 * Grabs data for a branch from Azure Table Storage.
 */
export default async function getRemoteReport(
  branch: string,
  attempt = 1,
): Promise<{ commitSHA: string; remoteReport: BundleSizeReport }> {
  try {
    const response = await fetch(`${REPORT_API_ENDPOINT}?branch=${branch}`);
    const result: (BundleSizeReportEntry & {
      commitSHA: string;
    })[] = await response.json();

    const remoteReport: BundleSizeReport = result.map(entity => {
      const { commitSHA: _, ...rest } = entity;
      return rest;
    });
    const { commitSHA } = result[result.length - 1];

    return { commitSHA, remoteReport };
  } catch (e) {
    console.log([chalk.yellow('[w]'), e.toString()].join(' '));
    console.log([chalk.yellow('[w]'), 'Failed to fetch report from the remote. Retrying...'].join(' '));

    if (attempt >= MAX_HTTP_ATTEMPT_COUNT) {
      console.error(
        [chalk.red('[e]'), 'Exceeded 5 attempts to fetch reports, please check previously reported warnings...'].join(
          ' ',
        ),
      );
      process.exit(1);
    }

    return getRemoteReport(branch, attempt + 1);
  }
}
