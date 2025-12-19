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
// =============================================================
// 4. LIST ENRICHMENT CATEGORIES (DISCOVERY TOOL)
// =============================================================
export async function listMiEAACategories(species, entity) {
    const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_categories/${species}/${entity}/`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) {
            return formatMiEAAError("Failed to list enrichment categories");
        }
        if (!Array.isArray(json.categories)) {
            return formatMiEAAError("Invalid category response format");
        }
        return {
            species,
            entity,
            categories: json.categories.map((c, idx) => ({
                index: idx + 1,
                id: c[0],
                name: c[1]
            }))
        };
    }
    catch (err) {
        return formatMiEAAError(`CATEGORY LIST ERROR: ${err?.message}`);
    }
}
// =============================================================
// 5. miRBASE VERSION CONVERTER
// =============================================================
export async function convertMiRBaseVersion(args) {
    const url = "https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/mirbase_converter/";
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(args)
        });
        const json = await res.json();
        if (!res.ok) {
            return formatMiEAAError("miRBase conversion failed");
        }
        return json;
    }
    catch (err) {
        return formatMiEAAError(`MIRBASE CONVERTER ERROR: ${err?.message}`);
    }
}
// =============================================================
// 6. miRNA ↔ PRECURSOR CONVERTER
// =============================================================
export async function convertMirnaPrecursor(args) {
    const url = "https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/mirna_precursor_converter/";
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(args)
        });
        const json = await res.json();
        if (!res.ok) {
            return formatMiEAAError("miRNA/Precursor conversion failed");
        }
        return json;
    }
    catch (err) {
        return formatMiEAAError(`CONVERTER ERROR: ${err?.message}`);
    }
}
// =============================================================
// 7. FETCH JOB STATUS
// =============================================================
export async function fetchMiEAAJobStatus(jobId) {
    const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/job_status/${jobId}/`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) {
            return formatMiEAAError("Failed to fetch job status");
        }
        return json;
    }
    catch (err) {
        return formatMiEAAError(`JOB STATUS ERROR: ${err?.message}`);
    }
}
// =============================================================
// 8. FETCH JOB RESULTS (DIRECT)
// =============================================================
export async function fetchMiEAAJobResultsDirect(jobId) {
    const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${jobId}/`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) {
            return formatMiEAAError("Failed to fetch job results");
        }
        return json;
    }
    catch (err) {
        return formatMiEAAError(`JOB RESULT ERROR: ${err?.message}`);
    }
}
//# sourceMappingURL=mieaa.js.map