import { createValidator, testGeneratedValidator } from "../src";
import path from "path";
import assert from "assert";

describe("index", function () {
    it("generate .validator.ts", async () => {
        await createValidator({
            cwd: __dirname,
            targetGlobs: ["./snapshots/valid/api-types.ts"],
            codeGeneratorScript: path.join(__dirname, "../src/validator-code-generator.ts"),
            verbose: false,
            tsconfigFilePath: path.join(__dirname, "../tsconfig.json")
        });
    });
    it("check .validator.ts", async () => {
        await testGeneratedValidator({
            cwd: __dirname,
            targetGlobs: ["./snapshots/valid/api-types.ts"],
            codeGeneratorScript: path.join(__dirname, "../src/validator-code-generator.ts"),
            verbose: false,
            tsconfigFilePath: path.join(__dirname, "../tsconfig.json")
        });
    });
    it("should throw if .validator.ts is invalid", async () => {
        return assert.rejects(() =>
            testGeneratedValidator({
                cwd: __dirname,
                targetGlobs: ["./snapshots/invalid/api-types.ts"],
                codeGeneratorScript: path.join(__dirname, "../src/validator-code-generator.ts"),
                verbose: false,
                tsconfigFilePath: path.join(__dirname, "../tsconfig.json")
            })
        );
    });
});
