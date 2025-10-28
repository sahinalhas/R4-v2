import type { AppSettings } from '../../../../shared/types.js';
import { mergeWithDefaults } from '../../../../shared/settings-utils.js';
import * as settingsRepository from '../repository/settings.repository.js';

export function getSettings(): AppSettings {
  const settings = settingsRepository.getAppSettings();
  const merged = mergeWithDefaults(settings || {});
  
  if (!settings?.presentationSystem || settings.presentationSystem.length === 0) {
    settingsRepository.saveAppSettings(merged);
  }
  
  return merged;
}

export function saveSettings(settings: Partial<AppSettings>): void {
  if (!settings || typeof settings !== 'object') {
    throw new Error('Geçersiz ayar verisi');
  }
  
  const currentSettings = settingsRepository.getAppSettings() || {};
  
  const deepMerged = {
    ...currentSettings,
    ...settings,
    notifications: {
      ...(currentSettings.notifications || {}),
      ...(settings.notifications || {}),
    },
    data: {
      ...(currentSettings.data || {}),
      ...(settings.data || {}),
    },
    integrations: {
      ...(currentSettings.integrations || {}),
      ...(settings.integrations || {}),
    },
    privacy: {
      ...(currentSettings.privacy || {}),
      ...(settings.privacy || {}),
    },
    account: {
      ...(currentSettings.account || {}),
      ...(settings.account || {}),
    },
    school: {
      ...(currentSettings.school || {}),
      ...(settings.school || {}),
    },
    presentationSystem: settings.presentationSystem !== undefined 
      ? settings.presentationSystem 
      : currentSettings.presentationSystem,
  } as Partial<AppSettings>;
  
  const mergedSettings = mergeWithDefaults(deepMerged);
  settingsRepository.saveAppSettings(mergedSettings);
}
