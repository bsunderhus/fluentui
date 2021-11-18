import { commandDir } from 'yargs';

export interface CLIArguments {
  quiet: boolean;
}

const cliSetup: CLIArguments = commandDir('commands', { exclude: /.test\.js$/ })
  .option('quiet', {
    alias: 'q',
    type: 'boolean',
    description: 'Suppress verbose build output',
    default: false,
  })
  .scriptName('bundle-size')
  .version(false).argv;

export default cliSetup;
