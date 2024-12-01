// Canvas settings

// Retrieve CSS variables from :root
const rootStyles = getComputedStyle(document.documentElement);

const colorA = rootStyles.getPropertyValue("--color-a").trim();
const colorB = rootStyles.getPropertyValue("--color-b").trim();
const colorC = rootStyles.getPropertyValue("--color-c").trim();
const colorD = rootStyles.getPropertyValue("--color-d").trim();
const colorE = rootStyles.getPropertyValue("--color-e").trim();
const warden_green = rootStyles.getPropertyValue("--warden-green").trim();
const warden_blue = rootStyles.getPropertyValue("--warden-blue").trim();

// Grid settings
const gridSettings = {
  spacing: 40, // Spacing between points
  pointRadius: 0 // Radius of each point
};

// Mouse interaction settings
const mouseSettings = {
  maxDist: 80, // Maximum distance for mouse influence
  maxMoveDistance: 5, // Maximum displacement of points
  returnSpeed: 0.05 // Speed at which points return to original position
};

// Styling settings
const styleSettings = {
  pointColor: "#ffffff", // Color of the points
  lineColor: "rgba(255, 255, 255, 0.5)", // Color of the lines
  lineWidth: 1 // Width of the lines
};

// Get the canvas element and its drawing context
const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");

// Set the canvas size to match the window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Update canvas size on window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init(); // Re-initialize the points to fill the new size
});

let points = [];
let cols, rows;

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.originalX = x; // Store original positions to return to
    this.originalY = y;
  }

  // Draw the point as a circle
  draw() {
    ctx.fillStyle = styleSettings.pointColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, gridSettings.pointRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Update the point's position based on mouse proximity
  update(mouse) {
    // If mouse position is undefined, return to original position
    if (
      mouse.x === undefined ||
      mouse.y === undefined ||
      mouse.x < 0 ||
      mouse.y < 0 ||
      mouse.x > canvas.width ||
      mouse.y > canvas.height
    ) {
      this.x += (this.originalX - this.x) * mouseSettings.returnSpeed;
      this.y += (this.originalY - this.y) * mouseSettings.returnSpeed;
      return;
    }

    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouseSettings.maxDist) {
      // Calculate the displacement
      const angle = Math.atan2(dy, dx);
      const moveFactor =
        (mouseSettings.maxDist - distance) / mouseSettings.maxDist;
      const moveDistance = moveFactor * mouseSettings.maxMoveDistance;
      this.x -= Math.cos(angle) * moveDistance;
      this.y -= Math.sin(angle) * moveDistance;
    } else {
      // Return to original position
      this.x += (this.originalX - this.x) * mouseSettings.returnSpeed;
      this.y += (this.originalY - this.y) * mouseSettings.returnSpeed;
    }
  }
}

// Initialize the grid of points
function init() {
  points = []; // Clear existing points
  cols = Math.ceil(canvas.width / gridSettings.spacing) + 1;
  rows = Math.ceil(canvas.height / gridSettings.spacing) + 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      points.push(
        new Point(x * gridSettings.spacing, y * gridSettings.spacing)
      );
    }
  }
}

init();

/* Mouse Settings */

const mouse = {
  x: undefined,
  y: undefined
};

// Listen for mousemove on the document
document.addEventListener("mousemove", event => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
});

// Reset mouse position when it leaves the window
document.addEventListener("mouseleave", () => {
  mouse.x = undefined;
  mouse.y = undefined;
});

/* Mouse Settings*/

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw lines between neighboring points
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const p1 = points[i];

      // Connect to right neighbor
      if (x < cols - 1) {
        const p2 = points[i + 1];
        drawLine(p1, p2);
      }
      // Connect to bottom neighbor
      if (y < rows - 1) {
        const p3 = points[i + cols];
        drawLine(p1, p3);
      }
    }
  }

  // Update and draw each point
  points.forEach(point => {
    point.update(mouse);
    point.draw();
  });

  requestAnimationFrame(animate);
}

function drawLine(p1, p2) {
  ctx.strokeStyle = styleSettings.lineColor;
  ctx.lineWidth = styleSettings.lineWidth;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

animate();
