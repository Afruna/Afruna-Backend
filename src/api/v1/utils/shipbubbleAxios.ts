import axios from 'axios';
import { SHIPBUBBLE_API_KEY, SHIPBUBBLE_BASE_URL } from '@config';

const shipbubbleAxios = axios.create({
  baseURL: SHIPBUBBLE_BASE_URL || 'https://api.shipbubble.com/v1',
  headers: {
    Authorization: `Bearer ${SHIPBUBBLE_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export default shipbubbleAxios;
