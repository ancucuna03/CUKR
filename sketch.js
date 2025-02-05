// intro and outro
let intro = true;
let outro = false;
let outroProgress = 0;

// Capture variable for webcam
let capture;

// Arrays to store particles and sugar cubes
let particles = [];
let sugarCubes = [];

// Physics and environment variables
let gravity = 3.5;
let groundLevel;

// Sugar cube dropping variables
let initialDropStarted = false;
let dropInterval = 300;
let lastDropTime = 0;
let totalCubes = 35;
let cubesDropped = 0;
let selectedCube = null;

// Glitch effect variables
let glitchShapes = [];
let allCubesEaten = false;

// Sugar cube visualization variables
let cubeVisible = true;
let cubeParticles = [];
let cubeExploded = false;
let lastClickTime = 0;
let cameraDelay = 0;
let showCamera = false;

// Cube rotation variables
let cubeRotation = { x: 0, y: 0 };

// Camera and glitch effect variables
let cameraRevealEffectActive = false;
let glitchIntensity = 0;
let glitchTransitionEnd = 0;

// Array to store sugar eating sound effects
let sugarEatSounds = [];

// Sugar consumption data array
const sugarData = [
  { year: 1989, consumption: 38.8 },
  { year: 1990, consumption: 38.3 },
  { year: 1991, consumption: 41.0 },
  { year: 1992, consumption: 39.5 },
  { year: 1993, consumption: 39.0 },
  { year: 1994, consumption: 38.6 },
  { year: 1995, consumption: 38.9 },
  { year: 1996, consumption: 40.0 },
  { year: 1997, consumption: 39.0 },
  { year: 1998, consumption: 37.0 },
  { year: 1999, consumption: 37.3 },
  { year: 2000, consumption: 36.0 },
  { year: 2001, consumption: 39.0 },
  { year: 2002, consumption: 41.5 },
  { year: 2003, consumption: 43.0 },
  { year: 2004, consumption: 42.6 },
  { year: 2005, consumption: 40.0 },
  { year: 2006, consumption: 39.0 },
  { year: 2007, consumption: 37.5 },
  { year: 2008, consumption: 32.0 },
  { year: 2009, consumption: 36.7 },
  { year: 2010, consumption: 36.0 },
  { year: 2011, consumption: 38.5 },
  { year: 2012, consumption: 34.5 },
  { year: 2013, consumption: 33.0 },
  { year: 2014, consumption: 31.7 },
  { year: 2015, consumption: 33.0 },
  { year: 2016, consumption: 34.0 },
  { year: 2017, consumption: 34.7 },
  { year: 2018, consumption: 35.0 },
  { year: 2019, consumption: 35.7 },
  { year: 2020, consumption: 36.3 },
  { year: 2021, consumption: 36.3 },
  { year: 2022, consumption: 37.0 },
  { year: 2023, consumption: 33.5 },
];

// Font variable
let myFont;

function preload() {
  myFont = loadFont("ArgentPixelCF-Regular.otf");

  sugarEatSounds.push(loadSound("sound_bite_sound.mp3"));
  sugarEatSounds.push(loadSound("sugar_eat_sound02.mp3"));
  sugarEatSounds.push(loadSound("sugar_sound_bite03.mp3"));
  sugarEatSounds.push(loadSound("sugar_sound_bite04.mp3"));
  sugarEatSounds.push(loadSound("sugar_sound_bite05.mp3"));
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  capture = createCapture(VIDEO);
  capture.size(width, height);
  capture.hide();

  noStroke();
  groundLevel = height - 50;
  textFont(myFont);
  fill(255, 250, 240);

  for (let i = 0; i < 40000; i++) {
    let x = random(-160, 160);
    let y = random(-160, 160);
    let z = random(-160, 160);

    if (abs(x) > 95 || abs(y) > 95 || abs(z) > 95) {
      cubeParticles.push({
        pos: createVector(x, y, z),
        velocity: createVector(0, 0, 0),
        exploded: false,
      });
    }
  }

  let spacing2D = 8;
  for (let y = 0; y < height; y += spacing2D) {
    for (let x = 0; x < width; x += spacing2D) {
      particles.push({ x, y, brightness: 0, size: 0 });
    }
  }
}

function draw() {
  background(255, 182, 193);

  if (!outro) {
    if (glitchShapes.length < 35) {
      if (cameraRevealEffectActive) {
        glitchIntensity = map(glitchTransitionEnd - millis(), 0, 5000, 0, 1.5);
        if (millis() > glitchTransitionEnd) {
          cameraRevealEffectActive = false;
          showCamera = true;
        }
        displayGlitchCamera();
      } else {
        displayCamera();
      }

      let xPositions = [];

      if (initialDropStarted && cubesDropped < totalCubes) {
        if (millis() - lastDropTime > dropInterval) {
          let x = random(100, width - 100);
          let y = random(0, 50);

          let tooClose = true;
          while (tooClose) {
            tooClose = false;
            for (let existingX of xPositions) {
              if (abs(existingX - x) < 300) {
                tooClose = true;
                break;
              }
            }

            if (tooClose) {
              x = random(100, width - 100);
            }
          }

          xPositions.push(x);

          let sugarDataEntry = sugarData[cubesDropped];
          let soundIndex = cubesDropped % sugarEatSounds.length;
          sugarCubes.push(
            new SugarCube(
              x,
              y,
              sugarDataEntry.year,
              sugarDataEntry.consumption,
              soundIndex
            )
          );

          cubesDropped++;
          lastDropTime = millis();
        }
      }

      for (let cube of sugarCubes) {
        if (cube !== selectedCube) {
          cube.update(sugarCubes);
        }
        cube.show();
      }
    }

    if (intro) {
      background(255, 182, 193);
      fill(255, 250, 240);
      textSize(98);
      textAlign(CENTER, CENTER);
      text("sladíš?", width * 0.5, height * 0.45);

      push();
      translate(width / 2, height / 2);
      rotateX(cubeRotation.x);
      rotateY(cubeRotation.y);

      for (let particle of cubeParticles) {
        push();
        translate(particle.pos.x, particle.pos.y, particle.pos.z);
        fill(255, 250, 240);
        noStroke();
        box(6);
        pop();

        if (cubeExploded && !particle.exploded) {
          particle.velocity = createVector(
            random(-2, 2),
            random(-8, -4),
            random(-2, 2)
          );
          particle.exploded = true;
        }

        if (particle.exploded) {
          particle.velocity.y += gravity;
          particle.pos.add(particle.velocity);
        }
      }

      if (cubeExploded) {
        let allOnGround = cubeParticles.every((p) => p.pos.y > groundLevel);
        if (allOnGround) {
          cubeVisible = false;
          intro = false;
          cameraDelay = millis();
          cameraRevealEffectActive = true;
          glitchTransitionEnd = millis() + 5000;
        }
      }
      pop();
    }

    if (allCubesEaten) {
      outro = true;
    }
  } else {
    displayGlitchCamera();
    displayOutro();
  }
}

function displayGlitchCamera() {
  background(255, 182, 193);
  push();
  translate(-width / 2, -height / 2);
  capture.loadPixels();
  for (let particle of particles) {
    let x = particle.x + random(-glitchIntensity, glitchIntensity) * 10;
    let y = particle.y + random(-glitchIntensity, glitchIntensity) * 10;
    let pixelX = floor((x / width) * capture.width);
    let pixelY = floor((y / height) * capture.height);
    if (
      pixelX < 0 ||
      pixelX >= capture.width ||
      pixelY < 0 ||
      pixelY >= capture.height
    )
      continue;
    let index = (pixelX + pixelY * capture.width) * 4;
    let r = capture.pixels[index];
    let g = capture.pixels[index + 1];
    let b = capture.pixels[index + 2];
    let brightness = (r + g + b) / 3;
    particle.brightness = brightness;
    if (particle.size < 8) {
      particle.size += 0.1;
    }

    let isGlitched = glitchShapes.some((shape) => {
      return isPointInsidePolygon(x, y, shape.vertices);
    });
    if (isGlitched) {
      fill(0);
      noStroke();
      rect(x + random(-1, 1), y + random(-1, 1), 8, 8);
    } else if (brightness < 120) {
      let size = (map(brightness, 0, 255, 8, 4) * particle.size) / 8;
      fill(255, 240, 210);
      noStroke();
      rect(x, y, size, size);
    }
  }

  pop();
}

function displayCamera() {
  background(255, 182, 193);
  translate(-width / 2, -height / 2);
  capture.loadPixels();

  for (let particle of particles) {
    let x = particle.x;
    let y = particle.y;

    let pixelX = floor((x / width) * capture.width);
    let pixelY = floor((y / height) * capture.height);
    if (
      pixelX < 0 ||
      pixelX >= capture.width ||
      pixelY < 0 ||
      pixelY >= capture.height
    )
      continue;
    let index = (pixelX + pixelY * capture.width) * 4;
    let r = capture.pixels[index];
    let g = capture.pixels[index + 1];
    let b = capture.pixels[index + 2];
    let brightness = (r + g + b) / 3;
    particle.brightness = brightness;

    let isGlitched = glitchShapes.some((shape) => {
      return isPointInsidePolygon(x, y, shape.vertices);
    });

    if (isGlitched) {
      fill(0);
      rect(x + random(-1, 1), y + random(-1, 1), 8, 8);
    } else if (brightness < 120) {
      let size = map(brightness, 0, 255, 8, 4);
      fill(255, 240, 210);
      rect(x, y, size, size);
    }
  }
}

function displayOutro() {
  push();
  translate(-width / 2, -height / 2);
  
  for (let particle of particles) {
    let x = particle.x + random(-5, 5);
    let y = particle.y + random(-5, 5);

    let threshold = easeInOutQuad(outroProgress);
    
    if (random() < threshold) {
      let size = map(particle.brightness, 0, 255, 12, 6) * (1 + outroProgress * 2);
      fill(0);
      noStroke();
      rect(x, y, size, size);
    }
  }
  
  pop();

  outroProgress += 0.005; // Zpomalený proces zčernání

  if (outroProgress >= 1) {
    background(0);
    push();
    translate(0, 0, 1);
    fill(255, 250, 240);
    textSize(98);
    textAlign(CENTER, CENTER);
    text("já raději bez cukru", 0, 0);
    pop();
    noLoop();
  }
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function mousePressed() {
  if (cubeVisible) {
    let currentTime = millis();
    if (currentTime - lastClickTime < 200) {
      cubeExploded = true;
      for (let particle of cubeParticles) {
        if (!particle.exploded) {
          particle.velocity = createVector(
            random(-2, 2),
            random(-8, -4),
            random(-2, -2)
          );
          particle.exploded = true;
        }
      }
    }
    lastClickTime = currentTime;
  } else {
    if (!initialDropStarted) {
      initialDropStarted = true;
    } else {
      for (let cube of sugarCubes) {
        if (
          mouseX > cube.pos.x - cube.size / 2 &&
          mouseX < cube.pos.x + cube.size / 2 &&
          mouseY > cube.pos.y - cube.size / 2 &&
          mouseY < cube.pos.y + cube.size / 2
        ) {
          selectedCube = cube;
          cube.velocity.set(0, 0);
          break;
        }
      }
    }
  }
}

function mouseDragged() {
  if (cubeVisible && !cubeExploded) {
    cubeRotation.x += movedY * 0.01;
    cubeRotation.y -= movedX * 0.01;
  }

  if (selectedCube) {
    selectedCube.pos.x = mouseX;
    selectedCube.pos.y = mouseY;
  }
}

function mouseReleased() {
  if (selectedCube) {
    let pixelX = floor((selectedCube.pos.x / width) * capture.width);
    let pixelY = floor((selectedCube.pos.y / height) * capture.height);
    if (
      pixelX >= 0 &&
      pixelX < capture.width &&
      pixelY >= 0 &&
      pixelY < capture.height
    ) {
      let index = (pixelX + pixelY * capture.width) * 4;
      let r = capture.pixels[index];
      let g = capture.pixels[index + 1];
      let b = capture.pixels[index + 2];
      let brightness = (r + g + b) / 3;
      if (brightness < 120) {
        sugarCubes = sugarCubes.filter((cube) => cube !== selectedCube);
        addGlitchEffect(selectedCube.consumption);
        sugarEatSounds[selectedCube.soundIndex].play();

        if (sugarCubes.length === 0) {
          allCubesEaten = true;
          finalAnimation = true;
          finalNumber = sugarData.reduce(
            (sum, data) => sum + data.consumption,
            0
          );
        }

        selectedCube = null;
        return;
      }
    }

    selectedCube.velocity.set(0, 2);
    selectedCube.onGround = false;
    selectedCube = null;
  }
}

function addGlitchEffect(consumption) {
  let attempts = 0;
  let maxAttempts = 200;
  let newShape;

  while (attempts < maxAttempts) {
    attempts++;
    let vertices = [];
    let centerX = random(capture.width);
    let centerY = random(capture.height);
    let points = floor(random(6, 12));
    let scale = map(consumption, 31.7, 43.0, 20, 150);
    for (let i = 0; i < points; i++) {
      let angle = (TWO_PI / points) * i;
      let radius = random(scale * 0.5, scale * 1.5);
      vertices.push({
        x: centerX + cos(angle) * radius,
        y: centerY + sin(angle) * radius,
      });
    }

    vertices = adjustVerticesForPuzzle(vertices);
    newShape = { vertices };

    let isOverlapping = glitchShapes.some((existingShape) => {
      return shapesOverlap(newShape, existingShape, 2);
    });

    if (!isOverlapping) {
      glitchShapes.push(newShape);
      return;
    }
  }

  if (newShape) {
    glitchShapes.push(newShape);
  }
}

function adjustVerticesForPuzzle(vertices) {
  let adjustedVertices = [];
  for (let i = 0; i < vertices.length; i++) {
    let current = vertices[i];
    let next = vertices[(i + 1) % vertices.length];

    adjustedVertices.push(current);

    let midX = (current.x + next.x) / 2;
    let midY = (current.y + next.y) / 2;
    let perpX = -(next.y - current.y);
    let perpY = next.x - current.x;
    let len = sqrt(perpX * perpX + perpY * perpY);
    perpX /= len;
    perpY /= len;
    let bulgeAmount = random(3, 10);
    let bulgeX = midX + perpX * bulgeAmount;
    let bulgeY = midY + perpY * bulgeAmount;
    adjustedVertices.push({ x: bulgeX, y: bulgeY });
  }
  return adjustedVertices;
}

function isPointInsidePolygon(px, py, vertices) {
  let collision = false;
  let next = 0;
  for (let current = 0; current < vertices.length; current++) {
    next = current + 1;
    if (next == vertices.length) next = 0;
    let vc = vertices[current];
    let vn = vertices[next];
    if (
      ((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) &&
      px < ((vn.x - vc.x) * (py - vc.y)) / (vn.y - vc.y) + vc.x
    ) {
      collision = !collision;
    }
  }
  return collision;
}

function shapesOverlap(shape1, shape2, tolerance) {
  for (let vertex of shape1.vertices) {
    if (isPointInsidePolygon(vertex.x, vertex.y, shape2.vertices)) {
      let distance = distanceToPolygonEdge(vertex, shape2.vertices);
      if (distance > tolerance) {
        return true;
      }
    }
  }
  for (let vertex of shape2.vertices) {
    if (isPointInsidePolygon(vertex.x, vertex.y, shape1.vertices)) {
      let distance = distanceToPolygonEdge(vertex, shape1.vertices);
      if (distance > tolerance) {
        return true;
      }
    }
  }
  return false;
}

function distanceToPolygonEdge(point, vertices) {
  let minDistance = Infinity;
  for (let i = 0; i < vertices.length; i++) {
    let start = vertices[i];
    let end = vertices[(i + 1) % vertices.length];
    let distance = distanceToLineSegment(point, start, end);
    minDistance = min(minDistance, distance);
  }
  return minDistance;
}

function distanceToLineSegment(p, v, w) {
  let l2 = dist(v.x, v.y, w.x, w.y);
  if (l2 == 0) return dist(p.x, p.y, v.x, v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = constrain(t, 0, 1);
  let projX = v.x + t * (w.x - v.x);
  let projY = v.y + t * (w.y - v.y);
  return dist(p.x, p.y, projX, projY);
}

class SugarCube {
  constructor(x, y, year, consumption, soundIndex) {
    this.pos = createVector(x, y);
    this.size = 66;
    this.velocity = createVector(0, 0);
    this.rotation = random(-PI / 12, PI / 12);
    this.angularVelocity = random(-0.01, 0.01);
    this.onGround = false;
    this.bounceCount = 0;
    this.year = year;
    this.consumption = consumption;
    this.soundIndex = soundIndex;
  }

  update(otherCubes) {
    if (!this.onGround) {
      this.pos.y += this.velocity.y;
      this.velocity.y += gravity;
      this.rotation += this.angularVelocity;

      if (this.pos.y + this.size >= groundLevel) {
        this.pos.y = groundLevel - this.size;
        this.velocity.y *= -0.1;
        this.angularVelocity *= 0.3;
        this.bounceCount++;
        if (this.bounceCount > 0 || abs(this.velocity.y) < 0.1) {
          this.velocity.y = 0;
          this.onGround = true;
        }
      }

      for (let other of otherCubes) {
        if (other === this) continue;
        if (
          abs(this.pos.x - other.pos.x) < this.size &&
          this.pos.y + this.size > other.pos.y &&
          this.pos.y < other.pos.y
        ) {
          this.pos.y = other.pos.y - this.size * 1.1;
          this.velocity.y = 0;
          this.onGround = true;
        }
      }
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    fill(255, 250, 240);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, this.size, this.size);

    fill("#d9d7d0");
    textSize(40);
    textAlign(CENTER, CENTER);
    text(str(this.year).slice(-2), 0, -5);  // Posunuto o 5 pixelů nahoru
    pop();
  }
}

function keyPressed() {
  if (key === "o" || key === "O") {
    outro = true;
  }
}