/***
 * Configuration for objects
 */
export const cameraConfig = {

    cameraFOV: 30,  
    cameraNearLimitView: 0.1,
    cameraFarLimitView: 1000000000,
    camearInitPosition: 
    {
        x: 30,
        y: 24,
        z: -60
    }
}


export const uxConfig = {

    menuPanelWidth: 310,

    minTimeScale: -8000000,
    maxTimeScale: 8000000,
    timeScaleStep: 1

}


export const environmentConfig = {

    fogEnable: false,
    fogColor: 0x000000,

    panControllerDampingFactor: 0.04,
    zoomControllerDampingFactor: 1.5,

    gridHelperWidth: 40000,
    gridHelperDensity: 50,
    
}


export const globalConfig = {

    sunSize: 8000,
    earthSize: 10,
    moonSize: 2.5,
    realworldScaleFactor: 10/6371,
    
    sunTiltAngle: 0,
    sunRotationSpeed: 0.4,
    sunLightColor: 0xffffff,
    sunEmissiveColor: 0xffffbb,
    sunSpecColor: 0xffffaa,
    sunIntensive: 1.75,
    bloomThreshold: .9,
    bloomStrength: 2,
    bloomRadius: .1,


    earthTiltAngle: 23.5,
    earthRotationSpeed: 0.0000727 / 47,           // Speed in radians/s
    cloudAnimationSpeed: 0.00015 / 47,
    earthCloudDensity: 0.1,
    earthLightEmissiveColor: 0x9D872C,
    earthPerigee: 1471000000,
    earthApogee: 1521000000,
    earthEccentricity: 0.0167,
    earthInclination: 7.155,
    earthPeriod: 31557600,


    moonRotationSpeed: 0.00000266 / 48,
    moonTiltAngle: 6.68,
    moonPerigee: 402541.95,
    moonApogee: 405000,
    moonEccentricity: 0.0549,
    moonInclination: 5.1,
    moonPeriod: 2546800,
    

    initNumSatellites: 7560,
    
    initLaunchSite: 7000,
    successLaunchColor: 0x00ff00,
    failureLaunchColor: 0xff0000,
    preLaunchFailColor: 0xffff00,
    other: 0x555555,
    launchSiteProximityThreshold: 0.00001,
    launchSiteBarScalerHeight: 0.02,
    launchSiteBarRadius: 0.05,


};