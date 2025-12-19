// // src/handlers/over_representation_analysis.ts
// import {
//   startMiEAAJob,
//   fetchMiEAACategories,
//   fetchMiEAAResults,
//   MiEAAError,
//   MiEAAStartResponse
// } from "../utils/mieaa.js";
// type Entity = "mirna" | "precursor";
// interface ORAOptions {
//   species: string;
//   entity: Entity;
//   ids: string[];
//   category_selection?: string;
//   categories?: string[];
//   reference_set?: string[];
//   p_adjust?: string;
//   p_scope?: string;
//   alpha?: number;
//   min_hits?: number;
// }
// export class OverRepresentationAnalysisHandler {
//   // -----------------------------------------------------
//   // VALIDATION
//   // -----------------------------------------------------
//   validate(options: ORAOptions): string | null {
//     if (!options.species) {
//       return "species is required";
//     }
//     if (!["mirna", "precursor"].includes(options.entity)) {
//       return "entity must be 'mirna' or 'precursor'";
//     }
//     if (!options.ids || !Array.isArray(options.ids) || options.ids.length === 0) {
//       return "ids must be a non-empty array";
//     }
//     return null;
//   }
//   // -----------------------------------------------------
//   // BUILD POST BODY (ORA ONLY)
//   // -----------------------------------------------------
//   buildBody(options: ORAOptions): any {
//     const testset = options.ids.join(",");
//     return {
//       testset,
//       categories: options.categories,
//       reference: options.reference_set ?? [],
//       p_adjust: options.p_adjust ?? "BH",
//       adjust_scope: options.p_scope ?? "global",
//       p_value: options.alpha ?? 0.05,
//       min_hits: options.min_hits ?? 2
//     };
//   }
//   // -----------------------------------------------------
//   // PARSE CATEGORY SELECTION
//   // -----------------------------------------------------
//   parseCategorySelection(selection: string, categories: string[]): string[] {
//     if (!selection || selection === "all") {
//       return categories;
//     }
//     const chosen = new Set<string>();
//     const parts = selection.split(",");
//     for (let p of parts) {
//       p = p.trim();
//       if (p.includes("-")) {
//         const [start, end] = p.split("-").map(n => parseInt(n.trim()));
//         for (let i = start; i <= end; i++) {
//           if (categories[i - 1]) chosen.add(categories[i - 1]);
//         }
//       } else {
//         const num = parseInt(p);
//         if (!isNaN(num) && categories[num - 1]) {
//           chosen.add(categories[num - 1]);
//         }
//       }
//     }
//     return Array.from(chosen);
//   }
//   // -----------------------------------------------------
//   // MAIN EXECUTION
//   // -----------------------------------------------------
//   async run(options: ORAOptions): Promise<any | MiEAAError> {
//     // Validate
//     const validationError = this.validate(options);
//     if (validationError) {
//       return { success: false, error: validationError };
//     }
//     // Auto-fetch categories if needed
//     if (!options.categories || options.categories.length === 0) {
//       const catRes = await fetchMiEAACategories(
//         options.species,
//         options.entity
//       );
//       if ("error" in catRes) return catRes;
//       options.categories = catRes.ids;
//     }
//     // Apply numeric category selection
//     options.categories = this.parseCategorySelection(
//       options.category_selection ?? "all",
//       options.categories
//     );
//     // Build ORA body
//     const body = this.buildBody(options);
//     // Start ORA job (analysis_type is FIXED to ORA)
//     const startJob: MiEAAStartResponse = await startMiEAAJob(
//       body,
//       options.species,
//       options.entity,
//       "ORA"
//     );
//     if ("error" in startJob) return startJob;
//     const jobId = startJob.job_id;
//     // Log metadata to stderr (MCP-safe)
//     console.error(`ORA job started: ${jobId}`);
//     console.error(
//       `Result URL: https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`
//     );
//     // Fetch & return final ORA results
//     return await fetchMiEAAResults(jobId);
//   }
// }
// src/handlers/over_representation_analysis.ts
import { startMiEAAJob, fetchMiEAACategories, fetchMiEAAResults } from "../utils/mieaa.js";
export class OverRepresentationAnalysisHandler {
    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------
    validate(options) {
        if (!options.species) {
            return "species is required";
        }
        if (!["mirna", "precursor"].includes(options.entity)) {
            return "entity must be 'mirna' or 'precursor'";
        }
        if (!options.ids || !Array.isArray(options.ids) || options.ids.length === 0) {
            return "ids must be a non-empty array";
        }
        return null;
    }
    // -----------------------------------------------------
    // BUILD POST BODY (ORA ONLY)
    // -----------------------------------------------------
    buildBody(options) {
        const testset = options.ids.join(",");
        return {
            testset,
            categories: options.categories,
            reference: options.reference_set ?? [],
            p_adjust: options.p_adjust ?? "BH",
            adjust_scope: options.p_scope ?? "global",
            p_value: options.alpha ?? 0.05,
            min_hits: options.min_hits ?? 2
        };
    }
    // -----------------------------------------------------
    // PARSE CATEGORY SELECTION
    // -----------------------------------------------------
    parseCategorySelection(selection, categories) {
        if (!selection || selection === "all") {
            return categories;
        }
        const chosen = new Set();
        const parts = selection.split(",");
        for (let p of parts) {
            p = p.trim();
            if (p.includes("-")) {
                const [start, end] = p.split("-").map(n => parseInt(n.trim()));
                for (let i = start; i <= end; i++) {
                    if (categories[i - 1])
                        chosen.add(categories[i - 1]);
                }
            }
            else {
                const num = parseInt(p);
                if (!isNaN(num) && categories[num - 1]) {
                    chosen.add(categories[num - 1]);
                }
            }
        }
        return Array.from(chosen);
    }
    // -----------------------------------------------------
    // MAIN EXECUTION
    // -----------------------------------------------------
    async run(options) {
        // Validate
        const validationError = this.validate(options);
        if (validationError) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({ success: false, error: validationError })
                    }
                ],
                structuredContent: {
                    success: false,
                    error: validationError
                }
            };
        }
        // Auto-fetch categories if needed
        if (!options.categories || options.categories.length === 0) {
            const catRes = await fetchMiEAACategories(options.species, options.entity);
            if ("error" in catRes) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(catRes)
                        }
                    ],
                    structuredContent: catRes
                };
            }
            options.categories = catRes.ids;
        }
        // Apply numeric category selection
        options.categories = this.parseCategorySelection(options.category_selection ?? "all", options.categories);
        // Build ORA body
        const body = this.buildBody(options);
        // Start ORA job (analysis_type is FIXED to ORA)
        const startJob = await startMiEAAJob(body, options.species, options.entity, "ORA");
        if ("error" in startJob) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(startJob)
                    }
                ],
                structuredContent: startJob
            };
        }
        const jobId = startJob.job_id;
        // Log metadata to stderr (MCP-safe)
        console.error(`ORA job started: ${jobId}`);
        console.error(`Result URL: https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`);
        // Fetch final ORA results
        const results = await fetchMiEAAResults(jobId);
        // Final MCP-compliant return
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(results)
                }
            ],
            structuredContent: results
        };
    }
}
//# sourceMappingURL=over_representation_analysis_handler.js.map