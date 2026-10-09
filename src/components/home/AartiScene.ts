// WebGL "aarti" field for the home hero.
// Three rings of lamplight circle the sanctum arch at the heights an aarti lamp is
// offered (the Lord's feet, chest and face), each with a bright head and a fading
// trail, while embers drift up through the room. Scrolling lifts and dissolves it all.
import * as THREE from "three";

const VERT = /* glsl */ `
  attribute float aRing;
  attribute float aT;
  attribute vec3 aJit;
  attribute float aSize;
  uniform float uTime;
  uniform vec2 uView;
  uniform vec2 uCenter;
  uniform float uR;
  uniform float uScroll;
  uniform float uPR;
  uniform float uIntro;
  uniform vec2 uMouse;
  uniform float uSingle;
  varying float vAlpha;
  varying float vHue;

  const float TAU = 6.2831853;

  void main() {
    vec2 p;
    float size;
    float alpha;
    if (aRing >= 0.0) {
      // aarti rings: feet (0), chest (1), face (2)
      float ringY = uSingle > 0.5 ? uCenter.y : uCenter.y + uR * (0.9 - aRing * 0.82);
      float r = (uSingle > 0.5 ? uR : uR * (1.02 - aRing * 0.17)) * (1.0 + aJit.x * 0.05);
      float theta = aT * TAU;
      float speed = 0.55 + aRing * 0.12;
      float head = mod(uTime * speed + aRing * 2.1, TAU);
      float behind = mod(head - theta, TAU) / TAU;
      float trail = exp(-behind * 5.5);
      float depth = sin(theta);
      float tilt = 0.26 + uMouse.y * 0.04;
      p = vec2(uCenter.x + r * cos(theta) + uMouse.x * 10.0 * depth,
               ringY + r * tilt * depth + aJit.y * 6.0);
      float front = 0.5 + 0.5 * depth;
      size = aSize * (0.55 + 0.45 * front) * (0.5 + trail * 1.7);
      alpha = (0.07 + 0.93 * trail) * (0.25 + 0.75 * front);
      // flicker at the head like a ghee flame
      alpha *= 0.85 + 0.15 * sin(uTime * 13.0 + aJit.z * 40.0);
      vHue = trail;
    } else {
      // embers rising through the hall
      float h = uView.y + 120.0;
      float y = mod(aJit.y * h - uTime * (14.0 + aJit.z * 22.0), h) - 60.0;
      float x = aJit.x * uView.x + sin(uTime * 0.4 + aJit.z * 30.0) * 18.0;
      p = vec2(x, y);
      size = aSize;
      float edge = smoothstep(0.0, 0.35, y / uView.y);
      alpha = (0.10 + 0.22 * fract(aJit.z * 91.7)) * edge * (0.6 + 0.4 * sin(uTime * 2.0 + aJit.x * 50.0));
      vHue = 0.25;
    }
    // scroll: rise and dissolve
    p.y -= uScroll * uView.y * (0.35 + aJit.z * 0.4);
    alpha *= (1.0 - uScroll) * uIntro;

    vAlpha = alpha;
    gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
    gl_PointSize = size * uPR;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform float uGain;
  varying float vAlpha;
  varying float vHue;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);
    vec3 ember = vec3(0.86, 0.38, 0.09);
    vec3 flame = vec3(1.0, 0.72, 0.30);
    vec3 col = mix(ember, flame, vHue);
    col = mix(col, vec3(1.0, 0.92, 0.70), core * vHue);
    gl_FragColor = vec4(col, glow * vAlpha * uGain);
  }
`;

export class AartiScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private material: THREE.ShaderMaterial;
  private raf = 0;
  private start = performance.now();
  private running = false;
  private mouse = new THREE.Vector2();
  private mouseTarget = new THREE.Vector2();

  constructor(private canvas: HTMLCanvasElement, opts: { rings?: number; additive?: boolean } = {}) {
    const rings = opts.rings ?? 3;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const RING = 900;
    const EMBERS = 260;
    const n = RING * rings + EMBERS;
    const ring = new Float32Array(n);
    const t = new Float32Array(n);
    const jit = new Float32Array(n * 3);
    const size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const isRing = i < RING * rings;
      ring[i] = isRing ? Math.floor(i / RING) : -1;
      t[i] = isRing ? (i % RING) / RING + Math.random() * 0.002 : 0;
      jit[i * 3] = isRing ? Math.random() * 2 - 1 : Math.random();
      jit[i * 3 + 1] = isRing ? Math.random() * 2 - 1 : Math.random();
      jit[i * 3 + 2] = Math.random();
      size[i] = isRing ? 7 + Math.random() * 9 : 2 + Math.random() * 5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aRing", new THREE.BufferAttribute(ring, 1));
    g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
    g.setAttribute("aJit", new THREE.BufferAttribute(jit, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uView: { value: new THREE.Vector2(1, 1) },
        uCenter: { value: new THREE.Vector2(0, 0) },
        uR: { value: 200 },
        uScroll: { value: 0 },
        uPR: { value: this.renderer.getPixelRatio() },
        uIntro: { value: 0 },
        uMouse: { value: this.mouse },
        uSingle: { value: rings === 1 ? 1 : 0 },
        uGain: { value: opts.additive ? 0.85 : 1 },
      },
    });
    const points = new THREE.Points(g, this.material);
    points.frustumCulled = false;
    this.scene.add(points);
  }

  setSize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.material.uniforms.uView.value.set(w, h);
  }
  setTarget(cx: number, cy: number, r: number) {
    this.material.uniforms.uCenter.value.set(cx, cy);
    this.material.uniforms.uR.value = r;
  }
  setScroll(v: number) {
    this.material.uniforms.uScroll.value = v;
  }
  setPointer(x: number, y: number) {
    this.mouseTarget.set(x, y);
  }

  play() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      const u = this.material.uniforms;
      const el = (performance.now() - this.start) / 1000;
      u.uTime.value = el;
      u.uIntro.value = Math.min(1, el / 2.2);
      this.mouse.lerp(this.mouseTarget, 0.05);
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }
  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
  dispose() {
    this.pause();
    this.material.dispose();
    this.renderer.dispose();
  }
}
