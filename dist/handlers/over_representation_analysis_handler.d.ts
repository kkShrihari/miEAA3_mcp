import { MiEAAError } from "../utils/mieaa.js";
type Entity = "mirna" | "precursor";
interface ORAOptions {
    species: string;
    entity: Entity;
    ids: string[];
    category_selection?: string;
    categories?: string[];
    reference_set?: string[];
    p_adjust?: string;
    p_scope?: string;
    alpha?: number;
    min_hits?: number;
}
export declare class OverRepresentationAnalysisHandler {
    validate(options: ORAOptions): string | null;
    buildBody(options: ORAOptions): any;
    parseCategorySelection(selection: string, categories: string[]): string[];
    run(options: ORAOptions): Promise<any | MiEAAError>;
}
export {};
//# sourceMappingURL=over_representation_analysis_handler.d.ts.map