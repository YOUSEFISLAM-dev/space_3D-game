/**
 * Procedural generator for creating planets and space objects
 */

class ProceduralGenerator {
    constructor(seed = Date.now()) {
        this.seed = seed;
        this.noiseScale = 0.05;
    }

    // Generate a new planet
    generatePlanet(position, minRadius = 5, maxRadius = 15) {
        const planetRadius = getRandomFloat(minRadius, maxRadius);
        const planetType = this.generatePlanetType();
        const planetName = this.generatePlanetName();
        
        // Generate planet characteristics
        const characteristics = {
            hasWater: Math.random() > 0.5,
            hasAtmosphere: Math.random() > 0.3,
            atmosphereDensity: getRandomFloat(0, 1),
            temperature: getRandomFloat(-200, 400),
            gravity: getRandomFloat(0.1, 2.5),
            resources: this.generateResources(),
            inhabitedStatus: this.generateInhabitedStatus()
        };
        
        return {
            id: generateUUID(),
            name: planetName,
            type: planetType,
            radius: planetRadius,
            position: position,
            rotationSpeed: getRandomFloat(0.001, 0.005),
            characteristics: characteristics,
            color: this.getPlanetColorByType(planetType)
        };
    }
    
    // Generate a random planet type
    generatePlanetType() {
        const planetTypes = [
            'rocky', 'gas-giant', 'ice', 'molten', 'desert', 
            'ocean', 'forest', 'barren', 'volcanic'
        ];
        return planetTypes[getRandomInt(0, planetTypes.length - 1)];
    }
    
    // Get a color based on planet type
    getPlanetColorByType(type) {
        switch(type) {
            case 'rocky': return 0x8B4513;
            case 'gas-giant': return 0xE3DBDB;
            case 'ice': return 0xADD8E6;
            case 'molten': return 0xFF4500;
            case 'desert': return 0xF4A460;
            case 'ocean': return 0x1E90FF;
            case 'forest': return 0x228B22;
            case 'barren': return 0x808080;
            case 'volcanic': return 0x800000;
            default: return 0xFFFFFF;
        }
    }
    
    // Generate a planet name
    generatePlanetName() {
        const prefixes = ['Al', 'Ze', 'Kro', 'Thr', 'Vex', 'Nep', 'Plu', 'Sat', 'Jup', 'Mar'];
        const suffixes = ['thor', 'nox', 'tron', 'ton', 'tex', 'nus', 'ter', 'urn', 'tis', 'dor'];
        const randomNumber = getRandomInt(0, 999);
        
        const prefix = prefixes[getRandomInt(0, prefixes.length - 1)];
        const suffix = suffixes[getRandomInt(0, suffixes.length - 1)];
        
        return `${prefix}${suffix}-${randomNumber}`;
    }
    
    // Generate planet resources
    generateResources() {
        return {
            minerals: getRandomFloat(0, 100),
            gases: getRandomFloat(0, 100),
            water: getRandomFloat(0, 100),
            organics: getRandomFloat(0, 100),
            energy: getRandomFloat(0, 100)
        };
    }
    
    // Determine if the planet is inhabited and by what
    generateInhabitedStatus() {
        const random = Math.random();
        if (random > 0.9) {
            return 'intelligent life';
        } else if (random > 0.7) {
            return 'primitive life';
        } else if (random > 0.5) {
            return 'microorganisms';
        }
        return 'uninhabited';
    }
    
    // Generate a star system with planets
    generateStarSystem(position, numPlanets = 5) {
        const starSize = getRandomFloat(20, 50);
        const starColor = this.generateStarColor();
        const starName = this.generateStarName();
        
        const planets = [];
        
        // Generate planets in orbit
        for (let i = 0; i < numPlanets; i++) {
            const orbitRadius = starSize * 2 + i * getRandomFloat(20, 50);
            const angle = getRandomFloat(0, Math.PI * 2);
            
            // Calculate planet position in orbit
            const planetX = position.x + Math.cos(angle) * orbitRadius;
            const planetY = position.y + Math.sin(angle) * getRandomFloat(-5, 5);
            const planetZ = position.z + Math.sin(angle) * orbitRadius;
            
            const planetPosition = { x: planetX, y: planetY, z: planetZ };
            const planet = this.generatePlanet(planetPosition);
            planet.orbitRadius = orbitRadius;
            planet.orbitSpeed = getRandomFloat(0.0005, 0.002);
            planet.orbitAngle = angle;
            planet.parentStar = starName;
            
            planets.push(planet);
        }
        
        return {
            id: generateUUID(),
            name: starName,
            radius: starSize,
            position: position,
            color: starColor,
            planets: planets
        };
    }
    
    // Generate a star color
    generateStarColor() {
        const starColors = [0xFFFF00, 0xFFA500, 0xFF4500, 0x00BFFF, 0xFFFFFF, 0xF5DEB3];
        return starColors[getRandomInt(0, starColors.length - 1)];
    }
    
    // Generate a star name
    generateStarName() {
        const prefixes = ['Sol', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
        const suffixes = ['Centauri', 'Cygni', 'Draconis', 'Eridani', 'Lyrae', 'Orionis', 'Persei', 'Tauri'];
        
        const prefix = prefixes[getRandomInt(0, prefixes.length - 1)];
        const suffix = suffixes[getRandomInt(0, suffixes.length - 1)];
        
        return `${prefix} ${suffix}`;
    }
    
    // Generate an entire galaxy
    generateGalaxy(numStarSystems = 20, radius = 2000) {
        const galaxy = [];
        
        for (let i = 0; i < numStarSystems; i++) {
            // Generate star system in a spiral pattern
            const angle = i * 2.4; // Determines the spiral
            const distance = radius * (i / numStarSystems);
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            const y = getRandomFloat(-100, 100);
            
            const position = { x, y, z };
            const starSystem = this.generateStarSystem(position, getRandomInt(2, 8));
            
            galaxy.push(starSystem);
        }
        
        return galaxy;
    }
}
