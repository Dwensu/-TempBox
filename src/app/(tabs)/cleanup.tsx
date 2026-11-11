import { FileItem, useFiles } from '@/context/FilesContext';
import { useSettings } from '@/context/SettingsContext';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { themeStyles } from '../../../utils/tempboxTheme';

const DAY = 86400000;
const purple = '#4F46E5';
const formatSize = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
type Group = { title: string; subtitle: string; files: FileItem[]; color: string };

export default function CleanupScreen() {
  const { appearance } = useSettings();
  const dark = appearance === 'dark';
  const themed = themeStyles(baseStyles, dark);
  const { files } = useFiles();
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['Expired', 'Within 24 hours']);
  const now = Date.now();
  const groups: Group[] = useMemo(() => [
    { title: 'Expired', subtitle: 'Past their expiration date', color: '#DC4444', files: files.filter(f => f.expiresAt <= now) },
    { title: 'Within 24 hours', subtitle: 'Expiring very soon', color: '#E08A25', files: files.filter(f => f.expiresAt > now && f.expiresAt <= now + DAY) },
    { title: 'Within 3 days', subtitle: 'Upcoming cleanup candidates', color: '#8B5CF6', files: files.filter(f => f.expiresAt > now + DAY && f.expiresAt <= now + 3 * DAY) },
    { title: 'Later', subtitle: 'Not urgent — select only if needed', color: purple, files: files.filter(f => f.expiresAt > now + 3 * DAY) },
  ], [files, now]);
  const selectedFiles = files.filter(f => selected.includes(f.id));
  const selectedMB = selectedFiles.reduce((total, f) => total + f.sizeMB, 0);
  const urgentIds = groups.slice(0, 2).flatMap(g => g.files.map(f => f.id));
  const allSelected = files.length > 0 && files.every(f => selected.includes(f.id));
  const toggle = (id: string) => setSelected(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const toggleGroup = (ids: string[]) => setSelected(old => ids.every(id => old.includes(id)) ? old.filter(id => !ids.includes(id)) : [...new Set([...old, ...ids])]);

  return (
    <View style={themed.screen}>
      <ScrollView contentContainerStyle={themed.content}>
        <Text style={themed.brand}>⌛ TempBox</Text>
        <Text style={themed.title}>Smart Cleanup ✨</Text>
        <Text style={themed.muted}>Review temporary files before clearing their records.</Text>
        <View style={themed.hero}>
          <Text style={themed.heroLabel}>SELECTED FOR CLEANUP</Text>
          <Text style={themed.heroNumber}>{formatSize(selectedMB)}</Text>
          <Text style={themed.heroDetail}>{selectedFiles.length} selected · {files.length} total files</Text>
          <View style={themed.heroBar}><View style={[themed.heroFill, { width: `${files.length ? Math.min(100, selectedFiles.length / files.length * 100) : 0}%` }]} /></View>
        </View>
        <View style={themed.actions}>
          <Pressable style={themed.softButton} onPress={() => setSelected(allSelected ? [] : files.map(f => f.id))}><Text style={themed.softText}>{allSelected ? '☑ Deselect All' : '□ Select All'}</Text></Pressable>
          <Pressable style={themed.softButton} onPress={() => setSelected(urgentIds)}><Text style={themed.softText}>⚡ Select Urgent</Text></Pressable>
          <Pressable style={themed.softButton} onPress={() => setSelected([])}><Text style={themed.softText}>Clear Selection</Text></Pressable>
        </View>
        <Text style={themed.section}>Cleanup Categories</Text>
        {groups.map(group => {
          const ids = group.files.map(f => f.id);
          const open = expanded.includes(group.title);
          const count = group.files.filter(f => selected.includes(f.id)).length;
          return <View key={group.title} style={themed.group}>
            <View style={themed.groupHeader}>
              <Pressable disabled={!ids.length} onPress={() => toggleGroup(ids)} style={themed.checkbox}><Text style={themed.checkText}>{ids.length && count === ids.length ? '☑' : count ? '◩' : '□'}</Text></Pressable>
              <Pressable style={{ flex: 1 }} onPress={() => setExpanded(old => open ? old.filter(x => x !== group.title) : [...old, group.title])}>
                <Text style={themed.groupTitle}><Text style={{ color: group.color }}>● </Text>{group.title}</Text>
                <Text style={themed.mutedSmall}>{group.files.length} files · {formatSize(group.files.reduce((a, f) => a + f.sizeMB, 0))}</Text>
              </Pressable>
              <Pressable onPress={() => setExpanded(old => open ? old.filter(x => x !== group.title) : [...old, group.title])}><Text style={themed.chevron}>{open ? '⌃' : '⌄'}</Text></Pressable>
            </View>
            {open && <View style={themed.groupBody}>{group.files.length ? group.files.map(f => <Pressable key={f.id} style={themed.fileRow} onPress={() => toggle(f.id)}>
              <Text style={themed.checkText}>{selected.includes(f.id) ? '☑' : '□'}</Text>
              <View style={{ flex: 1 }}><Text style={themed.fileName} numberOfLines={1}>{f.name}</Text><Text style={themed.mutedSmall}>{f.category} · {formatSize(f.sizeMB)}</Text></View>
            </Pressable>) : <Text style={themed.mutedSmall}>No files in this category.</Text>}</View>}
          </View>;
        })}
        <View style={themed.note}><Text style={themed.noteText}>🛡️ This demo removes file records only. Original device files are not deleted.</Text></View>
        <Pressable disabled={!selectedFiles.length} style={[themed.primary, !selectedFiles.length && themed.disabled]} onPress={() => router.push({ pathname: '/cleanup-confirm', params: { ids: JSON.stringify(selectedFiles.map(f => f.id)) } })}>
          <Text style={themed.primaryText}>Clean Selected ({formatSize(selectedMB)}) →</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
const baseStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF8FF' }, content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, paddingBottom: 42, gap: 12 },
  brand: { fontSize: 16, fontWeight: '800', color: purple }, title: { fontSize: 28, fontWeight: '800', color: '#131B2E' }, muted: { color: '#777587', fontSize: 14 }, mutedSmall: { color: '#777587', fontSize: 12, marginTop: 3 },
  hero: { backgroundColor: purple, borderRadius: 22, padding: 22, gap: 10, marginTop: 8 }, heroLabel: { color: '#DDD8FF', fontWeight: '700', fontSize: 12 }, heroNumber: { color: '#FFF', fontSize: 34, fontWeight: '900' }, heroDetail: { color: '#EEEAFE', fontSize: 13 }, heroBar: { height: 9, backgroundColor: '#8880EE', borderRadius: 9, overflow: 'hidden' }, heroFill: { height: '100%', backgroundColor: '#FFF' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, softButton: { backgroundColor: '#EAE7FF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20 }, softText: { color: '#3525CD', fontSize: 12, fontWeight: '700' }, section: { color: '#131B2E', fontSize: 19, fontWeight: '800', marginTop: 12 },
  group: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: '#ECEAF6', overflow: 'hidden' }, groupHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }, checkbox: { padding: 2 }, checkText: { color: purple, fontSize: 24 }, groupTitle: { fontSize: 15, fontWeight: '700', color: '#131B2E' }, chevron: { fontSize: 24, color: '#777587', paddingHorizontal: 8 }, groupBody: { borderTopWidth: 1, borderTopColor: '#F1EFF9', paddingHorizontal: 16, paddingVertical: 8 }, fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }, fileName: { fontSize: 13, fontWeight: '600', color: '#131B2E' }, note: { backgroundColor: '#EFEDFF', borderRadius: 14, padding: 14 }, noteText: { color: '#514B78', fontSize: 12, lineHeight: 19 }, primary: { backgroundColor: purple, borderRadius: 30, padding: 17, alignItems: 'center', marginTop: 4 }, disabled: { opacity: 0.45 }, primaryText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
