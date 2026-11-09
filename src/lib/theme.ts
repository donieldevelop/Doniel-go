// Identité Doniel Driver : bleu nuit profond + orange taxi brillant, rendu en relief.
export const couleurs = {
  nuit: '#16235E',
  nuitClair: '#2B3FA0',
  nuitProfond: '#0C1440',
  orange: '#F28C1B',
  orangeClair: '#FFB54D',
  orangeSombre: '#B35A00',
  vert: '#1F9D58',
  vertClair: '#4CD08A',
  vertSombre: '#12693A',
  rouge: '#D64545',
  fond: '#E7ECF7',
  surface: '#FFFFFF',
  surfaceHaut: '#F7F9FF',
  bordure: '#D3DAEE',
  texte: '#16203F',
  texteDoux: '#5A6585',
};

export const polices = {
  normal: 'Baloo2_400Regular',
  moyen: 'Baloo2_500Medium',
  gras: 'Baloo2_700Bold',
  titre: 'Baloo2_800ExtraBold',
};

// Ombre portée en relief (iOS + Android)
export const relief = (profondeur = 6, couleur = '#0C1440') => ({
  shadowColor: couleur,
  shadowOffset: { width: 0, height: profondeur },
  shadowOpacity: 0.28,
  shadowRadius: profondeur * 1.4,
  elevation: profondeur + 2,
});
