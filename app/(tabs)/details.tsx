import { View, Text, StyleSheet, Modal, Pressable, Image, useColorScheme } from 'react-native';
import { Linking } from 'react-native';
import { useLake } from '@/context/LakeContext';
import { useEffect, useRef, useState } from 'react';
import MapView, { Marker, Region, Polyline } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { XMLParser } from 'fast-xml-parser';
import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';



export default function DetailsScreen() {
  const { selectedLake } = useLake();
  const [modalVisible, setModalVisible] = useState(false);
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[] | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['17%', '50%', '90%'];

    const colorScheme = useColorScheme();
    const sheetBackgroundColor = colorScheme === 'dark' ? '#23292c' : 'white';
    const textColor = colorScheme === 'dark' ? 'white' : 'black';

  useEffect(() => {
    if (selectedLake && mapRef.current) {
      const region: Region = {
        latitude: selectedLake.latitude,
        longitude: selectedLake.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
      mapRef.current.animateToRegion(region, 500);
    }
  }, [selectedLake]);

  useEffect(() => {
    const fetchAndParseGpx = async () => {
      if (!selectedLake?.gpxUrl) return;
      try {
        const response = await fetch(selectedLake.gpxUrl);
        const gpxText = await response.text();
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
          removeNSPrefix: true,
        });
        const gpx = parser.parse(gpxText);
        const trackSegment = gpx?.gpx?.trk?.trkseg;
        let trackPoints = Array.isArray(trackSegment) ? trackSegment[0]?.trkpt : trackSegment?.trkpt;
        if (trackPoints && Array.isArray(trackPoints)) {
          const parsed = trackPoints.map((pt: any) => ({
            latitude: parseFloat(pt['@_lat']),
            longitude: parseFloat(pt['@_lon']),
          }));
          setRoute(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch or parse GPX:", err);
      }
    };
    fetchAndParseGpx();
  }, [selectedLake?.gpxUrl]);

  // console.log("Current selectedLake in Details:", selectedLake);

  if (!selectedLake) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Select a lake to see lake details</Text>
      </View>
    );
  } 

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ ...StyleSheet.absoluteFillObject }}
        initialRegion={{
          latitude: selectedLake.latitude,
          longitude: selectedLake.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        <Marker
          coordinate={{ latitude: selectedLake.latitude, longitude: selectedLake.longitude }}
          title={selectedLake.name}
        />
        {route && (
          <Polyline
            coordinates={route}
            strokeColor="blue"
            strokeWidth={4}
          />
        )}
      </MapView>
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: sheetBackgroundColor }}
        handleIndicatorStyle={{ backgroundColor: '#ccc', width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: textColor, textAlign: 'center' }}>
          {selectedLake.name}
        </Text>

          <Image
            source={{ uri: selectedLake?.images?.find(img => img.isMain)?.url || require('../../ph.png') }}
            style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 10 }}
            resizeMode="cover"
          />
          <Text style={{ fontSize: 16, marginBottom: 4, color: textColor }}>Route: 3.2 miles STATIC</Text>
          <Text style={{ fontSize: 16, marginBottom: 4, color: textColor }}>Est. Time: 45 minutes STATIC</Text>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={{
              marginTop: 10,
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: colorScheme === 'dark' ? '#333' : '#007AFF',
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>View Depth Map</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
          <View style={{ margin: 20, flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: 'white' }}>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={{
              position: 'absolute',
              bottom: 10,
              alignSelf: 'center',
              zIndex: 10,
              backgroundColor: '#D32F2F', // Material Design red 700              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 8,
              borderColor: 'white',
              minWidth: 350,
              minHeight:75,
              alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, lineHeight: 75, textAlign: 'center' }}>Close</Text>
            </Pressable>
            <WebView
              source={{
                uri: `https://fishing-app.gpsnauticalcharts.com/i-boating-fishing-web-app/fishing-marine-charts-navigation.html?title=${encodeURIComponent(
                  selectedLake.name + ", LAKE boating app"
                )}#14/${selectedLake.latitude}/${selectedLake.longitude}`
              }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
