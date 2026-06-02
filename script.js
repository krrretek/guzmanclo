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

// 2. Cyberpunk Load Glitch Effect (Overlay and Text glitch trigger)
window.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on DOMContentLoaded to override browser hash/restore jumps
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Add glitch-active class to h1 for the CSS glitch keyframes
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.classList.add('glitch-active');
        setTimeout(() => {
            h1.classList.remove('glitch-active');
        }, 1600); // Disable text glitch after 1.6s
    }

    // Spawn and run the canvas cyberpunk glitch
    runCanvasGlitch();
});

function runCanvasGlitch() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '99999999';
    canvas.style.pointerEvents = 'none'; // Click-through
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    const duration = 1200; // Glitch overlay lasts for 1.2s
    const startTime = performance.now();

    function drawGlitch(time) {
        const elapsed = time - startTime;
        if (elapsed > duration) {
            // Clean up and remove the overlay canvas
            if (canvas.parentNode) {
                document.body.removeChild(canvas);
            }
            return;
        }

        ctx.clearRect(0, 0, width, height);

        const glitchChance = Math.random();
        
        // Cyberpunk neon palettes (cyan, blood orange, neon crimson, dark glitch block, neon yellow)
        const colors = [
            'rgba(0, 229, 255, 0.35)', 
            'rgba(255, 90, 31, 0.4)',  
            'rgba(217, 56, 30, 0.4)',   
            'rgba(255, 238, 0, 0.25)',  
            'rgba(19, 2, 2, 0.75)'      
        ];

        // Draw smaller, grainier glitches on 48% of the frames
        if (glitchChance < 0.48) {
            // Thin horizontal static line grain
            const numLines = Math.floor(Math.random() * 14) + 6;
            for (let i = 0; i < numLines; i++) {
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                const h = Math.floor(Math.random() * 3) + 1; // 1px to 3px thick (very grainy)
                const w = Math.floor(Math.random() * (width * 0.5)) + 40;
                const x = Math.floor(Math.random() * (width - w));
                const y = Math.floor(Math.random() * height);
                ctx.fillRect(x, y, w, h);
            }

            // Scatter individual square grain dust particles
            const numGrains = Math.floor(Math.random() * 40) + 20;
            for (let i = 0; i < numGrains; i++) {
                ctx.fillStyle = Math.random() > 0.25 ? colors[Math.floor(Math.random() * colors.length)] : '#ffffff';
                const size = Math.floor(Math.random() * 5) + 1.5; // 1.5px to 6.5px grain sizes
                const x = Math.floor(Math.random() * width);
                const y = Math.floor(Math.random() * height);
                ctx.fillRect(x, y, size, size);
            }

            // Occasional screen-slice offset flicker
            if (Math.random() > 0.8) {
                ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
                ctx.fillRect(0, Math.floor(Math.random() * height), width, Math.floor(Math.random() * 12) + 2);
            }
        }
        
        // Fine CRT scanline static pattern
        if (glitchChance > 0.88) {
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let y = 0; y < height; y += 3) {
                if (Math.random() > 0.4) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(drawGlitch);
    }

    requestAnimationFrame(drawGlitch);
}

// 3. Custom Glowing Cursor Tracking (2x size, pulsing glow)
const cursorDot = document.getElementById('cursor-dot');
const cursorGlow = document.getElementById('cursor-glow');
const cursorGlowInner = document.getElementById('cursor-glow-inner');

if (cursorDot && cursorGlow && cursorGlowInner) {
    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let glowX = 0;
    let glowY = 0;
    let isInitialized = false;

    window.addEventListener('pointermove', (e) => {
        // Touch devices: do not show custom cursors
        if (e.pointerType === 'touch') {
            cursorDot.style.display = 'none';
            cursorGlow.style.display = 'none';
            document.body.style.cursor = 'auto';
            return;
        }

        // On desktop, hide standard cursor and make custom cursor visible
        if (!isInitialized) {
            cursorDot.style.display = 'block';
            cursorGlow.style.display = 'block';
            isInitialized = true;
        }

        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch') {
            cursorGlowInner.classList.add('clicking');
        }
    });

    window.addEventListener('pointerup', () => {
        cursorGlowInner.classList.remove('clicking');
    });

    // Fade cursor out when exiting viewport
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorGlow.style.opacity = '1';
    });

    // Smooth elastic tracking tracking animation loop (lerp)
    function trackCursor() {
        // Dot tracks faster (factor 0.3)
        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;

        // Outer glow trails smoothly (factor 0.12) creating a trailing elasticity
        glowX += (mouseX - glowX) * 0.12;
        glowY += (mouseY - glowY) * 0.12;

        cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;

        requestAnimationFrame(trackCursor);
    }
    requestAnimationFrame(trackCursor);

    // Dynamic Hover States using Event Delegation
    document.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (!target) return;
        
        const isHoverable = target.closest('a') || 
                            target.closest('button') || 
                            target.closest('model-viewer') || 
                            target.closest('.social-link') || 
                            target.closest('[role="button"]');
                            
        if (isHoverable) {
            cursorGlowInner.classList.add('hovered');
            cursorDot.classList.add('hovered');
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target;
        if (!target) return;

        const isHoverable = target.closest('a') || 
                            target.closest('button') || 
                            target.closest('model-viewer') || 
                            target.closest('.social-link') || 
                            target.closest('[role="button"]');

        if (isHoverable) {
            const relatedTarget = e.relatedTarget;
            const isLeaving = !relatedTarget || 
                             (!relatedTarget.closest('a') && 
                              !relatedTarget.closest('button') && 
                              !relatedTarget.closest('model-viewer') && 
                              !relatedTarget.closest('.social-link') && 
                              !relatedTarget.closest('[role="button"]'));
            
            if (isLeaving) {
                cursorGlowInner.classList.remove('hovered');
                cursorDot.classList.remove('hovered');
            }
        }
    });
}

// 4. Pixelated Dither Transition for the Home Button
const homeLink = document.querySelector('header nav a[href="#home"]') || document.querySelector('header nav ul li a[href="#home"]');
if (homeLink) {
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        startGlitchTransition(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
        });
    });
}

function startGlitchTransition(onMidpoint) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '99999999';
    canvas.style.pointerEvents = 'auto'; // Block clicks during the transition
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const duration = 1200; // Total transition time 1.2s
    const startTime = performance.now();
    let midpointTriggered = false;

    // Cyberpunk transition color palette
    const colors = [
        '#00e5ff', // neon cyan
        '#ff5a1f', // orange
        '#d9381e', // blood orange
        '#ffaa00', // gold
        '#130202', // dark blood/background
        '#ffffff'  // white static
    ];

    function animate(time) {
        const elapsed = time - startTime;
        if (elapsed > duration) {
            if (canvas.parentNode) {
                document.body.removeChild(canvas);
            }
            return;
        }

        ctx.clearRect(0, 0, width, height);

        // Progress factor: peaks at 1.0 at midpoint (600ms)
        let progress = 0;
        if (elapsed < 600) {
            progress = elapsed / 600; // 0 to 1
        } else {
            progress = (duration - elapsed) / 600; // 1 to 0
        }

        // Trigger scroll-to-top exactly at midpoint peak (600ms)
        if (elapsed >= 600 && !midpointTriggered) {
            onMidpoint();
            midpointTriggered = true;
        }

        // Glitch line counts scale up with progress
        const numGlitches = Math.floor(progress * 18) + 4;
        
        // Draw solid colored horizontal slices (choppy, uneven offsets)
        for (let i = 0; i < numGlitches; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            
            // Random block heights that get taller and choppier as we approach midpoint
            const h = Math.floor(Math.random() * (progress * 120)) + 6;
            const y = Math.floor(Math.random() * height);
            const w = Math.floor(Math.random() * width) + (width * 0.5);
            const x = Math.floor(Math.random() * (width - w));
            
            ctx.fillRect(x, y, w, h);
        }

        // Scatter pixel noise static grains
        const numGrains = Math.floor(progress * 90) + 12;
        for (let i = 0; i < numGrains; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? colors[Math.floor(Math.random() * colors.length)] : '#ffffff';
            const size = Math.floor(Math.random() * 12) + 2.5; // grain sizes
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            ctx.fillRect(x, y, size, size);
        }

        // Horizontal displacement simulation (thin black offset slice overlays)
        const numDisplacements = Math.floor(progress * 6);
        for (let i = 0; i < numDisplacements; i++) {
            ctx.fillStyle = 'rgba(19, 2, 2, 0.9)';
            const y = Math.floor(Math.random() * height);
            const h = Math.floor(Math.random() * 40) + 10;
            ctx.fillRect(0, y, width, h);
            
            // Draw cyan and orange offset edges for chromatic aberration simulator
            ctx.fillStyle = '#00e5ff';
            ctx.fillRect(0, y, width, 2);
            ctx.fillStyle = '#ff5a1f';
            ctx.fillRect(0, y + h - 2, width, 2);
        }

        // Near midpoint peak, completely cover the viewport to hide the scroll swap
        if (progress > 0.85) {
            ctx.fillStyle = Math.random() > 0.5 ? '#130202' : '#ff5a1f';
            ctx.fillRect(0, 0, width, height);
            
            // Draw big digital static symbol
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('CRITICAL_REBOOT_INIT', width / 2, height / 2);
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// Force scroll to top on complete load once assets are fully positioned
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});


