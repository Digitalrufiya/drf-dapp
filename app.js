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

const MAX_FILE_SIZE_MB = 100;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

function showError(elem, message) {
  elem.textContent = message;
  setTimeout(() => (elem.textContent = ''), 5000);
}

function isVideoFile(filename) {
  return /\.(mp4|webm|ogg)$/i.test(filename);
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

      let mediaHtml = '';
      if (post.fileCid) {
        if (isVideoFile(post.fileCid)) {
          mediaHtml = `<video controls src="https://ipfs.io/ipfs/${post.fileCid}" style="max-width: 100%; border-radius: 8px;"></video>`;
        } else {
          mediaHtml = `<img src="https://ipfs.io/ipfs/${post.fileCid}" alt="Post media" style="max-width: 100%; border-radius: 8px;" />`;
        }
      }

      postEl.innerHTML = `
        <div class="meta">
          <strong>${post.userEmail}</strong> - ${formatDate(post.timestamp)}
        </div>
        <div class="text">${post.text ? post.text : ''}</div>
        <div>${mediaHtml}</div>
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
  postError.textContent = '';
});

postForm.addEventListener('submit', async e => {
  e.preventDefault();
  postError.textContent = '';

  const text = postText.value.trim();

  // Check file size if file is selected
  if (postFile.files.length > 0) {
    const file = postFile.files[0];
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      showError(postError, `File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
      return;
    }
  }

  // Disable form elements while uploading/posting
  postForm.querySelector('button[type="submit"]').disabled = true;
  postForm.querySelector('button[type="submit"]').textContent = 'Posting...';

  try {
    let cid = null;
    if (postFile.files.length > 0) {
      const uploadRes = await DRF_SDK.uploadFile(postFile.files[0]);
      cid = uploadRes.cid;
    }

    if (!text && !cid) {
      showError(postError, 'Please enter text or upload a file');
      postForm.querySelector('button[type="submit"]').disabled = false;
      postForm.querySelector('button[type="submit"]').textContent = 'Post';
      return;
    }

    await DRF_SDK.createPost(text, cid);

    // Clear inputs
    postText.value = '';
    postFile.value = '';

    // Reload timeline after posting
    await loadTimeline();
  } catch (err) {
    showError(postError, err.message);
  } finally {
    postForm.querySelector('button[type="submit"]').disabled = false;
    postForm.querySelector('button[type="submit"]').textContent = 'Post';
  }
});
