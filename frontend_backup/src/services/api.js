import axios from 'axios';

const API_URL = 'https://pitchpal-backend-0uyc.onrender.com/api/v1';

export const analyzeTrack = async (file) => {
  const formData = new FormData();
  formData.append('audio_file', file);
  const response = await axios.post(`${API_URL}/match`, formData, { timeout: 120000 });
  return response.data;
};
