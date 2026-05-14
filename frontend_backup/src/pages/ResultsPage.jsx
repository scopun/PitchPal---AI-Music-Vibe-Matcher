import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FiAward, FiTarget, FiTag, FiTrendingUp, FiList, FiRefreshCw, FiCheck, FiBarChart2 } from 'react-icons/fi';

const shimmer = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`;

const Page = styled.div`
  min-height: 100vh;
  padding: 40px 20px 80px;
  display: flex; flex-direction: column; align-items: center;
  position: relative; z-index: 10;
`;

const TopBar = styled.div`
  width: 100%; max-width: 860px;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 32px;
`;

const TopLabel = styled.div`
  color: #475569; font-size: 0.85rem; font-weight: 600;
  display: flex; align-items: center; gap: 8px;
  span { color: white; }
`;

const NewBtn = styled(motion.button)`
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8; padding: 10px 18px; border-radius: 10px;
  font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.07); color: white; }
`;

const GenreRow = styled(motion.div)`
  width: 100%; max-width: 860px;
  display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px;
`;

const GenreTag = styled.span`
  background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.22);
  color: #a5b4fc; padding: 6px 14px; border-radius: 100px;
  font-size: 0.78rem; font-weight: 600;
  display: flex; align-items: center; gap: 6px;
`;

const WinCard = styled(motion.div)`
  width: 100%; max-width: 860px;
  background: rgba(10,12,35,0.85); backdrop-filter: blur(30px);
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: 24px; padding: 36px;
  box-shadow: 0 0 60px rgba(99,102,241,0.1);
  position: relative; overflow: hidden; margin-bottom: 20px;

  &::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #6366f1, #2dd4bf);
  }
`;

const WinTop = styled.div`display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;`;

const WinLeft = styled.div``;

const WinBadge = styled.div`
  display: inline-flex; align-items: center; gap: 7px;
  color: #a78bfa; font-size: 0.78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;
`;

const WinName = styled.h1`
  font-size: 3.5rem; font-weight: 800; margin: 0; line-height: 1;
  background: linear-gradient(to right, white, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
`;

const ScoreBox = styled.div`
  text-align: right;
  .num { font-size: 3rem; font-weight: 800; color: #2dd4bf; line-height: 1; text-shadow: 0 0 20px rgba(45,212,191,0.35); }
  .lbl { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; font-weight: 600; }
`;

const Reason = styled.div`
  font-size: 1.05rem; color: #cbd5e1; font-style: italic;
  padding: 20px 22px; border-left: 4px solid #6366f1;
  background: rgba(255,255,255,0.02); border-radius: 0 12px 12px 0;
  line-height: 1.7; margin-bottom: 24px;
`;

const PitchBox = styled.div`
  background: linear-gradient(135deg, rgba(99,102,241,0.07), rgba(45,212,191,0.04));
  border: 1px solid rgba(99,102,241,0.15); border-radius: 14px; padding: 20px;
  margin-bottom: 28px;
  h4 { margin: 0 0 10px; color: #a78bfa; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 7px; }
  p { margin: 0; color: white; font-size: 0.97rem; line-height: 1.6; font-weight: 500; }
`;

const TechGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;
  padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);
`;

const TechItem = styled.div`
  background: rgba(0,0,0,0.25); border-radius: 12px; padding: 14px;
  border: 1px solid rgba(255,255,255,0.04);
  .lbl { font-size: 0.72rem; text-transform: uppercase; color: #475569; font-weight: 700; letter-spacing: 1px; }
  .val { font-size: 1.3rem; color: white; font-weight: 800; margin: 4px 0 2px; }
  .sub { font-size: 0.75rem; color: #2dd4bf; }
`;

const Grid2 = styled.div`
  width: 100%; max-width: 860px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const AltCard = styled(motion.div)`
  background: rgba(15,18,45,0.7); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 18px; padding: 22px;
  display: flex; align-items: center; justify-content: space-between;
  transition: all 0.2s; cursor: default;
  &:hover { background: rgba(20,24,55,0.9); border-color: rgba(255,255,255,0.09); transform: translateY(-3px); }
`;

const AltLeft = styled.div`display: flex; align-items: center; gap: 12px;`;

const Rank = styled.div`
  width: 38px; height: 38px; border-radius: 10px;
  background: ${p => p.$r === 2 ? 'rgba(148,163,184,0.1)' : 'rgba(180,83,9,0.1)'};
  border: 1px solid ${p => p.$r === 2 ? 'rgba(148,163,184,0.2)' : 'rgba(180,83,9,0.2)'};
  color: ${p => p.$r === 2 ? '#94a3b8' : '#d97706'};
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 800;
`;

const AltName = styled.div`color: white; font-weight: 700; font-size: 1.2rem;`;
const AltGenre = styled.div`color: #475569; font-size: 0.78rem; margin-top: 2px;`;

const AltScore = styled.div`
  font-size: 1.6rem; font-weight: 800; color: #a78bfa;
`;

const TableCard = styled(motion.div)`
  width: 100%; max-width: 860px;
  background: rgba(10,12,35,0.8); backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 28px;
`;

const TRow = styled.div`
  display: grid; grid-template-columns: 48px 1fr 100px;
  padding: 14px 8px; border-bottom: 1px solid rgba(255,255,255,0.04);
  align-items: center;
  &:last-child { border: none; }
  &:hover { background: rgba(255,255,255,0.015); border-radius: 10px; }
`;

const THead = styled(TRow)`
  font-size: 0.73rem; text-transform: uppercase; letter-spacing: 1px;
  color: #475569; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.07);
  &:hover { background: none; }
`;

function pct(v) {
  if (!v || isNaN(v)) return '0';
  return v <= 1 ? (v * 100).toFixed(0) : parseFloat(v).toFixed(0);
}

export default function ResultsPage({ results, onReset }) {
  const matches = Array.isArray(results?.matches) ? results.matches : [];
  const tags = Array.isArray(results?.genre_tags) ? results.genre_tags : [];
  const pitch = results?.pitch_angle || '';
  const market = results?.market_fit || '';
  const genre = results?.detected_genre || '';
  const trackInfo = results?.track_info || {};

  const winner = matches[0] || {};
  const podium = matches.slice(1, 3);
  const rest = matches.slice(3);

  if (!matches.length) {
    return (
      <Page>
        <WinCard initial={{opacity:0,y:30}} animate={{opacity:1,y:0}}>
          <h2 style={{color:'#ef4444',margin:0}}>No results found</h2>
          <p style={{color:'#64748b'}}>Please try again with a different track.</p>
          <NewBtn onClick={onReset} whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
            <FiRefreshCw size={14}/> Try Again
          </NewBtn>
        </WinCard>
      </Page>
    );
  }

  return (
    <Page>
      <TopBar>
        <TopLabel>
          <FiAward size={15}/>
          Results for <span>{trackInfo.filename || 'your track'}</span>
          {trackInfo.bpm ? <span style={{color:'#475569'}}>· {trackInfo.bpm} BPM</span> : null}
        </TopLabel>
        <NewBtn onClick={onReset} whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
          <FiRefreshCw size={13}/> New Analysis
        </NewBtn>
      </TopBar>

      {(genre || tags.length > 0) && (
        <GenreRow initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          {genre && <GenreTag><FiTag size={11}/>{genre}</GenreTag>}
          {tags.map((t,i) => <GenreTag key={i}>{t}</GenreTag>)}
        </GenreRow>
      )}

      {/* Winner Card */}
      <WinCard initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
        <WinTop>
          <WinLeft>
            <WinBadge><FiAward size={13}/> Primary Artist Match</WinBadge>
            <WinName>{winner.artist || '—'}</WinName>
          </WinLeft>
          <ScoreBox>
            <div className="num">{pct(winner.final_score)}%</div>
            <div className="lbl">Match Score</div>
          </ScoreBox>
        </WinTop>

        <Reason>"{winner.reason}"</Reason>

        {pitch && (
          <PitchBox>
            <h4><FiTarget size={11}/> A&R Pitch Strategy</h4>
            <p>{pitch}</p>
          </PitchBox>
        )}

        {(trackInfo.bpm || trackInfo.energy !== undefined) && (
          <>
            <div style={{fontSize:'0.73rem',color:'#475569',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'7px'}}>
              <FiBarChart2 size={12}/> Audio Fingerprint
            </div>
            <TechGrid>
              <TechItem>
                <div className="lbl">Tempo</div>
                <div className="val">{trackInfo.bpm}</div>
                <div className="sub">BPM</div>
              </TechItem>
              <TechItem>
                <div className="lbl">Energy</div>
                <div className="val">{Math.round((trackInfo.energy || 0) * 100)}%</div>
                <div className="sub">Intensity</div>
              </TechItem>
              <TechItem>
                <div className="lbl">Genre</div>
                <div className="val" style={{fontSize:'0.95rem',marginTop:'6px'}}>{(results?.detected_genre || '—').split('/')[0].trim()}</div>
                <div className="sub">Detected</div>
              </TechItem>
            </TechGrid>
          </>
        )}
      </WinCard>

      {/* Podium */}
      {podium.length > 0 && (
        <>
          <div style={{width:'100%',maxWidth:'860px',color:'#64748b',fontSize:'0.78rem',textTransform:'uppercase',letterSpacing:'2px',margin:'4px 0 14px',display:'flex',alignItems:'center',gap:'8px'}}>
            <FiTrendingUp size={13}/> Close Alternatives
          </div>
          <Grid2>
            {podium.map((a, i) => (
              <AltCard key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1+i*0.08}}>
                <AltLeft>
                  <Rank $r={i+2}>#{i+2}</Rank>
                  <div>
                    <AltName>{a.artist}</AltName>
                    <AltGenre>{a.genre_fit}</AltGenre>
                  </div>
                </AltLeft>
                <AltScore>{pct(a.final_score)}%</AltScore>
              </AltCard>
            ))}
          </Grid2>
        </>
      )}

      {/* Full Table */}
      {rest.length > 0 && (
        <TableCard initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <div style={{color:'#64748b',fontSize:'0.78rem',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'18px',display:'flex',alignItems:'center',gap:'8px'}}>
            <FiList size={13}/> Full Ranking
          </div>
          <THead><span>#</span><span>Artist</span><span style={{textAlign:'right'}}>Score</span></THead>
          {rest.map((a, i) => (
            <TRow key={i}>
              <span style={{color:'#334155',fontWeight:700,fontFamily:'monospace'}}>0{i+4}</span>
              <span style={{color:'white',fontWeight:600}}>{a.artist}</span>
              <span style={{color:'#2dd4bf',fontWeight:700,textAlign:'right'}}>{pct(a.final_score)}%</span>
            </TRow>
          ))}
        </TableCard>
      )}

      {market && (
        <motion.div
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}
          style={{width:'100%',maxWidth:'860px',marginTop:'16px',background:'rgba(10,12,35,0.6)',border:'1px solid rgba(255,255,255,0.04)',borderRadius:'16px',padding:'20px 24px'}}
        >
          <div style={{fontSize:'0.73rem',color:'#475569',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'7px'}}>
            <FiCheck size={12}/> Market Fit
          </div>
          <p style={{color:'#94a3b8',fontSize:'0.9rem',lineHeight:'1.6',margin:0}}>{market}</p>
        </motion.div>
      )}
    </Page>
  );
}
