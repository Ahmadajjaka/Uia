import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { getTheme3dConfig, type Theme3dId, type Theme3dPalette } from '../../lib/themes3d';

export type MedicalSceneMode = 'intro' | 'hero' | 'brain' | 'molecule' | 'scanner';

interface MedicalSceneCanvasProps {
  mode: MedicalSceneMode;
  theme3d?: Theme3dId;
  className?: string;
  exploded?: number; // 0 to 1
  reducedMotion?: boolean;
  interactive?: boolean;
  converging?: boolean;
}

const _targetVec = new THREE.Vector3();

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function buildDnaHelixGroup(isSoftwareGl: boolean, p: Theme3dPalette['three']): {
  group: THREE.Group;
  layerParts: THREE.Object3D[];
} {
  const group = new THREE.Group();
  const layerParts: THREE.Object3D[] = [];

  const strandPointsA: THREE.Vector3[] = [];
  const strandPointsB: THREE.Vector3[] = [];
  const turns = 2.4;
  const steps = 64;
  const height = 4.6;
  const radius = 0.85;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    const y = (t - 0.5) * height;
    strandPointsA.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    strandPointsB.push(
      new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius)
    );
  }

  const titaniumMat = new THREE.MeshPhysicalMaterial({
    color: p.metalTint,
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.8
  });

  const cyanGlassMat = new THREE.MeshPhysicalMaterial({
    color: p.secondaryMaterial,
    emissive: p.primaryMaterial,
    emissiveIntensity: 0.38,
    metalness: 0.25,
    roughness: 0.22,
    transmission: isSoftwareGl ? 0 : 0.45,
    transparent: true,
    opacity: 0.92
  });

  const tubeA = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandPointsA), 64, 0.075, 12, false),
    titaniumMat
  );
  const tubeB = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandPointsB), 64, 0.075, 12, false),
    cyanGlassMat
  );
  group.add(tubeA, tubeB);
  layerParts.push(tubeA, tubeB);

  // Instanced base-pair rungs
  const rungCount = 18;
  const rungGeo = new THREE.CylinderGeometry(0.032, 0.032, radius * 1.92, 8);
  const rungMat = new THREE.MeshStandardMaterial({
    color: p.primaryMaterial,
    emissive: p.primaryMaterial,
    emissiveIntensity: 0.32,
    metalness: 0.55,
    roughness: 0.38
  });
  const rungs = new THREE.InstancedMesh(rungGeo, rungMat, rungCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < rungCount; i++) {
    const t = (i + 0.5) / rungCount;
    const angle = t * Math.PI * 2 * turns;
    const y = (t - 0.5) * height;
    dummy.position.set(0, y, 0);
    dummy.rotation.set(0, -angle, Math.PI / 2);
    dummy.updateMatrix();
    rungs.setMatrixAt(i, dummy.matrix);
  }
  rungs.computeBoundingSphere();
  group.add(rungs);
  layerParts.push(rungs);

  // Outer gyroscope containment rings
  const ringMat = new THREE.MeshPhysicalMaterial({
    color: p.metalTint,
    metalness: 0.9,
    roughness: 0.22
  });
  const ringOuter = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.03, 12, 72), ringMat);
  ringOuter.rotation.x = Math.PI / 2.6;
  const ringInner = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.022, 12, 72),
    new THREE.MeshStandardMaterial({
      color: p.secondaryMaterial,
      emissive: p.secondaryMaterial,
      emissiveIntensity: 0.45,
      metalness: 0.4,
      roughness: 0.25
    })
  );
  ringInner.rotation.y = Math.PI / 3;
  group.add(ringOuter, ringInner);
  layerParts.push(ringOuter, ringInner);

  // Neural telemetry core
  const coreGeo = new THREE.IcosahedronGeometry(0.46, 2);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: p.coreAccent,
    emissive: p.primaryMaterial,
    emissiveIntensity: 0.45,
    metalness: 0.3,
    roughness: 0.35,
    wireframe: true
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);
  layerParts.push(coreMesh);

  return { group, layerParts };
}

function buildBrainGroup(isSoftwareGl: boolean, p: Theme3dPalette['three']): {
  group: THREE.Group;
  layerParts: THREE.Object3D[];
} {
  const group = new THREE.Group();
  const layerParts: THREE.Object3D[] = [];

  const hemiGeoL = new THREE.SphereGeometry(0.95, 32, 24);
  const posL = hemiGeoL.attributes.position;
  for (let i = 0; i < posL.count; i++) {
    const x = posL.getX(i);
    const y = posL.getY(i);
    const z = posL.getZ(i);
    const fold = 1 + 0.06 * Math.sin(x * 7 + y * 5) * Math.cos(z * 6);
    posL.setXYZ(i, x * 0.72 * fold, y * 0.9 * fold, z * 1.18 * fold);
  }
  hemiGeoL.computeVertexNormals();

  const brainMat = new THREE.MeshPhysicalMaterial({
    color: p.primaryMaterial,
    emissive: p.fogColor,
    emissiveIntensity: 0.45,
    metalness: 0.22,
    roughness: 0.42,
    clearcoat: 0.6
  });

  const leftLobe = new THREE.Mesh(hemiGeoL, brainMat);
  leftLobe.position.x = -0.44;

  const rightLobe = new THREE.Mesh(hemiGeoL.clone(), brainMat);
  rightLobe.position.x = 0.44;
  rightLobe.scale.x = -1;

  // Translucent protective neuro-shell
  const shellGeo = new THREE.IcosahedronGeometry(1.55, 2);
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: p.secondaryMaterial,
    metalness: 0.1,
    roughness: 0.15,
    transmission: isSoftwareGl ? 0 : 0.72,
    transparent: true,
    opacity: 0.22,
    wireframe: true
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);

  // Brainstem column
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.12, 1.1, 16),
    new THREE.MeshStandardMaterial({ color: p.metalTint, metalness: 0.85, roughness: 0.25 })
  );
  stem.position.set(0, -1.05, -0.15);
  stem.rotation.x = 0.2;

  // Orbiting scanner ring
  const scanRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.025, 12, 72),
    new THREE.MeshStandardMaterial({
      color: p.secondaryMaterial,
      emissive: p.secondaryMaterial,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.2
    })
  );
  scanRing.rotation.x = Math.PI / 2.2;

  group.add(leftLobe, rightLobe, shell, stem, scanRing);
  layerParts.push(leftLobe, rightLobe, shell, stem, scanRing);
  return { group, layerParts };
}

function buildMoleculeGroup(p: Theme3dPalette['three']): {
  group: THREE.Group;
  layerParts: THREE.Object3D[];
} {
  const group = new THREE.Group();
  const layerParts: THREE.Object3D[] = [];

  const atomPositions = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1.1, 0.5, 0.2),
    new THREE.Vector3(-1.1, -0.45, 0.3),
    new THREE.Vector3(0.4, -1.05, -0.55),
    new THREE.Vector3(-0.45, 1.1, -0.45),
    new THREE.Vector3(0.15, 0.2, 1.25),
    new THREE.Vector3(-0.2, -0.25, -1.25)
  ];

  const atomColors = [
    p.secondaryMaterial,
    p.primaryMaterial,
    p.coreAccent,
    p.metalTint,
    p.secondaryMaterial,
    p.primaryMaterial,
    p.metalTint
  ];
  const atomGeo = new THREE.SphereGeometry(0.32, 24, 24);

  atomPositions.forEach((pos, idx) => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: atomColors[idx],
      metalness: idx % 2 === 0 ? 0.35 : 0.85,
      roughness: idx % 2 === 0 ? 0.25 : 0.18,
      emissive: atomColors[idx],
      emissiveIntensity: 0.2
    });
    const sphere = new THREE.Mesh(atomGeo, mat);
    sphere.position.copy(pos);
    sphere.scale.setScalar(idx === 0 ? 1.35 : 0.85);
    group.add(sphere);
    layerParts.push(sphere);

    if (idx > 0) {
      const dir = pos.clone();
      const len = dir.length();
      const bond = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, len, 10),
        new THREE.MeshStandardMaterial({ color: p.metalTint, metalness: 0.85, roughness: 0.22 })
      );
      bond.position.copy(dir.clone().multiplyScalar(0.5));
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      group.add(bond);
      layerParts.push(bond);
    }
  });

  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.025, 12, 64),
    new THREE.MeshStandardMaterial({
      color: p.secondaryMaterial,
      emissive: p.secondaryMaterial,
      emissiveIntensity: 0.35
    })
  );
  orbitRing.rotation.x = Math.PI / 3;
  group.add(orbitRing);
  layerParts.push(orbitRing);

  return { group, layerParts };
}

function buildScannerGroup(p: Theme3dPalette['three']): {
  group: THREE.Group;
  layerParts: THREE.Object3D[];
} {
  const group = new THREE.Group();
  const layerParts: THREE.Object3D[] = [];

  const gantryMat = new THREE.MeshPhysicalMaterial({
    color: p.metalTint,
    metalness: 0.88,
    roughness: 0.2,
    clearcoat: 0.7
  });
  const gantry = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.26, 20, 64), gantryMat);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.04, 12, 64),
    new THREE.MeshStandardMaterial({
      color: p.secondaryMaterial,
      emissive: p.secondaryMaterial,
      emissiveIntensity: 0.65,
      metalness: 0.3,
      roughness: 0.2
    })
  );

  const scanPlane = new THREE.Mesh(
    new THREE.CylinderGeometry(1.12, 1.12, 0.02, 48),
    new THREE.MeshBasicMaterial({
      color: p.secondaryMaterial,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    })
  );
  scanPlane.rotation.x = Math.PI / 2;

  const coreTarget = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 1),
    new THREE.MeshPhysicalMaterial({
      color: p.primaryMaterial,
      emissive: p.primaryMaterial,
      emissiveIntensity: 0.3,
      metalness: 0.45,
      roughness: 0.32,
      wireframe: true
    })
  );

  const cradle = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.14, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.45 })
  );
  cradle.position.y = -0.82;

  group.add(gantry, innerRing, scanPlane, coreTarget, cradle);
  layerParts.push(gantry, innerRing, scanPlane, coreTarget, cradle);
  return { group, layerParts };
}

export function MedicalSceneCanvas({
  mode,
  theme3d = 'midnight-cyan',
  className = '',
  exploded = 0,
  reducedMotion = false,
  interactive = true,
  converging = false
}: MedicalSceneCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const explodedRef = useRef(exploded);
  const reducedMotionRef = useRef(reducedMotion);
  const convergingRef = useRef(converging);
  const [contextLost, setContextLost] = useState(false);

  explodedRef.current = exploded;
  reducedMotionRef.current = reducedMotion;
  convergingRef.current = converging;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const palette = getTheme3dConfig(theme3d).three;
    const isSoftwareGl = detectSoftwareGl();
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(palette.fogColor, palette.fogDensity);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = !isSoftwareGl;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point studio lighting rig synchronized to active 3D theme
    const hemiLight = new THREE.HemisphereLight(palette.hemiSky, palette.hemiGround, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(palette.keyColor, 2.2);
    keyLight.position.set(4.5, 5.5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(palette.rimColor, 1.55);
    rimLight.position.set(-5, -2.5, -4);
    scene.add(rimLight);

    const accentPoint = new THREE.PointLight(palette.accentLight, 1.25, 12);
    accentPoint.position.set(-2.5, 2.5, 2.5);
    scene.add(accentPoint);

    // Build subject assembly
    const built =
      mode === 'brain'
        ? buildBrainGroup(isSoftwareGl, palette)
        : mode === 'molecule'
          ? buildMoleculeGroup(palette)
          : mode === 'scanner'
            ? buildScannerGroup(palette)
            : buildDnaHelixGroup(isSoftwareGl, palette);

    const subject = built.group;
    const baseOffsets = built.layerParts.map((part) => part.position.clone());
    scene.add(subject);

    // Floating medical particles
    const particleCount = mode === 'intro' ? 260 : 120;
    const pPositions = new Float32Array(particleCount * 3);
    const pBase = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 2.4 + Math.random() * 4.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = (Math.random() - 0.5) * 5.2;
      const z = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3] = x;
      pPositions[i * 3 + 1] = y;
      pPositions[i * 3 + 2] = z;
      pBase[i * 3] = x;
      pBase[i * 3 + 1] = y;
      pBase[i * 3 + 2] = z;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: palette.particleColor,
      size: 0.045,
      transparent: true,
      opacity: 0.68
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer interaction
    let pointerX = 0;
    let pointerY = 0;
    let isDragging = false;
    let dragRotY = 0;
    let dragRotX = 0;
    let lastClientX = 0;
    let lastClientY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      pointerY = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
      if (isDragging) {
        dragRotY += (e.clientX - lastClientX) * 0.008;
        dragRotX += (e.clientY - lastClientY) * 0.006;
        lastClientX = e.clientX;
        lastClientY = e.clientY;
      }
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let frameId = 0;
    let resizeRafId = 0;
    let disposed = false;

    const onResize = () => {
      cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        if (disposed || !container) return;
        const w = container.clientWidth || 480;
        const h = container.clientHeight || 420;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        if (reducedMotionRef.current) {
          renderer.render(scene, camera);
        }
      });
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);
    const clock = new THREE.Clock();
    let currentExploded = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      const targetExplode = explodedRef.current;
      currentExploded = THREE.MathUtils.damp(currentExploded, targetExplode, 6, dt);

      built.layerParts.forEach((part, idx) => {
        const base = baseOffsets[idx];
        const radialDir = _targetVec.set(
          Math.cos(idx * 1.4),
          (idx % 2 === 0 ? 1 : -1) * 0.45,
          Math.sin(idx * 1.4)
        );
        part.position.set(
          base.x + radialDir.x * currentExploded * 0.45,
          base.y + radialDir.y * currentExploded * 0.3,
          base.z + radialDir.z * currentExploded * 0.45
        );
      });

      if (!reducedMotionRef.current) {
        const autoSpeed = mode === 'intro' ? 0.34 : 0.22;
        currentRotY = THREE.MathUtils.damp(
          currentRotY,
          elapsed * autoSpeed + dragRotY + pointerX * 0.35,
          5,
          dt
        );
        currentRotX = THREE.MathUtils.damp(
          currentRotX,
          Math.sin(elapsed * 0.45) * 0.12 + dragRotX + pointerY * 0.22,
          5,
          dt
        );
        subject.rotation.y = currentRotY;
        subject.rotation.x = currentRotX;
        particles.rotation.y = -elapsed * 0.06;

        if (convergingRef.current) {
          const posAttr = pGeo.getAttribute('position') as THREE.BufferAttribute;
          for (let i = 0; i < particleCount; i++) {
            const cx = posAttr.getX(i);
            const cy = posAttr.getY(i);
            const cz = posAttr.getZ(i);
            posAttr.setXYZ(
              i,
              THREE.MathUtils.damp(cx, 0, 2.2, dt),
              THREE.MathUtils.damp(cy, 0, 2.2, dt),
              THREE.MathUtils.damp(cz, 0, 2.2, dt)
            );
          }
          posAttr.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);

      if (reducedMotionRef.current) {
        return; // Render single static frame in reduced motion
      }
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(resizeRafId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh || (obj as THREE.Points).isPoints) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
    };
  }, [mode, theme3d, interactive, reducedMotion]);

  if (contextLost) {
    return (
      <div
        className={`flex items-center justify-center bg-[#081122] border border-white/10 rounded-2xl p-6 text-center ${className}`}
      >
        <p className="text-sm text-[#94A3B8]">3D WebGL viewport suspended. Restoring context…</p>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      aria-label="Interactive 3D Medical Visualization"
      className={`relative w-full h-full select-none ${interactive ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
    />
  );
}
