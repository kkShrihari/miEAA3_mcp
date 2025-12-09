export interface MiEAAError {
    success: false;
    error: string;
}
export interface MiEAAJobStart {
    job_id: string;
}
export type MiEAAStartResponse = MiEAAError | MiEAAJobStart;
export declare function formatMiEAAError(msg: string): MiEAAError;
export declare function fetchMiEAACategories(species: string, inputType: string): Promise<{
    ids: string[];
    map: Record<number, string>;
} | MiEAAError>;
export declare function startMiEAAJob(body: any, species: string, input_type: string, analysis_type: string): Promise<MiEAAStartResponse>;
export declare function fetchMiEAAResults(jobId: string): Promise<any | MiEAAError>;
//# sourceMappingURL=mieaa.d.ts.map