
/**
 * Speech Recognition Utility Functions
 */

import { SpeechRecognitionError, SpeechRecognitionConfig } from '@shared/types/speech.types';

export const SPEECH_CONFIG: SpeechRecognitionConfig = {
  language: 'tr-TR',
  continuous: true,
  interimResults: true,
  maxAlternatives: 1,
  autoStopTimeout: 60000, // 60 saniye
  silenceTimeout: 3000, // 3 saniye
};

export const ERROR_MESSAGES: Record<string, SpeechRecognitionError> = {
  'not-allowed': {
    code: 'not-allowed',
    message: 'Mikrofon izni verilmedi',
    solution: 'Tarayıcı ayarlarından mikrofon erişimi verin'
  },
  'no-speech': {
    code: 'no-speech',
    message: 'Ses algılanamadı',
    solution: 'Daha yüksek sesle ve net konuşun'
  },
  'network': {
    code: 'network',
    message: 'İnternet bağlantısı yok',
    solution: 'İnternet bağlantınızı kontrol edin'
  },
  'not-supported': {
    code: 'not-supported',
    message: 'Tarayıcı ses tanımayı desteklemiyor',
    solution: 'Chrome, Edge veya Opera kullanın'
  },
  'aborted': {
    code: 'aborted',
    message: 'Dinleme iptal edildi',
    solution: 'Tekrar deneyin'
  },
  'audio-capture': {
    code: 'audio-capture',
    message: 'Mikrofon bulunamadı',
    solution: 'Mikrofon bağlayın ve izin verin'
  }
};

export function checkBrowserSupport(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognitionAPI = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition;
  
  return SpeechRecognitionAPI || null;
}

export function mapErrorCode(error: any): SpeechRecognitionError {
  const errorType = error.error || 'aborted';
  return ERROR_MESSAGES[errorType] || {
    code: 'aborted',
    message: 'Bilinmeyen hata',
    solution: 'Tekrar deneyin'
  };
}

export function formatTranscript(transcript: string): string {
  return transcript
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}
