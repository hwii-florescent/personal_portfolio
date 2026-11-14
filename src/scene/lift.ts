// The lift the intro rides: a small steel cabin behind the room's south door, built from primitives like the room, with
// a floor indicator over its doors that follows the ride. It is only in the scene while the intro plays, and it has no
// lights of its own (a new light would recompile every material): see `lend` in room.ts.
import {
  BoxGeometry, CanvasTexture, Color, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, SRGBColorSpace,
  type Material, type Object3D,
} from "three";
import { LIFT } from "@/lib/journey";

export const lift = new Group();
lift.visible = false;

const { x: CX, front: FRONT, depth: DEPTH, width: WIDTH, height: HEIGHT, door: DOOR, doorHeight: DOOR_H } = LIFT;
const BACK = FRONT + DEPTH, LEFT = CX - WIDTH / 2, RIGHT = CX + WIDTH / 2, WALL = 0.1, JAM = (WIDTH - DOOR) / 2;

const canvas = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const el = document.createElement("canvas");
  el.width = w; el.height = h;
  draw(el.getContext("2d")!);
  const t = new CanvasTexture(el);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const brushed = canvas(128, 128, (c) => { // vertical streaks, as in brushed steel
  c.fillStyle = "#a9b0bc"; c.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "20,24,32"},${0.02 + Math.random() * 0.035})`; c.fillRect(Math.random() * 128, 0, 1, 128); }
});
brushed.wrapS = brushed.wrapT = RepeatWrapping;
// Nothing but one borrowed light shines in here, so the metals also glow a little of their own to fake what bounces around a small steel room.
const steel = (color: number, roughness: number, metalness: number, fill = 0.16) =>
  new MeshStandardMaterial({ color, roughness, metalness, map: brushed, emissive: new Color(fill * 0.9, fill * 0.95, fill) });
const wall = steel(0xffffff, 0.5, 0.4, 0.22), trim = steel(0x6a707c, 0.55, 0.5, 0.08), doors = steel(0xffffff, 0.42, 0.5, 0.26), rail = steel(0xffffff, 0.22, 1, 0.12);
const mirror = steel(0x07090c, 0.06, 1, 0), ceiling = steel(0x1d2027, 0.6, 0.3, 0.02), plate = steel(0x101217, 0.5, 0.4, 0);
const light = new MeshBasicMaterial({ color: new Color(4, 3.5, 2.8), toneMapped: false }), lit = new MeshBasicMaterial({ color: new Color(3, 1.6, 0.6), toneMapped: false });
const tiles = canvas(256, 256, (c) => {
  c.fillStyle = "#23262d"; c.fillRect(0, 0, 256, 256);
  c.fillStyle = "#171a1f"; c.fillRect(0, 0, 128, 128); c.fillRect(128, 128, 128, 128);
  c.strokeStyle = "#0a0b0d"; c.lineWidth = 3; c.strokeRect(0, 0, 256, 256); c.strokeRect(0, 0, 128, 128); c.strokeRect(128, 128, 128, 128);
});
tiles.wrapS = tiles.wrapT = RepeatWrapping;
tiles.repeat.set(WIDTH / 0.5, DEPTH / 0.5);
const tilesMat = new MeshStandardMaterial({ map: tiles, roughness: 0.28, metalness: 0.2 });

const put = <T extends Object3D>(o: T, x: number, y: number, z: number) => { o.position.set(x, y, z); lift.add(o); return o; };
const box = (w: number, h: number, d: number, m: Material, x: number, y: number, z: number) => put(new Mesh(new BoxGeometry(w, h, d), m), x, y, z);
const bar = (length: number, m: Material, x: number, y: number, z: number, along: "x" | "z") => {
  const o = put(new Mesh(new CylinderGeometry(0.02, 0.02, length, 14), m), x, y, z);
  if (along === "x") o.rotation.z = Math.PI / 2; else o.rotation.x = Math.PI / 2;
  return o;
};

// The shell: floor, ceiling, three walls (side and back walls panelled, the back one with a dark mirror), and the front wall with the doorway.
put(new Mesh(new PlaneGeometry(WIDTH, DEPTH).rotateX(-Math.PI / 2), tilesMat), CX, 0.002, FRONT + DEPTH / 2); // a plane, so the floor's mirror pass sees through it
box(WIDTH + 2 * WALL, 0.05, DEPTH + WALL, ceiling, CX, HEIGHT + 0.025, FRONT + (DEPTH + WALL) / 2);
put(new Mesh(new PlaneGeometry(0.8, 0.8).rotateX(Math.PI / 2), light), CX, HEIGHT - 0.002, FRONT + 0.5);
box(WALL, HEIGHT, DEPTH + WALL, wall, LEFT - WALL / 2, HEIGHT / 2, FRONT + (DEPTH + WALL) / 2);
box(WALL, HEIGHT, DEPTH + WALL, wall, RIGHT + WALL / 2, HEIGHT / 2, FRONT + (DEPTH + WALL) / 2);
box(WIDTH, HEIGHT, WALL, wall, CX, HEIGHT / 2, BACK + WALL / 2);
box(WIDTH - 0.3, 1.1, 0.012, mirror, CX, 1.7, BACK - 0.006);
box(WIDTH, 0.12, 0.012, trim, CX, 0.06, BACK - 0.006);
for (const side of [-1, 1]) {
  box(0.012, 0.12, DEPTH, trim, CX + side * (WIDTH / 2 - 0.006), 0.06, FRONT + DEPTH / 2);
  for (const z of [FRONT + DEPTH * 0.34, FRONT + DEPTH * 0.67]) box(0.01, HEIGHT - 0.12, 0.012, trim, CX + side * (WIDTH / 2 - 0.005), HEIGHT / 2 + 0.06, z); // panel seams
}
for (const x of [CX - WIDTH / 6, CX + WIDTH / 6]) box(0.012, 1.3, 0.01, trim, x, 0.77, BACK - 0.005);
box(JAM, HEIGHT, 0.1, trim, LEFT + JAM / 2, HEIGHT / 2, FRONT - 0.05);
box(JAM, HEIGHT, 0.1, trim, RIGHT - JAM / 2, HEIGHT / 2, FRONT - 0.05);
box(DOOR, HEIGHT - DOOR_H, 0.1, trim, CX, DOOR_H + (HEIGHT - DOOR_H) / 2, FRONT - 0.05);
box(0.012, DOOR_H, 0.012, trim, CX - DOOR / 2, DOOR_H / 2, FRONT + 0.001);
box(0.012, DOOR_H, 0.012, trim, CX + DOOR / 2, DOOR_H / 2, FRONT + 0.001);

// Rails at hip height on the back and side walls; the call panel by the doors.
bar(WIDTH - 0.3, rail, CX, 0.95, BACK - 0.06, "x");
for (const side of [-1, 1]) {
  bar(DEPTH - 0.5, rail, CX + side * (WIDTH / 2 - 0.06), 0.95, FRONT + DEPTH / 2, "z");
  for (const z of [FRONT + 0.3, BACK - 0.3]) box(0.04, 0.02, 0.02, rail, CX + side * (WIDTH / 2 - 0.04), 0.95, z);
}
box(0.012, 0.62, 0.15, plate, RIGHT - 0.006, 1.2, FRONT + 0.22);
for (let i = 0; i < 11; i++) {
  const b = put(new Mesh(new CylinderGeometry(0.016, 0.016, 0.012, 16), i === 10 ? lit : rail), RIGHT - 0.012, 1.46 - Math.floor(i / 2) * 0.095, FRONT + 0.185 + (i % 2) * 0.07);
  b.rotation.z = Math.PI / 2;
}

// The doors: two leaves that slide into the jambs.
const leaves = [-1, 1].map((side) => {
  return box(DOOR / 2, DOOR_H, 0.04, doors, CX + side * DOOR / 4, DOOR_H / 2, FRONT + 0.015);
});

// The floor indicator in the lintel over the doors.
const display = canvas(256, 112, () => {});
const face = display.image as HTMLCanvasElement, ink = face.getContext("2d")!;
put(new Mesh(new PlaneGeometry(0.46, 0.2), new MeshBasicMaterial({ map: display, toneMapped: false })), CX, DOOR_H + (HEIGHT - DOOR_H) / 2, FRONT + 0.002);
let shown = 0;
function indicate(floor: number) {
  ink.fillStyle = "#050607"; ink.fillRect(0, 0, 256, 112);
  ink.fillStyle = "#ffb066"; ink.beginPath(); ink.moveTo(40, 30); ink.lineTo(66, 76); ink.lineTo(14, 76); ink.closePath(); ink.fill();
  ink.font = "700 92px ui-monospace, SFMono-Regular, Menlo, monospace"; ink.textAlign = "center"; ink.textBaseline = "middle";
  ink.fillText(String(floor), 160, 58);
  display.needsUpdate = true;
}

/** Show the lift at ride position `floor` with its doors `open` (0..1). */
export function updateLift(floor: number, open: number) {
  leaves[0].position.x = CX - DOOR / 4 - 0.46 * open;
  leaves[1].position.x = CX + DOOR / 4 + 0.46 * open;
  if (floor !== shown) { shown = floor; indicate(floor); }
}
