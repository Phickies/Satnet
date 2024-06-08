import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import Earth from "./Earth";
import Moon from "./Moon";
import Sun from "./Sun"
import Satellite from "./Satellite";
import WorldTime from "./WorldTime";
import LaunchSite from './LaunchBases.js';

import {
    cameraConfig,
    uxConfig,
    environmentConfig,
    globalConfig
} from "./config";


// bloom pass
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";


// Create loading manager
const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);


// Load assets
const earthMapTexture = loader.load("/images/earthmap10k.jpg");
const earthBumpTexture = loader.load("/images/earthbump10k.jpg");
const earthEmissionTexture = loader.load("/images/earthlights10k.jpg");
const earthReflectTextuure = loader.load("/images/earthspec10k.jpg");
const cloudTexture = loader.load("/images/earthcloudmap.jpg");
const cloudTransTexture = loader.load("/images/earthcloudmaptrans.jpg");
const moonMapTexture = loader.load("/images/moonmap1k.jpg");
const moonBumpTexture = loader.load("/images/moonbump1k.jpg");
const backgroundTexture = loader.load("/images/background.jpg");


// Declare variables
let deltaTime = new THREE.Clock();
let currentNumSat = globalConfig.initNumSatellites;
let offsetCameraVector = new THREE.Vector3();

const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight
};
const aspect = windowSize.width / windowSize.height;
const scene = new THREE.Scene();
const fog = new THREE.Fog(environmentConfig.fogColor);
const camera = new THREE.PerspectiveCamera(
    cameraConfig.cameraFOV, aspect,
    cameraConfig.cameraNearLimitView,
    cameraConfig.cameraFarLimitView
);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl'),
    antialias: true,
    logarithmicDepthBuffer: true,
});
const panController = new OrbitControls(camera, renderer.domElement);
const zoomController = new TrackballControls(camera, renderer.domElement);

const gridHelper = new THREE.GridHelper(
    environmentConfig.gridHelperWidth,
    environmentConfig.gridHelperDensity
);
const panelWidth = uxConfig.menuPanelWidth;

const sun = new Sun();
const earth = new Earth(
    earthMapTexture,
    earthBumpTexture,
    earthEmissionTexture,
    earthReflectTextuure,
    cloudTexture,
    cloudTransTexture
);
const moon = new Moon(moonMapTexture, moonBumpTexture);
const satellites = new Satellite(scene);
const worldTime = new WorldTime(0, 0, 0, 1, 1, 1981, 1);
const launchBase = new LaunchSite(earth);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
);
const bloomComposer = new EffectComposer(renderer);


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    panController.update();
    zoomController.update();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
}


function setupBackground() {
    backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
    backgroundTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = backgroundTexture;

    if (environmentConfig.fogEnable) {
        scene.fogEnable = true;
        scene.fog = fog;
    }
}


function setupRenderer() {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowSize.width, windowSize.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}


function setupBloom() {
    bloomPass.threshold = globalConfig.bloomThreshold;
    bloomPass.strength = globalConfig.bloomStrength;
    bloomPass.radius = globalConfig.bloomRadius;
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
}


function setupCameraControll() {
    camera.position.set(
        cameraConfig.camearInitPosition.x,
        cameraConfig.camearInitPosition.y,
        cameraConfig.camearInitPosition.z
    );
    camera.layers.enableAll();
    camera.layers.disable(3);

    panController.target = earth.position;
    panController.enableDamping = true;
    panController.dampingFactor = environmentConfig.panControllerDampingFactor;
    panController.enableZoom = false;

    zoomController.noPan = true;
    zoomController.noRotate = true;
    zoomController.noZoom = false;
    zoomController.zoomSpeed = environmentConfig.zoomControllerDampingFactor;
}


function createGUI() {
    const gui = new GUI({ width: panelWidth });
    const satelliteMenu = gui.addFolder("Satellite debug");
    const timeSpeedMenu = gui.addFolder("Time Controll");
    const layerFilterMenu = gui.addFolder("Layers");

    const settings = {
        "number of Satellite": 20,
        "modify time speed": 0.0,
        "toggle Sun": function () {

            camera.layers.toggle(0);

        },
        "toggle Planets": function () {

            camera.layers.toggle(1);

        },
        "toggle Earth": function () {

            camera.layers.toggle(2);

        },
        "toggle Debug/Helper": function () {

            camera.layers.toggle(3);

        },
        "toggle Satellites": function () {

            camera.layers.toggle(4);

        },
        "toggle Launch Bases": function () {

            camera.layers.toggle(5);
        }
    }

    satelliteMenu.add(settings, "number of Satellite", 0, 7000, 1)
        .onChange(modifyNumSat);

    timeSpeedMenu.add(settings, "modify time speed",
        uxConfig.minTimeScale, uxConfig.maxTimeScale, uxConfig.timeScaleStep)
        .onChange(value => worldTime.setTimeScale(value));

    layerFilterMenu.add(settings, "toggle Sun");
    layerFilterMenu.add(settings, "toggle Planets");
    layerFilterMenu.add(settings, "toggle Earth");
    layerFilterMenu.add(settings, "toggle Debug/Helper");
    layerFilterMenu.add(settings, "toggle Satellites");
    layerFilterMenu.add(settings, "toggle Launch Bases");


    satelliteMenu.open();
    timeSpeedMenu.open();
    layerFilterMenu.open();
}


function modifyNumSat(maxSatellites) {
    if (maxSatellites > currentNumSat) {
        // add more satellite
    } else if (maxSatellites < currentNumSat) {
        // remove satellite
    }
}


export function setup() {

    deltaTime.start();
    setupBackground();
    setupCameraControll();
    setupRenderer();
    setupBloom();
    createGUI();


    scene.add(camera);
    scene.add(gridHelper);

    gridHelper.layers.set(3);

    sun.displayOn(scene);
    earth.displayOn(scene);
    moon.displayOn(scene);


    // Resize handler
    window.addEventListener('resize', onWindowResize, false);
}


export function loop() {

    // Update world Time
    worldTime.update(deltaTime);
    worldTime.display();

    // Update orbit motion
    moon.update(earth, worldTime);
    earth.update(null, worldTime);
    sun.update(earth, worldTime);
    satellites.update(earth, worldTime);

    // Update OrbitControls target based on currentTarget
    offsetCameraVector.subVectors(camera.position, earth.position);
    panController.object.position.copy(earth.position).add(offsetCameraVector);
    panController.target.copy(earth.position);
    zoomController.target = panController.target;
    panController.update();
    zoomController.update();

    renderer.render(scene, camera);

    bloomComposer.render();

    window.requestAnimationFrame(loop);
}