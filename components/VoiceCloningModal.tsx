import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, X, Volume2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { cloneVoice } from '../services/elevenLabsService';
import { useTerminal } from './terminal/TerminalContext';
import { AdManager } from '../src/monetization/AdManager';

interface VoiceCloningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isTerminalMode } = useTerminal();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingSeconds(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !audioBlob) {
      setError("Please provide a voice name and audio sample.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    AdManager.getInstance().suppressAds('voice_clone');
    try {
      await cloneVoice(name, description, audioBlob);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to clone voice. Please verify your ElevenLabs API key.");
    } finally {
      setIsSubmitting(false);
      AdManager.getInstance().resumeAds('voice_clone');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-lg flex flex-col max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border transition-all"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E8D5C2)',
          color: 'var(--skin-text-primary, #431407)',
          boxShadow: 'var(--skin-shadow, 0 10px 25px rgba(0,0,0,0.1))'
        }}
      >
        {/* Header */}
        <div 
          className="p-4 sm:p-5 border-b flex justify-between items-center flex-shrink-0"
          style={{
            backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
            borderColor: 'var(--skin-border, #E8D5C2)'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: 'var(--skin-accent, #C2410C)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Instant Voice Cloning Studio
              </h2>
              <p 
                className="text-xs"
                style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
              >
                Capture your voice timbre to synthesize lines in Multi-Speaker
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--skin-border, #E8D5C2)',
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              color: 'var(--skin-text-secondary, #7C2D12)'
            }}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div 
          className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar"
          style={{ backgroundColor: 'var(--skin-bg-card, #FFFFFF)' }}
        >
          {error && (
            <div 
              className="p-3 rounded-xl border text-xs flex items-center gap-2 bg-rose-50 border-rose-200 text-rose-800"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label 
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
            >
              Voice Name *
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:outline-none"
              style={{
                backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                borderColor: 'var(--skin-border, #E8D5C2)',
                color: 'var(--skin-text-primary, #431407)'
              }}
              placeholder="e.g. Marcus Studio Voice, Alex Narrator"
            />
          </div>

          <div>
            <label 
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
            >
              Voice Timbre & Description
            </label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:outline-none"
              style={{
                backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                borderColor: 'var(--skin-border, #E8D5C2)',
                color: 'var(--skin-text-primary, #431407)'
              }}
              placeholder="e.g. Warm acoustic resonance, deep broadcast tone, clear pace"
            />
          </div>

          {/* Audio Sample Recording Box */}
          <div 
            className="border rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3"
            style={{
              backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
              borderColor: 'var(--skin-border, #E8D5C2)'
            }}
          >
            <div className="text-center">
              <span 
                className="text-xs font-bold uppercase tracking-wider block"
                style={{ color: 'var(--skin-text-primary, #431407)' }}
              >
                Voice Audio Sample
              </span>
              <p 
                className="text-xs mt-0.5"
                style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
              >
                Record 15–30 seconds of spoken speech or upload a clear WAV/MP3.
              </p>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--skin-accent, #C2410C)',
                    color: 'var(--skin-accent-text, #FFFFFF)'
                  }}
                >
                  <Mic className="w-4 h-4" /> Start Studio Mic
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider animate-pulse shadow-xs cursor-pointer bg-red-600 text-white"
                >
                  <Square className="w-4 h-4 fill-current text-white" /> Stop ({recordingSeconds}s)
                </button>
              )}

              <label 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border shadow-2xs cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-text-primary, #431407)'
                }}
              >
                <Upload className="w-4 h-4" style={{ color: 'var(--skin-accent, #C2410C)' }} /> Upload File
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileUpload}
                  className="hidden" 
                />
              </label>
            </div>

            {/* Live Audio Sample Preview Player */}
            {audioUrl && (
              <div 
                className="w-full mt-2 pt-3 border-t flex flex-col items-center gap-2"
                style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
              >
                <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Audio sample ready for cloning</span>
                </div>
                <audio controls src={audioUrl} className="w-full h-8 max-w-sm" />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div 
            className="flex items-center justify-end gap-2 pt-3 border-t"
            style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
          >
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border text-xs font-bold uppercase transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--skin-border, #E8D5C2)',
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                color: 'var(--skin-text-secondary, #7C2D12)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim() || !audioBlob}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: 'var(--skin-accent, #C2410C)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cloning Voice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Clone Voice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
