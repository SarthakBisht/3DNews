import * as THREE from 'three';
import type { Article } from './types';

const PALETTES: [string, string][] = [
  ['#27e8ff', '#8b5cff'],
  ['#ff2bd6', '#8b5cff'],
  ['#27e8ff', '#ff2bd6'],
  ['#5cffd6', '#27e8ff'],
  ['#ffb627', '#ff2bd6'],
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(`${last}…`).width > maxWidth) {
      lines[maxLines - 1] = last.slice(0, Math.max(0, last.length - 1)) + '…';
    } else {
      lines[maxLines - 1] = `${last}…`;
    }
  }
  return lines;
}

/**
 * Renders a neon "headline card" to a canvas and returns it as a texture.
 * Used both as the loading state and as the fallback when an image can't be
 * drawn into WebGL (e.g. missing CORS headers).
 */
export function makePlaceholderTexture(article: Article): THREE.Texture {
  const W = 512;
  const H = 384;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const [c1, c2] = PALETTES[hashString(article.id || article.title) % PALETTES.length];

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#05070f');
  bg.addColorStop(1, '#0a0f22');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Accent diagonal sweep
  const sweep = ctx.createLinearGradient(0, H, W, 0);
  sweep.addColorStop(0, `${c1}22`);
  sweep.addColorStop(0.5, `${c2}11`);
  sweep.addColorStop(1, '#00000000');
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = `${c1}1f`;
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Neon border
  ctx.strokeStyle = c1;
  ctx.lineWidth = 4;
  ctx.shadowColor = c1;
  ctx.shadowBlur = 18;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.shadowBlur = 0;

  // Corner brackets
  ctx.strokeStyle = c2;
  ctx.lineWidth = 3;
  const b = 28;
  const corners: [number, number, number, number][] = [
    [22, 22, 1, 1],
    [W - 22, 22, -1, 1],
    [22, H - 22, 1, -1],
    [W - 22, H - 22, -1, -1],
  ];
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx + sx * b, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * b);
    ctx.stroke();
  }

  // Source tag
  ctx.fillStyle = c1;
  ctx.font = '600 22px "Share Tech Mono", monospace';
  ctx.shadowColor = c1;
  ctx.shadowBlur = 10;
  ctx.fillText(article.source.toUpperCase().slice(0, 28), 36, 64);
  ctx.shadowBlur = 0;

  // Title
  ctx.fillStyle = '#eaf6ff';
  ctx.font = '700 30px "Orbitron", sans-serif';
  const lines = wrapLines(ctx, article.title, W - 72, 4);
  let ty = 130;
  for (const line of lines) {
    ctx.fillText(line, 36, ty);
    ty += 40;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}
