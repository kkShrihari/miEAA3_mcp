# miEAA3_MCP - Hiwi Project

## 📝 miEAA3_mcp --- MCP Server Setup Summary

This document summarizes the steps taken to set up a working Model
Context Protocol (MCP) server named miEAA3_mcp using the GitHub repo
umutc/mcp-typescript, including installation, configuration, and
implementation of a custom MCP tool that calls the miEAA API.

## Git and local steup of template

    git clone git@github.com:umutc/mcp-typescript.git miEAA3_mcp
    cd miEAA3_mcp
    npm install

npm install downloads all necessary dependencies from package.json

## File strucutre

miEAA3_mcp/ ├── README.md ├── package.json ├── package-lock.json ├──
tsconfig.json ├── manifest.json ├── node_modules/ ├── dist/ │ ├──
server.js │ ├── server.js.map │ ├── server.d.ts │ ├── server.d.ts.map │
├── handlers/ │ │ ├── mieaa_mirna_handler.js │ │ ├──
mieaa_mirna_handler.js.map │ │ ├── mieaa_mirna_handler.d.ts │ │ ├──
mieaa_mirna_handler.d.ts.map │ │ ├── mieaa_precursor_handler.js │ │ ├──
mieaa_precursor_handler.js.map │ │ ├── mieaa_precursor_handler.d.ts │ │
└── mieaa_precursor_handler.d.ts.map │ └── utils/ │ ├── mieaa.js │ ├──
mieaa.js.map │ ├── mieaa.d.ts │ └── mieaa.d.ts.map └── src/ ├──
server.ts ├── handlers/ │ ├── mieaa_mirna_handler.ts │ └──
mieaa_precursor_handler.ts └── utils/ └── mieaa.ts

## miEAA MCP Server --- API Usage Summary

The miEAA MCP Server automates microRNA enrichment analysis using the
official REST API provided by the miRNA Enrichment Analysis and
Annotation Tool (miEAA), hosted by Saarland University.

## Base API Endpoint

https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/

## Enrichment Analysis Endpoints

### ORA

/enrichment_analysis/{species}/{input_type}/ORA/

### GSEA

/enrichment_analysis/{species}/{input_type}/GSEA/

Example payload:

    {
      "mirnas": [
        "hsa-miR-20b-5p",
        "hsa-miR-144-5p",
        "hsa-miR-17-5p",
        "hsa-miR-20a-5p",
        "hsa-miR-222-3p"
      ]
    }

## Asynchronous Job Workflow

1.  Submit Job\
2.  Poll Job\
3.  Retrieve Results

## Additional Endpoints

-   /enrichment_categories/{species}/{input_type}/
-   /mirbase_converter/
-   /mirna_precursor_converter/

## MCP Integration Example

    {
      species: "hsa",
      analysis_type: "ORA",
      input_type: "mirna",
      mirnas: [...]
    }

## Test File

Run:

    node test_mcp.js

## MCP Inspector

    npm install @modelcontextprotocol/inspector --save-dev
    npx @modelcontextprotocol/inspector

## Packaging

    zip -r mieaa3_mcp.dxt manifest.json package.json package-lock.json tsconfig.json src/
