// // -------------------------------------------------------------
// // FORCE IPv4 DNS (must be first)
// // -------------------------------------------------------------
// import dns from "dns";
// dns.setDefaultResultOrder("ipv4first");
// // ---------------- TYPES ----------------
// export interface MiEAAError {
//   success: false;
//   error: string;
// }
// export interface MiEAAJobStart {
//   job_id: string;
// }
// export type MiEAAStartResponse = MiEAAError | MiEAAJobStart;
// // ---------------- ERROR WRAPPER ----------------
// export function formatMiEAAError(msg: string): MiEAAError {
//   return { success: false, error: msg };
// }
// // =============================================================
// // 1. FETCH CATEGORY NAMES (returns IDs + numbered map)
// // =============================================================
// export async function fetchMiEAACategories(
//   species: string,
//   inputType: string
// ): Promise<{ ids: string[]; map: Record<number, string> } | MiEAAError> {
//   const url =
//     `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_categories/${species}/${inputType}/`;
//   try {
//     const res = await fetch(url);
//     const json: any = await res.json();
//     if (!res.ok || !json.categories) {
//       return formatMiEAAError("Failed to fetch categories");
//     }
//     const ids: string[] = json.categories.map((pair: any[]) => pair[0]);
//     // numbered mapping
//     const map: Record<number, string> = {};
//     ids.forEach((id: string, i: number) => {
//       map[i + 1] = id;
//     });
//     return { ids, map };
//   } catch (err: any) {
//     return formatMiEAAError(`CATEGORY FETCH ERROR: ${err?.message}`);
//   }
// }
// // =============================================================
// // 2. START MI-EAA JOB
// // =============================================================
// export async function startMiEAAJob(
//   body: any,
//   species: string,
//   input_type: string,
//   analysis_type: string
// ): Promise<MiEAAStartResponse> {
//   const url =
//     `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/${species}/${input_type}/${analysis_type}/`;
//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body)
//     });
//     const json: any = await res.json();
//     if (!res.ok || !json.job_id) {
//       return formatMiEAAError(`START ERROR: ${JSON.stringify(json)}`);
//     }
//     return { job_id: json.job_id };
//   } catch (err: any) {
//     return formatMiEAAError(`START FETCH ERROR: ${err?.message}`);
//   }
// }
// // export async function fetchMiEAAResults(
// //   jobId: string,
// //   limitMode: "all" | "selected" = "all",
// //   selectedCategories: string[] = []
// // ): Promise<any | MiEAAError> {
// //   const url =
// //     `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`;
// //   const LIMIT = 10;
// //   for (let attempt = 0; attempt < 120; attempt++) {
// //     try {
// //       const res = await fetch(url);
// //       const raw: any = await res.json();
// //       // CASE 1: Still empty → retry
// //       if (Array.isArray(raw) && raw.length === 0) {
// //         await new Promise(r => setTimeout(r, 1000));
// //         continue;
// //       }
// //       // ============================================================
// //       // CASE 2: Server returns SINGLE ARRAY → group by category name
// //       // ============================================================
// //       if (Array.isArray(raw)) {
// //         const grouped: Record<string, any[]> = {};
// //         for (const row of raw) {
// //           if (!Array.isArray(row) || row.length < 9) continue;
// //           const category = row[0] || "Unknown_Category";
// //           if (!grouped[category]) grouped[category] = [];
// //           grouped[category].push({
// //             category: row[0],
// //             term: row[1],
// //             direction: row[2],
// //             p_value: row[3],
// //             adj_p_value: row[4],
// //             score: row[5],
// //             hits: row[7],
// //             mirnas: row[8]
// //           });
// //         }
// //         // LIMIT TO TOP 10
// //         for (const key of Object.keys(grouped)) {
// //           grouped[key] = grouped[key].slice(0, LIMIT);
// //         }
// //         return grouped;
// //       }
//       // ============================================================
//       // CASE 3: Server returns object {"categoryID": [rows]}
//       // ============================================================
// //       if (typeof raw === "object" && raw !== null) {
// //         const final: Record<string, any[]> = {};
// //         for (const catKey of Object.keys(raw)) {
// //           const rows = raw[catKey];
// //           if (!Array.isArray(rows)) continue;
// //           const cleaned = rows.slice(0, LIMIT).map(row => ({
// //             category: row[0],
// //             term: row[1],
// //             direction: row[2],
// //             p_value: row[3],
// //             adj_p_value: row[4],
// //             score: row[5],
// //             hits: row[7],
// //             mirnas: row[8]
// //           }));
// //           final[catKey] = cleaned;
// //         }
// //         return final;
// //       }
// //     } catch (err) {
// //       // ignore & retry
// //     }
// //     await new Promise(r => setTimeout(r, 1000));
// //   }
// //   return formatMiEAAError("Timeout: results never became available.");
// // }
// export async function fetchMiEAAResults(
//   jobId: string,
//   limitMode: "all" | "selected" = "all",
//   selectedCategories: string[] = []
// ): Promise<any | MiEAAError> {
//   const url =
//     `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`;
//   const LIMIT = 10;
//   for (let attempt = 0; attempt < 120; attempt++) {
//     try {
//       const res = await fetch(url);
//       const raw: any = await res.json();
//       // ------------------------------------------------------------
//       // CASE 1: EMPTY ARRAY → job still processing
//       // ------------------------------------------------------------
//       if (Array.isArray(raw) && raw.length === 0) {
//         await new Promise(r => setTimeout(r, 1000));
//         continue;
//       }
//       // ============================================================
//       // CASE 2: ORA FORMAT → single array of arrays
//       // ============================================================
//       if (Array.isArray(raw)) {
//         const grouped: Record<string, any[]> = {};
//         for (const row of raw) {
//           if (!Array.isArray(row) || row.length < 9) continue;
//           const category = row[0] || "Unknown_Category";
//           if (!grouped[category]) grouped[category] = [];
//           grouped[category].push({
//             category: row[0],
//             term: row[1],
//             direction: row[2],
//             p_value: row[3],
//             adj_p_value: row[4],
//             score: row[5],
//             hits: row[7],
//             mirnas: row[8]
//           });
//         }
//         for (const key of Object.keys(grouped)) {
//           grouped[key] = grouped[key].slice(0, LIMIT);
//         }
//         return grouped;
//       }
//       // ============================================================
//       // CASE 3: OBJECT FORMAT (ORA or GSEA)
//       // ============================================================
//       if (typeof raw === "object" && raw !== null) {
//         // ------------------------------------------------------------
//         // CASE 3A – GSEA FORMAT with wrapper: { "Enrichment_Results": {...} }
//         // ------------------------------------------------------------
//         if (raw.Enrichment_Results) {
//           const gseaOut: Record<string, any[]> = {};
//           for (const cat of Object.keys(raw.Enrichment_Results)) {
//             const rows = raw.Enrichment_Results[cat];
//             if (!Array.isArray(rows)) continue;
//             gseaOut[cat] = rows.slice(0, LIMIT).map(r => ({
//               category: cat,
//               term: r.term ?? r.name ?? "",
//               direction: r.direction ?? "",
//               es: r.es,
//               nes: r.nes,
//               p_value: r.p_value,
//               adj_p_value: r.adj_p_value,
//               leading_edge: r.leading_edge,
//               mirnas: r.mirnas
//             }));
//           }
//           return gseaOut;
//         }
//         // ------------------------------------------------------------
//         // CASE 3B – GSEA FORMAT WITHOUT WRAPPER { cat: [ {term:""} ] }
//         // ------------------------------------------------------------
//         const gseaPossible = Object.values(raw).some(v => Array.isArray(v) && typeof v[0] === "object");
//         if (gseaPossible) {
//           const gseaOut: Record<string, any[]> = {};
//           for (const cat of Object.keys(raw)) {
//             const rows = raw[cat];
//             if (!Array.isArray(rows)) continue;
//             // Detect if this is GSEA (object rows)
//             if (typeof rows[0] === "object" && !Array.isArray(rows[0])) {
//               gseaOut[cat] = rows.slice(0, LIMIT).map(r => ({
//                 category: cat,
//                 term: r.term ?? r.name ?? "",
//                 direction: r.direction ?? "",
//                 es: r.es,
//                 nes: r.nes,
//                 p_value: r.p_value,
//                 adj_p_value: r.adj_p_value,
//                 leading_edge: r.leading_edge,
//                 mirnas: r.mirnas
//               }));
//             } else {
//               // OTHERWISE treat as ORA TYPE rows
//               gseaOut[cat] = rows.slice(0, LIMIT).map(row => ({
//                 category: row[0],
//                 term: row[1],
//                 direction: row[2],
//                 p_value: row[3],
//                 adj_p_value: row[4],
//                 score: row[5],
//                 hits: row[7],
//                 mirnas: row[8]
//               }));
//             }
//           }
//           return gseaOut;
//         }
//         // ------------------------------------------------------------
//         // OTHERWISE: treat as ORA-style object (your original logic)
//         // ------------------------------------------------------------
//         const final: Record<string, any[]> = {};
//         for (const catKey of Object.keys(raw)) {
//           const rows = raw[catKey];
//           if (!Array.isArray(rows)) continue;
//           final[catKey] = rows.slice(0, LIMIT).map(row => ({
//             category: row[0],
//             term: row[1],
//             direction: row[2],
//             p_value: row[3],
//             adj_p_value: row[4],
//             score: row[5],
//             hits: row[7],
//             mirnas: row[8]
//           }));
//         }
//         return final;
//       }
//     } catch (err) {
//       // ignore & retry
//     }
//     await new Promise(r => setTimeout(r, 1000));
//   }
//   return formatMiEAAError("Timeout: results never became available.");
// }
//-------------------------------------------------------------
// FORCE IPv4 DNS
//-------------------------------------------------------------
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
// ---------------- ERROR WRAPPER ----------------
export function formatMiEAAError(msg) {
    return { success: false, error: msg };
}
// =============================================================
// 1. FETCH CATEGORY NAMES
// =============================================================
export async function fetchMiEAACategories(species, inputType) {
    const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_categories/${species}/${inputType}/`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok || !json.categories) {
            return formatMiEAAError("Failed to fetch categories");
        }
        const ids = json.categories.map((pair) => pair[0]);
        const map = {};
        ids.forEach((id, i) => {
            map[i + 1] = id;
        });
        return { ids, map };
    }
    catch (err) {
        return formatMiEAAError(`CATEGORY FETCH ERROR: ${err?.message}`);
    }
}
// =============================================================
// 2. START MI-EAA JOB
// =============================================================
export async function startMiEAAJob(body, species, input_type, analysis_type) {
    const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/${species}/${input_type}/${analysis_type}/`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const json = await res.json();
        if (!res.ok || !json.job_id) {
            return formatMiEAAError("Failed to start job");
        }
        return { job_id: json.job_id };
    }
    catch (err) {
        return formatMiEAAError(`START FETCH ERROR: ${err?.message}`);
    }
}
// =============================================================
// 3. FETCH MI-EAA RESULTS (ORA + GSEA AUTO-DETECT)
// =============================================================
export async function fetchMiEAAResults(jobId) {
    const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`;
    const LIMIT = 10;
    // Poll results for up to 120 seconds
    for (let attempt = 0; attempt < 120; attempt++) {
        try {
            const res = await fetch(url);
            const raw = await res.json();
            // Still processing → retry
            if (Array.isArray(raw) && raw.length === 0) {
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }
            // ------------------------------------------------------------
            // ORA FORMAT → single flat array of rows
            // ------------------------------------------------------------
            if (Array.isArray(raw)) {
                const grouped = {};
                for (const row of raw) {
                    if (!Array.isArray(row) || row.length < 9)
                        continue;
                    const category = row[0];
                    if (!grouped[category])
                        grouped[category] = [];
                    grouped[category].push({
                        category: row[0],
                        term: row[1],
                        direction: row[2],
                        p_value: row[3],
                        adj_p_value: row[4],
                        score: row[5],
                        hits: row[7],
                        mirnas: row[8]
                    });
                }
                for (const key of Object.keys(grouped)) {
                    grouped[key] = grouped[key].slice(0, LIMIT);
                }
                return grouped;
            }
            // ------------------------------------------------------------
            // OBJECT FORMAT (ORA or GSEA)
            // ------------------------------------------------------------
            if (typeof raw === "object" && raw !== null) {
                // WRAPPED GSEA: { Enrichment_Results: {...} }
                if (raw.Enrichment_Results) {
                    const out = {};
                    for (const cat of Object.keys(raw.Enrichment_Results)) {
                        const rows = raw.Enrichment_Results[cat];
                        if (!Array.isArray(rows))
                            continue;
                        out[cat] = rows.slice(0, LIMIT).map(r => ({
                            category: cat,
                            term: r.term ?? r.name ?? "",
                            direction: r.direction ?? "",
                            es: r.es,
                            nes: r.nes,
                            p_value: r.p_value,
                            adj_p_value: r.adj_p_value,
                            leading_edge: r.leading_edge,
                            mirnas: r.mirnas
                        }));
                    }
                    return out;
                }
                // UNWRAPPED GSEA: { category: [ {term:...} ] }
                const looksLikeGSEA = Object.values(raw).some(v => Array.isArray(v) && typeof v[0] === "object");
                const out = {};
                for (const cat of Object.keys(raw)) {
                    const rows = raw[cat];
                    if (!Array.isArray(rows))
                        continue;
                    // GSEA object rows
                    if (looksLikeGSEA && typeof rows[0] === "object") {
                        out[cat] = rows.slice(0, LIMIT).map(r => ({
                            category: cat,
                            term: r.term ?? r.name ?? "",
                            direction: r.direction ?? "",
                            es: r.es,
                            nes: r.nes,
                            p_value: r.p_value,
                            adj_p_value: r.adj_p_value,
                            leading_edge: r.leading_edge,
                            mirnas: r.mirnas
                        }));
                    }
                    // ORA object-format rows
                    else {
                        out[cat] = rows.slice(0, LIMIT).map(row => ({
                            category: row[0],
                            term: row[1],
                            direction: row[2],
                            p_value: row[3],
                            adj_p_value: row[4],
                            score: row[5],
                            hits: row[7],
                            mirnas: row[8]
                        }));
                    }
                }
                return out;
            }
        }
        catch {
            // ignore errors and retry
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    return formatMiEAAError("Timeout: results never became available.");
}
//# sourceMappingURL=mieaa.js.map