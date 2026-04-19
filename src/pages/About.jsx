import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import api from '../utils/api';
import RichText from '../components/RichText';
import './About.css';

import { getImageUrl } from '../utils/imageUrl';

const imgUrl = (img) => getImageUrl(img);

export default function About() {
  const [c, setC] = useState(null);

  useEffect(() => {
    api.get('/site-content').then(r => setC(r.data)).catch(() => setC({}));
  }, []);

  const d = c || {};

  return (
    <div className="about-page">
      <div className="page-hero" style={imgUrl(d.aboutHeroImage) ? { backgroundImage: `url(${imgUrl(d.aboutHeroImage)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="container">
          <p className="section-tag">{d.aboutHeroTag || 'Our Story'}</p>
          <h1 className="section-title">About <span>Everest Auto Hub</span></h1>
          <p className="section-subtitle">{d.aboutHeroSubtitle || 'Driven by passion, built on trust'}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '80px 20px' }}>
        <div className="about-story">
          <div className="about-text">
            <p className="section-tag">{d.aboutWhoTag || 'Who We Are'}</p>
            <h2 className="section-title">{d.aboutWhoTitle || "Australia's Most Trusted Auto Workshop"}</h2>
            <RichText html={d.aboutPara1 || 'Founded over a decade ago, Everest Auto Hub has grown from a small garage to one of Australia\'s most trusted automotive service centres.'} />
            {d.aboutPara2 && <RichText html={d.aboutPara2} style={{ marginTop: '1rem' }} />}            <Link to="/appointment" className="btn-primary" style={{ marginTop: '2rem' }}>
              Book a Service <FiArrowRight />
            </Link>
          </div>
          <div className="about-img-box">
            {imgUrl(d.aboutImage) ? (
              <img src={imgUrl(d.aboutImage)} alt="About Everest Auto Hub" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
            ) : (
              <div className="about-img-placeholder">⛰<br /><span>Everest Auto Hub</span></div>
            )}
          </div>
        </div>

        {/* Team */}
        {(d.aboutTeam?.length > 0) && (
          <div className="team-section">
            <div className="section-header">
              <p className="section-tag">{d.aboutTeamTag || 'Our Team'}</p>
              <h2 className="section-title">Meet Our <span>Experts</span></h2>
            </div>
            <div className="grid-4">
              {d.aboutTeam.map((m, i) => (
                <div key={i} className="team-card card">
                  {imgUrl(m.image) ? (
                    <img src={imgUrl(m.image)} alt={m.name} className="team-avatar-img" />
                  ) : (
                    <div className="team-avatar">{m.name?.[0] || '?'}</div>
                  )}
                  <h4>{m.name}</h4>
                  <p>{m.role}</p>
                  <span>{m.exp} experience</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
