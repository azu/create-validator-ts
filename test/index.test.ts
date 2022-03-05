import { createValidator, testGeneratedValidator } from "../src";
import path from "path";
import assert from "assert";
describe("index", function () {
    it("generate .validator.ts", async () => {
        await createValidator({
            cwd: __dirname,
            targetGlobs: ["./snapshots/valid/*.ts", "!./snapshots/valid/*.validator.ts"],
            codeGeneratorScript: path.join(__dirname, "../src/default-code-generator.ts"),
            verbose: false,
            tsconfigFilePath: path.join(__dirname, "../tsconfig.json")
        });
        // test generated code
        const { validateGetAPIResponseBody } = await import("./snapshots/valid/api-types.validator");
        assert.throws(() => {
            validateGetAPIResponseBody({});
        }, /Error: Invalid GetAPIResponseBody: GetAPIResponseBody must have required property 'ok'/);
    });
    it("check .validator.ts", async () => {
        await testGeneratedValidator({
            cwd: __dirname,
            targetGlobs: ["./snapshots/valid/*.ts", "!./snapshots/valid/*.validator.ts"],
            codeGeneratorScript: path.join(__dirname, "../src/default-code-generator.ts"),
            verbose: false,
            tsconfigFilePath: path.join(__dirname, "../tsconfig.json")
        });
    });
    it("should throw if .validator.ts is invalid", async () => {
        return assert.rejects(() =>
            testGeneratedValidator({
                cwd: __dirname,
                targetGlobs: ["./snapshots/invalid/api-types.ts"],
                codeGeneratorScript: path.join(__dirname, "../src/default-code-generator.ts"),
                verbose: false,
                tsconfigFilePath: path.join(__dirname, "../tsconfig.json")
            })
        );
    });
    it("check by custom-code-generator", async () => {
        await testGeneratedValidator({
            cwd: __dirname,
            targetGlobs: [
                "./snapshots/custom-generator-valid/*.ts",
                "!./snapshots/custom-generator-valid/*.validator.ts"
            ],
            codeGeneratorScript: path.join(__dirname, "./custom-code-generator.ts"),
            verbose: false,
            tsconfigFilePath: path.join(__dirname, "../tsconfig.json")
        });
    });
});
