import * as path from "path";
import * as _fs from "fs";
import { Config, createGenerator } from "ts-json-schema-generator";
import { validatorCodeGenerator } from "./validator-code-generator";

const fs = _fs.promises;

export async function generateValidator({
    cwd,
    validatorGenerator,
    tsconfigFilePath,
    filePath
}: {
    cwd: string;
    validatorGenerator: validatorCodeGenerator;
    tsconfigFilePath: string;
    filePath: string;
}) {
    const absoluteFilePath = path.resolve(cwd, filePath);
    const parentFileDir = path.dirname(path.resolve(cwd, filePath));
    const fileName = path.basename(absoluteFilePath, ".ts");
    const apiTypesCode = await fs.readFile(filePath, "utf-8");
    try {
        const config: Config = {
            path: absoluteFilePath,
            tsconfig: tsconfigFilePath,
            type: "*",
            skipTypeCheck: true,
            additionalProperties: false
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
