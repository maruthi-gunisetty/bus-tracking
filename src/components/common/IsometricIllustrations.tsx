import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * 1. Student / Passenger Diagram (for Passenger Portal)
 * Features a student with graduation cap & backpack holding a live tracking smartphone by a transit bus stop
 */
export const StudentDiagram: React.FC<IllustrationProps> = ({ className = '', size = 130 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_12px_24px_rgba(205,232,240,0.5)] ${className}`}
  >
    {/* Soft ground shadow */}
    <ellipse cx="80" cy="120" rx="58" ry="14" fill="#111111" fillOpacity="0.08" />

    {/* Bus Stop Station Sign on Left */}
    <g transform="translate(10, 8)">
      {/* Station pole */}
      <rect x="24" y="38" width="4" height="74" rx="2" fill="#111111" />
      <ellipse cx="26" cy="112" rx="10" ry="3" fill="#D4D4D4" />

      {/* Stop Sign Board (Soft Pastel Sky Blue) */}
      <rect x="10" y="18" width="32" height="26" rx="7" fill="#111111" />
      <rect x="12" y="20" width="28" height="22" rx="5" fill="#CDE8F0" />
      
      {/* Bus Icon on Sign */}
      <rect x="18" y="24" width="16" height="11" rx="2.5" fill="#111111" />
      <rect x="20" y="26" width="5" height="4" rx="1" fill="#FFFFFF" />
      <rect x="27" y="26" width="5" height="4" rx="1" fill="#FFFFFF" />
      <circle cx="21" cy="35" r="1.5" fill="#FFFFFF" />
      <circle cx="29" cy="35" r="1.5" fill="#FFFFFF" />

      {/* Floating Stop Badge Pill */}
      <rect x="8" y="48" width="36" height="11" rx="5.5" fill="#FFFFFF" stroke="#EAEAEA" strokeWidth="1" />
      <text x="14" y="56" fill="#111111" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
        STOP #1
      </text>
    </g>

    {/* Student Figure */}
    <g transform="translate(24, 0)">
      {/* Backpack on Back */}
      <rect x="42" y="58" width="14" height="28" rx="6" fill="#111111" />
      <rect x="44" y="64" width="10" height="14" rx="3" fill="#333333" />
      <line x1="51" y1="58" x2="56" y2="70" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" />

      {/* Legs & Shoes */}
      <line x1="56" y1="96" x2="56" y2="116" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
      <line x1="68" y1="96" x2="68" y2="116" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="54" cy="118" rx="6" ry="3" fill="#222222" />
      <ellipse cx="66" cy="118" rx="6" ry="3" fill="#222222" />

      {/* Student Jacket / Torso (Pastel Sky Blue) */}
      <rect x="48" y="52" width="28" height="46" rx="8" fill="#CDE8F0" stroke="#B6DFEB" strokeWidth="1.5" />
      <line x1="62" y1="52" x2="62" y2="98" stroke="#FFFFFF" strokeWidth="2" />
      {/* Collar */}
      <path d="M54 52 L62 62 L70 52 Z" fill="#FFFFFF" />

      {/* Head & Neck */}
      <circle cx="62" cy="38" r="11" fill="#FCE5D8" />
      <rect x="59" y="47" width="6" height="6" fill="#FCE5D8" />

      {/* Student Graduation Cap on Head */}
      <g transform="translate(47, 18)">
        <polygon points="15,2 30,8 15,14 0,8" fill="#111111" />
        <rect x="8" y="11" width="14" height="6" rx="2" fill="#1A1A1A" />
        <line x1="15" y1="8" x2="26" y2="13" stroke="#DDEFC8" strokeWidth="1.5" />
        <circle cx="27" cy="15" r="1.5" fill="#DDEFC8" />
      </g>

      {/* Arm holding Smartphone */}
      <path d="M68 62 L82 72 L82 82" stroke="#CDE8F0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="82" cy="82" r="3.5" fill="#FCE5D8" />

      {/* Glowing Smartphone displaying live transit bus */}
      <g transform="translate(77, 68)">
        <rect x="0" y="0" width="16" height="26" rx="4" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Screen */}
        <rect x="2" y="2" width="12" height="22" rx="2.5" fill="#FFFFFF" />
        {/* Route Path on screen */}
        <path d="M4 18 Q 8 8 12 12" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
        {/* Bus Icon Dot */}
        <circle cx="12" cy="12" r="2.5" fill="#DDEFC8" stroke="#111111" strokeWidth="1" />
      </g>

      {/* Pulsing WiFi / Telemetry Waves from Smartphone */}
      <path d="M96 74 C 99 77, 99 83, 96 86" stroke="#206579" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
      <path d="M100 71 C 105 76, 105 86, 100 90" stroke="#206579" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
    </g>
  </svg>
);

/**
 * 2. Driver Diagram (for Driver Console)
 * Features a professional transit bus driver with driver cap at the steering wheel with smartphone GPS dashboard mount
 */
export const DriverDiagram: React.FC<IllustrationProps> = ({ className = '', size = 130 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_12px_24px_rgba(251,241,220,0.5)] ${className}`}
  >
    {/* Soft ground shadow */}
    <ellipse cx="80" cy="120" rx="58" ry="14" fill="#111111" fillOpacity="0.08" />

    {/* Bus Cockpit Window Contour in Background */}
    <g transform="translate(10, 8)">
      <path d="M15 110 L15 35 Q 70 15 125 35 L125 110 Z" fill="#FBF1DC" fillOpacity="0.6" stroke="#F0DFC0" strokeWidth="1.5" />
      {/* Windshield wiper arc */}
      <path d="M30 50 Q 70 35 110 50" stroke="#FFFFFF" strokeWidth="3" strokeOpacity="0.7" strokeLinecap="round" />
      {/* Rearview Mirror */}
      <rect x="58" y="24" width="24" height="8" rx="3" fill="#111111" />
    </g>

    {/* Driver Figure */}
    <g transform="translate(42, 14)">
      {/* Shoulders & Uniform Torso (Near-black & Warm Cream Tie) */}
      <path d="M8 95 C 8 72, 48 72, 48 95 Z" fill="#111111" />
      {/* Uniform Shirt V-Neck & Tie */}
      <polygon points="28,72 23,88 33,88" fill="#FFFFFF" />
      <polygon points="28,75 25,92 31,92" fill="#785A1D" />

      {/* Driver Head & Neck */}
      <circle cx="28" cy="50" r="13" fill="#FCE5D8" />
      <rect x="25" y="60" width="6" height="12" fill="#FCE5D8" />

      {/* Driver Peaked Cap */}
      <g transform="translate(12, 28)">
        {/* Cap Crown */}
        <ellipse cx="16" cy="15" rx="15" ry="9" fill="#111111" />
        <rect x="3" y="14" width="26" height="5" rx="2" fill="#1F1F1F" />
        {/* Golden / Cream Transit Badge on Cap */}
        <circle cx="16" cy="14" r="3" fill="#FBF1DC" stroke="#785A1D" strokeWidth="1" />
        {/* Visor */}
        <path d="M1 18 Q 16 23 31 18" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* Driver Glasses / Eyes */}
      <rect x="22" y="47" width="5" height="3" rx="1" fill="#111111" />
      <rect x="29" y="47" width="5" height="3" rx="1" fill="#111111" />
      <line x1="27" y1="48" x2="29" y2="48" stroke="#111111" strokeWidth="1" />
    </g>

    {/* Bus Steering Wheel (Held by Driver) */}
    <g transform="translate(44, 76)">
      {/* Steering Outer Ring */}
      <ellipse cx="36" cy="24" rx="24" ry="16" fill="none" stroke="#111111" strokeWidth="5" />
      {/* Steering Center Hub */}
      <ellipse cx="36" cy="24" rx="8" ry="5" fill="#1F1F1F" />
      <circle cx="36" cy="24" r="2.5" fill="#DDEFC8" />
      {/* Spokes */}
      <line x1="12" y1="24" x2="28" y2="24" stroke="#111111" strokeWidth="4" />
      <line x1="44" y1="24" x2="60" y2="24" stroke="#111111" strokeWidth="4" />
      <line x1="36" y1="29" x2="36" y2="39" stroke="#111111" strokeWidth="4" />

      {/* Driver's Hands on Wheel */}
      <ellipse cx="16" cy="20" rx="5" ry="4" fill="#FCE5D8" />
      <ellipse cx="56" cy="20" rx="5" ry="4" fill="#FCE5D8" />
    </g>

    {/* Mounted Smartphone GPS on Dashboard (Right Side) */}
    <g transform="translate(112, 58)">
      {/* Mount Stand */}
      <rect x="8" y="26" width="4" height="24" rx="2" fill="#111111" />
      <ellipse cx="10" cy="48" rx="8" ry="3" fill="#D4D4D4" />

      {/* Smartphone */}
      <rect x="0" y="0" width="20" height="30" rx="4" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5" />
      <rect x="2" y="2" width="16" height="26" rx="3" fill="#FFFFFF" />

      {/* Live Navigation Arrow on GPS */}
      <path d="M10 6 L14 18 L10 15 L6 18 Z" fill="#356314" />
      {/* Live Speed Badge */}
      <rect x="3" y="20" width="14" height="6" rx="2" fill="#111111" />
      <text x="5" y="25" fill="#FFFFFF" fontSize="5" fontWeight="bold" fontFamily="sans-serif">
        38 km/h
      </text>
    </g>
  </svg>
);

/**
 * 3. Fleet Map Diagram (for Fleet Admin Option)
 * Features an interactive/vector fleet corridor map with routes, multiple bus markers, stops, campus landmark, and geofence
 */
export const FleetMapDiagram: React.FC<IllustrationProps> = ({ className = '', size = 130 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_12px_24px_rgba(221,239,200,0.5)] ${className}`}
  >
    {/* Soft ground shadow */}
    <ellipse cx="80" cy="120" rx="60" ry="14" fill="#111111" fillOpacity="0.08" />

    {/* 3D Folded/Tilted Map Canvas (Pastel Mint & Pure White) */}
    <g transform="translate(15, 10)">
      {/* Map Sheet Base */}
      <path d="M10 38 L65 14 L125 32 L70 58 Z" fill="#DDEFC8" stroke="#CCE6B0" strokeWidth="1.5" />
      <path d="M10 38 L70 58 L70 98 L10 78 Z" fill="#FFFFFF" stroke="#EAEAEA" strokeWidth="1.5" />
      <path d="M70 58 L125 32 L125 72 L70 98 Z" fill="#F4F4F4" stroke="#EAEAEA" strokeWidth="1.5" />

      {/* Water Corridor / River Curve (Soft Pastel Sky Blue) */}
      <path
        d="M25 46 Q 50 36 75 48 T 115 38"
        stroke="#CDE8F0"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* Road Grid Lines on Map */}
      <path d="M25 32 L105 54" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M45 22 L55 54" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M85 24 L95 50" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

      {/* Main Bus Transit Route Polyline (Near-Black #111111) */}
      <path
        d="M20 34 L48 24 L78 40 L108 30"
        stroke="#111111"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Location Stop Pins on Map */}
      {/* Stop 1 */}
      <circle cx="20" cy="34" r="3.5" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5" />
      {/* Stop 2 */}
      <circle cx="48" cy="24" r="3.5" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5" />
      {/* Stop 3 */}
      <circle cx="78" cy="40" r="3.5" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Live Fleet Bus 1 Marker (BUS-04) at Stop 2 */}
      <g transform="translate(38, 8)">
        <rect x="0" y="0" width="22" height="10" rx="5" fill="#111111" />
        <text x="3" y="7.5" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">
          BUS-04
        </text>
        <circle cx="11" cy="13" r="2" fill="#DDEFC8" stroke="#111111" strokeWidth="1" />
      </g>

      {/* Live Fleet Bus 2 Marker (BUS-01) in Transit */}
      <g transform="translate(68, 24)">
        <rect x="0" y="0" width="22" height="10" rx="5" fill="#206579" />
        <text x="3" y="7.5" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">
          BUS-01
        </text>
      </g>

      {/* College Campus Destination Landmark Pin on Right */}
      <g transform="translate(100, 10)">
        {/* Campus Geofence Radius Ring (Dashed with Pulse) */}
        <ellipse cx="8" cy="20" rx="16" ry="9" stroke="#111111" strokeWidth="1.5" strokeDasharray="3 3" fill="#DDEFC8" fillOpacity="0.4" />
        
        {/* Pin Pole & Head */}
        <path d="M8 20 L5 6 L11 6 Z" fill="#111111" />
        <circle cx="8" cy="5" r="7" fill="#FBF1DC" stroke="#111111" strokeWidth="1.5" />
        {/* Graduation / Campus Star */}
        <text x="5" y="8" fill="#111111" fontSize="7" fontWeight="bold">★</text>
      </g>

      {/* Compass Rose on Top Left */}
      <g transform="translate(18, 14)">
        <circle cx="8" cy="8" r="8" fill="#FFFFFF" stroke="#EAEAEA" strokeWidth="1" />
        <polygon points="8,2 10,8 8,7 6,8" fill="#111111" />
        <polygon points="8,14 10,8 8,9 6,8" fill="#CDE8F0" />
      </g>
    </g>
  </svg>
);

// Backward-compatible exports if referenced elsewhere
export const IsometricBus = StudentDiagram;
export const IsometricDriverCockpit = DriverDiagram;
export const IsometricDispatchRadar = FleetMapDiagram;
export const IsometricTruck = DriverDiagram;
export const IsometricScooter = FleetMapDiagram;
export const IsometricPackage = FleetMapDiagram;
