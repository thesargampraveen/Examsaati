// Dummy "Nearby" data keyed to exam centers.
// Each entry matches centers whose name contains the `match` string (case-insensitive).
export const NEARBY_DUMMY = [
  {
    match: 'b.n.n', // B.N.N College, Bhiwandi
    travel: [
      { type: 'bus', name: 'Naka NBSP', kind: 'Bus stop', distance: '2.1 km', icon: 'bus' },
      { type: 'train', name: 'Bhiwandi Road', kind: 'Railway station', distance: '2.8 km', icon: 'train' },
    ],
    food: [
      { name: 'Cafe Nine', distance: '200 m', icon: 'coffee' },
      { name: 'Kanyshka Restaurant', distance: '500 m', icon: 'food-fork-drink' },
      { name: 'Utsav Garden', distance: '500 m', icon: 'flower' },
    ],
  },
  {
    match: 'birla', // B.K Birla College, Kalyan
    travel: [
      { type: 'bus', name: 'Birla College Bus Stop', kind: 'Bus stop', distance: '500 m', icon: 'bus' },
      { type: 'train', name: 'Kalyan Station', kind: 'Railway station', distance: '3 km', icon: 'train' },
    ],
    food: [
      { name: 'Munch and Brunch', distance: '600 m', icon: 'coffee' },
      { name: 'Food Carnival', distance: '1 km', icon: 'food-fork-drink' },
      { name: 'Spice Bites', distance: '1.3 km', icon: 'food' },
    ],
  },
];

export function getNearbyData(centerName) {
  const name = (centerName || '').toLowerCase();
  return NEARBY_DUMMY.find((d) => name.includes(d.match)) || null;
}
