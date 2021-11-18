import chalk from 'chalk';
import gzipSize from 'gzip-size';
import { promises as fs } from 'fs';
import path from 'path';
import { minify } from 'terser';
import webpack from 'webpack';
import type { Configuration as WebpackConfiguration } from 'webpack';

import { hrToSeconds } from './helpers';
import readConfig from './readConfig';
import { PreparedFixture } from './prepareFixture';

function createWebpackConfig(fixturePath: string, outputPath: string): WebpackConfiguration {
  return {
    name: 'client',
    target: 'web',
    mode: 'production',

    cache: {
      type: 'memory',
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },

    entry: fixturePath,
    output: {
      filename: path.basename(outputPath),
      path: path.dirname(outputPath),

      pathinfo: true,
    },
    performance: {
      hints: false,
    },
    optimization: {
      minimize: false,
    },
    stats: {
      optimizationBailout: true,
    },
  };
}

function webpackAsync(webpackConfig: WebpackConfiguration) {
  return new Promise<void>((resolve, reject) => {
    const compiler = webpack(webpackConfig);

    compiler.run((err, result) => {
      if (err) {
        reject(err);
      }
      if (result && result.hasErrors()) {
        reject(result.compilation.errors.join('\n'));
      }

      resolve();
    });
  });
}

// ---

export interface BuildResult {
  name: string;
  path: string;
  minifiedSize: number;
  gzippedSize: number;
}

/**
 * Builds a fixture with Webpack and then minifies it with Terser. Produces two files as artifacts:
 * - partially minified file (.output.js) for debugging
 * - fully minified file (.min.js)
 */
export default async function buildFixture(preparedFixture: PreparedFixture, quiet: boolean): Promise<BuildResult> {
  const webpackStartTime = process.hrtime();

  const config = await readConfig(quiet);

  const webpackOutputPath = preparedFixture.absolutePath.replace(/.fixture.js$/, '.output.js');
  const webpackConfig = createWebpackConfig(preparedFixture.absolutePath, webpackOutputPath);

  await webpackAsync(config.webpack(webpackConfig));

  if (!quiet) {
    console.log(
      [
        chalk.blue('[i]'),
        `"${path.basename(preparedFixture.relativePath)}": Webpack in ${hrToSeconds(process.hrtime(webpackStartTime))}`,
      ].join(' '),
    );
  }

  // ---

  const terserStartTime = process.hrtime();
  const terserOutputPath = preparedFixture.absolutePath.replace(/.fixture.js$/, '.min.js');

  const webpackOutput = await fs.readFile(webpackOutputPath, 'utf8');

  const [terserOutput, terserOutputMinified] = await Promise.all([
    // Performs only dead-code elimination
    /* eslint-disable @typescript-eslint/naming-convention */
    minify(webpackOutput, {
      mangle: false,
      output: {
        beautify: true,
        comments: true,
        preserve_annotations: true,
      },
    }),
    minify(webpackOutput, {
      output: {
        comments: false,
      },
    }),
    /* eslint-enable @typescript-eslint/naming-convention */
  ]);

  await fs.writeFile(webpackOutputPath, terserOutput.code);
  await fs.writeFile(terserOutputPath, terserOutputMinified.code);

  if (!quiet) {
    console.log(
      [
        chalk.blue('[i]'),
        `"${path.basename(preparedFixture.relativePath)}": Terser in ${hrToSeconds(process.hrtime(terserStartTime))}`,
      ].join(' '),
    );
  }

  const minifiedSize = (await fs.stat(terserOutputPath)).size;
  const gzippedSize = await gzipSize.file(terserOutputPath);

  return {
    name: preparedFixture.name,
    path: preparedFixture.relativePath,

    minifiedSize,
    gzippedSize,
  };
}
