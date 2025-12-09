import React from 'react';
import styled, { keyframes } from 'styled-components';

const moveGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const BackgroundContainer = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: -10;
  /* Deep Midnight Gradient: Black, Navy, Deep Purple */
  background: linear-gradient(-45deg, #020617, #1e1b4b, #312e81, #0f172a);
  background-size: 400% 400%;
  animation: ${moveGradient} 20s ease infinite;
`;

const GlassOverlay = styled.div`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  backdrop-filter: blur(80px); /* Heavy blur for soft look */
  background: rgba(0, 0, 0, 0.4);
  z-index: -9;
`;

const ShaderBackground = () => (
  <>
    <BackgroundContainer />
    <GlassOverlay />
  </>
);

export default ShaderBackground;