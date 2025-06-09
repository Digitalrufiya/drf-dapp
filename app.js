// Assume currentUserEmail is stored on login success
let currentUserEmail = null;

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const loginSection = document.getElementById('login-section');

const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logout-btn');

const postForm = document.getElementById('post-form');
const postText = document.getElementById('post-text');
const postFile = document.getElementById('post-file');
const postError = document.getElementById('post-error');

const timelineDiv = document.getElementById('timeline');

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

function showError(elem, message) {
  elem.textContent = message;
  setTimeout(() => (elem.textContent = ''), 5000);
}

function showToast(message) {
  // Simple toast implementation
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function loadTimeline() {
  try {
    const data = await DRF_SDK.getTimeline();
    timelineDiv.innerHTML = '';

    if (data.posts.length === 0) {
      timelineDiv.innerHTML = '<p>No posts yet.</p>';
      return;
    }

    data.posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.classList.add('post');
      postEl.innerHTML = `
        <div class="meta">
          <strong>${post.userEmail}</strong> - ${formatDate(post.timestamp)}
        </div>
        <div class="text">${post.text ? post.text : ''}</div>
        ${post.fileCid ? `<div><a href="https://ipfs.io/ipfs/${post.fileCid}" target="_blank">📎 View File</a></div>` : ''}
        <div class="actions">
          <button class="share-btn">Share</button>
          <button class="like-btn">Like</button>
          <button class="comment-btn">Comment</button>
        </div>
        <div class="comments-section" style="display:none;">
          <input type="text" class="comment-input" placeholder="Write a comment..." />
          <button class="submit-comment-btn">Submit</button>
          <div class="comments-list"></div>
        </div>
      `;

      // Event listeners for actions:
      const shareBtn = postEl.querySelector('.share-btn');
      shareBtn.addEventListener('click', () => handleShare(post));

      const likeBtn = postEl.querySelector('.like-btn');
      likeBtn.addEventListener('click', () => handleLike(post));

      const commentBtn = postEl.querySelector('.comment-btn');
      const commentsSection = postEl.querySelector('.comments-section');
      commentBtn.addEventListener('click', () => {
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
      });

      const submitCommentBtn = postEl.querySelector('.submit-comment-btn');
      submitCommentBtn.addEventListener('click', () => handleComment(post, postEl));

      timelineDiv.appendChild(postEl);
    });
  } catch (e) {
    showError(postError, e.message);
  }
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.textContent = '';

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value.trim();

  try {
    await DRF_SDK.login(email, password);
    currentUserEmail = email; // Save logged-in user email
    loginSection.style.display = 'none';
    dashboard.style.display = 'block';
    loadTimeline();
  } catch (err) {
    showError(loginError, err.message);
  }
});

logoutBtn.addEventListener('click', () => {
  DRF_SDK.logout();
  currentUserEmail = null;
  dashboard.style.display = 'none';
  loginSection.style.display = 'block';
  timelineDiv.innerHTML = '';
  postText.value = '';
  postFile.value = '';
});

postForm.addEventListener('submit', async e => {
  e.preventDefault();
  postError.textContent = '';

  const text = postText.value.trim();

  try {
    let cid = null;
    if (postFile.files.length > 0) {
      const uploadRes = await DRF_SDK.uploadFile(postFile.files[0]);
      cid = uploadRes.cid;
    }

    if (!text && !cid) {
      showError(postError, 'Please enter text or upload a file');
      return;
    }

    await DRF_SDK.createPost(text, cid);

    // Reward the user for posting
    await DRF_SDK.rewardUserForPost(currentUserEmail);
    showToast("🎉 You earned tokens for posting!");

    postText.value = '';
    postFile.value = '';

    loadTimeline();
  } catch (err) {
    showError(postError, err.message);
  }
});

// Handle sharing (within platform or external)
async function handleShare(post) {
  try {
    // Simulate share action; in real app you’d trigger actual share UI
    alert(`Sharing post by ${post.userEmail}`);

    // Reward sharer
    await DRF_SDK.rewardUserForShare(currentUserEmail);
    showToast("🎉 You earned tokens for sharing!");
  } catch (err) {
    showError(postError, err.message);
  }
}

// Handle liking a post (burn tokens)
async function handleLike(post) {
  try {
    // Here you might update UI to show liked state
    await DRF_SDK.burnTokensForLike(currentUserEmail);
    showToast("🔥 Tokens burned for liking a post");
  } catch (err) {
    showError(postError, err.message);
  }
}

// Handle commenting (burn tokens)
async function handleComment(post, postEl) {
  const commentInput = postEl.querySelector('.comment-input');
  const commentText = commentInput.value.trim();

  if (!commentText) {
    showError(postError, 'Comment cannot be empty');
    return;
  }

  try {
    // Create comment post (if your backend supports it)
    // await DRF_SDK.createComment(post.id, currentUserEmail, commentText);

    // For now, just show comment in UI
    const commentsList = postEl.querySelector('.comments-list');
    const commentEl = document.createElement('div');
    commentEl.textContent = `${currentUserEmail}: ${commentText}`;
    commentsList.appendChild(commentEl);

    commentInput.value = '';

    await DRF_SDK.burnTokensForComment(currentUserEmail);
    showToast("🔥 Tokens burned for commenting");
  } catch (err) {
    showError(postError, err.message);
  }
}
