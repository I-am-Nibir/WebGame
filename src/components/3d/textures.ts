import * as THREE from "three";

/** Tiny procedural textures (no image files to download). Browser only. */
function make(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

/** Seeded random so textures look the same on every load. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function woodTexture(base = "#b8793a", repeat: [number, number] = [1, 1], seed = 7) {
  return make(512, 512, (c, w, h) => {
    const r = rng(seed);
    c.fillStyle = base;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      const y = r() * h;
      const amp = 2 + r() * 8;
      c.strokeStyle = r() > 0.5 ? `rgba(70,30,5,${0.05 + r() * 0.14})` : `rgba(255,220,160,${0.04 + r() * 0.1})`;
      c.lineWidth = 0.6 + r() * 2.6;
      c.beginPath();
      c.moveTo(0, y);
      c.bezierCurveTo(w * 0.3, y + amp, w * 0.6, y - amp, w, y + (r() - 0.5) * 6);
      c.stroke();
    }
    for (let k = 0; k < 2; k++) {
      const x = r() * w;
      const y = r() * h;
      for (let j = 1; j < 6; j++) {
        c.strokeStyle = `rgba(60,25,5,${0.16 - j * 0.02})`;
        c.lineWidth = 1.5;
        c.beginPath();
        c.ellipse(x, y, 14 + j * 7, 5 + j * 2.4, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }
  }, repeat);
}

export function grassTexture(repeat: [number, number] = [1, 1]) {
  return make(512, 512, (c, w, h) => {
    const r = rng(11);
    const bands = 8;
    for (let i = 0; i < bands; i++) {
      c.fillStyle = i % 2 ? "#3fbf5a" : "#33b150";
      c.fillRect(0, (i * h) / bands, w, h / bands);
    }
    for (let i = 0; i < 2600; i++) {
      const x = r() * w;
      const y = r() * h;
      c.strokeStyle = r() > 0.5 ? "rgba(20,120,50,0.35)" : "rgba(190,255,170,0.3)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (r() - 0.5) * 4, y - 3 - r() * 6);
      c.stroke();
    }
  }, repeat);
}

export function wickerTexture(repeat: [number, number] = [4, 1.4]) {
  return make(256, 256, (c, w, h) => {
    c.fillStyle = "#6b3f12";
    c.fillRect(0, 0, w, h);
    const n = 8;
    const cell = w / n;
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const horiz = (row + col) % 2 === 0;
        const x = col * cell;
        const y = row * cell;
        const g = horiz ? c.createLinearGradient(x, y, x, y + cell) : c.createLinearGradient(x, y, x + cell, y);
        g.addColorStop(0, "#e0a257");
        g.addColorStop(0.5, "#c98a3d");
        g.addColorStop(1, "#8f5a1e");
        c.fillStyle = g;
        c.beginPath();
        c.roundRect(x + 2, y + 2, cell - 4, cell - 4, 6);
        c.fill();
      }
    }
  }, repeat);
}

export function stripeTexture(a: string, b: string, stripes = 8, repeat: [number, number] = [1, 1]) {
  return make(256, 256, (c, w, h) => {
    const sw = w / stripes;
    for (let i = 0; i < stripes; i++) {
      c.fillStyle = i % 2 ? b : a;
      c.fillRect(i * sw, 0, sw + 1, h);
    }
  }, repeat);
}

export function checkerTexture(a: string, b: string, n = 6, repeat: [number, number] = [1, 1]) {
  return make(512, 512, (c, w, h) => {
    const s = w / n;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        c.fillStyle = (x + y) % 2 ? b : a;
        c.fillRect(x * s, y * s, s, s);
      }
  }, repeat);
}

/** Cat's-eye swirl for the inside of the glass marble. */
export function swirlTexture(colors = ["#ef4444", "#fde047", "#22c55e", "#ffffff"]) {
  return make(512, 256, (c, w, h) => {
    c.fillStyle = "#1d4ed8";
    c.fillRect(0, 0, w, h);
    colors.forEach((col, i) => {
      c.strokeStyle = col;
      c.lineWidth = 26;
      c.lineCap = "round";
      for (let k = 0; k < 3; k++) {
        const y0 = ((i * 3 + k) * h) / (colors.length * 3 - 1);
        c.beginPath();
        c.moveTo(-20, y0);
        c.bezierCurveTo(w * 0.25, y0 + 60, w * 0.6, y0 - 60, w + 20, y0 + 20);
        c.stroke();
      }
    });
  });
}

export function planetTexture(bands: string[]) {
  return make(512, 256, (c, w, h) => {
    const r = rng(5);
    let y = 0;
    let i = 0;
    while (y < h) {
      const bh = 14 + r() * 34;
      c.fillStyle = bands[i % bands.length];
      c.fillRect(0, y, w, bh + 1);
      y += bh;
      i++;
    }
    for (let k = 0; k < 160; k++) {
      c.strokeStyle = `rgba(255,255,255,${0.04 + r() * 0.07})`;
      c.lineWidth = 2 + r() * 5;
      const yy = r() * h;
      c.beginPath();
      c.moveTo(0, yy);
      c.bezierCurveTo(w * 0.3, yy + 8, w * 0.6, yy - 8, w, yy);
      c.stroke();
    }
  });
}

export function rockTexture() {
  return make(256, 256, (c, w, h) => {
    const r = rng(3);
    c.fillStyle = "#8d7766";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const x = r() * w;
      const y = r() * h;
      const s = 2 + r() * 14;
      const l = 40 + r() * 40;
      c.fillStyle = `hsla(28,${14 + r() * 14}%,${l}%,${0.12 + r() * 0.2})`;
      c.beginPath();
      c.arc(x, y, s, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 6; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 10 + r() * 16;
      c.fillStyle = "rgba(40,28,20,0.4)";
      c.beginPath();
      c.arc(x, y, rad, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(255,240,220,0.18)";
      c.beginPath();
      c.arc(x - rad * 0.2, y - rad * 0.2, rad * 0.8, 0, Math.PI * 2);
      c.fill();
    }
  });
}
