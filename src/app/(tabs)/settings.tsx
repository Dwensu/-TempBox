import React from 'react';
import { ScrollView, View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { useSettings } from '@/context/SettingsContext';

export default function SettingsScreen() {
  const { appearance, setAppearance, defaultDays, setDefaultDays, reminders, setReminders, autoDelete, setAutoDelete } = useSettings();
  const dark = appearance === 'dark';
  const c = {
    background: dark ? '#121322' : '#FAF8FF',
    card: dark ? '#201F32' : '#FFFFFF',
    text: dark ? '#F7F5FF' : '#131B2E',
    muted: dark ? '#B6B2D5' : '#777587',
    border: dark ? '#39354D' : '#EAE8F2',
    soft: dark ? '#312C4D' : '#F2F0FF',
    accent: dark ? '#A99AFF' : '#4F46E5',
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.brand, { color: c.accent }]}>⌛ TEMPBOX</Text>
      <Text style={[styles.heading, { color: c.text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: c.muted }]}>Simple preferences for your temporary files</Text>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>☀  Appearance</Text>
        <Text style={[styles.help, { color: c.muted }]}>Choose how the entire TempBox app looks.</Text>
        <View style={styles.row}>
          {(['light','dark'] as const).map(mode => (
            <Pressable key={mode} accessibilityRole="button" accessibilityState={{ selected: appearance === mode }}
              onPress={() => setAppearance(mode)}
              style={[styles.choice, { backgroundColor: appearance === mode ? '#4F46E5' : c.soft, borderColor: appearance === mode ? '#4F46E5' : c.border }]}>
              <Text style={{ color: appearance === mode ? '#FFFFFF' : c.text, fontWeight: '700' }}>{mode === 'light' ? '☀ Light Mode' : '☾ Dark Mode'}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>◷  File Management</Text>
        <Text style={[styles.label, { color: c.text }]}>Default file lifespan</Text>
        <Text style={[styles.help, { color: c.muted }]}>Suggested lifespan for newly added files.</Text>
        <View style={styles.daysRow}>
          {[1,3,7,14,30].map(days => (
            <Pressable key={days} accessibilityRole="button" accessibilityState={{ selected: defaultDays === days }}
              onPress={() => setDefaultDays(days)} style={[styles.day, { backgroundColor: defaultDays === days ? '#4F46E5' : c.soft, borderColor: defaultDays === days ? '#4F46E5' : c.border }]}>
              <Text style={{ color: defaultDays === days ? '#FFFFFF' : c.text, fontWeight: '700' }}>{days}d</Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.separator, { backgroundColor: c.border }]} />
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <Text style={[styles.label, { color: c.text }]}>Expiration reminders</Text>
            <Text style={[styles.help, { color: c.muted }]}>Default reminder preference</Text>
          </View>
          <Switch value={reminders} onValueChange={setReminders} trackColor={{ false: '#B9B5C8', true: '#8D83EE' }} thumbColor={reminders ? '#4F46E5' : '#F4F3F6'} />
        </View>
        <View style={[styles.separator, { backgroundColor: c.border }]} />
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <Text style={[styles.label, { color: c.text }]}>Auto-delete preference</Text>
            <Text style={[styles.help, { color: c.muted }]}>Mark new files for future automatic cleanup</Text>
          </View>
          <Switch value={autoDelete} onValueChange={setAutoDelete} trackColor={{ false: '#B9B5C8', true: '#8D83EE' }} thumbColor={autoDelete ? '#4F46E5' : '#F4F3F6'} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>ⓘ  About TempBox</Text>
        <Text style={[styles.help, { color: c.muted, lineHeight: 21 }]}>TempBox helps students organize temporary school and work files by category and expiration date.</Text>
        <Text style={[styles.note, { color: c.muted }]}>Frontend demo · Settings saved locally</Text>
      </View>
      <Text style={[styles.disclaimer, { color: c.muted }]}>Reminder notifications and physical automatic deletion are not enabled. Appearance applies throughout TempBox.</Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 50, width: '100%', maxWidth: 740, alignSelf: 'center', gap: 15 },
  brand: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  heading: { fontSize: 29, fontWeight: '800', marginTop: -5 },
  subtitle: { fontSize: 14, marginBottom: 8 },
  card: { borderWidth: 1, borderRadius: 20, padding: 19, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 15, fontWeight: '700' },
  help: { fontSize: 12 },
  row: { flexDirection: 'row', gap: 10 },
  choice: { flex: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 3 },
  day: { minWidth: 53, borderRadius: 12, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center' },
  separator: { height: 1, marginVertical: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  settingText: { flex: 1, gap: 5 },
  note: { fontSize: 12, marginTop: 6 },
  disclaimer: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 2 },
});
