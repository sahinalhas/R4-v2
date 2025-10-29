
/**
 * useSpeechRecognition Hook
 * Web Speech API'yi sarmalayan merkezi hook
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { 
  UseSpeechRecognitionReturn, 
  SpeechRecognitionLanguage,
  SpeechRecognitionError 
} from '@shared/types/speech.types';
import { 
  checkBrowserSupport, 
  getSpeechRecognition, 
  mapErrorCode,
  formatTranscript,
  SPEECH_CONFIG 
} from '@/lib/utils/speech-utils';

interface UseSpeechRecognitionOptions {
  language?: SpeechRecognitionLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (text: string) => void;
  onError?: (error: SpeechRecognitionError) => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    language = SPEECH_CONFIG.language,
    continuous = SPEECH_CONFIG.continuous,
    interimResults = SPEECH_CONFIG.interimResults,
    onTranscript,
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<SpeechRecognitionError | null>(null);
  const [isSupported] = useState(checkBrowserSupport());

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = SPEECH_CONFIG.maxAlternatives;

    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalText += text + ' ';
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        const formatted = formatTranscript(finalText);
        setTranscript(prev => prev + formatted + ' ');
        setInterimTranscript('');
        onTranscript?.(formatted);
      } else {
        setInterimTranscript(interimText);
      }

      // Reset timeout on speech
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          recognition.stop();
        }
      }, SPEECH_CONFIG.autoStopTimeout);
    };

    recognition.onerror = (event: any) => {
      const mappedError = mapErrorCode(event);
      setError(mappedError);
      setIsListening(false);
      onError?.(mappedError);
      
      toast.error(mappedError.message, {
        description: mappedError.solution
      });
    };

    recognition.onspeechend = () => {
      // Clear any existing silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // Start silence timeout
      silenceTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognition.stop();
          toast.info('Sessizlik tespit edildi', {
            description: `${SPEECH_CONFIG.silenceTimeout / 1000} saniye süreyle ses algılanamadı`
          });
        }
      }, SPEECH_CONFIG.silenceTimeout);
    };

    recognition.onspeechstart = () => {
      // Clear silence timeout when speech starts again
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isSupported, language, continuous, interimResults, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const notSupportedError = mapErrorCode({ error: 'not-supported' });
      setError(notSupportedError);
      toast.error(notSupportedError.message, {
        description: notSupportedError.solution
      });
      return;
    }

    if (!recognitionRef.current || isListening) return;

    try {
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
      
      // Auto-stop timeout
      timeoutRef.current = setTimeout(() => {
        recognitionRef.current?.stop();
        toast.info('Dinleme otomatik olarak durduruldu', {
          description: '60 saniye zaman aşımı'
        });
      }, SPEECH_CONFIG.autoStopTimeout);
    } catch (err) {
      const mappedError = mapErrorCode(err);
      setError(mappedError);
      toast.error(mappedError.message);
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    continuous,
    language
  };
}
