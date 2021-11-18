import { odata, TableClient, TablesSharedKeyCredential, TableTransaction } from '@azure/data-tables';
import { red, blue } from 'chalk';
import { isCI } from 'ci-info';
import type { CLIArguments } from '../index';

import collectLocalReport, { BundleSizeReportEntry } from '../utils/collectLocalReport';
import { hrToSeconds } from '../utils/helpers';

const AZURE_STORAGE_ACCOUNT = 'fluentbundlesize';
const AZURE_STORAGE_TABLE_NAME = 'latest';
const AZURE_ACCOUNT_KEY = process.env.BUNDLESIZE_ACCOUNT_KEY;

function createRowKey(entry: BundleSizeReportEntry) {
  // Azure does not support slashes in "rowKey"
  // https://docs.microsoft.com/archive/blogs/jmstall/azure-storage-naming-rules
  return `${entry.packageName}${entry.path.replace(/\.fixture\.js$/, '').replace(/\//g, '')}`;
}

export type UploadReportOptions = CLIArguments & { branch: string; 'commit-sha': string };

async function uploadReport(options: UploadReportOptions) {
  if (!isCI) {
    console.log(`${red('[e]')} This is command can be executed only in CI`);
    process.exit(1);
  }

  const { branch, 'commit-sha': commitSHA, quiet } = options;
  const startTime = process.hrtime();

  const localReportStartTime = process.hrtime();
  const localReport = await collectLocalReport();

  if (!quiet) {
    console.log(
      [blue('[i]'), `Local report prepared in ${hrToSeconds(process.hrtime(localReportStartTime))}`].join(' '),
    );
  }

  if (typeof AZURE_ACCOUNT_KEY === 'undefined') {
    console.log(
      [red('[e]'), 'process.env.BUNDLESIZE_ACCOUNT_KEY is not defined, please verify Azure Pipelines settings'].join(
        ' ',
      ),
    );
    process.exit(1);
  }

  const credentials = new TablesSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_ACCOUNT_KEY);
  const client = new TableClient(
    `https://${AZURE_STORAGE_ACCOUNT}.table.core.windows.net`,
    AZURE_STORAGE_TABLE_NAME,
    credentials,
  );

  const transaction = new TableTransaction();
  const transactionStartTime = process.hrtime();

  const entitiesIterator = await client.listEntities({
    queryOptions: {
      filter: odata`PartitionKey eq ${branch}`,
    },
  });

  for await (const entity of entitiesIterator) {
    // We can't delete and create entries with the same "rowKey" in the same transaction
    // => we delete only entries not present in existing report
    const isEntryPresentInExistingReport = Boolean(localReport.find(entry => createRowKey(entry) === entity.rowKey));
    const shouldEntryBeDeleted = isEntryPresentInExistingReport === false;

    if (shouldEntryBeDeleted) {
      transaction.deleteEntity(entity.partitionKey as string, entity.rowKey as string);
    }
  }

  localReport.forEach(entry => {
    transaction.upsertEntity(
      {
        partitionKey: branch,
        rowKey: createRowKey(entry),

        name: entry.name,
        packageName: entry.packageName,
        path: entry.path,

        minifiedSize: entry.minifiedSize,
        gzippedSize: entry.gzippedSize,

        commitSHA,
      },
      'Replace',
    );
  });

  if (!quiet) {
    console.log(
      [blue('[i]'), `A transaction prepared in ${hrToSeconds(process.hrtime(transactionStartTime))}`].join(' '),
    );
  }

  const submissionStartTime = process.hrtime();
  await client.submitTransaction(transaction.actions);

  if (!quiet) {
    console.log(
      [blue('[i]'), `A transaction submitted in ${hrToSeconds(process.hrtime(submissionStartTime))}`].join(' '),
    );
    console.log(`Completed in ${hrToSeconds(process.hrtime(startTime))}`);
  }
}

// ---

/** @type {import('yargs').CommandModule} */
const api = {
  command: 'upload-report',
  describe: 'uploads local results to Azure Table Storage',
  builder: {
    branch: {
      type: 'string',
      description: 'A branch to associate a report',
      required: true,
    },
    'commit-sha': {
      type: 'string',
      description: 'Defines a commit sha for a report',
      required: true,
    },
  },
  handler: uploadReport,
};

export default api;
