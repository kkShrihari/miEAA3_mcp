---
title: miEAA3_mcp

---

# miEAA3_MCP - Hiwi Project

## 📝 miEAA3_mcp — MCP Server Setup Summary

This document summarizes the steps taken to set up a working Model Context Protocol (MCP) server named miEAA3_mcp using the GitHub repo umutc/mcp-typescript, including installation, configuration, and implementation of a custom MCP tool that calls the miEAA API.


## Git and local steup of template
```
git clone git@github.com:umutc/mcp-typescript.git miEAA3_mcp
cd miEAA3_mcp
npm install
```

npm install downloads all necessary dependencies from package.json
![image](https://hackmd.io/_uploads/SJFxs8eMZg.png)


## File strucutre

miEAA3_mcp/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── manifest.json
├── node_modules/
├── dist/
│   ├── server.js
│   ├── server.js.map
│   ├── server.d.ts
│   ├── server.d.ts.map
│   ├── handlers/
│   │   ├── mieaa_mirna_handler.js
│   │   ├── mieaa_mirna_handler.js.map
│   │   ├── mieaa_mirna_handler.d.ts
│   │   ├── mieaa_mirna_handler.d.ts.map
│   │   ├── mieaa_precursor_handler.js
│   │   ├── mieaa_precursor_handler.js.map
│   │   ├── mieaa_precursor_handler.d.ts
│   │   └── mieaa_precursor_handler.d.ts.map
│   └── utils/
│       ├── mieaa.js
│       ├── mieaa.js.map
│       ├── mieaa.d.ts
│       └── mieaa.d.ts.map
└── src/
    ├── server.ts
    ├── handlers/
    │   ├── mieaa_mirna_handler.ts
    │   └── mieaa_precursor_handler.ts
    └── utils/
        └── mieaa.ts


## miEAA MCP Server — API Usage Summary
The miEAA MCP Server automates microRNA enrichment analysis using the official REST API provided by the miRNA Enrichment Analysis and Annotation Tool (miEAA), hosted by Saarland University. This tool does not use scraping and relies only on documented API endpoints.

## Base API Endpoint
https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/

This endpoint provides:
- enrichment analysis (ORA / GSEA)
- category metadata
- job submission & polling
- result retrieval

## Enrichment Analysis Endpoints
The MCP tool supports the official miEAA analysis modes:

### ORA (Over-Representation Analysis)
 /enrichment_analysis/{species}/{input_type}/ORA/

### GSEA (Gene Set Enrichment Analysis)
 /enrichment_analysis/{species}/{input_type}/GSEA/

Parameters:
- species: hsa, mmu, rno, etc.
- input_type: mirna or precursor
- analysis_type: ORA or GSEA
- mirnas: list of microRNA IDs

Example request path:
 POST /enrichment_analysis/hsa/mirna/ORA/

Example payload (not in JSON block for visibility):
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
miEAA uses asynchronous processing. The MCP tool implements the 3-step workflow:

### 1. Submit Job
 POST /enrichment_analysis/{species}/{input_type}/{analysis_type}/
Response:
 { "job_id": "xxxx-xxxx-xxxx" }

### 2. Poll Job Status
 GET /job_status/{job_id}/
Possible values: queued, running, finished, failed.

### 3. Retrieve Results
 GET `/enrichment_analysis/results/{job_id}/`

 🧬 GSEA Result Fields

GSEA results contain statistical and enrichment-curve information.  
Each returned record provides:

| Field        | Meaning                                            |
|--------------|----------------------------------------------------|
| `category`   | Category name (database source, e.g., GO, KEGG)    |
| `term`       | Specific functional annotation                     |
| `running_sum`| Running enrichment score curve                     |
| `enrichment` | Enrichment direction (`"enriched"` or `"depleted"`)|
| `es`         | Enrichment Score (ES)                              |
| `p_value`    | Raw p-value                                        |
| `adj_p_value`| Corrected p-value after multiplicity correction    |
| `q_value`    | False Discovery Rate (FDR)                         |
| `observed`   | Number of observed hits in the category            |
| `mirnas`     | List of contributing miRNAs (hit list)             |



## Additional Supported Endpoints

### Category Metadata
 /enrichment_categories/{species}/{input_type}/

### ID Conversion Tools
 /mirbase_converter/
 /mirna_precursor_converter/

These provide ID normalization and annotation utilities.

## No Scraping — Only Official API Usage
The MCP server:
- does not scrape HTML
- does not crawl pages
- does not bypass protections
- uses only official REST endpoints

This ensures compliance and reproducibility.

## MCP Tool Integration
The MCP exposes an MCP tool "mieaa_analysis" wrapping the full workflow.

Example argument object (text format):
{
  species: "hsa",
  analysis_type: "ORA",
  input_type: "mirna",
  mirnas: [
    "hsa-miR-20b-5p",
    "hsa-miR-144-5p",
    "hsa-miR-17-5p",
    "hsa-miR-20a-5p",
    "hsa-miR-222-3p"
  ]
}

## Summary
The miEAA MCP Server integrates miEAA’s ORA and GSEA workflows into the Model Context Protocol (MCP) for miRNA . It automates job submission, job tracking, and result retrieval using only official REST API endpoints, ensuring safe, compliant, and reproducible microRNA enrichment analysis without scraping.


---
## Test file created for local testing

Place this file in folder miEAA3_mcp and run the code
`node test_mcp.js`
case1: ORA + mirna -> 32 categories gives top 10 results each [success]

case2: GSEA + mirna -> 32 categories gives top 10 results each [Pending]
[Issue]:This  backend does not serialize GSEA results into the public JSON API

case3: ORA + miRNA precursor -> 32 categories gives top 10 results each [success]

case4: GSEA + mirna precursor -> 32 categories gives top 10 results each [Pending]
[Issue]:This  backend does not serialize GSEA results into the public JSON API

## Connecting to MCP inspector
1) Install MCP inspector
`npm install @modelcontextprotocol/inspector --save-dev
`
2) Start it
`npx @modelcontextprotocol/inspector`

![image](https://hackmd.io/_uploads/H1aVTj4fZx.png)
![image](https://hackmd.io/_uploads/B1aB6jEGZe.png)
![image](https://hackmd.io/_uploads/BkadTiVM-g.png)
![image](https://hackmd.io/_uploads/rJ7ty3VG-g.png)
![image](https://hackmd.io/_uploads/rkgqynVG-x.png)
[Issue:]-> miEAA server down so result: success but no output 


## Compressing as dxt for claude
`zip -r mieaa3_mcp.dxt manifest.json package.json package-lock.json tsconfig.json src/`


## MCP Inspector check:
[case 1]: mirna+ ORA
![image](https://hackmd.io/_uploads/rycocrrfZg.png)
![image](https://hackmd.io/_uploads/rJFp9rBzWl.png)

[case 2]: Precursor + ORA
![image](https://hackmd.io/_uploads/rJagnrHzZx.png)
![image](https://hackmd.io/_uploads/S17f2HHGWe.png)


# Currently ->
> Claude will return soon
> Claude is currently experiencing a temporary service disruption. We’re working on it, please check back soon.
>  
> 
![image](https://hackmd.io/_uploads/ByGur6NfZg.png)


