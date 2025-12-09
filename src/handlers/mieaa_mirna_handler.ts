// // src/handlers/mieaa_mirna_handler.ts

// import {
//   startMiEAAJob,
//   fetchMiEAACategories,
//   fetchMiEAAResults,
//   MiEAAError,
//   MiEAAStartResponse
// } from "../utils/mieaa.js";

// export class MiEAAMirnaHandler {

//   // -----------------------------------------------------
//   // VALIDATION
//   // -----------------------------------------------------
//   validate(options: any): string | null {
//     if (!options.mirnas || !Array.isArray(options.mirnas) || options.mirnas.length === 0) {
//       return "mirnas must be a non-empty array";
//     }
//     if (!["ORA", "GSEA"].includes(options.analysis_type)) {
//       return "analysis_type must be ORA or GSEA";
//     }
//     if (!options.species) {
//       return "species is required";
//     }
//     return null;
//   }

//   // -----------------------------------------------------
//   // BUILD POST BODY FOR MI-EAA
//   // -----------------------------------------------------
//   buildBody(options: any): any {
//     const testset =
//       options.analysis_type === "ORA"
//         ? options.mirnas.join(",")
//         : options.mirnas.map((m: string) => `${m}:1.0`).join(",");

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
//   // PARSE CATEGORY SELECTION (numbers or "all")
//   // -----------------------------------------------------
//   parseCategorySelection(selection: string, categories: string[]): string[] {
//     if (!selection || selection === "all") {
//       return categories;
//     }

//     const chosen = new Set<string>();
//     const parts = selection.split(",");

//     for (let p of parts) {
//       p = p.trim();

//       // Range: 3–6
//       if (p.includes("-")) {
//         const [start, end] = p.split("-").map(n => parseInt(n.trim()));
//         for (let i = start; i <= end; i++) {
//           if (categories[i - 1]) chosen.add(categories[i - 1]);
//         }
//       } else {
//         // Single number
//         const num = parseInt(p);
//         if (!isNaN(num) && categories[num - 1]) {
//           chosen.add(categories[num - 1]);
//         }
//       }
//     }

//     return Array.from(chosen);
//   }

//   // -----------------------------------------------------
//   // MAIN ANALYSIS EXECUTION
//   // -----------------------------------------------------
//   async runAnalysis(options: any): Promise<any | MiEAAError> {

//     // Validate input
//     const validationError = this.validate(options);
//     if (validationError) return { success: false, error: validationError };

//     // Fetch categories automatically if none provided
//     if (!options.categories || options.categories.length === 0) {
//       console.log("🔍 Fetching miRNA categories automatically...");

//       const catResult = await fetchMiEAACategories(options.species, "mirna");
//       if ("error" in catResult) return catResult;

//       const { ids, map } = catResult;

//       console.log("\n📌 Available Categories:");
//       Object.entries(map).forEach(([num, name]) => {
//         console.log(` ${num}. ${name}`);
//       });

//       options.categories = ids;
//     }

//     // Apply user selection (numbers, ranges)
//     const selectedCategories = this.parseCategorySelection(
//       options.category_selection ?? "all",
//       options.categories
//     );

//     // Restrict POST body to selected categories only
//     options.categories = selectedCategories;

//     // Build request body
//     const body = this.buildBody(options);

//     // Start analysis job
//     const startJob: MiEAAStartResponse = await startMiEAAJob(
//       body,
//       options.species,
//       "mirna",
//       options.analysis_type
//     );

//     if ("error" in startJob) return startJob;

//     const jobId = startJob.job_id;

//     console.log("🆔 Job ID =", jobId);
//     console.log("🔗 Results:", 
//       `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`
//     );

//     // Fetch results (utils now always returns top 10)
//     return await fetchMiEAAResults(jobId);
//   }
// }



// src/handlers/mieaa_mirna_handler.ts
import {
  startMiEAAJob,
  fetchMiEAACategories,
  fetchMiEAAResults,
  MiEAAError,
  MiEAAStartResponse
} from "../utils/mieaa.js";

export class MiEAAMirnaHandler {

  // -----------------------------------------------------
  // VALIDATION
  // -----------------------------------------------------
  validate(options: any): string | null {
    if (!options.mirnas || !Array.isArray(options.mirnas) || options.mirnas.length === 0) {
      return "mirnas must be a non-empty array";
    }
    if (!["ORA", "GSEA"].includes(options.analysis_type)) {
      return "analysis_type must be ORA or GSEA";
    }
    if (!options.species) {
      return "species is required";
    }
    return null;
  }

  // -----------------------------------------------------
  // BUILD POST BODY
  // -----------------------------------------------------
  buildBody(options: any): any {
    const testset =
      options.analysis_type === "ORA"
        ? options.mirnas.join(",")
        : options.mirnas.map((m: string) => `${m}:1.0`).join(",");

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
  parseCategorySelection(selection: string, categories: string[]): string[] {
    if (!selection || selection === "all") {
      return categories;
    }

    const chosen = new Set<string>();
    const parts = selection.split(",");

    for (let p of parts) {
      p = p.trim();

      if (p.includes("-")) {
        const [start, end] = p.split("-").map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          if (categories[i - 1]) chosen.add(categories[i - 1]);
        }
      } else {
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
  async runAnalysis(options: any): Promise<any | MiEAAError> {

    // Validate
    const validationError = this.validate(options);
    if (validationError) return { success: false, error: validationError };

    // Auto-load categories
    if (!options.categories || options.categories.length === 0) {
      const catResult = await fetchMiEAACategories(options.species, "mirna");
      if ("error" in catResult) return catResult;

      const { ids } = catResult;
      options.categories = ids;
    }

    // Numerically reduce categories
    const selectedCategories = this.parseCategorySelection(
      options.category_selection ?? "all",
      options.categories
    );

    options.categories = selectedCategories;

    // Build POST body
    const body = this.buildBody(options);

    // Start job
    const startJob: MiEAAStartResponse = await startMiEAAJob(
      body,
      options.species,
      "mirna",
      options.analysis_type
    );

    if ("error" in startJob) return startJob;

    const jobId = startJob.job_id;

    // Log job metadata only to stderr (safe for MCP)
    console.error(`Job started: ${jobId}`);
    console.error(
      `Result URL: https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`
    );

    // Retrieve final results
    return await fetchMiEAAResults(jobId);
  }
}
