import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements OnInit {
  ngOnInit(): void {
    this.createThreeJsBox();
  }

  createThreeJsBox(): void {
    const canvas = document.getElementById('canvas-box');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    console.log('Canvas element found:', canvas);

    const scene = new THREE.Scene();
    console.log('Scene created:', scene);

    const material = new THREE.MeshToonMaterial();
    console.log('Material created:', material);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    console.log('Ambient light added:', ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.x = 2;

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    console.log('Axes helper added:', axesHelper);
    pointLight.position.y = 2;
    pointLight.position.z = 2;
    scene.add(pointLight);
    console.log('Point light added:', pointLight);

    const loader = new GLTFLoader();
    loader.load('../../assets/cromoblend.glb', (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      console.log('Model loaded and added to scene:', model);
    }, undefined, (error) => {
      console.error('An error happened while loading the model:', error);
    });

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 2;

    
    camera.position.x = 2;
    console.log('Camera created:', camera);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas as HTMLCanvasElement });
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('Renderer created and size set:', renderer);
    // Set a more cinematic background color
    renderer.setClearColor(0x87CEEB); // Light blue color for the sky
    console.log('Renderer background color set to light blue');

    function animate() {
      requestAnimationFrame(animate);

      // Rotate the model around the Y axis and add some oscillation on the X axis
      if (scene.children.length > 0) {
      scene.children.forEach(child => {
        if (child instanceof THREE.Group) {
        child.rotation.y += 0.01;
        child.position.x = Math.sin(Date.now() * 0.001) * 2; // Oscillate on the X axis
        }
      });
      }

      renderer.render(scene, camera);
    }
   
    animate();
    console.log('Animation started');
  }
}
