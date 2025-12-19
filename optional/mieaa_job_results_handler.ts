import fetch from "node-fetch";

export class MiEAAJobResultsHandler {
  async run(args: { job_id: string }) {
    const { job_id } = args;

    if (!job_id) {
      throw new Error("job_id is required");
    }

    const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/enrichment_analysis/results/${job_id}/`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch results (${res.status})`);
    }

    const data = await res.json();

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    };
  }
}
