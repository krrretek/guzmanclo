import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/OBJLoader.js';

const container = document.getElementById('obj-interactive-viewer');
if (container) {
    // 1. Setup Initial Scene
    const scene = new THREE.Scene();

    // 2. Setup Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    // Setting defaults a bit further back to accommodate potentially large OBJ files
    camera.position.z = 250; 

    // 3. Setup WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 4. Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 200, 100);
    scene.add(directionalLight);

    // 5. Orbit Controls (Lets the user spin it)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.enableZoom = false; // Prevents scroll trapping over the model

    // 6. Loading the OBJ File
    const objLoader = new OBJLoader();

    // Explicit relative path pointer
    objLoader.load(
        './assets/interactive.alligator.obj', 
        (object) => {
            // Automatically center the object
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.x += (object.position.x - center.x);
            object.position.y += (object.position.y - center.y);
            object.position.z += (object.position.z - center.z);
            
            // Apply a nice metallic aesthetic material, unless it has custom materials
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xcccccc,
                        roughness: 0.3,
                        metalness: 0.7
                    });
                }
            });
            
            scene.add(object);
        },
        (xhr) => {
            console.log('Loading .obj file: ' + Math.round((xhr.loaded / xhr.total * 100)) + '%');
        },
        (error) => {
            console.error('An error happened loading the OBJ', error);
            // Added debug string reporting
            container.innerHTML = `<p style="color:white;text-align:center;font-size:1.5rem;">Failed to load server asset. Code: ${error.target ? error.target.status : error.message || 'Unknown Network Interruption'}</p>`;
        }
    );

    // 7. Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // 8. Handle Window Layout Resizing
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// 9. Prevent Scroll and Middle-Click Hijacking on Interactive 3D Viewers
// This stops propagation of wheel and middle-click events in the capture phase so that
// internal library event listeners (which call preventDefault()) are bypassed, letting
// the browser handle page scrolling and autoscroll naturally.
const interactiveElements = [
    document.querySelector('model-viewer'),
    document.getElementById('obj-interactive-viewer')
];

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


