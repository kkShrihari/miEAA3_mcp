// import fetch from "node-fetch";

// /**
//  * Forces strict JSON serialization.
//  */
// function toClaudeJSON<T>(obj: T): T {
//   return JSON.parse(JSON.stringify(obj));
// }

// export class MiEAACategoriesHandler {
//   async run(args: {
//     species: string;
//     entity: "mirna" | "precursor";
//   }) {
//     const { species, entity } = args;

//     if (!species || !entity) {
//       throw new Error("species and entity are required");
//     }

//     const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_categories/${species}/${entity}/`;

//     const res = await fetch(url);

//     if (!res.ok) {
//       throw new Error(`Failed to fetch categories (${res.status})`);
//     }

//     const contentType = res.headers.get("content-type") ?? "";
//     if (!contentType.includes("application/json")) {
//       const text = await res.text();
//       throw new Error(
//         "miEAA returned non-JSON response: " + text.slice(0, 200)
//       );
//     }

//     const data: any = await res.json();

//     let rawCategories: any[];

//     if (Array.isArray(data.categories)) {
//       rawCategories = data.categories;
//     } else if (Array.isArray(data.cat)) {
//       rawCategories = data.cat;
//     } else {
//       throw new Error("Unexpected API response format: categories not found");
//     }

//     const categories = rawCategories.map(
//       ([category, description]: [string, string]) => ({
//         category: String(category),
//         description: String(description)
//       })
//     );

//     // ✅ REQUIRED for Claude
//     return toClaudeJSON({
//       content: [
//         {
//           type: "json",
//           json: {
//             categories
//           }
//         }
//       ]
//     });
//   }
// }

import fetch from "node-fetch";

export class MiEAACategoriesHandler {
  async run(args: {
    species: string;
    entity: "mirna" | "precursor";
  }) {
    const { species, entity } = args;

    if (!species || !entity) {
      throw new Error("species and entity are required");
    }

    const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_categories/${species}/${entity}/`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch categories (${res.status})`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        "miEAA returned non-JSON response: " + text.slice(0, 200)
      );
    }

    const data: any = await res.json();

    let rawCategories: any[];

    if (Array.isArray(data.categories)) {
      rawCategories = data.categories;
    } else if (Array.isArray(data.cat)) {
      rawCategories = data.cat;
    } else {
      throw new Error("Unexpected API response format: categories not found");
    }

    // Extract ONLY category names
    const categories = rawCategories.map(
      ([category]: [string, string]) => String(category)
    );

    // MCP tool result (spec-correct)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ categories })
        }
      ],
      structuredContent: {
        categories
      }
    };
  }
}
