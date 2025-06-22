import axios from 'axios';

const shipbubbleAxios = axios.create({
  baseURL: 'https://api.shipbubble.com/v1',
  headers: {
    Authorization: `Bearer sb_sandbox_ef9ef17ea9df253cab3e0715e90d74126a56d4667d2b3ef2aaad41a2cffd10f2`,
    'Content-Type': 'application/json'
  }
});

export default shipbubbleAxios;
