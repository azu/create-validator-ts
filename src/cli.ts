import meow from "meow";
import path from "path";
import { createValidator, testGeneratedValidator, watchValidator } from "./index";

export const cli = meow(
    `
    Usage
      $ create-ts-validator [file|glob*]
 
    Options
      --watch               [Boolean] If set the flag, start watch mode
      --check               [Boolean] If set the flag, start test mode
      --tsconfigFilePath    [Path:String] path to tsconfig.json
      --cwd                 [Path:String] current working directory
      --generatorScript     [Path:String] A JavaScript file path that customize validator code generator
      --verbose             [Boolean] If set the flag, show progressing logs

    Examples
      $ create-ts-validator "src/**/api-types.ts"
      # custom tsconfig.json
      $ create-ts-validator "src/**/api-types.ts" --tsconfigFilePath ./tsconfig.app.json
      # custom validator code
      $ create-ts-validator "src/**/api-types.ts" --generatorScript ./custom.js
`,
    {
        flags: {
            tsconfigFilePath: {
                type: "string",
                default: path.join(process.cwd(), "tsconfig.json")
            },
            generatorScript: {
                type: "string",
                default: path.join(__dirname, "create-ts-validator")
            },
            cwd: {
                type: "string",
                default: process.cwd()
            },
            watch: {
                type: "boolean"
            },
            check: {
                type: "boolean"
            },
            verbose: {
                type: "boolean",
                default: true
            }
        },
        autoHelp: true,
        autoVersion: true
    }
);

export const run = async (
    input = cli.input,
    flags = cli.flags
): Promise<{ exitStatus: number; stdout: string | null; stderr: Error | null }> => {
    if (flags.check) {
        await testGeneratedValidator({
            cwd: flags.cwd,
            verbose: flags.verbose,
            targetGlobs: input,
            codeGeneratorScript: flags.generatorScript,
            tsconfigFilePath: flags.tsconfigFilePath
        });
    } else if (flags.watch) {
        await watchValidator({
            cwd: flags.cwd,
            verbose: flags.verbose,
            targetGlobs: input,
            codeGeneratorScript: flags.generatorScript,
            tsconfigFilePath: flags.tsconfigFilePath
        });
    } else {
        await createValidator({
            cwd: flags.cwd,
            verbose: flags.verbose,
            targetGlobs: input,
            codeGeneratorScript: flags.generatorScript,
            tsconfigFilePath: flags.tsconfigFilePath
        });
    }
    return {
        stdout: null,
        stderr: null,
        exitStatus: 0
    };
};
