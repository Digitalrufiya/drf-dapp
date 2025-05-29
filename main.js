// main.js

document.addEventListener("DOMContentLoaded", () => {
  // CHATBOT LOGIC (basic rule-based)
  const chatForm = document.getElementById("chat-form");
  const chatBox = document.getElementById("chat-box");

  if (chatForm && chatBox) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("user-input");
      const userText = input.value.trim();
      if (!userText) return;

      appendMessage("You", userText);
      input.value = "";
      respondToUser(userText);
    });

    function appendMessage(sender, text) {
      const msgDiv = document.createElement("div");
      msgDiv.classList.add(sender === "You" ? "user-message" : "bot-message");
      msgDiv.textContent = `${sender}: ${text}`;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function respondToUser(text) {
      const lower = text.toLowerCase();
      let reply = "Sorry, I don't understand. Please ask about Islam, justice, or DRF.";
      if (lower.includes("salam")) reply = "Wa Alaikum Assalam wa Rahmatullah!";
      else if (lower.includes("quran")) reply = "The Quran is the final revelation from Allah, guiding us.";
      else if (lower.includes("gambling") || lower.includes("haram"))
        reply = "Gambling is haram in Islam. Avoid it to stay on the straight path.";
      else if (lower.includes("drf")) reply = "Divine DRF Robo guides with justice and faith.";
      // Add more replies here...

      setTimeout(() => appendMessage("DRF Robo", reply), 600);
    }
  }

  // SOCIAL POSTS LOGIC (localStorage)
  const postForm = document.getElementById("post-form");
  const postsContainer = document.getElementById("posts-container");

  if (postForm && postsContainer) {
    loadPosts();

    postForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const content = document.getElementById("post-content").value.trim();
      if (!content) return;

      const posts = JSON.parse(localStorage.getItem("drfPosts") || "[]");
      const post = {
        id: Date.now(),
        content,
        timestamp: new Date().toISOString(),
      };
      posts.unshift(post);
      localStorage.setItem("drfPosts", JSON.stringify(posts));
      document.getElementById("post-content").value = "";
      renderPosts(posts);
    });

    function loadPosts() {
      const posts = JSON.parse(localStorage.getItem("drfPosts") || "[]");
      renderPosts(posts);
    }

    function renderPosts(posts) {
      postsContainer.innerHTML = "";
      if (posts.length === 0) {
        postsContainer.innerHTML = "<p>No posts yet. Be the first!</p>";
        return;
      }
      posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.innerHTML = `
          <p>${escapeHtml(post.content)}</p>
          <small>${new Date(post.timestamp).toLocaleString()}</small>
        `;
        postsContainer.appendChild(postDiv);
      });
    }
  }

  // PLEDGE FORM LOGIC (localStorage)
  const pledgeForm = document.getElementById("pledge-form");
  const pledgeMessage = document.getElementById("pledge-message");

  if (pledgeForm && pledgeMessage) {
    pledgeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      localStorage.setItem("drfPledge", "true");
      pledgeMessage.textContent = "Thank you for pledging your allegiance to Divine DRF Robo!";
      pledgeForm.reset();
    });

    // Show message if already pledged
    if (localStorage.getItem("drfPledge") === "true") {
      pledgeMessage.textContent = "You have already pledged allegiance. JazakAllah Khair!";
      pledgeForm.style.display = "none";
    }
  }

  // ALERTS / FEED LOGIC (static for demo; extendable)
  const alertsContainer = document.getElementById("alerts-container");

  if (alertsContainer) {
    const alerts = [
      {
        id: 1,
        message:
          "⚠️ Beware of gambling and scams — Stay on the straight path of Islam and Divine DRF Robo.",
        timestamp: "2025-05-29T08:00:00Z",
      },
      {
        id: 2,
        message:
          "📢 New update: Divine DRF Robo now includes enhanced chatbot guidance.",
        timestamp: "2025-05-28T14:30:00Z",
      },
    ];
    renderAlerts(alerts);
  }

  function renderAlerts(alerts) {
    alertsContainer.innerHTML = "";
    alerts.forEach((alert) => {
      const alertDiv = document.createElement("div");
      alertDiv.classList.add("alert");
      alertDiv.innerHTML = `
        <p>${escapeHtml(alert.message)}</p>
        <small>${new Date(alert.timestamp).toLocaleString()}</small>
      `;
      alertsContainer.appendChild(alertDiv);
    });
  }

  // Utility: Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
