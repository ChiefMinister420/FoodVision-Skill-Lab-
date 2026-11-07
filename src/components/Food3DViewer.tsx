import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, ZoomIn, ZoomOut, Eye, Layers } from 'lucide-react';
import { GradCamPoint } from '../types/food';

interface Food3DViewerProps {
  dishId: string;
  activeScale: 'original' | 'micro' | 'meso' | 'macro' | 'gradcam';
  opacity: number;
  gradCamPoints: GradCamPoint[];
}

export const Food3DViewer: React.FC<Food3DViewerProps> = ({
  dishId,
  activeScale,
  opacity,
  gradCamPoints,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const foodGroupRef = useRef<THREE.Group | null>(null);
  const heatmapMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameId = useRef<number>(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software GL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 480;
    const height = 360;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xF9F8F5); // Warm studio matte beige

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 3.2, 5.0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't dip below table
    controls.minDistance = 2.5;
    controls.maxDistance = 8.5;
    controls.target.set(0, 0.4, 0);

    // Studio Lighting Rig (Soft Morning Window Light Style)
    // 1. Warm Key Window Light
    const keyLight = new THREE.DirectionalLight(0xFFF6EC, 2.2);
    keyLight.position.set(-4, 7, 3);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    scene.add(keyLight);

    // 2. Soft Cool Ambient/Fill Sky Light
    const hemiLight = new THREE.HemisphereLight(0xFDFBF7, 0xEBE4D8, 1.2);
    scene.add(hemiLight);

    // 3. Gentle Back/Rim Light for crisp texture separation
    const rimLight = new THREE.DirectionalLight(0xF0EAE1, 0.8);
    rimLight.position.set(4, 3, -4);
    scene.add(rimLight);

    // Matte Travertine Turntable Surface
    const tableGeo = new THREE.CylinderGeometry(2.4, 2.5, 0.15, 48);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0xEEE9E0,
      roughness: 0.85,
      metalness: 0.05,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -0.075;
    tableMesh.receiveShadow = !isSoftwareGl;
    scene.add(tableMesh);

    // Soft Contact Shadow Plane directly beneath food
    const shadowGeo = new THREE.PlaneGeometry(3.0, 3.0);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 5, 64, 64, 60);
      grad.addColorStop(0, 'rgba(40, 30, 20, 0.45)');
      grad.addColorStop(0.5, 'rgba(40, 30, 20, 0.18)');
      grad.addColorStop(1, 'rgba(40, 30, 20, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.002;
    scene.add(shadowMesh);

    // Render loop
    const tick = () => {
      if (autoRotate && controlsRef.current) {
        foodGroupRef.current?.rotateY(0.006);
      }
      controls.update();
      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(tick);
    };
    tick();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      tableGeo.dispose();
      tableMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
    };
  }, []);

  // Build / update 3D procedural food model whenever dishId changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing food group
    if (foodGroupRef.current) {
      scene.remove(foodGroupRef.current);
      // dispose geometries/materials
      foodGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material?.dispose();
          }
        }
      });
      foodGroupRef.current = null;
    }

    const group = new THREE.Group();
    foodGroupRef.current = group;
    scene.add(group);

    // Construct 3–8 part composite procedural food object
    if (dishId === 'pizza-margherita') {
      // 1. Pizza Crust Dough Base
      const crustGeo = new THREE.CylinderGeometry(1.4, 1.35, 0.08, 36);
      const crustMat = new THREE.MeshStandardMaterial({
        color: 0xE4B07B, // Golden baked dough
        roughness: 0.75,
      });
      const crust = new THREE.Mesh(crustGeo, crustMat);
      crust.position.y = 0.04;
      crust.castShadow = true;
      crust.receiveShadow = true;
      group.add(crust);

      // 2. Raised Puffy Cornicione Rim (Torus with char spots)
      const rimGeo = new THREE.TorusGeometry(1.35, 0.16, 16, 36);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xD89E62,
        roughness: 0.8,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.1;
      rim.castShadow = true;
      group.add(rim);

      // 3. Tomato Sauce Layer
      const sauceGeo = new THREE.CylinderGeometry(1.28, 1.28, 0.02, 36);
      const sauceMat = new THREE.MeshStandardMaterial({
        color: 0xB91C1C, // San Marzano tomato red
        roughness: 0.45,
      });
      const sauce = new THREE.Mesh(sauceGeo, sauceMat);
      sauce.position.y = 0.085;
      group.add(sauce);

      // 4. Melted Buffalo Mozzarella Islands
      const cheeseMat = new THREE.MeshStandardMaterial({
        color: 0xFFFBEB,
        roughness: 0.3,
      });
      const cheeseOffsets = [
        [-0.45, 0.3], [0.4, 0.35], [-0.2, -0.4], [0.35, -0.3], [0, 0.05], [0.65, 0]
      ];
      cheeseOffsets.forEach(([cx, cz]) => {
        const cheeseGeo = new THREE.SphereGeometry(0.24, 16, 12);
        const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
        cheese.scale.set(1.1, 0.3, 1.0);
        cheese.position.set(cx, 0.11, cz);
        cheese.castShadow = true;
        group.add(cheese);
      });

      // 5. Fresh Green Basil Leaves
      const basilMat = new THREE.MeshStandardMaterial({
        color: 0x15803D,
        roughness: 0.4,
      });
      const basilOffsets = [[-0.2, 0.25], [0.3, 0.1], [-0.1, -0.25], [0.2, -0.4]];
      basilOffsets.forEach(([bx, bz], i) => {
        const leafGeo = new THREE.SphereGeometry(0.14, 12, 8);
        const leaf = new THREE.Mesh(leafGeo, basilMat);
        leaf.scale.set(0.6, 0.12, 1.2);
        leaf.rotation.y = i * 1.2;
        leaf.rotation.z = 0.2;
        leaf.position.set(bx, 0.15, bz);
        group.add(leaf);
      });

    } else if (dishId === 'french-croissant') {
      // Croissant Laminated Curved Crescent
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xD97706, // Golden butter amber
        roughness: 0.55,
      });

      // Central thick roll
      const centerGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.9, 20);
      const centerMesh = new THREE.Mesh(centerGeo, bodyMat);
      centerMesh.rotation.z = Math.PI / 2;
      centerMesh.scale.set(1.0, 1.2, 0.7);
      centerMesh.position.y = 0.45;
      centerMesh.castShadow = true;
      group.add(centerMesh);

      // Tapered crescent arms
      [-1, 1].forEach((dir) => {
        const armGeo = new THREE.ConeGeometry(0.42, 1.1, 16);
        const arm = new THREE.Mesh(armGeo, bodyMat);
        arm.rotation.z = -dir * 1.1;
        arm.rotation.y = dir * 0.4;
        arm.position.set(dir * 0.85, 0.35, dir * 0.35);
        arm.castShadow = true;
        group.add(arm);
      });

      // Flaky ridge laminations (Torus rings wrapped around)
      for (let i = -2; i <= 2; i++) {
        const ridgeGeo = new THREE.TorusGeometry(0.48 - Math.abs(i) * 0.05, 0.04, 12, 24);
        const ridgeMat = new THREE.MeshStandardMaterial({
          color: 0xB45309,
          roughness: 0.4,
        });
        const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
        ridge.position.set(i * 0.22, 0.45, 0);
        ridge.rotation.y = Math.PI / 2;
        group.add(ridge);
      }

    } else if (dishId === 'greek-salad') {
      // Stoneware Salad Bowl
      const bowlGeo = new THREE.CylinderGeometry(1.5, 0.9, 0.65, 36, 1, true);
      const bowlMat = new THREE.MeshStandardMaterial({
        color: 0xE7E2D8, // Off-white stoneware
        roughness: 0.7,
        side: THREE.DoubleSide,
      });
      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      bowl.position.y = 0.35;
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      group.add(bowl);

      // White Greek Feta Slab in center
      const fetaGeo = new THREE.BoxGeometry(0.65, 0.22, 0.65);
      const fetaMat = new THREE.MeshStandardMaterial({
        color: 0xFAFAF9,
        roughness: 0.9,
      });
      const feta = new THREE.Mesh(fetaGeo, fetaMat);
      feta.position.set(0, 0.52, 0);
      feta.rotation.y = 0.35;
      feta.castShadow = true;
      group.add(feta);

      // Cucumber Slices
      const cucMat = new THREE.MeshStandardMaterial({ color: 0x4ADE80, roughness: 0.4 });
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const cucGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 16);
        const cuc = new THREE.Mesh(cucGeo, cucMat);
        cuc.position.set(Math.cos(angle) * 0.85, 0.38 + (i % 2) * 0.06, Math.sin(angle) * 0.85);
        cuc.rotation.x = Math.random() * 0.4;
        cuc.rotation.z = Math.random() * 0.4;
        group.add(cuc);
      }

      // Kalamata Olives
      const oliveMat = new THREE.MeshStandardMaterial({ color: 0x31102F, roughness: 0.25 });
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + 0.5;
        const oGeo = new THREE.SphereGeometry(0.12, 12, 8);
        const olive = new THREE.Mesh(oGeo, oliveMat);
        olive.scale.set(0.9, 1.4, 0.9);
        olive.position.set(Math.cos(angle) * 0.6, 0.45, Math.sin(angle) * 0.6);
        group.add(olive);
      }

    } else {
      // Default / Tempura Donburi Bowl
      // 1. Ceramic Donburi Bowl
      const bowlGeo = new THREE.CylinderGeometry(1.4, 0.75, 0.8, 36, 1, false);
      const bowlMat = new THREE.MeshStandardMaterial({
        color: 0x292524, // Dark slate ceramic
        roughness: 0.4,
      });
      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      bowl.position.y = 0.4;
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      group.add(bowl);

      // 2. Steamed White Rice Mound
      const riceGeo = new THREE.SphereGeometry(1.15, 24, 16);
      const riceMat = new THREE.MeshStandardMaterial({
        color: 0xFAF7F2,
        roughness: 0.85,
      });
      const rice = new THREE.Mesh(riceGeo, riceMat);
      rice.scale.set(1.0, 0.4, 1.0);
      rice.position.y = 0.55;
      group.add(rice);

      // 3. Golden Panko Crispy Battered Tempura Prawns (2x)
      const prawnMat = new THREE.MeshStandardMaterial({
        color: 0xF59E0B, // Golden fried panko
        roughness: 0.85,
      });
      const tailMat = new THREE.MeshStandardMaterial({
        color: 0xEF4444, // Red prawn chitin tail
        roughness: 0.4,
      });

      [[-0.35, 0.25, 0.5], [0.35, -0.2, -0.4]].forEach(([px, pz, rot], idx) => {
        const prawnGroup = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.18, 0.24, 1.4, 16);
        const body = new THREE.Mesh(bodyGeo, prawnMat);
        body.position.y = 0.7;
        body.castShadow = true;
        prawnGroup.add(body);

        const tailGeo = new THREE.ConeGeometry(0.2, 0.4, 8);
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.y = 1.45;
        prawnGroup.add(tail);

        prawnGroup.rotation.z = -0.45;
        prawnGroup.rotation.y = rot;
        prawnGroup.position.set(px, 0.45, pz);
        group.add(prawnGroup);
      });

      // 4. Sliced Lotus Root Wheel
      const lotusGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.06, 24);
      const lotusMat = new THREE.MeshStandardMaterial({
        color: 0xE5D5B8,
        roughness: 0.6,
      });
      const lotus = new THREE.Mesh(lotusGeo, lotusMat);
      lotus.rotation.x = 0.5;
      lotus.position.set(0.4, 0.75, 0.4);
      lotus.castShadow = true;
      group.add(lotus);
    }

    // Create / Rebuild 3D Receptive Field Heatmap Mesh
    const heatGeo = new THREE.SphereGeometry(1.65, 32, 24);
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = 256;
    heatCanvas.height = 256;
    const hCtx = heatCanvas.getContext('2d');
    if (hCtx) {
      if (activeScale === 'micro') {
        // High frequency procedural noise lines
        hCtx.fillStyle = '#000000';
        hCtx.fillRect(0, 0, 256, 256);
        hCtx.fillStyle = '#22D3EE';
        for (let i = 0; i < 350; i++) {
          const x = Math.random() * 256;
          const y = Math.random() * 256;
          const r = Math.random() * 3 + 1;
          hCtx.fillRect(x, y, r, r);
        }
      } else if (activeScale === 'meso') {
        // Component boundary contours (amber)
        const g = hCtx.createRadialGradient(128, 128, 10, 128, 128, 110);
        g.addColorStop(0, '#F59E0B');
        g.addColorStop(0.6, '#FBBF24');
        g.addColorStop(1, '#000000');
        hCtx.fillStyle = g;
        hCtx.fillRect(0, 0, 256, 256);
      } else if (activeScale === 'macro') {
        // Global dish envelope (purple)
        const g = hCtx.createRadialGradient(128, 128, 30, 128, 128, 120);
        g.addColorStop(0, '#A855F7');
        g.addColorStop(0.7, '#6366F1');
        g.addColorStop(1, '#000000');
        hCtx.fillStyle = g;
        hCtx.fillRect(0, 0, 256, 256);
      } else if (activeScale === 'gradcam') {
        // Grad-CAM hot spot projection (red -> amber -> green)
        const g = hCtx.createRadialGradient(120, 110, 0, 120, 110, 95);
        g.addColorStop(0, '#EF4444');
        g.addColorStop(0.35, '#F59E0B');
        g.addColorStop(0.7, '#10B981');
        g.addColorStop(1, '#000000');
        hCtx.fillStyle = g;
        hCtx.fillRect(0, 0, 256, 256);
      }
    }

    const heatTex = new THREE.CanvasTexture(heatCanvas);
    const heatMat = new THREE.MeshBasicMaterial({
      map: heatTex,
      transparent: true,
      opacity: activeScale === 'original' ? 0.0 : opacity * 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const heatmapMesh = new THREE.Mesh(heatGeo, heatMat);
    heatmapMesh.position.y = 0.55;
    heatmapMeshRef.current = heatmapMesh;
    group.add(heatmapMesh);

  }, [dishId, activeScale, opacity]);

  // Update heatmap opacity dynamically without rebuilding geometry
  useEffect(() => {
    if (heatmapMeshRef.current) {
      const mat = heatmapMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = activeScale === 'original' ? 0.0 : opacity * 0.75;
      }
    }
  }, [opacity, activeScale]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0.4, 0);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#E5E0D8] bg-[#F7F5F0] shadow-xs group">
      <div ref={mountRef} className="w-full h-[360px] cursor-grab active:cursor-grabbing block" />

      {/* Floating HUD Badges */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#E5E0D8] text-[11px] font-mono text-stone-700 shadow-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
        <span className="font-semibold text-stone-900 uppercase">3D Food Geometry & Heatmap</span>
        <span aria-hidden="true" className="text-stone-300">·</span>
        <span className="text-stone-500">Orbit / Zoom Enabled</span>
      </div>

      {/* Camera & Auto-Rotate Quick Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-md border border-[#E5E0D8] shadow-xs text-xs">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${
            autoRotate ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
          title="Toggle Turntable Rotation"
        >
          <RotateCw className="w-3 h-3" />
          <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>

        <button
          onClick={handleResetCamera}
          className="px-2 py-0.5 rounded text-[11px] font-mono text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          title="Reset Camera View"
        >
          Reset View
        </button>
      </div>

      {/* Floating 3D Heatmap Scale Indicator Bar */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-[#E5E0D8] shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] text-stone-600">
          <Layers className="w-3.5 h-3.5 text-stone-900" />
          <span>Active 3D Projection:</span>
          <strong className="text-stone-900 font-semibold uppercase">
            {activeScale === 'original' && 'PBR Photorealistic Material'}
            {activeScale === 'micro' && 'Scale 1: Micro 3×3 Surface Texture Mesh'}
            {activeScale === 'meso' && 'Scale 2: Meso 7×7 Ingredient Segmenter'}
            {activeScale === 'macro' && 'Scale 3: Macro 15×15+ Global Envelope'}
            {activeScale === 'gradcam' && '3D Spherical Grad-CAM Heat Field'}
          </strong>
        </div>

        {activeScale !== 'original' && (
          <div className="text-[11px] font-mono text-stone-500 tabular-nums">
            α: {Math.round(opacity * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};
