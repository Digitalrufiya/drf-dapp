import MyCDNSDK from './my-cdn-sdk.js';

const cdn = new MyCDNSDK({
  apiUrl: 'http://localhost:4000/api',
  token: 'your-jwt-token',
});

// Upload file with metadata and progress callback
const fileInput = document.querySelector('#fileInput');
fileInput.onchange = async () => {
  const file = fileInput.files[0];
  try {
    const cid = await cdn.uploadFileWithProgress(file, { description: 'My file' }, (percent) => {
      console.log(`Upload progress: ${percent.toFixed(2)}%`);
    });
    console.log('Uploaded file CID:', cid);

    // Get signed URL to share
    const signedUrl = await cdn.getSignedUrl(cid, 3600);
    console.log('Signed URL:', signedUrl);
  } catch (err) {
    console.error(err);
  }
};
