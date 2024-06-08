import { BufferGeometry, Points, Float32BufferAttribute, PointsMaterial } from 'three';
import { globalConfig } from './config.js';
import orbit from './orbitEquation.js';

export default class Satellite {
    constructor(scene) {
        this.scene = scene;
        this.satellites = [];
        this.maxSatellites = globalConfig.initNumSatellites;
        this.loadSatelliteData().then(this.createSatelliteObjects.bind(this));
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
        const columnsToFilter = ['Period'];

        // Parse the number value from string into number
        function toNumberIfNumeric(value) {
            return isNaN(value) ? value : Number(value);
        }

        return lines.slice(0, maxEntries)
            .map(line => {
                const bits = line.split('\t');

                // Create object with a random initial phase for orbital calculations
                let obj = { initPhase: 2 * Math.PI * Math.random() };  // Assign random initial phase

                headers.forEach((header, index) => {
                    obj[header] = toNumberIfNumeric(bits[index].trim());  // Trim spaces and convert to number if applicable
                });
                return obj;
            })
            .filter(obj => {
                return !columnsToFilter.some(col => obj[col] === null || isNaN(obj[col]));
            });
    }


    createSatelliteObjects() {
        const vertices = [];
        const colors = [];
        this.satellites.forEach(sat => {
            // You can adjust the position and color values based on your satellite data
            vertices.push(0, 0, 0);  // Placeholder for actual satellite positions
            /***
             * CIV means civil is BLUE
             * COM means commercial is CYAN
             * GOV means goverment is RED
             * MIL means military is YELLOW
             * the rest is white
             */
            const prefix = sat.Users.substring(0, 3).toLowerCase();
            switch (prefix) {
                case "civ":
                    colors.push(0, 1, 1); // Blue
                    break;
                case "com":
                    colors.push(0, 1, 0); // Green
                    break;
                case "gov":
                    colors.push(1, 0, 0 ); // Red
                    break;
                case "mil":
                    colors.push(1, 1, 0); // Yellow
                    break;
                default:
                    colors.push(1, 1, 1); // White
                    break;
            }
        });
        

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

        const material = new PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            vertexColors: true,
        });

        const statelliteGroup = new Points(geometry, material);
        statelliteGroup.layers.set(4);
        this.scene.add(statelliteGroup);

        // Store reference to points mesh in satellite data
        this.satellites.forEach((sat, index) => {
            sat.mesh = statelliteGroup;  // All satellites share the same geometry but could be controlled individually if needed
        });
    }


    update(origin, worldTime) {
        let index = 0;
        const positions = this.satellites.flatMap(sat => {
            index++;
            const newPosition = orbit(
                origin.position,
                sat.Perigee,
                sat.Apogee,
                sat.Eccentricity,
                sat.Inclination + 90,
                -sat.Period * 60,
                worldTime.velocity,
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
}
