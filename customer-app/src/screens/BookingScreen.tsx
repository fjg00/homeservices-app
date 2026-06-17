import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors, radius } from '../theme';
import { Button, Header } from '../ui';
import { Booking, BookingStatus, STATUS_ORDER, svcName } from '../data';
import { useLang } from '../i18n';

const stepKeys: { key: BookingStatus; tk: any }[] = [
  { key: 'requested', tk: 'step_requested' },
  { key: 'accepted', tk: 'step_accepted' },
  { key: 'on_way', tk: 'step_on_way' },
  { key: 'done', tk: 'step_done' },
];

export default function BookingScreen({
  booking,
  onBack,
  onRate,
}: {
  booking: Booking;
  onBack: () => void;
  onRate: (stars: number) => void;
}) {
  const { t, lang } = useLang();
  const currentIdx = STATUS_ORDER.indexOf(booking.status);
  const isDone = booking.status === 'done';
  const cancelled = booking.status === 'cancelled';

  return (
    <View style={styles.wrap}>
      <Header title={`${t('booking')} ${booking.ref}`} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        {cancelled ? <Text style={styles.declined}>{t('cancelled_msg')}</Text> : null}

        {stepKeys.map((step) => {
          const idx = STATUS_ORDER.indexOf(step.key);
          const done = idx < currentIdx;
          const now = idx === currentIdx;
          return (
            <View key={step.key}>
              <View style={styles.stepRow}>
                <View style={[styles.dot, done && styles.dotDone, now && styles.dotNow]}>
                  {done ? <Text style={styles.dotCheck}>✓</Text> : null}
                </View>
                <Text style={[styles.stepLabel, !done && !now && styles.stepFuture]}>{t(step.tk)}</Text>
              </View>

              {step.key === 'accepted' && booking.providerName && currentIdx >= STATUS_ORDER.indexOf('accepted') ? (
                <View style={styles.providerCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{booking.providerName.slice(0, 1)}</Text>
                  </View>
                  <Text style={styles.providerName}>
                    {booking.providerName} — {t('your_pro')} {svcName(booking.service, lang)}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        {isDone ? <Receipt booking={booking} /> : null}

        {isDone && !booking.rating ? <RatePrompt onRate={onRate} /> : null}

        {booking.rating ? (
          <View style={styles.thanks}>
            <Text style={styles.thanksText}>
              {'★'.repeat(booking.rating)}
              {'☆'.repeat(5 - booking.rating)}
            </Text>
            <Text style={styles.thanksSub}>{t('thanks_rating')}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Receipt({ booking }: { booking: Booking }) {
  const { t, lang } = useLang();
  const date = booking.createdAt ? new Date(booking.createdAt) : new Date();
  return (
    <View style={styles.receipt}>
      <Text style={styles.rTitle}>{t('receipt')}</Text>
      <Text style={styles.rBrand}>Baytna · {booking.ref}</Text>
      <View style={styles.rDivider} />
      <Row label={t('r_service')} value={svcName(booking.service, lang)} />
      {booking.providerName ? <Row label={t('r_provider')} value={booking.providerName} /> : null}
      <Row label={t('r_date')} value={date.toLocaleDateString()} />
      <Row label={t('r_payment')} value={t('r_cash')} />
      <View style={styles.rDivider} />
      <View style={styles.rTotalRow}>
        <Text style={styles.rTotalLabel}>{t('r_total')}</Text>
        <Text style={styles.rTotal}>
          {booking.amount != null ? `${booking.currency === 'USD' ? '$' : ''}${booking.amount} ${booking.currency || ''}` : '—'}
        </Text>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rRow}>
      <Text style={styles.rLabel}>{label}</Text>
      <Text style={styles.rValue}>{value}</Text>
    </View>
  );
}

function RatePrompt({ onRate }: { onRate: (n: number) => void }) {
  const { t } = useLang();
  const [stars, setStars] = React.useState(0);
  return (
    <View style={styles.rateBox}>
      <Text style={styles.rateTitle}>{t('rate_title')}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setStars(n)} hitSlop={6}>
            <Text style={[styles.star, n <= stars && styles.starOn]}>★</Text>
          </Pressable>
        ))}
      </View>
      <Button label={t('submit_rating')} onPress={() => onRate(stars)} disabled={stars === 0} style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20 },
  declined: { fontSize: 15, color: colors.textMuted, marginBottom: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
  dotNow: { borderColor: colors.info, borderWidth: 2 },
  dotCheck: { color: colors.onPrimary, fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 16, color: colors.text },
  stepFuture: { color: colors.textHint },
  providerCard: {
    marginLeft: 34, marginVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.info, fontWeight: '700', fontSize: 14 },
  providerName: { fontSize: 14, color: colors.text, flex: 1 },
  receipt: { marginTop: 18, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 18, backgroundColor: colors.surface },
  rTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  rBrand: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  rDivider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  rRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rLabel: { fontSize: 14, color: colors.textMuted },
  rValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  rTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  rTotal: { fontSize: 20, fontWeight: '700', color: colors.success },
  rateBox: { marginTop: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 18, alignItems: 'center' },
  rateTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 10 },
  starsRow: { flexDirection: 'row', gap: 6 },
  star: { fontSize: 34, color: colors.border },
  starOn: { color: colors.star },
  thanks: { marginTop: 16, alignItems: 'center' },
  thanksText: { fontSize: 26, color: colors.star },
  thanksSub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
});
