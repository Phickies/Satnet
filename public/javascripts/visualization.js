import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


// Create loading manager
const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);


// Get the loading bar iteam
const loadingElem = document.querySelector(`#loading`);
const progressBarElem = loadingElem.querySelector(`.progressbar`);


// Load assets
const sunTexture = loader.load("/images/8k_sun.jpg");
const earthTexture = loader.load("/images/earthmap10k.jpg");
const earthBumpTexture = loader.load("/images/earthbump10k.jpg");
const earthEmissionTexture = loader.load("/images/earthlights10k.jpg");
const earthReflectTextuure = loader.load("/images/earthspec10k.jpg");
const earthCloudTexture = loader.load("/images/earthcloudmap.jpg");
const earthCloudTransTexture = loader.load("/images/earthcloudmaptrans.jpg");
const moonTexture = loader.load("/images/moonmap1k.jpg");
const moonBumpTexture = loader.load("/images/moonbump1k.jpg");


// Declare variables
let time, canvas, scene, camera, renderer;
let earth, cloud, sun, moon, satellites;
let gridHelper;
let control;


// Declare constant variables
const numSats = 4;

const tiltAngle = 23.0 * Math.PI / 180; // Tilt angle in radians
const earthAxis = new THREE.Vector3(Math.sin(tiltAngle), Math.cos(tiltAngle), 0).normalize();
const celestAxis = new THREE.Vector3(0, 1, 0);

const windowSize = { width: window.innerWidth, height: window.innerHeight };

// Variable for mouse select
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


loading();
setup();
loop();


function loading() {
    loadManager.onLoad = function () {
        loadingElem.style.display = "none";
    }

    loadManager.onProgress = function (urlOfLastItemLoaded, itemsLoaded, itemsTotal) {
        const progress = itemsLoaded / itemsTotal;
        progressBarElem.style.transfrom = `scaleX(${progress})`;
    }
}


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


/***
 * Initial setup
 */
function setup() {

    createEnviroment();
    addHelperTool();
    setupRenderer();
    addController();
    time.start();


    /***
     * Function to create and setup Visual Environemnts
     */
    function createEnviroment() {

        sceneInit();
        cameraInit();
        backgroundInit();
        createSun();
        createEarth();
        createMoon();
        createSatellite();
        lightSystemInit();
        timeSystemInit();


        /***
         * Function to setup scene, canvas
         */
        function sceneInit() {
            canvas = document.querySelector('canvas.webgl');
            scene = new THREE.Scene();

            scene.fog = new THREE.Fog(0x000000);
        }


        /***
         * Function to setup camera
         */
        function cameraInit() {
            camera = new THREE.PerspectiveCamera(
                50, windowSize.width / windowSize.height, 0.1, 40000
            );

            // Set camera init position
            camera.position.z = -20;
            camera.position.x = 10;
            camera.rotation.x = 2 * Math.PI;

            scene.add(camera);
        }


        /***
         * Function to create Space Background
         */
        function backgroundInit() {
            const cubeTextureLoader = new THREE.CubeTextureLoader();
            cubeTextureLoader.setPath("/images/")
            scene.background = cubeTextureLoader.load([
                "stars2.jpg", "stars2.jpg", "stars2.jpg", "stars2.jpg", "stars2.jpg", "stars2.jpg",
            ]);
        }


        /***
         * Function to create Sun Object
         */
        function createSun() {
            const sphere = new THREE.SphereGeometry(8, 20, 20);

            const sunMaterial = new THREE.MeshStandardMaterial({
                map: sunTexture,
                emissive: 0xffffff,
                emissiveIntensity: 1,
            })

            sun = new THREE.Mesh(sphere, sunMaterial);

            sun.castShadow = true;

            sun.userData.name = "Sun";
            sun.position.x = 800;

            scene.add(sun);
        }


        /***
         * Function to create Earth Object
         */
        function createEarth() {
            const sphere1 = new THREE.SphereGeometry(10, 28, 28);
            const sphere2 = new THREE.SphereGeometry(10.07, 28, 28);

            sphere1.applyMatrix4(new THREE.Matrix4().makeRotationZ(-tiltAngle));
            sphere2.applyMatrix4(new THREE.Matrix4().makeRotationZ(-tiltAngle));

            const earthMaterial = new THREE.MeshStandardMaterial({
                emissive: 0x9D872C,
                map: earthTexture,
                bumpMap: earthBumpTexture,
                emissiveMap: earthEmissionTexture,
                roughnessMap: earthReflectTextuure,
            });
            const cloudMaterial = new THREE.MeshLambertMaterial({
                transparent: true,
                map: earthCloudTexture,
                alphaMap: earthCloudTransTexture,
                opacity: 1.0,
                alphaTest: 0.1
            });

            earth = new THREE.Mesh(sphere1, earthMaterial);
            cloud = new THREE.Mesh(sphere2, cloudMaterial);

            earth.castShadow = true;
            cloud.castShadow = true;

            earth.receiveShadow = true;

            earth.userData.name = "Earth";

            scene.add(earth);
            scene.add(cloud);
        }


        /***
         * Function to create Moon Object
         */
        function createMoon() {
            const sphere = new THREE.SphereGeometry(2.5, 20, 20);

            const moonMaterial = new THREE.MeshStandardMaterial({
                map: moonTexture,
                bumpMap: moonBumpTexture,
            });

            moon = new THREE.Mesh(sphere, moonMaterial);

            moon.castShadow = true;
            moon.receiveShadow = true;

            moon.userData.name = "Moon";

            scene.add(moon);
        }


        /***
         * Function to create ONE Instance of Satellite
         */
        function createSatellite() {
            // const geometry = new THREE.BufferGeometry();
            
            // const vertices = new Float32Array([
            //     -1.0, -1.0, 1.0,
            //     1.0, -1.0, 1.0,
            //     1.0, 1.0, 1.0,
            // ]);
            
            // geometry.setAttribute("postion", new THREE.Float32BufferAttribute( vertices, 3 ) );
            // geometry.setAttribute("color");
            
            // const material = new THREE.PointsMaterial({
            //     vertexColors: true, 
            //     alphaTest :.5 ,
            //     sizeAttenuation: true, 
            // });

            // const newSatellite = new THREE.Points(geometry, material);

            // scene.add(newSatellite);
            // satellites.push(newSatellite);
        }


        /***
         * Function to setup light system in the enivroment
         */
        function lightSystemInit() {

            const rectAreaLightGroup = new THREE.Group();
            const rectAreaLightHelperGroup = new THREE.Group();

            const distanceFromSun = 20;

            const light = new THREE.DirectionalLight(0xffffff, 1, 0);
            const helper = new THREE.DirectionalLightHelper(light);
            light.position.set(1, 0, 0);

            rectAreaLightGroup.add(light);
            rectAreaLightHelperGroup.add(helper);

            const pointLight1 = new THREE.PointLight(0xffffff, 10000, 0, 1.75);
            const pointLight2 = new THREE.PointLight(0xffffff, 10000, 0, 1.75);
            const pointLight3 = new THREE.PointLight(0xffffff, 10000, 0, 1.75);
            const pointLight4 = new THREE.PointLight(0xffffff, 10000, 0, 1.75);
            pointLight1.position.set(sun.position.x - distanceFromSun, sun.position.y, sun.position.z - 10);
            pointLight2.position.set(sun.position.x - distanceFromSun, sun.position.y, sun.position.z + 10);
            pointLight3.position.set(sun.position.x - 10, sun.position.y - distanceFromSun, sun.position.z);
            pointLight4.position.set(sun.position.x - 10, sun.position.y + distanceFromSun, sun.position.z);


            // Display light to the scene
            scene.add(pointLight1, pointLight2, pointLight3, pointLight4);
            scene.add(rectAreaLightGroup);
            scene.add(rectAreaLightHelperGroup);
        }


        /***
         * Function to setup timing system
         */
        function timeSystemInit() {
            time = new THREE.Clock();
        }
    }


    /***
     * Function to manage helper tools
     */
    function addHelperTool() {
        gridHelper = new THREE.GridHelper(40000, 50);

        scene.add(gridHelper);
    }


    /***
     * Function to setup render Object
     */
    function setupRenderer() {
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            logarithmicDepthBuffer: true,
        });

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(windowSize.width, windowSize.height);

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }


    /***
     * Function to setup and manage control system
     */
    function addController() {
        control = new OrbitControls(camera, renderer.domElement);
    }
}


/***
 * Main loop rendering
 */
function loop() {

    let deltaTime = time.getDelta();
    let elapsedTime = time.elapsedTime;

    sunRotate();
    earthRotate();
    moonRotate();

    earthUpdateOrbitSun();
    moonUpdateOrbitEarth();
    satelliteUpdateOrbit();

    controlUpdate();
    renderUpdate();

    window.requestAnimationFrame(loop);


    /***
     * Function for rotation of the sun
     */
    function sunRotate() {
        sun.rotateOnAxis(celestAxis, 0.3 * deltaTime);
    }


    /***
     * Function for rotation of the earth
     */
    function earthRotate() {
        const speed = 0.4;
        earth.rotateOnAxis(earthAxis, speed * deltaTime);
        cloud.rotateOnAxis(earthAxis, (speed + 0.1) * deltaTime);
    }


    /***
     * Function for rotation of the moon
     */
    function moonRotate() {
        moon.rotateOnAxis(celestAxis, 1 * deltaTime);
    }

    /***
     * Function for update dependency rotation of the earth
     */
    function earthUpdateOrbitSun() {
    }


    /***
     * Function for update dependency rotation of the moon
     */
    function moonUpdateOrbitEarth() {
        const perigee = 100;
        const apogee = 200;
        const eccentricity = 0.9;
        const inclination = 45;
        const period = 20;

        orbit(moon, earth, perigee, apogee, eccentricity, inclination, period, elapsedTime);

    }


    /***
     * Function for update dependcy rotation of satellites
     */
    function satelliteUpdateOrbit() {
        // orbit(satellites[0], earth, 30, 2);
    }


    /***
     * Function for update control from mouse
     */
    function controlUpdate() {
        control.update();
    }


    /***
     * Function for update rendering object from the scene
     */
    function renderUpdate() {
        renderer.render(scene, camera);
    }

    
    /***
     * Function for calculatingt orbit tragetory base on the object's orbit attributes
     * @param {*} object Statellite, object orbiting, instance must has position property
     * @param {*} origin Star, planet, host parent, instance must has position property
     * @param {float} perigee min distance point from the object to the origin
     * @param {float} apogee max distance point from the object to the origin
     * @param {float} eccentricity measure of the "roundness" of an orbit, 0.0 mean perfect circular orbit
     * @param {float} inclination measures the tilt of an object's orbit around a celestial body (in degree)
     * @param {float} period amount of time a given astronomical object takes to complete one orbit around another object (in day)
     * @param {float} time real time, based on time dimention in space. You can pass in your in-application time, elapesedTime.
     */
    function orbit(object, origin, perigee, apogee, eccentricity, inclination, period, time) {
        // Convert degrees to radians
        inclination = THREE.MathUtils.degToRad(inclination);
    
        // Semi-major axis
        const a = (perigee + apogee) / 2;
    
        // Mean motion
        const n = 2 * Math.PI / period;
    
        // Mean anomaly
        const M = n * time;
    
        // Solve Kepler's equation for eccentric anomaly
        let E = M;
        for (let i = 0; i < 10; i++) {
            E = M + eccentricity * Math.sin(E);
        }
    
        // True anomaly
        const v = 2 * Math.atan(Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(E / 2));
    
        // Distance
        const r = a * (1 - eccentricity * Math.cos(E));
    
        // Position in orbital plane
        const x = r * Math.cos(v);
        const y = r * Math.sin(v);
    
        // Rotate to take into account inclination
        const X = x;
        const Y = y * Math.cos(inclination);
        const Z = y * Math.sin(inclination);
    
        // Add origin
        const position = new THREE.Vector3(X, Y, Z).add(origin.position);
    
        object.position.copy(position);
    }
}