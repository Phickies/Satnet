import { BufferGeometry, MeshBasicMaterial, Points, MathUtils, Vector3, Float32BufferAttribute, PointsMaterial, TextureLoader } from 'three';
import { globalConfig } from './config.js';

export default class Satellite {
    constructor(scene, maxSatellites) {
        this.scene = scene;
        this.satellites = [];
        this.maxSatellites = maxSatellites;
        this.loadSatelliteData().then(this.createSatelliteObjects.bind(this));
        const layer = 4;
    }

    async loadSatelliteData() {
        try {
            const response = await fetch('./data/Satellite_dataset.tsv');
            const data = await response.text();
            this.satellites = this.parseTSV(data, this.maxSatellites);
            console.log(`Loaded ${this.satellites.length} satellites.`);
        } catch (error) {
            console.error('Failed to load satellite data:', error);
        }
    }

    parseTSV(data, maxEntries) {
        const lines = data.split('\n');
        const headers = lines.shift().split('\t');
    
        function toNumberIfNumeric(value) {
            return isNaN(value) ? value : Number(value);
        }
    
        return lines.slice(0, maxEntries).map(line => {
            const bits = line.split('\t');
            // Create object with a random initial phase for orbital calculations
            let obj = { initPhase: 2 * Math.PI * Math.random() };  // Assign random initial phase
            headers.forEach((header, index) => {
                obj[header] = toNumberIfNumeric(bits[index].trim());  // Trim spaces and convert to number if applicable
            });
            return obj;
        });
    }
    
    
    createSatelliteObjects() {
        const vertices = [];
        const colors = [];
        this.satellites.forEach(sat => {
            // You can adjust the position and color values based on your satellite data
            vertices.push(0, 0, 0);  // Placeholder for actual satellite positions
            // if first three letters are CIV, color is blue
            // com is green
            // gov is red
            // mil is yellow
            // rest is white
            // Determine color based on the satellite's name prefix
            const prefix = sat.Users.substring(0, 3).toLowerCase(); // Use lower case for case insensitive comparison
            if (prefix === "civ") {
                colors.push(0, 0, 1); // Blue
            } else if (prefix === "com") {
                colors.push(0, 1, 0); // Green
            } else if (prefix === "gov") {
                colors.push(1, 0, 0); // Red
            } else if (prefix === "mil") {
                colors.push(1, 1, 0); // Yellow
            } else {
                colors.push(1, 1, 1); // White
            }
        });

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
        
        const material = new PointsMaterial({
            size: 1,
            sizeAttenuation: true,
            vertexColors: true, 
            // color: 0xff0000 
        });

        const points = new Points(geometry, material);
        this.scene.add(points);

        // Store reference to points mesh in satellite data
        this.satellites.forEach((sat, index) => {
            sat.mesh = points;  // All satellites share the same geometry but could be controlled individually if needed
        });
    }

    updateSatellites(time, origin) {
        let index=0;
        const positions = this.satellites.flatMap(sat => {
            index++;
            const newPosition = this.orbit(
                origin.position,
                sat.Perigee,
                sat.Apogee,
                sat.Eccentricity,
                sat.Inclination,
                -sat.Period,
                time,
                sat.initPhase
            );
            return newPosition.toArray().map(coord => isNaN(coord) ? 0 : coord); // Replace NaN with 0 or some default value
        }).flat();  // Flatten the array of arrays to a single array
    

        const positionAttribute = this.satellites[0]?.mesh?.geometry?.attributes.position;
        if (positionAttribute) {
            positionAttribute.array = new Float32Array(positions);
            positionAttribute.needsUpdate = true;
        } 
    }

    orbit(origin, perigee, apogee, eccentricity, inclination, period, time, initialPhase) {
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
    
    
}
