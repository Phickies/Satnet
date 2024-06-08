import { SphereGeometry, MeshStandardMaterial, Matrix4 } from 'three';
import { globalConfig } from './config.js';
import CelestialObject from './CelestialObject.js';


export default class Moon extends CelestialObject {
    constructor(moonMapTexture, moonBumpTexture) {
        const geometry = new SphereGeometry(globalConfig.moonSize, 20, 20);
        const material = new MeshStandardMaterial({
            map: moonMapTexture,
            bumpMap: moonBumpTexture,
        });
        const tiltAnlgeRadian = -globalConfig.moonTiltAngle * Math.PI / 180;

        geometry.applyMatrix4(new Matrix4().makeRotationZ(-tiltAnlgeRadian));

        const layer = 1;
        super(geometry, material, "Moon", layer, globalConfig.moonRotationSpeed, globalConfig.moonTiltAngle, true, true);
    }


    update(origin, worldTime) {

        // Update rotation
        this.setRotation(this.axis, worldTime.timeScale);

        // Update orbit
        this.orbit(origin,
            globalConfig.moonPerigee * globalConfig.realworldScaleFactor,
            globalConfig.moonApogee * globalConfig.realworldScaleFactor,
            globalConfig.moonEccentricity,
            globalConfig.moonInclination,
            globalConfig.moonPeriod,
            worldTime.velocity
        );
    }
}