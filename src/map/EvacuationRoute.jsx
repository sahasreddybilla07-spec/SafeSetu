import floodData from '../data/flood';
import hyderabadCycloneData from '../data/hyderabadCyclone';
import landslideData from '../data/landslide';
import RoadRoute from './RoadRoute';

const scenarios = { flood: floodData, landslide: landslideData, cyclone: hyderabadCycloneData };

export default function EvacuationRoute({ scenario = 'flood' }) {
  const route = scenarios[scenario].route;
  return <RoadRoute end={route[route.length - 1]} start={route[0]} />;
}
