// src/lib/ecoEnzyme.js

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ==================== PROJECT APIs ====================

export async function fetchProjects(queryString = "") {
  const res = await fetch(`${API_BASE}/ecoenzim/projects${queryString}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return await res.json();
}

export async function fetchProjectById(projectId) {
  const res = await fetch(`${API_BASE}/ecoenzim/projects/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return await res.json();
}

export async function createProject(data) {
  const res = await fetch(`${API_BASE}/ecoenzim/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create project");
  }
  return await res.json();
}

export async function startProject(projectId) {
  const res = await fetch(`${API_BASE}/ecoenzim/projects/${projectId}/start`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to start project");
  }
  return await res.json();
}

export async function deleteProject(projectId) {
  const res = await fetch(`${API_BASE}/ecoenzim/projects/${projectId}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete project");
  }
  return await res.json();
}

// ==================== UPLOAD APIs ====================

export async function fetchAllUploads() {
  const res = await fetch(`${API_BASE}/ecoenzim/uploads`);
  if (!res.ok) throw new Error("Failed to fetch uploads");
  return await res.json();
}

export async function fetchUploadsByProject(projectId) {
  const res = await fetch(`${API_BASE}/ecoenzim/uploads/project/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch uploads");
  return await res.json();
}

export async function createUpload(data) {
  const res = await fetch(`${API_BASE}/ecoenzim/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create upload");
  }
  return await res.json();
}

export async function verifyUpload(uploadId) {
  const res = await fetch(`${API_BASE}/ecoenzim/uploads/${uploadId}/verify`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to verify upload");
  }
  return await res.json();
}

// ==================== CLAIM APIs ====================

export async function claimPoints(projectId) {
  const res = await fetch(`${API_BASE}/ecoenzim/projects/${projectId}/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to claim points");
  }
  return await res.json();
}