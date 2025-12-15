import axios from 'axios';

// The Live Render Backend URL
const API_URL = 'https://pitchpal-ai-music-vibe-matcher.onrender.com/api/v1';
//local backend URL
// const API_URL = "http://127.0.0.1:8000/api/v1";

export const analyzeTrack = async (file, lyrics) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lyrics', lyrics);

  console.log("Sending request to:", API_URL); 

  // FIX: Removed the manual 'Content-Type' header. 
  // Axios will automatically set the correct headers + boundaries for files.
  const response = await axios.post(`${API_URL}/analyze`, formData);
  
  return response.data;
};