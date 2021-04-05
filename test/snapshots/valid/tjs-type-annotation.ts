// WARNING: THIS IS EXPERIMENTAL FEATURES
// THIS FEATURE MAY BE DROPPED IN SOME TIMES
// https://github.com/vega/ts-json-schema-generator/blob/master/src/AnnotationsReader/BasicAnnotationsReader.ts
// https://github.com/YousefED/typescript-json-schema#annotations
export type UpdateUser = {
    /**
     * @pattern /[a-z]{3,}/
     */
    id: string;
    /**
     * @minimum 0
     * @TJS-type integer
     */
    age: number;
};
