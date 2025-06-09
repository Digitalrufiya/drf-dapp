const DRF_SDK = (() => {
  const API_BASE = 'http://localhost:4000/api'; // Change if needed
  let token = null;

  // Helper: make authorized fetch
  async function authFetch(url, options = {}) {
    if (!token) throw new Error('Not authenticated');
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': options.body && !(options.body instanceof FormData) ? 'application/json' : undefined,
    };
    const res = await fetch(url, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'API error');
    }
    return res.json();
  }

  return {
    // Login and save token
    async login(email, password) {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Login failed');
      }
      const data = await res.json();
      token = data.token;
      return data;
    },

    // Upload file to IPFS via backend
    async uploadFile(file, metadata = {}) {
      if (!token) throw new Error('Not authenticated');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      return res.json(); // { cid, metadata }
    },

    // Create a post
    async createPost(text, cid = null) {
      return authFetch(`${API_BASE}/posts`, {
        method: 'POST',
        body: JSON.stringify({ text, cid }),
      });
    },

    // Get timeline posts with optional pagination
    async getTimeline(page = 1, limit = 10) {
      return authFetch(`${API_BASE}/timeline?page=${page}&limit=${limit}`);
    },

    // Get current token (optional)
    getToken() {
      return token;
    },

    // Logout (clear token)
    logout() {
      token = null;
    },
  };
})();
