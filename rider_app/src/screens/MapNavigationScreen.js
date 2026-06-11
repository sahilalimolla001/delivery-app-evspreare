import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const MapNavigationScreen = ({ route, navigation }) => {
  const [eta, setEta] = useState('11 mins');
  const [distance, setDistance] = useState('3.8 km');
  const [currentInstruction, setCurrentInstruction] = useState(
    'Turn right towards 5th Main Rd'
  );

  const order = route?.params?.order || {
    pickupFrom: 'Daily Needs Store',
    pickupDistance: '0.8 km',
    pickupTime: '3 min',
    deliverTo: 'Rohit Sharma',
    deliverDistance: '2.6 km',
    deliverTime: '8 min',
  };

  const directions = [
    { distance: '1.2 km', instruction: 'Turn right towards 5th Main Rd' },
    { distance: '0.8 km', instruction: 'Continue on Main Street' },
    { distance: '0.6 km', instruction: 'Turn left at the traffic light' },
    { distance: '1.2 km', instruction: 'Destination on the right' },
  ];

  const [currentDirection, setCurrentDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDirection((prev) => (prev + 1) % directions.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>📍 Google Maps Integration</Text>
          <Text style={styles.mapSubtext}>
            Live route from pickup to delivery
          </Text>
          {/* In production, integrate:
            - react-native-maps
            - MapView component
            - Polyline for route
            - Real-time location marker
          */}
        </View>
      </View>

      {/* Instruction Card (Floating) */}
      <View style={styles.instructionCard}>
        <View style={styles.instructionHeader}>
          <Text style={styles.distanceLabel}>
            {directions[currentDirection].distance}
          </Text>
          <View style={styles.instructionBadge}>
            <Text style={styles.badgeText}>📍</Text>
          </View>
        </View>
        <Text style={styles.instruction}>
          {directions[currentDirection].instruction}
        </Text>
      </View>

      {/* Location Cards (Bottom) */}
      <View style={styles.locationsContainer}>
        {/* Pickup Location */}
        <View style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <Text style={styles.iconEmoji}>📦</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>{order.pickupFrom}</Text>
            <View style={styles.locationMeta}>
              <Text style={styles.metaText}>
                {order.pickupDistance} • {order.pickupTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Location */}
        <View style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <Text style={styles.iconEmoji}>🏠</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>{order.deliverTo}</Text>
            <View style={styles.locationMeta}>
              <Text style={styles.metaText}>
                {order.deliverDistance} • {order.deliverTime}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>📞 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.endButton}>
          <Text style={styles.buttonText}>End Navigation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    alignItems: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E5BA8',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 13,
    color: '#666',
  },
  instructionCard: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E5BA8',
  },
  instructionBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 16,
  },
  instruction: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  locationsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 20,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  endButton: {
    flex: 2,
    backgroundColor: '#1E5BA8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MapNavigationScreen;
