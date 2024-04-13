import { Definition } from "ts-json-schema-generator";
import path from "node:path";

export type GenerateValidatorCodeOptions = {
    apiFilePath: string;
    apiFileCode: string;
    validatorFilePath: string;
    schema: Definition;
};
export type CodeGenerator = (options: GenerateValidatorCodeOptions) => string;
export const generator = ({ apiFilePath, apiFileCode, schema }: GenerateValidatorCodeOptions) => {
    const apiFileName = path.basename(apiFilePath, ".ts");
    const isExportedTypeInApiTypes = (apiName: string) => {
        return (
            apiFileCode.includes(`export type ${apiName} =`) || apiFileCode.includes(`export interface ${apiName} {`)
        );
    };
    const banner = `// @ts-nocheck
// eslint-disable
// This file is generated by create-validator-ts
import Ajv from 'ajv';
import type * as apiTypes from './${apiFileName}';
`;
    // define SCHEMA to top, and we can refer it as "SCHEMA".
    // Note: { "$ref": "SCHEMA#/definitions/${apiName}" }
    const schemaDefinition = `export const SCHEMA = ${JSON.stringify(schema, null, 4)};
const ajv = new Ajv({ removeAdditional: true, useDefaults: true }).addSchema(SCHEMA, "SCHEMA");`;
    const code = Object.entries(schema.definitions ?? {})
        .filter(([apiName]) => {
            return isExportedTypeInApiTypes(apiName);
        })
        .map(([apiName, _schema]) => {
            return `export function validate${apiName}(payload: unknown): apiTypes.${apiName} {
  /** Schema is defined in {@link SCHEMA.definitions.${apiName} } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/${apiName}");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid ${apiName}: ' + ajv.errorsText(validator.errors, {dataVar: "${apiName}"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function is${apiName}(payload: unknown): payload is apiTypes.${apiName} {
  try {
    validate${apiName}(payload);
    return true;
  } catch (error) {
    return false;
  }
}`;
        })
        .join("\n\n");
    return `${banner}
${schemaDefinition}
${code}
`;
};
