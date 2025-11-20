const cubeContainer = document.getElementById('cube');
const size = 50; // Matches CSS var

// State management
let cubies = [];

function createCube() {
    cubeContainer.innerHTML = '';
    cubies = [];

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const cubie = document.createElement('div');
                cubie.className = 'cubie';

                // Create 3D Matrix
                const matrix = new DOMMatrix();
                matrix.translateSelf(x * size, y * size, z * size);

                cubie.style.transform = matrix.toString();

                // Save logical state
                cubie.dataset.x = x;
                cubie.dataset.y = y;
                cubie.dataset.z = z;

                // Map faces
                const faces = [
                    { dir: 'front', cls: 'f', show: z === 1 },
                    { dir: 'back', cls: 'b', show: z === -1 },
                    { dir: 'top', cls: 'u', show: y === -1 },
                    { dir: 'bottom', cls: 'd', show: y === 1 },
                    { dir: 'right', cls: 'r', show: x === 1 },
                    { dir: 'left', cls: 'l', show: x === -1 },
                ];

                faces.forEach(face => {
                    const div = document.createElement('div');
                    div.className = `face face--${face.dir}`;
                    if (face.show) div.classList.add(face.cls);
                    else div.style.backgroundColor = 'black';

                    cubie.appendChild(div);
                });

                cubeContainer.appendChild(cubie);

                cubies.push({
                    element: cubie,
                    x, y, z,
                    matrix
                });
            }
        }
    }
}

// Core Logic
function rotateLayer(axis, limit, dir) {
    // Fuzzy selection to handle small float inaccuracies
    const relevantCubies = cubies.filter(cubie => {
        return Math.abs(cubie[axis] - limit) < 0.5;
    });

    const rotationMatrix = new DOMMatrix();

    // === FIX: Removed the negative sign on Y axis ===
    // Now Visual and Logical rotations should be synced for Yellow/White layers
    if (axis === 'x') rotationMatrix.rotateSelf(dir * 90, 0, 0);
    if (axis === 'y') rotationMatrix.rotateSelf(0, dir * 90, 0);
    if (axis === 'z') rotationMatrix.rotateSelf(0, 0, dir * 90);

    relevantCubies.forEach(cubie => {
        // 1. Update Visuals
        cubie.matrix = rotationMatrix.multiply(cubie.matrix);

        // 2. Update Logic
        rotateCubieCoordinates(cubie, axis, dir);

        // 3. Snap to Grid (Anti-Drift Mechanism)
        // Force the position to be exact integers
        cubie.matrix.m41 = cubie.x * size;
        cubie.matrix.m42 = cubie.y * size;
        cubie.matrix.m43 = cubie.z * size;

        // Apply
        cubie.element.style.transform = cubie.matrix.toString();
    });
}

function rotateCubieCoordinates(cubie, axis, dir) {
    const { x, y, z } = cubie;

    if (axis === 'x') {
        cubie.y = y * 0 - z * dir;
        cubie.z = y * dir + z * 0;
    } else if (axis === 'y') {
        cubie.x = x * 0 + z * dir;
        cubie.z = -x * dir + z * 0;
    } else if (axis === 'z') {
        cubie.x = x * 0 - y * dir;
        cubie.y = x * dir + y * 0;
    }

    cubie.x = Math.round(cubie.x);
    cubie.y = Math.round(cubie.y);
    cubie.z = Math.round(cubie.z);
}

function move(notation) {
    const moveMap = {
        'R': { axis: 'x', limit: 1, dir: -1 },
        "R'": { axis: 'x', limit: 1, dir: 1 },
        'L': { axis: 'x', limit: -1, dir: 1 },
        "L'": { axis: 'x', limit: -1, dir: -1 },
        'U': { axis: 'y', limit: -1, dir: -1 },
        "U'": { axis: 'y', limit: -1, dir: 1 },
        'D': { axis: 'y', limit: 1, dir: 1 },
        "D'": { axis: 'y', limit: 1, dir: -1 },
        'F': { axis: 'z', limit: 1, dir: -1 },
        "F'": { axis: 'z', limit: 1, dir: 1 },
        'B': { axis: 'z', limit: -1, dir: 1 },
        "B'": { axis: 'z', limit: -1, dir: -1 },
    };

    const action = moveMap[notation];
    if (!action) return;

    rotateLayer(action.axis, action.limit, action.dir);
}

function executeSequence(sequenceString) {
    const moves = sequenceString.split(" ");
    let i = 0;

    const interval = setInterval(() => {
        if (i >= moves.length) {
            clearInterval(interval);
            console.log("Sequence completed.");
            return;
        }
        move(moves[i]);
        i++;
    }, 300);
}

function scrambleCube() {
    const moves = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"];
    let scrambleSequence = [];

    for (let i = 0; i < 20; i++) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        scrambleSequence.push(randomMove);
    }

    executeSequence(scrambleSequence.join(" "));
}

function solveCube() {
    // Sanity Check
    executeSequence("R U R' U' R U R' U' R U R' U' R U R' U' R U R' U' R U R' U'");
}

createCube();