// drfSdk.js

window.DRF_SDK = {
  login: async (email, password) => {
    // Simple mock login: only one user allowed
    if (email === "testuser@example.com" && password === "password123") {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Invalid email or password"));
  },

  logout: () => {
    // Just a placeholder, no action needed for mock
  },

  uploadFile: async (file) => {
    // Mock uploading a file, return a fake CID
    return { cid: "mockCID123" };
  },

  createPost: async (text, cid) => {
    // Just resolve immediately in mock
    return Promise.resolve();
  },

  getTimeline: async () => {
    // Return a fake timeline with one post
    return Promise.resolve({
      posts: [
        {
          id: 1,
          userEmail: "testuser@example.com",
          text: "Hello world from mock SDK!",
          fileCid: null,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  },
};
