// Canvas elements
const imageCanvas = document.getElementById('imageCanvas');
const houghCanvas = document.getElementById('houghCanvas');
const detectionCanvas = document.getElementById('detectionCanvas');
const imageCtx = imageCanvas.getContext('2d');
const houghCtx = houghCanvas.getContext('2d');
const detectionCtx = detectionCanvas.getContext('2d');

// Buttons and controls
const drawImageBtn = document.getElementById('drawImageBtn');
const drawHoughBtn = document.getElementById('drawHoughBtn');
const clearImageBtn = document.getElementById('clearImageBtn');
const clearHoughBtn = document.getElementById('clearHoughBtn');
const detectLinesBtn = document.getElementById('detectLinesBtn');
const houghTypeRadios = document.querySelectorAll('input[name="houghType"]');
const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdValue = document.getElementById('thresholdValue');

// State variables
let currentCanvas = 'image'; // 'image' or 'hough'
let currentHoughType = 'rhoTheta'; // 'rhoTheta' or 'mc'
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let detectionThreshold = 50; // Default threshold percentage

// Keep track of points drawn in Hough space for accumulating lines
let drawnHoughPoints = []; // Will store {type: 'rhoTheta'|'mc', x: number, y: number}

// Canvas dimensions
const imageWidth = imageCanvas.width;
const imageHeight = imageCanvas.height;
const houghWidth = houghCanvas.width;
const houghHeight = houghCanvas.height;
const detectionWidth = detectionCanvas.width;
const detectionHeight = detectionCanvas.height;

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
    
    // Detection canvas setup
    detectionCtx.fillStyle = 'white';
    detectionCtx.fillRect(0, 0, detectionWidth, detectionHeight);
    drawGridLines(detectionCtx, detectionWidth, detectionHeight);
    
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
    
    // Clear any stored Hough points
    drawnHoughPoints = [];
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
        
        // If starting to draw in Hough space, prepare image space
        if (currentCanvas === 'hough') {
            // Clear image space as we'll be drawing new lines
            imageCtx.fillStyle = 'white';
            imageCtx.fillRect(0, 0, imageWidth, imageHeight);
            drawGridLines(imageCtx, imageWidth, imageHeight);
        }
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
        
        // Run line detection automatically when drawing in image space
        detectLines();
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
                
                // Store the point for later line drawing
                drawnHoughPoints.push({
                    type: 'rhoTheta',
                    thetaIdx: thetaIndex,
                    rhoIdx: rhoIndex,
                    x: x,
                    y: y
                });
                
                // Draw all accumulated lines
                drawAllLinesFromHoughPoints();
                
                // Also update the detection canvas
                detectLines();
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
                
                // Store the point for later line drawing
                drawnHoughPoints.push({
                    type: 'mc',
                    mIdx: mIndex,
                    cIdx: cIndex,
                    x: x,
                    y: y
                });
                
                // Draw all accumulated lines
                drawAllLinesFromHoughPoints();
                
                // Also update the detection canvas
                detectLines();
            }
        }
    }
    
    lastX = x;
    lastY = y;
}
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        
        // Run line detection one more time at the end of drawing
        // This ensures we get the final state
        detectLines();
    }
}
function drawAllLinesFromHoughPoints() {
    // Clear the image canvas
    imageCtx.fillStyle = 'white';
    imageCtx.fillRect(0, 0, imageWidth, imageHeight);
    drawGridLines(imageCtx, imageWidth, imageHeight);
    
    // Draw each line corresponding to a Hough point
    for (const point of drawnHoughPoints) {
        if (point.type === 'rhoTheta') {
            drawLineFromRhoTheta(imageCtx, point.thetaIdx, point.rhoIdx);
        } else if (point.type === 'mc') {
            drawLineFromMC(imageCtx, point.mIdx, point.cIdx);
        }
    }
    
    // Copy to detection canvas
    detectionCtx.fillStyle = 'white';
    detectionCtx.fillRect(0, 0, detectionWidth, detectionHeight);
    drawGridLines(detectionCtx, detectionWidth, detectionHeight);
    detectionCtx.drawImage(imageCanvas, 0, 0);
}

function drawLineFromRhoTheta(ctx, thetaIdx, rhoIdx) {
    // Map indices to actual theta and rho values
    const theta = (thetaIdx / thetaResolution) * Math.PI; // 0 to π
    const rho = ((rhoIdx / houghHeight) * rhoResolution) - (rhoResolution/2);
    
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
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawLineFromMC(ctx, mIdx, cIdx) {
    // Map indices to actual m and c values
    const m = ((mIdx / mResolution) * (2 * mRange)) - mRange;
    const c = ((cIdx / cResolution) * (2 * cRange)) - cRange;
    
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
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
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



function detectLines() {
    // Clear the detection canvas
    detectionCtx.fillStyle = 'white';
    detectionCtx.fillRect(0, 0, detectionWidth, detectionHeight);
    drawGridLines(detectionCtx, detectionWidth, detectionHeight);
    
    // Find maximal value in Hough space for threshold calculation
    let maxVal = 0;
    for (let i = 0; i < thetaResolution; i++) {
        for (let j = 0; j < rhoResolution; j++) {
            if (houghSpaceRhoTheta[i][j] > maxVal) {
                maxVal = houghSpaceRhoTheta[i][j];
            }
        }
    }
    
    // Calculate threshold based on slider value (percentage of max)
    const threshold = (detectionThreshold / 100) * maxVal;
    
    if (maxVal <= 1) {
        console.log("No significant lines detected (max value too low)");
        return;
    }
    
    console.log(`Max accumulator value: ${maxVal}, Threshold: ${threshold}`);
    
    // Non-maximum suppression window size - smaller window for better precision
    const windowSize = 3;
    
    // Keep track of detected peaks
    const peaks = [];
    
    // Find local maxima that exceed the threshold
    for (let thetaIdx = windowSize; thetaIdx < thetaResolution - windowSize; thetaIdx++) {
        for (let rhoIdx = windowSize; rhoIdx < rhoResolution - windowSize; rhoIdx++) {
            const centerValue = houghSpaceRhoTheta[thetaIdx][rhoIdx];
            
            // Skip if below threshold
            if (centerValue < threshold) continue;
            
            // Check if it's a local maximum in the window
            let isLocalMax = true;
            
            // Compare with all neighbors in the window
            for (let i = -windowSize; i <= windowSize && isLocalMax; i++) {
                for (let j = -windowSize; j <= windowSize && isLocalMax; j++) {
                    // Skip the center point itself
                    if (i === 0 && j === 0) continue;
                    
                    // Make sure we don't go out of bounds
                    if (thetaIdx + i < 0 || thetaIdx + i >= thetaResolution ||
                        rhoIdx + j < 0 || rhoIdx + j >= rhoResolution) {
                        continue;
                    }
                    
                    const neighborValue = houghSpaceRhoTheta[thetaIdx + i][rhoIdx + j];
                    if (neighborValue > centerValue) {
                        isLocalMax = false;
                        break;
                    }
                }
            }
            
            if (isLocalMax) {
                peaks.push({
                    thetaIdx: thetaIdx,
                    rhoIdx: rhoIdx,
                    value: centerValue
                });
            }
        }
    }
    
    // Sort peaks by vote count (descending)
    peaks.sort((a, b) => b.value - a.value);
    
    // Limit the number of lines to avoid noise
    const maxLines = 10;  // Adjust as needed
    const peaksToShow = peaks.slice(0, maxLines);
    
    console.log(`Found ${peaks.length} peaks, showing ${peaksToShow.length}`);
    
    // Draw the detected lines on the detection canvas
    for (const peak of peaksToShow) {
        // Convert to actual theta and rho values, ensuring correct normalization
        const theta = (peak.thetaIdx / thetaResolution) * Math.PI;
        const rho = ((peak.rhoIdx / rhoResolution) * (2 * rhoResolution/2)) - (rhoResolution/2);
        
        console.log(`Drawing line: theta=${theta.toFixed(2)}, rho=${rho.toFixed(2)}`);
        
        // Draw line in a different color to distinguish
        drawLineFromParametersOnCanvas(detectionCtx, theta, rho, 'red', 2);
        
        // Optionally, mark the corresponding peak in the Hough space
        const x = (peak.thetaIdx / thetaResolution) * houghWidth;
        const y = (peak.rhoIdx / rhoResolution) * houghHeight;
        houghCtx.strokeStyle = 'red';
        houghCtx.lineWidth = 1;
        houghCtx.beginPath();
        houghCtx.arc(x, y, 8, 0, Math.PI * 2);
        houghCtx.stroke();
    }
}

// Improved helper function to draw a line from rho-theta parameters
function drawLineFromParametersOnCanvas(ctx, theta, rho, color = 'blue', lineWidth = 2) {
    // Convert from normalized parameters to actual coordinates
    const cos_t = Math.cos(theta);
    const sin_t = Math.sin(theta);
    
    // We need two points to draw a line
    let x1, y1, x2, y2;
    
    // Use different strategies depending on the angle
    if (Math.abs(sin_t) > 0.001) { // More precise threshold for near-horizontal lines
        // For angles not too close to horizontal
        x1 = 0;
        y1 = (rho - (x1 - imageWidth/2) * cos_t) / sin_t + imageHeight/2;
        x2 = imageWidth;
        y2 = (rho - (x2 - imageWidth/2) * cos_t) / sin_t + imageHeight/2;
    } else {
        // For angles close to horizontal
        y1 = 0;
        x1 = (rho - (y1 - imageHeight/2) * sin_t) / cos_t + imageWidth/2;
        y2 = imageHeight;
        x2 = (rho - (y2 - imageHeight/2) * sin_t) / cos_t + imageWidth/2;
    }
    
    // Draw the line
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Updated threshold slider with more immediate feedback
thresholdSlider.addEventListener('input', (e) => {
    detectionThreshold = parseInt(e.target.value);
    thresholdValue.textContent = detectionThreshold;
    // Rerun detection immediately when threshold changes
    detectLines();
});

// Button event listeners
drawImageBtn.addEventListener('click', () => {
    currentCanvas = 'image';
    drawImageBtn.classList.add('active');
    drawHoughBtn.classList.remove('active');
    drawnHoughPoints = []; // Clear Hough points when switching modes
});

drawHoughBtn.addEventListener('click', () => {
    currentCanvas = 'hough';
    drawHoughBtn.classList.add('active');
    drawImageBtn.classList.remove('active');
    drawnHoughPoints = []; // Clear Hough points when switching modes
    
    // Clear image space as we're starting new Hough space drawing
    imageCtx.fillStyle = 'white';
    imageCtx.fillRect(0, 0, imageWidth, imageHeight);
    drawGridLines(imageCtx, imageWidth, imageHeight);
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
    drawnHoughPoints = []; // Clear drawn Hough points
    
    // Clear detection canvas too
    detectionCtx.fillStyle = 'white';
    detectionCtx.fillRect(0, 0, detectionWidth, detectionHeight);
    drawGridLines(detectionCtx, detectionWidth, detectionHeight);
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
    
    // Clear the detection canvas
    detectionCtx.fillStyle = 'white';
    detectionCtx.fillRect(0, 0, detectionWidth, detectionHeight);
    drawGridLines(detectionCtx, detectionWidth, detectionHeight);
    
    drawnHoughPoints = []; // Clear drawn Hough points
});

// Detect Lines button
detectLinesBtn.addEventListener('click', detectLines);

// Threshold slider
thresholdSlider.addEventListener('input', (e) => {
    detectionThreshold = parseInt(e.target.value);
    thresholdValue.textContent = detectionThreshold;
});

// Hough type radio button event listeners
houghTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentHoughType = e.target.value;
        drawnHoughPoints = []; // Clear points when changing mode
        
        // Clear image space when changing Hough space type
        imageCtx.fillStyle = 'white';
        imageCtx.fillRect(0, 0, imageWidth, imageHeight);
        drawGridLines(imageCtx, imageWidth, imageHeight);
        
        // Clear detection canvas when changing mode
        detectionCtx.fillStyle = 'white';
        detectionCtx.fillRect(0, 0, detectionWidth, detectionHeight);
        drawGridLines(detectionCtx, detectionWidth, detectionHeight);
        
        updateHoughCanvas();
    });
});