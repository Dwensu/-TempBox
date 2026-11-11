import { useFiles, type Category } from '@/context/FilesContext';
import { useSettings } from '@/context/SettingsContext';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { themeStyles } from '../../../utils/tempboxTheme';

type Filter = 'All' | Category;
const categories: Filter[] = ['All', 'Documents', 'Images', 'Videos', 'Archives', 'Audio'];
const DAY = 24 * 60 * 60 * 1000;
const symbols: Record<Category, string> = { Documents: '▤', Images: '▧', Videos: '▶', Archives: '▣', Audio: '♫' };
const colors: Record<Category, string> = { Documents: '#FDE8E7', Images: '#E2E7FF', Videos: '#DCF1FF', Archives: '#EADDFF', Audio: '#E6F6ED' };

function remaining(expiresAt: number) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'Expired';
  if (ms < DAY) return `${Math.max(1, Math.ceil(ms / 3600000))}h left`;
  return `${Math.ceil(ms / DAY)} days left`;
}

export default function FilesScreen() {
  const { appearance } = useSettings();
  const dark = appearance === 'dark';
  const themed = themeStyles(baseStyles, dark);
  const { files, removeFiles, extendFiles } = useFiles();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [sortShortest, setSortShortest] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [autoPurge, setAutoPurge] = useState(true);

  const visibleFiles = useMemo(() => files
    .filter(file => (filter === 'All' || file.category === filter) && file.name.toLowerCase().includes(search.toLowerCase().trim()))
    .sort((a, b) => sortShortest ? a.expiresAt - b.expiresAt : b.expiresAt - a.expiresAt),
    [files, filter, search, sortShortest]);
  const selectedFiles = files.filter(file => selected.includes(file.id));
  const selectedSize = selectedFiles.reduce((sum, file) => sum + file.sizeMB, 0);
  const allVisibleSelected = visibleFiles.length > 0 && visibleFiles.every(file => selected.includes(file.id));

  function toggleFile(id: string) {
    setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }
  function toggleVisible() {
    const ids = visibleFiles.map(file => file.id);
    setSelected(current => allVisibleSelected ? current.filter(id => !ids.includes(id)) : [...new Set([...current, ...ids])]);
  }
  function extendSelected() {
    extendFiles(selected, 7);
    setSelected([]);
  }
  function deleteSelected() {
    const remove = () => {
      removeFiles(selected);
      setSelected([]);
    };
    // Browser alert confirmation isn't supported consistently by React Native Alert on web.
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm(`Delete ${selected.length} selected sample file(s)?`)) remove();
    } else {
      Alert.alert('Delete files?', `Remove ${selected.length} sample file(s)?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: remove },
      ]);
    }
  }

  return (
    <View style={themed.screen}>
      <ScrollView contentContainerStyle={themed.content} keyboardShouldPersistTaps="handled">
        <View style={themed.header}>
          <View><Text style={themed.brand}>⌛ TempBox</Text><Text style={themed.heading}>My Files</Text></View>
          <View style={themed.bell}><Text style={themed.bellText}>♧</Text></View>
        </View>
        <Pressable onPress={() => router.push('/add-file')} style={themed.addButton}><Text style={themed.addButtonText}>＋ Add File</Text></Pressable>
        <View style={themed.searchBox}><Text style={themed.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Search your files..." placeholderTextColor="#777587" style={themed.searchInput} autoCapitalize="none" /></View>
        <View style={themed.tools}>
          <Pressable style={themed.sortButton} onPress={() => setSortShortest(v => !v)}><Text style={themed.sortText}>↕  Lifespan: {sortShortest ? 'Shortest first' : 'Longest first'}  ▾</Text></Pressable>
          <Pressable onPress={() => setAutoPurge(v => !v)} style={[themed.purgeBadge, !autoPurge && themed.purgeOff]}><Text style={themed.purgeText}>● Auto-Purge {autoPurge ? 'Active' : 'Off'}</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={themed.filters}>
          {categories.map(category => {
            const count = category === 'All' ? files.length : files.filter(f => f.category === category).length;
            return <Pressable key={category} onPress={() => setFilter(category)} style={[themed.filter, filter === category && themed.activeFilter]}><Text style={[themed.filterText, filter === category && themed.activeFilterText]}>{category} ({count})</Text></Pressable>;
          })}
        </ScrollView>
        <View style={themed.summary}>
          <Pressable onPress={toggleVisible} style={themed.selectAll}><Text style={themed.checkbox}>{allVisibleSelected ? '☑' : '□'}</Text><Text style={themed.summaryText}>Select All</Text></Pressable>
          <Text style={themed.summaryMuted}>{visibleFiles.length} shown · {files.reduce((s, f) => s + f.sizeMB, 0).toFixed(1)} MB total</Text>
        </View>
        {visibleFiles.length === 0 ? <View style={themed.empty}><Text style={themed.emptyTitle}>No matching files</Text><Text style={themed.emptyText}>Try another search or category.</Text></View> : visibleFiles.map(file => {
          const checked = selected.includes(file.id);
          const urgent = file.expiresAt - Date.now() < DAY;
          return <Pressable key={file.id} onPress={() => toggleFile(file.id)} style={[themed.fileCard, checked && themed.selectedCard]}>
            <Text style={[themed.fileCheck, checked && themed.checked]}>{checked ? '●' : '○'}</Text>
            <View style={[themed.fileIcon, { backgroundColor: colors[file.category] }]}><Text style={themed.fileIconText}>{symbols[file.category]}</Text></View>
            <View style={themed.fileBody}><Text numberOfLines={1} style={themed.fileName}>{file.name}</Text><Text style={themed.fileMeta}>{file.sizeMB.toFixed(1)} MB · Added {file.added}</Text><Text style={[themed.expiry, urgent && themed.urgent]}>{urgent ? '◷ ' : '● '}{remaining(file.expiresAt)}</Text></View>
            <Text style={themed.more}>⋮</Text>
          </Pressable>;
        })}
        <View style={themed.tip}><Text style={themed.tipTitle}>💡 Pro tip for temporary files</Text><Text style={themed.tipBody}>Select files to extend their lifespan by 7 days or remove them from this demo list.</Text></View>
        <Text style={themed.note}>Demo mode: sample and imported file records reset when the app reloads. Auto-Purge is a visual toggle and does not run background deletion.</Text>
      </ScrollView>
      {selected.length > 0 && <View style={themed.selectionBar}><View style={themed.selectionInfo}><Text style={themed.selectionTitle}>{selected.length} selected</Text><Text style={themed.selectionSub}>{selectedSize.toFixed(1)} MB</Text></View><Pressable onPress={extendSelected} style={themed.action}><Text style={themed.actionText}>+7d</Text></Pressable><Pressable onPress={deleteSelected} style={themed.action}><Text style={themed.actionText}>Delete</Text></Pressable><Pressable onPress={() => setSelected([])} style={themed.action}><Text style={themed.actionText}>✕</Text></Pressable></View>}
    </View>
  );
}

const baseStyles = StyleSheet.create({
  addButton: { backgroundColor: '#4F46E5', borderRadius: 15, padding: 14, alignItems: 'center', marginBottom: 14 }, addButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  screen: { flex: 1, backgroundColor: '#FAF8FF' }, content: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 110, width: '100%', maxWidth: 760, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }, brand: { fontSize: 14, fontWeight: '800', color: '#4F46E5' }, heading: { fontSize: 28, fontWeight: '800', color: '#131B2E', marginTop: 4 }, bell: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EAEDFF', alignItems: 'center', justifyContent: 'center' }, bellText: { fontSize: 24, color: '#4F46E5' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F1FF', borderRadius: 16, paddingHorizontal: 15, height: 52 }, searchIcon: { fontSize: 26, color: '#4F46E5', marginRight: 9 }, searchInput: { flex: 1, fontSize: 15, color: '#131B2E', outlineStyle: 'none' } as any,
  tools: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 16, marginBottom: 16 }, sortButton: { paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 12 }, sortText: { fontSize: 12, fontWeight: '600', color: '#464555' }, purgeBadge: { paddingVertical: 9, paddingHorizontal: 11, backgroundColor: '#E8F6EE', borderRadius: 20 }, purgeOff: { backgroundColor: '#EAE8F2' }, purgeText: { fontSize: 11, fontWeight: '700', color: '#256C49' },
  filters: { gap: 8, paddingBottom: 12 }, filter: { borderRadius: 22, paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#EAEDFF' }, activeFilter: { backgroundColor: '#4F46E5' }, filterText: { color: '#464555', fontSize: 12, fontWeight: '700' }, activeFilterText: { color: '#FFFFFF' },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginVertical: 12 }, selectAll: { flexDirection: 'row', alignItems: 'center', gap: 7 }, checkbox: { fontSize: 23, color: '#4F46E5' }, summaryText: { fontSize: 13, fontWeight: '700', color: '#131B2E' }, summaryMuted: { fontSize: 12, color: '#777587' },
  fileCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 13, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#F0F0F7' }, selectedCard: { borderColor: '#4F46E5', backgroundColor: '#F2F1FF' }, fileCheck: { fontSize: 23, color: '#C7C4D8' }, checked: { color: '#4F46E5' }, fileIcon: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, fileIconText: { fontSize: 25, color: '#4F46E5' }, fileBody: { flex: 1, minWidth: 0 }, fileName: { fontSize: 13, fontWeight: '700', color: '#131B2E' }, fileMeta: { fontSize: 11, color: '#777587', marginTop: 5 }, expiry: { fontSize: 11, color: '#397A61', marginTop: 6, fontWeight: '700' }, urgent: { color: '#BA1A1A' }, more: { fontSize: 23, color: '#777587' },
  empty: { padding: 35, alignItems: 'center' }, emptyTitle: { fontSize: 17, fontWeight: '700', color: '#131B2E' }, emptyText: { fontSize: 13, color: '#777587', marginTop: 6 },
  tip: { backgroundColor: '#EADDFF', borderRadius: 16, padding: 16, marginTop: 14 }, tipTitle: { fontSize: 14, fontWeight: '800', color: '#3525CD' }, tipBody: { fontSize: 12, color: '#464555', lineHeight: 19, marginTop: 6 }, note: { fontSize: 11, color: '#777587', lineHeight: 17, marginTop: 18 },
  selectionBar: { backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 17, paddingVertical: 13, gap: 8 }, selectionInfo: { flex: 1 }, selectionTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 }, selectionSub: { color: '#E2DFFF', fontSize: 11, marginTop: 3 }, action: { backgroundColor: '#655DEE', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11 }, actionText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
});
