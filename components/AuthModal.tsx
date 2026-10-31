import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, AlertCircle, LogIn, Disc } from 'lucide-react';
import { useFirebase } from '../services/firebaseContext';
import { AdManager } from '../src/monetization/AdManager';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginGoogle, loginGuest, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    AdManager.getInstance().suppressAds('login');
    try {
      await loginGoogle();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
      AdManager.getInstance().resumeAds('login');
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError(null);
    AdManager.getInstance().suppressAds('login');
    try {
      await loginGuest();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error("Guest sign in error:", err);
      setError(err.message || "Failed to continue as guest.");
    } finally {
      setIsLoading(false);
      AdManager.getInstance().resumeAds('login');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md rounded-2xl border shadow-2xl p-6 overflow-hidden"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            borderColor: 'var(--skin-border, #E8D5C2)',
            color: 'var(--skin-text-primary, #431407)',
            boxShadow: 'var(--skin-shadow, 0 10px 25px rgba(0,0,0,0.1))'
          }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl transition-colors hover:opacity-80 cursor-pointer"
            style={{
              color: 'var(--skin-text-muted, #9A5B32)',
              backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)'
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
              style={{
                backgroundColor: 'var(--skin-accent, #C2410C)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              <Disc className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Join AudioFACTORY</h2>
            <p 
              className="text-xs sm:text-sm leading-relaxed"
              style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
            >
              Create an account to save your generated audio, access custom voices, and unlock unlimited history.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--skin-accent, #C2410C)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign In with Google</span>
            </button>

            <div className="relative flex items-center py-1">
              <div 
                className="flex-grow border-t"
                style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
              />
              <span 
                className="flex-shrink-0 mx-4 text-xs uppercase"
                style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
              >
                or
              </span>
              <div 
                className="flex-grow border-t"
                style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
              />
            </div>

            <button
              onClick={handleGuestSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 font-bold rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                borderColor: 'var(--skin-border, #E8D5C2)',
                color: 'var(--skin-text-primary, #431407)'
              }}
            >
              <User className="w-5 h-5" />
              <span>Continue as Guest</span>
            </button>
          </div>
          
          <div className="mt-6 text-center">
             <p 
               className="text-xs"
               style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
             >
               By continuing, you agree to our Terms of Service and Privacy Policy.
             </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
