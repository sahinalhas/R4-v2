
/**
 * VoiceInputStatus Component
 * Kullanıcıya görsel geri bildirim sağlar
 */

import { Mic, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { VoiceInputStatusProps } from '@shared/types/speech.types';

export function VoiceInputStatus({ 
  status, 
  message, 
  duration 
}: VoiceInputStatusProps) {
  const statusConfig = {
    idle: {
      icon: Mic,
      text: 'Mikrofona tıklayarak başlayın',
      className: 'bg-muted text-muted-foreground',
      variant: 'outline' as const
    },
    listening: {
      icon: Mic,
      text: 'Dinleniyor...',
      className: 'bg-red-50 text-red-700 border-red-200',
      variant: 'default' as const
    },
    processing: {
      icon: Loader2,
      text: 'İşleniyor...',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      variant: 'default' as const
    },
    error: {
      icon: AlertCircle,
      text: message || 'Hata oluştu',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      variant: 'destructive' as const
    },
    success: {
      icon: CheckCircle,
      text: 'Metin eklendi',
      className: 'bg-green-50 text-green-700 border-green-200',
      variant: 'default' as const
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (status === 'idle') {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive" className="py-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {config.text}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Badge 
      variant={config.variant}
      className={cn('flex items-center gap-1.5 px-3 py-1', config.className)}
    >
      <Icon className={cn('h-3.5 w-3.5', status === 'processing' && 'animate-spin')} />
      <span>{config.text}</span>
      {duration !== undefined && status === 'listening' && (
        <span className="ml-1 font-mono text-xs">
          {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </span>
      )}
    </Badge>
  );
}
