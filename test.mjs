// -------------------------------------------------------------
// LOCAL TEST SCRIPT FOR miEAA MCP HANDLERS
// -------------------------------------------------------------

import { MiEAAMirnaHandler } from "./dist/handlers/mieaa_mirna_handler.js";
import { MiEAAPrecursorHandler } from "./dist/handlers/mieaa_precursor_handler.js";

// Instantiate handlers
const mirnaTool = new MiEAAMirnaHandler();
const precursorTool = new MiEAAPrecursorHandler();

// -------------------------------------------------------------
// TEST CASE 1 — miRNA ORA
// -------------------------------------------------------------
console.log("🚀 Starting miEAA miRNA ORA analysis...\n");

const mirnaResult = await mirnaTool.runAnalysis({
  species: "hsa",
  analysis_type: "ORA",

  mirnas: [
    "hsa-miR-20b-5p",
    "hsa-miR-144-5p",
    "hsa-miR-17-5p",
    "hsa-miR-20a-5p",
    "hsa-miR-222-3p",
    "hsa-miR-106a-5p",
    "hsa-miR-93-5p",
    "hsa-miR-126-3p",
    "hsa-miR-363-3p",
    "hsa-miR-302c-3p",
    "hsa-miR-374b-5p",
    "hsa-miR-18a-5p",
    "hsa-miR-548d-3p",
    "hsa-miR-135a-3p",
    "hsa-miR-558",
    "hsa-miR-130b-5p",
    "hsa-miR-148a-3p",
  ],

  // Category selection examples:
  // "all", "1", "1,4,7", "3-6"
  category_selection: "1-5",
});

console.log("\n✅ FINAL RESULT (miRNA ORA):\n");
console.log(JSON.stringify(mirnaResult, null, 2));


// -------------------------------------------------------------
// TEST CASE 2 — Precursor ORA
// -------------------------------------------------------------
console.log("\n\n🚀 Starting miEAA Precursor ORA analysis...\n");

const precursorResult = await precursorTool.runAnalysis({
  species: "hsa",
  analysis_type: "ORA",   // Only ORA supported for precursor

  precursors: [
    "hsa-mir-20b",
    "hsa-mir-144",
    "hsa-mir-17",
    "hsa-mir-20a",
    "hsa-mir-222",
    "hsa-mir-106a",
    "hsa-mir-93",
    "hsa-mir-126",
    "hsa-mir-363",
    "hsa-mir-302c",
    "hsa-mir-374b",
    "hsa-mir-18a",
    "hsa-mir-548d",
    "hsa-mir-135a",
    "hsa-mir-558",
    "hsa-mir-130b",
    "hsa-mir-148a"
  ],

  category_selection: "1-5",
});

console.log("\n✅ FINAL RESULT (Precursor ORA):\n");
console.log(JSON.stringify(precursorResult, null, 2));






