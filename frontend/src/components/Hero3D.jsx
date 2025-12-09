import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Wrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -5; /* Sits above the Shader Background (-10) but below text */
  overflow: hidden;
  pointer-events: none; /* Allows clicking through the 3D model to buttons behind it */
  
  /* On mobile, we might want to hide it or reduce opacity */
  @media (max-width: 768px) {
    opacity: 0.5;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.8rem;
  letter-spacing: 2px;
`;

export default function Hero3D() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Wrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {isLoading && <LoadingOverlay>LOADING 3D SCENE...</LoadingOverlay>}
      
      {/* NOTE: This is a placeholder Spline scene (Abstract Shapes).
         To customize: 
         1. Go to spline.design 
         2. Create/Export a scene 
         3. Copy the "Code Export" URL and paste it below.
      */}
      <Spline 
        scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
        onLoad={() => setIsLoading(false)}
      />
    </Wrapper>
  );
}