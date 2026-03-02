import axios from 'axios';

// The Live Render Backend URL
const API_URL = 'https://pitchpal-ai-music-vibe-matcher.onrender.com/api/v1';

export const analyzeTrack = async (file, lyrics) => {
  const formData = new FormData();
  
  // Matches the Python expected input exactly
  formData.append('audio_file', file); 
  formData.append('lyrics', lyrics);

  console.log("Sending request to:", API_URL); 

  // FIX: Changed from /analyze to /match to align with your FastAPI docs!
  const response = await axios.post(`${API_URL}/match`, formData);
  
  return response.data;
};