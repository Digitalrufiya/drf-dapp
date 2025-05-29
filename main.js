(() => {
  // --- Islamic Knowledge Base ---
  const IslamicKB = {
    greetings: [
      "As-salamu alaykum wa rahmatullahi wa barakatuh!",
      "Peace and blessings upon you.",
      "May Allah's mercy and blessings be upon you.",
    ],
    responses: {
      salaam: "Wa alaykum as-salam wa rahmatullahi wa barakatuh.",
      prayer: "Salah is the second pillar of Islam. Muslims pray five times a day facing the Kaaba in Makkah.",
      charity:
        "Charity (Zakat and Sadaqah) purifies wealth and helps those in need. Allah loves the charitable.",
      quran:
        "The Quran is the holy book revealed to Prophet Muhammad (peace be upon him). It guides Muslims to the straight path.",
      hadith:
        "Hadith are sayings and traditions of Prophet Muhammad (peace be upon him), essential for understanding Islam.",
      fasting:
        "Fasting in Ramadan is one of the five pillars. It teaches self-discipline and empathy for the less fortunate.",
      shirk:
        "Shirk is associating partners with Allah and is the gravest sin in Islam. Tawheed (monotheism) is fundamental.",
      tawheed:
        "Tawheed means the oneness of Allah, the foundation of Islamic belief.",
      jihad:
        "Jihad means striving in the way of Allah. It includes personal struggle for self-improvement and community betterment.",
      hadith_forgery:
        "Beware of fabricated hadiths. Always verify sources through authentic collections like Sahih Bukhari and Sahih Muslim.",
      gambling:
        "Gambling (Maisir) is prohibited in Islam because it leads to harm and injustice.",
      scam:
        "Fraud and scams are forbidden. Islam commands honesty and fairness in all transactions.",
    },
    default:
      "I am here to help with Islamic knowledge. Please ask your question or type keywords like 'prayer', 'charity', 'Quran', 'Hadith', 'fasting', or 'tawheed'.",
  };

  // --- Chatbot Module ---
  const Chatbot = (() => {
    const chatWindow = document.getElementById("chat-window");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");

    const addMessage = (msg, isUser = false) => {
      if (!chatWindow) return;
      const p = document.createElement("p");
      p.className = isUser ? "user-msg" : "bot-msg";
      p.textContent = msg;
      chatWindow.appendChild(p);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    const processInput = (input) => {
      const text = input.trim().toLowerCase();
      addMessage(input, true);

      // Keyword matching
      for (const key in IslamicKB.responses) {
        if (text.includes(key)) {
          addMessage(IslamicKB.responses[key]);
          return;
        }
      }
      addMessage(IslamicKB.default);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!chatInput.value.trim()) return;
      processInput(chatInput.value);
      chatInput.value = "";
    };

    const init = () => {
      if (!chatForm) return;
      chatForm.addEventListener("submit", handleSubmit);
      // Greet user initially
      addMessage(IslamicKB.greetings[Math.floor(Math.random() * IslamicKB.greetings.length)]);
    };

    return { init };
  })();

  // --- Social Feed Module ---
  const Social = (() => {
    const postForm = document.getElementById("post-form");
    const contentInput = document.getElementById("post-content");
    const postsContainer = document.getElementById("posts-container");

    const loadPosts = () => {
      if (!postsContainer) return;
      postsContainer.innerHTML = "";
      const posts = JSON.parse(localStorage.getItem("drf_social_posts") || "[]");
      posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";
        postDiv.textContent = post;
        postsContainer.appendChild(postDiv);
      });
    };

    const savePost = (content) => {
      const posts = JSON.parse(localStorage.getItem("drf_social_posts") || "[]");
      posts.unshift(content);
      if (posts.length > 50) posts.pop(); // Keep max 50 posts
      localStorage.setItem("drf_social_posts", JSON.stringify(posts));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!contentInput.value.trim()) return alert("Please enter content to post.");
      if (contentInput.value.trim().length > 280)
        return alert("Maximum 280 characters allowed.");
      savePost(contentInput.value.trim());
      contentInput.value = "";
      loadPosts();
    };

    const init = () => {
      if (!postForm) return;
      loadPosts();
      postForm.addEventListener("submit", handleSubmit);
    };

    return { init };
  })();

  // --- Pledge Module ---
  const Pledge = (() => {
    const pledgeBtn = document.getElementById("pledge-btn");
    const pledgeMsg = document.getElementById("pledge-message");

    const takePledge = () => {
      localStorage.setItem("drf_pledge_taken", "true");
      if (pledgeMsg)
        pledgeMsg.textContent =
          "Alhamdulillah! You have taken the Divine DRF Robo pledge. May Allah guide you.";
      if (pledgeBtn) {
        pledgeBtn.disabled = true;
        pledgeBtn.setAttribute("aria-pressed", "true");
      }
    };

    const checkPledge = () => {
      const pledged = localStorage.getItem("drf_pledge_taken");
      if (pledged === "true") {
        if (pledgeMsg)
          pledgeMsg.textContent =
            "You have already taken the Divine DRF Robo pledge. JazakAllahu Khair!";
        if (pledgeBtn) {
          pledgeBtn.disabled = true;
          pledgeBtn.setAttribute("aria-pressed", "true");
        }
      }
    };

    const init = () => {
      if (!pledgeBtn) return;
      pledgeBtn.addEventListener("click", takePledge);
      checkPledge();
    };

    return { init };
  })();

  // --- Initialize Modules based on page ---
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("chat-form")) Chatbot.init();
    if (document.getElementById("post-form")) Social.init();
    if (document.getElementById("pledge-btn")) Pledge.init();
  });
})();
