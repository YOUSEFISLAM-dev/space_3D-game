/**
 * Main game class for Space Adventure
 */

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.controls = {
            moveForward: false,
            moveBackward: false,
            turnLeft: false,
            turnRight: false,
            pitchUp: false,
            pitchDown: false
        };
        this.galaxy = [];
        this.planets = [];
        this.stars = [];
        this.proceduralGenerator = null;
        this.missionSystem = null;
        this.isLoading = true;
        this.loadingProgress = 0;
        this.loadingInterval = null;
        this.raycaster = null;
        this.mouse = new THREE.Vector2();
        
        this.init();
    }
    
    init() {
        // Initialize loading screen
        this.loadingInterval = setInterval(() => {
            this.updateLoadingScreen();
        }, 100);
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 10000
        );
        this.camera.position.z = 20;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
        
        // Add lights to the scene
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Initialize raycaster for object selection
        this.raycaster = new THREE.Raycaster();
        
        // Add stars background
        this.createStarfield();
        
        // Create procedural generator
        this.proceduralGenerator = new ProceduralGenerator();
        
        // Generate galaxy
        this.generateGalaxy();
        
        // Create player's spaceship
        this.player = new Spaceship(this.scene);
        
        // Create missions system
        this.missionSystem = new MissionSystem(this);
        this.missionSystem.initialize();
        
        // Add event listeners
        this.addEventListeners();
        
        // Start the game loop
        this.animate();
        
        // Complete loading
        setTimeout(() => {
            this.finishLoading();
        }, 3000);
    }
    
    updateLoadingScreen() {
        this.loadingProgress += 5;
        if (this.loadingProgress > 100) {
            this.loadingProgress = 100;
        }
        
        const loadingBar = document.getElementById('loading-bar');
        if (loadingBar) {
            loadingBar.style.width = `${this.loadingProgress}%`;
        }
        
        const loadingText = document.getElementById('loading-text');
        const loadingMessages = [
            'Generating galaxy...',
            'Creating star systems...',
            'Populating planets...',
            'Calibrating navigation systems...',
            'Preparing for launch...'
        ];
        
        const messageIndex = Math.floor(this.loadingProgress / 20);
        if (loadingText && loadingMessages[messageIndex]) {
            loadingText.textContent = loadingMessages[messageIndex];
        }
    }
    
    finishLoading() {
        this.isLoading = false;
        
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            
            // Remove loading screen after transition
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 1000);
        }
        
        clearInterval(this.loadingInterval);
        
        // Show tutorial notification
        showNotification('Welcome to Space Adventure! Use WASD to move and arrows to rotate', 5000);
    }
    
    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2,
            sizeAttenuation: false
        });
        
        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 6000;
            const y = (Math.random() - 0.5) * 6000;
            const z = (Math.random() - 0.5) * 6000;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }
    
    generateGalaxy() {
        // Generate galaxy with procedural generator
        const galaxyData = this.proceduralGenerator.generateGalaxy(10, 2000);
        this.galaxy = galaxyData;
        
        // Add all planets and stars to the scene
        galaxyData.forEach(starSystem => {
            // Create star
            const starGeometry = new THREE.SphereGeometry(starSystem.radius, 32, 32);
            const starMaterial = new THREE.MeshBasicMaterial({
                color: starSystem.color,
                emissive: starSystem.color,
                emissiveIntensity: 1
            });
            
            const starMesh = new THREE.Mesh(starGeometry, starMaterial);
            starMesh.position.set(
                starSystem.position.x,
                starSystem.position.y,
                starSystem.position.z
            );
            
            // Add a point light for the star
            const starLight = new THREE.PointLight(starSystem.color, 1, 1000);
            starLight.position.set(
                starSystem.position.x,
                starSystem.position.y,
                starSystem.position.z
            );
            
            this.scene.add(starMesh);
            this.scene.add(starLight);
            
            this.stars.push({
                id: starSystem.id,
                name: starSystem.name,
                position: starSystem.position,
                radius: starSystem.radius,
                mesh: starMesh
            });
            
            // Create planets for this star system
            starSystem.planets.forEach(planetData => {
                // Adjust planet position to be relative to its star
                planetData.position.x += starSystem.position.x;
                planetData.position.y += starSystem.position.y;
                planetData.position.z += starSystem.position.z;
                
                const planet = new Planet(planetData, this.scene);
                this.planets.push(planet);
            });
        });
    }
    
    addEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'w': this.controls.moveForward = true; break;
                case 's': this.controls.moveBackward = true; break;
                case 'a': this.controls.turnLeft = true; break;
                case 'd': this.controls.turnRight = true; break;
                case 'ArrowUp': this.controls.pitchUp = true; break;
                case 'ArrowDown': this.controls.pitchDown = true; break;
                case 'm': this.toggleMissionPanel(); break;
                case 'Escape': this.hideAllPanels(); break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'w': this.controls.moveForward = false; break;
                case 's': this.controls.moveBackward = false; break;
                case 'a': this.controls.turnLeft = false; break;
                case 'd': this.controls.turnRight = false; break;
                case 'ArrowUp': this.controls.pitchUp = false; break;
                case 'ArrowDown': this.controls.pitchDown = false; break;
            }
        });
        
        // Mouse click for selecting planets
        document.addEventListener('click', (e) => {
            if (this.isLoading) return;
            
            // Calculate mouse position in normalized device coordinates
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
            
            // Check for object intersection
            this.checkIntersection();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    checkIntersection() {
        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get all meshes in the scene
        const meshes = [];
        this.planets.forEach(planet => {
            if (planet.mesh) meshes.push(planet.mesh);
        });
        
        // Check for intersections
        const intersects = this.raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            // Find which planet was clicked
            const clickedMesh = intersects[0].object;
            const clickedPlanet = this.planets.find(p => p.mesh === clickedMesh || p.mesh.children.includes(clickedMesh));
            
            if (clickedPlanet) {
                clickedPlanet.showInfoPanel();
                
                // If player is close to the planet, show available missions
                const playerPos = this.player.getPosition();
                const planetPos = clickedPlanet.position;
                const dist = distance(playerPos, planetPos);
                
                if (dist < clickedPlanet.radius * 3) {
                    this.missionSystem.showAvailableMissions();
                }
            }
        }
    }
    
    toggleMissionPanel() {
        if (this.missionSystem.currentMission) {
            // Display detailed mission info
            let missionPanel = document.getElementById('mission-details');
            if (!missionPanel) {
                missionPanel = document.createElement('div');
                missionPanel.id = 'mission-details';
                missionPanel.className = 'panel';
                missionPanel.style.position = 'absolute';
                missionPanel.style.left = '50%';
                missionPanel.style.top = '50%';
                missionPanel.style.transform = 'translate(-50%, -50%)';
                missionPanel.style.width = '400px';
                missionPanel.style.zIndex = '1000';
                document.body.appendChild(missionPanel);
            }
            
            const mission = this.missionSystem.currentMission;
            
            missionPanel.innerHTML = `
                <h2>${mission.title}</h2>
                <p>${mission.description}</p>
                <p><strong>Objective:</strong> ${mission.objective}</p>
                <p><strong>Target:</strong> ${mission.targetPlanetName} in ${mission.targetSystem}</p>
                <p><strong>Progress:</strong> ${Math.floor(mission.progress)}%</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${mission.progress}%"></div>
                </div>
                <button id="abandon-mission">Abandon Mission</button>
                <button id="close-mission-details">Close</button>
            `;
            
            document.getElementById('abandon-mission').addEventListener('click', () => {
                this.missionSystem.abandonMission();
                missionPanel.style.display = 'none';
            });
            
            document.getElementById('close-mission-details').addEventListener('click', () => {
                missionPanel.style.display = 'none';
            });
            
            missionPanel.style.display = 'block';
        } else {
            this.missionSystem.showAvailableMissions();
        }
    }
    
    hideAllPanels() {
        // Hide mission panel
        const missionPanel = document.getElementById('mission-details');
        if (missionPanel) {
            missionPanel.style.display = 'none';
        }
        
        // Hide available missions
        const missionsPanel = document.getElementById('available-missions');
        if (missionsPanel) {
            missionsPanel.style.display = 'none';
        }
        
        // Hide planet info
        const planetInfo = document.getElementById('planet-info');
        if (planetInfo) {
            planetInfo.style.display = 'none';
        }
    }
    
    handlePlayerControls() {
        if (this.controls.moveForward) {
            this.player.accelerate();
        }
        
        if (this.controls.moveBackward) {
            this.player.decelerate();
        }
        
        if (this.controls.turnLeft) {
            this.player.rotateLeft();
        }
        
        if (this.controls.turnRight) {
            this.player.rotateRight();
        }
        
        if (this.controls.pitchUp) {
            this.player.pitchUp();
        }
        
        if (this.controls.pitchDown) {
            this.player.pitchDown();
        }
    }
    
    updateCamera() {
        // Position camera behind player's ship
        const playerPos = this.player.getPosition();
        const cameraOffset = new THREE.Vector3(0, 5, 20);
        cameraOffset.applyQuaternion(this.player.mesh.quaternion);
        
        this.camera.position.set(
            playerPos.x + cameraOffset.x,
            playerPos.y + cameraOffset.y,
            playerPos.z + cameraOffset.z
        );
        
        // Look at player's ship
        this.camera.lookAt(
            playerPos.x,
            playerPos.y,
            playerPos.z
        );
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isLoading) return;
        
        // Handle player controls
        this.handlePlayerControls();
        
        // Update player
        this.player.update();
        
        // Update camera
        this.updateCamera();
        
        // Update planets
        this.planets.forEach(planet => {
            planet.update();
        });
        
        // Check mission progress
        this.missionSystem.checkMissionProgress();
        
        // Check for collisions
        const collidedObject = this.player.checkCollision(this.planets);
        if (collidedObject) {
            // Handle collision
            this.player.takeDamage(10);
            
            // Bounce back
            this.player.velocity.x *= -0.5;
            this.player.velocity.y *= -0.5;
            this.player.velocity.z *= -0.5;
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    getAllPlanets() {
        return this.planets;
    }
    
    getPlanetById(id) {
        return this.planets.find(planet => planet.id === id);
    }
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
