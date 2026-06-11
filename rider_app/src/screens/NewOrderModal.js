import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';

const NewOrderModal = ({ visible, onClose, onAccept, onReject }) => {
  const [timer, setTimer] = useState(15);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(500));

  useEffect(() => {
    if (visible) {
      // Animate modal entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Start countdown
      setTimer(15);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onReject(); // Auto-reject after 15 seconds
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 500,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const order = {
    pickupFrom: 'Daily Needs Store',
    pickupDistance: '0.8 km',
    deliverTo: 'Rohit Sharma',
    deliverDistance: '2.6 km',
    payout: '₹46.50',
    isSurge: true,
  };

  const getTimerColor = () => {
    if (timer <= 5) return '#D32F2F';
    if (timer <= 10) return '#FBC02D';
    return '#4CAF50';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onReject}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🎉</Text>
            <Text style={styles.headerTitle}>New Order!</Text>
            <Text style={styles.headerSubtitle}>
              You have a new delivery
            </Text>
          </View>

          {/* Order Details */}
          <View style={styles.orderContainer}>
            {/* Pickup Section */}
            <View style={styles.locationSection}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationIcon}>📦</Text>
                <Text style={styles.locationTitle}>Pickup From</Text>
              </View>
              <Text style={styles.storeName}>{order.pickupFrom}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{order.pickupDistance} away</Text>
              </View>
            </View>

            {/* Arrow */}
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>↓</Text>
            </View>

            {/* Delivery Section */}
            <View style={styles.locationSection}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationIcon}>🏠</Text>
                <Text style={styles.locationTitle}>Deliver To</Text>
              </View>
              <Text style={styles.customerName}>{order.deliverTo}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{order.deliverDistance} away</Text>
              </View>
            </View>
          </View>

          {/* Payout Section */}
          <View style={styles.payoutContainer}>
            <View style={styles.payoutLeft}>
              <Text style={styles.payoutLabel}>Order Payout</Text>
              <Text style={styles.payoutAmount}>{order.payout}</Text>
            </View>
            {order.isSurge && (
              <View style={styles.surgeBadge}>
                <Text style={styles.surgeIcon}>⚡</Text>
                <Text style={styles.surgeText}>Surge</Text>
              </View>
            )}
          </View>

          {/* Timer Section */}
          <View style={styles.timerContainer}>
            <View
              style={[
                styles.timerCircle,
                { backgroundColor: getTimerColor() },
              ]}
            >
              <Text style={styles.timerText}>{timer}</Text>
              <Text style={styles.timerLabel}>sec</Text>
            </View>
            <Text style={styles.timerMessage}>
              Accept in {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : '00:00'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={onReject}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
            >
              <Text style={styles.acceptButtonText}>Accept Order</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ This order will be assigned to another rider if you don't
              respond
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  orderContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  locationTitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  arrowContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  arrow: {
    fontSize: 20,
    color: '#1E5BA8',
    fontWeight: '600',
  },
  payoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  payoutLeft: {},
  payoutLabel: {
    fontSize: 12,
    color: '#1E5BA8',
    marginBottom: 4,
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E5BA8',
  },
  surgeBadge: {
    backgroundColor: '#1E5BA8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  surgeIcon: {
    fontSize: 16,
  },
  surgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  timerLabel: {
    fontSize: 12,
    color: '#fff',
  },
  timerMessage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1E5BA8',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#FFF9C4',
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default NewOrderModal;
