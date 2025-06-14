import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Globe3D = ({ fireData, disasterData, selectedFire, selectedDisaster, onFireSelect, onDisasterSelect }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const markersRef = useRef([]);
  const controlsRef = useRef(null);

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat, lng, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create Earth sphere
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    
    // Load Earth texture
    const earthTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      () => {
        // Texture loaded successfully
      },
      undefined,
      (error) => {
        console.error('Error loading Earth texture:', error);
      }
    );

    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 5
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Create marker
    const createMarker = (position, isSelected, type = 'fire') => {
      // Create a group to hold the marker and its glow
      const group = new THREE.Group();
      
      // Create the main marker sphere
      const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: type === 'fire' ? 0xff4400 : 0xffaa00,
        emissive: type === 'fire' ? 0xff4400 : 0xffaa00,
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.8
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      group.add(marker);

      // Create a larger glow sphere
      const glowGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: type === 'fire' ? 0xff4400 : 0xffaa00,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glow);

      // Position the group
      group.position.copy(position);
      
      // Scale based on selection
      const scale = isSelected ? 1.5 : 1;
      group.scale.setScalar(scale);

      return group;
    };

    // Add markers based on data type
    const data = fireData || disasterData;
    const selectedItem = selectedFire || selectedDisaster;
    const onSelect = onFireSelect || onDisasterSelect;
    const type = fireData ? 'fire' : 'disaster';

    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        const position = latLngToVector3(
          item.latitude || item.coordinates?.lat,
          item.longitude || item.coordinates?.lng,
          2.05
        );
        const marker = createMarker(position, selectedItem?.id === item.id, type);
        scene.add(marker);
        markersRef.current.push(marker);
      });
    }

    // Add raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersRef.current, true);

      if (intersects.length > 0) {
        // Find the parent group of the intersected object
        const markerGroup = intersects[0].object.parent;
        const markerIndex = markersRef.current.indexOf(markerGroup);
        if (markerIndex !== -1 && data) {
          onSelect(data[markerIndex]);
        }
      }
    };

    containerRef.current.addEventListener('click', onMouseClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update controls
      controls.update();

      // Animate markers
      markersRef.current.forEach((marker, index) => {
        // Rotate the marker
        marker.rotation.y += 0.01;
        
        // Pulse the glow
        const time = Date.now() * 0.001;
        const scale = 1 + Math.sin(time * 2 + index) * 0.1;
        marker.scale.setScalar(scale * (selectedItem?.id === data?.[index]?.id ? 1.5 : 1));
        
        // Update glow opacity
        const glow = marker.children[1];
        glow.material.opacity = 0.3 + Math.sin(time * 3 + index) * 0.1;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('click', onMouseClick);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
      markersRef.current = [];
    };
  }, [fireData, disasterData, selectedFire, selectedDisaster, onFireSelect, onDisasterSelect]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-96"
      style={{ position: 'relative' }}
    />
  );
};

export default Globe3D; 