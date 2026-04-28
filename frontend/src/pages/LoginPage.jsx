import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiMusic, FiUpload, FiBarChart2, FiSend, FiSun, FiCheck } from 'react-icons/fi';

const pulse = keyframes`0%,100%{opacity:.4}50%{opacity:.9}`;

const Page = styled.div`min-height:100vh;background:#0d0d1a;font-family:'Inter',sans-serif;color:white;overflow-x:hidden;`;

const Nav = styled.nav`display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(13,13,26,0.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.05);position:sticky;top:0;z-index:100;`;
const NavLogo = styled.div`display:flex;align-items:center;gap:10px;font-size:1.1rem;font-weight:800;.dot{width:30px;height:30px;border-radius:7px;background:linear-gradient(135deg,#6366f1,#2dd4bf);display:flex;align-items:center;justify-content:center;}.pp{color:#2dd4bf;}`;
const NavLinks = styled.div`display:flex;align-items:center;gap:28px;a{color:#64748b;font-size:0.87rem;font-weight:500;text-decoration:none;cursor:pointer;&:hover{color:white;}}`;
const NavRight = styled.div`display:flex;align-items:center;gap:10px;`;
const SignInLink = styled.button`background:none;border:none;color:#64748b;font-family:'Inter',sans-serif;font-size:0.87rem;font-weight:500;cursor:pointer;padding:8px 12px;&:hover{color:white;}`;
const CreateBtn = styled.button`background:#6366f1;border:none;color:white;font-family:'Inter',sans-serif;font-size:0.87rem;font-weight:600;padding:9px 18px;border-radius:8px;cursor:pointer;&:hover{background:#4f46e5;}`;
const ThemeBtn = styled.button`background:none;border:none;color:#475569;cursor:pointer;padding:6px;&:hover{color:#94a3b8;}`;

const Hero = styled.div`display:grid;grid-template-columns:1fr 460px;gap:60px;padding:72px 48px;max-width:1200px;margin:0 auto;align-items:start;@media(max-width:900px){grid-template-columns:1fr;}`;

const HeroPill = styled.div`display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(99,102,241,0.3);border-radius:100px;padding:6px 14px;font-size:0.73rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#a5b4fc;margin-bottom:22px;.dot{width:6px;height:6px;border-radius:50%;background:#6366f1;animation:${pulse} 2s infinite;}`;

const HeroTitle = styled.h1`font-size:3rem;font-weight:800;line-height:1.1;margin:0 0 18px;letter-spacing:-1.5px;.w{color:white;}.c{color:#2dd4bf;}`;
const HeroDesc = styled.p`color:#64748b;font-size:0.95rem;line-height:1.7;margin:0 0 28px;max-width:420px;strong{color:#94a3b8;}`;
const HeroBtns = styled.div`display:flex;gap:12px;margin-bottom:32px;`;
const PrimaryBtn = styled.button`background:#6366f1;border:none;color:white;font-family:'Inter',sans-serif;font-size:0.9rem;font-weight:600;padding:12px 22px;border-radius:8px;cursor:pointer;&:hover{background:#4f46e5;}`;
const SecondaryBtn = styled.button`background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;font-family:'Inter',sans-serif;font-size:0.9rem;font-weight:600;padding:12px 22px;border-radius:8px;cursor:pointer;&:hover{background:rgba(255,255,255,0.09);}`;
const Checks = styled.div`display:flex;gap:22px;flex-wrap:wrap;`;
const CheckItem = styled.div`display:flex;align-items:center;gap:6px;color:#64748b;font-size:0.8rem;svg{color:#2dd4bf;}`;

const LoginCard = styled(motion.div)`background:rgba(18,18,38,0.95);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:32px;box-shadow:0 30px 80px rgba(0,0,0,0.5);`;
const CardTitle = styled.h2`font-size:1.5rem;font-weight:800;color:white;margin:0 0 5px;letter-spacing:-0.3px;`;
const CardSub = styled.p`color:#64748b;font-size:0.85rem;margin:0 0 22px;`;
const SocRow = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;`;
const SocBtn = styled.button`padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);color:white;font-family:'Inter',sans-serif;font-size:0.82rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all 0.2s;&:hover{background:rgba(255,255,255,0.07);}`;
const Divider = styled.div`display:flex;align-items:center;gap:12px;margin:16px 0;color:#334155;font-size:0.78rem;&::before,&::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.06);}`;
const IWrap = styled.div`position:relative;margin-bottom:10px;.ic{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#475569;pointer-events:none;}.tog{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#475569;cursor:pointer;background:none;border:none;}`;
const Inp = styled.input`width:100%;padding:11px 11px 11px 40px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;color:white;font-family:'Inter',sans-serif;font-size:0.87rem;box-sizing:border-box;transition:all 0.2s;&::placeholder{color:#2d3748;}&:focus{outline:none;border-color:rgba(99,102,241,0.5);background:rgba(99,102,241,0.04);}`;
const RemRow = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;label{display:flex;align-items:center;gap:6px;color:#64748b;font-size:0.8rem;cursor:pointer;input{accent-color:#6366f1;}}a{color:#6366f1;font-size:0.8rem;text-decoration:none;cursor:pointer;&:hover{color:#818cf8;}}`;
const SignBtn = styled.button`width:100%;padding:12px;border-radius:8px;border:none;background:#6366f1;color:white;font-family:'Inter',sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer;margin-bottom:12px;&:hover{background:#4f46e5;}`;
const RegTxt = styled.p`text-align:center;color:#475569;font-size:0.8rem;margin:0;a{color:#2dd4bf;text-decoration:none;font-weight:600;cursor:pointer;&:hover{color:#5eead4;}}`;

const StatsBar = styled.div`border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.02);display:grid;grid-template-columns:1fr 1fr 1fr;`;
const Stat = styled.div`padding:32px 20px;text-align:center;border-right:1px solid rgba(255,255,255,0.05);&:last-child{border-right:none;}`;
const StatNum = styled.div`font-size:2.6rem;font-weight:800;color:#6366f1;letter-spacing:-1px;margin-bottom:5px;`;
const StatLabel = styled.div`color:#64748b;font-size:0.83rem;`;

const Section = styled.div`max-width:1200px;margin:0 auto;padding:72px 48px;`;
const SectionTag = styled.div`text-align:center;color:#6366f1;font-size:0.75rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;`;
const SectionTitle = styled.h2`font-size:2.2rem;font-weight:800;color:white;text-align:center;margin:0 0 12px;letter-spacing:-1px;`;
const SectionSub = styled.p`color:#64748b;text-align:center;font-size:0.92rem;line-height:1.7;margin:0 auto 48px;max-width:500px;`;
const StepsGrid = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:18px;@media(max-width:800px){grid-template-columns:1fr 1fr;}`;
const StepCard = styled(motion.div)`background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:26px 22px;transition:all 0.2s;&:hover{background:rgba(99,102,241,0.05);border-color:rgba(99,102,241,0.2);}`;
const StepIcon = styled.div`width:44px;height:44px;border-radius:11px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.18);display:flex;align-items:center;justify-content:center;color:#818cf8;margin-bottom:18px;`;
const StepTitle = styled.div`font-size:0.93rem;font-weight:700;color:white;margin-bottom:8px;`;
const StepDesc = styled.div`font-size:0.8rem;color:#64748b;line-height:1.6;`;

const WhoSection = styled.div`background:rgba(255,255,255,0.015);border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);`;
const CardsGrid = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:18px;@media(max-width:700px){grid-template-columns:1fr;}`;
const WhoCard = styled(motion.div)`background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:26px 22px;`;
const WhoIcon = styled.div`width:42px;height:42px;border-radius:10px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.18);display:flex;align-items:center;justify-content:center;color:#818cf8;margin-bottom:16px;`;
const WhoTitle = styled.div`font-size:0.97rem;font-weight:700;color:white;margin-bottom:9px;`;
const WhoDesc = styled.div`font-size:0.8rem;color:#64748b;line-height:1.6;`;

const Footer = styled.footer`display:flex;align-items:center;justify-content:space-between;padding:22px 48px;border-top:1px solid rgba(255,255,255,0.05);`;
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
        <Section style={{paddingTop:'64px',paddingBottom:'64px'}}>
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
