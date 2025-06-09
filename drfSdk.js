// drfSdk.js

const DRF_SDK = (() => {
  let token = null;

  async function apiFetch(path, options = {}) {
    const headers = options.headers || {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    options.headers = headers;
    const response = await fetch(path, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'API error');
    }
    return response.json();
  }

  return {
    login: async (email, password) => {
      const data = await apiFetch('/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      token = data.access;
      return data;
    },

    logout: () => {
      token = null;
    },

    uploadFile: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload/', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'File upload failed');
      }
      return response.json(); // { cid: "..." }
    },

    createPost: async (text, cid) => {
      return apiFetch('/api/posts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, fileCid: cid }),
      });
    },

    getTimeline: async () => {
      return apiFetch('/api/posts/');
    },
  };
})();

window.DRF_SDK = DRF_SDK;
