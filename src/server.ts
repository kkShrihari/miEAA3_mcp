// ------------------------------------------------------
//  FORCE EXTENSION ROOT AS WORKING DIRECTORY
// ------------------------------------------------------
import path from "path";
import { fileURLToPath } from "url";

// Resolve the absolute path of this file (dist/server.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force Node to treat /dist as current working directory
process.chdir(__dirname);


import { MiEAACategoriesHandler } from "./handlers/mieaa_categories_handler.js";
import { MiEAAMirnaPrecursorConverterHandler } from "./handlers/mieaa_mirna_precursor_converter_handler.js";
import { MiEAAMirBaseConverterHandler } from "./handlers/mieaa_mirbase_converter_handler.js";
import { OverRepresentationAnalysisHandler } from "./handlers/over_representation_analysis_handler.js";

console.error(">>> RUNNING dist/server.js <<<");

//------------------------------------------------------
// ERROR HANDLING
//------------------------------------------------------
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

console.error("SERVER ENTRY REACHED");

//------------------------------------------------------
// MCP SERVER BOOTSTRAP
//------------------------------------------------------
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

//------------------------------------------------------
// Instantiate tool handlers
//------------------------------------------------------
const oraTool = new OverRepresentationAnalysisHandler();
const categoryTool = new MiEAACategoriesHandler();
const mirnaPrecursorTool = new MiEAAMirnaPrecursorConverterHandler();
const mirbaseTool = new MiEAAMirBaseConverterHandler();

//------------------------------------------------------
// CREATE MCP SERVER INSTANCE
//------------------------------------------------------
const server = new Server(
  {
    name: "miEAA3_mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      sampling: {},
      roots: {},
    },
  }
);

//------------------------------------------------------
// INITIALIZE
//------------------------------------------------------
server.setRequestHandler(InitializeRequestSchema, async () => {
  console.error("Initialize handler invoked");

  return {
    protocolVersion: "2025-06-18",
    serverInfo: {
      name: "miEAA3_mcp",
      version: "1.0.0",
    },
    capabilities: {
      tools: { list: true, call: true },
      sampling: {},
      roots: {},
    }
  };
});

//------------------------------------------------------
// TOOL LIST
//------------------------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [

      // -------------------------------------------------
      // TOOL 1 — OVER-REPRESENTATION ANALYSIS (ORA)
      // -------------------------------------------------
      {
        name: "over_representation_analysis",
        description: "Run miEAA over-representation analysis (ORA) for miRNA or precursor.",
        inputSchema: {
          type: "object",
          properties: {
            species: { type: "string" },
            entity: { type: "string", enum: ["mirna", "precursor"] },
            ids: { type: "array", items: { type: "string" } },
            category_selection: { type: "string" },
            reference_set: { type: "array", items: { type: "string" } },
            p_adjust: { type: "string" },
            p_scope: { type: "string" },
            alpha: { type: "number" },
            min_hits: { type: "number" }
          },
          required: ["species", "entity", "ids"]
        }
      },

      // -------------------------------------------------
      // LIST ENRICHMENT CATEGORIES
      // -------------------------------------------------
      {
        name: "list_enrichment_categories",
        description: "List available miEAA enrichment categories for a species.",
        inputSchema: {
          type: "object",
          properties: {
            species: { type: "string" },
            entity: { type: "string", enum: ["mirna", "precursor"] }
          },
          required: ["species", "entity"]
        }
      },

      // -------------------------------------------------
      // miRNA ↔ PRECURSOR CONVERTER
      // -------------------------------------------------
      {
        name: "mirna_precursor_converter",
        description: "Convert between miRNA names and precursor names.",
        inputSchema: {
          type: "object",
          properties: {
            input: { type: "array", items: { type: "string" } },
            direction: {
              type: "string",
              enum: ["mirna_to_precursor", "precursor_to_mirna"]
            }
          },
          required: ["input", "direction"]
        }
      },

      // -------------------------------------------------
      // miRBASE VERSION CONVERTER
      // -------------------------------------------------
      {
        name: "mirbase_version_converter",
        description: "Convert miRNA identifiers between miRBase versions.",
        inputSchema: {
          type: "object",
          properties: {
            mirnas: { type: "array", items: { type: "string" } },
            source_version: { type: "string" },
            target_version: { type: "string" }
          },
          required: ["mirnas", "source_version", "target_version"]
        }
      }
    ]
  };
});

//------------------------------------------------------
// TOOL EXECUTION ROUTER
//------------------------------------------------------
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params as {
    name: string;
    arguments: Record<string, unknown>;
  };

  try {
    if (!args || typeof args !== "object") {
      throw new Error("Tool arguments are required");
    }

    // --------------------------------------------------
    // ORA TOOL
    // --------------------------------------------------
    if (name === "over_representation_analysis") {
      return await oraTool.run(args as any);
    }

    // --------------------------------------------------
    // CATEGORY LIST
    // --------------------------------------------------
    if (name === "list_enrichment_categories") {
      return await categoryTool.run(args as {
        species: string;
        entity: "mirna" | "precursor";
      });
    }

    // --------------------------------------------------
    // miRNA ↔ PRECURSOR CONVERTER
    // --------------------------------------------------
    if (name === "mirna_precursor_converter") {
      return await mirnaPrecursorTool.run({
        ids: (args as any).input,
        direction: (args as any).direction
      });
    }

    // --------------------------------------------------
    // miRBASE VERSION CONVERTER
    // --------------------------------------------------
    if (name === "mirbase_version_converter") {
      return await mirbaseTool.run({
        mirnas: (args as any).mirnas,
        from_version: (args as any).source_version,
        to_version: (args as any).target_version
      });
    }

    throw new Error(`Unknown tool: ${name}`);

  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `MCP Tool Error: ${err.message || String(err)}`
        }
      ]
    };
  }
});

//------------------------------------------------------
// SERVER STARTUP
//------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server connected");
}

main().catch(err => {
  console.error("FATAL:", err);
});

// KEEP NODE ALIVE
setInterval(() => {}, 1 << 30);
