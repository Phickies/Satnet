import { SphereGeometry, MeshStandardMaterial, MeshLambertMaterial, Matrix4 } from 'three';
import { globalConfig } from './config.js';
import CelestialObject from './CelestialObject.js';


export default class Earth {
    constructor(earthMapTexture, earthBumpTexture, earthEmissionTexture, earthReflectTextuure, cloudTexture, cloudTransTexture) {

        const groundGeometry = new SphereGeometry(globalConfig.earthSize, 28, 28);
        const cloudGeometry = new SphereGeometry(globalConfig.earthSize + 0.07, 28, 28);

        const tiltAnlgeRadian = -globalConfig.earthTiltAngle * Math.PI / 180;

        groundGeometry.applyMatrix4(new Matrix4().makeRotationZ(-tiltAnlgeRadian));

        const earthMaterial = new MeshStandardMaterial({
            emissive: globalConfig.earthLightEmissiveColor,
            map: earthMapTexture,
            bumpMap: earthBumpTexture,
            emissiveMap: earthEmissionTexture,
            roughnessMap: earthReflectTextuure,
        });
        const cloudMaterial = new MeshLambertMaterial({
            transparent: true,
            map: cloudTexture,
            alphaMap: cloudTransTexture,
            opacity: 1.0,
            alphaTest: globalConfig.earthCloudDensity
        });

        const layer = 2;

        this.ground = new CelestialObject(
            groundGeometry, earthMaterial, "Earth", layer, 
            globalConfig.earthRotationSpeed, tiltAnlgeRadian, 
            false, false
        );
        this.cloud = new CelestialObject(
            cloudGeometry, cloudMaterial, "EarthCloud", layer, 
            globalConfig.cloudAnimationSpeed, tiltAnlgeRadian,
            false, false
        );

        this.position = this.ground.position;
        this.axis = this.ground.axis;
    }


    setPosition(x, y, z) {
        this.ground.setPosition(x, y, z);
        this.cloud.setPosition(x, y, z);
    }


    getPosition() {
        return this.ground.getPosition();
    }


    displayOn(scene) {
        scene.add(this.ground);
        scene.add(this.cloud);
    }


    update(origin, worldTime) {

        // Update rotation
        this.ground.setRotation(this.axis, worldTime.timeScale);
        this.cloud.setRotation(this.axis, worldTime.timeScale);

        // Update orbit
        this.ground.orbit(origin, 
            globalConfig.earthPerigee * globalConfig.realworldScaleFactor, 
            globalConfig.earthApogee * globalConfig.realworldScaleFactor, 
            globalConfig.earthEccentricity, 
            globalConfig.earthInclination, 
            globalConfig.earthPeriod, 
            worldTime.velocity
        );
        this.cloud.position.set(this.ground.position.x, this.ground.position.y, this.ground.position.z);
        this.position = this.ground.position;
    }
}
