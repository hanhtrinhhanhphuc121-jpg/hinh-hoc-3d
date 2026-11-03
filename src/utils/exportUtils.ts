import * as THREE from 'three';

export interface ExportOptions {
  background: 'transparent' | 'white' | 'dark';
  blackLines: boolean; // Black stroke for exam test papers
  includeLabels: boolean;
  scaleFactor: number; // 1x, 2x, 3x for high-res print
  title?: string;
}

/**
 * Exports current Three.js canvas as high-resolution PNG
 */
export function exportCanvasAsPNG(
  canvas: HTMLCanvasElement,
  options: ExportOptions,
  filename: string = 'hinh-hoc-3d.png'
) {
  // Create an offscreen canvas to apply background or test paper styling
  const outCanvas = document.createElement('canvas');
  outCanvas.width = canvas.width;
  outCanvas.height = canvas.height;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return;

  // Background
  if (options.background === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
  } else if (options.background === 'dark') {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
  } else {
    ctx.clearRect(0, 0, outCanvas.width, outCanvas.height);
  }

  // Draw 3D scene canvas
  ctx.drawImage(canvas, 0, 0);

  // If title is requested
  if (options.title) {
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = options.background === 'white' ? '#0f172a' : '#ffffff';
    ctx.fillText(options.title, 24, 36);
  }

  // Trigger download
  const link = document.createElement('a');
  link.download = filename;
  link.href = outCanvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports 2D Unfolding net as SVG string or file download
 */
export function exportSvgNet(
  svgElement: SVGSVGElement,
  filename: string = 'hinh-khai-trien-2d.svg'
) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
