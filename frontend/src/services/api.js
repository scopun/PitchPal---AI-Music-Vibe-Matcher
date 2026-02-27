import axios from 'axios';

// The Live Render Backend URL
const API_URL = 'https://pitchpal-ai-music-vibe-matcher.onrender.com/api/v1';

export const analyzeTrack = async (file, lyrics) => {
  const formData = new FormData();
  
  // FIX 1: The key MUST be 'audio_file' to match the Python backend
  formData.append('audio_file', file); 
  formData.append('lyrics', lyrics);

  console.log("Sending request to:", API_URL); 

  // FIX 2: Ensure this matches your backend. 
  // If you changed the backend to @router.post("/analyze"), leave this as /analyze.
  // If your backend still says @router.post("/match"), change this to /match.
  const response = await axios.post(`${API_URL}/analyze`, formData);
  
  return response.data;
};