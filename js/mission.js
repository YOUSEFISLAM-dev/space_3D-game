/**
 * Mission system for the Space Adventure game
 */

class MissionSystem {
    constructor(game) {
        this.game = game;
        this.currentMission = null;
        this.completedMissions = [];
        this.availableMissions = [];
        this.missionTypes = [
            'exploration',
            'resource-collection',
            'rescue',
            'research',
            'delivery'
        ];
    }
    
    initialize() {
        // Generate initial available missions
        this.generateMissions(3);
    }
    
    generateMissions(count) {
        for (let i = 0; i < count; i++) {
            const missionType = this.missionTypes[getRandomInt(0, this.missionTypes.length - 1)];
            const mission = this.createMission(missionType);
            this.availableMissions.push(mission);
        }
    }
    
    createMission(type) {
        const id = generateUUID();
        const difficulty = getRandomInt(1, 5);
        const reward = difficulty * 100 + getRandomInt(50, 150);
        
        let title, description, objective, targetPlanet, resources;
        
        // Get a random planet from the galaxy
        const allPlanets = this.game.getAllPlanets();
        targetPlanet = allPlanets[getRandomInt(0, allPlanets.length - 1)];
        
        switch(type) {
            case 'exploration':
                title = `Explore ${targetPlanet.name}`;
                description = `Travel to and scan the uncharted planet ${targetPlanet.name} in the ${targetPlanet.parentStar} system.`;
                objective = 'Reach the target planet and perform a complete scan.';
                break;
                
            case 'resource-collection':
                resources = ['minerals', 'gases', 'water', 'organics', 'energy'];
                const resource = resources[getRandomInt(0, resources.length - 1)];
                const amount = getRandomInt(10, 50);
                
                title = `Collect ${resource} from ${targetPlanet.name}`;
                description = `Collect ${amount} units of ${resource} from ${targetPlanet.name} in the ${targetPlanet.parentStar} system.`;
                objective = `Land on the planet and mine ${amount} units of ${resource}.`;
                break;
                
            case 'rescue':
                title = `Rescue mission to ${targetPlanet.name}`;
                description = `A research team is stranded on ${targetPlanet.name}. Their ship is damaged and they need immediate evacuation.`;
                objective = 'Land on the planet and rescue the research team.';
                break;
                
            case 'research':
                title = `Research ${targetPlanet.type} phenomena on ${targetPlanet.name}`;
                description = `Scientists have detected unusual ${targetPlanet.type} activity on ${targetPlanet.name}. Collect data for their research.`;
                objective = 'Travel to the planet and collect research data on the phenomena.';
                break;
                
            case 'delivery':
                const destinationPlanet = allPlanets[getRandomInt(0, allPlanets.length - 1)];
                
                title = `Deliver supplies to ${destinationPlanet.name}`;
                description = `Transport essential supplies from your current location to ${destinationPlanet.name} in the ${destinationPlanet.parentStar} system.`;
                objective = 'Navigate to the destination planet and deliver the supplies.';
                targetPlanet = destinationPlanet;
                break;
        }
        
        return {
            id,
            type,
            title,
            description,
            objective,
            targetPlanet: targetPlanet.id,
            targetPlanetName: targetPlanet.name,
            targetSystem: targetPlanet.parentStar,
            difficulty,
            reward,
            status: 'available',
            progress: 0
        };
    }
    
    acceptMission(missionId) {
        const missionIndex = this.availableMissions.findIndex(m => m.id === missionId);
        
        if (missionIndex !== -1) {
            const mission = this.availableMissions[missionIndex];
            this.currentMission = mission;
            this.currentMission.status = 'active';
            
            // Remove from available missions
            this.availableMissions.splice(missionIndex, 1);
            
            // Update UI
            this.updateMissionUI();
            
            showNotification(`Mission accepted: ${mission.title}`, 3000);
            return true;
        }
        
        return false;
    }
    
    completeMission() {
        if (!this.currentMission) return false;
        
        this.currentMission.status = 'completed';
        this.completedMissions.push(this.currentMission);
        
        // Add reward (could be fuel, shield, or other resources)
        this.game.player.refuel(30);
        this.game.player.repairShield(30);
        
        showNotification(`Mission completed! Reward: Fuel +30%, Shield +30%`, 5000);
        
        // Generate a new mission to replace the completed one
        this.generateMissions(1);
        
        // Clear current mission
        this.currentMission = null;
        
        // Update UI
        this.updateMissionUI();
        
        return true;
    }
    
    abandonMission() {
        if (!this.currentMission) return false;
        
        this.currentMission.status = 'abandoned';
        this.availableMissions.push(this.currentMission);
        
        showNotification(`Mission abandoned: ${this.currentMission.title}`, 3000);
        
        // Clear current mission
        this.currentMission = null;
        
        // Update UI
        this.updateMissionUI();
        
        return true;
    }
    
    updateMissionProgress(progress) {
        if (!this.currentMission) return;
        
        this.currentMission.progress = progress;
        
        // If progress reaches 100%, complete the mission
        if (progress >= 100) {
            this.completeMission();
        }
        
        // Update UI
        this.updateMissionUI();
    }
    
    checkMissionProgress() {
        if (!this.currentMission) return;
        
        // Check if player is near the target planet
        const targetPlanet = this.game.getPlanetById(this.currentMission.targetPlanet);
        if (!targetPlanet) return;
        
        const playerPosition = this.game.player.getPosition();
        const planetPosition = targetPlanet.position;
        
        const dist = distance(playerPosition, planetPosition);
        
        // If player is close to the planet, increase progress
        if (dist < targetPlanet.radius * 5) {
            // Update progress based on proximity (closer = faster progress)
            const proximityFactor = 1 - (dist / (targetPlanet.radius * 5));
            const progressIncrease = proximityFactor * 0.5; // Adjust for desired speed
            
            this.updateMissionProgress(this.currentMission.progress + progressIncrease);
            
            // Display target planet info when very close
            if (dist < targetPlanet.radius * 2) {
                targetPlanet.showInfoPanel();
            }
        }
    }
    
    updateMissionUI() {
        const missionInfoElement = document.getElementById('mission-info');
        const currentMissionElement = document.getElementById('current-mission');
        const missionObjectiveElement = document.getElementById('mission-objective');
        
        if (this.currentMission) {
            currentMissionElement.textContent = this.currentMission.title;
            missionObjectiveElement.textContent = `${this.currentMission.objective} (${Math.floor(this.currentMission.progress)}%)`;
            
            // Add progress bar if it doesn't exist
            let progressBar = document.getElementById('mission-progress');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.id = 'mission-progress';
                progressBar.style.width = '100%';
                progressBar.style.height = '10px';
                progressBar.style.backgroundColor = '#333';
                progressBar.style.marginTop = '10px';
                progressBar.style.borderRadius = '5px';
                progressBar.style.overflow = 'hidden';
                
                const progressFill = document.createElement('div');
                progressFill.id = 'mission-progress-fill';
                progressFill.style.width = '0%';
                progressFill.style.height = '100%';
                progressFill.style.backgroundColor = '#30cfd0';
                progressFill.style.transition = 'width 0.3s';
                
                progressBar.appendChild(progressFill);
                missionInfoElement.appendChild(progressBar);
            }
            
            // Update progress bar
            const progressFill = document.getElementById('mission-progress-fill');
            progressFill.style.width = `${this.currentMission.progress}%`;
        } else {
            currentMissionElement.textContent = 'No active mission';
            missionObjectiveElement.textContent = 'Visit a planet to find new missions';
            
            // Remove progress bar if it exists
            const progressBar = document.getElementById('mission-progress');
            if (progressBar) {
                progressBar.remove();
            }
        }
    }
    
    showAvailableMissions() {
        // Create missions panel
        let missionsPanel = document.getElementById('available-missions');
        if (!missionsPanel) {
            missionsPanel = document.createElement('div');
            missionsPanel.id = 'available-missions';
            missionsPanel.className = 'panel';
            missionsPanel.style.position = 'absolute';
            missionsPanel.style.left = '50%';
            missionsPanel.style.top = '50%';
            missionsPanel.style.transform = 'translate(-50%, -50%)';
            missionsPanel.style.width = '400px';
            missionsPanel.style.maxHeight = '80vh';
            missionsPanel.style.zIndex = '1000';
            document.body.appendChild(missionsPanel);
        }
        
        // Generate HTML for missions
        let missionsHTML = `<h2>Available Missions</h2>`;
        
        if (this.availableMissions.length === 0) {
            missionsHTML += `<p>No missions available. Explore more of the galaxy!</p>`;
        } else {
            this.availableMissions.forEach(mission => {
                missionsHTML += `
                    <div class="mission-item">
                        <h3>${mission.title}</h3>
                        <p>${mission.description}</p>
                        <p><strong>Objective:</strong> ${mission.objective}</p>
                        <p><strong>Difficulty:</strong> ${'★'.repeat(mission.difficulty)}</p>
                        <button class="accept-mission" data-mission-id="${mission.id}">Accept Mission</button>
                    </div>
                    <hr>
                `;
            });
        }
        
        // Add a close button
        missionsHTML += `<button id="close-missions">Close</button>`;
        
        // Set panel content
        missionsPanel.innerHTML = missionsHTML;
        
        // Add event listeners to buttons
        document.querySelectorAll('.accept-mission').forEach(button => {
            button.addEventListener('click', (e) => {
                const missionId = e.target.getAttribute('data-mission-id');
                this.acceptMission(missionId);
                missionsPanel.style.display = 'none';
            });
        });
        
        document.getElementById('close-missions').addEventListener('click', () => {
            missionsPanel.style.display = 'none';
        });
        
        // Show panel
        missionsPanel.style.display = 'block';
    }
}
