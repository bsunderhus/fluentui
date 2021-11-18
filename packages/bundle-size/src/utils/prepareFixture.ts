import Ajv from 'ajv';
import Babel from '@babel/core';
const fs = require('fs').promises;
import path from 'path';

import fixtureSchema from '../schema.json';
const ajv = new Ajv();

export interface FixtureMetadata {
  name: string;
}

export interface PreparedFixture {
  absolutePath: string;
  relativePath: string;
  name: string;
}
/**
 * Prepares a fixture file to be compiled with Webpack, grabs data from a default export and removes it.
 */
export default async function prepareFixture(fixture: string): Promise<PreparedFixture> {
  const sourceFixturePath = path.resolve(process.cwd(), fixture);
  const sourceFixtureCode = await fs.readFile(sourceFixturePath, 'utf8');

  const result = await Babel.transformAsync(sourceFixtureCode, {
    ast: false,
    code: true,

    // This instance of Babel should ignore all user's configs and apply only our plugin
    configFile: false, // https://babeljs.io/docs/en/options#configfile
    babelrc: false, // https://babeljs.io/docs/en/options#babelrc

    plugins: [
      // A Babel plugin that:
      // - reads metadata (name, threshold, etc.)
      // - removes a default export with metadata
      {
        visitor: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          ExportDefaultDeclaration(exportPath, state) {
            const evaluationResult = exportPath.get('declaration').evaluate();

            if (!evaluationResult.confident) {
              // TODO: proper error reporting
              throw new Error();
            }

            const valid = ajv.validate(fixtureSchema, evaluationResult.value);

            if (!valid) {
              throw new Error(`Validation failed for a schema in a component: ${ajv.errorsText(ajv.errors)}`);
            }

            state.file.metadata = evaluationResult.value;
            exportPath.remove();
          },
        },
      },
    ],
  });

  if (!isTransformedFixtureResultHasMetadata(result)) {
    throw new Error(
      [
        'A fixture file should contain a default export with metadata.',
        "For example: export default { name: 'Test fixture' }",
      ].join('\n'),
    );
  }

  const outputFixturePath = path.resolve(process.cwd(), 'dist', fixture);

  await fs.mkdir(path.dirname(outputFixturePath), { recursive: true });
  await fs.writeFile(outputFixturePath, result.code);

  return {
    absolutePath: outputFixturePath,
    relativePath: fixture,

    name: result.metadata.name,
  };
}

function isTransformedFixtureResultHasMetadata(
  value: Babel.BabelFileResult | null,
): value is Required<NonNullable<Babel.BabelFileResult | null>> & { metadata: FixtureMetadata } {
  return Boolean(value && value.metadata && Object.keys(value.metadata).length);
}
