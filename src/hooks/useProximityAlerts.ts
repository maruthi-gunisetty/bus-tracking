import { useState, useEffect, useRef, useMemo } from 'react';
import type { PickupPoint } from '../types';
import { ALERT_THRESHOLDS } from '../config/constants';
import { calculateHaversineDistance } from '../utils/haversine';
import { playAlertChime, playArrivalChime } from '../utils/sound';

export interface ProximityAlertInfo {
  id: string;
  thresholdKm: number;
  message: string;
  distanceMeters: number;
  timestamp: string;
}

interface UseProximityAlertsProps {
  busLat?: number | null;
  busLng?: number | null;
  pickupPoint?: PickupPoint | null;
  alertsEnabled: boolean;
  busStatus?: string;
}

export function useProximityAlerts({
  busLat,
  busLng,
  pickupPoint,
  alertsEnabled,
  busStatus,
}: UseProximityAlertsProps) {
  const [activeAlert, setActiveAlert] = useState<ProximityAlertInfo | null>(null);
  const [alertHistory, setAlertHistory] = useState<ProximityAlertInfo[]>([]);

  // Track previous distance and approach state without setState in effect
  const [prevDistance, setPrevDistance] = useState<number | null>(null);
  const [isApproaching, setIsApproaching] = useState<boolean>(true);

  const triggeredThresholdsRef = useRef<Set<number>>(new Set());
  const lastPickupPointIdRef = useRef<string | null>(null);

  // Derive current distance
  const distanceMeters = useMemo(() => {
    if (
      busLat === undefined ||
      busLat === null ||
      busLng === undefined ||
      busLng === null ||
      !pickupPoint ||
      busStatus === 'COMPLETED' ||
      busStatus === 'NOT_STARTED'
    ) {
      return null;
    }
    return Math.round(calculateHaversineDistance(busLat, busLng, pickupPoint.lat, pickupPoint.lng));
  }, [busLat, busLng, pickupPoint, busStatus]);

  // Adjust approach state during render when distance updates (Official React pattern for prop/derived diffing)
  if (distanceMeters !== prevDistance) {
    if (distanceMeters !== null && prevDistance !== null) {
      setIsApproaching(distanceMeters <= prevDistance);
    } else {
      setIsApproaching(true);
    }
    setPrevDistance(distanceMeters);
  }

  // If student changes pickup stop, reset triggered alerts
  useEffect(() => {
    if (pickupPoint && pickupPoint.pickupPointId !== lastPickupPointIdRef.current) {
      lastPickupPointIdRef.current = pickupPoint.pickupPointId;
      triggeredThresholdsRef.current.clear();
      setActiveAlert(null);
    }
  }, [pickupPoint]);

  // Handle audio and notification side-effects only
  useEffect(() => {
    if (distanceMeters === null || !pickupPoint || !alertsEnabled) {
      return;
    }

    // Check thresholds: 5.0, 3.0, 2.0, 1.0, 0.2 km
    for (const threshold of ALERT_THRESHOLDS) {
      const thresholdMeters = threshold.km * 1000;

      if (
        distanceMeters <= thresholdMeters &&
        !triggeredThresholdsRef.current.has(threshold.km)
      ) {
        triggeredThresholdsRef.current.add(threshold.km);

        const newAlert: ProximityAlertInfo = {
          id: `${pickupPoint.pickupPointId}_${threshold.km}_${Date.now()}`,
          thresholdKm: threshold.km,
          message: threshold.message,
          distanceMeters,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setActiveAlert(newAlert);
        setAlertHistory((prev) => [newAlert, ...prev.slice(0, 9)]);

        // Audio chime trigger
        if (threshold.km <= 0.2) {
          playArrivalChime();
        } else {
          playAlertChime();
        }
        break;
      }
    }
  }, [distanceMeters, pickupPoint, alertsEnabled]);

  const dismissActiveAlert = () => {
    setActiveAlert(null);
  };

  return {
    distanceMeters,
    isApproaching,
    activeAlert,
    alertHistory,
    dismissActiveAlert,
  };
}
