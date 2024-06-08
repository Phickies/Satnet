import { SphereGeometry, MeshPhongMaterial, PointLight } from 'three';
import { globalConfig } from './config.js';
import CelestialObject from './CelestialObject.js';


export default class Sun {
    constructor() {

        const geometry = new SphereGeometry(globalConfig.sunSize, 20, 20);
        const material = new MeshPhongMaterial({
            emissive: globalConfig.sunEmissiveColor,
            emissiveIntensity: globalConfig.sunIntensive,
            specular: globalConfig.sunSpecColor,
            color: 0x000000,
            fog: false
        });

        const layer = 0;

        this.core = new CelestialObject(
            geometry, material, "Sun", layer,
            globalConfig.sunRotationSpeed,
            globalConfig.sunTiltAngle, false, false);

        this.pointLight1 = new PointLight(globalConfig.sunLightColor, 2, 0, 0);
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


    update(origin, worldTime) {

        // Update rotation
        this.core.setRotation(this.core.axis, worldTime.timeScale);

        // Update orbit
        this.core.orbit(origin,
            globalConfig.earthPerigee * globalConfig.realworldScaleFactor,
            globalConfig.earthApogee * globalConfig.realworldScaleFactor,
            globalConfig.earthEccentricity,
            globalConfig.earthInclination,
            globalConfig.earthPeriod,
            worldTime.velocity
        );
        this.pointLight1.position.set(this.core.position.x, this.core.position.y, this.core.position.z);
        this.position = this.core.position;
    }

}