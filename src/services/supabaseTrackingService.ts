import { supabase, isSupabaseConfigured } from '../supabase/config';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getAuthState } from './authService';

export interface DriverLocationPayload {
  tripId: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName?: string;
  routeId?: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  speedKmh?: number | null;
  heading?: number | null;
  status: 'NOT_STARTED' | 'STARTING' | 'ACTIVE' | 'ARRIVED' | 'COMPLETED';
  timestamp: string; // ISO string
  distanceToCollegeMeters?: number | null;
}

type LocationCallback = (payload: DriverLocationPayload) => void;

// In-memory pub-sub bus for instant fallback & dual-channel broadcast
const localSubscribers = new Set<{ tripId: string | null; callback: LocationCallback }>();
let activeRealtimeChannel: RealtimeChannel | null = null;
const lastKnownLocationMap = new Map<string, DriverLocationPayload>();

/**
 * Initializes or returns the shared Supabase Realtime broadcast channel.
 */
function getOrCreateRealtimeChannel(): RealtimeChannel | null {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  if (activeRealtimeChannel) {
    return activeRealtimeChannel;
  }

  try {
    const channel = supabase.channel('driver_locations_realtime', {
      config: {
        broadcast: { ack: false, self: true },
      },
    });

    channel
      .on(
        'broadcast',
        { event: 'location_update' },
        (response: { payload: DriverLocationPayload }) => {
          const payload = response.payload;
          if (payload && payload.tripId) {
            lastKnownLocationMap.set(payload.tripId, payload);
            // Notify local subscribers matching this trip or listening to all
            localSubscribers.forEach(({ tripId, callback }) => {
              if (tripId === null || tripId === payload.tripId) {
                callback(payload);
              }
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('[Supabase Realtime] Connected to driver_locations_realtime channel');
        }
      });

    activeRealtimeChannel = channel;
    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Channel subscription error:', err);
    return null;
  }
}

/**
 * Publishes genuine GPS driver coordinates to Supabase Realtime and the database.
 * Validates coordinates, sanitizes input, and binds to authenticated driver session.
 */
export async function publishDriverLocation(payload: DriverLocationPayload): Promise<void> {
  // 1. Strict coordinate validation (reject NaN, null, or out-of-range latitude/longitude)
  if (
    typeof payload.latitude !== 'number' ||
    typeof payload.longitude !== 'number' ||
    isNaN(payload.latitude) ||
    isNaN(payload.longitude) ||
    payload.latitude < -90 ||
    payload.latitude > 90 ||
    payload.longitude < -180 ||
    payload.longitude > 180
  ) {
    console.warn('[Tracking Security] Malformed GPS coordinates rejected:', payload.latitude, payload.longitude);
    return;
  }

  // 2. Validate timestamp
  if (!payload.timestamp || isNaN(Date.parse(payload.timestamp))) {
    payload.timestamp = new Date().toISOString();
  }

  // 3. Verify against authenticated session to prevent driver spoofing
  const auth = getAuthState();
  if (auth.isAuthenticated && auth.user) {
    if (auth.role === 'driver') {
      payload.driverId = auth.user.userId;
      if (auth.user.name) payload.driverName = auth.user.name;
    }
  }

  // 4. Cache latest position in-memory
  lastKnownLocationMap.set(payload.tripId, payload);

  // 2. Notify in-memory subscribers immediately for ultra-responsive local UI
  localSubscribers.forEach(({ tripId, callback }) => {
    if (tripId === null || tripId === payload.tripId) {
      callback(payload);
    }
  });

  // 3. Supabase Realtime Broadcast & Database Upsert (if configured)
  if (isSupabaseConfigured() && supabase) {
    try {
      const channel = getOrCreateRealtimeChannel();
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'location_update',
          payload,
        });
      }

      // Store authenticated driver's latest location in Supabase driver_locations table
      // onConflict 'trip_id' keeps table free-tier lightweight and fast
      const { error } = await supabase.from('driver_locations').upsert(
        {
          trip_id: payload.tripId,
          bus_id: payload.busId,
          bus_number: payload.busNumber,
          driver_id: payload.driverId,
          driver_name: payload.driverName || 'Driver',
          route_id: payload.routeId || 'route_07',
          latitude: payload.latitude,
          longitude: payload.longitude,
          accuracy_meters: payload.accuracyMeters ?? 10,
          speed_kmh: payload.speedKmh ?? 0,
          heading: payload.heading ?? 0,
          status: payload.status,
          distance_to_college_meters: payload.distanceToCollegeMeters ?? null,
          updated_at: payload.timestamp,
        },
        { onConflict: 'trip_id' }
      );

      if (error) {
        // Table might not exist yet if user hasn't run the migration script
        console.debug('[Supabase DB] Table upsert notice (broadcast still active):', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Tracking] Publish error (broadcast fallback active):', err);
    }
  }
}

/**
 * Subscribes to live driver location updates for a specific trip (or all trips if tripId is null).
 */
export function subscribeToDriverLocation(
  tripId: string | null,
  callback: LocationCallback
): () => void {
  const sub = { tripId, callback };
  localSubscribers.add(sub);

  // If we already have a cached location for this trip, deliver it immediately
  if (tripId && lastKnownLocationMap.has(tripId)) {
    callback(lastKnownLocationMap.get(tripId)!);
  }

  // Ensure Supabase channel is listening
  if (isSupabaseConfigured() && supabase) {
    getOrCreateRealtimeChannel();

    // Query initial state from Supabase if table exists
    if (tripId) {
      void (async () => {
        try {
          const { data, error } = await supabase
            .from('driver_locations')
            .select('*')
            .eq('trip_id', tripId)
            .order('updated_at', { ascending: false })
            .limit(1);

          if (!error && data && data.length > 0) {
            const row = data[0];
            const restored: DriverLocationPayload = {
              tripId: row.trip_id,
              busId: row.bus_id,
              busNumber: row.bus_number,
              driverId: row.driver_id,
              driverName: row.driver_name,
              routeId: row.route_id,
              latitude: Number(row.latitude),
              longitude: Number(row.longitude),
              accuracyMeters: row.accuracy_meters ? Number(row.accuracy_meters) : null,
              speedKmh: row.speed_kmh ? Number(row.speed_kmh) : null,
              heading: row.heading ? Number(row.heading) : null,
              status: row.status,
              distanceToCollegeMeters: row.distance_to_college_meters
                ? Number(row.distance_to_college_meters)
                : null,
              timestamp: row.updated_at,
            };
            lastKnownLocationMap.set(tripId, restored);
            callback(restored);
          }
        } catch {
          // ignore table query errors if migration not yet run
        }
      })();
    }
  }

  return () => {
    localSubscribers.delete(sub);
  };
}

/**
 * Ends a trip in Supabase Realtime & DB.
 */
export async function endDriverTripInSupabase(
  tripId: string,
  busId: string,
  busNumber: string,
  driverId: string
): Promise<void> {
  const existing = lastKnownLocationMap.get(tripId);
  const endPayload: DriverLocationPayload = {
    tripId,
    busId,
    busNumber,
    driverId,
    latitude: existing?.latitude ?? 17.4085,
    longitude: existing?.longitude ?? 78.452,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
    speedKmh: 0,
    heading: existing?.heading ?? 0,
    accuracyMeters: existing?.accuracyMeters ?? 10,
  };

  await publishDriverLocation(endPayload);
}

/**
 * Returns connection diagnostic info for UI banners.
 */
export function getSupabaseTrackingDiagnostics() {
  const configured = isSupabaseConfigured();
  return {
    isConfigured: configured,
    mode: configured ? ('Supabase Realtime Cloud' as const) : ('Local Free-Tier Reactive' as const),
    subscriberCount: localSubscribers.size,
  };
}
