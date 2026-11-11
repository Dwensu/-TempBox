import { useSettings } from '@/context/SettingsContext';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeStyles } from '../../../utils/tempboxTheme';
import { useFiles, type FileItem } from '../../context/FilesContext';

const DAY = 24 * 60 * 60 * 1000;

function formatSize(mb: number) {
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

function timeLeft(expiresAt: number, now: number) {
  const difference = expiresAt - now;
  if (difference <= 0) return 'Expired';
  if (difference < DAY) return `${Math.ceil(difference / 3600000)} hrs left`;
  return `${Math.ceil(difference / DAY)} days left`;
}

function fileIcon(category: FileItem['category']) {
  return ({ Documents: '📄', Images: '🖼️', Videos: '🎬', Archives: '🗂️', Audio: '🎵' })[category];
}

export default function HomeScreen() {
  const { appearance } = useSettings();
  const dark = appearance === 'dark';
  const themed = themeStyles(baseStyles, dark);
  const { files } = useFiles();
  const [now, setNow] = useState(Date.now());

  // Refresh time-sensitive statistics whenever Home is opened.
  useFocusEffect(useCallback(() => { setNow(Date.now()); }, []));

  const totalMB = files.reduce((sum, file) => sum + file.sizeMB, 0);
  const expired = files.filter(file => file.expiresAt <= now);
  const expiring24h = files.filter(file => file.expiresAt > now && file.expiresAt <= now + DAY);
  const expiring3d = files.filter(file => file.expiresAt > now + DAY && file.expiresAt <= now + 3 * DAY);
  const safe = files.filter(file => file.expiresAt > now + 3 * DAY);
  const expiringFiles = [...expiring24h, ...expiring3d].sort((a, b) => a.expiresAt - b.expiresAt).slice(0, 3);
  // New imports have timestamp-based IDs; initial demo records keep their original order.
  const recentFiles = [...files].sort((a, b) => {
    const aTime = Number(a.id.split('-')[0]);
    const bTime = Number(b.id.split('-')[0]);
    const aImported = aTime > 1000000000000 ? aTime : 0;
    const bImported = bTime > 1000000000000 ? bTime : 0;
    return bImported - aImported;
  }).slice(0, 3);

  return (
    <SafeAreaView style={themed.safe} edges={['top']}>
      <ScrollView contentContainerStyle={themed.content}>
        <View style={themed.header}>
          <View><Text style={themed.eyebrow}>TempBox Home</Text><Text style={themed.heading}>Hi Alex 👋</Text><Text style={themed.muted}>Keep your phone lightweight & clutter-free</Text></View>
          <Text style={themed.bell}>🔔</Text>
        </View>
        <View style={themed.hero}>
          <Text style={themed.heroLabel}>🛡️  Auto-shield · Transient Cache</Text>
          <Text style={themed.heroNumber}>{formatSize(expired.reduce((sum, file) => sum + file.sizeMB, 0))}</Text>
          <Text style={themed.heroSub}>Expired files ready for review • Manage cleanup</Text>
          <Pressable style={themed.heroButton} onPress={() => router.push('/cleanup')}><Text style={themed.heroButtonText}>⚡ Quick Clean</Text></Pressable>
        </View>
        <View style={themed.statsRow}>
          <View style={themed.statCard}><Text style={themed.statNumber}>{formatSize(totalMB)}</Text><Text style={themed.statLabel}>Temporary</Text><Text style={themed.statHint}>{files.length} files</Text></View>
          <View style={themed.statCard}><Text style={themed.statNumber}>{expired.length} expired</Text><Text style={themed.statLabel}>Past Expiration</Text><Text style={themed.statHint}>Review in Files</Text></View>
        </View>
        <View style={themed.sectionHeader}><Text style={themed.sectionTitle}>Lifespan Overview</Text><Text style={themed.muted}>Expiration tracking</Text></View>
        <View style={themed.lifespanRow}>
          <View style={themed.lifeCard}><Text style={themed.lifeNumber}>{expiring24h.length}</Text><Text style={themed.lifeLabel}>Expiring 24h</Text><Text style={themed.lifeHint}>Needs review</Text></View>
          <View style={themed.lifeCard}><Text style={themed.lifeNumber}>{expiring3d.length}</Text><Text style={themed.lifeLabel}>Expiring 1–3d</Text><Text style={themed.lifeHint}>Safe for now</Text></View>
          <View style={themed.lifeCard}><Text style={themed.lifeNumber}>{safe.length}</Text><Text style={themed.lifeLabel}>Safe (&gt; 3d)</Text><Text style={themed.lifeHint}>Archived</Text></View>
        </View>
        <View style={themed.sectionHeader}><Text style={themed.sectionTitle}>Expiring Soon</Text><Pressable onPress={() => router.push('/files')}><Text style={themed.link}>Review all ({expiring24h.length + expiring3d.length}) →</Text></Pressable></View>
        <View style={themed.listCard}>{expiringFiles.length === 0 ? <Text style={themed.empty}>No files expiring in the next 3 days.</Text> : expiringFiles.map((file, i) => <View key={file.id} style={[themed.fileRow, i > 0 && themed.separator]}><Text style={themed.fileIcon}>{fileIcon(file.category)}</Text><View style={themed.fileInfo}><Text style={themed.fileName} numberOfLines={1}>{file.name}</Text><Text style={themed.muted}>{formatSize(file.sizeMB)}  ·  <Text style={themed.warning}>{timeLeft(file.expiresAt, now)}</Text></Text></View><Text style={themed.chevron}>›</Text></View>)}</View>
        <View style={themed.sectionHeader}><Text style={themed.sectionTitle}>Recently Added</Text><Pressable onPress={() => router.push('/files')}><Text style={themed.link}>View All →</Text></Pressable></View>
        <View style={themed.listCard}>{recentFiles.length === 0 ? <Text style={themed.empty}>No files yet. Add your first file!</Text> : recentFiles.map((file, i) => <View key={file.id} style={[themed.fileRow, i > 0 && themed.separator]}><Text style={themed.fileIcon}>{fileIcon(file.category)}</Text><View style={themed.fileInfo}><Text style={themed.fileName} numberOfLines={1}>{file.name}</Text><Text style={themed.muted}>{formatSize(file.sizeMB)} · Added {file.added}</Text><Text style={themed.remaining}>{timeLeft(file.expiresAt, now)}</Text></View><Text style={themed.chevron}>›</Text></View>)}</View>
        <Pressable style={themed.settingsCard} onPress={() => router.push('/settings')}><Text style={themed.settingsIcon}>⏰</Text><View style={themed.fileInfo}><Text style={themed.settingsTitle}>Automate Cleanups</Text><Text style={themed.muted}>Set default lifespans in Settings</Text></View><Text style={themed.link}>Configure →</Text></Pressable>
        <Text style={themed.disclaimer}>Local file records • Storage totals reflect TempBox records only</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const baseStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8FF' },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 100, width: '100%', maxWidth: 760, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: '#4F46E5', fontSize: 12, fontWeight: '700', marginBottom: 5 },
  heading: { fontSize: 28, fontWeight: '800', color: '#131B2E', marginBottom: 4 },
  muted: { color: '#777587', fontSize: 12, lineHeight: 18 },
  bell: { fontSize: 23 },
  hero: { backgroundColor: '#4F46E5', borderRadius: 24, padding: 23, marginBottom: 14 },
  heroLabel: { color: '#E2DFFF', fontSize: 13, fontWeight: '700' },
  heroNumber: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', marginTop: 15 },
  heroSub: { color: '#E2DFFF', fontSize: 13, marginTop: 3, marginBottom: 20 },
  heroButton: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  heroButtonText: { color: '#3525CD', fontSize: 15, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 17, padding: 17, borderWidth: 1, borderColor: '#EEEAFB' },
  statNumber: { color: '#131B2E', fontSize: 23, fontWeight: '800' },
  statLabel: { color: '#464555', fontSize: 13, fontWeight: '600', marginTop: 5 },
  statHint: { color: '#777587', fontSize: 11, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12, gap: 10 },
  sectionTitle: { color: '#131B2E', fontSize: 18, fontWeight: '800' },
  link: { color: '#4F46E5', fontSize: 12, fontWeight: '700' },
  lifespanRow: { flexDirection: 'row', gap: 9, marginBottom: 22 },
  lifeCard: { flex: 1, backgroundColor: '#F0EEFF', borderRadius: 15, paddingVertical: 15, paddingHorizontal: 7, alignItems: 'center' },
  lifeNumber: { color: '#3525CD', fontSize: 26, fontWeight: '800' },
  lifeLabel: { color: '#131B2E', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  lifeHint: { color: '#777587', fontSize: 10, textAlign: 'center', marginTop: 4 },
  listCard: { backgroundColor: '#FFFFFF', borderRadius: 17, paddingHorizontal: 14, marginBottom: 20, borderWidth: 1, borderColor: '#EEEAFB' },
  fileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 10 },
  separator: { borderTopWidth: 1, borderTopColor: '#F0EFF7' },
  fileIcon: { fontSize: 23, width: 34, textAlign: 'center' },
  fileInfo: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 12, color: '#131B2E', fontWeight: '700', marginBottom: 5 },
  warning: { color: '#BA541A', fontWeight: '700' },
  remaining: { color: '#4F46E5', fontSize: 11, fontWeight: '600', marginTop: 3 },
  chevron: { fontSize: 25, color: '#9995AB' },
  settingsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAE7FF', borderRadius: 17, padding: 17, gap: 10, marginTop: 2 },
  settingsIcon: { fontSize: 25 },
  settingsTitle: { color: '#131B2E', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  empty: { color: '#777587', fontSize: 12, paddingVertical: 22, textAlign: 'center' },
  disclaimer: { color: '#9995AB', fontSize: 11, textAlign: 'center', marginTop: 20 },
});
