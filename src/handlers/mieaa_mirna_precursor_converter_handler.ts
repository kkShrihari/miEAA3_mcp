


// import fetch from "node-fetch";

// /**
//  * Sleep helper for retry logic (rate-limit handling)
//  */
// function sleep(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// export class MiEAAMirnaPrecursorConverterHandler {
//   async run(args: {
//     ids: string[];
//     direction: "mirna_to_precursor" | "precursor_to_mirna";
//   }) {
//     const { ids, direction } = args;

//     if (!ids || ids.length === 0) {
//       throw new Error("ids must be a non-empty array");
//     }

//     const url =
//       "https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/mirna_precursor_converter/";

//     /**
//      * miEAA web-form compatible mapping
//      * (IMPORTANT: these values are NOT documented in the API)
//      */
//     const input_type =
//       direction === "mirna_to_precursor"
//         ? "to_precursor"
//         : "to_mirna";

//     const params = new URLSearchParams();

//     // miEAA expects repeated "mirnas" fields
//     ids.forEach(id => params.append("mirnas", id));

//     params.append("input_type", input_type);
//     params.append("conversion_type", "all");
//     params.append("output_format", "tabsep");

//     let res: any = null;

//     // retry logic for HTTP 429
//     for (let attempt = 1; attempt <= 5; attempt++) {
//       res = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded"
//         },
//         body: params.toString()
//       });

//       if (res.status !== 429) break;
//       await sleep(1500 * attempt);
//     }

//     if (!res || !res.ok) {
//       const errorText = await res?.text();
//       throw new Error(
//         `Conversion failed (${res?.status}): ${errorText}`
//       );
//     }

//     /**
//      * miEAA returns PLAIN TEXT, not JSON
//      * Format:
//      *   input<TAB>output1;output2
//      */
//     const text: string = await res.text();

//     const input_label =
//       direction === "mirna_to_precursor" ? "mirna" : "precursor";

//     const output_label =
//       direction === "mirna_to_precursor" ? "precursor" : "mirna";

//     const results = text
//       .trim()
//       .split("\n")
//       .filter(Boolean)
//       .map((line: string) => {
//         const [input, output] = line.split(/\t+/);
//         return {
//           input,
//           output: output ? output.split(";") : []
//         };
//       });

//     return {
//       input_type: input_label,
//       output_type: output_label,
//       direction,
//       results
//     };
//   }
// }


import fetch from "node-fetch";

/**
 * Sleep helper for retry logic (rate-limit handling)
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class MiEAAMirnaPrecursorConverterHandler {
  async run(args: {
    ids: string[];
    direction: "mirna_to_precursor" | "precursor_to_mirna";
  }) {
    const { ids, direction } = args;

    if (!ids || ids.length === 0) {
      throw new Error("ids must be a non-empty array");
    }

    const url =
      "https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/mirna_precursor_converter/";

    /**
     * miEAA web-form compatible mapping
     * (IMPORTANT: these values are NOT documented in the API)
     */
    const input_type =
      direction === "mirna_to_precursor"
        ? "to_precursor"
        : "to_mirna";

    const params = new URLSearchParams();

    // miEAA expects repeated "mirnas" fields
    ids.forEach(id => params.append("mirnas", id));

    params.append("input_type", input_type);
    params.append("conversion_type", "all");
    params.append("output_format", "tabsep");

    let res: any = null;

    // retry logic for HTTP 429
    for (let attempt = 1; attempt <= 5; attempt++) {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      if (res.status !== 429) break;
      await sleep(1500 * attempt);
    }

    if (!res || !res.ok) {
      const errorText = await res?.text();
      throw new Error(
        `Conversion failed (${res?.status}): ${errorText}`
      );
    }

    /**
     * miEAA returns PLAIN TEXT, not JSON
     * Format:
     *   input<TAB>output1;output2
     */
    const text: string = await res.text();

    const input_label =
      direction === "mirna_to_precursor" ? "mirna" : "precursor";

    const output_label =
      direction === "mirna_to_precursor" ? "precursor" : "mirna";

    const results = text
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line: string) => {
        const [input, output] = line.split(/\t+/);
        return {
          input,
          output: output ? output.split(";") : []
        };
      });

    const payload = {
      input_type: input_label,
      output_type: output_label,
      direction,
      results
    };

    // MCP tool result (clean + spec-correct)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(payload)
        }
      ],
      structuredContent: payload
    };
  }
}
