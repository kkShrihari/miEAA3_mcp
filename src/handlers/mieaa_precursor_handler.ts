// // // src/handlers/mieaa_precursor_handler.ts

// // import {
// //   startMiEAAJob,
// //   fetchMiEAAResults,
// //   fetchMiEAACategories,
// //   MiEAAError,
// //   MiEAAStartResponse
// // } from "../utils/mieaa.js";

// // export class MiEAAPrecursorHandler {

// //   // -----------------------------------------------------
// //   // VALIDATION
// //   // -----------------------------------------------------
// //   validate(options: any): string | null {
// //     if (!options.precursors || !Array.isArray(options.precursors) || options.precursors.length === 0) {
// //       return "precursors must be a non-empty array";
// //     }

// //     if (!["ORA", "GSEA"].includes(options.analysis_type)) {
// //       return "analysis_type must be ORA or GSEA";
// //     }

// //     if (!options.species) return "species is required";

// //     return null;
// //   }

// //   // -----------------------------------------------------
// //   // BUILD BODY FOR MI-EAA PRECURSOR API
// //   // -----------------------------------------------------
// //   buildBody(options: any): any {
// //     const testset =
// //       options.analysis_type === "ORA"
// //         ? options.precursors.join(",")
// //         : options.precursors.map((p: string) => `${p}:1.0`).join(",");

// //     return {
// //       testset,
// //       categories: options.categories,
// //       reference: options.reference_set ?? [],
// //       p_adjust: options.p_adjust ?? "BH",
// //       adjust_scope: options.p_scope ?? "global",
// //       p_value: options.alpha ?? 0.05,
// //       min_hits: options.min_hits ?? 2
// //     };
// //   }

// //   // -----------------------------------------------------
// //   // PARSE CATEGORY SELECTION (numbers or "all")
// //   // -----------------------------------------------------
// //   parseCategorySelection(selection: string, categories: string[]): string[] {
// //     if (!selection || selection === "all") return categories;

// //     const chosen = new Set<string>();
// //     const parts = selection.split(",");

// //     for (let p of parts) {
// //       p = p.trim();

// //       // Range 3-6
// //       if (p.includes("-")) {
// //         const [start, end] = p.split("-").map(n => parseInt(n.trim()));
// //         for (let i = start; i <= end; i++) {
// //           if (categories[i - 1]) chosen.add(categories[i - 1]);
// //         }
// //       }
// //       // Single number
// //       else {
// //         const num = parseInt(p);
// //         if (!isNaN(num) && categories[num - 1]) {
// //           chosen.add(categories[num - 1]);
// //         }
// //       }
// //     }

// //     return [...chosen];
// //   }

// //   // -----------------------------------------------------
// //   // MAIN LOGIC
// //   // -----------------------------------------------------
// //   async runAnalysis(options: any): Promise<any | MiEAAError> {

// //     // Validate
// //     const validation = this.validate(options);
// //     if (validation) return { success: false, error: validation };

// //     // Auto-fetch categories
// //     if (!options.categories || options.categories.length === 0) {
// //       console.log("🔍 Fetching precursor categories automatically...");

// //       const catRes = await fetchMiEAACategories(options.species, "precursor");
// //       if ("error" in catRes) return catRes;

// //       const { ids, map } = catRes;

// //       console.log("\n📌 Available Precursor Categories:");
// //       Object.entries(map).forEach(([num, name]) => {
// //         console.log(` ${num}. ${name}`);
// //       });

// //       options.categories = ids;
// //     }

// //     // Interpret user category input
// //     const selectedCategories = this.parseCategorySelection(
// //       options.category_selection ?? "all",
// //       options.categories
// //     );

// //     // Reduce categories to selected ones
// //     options.categories = selectedCategories;

// //     // Build POST body
// //     const body = this.buildBody(options);

// //     // Start job
// //     const startJob: MiEAAStartResponse = await startMiEAAJob(
// //       body,
// //       options.species,
// //       "precursor",
// //       options.analysis_type
// //     );

// //     if ("error" in startJob) return startJob;

// //     const jobId = startJob.job_id;

// //     console.log("🆔 Job ID =", jobId);
// //     console.log("🔗 Results:", 
// //       `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`
// //     );

// //     // Fetch results (top 10 per category automatically)
// //     return await fetchMiEAAResults(jobId);
// //   }
// // }

// // src/handlers/mieaa_precursor_handler.ts

// import {
//   startMiEAAJob,
//   fetchMiEAACategories,
//   fetchMiEAAResults,
//   MiEAAError,
//   MiEAAStartResponse
// } from "../utils/mieaa.js";

// export class MiEAAPrecursorHandler {

//   // -----------------------------------------------------
//   // VALIDATION
//   // -----------------------------------------------------
//   validate(options: any): string | null {
//     if (!options.precursors || !Array.isArray(options.precursors) || options.precursors.length === 0) {
//       return "precursors must be a non-empty array";
//     }

//     // ❗ Precursor GSEA never returns results → block it
//     if (options.analysis_type === "GSEA") {
//       return "GSEA is not supported for precursor analysis. Use ORA instead.";
//     }

//     if (!options.species) {
//       return "species is required";
//     }

//     return null;
//   }

//   // -----------------------------------------------------
//   // BUILD BODY FOR MI-EAA PRECURSOR API
//   // -----------------------------------------------------
//   buildBody(options: any): any {

//     // ORA uses simple list
//     const testset = options.precursors.join(",");

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
//   // PARSE CATEGORY SELECTION (numbers or ranges)
//   // -----------------------------------------------------
//   parseCategorySelection(selection: string, categories: string[]): string[] {

//     if (!selection || selection === "all") return categories;

//     const chosen = new Set<string>();
//     const parts = selection.split(",");

//     for (let p of parts) {
//       p = p.trim();

//       // Range like 3-6
//       if (p.includes("-")) {
//         const [start, end] = p.split("-").map(v => parseInt(v.trim()));
//         for (let i = start; i <= end; i++) {
//           if (categories[i - 1]) chosen.add(categories[i - 1]);
//         }
//       }

//       // Single number like "4"
//       else {
//         const num = parseInt(p);
//         if (!isNaN(num) && categories[num - 1]) {
//           chosen.add(categories[num - 1]);
//         }
//       }
//     }

//     return Array.from(chosen);
//   }

//   // -----------------------------------------------------
//   // MAIN LOGIC
//   // -----------------------------------------------------
//   async runAnalysis(options: any): Promise<any | MiEAAError> {

//     // Validate
//     const validation = this.validate(options);
//     if (validation) return { success: false, error: validation };

//     // Auto-fetch precursor categories
//     if (!options.categories || options.categories.length === 0) {
//       console.log("🔍 Fetching precursor categories automatically...");

//       const catRes = await fetchMiEAACategories(options.species, "precursor");
//       if ("error" in catRes) return catRes;

//       const { ids, map } = catRes;

//       console.log("\n📌 Available Precursor Categories:");
//       for (const [num, name] of Object.entries(map)) {
//         console.log(` ${num}. ${name}`);
//       }

//       options.categories = ids;
//     }

//     // Parse numeric or range category selection
//     const selected = this.parseCategorySelection(
//       options.category_selection ?? "all",
//       options.categories
//     );

//     options.categories = selected;

//     // Build POST body
//     const body = this.buildBody(options);

//     // Start job
//     const startJob: MiEAAStartResponse = await startMiEAAJob(
//       body,
//       options.species,
//       "precursor",
//       options.analysis_type // (but GSEA already blocked)
//     );

//     if ("error" in startJob) return startJob;

//     const jobId = startJob.job_id;

//     console.log("🆔 Job ID =", jobId);
//     console.log(
//       "🔗 Results:",
//       `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`
//     );

//     // Fetch results (clean, limited, formatted)
//     return await fetchMiEAAResults(jobId);
//   }
// }





// src/handlers/mieaa_precursor_handler.ts

import {
  startMiEAAJob,
  fetchMiEAACategories,
  fetchMiEAAResults,
  MiEAAError,
  MiEAAStartResponse
} from "../utils/mieaa.js";

export class MiEAAPrecursorHandler {

  // -----------------------------------------------------
  // VALIDATION
  // -----------------------------------------------------
  validate(options: any): string | null {
    if (!options.precursors || !Array.isArray(options.precursors) || options.precursors.length === 0) {
      return "precursors must be a non-empty array";
    }

    // GSEA not supported for precursor analysis
    if (options.analysis_type === "GSEA") {
      return "GSEA is not supported for precursor analysis. Use ORA instead.";
    }

    if (!options.species) {
      return "species is required";
    }

    return null;
  }

  // -----------------------------------------------------
  // BUILD REQUEST BODY
  // -----------------------------------------------------
  buildBody(options: any): any {
    const testset = options.precursors.join(",");

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
  // PARSE CATEGORY SELECTION (numbers or ranges)
  // -----------------------------------------------------
  parseCategorySelection(selection: string, categories: string[]): string[] {
    if (!selection || selection === "all") return categories;

    const chosen = new Set<string>();
    const parts = selection.split(",");

    for (let p of parts) {
      p = p.trim();

      if (p.includes("-")) {
        // Range like "2-5"
        const [start, end] = p.split("-").map(v => parseInt(v.trim()));
        for (let i = start; i <= end; i++) {
          if (categories[i - 1]) chosen.add(categories[i - 1]);
        }
      } else {
        // Single number
        const num = parseInt(p);
        if (!isNaN(num) && categories[num - 1]) {
          chosen.add(categories[num - 1]);
        }
      }
    }

    return Array.from(chosen);
  }

  // -----------------------------------------------------
  // MAIN ANALYSIS EXECUTION
  // -----------------------------------------------------
  async runAnalysis(options: any): Promise<any | MiEAAError> {

    // Validate
    const validation = this.validate(options);
    if (validation) return { success: false, error: validation };

    // Auto-fetch categories if none given
    if (!options.categories || options.categories.length === 0) {
      const catRes = await fetchMiEAACategories(options.species, "precursor");
      if ("error" in catRes) return catRes;

      const { ids } = catRes;
      options.categories = ids;
    }

    // Apply category selection rules
    const selected = this.parseCategorySelection(
      options.category_selection ?? "all",
      options.categories
    );

    options.categories = selected;

    // Build body
    const body = this.buildBody(options);

    // Start job
    const startJob: MiEAAStartResponse = await startMiEAAJob(
      body,
      options.species,
      "precursor",
      options.analysis_type
    );

    if ("error" in startJob) return startJob;

    const jobId = startJob.job_id;

    // Metadata → stderr (safe for MCP)
    console.error(`Job started: ${jobId}`);
    console.error(
      `Result URL: https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`
    );

    // Fetch & return formatted results
    return await fetchMiEAAResults(jobId);
  }
}
