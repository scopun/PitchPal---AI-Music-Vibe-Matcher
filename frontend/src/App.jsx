// src/App.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiFileText, FiCpu, FiLoader } from 'react-icons/fi';
import ShaderBackground from './components/ShaderBackground';
import ResultCard from './components/ResultCard';
import Hero3D from './components/Hero3D';
import { analyzeTrack } from './services/api';
import logoImg from './assets/pitchpal_logo.png';

// --- Theme & Layout ---
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 50px 20px 100px;
  position: relative;
  z-index: 10;
  overflow-y: auto;
  font-family: 'Inter', sans-serif;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

// 👇 UPDATED: BIGGER LOGO SIZE (600px)
const HeroLogo = styled(motion.img)`
  width: 100%;
  max-width: 600px; /* Increased from 320px to 600px */
  height: auto;
  margin-bottom: 15px;
  
  /* Sharp, aesthetic glow */
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.3));
`;

const Subtitle = styled.p`
  background: linear-gradient(to right, #94a3b8, #cbd5e1, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.1rem; /* Slightly larger text to match big logo */
  letter-spacing: 5px;
  text-transform: uppercase;
  margin-top: 5px;
  font-weight: 600;
  opacity: 0.9;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
`;

const InputSection = styled(motion.div)`
  background: rgba(10, 15, 30, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 30px 60px -10px rgba(0, 0, 0, 0.5);
  margin-bottom: 40px;
`;

const InputGroup = styled.div`
  margin-bottom: 25px;
  label {
    display: flex; align-items: center; gap: 10px;
    color: #cbd5e1; font-weight: 500; margin-bottom: 12px;
    font-size: 0.95rem; letter-spacing: 0.5px;
  }
`;

const StyledInput = styled.input`
  width: 100%; padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px; color: white;
  transition: all 0.3s;
  &:focus { 
    border-color: #8b5cf6; 
    outline: none; 
    background: rgba(0, 0, 0, 0.5); 
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
  }
  &::file-selector-button {
    background: rgba(255, 255, 255, 0.08); 
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 8px 16px; border-radius: 8px; margin-right: 15px; cursor: pointer;
    transition: all 0.2s;
  }
  &::file-selector-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%; height: 140px; padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px; color: white; resize: none;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s;
  &:focus { 
    border-color: #8b5cf6; 
    outline: none; 
    background: rgba(0, 0, 0, 0.5); 
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
  }
`;

const AnalyzeButton = styled(motion.button)`
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white; border: none; padding: 20px;
  width: 100%; border-radius: 16px;
  font-size: 1.1rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  box-shadow: 0 10px 30px -5px rgba(99, 102, 241, 0.4);
  letter-spacing: 0.5px;
  transition: all 0.3s;
  
  &:hover { 
    box-shadow: 0 15px 40px -5px rgba(99, 102, 241, 0.6); 
    transform: translateY(-2px); 
    filter: brightness(1.1);
  }
  &:disabled { opacity: 0.7; cursor: wait; filter: grayscale(0.5); }
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
      const msgs = ["Processing Sonic Fingerprint...", "Decoding Lyrical DNA...", "Matching Artist Vibe...", "Synthesizing Report..."];
      let i = 0;
      setLoadingMessage(msgs[0]);
      interval = setInterval(() => { i = (i+1)%msgs.length; setLoadingMessage(msgs[i]); }, 2800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!file || !lyrics) return alert("Please upload audio and lyrics.");
    setLoading(true);
    setResults(null);

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
          <HeroLogo 
            src={logoImg} 
            alt="PitchPal Logo" 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
          />
          <Subtitle>The Science of Sonic Resonance</Subtitle>
        </Header>

        <InputSection initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}>
          <InputGroup>
            <label><FiMusic /> Upload Demo Track</label>
            <StyledInput type="file" onChange={(e)=>setFile(e.target.files[0])} accept=".mp3,.wav,.m4a" />
          </InputGroup>
          <InputGroup>
            <label><FiFileText /> Paste Lyrics</label>
            <StyledTextArea placeholder="Paste lyrics here..." value={lyrics} onChange={(e)=>setLyrics(e.target.value)} />
          </InputGroup>
          <AnalyzeButton onClick={handleAnalyze} disabled={loading} whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
            {loading ? <><FiLoader className="spin" /> {loadingMessage}</> : <><FiCpu /> Run Intelligence Engine</>}
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