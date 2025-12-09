import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

export const analyzeTrack = async (file, lyrics) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lyrics', lyrics);

  const response = await axios.post(`${API_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};