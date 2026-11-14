// Where things are. The room is on the top floor of a tower on the north slope of Nob Hill; the panorama keeps the real order and rough
// bearings of what you see from there (Golden Gate to the west, Alcatraz north, Bay Bridge east) and pulls the
// distances in, the way a long lens flattens a view. Plain numbers only, so it runs in node for tests/journey.test.mjs.
// x east, y up, z south, in metres; the floor of the room is y = 0.

export const WATER = -84; // the bay, below the floor of the room

/** Compass bearing from the room (degrees, 0 = north, 90 = east) and distance in metres -> world x, z. */
export function polar(bearing: number, distance: number): [number, number] {
  const a = (bearing * Math.PI) / 180;
  return [Math.sin(a) * distance, -Math.cos(a) * distance];
}

/** Landmarks as [bearing, distance]. The bridges are given by the middle of the main span and by both ends. */
export const PLACES = {
  gate: [273, 3300],
  alcatraz: [357, 2600],
  coit: [40, 1000],
  pyramid: [75, 1050],
  salesforce: [91, 1480],
  bayBridge: [[64, 4400], [100, 1900]],
} as const satisfies Record<string, readonly [number, number] | readonly (readonly [number, number])[]>;

// The city's north-east corner: its waterfront from Fort Point round to the Embarcadero, closed far to the south.
const SHORE = [[-5200, 2600], [-3250, 1250], [-2500, 300], [-1900, -450], [-1250, -800], [-500, -820], [150, -1080], [900, -1150], [1450, -750], [1900, 0], [2150, 900], [2400, 2600]];
// x, z, radius, height: Nob Hill (under us), Russian Hill, Telegraph Hill, Pacific Heights, the Presidio
const HILLS = [[0, 150, 600, 46], [-250, -450, 350, 26], [...polar(...PLACES.coit), 260, 80], [-1900, 900, 900, 75], [-2700, 1500, 700, 90]];

/** Distance inland from the waterfront, in metres; negative over water. */
export function inland(x: number, z: number) {
  let d = Infinity, inside = false;
  for (let i = 0, j = SHORE.length - 1; i < SHORE.length; j = i++) {
    const [ax, az] = SHORE[i], [bx, bz] = SHORE[j];
    if (az > z !== bz > z && x < ((bx - ax) * (z - az)) / (bz - az) + ax) inside = !inside;
    if (!i) continue; // the closing edge runs through the city, not along a shore
    const t = Math.min(1, Math.max(0, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2)));
    d = Math.min(d, Math.hypot(x - ax - (bx - ax) * t, z - az - (bz - az) * t));
  }
  return inside ? d : -d;
}

/** Height of the land above the bay, in metres (0 over water). */
export function ground(x: number, z: number) {
  const d = inland(x, z);
  if (d <= 0) return 0;
  let h = Math.min(d * 0.1, 6);
  for (const [hx, hz, r, top] of HILLS) h += top * Math.min(d / 250, 1) * Math.exp(-((x - hx) ** 2 + (z - hz) ** 2) / (r * r));
  return h;
}
