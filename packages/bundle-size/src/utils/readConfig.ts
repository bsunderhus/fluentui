import findUp from 'find-up';
import { promises } from 'fs';
import type { Configuration as WebpackConfig } from 'webpack';

export interface Configuration {
  webpack(config: WebpackConfig): WebpackConfig;
}

const defaultConfiguration: Configuration = {
  webpack: config => config,
};

const CONFIG_FILE_NAME = 'bundle-size.config.js' as const;

let configurationCache: Configuration | undefined;

export default async function readConfig(quiet = false): Promise<Configuration> {
  // don't use the cache in tests
  if (configurationCache && process.env.NODE_ENV !== 'test') {
    return configurationCache;
  }

  const configPath = await findUp(CONFIG_FILE_NAME, { cwd: process.cwd() });

  if (!configPath) {
    if (!quiet) {
      console.log(`no config file found: ${configPath}\n -> fallback to default config`);
    }
    configurationCache = defaultConfiguration;
    return configurationCache;
  }

  if (!quiet) {
    console.log(`using config: ${configPath}`);
  }

  configurationCache = JSON.parse(await promises.readFile(configPath, 'utf8')) as Configuration;
  return configurationCache;
}
