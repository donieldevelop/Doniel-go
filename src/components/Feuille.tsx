import { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { couleurs, relief } from '@/lib/theme';
import { T } from './Texte';

/** Panneau qui monte du bas de l'écran, pour une action rapide */
export function Feuille({ visible, titre, onFermer, children }: {
  visible: boolean; titre: string; onFermer: () => void; children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFermer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={s.voile} onPress={onFermer} accessibilityLabel="Fermer" />
        <View style={[s.panneau, relief(16)]}>
          <View style={s.poignee} />
          <T v="sousTitre">{titre}</T>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14, paddingTop: 12, paddingBottom: 24 }}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  voile: { flex: 1, backgroundColor: 'rgba(12,20,64,0.45)' },
  panneau: {
    backgroundColor: couleurs.fond, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingTop: 10, maxHeight: '88%',
  },
  poignee: { alignSelf: 'center', width: 48, height: 5, borderRadius: 3, backgroundColor: '#B9C2DD', marginBottom: 12 },
});
