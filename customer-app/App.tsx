import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './src/theme';
import { Booking, Service, TimePref, Lang } from './src/data';
import { LangProvider } from './src/i18n';
import {
  insertBooking,
  updateBooking,
  upsertCustomer,
  fetchProviders,
  fetchLatestBooking,
  subscribeBooking,
} from './src/db';
import HomeScreen from './src/screens/HomeScreen';
import RequestScreen from './src/screens/RequestScreen';
import BookingScreen from './src/screens/BookingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

type Screen = 'home' | 'request' | 'booking' | 'profile';

const PHONE_KEY = 'userPhone';
const ADDRESS_KEY = 'defaultAddress';
const PIN_KEY = 'defaultPin';
const LANG_KEY = 'lang';

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [phone, setPhone] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [defaultPin, setDefaultPin] = useState('');

  const changeLang = (l: Lang) => {
    setLang(l);
    AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  };
  const [pickedService, setPickedService] = useState<Service | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const providerMap = useRef<Record<string, string>>({});
  const unsubBooking = useRef<(() => void) | null>(null);

  // Add the provider's name once we know which provider was assigned.
  const enrich = (b: Booking): Booking =>
    b.providerId ? { ...b, providerName: providerMap.current[b.providerId] } : b;

  useEffect(() => {
    return () => {
      if (unsubBooking.current) unsubBooking.current();
    };
  }, []);

  // On launch: load saved defaults, provider names, and restore the last booking.
  useEffect(() => {
    (async () => {
      try {
        const [savedPhone, savedAddress, savedPin, savedLang] = await Promise.all([
          AsyncStorage.getItem(PHONE_KEY),
          AsyncStorage.getItem(ADDRESS_KEY),
          AsyncStorage.getItem(PIN_KEY),
          AsyncStorage.getItem(LANG_KEY),
        ]);
        if (savedAddress) setDefaultAddress(savedAddress);
        if (savedPin) setDefaultPin(savedPin);
        if (savedLang === 'ar' || savedLang === 'en') setLang(savedLang);

        const ps = await fetchProviders().catch(() => []);
        providerMap.current = Object.fromEntries(ps.map((p: any) => [p.id, p.name]));

        if (savedPhone) {
          setPhone(savedPhone);
          const latest = await fetchLatestBooking(savedPhone).catch(() => null);
          if (latest) {
            setBooking(enrich(latest));
            unsubBooking.current = subscribeBooking(latest.id, (u) => setBooking(enrich(u)));
          }
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const saveDefaults = (addr: string, pin: string) => {
    setDefaultAddress(addr);
    setDefaultPin(pin);
    AsyncStorage.setItem(ADDRESS_KEY, addr).catch(() => {});
    AsyncStorage.setItem(PIN_KEY, pin).catch(() => {});
  };

  const handleSaveProfile = (newPhone: string, newAddress: string, newPin: string) => {
    setPhone(newPhone);
    AsyncStorage.setItem(PHONE_KEY, newPhone).catch(() => {});
    saveDefaults(newAddress, newPin);
    upsertCustomer(newPhone, { default_address: newAddress, default_pin: newPin });
    setScreen('home');
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  const handleSubmit = async (data: {
    phone: string;
    description: string;
    photoBase64?: string | null;
    landmark: string;
    pin?: string;
    timePref: TimePref;
    dayLabel?: string;
    timeWindow?: string;
    saveAsDefault?: boolean;
  }) => {
    if (!pickedService || submitting) return;
    const reqPhone = data.phone.trim();

    // Remember the phone they used as their default for next time.
    setPhone(reqPhone);
    AsyncStorage.setItem(PHONE_KEY, reqPhone).catch(() => {});

    if (data.saveAsDefault && (data.landmark.trim() || data.pin)) {
      saveDefaults(data.landmark.trim(), data.pin || '');
    }
    upsertCustomer(reqPhone, {
      ...(data.saveAsDefault ? { default_address: data.landmark.trim(), default_pin: data.pin || '' } : {}),
    });

    setSubmitting(true);
    try {
      const created = await insertBooking({
        phone: reqPhone,
        service: pickedService,
        description: data.description,
        landmark: data.landmark,
        pin: data.pin,
        photoBase64: data.photoBase64,
        timePref: data.timePref,
        dayLabel: data.dayLabel,
        timeWindow: data.timeWindow,
      });
      setBooking(created);
      setScreen('booking');

      // Listen for the dispatcher's quote / assignment in real time.
      if (unsubBooking.current) unsubBooking.current();
      unsubBooking.current = subscribeBooking(created.id, (updated) => setBooking(enrich(updated)));
    } catch (e) {
      console.warn('insertBooking failed', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = (stars: number) => {
    if (!booking) return;
    setBooking({ ...booking, rating: stars });
    updateBooking(booking.id, { rating: stars }).catch(() => {});
  };

  return (
    <LangProvider lang={lang} setLang={changeLang}>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        {screen === 'home' && (
          <HomeScreen
            activeBooking={booking}
            onOpenBooking={() => setScreen('booking')}
            onOpenProfile={() => setScreen('profile')}
            onPick={(s) => {
              setPickedService(s);
              setScreen('request');
            }}
          />
        )}

        {screen === 'profile' && (
          <ProfileScreen
            phone={phone}
            defaultAddress={defaultAddress}
            defaultPin={defaultPin}
            onBack={() => setScreen('home')}
            onSave={handleSaveProfile}
          />
        )}

        {screen === 'request' && pickedService && (
          <RequestScreen
            service={pickedService}
            defaultPhone={phone}
            defaultAddress={defaultAddress}
            defaultPin={defaultPin}
            submitting={submitting}
            onBack={() => setScreen('home')}
            onSubmit={handleSubmit}
          />
        )}

        {screen === 'booking' && booking && (
          <BookingScreen booking={booking} onBack={() => setScreen('home')} onRate={handleRate} />
        )}
      </SafeAreaView>
    </LangProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
