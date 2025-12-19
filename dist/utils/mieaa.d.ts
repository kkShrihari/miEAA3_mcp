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
export declare function listMiEAACategories(species: string, entity: "mirna" | "precursor"): Promise<any | MiEAAError>;
export declare function convertMiRBaseVersion(args: {
    mirnas: string[];
    from_version: string;
    to_version: string;
}): Promise<any | MiEAAError>;
export declare function convertMirnaPrecursor(args: {
    input: string[];
    direction: "mirna_to_precursor" | "precursor_to_mirna";
}): Promise<any | MiEAAError>;
export declare function fetchMiEAAJobStatus(jobId: string): Promise<any | MiEAAError>;
export declare function fetchMiEAAJobResultsDirect(jobId: string): Promise<any | MiEAAError>;
//# sourceMappingURL=mieaa.d.ts.map