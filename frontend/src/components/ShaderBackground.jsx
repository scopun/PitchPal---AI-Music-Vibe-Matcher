import styled from 'styled-components';

const Bg = styled.div`
  position: fixed;
  inset: 0;
  z-index: -10;
  background:
    radial-gradient(900px 520px at 8% 2%, rgba(124, 58, 237, 0.45) 0%, rgba(124, 58, 237, 0.0) 60%),
    radial-gradient(760px 520px at 92% 10%, rgba(79, 70, 229, 0.35) 0%, rgba(79, 70, 229, 0.0) 62%),
    radial-gradient(900px 680px at 50% 92%, rgba(45, 212, 191, 0.12) 0%, rgba(45, 212, 191, 0.0) 66%),
    linear-gradient(180deg, #05051a 0%, #05051a 30%, #040313 100%);

  @media (max-width: 600px) {
    background:
      radial-gradient(700px 420px at 15% 0%, rgba(124, 58, 237, 0.4) 0%, rgba(124, 58, 237, 0.0) 62%),
      radial-gradient(620px 420px at 95% 0%, rgba(79, 70, 229, 0.32) 0%, rgba(79, 70, 229, 0.0) 64%),
      radial-gradient(700px 520px at 50% 100%, rgba(45, 212, 191, 0.1) 0%, rgba(45, 212, 191, 0.0) 68%),
      linear-gradient(180deg, #05051a 0%, #05051a 35%, #040313 100%);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: -9;
  background:
    radial-gradient(900px 520px at 22% 22%, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.0) 58%),
    rgba(0, 0, 0, 0.38);

  @media (max-width: 600px) {
    background:
      radial-gradient(700px 420px at 25% 15%, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.0) 60%),
      rgba(0, 0, 0, 0.4);
  }
`;

export default function ShaderBackground() {
  return (
    <>
      <Bg />
      <Overlay />
    </>
  );
}
