
/**
 * Web Speech API Type Definitions
 * Ses tanıma sistemi için merkezi tip tanımları
 */

export type SpeechRecognitionLanguage = 'tr-TR' | 'en-US';

export type SpeechRecognitionStatus = 
  | 'idle' 
  | 'listening' 
  | 'processing' 
  | 'error' 
  | 'success';

export interface SpeechRecognitionConfig {
  language: SpeechRecognitionLanguage;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  autoStopTimeout: number;
  silenceTimeout: number;
}

export interface SpeechRecognitionError {
  code: 
    | 'not-allowed'
    | 'no-speech'
    | 'network'
    | 'not-supported'
    | 'aborted'
    | 'audio-capture';
  message: string;
  solution?: string;
}

export interface UseSpeechRecognitionReturn {
  // Durum
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: SpeechRecognitionError | null;
  
  // Fonksiyonlar
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  
  // Ayarlar
  continuous: boolean;
  language: SpeechRecognitionLanguage;
}

export interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onError?: (error: SpeechRecognitionError) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'standalone';
  language?: SpeechRecognitionLanguage;
  continuous?: boolean;
  disabled?: boolean;
  className?: string;
  onDurationChange?: (duration: number) => void;
}

export interface VoiceInputStatusProps {
  status: SpeechRecognitionStatus;
  message?: string;
  duration?: number;
}

export interface EnhancedTextareaVoiceProps {
  enableVoice?: boolean;
  voiceMode?: 'append' | 'replace';
  voiceLanguage?: SpeechRecognitionLanguage;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
}
