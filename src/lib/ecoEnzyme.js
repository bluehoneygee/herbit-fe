// File: ./src/lib/ecoEnzyme.js

// URL dasar API Anda, sesuaikan jika berbeda.
// Pastikan variabel lingkungan NEXT_PUBLIC_API_URL sudah disetel
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/ecoenzim"; 
// Sesuai dengan prefix router Express Anda: "/api/ecoenzim"

// --------------------
// 1. Generic Fetch Utility
// Ini adalah fungsi dasar untuk memanggil semua endpoint API
// --------------------
async function apiFetch(endpoint, options = {}) {
    // Gabungkan URL dasar dengan endpoint spesifik
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    try {
        const res = await fetch(fullUrl, options);
        
        if (!res.ok) {
            // Tangani error HTTP (4xx atau 5xx)
            const errorText = await res.text();
            throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
        }
        
        // Jika respons kosong (misalnya DELETE), kembalikan objek kosong
        if (res.status === 204 || res.headers.get("Content-Length") === "0") {
             return {};
        }

        return res.json();
    } catch (err) {
        console.error(`Fetch Error [${endpoint}]:`, err);
        throw err;
    }
}

// --------------------
// 2. PROJECT Endpoints
// Sesuai dengan routes Express Anda: /projects
// --------------------

export function fetchProjects() {
    return apiFetch('/projects'); // GET /projects
}

// Tambahkan semua fungsi Project yang Anda butuhkan (Sesuai dengan backend Anda)
export function getProjectById(id) {
    return apiFetch(`/projects/${id}`); // GET /projects/:id
}

export function createProject(data) {
    return apiFetch('/projects', { // POST /projects
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export function updateProject(id, data) {
    return apiFetch(`/projects/${id}`, { // PUT /projects/:id
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export function deleteProject(id) {
    return apiFetch(`/projects/${id}`, { // DELETE /projects/:id
        method: 'DELETE',
    });
}

// --------------------
// 3. UPLOAD Endpoints
// Sesuai dengan routes Express Anda: /uploads
// --------------------

export function fetchUploads() {
    return apiFetch('/uploads'); // GET /uploads
}

export function fetchUploadsByProject(projectId) {
    return apiFetch(`/uploads/${projectId}`); // GET /uploads/:projectId
}

export function createUpload(data) {
    return apiFetch('/uploads', { // POST /uploads
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}