import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { colors, radius } from '../theme';
import { services, Service, Booking, SUPPORT_PHONE, svcName } from '../data';
import { useLang } from '../i18n';

export default function HomeScreen({
  onPick,
  activeBooking,
  onOpenBooking,
  onOpenProfile,
}: {
  onPick: (s: Service) => void;
  activeBooking: Booking | null;
  onOpenBooking: () => void;
  onOpenProfile: () => void;
}) {
  const { t, lang, isRTL } = useLang();
  const waNumber = SUPPORT_PHONE.replace(/[^0-9]/g, '');
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.brand}>{t('brand')}</Text>
        <Pressable onPress={onOpenProfile} hitSlop={10} style={styles.profileBtn}>
          <Text style={styles.profileIcon}>👤</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {activeBooking ? (
          <Pressable style={styles.activeCard} onPress={onOpenBooking}>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>
                {svcName(activeBooking.service, lang)} · {activeBooking.ref}
              </Text>
              <Text style={styles.activeSub}>{statusLabel(activeBooking.status, t)}</Text>
            </View>
            <Text style={styles.chev}>{isRTL ? '‹' : '›'}</Text>
          </Pressable>
        ) : null}

        <Text style={[styles.prompt, isRTL && styles.rtl]}>{t('home_prompt')}</Text>
        <View style={styles.grid}>
          {services.map((s) => (
            <Pressable
              key={s.id}
              style={({ pressed }) => [styles.tile, pressed && { backgroundColor: colors.surface }]}
              onPress={() => onPick(s)}
            >
              <Text style={styles.tileIcon}>{s.icon}</Text>
              <Text style={styles.tileLabel}>{svcName(s, lang)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.contactHeading, isRTL && styles.rtl]}>{t('need_help')}</Text>
        <Pressable
          style={({ pressed }) => [styles.contactBtn, styles.waBtn, pressed && { opacity: 0.85 }]}
          onPress={() =>
            Linking.openURL(
              `https://wa.me/${waNumber}?text=${encodeURIComponent('Hi, I have a question about a home service')}`
            )
          }
        >
          <Text style={styles.contactIcon}>💬</Text>
          <Text style={styles.waText}>{t('whatsapp')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function statusLabel(s: Booking['status'], t: (k: any) => string) {
  switch (s) {
    case 'requested': return t('st_requested');
    case 'accepted': return t('st_accepted');
    case 'on_way': return t('st_on_way');
    case 'done': return t('st_done');
    case 'cancelled': return t('st_cancelled');
    default: return t('st_requested');
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  brand: { fontSize: 18, fontWeight: '700', color: colors.text },
  profileBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  profileIcon: { fontSize: 22 },
  body: { padding: 16 },
  prompt: { fontSize: 15, color: colors.textMuted, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bg,
  },
  tileIcon: { fontSize: 28 },
  tileLabel: { fontSize: 14, color: colors.text, fontWeight: '500' },
  activeCard: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.infoBg,
    backgroundColor: colors.infoBg,
    borderRadius: radius.lg,
    padding: 16,
  },
  activeTitle: { fontSize: 15, fontWeight: '600', color: colors.info },
  activeSub: { fontSize: 13, color: colors.info, marginTop: 2 },
  chev: { fontSize: 24, color: colors.info },
  contactHeading: { fontSize: 13, color: colors.textMuted, marginTop: 24, marginBottom: 10 },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 16,
    backgroundColor: colors.surface,
  },
  waBtn: { borderColor: colors.success, backgroundColor: colors.successBg },
  waText: { fontSize: 15, fontWeight: '600', color: colors.success },
  contactIcon: { fontSize: 20 },
  contactTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
