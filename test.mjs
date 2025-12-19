// -------------------------------------------------------------
// LOCAL TEST SCRIPT FOR miEAA MCP HANDLERS
// -------------------------------------------------------------

// -------------------------------------------------------------
// IMPORTS
// -------------------------------------------------------------
import { OverRepresentationAnalysisHandler } from "./dist/handlers/over_representation_analysis_handler.js";
import { MiEAACategoriesHandler } from "./dist/handlers/mieaa_categories_handler.js";
import { MiEAAMirBaseConverterHandler } from "./dist/handlers/mieaa_mirbase_converter_handler.js";
import { MiEAAMirnaPrecursorConverterHandler } from "./dist/handlers/mieaa_mirna_precursor_converter_handler.js";

// -------------------------------------------------------------
// Instantiate handlers
// -------------------------------------------------------------
const oraTool = new OverRepresentationAnalysisHandler();
const categoryTool = new MiEAACategoriesHandler();
const mirbaseTool = new MiEAAMirBaseConverterHandler();
const converterTool = new MiEAAMirnaPrecursorConverterHandler();

// -------------------------------------------------------------
// TEST CASE 1 — miRNA Over-Representation Analysis (ORA)
// -------------------------------------------------------------
console.log(" Starting miEAA miRNA ORA analysis...\n");

const mirnaOraResult = await oraTool.run({
  species: "hsa",
  entity: "mirna",
  ids: [
    "hsa-miR-20b-5p",
    "hsa-miR-144-5p",
    "hsa-miR-17-5p",
    "hsa-miR-20a-5p",
    "hsa-miR-222-3p",
    "hsa-miR-106a-5p",
    "hsa-miR-93-5p",
    "hsa-miR-126-3p",
    "hsa-miR-363-3p",
    "hsa-miR-374b-5p",
    "hsa-miR-18a-5p",
    "hsa-miR-130b-5p",
    "hsa-miR-148a-3p"
  ],
  category_selection: "1-5"
});

console.log("\n FINAL RESULT (miRNA ORA):\n");
console.log(JSON.stringify(mirnaOraResult, null, 2));


// -------------------------------------------------------------
// TEST CASE 2 — Precursor Over-Representation Analysis (ORA)
// -------------------------------------------------------------
console.log("\n\n Starting miEAA Precursor ORA analysis...\n");

const precursorOraResult = await oraTool.run({
  species: "hsa",
  entity: "precursor",
  ids: [
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
  category_selection: "1-5"
});

console.log("\n FINAL RESULT (Precursor ORA):\n");
console.log(JSON.stringify(precursorOraResult, null, 2));


// -------------------------------------------------------------
// TEST CASE 3 — List Enrichment Categories
// -------------------------------------------------------------
console.log("\n\n Fetching enrichment categories...\n");

const categoriesResult = await categoryTool.run({
  species: "hsa",
  entity: "mirna"
});

console.log("\n ENRICHMENT CATEGORIES:\n");
console.log(JSON.stringify(categoriesResult, null, 2));


// -------------------------------------------------------------
// TEST CASE 4 — miRBase Version Converter
// -------------------------------------------------------------
console.log("\n\n Converting miRNAs between miRBase versions...\n");

const mirbaseResult = await mirbaseTool.run({
  mirnas: [
    "hsa-miR-17-5p",
    "hsa-miR-20a-5p",
    "hsa-miR-93-5p"
  ],
  from_version: "v22",
  to_version: "v21"
});

console.log("\n miRBASE CONVERSION RESULT:\n");
console.log(JSON.stringify(mirbaseResult, null, 2));


// -------------------------------------------------------------
// TEST CASE 5 — miRNA ↔ Precursor Converter
// -------------------------------------------------------------
console.log("\n\n Converting miRNAs ↔ Precursors...\n");

const converterResult = await converterTool.run({
  direction: "mirna_to_precursor",
  ids: [
    "hsa-miR-17-5p",
    "hsa-miR-20a-5p",
    "hsa-miR-93-5p"
  ]
});

console.log("\n miRNA ↔ PRECURSOR CONVERSION:\n");
console.log(JSON.stringify(converterResult, null, 2));


// -------------------------------------------------------------
console.log("\n ALL miEAA MCP HANDLER TESTS COMPLETED SUCCESSFULLY 🎉\n");
