import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/userSlice";
import "./Landing.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { useEffect } from "react";


const FeatureCard = ({ icon, title, desc }) => (
  <div className="card feature-card">
    <div className="feature-icon" aria-hidden="true">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const ValueCard = ({ icon, title, desc }) => (
  <div className="card value-card">
    <div className="value-icon" aria-hidden="true">{icon}</div>
    <div className="value-copy">
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </div>
);

export default function Landing({ isAuthenticated }) {
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    // Toggle body scroll
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    setIsMobileMenuOpen(false); // Close mobile menu after logout
    dispatch(logoutUser())
      .then(() => {
        toast.success("Logged out successfully");
      })
      .catch((err) => {
        toast.error("Logout error:", err);
      });
  }

  return (
    <div className="landing">
      {/* ======= NAV ======= */}
      <header className="nav-wrap">
        <nav className="nav">
          <a className="brand" href="/">
            <span className="brand-dot" />
            Spectra
          </a>

          <div className="mobile-menu">
            <button 
              className={`nav-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span />
              <span />
              <span />
            </button>
            
            <div className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
              <button 
                className="close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
              <div className="nav-cta mobile">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="btn ghost">Log in</Link>
                    <Link to="/register" className="btn primary">Register now</Link>
                  </>
                ) : (
                  <button 
                    onClick={handleLogout} 
                    className="btn primary"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="nav-cta desktop">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn ghost">Log in</Link>
                <Link to="/register" className="btn primary">Register now</Link>
              </>
            ) : (
              <button 
                onClick={handleLogout} 
                className="btn primary"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* ======= HERO ======= */}
      <section className="hero" id="top">
        <div className="hero-col hero-copy">
          <span className="tag">Conversational AI with Memory</span>
          <h1>
            <span className="grad">AI Conversations</span><br />that Remember
          </h1>
          <p className="lead">
            Experience AI with context — Spectra enables fast, secure, and intelligent conversations with real-time chat and memory.
          </p>

          <div className="hero-actions">
            <Link to="/chat" className="btn primary btn-lg">Chat now</Link>
            <a href="#features" className="btn ghost btn-lg">See features</a>
          </div>

          <div className="hero-badges">
            <span>🔐 Auth + private workspaces</span>
            <span>🧠 Short + Long-term Memory (RAG)</span>
          </div>
        </div>

        <div className="hero-col hero-preview">
          <div className="chat-preview card">
            <div className="chat-header">
              <span className="dot live" />
              <span>Spectra · Live</span>
              <span className="secure">Secure</span>
            </div>

            <div className="chat-body">
              <div className="msg user">Hello.</div>
              <div className="msg ai">Hello! Spectra here. 👋 Kaise ho? What can I do for you today?</div>
              <div className="msg user">Tell me about yourself and what can you do ?</div>
              <div className="msg ai">
                Spectra here, your Hinglish-speaking AI buddy, ready to simplify your life with clear guidance and solutions! 😎
              </div>
            </div>
          </div>

          <div className="floating-note card">
            <div className="note-title">Personalization</div>
            <p>Conversations adapt using short & long-term memory via RAG + vectors.</p>
          </div>
        </div>
      </section>

      {/* ======= BENEFITS ======= */}
      <section id="benefits" className="section">
        <div className="section-head">
          <h2>Elevate Your Experience</h2>
          <p className="muted">
            Spectra is built for speed, safety, and reliability—so your team can focus on impact.
          </p>
        </div>

        <div className="values">
          <ValueCard
            icon="💡"
            title="Smart Conversations"
            desc="Context-aware dialogue tailored to user intent."
          />
          <ValueCard
            icon="🔒"
            title="Fast & Secure"
            desc="Rapid responses with robust data protection."
          />
          <ValueCard
            icon="🌐"
            title="Always Available"
            desc="Global availability with enterprise uptime."
          />
        </div>
      </section>

      {/* ======= FEATURES ======= */}
      <section id="features" className="section">
        <div className="section-head">
          <h2>Designed for Builders & Teams</h2>
          <p className="muted">Tooling that scales from prototype to production.</p>
        </div>

        <div className="features-grid">
          <FeatureCard icon="⚙️" title="API-first"
            desc="Simple, secure REST & WebSocket APIs." />
          <FeatureCard icon="🔍" title="Vector Search"
            desc="Embeddings, RAG, and hybrid search ready." />
          <FeatureCard icon="⚡" title="Fine-tuning"
            desc="Customize behavior with your data." />
        </div>
      </section>

      {/* ======= HOW IT WORKS ======= */}
      <section className="section how">
        <div className="section-head">
          <h2>How Spectra Remembers</h2>
          <p className="muted">
            Short-term conversation state + long-term memory via vector databases enables
            continuity across sessions—securely scoped per user.
          </p>
        </div>

        <div className="timeline">
          <div className="step card">
            <span className="step-badge">1</span>
            <h4>Ingest</h4>
            <p>Documents & chats chunked → embedded → stored in vector DB.</p>
          </div>
          <div className="step card">
            <span className="step-badge">2</span>
            <h4>Retrieve</h4>
            <p>Hybrid search pulls only the most relevant context for the prompt.</p>
          </div>
          <div className="step card">
            <span className="step-badge">3</span>
            <h4>Generate</h4>
            <p>Secure, audited generation with guardrails and observability.</p>
          </div>
        </div>
      </section>

      {/* ======= PRICING TEASER ======= */}
      <section id="pricing" className="cta">
        <div className="cta-inner">
          <h2>Try Spectra Today</h2>
          <p className="muted">Build conversational experiences your users love.</p>
          <Link to="/register" className="btn white btn-lg">Get Started</Link>
        </div>
      </section>

      {/* ======= FOOTER ======= */}
<footer className="footer">
  <div className="footer-inner">
    <a className="brand" href="/"><span className="brand-dot" />Spectra</a>
    <p className="tiny">
      © {new Date().getFullYear()} Spectra, Inc. All rights reserved. 
      <span className="made-by"> Crafted with care by Snigdha Sharma.</span>
    </p>
  </div>
</footer>

    </div>
  );
}