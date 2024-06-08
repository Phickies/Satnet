import { Vector3, MathUtils } from "three";
import { globalConfig } from "./config";


/**
 * New function make the satellites orbit in a counterclockwise, which is all wrong.
 */
// /***
//  * Function for calculatingt orbit tragetory (position) base on the object's orbit attributes
//  * @param {*} origin Star, planet, host parent, instance must has position property
//  * @param {float} perigee min distance point from the object to the origin
//  * @param {float} apogee max distance point from the object to the origin
//  * @param {float} eccentricity measure of the "roundness" of an orbit, 0.0 mean perfect circular orbit
//  * @param {float} inclination measures the tilt of an object's orbit around a celestial body (in degree)
//  * @param {float} period amount of time a given astronomical object takes to complete one orbit around another object (in day)
//  * @param {float} time real time, based on time dimention in space. You can pass in your in-application time, elapesedTime or DeltaTime.
//  * @param {float} initialPhase start phase of the object (in radian)
//  * @returns {Vector3} position of the object based on real time.
//  */
// export default function orbit(origin, perigee, apogee, eccentricity, inclination, period, time, initialPhase) {
//     // Calculate the semi-major axis
//     const a = (perigee + apogee) / 2;

//     // Calculate the mean anomaly
//     const meanAnomaly = 2 * Math.PI * (time / period) + initialPhase;

//     // Solve Kepler's Equation to get the eccentric anomaly
//     const E = solveKeplersEquation(meanAnomaly, eccentricity);

//     // Calculate the true anomaly from the eccentric anomaly
//     const trueAnomaly = 2 * Math.atan2(
//         Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
//         Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
//     );

//     // Calculate the radius at the true anomaly
//     const r = a * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));

//     // Calculate the unrotated X coordinate
//     const X = r * Math.cos(trueAnomaly);

//     // Rotate the Y and Z coordinates for inclination
//     const Y = r * Math.sin(trueAnomaly) * Math.cos(inclination);
//     const Z = r * Math.sin(trueAnomaly) * Math.sin(inclination);

//     // Apply the scaling factor and origin offset
//     return new Vector3(
//         X * globalConfig.realworldScaleFactor * 25 + origin.x,
//         Y * globalConfig.realworldScaleFactor * 25 + origin.y,
//         Z * globalConfig.realworldScaleFactor * 25 + origin.z
//     );
// }

// function solveKeplersEquation(M, e, maxIter = 100, tol = 1e-6) {
//     let E = M; // Initial guess: E = M is a common choice
//     for (let i = 0; i < maxIter; i++) {
//         const f_E = E - e * Math.sin(E) - M; // f(E)
//         const f_prime_E = 1 - e * Math.cos(E); // f'(E)
//         const delta_E = f_E / f_prime_E; // Change to apply
//         E -= delta_E;

//         // Check if the solution is within the tolerance
//         if (Math.abs(delta_E) < tol) {
//             break;
//         }
//     }
//     return E;
// }

/*--------- OLD EQUATION ---------- */

export default function orbit(origin, perigee, apogee, eccentricity, inclination, period, time, initialPhase) {
    // Convert inclination from degrees to radians
    inclination = MathUtils.degToRad(inclination);


    // Calculate semi-major axis and mean motion
    const a = (perigee + apogee) / 2;
    const n = 2 * Math.PI / period;

    // Calculate the mean anomaly
    let M = n * time + initialPhase;

    // Solve Kepler's Equation using Newton's method for the eccentric anomaly
    let E = M;
    let delta;
    for (let i = 0; i < 10; i++) {
        delta = E - eccentricity * Math.sin(E) - M;
        if (Math.abs(delta) < 1e-6) break;  // Convergence check
        E -= delta / (1 - eccentricity * Math.cos(E));
    }

    // Calculate the true anomaly
    const v = 2 * Math.atan(Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(E / 2));

    // Calculate the distance from the focal point
    const r = a * (1 - eccentricity * Math.cos(E));

    // Calculate Cartesian coordinates in the orbital plane
    const X = r * Math.cos(v);
    const Y = r * Math.sin(v) * Math.cos(inclination);
    const Z = r * Math.sin(v) * Math.sin(inclination);

    // Apply scale factor and adjust position relative to the origin
    return new Vector3(
        X * globalConfig.realworldScaleFactor * 25 + origin.x,
        Y * globalConfig.realworldScaleFactor * 25 + origin.y,
        Z * globalConfig.realworldScaleFactor * 25 + origin.z
    );
}