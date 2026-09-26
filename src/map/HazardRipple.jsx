import { Circle } from 'react-leaflet';

export default function HazardRipple({ center, radius, color = '#dc2626' }) {
  return [0, 1, 2].map((ring) => (
    <Circle
      center={center}
      key={`hazard-ripple-${ring}`}
      pathOptions={{
        className: `hazard-ripple hazard-ripple--${ring}`,
        color,
        fill: false,
        opacity: 0.8,
        weight: 2.5,
      }}
      radius={radius * (0.33 + ring * 0.335)}
    />
  ));
}