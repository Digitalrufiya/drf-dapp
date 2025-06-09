// drfrobo-sdk.js
export default class DRFRoboSDK {
  constructor({ apiUrl, token }) {
    this.apiUrl = apiUrl;
    this.token = token;
  }

  async login(email, password) {
    const res = await fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    this.token = data.token;
    return data;
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${this.apiUrl}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.cid;
  }

  async getFile(cid) {
    const res = await fetch(`${this.apiUrl}/file/${cid}`);
    if (!res.ok) throw new Error('File not found');
    return await res.blob();
  }
}
