/***
 * Configuration for objects
 */
export const environmentConfig = {
    fogColor: 0x000000,

    panControllerDampingFactor: 0.04,
    zoomControllerDampingFactor: 1.4,
}


export const globalConfig = {

    sunSize: 135,
    earthSize: 10,
    moonSize: 2.5,

    sunTiltAngle: 0,
    sunLightColor: 0xffffff,
    sunEmissiveColor: 0xffe600,
    sunSpecColor: 0xf5e000,
    sunIntensive: 1.5,


    earthTiltAngle: 23.5 * Math.PI / 180,
    earthCloudDensity: 0.1,
    earthLightEmissiveColor: 0x9D872C,
    earthPerigee: 16000,
    earthApogee: 16000,
    earthEccentricity: 0.3,
    earthInclination: 90,
    earthPeriod: 8760,


    moonTiltAngle: 0,
    moonPerigee: 280,
    moonApogee: 300,
    moonEccentricity: 0.15,
    moonInclination: 96,
    moonPeriod: 69,


    sunRotationSpeed: 0.4,
    earthRotationSpeed: 0.2,
    cloudAnimationSpeed: 0.3,
    moonRotationSpeed: 0.1,

    numSatellites: 4,
};