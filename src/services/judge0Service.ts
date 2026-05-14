const BASE = import.meta.env.VITE_API_BASE_URL || "https://zeph-learn-backend.onrender.com";

export interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

export const judge0Service = {
  async submit(opts: {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
  }): Promise<Judge0Result> {
    const response = await fetch(`${BASE}/api/submissions/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: opts.source_code,
        languageId: String(opts.language_id),
        stdin: opts.stdin ?? "",
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      throw new Error(`Backend error: ${response.status} ${t.slice(0, 120)}`);
    }

    const data = await response.json();

    return {
      stdout: data.stdout ?? null,
      stderr: data.stderr ?? null,
      compile_output: data.stderr ?? null,
      status: { id: data.verdict === "Accepted" ? 3 : 4, description: data.verdict },
      time: data.executionTime ?? null,
      memory: data.memory ? Number(data.memory) : null,
    };
  },
};

export function verdictFromStatusId(id: number): string {
  switch (id) {
    case 3: return "Accepted";
    case 4: return "Wrong Answer";
    case 5: return "Time Limit Exceeded";
    case 6: return "Compilation Error";
    case 11:
    case 12: return "Runtime Error";
    case 7:
    case 8:
    case 9:
    case 10: return "Runtime Error";
    case 13:
    case 14: return "Internal Error";
    default: return "Pending";
  }
}
