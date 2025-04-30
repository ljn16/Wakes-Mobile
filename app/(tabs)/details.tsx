import { View, Text, StyleSheet, Modal, Pressable, Image } from 'react-native';
import { Linking } from 'react-native';
import { useLake } from '@/context/LakeContext';
import { useEffect, useRef, useState } from 'react';
import MapView, { Marker, Region, Polyline } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { XMLParser } from 'fast-xml-parser';



export default function DetailsScreen() {
  const { selectedLake } = useLake();
  const [modalVisible, setModalVisible] = useState(false);
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[] | null>(null);

  const mapRef = useRef<MapView | null>(null);

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
      <View style={{ position: 'absolute', top: 75, alignSelf: 'center' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, width: 300 }}>
          <Image
            source={{ uri: selectedLake?.images?.find(img => img.isMain)?.url || require('../../ph.png') }}
            // source={require('../../ph.png')}
            style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 10 }}
            resizeMode="cover"
            />
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10 }}>{selectedLake.name}</Text>
          {/* <Text style={{ fontSize: 16, marginBottom: 4 }}>Latitude: {selectedLake.latitude}</Text>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>Longitude: {selectedLake.longitude}</Text> */}
          <Text style={{ fontSize: 16, marginBottom: 4 }}>Route Length: 3.2 miles STATIC</Text>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>Est. Time: 45 minutes STATIC</Text>
          <Text
            onPress={() => setModalVisible(true)}
            style={{ fontSize: 16, color: 'blue', textDecorationLine: 'underline' }}
          >
            View Depth Map
          </Text>
        </View>
      </View>
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
              top: 50,
              alignSelf: 'center',
              zIndex: 10,
              backgroundColor: '#000',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderColor: 'white',
              borderWidth: 2,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
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
