import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import Earth from "./Earth";
import Moon from "./Moon";
import Sun from "./Sun"
import Satellite from "./Satellite";
import WorldTime from "./WorldTime";

import { globalConfig, environmentConfig } from "./config";


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
let time = new THREE.Clock();
let timeScale = 1;
let currentNumSat = globalConfig.initNumSatellites;

let offsetCameraVector = new THREE.Vector3();

const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight
};
const aspect = windowSize.width / windowSize.height;
const scene = new THREE.Scene();
const fog = new THREE.Fog(environmentConfig.fogColor);
const camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 1000000000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl'),
    antialias: true,
    logarithmicDepthBuffer: true,
});
const panController = new OrbitControls(camera, renderer.domElement);
const zoomController = new TrackballControls(camera, renderer.domElement);

const gridHelper = new THREE.GridHelper(40000, 50);
const panelWidth = 310;

const sun = new Sun();
const earth = new Earth(earthMapTexture, earthBumpTexture, earthEmissionTexture, earthReflectTextuure, cloudTexture, cloudTransTexture);
const moon = new Moon(moonMapTexture, moonBumpTexture);
const satellites = new Satellite(scene, currentNumSat);
const worldTime = new WorldTime(0, 0, 0, 1, 1, 1981, timeScale);


// Declare constant variables
const sunAxis = new THREE.Vector3(Math.sin(globalConfig.sunTiltAngle), Math.cos(globalConfig.sunTiltAngle), 0).normalize();
const earthAxis = new THREE.Vector3(Math.sin(globalConfig.earthTiltAngle), Math.cos(globalConfig.earthTiltAngle), 0).normalize();
const moonAxis = new THREE.Vector3(Math.sin(globalConfig.moonTiltAngle), Math.cos(globalConfig.moonTiltAngle), 0).normalize();

// Variable for mouse select
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// bloom pass
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
);
const bloomComposer = new EffectComposer(renderer);



window.addEventListener("click", function (event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject([sun, earth, moon].filter(obj =>
        obj.geometry && obj.geometry.boundingSphere
    ));

    console.log(intersects);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;

        control.target.copy(selectedObject.position);

        // Adjust camera position for better framing
        const distance = selectedObject.geometry.boundingSphere.radius * 2;
        const newCameraPosition = selectedObject.position.clone().add(new THREE.Vector3(0, 0, distance));
        camera.position.lerp(newCameraPosition, 0.5); // Smooth transition
    }
});


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
}


function setupRenderer() {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowSize.width, windowSize.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function setupBloom() {
    //bloom renderer
    bloomPass.threshold = globalConfig.bloomThreshold;
    bloomPass.strength = globalConfig.bloomStrength;
    bloomPass.radius = globalConfig.bloomRadius;
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
}



function createGUI() {

    const gui = new GUI({ width: panelWidth });
    const satelliteMenu = gui.addFolder("Satellite debug");
    const timeSpeedMenu = gui.addFolder("Time Controll");
    const layerFilterMenu = gui.addFolder("Layers");

    const settings = {
        "number of Satellite": 20,
        "modify time speed": 1.0,
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
            
        }
    }

    satelliteMenu.add(settings, "number of Satellite", 0, 7000, 1).onChange(modifyNumSat);

    timeSpeedMenu.add(settings, "modify time speed", -8000000, 8000000, 1000000).onChange(modifyTimeScale);

    layerFilterMenu.add(settings, "toggle Sun");
    layerFilterMenu.add(settings, "toggle Planets");
    layerFilterMenu.add(settings, "toggle Earth");
    layerFilterMenu.add(settings, "toggle Debug/Helper");
    layerFilterMenu.add(settings, "toggle Satellites");

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


function modifyTimeScale(speed) {
    timeScale = speed;
}


export function setup() {

    setupBackground();

    camera.position.set(30, 24, -60);
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


    scene.background = backgroundTexture;
    if (environmentConfig.fogEnable) {
        scene.fogEnable = true;
        scene.fog = fog;
    }
    scene.add(camera);
    scene.add(gridHelper);

    gridHelper.layers.set(3);

    sun.displayOn(scene);
    earth.displayOn(scene);
    moon.displayOn(scene);
    worldTime.displayOn(scene);

    setupRenderer();
    createGUI();

    // setup the bloom pass
    setupBloom()

    // Resize handler
    window.addEventListener('resize', onWindowResize, false);

    time.start();

}


export function loop() {

    let deltaTime = time.getDelta() * timeScale;
    let elapsedTime = time.elapsedTime;
    worldTime.update(deltaTime);
    // console.log(worldTime.getFormattedTime(true));

    offsetCameraVector.subVectors(camera.position, earth.position);

    sun.setRotation(sunAxis, deltaTime);
    earth.setRotation(earthAxis, deltaTime);
    moon.setRotation(moonAxis, deltaTime);

    // Update orbit motion
    moon.orbit(earth,
        globalConfig.moonPerigee * globalConfig.realworldScaleFactor,
        globalConfig.moonApogee * globalConfig.realworldScaleFactor,
        globalConfig.moonEccentricity,
        globalConfig.moonInclination,
        -globalConfig.moonPeriod / timeScale,
        elapsedTime * timeScale
    );
    sun.orbit(earth,
        globalConfig.earthPerigee * globalConfig.realworldScaleFactor,
        globalConfig.earthApogee * globalConfig.realworldScaleFactor,
        globalConfig.earthEccentricity,
        globalConfig.earthInclination,
        -globalConfig.earthPeriod / timeScale,
        elapsedTime * timeScale
    );

    satellites.updateSatellites(elapsedTime * timeScale, earth);

    // Update OrbitControls target based on currentTarget
    panController.object.position.copy(earth.position).add(offsetCameraVector);
    panController.target.copy(earth.position);
    zoomController.target = panController.target;
    panController.update();
    zoomController.update();

    renderer.render(scene, camera);

    bloomComposer.render();

    window.requestAnimationFrame(loop);
}