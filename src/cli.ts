import meow from "meow";
import path from "path";
import { createValidator, testGeneratedValidator, watchValidator } from "./index";

export const cli = meow(
    `
    Usage
      $ create-validator-ts [file|glob*]
 
    Options
      --watch               [Boolean] If set the flag, start watch mode
      --check               [Boolean] If set the flag, start test mode
      --cwd                 [Path:String] current working directory
      --tsconfigFilePath    [Path:String] path to tsconfig.json
      --generatorScript     [Path:String] A JavaScript file path that customize validator code generator
      --verbose             [Boolean] If set the flag, show progressing logs
     
      ts-json-schema-generator options
      --sortProps               [Boolean] Enable sortProps
      --no-sortProps            
      --strictTuples            [Boolean] Enable strictTuples
      --no-strictTuples         
      --encodeRefs              [Boolean] Enable encodeRefs
      --no-encodeRefs           
      --skipTypeCheck           [Boolean] Enable skipTypeCheck. true by default
      --no-skipTypeCheck
      --additionalProperties    [Boolean] Enable additionalProperties. false by default
      --no-additionalProperties 
    

    Examples
      $ create-validator-ts "src/**/api-types.ts"
      # custom tsconfig.json
      $ create-validator-ts "src/**/api-types.ts" --tsconfigFilePath ./tsconfig.app.json
      # custom validator code
      $ create-validator-ts "src/**/api-types.ts" --generatorScript ./custom.js
`,
    {
        flags: {
            tsconfigFilePath: {
                type: "string",
                default: path.join(process.cwd(), "tsconfig.json")
            },
            generatorScript: {
                type: "string",
                default: path.join(__dirname, "default-code-generator")
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
            },
            sortProps: {
                type: "boolean"
            },
            strictTuples: {
                type: "boolean"
            },
            skipTypeCheck: {
                type: "boolean"
            },
            encodeRefs: {
                type: "boolean"
            },
            additionalProperties: {
                type: "boolean"
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
    const options = {
        cwd: flags.cwd,
        verbose: flags.verbose,
        targetGlobs: input,
        codeGeneratorScript: flags.generatorScript,
        tsconfigFilePath: flags.tsconfigFilePath,
        sortProps: flags.sortProps,
        strictTuples: flags.strictTuples,
        skipTypeCheck: flags.skipTypeCheck,
        encodeRefs: flags.encodeRefs,
        additionalProperties: flags.additionalProperties
    };
    if (flags.check) {
        await testGeneratedValidator(options);
    } else if (flags.watch) {
        await watchValidator(options);
    } else {
        await createValidator(options);
    }
    return {
        stdout: null,
        stderr: null,
        exitStatus: 0
    };
};
