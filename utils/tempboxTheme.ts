import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

// Keep the original layout and spacing; replace only colors in dark mode.
// This maps the existing TempBox prototype palette to a coordinated dark palette.
const palette: Record<string, string> = {
  '#FAF8FF': '#121322', '#FFFFFF': '#201F32', '#FFF': '#201F32',
  '#F8F7FF': '#181829', '#F7F6FF': '#1B1B2D', '#F5F3FF': '#242138',
  '#F2F3FF': '#29263F', '#F2F0FF': '#29263F', '#F0F0FF': '#29263F',
  '#F3F0FF': '#DAD5FF', '#ECE9FF': '#302B4A', '#EDEAFF': '#302B4A',
  '#E9E6FF': '#312C4D', '#E6E2FF': '#312C4D', '#E2DFFF': '#BDB3FF',
  '#EAE8F2': '#39354D', '#EAE7F5': '#39354D', '#ECEAF6': '#39354D',
  '#131B2E': '#F7F5FF', '#464555': '#D2CEE6', '#777587': '#B6B2D5',
  '#696779': '#B6B2D5', '#3525CD': '#C4B5FD', '#4F46E5': '#7166ED',
  '#B9B3FF': '#5E548A', '#B9B5C8': '#5E548A',
};

export function themeStyles<T extends Record<string, any>>(base: T, dark: boolean): T {
  if (!dark) return base;
  const result: Record<string, any> = {};
  for (const [name, style] of Object.entries(base)) {
    const converted: Record<string, any> = { ...style };
    for (const prop of ['backgroundColor', 'color', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'textDecorationColor']) {
      const raw = converted[prop];
      if (typeof raw !== 'string') continue;
      const mapped = Object.entries(palette).find(([key]) => key.toUpperCase() === raw.toUpperCase())?.[1];
      if (mapped) {
        // White lettering on colored primary buttons should remain white.
        if (prop === 'color' && ['#FFF', '#FFFFFF'].includes(raw.toUpperCase())) continue;
        converted[prop] = mapped;
      }
    }
    result[name] = converted;
  }
  return result as T;
}
