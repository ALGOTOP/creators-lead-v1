const api = {
  async search(payload) {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Search failed");
    return data;
  },

  async listLeads(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/leads${qs ? "?" + qs : ""}`);
    if (!res.ok) throw new Error("Failed to load leads");
    return res.json();
  },

  async updateLead(id, patch) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to update lead");
    return res.json();
  },

  async scoreLead(id) {
    const res = await fetch(`/api/leads/${id}/score`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Scoring failed");
    return data;
  },

  async deleteLead(id) {
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error("Failed to delete lead");
  },

  async getOutreachEmail(id) {
    const res = await fetch(`/api/leads/${id}/outreach-email`);
    if (!res.ok) throw new Error("Failed to build email");
    return res.json();
  },

  async dashboardStats() {
    const res = await fetch("/api/stats/dashboard");
    if (!res.ok) throw new Error("Failed to load dashboard");
    return res.json();
  },
};
