
import {
  usePathname
} from 'expo-router';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Folder,
  House,
  Settings,
  Sparkles,
} from 'lucide-react-native';

import { useSettings } from '../context/SettingsContext';

// Import custom tabs from expo-router/ui
import {
  TabList as CustomTabList,
  Tabs as CustomTabs,
  TabSlot as CustomTabSlot,
  TabTrigger as CustomTabTrigger,
} from 'expo-router/ui';

const tabs = [
  { name: 'home', href: '/', label: 'Home' },
  { name: 'files', href: '/files', label: 'Files' },
  { name: 'cleanup', href: '/cleanup', label: 'Cleanup' },
  { name: 'settings', href: '/settings', label: 'Settings' },
] as const;

export default function AppTabs() {
  const { appearance } = useSettings();
  const dark = appearance === 'dark';

  const pathname = usePathname();

  const activeColor = dark ? '#C4B5FD' : '#4F46E5';
  const inactiveColor = dark ? '#9995B3' : '#777587';

  return (
    <CustomTabs style={{ flex: 1 }}>
      <CustomTabSlot style={{ flex: 1 }} />

      <CustomTabList
        style={[
          styles.tabList,
          {
            backgroundColor: dark ? '#201F32' : '#FFFFFF',
            borderTopColor: dark ? '#39354D' : '#EAE8F2',
          },
        ]}
      >
        {tabs.map(tab => {
          const isActive = pathname === tab.href;
          const color = isActive ? activeColor : inactiveColor;

          return (
            <CustomTabTrigger
              key={tab.name}
              name={tab.name}
              href={tab.href}
              asChild
            >
              <Pressable
                style={({ pressed }) => [
                  styles.tabButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View
                  style={[
                    styles.tabContent,
                    isActive && {
                      backgroundColor: dark
                        ? '#39335E'
                        : '#EEEAFE',
                    },
                  ]}
                >
                  {tab.name === 'home' && (
                    <House
                      size={22}
                      color={color}
                      strokeWidth={2}
                    />
                  )}

                  {tab.name === 'files' && (
                    <Folder
                      size={22}
                      color={color}
                      strokeWidth={2}
                    />
                  )}

                  {tab.name === 'cleanup' && (
                    <Sparkles
                      size={22}
                      color={color}
                      strokeWidth={2}
                    />
                  )}

                  {tab.name === 'settings' && (
                    <Settings
                      size={22}
                      color={color}
                      strokeWidth={2}
                    />
                  )}

                  <Text
                    style={[
                      styles.label,
                      {
                        color,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </Pressable>
            </CustomTabTrigger>
          );
        })}
      </CustomTabList>
    </CustomTabs>
  );
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  tabContent: {
    width: '100%',
    maxWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 14,
  },

  label: {
    fontSize: 11,
  },
});
