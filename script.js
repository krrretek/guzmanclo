// 1. Prevent Scroll and Middle-Click Hijacking on Interactive 3D Viewers
// This stops propagation of wheel and middle-click events in the capture phase so that
// internal library event listeners (which call preventDefault()) are bypassed, letting
// the browser handle page scrolling and autoscroll naturally.
const interactiveElements = document.querySelectorAll('model-viewer');

interactiveElements.forEach(element => {
    if (!element) return;

    // Intercept wheel events and stop propagation
    element.addEventListener('wheel', (e) => {
        e.stopPropagation();
    }, { capture: true, passive: true });

    // Intercept middle-mouse click (button 1) events and stop propagation
    const handleMiddleClick = (e) => {
        if (e.button === 1) { // 1 represents the middle mouse button/wheel click
            e.stopPropagation();
        }
    };

    element.addEventListener('mousedown', handleMiddleClick, { capture: true });
    element.addEventListener('mouseup', handleMiddleClick, { capture: true });
    element.addEventListener('pointerdown', handleMiddleClick, { capture: true });
    element.addEventListener('pointerup', handleMiddleClick, { capture: true });
});

// 10. Pixelated Transition for the Home Button
const homeLink = document.querySelector('header nav a[href="#home"]') || document.querySelector('header nav ul li a[href="#home"]');
if (homeLink) {
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        startPixelTransition(() => {
            // Scroll to the top instantly
            window.scrollTo({ top: 0, behavior: 'auto' });
        });
    });
}

function startPixelTransition(onMidpoint) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '999999';
    canvas.style.pointerEvents = 'auto'; // Prevent other clicks during the transition
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const blockSize = 40; // Block size for pixelated aesthetic
    const cols = Math.ceil(width / blockSize);
    const rows = Math.ceil(height / blockSize);
    
    // Palette matching the site's iridescent design
    const colors = ['#B76E79', '#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#AAF0D1'];
    
    // Construct grid cells
    const cells = [];
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            cells.push({
                x: c * blockSize,
                y: r * blockSize,
                color: colors[Math.floor(Math.random() * colors.length)],
                progress: 0,
                delay: Math.floor(Math.random() * 25), // Random delay for organic dissolve feel
                speed: 0.04 + Math.random() * 0.04
            });
        }
    }

    let phase = 'in'; // 'in' (building pixels to opaque), 'out' (clearing pixels to transparent)

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        let allFinished = true;

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            
            if (phase === 'in') {
                if (cell.delay > 0) {
                    cell.delay--;
                    allFinished = false;
                } else {
                    cell.progress += cell.speed;
                    if (cell.progress >= 1) {
                        cell.progress = 1;
                    } else {
                        allFinished = false;
                    }
                }
            } else { // phase === 'out'
                cell.progress -= cell.speed;
                if (cell.progress <= 0) {
                    cell.progress = 0;
                } else {
                    allFinished = false;
                }
            }

            // Draw pixel block if visible
            if (cell.progress > 0) {
                ctx.fillStyle = cell.color;
                ctx.globalAlpha = cell.progress;
                
                // Animate block size and alpha centered in each grid cell
                const currentSize = blockSize * cell.progress;
                const offset = (blockSize - currentSize) / 2;
                
                ctx.fillRect(
                    cell.x + offset, 
                    cell.y + offset, 
                    currentSize, 
                    currentSize
                );
            }
        }

        ctx.globalAlpha = 1.0; // Reset canvas global opacity

        if (allFinished) {
            if (phase === 'in') {
                // Screen is fully pixelated and opaque
                onMidpoint();
                phase = 'out';
                
                // Shuffle outgoing speeds to keep the exit transition dynamic
                cells.forEach(c => {
                    c.speed = 0.05 + Math.random() * 0.05;
                });
                
                requestAnimationFrame(animate);
            } else {
                // Transition complete, clean up canvas
                document.body.removeChild(canvas);
            }
        } else {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}


