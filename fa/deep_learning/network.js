// Neural Network Animation with Persian UI elements
class NeuralNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.neurons = [];
        this.connections = [];
        this.signals = [];
        this.animationRunning = true;
        this.resizeCanvas();
        this.createNetwork();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        if (this.neurons.length) {
            this.repositionNeurons();
        }
    }
    
    createNetwork() {
        // Define network architecture - [input, hidden1, hidden2, hidden3, output] layers
        const layers = [6, 10, 14, 10, 4];
        const layerSpacing = this.canvas.width / (layers.length);
        const verticalPadding = this.canvas.height / (Math.max(...layers) + 2);
        
        // Create neurons for each layer
        for (let i = 0; i < layers.length; i++) {
            const neuronsInLayer = layers[i];
            const x = layerSpacing * (i + 0.5);
            const layerHeight = neuronsInLayer * verticalPadding;
            
            for (let j = 0; j < neuronsInLayer; j++) {
                const y = (this.canvas.height - layerHeight) / 2 + j * verticalPadding + verticalPadding/2;
                this.neurons.push({
                    x,
                    y,
                    radius: 12,
                    layer: i,
                    index: j,
                    activity: Math.random() * 0.3,  // Initial activity
                    pulsePhase: Math.random() * Math.PI * 2,  // Random phase
                    color: this.getLayerColor(i)
                });
            }
        }
        
        // Create connections between adjacent layers
        for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
            const fromNeurons = this.neurons.filter(n => n.layer === layerIndex);
            const toNeurons = this.neurons.filter(n => n.layer === layerIndex + 1);
            
            for (const fromNeuron of fromNeurons) {
                for (const toNeuron of toNeurons) {
                    // Add some randomness to connections
                    if (Math.random() > 0.2) {  // 80% chance of connection
                        this.connections.push({
                            from: fromNeuron,
                            to: toNeuron,
                            weight: Math.random(),
                            signalTime: Math.random() * 200,  // Stagger signal animations
                            active: Math.random() > 0.3  // Some connections start active
                        });
                    }
                }
            }
        }
    }

    getLayerColor(layerIndex) {
        const colors = [
            'hsl(200, 80%, 60%)',  // Input layer - blue
            'hsl(160, 80%, 60%)',  // Hidden layer 1 - teal
            'hsl(120, 80%, 60%)',  // Hidden layer 2 - green
            'hsl(70, 80%, 60%)',   // Hidden layer 3 - lime
            'hsl(30, 80%, 60%)'    // Output layer - orange
        ];
        return colors[layerIndex % colors.length];
    }
    
    repositionNeurons() {
        // Group neurons by layer
        const layerGroups = {};
        this.neurons.forEach(n => {
            if (!layerGroups[n.layer]) layerGroups[n.layer] = [];
            layerGroups[n.layer].push(n);
        });
        
        const layerCount = Object.keys(layerGroups).length;
        const layerSpacing = this.canvas.width / layerCount;
        
        // Reposition each neuron
        Object.entries(layerGroups).forEach(([layerIndex, neurons]) => {
            const neuronsInLayer = neurons.length;
            const x = layerSpacing * (parseInt(layerIndex) + 0.5);
            const verticalPadding = this.canvas.height / (neuronsInLayer + 2);
            const layerHeight = neuronsInLayer * verticalPadding;
            
            neurons.forEach((neuron, j) => {
                neuron.x = x;
                neuron.y = (this.canvas.height - layerHeight) / 2 + j * verticalPadding + verticalPadding/2;
            });
        });
    }
    
    generateSignals() {
        // Generate signals from active connections
        if (this.connections.length && Math.random() < 0.15) {  // Adjust rate of signal generation
            const activeConnections = this.connections.filter(c => c.active);
            if (activeConnections.length) {
                const connection = activeConnections[Math.floor(Math.random() * activeConnections.length)];
                
                // Create signal
                this.signals.push({
                    connection: connection,
                    progress: 0,
                    speed: 0.01 + Math.random() * 0.02,
                    strength: 0.5 + Math.random() * 0.5
                });
                
                // Activate the source neuron
                connection.from.activity = Math.min(1.0, connection.from.activity + 0.3);
            }
        }
    }
    
    updateNeurons(time) {
        for (const neuron of this.neurons) {
            // Gradually decrease activity
            neuron.activity *= 0.99;
            
            // Update pulse phase
            neuron.pulsePhase += 0.05;
            if (neuron.pulsePhase > Math.PI * 2) neuron.pulsePhase -= Math.PI * 2;
        }
    }
    
    updateSignals() {
        for (let i = this.signals.length - 1; i >= 0; i--) {
            const signal = this.signals[i];
            signal.progress += signal.speed;
            
            // Signal reached the target neuron
            if (signal.progress >= 1) {
                // Activate the target neuron
                const toNeuron = signal.connection.to;
                toNeuron.activity = Math.min(1.0, toNeuron.activity + signal.strength * 0.5);
                
                // Remove completed signal
                this.signals.splice(i, 1);
            }
        }
    }
    
    drawNeurons() {
        for (const neuron of this.neurons) {
            const { x, y, radius, activity, pulsePhase, color } = neuron;
            const ctx = this.ctx;
            
            // Base circle
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Glow effect for active neurons
            if (activity > 0.05) {
                const glowRadius = radius + 10 * activity;
                const gradient = ctx.createRadialGradient(x, y, radius, x, y, glowRadius);
                gradient.addColorStop(0, `hsla(${neuron.layer * 40 + 180}, 100%, 50%, ${activity})`);
                gradient.addColorStop(1, `hsla(${neuron.layer * 40 + 180}, 100%, 50%, 0)`);
                
                ctx.beginPath();
                ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
            
            // Pulsing outline
            const pulseSize = Math.sin(pulsePhase) * 2 + radius;
            ctx.beginPath();
            ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + activity * 0.2})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
    
    drawConnections() {
        for (const conn of this.connections) {
            const { from, to, weight, active } = conn;
            const ctx = this.ctx;
            
            // Draw connection line
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            
            // Line style based on weight and activity
            const alpha = active ? 0.2 + weight * 0.2 : 0.05;
            ctx.strokeStyle = `rgba(200, 200, 255, ${alpha})`;
            ctx.lineWidth = active ? 1 + weight * 2 : 0.5;
            ctx.stroke();
        }
    }
    
    drawSignals() {
        for (const signal of this.signals) {
            const { connection, progress, strength } = signal;
            const { from, to } = connection;
            const ctx = this.ctx;
            
            // Calculate signal position along the connection
            const x = from.x + (to.x - from.x) * progress;
            const y = from.y + (to.y - from.y) * progress;
            
            // Draw signal
            const signalRadius = 4 + strength * 3;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, signalRadius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(x, y, signalRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }
    
    drawLabels() {
        const ctx = this.ctx;
        ctx.font = '16px Vazirmatn, Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        
        // Get neurons in first layer (input) and last layer (output)
        const inputNeurons = this.neurons.filter(n => n.layer === 0);
        const outputNeurons = this.neurons.filter(n => n.layer === Math.max(...this.neurons.map(n => n.layer)));
        
        // Label for input layer
        ctx.fillText('لایه ورودی', inputNeurons[Math.floor(inputNeurons.length/2)].x, 25);
        
        // Label for output layer
        ctx.fillText('لایه خروجی', outputNeurons[Math.floor(outputNeurons.length/2)].x, 25);
    }
    
    render(timestamp) {
        if (!this.canvas) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw network components
        this.drawConnections();
        this.drawSignals();
        this.drawNeurons();
        this.drawLabels();
        
        // Update animations
        if (this.animationRunning) {
            this.updateNeurons(timestamp);
            this.updateSignals();
            this.generateSignals();
        }
        
        // Continue animation loop
        requestAnimationFrame(this.render.bind(this));
    }
    
    reset() {
        console.log("Resetting network..."); // Debug log
        this.neurons = [];
        this.connections = [];
        this.signals = [];
        this.createNetwork();
    }
    
    toggleAnimation() {
        console.log("Animation state before toggle:", this.animationRunning); // Debug log
        this.animationRunning = !this.animationRunning;
        console.log("Animation state after toggle:", this.animationRunning); // Debug log
        return this.animationRunning;
    }
}

// Store the network instance globally to ensure it's accessible
let networkInstance;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing neural network..."); // Debug log
    
    const canvas = document.getElementById('neuralNetworkCanvas');
    if (canvas) {
        // Create network instance and store it globally
        networkInstance = new NeuralNetwork(canvas);
        
        // Start animation loop
        networkInstance.render();
        
        // Set up control buttons
        const resetButton = document.getElementById('reset');
        const toggleButton = document.getElementById('toggleAnimation');
        
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                console.log("Reset button clicked"); // Debug log
                networkInstance.reset();
            });
        } else {
            console.error("Reset button not found in the DOM");
        }
        
        if (toggleButton) {
            toggleButton.addEventListener('click', (e) => {
                console.log("Toggle button clicked"); // Debug log
                const isRunning = networkInstance.toggleAnimation();
                e.target.innerHTML = isRunning ? 
                    '<i class="fas fa-pause"></i> توقف انیمیشن' : 
                    '<i class="fas fa-play"></i> شروع انیمیشن';
            });
        } else {
            console.error("Toggle button not found in the DOM");
        }
    } else {
        console.error("Canvas element not found in the DOM");
    }
});