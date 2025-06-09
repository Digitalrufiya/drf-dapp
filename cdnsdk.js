export class DRFRoboSDK {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = null;
  }

  async login(email, password) {
    const res = await fetch(`${this.apiBaseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    this.token = data.token;
    return data;
  }

  async uploadFile(file, metadata = {}) {
    if (!this.token) throw new Error('Not authenticated');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    const res = await fetch(`${this.apiBaseUrl}/api/upload`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + this.token },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  }

  async createPost(text, cid = null) {
    if (!this.token) throw new Error('Not authenticated');
    const res = await fetch(`${this.apiBaseUrl}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.token,
      },
      body: JSON.stringify({ text, cid }),
    });
    if (!res.ok) throw new Error('Post creation failed');
    return res.json();
  }

  async fetchTimeline(page = 1, limit = 10) {
    if (!this.token) throw new Error('Not authenticated');
    const res = await fetch(`${this.apiBaseUrl}/api/timeline?page=${page}&limit=${limit}`, {
      headers: { Authorization: 'Bearer ' + this.token },
    });
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  }
}
