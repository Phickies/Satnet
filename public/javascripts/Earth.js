import CelestialObject from './CelestialObject.js';
import { SphereGeometry, MeshStandardMaterial, MeshLambertMaterial, Matrix4 } from 'three';
import { globalConfig } from './config.js';


export default class Earth {
    constructor(earthMapTexture, earthBumpTexture, earthEmissionTexture, earthReflectTextuure, cloudTexture, cloudTransTexture) {

        const groundGeometry = new SphereGeometry(globalConfig.earthSize, 28, 28);
        const cloudGeometry = new SphereGeometry(globalConfig.earthSize + 0.07, 28, 28);

        groundGeometry.applyMatrix4(new Matrix4().makeRotationZ(-globalConfig.earthTiltAngle));

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

        this.ground = new CelestialObject(groundGeometry, earthMaterial, "Earth", layer, globalConfig.earthRotationSpeed, false, false);
        this.cloud = new CelestialObject(cloudGeometry, cloudMaterial, "EarthCloud", layer, globalConfig.cloudAnimationSpeed, false, false);

        this.position = this.ground.position;
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


    /***
     * Function for making the object rotate on itself following specific axis
     * @param {THREE.Vector3} rotationAxis Axis of the object for rotation.
     * @param {float} time real time, based on time dimention in space. You can pass in your in-application time, elapesedTime or DeltaTime.
     */
    setRotation(rotationAxis, time) {
        this.ground.setRotation(rotationAxis, time);
        this.cloud.setRotation(rotationAxis, time);
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
        this.ground.orbit(origin, perigee, apogee, eccentricity, inclination, period, time);
        this.cloud.orbit(origin, perigee, apogee, eccentricity, inclination, period, time);
        this.position = this.ground.position;
    }
}
