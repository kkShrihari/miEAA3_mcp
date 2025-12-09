import { MiEAAError } from "../utils/mieaa.js";
export declare class MiEAAMirnaHandler {
    validate(options: any): string | null;
    buildBody(options: any): any;
    parseCategorySelection(selection: string, categories: string[]): string[];
    runAnalysis(options: any): Promise<any | MiEAAError>;
}
//# sourceMappingURL=mieaa_mirna_handler.d.ts.map