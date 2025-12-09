# miEAA3_MCP – Hiwi Project

## 📝 miEAA_mcp — MCP Server Setup Summary

This document summarizes the setup and implementation of an MCP server (`miEAA3_mcp`) based on the GitHub template **umutc/mcp-typescript**.  
The server integrates with the official **miEAA REST API** for microRNA enrichment analysis, supporting ORA and precursor-based workflows.

---

## 🔧 Git and Local Setup

```bash
git clone git@github.com:umutc/mcp-typescript.git miEAA3_mcp
cd miEAA3_mcp
npm install
```

`npm install` downloads all dependencies from **package.json**.

---

## 📁 File Structure

```txt
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
```

---

## 🌐 miEAA MCP Server — API Usage Summary

The server communicates with the **official miEAA REST API**, supporting:  
- ORA & GSEA  
- Category metadata  
- Job submission & polling  
- Result retrieval  

---

## 🔬 Enrichment Analysis Endpoints

### ORA  
```
/enrichment_analysis/{species}/{input_type}/ORA/
```

### GSEA  
```
/enrichment_analysis/{species}/{input_type}/GSEA/
```

Example payload:
```json
{
  "mirnas": [
    "hsa-miR-20b-5p",
    "hsa-miR-144-5p",
    "hsa-miR-17-5p",
    "hsa-miR-20a-5p",
    "hsa-miR-222-3p"
  ]
}
```

---

## ⏳ Job Workflow

1. **Submit Job** → returns `job_id`  
2. **Poll Status**  
3. **Retrieve Results**

---

## 🧬 GSEA Result Fields

| Field | Meaning |
|-------|---------|
| category | Source database |
| term | Functional annotation |
| running_sum | Enrichment curve |
| es | Enrichment score |
| p_value | Raw p-value |
| adj_p_value | Corrected p-value |
| q_value | FDR |
| observed | Observed hits |
| mirnas | Contributing miRNAs |

⚠ Backend currently does **not serialize GSEA JSON** → pending.

---

## 🧪 Local Testing

```bash
node test_mcp.js
```

Results:  
✔ ORA + miRNA → success  
✔ ORA + precursor → success  
⚠ GSEA → pending  

---

## 🖥 MCP Inspector

Install:
```bash
npm install @modelcontextprotocol/inspector --save-dev
```

Run:
```bash
npx @modelcontextprotocol/inspector
```

---

## 📦 Packaging for Claude

```bash
zip -r mieaa3_mcp.dxt manifest.json package.json package-lock.json tsconfig.json src/
```

---

## 🚧 Current Status

Claude temporarily unavailable — API disruptions observed.

---
