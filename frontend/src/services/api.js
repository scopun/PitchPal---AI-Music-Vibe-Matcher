import axios from 'axios';

const API_URL = 'https://pitchpal-ai-music-vibe-matcher.onrender.com/api/v1';

export const analyzeTrack = async (file, lyrics) => {
  const formData = new FormData();
  
  formData.append('audio_file', file); 
  formData.append('lyrics', lyrics);

  console.log("Sending request to:", API_URL); 

  const response = await axios.post(`${API_URL}/match`, formData);
  
  return response.data;
};