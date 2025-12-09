import axios from 'axios';

// 🔴 HARDCODED LIVE URL
// This tells the app: "Always talk to Render, never localhost."
const API_URL = 'https://pitchpal-ai-music-vibe-matcher.onrender.com/api/v1';

export const analyzeTrack = async (file, lyrics) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lyrics', lyrics);

  console.log("Sending request to:", API_URL); 

  const response = await axios.post(`${API_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};