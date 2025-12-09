// src/App.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components'; 
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiFileText, FiCpu, FiLoader } from 'react-icons/fi';
import ShaderBackground from './components/ShaderBackground';
import ResultCard from './components/ResultCard';
import Hero3D from './components/Hero3D';

// 👇 CRITICAL: Import the function that knows the Render URL
import { analyzeTrack } from './services/api'; 

// --- Theme & Layout ---
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 60px 20px 100px;
  position: relative;
  z-index: 10;
  overflow-y: auto;
  font-family: 'Inter', sans-serif;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 5rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(to right, #c084fc, #6366f1, #2dd4bf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5));
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 1.2rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 10px;
  font-weight: 600;
`;

const InputSection = styled(motion.div)`
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  margin-bottom: 40px;
`;

const InputGroup = styled.div`
  margin-bottom: 25px;
  label {
    display: flex; align-items: center; gap: 10px;
    color: #e2e8f0; font-weight: 600; margin-bottom: 10px;
  }
`;

const StyledInput = styled.input`
  width: 100%; padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; color: white;
  transition: all 0.2s;
  &:focus { border-color: #8b5cf6; outline: none; background: rgba(0, 0, 0, 0.5); }
  &::file-selector-button {
    background: #4f46e5; border: none; color: white;
    padding: 8px 16px; border-radius: 8px; margin-right: 15px; cursor: pointer;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%; height: 120px; padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; color: white; resize: none;
  &:focus { border-color: #8b5cf6; outline: none; background: rgba(0, 0, 0, 0.5); }
`;

const AnalyzeButton = styled(motion.button)`
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white; border: none; padding: 18px;
  width: 100%; border-radius: 16px;
  font-size: 1.1rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
  transition: all 0.3s;
  
  &:hover { box-shadow: 0 0 40px rgba(124, 58, 237, 0.6); transform: translateY(-2px); }
  &:disabled { opacity: 0.7; cursor: wait; }
`;

function App() {
  const [file, setFile] = useState(null);
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [results, setResults] = useState(null);

  useEffect(() => {
    let interval;
    if (loading) {
      const msgs = ["Listening to Audio...", "Detecting Vibe & Key...", "Consulting AI Engine...", "Ranking Matches..."];
      let i = 0;
      setLoadingMessage(msgs[0]);
      interval = setInterval(() => { i = (i+1)%msgs.length; setLoadingMessage(msgs[i]); }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!file || !lyrics) return alert("Please upload audio and lyrics.");
    setLoading(true);
    setResults(null);

    // 👇 FIXED: Using the analyzeTrack function from api.js
    try {
      const data = await analyzeTrack(file, lyrics); 
      setResults(data); 
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ShaderBackground />
      <Hero3D />
      <AppContainer>
        <Header initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} transition={{duration:0.8}}>
          <Title>PitchPal Pro</Title>
          <Subtitle>AI Artist Matching Engine</Subtitle>
        </Header>

        <InputSection initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}>
          <InputGroup>
            <label><FiMusic /> Upload Demo Track</label>
            <StyledInput type="file" onChange={(e)=>setFile(e.target.files[0])} accept=".mp3,.wav,.m4a" />
          </InputGroup>
          <InputGroup>
            <label><FiFileText /> Paste Lyrics</label>
            <StyledTextArea placeholder="Paste lyrics here..." value={lyrics} onChange={(e)=>setLyrics(e.target.value)} />
          </InputGroup>
          <AnalyzeButton onClick={handleAnalyze} disabled={loading} whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
            {loading ? <><FiLoader className="spin" /> {loadingMessage}</> : <><FiCpu /> Run Analysis</>}
          </AnalyzeButton>
        </InputSection>

        <AnimatePresence>
          {results && <ResultCard results={results} />}
        </AnimatePresence>
      </AppContainer>
    </>
  );
}

export default App;