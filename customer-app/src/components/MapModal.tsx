import React, { useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme';
import { Button } from '../ui';
import { useLang } from '../i18n';

// Parse a "lat, lng" string into numbers (or null).
function parse(coord: string | null): { lat: number; lng: number } | null {
  if (!coord) return null;
  const [lat, lng] = coord.split(',').map((n) => parseFloat(n.trim()));
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

function mapHtml(initial: { lat: number; lng: number } | null): string {
  const start = initial || { lat: 33.8938, lng: 35.5018 }; // Beirut
  const hasInitial = !!initial;
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{height:100%;margin:0;padding:0}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([${start.lat}, ${start.lng}], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap'
    }).addTo(map);
    var marker = null;
    function send(latlng){
      window.ReactNativeWebView.postMessage(JSON.stringify({lat: latlng.lat, lng: latlng.lng}));
    }
    function place(latlng){
      if(!marker){
        marker = L.marker(latlng, {draggable:true}).addTo(map);
        marker.on('dragend', function(e){ send(e.target.getLatLng()); });
      } else { marker.setLatLng(latlng); }
      send(latlng);
    }
    map.on('click', function(e){ place(e.latlng); });
    if(${hasInitial}){ place({lat:${start.lat}, lng:${start.lng}}); }
  </script>
</body>
</html>`;
}

export default function MapModal({
  visible,
  initial,
  onClose,
  onPick,
}: {
  visible: boolean;
  initial: string | null;
  onClose: () => void;
  onPick: (coord: string) => void;
}) {
  const start = parse(initial);
  const [coord, setCoord] = useState<string | null>(initial);
  const htmlRef = useRef(mapHtml(start));
  const { t } = useLang();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('map_title')}</Text>
          <Text style={styles.hint}>{t('map_hint')}</Text>
        </View>

        <WebView
          originWhitelist={['*']}
          source={{ html: htmlRef.current }}
          style={styles.web}
          onMessage={(e) => {
            try {
              const { lat, lng } = JSON.parse(e.nativeEvent.data);
              setCoord(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            } catch {}
          }}
        />

        <View style={styles.footer}>
          <Text style={styles.coord}>{coord ? `📍 ${coord}` : t('map_no_pin')}</Text>
          <View style={styles.actions}>
            <Button label={t('cancel')} variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <Button
              label={t('use_location')}
              onPress={() => coord && onPick(coord)}
              disabled={!coord}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  hint: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  web: { flex: 1 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 },
  coord: { fontSize: 14, color: colors.text, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
});
