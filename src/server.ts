// #!/usr/bin/env node

// import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// import {
//   CallToolRequestSchema,
//   ListToolsRequestSchema,
// } from "@modelcontextprotocol/sdk/types.js";

// import { MiEAAMirnaHandler } from "./handlers/mieaa_mirna_handler.js";
// import { MiEAAPrecursorHandler } from "./handlers/mieaa_precursor_handler.js";

// // -----------------------------
// // Instantiate tools
// // -----------------------------
// const mirnaTool = new MiEAAMirnaHandler();
// const precursorTool = new MiEAAPrecursorHandler();

// // -----------------------------
// // MCP SERVER
// // -----------------------------
// const server = new Server(
//   {
//     name: "miEAA3_mcp",
//     version: "1.0.0",
//   },
//   {
//     capabilities: {
//       tools: {},
//     },
//   }
// );

// // -----------------------------
// // TOOL LISTING
// // -----------------------------
// server.setRequestHandler(ListToolsRequestSchema, async () => {
//   return {
//     tools: [
//       {
//         name: "mieaa_mirna",
//         description: "Run miRNA ORA or GSEA enrichment using miEAA API.",
//         inputSchema: {
//           type: "object",
//           properties: {
//             species: { type: "string" },
//             analysis_type: { type: "string", enum: ["ORA", "GSEA"] },
//             mirnas: { type: "array", items: { type: "string" } },
//             category_selection: { type: "string" },
//             reference_set: { type: "array", items: { type: "string" } },
//             p_adjust: { type: "string" },
//             p_scope: { type: "string" },
//             alpha: { type: "number" },
//             min_hits: { type: "number" },
//           },
//           required: ["species", "analysis_type", "mirnas"],
//         },
//       },

//       {
//         name: "mieaa_precursor",
//         description: "Run precursor ORA or GSEA enrichment using miEAA API.",
//         inputSchema: {
//           type: "object",
//           properties: {
//             species: { type: "string" },
//             analysis_type: { type: "string", enum: ["ORA", "GSEA"] },
//             precursors: { type: "array", items: { type: "string" } },
//             category_selection: { type: "string" },
//             reference_set: { type: "array", items: { type: "string" } },
//             p_adjust: { type: "string" },
//             p_scope: { type: "string" },
//             alpha: { type: "number" },
//             min_hits: { type: "number" },
//           },
//           required: ["species", "analysis_type", "precursors"],
//         },
//       },
//     ],
//   };
// });

// // -----------------------------
// // TOOL EXECUTION
// // -----------------------------
// server.setRequestHandler(CallToolRequestSchema, async (request) => {
//   const { name, arguments: args } = request.params;

//   try {
//     switch (name) {
//       case "mieaa_mirna":
//         return await mirnaTool.runAnalysis(args);

//       case "mieaa_precursor":
//         return await precursorTool.runAnalysis(args);

//       default:
//         throw new Error(`Unknown tool: ${name}`);
//     }
//   } catch (err: any) {
//     return {
//       isError: true,
//       content: [
//         {
//           type: "text",
//           text: `❌ MCP Tool error: ${err?.message || err}`,
//         },
//       ],
//     };
//   }
// });

// // -----------------------------
// // SERVER START
// // -----------------------------
// async function main() {
//   const transport = new StdioServerTransport();
//   await server.connect(transport);
//   console.error("🚀 miEAA MCP server running (stdio mode)");
// }

// // ESM direct-run check
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);

// if (process.argv[1] === __filename) {
//   main().catch((err) => {
//     console.error("Fatal server error:", err);
//     process.exit(1);
//   });
// }

// // Graceful shutdown
// process.on("SIGINT", () => {
//   console.error("👋 Shutting down miEAA MCP server...");
//   process.exit(0);
// });
// process.on("SIGTERM", () => {
//   console.error("👋 Shutting down miEAA MCP server...");
//   process.exit(0);
// });


//------------------------------------------------------
// MCP SERVER BOOTSTRAP
//------------------------------------------------------
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { MiEAAMirnaHandler } from "./handlers/mieaa_mirna_handler.js";
import { MiEAAPrecursorHandler } from "./handlers/mieaa_precursor_handler.js";

//------------------------------------------------------
// Instantiate tool handlers
//------------------------------------------------------
const mirnaTool = new MiEAAMirnaHandler();
const precursorTool = new MiEAAPrecursorHandler();

//------------------------------------------------------
// MCP SERVER DECLARATION
//------------------------------------------------------
const server = new Server(
  {
    name: "miEAA3_mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

//------------------------------------------------------
// TOOL LIST
//------------------------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "mieaa_mirna",
        description: "Run miRNA ORA or GSEA enrichment using the miEAA API.",
        inputSchema: {
          type: "object",
          properties: {
            species: { type: "string" },
            analysis_type: { type: "string", enum: ["ORA", "GSEA"] },
            mirnas: { type: "array", items: { type: "string" } },
            category_selection: { type: "string" },
            reference_set: { type: "array", items: { type: "string" } },
            p_adjust: { type: "string" },
            p_scope: { type: "string" },
            alpha: { type: "number" },
            min_hits: { type: "number" }
          },
          required: ["species", "analysis_type", "mirnas"],
        },
      },

      {
        name: "mieaa_precursor",
        description: "Run precursor ORA enrichment using the miEAA API.",
        inputSchema: {
          type: "object",
          properties: {
            species: { type: "string" },
            analysis_type: { type: "string", enum: ["ORA", "GSEA"] },
            precursors: { type: "array", items: { type: "string" } },
            category_selection: { type: "string" },
            reference_set: { type: "array", items: { type: "string" } },
            p_adjust: { type: "string" },
            p_scope: { type: "string" },
            alpha: { type: "number" },
            min_hits: { type: "number" }
          },
          required: ["species", "analysis_type", "precursors"],
        },
      },
    ],
  };
});

//------------------------------------------------------
// TOOL EXECUTION HANDLER
//------------------------------------------------------
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  try {
    if (name === "mieaa_mirna") {
      return await mirnaTool.runAnalysis(args);
    }

    if (name === "mieaa_precursor") {
      return await precursorTool.runAnalysis(args);
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `MCP Tool Error: ${err?.message || String(err)}`,
        },
      ],
    };
  }
});

//------------------------------------------------------
// SERVER STARTUP
//------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("miEAA MCP server started");
}

// Allow direct execution (node dist/server.js)
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main().catch((err) => {
    console.error("Fatal server error:", err);
    process.exit(1);
  });
}

//------------------------------------------------------
// GRACEFUL SHUTDOWN
//------------------------------------------------------
process.on("SIGINT", () => {
  console.error("Server shutdown: SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("Server shutdown: SIGTERM");
  process.exit(0);
});
