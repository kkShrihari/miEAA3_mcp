# miEAA3_MCP

An MCP (Model Context Protocol) server that integrates the **miEAA 3.x REST API** with **Claude Desktop**, exposing miEAA functionality as callable tools for microRNA and precursor enrichment analysis.

---

## Introduction

`miEAA3_MCP` provides a clean integration layer between **Claude Desktop** and the **miEAA bioinformatics platform**.  
The server is implemented in **TypeScript**, bundled as a single **Node.js ESM** entry point, and registered with Claude via MCP.

The project focuses on:
- Correct MCP protocol integration
- Robust request/response normalization
- Reliable execution of miEAA tools inside Claude Desktop

No biological logic is reimplemented; all analysis is performed by the official miEAA API.

---

## Repository Structure

```
miEAA3_mcp/
├── README.md
├── manifest.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── dist/
│ ├── server.js
│ └── handlers/
│ ├── mieaa_categories_handler.js
│ ├── mieaa_mirna_precursor_converter_handler.js
│ ├── mieaa_mirbase_converter_handler.js
│ └── over_representation_analysis_handler.js
├── src/
│ ├── server.ts
│ ├── handlers/
│ │ ├── mieaa_categories_handler.ts
│ │ ├── mieaa_mirna_precursor_converter_handler.ts
│ │ ├── mieaa_mirbase_converter_handler.ts
│ │ └── over_representation_analysis_handler.ts
│ └── utils/
│ └── mieaa.ts
├── test.mjs
└── miEAA3_mcp.dxt
```

---

## Integrated Tools (Claude MCP)

The following **four miEAA tools are integrated, registered, and visible in Claude Desktop**:

### 1. Over-Representation Analysis (ORA)
**Tool:** `over_representation_analysis`

- Runs miEAA ORA for miRNA or precursor inputs
- Handles job submission, polling, and result retrieval
- Supports category-based enrichment analysis

---

### 2. List Enrichment Categories
**Tool:** `list_enrichment_categories`

- Queries available enrichment categories from miEAA
- Intended to guide category selection for ORA

---

### 3. miRNA ↔ Precursor Converter
**Tool:** `mirna_precursor_converter`

- Converts between miRNA and precursor identifiers
- Handles miEAA rate limits
- Normalizes plain-text API responses into structured output

---

### 4. miRBase Version Converter
**Tool:** `mirbase_version_converter`

- Converts miRNA identifiers between miRBase versions
- Explicitly reports converted, unchanged, and unmappable entries

---

## Environment Setup

### Prerequisites
- Node.js ≥ 18
- npm

Install dependencies:

```bash
npm install
```

---

## Build Process

The MCP server must be bundled into a **single ESM-compatible file** for Claude Desktop.

```bash
npx esbuild src/server.ts   --bundle   --platform=node   --format=esm   --target=node18   --outfile=dist/server.js   --log-level=debug
```

### Why this build step is required

- Bundles all handlers and utilities into one file
- Ensures compatibility with Claude’s Node runtime
- Resolves MCP SDK and module resolution issues

---

## Claude Desktop Integration

- The MCP server is correctly discovered and launched by Claude Desktop
- Extension folder detection issues are resolved
- MCP SDK resolution issues are resolved by the current build setup
- All four tools appear as callable tools inside Claude

No manual server startup is required when using Claude Desktop.

---

## Local Testing

```bash
node test.mjs
```

All tools execute correctly in a local Node.js environment.

---

## MCP Inspector

For protocol-level inspection and debugging:

```bash
npm install @modelcontextprotocol/inspector --save-dev
npx @modelcontextprotocol/inspector
```

- Install prerequisites: Node.js ≥ 18, npm, and Claude Desktop
- Clone or open the `miEAA3_mcp` project directory
- Install dependencies:
  
  ```bash
  npm install
  
Build the MCP server into a single ESM file:
# Linux / WSL
npx esbuild src/server.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --target=node18 \
  --outfile=dist/server.js
powershell
Copy code
# Windows (PowerShell)
npx esbuild src/server.ts `
  --bundle `
  --platform=node `
  --format=esm `
  --target=node18 `
  --outfile=dist/server.js
  
Create the Claude extension package (.dxt) or use existing one in git:
zip -r miEAA3_mcp.dxt \
  manifest.json \
  package.json \
  package-lock.json \
  tsconfig.json \
  dist \
  -x "*.ts" "*.map" "*.log"
  
Open Claude Desktop → Settings → Advanced → Install Extension
Select the generated miEAA3_mcp.dxt file (from windows)
Open a new Claude chat and use the miEAA tools directly (no manual server start required)

---

## Current Issue
At the moment, I am refining the result formatting, so the outputs are more structured and easier to use by user, while remaining MCP-compatible. The miEAA server was temporarily down during testing, but I expect to complete this today once it is reachable again.

One issue I encountered is that GSEA analysis has API endpoints but expects a different input format that is not documented on the miEAA website, which currently prevents successful execution. All other API-based tools are working as expected.

---
