"use client";

import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending, Box3, Color, DoubleSide, EdgesGeometry, LineBasicMaterial, LineSegments,
  MathUtils, Mesh, ShaderMaterial, Vector3,
} from "three";
import type { Palette } from "@/data/themes";
import { timer } from "@/lib/timer";

// Recipe (from the hologram-shader write-ups): fresnel rim + moving scanlines + sweep band,
// additive blending, double-sided, no depth write so you can see through the object.
const vertex = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying float vY;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = -mv.xyz;
    vY = (modelMatrix * vec4(position, 1.0)).y;
    gl_Position = projectionMatrix * mv;
  }`;
const fragment = /* glsl */ `
  uniform float uTime; uniform vec3 uColor; uniform float uOpacity;
  varying vec3 vN; varying vec3 vV; varying float vY;
  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
    float scan = 0.6 + 0.4 * sin(vY * 70.0 - uTime * 3.0);
    float band = smoothstep(0.0, 1.0, 1.0 - abs(fract(vY * 0.45 - uTime * 0.2) - 0.5) * 9.0);
    float a = ((0.05 + fres * 0.65) * scan + band * 0.18) * uOpacity;
    gl_FragColor = vec4(uColor * (0.45 + fres * 0.8), a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;


export default function Hologram({
  url, p, opacity = 1, boost = 0, motion = 1, size = 1,
}: { url: string; p: Palette; opacity?: number; boost?: number; motion?: number; size?: number }) {
  const { scene } = useGLTF(url);
  const op = useRef(opacity);

  const mat = useMemo(
    () => new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new Color() }, uOpacity: { value: 1 } },
      vertexShader: vertex, fragmentShader: fragment,
      transparent: true, depthWrite: false, side: DoubleSide, blending: AdditiveBlending,
    }),
    [],
  );
  const edgeMat = useMemo(
    () => new LineBasicMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending }),
    [],
  );

  // Clone once, swap every material for the hologram material, add a wireframe edge layer, normalise size.
  const model = useMemo(() => {
    const root = scene.clone(true);
    root.updateMatrixWorld(true);
    const edges: LineSegments[] = [];
    root.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      o.material = mat;
      const e = new LineSegments(new EdgesGeometry(o.geometry, 25), edgeMat);
      e.raycast = () => {}; // keep clicks on the solid mesh only
      edges.push(e);
      o.add(e);
    });
    const box = new Box3().setFromObject(root);
    const dim = box.getSize(new Vector3());
    const k = size / Math.max(dim.x, dim.y, dim.z);
    root.scale.multiplyScalar(k);
    const b2 = new Box3().setFromObject(root);
    const c = b2.getCenter(new Vector3());
    root.position.set(-c.x, -b2.min.y, -c.z);
    return root;
  }, [scene, mat, edgeMat, size]);

  // Refs hand the materials to the frame loop (the React compiler forbids mutating memoized values in it).
  const matRef = useRef<ShaderMaterial>(null);
  const edgeRef = useRef<LineBasicMaterial>(null);
  useEffect(() => {
    matRef.current = mat;
    edgeRef.current = edgeMat;
    return () => { mat.dispose(); edgeMat.dispose(); };
  }, [mat, edgeMat]);

  useFrame((_, dt) => {
    const m = matRef.current;
    const e = edgeRef.current;
    if (!m || !e) return;
    op.current = MathUtils.damp(op.current, opacity + boost, 6, dt);
    m.uniforms.uTime.value = motion ? timer.getElapsed() : 0;
    m.uniforms.uOpacity.value = op.current;
    m.uniforms.uColor.value.set(p.accent);
    e.color.set(p.accent);
    e.opacity = Math.min(1, 0.9 * op.current);
  });

  return <primitive object={model} />;
}
