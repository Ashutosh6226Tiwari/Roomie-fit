"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ==============================================================================
 * ZeroGravityHero3D - High-End 3D Zero-Gravity Physics Hero Scene
 * ==============================================================================
 *
 * Features:
 *  - 4-5 Glossy Metallic Spheres (MeshPhysicalMaterial with high metalness/clearcoat)
 *  - Smooth Matte Abstract Shapes (Icosahedron, Dodecahedron, TorusKnot)
 *  - Floating 3D Glass Cards (MeshPhysicalMaterial with transmission/glass effect)
 *  - Zero-Gravity Physics (X:0, Y:0, Z:0) with subtle continuous turbulence/wind
 *  - Soft Viewport Box Colliders (elastic boundary bouncing)
 *  - Mouse Hover Repulsion Event (pushes objects away and increases spin)
 */
export default function ZeroGravityHero3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // --- 1. Scene, Camera & Renderer Setup ---
    const scene = new THREE.Scene();
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // --- 2. Studio Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Warm Key Light (top right)
    const keyLight = new THREE.DirectionalLight(0x818cf8, 2.5);
    keyLight.position.set(10, 15, 10);
    scene.add(keyLight);

    // Cool Pink/Magenta Fill Light (bottom left)
    const fillLight = new THREE.DirectionalLight(0xf43f5e, 1.8);
    fillLight.position.set(-10, -10, 5);
    scene.add(fillLight);

    // Cyan Rim Light (back)
    const rimLight = new THREE.DirectionalLight(0x22d3ee, 2.0);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);

    // --- 3. Physics & Boundary Constants ---
    // Invisible box colliders around camera viewport
    const BOUNDS = {
      minX: -6.5,
      maxX: 6.5,
      minY: -3.8,
      maxY: 3.8,
      minZ: -4.0,
      maxZ: 3.0,
    };

    const physicsObjects = [];

    // Helper to create physics object wrapper
    const addPhysicsObject = (mesh, radius = 0.8) => {
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      );
      scene.add(mesh);

      physicsObjects.push({
        mesh,
        radius,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.02
        ),
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015
        ),
      });
    };

    // --- 4. Create 4-5 Glossy Metallic Spheres ---
    const sphereColors = [0x6366f1, 0xec4899, 0x06b6d4, 0xa855f7, 0xf59e0b];
    sphereColors.forEach((color, idx) => {
      const radius = 0.65 + idx * 0.12;
      const geom = new THREE.SphereGeometry(radius, 64, 64);
      const mat = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.95,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
      });
      const mesh = new THREE.Mesh(geom, mat);
      addPhysicsObject(mesh, radius);
    });

    // --- 5. Smooth Matte Abstract Shapes ---
    const matteMat1 = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
      metalness: 0.1,
    });
    const matteMat2 = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      metalness: 0.05,
    });

    // Icosahedron
    const icoGeom = new THREE.IcosahedronGeometry(0.85, 0);
    addPhysicsObject(new THREE.Mesh(icoGeom, matteMat1), 0.85);

    // Dodecahedron
    const dodecaGeom = new THREE.DodecahedronGeometry(0.75, 0);
    addPhysicsObject(new THREE.Mesh(dodecaGeom, matteMat2), 0.75);

    // TorusKnot
    const torusGeom = new THREE.TorusKnotGeometry(0.5, 0.18, 100, 16);
    addPhysicsObject(new THREE.Mesh(torusGeom, matteMat1), 0.7);

    // --- 6. Floating 3D Glass Cards ---
    const createGlassCard = (w = 2.2, h = 1.3, d = 0.12) => {
      const geom = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.88,
        opacity: 1,
        transparent: true,
        roughness: 0.15,
        ior: 1.5,
        thickness: 0.9,
        specularIntensity: 1.0,
      });
      return new THREE.Mesh(geom, mat);
    };

    for (let i = 0; i < 3; i++) {
      const glassCard = createGlassCard(2.0 + i * 0.3, 1.2 + i * 0.2, 0.1);
      addPhysicsObject(glassCard, 1.2);
    }

    // --- 7. Mouse Hover Repulsion Tracking ---
    const mouse = new THREE.Vector2(-999, -999);
    const mouseWorldPos = new THREE.Vector3(-999, -999, 0);
    const raycaster = new THREE.Raycaster();

    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.set(x, y);

      // Project mouse coordinates onto Z=0 plane in world space
      raycaster.setFromCamera(mouse, camera);
      const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster.ray.intersectPlane(planeZ0, mouseWorldPos);
    };

    const handleMouseLeave = () => {
      mouse.set(-999, -999);
      mouseWorldPos.set(-999, -999, 0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // --- 8. Animation Loop with Zero-Gravity Physics & Collision ---
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      physicsObjects.forEach((item) => {
        const { mesh, velocity, angularVelocity, radius } = item;

        // a) Continuous subtle wind/drift force (random turbulence)
        velocity.x += (Math.random() - 0.5) * 0.0008;
        velocity.y += (Math.random() - 0.5) * 0.0008;
        velocity.z += (Math.random() - 0.5) * 0.0004;

        // Dampen maximum speed so objects float serenely
        velocity.clampLength(0, 0.07);

        // b) Mouse hover repulsion: push away if cursor moves near object
        if (mouseWorldPos.x !== -999) {
          const dist = mesh.position.distanceTo(mouseWorldPos);
          const threshold = radius + 2.2;
          if (dist < threshold) {
            const pushDir = new THREE.Vector3()
              .subVectors(mesh.position, mouseWorldPos)
              .normalize();
            const strength = ((threshold - dist) / threshold) * 0.015;

            velocity.addScaledVector(pushDir, strength);

            // Add spin impulse on hover
            angularVelocity.x += pushDir.y * 0.008;
            angularVelocity.y += pushDir.x * 0.008;
          }
        }

        // c) Update position & rotation
        mesh.position.add(velocity);
        mesh.rotation.x += angularVelocity.x;
        mesh.rotation.y += angularVelocity.y;
        mesh.rotation.z += angularVelocity.z;

        // d) Invisible Box Colliders (soft boundary bouncing)
        if (mesh.position.x - radius < BOUNDS.minX) {
          mesh.position.x = BOUNDS.minX + radius;
          velocity.x *= -0.85;
        } else if (mesh.position.x + radius > BOUNDS.maxX) {
          mesh.position.x = BOUNDS.maxX - radius;
          velocity.x *= -0.85;
        }

        if (mesh.position.y - radius < BOUNDS.minY) {
          mesh.position.y = BOUNDS.minY + radius;
          velocity.y *= -0.85;
        } else if (mesh.position.y + radius > BOUNDS.maxY) {
          mesh.position.y = BOUNDS.maxY - radius;
          velocity.y *= -0.85;
        }

        if (mesh.position.z - radius < BOUNDS.minZ) {
          mesh.position.z = BOUNDS.minZ + radius;
          velocity.z *= -0.85;
        } else if (mesh.position.z + radius > BOUNDS.maxZ) {
          mesh.position.z = BOUNDS.maxZ - radius;
          velocity.z *= -0.85;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // --- 9. Responsive Window Resizing ---
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // --- 10. Clean Up on Unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
