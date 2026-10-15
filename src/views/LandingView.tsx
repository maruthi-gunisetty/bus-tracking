import React, { useState } from 'react';
import {
  Bus,
  Navigation,
  BellRing,
  Smartphone,
  Shield,
  ArrowRight,
  Clock,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
  Compass,
} from 'lucide-react';
import type { UserRole } from '../types';
import { LiveMap } from '../components/map/LiveMap';
import { INITIAL_PICKUP_POINTS, INITIAL_COLLEGE, ROUTE_7_WAYPOINTS } from '../config/routeData';

interface LandingViewProps {
  onOpenLogin: (role: UserRole) => void;
  onEnterDemo: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenLogin, onEnterDemo }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  const faqs = [
    {
      q: 'How does bus tracking work?',
      a: 'When an authorized college bus driver starts their assigned morning or evening route, our web application accesses the smartphone GPS coordinates via the HTML5 Geolocation API and publishes low-latency telemetry updates to our backend. Subscribed students on that route can see the bus moving in real time on an interactive map.',
    },
    {
      q: 'Does the bus need a separate GPS device or OBD hardware?',
      a: 'No. ANSHARY BUS TRACKER eliminates the need for expensive physical GPS trackers, proprietary OBD dongles, or monthly SIM subscriptions. It operates entirely on the driver’s authorized mobile browser with zero added hardware.',
    },
    {
      q: 'How do students receive proximity alerts?',
      a: 'Students can designate their daily pickup point on their assigned route. As the bus travels along the route, the system calculates the real-time Haversine distance between the bus GPS coordinates and the student’s pickup stop. Automated audio chimes and in-app notifications trigger at 5 km, 3 km, 2 km, 1 km, and pickup arrival (200m).',
    },
    {
      q: 'What happens if the driver’s internet connection is lost?',
      a: 'The system transitions to a temporary "Connection Lost / Location Stale" state. Rather than faking bus motion, the map clearly flags the coordinate age and keeps the last known verified position visible. Once the driver’s phone reconnects, live tracking resumes automatically without duplicate trip creation.',
    },
    {
      q: 'Can students track buses not assigned to them?',
      a: 'By default, students view their assigned route and bus to prevent confusion during peak commute hours. However, students can review college-wide route stops and schedules from their dashboard if permitted by administration.',
    },
    {
      q: 'Does tracking continue when the driver’s mobile browser is closed?',
      a: 'Standard web browsers restrict background execution when minimized or closed. For reliable tracking, drivers must keep the web page active and the phone connected to a dashboard charger. We utilize the HTML5 Screen Wake Lock API to prevent the phone display from sleeping during an active trip.',
    },
    {
      q: 'What should I do if the location is not updating?',
      a: 'Check the "Location Freshness" badge on the student map. If the status says "Location Delayed" (>15s) or "Stale" (>45s), the driver may have momentarily entered a network dead zone or paused at a major traffic signal. Live updates will refresh as soon as cell signal returns.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-teal/10 border border-accent-teal/20 text-xs font-bold text-accent-teal tracking-wide uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>College Transportation, Simplified</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-navy tracking-tight leading-[1.15]">
              Your College Bus. <br className="hidden sm:inline" />
              <span className="text-accent-teal">Tracked in Real Time.</span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl font-normal">
              Track your college bus live, know how far it is from your pickup point, and get
              notified before it arrives. A simpler and smarter way to plan your college commute.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenLogin('student')}
                className="btn-primary !py-3.5 !px-6 text-sm sm:text-base font-semibold shadow-cardHover"
              >
                <span>Track Your Bus</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary !py-3.5 !px-6 text-sm sm:text-base font-medium"
              >
                <span>Explore Features</span>
              </button>

              <button
                onClick={onEnterDemo}
                className="btn-navy !py-3.5 !px-5 text-sm font-semibold flex items-center gap-2"
                title="Launch Instant Demo Simulation"
              >
                <Compass className="w-4 h-4 text-accent-teal" />
                <span>Simulation Demo</span>
              </button>
            </div>

            <p className="text-xs text-text-muted flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span>Powered by the driver's smartphone GPS. No dedicated GPS hardware required.</span>
            </p>
          </div>

          {/* Right Column: Polished Product Map Preview */}
          <div className="lg:col-span-5">
            <div className="saas-card p-4 sm:p-5 border border-border bg-white shadow-cardHover space-y-3">
              {/* Product Status Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-status-success animate-pulse" />
                  <span className="text-xs font-bold text-primary-navy uppercase tracking-wider">
                    BUS-04 Active Route 7
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-accent-teal/10 text-accent-teal border border-accent-teal/20">
                  Live GPS 4s ago
                </span>
              </div>

              {/* Map Container */}
              <div className="h-[280px] sm:h-[320px] rounded-card overflow-hidden border border-border relative">
                <LiveMap
                  busPosition={{
                    lat: 17.4085,
                    lng: 78.452,
                    heading: 135,
                    busNumber: 'BUS-04',
                    speedKmh: 38,
                  }}
                  pickupPoints={INITIAL_PICKUP_POINTS}
                  selectedStopId="stop_03"
                  collegeDestination={INITIAL_COLLEGE}
                  routePolyline={ROUTE_7_WAYPOINTS}
                  className="h-full w-full"
                />
              </div>

              {/* Telemetry Summary Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2 rounded-btn bg-bg-main border border-border">
                  <span className="text-[10px] text-text-muted uppercase block font-semibold">Speed</span>
                  <span className="font-bold text-primary-navy text-sm">38 km/h</span>
                </div>
                <div className="p-2 rounded-btn bg-bg-main border border-border">
                  <span className="text-[10px] text-text-muted uppercase block font-semibold">Stop 3 Distance</span>
                  <span className="font-bold text-accent-teal text-sm">1.8 km</span>
                </div>
                <div className="p-2 rounded-btn bg-bg-main border border-border">
                  <span className="text-[10px] text-text-muted uppercase block font-semibold">Est. Arrival</span>
                  <span className="font-bold text-primary-navy text-sm">4 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Product Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent-teal">
            Key Capabilities
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-primary-navy tracking-tight">
            Designed Specifically for College Bus Transit
          </h3>
          <p className="text-sm sm:text-base text-text-secondary">
            Streamlined tools for passengers, bus operators, and transport coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="saas-card p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-btn bg-primary-navy/10 text-primary-navy flex items-center justify-center">
              <Navigation className="w-5 h-5 text-primary-navy" strokeWidth={2} />
            </div>
            <h4 className="text-base font-bold text-primary-navy">1. Live Bus Tracking</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              View the latest verified bus position with continuous updates broadcast directly from
              the driver’s smartphone GPS.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="saas-card p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-btn bg-accent-teal/10 text-accent-teal flex items-center justify-center">
              <BellRing className="w-5 h-5 text-accent-teal" strokeWidth={2} />
            </div>
            <h4 className="text-base font-bold text-primary-navy">2. Smart Distance Alerts</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Receive smart audio notifications and in-app alerts as your assigned bus approaches
              your saved stop at 5km, 3km, 2km, and 1km.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="saas-card p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-btn bg-secondary-navy/10 text-secondary-navy flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-secondary-navy" strokeWidth={2} />
            </div>
            <h4 className="text-base font-bold text-primary-navy">3. Simple Trip Control</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Drivers can start and end their assigned daily route with a single tap, activating
              screen wake locks and high-accuracy telemetry publishing.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="saas-card p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-btn bg-accent-teal/10 text-accent-teal flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-teal" strokeWidth={2} />
            </div>
            <h4 className="text-base font-bold text-primary-navy">4. Student Dashboard</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              View assigned bus number, route stops, straight-line Haversine distance, speed, and
              exact location data freshness.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="saas-card p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-btn bg-primary-navy/10 text-primary-navy flex items-center justify-center">
              <Sliders className="w-5 h-5 text-primary-navy" strokeWidth={2} />
            </div>
            <h4 className="text-base font-bold text-primary-navy">5. Route Management</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Administrators can provision student records, assign drivers, calibrate stop
              coordinates on maps, and adjust arrival geofence radii.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="saas-card p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-btn bg-secondary-navy/10 text-secondary-navy flex items-center justify-center">
              <Shield className="w-5 h-5 text-secondary-navy" strokeWidth={2} />
            </div>
            <h4 className="text-base font-bold text-primary-navy">6. Secure Role Access</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Strictly separated authorization controls for students, drivers, and campus
              administrators preventing unauthorized tracking or privilege escalation.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="saas-card p-8 sm:p-12 border border-border bg-white">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-accent-teal">
              Operational Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-primary-navy tracking-tight">
              How Live Tracking Operates
            </h3>
            <p className="text-sm text-text-secondary">
              Three synchronized steps connecting the driver’s phone with subscribed passengers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-btn bg-primary-navy text-white font-bold flex items-center justify-center text-sm shadow-subtle mx-auto md:mx-0">
                01
              </div>
              <h4 className="text-base font-bold text-primary-navy">Driver Starts Assigned Trip</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                The driver signs in to the Driver Console on their smartphone and taps "Start Trip"
                for their designated college bus.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-btn bg-accent-teal text-white font-bold flex items-center justify-center text-sm shadow-subtle mx-auto md:mx-0">
                02
              </div>
              <h4 className="text-base font-bold text-primary-navy">Phone Transmits Live GPS</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                The driver’s phone shares GPS coordinates, speed, and heading every 5 to 10 seconds
                while the trip remains active.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-btn bg-secondary-navy text-white font-bold flex items-center justify-center text-sm shadow-subtle mx-auto md:mx-0">
                03
              </div>
              <h4 className="text-base font-bold text-primary-navy">Students Receive Alerts</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Students view live bus movement on their map and receive distance countdown chimes as
                the bus nears their specific stop.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex items-start gap-3 text-xs text-text-secondary bg-bg-main p-4 rounded-btn">
            <Info className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
            <span>
              <strong>Operational Note:</strong> Telemetry updates depend on device GPS permissions,
              cellular data connectivity, and browser foreground execution. Drivers should keep the
              dashboard page active during transit.
            </span>
          </div>
        </div>
      </section>

      {/* Trust and Transparency Section */}
      <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="saas-card-subtle p-8 sm:p-10 border border-border">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center space-x-2 text-accent-teal font-bold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Trust, Safety & Privacy Policy</span>
            </div>
            <h3 className="text-2xl font-bold text-primary-navy tracking-tight">
              Transparent, Privacy-First Architecture
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We believe in honest, predictable system design without exaggerated claims:
            </p>

            <ul className="space-y-2.5 text-sm text-text-secondary pt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <span>
                  <strong>Student location is never tracked:</strong> The application only accesses
                  GPS from the authorized driver during an active commute trip.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <span>
                  <strong>Honest telemetry freshness:</strong> If a driver loses cellular connection,
                  the system transparently marks the timestamp as delayed rather than faking motion.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <span>
                  <strong>Straight-line GPS metrics:</strong> Calculated distances represent exact
                  Haversine straight-line coordinates. We avoid claiming exact driving minutes when
                  road traffic data is unavailable.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Accordions Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent-teal">
            Frequently Asked Questions
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-primary-navy tracking-tight">
            Common Inquiries & Technical Guidelines
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="saas-card overflow-hidden border border-border transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-primary-navy text-sm sm:text-base cursor-pointer hover:bg-bg-subtle/50"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-accent-teal shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-sm text-text-secondary leading-relaxed border-t border-border/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Public Footer */}
      <footer className="border-t border-border pt-12 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-btn bg-primary-navy flex items-center justify-center text-white">
                  <Bus className="w-4 h-4 text-accent-teal" strokeWidth={2} />
                </div>
                <span className="font-extrabold text-base text-primary-navy">
                  ANSHARY BUS TRACKER
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Enterprise College Fleet Telemetry & Transit Dispatch Platform
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-text-secondary">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-primary-navy cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-primary-navy cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-primary-navy cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => onOpenLogin('student')}
                className="hover:text-primary-navy cursor-pointer"
              >
                Student Login
              </button>
              <button
                onClick={() => onOpenLogin('driver')}
                className="hover:text-primary-navy cursor-pointer"
              >
                Driver Login
              </button>
              <button
                onClick={() => onOpenLogin('admin')}
                className="hover:text-primary-navy cursor-pointer"
              >
                Admin Login
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
            <p>© 2026 ANSHARY BUS TRACKER. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Support Desk</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
