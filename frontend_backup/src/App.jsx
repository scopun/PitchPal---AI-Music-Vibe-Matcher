import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ShaderBackground from './components/ShaderBackground';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import AnalysingPage from './pages/AnalysingPage';
import ResultsPage from './pages/ResultsPage';
import { analyzeTrack } from './services/api';

// page: 'login' | 'upload' | 'analysing' | 'results'

export default function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('upload');
  };

  const handleAnalyse = async (file) => {
    setCurrentFile(file);
    setPage('analysing');
    setError(null);

    try {
      const data = await analyzeTrack(file);
      setResults(data);
      setPage('results');
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again.');
      setPage('upload');
    }
  };

  const handleReset = () => {
    setResults(null);
    setCurrentFile(null);
    setError(null);
    setPage('upload');
  };

  return (
    <>
      <ShaderBackground />
      <AnimatePresence mode="wait">
        {page === 'login' && (
          <motion.div key="login" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}>
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        )}

        {page === 'upload' && (
          <motion.div key="upload" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}>
            {error && (
              <div style={{
                position:'fixed', top:20, left:'50%', transform:'translateX(-50%)',
                background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)',
                color:'#fca5a5', padding:'12px 24px', borderRadius:'12px',
                zIndex:100, fontSize:'0.9rem', fontWeight:600
              }}>
                {error}
              </div>
            )}
            <UploadPage onAnalyse={handleAnalyse} />
          </motion.div>
        )}

        {page === 'analysing' && (
          <motion.div key="analysing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}>
            <AnalysingPage fileName={currentFile?.name} />
          </motion.div>
        )}

        {page === 'results' && results && (
          <motion.div key="results" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}>
            <ResultsPage results={results} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
