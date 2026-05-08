import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiMusic, FiUpload, FiBarChart2, FiSend, FiSun, FiCheck } from 'react-icons/fi';

const pulse = keyframes`0%,100%{opacity:.45}50%{opacity:.95}`;

const Page = styled.div`
  min-height: 100vh;
  background: transparent;
  font-family: 'Inter', sans-serif;
  color: white;
  overflow-x: hidden;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 64px;
  background: rgba(5, 5, 26, 0.55);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
  @media (max-width: 900px) {
    padding: 0 16px;
    height: 56px;
  }
`;
const NavLogo = styled.div`display:flex;align-items:center;gap:10px;font-size:1.1rem;font-weight:800;.dot{width:30px;height:30px;border-radius:7px;background:linear-gradient(135deg,#6366f1,#2dd4bf);display:flex;align-items:center;justify-content:center;}.pp{color:#2dd4bf;}`;
const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
  a {
    color: rgba(226, 232, 240, 0.65);
    font-size: 0.82rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    &:hover {
      color: rgba(255, 255, 255, 0.92);
    }
  }
  @media (max-width: 900px) {
    display: none;
  }
`;
const NavRight = styled.div`display:flex;align-items:center;gap:10px;@media (max-width: 900px){gap:8px;}`;
const SignInLink = styled.button`
  background: none;
  border: none;
  color: rgba(226, 232, 240, 0.65);
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  &:hover {
    color: rgba(255, 255, 255, 0.92);
  }
  @media (max-width: 900px) {
    font-size: 0.78rem;
    padding: 8px 10px;
  }
`;
const CreateBtn = styled.button`
  border: none;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 9px 16px;
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  box-shadow: 0 10px 28px rgba(124, 58, 237, 0.24);
  &:hover {
    filter: brightness(1.08);
    box-shadow: 0 14px 36px rgba(124, 58, 237, 0.32);
  }
  @media (max-width: 900px) {
    font-size: 0.8rem;
    padding: 9px 14px;
    border-radius: 10px;
  }
`;
const ThemeBtn = styled.button`
  background: none;
  border: none;
  color: rgba(226, 232, 240, 0.42);
  cursor: pointer;
  padding: 6px;
  &:hover {
    color: rgba(226, 232, 240, 0.72);
  }
  @media (max-width: 900px) {
    display: none;
  }
`;

const Hero = styled.div`
  display: grid;
  grid-template-columns: 1fr 460px;
  gap: 40px;
  padding: 58px 48px 26px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 900px) {
    gap: 26px;
    padding: 46px 18px 18px;
  }
`;

const HeroPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(45, 212, 191, 0.22);
  background: rgba(45, 212, 191, 0.06);
  border-radius: 100px;
  padding: 6px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(148, 255, 242, 0.78);
  margin-bottom: 22px;
  box-shadow: 0 10px 30px rgba(45, 212, 191, 0.06);
  @media (max-width: 900px) {
    margin-bottom: 16px;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2dd4bf;
    animation: ${pulse} 2s infinite;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.55rem;
  font-weight: 800;
  line-height: 1.12;
  margin: 0 0 18px;
  letter-spacing: -1.6px;
  .w {
    color: rgba(255, 255, 255, 0.95);
  }
  .c {
    color: #5eead4;
  }
  @media (max-width: 900px) {
    font-size: 2.25rem;
    letter-spacing: -1.2px;
  }
`;
const HeroDesc = styled.p`
  color: rgba(226, 232, 240, 0.62);
  font-size: 0.88rem;
  line-height: 1.75;
  margin: 0 0 22px;
  max-width: 420px;
  strong {
    color: rgba(226, 232, 240, 0.78);
  }
  @media (max-width: 900px) {
    margin-bottom: 18px;
  }
`;
const HeroBtns = styled.div`display:flex;gap:12px;margin-bottom:18px;`;
const PrimaryBtn = styled.button`
  border: none;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 12px 22px;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  box-shadow: 0 18px 50px rgba(124, 58, 237, 0.18);
  &:hover {
    filter: brightness(1.08);
    box-shadow: 0 22px 60px rgba(124, 58, 237, 0.26);
  }
`;
const SecondaryBtn = styled.button`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 12px 22px;
  border-radius: 12px;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.14);
  }
`;
const Checks = styled.div`display:flex;gap:22px;flex-wrap:wrap;`;
const CheckItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(226, 232, 240, 0.62);
  font-size: 0.8rem;
  svg {
    color: #2dd4bf;
  }
`;

const LoginCard = styled(motion.div)`
  background: rgba(12, 10, 31, 0.72);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(124, 58, 237, 0.22);
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 36px 110px rgba(0, 0, 0, 0.62);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: radial-gradient(500px 240px at 75% 20%, rgba(124, 58, 237, 0.22), rgba(124, 58, 237, 0) 70%);
    pointer-events: none;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
  @media (max-width: 900px) {
    padding: 22px 18px;
    border-radius: 18px;
  }
`;
const CardTitle = styled.h2`font-size:1.25rem;font-weight:800;color:white;margin:0 0 4px;letter-spacing:-0.3px;@media (max-width: 900px){font-size:1.15rem;}`;
const CardSub = styled.p`color:rgba(226,232,240,0.55);font-size:0.85rem;margin:0 0 12px;@media (max-width: 900px){font-size:0.82rem;margin-bottom:10px;}`;
const SocRow = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;`;
const SocBtn = styled.button`
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: all 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }
  @media (max-width: 900px) {
    padding: 10px 9px;
    font-size: 0.8rem;
  }
`;
const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
  color: rgba(226, 232, 240, 0.38);
  font-size: 0.78rem;
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }
  @media (max-width: 900px) {
    margin: 8px 0;
  }
`;
const IWrap = styled.div`position:relative;margin-bottom:10px;.ic{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#475569;pointer-events:none;}.tog{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#475569;cursor:pointer;background:none;border:none;}`;
const Inp = styled.input`
  width: 100%;
  padding: 9px 11px 9px 40px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.92);
  font-family: 'Inter', sans-serif;
  font-size: 0.87rem;
  box-sizing: border-box;
  transition: all 0.2s;
  &::placeholder {
    color: rgba(226, 232, 240, 0.32);
  }
  &:focus {
    outline: none;
    border-color: rgba(124, 58, 237, 0.55);
    background: rgba(124, 58, 237, 0.07);
  }
`;
const RemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(226, 232, 240, 0.5);
    font-size: 0.8rem;
    cursor: pointer;
    input {
      accent-color: #7c3aed;
    }
  }
  a {
    color: rgba(124, 58, 237, 0.95);
    font-size: 0.8rem;
    text-decoration: none;
    cursor: pointer;
    &:hover {
      color: rgba(167, 139, 250, 0.95);
    }
  }
`;
const SignBtn = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 12px;
  box-shadow: 0 18px 50px rgba(124, 58, 237, 0.18);
  &:hover {
    filter: brightness(1.08);
  }
`;
const RegTxt = styled.p`
  text-align: center;
  color: rgba(226, 232, 240, 0.38);
  font-size: 0.78rem;
  margin: 0;
  a {
    color: #5eead4;
    text-decoration: none;
    font-weight: 700;
    cursor: pointer;
    &:hover {
      color: #99f6e4;
    }
  }
`;

const StatsBar = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.015);
  backdrop-filter: blur(18px);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`;
const Stat = styled.div`padding:20px 20px;text-align:center;border-right:1px solid rgba(255,255,255,0.05);&:last-child{border-right:none;}`;
const StatNum = styled.div`
  font-size: 2.15rem;
  font-weight: 900;
  color: rgba(167, 139, 250, 0.95);
  letter-spacing: -1px;
  margin-bottom: 5px;
`;
const StatLabel = styled.div`color:rgba(226,232,240,0.5);font-size:0.8rem;`;

const Section = styled.div`max-width:1200px;margin:0 auto;padding:44px 48px;`;
const SectionTag = styled.div`text-align:center;color:rgba(167,139,250,0.9);font-size:0.75rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;`;
const SectionTitle = styled.h2`font-size:2.2rem;font-weight:800;color:white;text-align:center;margin:0 0 12px;letter-spacing:-1px;`;
const SectionSub = styled.p`color:rgba(226,232,240,0.55);text-align:center;font-size:0.92rem;line-height:1.7;margin:0 auto 30px;max-width:540px;`;
const StepsGrid = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:18px;@media(max-width:800px){grid-template-columns:1fr 1fr;}`;
const StepCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 18px;
  padding: 18px 18px;
  transition: all 0.2s;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  &:hover {
    background: rgba(124, 58, 237, 0.06);
    border-color: rgba(124, 58, 237, 0.18);
  }
`;
const StepIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(226, 232, 240, 0.72);
  margin-bottom: 12px;
`;
const StepTitle = styled.div`font-size:0.9rem;font-weight:700;color:white;margin-bottom:5px;`;
const StepDesc = styled.div`font-size:0.78rem;color:rgba(226,232,240,0.5);line-height:1.55;`;

const WhoSection = styled.div`background:rgba(255,255,255,0.012);border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);`;
const CardsGrid = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:18px;@media(max-width:700px){grid-template-columns:1fr;}`;
const WhoCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 18px;
  padding: 18px 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
`;
const WhoIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(226, 232, 240, 0.72);
  margin-bottom: 10px;
`;
const WhoTitle = styled.div`font-size:0.97rem;font-weight:700;color:white;margin-bottom:9px;`;
const WhoDesc = styled.div`font-size:0.8rem;color:rgba(226,232,240,0.5);line-height:1.6;`;

const Footer = styled.footer`display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-top:1px solid rgba(255,255,255,0.05);`;
const FootLogo = styled.div`display:flex;align-items:center;gap:8px;font-size:0.92rem;font-weight:700;.dot{width:24px;height:24px;border-radius:6px;background:linear-gradient(135deg,#6366f1,#2dd4bf);display:flex;align-items:center;justify-content:center;}.pp{color:#2dd4bf;}`;
const FootLinks = styled.div`display:flex;gap:22px;a{color:#475569;font-size:0.8rem;text-decoration:none;cursor:pointer;&:hover{color:#94a3b8;}}`;
const FootCopy = styled.div`color:#334155;font-size:0.78rem;`;

const steps = [
  { icon: <FiUpload size={18}/>, title: 'Upload your track', desc: 'Drag and drop any audio file — MP3, WAV, FLAC, AAC, or M4A. No file prep needed.' },
  { icon: <FiBarChart2 size={18}/>, title: 'AI analyses the audio', desc: "PitchPal extracts lyrics automatically and reads genre, mood, key, BPM, and musical features." },
  { icon: <FiMusic size={18}/>, title: 'Matches are found', desc: 'The AI cross-references 100k+ artists and returns the best-fit matches with a compatibility score.' },
  { icon: <FiSend size={18}/>, title: 'Pitch with confidence', desc: 'Each match includes an AI-written insight and a one-click pitch button personalised to the artist.' },
];

const who = [
  { icon: <FiMusic size={17}/>, title: 'Songwriters', desc: "You wrote it — now get it heard. Upload your demos and discover which established artists are a natural fit for your sound and style." },
  { icon: <FiBarChart2 size={17}/>, title: 'Music Managers', desc: "Pitch your clients' songs smarter. Get AI-powered match scores and insights that make it easy to make the case to the right A&R contacts." },
  { icon: <FiUpload size={17}/>, title: 'Publishers', desc: 'Manage a catalogue? PitchPal helps you identify artist opportunities across your entire roster — fast, at scale, and backed by data.' },
];

export default function LoginPage({ onLogin }) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const doLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onLogin({ name: 'Demo User', email: email || 'demo@pitchpal.co.uk' });
  };

  return (
    <Page>
      <Nav>
        <NavLogo>
          <div className="dot"><FiMusic size={14} color="white"/></div>
          <span>Pitch<span className="pp">Pal</span></span>
        </NavLogo>
        <NavLinks>
          <a>About Us</a><a>How it works</a><a>Who it's for</a>
        </NavLinks>
        <NavRight>
          <SignInLink>Sign in</SignInLink>
          <CreateBtn onClick={doLogin}>Create account</CreateBtn>
          <ThemeBtn><FiSun size={15}/></ThemeBtn>
        </NavRight>
      </Nav>

      <Hero>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
          <HeroPill><span className="dot"/>&nbsp;AI-Powered Song Matching</HeroPill>
          <HeroTitle>
            <span className="w">Pitch the right songs<br/>to the </span>
            <span className="c">right artists</span>
          </HeroTitle>
          <HeroDesc>PitchPal uses AI to match your tracks to artists who are actively looking for songs like yours. Built for <strong>songwriters, music managers,</strong> and <strong>publishers</strong> who want their music heard by the right people — faster.</HeroDesc>
          <HeroBtns>
            <PrimaryBtn onClick={doLogin}>Get started free</PrimaryBtn>
            <SecondaryBtn>See how it works</SecondaryBtn>
          </HeroBtns>
          <Checks>
            {['Auto lyrics extraction','100k+ artist database','Results in seconds'].map((t,i) => (
              <CheckItem key={i}><FiCheck size={12}/>{t}</CheckItem>
            ))}
          </Checks>
        </motion.div>

        <LoginCard initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.15}}>
          <CardTitle>Welcome back</CardTitle>
          <CardSub>Sign in to start pitching your songs</CardSub>
          <SocRow>
            <SocBtn type="button">
              <svg width="15" height="15" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
              Login with Google
            </SocBtn>
            <SocBtn type="button">
              <svg width="15" height="15" viewBox="0 0 814 1000" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 71 0 130.5 46.4 174.9 46.4 42.7 0 109.2-49 192.5-49 31.5 0 108.2 2.6 164 97.1zm-234.6-172.7c31.5-37.6 54.2-89.9 54.2-142.2 0-7.1-.6-14.3-1.9-20.1-51.3 1.9-112.3 34.1-149.2 75.8-28.5 32.4-55.1 84.7-55.1 138.3 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 46.5 0 102.5-30.4 136.5-71.2z"/></svg>
              Login with Apple
            </SocBtn>
          </SocRow>
          <Divider>or Sign in with Email</Divider>
          <form onSubmit={doLogin}>
            <IWrap>
              <FiMail size={13} className="ic"/>
              <Inp type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/>
            </IWrap>
            <IWrap>
              <FiLock size={13} className="ic"/>
              <Inp type={showPass?'text':'password'} placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} style={{paddingRight:'40px'}}/>
              <button type="button" className="tog" onClick={()=>setShowPass(!showPass)}>
                {showPass?<FiEyeOff size={13}/>:<FiEye size={13}/>}
              </button>
            </IWrap>
            <RemRow>
              <label><input type="checkbox" defaultChecked/> Remember me</label>
              <a>Forgot Password?</a>
            </RemRow>
            <SignBtn type="submit">Sign in to PitchPal</SignBtn>
          </form>
          <RegTxt>Not registered yet? <a onClick={doLogin}>Create an Account</a></RegTxt>
        </LoginCard>
      </Hero>

      <StatsBar>
        {[['100k+','Artists in database'],['12','Matches per track, average'],['<10s','Time to results']].map(([n,l],i)=>(
          <Stat key={i}><StatNum>{n}</StatNum><StatLabel>{l}</StatLabel></Stat>
        ))}
      </StatsBar>

      <Section>
        <SectionTag>How PitchPal Works</SectionTag>
        <SectionTitle>Four steps to the right pitch</SectionTitle>
        <SectionSub>Upload your song and PitchPal's AI analyses the audio, extracts lyrics, and surfaces the best-matched artists in seconds.</SectionSub>
        <StepsGrid>
          {steps.map((s,i)=>(
            <StepCard key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
              <StepIcon>{s.icon}</StepIcon>
              <StepTitle>{s.title}</StepTitle>
              <StepDesc>{s.desc}</StepDesc>
            </StepCard>
          ))}
        </StepsGrid>
      </Section>

      <WhoSection>
        <Section style={{paddingTop:'40px',paddingBottom:'40px'}}>
          <SectionTag>Who PitchPal is for</SectionTag>
          <SectionTitle>Built for everyone in the song's journey</SectionTitle>
          <SectionSub>Whether you wrote the track, manage the writer, or represent the catalogue — PitchPal gives you the edge.</SectionSub>
          <CardsGrid>
            {who.map((w,i)=>(
              <WhoCard key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.09}}>
                <WhoIcon>{w.icon}</WhoIcon>
                <WhoTitle>{w.title}</WhoTitle>
                <WhoDesc>{w.desc}</WhoDesc>
              </WhoCard>
            ))}
          </CardsGrid>
        </Section>
      </WhoSection>

      <Footer>
        <FootLogo>
          <div className="dot"><FiMusic size={12} color="white"/></div>
          <span>Pitch<span className="pp">Pal</span></span>
        </FootLogo>
        <FootLinks><a>Privacy Policy</a><a>Terms of Service</a><a>Contact</a></FootLinks>
        <FootCopy>© 2026 PitchPal. All rights reserved.</FootCopy>
      </Footer>
    </Page>
  );
}
