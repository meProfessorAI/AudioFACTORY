import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Disc, ArrowUpRight, Heart, Activity } from 'lucide-react';
import { useTerminal } from '../../../components/terminal/TerminalContext';

export const MarketingFooter: React.FC = () => {
  const { activeSkin } = useTerminal();

  return (
    <footer 
      className="border-t text-sm transition-colors duration-200"
      style={{
        backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
        borderColor: 'var(--skin-border, #E2E8F0)',
        color: 'var(--skin-text-secondary, #475569)'
      }}
    >
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-2xs border"
                style={{
                  backgroundColor: 'var(--skin-accent, #0284C7)',
                  color: 'var(--skin-accent-text, #FFFFFF)',
                  borderColor: 'var(--skin-border-strong, #CBD5E1)'
                }}
              >
                AF
              </div>
              <span 
                className="text-lg font-black tracking-tight"
                style={{ color: 'var(--skin-text-primary, #0F172A)' }}
              >
                Audio<span style={{ color: 'var(--skin-accent, #0284C7)' }}>FACTORY</span>
              </span>
            </Link>
            <p className="text-sm max-w-sm leading-relaxed" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
              The complete AI-powered audio workstation for podcasters, game devs, filmmakers, and creators. Turn words into master-ready audio with multi-speaker casting, voice cloning, and BGM synthesis.
            </p>
            
            {/* Status Signal */}
            <div 
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border w-fit text-xs font-mono"
              style={{
                backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-text-secondary, #475569)'
              }}
            >
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }} />
              <span className="font-semibold" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                {activeSkin.dayName} Edition • {activeSkin.themeName}
              </span>
              <span className="opacity-40">|</span>
              <span>All Systems Nominal</span>
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-3">
            <h4 
              className="text-xs font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              Studio Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/features" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Features Overview
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Production Pipeline
                </Link>
              </li>
              <li>
                <Link to="/voices" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Voice Library (30+)
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Plans & Pricing
                </Link>
              </li>
              <li>
                <Link to="/app" className="inline-flex items-center gap-1 font-bold hover:underline" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                  <span>Launch Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions & Use Cases */}
          <div className="space-y-3">
            <h4 
              className="text-xs font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/use-cases#podcasts" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Podcasts & Audio Dramas
                </Link>
              </li>
              <li>
                <Link to="/use-cases#gaming" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Game Voice Acting
                </Link>
              </li>
              <li>
                <Link to="/use-cases#youtube" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  YouTube & Short Video
                </Link>
              </li>
              <li>
                <Link to="/use-cases#audiobooks" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Audiobooks & E-Learning
                </Link>
              </li>
              <li>
                <Link to="/use-cases#commercials" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Trailers & Commercials
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 
              className="text-xs font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/privacy" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/account-deletion" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Account & Data Deletion
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline transition-colors" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  Support & Contact
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div 
        className="border-t"
        style={{
          backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
          borderColor: 'var(--skin-border, #E2E8F0)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
            &copy; {new Date().getFullYear()} AudioFACTORY Inc. Built for professional audio creators.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <span>&bull;</span>
            <Link to="/refund-policy" className="hover:underline">Refunds</Link>
            <span>&bull;</span>
            <Link to="/account-deletion" className="hover:underline">Data Deletion</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

