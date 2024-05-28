// @ts-nocheck
// eslint-disable
// This file is generated by create-validator-ts
import Ajv from 'ajv';
import type * as apiTypes from './use-default-types';

export const SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "GetAPIRequestQuery": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "num": {
                    "type": "number",
                    "default": 1
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        },
        "GetAPIResponseBody": {
            "type": "object",
            "properties": {
                "ok": {
                    "type": "boolean"
                }
            },
            "required": [
                "ok"
            ],
            "additionalProperties": false
        }
    }
};
const ajv = new Ajv({ removeAdditional: true, useDefaults: true }).addSchema(SCHEMA, "SCHEMA");
export function validateGetAPIRequestQuery(payload: unknown): apiTypes.GetAPIRequestQuery {
  /** Schema is defined in {@link SCHEMA.definitions.GetAPIRequestQuery } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/GetAPIRequestQuery");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid GetAPIRequestQuery: ' + ajv.errorsText(validator.errors, {dataVar: "GetAPIRequestQuery"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isGetAPIRequestQuery(payload: unknown): payload is apiTypes.GetAPIRequestQuery {
  try {
    validateGetAPIRequestQuery(payload);
    return true;
  } catch (error) {
    return false;
  }
}

export function validateGetAPIResponseBody(payload: unknown): apiTypes.GetAPIResponseBody {
  /** Schema is defined in {@link SCHEMA.definitions.GetAPIResponseBody } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/GetAPIResponseBody");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid GetAPIResponseBody: ' + ajv.errorsText(validator.errors, {dataVar: "GetAPIResponseBody"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isGetAPIResponseBody(payload: unknown): payload is apiTypes.GetAPIResponseBody {
  try {
    validateGetAPIResponseBody(payload);
    return true;
  } catch (error) {
    return false;
  }
}