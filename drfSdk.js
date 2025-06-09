// drfSdk.js
console.log("drfSdk.js loaded");

const DRF_SDK = {
  login: async (email, password) => {
    if (email === 'test@example.com' && password === '123456') {
      return Promise.resolve("Logged in");
    } else {
      return Promise.reject(new Error("Invalid credentials"));
    }
  },
  logout: () => console.log("Logged out"),
  getTimeline: async () => ({
    posts: [
      {
        userEmail: 'test@example.com',
        text: 'Hello world!',
        timestamp: new Date().toISOString(),
        fileCid: null
      }
    ]
  }),
  uploadFile: async (file) => ({
    cid: 'fakeCID12345'
  }),
  createPost: async (text, cid) => {
    console.log("Post created:", { text, cid });
    return true;
  }
};

// ✅ Make globally accessible
window.DRF_SDK = DRF_SDK;
