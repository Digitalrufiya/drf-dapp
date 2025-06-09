// Make sure drfSdk.js is loaded before this

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
      `;
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
    loginSection.style.display = 'none';
    dashboard.style.display = 'block';
    loadTimeline();
  } catch (err) {
    showError(loginError, err.message);
  }
});

logoutBtn.addEventListener('click', () => {
  DRF_SDK.logout();
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

    postText.value = '';
    postFile.value = '';

    loadTimeline();
  } catch (err) {
    showError(postError, err.message);
  }
});
