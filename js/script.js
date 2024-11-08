const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");
const fogCanvas = document.getElementById("fogCanvas");
const fogCtx = fogCanvas.getContext("2d");

// Variables for fog customization
const fogSettings = {
  density: 2, // Fog density (larger = thinner fog)
  speed: 0.0, // Speed of fog movement
  opacity: 100, // Opacity of fog (0-255, 255 is fully opaque)
  noiseScale: 150, // Scale of noise (larger = finer details)
};

// Perlin Noise Parameters
const noiseData = [];
const noiseSize = 256;

// Menu Toggles
const menuContainer = document.querySelector(".menu-container");
const menuToggle = document.querySelector(".menu-toggle");
const menuItems = document.querySelectorAll("nav li");

// Set canvas to full-screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  fogCanvas.width = window.innerWidth;
  fogCanvas.height = window.innerHeight;
}

/**
 * Draws a grid on the canvas.
 * The grid lines are spaced by the specified gridSize.
 * The canvas is cleared before drawing the grid.
 */
function drawGrid() {
  const gridSize = 40;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Animate grid (optional for dynamic effect)
function animate() {
  drawGrid();
  requestAnimationFrame(animate);
}

/**
 * Generates a 2D array of random noise values (Perlin Noise).
 *
 * This function populates the global `noiseData` array with random values
 * between 0 and 1. The size of the array is determined by the global
 * variable `noiseSize`.
 *
 * @global
 * @function
 */
function generateNoise() {
  for (let i = 0; i < noiseSize; i++) {
    noiseData[i] = [];
    for (let j = 0; j < noiseSize; j++) {
      noiseData[i][j] = Math.random();
    }
  }
}

/**
 * Linearly interpolates between two values.
 *
 * @param {number} a - The start value.
 * @param {number} b - The end value.
 * @param {number} t - The interpolation factor, typically between 0 and 1.
 * @returns {number} The interpolated value.
 */
function lerp(a, b, t) {
  return a + t * (b - a);
}

/**
 * Generates a smooth noise value at the given coordinates (x, y).
 *
 * This function uses bilinear interpolation to smooth the noise values
 * from the surrounding grid points.
 *
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {number} - The smoothed noise value.
 */
function smoothNoise(x, y) {
  const x0 = Math.floor(x) % noiseSize;
  const y0 = Math.floor(y) % noiseSize;
  const x1 = (x0 + 1) % noiseSize;
  const y1 = (y0 + 1) % noiseSize;

  const tx = x - Math.floor(x);
  const ty = y - Math.floor(y);

  const n0 = lerp(noiseData[x0][y0], noiseData[x1][y0], tx);
  const n1 = lerp(noiseData[x0][y1], noiseData[x1][y1], tx);

  return lerp(n0, n1, ty);
}

/**
 * Draws animated fog on the canvas.
 *
 * @param {Object} options - The options for drawing fog.
 * @param {number} options.density - The density of the fog.
 * @param {number} options.speed - The speed of the fog animation.
 * @param {number} options.opacity - The opacity of the fog.
 * @param {number} options.noiseScale - The scale of the noise used to generate the fog.
 */
function drawFog({ density, speed, opacity, noiseScale }) {
  const imageData = fogCtx.createImageData(fogCanvas.width, fogCanvas.height);
  const data = imageData.data;

  for (let y = 0; y < fogCanvas.height; y += density) {
    for (let x = 0; x < fogCanvas.width; x += density) {
      const value = Math.floor(
        smoothNoise(x / noiseScale + offset, y / noiseScale) * 255
      );
      const index = (y * fogCanvas.width + x) * 4;

      data[index] = value; // Red
      data[index + 1] = value; // Green
      data[index + 2] = value; // Blue
      data[index + 3] = opacity; // Alpha
    }
  }

  fogCtx.putImageData(imageData, 0, 0);
  offset += speed;
  requestAnimationFrame(() => drawFog({ density, speed, opacity, noiseScale }));
}

// Toggle menu open and close
menuToggle.addEventListener("click", () => {
  if (menuContainer.style.width === "250px") {
    menuContainer.style.width = "0";
    menuItems.forEach((item) => {
      item.classList.remove("active");
    });
  } else {
    menuContainer.style.width = "250px";
    // Add items one by one with a delay
    menuItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("active");
      }, index * 100); // Adjust delay (100ms per item)
    });
  }
});

let offset = 0;

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
animate();
generateNoise();
drawFog(fogSettings);
