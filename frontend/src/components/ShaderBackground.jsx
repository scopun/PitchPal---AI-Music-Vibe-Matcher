import styled, { keyframes } from 'styled-components';

const moveGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Bg = styled.div`
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: -10;
  background: linear-gradient(-45deg, #020617, #0d0f2e, #1a0a3e, #0a1628);
  background-size: 400% 400%;
  animation: ${moveGradient} 20s ease infinite;
`;

const Overlay = styled.div`
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: -9;
  background: rgba(0,0,0,0.35);
`;

export default function ShaderBackground() {
  return <><Bg /><Overlay /></>;
}
