import { useFiles, type Category } from '@/context/FilesContext';
import { useSettings } from '@/context/SettingsContext';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { themeStyles } from '../../utils/tempboxTheme';

const PURPLE = '#4F46E5';
const options = [
  { days: 1, title: '1 Day', hint: 'One-time downloads' },
  { days: 3, title: '3 Days', hint: 'Event tickets, drafts' },
  { days: 7, title: '7 Days', hint: 'Homework, lab guides', recommended: true },
  { days: 14, title: '14 Days', hint: 'Project drafts' },
  { days: 30, title: '30 Days', hint: 'Monthly materials' },
];
const categories: Category[] = ['Documents', 'Images', 'Videos', 'Archives', 'Audio'];
type Picked = { name: string; size?: number; uri: string; mimeType?: string };
function categoryFor(name: string): Category {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext)) return 'Images';
  if (['mp4', 'mov', 'mkv', 'webm'].includes(ext)) return 'Videos';
  if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) return 'Audio';
  if (['zip', 'rar', '7z', 'tar'].includes(ext)) return 'Archives';
  return 'Documents';
}
function showMessage(message: string) {
  if (Platform.OS === 'web') { if (typeof window !== 'undefined') window.alert(message); }
  else Alert.alert('TempBox', message);
}
export default function AddFileScreen() {
  const { appearance, defaultDays, reminders, autoDelete: defaultAutoDelete } = useSettings();
  const dark = appearance === 'dark';
  const themed = themeStyles(baseStyles, dark);
  const { addFile } = useFiles();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [category, setCategory] = useState<Category>('Documents');
  const [days, setDays] = useState<number | 'custom'>(defaultDays);
  const [customDate, setCustomDate] = useState('');
  const [notify, setNotify] = useState(reminders);
  const [autoDelete, setAutoDelete] = useState(defaultAutoDelete);

  async function chooseFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: false, copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.length) return;
      const file = result.assets[0];
      setPicked({ name: file.name, size: file.size, uri: file.uri, mimeType: file.mimeType });
      setCategory(categoryFor(file.name));
    } catch (error) { showMessage(`Could not select a file: ${String(error)}`); }
  }
  const expiration = days === 'custom' ? (customDate.trim() ? new Date(`${customDate.trim()}T23:59:00`).getTime() : NaN) : Date.now() + days * 86400000;
  const validExpiration = Number.isFinite(expiration) && expiration > Date.now();
  function save() {
    if (!picked) return showMessage('Please choose a file first.');
    if (!validExpiration) return showMessage('Enter a valid future date in YYYY-MM-DD format.');
    addFile({ name: picked.name, sizeMB: (picked.size ?? 0) / 1048576, category, expiresAt: expiration, uri: picked.uri, notifyBefore: notify, autoDelete });
    router.replace('/files');
  }
  return (
    <ScrollView style={themed.screen} contentContainerStyle={themed.content} keyboardShouldPersistTaps="handled">
      <View style={themed.top}><Pressable onPress={() => router.back()}><Text style={themed.back}>‹  Cancel</Text></Pressable><Text style={themed.brand}>⌛ TempBox</Text></View>
      <Text style={themed.title}>Add a Temporary File</Text>
      <Text style={themed.subtitle}>Import a file and decide how long it should stay in TempBox.</Text>
      <Text style={themed.section}>1  Select your file</Text>
      <Pressable onPress={chooseFile} style={themed.upload}><Text style={themed.uploadIcon}>☁</Text><Text style={themed.uploadTitle}>{picked ? 'Replace selected file' : 'Choose a file'}</Text><Text style={themed.muted}>Tap to browse documents on your device</Text></Pressable>
      {picked && <View style={themed.card}><Text style={themed.cardHeading}>Staged Document  ·  Ready</Text><Text style={themed.filename} numberOfLines={2}>▤  {picked.name}</Text><Text style={themed.muted}>{((picked.size ?? 0) / 1048576).toFixed(2)} MB · Metadata-only demo</Text></View>}
      <Text style={themed.section}>2  File category</Text>
      <View style={themed.chips}>{categories.map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[themed.chip, category === item && themed.chipActive]}><Text style={[themed.chipText, category === item && themed.white]}>{item}</Text></Pressable>)}</View>
      <Text style={themed.section}>3  Choose Temporary Lifespan</Text>
      <Text style={themed.muted}>TempBox tracks the expiration date you select.</Text>
      <View style={themed.grid}>{options.map(option => <Pressable key={option.days} onPress={() => setDays(option.days)} style={[themed.lifespan, days === option.days && themed.chosen]}><Text style={themed.lifespanTitle}>{option.title} {days === option.days ? '✓' : ''}</Text><Text style={themed.muted}>{option.hint}</Text>{option.days === defaultDays && <Text style={themed.recommended}>Your default</Text>}</Pressable>)}</View>
      <Pressable onPress={() => setDays('custom')} style={[themed.card, days === 'custom' && themed.chosen]}><Text style={themed.lifespanTitle}>▦  Custom date {days === 'custom' ? '✓' : ''}</Text><Text style={themed.muted}>Pick your own expiration date</Text></Pressable>
      {days === 'custom' && <View style={themed.card}><Text style={themed.label}>Expiration date (YYYY-MM-DD)</Text><TextInput value={customDate} onChangeText={setCustomDate} placeholder="2026-12-15" keyboardType="numbers-and-punctuation" style={themed.input}/></View>}
      <View style={themed.preview}><Text style={themed.previewLabel}>◷  PLANNED EXPIRATION</Text><Text style={themed.previewValue}>{validExpiration ? new Date(expiration).toLocaleString() : 'Select a valid future date'}</Text></View>
      <View style={themed.setting}><View style={themed.settingText}><Text style={themed.settingTitle}>Notify me before expiration</Text><Text style={themed.muted}>Save reminder preference (demo only)</Text></View><Switch value={notify} onValueChange={setNotify} trackColor={{ true: '#B9B3FF' }} thumbColor={notify ? PURPLE : '#FFFFFF'}/></View>
      <View style={themed.setting}><View style={themed.settingText}><Text style={themed.settingTitle}>Auto-delete without prompt</Text><Text style={themed.muted}>Save preference; no background deletion yet</Text></View><Switch value={autoDelete} onValueChange={setAutoDelete} trackColor={{ true: '#B9B3FF' }} thumbColor={autoDelete ? PURPLE : '#FFFFFF'}/></View>
      <View style={themed.preview}><Text style={themed.previewLabel}>ACTIVE TEMP BOX QUOTA</Text><Text style={themed.muted}>Demo only — no cloud storage quota is enforced.</Text></View>
      <Pressable onPress={save} style={themed.submit}><Text style={themed.submitText}>⚡  Start Lifespan & Add File</Text></Pressable>
      <Text style={themed.footer}>TempBox saves file records locally. The original document is not copied into permanent TempBox storage.</Text>
    </ScrollView>
  );
}
const baseStyles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#FAF8FF'},content:{width:'100%',maxWidth:760,alignSelf:'center',paddingHorizontal:18,paddingTop:20,paddingBottom:70},
  top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},back:{color:PURPLE,fontSize:15,fontWeight:'700'},brand:{color:PURPLE,fontWeight:'800'},
  title:{fontSize:28,fontWeight:'800',color:'#131B2E'},subtitle:{fontSize:13,color:'#777587',marginTop:8,marginBottom:22,lineHeight:20},section:{fontSize:17,fontWeight:'800',color:'#131B2E',marginTop:23,marginBottom:12},
  upload:{borderWidth:2,borderStyle:'dashed',borderColor:'#B9B3FF',backgroundColor:'#F0F0FF',borderRadius:18,alignItems:'center',padding:25},uploadIcon:{fontSize:35,color:PURPLE},uploadTitle:{fontSize:16,fontWeight:'800',color:PURPLE,marginVertical:8},
  muted:{fontSize:12,color:'#777587',lineHeight:18},card:{backgroundColor:'#FFFFFF',borderRadius:16,padding:16,marginTop:12,borderWidth:1,borderColor:'#E8E7F3'},cardHeading:{fontSize:12,color:'#397A61',fontWeight:'800',marginBottom:8},filename:{fontSize:14,color:'#131B2E',fontWeight:'700',marginBottom:6},
  chips:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{paddingHorizontal:13,paddingVertical:10,borderRadius:22,backgroundColor:'#EAEDFF'},chipActive:{backgroundColor:PURPLE},chipText:{fontSize:12,color:'#464555',fontWeight:'700'},white:{color:'#FFFFFF'},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:12},lifespan:{width:'48%',flexGrow:1,backgroundColor:'#FFFFFF',borderRadius:15,padding:15,minHeight:94,borderWidth:2,borderColor:'transparent'},chosen:{borderColor:PURPLE,backgroundColor:'#F2F1FF'},lifespanTitle:{fontSize:16,fontWeight:'800',color:'#131B2E',marginBottom:6},recommended:{color:PURPLE,fontSize:11,fontWeight:'800',marginTop:5},
  label:{fontSize:12,color:'#464555',fontWeight:'700',marginBottom:8},input:{backgroundColor:'#F2F3FF',borderRadius:10,padding:12,fontSize:15,color:'#131B2E'},
  preview:{backgroundColor:'#EAEDFF',borderRadius:16,padding:16,marginTop:20},previewLabel:{fontSize:11,fontWeight:'800',color:PURPLE,marginBottom:7},previewValue:{fontSize:16,fontWeight:'800',color:'#131B2E'},
  setting:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,paddingVertical:19,borderBottomWidth:1,borderBottomColor:'#EAE8F2'},settingText:{flex:1},settingTitle:{fontSize:14,fontWeight:'700',color:'#131B2E',marginBottom:5},
  submit:{backgroundColor:PURPLE,borderRadius:28,padding:18,alignItems:'center',marginTop:24},submitText:{color:'#FFFFFF',fontSize:15,fontWeight:'800'},footer:{fontSize:11,color:'#777587',textAlign:'center',marginTop:15,lineHeight:18}
});
