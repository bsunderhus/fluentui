import { blue } from 'chalk';
import { CLIArguments } from '..';

import cliReporter from '../reporters/cliReporter';
import markdownReporter from '../reporters/markdownReporter';
import collectLocalReport from '../utils/collectLocalReport';
import { compareResultsInReports } from '../utils/compareResultsInReports';
import getRemoteReport from '../utils/getRemoteReport';
import { hrToSeconds } from '../utils/helpers';

export type CompareReportsOptions = CLIArguments & { branch: string; output: 'cli' | 'markdown' };

async function compareReports(options: CompareReportsOptions) {
  const { branch, output, quiet } = options;
  const startTime = process.hrtime();

  const localReportStartTime = process.hrtime();
  const localReport = await collectLocalReport();

  if (!quiet) {
    console.log(
      [blue('[i]'), `Local report prepared in ${hrToSeconds(process.hrtime(localReportStartTime))}`].join(' '),
    );
  }

  const remoteReportStartTime = process.hrtime();
  const { commitSHA, remoteReport } = await getRemoteReport(branch);

  if (!quiet) {
    if (commitSHA === '') {
      console.log([blue('[i]'), `Remote report for "${branch}" branch was not found`].join(' '));
    } else {
      console.log(
        [
          blue('[i]'),
          `Remote report for "${commitSHA}" commit fetched in ${hrToSeconds(process.hrtime(remoteReportStartTime))}`,
        ].join(' '),
      );
    }
  }

  const result = compareResultsInReports(localReport, remoteReport);

  switch (output) {
    case 'cli':
      await cliReporter(result);
      break;
    case 'markdown':
      await markdownReporter(result, commitSHA, quiet);
      break;
  }

  if (!quiet) {
    console.log(`Completed in ${hrToSeconds(process.hrtime(startTime))}`);
  }
}

// ---

/** @type {import('yargs').CommandModule} */
const api = {
  command: 'compare-reports',
  describe: 'compares local and remote results',
  builder: {
    branch: {
      alias: 'b',
      type: 'string',
      description: 'A branch to compare against',
      default: 'main',
    },
    output: {
      alias: 'o',
      type: 'string',
      choices: ['cli', 'markdown'],
      description: 'Defines a reporter to produce output',
      default: 'cli',
    },
  },
  handler: compareReports,
};

export default api;
