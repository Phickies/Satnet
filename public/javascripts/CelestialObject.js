import { Mesh, Object3D, Vector3, MathUtils } from "three";


/***
 * @class Celestial
 */
export default class CelestialObject extends Object3D {
    /***
     * Construction for Celectial Object
     * @param {*} geometry Shpape of the object
     * @param {*} material Material of the object
     * @param {*} name Metaname for object
     * @param {int} layer Meta layer for display
     * @param {float} rotationSpeed Rotation speed
     */
    constructor(geometry, material, name, layer, rotationSpeed, tiltAngle, castShadow = true, receiveShadow = true) {
        super();
        const object = new Mesh(geometry, material);
        object.layers.set(layer);
        this.attach(object);
        this.userData.name = name;
        this.castShadow = castShadow;
        this.receiveShadow = receiveShadow;
        this.rotationSpeed = rotationSpeed;
        this.axis = this.calculateRotationAxis(tiltAngle);
    }


    setPosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }


    getPosition() {
        return this.getWorldPosition(new Vector3());
    }


    displayOn(scene) {
        scene.add(this);
    }


    /***
     * Calculate the rotation axis based on tilt angle of the celestial
     * @param {float} celetsialTitlAngle in radian
     * @return {THREE.Vector3} rotation Axis
     */
    calculateRotationAxis(celetsialTitlAngle) {
        return new Vector3(Math.sin(celetsialTitlAngle), Math.cos(celetsialTitlAngle), 0).normalize();
    }


    /***
     * Function for making the object rotate on itself following specific axis
     * @param {THREE.Vector3} rotationAxis Axis of the object for rotation.
     * @param {float} time real time, based on time dimention in space. You can pass in your in-application time, elapesedTime or DeltaTime.
     */
    setRotation(rotationAxis, time) {
        this.rotateOnAxis(rotationAxis, this.rotationSpeed * time);
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
        if (origin != null) {
            // Convert degrees to radians
            inclination = MathUtils.degToRad(inclination + 90);
    
            // Semi-major axis
            const a = (perigee + apogee) / 2;
    
            // Mean motion
            const n = 2 * Math.PI / -period;
    
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
            const position = new Vector3(X, Y, Z).add(origin.position);
    
            this.position.copy(position);
        }
    }
}