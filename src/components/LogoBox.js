import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function LogoBox({ size = 'large' }) {
  const { colors } = useTheme();
  const isLarge = size === 'large';

  return (
    <View style={[
      styles.container,
      isLarge ? styles.largeBox : styles.smallBox,
      { backgroundColor: colors.card, borderColor: colors.border }
    ]}>
      <Text style={isLarge ? styles.largeEmoji : styles.smallEmoji}>📦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    alignSelf: 'center',
  },
  largeBox: {
    width: 88,
    height: 88,
    borderRadius: 28,
  },
  smallBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  largeEmoji: {
    fontSize: 44,
  },
  smallEmoji: {
    fontSize: 22,
  },
});