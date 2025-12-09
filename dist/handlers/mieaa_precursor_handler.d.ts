import { MiEAAError } from "../utils/mieaa.js";
export declare class MiEAAPrecursorHandler {
    validate(options: any): string | null;
    buildBody(options: any): any;
    parseCategorySelection(selection: string, categories: string[]): string[];
    runAnalysis(options: any): Promise<any | MiEAAError>;
}
//# sourceMappingURL=mieaa_precursor_handler.d.ts.map