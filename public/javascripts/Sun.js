import CelestialObject from './CelestialObject.js';
import * as THREE from 'three';
import { globalConfig } from './config.js';


export default class Sun {
    constructor() {

        const geometry = new THREE.SphereGeometry(globalConfig.sunSize, 20, 20);
        const material = new THREE.MeshPhongMaterial({
            emissive: globalConfig.sunEmissiveColor,
            emissiveIntensity: globalConfig.sunIntensive,
            specular: globalConfig.sunSpecColor,
            color: 0x000000,
            fog: false
        });

        const layer = 0;
        this.core = new CelestialObject(geometry, material, "Sun", layer, globalConfig.sunRotationSpeed, false, false);

        this.pointLight1 = new THREE.PointLight(globalConfig.sunLightColor, 2, 0, 0);
        this.pointLight1.position.set(this.core.position.x, this.core.position.y, this.core.position.z);

        this.position = this.core.position;
    }

    setPosition(x, y, z) {
        this.core.setPosition(x, y, z);
        this.pointLight1.setPosition(x, y, z);
    }


    getPosition() {
        return this.core.getPosition();
    }


    displayOn(scene) {
        scene.add(this.core);
        scene.add(this.pointLight1);
    }


    /***
     * Function for making the object rotate on itself following specific axis
     * @param {THREE.Vector3} rotationAxis Axis of the object for rotation.
     * @param {float} time real time, based on time dimention in space. You can pass in your in-application time, elapesedTime or DeltaTime.
     */
    setRotation(rotationAxis, time) {
        this.core.setRotation(rotationAxis, time);
    }


    /***
     * Function for calculatingt orbit tragetory base on the object's orbit attributes
     * @param {*} origin Star, planet, host parent, instance must has position property
     * @param {float} perigee min distance point from the object to the origin
     * @param {float} apogee max distance point from the object to the origin
     * @param {float} eccentricity measure of the "roundness" of an orbit, 0.0 mean perfect circular orbit
     * @param {float} inclination measures the tilt of an object's orbit around a celestial body (in degree)
     * @param {float} period amount of time a given astronomical object takes to complete one orbit around another object (in day)
     * @param {float} time real time, based on time dimention in space. You can pass in your in-application time, elapesedTime or DeltaTime.
     */
    orbit(origin, perigee, apogee, eccentricity, inclination, period, time) {
        this.core.orbit(origin, perigee, apogee, eccentricity, inclination, period, time);
        this.pointLight1.position.set(this.core.position.x, this.core.position.y, this.position.z);
        this.position = this.core.position;
    }
}