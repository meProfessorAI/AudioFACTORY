/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Algorithmic Soundscape & BGM Synthesizer
 * Generates rich, multi-layered procedural soundscapes and music beds (WAV format)
 * without external API dependencies, serving as a robust primary or fallback engine.
 */
import { BgmParams, BgmResult } from '../providers/AIProvider';

export function createStereoWavBuffer(
  leftSamples: Float32Array,
  rightSamples: Float32Array,
  sampleRate: number = 44100
): Buffer {
  const numFrames = leftSamples.length;
  const numChannels = 2;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const totalBufferSize = 44 + dataSize;

  const buffer = Buffer.alloc(totalBufferSize);

  // RIFF Chunk
  buffer.write('RIFF', 0, 4, 'ascii');
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8, 4, 'ascii');

  // fmt Subchunk
  buffer.write('fmt ', 12, 4, 'ascii');
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data Subchunk
  buffer.write('data', 36, 4, 'ascii');
  buffer.writeUInt32LE(dataSize, 40);

  // Write interleaved 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    // Clamp to -1.0 .. 1.0
    const left = Math.max(-1, Math.min(1, leftSamples[i]));
    const right = Math.max(-1, Math.min(1, rightSamples[i]));

    const intLeft = left < 0 ? Math.round(left * 32768) : Math.round(left * 32767);
    const intRight = right < 0 ? Math.round(right * 32768) : Math.round(right * 32767);

    buffer.writeInt16LE(intLeft, offset);
    buffer.writeInt16LE(intRight, offset + 2);
    offset += 4;
  }

  return buffer;
}

type SoundscapeStyle = 'lofi' | 'cinematic' | 'stinger' | 'ambient';

function detectStyleFromPrompt(prompt: string): SoundscapeStyle {
  const p = prompt.toLowerCase();
  if (p.includes('lo-fi') || p.includes('lofi') || p.includes('chill') || p.includes('synthwave') || p.includes('beat')) {
    return 'lofi';
  }
  if (p.includes('cinematic') || p.includes('orchestral') || p.includes('epic') || p.includes('strings') || p.includes('brass') || p.includes('film')) {
    return 'cinematic';
  }
  if (p.includes('stinger') || p.includes('podcast') || p.includes('intro') || p.includes('tech') || p.includes('corporate') || p.includes('bright')) {
    return 'stinger';
  }
  return 'ambient';
}

export async function generateAlgorithmicSoundscape(params: BgmParams): Promise<BgmResult> {
  const durationSeconds = Math.min(Math.max(params.durationSeconds || 15, 3), 60);
  const sampleRate = 44100;
  const numFrames = Math.floor(durationSeconds * sampleRate);

  const left = new Float32Array(numFrames);
  const right = new Float32Array(numFrames);

  const style = detectStyleFromPrompt(params.prompt);

  // Two-pole low pass filter state
  let filterL = 0;
  let filterR = 0;

  // Simple pseudo-random generator with seed
  let seed = 123456789;
  for (let i = 0; i < params.prompt.length; i++) {
    seed = (seed * 31 + params.prompt.charCodeAt(i)) & 0x7fffffff;
  }
  function pseudoRandom(): number {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) * 2 - 1;
  }

  switch (style) {
    case 'lofi': {
      // 78 BPM, 4-beat cycle = ~3.076s per bar
      const beatDuration = 60 / 78;
      const barDuration = beatDuration * 4;

      // Chord frequencies: Dm9 -> G13 -> Cmaj9 -> Am9
      const chords = [
        [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
        [98.00, 174.61, 246.94, 329.63, 392.00],  // G13
        [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
        [110.00, 130.81, 164.81, 196.00, 246.94], // Am9
      ];

      for (let i = 0; i < numFrames; i++) {
        const t = i / sampleRate;
        const barIndex = Math.floor(t / barDuration) % chords.length;
        const currentChord = chords[barIndex];
        const tInBar = t % barDuration;

        // Rhodes-like chord decay
        const chordEnvelope = Math.exp(-tInBar * 0.6) * 0.35 + 0.15;

        let chordSignalL = 0;
        let chordSignalR = 0;

        for (let c = 0; c < currentChord.length; c++) {
          const freq = currentChord[c];
          // Main tone + slight warmth overtone + gentle stereo detune
          const oscL = Math.sin(2 * Math.PI * freq * t) * 0.6 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.15;
          const oscR = Math.sin(2 * Math.PI * (freq + 0.4) * t) * 0.6 + Math.sin(2 * Math.PI * (freq * 2 + 0.8) * t) * 0.15;
          
          const pan = (c / (currentChord.length - 1)) * 0.4 - 0.2; // subtle stereo spread
          chordSignalL += oscL * (0.5 - pan);
          chordSignalR += oscR * (0.5 + pan);
        }

        // Sub bass on root note
        const bassFreq = currentChord[0] / 2;
        const bassEnvelope = Math.exp(-tInBar * 0.4) * 0.4;
        const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassEnvelope;

        // Soft Lo-Fi Kick & Snare/Rim
        const beatInBar = (t % barDuration) / beatDuration;
        let drums = 0;

        // Kick on beat 0 and beat 2.5
        const tKick1 = tInBar;
        const tKick2 = tInBar - beatDuration * 2.5;
        if (tKick1 >= 0 && tKick1 < 0.2) {
          const kickPitch = 55 * Math.exp(-tKick1 * 25);
          drums += Math.sin(2 * Math.PI * kickPitch * tKick1) * Math.exp(-tKick1 * 12) * 0.45;
        }
        if (tKick2 >= 0 && tKick2 < 0.2) {
          const kickPitch = 50 * Math.exp(-tKick2 * 25);
          drums += Math.sin(2 * Math.PI * kickPitch * tKick2) * Math.exp(-tKick2 * 12) * 0.35;
        }

        // Soft snare / rim on beat 2
        const tSnare = tInBar - beatDuration * 2;
        if (tSnare >= 0 && tSnare < 0.15) {
          const noise = pseudoRandom() * 0.15;
          const body = Math.sin(2 * Math.PI * 180 * tSnare) * 0.2;
          drums += (noise + body) * Math.exp(-tSnare * 18);
        }

        // Vinyl crackle / tape noise
        const vinylNoise = (pseudoRandom() > 0.985 ? (pseudoRandom() * 0.08) : 0) + pseudoRandom() * 0.008;

        left[i] = chordSignalL * chordEnvelope + bass * 0.6 + drums + vinylNoise;
        right[i] = chordSignalR * chordEnvelope + bass * 0.6 + drums + vinylNoise;
      }
      break;
    }

    case 'cinematic': {
      // Dramatic slow drone in D minor / orchestral brass swell
      const rootD = 73.42; // D2
      const fifthA = 110.00; // A2
      const octaveD = 146.83; // D3
      const minorThirdF = 174.61; // F3
      const highA = 220.00; // A3

      for (let i = 0; i < numFrames; i++) {
        const t = i / sampleRate;

        // Dynamic 8-second orchestral swell cycle
        const swellPhase = (t % 8) / 8;
        const swell = 0.5 + 0.5 * Math.sin(swellPhase * 2 * Math.PI - Math.PI / 2);

        // Low sub-bass foundation
        const sub = Math.sin(2 * Math.PI * (rootD / 2) * t) * 0.35;

        // Detuned string ensemble pad
        const vibrato = 1 + 0.003 * Math.sin(2 * Math.PI * 4.5 * t);
        const s1L = Math.sin(2 * Math.PI * rootD * vibrato * t);
        const s1R = Math.sin(2 * Math.PI * (rootD + 0.3) * vibrato * t);
        const s2L = Math.sin(2 * Math.PI * fifthA * vibrato * t);
        const s2R = Math.sin(2 * Math.PI * (fifthA - 0.25) * vibrato * t);
        const s3L = Math.sin(2 * Math.PI * minorThirdF * vibrato * t);
        const s3R = Math.sin(2 * Math.PI * (minorThirdF + 0.4) * vibrato * t);
        const s4L = Math.sin(2 * Math.PI * octaveD * vibrato * t);
        const s4R = Math.sin(2 * Math.PI * highA * vibrato * t);

        const stringsL = (s1L * 0.3 + s2L * 0.25 + s3L * 0.2 + s4L * 0.15);
        const stringsR = (s1R * 0.3 + s2R * 0.25 + s3R * 0.2 + s4R * 0.15);

        // Slow cinematic pulse / low percussion thud every 4 seconds
        const pulseT = t % 4;
        let thud = 0;
        if (pulseT < 0.6) {
          const thudFreq = 42 * Math.exp(-pulseT * 6);
          thud = Math.sin(2 * Math.PI * thudFreq * pulseT) * Math.exp(-pulseT * 4) * 0.45;
        }

        left[i] = sub * 0.6 + stringsL * (0.4 + swell * 0.35) + thud;
        right[i] = sub * 0.6 + stringsR * (0.4 + swell * 0.35) + thud;
      }
      break;
    }

    case 'stinger': {
      // 120 BPM upbeat corporate / tech podcast stinger
      const beat = 60 / 120; // 0.5s per beat
      // Arpeggiated melody notes (C major pentatonic: C4, D4, E4, G4, A4, C5)
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

      for (let i = 0; i < numFrames; i++) {
        const t = i / sampleRate;
        const step = Math.floor(t / (beat / 2)); // 8th note steps
        const noteIndex = step % notes.length;
        const currentFreq = notes[noteIndex];
        const tInStep = t % (beat / 2);

        // Acoustic chime / marimba envelope
        const bellEnv = Math.exp(-tInStep * 10) * 0.4;
        const bellL = (Math.sin(2 * Math.PI * currentFreq * t) + 0.3 * Math.sin(2 * Math.PI * currentFreq * 2.76 * t)) * bellEnv;
        const bellR = (Math.sin(2 * Math.PI * (currentFreq + 0.5) * t) + 0.3 * Math.sin(2 * Math.PI * (currentFreq * 2.76 + 1) * t)) * bellEnv;

        // Steady bass groove (C2 = 65.41 Hz, G2 = 98.00 Hz)
        const bassFreq = (Math.floor(t / (beat * 2)) % 2 === 0) ? 65.41 : 98.00;
        const bassT = t % (beat);
        const bassEnv = Math.exp(-bassT * 4) * 0.35;
        const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassEnv;

        // Crisp high-hat shaker on 16th notes
        const t16th = t % (beat / 4);
        const hat = (t16th < 0.04 ? pseudoRandom() * Math.exp(-t16th * 80) * 0.12 : 0);

        left[i] = bellL * 0.7 + bass + hat * 0.8;
        right[i] = bellR * 0.7 + bass + hat * 0.8;
      }
      break;
    }

    case 'ambient':
    default: {
      // Deep meditative ambient drone pad (F minor 9th / theta wave harmonics)
      const fRoots = [87.31, 130.81, 155.56, 174.61, 233.08, 261.63];

      for (let i = 0; i < numFrames; i++) {
        const t = i / sampleRate;

        // Gentle 10-second LFO evolution
        const lfo1 = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t);
        const lfo2 = 0.5 + 0.5 * Math.cos(2 * Math.PI * 0.07 * t);

        let mixL = 0;
        let mixR = 0;

        for (let n = 0; n < fRoots.length; n++) {
          const freq = fRoots[n];
          // Theta wave binaural offset (left has pure freq, right has freq + 5.5Hz)
          const oscL = Math.sin(2 * Math.PI * freq * t);
          const oscR = Math.sin(2 * Math.PI * (freq + 5.5) * t);

          const weight = 0.25 / (n * 0.4 + 1);
          mixL += oscL * weight;
          mixR += oscR * weight;
        }

        // Shimmer overtone
        const shimmer = Math.sin(2 * Math.PI * 523.25 * t) * 0.05 * lfo1;

        // Sub bass drone at 43.65 Hz (F1)
        const sub = Math.sin(2 * Math.PI * 43.65 * t) * 0.3;

        left[i] = (mixL * (0.6 + lfo1 * 0.3) + sub + shimmer) * 0.8;
        right[i] = (mixR * (0.6 + lfo2 * 0.3) + sub + shimmer) * 0.8;
      }
      break;
    }
  }

  // Smooth low-pass smoothing filter (two-pole) to ensure analog warmth and no digital harshness
  const alpha = 0.35;
  for (let i = 0; i < numFrames; i++) {
    filterL = filterL + alpha * (left[i] - filterL);
    filterR = filterR + alpha * (right[i] - filterR);
    left[i] = filterL;
    right[i] = filterR;
  }

  // Apply broadcast fade-in (1.5s) and graceful fade-out (2.0s)
  const fadeInFrames = Math.floor(sampleRate * 1.5);
  const fadeOutFrames = Math.floor(sampleRate * 2.0);

  for (let i = 0; i < numFrames; i++) {
    let envelope = 1.0;
    if (i < fadeInFrames) {
      envelope = i / fadeInFrames;
    } else if (i > numFrames - fadeOutFrames) {
      envelope = (numFrames - i) / fadeOutFrames;
    }
    // Peak limiter & broadcast calibration (-6dB headroom)
    left[i] = Math.max(-0.85, Math.min(0.85, left[i] * envelope * 0.75));
    right[i] = Math.max(-0.85, Math.min(0.85, right[i] * envelope * 0.75));
  }

  const audioBuffer = createStereoWavBuffer(left, right, sampleRate);

  return {
    audioBuffer,
    contentType: 'audio/wav',
    durationSeconds,
  };
}
