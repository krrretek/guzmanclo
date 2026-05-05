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
