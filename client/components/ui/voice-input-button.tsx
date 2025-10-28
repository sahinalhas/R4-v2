
/**
 * VoiceInputButton Component
 * Modern, responsive mikrofon butonu
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { VoiceInputButtonProps } from '@shared/types/speech.types';

export function VoiceInputButton({
  onTranscript,
  onError,
  size = 'md',
  variant = 'inline',
  language = 'tr-TR',
  continuous = true,
  disabled = false,
  className,
  onDurationChange
}: VoiceInputButtonProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    language,
    continuous,
    interimResults: false,
    onTranscript: (text) => {
      onTranscript(text);
      setHasStarted(true);
    },
    onError
  });

  const handleClick = () => {
    if (isListening) {
      stopListening();
      if (transcript && hasStarted) {
        resetTranscript();
        setHasStarted(false);
      }
      // Clear duration
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      setDuration(0);
      onDurationChange?.(0);
    } else {
      startListening();
      // Start duration counter
      setDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          onDurationChange?.(newDuration);
          return newDuration;
        });
      }, 1000);
    }
  };

  // Keyboard shortcut: Ctrl+Shift+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isListening]);

  // Stop duration counter when listening stops
  useEffect(() => {
    if (!isListening && durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
      setDuration(0);
      onDurationChange?.(0);
    }
  }, [isListening, onDurationChange]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={isListening ? 'destructive' : 'outline'}
              size="icon"
              className={cn(
                sizeClasses[size],
                'transition-all duration-200 relative z-10',
                isListening && 'shadow-lg shadow-red-500/50',
                variant === 'standalone' && 'rounded-full',
                className
              )}
              onClick={handleClick}
              disabled={disabled || !isSupported}
              aria-label={isListening ? 'Dinlemeyi durdur' : 'Mikrofonu başlat'}
            >
              {isListening ? (
                <div className="relative">
                  <Mic className={cn(iconSizes[size], 'text-white')} />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              ) : (
                <Mic className={iconSizes[size]} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isListening ? 'Dinlemeyi durdur' : 'Mikrofona tıklayıp konuşun'}</p>
            <p className="text-xs text-muted-foreground">Kısayol: Ctrl+Shift+S</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Wave Animation - WhatsApp Style */}
      {isListening && (
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 h-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-1 bg-red-500 rounded-full",
                "origin-center animate-bounce"
              )}
              style={{
                height: '8px',
                animationDelay: `${i * 150}ms`,
                animationDuration: '600ms'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
