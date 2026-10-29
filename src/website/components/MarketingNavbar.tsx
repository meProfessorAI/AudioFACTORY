/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Marketing Navbar
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Menu, 
  X, 
  ArrowRight, 
  Radio, 
  Layers, 
  Mic2, 
  Tag, 
  HelpCircle,
  Play
} from 'lucide-react';
import { useTerminal } from '../../../components/terminal/TerminalContext';
import { DaySkinSelector } from '../../../components/theme/DaySkinSelector';

export const MarketingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { activeSkin } = useTerminal();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Voices', path: '/voices' },
    { name: 'Use Cases', path: '/use-cases' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-md border-b shadow-sm py-3' 
          : 'bg-transparent py-4'
      }`}
      style={{
        backgroundColor: isScrolled ? 'var(--skin-bg-card, #FFFFFF)' : 'transparent',
        borderColor: isScrolled ? 'var(--skin-border, #E2E8F0)' : 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs border transition-transform duration-200 group-hover:scale-105"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                borderColor: 'var(--skin-border-strong, #CBD5E1)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              {/* Animated Waveform Icon */}
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="w-0.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-3.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <span className="w-0.5 h-3.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
                <span className="w-0.5 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '220ms' }} />
              </div>
            </div>
            <div className="flex flex-col">
              <span 
                className="text-lg font-extrabold tracking-tight flex items-center"
                style={{ color: 'var(--skin-text-primary, #0F172A)' }}
              >
                Audio<span style={{ color: 'var(--skin-accent, #0284C7)' }}>FACTORY</span>
              </span>
              <span 
                className="text-[9px] uppercase font-mono tracking-widest -mt-1 font-semibold"
                style={{ color: 'var(--skin-text-muted, #64748B)' }}
              >
                {activeSkin.dayName} Edition
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav 
            className="hidden lg:flex items-center gap-1 backdrop-blur-md px-3 py-1.5 rounded-full border shadow-2xs"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150 border"
                  style={{
                    backgroundColor: isActive ? 'var(--skin-accent-muted, #E0F2FE)' : 'transparent',
                    borderColor: isActive ? 'var(--skin-accent, #0284C7)' : 'transparent',
                    color: isActive ? 'var(--skin-accent, #0284C7)' : 'var(--skin-text-secondary, #475569)',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA Actions & 7-Day Light Skin Selector */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* 7-Day Skin Switcher on the landing page */}
            <DaySkinSelector compact />

            <Link
              to="/app"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-text-secondary, #475569)',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/app"
              className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg shadow-xs hover:opacity-90 active:scale-98 transition-all duration-150"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                color: 'var(--skin-accent-text, #FFFFFF)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <DaySkinSelector compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-text-primary, #0F172A)'
              }}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden border-b px-4 pt-4 pb-6 mt-3 space-y-3 backdrop-blur-xl shadow-xl animate-in slide-in-from-top-4 duration-200"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            borderColor: 'var(--skin-border, #E2E8F0)'
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="p-2.5 text-xs font-bold rounded-lg flex items-center justify-between border transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--skin-accent-muted, #E0F2FE)' : 'var(--skin-bg-subtle, #F1F5F9)',
                    borderColor: isActive ? 'var(--skin-accent, #0284C7)' : 'var(--skin-border, #E2E8F0)',
                    color: isActive ? 'var(--skin-accent, #0284C7)' : 'var(--skin-text-primary, #0F172A)'
                  }}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t flex flex-col gap-2" style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}>
            <Link
              to="/app"
              className="w-full py-2.5 text-center text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Studio ({activeSkin.dayName})</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

