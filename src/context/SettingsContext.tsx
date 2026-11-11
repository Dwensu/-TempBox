import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Appearance = 'light' | 'dark';
type Settings = {
  appearance: Appearance;
  defaultDays: number;
  reminders: boolean;
  autoDelete: boolean;
};
type SettingsStore = Settings & {
  setAppearance: (value: Appearance) => void;
  setDefaultDays: (value: number) => void;
  setReminders: (value: boolean) => void;
  setAutoDelete: (value: boolean) => void;
};
const KEY = '@tempbox_settings_v1';
const defaults: Settings = { appearance: 'light', defaultDays: 7, reminders: true, autoDelete: false };
const SettingsContext = createContext<SettingsStore | null>(null);
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved && active) {
          const value = JSON.parse(saved);
          if (value && typeof value === 'object') {
            setSettings({
              appearance: value.appearance === 'dark' ? 'dark' : 'light',
              defaultDays: [1,3,7,14,30].includes(value.defaultDays) ? value.defaultDays : 7,
              reminders: typeof value.reminders === 'boolean' ? value.reminders : true,
              autoDelete: typeof value.autoDelete === 'boolean' ? value.autoDelete : false,
            });
          }
        }
      } catch (error) { console.warn('Could not load TempBox settings', error); }
      finally { if (active) setLoaded(true); }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch(error => console.warn('Could not save TempBox settings', error));
  }, [settings, loaded]);
  const update = (patch: Partial<Settings>) => setSettings(current => ({ ...current, ...patch }));
  if (!loaded) return null;
  return <SettingsContext.Provider value={{ ...settings,
    setAppearance: value => update({ appearance: value }),
    setDefaultDays: value => update({ defaultDays: value }),
    setReminders: value => update({ reminders: value }),
    setAutoDelete: value => update({ autoDelete: value }),
  }}>{children}</SettingsContext.Provider>;
}
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside SettingsProvider');
  return context;
}
