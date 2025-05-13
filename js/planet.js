/**
 * Planet class for creating and managing planets
 */

class Planet {
    constructor(data, scene) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.radius = data.radius;
        this.position = data.position;
        this.rotationSpeed = data.rotationSpeed;
        this.characteristics = data.characteristics;
        this.color = data.color;
        this.scene = scene;
        this.mesh = null;
        
        // For orbit
        this.orbitRadius = data.orbitRadius || 0;
        this.orbitSpeed = data.orbitSpeed || 0;
        this.orbitAngle = data.orbitAngle || 0;
        this.parentStar = data.parentStar || null;
        
        this.init();
    }
    
    init() {
        // Create the planet mesh
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 10
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        
        // Add atmosphere if the planet has one
        if (this.characteristics.hasAtmosphere) {
            this.addAtmosphere();
        }
        
        // Add rings for some planet types
        if (this.type === 'gas-giant' && Math.random() > 0.6) {
            this.addRings();
        }
        
        this.scene.add(this.mesh);
    }
    
    addAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(this.radius * 1.1, 32, 32);
        const atmosphereColor = this.getAtmosphereColor();
        
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: atmosphereColor,
            transparent: true,
            opacity: 0.2 + (this.characteristics.atmosphereDensity * 0.3)
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.mesh.add(atmosphere);
    }
    
    addRings() {
        const innerRadius = this.radius * 1.4;
        const outerRadius = this.radius * 2.2;
        
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);
        
        // Rotate the rings to be horizontal
        ringGeometry.rotateX(-Math.PI / 2);
        
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xCCBB99,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        this.mesh.add(rings);
    }
    
    getAtmosphereColor() {
        switch(this.type) {
            case 'gas-giant': return 0xE3DBDB;
            case 'ice': return 0xADD8E6;
            case 'ocean': return 0x1E90FF;
            case 'forest': return 0x228B22;
            case 'desert': return 0xF4A460;
            case 'volcanic': return 0xFF4500;
            default: return 0xFFFFFF;
        }
    }
    
    update() {
        // Rotate the planet
        this.mesh.rotation.y += this.rotationSpeed;
        
        // If the planet orbits a star, update its position
        if (this.orbitRadius > 0) {
            this.orbitAngle += this.orbitSpeed;
            
            // Calculate new position in orbit
            const newX = Math.cos(this.orbitAngle) * this.orbitRadius;
            const newZ = Math.sin(this.orbitAngle) * this.orbitRadius;
            
            // Update position
            this.position.x = newX;
            this.position.z = newZ;
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        }
    }
    
    getInfo() {
        let lifeStatus = '';
        if (this.characteristics.inhabitedStatus === 'uninhabited') {
            lifeStatus = 'No life detected';
        } else {
            lifeStatus = `Life detected: ${this.characteristics.inhabitedStatus}`;
        }
        
        return {
            name: this.name,
            type: this.type.charAt(0).toUpperCase() + this.type.slice(1),
            diameter: (this.radius * 2 * 1000).toFixed(0) + ' km',
            gravity: this.characteristics.gravity.toFixed(2) + ' G',
            temperature: this.characteristics.temperature.toFixed(1) + ' °C',
            atmosphere: this.characteristics.hasAtmosphere ? 'Present' : 'None',
            water: this.characteristics.hasWater ? 'Present' : 'None',
            resources: {
                minerals: this.characteristics.resources.minerals.toFixed(1) + '%',
                gases: this.characteristics.resources.gases.toFixed(1) + '%',
                water: this.characteristics.resources.water.toFixed(1) + '%',
                organics: this.characteristics.resources.organics.toFixed(1) + '%',
                energy: this.characteristics.resources.energy.toFixed(1) + '%'
            },
            lifeStatus: lifeStatus,
            star: this.parentStar || 'Unknown'
        };
    }
    
    showInfoPanel() {
        const info = this.getInfo();
        
        // Create or update info panel
        let infoPanel = document.getElementById('planet-info');
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'planet-info';
            infoPanel.className = 'panel';
            infoPanel.style.position = 'absolute';
            infoPanel.style.right = '20px';
            infoPanel.style.top = '20px';
            infoPanel.style.width = '300px';
            infoPanel.style.maxHeight = '80vh';
            infoPanel.style.overflowY = 'auto';
            infoPanel.style.zIndex = '1000';
            document.body.appendChild(infoPanel);
        }
        
        // Update panel content
        infoPanel.innerHTML = `
            <h2>${info.name}</h2>
            <p><strong>Type:</strong> ${info.type} Planet</p>
            <p><strong>Diameter:</strong> ${info.diameter}</p>
            <p><strong>Gravity:</strong> ${info.gravity}</p>
            <p><strong>Temperature:</strong> ${info.temperature}</p>
            <p><strong>Atmosphere:</strong> ${info.atmosphere}</p>
            <p><strong>Water:</strong> ${info.water}</p>
            <h3>Resources</h3>
            <p><strong>Minerals:</strong> ${info.resources.minerals}</p>
            <p><strong>Gases:</strong> ${info.resources.gases}</p>
            <p><strong>Water:</strong> ${info.resources.water}</p>
            <p><strong>Organics:</strong> ${info.resources.organics}</p>
            <p><strong>Energy:</strong> ${info.resources.energy}</p>
            <p><strong>Life:</strong> ${info.lifeStatus}</p>
            <p><strong>Star System:</strong> ${info.star}</p>
            <button id="close-info">Close</button>
        `;
        
        // Add event listener to close button
        document.getElementById('close-info').addEventListener('click', () => {
            infoPanel.style.display = 'none';
        });
        
        // Show panel
        infoPanel.style.display = 'block';
    }
    
    hideInfoPanel() {
        const infoPanel = document.getElementById('planet-info');
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }
    }
}
