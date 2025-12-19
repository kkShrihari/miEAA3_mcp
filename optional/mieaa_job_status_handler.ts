// import fetch from "node-fetch";

// export class MiEAAJobStatusHandler {
//   async run(args: { job_id: string }) {
//     const { job_id } = args;

//     if (!job_id) {
//       throw new Error("job_id is required");
//     }

//     const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/job_status/${job_id}/`;

//     const res = await fetch(url);
//     if (!res.ok) {
//       throw new Error(`Failed to fetch job status (${res.status})`);
//     }

//     const data = await res.json();

//     return {
//       content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
//     };
//   }
// }

import fetch from "node-fetch";

/**
 * miEAA job status response structure
 */
interface MiEAAJobStatusResponse {
  status: number;
}

export class MiEAAJobStatusHandler {
  async run(args: { job_id: string }) {
    const { job_id } = args;

    if (!job_id) {
      throw new Error("job_id is required");
    }

    const url = `https://ccb-compute2.cs.uni-saarland.de/mieaa/api/v1/job_status/${job_id}/`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch job status (${res.status})`);
    }

    // ✅ Explicitly type the API response
    const data = (await res.json()) as MiEAAJobStatusResponse;

    let status_label: string;
    switch (data.status) {
      case 0:
        status_label = "running";
        break;
      case 1:
        status_label = "finished";
        break;
      case -1:
        status_label = "failed";
        break;
      default:
        status_label = "unknown";
    }

    return {
      job_id,
      status_code: data.status,
      status: status_label
    };
  }
}
