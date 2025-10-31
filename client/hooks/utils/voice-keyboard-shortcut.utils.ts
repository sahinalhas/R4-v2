
/**
 * useVoiceKeyboardShortcut
 * Ctrl+Shift+S kısayolu ile ses tanımayı başlatma
 */

import { useEffect } from 'react';

interface UseVoiceKeyboardShortcutOptions {
  onTrigger: () => void;
  enabled?: boolean;
}

export function useVoiceKeyboardShortcut({
  onTrigger,
  enabled = true
}: UseVoiceKeyboardShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+S veya Cmd+Shift+S
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === 's'
      ) {
        event.preventDefault();
        onTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTrigger, enabled]);
}
