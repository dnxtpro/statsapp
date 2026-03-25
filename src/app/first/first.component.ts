import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { environment } from '../../environments/environment';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { HostListener } from '@angular/core';

import {gsap} from 'gsap'



@Component({
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.css'],
})
export class FirstComponent implements OnInit {

   @HostListener('window:resize')
  onResize() {
    this.getDispositivo();
  }

  isAnimating: boolean = true;
  isRegister: boolean = false;
  isFormulario:boolean = false;
  isHorizontal: boolean = true;

  debugInfo = {
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
    sceneX: 0,
    sceneY: 0,
    sceneZ: 0,
    sceneRotX: 0,
    sceneRotY: 0,
    sceneRotZ: 0,
    scrollY: 0,
    activeSection: 'banner',
    camZoom: 0,
    modelScale: 0,
    manualX: 0,
    manualY: 0,
    manualZ: 0,
    manualCamX: 0,
    manualCamY: 0,
    manualCamZ: 0
  };

  sceneRef: any = null;
  cameraRef: any = null;
  manualOverride: boolean = false;
  ngOnInit(): void {
    this.getDispositivo();
    this.createThreeJsBox();
    let arrPositionModel = [
      {
          id: 'banner',
          position: {x: 0, y: 0, z: 0},
          rotation: {x: 0, y: 1.5, z: 0}
      },
      {
          id: "intro",
          position: { x: 1, y: -1, z: -5 },
          rotation: { x: 0.5, y: -0.5, z: 0 },
      },
      {
          id: "final",
          position: { x: -1, y: -1, z: -5 },
          rotation: { x: 0, y: 0.5, z: 0 },
      },
      {
          id: "login",
          position: { x: 0.8, y: -1, z: 0 },
          rotation: { x: 0.3, y: -0.5, z: 0 },
      },
  ];
  }

  createThreeJsBox(): void {
   
    let velocity = 0;
    let velocity2 = 0;
    const gravity = -9.8;
    const canvas = document.getElementById('canvas-box');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    const scene = new THREE.Scene();
    scene.position.y=-5;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.x = 2;
    scene.background = null;
    const loader = new GLTFLoader();

    const axesHelper = new THREE.AxesHelper(5);


    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1 ,
      1000
    );
    camera.position.z = -40;
    camera.position.y = 5;
    camera.position.x = 20;
    

    

    const linea1 = new MeshLineGeometry();
    const puntos = [
      new THREE.Vector3(-4.5, 0.52, 0),
      new THREE.Vector3(4.5, 0.52, 0),
      new THREE.Vector3(4.5, 0.52, 9),
      new THREE.Vector3(-4.5, 0.52, 9),
      new THREE.Vector3(-4.5, 0.52, -9),
      new THREE.Vector3(4.5, 0.52, -9),
      new THREE.Vector3(4.5, 0.52, 3),
      new THREE.Vector3(-4.5, 0.52, 3),
      new THREE.Vector3(-4.5, 0.52, -3),
      new THREE.Vector3(4.5, 0.52, -3),
    ];
    linea1.setPoints(puntos);
    const lineMaterial = new MeshLineMaterial({
      color: new THREE.Color(0xffffff),
      lineWidth: 1,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    });
    const mesh = new THREE.Mesh(linea1, lineMaterial);
    scene.add(mesh);

    let lightsOn = true;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas as HTMLCanvasElement,
      antialias: true,
      alpha: true,
    });

    

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87ceeb, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    console.log('Renderer background color set to light blue');

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2;
    const light1 = new THREE.SpotLight(0xffffff, 1000, 0, Math.PI / 8, 0, 2);
    light1.position.set(-10, 10, -15);
    light1.target.position.set(5, 10, 20);
    light1.castShadow = true;
    light1.shadow.mapSize.width = 1024;
    light1.shadow.mapSize.height = 1024;
    light1.shadow.camera.near = 0.5;
    light1.shadow.camera.far = 500;
    scene.add(light1);
    const spotLightHelper = new THREE.SpotLightHelper(light1);
    scene.children.forEach((child) => {
      if (child.uuid === 'b5714ba1-a1d7-4f7f-8558-5dbb1cc95a98') {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const light2 = new THREE.SpotLight(0xffefe0, 1000, 0, Math.PI / 2, 0, 2);
    light2.position.set(10, 25, -10);
    light2.target.position.set(10, 0, -10);
    light2.castShadow = true;
    scene.add(light2);
    const light3 = new THREE.SpotLight(0xfffff, 100, 0, Math.PI / 8, 0, 2);
    light3.position.set(-10, 20, 0);
    light3.target.position.set(-5, 0, 0);
    light3.castShadow = true;
    light3.shadow.mapSize.width = 1024;
    light3.shadow.mapSize.height = 1024;
    const light3Helper = new THREE.SpotLightHelper(light3);
    scene.add(light3);
    // scene.add(light3Helper);
    const light4 = new THREE.SpotLight(0xfffff, 100, 0, Math.PI / 8, 0, 2);
    light4.position.set(10, 20, 0);
    light4.target.position.set(5, 0, 0);
    light4.castShadow = true;
    light4.shadow.mapSize.width = 1024;
    light4.shadow.mapSize.height = 1024;
    const light4Helper = new THREE.SpotLightHelper(light4);
    scene.add(light4);
    

    

    const clock = new THREE.Clock();
    let ball;
    loader.load(
      '../../assets/pitch.glb',
      (gltf) => {
        const model = gltf.scene;
        ball = scene.getObjectByName('ball');
        if (ball) {
          ball.position.y = 8;
          ball.position.z = 10;
          console.log('bola cargada');
        }
        gltf.scene.traverse(function (child) {
          if (child) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(model);
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(0, -2.5, 0);
        mesh.scale.set(0.5, 0.5, 0.5);
        mesh.position.set(0, -2.5, 0);
        console.log('Model loaded and added to scene:', model);
      },
      undefined,
      (error) => {
        console.error('An error happened while loading the model:', error);
      }
    );

    // Store reference to scene for slider controls
    this.sceneRef = scene;
    this.cameraRef = camera;
    this.debugInfo.manualX = scene.position.x;
    this.debugInfo.manualY = scene.position.y;
    this.debugInfo.manualZ = scene.position.z;
    this.debugInfo.manualCamX = camera.position.x;
    this.debugInfo.manualCamY = camera.position.y;
    this.debugInfo.manualCamZ = camera.position.z;

    let arrPositionModel = [
      {
          id: 'banner',
        position: {x: -24.5, y: 1.5, z: 3.7},
        rotation: {x: 0, y: 0.35, z: 0},
        ball: {x:1.5,y:1.9,z:0},
        camera: { x: -33.8, y: 5, z: -40 },
          zoom:{x:-40,y:5,z:20},
       
      },
      {
          id: "intro",
        position: { x: 24.95, y: -7.18, z: 6.77 },
        rotation: { x: 0, y: -0.9, z: 0 },
        ball: {x:4.5,y:1.8,z:0},
        camera: { x: 20, y: 5, z: -40 },
          zoom:{x:-40,y:5,z:20},
      },
      {
          id: "description",
        position: { x: -6.6, y: -7.58, z: -1.16 },
        rotation: { x: 0, y: -1.2, z: 0 },
        ball: {x:0,y:1.4,z:-3},
        camera: { x: 20, y: 5, z: -40 },
          zoom:{x:-40,y:5,z:20},
      },
      {
          id: "final",
        position: { x: -40.1, y: -8.52, z: -6.15 },
        rotation: { x: 0, y: -1.05, z: 0 },
        ball: {x:0,y:1.5,z:-9},
        camera: { x: 20, y: 5, z: -40 },
          zoom:{x:-40,y:5,z:20},
      },
      {
          id: "login",
        position: { x: -10, y: -1.1, z: -13.1 },
        rotation: { x: 0, y: -1.15, z: 0 },
        ball: {x:0,y:1.2,z:0},
        camera: { x: 1.9, y: 5, z: -40 },
          zoom:{x:-40,y:5,z:20},
      },
  ];
    /**
     * Moves the scene and ball to new coordinates based on the current section in view.
     * 
     * This function selects all elements with the class 'section' and determines which section
     * is currently in view based on its position relative to the viewport. It then finds the 
     * corresponding coordinates and rotations from `arrPositionModel` and animates the scene 
     * and ball to these new positions using GSAP.
     * 
     * @remarks
     * - The function uses `document.querySelectorAll` to get all sections.
     * - It uses `getBoundingClientRect` to determine the position of each section.
     * - GSAP is used for smooth animations of the scene and ball positions and rotations.
     * 
     * @example
     * ```typescript
     * move();
     * ```
     */
    let activeSectionId = 'banner';

    const move = ()=>{
      const sections = document.querySelectorAll('.section');
      const ball = scene.getObjectByName('ball');
      let currentSection: string | undefined;
      const markerY = window.innerHeight * 0.58;

      sections.forEach((section)=>{
        const rect = section.getBoundingClientRect();
        if(rect.top <= markerY && rect.bottom >= markerY){
          currentSection=section.id;
        }
      });

      if (!currentSection) {
        currentSection = activeSectionId;
      }
      
      // Update debug info
      this.debugInfo.activeSection = currentSection || 'unknown';
      this.debugInfo.scrollY = window.scrollY;

      if (this.manualOverride) {
        return;
      }

      if (currentSection === activeSectionId) {
        return;
      }

      activeSectionId = currentSection;

      let position_active = arrPositionModel.findIndex(
       (val)=> val.id == currentSection
      );
      if (position_active >= 0) {
              let new_coordinates = arrPositionModel[position_active];
              gsap.to(scene.position, {
                  x: new_coordinates.position.x,
                  y: new_coordinates.position.y,
                  z: new_coordinates.position.z,
                  duration: 2.2,
                  ease: "power3.inOut",
                  overwrite: 'auto'
              });
              gsap.to(scene.rotation, {
                  x: new_coordinates.rotation.x,
                  y: new_coordinates.rotation.y,
                  z: new_coordinates.rotation.z,
                  duration: 2.2,
                  ease: "power3.inOut",
                  overwrite: 'auto'
              })
              if (ball) {
                gsap.to(ball.position, {
                  x: new_coordinates.ball.x,
                  y: new_coordinates.ball.y,
                  z: new_coordinates.ball.z,
                  duration: 2.2,
                  ease: "power3.inOut",
                  overwrite: 'auto'
                });
              }
              if (new_coordinates.camera) {
                gsap.to(camera.position, {
                  x: new_coordinates.camera.x,
                  y: new_coordinates.camera.y,
                  z: new_coordinates.camera.z,
                  duration: 2.2,
                  ease: "power3.inOut",
                  overwrite: 'auto'
                });
              }
                
  
    }
    }
    const animate = () => {
      controls.update();
      const delta = clock.getDelta();
      velocity += gravity * delta;
      velocity2 += 0.2 * delta;
      const ball = scene.getObjectByName('ball');
      
      // Update debug info every frame
      this.debugInfo.cameraX = camera.position.x;
      this.debugInfo.cameraY = camera.position.y;
      this.debugInfo.cameraZ = camera.position.z;
      this.debugInfo.sceneX = scene.position.x;
      this.debugInfo.sceneY = scene.position.y;
      this.debugInfo.sceneZ = scene.position.z;
      this.debugInfo.sceneRotX = scene.rotation.x;
      this.debugInfo.sceneRotY = scene.rotation.y;
      this.debugInfo.sceneRotZ = scene.rotation.z;
      this.debugInfo.camZoom = camera.zoom;

      if (!this.manualOverride) {
        this.debugInfo.manualX = scene.position.x;
        this.debugInfo.manualY = scene.position.y;
        this.debugInfo.manualZ = scene.position.z;
      }

      this.debugInfo.manualCamX = camera.position.x;
      this.debugInfo.manualCamY = camera.position.y;
      this.debugInfo.manualCamZ = camera.position.z;
      
      // if(!this.isAnimating){
      //   camera.position.z+= -0.5* delta * delta;
      //   camera.position.x += 0.5*delta * delta;

      //     if(camera.position.z < -10)
      //     {
      //       camera.position.z=-10
      //       if(camera.position.x > 10){
      //         camera.position.x = 10
      //       }
      //     }
        
      // }
      // if (ball && this.isAnimating) {
      //   ball.position.y += velocity * delta;
      //   ball.position.z += velocity2 * delta;
      //   if (ball.position.y < 0.9) {
      //     ball.position.y = 0.9;

      //     velocity *= -0.5;
      //     velocity2 *= 0.5;
      //   }

      //   if (Math.abs(velocity) < 0.1 && ball.position.y === 0.9) {
      //     velocity = 0;
          
      //     this.isAnimating = false;
      //   }
       
      // }
      // Rotate the model around the Y axis and add some oscillation on the X axis
      renderer.render(scene, camera);


      requestAnimationFrame(animate);
    };





    // scene.add(light4Helper);

    animate();
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      renderer.setSize(window.innerWidth, window.innerHeight);
      
    });
    window.addEventListener('scroll', () => {
      if (scene) {
        // console.log({bee})
          move();
      }
      // Update scroll info for debug
      this.debugInfo.scrollY = window.scrollY;
    })

    move();

    console.log('Animation started');
  }
  register(){
    this.isRegister=true;
  }

  onSliderChange(axis: string, event: any) {
    const value = parseFloat(event.target.value);

    if (axis === 'x' || axis === 'y' || axis === 'z') {
      this.manualOverride = true;
      gsap.killTweensOf(this.sceneRef?.position);
    }
    
    if (this.sceneRef) {
      switch(axis) {
        case 'x':
          this.sceneRef.position.x = value;
          this.debugInfo.manualX = value;
          break;
        case 'y':
          this.sceneRef.position.y = value;
          this.debugInfo.manualY = value;
          break;
        case 'z':
          this.sceneRef.position.z = value;
          this.debugInfo.manualZ = value;
          break;
        case 'camX':
          if (this.cameraRef) {
            this.cameraRef.position.x = value;
            this.debugInfo.manualCamX = value;
          }
          break;
        case 'camY':
          if (this.cameraRef) {
            this.cameraRef.position.y = value;
            this.debugInfo.manualCamY = value;
          }
          break;
        case 'camZ':
          if (this.cameraRef) {
            this.cameraRef.position.z = value;
            this.debugInfo.manualCamZ = value;
          }
          break;
      }
    }
  }

  setManualOverride(enabled: boolean) {
    this.manualOverride = enabled;
  }

  sceneMove()
     {}
  scrollToLogin() {
    const loginSection = document.getElementById('login');
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getDispositivo(){ 
    if (window.matchMedia("(orientation: portrait)").matches) {
  console.log("Está en vertical (portrait)");
  this.isHorizontal=false;
} else {
  console.log("Está en horizontal (landscape)");
  this.isHorizontal=true;
}
  }
}
