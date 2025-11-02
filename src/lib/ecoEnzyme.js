// File: ./src/lib/ecoEnzyme.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/ecoenzim";

async function apiFetch(endpoint, options = {}) {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  try {
    const res = await fetch(fullUrl, options);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
    }

    // Handle 204 No Content
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return {}; // atau return { success: true }
    }

    return res.json();
  } catch (err) {
    console.error(`Fetch Error [${endpoint}]:`, err);
    throw err;
  }
}

// --------------------
// PROJECT Endpoints
// --------------------

export function fetchProjects() {
    return apiFetch('/projects');
}

export function getProjectById(id) {
    return apiFetch(`/projects/${id}`);
}

export function createProject(data) {
    return apiFetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

// Tidak ada PUT /projects/:id di backend-mu → hapus jika tidak dipakai
// export function updateProject(id, data) { ... }

// export function deleteProject(id) {
//     return apiFetch(`/projects/${id}`, {
//         method: 'DELETE',
//     });
// }
export function deleteProject(projectId) {
  return apiFetch(`/projects/${projectId}`, {
    method: 'DELETE',
  });
}
// ------------------
// UPLOAD Endpoints
// --------------------

export function fetchUploads() {
    return apiFetch('/uploads');
}

// ✅ DIPERBAIKI: sesuai route backend "/uploads/project/:projectId"
export function fetchUploadsByProject(projectId) {
    return apiFetch(`/uploads/project/${projectId}`);
}

// src/lib/ecoEnzyme.js

export function createUpload(data) {
  return apiFetch('/uploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// --------------------
// VERIFY & CLAIM Endpoints (sesuai backend-mu)
// --------------------

export function verifyUpload(uploadId) {
    return apiFetch(`/uploads/${uploadId}/verify`, {
        method: 'PUT',
    });
}

export function claimPoints(projectId) {
  return apiFetch(`/projects/${projectId}/claim`, {
    method: 'POST',
  });
}