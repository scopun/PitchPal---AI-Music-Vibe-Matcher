import { useState, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiMusic, FiX, FiCheck, FiZap } from 'react-icons/fi';

const pulse = keyframes`0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  z-index: 10;
`;

const Card = styled(motion.div)`
  width: 100%;
  max-width: 560px;
  background: rgba(10,12,35,0.8);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 28px;
  padding: 48px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.5);
`;

const Header = styled.div`margin-bottom: 36px;`;

const Tag = styled.div`
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);
  color: #a5b4fc; padding: 6px 14px; border-radius: 100px;
  font-size: 0.77rem; font-weight: 600; letter-spacing: 1px;
  text-transform: uppercase; margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 1.8rem; font-weight: 800; color: white;
  margin: 0 0 8px; letter-spacing: -0.5px;
`;

const Sub = styled.p`color: #475569; font-size: 0.92rem; margin: 0;`;

const DropZone = styled.div`
  border: 2px dashed ${p => p.$active ? 'rgba(99,102,241,0.8)' : p.$hasFile ? 'rgba(45,212,191,0.5)' : 'rgba(255,255,255,0.1)'};
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: ${p => p.$active ? 'rgba(99,102,241,0.06)' : p.$hasFile ? 'rgba(45,212,191,0.03)' : 'rgba(255,255,255,0.02)'};
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;

  &:hover {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.04);
  }

  ${p => p.$active && css`
    &::after {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(circle at center, rgba(99,102,241,0.08), transparent 70%);
    }
  `}
`;

const UploadIcon = styled.div`
  width: 72px; height: 72px;
  border-radius: 20px;
  background: ${p => p.$hasFile ? 'rgba(45,212,191,0.1)' : 'rgba(99,102,241,0.1)'};
  border: 1px solid ${p => p.$hasFile ? 'rgba(45,212,191,0.25)' : 'rgba(99,102,241,0.2)'};
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
  color: ${p => p.$hasFile ? '#2dd4bf' : '#818cf8'};
  animation: ${p => p.$hasFile ? 'none' : css`${pulse} 3s ease-in-out infinite`};
`;

const DZTitle = styled.div`
  font-size: 1.05rem; font-weight: 700; color: white; margin-bottom: 6px;
`;

const DZSub = styled.div`font-size: 0.85rem; color: #475569;`;

const Formats = styled.div`
  display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
  margin-top: 16px;
`;

const Fmt = styled.span`
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
  color: #64748b; padding: 4px 10px; border-radius: 6px;
  font-size: 0.77rem; font-weight: 600;
`;

const FileInfo = styled(motion.div)`
  display: flex; align-items: center; gap: 14px;
  background: rgba(45,212,191,0.06); border: 1px solid rgba(45,212,191,0.2);
  border-radius: 14px; padding: 14px 18px; margin-bottom: 24px;
`;

const FileIcon = styled.div`
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(45,212,191,0.12);
  display: flex; align-items: center; justify-content: center;
  color: #2dd4bf; flex-shrink: 0;
`;

const FileDetails = styled.div`flex: 1; overflow: hidden;`;
const FileName = styled.div`color: white; font-weight: 600; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
const FileSize = styled.div`color: #475569; font-size: 0.8rem; margin-top: 2px;`;

const RemoveBtn = styled.button`
  background: none; border: none; color: #475569; cursor: pointer; padding: 4px;
  &:hover { color: #ef4444; }
`;

const AnalyseBtn = styled(motion.button)`
  width: 100%; padding: 17px;
  border-radius: 14px; border: none;
  background: ${p => p.$disabled ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: ${p => p.$disabled ? '#334155' : 'white'};
  font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 700;
  cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
  display: flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: ${p => p.$disabled ? 'none' : '0 8px 24px rgba(99,102,241,0.3)'};
  transition: all 0.3s; letter-spacing: 0.2px;
  &:hover:not(:disabled) { box-shadow: 0 12px 32px rgba(99,102,241,0.45); filter: brightness(1.08); }
`;

const HiddenInput = styled.input`display: none;`;

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage({ onAnalyse }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const accept = ['.mp3','.wav','.m4a','.flac','.aac'];

  const handleFile = (f) => {
    if (f && accept.some(ext => f.name.toLowerCase().endsWith(ext))) {
      setFile(f);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <Page>
      <Card
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Header>
          <Tag><FiZap size={11}/> AI Analysis</Tag>
          <Title>Upload Your Track</Title>
          <Sub>Drop your demo and let AI find the perfect artist match</Sub>
        </Header>

        <HiddenInput
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          onChange={e => handleFile(e.target.files[0])}
        />

        <DropZone
          $active={dragging}
          $hasFile={!!file}
          onClick={() => !file && inputRef.current.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <UploadIcon $hasFile={!!file}>
            {file ? <FiCheck size={28}/> : <FiUploadCloud size={28}/>}
          </UploadIcon>
          {file ? (
            <>
              <DZTitle>Track uploaded!</DZTitle>
              <DZSub>Ready to analyse</DZSub>
            </>
          ) : (
            <>
              <DZTitle>Drop your track here or click to browse</DZTitle>
              <DZSub>We'll extract the audio features and lyrics automatically</DZSub>
              <Formats>
                {['MP3','WAV','FLAC','AAC','M4A'].map(f => <Fmt key={f}>{f}</Fmt>)}
              </Formats>
            </>
          )}
        </DropZone>

        <AnimatePresence>
          {file && (
            <FileInfo
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FileIcon><FiMusic size={18}/></FileIcon>
              <FileDetails>
                <FileName>{file.name}</FileName>
                <FileSize>{formatSize(file.size)}</FileSize>
              </FileDetails>
              <RemoveBtn onClick={() => setFile(null)}><FiX size={16}/></RemoveBtn>
            </FileInfo>
          )}
        </AnimatePresence>

        <AnalyseBtn
          $disabled={!file}
          disabled={!file}
          onClick={() => file && onAnalyse(file)}
          whileHover={file ? { scale: 1.01 } : {}}
          whileTap={file ? { scale: 0.99 } : {}}
        >
          <FiZap size={18}/>
          {file ? 'Analyse Track' : 'Upload a track to continue'}
        </AnalyseBtn>
      </Card>
    </Page>
  );
}
