/***
 * Configuration for objects
 */
export const environmentConfig = {
    fogEnable: false,
    fogColor: 0x000000,

    panControllerDampingFactor: 0.04,
    zoomControllerDampingFactor: 1.5,
}


export const globalConfig = {

    
    sunSize: 2.181,
    earthSize: 10,
    moonSize: 2.5,
    realworldScaleFactor: 10/6371,
    
    sunTiltAngle: 0,
    sunLightColor: 0xffffff,
    sunEmissiveColor: 0xffffbb,
    sunSpecColor: 0xffffaa,
    sunIntensive: 1.75,
    bloomThreshold: .9,
    bloomStrength: 2,
    bloomRadius: .1,


    earthTiltAngle: 23.5 * Math.PI / 180,
    earthCloudDensity: 0.1,
    earthLightEmissiveColor: 0x9D872C,
    earthPerigee: 147100,
    earthApogee: 152100,
    earthEccentricity: 0.0167,
    earthInclination: 7.155,
    earthPeriod: 525960,


    moonTiltAngle: 11.509 * Math.PI / 180,
    moonPerigee: 402541.95,
    moonApogee: 405000,
    moonEccentricity: 0.0549,
    moonInclination: 5.1,
    moonPeriod: 39312,


    sunRotationSpeed: 0.4,
    earthRotationSpeed: 0.2,
    cloudAnimationSpeed: 0.3,
    moonRotationSpeed: 0.1,

    initNumSatellites: 7000,
};