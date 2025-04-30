import { XMLParser } from 'fast-xml-parser';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Text, Button, ScrollView, TouchableOpacity, PanResponder, useColorScheme } from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLake } from '@/context/LakeContext';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import CustomSlider from '../components/subcomponents/CustomSlider';


export default function ExploreScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [lakes, setLakes] = useState<{ id: string; name: string; latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLake, setSelectedLake] = useState<typeof lakes[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [radius, setRadius] = useState(5); // default radius in miles

  const colorScheme = useColorScheme();
  const sheetBackgroundColor = colorScheme === 'dark' ? '#23292c' : 'white';
  const textColor = colorScheme === 'dark' ? 'white' : 'black';

  const { selectLake } = useLake();

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '60%'], []);

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const sliderRef = useRef<View>(null);
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newRadius = Math.min(Math.max(Math.round(radius + gestureState.dx / 5), 1), 50);
        setRadius(newRadius);
      },
    })
  ).current;

  const handleSliderLayout = () => {};

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );

      const { data, error } = await supabase.from('Lake').select('id, name, latitude, longitude');
      if (error) {
        console.error('Error fetching lakes:', error.message);
        return;
      }
      setLakes(data);
      setLoading(false);
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  if (!location || loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        key={lakes.length}
        style={styles.map}
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {/* User location marker removed; showsUserLocation displays the blue dot natively */}
        {location && (
          <Circle
            center={location.coords}
            radius={radius * 1609.34} // convert miles to meters
            strokeColor="rgba(0, 150, 255, 0.5)"
            fillColor="rgba(0, 150, 255, 0.2)"
          />
        )}
        {lakes.map((lake) => (
          <Marker
            key={lake.id}
            coordinate={{ latitude: lake.latitude, longitude: lake.longitude }}
            title={lake.name}
            onPress={async () => {
              try {
                const [mediaResult, imageResult] = await Promise.all([
                  supabase
                    .from('Media')
                    .select('url')
                    .eq('lakeId', lake.id)
                    .eq('type', 'application/gpx+xml')
                    .maybeSingle(),
                  supabase
                    .from('LakeImage')
                    .select('*')
                    .eq('lakeId', lake.id)
                    .eq('isMain', true),
                ]);

                const { data: mediaData, error: mediaError } = mediaResult;
                const { data: imageData, error: imageError } = imageResult;

                if (mediaError) {
                  console.error("Error fetching media:", mediaError.message);
                }

                if (imageError) {
                  console.error("Error fetching lake images:", imageError.message);
                }

                const gpxUrl = mediaData?.url || null;

                const lakeData = { ...lake, gpxUrl, images: imageData || [] };
                selectLake(lakeData as any);
              } catch (error) {
                console.error("Unexpected error loading lake data:", error);
                selectLake({
                  ...lake,
                  gpxUrl: null,
                  images: [],
                } as any);
              }
            }}
          />
        ))}
      </MapView>

      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={{ backgroundColor: '#ccc', width: 40 }}
        backgroundStyle={{ backgroundColor: sheetBackgroundColor }}
      >
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            marginBottom: 10,
            paddingHorizontal: 20,
            color: textColor,
            textAlign: 'center',
          }}
        >
          Nearby Lakes
        </Text>
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          style={{ paddingHorizontal: 20 }}
        >
          {lakes
            .map((lake) => ({
              ...lake,
              distance: getDistanceFromLatLonInKm(
                location.coords.latitude,
                location.coords.longitude,
                lake.latitude,
                lake.longitude
              ),
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10)
            .map((lake) => (
              <Text key={lake.id} style={{ paddingVertical: 8, color: textColor }}>
                {lake.name} - {lake.distance.toFixed(2)} km
              </Text>
            ))}
        </BottomSheetScrollView>
      </BottomSheet>

      <View style={{ position: 'absolute', top: 50, left: 10}}>
        <View style={{ width: Dimensions.get('window').width / 3, alignSelf: 'center' }}>
          <CustomSlider
            label={`Search Radius`}
            value={radius}
            onValueChange={setRadius}
            min={1}
            max={30}
            step={1}
            fillColor="#0096FF"
            panHandlers={panResponder.panHandlers}
            onLayout={handleSliderLayout}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
