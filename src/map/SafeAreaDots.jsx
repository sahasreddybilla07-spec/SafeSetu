import { CircleMarker, Pane, Popup } from 'react-leaflet';

export default function SafeAreaDots({ areas = [], onSelect }) {
  return <Pane name="safe-area-markers" style={{ zIndex: 720 }}>
    {areas.map((area) => {
    const position = area.position ?? [area.latitude, area.longitude];
    if (!position?.[0] || !position?.[1]) return null;

    return (
      <CircleMarker
        center={position}
        eventHandlers={onSelect ? { click: () => onSelect(area.id) } : undefined}
        key={area.id ?? area.name}
        pathOptions={{ className: 'safe-area-dot', color: '#ffffff', fillColor: '#16b978', fillOpacity: 1, weight: 2.5 }}
        radius={7}
      >
        <Popup>
          <strong>Safe area</strong><br />
          {area.name}<br />
          {area.capacity ? `Capacity: ${area.capacity}` : 'Available for evacuation'}
        </Popup>
      </CircleMarker>
    );
    })}
  </Pane>;
}