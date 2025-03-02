// Neural Network Animation
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
        // Define network architecture - [input, hidden1, hidden2, output] layers
        const layers = [5, 8, 12, 8, 3];
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
                    connection