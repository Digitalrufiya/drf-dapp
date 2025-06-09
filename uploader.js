// utils/uploader.js
import { Web3Storage, File } from 'web3.storage';

// Replace with your actual Web3.Storage API key
const WEB3_STORAGE_API_KEY = 'YOUR_WEB3_STORAGE_API_KEY';

function makeStorageClient() {
  return new Web3Storage({ token: WEB3_STORAGE_API_KEY });
}

export async function uploadJSONtoIPFS(jsonData) {
  const client = makeStorageClient();

  const file = new File([JSON.stringify(jsonData)], 'data.json', { type: 'application/json' });
  const cid = await client.put([file]);

  console.log('Stored file with cid:', cid);
  return cid;
}
