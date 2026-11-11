import { useFiles } from '@/context/FilesContext';
import { useSettings } from '@/context/SettingsContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { themeStyles } from '../../utils/tempboxTheme';

function parseIds(value: string | string[] | undefined): string[] {
  try { const result = JSON.parse(typeof value === 'string' ? value : '[]'); return Array.isArray(result) ? result.filter((v): v is string => typeof v === 'string') : []; } catch { return []; }
}
const formatSize = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
export default function CleanupConfirm() {
  const { appearance } = useSettings();
  const dark = appearance === 'dark';
  const themed = themeStyles(baseStyles, dark);
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const { files, removeFiles } = useFiles();
  const selected = parseIds(ids);
  const candidates = files.filter(f => selected.includes(f.id));
  const total = candidates.reduce((sum, f) => sum + f.sizeMB, 0);
  const expired = candidates.filter(f => f.expiresAt <= Date.now()).length;
  const soon = candidates.filter(f => f.expiresAt > Date.now() && f.expiresAt <= Date.now() + 86400000).length;
  function confirm() {
    if (!candidates.length) return;
    const count = candidates.length;
    const size = total;
    removeFiles(candidates.map(f => f.id));
    router.replace({ pathname: '/cleanup-success', params: { count: String(count), size: String(size) } });
  }
  return <View style={themed.screen}><ScrollView contentContainerStyle={themed.content}>
    <Pressable onPress={() => router.back()}><Text style={themed.back}>‹  Back to Cleanup</Text></Pressable>
    <View style={themed.iconCircle}><Text style={themed.icon}>🧹</Text></View>
    <Text style={themed.title}>Clean {candidates.length} Temporary Files?</Text>
    <View style={themed.pill}><Text style={themed.pillText}>✨ Freeing up {formatSize(total)} of tracked storage</Text></View>
    <Text style={themed.section}>Files to be removed</Text>
    <View style={themed.card}>
      <View style={themed.row}><Text style={themed.rowText}>🔴 Already expired</Text><Text style={themed.value}>{expired}</Text></View>
      <View style={themed.row}><Text style={themed.rowText}>🟠 Expiring within 24h</Text><Text style={themed.value}>{soon}</Text></View>
      <View style={themed.row}><Text style={themed.rowText}>🟣 Other selected files</Text><Text style={themed.value}>{candidates.length - expired - soon}</Text></View>
      <View style={themed.divider}/>
      {candidates.map(f => <View key={f.id} style={themed.row}><Text numberOfLines={1} style={[themed.rowText, { flex: 1 }]}>{f.name}</Text><Text style={themed.value}>{formatSize(f.sizeMB)}</Text></View>)}
      {!candidates.length && <Text style={themed.muted}>No selected files remain. Return to Cleanup to select files.</Text>}
    </View>
    <View style={themed.safety}><Text style={themed.safetyTitle}>🛡️ Frontend demonstration</Text><Text style={themed.muted}>This action removes saved TempBox records. It does not delete original device files, create a recycle bin, or recover physical storage space.</Text></View>
    <Pressable disabled={!candidates.length} onPress={confirm} style={[themed.primary, !candidates.length && { opacity: 0.4 }]}><Text style={themed.primaryText}>Confirm Cleanup</Text></Pressable>
    <Pressable onPress={() => router.back()} style={themed.cancel}><Text style={themed.cancelText}>Cancel — Keep My Files</Text></Pressable>
  </ScrollView></View>;
}
const baseStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF8FF' }, content: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 22, paddingBottom: 50, gap: 16 }, back: { color: '#4F46E5', fontSize: 15, fontWeight: '700' }, iconCircle: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#E9E6FF', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 15 }, icon: { fontSize: 42 }, title: { fontSize: 27, fontWeight: '800', color: '#131B2E', textAlign: 'center' }, pill: { backgroundColor: '#E9E6FF', padding: 12, borderRadius: 22, alignSelf: 'center' }, pillText: { color: '#3525CD', fontWeight: '700', fontSize: 13 }, section: { fontSize: 17, fontWeight: '800', color: '#131B2E', marginTop: 6 }, card: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: '#ECEAF6' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, rowText: { color: '#464555', fontSize: 13 }, value: { color: '#131B2E', fontWeight: '800' }, divider: { height: 1, backgroundColor: '#ECEAF6' }, muted: { color: '#696779', fontSize: 13, lineHeight: 20 }, safety: { backgroundColor: '#EDEAFF', padding: 16, borderRadius: 16, gap: 6 }, safetyTitle: { fontWeight: '800', color: '#3525CD' }, primary: { backgroundColor: '#4F46E5', borderRadius: 30, padding: 17, alignItems: 'center' }, primaryText: { color: '#FFF', fontWeight: '800', fontSize: 16 }, cancel: { padding: 14, alignItems: 'center' }, cancelText: { color: '#4F46E5', fontWeight: '700' },
});
