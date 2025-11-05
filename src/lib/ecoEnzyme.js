// src/lib/ecoEnzyme.js

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request(path, { headers, ...options } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    const message =
      (payload &&
        typeof payload === "object" &&
        (payload.error || payload.message)) ||
      (typeof payload === "string" ? payload : null) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

// ==================== PROJECT APIs ====================

export async function fetchProjects(queryString = "") {
  const payload = await request(`/ecoenzim/projects${queryString}`);
  if (!payload) return { projects: [], pagination: null };
  if (Array.isArray(payload)) {
    return { projects: payload, pagination: null };
  }
  return {
    projects: Array.isArray(payload.projects) ? payload.projects : [],
    pagination: payload.pagination ?? null,
  };
}

export async function fetchProjectById(projectId) {
  return await request(`/ecoenzim/projects/${projectId}`);
}

export async function createProject(data) {
  return await request(`/ecoenzim/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function startProject(projectId) {
  return await request(`/ecoenzim/projects/${projectId}/start`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteProject(projectId) {
  return await request(`/ecoenzim/projects/${projectId}`, {
    method: "DELETE",
  });
}

// ==================== UPLOAD APIs ====================

export async function fetchAllUploads() {
  return await request(`/ecoenzim/uploads`);
}

export async function fetchUploadsByProject(projectId) {
  const payload = await request(`/ecoenzim/uploads/project/${projectId}`);
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.uploads)
  ) {
    return payload.uploads;
  }
  return payload;
}

export async function createUpload(data) {
  return await request(`/ecoenzim/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function verifyUpload(uploadId) {
  return await request(`/ecoenzim/uploads/${uploadId}/verify`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
}

// ==================== CLAIM APIs ====================

export async function claimPoints(projectId) {
  return await request(`/ecoenzim/projects/${projectId}/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}
