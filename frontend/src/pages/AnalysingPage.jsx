import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiFileText, FiUsers, FiStar, FiCheck } from 'react-icons/fi';

const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const pulse = keyframes`0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}`;
const bar = keyframes`0%{width:0}100%{width:100%}`;

const Page = styled.div`
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 40px 20px; position: relative; z-index: 10;
`;

const Card = styled(motion.div)`
  width: 100%; max-width: 520px;
  background: rgba(10,12,35,0.85);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 28px; padding: 52px 48px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.5);
  text-align: center;
`;

const Orb = styled.div`
  width: 100px; height: 100px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(45,212,191,0.2));
  border: 1px solid rgba(99,102,241,0.3);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 32px; position: relative;

  &::before {
    content: '';
    position: absolute; inset: -8px;
    border-radius: 50%;
    border: 1px solid rgba(99,102,241,0.15);
    animation: ${spin} 4s linear infinite;
    border-top-color: rgba(99,102,241,0.6);
  }

  &::after {
    content: '';
    position: absolute; inset: -16px;
    border-radius: 50%;
    border: 1px solid rgba(45,212,191,0.08);
    animation: ${spin} 7s linear infinite reverse;
    border-bottom-color: rgba(45,212,191,0.3);
  }
`;

const OrbInner = styled.div`
  color: #818cf8;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Title = styled.h2`
  font-size: 1.6rem; font-weight: 800; color: white;
  margin: 0 0 8px; letter-spacing: -0.3px;
`;

const Sub = styled.p`color: #475569; font-size: 0.9rem; margin: 0 0 40px;`;

const Steps = styled.div`display: flex; flex-direction: column; gap: 0; margin-bottom: 40px;`;

const Step = styled(motion.div)`
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px; border-radius: 14px;
  background: ${p => p.$active ? 'rgba(99,102,241,0.08)' : p.$done ? 'rgba(45,212,191,0.04)' : 'transparent'};
  border: 1px solid ${p => p.$active ? 'rgba(99,102,241,0.2)' : p.$done ? 'rgba(45,212,191,0.12)' : 'transparent'};
  margin-bottom: 4px;
  transition: all 0.4s;
`;

const StepDot = styled.div`
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: ${p => p.$done ? 'rgba(45,212,191,0.15)' : p.$active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)'};
  border: 1px solid ${p => p.$done ? 'rgba(45,212,191,0.3)' : p.$active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'};
  color: ${p => p.$done ? '#2dd4bf' : p.$active ? '#818cf8' : '#334155'};
`;

const StepText = styled.div`flex: 1; text-align: left;`;
const StepLabel = styled.div`
  font-size: 0.92rem; font-weight: 600;
  color: ${p => p.$done ? '#2dd4bf' : p.$active ? 'white' : '#334155'};
`;
const StepDesc = styled.div`font-size: 0.78rem; color: #334155; margin-top: 2px;`;

const Spinner = styled.div`
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(99,102,241,0.2);
  border-top-color: #6366f1;
  animation: ${spin} 0.8s linear infinite;
`;

const ProgressBar = styled.div`
  height: 3px; background: rgba(255,255,255,0.04);
  border-radius: 3px; overflow: hidden; margin-bottom: 20px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(to right, #6366f1, #2dd4bf);
  border-radius: 3px;
  width: ${p => p.$pct}%;
  transition: width 0.8s ease;
`;

const StatusText = styled.div`
  font-size: 0.82rem; color: #475569;
`;

const steps = [
  { icon: <FiMusic size={15}/>, label: 'Reading audio file', desc: 'Extracting BPM, energy and sonic fingerprint' },
  { icon: <FiFileText size={15}/>, label: 'Extracting lyrics', desc: 'AI transcribing vocals from your track' },
  { icon: <FiUsers size={15}/>, label: 'Matching artists', desc: 'Searching across global music industry' },
  { icon: <FiStar size={15}/>, label: 'Generating insights', desc: 'Building your A&R pitch strategy' },
];

export default function AnalysingPage({ fileName }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timings = [3000, 8000, 12000];
    const timers = timings.map((t, i) =>
      setTimeout(() => setCurrentStep(i + 1), t)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const pct = Math.round((currentStep / steps.length) * 100);

  return (
    <Page>
      <Card initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Orb>
          <OrbInner><FiMusic size={28}/></OrbInner>
        </Orb>

        <Title>Analysing Your Track</Title>
        <Sub>{fileName || 'Processing your demo...'}</Sub>

        <Steps>
          {steps.map((s, i) => (
            <Step
              key={i}
              $active={i === currentStep}
              $done={i < currentStep}
            >
              <StepDot $active={i === currentStep} $done={i < currentStep}>
                {i < currentStep ? <FiCheck size={14}/> : s.icon}
              </StepDot>
              <StepText>
                <StepLabel $active={i === currentStep} $done={i < currentStep}>{s.label}</StepLabel>
                <StepDesc>{s.desc}</StepDesc>
              </StepText>
              {i === currentStep && <Spinner/>}
              {i < currentStep && (
                <div style={{ color: '#2dd4bf', fontSize: '0.78rem', fontWeight: 600 }}>Done</div>
              )}
            </Step>
          ))}
        </Steps>

        <ProgressBar>
          <ProgressFill $pct={pct}/>
        </ProgressBar>
        <StatusText>{pct}% complete — please wait...</StatusText>
      </Card>
    </Page>
  );
}
