import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, radius } from './theme';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        isPrimary ? styles.btnPrimary : styles.btnOutline,
        disabled && styles.btnDisabled,
        pressed && !disabled && { opacity: 0.85 },
        style,
      ]}
    >
      <Text style={[styles.btnText, isPrimary ? styles.btnTextPrimary : styles.btnTextOutline]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
      ) : null}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnOutline: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.bg },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 15, fontWeight: '600' } as TextStyle,
  btnTextPrimary: { color: colors.onPrimary },
  btnTextOutline: { color: colors.text },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: 8,
  },
  backBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: colors.text, lineHeight: 28, marginTop: -4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  label: { fontSize: 12, color: colors.textHint, marginBottom: 6 },
});
