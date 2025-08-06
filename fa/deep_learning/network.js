// Neural Network Animation with Persian UI elements & MNIST Learning
class NeuralNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.neurons = [];
        this.connections = [];
        this.signals = [];
        this.animationRunning = true;
        this.learningMode = false;
        this.mnistMode = false;
        
        // Learning parameters
        this.learningRate = 0.01;
        this.currentEpoch = 0;
        this.maxEpochs = 10;
        this.batchSize = 10;
        this.currentBatch = 0;
        this.currentExample = 0;
        this.trainingData = [];
        this.testData = [];
        this.accuracy = 0;
        this.loss = 0;
        
        // Initialize the network
        this.resizeCanvas();
        this.createNetwork();
        this.loadMnistData();
        
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
        // Define network architecture for MNIST: [input(784), hidden(128), hidden(64), output(10)]
        const layers = this.mnistMode ? [784, 128, 64, 10] : [6, 10, 14, 10, 4];
        
        // Use smaller visual representation for MNIST (too many input neurons otherwise)
        const displayLayers = this.mnistMode ? [20, 12, 8, 10] : [6, 10, 14, 10, 4];
        
        const layerSpacing = this.canvas.width / (displayLayers.length);
        const verticalPadding = this.canvas.height / (Math.max(...displayLayers) + 2);
        
        // Create neurons for each layer
        for (let i = 0; i < displayLayers.length; i++) {
            const neuronsInLayer = displayLayers[i];
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
                    activity: 0,  // Start with no activity
                    pulsePhase: Math.random() * Math.PI * 2,  // Random phase
                    color: this.getLayerColor(i),
                    // For MNIST mode, we map multiple logical neurons to single display neuron
                    logicalIndices: this.mnistMode && i === 0 ? 
                        this.getMnistInputIndices(j, displayLayers[0], layers[0]) : [j]
                });
            }
        }
        
        // Create connections between adjacent layers
        for (let layerIndex = 0; layerIndex < displayLayers.length - 1; layerIndex++) {
            const fromNeurons = this.neurons.filter(n => n.layer === layerIndex);
            const toNeurons = this.neurons.filter(n => n.layer === layerIndex + 1);
            
            for (const fromNeuron of fromNeurons) {
                for (const toNeuron of toNeurons) {
                    // In learning mode, all neurons are connected
                    if (!this.learningMode && Math.random() > 0.2) {  // 80% connection chance in animation mode
                        this.connections.push({
                            from: fromNeuron,
                            to: toNeuron,
                            weight: (Math.random() * 2 - 1) * 0.1, // Small random weight
                            signalTime: Math.random() * 200,  // Stagger signal animations
                            active: Math.random() > 0.3,  // Some connections start active
                            // Track gradient for learning
                            gradient: 0
                        });
                    } else if (this.learningMode) {
                        this.connections.push({
                            from: fromNeuron,
                            to: toNeuron,
                            weight: (Math.random() * 2 - 1) * 0.1, // Small random weight
                            active: true,  // All connections active in learning mode
                            // Track gradient for learning
                            gradient: 0
                        });
                    }
                }
            }
        }
    }
    
    // For MNIST input, map multiple logical neurons to a single display neuron
    getMnistInputIndices(displayIndex, displayCount, logicalCount) {
        const indicesPerDisplayNeuron = Math.floor(logicalCount / displayCount);
        const start = displayIndex * indicesPerDisplayNeuron;
        const indices = [];
        for (let i = 0; i < indicesPerDisplayNeuron; i++) {
            if (start + i < logicalCount) {
                indices.push(start + i);
            }
        }
        return indices;
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
    
    // Load simplified MNIST data
    loadMnistData() {
        // Simplified MNIST data - we'll load a small subset
        // In a real app, you'd load from an API or file
        this.trainingData = this.generateSimplifiedMnistData(100);  // 100 training examples
        this.testData = this.generateSimplifiedMnistData(20);      // 20 test examples
        console.log(`Loaded ${this.trainingData.length} training examples and ${this.testData.length} test examples`);
    }
    
    // Generate simplified MNIST-like data
    generateSimplifiedMnistData(count) {
        const data = [];
        
        // Templates for each digit (highly simplified 4x4 representations)
        const digitTemplates = [
            // 0: circle shape
            [0,1,1,0, 1,0,0,1, 1,0,0,1, 0,1,1,0],
            // 1: vertical line
            [0,1,0,0, 0,1,0,0, 0,1,0,0, 0,1,0,0],
            // 2: top, right, middle, left, bottom
            [1,1,1,0, 0,0,1,0, 0,1,0,0, 1,0,0,0, 1,1,1,1],
            // 3: top, right, middle, right, bottom
            [1,1,1,0, 0,0,1,0, 0,1,1,0, 0,0,1,0, 1,1,1,0],
            // 4: left, right, middle, right
            [1,0,1,0, 1,0,1,0, 1,1,1,1, 0,0,1,0],
            // 5: top, left, middle, right, bottom
            [1,1,1,1, 1,0,0,0, 1,1,1,0, 0,0,1,0, 1,1,1,0],
            // 6: vertical stroke, horizontal strokes
            [0,1,1,1, 1,0,0,0, 1,1,1,0, 1,0,1,0, 0,1,1,0],
            // 7: top horizontal, right diagonal
            [1,1,1,1, 0,0,1,0, 0,1,0,0, 1,0,0,0],
            // 8: two circles
            [0,1,1,0, 1,0,1,0, 0,1,1,0, 1,0,1,0, 0,1,1,0],
            // 9: circle and a tail
            [0,1,1,0, 1,0,1,0, 0,1,1,0, 0,0,1,0, 0,1,0,0]
        ];
        
        for (let i = 0; i < count; i++) {
            // Pick a random digit
            const label = Math.floor(Math.random() * 10);
            const template = digitTemplates[label];
            
            // Create a 28x28 image (simplified)
            const pixels = new Array(28 * 28).fill(0);
            
            // Randomly position the template (with padding)
            const padX = Math.floor(Math.random() * 10) + 5;
            const padY = Math.floor(Math.random() * 10) + 5;
            
            // Template is conceptually a small grid (e.g. 4x5 for some digits)
            // We need to map it to our 28x28 grid
            const templateWidth = 4;  // All templates are 4 wide
            let templateHeight = template.length / templateWidth;
            
            for (let y = 0; y < templateHeight; y++) {
                for (let x = 0; x < templateWidth; x++) {
                    const value = template[y * templateWidth + x];
                    if (value > 0) {
                        // Map template coordinates to image coordinates with some randomness
                        const imgX = padX + x * 4 + Math.floor(Math.random() * 2);
                        const imgY = padY + y * 4 + Math.floor(Math.random() * 2);
                        
                        // Set pixel and surrounding pixels for thickness
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                const nx = imgX + dx;
                                const ny = imgY + dy;
                                if (nx >= 0 && nx < 28 && ny >= 0 && ny < 28) {
                                    // Add some noise
                                    pixels[ny * 28 + nx] = 0.8 + Math.random() * 0.2;
                                }
                            }
                        }
                    }
                }
            }
            
            // Add some random noise to the image
            for (let j = 0; j < pixels.length; j++) {
                if (pixels[j] === 0 && Math.random() < 0.01) {
                    pixels[j] = Math.random() * 0.3;  // Low-intensity noise
                }
            }
            
            // Create one-hot encoded target
            const target = new Array(10).fill(0);
            target[label] = 1;
            
            data.push({
                input: pixels,
                output: target,
                label: label
            });
        }
        
        return data;
    }
    
    // Perform one training step
    trainStep() {
        if (this.currentEpoch >= this.maxEpochs) {
            console.log("Training complete!");
            return false; // Training finished
        }
        
        // Get current example
        const example = this.trainingData[this.currentExample];
        
        // Forward pass
        const prediction = this.forward(example.input);
        
        // Calculate loss (mean squared error)
        let lossValue = 0;
        for (let i = 0; i < prediction.length; i++) {
            lossValue += Math.pow(prediction[i] - example.output[i], 2);
        }
        lossValue /= prediction.length;
        this.loss = 0.9 * this.loss + 0.1 * lossValue; // Smooth the loss
        
        // Backward pass to calculate gradients
        this.backward(example.output);
        
        // Update weights based on gradients
        this.updateWeights();
        
        // Update neuron activities based on the forward pass
        this.updateNeuronActivities();
        
        // Advance to next example
        this.currentExample++;
        if (this.currentExample >= this.trainingData.length) {
            this.currentExample = 0;
            this.currentEpoch++;
            
            // Calculate accuracy on test set
            this.evaluateTestAccuracy();
            
            console.log(`Epoch ${this.currentEpoch}/${this.maxEpochs} complete. Loss: ${this.loss.toFixed(4)}, Accuracy: ${(this.accuracy * 100).toFixed(2)}%`);
        }
        
        return true; // Training continues
    }
    
    // Forward pass through the network
    forward(input) {
        // Set input layer activities
        const inputNeurons = this.neurons.filter(n => n.layer === 0);
        for (const neuron of inputNeurons) {
            // For each input neuron, average the values from its logical indices
            let value = 0;
            for (const idx of neuron.logicalIndices) {
                value += input[idx] || 0;
            }
            value /= neuron.logicalIndices.length;
            neuron.activity = value;
            neuron.inputValue = value; // Store raw input
        }
        
        // Process each layer
        const layerCount = Math.max(...this.neurons.map(n => n.layer)) + 1;
        
        // Hidden and output layers
        for (let layer = 1; layer < layerCount; layer++) {
            const layerNeurons = this.neurons.filter(n => n.layer === layer);
            
            for (const neuron of layerNeurons) {
                // Get all connections coming into this neuron
                const incomingConnections = this.connections.filter(c => c.to === neuron);
                
                // Calculate weighted sum
                let weightedSum = 0;
                for (const conn of incomingConnections) {
                    weightedSum += conn.from.activity * conn.weight;
                }
                
                // Apply activation function (ReLU for hidden, softmax prep for output)
                if (layer < layerCount - 1) {
                    // ReLU for hidden layers
                    neuron.activity = Math.max(0, weightedSum);
                } else {
                    // Store raw output for softmax
                    neuron.rawOutput = weightedSum;
                }
            }
        }
        
        // Apply softmax to output layer
        const outputNeurons = this.neurons.filter(n => n.layer === layerCount - 1);
        
        // Find max for numerical stability
        const maxOutput = Math.max(...outputNeurons.map(n => n.rawOutput));
        
        // Calculate softmax denominator
        let sumExp = 0;
        for (const neuron of outputNeurons) {
            sumExp += Math.exp(neuron.rawOutput - maxOutput);
        }
        
        // Calculate softmax probabilities
        const outputValues = [];
        for (const neuron of outputNeurons) {
            const softmaxValue = Math.exp(neuron.rawOutput - maxOutput) / sumExp;
            neuron.activity = softmaxValue;
            outputValues.push(softmaxValue);
        }
        
        return outputValues;
    }
    
    // Backward pass to calculate gradients
    backward(target) {
        const layerCount = Math.max(...this.neurons.map(n => n.layer)) + 1;
        
        // Initialize gradients for output layer (derivative of softmax with MSE)
        const outputNeurons = this.neurons.filter(n => n.layer === layerCount - 1);
        for (let i = 0; i < outputNeurons.length; i++) {
            const neuron = outputNeurons[i];
            neuron.gradient = neuron.activity - target[i];
        }
        
        // Backpropagate through the network
        for (let layer = layerCount - 2; layer >= 0; layer--) {
            const layerNeurons = this.neurons.filter(n => n.layer === layer);
            
            for (const neuron of layerNeurons) {
                // Get all connections going out from this neuron
                const outgoingConnections = this.connections.filter(c => c.from === neuron);
                
                // Calculate gradient
                let gradient = 0;
                for (const conn of outgoingConnections) {
                    gradient += conn.to.gradient * conn.weight;
                }
                
                // Apply derivative of activation function (ReLU)
                if (neuron.activity > 0) {
                    neuron.gradient = gradient;
                } else {
                    neuron.gradient = 0;  // ReLU derivative is 0 for input <= 0
                }
            }
        }
        
        // Calculate gradients for weights
        for (const conn of this.connections) {
            conn.gradient = conn.from.activity * conn.to.gradient;
        }
    }
    
    // Update weights based on calculated gradients
    updateWeights() {
        for (const conn of this.connections) {
            // Update weight with simple gradient descent
            conn.weight -= this.learningRate * conn.gradient;
            
            // Create a visual signal showing the weight update
            if (Math.abs(conn.gradient) > 0.001) {
                this.signals.push({
                    connection: conn,
                    progress: 0,
                    speed: 0.02,
                    strength: Math.min(1, Math.abs(conn.gradient) * 10)
                });
            }
        }
    }
    
    // Update neuron activities based on input and training
    updateNeuronActivities() {
        // Activities are already set during forward pass
        // We just need to make sure they are visualized
    }
    
    // Evaluate accuracy on test set
    evaluateTestAccuracy() {
        let correct = 0;
        
        for (const example of this.testData) {
            const prediction = this.forward(example.input);
            const predictedClass = prediction.indexOf(Math.max(...prediction));
            if (predictedClass === example.label) {
                correct++;
            }
        }
        
        this.accuracy = correct / this.testData.length;
    }
    
    // Test on a random sample and visualize
    testSample() {
        const example = this.testData[Math.floor(Math.random() * this.testData.length)];
        const prediction = this.forward(example.input);
        const predictedClass = prediction.indexOf(Math.max(...prediction));
        
        console.log(`True label: ${example.label}, Predicted: ${predictedClass}`);
        console.log(`Prediction probabilities:`, prediction);
        
        // Visualize input
        this.updateNeuronActivities();
        
        // Display result information
        return {
            input: example.input,
            trueLabel: example.label,
            predicted: predictedClass,
            correct: predictedClass === example.label
        };
    }
    
    // Toggle MNIST learning mode
    toggleMnistMode() {
        this.mnistMode = !this.mnistMode;
        this.neurons = [];
        this.connections = [];
        this.signals = [];
        this.createNetwork();
        return this.mnistMode;
    }
    
    // Start training process
    startTraining() {
        this.learningMode = true;
        this.currentEpoch = 0;
        this.currentExample = 0;
        this.loss = 0;
        this.accuracy = 0;
        
        // Reset if needed
        if (!this.mnistMode) {
            this.toggleMnistMode();
        }
        
        // Begin continuous training
        this.trainContinuously();
    }
    
    // Train continuously until done
    trainContinuously() {
        if (!this.learningMode) return;
        
        const training = this.trainStep();
        if (training) {
            // Continue training with animation frames
            setTimeout(() => this.trainContinuously(), 100); // Train every 100ms for visibility
        } else {
            console.log("Training complete!");
        }
    }
    
    generateSignals() {
        // Generate signals from active connections
        if (!this.learningMode && this.connections.length && Math.random() < 0.15) {
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
        if (!this.learningMode) {
            for (const neuron of this.neurons) {
                // Gradually decrease activity
                neuron.activity *= 0.99;
                
                // Update pulse phase
                neuron.pulsePhase += 0.05;
                if (neuron.pulsePhase > Math.PI * 2) neuron.pulsePhase -= Math.PI * 2;
            }
        } else {
            // In learning mode, neurons are updated during training
            for (const neuron of this.neurons) {
                // Just update pulse phase
                neuron.pulsePhase += 0.05;
                if (neuron.pulsePhase > Math.PI * 2) neuron.pulsePhase -= Math.PI * 2;
            }
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
                if (!this.learningMode) {
                    toNeuron.activity = Math.min(1.0, toNeuron.activity + signal.strength * 0.5);
                }
                
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
            
            // For output neurons in MNIST mode, show the digit
            if (this.mnistMode && neuron.layer === this.neurons[this.neurons.length-1].layer) {
                ctx.font = '16px Vazirmatn, Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(neuron.index.toString(), x, y);
            }
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
            
            // Line style based on weight
            const weightStrength = Math.min(1, Math.abs(weight) * 3); // Normalize weight for visibility
            const alpha = (active || this.learningMode) ? 0.1 + weightStrength * 0.3 : 0.05;
            
            // Color based on weight sign
            const weightColor = weight > 0 ? '100, 200, 255' : '255, 100, 100';
            
            ctx.strokeStyle = `rgba(${weightColor}, ${alpha})`;
            ctx.lineWidth = (active || this.learningMode) ? 1 + weightStrength * 2 : 0.5;
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
            let gradientColor1, gradientColor2;
            
            if (this.learningMode) {
                // In learning mode, color reflects weight changes
                if (connection.gradient > 0) {
                    gradientColor1 = 'rgba(255, 100, 100, 0.9)'; // Red for decreasing weights
                    gradientColor2 = 'rgba(255, 50, 50, 0)';
                } else {
                    gradientColor1 = 'rgba(100, 255, 100, 0.9)'; // Green for increasing weights
                    gradientColor2 = 'rgba(50, 255, 50, 0)';
                }
            } else {
                // Default animation colors
                gradientColor1 = 'rgba(255, 255, 255, 0.9)';
                gradientColor2 = 'rgba(100, 200, 255, 0)';
            }
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, signalRadius);
            gradient.addColorStop(0, gradientColor1);
            gradient.addColorStop(1, gradientColor2);
            
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
        
        // In MNIST mode, show epoch and accuracy
        if (this.mnistMode && this.learningMode) {
            ctx.font = '14px Vazirmatn, Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.textAlign = 'left';
            ctx.fillText(`دوره: ${this.currentEpoch}/${this.maxEpochs}`, 20, 30);
            ctx.fillText(`دقت: ${(this.accuracy * 100).toFixed(1)}%`, 20, 50);
            ctx.fillText(`خطا: ${this.loss.toFixed(4)}`, 20, 70);
            
            // Show predicted digit for current example
            if (this.currentExample < this.trainingData.length) {
                const example = this.trainingData[this.currentExample];
                const outputNeurons = this.neurons.filter(n => n.layer === Math.max(...this.neurons.map(n => n.layer)));
                const predictedIndex = outputNeurons.indexOf(outputNeurons.reduce((max, n) => n.activity > max.activity ? n : max, { activity: -1 }));
                
                ctx.textAlign = 'right';
                ctx.fillText(`رقم واقعی: ${example.label}`, this.canvas.width - 20, 30);
                ctx.fillText(`پیش‌بینی: ${predictedIndex}`, this.canvas.width - 20, 50);
            }
        }
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
            
            if (!this.learningMode) {
                this.generateSignals();
            }
        }
        
        // Continue animation loop
        requestAnimationFrame(this.render.bind(this));
    }
    
    reset() {
        console.log("Resetting network...");
        this.neurons = [];
        this.connections = [];
        this.signals = [];
        this.learningMode = false;
        this.currentEpoch = 0;
        this.currentExample = 0;
        this.loss = 0;
        this.accuracy = 0;
        this.createNetwork();
    }
    
    toggleAnimation() {
        console.log("Animation state before toggle:", this.animationRunning);
        this.animationRunning = !this.animationRunning;
        console.log("Animation state after toggle:", this.animationRunning);
        return this.animationRunning;
    }
}

// Store the network instance globally to ensure it's accessible
let networkInstance;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing neural network...");
    
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
                console.log("Reset button clicked");
                networkInstance.reset();
            });
        } else {
            console.error("Reset button not found in the DOM");
        }
        
        if (toggleButton) {
            toggleButton.addEventListener('click', (e) => {
                console.log("Toggle button clicked");
                const isRunning = networkInstance.toggleAnimation();
                e.target.innerHTML = isRunning ? 
                    '<i class="fas fa-pause"></i> توقف انیمیشن' : 
                    '<i class="fas fa-play"></i> شروع انیمیشن';
            });
        } else {
            console.error("Toggle button not found in the DOM");
        }
        
        // Add MNIST mode and training controls
        const mnistButton = document.createElement('button');
        mnistButton.id = 'toggleMnist';
        mnistButton.className = 'btn primary-btn';
        mnistButton.innerHTML = '<i class="fas fa-brain"></i> حالت یادگیری MNIST';
        mnistButton.style.marginLeft = '10px';
        
        const trainButton = document.createElement('button');
        trainButton.id = 'startTraining';
        trainButton.className = 'btn secondary-btn';
        trainButton.innerHTML = '<i class="fas fa-graduation-cap"></i> شروع آموزش';
        trainButton.style.marginLeft = '10px';
        
        const testButton = document.createElement('button');
        testButton.id = 'testSample';
        testButton.className = 'btn secondary-btn';
        testButton.innerHTML = '<i class="fas fa-vial"></i> آزمایش نمونه';
        testButton.style.marginLeft = '10px';
        
        // Add buttons to controls
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.appendChild(mnistButton);
            controls.appendChild(trainButton);
            controls.appendChild(testButton);
            
            // Add event listeners to new buttons
            mnistButton.addEventListener('click', () => {
                const isMnistMode = networkInstance.toggleMnistMode();
                mnistButton.innerHTML = isMnistMode ? 
                    '<i class="fas fa-brain"></i> بازگشت به حالت عادی' : 
                    '<i class="fas fa-brain"></i> حالت یادگیری MNIST';
            });
            
            trainButton.addEventListener('click', () => {
                networkInstance.startTraining();
                trainButton.disabled = true;
                trainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال آموزش...';
            });
            
            testButton.addEventListener('click', () => {
                if (networkInstance.mnistMode) {
                    const result = networkInstance.testSample();
                    
                    // Show result in an alert or overlay
                    const resultMessage = `نتیجه آزمون:\nرقم واقعی: ${result.trueLabel}\nپیش‌بینی: ${result.predicted}\n${result.correct ? '✓ صحیح' : '✗ غلط'}`;
                    alert(resultMessage);
                } else {
                    alert('لطفاً ابتدا به حالت MNIST بروید.');
                }
            });
        }
    } else {
        console.error("Canvas element not found in the DOM");
    }
});