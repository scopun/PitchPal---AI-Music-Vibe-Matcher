import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiList, FiActivity, FiTag, FiBarChart2, FiTarget, FiGlobe } from 'react-icons/fi';

const Wrapper = styled(motion.div)`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  font-family: 'Inter', sans-serif;
`;

// --- The Winner Card (Gold) ---
const WinnerCard = styled.div`
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(40px);
  border-radius: 30px;
  padding: 40px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 60px rgba(139, 92, 246, 0.15);
  position: relative;
  overflow: hidden;

  &::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #8b5cf6, #2dd4bf);
  }
`;

const HeaderFlex = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;
`;

const WinnerName = styled.h1`
  font-size: 4.5rem; margin: 0;
  background: linear-gradient(to right, #fff, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  font-weight: 800; letter-spacing: -2px; line-height: 1.1;
`;

const ScoreBadge = styled.div`
  text-align: right;
  div.num { font-size: 3.5rem; font-weight: 800; color: #2dd4bf; line-height: 1; text-shadow: 0 0 20px rgba(45, 212, 191, 0.4); }
  div.txt { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px; font-weight: 600; }
`;

const ReasonText = styled.div`
  font-size: 1.15rem; color: #cbd5e1; font-style: italic;
  padding: 25px; background: rgba(255,255,255,0.03);
  border-left: 5px solid #8b5cf6; border-radius: 0 16px 16px 0;
  line-height: 1.7; margin-bottom: 25px;
`;

// --- NEW: Investor Pitch Section ---
const PitchStrategyBox = styled.div`
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(45, 212, 191, 0.05));
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px; padding: 25px; margin-bottom: 30px;
  
  h4 { margin: 0 0 12px; color: #a78bfa; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
  p { margin: 0; color: white; font-size: 1.1rem; line-height: 1.6; font-weight: 500; }
`;

const TagsRow = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;
`;

const TagChip = styled.span`
  background: rgba(255, 255, 255, 0.05); color: #e2e8f0;
  padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex; align-items: center; gap: 6px;
`;

const MarketFitChip = styled(TagChip)`
  background: rgba(45, 212, 191, 0.1); color: #5eead4; border-color: rgba(45, 212, 191, 0.3);
`;

// --- Tech Specs Grid ---
const TechGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;
  margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 25px;
`;

const TechItem = styled.div`
  background: rgba(0,0,0,0.3); border-radius: 16px; padding: 15px;
  display: flex; flex-direction: column; gap: 5px;
  border: 1px solid rgba(255,255,255,0.05);

  span.label { font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; }
  span.val { font-size: 1.4rem; color: white; font-weight: 700; }
  span.sub { font-size: 0.8rem; color: #2dd4bf; }
`;

// --- Podium Grid (2nd & 3rd Place) ---
const PodiumGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  @media(max-width: 600px) { grid-template-columns: 1fr; }
`;

const AltCard = styled.div`
  background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px; padding: 25px; display: flex; align-items: center; justify-content: space-between;
  transition: transform 0.2s;
  &:hover { transform: translateY(-5px); background: rgba(30, 41, 59, 0.8); border-color: rgba(255,255,255,0.1); }
`;

const RankCircle = styled.div`
  width: 45px; height: 45px; border-radius: 50%;
  background: ${p => p.rank === 2 ? '#94a3b8' : '#b45309'}; 
  color: white; font-weight: bold; display: flex; align-items: center; justify-content: center;
  margin-right: 15px; font-size: 1.2rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
`;

// --- Tracklist Table ---
const TableCard = styled.div`
  background: rgba(15, 23, 42, 0.6); border-radius: 24px; padding: 30px;
  border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px);
`;

const Row = styled.div`
  display: grid; grid-template-columns: 0.5fr 3fr 1fr 1fr; padding: 18px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center;
  &:last-child { border: none; }
  &:hover { background: rgba(255,255,255,0.02); }
  
  span.rank { color: #64748b; font-weight: bold; font-family: monospace; font-size: 1.1rem; }
  span.name { color: white; font-weight: 600; font-size: 1.1rem; }
  span.score { color: #2dd4bf; font-weight: 700; text-align: right; }
  span.lyric { color: #a5b4fc; font-weight: 500; text-align: right; opacity: 0.8; }
`;

const TableHeader = styled(Row)`
  text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; color: #94a3b8; font-weight: 700;
  border-bottom: 2px solid rgba(255,255,255,0.1); margin-bottom: 10px;
  &:hover { background: transparent; }
`;

export default function ResultCard({ results }) {
  // Extract the specific fields from the new Claude Opus JSON
  const matchArray = results.matches || [];
  const pitchAngle = results.pitch_angle || "A unique sonic blend ready for market.";
  const marketFit = results.market_fit || "Global";
  const genreTags = results.genre_tags || [];

  if (!matchArray || matchArray.length === 0) return null; 

  const winner = matchArray[0];
  const podium = matchArray.slice(1, 3);
  const rest = matchArray.slice(3, 8); 

  // Parse scores safely
  const parseScore = (val) => val <= 1 ? (val * 100).toFixed(0) : parseFloat(val).toFixed(0);
  const tech = winner.tech_comparison || { user_bpm: "--", artist_bpm: "--", user_energy: 0, artist_energy: 0 };
  
  return (
    <Wrapper initial={{opacity:0, y:50}} animate={{opacity:1, y:0}} transition={{duration:0.6}}>
      
      {/* 🏆 #1 Winner Main Card */}
      <WinnerCard>
        <HeaderFlex>
          <div>
            <h4 style={{margin:'0 0 12px', color:'#a78bfa', display:'flex', alignItems:'center', gap:8, textTransform:'uppercase', fontSize:'0.85rem', fontWeight:700, letterSpacing:'1px'}}>
              <FiAward /> Primary Artist Match
            </h4>
            <WinnerName>{winner.artist}</WinnerName>
          </div>
          <ScoreBadge>
            <div className="num">{parseScore(winner.final_score)}%</div>
            <div className="txt">Match Score</div>
          </ScoreBadge>
        </HeaderFlex>

        {/* Dynamic Tags */}
        <TagsRow>
          <MarketFitChip><FiGlobe /> {marketFit}</MarketFitChip>
          {genreTags.map((tag, i) => (
            <TagChip key={i}><FiTag /> {tag}</TagChip>
          ))}
        </TagsRow>

        {/* The Claude Opus Reasoning */}
        <ReasonText>"{winner.reason}"</ReasonText>

        {/* The New Pitch Angle Block */}
        <PitchStrategyBox>
          <h4><FiTarget /> A&R Pitch Strategy</h4>
          <p>{pitchAngle}</p>
        </PitchStrategyBox>

        {/* Tech Specs Section */}
        <h4 style={{margin:'0 0 10px', color:'#94a3b8', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'1px'}}>
          <FiBarChart2 style={{marginRight:8, position:'relative', top:1}}/> Audio Fingerprint Analysis
        </h4>
        <TechGrid>
          <TechItem>
            <span className="label">Tempo</span>
            <span className="val">{tech.artist_bpm} BPM</span>
            <span className="sub">Target vs {tech.user_bpm} (You)</span>
          </TechItem>
          <TechItem>
            <span className="label">Energy</span>
            <span className="val">{tech.artist_energy <= 1 ? Math.round(tech.artist_energy * 100) : tech.artist_energy}%</span>
            <span className="sub">Intensity Match</span>
          </TechItem>
          <TechItem>
            <span className="label">Lyrical Fit</span>
            <span className="val" style={{color:'#a5b4fc'}}>{parseScore(winner.lyrical_score)}%</span>
            <span className="sub">Thematic Resonance</span>
          </TechItem>
        </TechGrid>

      </WinnerCard>

      {/* 🥈🥉 Runners Up */}
      <h3 style={{color:'#94a3b8', fontSize:'0.9rem', textTransform:'uppercase', margin:'10px 0 0', letterSpacing:'2px'}}><FiTrendingUp style={{marginRight:8, position:'relative', top:1}}/> Close Alternatives</h3>
      <PodiumGrid>
        {podium.map((artist, idx) => (
          <AltCard key={idx}>
            <div style={{display:'flex', alignItems:'center'}}>
              <RankCircle rank={idx + 2}>#{idx + 2}</RankCircle>
              <div>
                <div style={{color:'#94a3b8', fontSize:'0.75rem', textTransform:'uppercase', fontWeight:700, letterSpacing:'1px'}}>Artist</div>
                <div style={{color:'white', fontWeight:700, fontSize:'1.5rem'}}>{artist.artist}</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{color:'#a78bfa', fontWeight:800, fontSize:'1.8rem'}}>{parseScore(artist.final_score)}%</div>
              <div style={{color:'#64748b', fontSize:'0.75rem', fontWeight:600}}>MATCH</div>
            </div>
          </AltCard>
        ))}
      </PodiumGrid>

      {/* 📋 Data Table */}
      <TableCard>
        <h4 style={{margin:'0 0 20px', color:'#94a3b8', display:'flex', alignItems:'center', gap:10, textTransform:'uppercase', fontSize:'0.9rem', letterSpacing:'1px'}}>
          <FiList/> Full Roster Ranking
        </h4>
        
        <TableHeader>
          <span>#</span>
          <span>Artist Name</span>
          <span style={{textAlign:'right'}}>Total Score</span>
          <span style={{textAlign:'right'}}>Lyrical Fit</span>
        </TableHeader>

        {rest.map((artist, idx) => (
          <Row key={idx}>
            <span className="rank">0{idx + 4}</span>
            <span className="name">{artist.artist}</span>
            <span className="score">{parseScore(artist.final_score)}%</span>
            <span className="lyric">{parseScore(artist.lyrical_score)}%</span>
          </Row>
        ))}
      </TableCard>

    </Wrapper>
  );
}