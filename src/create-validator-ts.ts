import * as path from "path";
import * as _fs from "fs";
import { Config, createGenerator } from "ts-json-schema-generator";
import { CodeGenerator } from "./default-code-generator";

const fs = _fs.promises;

export type TsJsonSchemaGeneratorOptions = {
    // ts-json-schema-generator Options
    // https://github.com/vega/ts-json-schema-generator/blob/80bba1cb2b893edc81fce08accddae76390d5156/src/Config.ts#L1-L15
    extraTags?: string[];
    sortProps?: boolean;
    strictTuples?: boolean;
    encodeRefs?: boolean;
    /**
     * true by default
     */
    skipTypeCheck?: boolean;
    /**
     * false by default
     */
    additionalProperties?: boolean;
};
export type GeneratorValidatorOptions = {
    cwd: string;
    validatorGenerator: CodeGenerator;
    tsconfigFilePath: string;
    filePath: string;
} & TsJsonSchemaGeneratorOptions;

export async function generateValidator({
    cwd,
    validatorGenerator,
    tsconfigFilePath,
    filePath,
    extraTags = [],
    sortProps,
    strictTuples,
    skipTypeCheck = true,
    encodeRefs,
    additionalProperties = false
}: GeneratorValidatorOptions) {
    const absoluteFilePath = path.resolve(cwd, filePath);
    const parentFileDir = path.dirname(path.resolve(cwd, filePath));
    const fileName = path.basename(absoluteFilePath, ".ts");
    const apiTypesCode = await fs.readFile(filePath, "utf-8");
    try {
        const config: Config = {
            path: absoluteFilePath,
            tsconfig: tsconfigFilePath,
            type: "*",
            skipTypeCheck: skipTypeCheck ?? true,
            additionalProperties: additionalProperties ?? false,
            sortProps: sortProps,
            strictTuples: strictTuples,
            encodeRefs: encodeRefs,
            extraTags: extraTags
        };
        const generator = createGenerator(config);
        const schema = generator.createSchema(config.type);
        if (!schema) {
            console.warn("No schema: " + filePath);
            return;
        }
        const validatorFilePath = path.join(parentFileDir, fileName + ".validator.ts");

        const validator = validatorGenerator({
            apiFileCode: apiTypesCode,
            apiFilePath: absoluteFilePath,
            validatorFilePath,
            schema
        });
        return {
            validatorFilePath: validatorFilePath,
            code: validator
        };
    } catch (error) {
        console.error("Fail to parse: " + filePath, error);
        throw error;
    }
}
