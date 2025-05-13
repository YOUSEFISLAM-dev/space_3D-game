/**
 * Utility functions for the Space Adventure game
 */

// Random number generation
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Color generation for planets
function getRandomColor() {
    const colors = [
        0x1a2b3c, 0x3c2b1a, 0x2b3c1a, 0x1a3c2b,
        0x3c1a2b, 0x2b1a3c, 0x7a8b9c, 0x9c8b7a
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Calculate distance between two 3D points
function distance(point1, point2) {
    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) +
        Math.pow(point2.y - point1.y, 2) +
        Math.pow(point2.z - point1.z, 2)
    );
}

// Convert degrees to radians
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Generate a unique ID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Limit a value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Lerp (Linear interpolation)
function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
}

// Show a notification to the player
function showNotification(message, duration = 3000) {
    // Check if notification element exists, if not create it
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'absolute';
        notification.style.bottom = '50px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0,0,0,0.8)';
        notification.style.color = '#fff';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(notification);
    }

    // Update message and show notification
    notification.textContent = message;
    notification.style.opacity = '1';

    // Hide notification after duration
    setTimeout(() => {
        notification.style.opacity = '0';
    }, duration);
}
