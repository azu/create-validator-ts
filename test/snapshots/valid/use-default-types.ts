// Example api-types
// GET /api
export type GetAPIRequestQuery = {
    id: string;
    /**
     * @default 1
     */
    num?: number;
};
export type GetAPIResponseBody = {
    ok: boolean;
};
