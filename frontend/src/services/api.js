import axios from 'axios';

// This ensures the frontend definitely talks to the live server, not localhost.
const API_URL = 'https://pitchpal-ai-music-vibe-matcher.onrender.com/api/v1';

export const analyzeTrack = async (file, lyrics) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lyrics', lyrics);

  console.log("Sending request to:", API_URL); // Debugging log

  const response = await axios.post(`${API_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};