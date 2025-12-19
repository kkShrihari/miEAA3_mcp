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
│   └── server.js
├── src/
│   ├── server.ts
│   ├── handlers/
│   │   ├── mieaa_categories_handler.ts
│   │   ├── mieaa_mirna_precursor_converter_handler.ts
│   │   ├── mieaa_mirbase_converter_handler.ts
│   │   └── over_representation_analysis_handler.ts
│   └── utils/
│       └── mieaa.ts
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

---

## Current Known Issue (Claude Tool Response Format)

Although the MCP server is correctly installed and accepted by Claude Desktop, there is a known issue with the following tool:

**Tool:** `list_enrichment_categories`

Claude reports:

> “It seems there's an issue with the tool response format. The miEAA tool is available but appears to be having technical difficulties returning the enrichment categories at the moment.”

### Explanation

- The miEAA API response is valid JSON
- The same handler works correctly in a local Node.js environment
- The issue occurs due to **Claude MCP runtime constraints on tool response formats**

---
<img width="1180" height="656" alt="image" src="https://github.com/user-attachments/assets/dfeb4fc1-ae69-4fb5-a268-2588e7031b35" />
<img width="1165" height="450" alt="image" src="https://github.com/user-attachments/assets/4fcc3782-6892-401b-a616-2a528ce48ff3" />
<img width="969" height="657" alt="image" src="https://github.com/user-attachments/assets/ab360074-8887-4fae-9e20-557c0e5a4f99" />
<img width="1016" height="555" alt="image" src="https://github.com/user-attachments/assets/373d2af9-7814-4fa1-8ead-d43a319458d1" />

