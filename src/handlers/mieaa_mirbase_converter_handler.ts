function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class MiEAAMirBaseConverterHandler {
  async run(args: {
    mirnas: string[];
    from_version: string;
    to_version: string;
  }) {
    const { mirnas, from_version, to_version } = args;

    if (!mirnas?.length) {
      throw new Error("mirnas must be a non-empty array");
    }

    const url =
      "https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/mirbase_converter/";

    const params = new URLSearchParams();
    mirnas.forEach(m => params.append("mirnas", m));
    params.append("input_type", "mirna");
    params.append("mirbase_input_version", from_version);
    params.append("mirbase_output_version", to_version);

    let res: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      if (res.status !== 429) break;
      await sleep(1000 * attempt);
    }

    if (!res || !res.ok) {
      const errorText = await res?.text();
      throw new Error(
        `miRBase conversion failed (${res?.status}): ${errorText}`
      );
    }

    const text: string = await res.text();

    // API only returns problematic entries
    const apiResults = text
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line: string) => {
        const [input, output] = line.split(/\t+/);
        return { input, output: output ?? null };
      });

    // Normalize output for ALL inputs
    const conversions = mirnas.map(mirna => {
      const hit = apiResults.find(r => r.input === mirna);

      if (!hit) {
        return {
          input: mirna,
          output: mirna,
          status: "unchanged",
          reason: "miRNA name is identical across miRBase versions"
        };
      }

      if (hit.output === null) {
        return {
          input: mirna,
          output: null,
          status: "unmappable",
          reason:
            `No unambiguous miRBase mapping from ${from_version} to ${to_version}`
        };
      }

      return {
        input: mirna,
        output: hit.output,
        status: "converted",
        reason: `Renamed between miRBase ${from_version} and ${to_version}`
      };
    });

    // MCP tool result (clean + spec-correct)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ conversions })
        }
      ],
      structuredContent: {
        conversions
      }
    };
  }
}



// function sleep(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// export class MiEAAMirBaseConverterHandler {
//   async run(args: {
//     mirnas: string[];
//     from_version: string;
//     to_version: string;
//   }) {
//     const { mirnas, from_version, to_version } = args;

//     if (!mirnas?.length) {
//       throw new Error("mirnas must be a non-empty array");
//     }

//     const url =
//       "https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/mirbase_converter/";

//     const params = new URLSearchParams();
//     mirnas.forEach(m => params.append("mirnas", m));
//     params.append("input_type", "mirna");
//     params.append("mirbase_input_version", from_version);
//     params.append("mirbase_output_version", to_version);

//     let res: any = null;

//     for (let attempt = 1; attempt <= 3; attempt++) {
//       res = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded"
//         },
//         body: params.toString()
//       });

//       if (res.status !== 429) break;
//       await sleep(1000 * attempt);
//     }

//     if (!res || !res.ok) {
//       const errorText = await res?.text();
//       throw new Error(
//         `miRBase conversion failed (${res?.status}): ${errorText}`
//       );
//     }

//     const text: string = await res.text();

//     // --- API only returns problematic entries ---
//     const apiResults = text
//       .trim()
//       .split("\n")
//       .filter(Boolean)
//       .map((line: string) => {
//         const [input, output] = line.split(/\t+/);
//         return { input, output: output ?? null };
//       });

//     // --- Normalize output for ALL inputs ---
//     const conversions = mirnas.map(mirna => {
//       const hit = apiResults.find(r => r.input === mirna);

//       if (!hit) {
//         return {
//           input: mirna,
//           output: mirna,
//           status: "unchanged",
//           reason: "miRNA name is identical across miRBase versions"
//         };
//       }

//       if (hit.output === null) {
//         return {
//           input: mirna,
//           output: null,
//           status: "unmappable",
//           reason:
//             `No unambiguous miRBase mapping from ${from_version} to ${to_version}`
//         };
//       }

//       return {
//         input: mirna,
//         output: hit.output,
//         status: "converted",
//         reason: `Renamed between miRBase ${from_version} and ${to_version}`
//       };
//     });

//     return { conversions };
//   }
// }
