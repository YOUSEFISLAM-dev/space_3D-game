/**
 * Player's spaceship class
 */

class Spaceship {
    constructor(scene) {
        this.scene = scene;
        this.speed = 0;
        this.maxSpeed = 10;
        this.acceleration = 0.1;
        this.deceleration = 0.05;
        this.rotationSpeed = 0.02;
        this.mesh = null;
        this.fuel = 100;
        this.shield = 100;
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.direction = new THREE.Vector3(0, 0, -1);
        this.fuelConsumptionRate = 0.05;
        
        this.init();
    }
    
    init() {
        // Create a simple spaceship mesh for now
        const geometry = new THREE.ConeGeometry(2, 6, 8);
        geometry.rotateX(Math.PI / 2);
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x3399FF,
            emissive: 0x112244,
            shininess: 100
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Add wings
        const wingGeometry = new THREE.BoxGeometry(8, 0.5, 3);
        const wingMaterial = new THREE.MeshPhongMaterial({
            color: 0x2277DD,
            emissive: 0x112244
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(0, 0, -1);
        this.mesh.add(leftWing);
        
        // Add engine glow
        const engineGlow = new THREE.PointLight(0x00ffff, 1, 10);
        engineGlow.position.set(0, 0, 3);
        this.mesh.add(engineGlow);
        
        // Add cockpit
        const cockpitGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const cockpitMaterial = new THREE.MeshPhongMaterial({
            color: 0x8888ff,
            emissive: 0x222244,
            transparent: true,
            opacity: 0.7
        });
        
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 0.8, -1.5);
        this.mesh.add(cockpit);
        
        this.scene.add(this.mesh);
        
        // Initialize position
        this.setPosition(0, 0, 0);
    }
    
    update() {
        // Update position based on velocity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;
        
        // Update mesh position
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        
        // Consume fuel when moving
        if (this.speed > 0) {
            this.consumeFuel();
        }
        
        // Naturally slow down over time (space friction, for gameplay purposes)
        if (this.speed > 0) {
            this.speed -= this.deceleration;
            if (this.speed < 0) this.speed = 0;
            
            // Update velocity based on direction and speed
            this.velocity.x = this.direction.x * this.speed;
            this.velocity.y = this.direction.y * this.speed;
            this.velocity.z = this.direction.z * this.speed;
        }
        
        // Update UI
        this.updateUI();
    }
    
    accelerate() {
        if (this.fuel <= 0) {
            showNotification("Out of fuel!", 3000);
            return;
        }
        
        this.speed += this.acceleration;
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        
        // Update velocity based on direction and speed
        this.velocity.x = this.direction.x * this.speed;
        this.velocity.y = this.direction.y * this.speed;
        this.velocity.z = this.direction.z * this.speed;
    }
    
    decelerate() {
        this.speed -= this.acceleration * 2;
        if (this.speed < 0) {
            this.speed = 0;
        }
        
        // Update velocity based on direction and speed
        this.velocity.x = this.direction.x * this.speed;
        this.velocity.y = this.direction.y * this.speed;
        this.velocity.z = this.direction.z * this.speed;
    }
    
    rotateLeft() {
        this.mesh.rotateY(this.rotationSpeed);
        
        // Update direction vector
        this.direction = new THREE.Vector3(0, 0, -1);
        this.direction.applyQuaternion(this.mesh.quaternion);
    }
    
    rotateRight() {
        this.mesh.rotateY(-this.rotationSpeed);
        
        // Update direction vector
        this.direction = new THREE.Vector3(0, 0, -1);
        this.direction.applyQuaternion(this.mesh.quaternion);
    }
    
    pitchUp() {
        this.mesh.rotateX(-this.rotationSpeed);
        
        // Update direction vector
        this.direction = new THREE.Vector3(0, 0, -1);
        this.direction.applyQuaternion(this.mesh.quaternion);
    }
    
    pitchDown() {
        this.mesh.rotateX(this.rotationSpeed);
        
        // Update direction vector
        this.direction = new THREE.Vector3(0, 0, -1);
        this.direction.applyQuaternion(this.mesh.quaternion);
    }
    
    setPosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.mesh.position.set(x, y, z);
    }
    
    getPosition() {
        return this.position;
    }
    
    consumeFuel() {
        this.fuel -= this.fuelConsumptionRate * this.speed;
        if (this.fuel < 0) this.fuel = 0;
    }
    
    refuel(amount) {
        this.fuel += amount;
        if (this.fuel > 100) this.fuel = 100;
        showNotification(`Refueled: +${amount.toFixed(1)}%`, 2000);
    }
    
    repairShield(amount) {
        this.shield += amount;
        if (this.shield > 100) this.shield = 100;
        showNotification(`Shield repaired: +${amount.toFixed(1)}%`, 2000);
    }
    
    takeDamage(amount) {
        this.shield -= amount;
        if (this.shield < 0) this.shield = 0;
        
        if (this.shield <= 0) {
            showNotification("WARNING: Shield depleted!", 3000);
        } else if (this.shield < 30) {
            showNotification("WARNING: Shield critical!", 3000);
        }
    }
    
    updateUI() {
        // Update UI elements with current values
        document.getElementById('fuel-level').textContent = this.fuel.toFixed(1);
        document.getElementById('shield-level').textContent = this.shield.toFixed(1);
    }
    
    // Check collision with other objects
    checkCollision(objects) {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            const objectPosition = object.position;
            const objectRadius = object.radius || 5; // Default radius if not defined
            
            const dist = distance(this.position, objectPosition);
            
            // If distance is less than the sum of radii, collision occurred
            if (dist < objectRadius + 2) { // Using 2 as spaceship radius
                return object;
            }
        }
        return null;
    }
}
