// drf-sdk.js

import { create } from 'ipfs-http-client';
import Web3 from 'web3';

const ipfs = create({ url: 'http://localhost:5001/api/v0' }); // or your IPFS node URL
let web3;

export async function connectWeb3() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    return web3;
  } else {
    throw new Error('MetaMask or compatible wallet required');
  }
}

export async function uploadFile(buffer, fileName) {
  const { cid } = await ipfs.add(buffer);
  return cid.toString();
}

export async function fetchFile(cid) {
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return new Blob(chunks);
}

// You can add more functions for real-time data, posts, blockchain txs, etc.

export default {
  connectWeb3,
  uploadFile,
  fetchFile,
};
