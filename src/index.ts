import globWatch from "glob-watcher";
import _fs from "node:fs";
import * as globby from "globby";
import assert from "node:assert";
import { generateValidator, TsJsonSchemaGeneratorOptions } from "./create-validator-ts.js";
import { CodeGenerator } from "./default-code-generator.js";
import path from "node:path";
import { createCache } from "@file-cache/core";
import { createNpmPackageKey } from "@file-cache/npm";
import { pathToFileURL } from "node:url";

export { GenerateValidatorCodeOptions, CodeGenerator } from "./default-code-generator.js";
// TODO: Node 14+
const fs = _fs.promises;
// dynamic import wrapper
// import() can not load Window file path
// convert file path to file URL before import()
// https://github.com/nodejs/node/issues/31710
export async function dynamicImport(targetPath: string) {
    const fileUrl = pathToFileURL(targetPath).href;
    return import(fileUrl);
}

export type CreateTSValidatorOptions = {
    cwd: string;
    verbose: boolean;
    tsconfigFilePath: string;
    codeGeneratorScript: string;
    targetGlobs: string[];
    noCache?: boolean; // true by default
} & TsJsonSchemaGeneratorOptions;

export async function watchValidator(options: CreateTSValidatorOptions) {
    const { generator, generatorOptions = {} } = (await dynamicImport(
        path.resolve(options.cwd, options.codeGeneratorScript)
    )) as {
        generator: CodeGenerator;
        generatorOptions?: {
            extraTags?: string[];
        };
    };
    const watcher = globWatch(options.targetGlobs, {
        ignoreInitial: true
    });
    const { sortProps, strictTuples, encodeRefs, skipTypeCheck, additionalProperties } = options;
    return new Promise<void>((resolve, reject) => {
        watcher.on("change", async (filePath) => {
            const result = await generateValidator({
                cwd: options.cwd,
                filePath: filePath,
                tsconfigFilePath: options.tsconfigFilePath,
                validatorGenerator: generator,
                extraTags: generatorOptions.extraTags || [],
                sortProps,
                strictTuples,
                encodeRefs,
                skipTypeCheck,
                additionalProperties
            });
            if (!result) {
                return;
            }
            if (options.verbose) {
                console.log("Update validator: " + result.validatorFilePath);
            }
            return fs.writeFile(result.validatorFilePath, result.code, "utf-8");
        });
        watcher.on("close", () => {
            resolve();
        });
        watcher.on("error", (error) => {
            reject(error);
        });
    });
}

// --check: validate the difference current of source
export async function testGeneratedValidator(options: CreateTSValidatorOptions) {
    const files = await globby.globby(options.targetGlobs, {
        cwd: options.cwd,
        absolute: true
    });
    const { generator, generatorOptions = {} } = (await dynamicImport(
        path.resolve(options.cwd, options.codeGeneratorScript)
    )) as {
        generator: CodeGenerator;
        generatorOptions?: {
            extraTags?: string[];
        };
    };
    const { sortProps, strictTuples, encodeRefs, skipTypeCheck, additionalProperties } = options;
    return Promise.all(
        files.map(async (filePath) => {
            const result = await generateValidator({
                cwd: options.cwd,
                filePath: filePath,
                tsconfigFilePath: options.tsconfigFilePath,
                validatorGenerator: generator,
                extraTags: generatorOptions.extraTags || [],
                sortProps,
                strictTuples,
                encodeRefs,
                skipTypeCheck,
                additionalProperties
            });
            if (!result) {
                return;
            }
            try {
                await fs.access(result.validatorFilePath);
            } catch {
                return;
            }
            const prevValidatorCode = await fs.readFile(result.validatorFilePath, {
                encoding: "utf-8"
            });
            try {
                assert.strictEqual(result.code, prevValidatorCode);
            } catch (error) {
                console.error(
                    "Found diff between types and validator.\nPlease update validator: $ npx create-validator-ts " +
                        filePath
                );
                throw error;
            }
            if (options.verbose) {
                console.log("OK: " + filePath);
            }
        })
    );
}

export async function createValidator(options: CreateTSValidatorOptions) {
    const { generator, generatorOptions = {} } = (await dynamicImport(
        path.resolve(options.cwd, options.codeGeneratorScript)
    )) as {
        generator: CodeGenerator;
        generatorOptions?: {
            extraTags?: string[];
        };
    };
    const files = await globby.globby(options.targetGlobs, {
        cwd: options.cwd,
        absolute: true
    });
    const { sortProps, strictTuples, encodeRefs, skipTypeCheck, additionalProperties } = options;

    const cache = await createCache({
        keys: [() => createNpmPackageKey(["create-validator-ts"]), () => JSON.stringify(options)],
        mode: "content",
        // disable cache by default
        noCache: options.noCache ?? true
    });
    return Promise.all(
        files.map(async (filePath) => {
            const cacheStatus = await cache.getAndUpdateCache(filePath);
            if (!cacheStatus.changed) {
                if (options.verbose) {
                    console.log("Cached: " + filePath);
                }
                return;
            }
            const result = await generateValidator({
                cwd: options.cwd,
                filePath: filePath,
                tsconfigFilePath: options.tsconfigFilePath,
                validatorGenerator: generator,
                extraTags: generatorOptions.extraTags || [],
                sortProps,
                strictTuples,
                encodeRefs,
                skipTypeCheck,
                additionalProperties
            });
            if (!result) {
                return;
            }
            if (options.verbose) {
                console.log("Create: " + filePath);
            }
            return fs.writeFile(result.validatorFilePath, result.code, "utf-8");
        })
    ).finally(() => {
        return cache.reconcile();
    });
}
