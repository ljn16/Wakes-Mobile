import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Text, Button } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
// import Modal from 'react-native-modal';
import * as Location from 'expo-location';
import { useLake } from '@/context/LakeContext';


export default function ExploreScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [lakes, setLakes] = useState<{ id: string; name: string; latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);
  // const [selectedLake, setSelectedLake] = useState<typeof lakes[0] | null>(null);
  // const [modalVisible, setModalVisible] = useState(false);

  const { selectLake } = useLake();

  // const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  //   const R = 6371; // Radius of the earth in km
  //   const dLat = ((lat2 - lat1) * Math.PI) / 180;
  //   const dLon = ((lon2 - lon1) * Math.PI) / 180;
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos((lat1 * Math.PI) / 180) *
  //       Math.cos((lat2 * Math.PI) / 180) *
  //       Math.sin(dLon / 2) *
  //       Math.sin(dLon / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   const d = R * c; // Distance in km
  //   return d.toFixed(2);
  // };

  useEffect(() => {
    (async () => {
      // const { status } = await Location.requestForegroundPermissionsAsync();
      // if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      const { data, error } = await supabase.from('Lake').select('*');
      if (error) {
        console.error('Error fetching lakes:', error.message);
        return;
      }
      setLakes(data);
      setLoading(false);
    })();
  }, []);

  if (!location || loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        key={lakes.length}
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {/* User location marker removed; showsUserLocation displays the blue dot natively */}
        {lakes.map((lake) => (
          <Marker
            key={lake.id}
            coordinate={{ latitude: lake.latitude, longitude: lake.longitude }}
            title={lake.name}
            onPress={() => {
              console.log("Selected lake:", lake);
              selectLake({
                ...lake,
                route: [
                  { latitude: lake.latitude + 0.001, longitude: lake.longitude },
                  { latitude: lake.latitude + 0.002, longitude: lake.longitude + 0.001 },
                  { latitude: lake.latitude + 0.003, longitude: lake.longitude },
                ],
              });
            }}
          />
        ))}
      </MapView>
              


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
