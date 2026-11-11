import { useFiles } from '@/context/FilesContext';
import { useSettings } from '@/context/SettingsContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { themeStyles } from '../../utils/tempboxTheme';
const formatSize = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
export default function CleanupSuccess() {
  const { appearance } = useSettings();
  const dark = appearance === 'dark';
  const themed = themeStyles(baseStyles, dark);
  const params = useLocalSearchParams<{ count?: string; size?: string }>();
  const count = Math.max(0, Number(params.count) || 0);
  const size = Math.max(0, Number(params.size) || 0);
  const { files } = useFiles();
  const remaining = files.reduce((sum, f) => sum + f.sizeMB, 0);
  return <View style={themed.screen}><ScrollView contentContainerStyle={themed.content}>
    <View style={themed.check}><Text style={themed.checkText}>✓</Text></View>
    <Text style={themed.title}>Cleanup Complete!</Text>
    <Text style={themed.subtitle}>Your TempBox file list is a little lighter.</Text>
    <View style={themed.hero}><Text style={themed.heroLabel}>TRACKED RECORD SIZE REMOVED</Text><Text style={themed.heroNumber}>{formatSize(size)}</Text><Text style={themed.heroDetail}>{count} file record{count === 1 ? '' : 's'} removed</Text></View>
    <View style={themed.card}><Text style={themed.cardTitle}>Your TempBox now</Text><View style={themed.row}><Text style={themed.muted}>Remaining records</Text><Text style={themed.value}>{files.length}</Text></View><View style={themed.row}><Text style={themed.muted}>Remaining tracked size</Text><Text style={themed.value}>{formatSize(remaining)}</Text></View></View>
    <View style={themed.tip}><Text style={themed.tipTitle}>💡 Quick Tip</Text><Text style={themed.muted}>Set shorter lifespans for drafts and temporary downloads. Review files before deleting their records.</Text></View>
    <Text style={themed.disclaimer}>This is a frontend demo. No original files were deleted and no physical storage was reclaimed.</Text>
    <Pressable style={themed.primary} onPress={() => router.replace('/add-file')}><Text style={themed.primaryText}>+ Add Temporary File</Text></Pressable>
    <Pressable style={themed.secondary} onPress={() => router.replace('/')}><Text style={themed.secondaryText}>Back to Home</Text></Pressable>
    <Pressable onPress={() => router.replace('/files')}><Text style={themed.link}>View My Files</Text></Pressable>
  </ScrollView></View>;
}
const baseStyles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#FAF8FF' }, content: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 24, paddingTop: 48, paddingBottom: 50, alignItems: 'center', gap: 16 }, check: { backgroundColor: '#E6E2FF', borderRadius: 50, width: 96, height: 96, justifyContent: 'center', alignItems: 'center' }, checkText: { fontSize: 54, color: '#4F46E5', fontWeight: '800' }, title: { fontSize: 29, fontWeight: '900', color: '#131B2E', textAlign: 'center' }, subtitle: { color: '#777587', textAlign: 'center' }, hero: { backgroundColor: '#4F46E5', width: '100%', padding: 24, borderRadius: 22, alignItems: 'center', gap: 8 }, heroLabel: { color: '#E2DFFF', fontSize: 11, fontWeight: '800' }, heroNumber: { color: '#FFF', fontSize: 38, fontWeight: '900' }, heroDetail: { color: '#F3F0FF', fontSize: 13 }, card: { backgroundColor: '#FFF', width: '100%', borderRadius: 20, padding: 18, gap: 14, borderWidth: 1, borderColor: '#EAE7F5' }, cardTitle: { color: '#131B2E', fontWeight: '800', fontSize: 16 }, row: { flexDirection: 'row', justifyContent: 'space-between' }, muted: { color: '#777587', fontSize: 13, lineHeight: 20 }, value: { fontWeight: '800', color: '#131B2E' }, tip: { backgroundColor: '#ECE9FF', padding: 18, borderRadius: 18, width: '100%', gap: 8 }, tipTitle: { color: '#3525CD', fontWeight: '800' }, disclaimer: { color: '#777587', fontSize: 11, textAlign: 'center', lineHeight: 17 }, primary: { backgroundColor: '#4F46E5', borderRadius: 28, padding: 16, width: '100%', alignItems: 'center' }, primaryText: { color: '#FFF', fontWeight: '800' }, secondary: { backgroundColor: '#E9E6FF', borderRadius: 28, padding: 16, width: '100%', alignItems: 'center' }, secondaryText: { color: '#3525CD', fontWeight: '800' }, link: { color: '#4F46E5', fontWeight: '700', marginTop: 5 } });
