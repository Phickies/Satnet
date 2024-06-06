import CelestialObject from './CelestialObject.js';
import * as THREE from 'three';
import { globalConfig } from './config.js';


export default class Sun {
    constructor(sunTexture) {

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
}