// Canvas elements
const imageCanvas = document.getElementById('imageCanvas');
const houghCanvas = document.getElementById('houghCanvas');
const imageCtx = imageCanvas.getContext('2d');
const houghCtx = houghCanvas.getContext('2d');

// Buttons and controls
const drawImageBtn = document.getElementById('drawImageBtn');
const drawHoughBtn = document.getElementById('drawHoughBtn');
const clearImageBtn = document.getElementById('clearImageBtn');
const clearHoughBtn = document.getElementById('clearHoughBtn');
const houghTypeRadios = document.querySelectorAll('input[name="houghType"]');

// State variables
let currentCanvas = 'image'; // 'image' or 'hough'
let currentHoughType = 'rhoTheta'; // 'rhoTheta' or 'mc'
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Canvas dimensions
const imageWidth = imageCanvas.width;
const imageHeight = imageCanvas.height;
const houghWidth = houghCanvas.width;
const houghHeight = houghCanvas.height;

// Hough transform settings - ρ-θ space
const thetaResolution = 180; // Number of theta values (0-180 degrees)
const rhoResolution = Math.ceil(Math.sqrt(imageWidth*imageWidth + imageHeight*imageHeight)); // Maximum distance possible
const houghSpaceRhoTheta = new Array(thetaResolution).fill(0).map(() => new Array(rhoResolution).fill(0));

// Hough transform settings - m-c space (y = mx + c)
const mResolution = 200; // Resolution for slope m
const cResolution = 400; // Resolution for intercept c
const mRange = 5; // m ranges from -mRange to mRange
const cRange = 300; // c ranges from -cRange to cRange
const houghSpaceMC = new Array(mResolution).fill(0).map(() => new Array(cResolution).fill(0));

// Initialize canvases
initializeCanvases();

function initializeCanvases() {
    // Image canvas setup
    imageCtx.fillStyle = 'white';
    imageCtx.fillRect(0, 0, imageWidth, imageHeight);
    drawGridLines(imageCtx, imageWidth, imageHeight);
    
    // Hough canvas setup
    updateHoughCanvas();
    
    // Clear hough space data
    for (let i = 0; i < thetaResolution; i++) {
        for (let j = 0; j < rhoResolution; j++) {
            houghSpaceRhoTheta[i][j] = 0;
        }
    }
    
    for (let i = 0; i < mResolution; i++) {
        for (let j = 0; j < cResolution; j++) {
            houghSpaceMC[i][j] = 0;
        }
    }
}

function drawGridLines(ctx, width, height) {
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    
    // Draw grid lines
    for (let i = 0; i <= width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    
    for (let j = 0; j <= height; j += 50) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    
    // x-axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // y-axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
}

function drawHoughSpaceGridRhoTheta(ctx, width, height) {
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    
    // Draw grid lines
    for (let i = 0; i <= width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    
    for (let j = 0; j <= height; j += 50) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
    }
    
    // Label the axes
    ctx.fillStyle = '#888';
    ctx.font = '12px Arial';
    ctx.fillText('θ (0° to 180°)', width / 2, height - 5);
    
    // Rotate and draw the ρ axis label
    ctx.save();
    ctx.translate(5, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('ρ (distance from origin)', 0, 0);
    ctx.restore();
}

function drawHoughSpaceGridMC(ctx, width, height) {
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    
    // Draw grid lines
    for (let i = 0; i <= width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    
    for (let j = 0; j <= height; j += 50) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    
    // Center axes
    const centerX = width / 2;
    const centerY = height / 2;
    
    // x-axis (m)
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // y-axis (c)
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // Label the axes
    ctx.fillStyle = '#888';
    ctx.font = '12px Arial';
    ctx.fillText('m (slope)', width / 2, height - 5);
    
    // Rotate and draw the c axis label
    ctx.save();
    ctx.translate(5, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('c (y-intercept)', 0, 0);
    ctx.restore();
}

// Drawing event listeners
imageCanvas.addEventListener('mousedown', startDrawing);
imageCanvas.addEventListener('mousemove', draw);
imageCanvas.addEventListener('mouseup', stopDrawing);
imageCanvas.addEventListener('mouseout', stopDrawing);

houghCanvas.addEventListener('mousedown', startDrawing);
houghCanvas.addEventListener('mousemove', draw);
houghCanvas.addEventListener('mouseup', stopDrawing);
houghCanvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    // Only allow drawing on the active canvas
    if ((currentCanvas === 'image' && e.target === imageCanvas) || 
        (currentCanvas === 'hough' && e.target === houghCanvas)) {
        
        const rect = e.target.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        isDrawing = true;
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentCanvas === 'image' && e.target === imageCanvas) {
        // Draw in image space
        imageCtx.strokeStyle = 'black';
        imageCtx.lineWidth = 3;
        imageCtx.lineCap = 'round';
        
        imageCtx.beginPath();
        imageCtx.moveTo(lastX, lastY);
        imageCtx.lineTo(x, y);
        imageCtx.stroke();
        
        // Calculate Hough transform for the line segment
        calculateHoughTransform(lastX, lastY, x, y);
        updateHoughCanvas();
    } 
    else if (currentCanvas === 'hough' && e.target === houghCanvas) {
        // Draw in Hough space
        if (currentHoughType === 'rhoTheta') {
            const thetaIndex = Math.floor((x / houghWidth) * thetaResolution);
            const rhoIndex = Math.floor((y / houghHeight) * rhoResolution);
            
            if (thetaIndex >= 0 && thetaIndex < thetaResolution && 
                rhoIndex >= 0 && rhoIndex < rhoResolution) {
                
                houghCtx.fillStyle = 'rgba(0, 0, 255, 0.7)';
                houghCtx.beginPath();
                houghCtx.arc(x, y, 5, 0, Math.PI * 2);
                houghCtx.fill();
                
                // Update hough space
                houghSpaceRhoTheta[thetaIndex][rhoIndex] = 1;
                
                // Calculate inverse Hough transform from rho-theta
                calculateInverseHoughTransformRhoTheta(thetaIndex, rhoIndex);
            }
        } 
        else if (currentHoughType === 'mc') {
            // Map canvas coordinates to m-c parameter space
            const mIndex = Math.floor((x / houghWidth) * mResolution);
            const cIndex = Math.floor((y / houghHeight) * cResolution);
            
            if (mIndex >= 0 && mIndex < mResolution && 
                cIndex >= 0 && cIndex < cResolution) {
                
                houghCtx.fillStyle = 'rgba(0, 0, 255, 0.7)';
                houghCtx.beginPath();
                houghCtx.arc(x, y, 5, 0, Math.PI * 2);
                houghCtx.fill();
                
                // Update hough space
                houghSpaceMC[mIndex][cIndex] = 1;
                
                // Calculate inverse Hough transform from m-c
                calculateInverseHoughTransformMC(mIndex, cIndex);
            }
        }
    }
    
    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

function calculateHoughTransform(x1, y1, x2, y2) {
    // Generate points along the line for a more complete transform
    const points = generatePointsOnLine(x1, y1, x2, y2);
    
    // For each point, calculate the Hough transform
    for (const point of points) {
        // Convert to centered coordinates
        const xCentered = point.x - imageWidth / 2;
        const yCentered = imageHeight / 2 - point.y; // Flip y-axis
        
        // Calculate rho-theta transform
        for (let thetaIdx = 0; thetaIdx < thetaResolution; thetaIdx++) {
            const theta = (thetaIdx / thetaResolution) * Math.PI; // 0 to π
            
            // Calculate rho = x*cos(theta) + y*sin(theta)
            const rho = xCentered * Math.cos(theta) + yCentered * Math.sin(theta);
            
            // Map rho to rhoIndex (centered at half height)
            const rhoIdx = Math.floor((rho + rhoResolution/2) / rhoResolution * houghHeight);
            
            if (rhoIdx >= 0 && rhoIdx < houghHeight) {
                houghSpaceRhoTheta[thetaIdx][rhoIdx] += 1;
            }
        }
        
        // Calculate m-c transform for non-vertical lines
        // For each point, all possible lines through it are y = mx + c
        // This gives c = y - mx
        for (let mIdx = 0; mIdx < mResolution; mIdx++) {
            // Map mIdx to actual m value (slope)
            const m = ((mIdx / mResolution) * (2 * mRange)) - mRange;
            
            // Calculate c = y - mx
            const c = yCentered - (m * xCentered);
            
            // Map c to cIndex (centered)
            const cIdx = Math.floor(((c + cRange) / (2 * cRange)) * cResolution);
            
            if (cIdx >= 0 && cIdx < cResolution) {
                houghSpaceMC[mIdx][cIdx] += 1;
            }
        }
    }
}

function generatePointsOnLine(x1, y1, x2, y2) {
    const points = [];
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
        points.push({x: x1, y: y1});
        
        if (x1 === x2 && y1 === y2) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            if (x1 === x2) break;
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            if (y1 === y2) break;
            err += dx;
            y1 += sy;
        }
    }
    
    return points;
}

function updateHoughCanvas() {
    // Clear the Hough canvas
    houghCtx.fillStyle = 'white';
    houghCtx.fillRect(0, 0, houghWidth, houghHeight);
    
    if (currentHoughType === 'rhoTheta') {
        drawHoughSpaceGridRhoTheta(houghCtx, houghWidth, houghHeight);
        
        // Find the maximum value in the Hough space for normalization
        let maxVal = 1;
        for (let i = 0; i < thetaResolution; i++) {
            for (let j = 0; j < rhoResolution; j++) {
                if (houghSpaceRhoTheta[i][j] > maxVal) {
                    maxVal = houghSpaceRhoTheta[i][j];
                }
            }
        }
        
        // Draw the Hough space for rho-theta
        for (let thetaIdx = 0; thetaIdx < thetaResolution; thetaIdx++) {
            const x = (thetaIdx / thetaResolution) * houghWidth;
            
            for (let rhoIdx = 0; rhoIdx < rhoResolution; rhoIdx++) {
                const value = houghSpaceRhoTheta[thetaIdx][rhoIdx];
                
                if (value > 0) {
                    const y = (rhoIdx / rhoResolution) * houghHeight;
                    const intensity = Math.min(value / maxVal, 1);
                    
                    // Draw with varying intensity
                    houghCtx.fillStyle = `rgba(0, 0, 255, ${intensity * 0.7})`;
                    houghCtx.beginPath();
                    houghCtx.arc(x, y, 2, 0, Math.PI * 2);
                    houghCtx.fill();
                }
            }
        }
    } 
    else if (currentHoughType === 'mc') {
        drawHoughSpaceGridMC(houghCtx, houghWidth, houghHeight);
        
        // Find the maximum value in the MC space for normalization
        let maxVal = 1;
        for (let i = 0; i < mResolution; i++) {
            for (let j = 0; j < cResolution; j++) {
                if (houghSpaceMC[i][j] > maxVal) {
                    maxVal = houghSpaceMC[i][j];
                }
            }
        }
        
        // Draw the Hough space for m-c
        for (let mIdx = 0; mIdx < mResolution; mIdx++) {
            const x = (mIdx / mResolution) * houghWidth;
            
            for (let cIdx = 0; cIdx < cResolution; cIdx++) {
                const value = houghSpaceMC[mIdx][cIdx];
                
                if (value > 0) {
                    const y = (cIdx / cResolution) * houghHeight;
                    const intensity = Math.min(value / maxVal, 1);
                    
                    // Draw with varying intensity
                    houghCtx.fillStyle = `rgba(0, 0, 255, ${intensity * 0.7})`;
                    houghCtx.beginPath();
                    houghCtx.arc(x, y, 2, 0, Math.PI * 2);
                    houghCtx.fill();
                }
            }
        }
    }
}

function calculateInverseHoughTransformRhoTheta(thetaIdx, rhoIdx) {
    // Map indices to actual theta and rho values
    const theta = (thetaIdx / thetaResolution) * Math.PI; // 0 to π
    const rho = ((rhoIdx / houghHeight) * rhoResolution) - (rhoResolution/2);
    
    // Clear the image canvas and redraw grid
    imageCtx.fillStyle = 'white';
    imageCtx.fillRect(0, 0, imageWidth, imageHeight);
    drawGridLines(imageCtx, imageWidth, imageHeight);
    
    // Convert from polar to Cartesian coordinates
    const cos_t = Math.cos(theta);
    const sin_t = Math.sin(theta);
    
    // We need two points to draw a line
    let x1, y1, x2, y2;
    
    // Use different strategies depending on the angle
    if (Math.abs(sin_t) > 0.01) {
        // For angles not too close to horizontal
        x1 = 0;
        y1 = (rho / sin_t) + (imageHeight / 2);
        x2 = imageWidth;
        y2 = ((rho - x2 * cos_t) / sin_t) + (imageHeight / 2);
    } else {
        // For angles close to horizontal
        y1 = 0;
        x1 = (rho / cos_t) + (imageWidth / 2);
        y2 = imageHeight;
        x2 = ((rho - y2 * sin_t) / cos_t) + (imageWidth / 2);
    }
    
    // Draw the line
    imageCtx.strokeStyle = 'blue';
    imageCtx.lineWidth = 2;
    imageCtx.beginPath();
    imageCtx.moveTo(x1, y1);
    imageCtx.lineTo(x2, y2);
    imageCtx.stroke();
}

function calculateInverseHoughTransformMC(mIdx, cIdx) {
    // Map indices to actual m and c values
    const m = ((mIdx / mResolution) * (2 * mRange)) - mRange;
    const c = ((cIdx / cResolution) * (2 * cRange)) - cRange;
    
    // Clear the image canvas and redraw grid
    imageCtx.fillStyle = 'white';
    imageCtx.fillRect(0, 0, imageWidth, imageHeight);
    drawGridLines(imageCtx, imageWidth, imageHeight);
    
    // We need two points to draw a line in the form y = mx + c
    // Convert to image coordinates (with origin at center)
    const centerX = imageWidth / 2;
    const centerY = imageHeight / 2;
    
    // Calculate two points for the line
    const x1 = 0;
    const y1 = centerY - (m * (-centerX) + c);
    const x2 = imageWidth;
    const y2 = centerY - (m * (imageWidth - centerX) + c);
    
    // Draw the line
    imageCtx.strokeStyle = 'blue';
    imageCtx.lineWidth = 2;
    imageCtx.beginPath();
    imageCtx.moveTo(x1, y1);
    imageCtx.lineTo(x2, y2);
    imageCtx.stroke();
}

// Button event listeners
drawImageBtn.addEventListener('click', () => {
    currentCanvas = 'image';
    drawImageBtn.classList.add('active');
    drawHoughBtn.classList.remove('active');
});

drawHoughBtn.addEventListener('click', () => {
    currentCanvas = 'hough';
    drawHoughBtn.classList.add('active');
    drawImageBtn.classList.remove('active');
});

clearImageBtn.addEventListener('click', () => {
    // Clear the image canvas
    imageCtx.fillStyle = 'white';
    imageCtx.fillRect(0, 0, imageWidth, imageHeight);
    drawGridLines(imageCtx, imageWidth, imageHeight);
    
    // Clear both Hough spaces
    for (let i = 0; i < thetaResolution; i++) {
        for (let j = 0; j < rhoResolution; j++) {
            houghSpaceRhoTheta[i][j] = 0;
        }
    }
    
    for (let i = 0; i < mResolution; i++) {
        for (let j = 0; j < cResolution; j++) {
            houghSpaceMC[i][j] = 0;
        }
    }
    
    updateHoughCanvas();
});

clearHoughBtn.addEventListener('click', () => {
    // Clear the Hough canvas
    houghCtx.fillStyle = 'white';
    houghCtx.fillRect(0, 0, houghWidth, houghHeight);
    
    if (currentHoughType === 'rhoTheta') {
        drawHoughSpaceGridRhoTheta(houghCtx, houghWidth, houghHeight);
        // Clear the rho-theta Hough space
        for (let i = 0; i < thetaResolution; i++) {
            for (let j = 0; j < rhoResolution; j++) {
                houghSpaceRhoTheta[i][j] = 0;
            }
        }
    } else if (currentHoughType === 'mc') {
        drawHoughSpaceGridMC(houghCtx, houghWidth, houghHeight);
        // Clear the m-c Hough space
        for (let i = 0; i < mResolution; i++) {
            for (let j = 0; j < cResolution; j++) {
                houghSpaceMC[i][j] = 0;
            }
        }
    }
    
    // Clear the image canvas too for consistency
    imageCtx.fillStyle = 'white';
    imageCtx.fillRect(0, 0, imageWidth, imageHeight);
    drawGridLines(imageCtx, imageWidth, imageHeight);
});

// Hough type radio button event listeners
houghTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentHoughType = e.target.value;
        updateHoughCanvas();
    });
});