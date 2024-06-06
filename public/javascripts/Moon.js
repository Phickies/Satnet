import CelestialObject from './CelestialObject.js';
import { SphereGeometry, MeshStandardMaterial } from 'three';
import { globalConfig } from './config.js';


export default class Moon extends CelestialObject {
    constructor(moonMapTexture, moonBumpTexture) {
        const geometry = new SphereGeometry(globalConfig.moonSize, 20, 20);
        const material = new MeshStandardMaterial({
            map: moonMapTexture,
            bumpMap: moonBumpTexture,
        });
        const layer = 1;
        super(geometry, material, "Moon", layer, globalConfig.moonRotationSpeed, true, true);
    }
}