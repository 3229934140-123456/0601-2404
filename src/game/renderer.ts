import type { Particle, ActiveEffect } from '../types';
import type {
  MinecartState,
  GameEntity,
  ParallaxLayers,
  TrackPositions,
  EngineState,
  RendererConfig,
  HUDConfig,
  ParticleSystemConfig,
} from './types';
import { TRACK_COUNT } from './types';

let particleIdCounter = 0;

const generateParticleId = (): string => {
  particleIdCounter += 1;
  return `particle-${Date.now()}-${particleIdCounter}`;
};

export class ParticleSystem {
  private particles: Particle[];
  private config: ParticleSystemConfig;

  constructor(config: ParticleSystemConfig) {
    this.particles = [];
    this.config = config;
  }

  emit(
    x: number,
    y: number,
    color: string,
    count: number = 5,
    speed: number = 100,
    size: number = 4,
    life: number = 0.5
  ): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.config.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.5 + Math.random() * 0.5);

      this.particles.push({
        id: generateParticleId(),
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - speed * 0.5,
        life,
        maxLife: life,
        color,
        size: size * (0.5 + Math.random() * 0.5),
      });
    }
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.vy += this.config.gravity * deltaTime;
      p.vx *= 1 - this.config.airResistance * deltaTime;
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= deltaTime;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  clear(): void {
    this.particles = [];
  }
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private config: RendererConfig;
  private hudConfig: HUDConfig;
  private particles: ParticleSystem;
  private parallaxLayers: ParallaxLayers;
  private scanlineCanvas: HTMLCanvasElement | null = null;
  private scanlineCtx: CanvasRenderingContext2D | null = null;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: Partial<RendererConfig> = {},
    hudConfig: Partial<HUDConfig> = {}
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.config = {
      showScanlines: true,
      scanlineIntensity: 0.15,
      pixelQuality: 'medium',
      showParticles: true,
      ...config,
    };
    this.hudConfig = {
      showScore: true,
      showDistance: true,
      showOres: true,
      showHealth: true,
      showEffects: true,
      ...hudConfig,
    };

    this.particles = new ParticleSystem({
      maxParticles: 200,
      gravity: 500,
      airResistance: 2,
    });

    this.parallaxLayers = {
      far: { speed: 0.2, offset: 0, color: '#1a1a2e' },
      middle: { speed: 0.5, offset: 0, color: '#16213e' },
      near: { speed: 1, offset: 0, color: '#0f3460' },
    };

    this.initScanlines();
  }

  private initScanlines(): void {
    if (!this.config.showScanlines) return;

    this.scanlineCanvas = document.createElement('canvas');
    this.scanlineCanvas.width = 1;
    this.scanlineCanvas.height = 4;
    this.scanlineCtx = this.scanlineCanvas.getContext('2d');

    if (this.scanlineCtx) {
      const imgData = this.scanlineCtx.createImageData(1, 4);
      for (let i = 0; i < 4; i++) {
        const alpha = i % 2 === 0 ? 255 * this.config.scanlineIntensity : 0;
        imgData.data[i * 4] = 0;
        imgData.data[i * 4 + 1] = 0;
        imgData.data[i * 4 + 2] = 0;
        imgData.data[i * 4 + 3] = alpha;
      }
      this.scanlineCtx.putImageData(imgData, 0, 0);
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  updateParallax(speed: number, deltaTime: number): void {
    this.parallaxLayers.far.offset += speed * this.parallaxLayers.far.speed * deltaTime;
    this.parallaxLayers.middle.offset += speed * this.parallaxLayers.middle.speed * deltaTime;
    this.parallaxLayers.near.offset += speed * this.parallaxLayers.near.speed * deltaTime;
  }

  clear(): void {
    this.ctx.fillStyle = '#0a0a0f';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawParallaxBackground(backgroundColor: string): void {
    const { far, middle, near } = this.parallaxLayers;

    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.drawFarLayer(far.offset);
    this.drawMiddleLayer(middle.offset);
    this.drawNearLayer(near.offset);
  }

  private drawFarLayer(offset: number): void {
    const tileWidth = 200;
    const startX = -(offset % tileWidth);
    const y = this.height * 0.3;

    this.ctx.fillStyle = 'rgba(50, 40, 60, 0.6)';
    for (let x = startX; x < this.width + tileWidth; x += tileWidth) {
      const height = 80 + Math.sin(x * 0.01) * 30;
      this.drawPixelRect(x, y - height, tileWidth - 10, height);
    }
  }

  private drawMiddleLayer(offset: number): void {
    const tileWidth = 150;
    const startX = -(offset % tileWidth);
    const y = this.height * 0.5;

    this.ctx.fillStyle = 'rgba(80, 60, 90, 0.7)';
    for (let x = startX; x < this.width + tileWidth; x += tileWidth) {
      const height = 120 + Math.sin(x * 0.02) * 40;
      this.drawPixelRect(x, y - height, tileWidth - 8, height);

      this.ctx.fillStyle = 'rgba(100, 80, 110, 0.8)';
      for (let i = 0; i < 3; i++) {
        const crystalX = x + 20 + i * 40;
        const crystalY = y - height + 20 + i * 15;
        this.drawPixelRect(crystalX, crystalY, 8, 20);
      }
      this.ctx.fillStyle = 'rgba(80, 60, 90, 0.7)';
    }
  }

  private drawNearLayer(offset: number): void {
    const tileWidth = 100;
    const startX = -(offset % tileWidth);
    const y = this.height * 0.7;

    this.ctx.fillStyle = 'rgba(100, 80, 100, 0.9)';
    for (let x = startX; x < this.width + tileWidth; x += tileWidth) {
      const height = 150 + Math.sin(x * 0.03) * 30;
      this.drawPixelRect(x, y - height, tileWidth - 5, height);
    }
  }

  drawTracks(trackPositions: TrackPositions, trackWidth: number): void {
    const groundY = this.height * 0.75;

    this.ctx.fillStyle = '#2a2a3a';
    this.ctx.fillRect(0, groundY, this.width, this.height - groundY);

    const trackStartX = trackPositions.left - (trackWidth - 60) / 2;
    for (let i = 0; i < TRACK_COUNT; i++) {
      const x = trackStartX + i * trackWidth;

      this.ctx.fillStyle = '#4a3a2a';
      this.drawPixelRect(x, groundY - 20, trackWidth - 10, 15);

      this.ctx.fillStyle = '#8b7355';
      for (let j = 0; j < trackWidth; j += 25) {
        this.drawPixelRect(x + j, groundY - 18, 15, 12);
      }

      this.ctx.fillStyle = '#c0c0c0';
      this.drawPixelRect(x + 5, groundY - 20, 4, 15);
      this.drawPixelRect(x + trackWidth - 19, groundY - 20, 4, 15);
    }

    this.ctx.fillStyle = '#5a5a6a';
    for (let x = 0; x < this.width; x += 20) {
      this.drawPixelRect(x, groundY - 2, 15, 4);
    }
  }

  drawMinecart(minecart: MinecartState, color: string, hasShield: boolean): void {
    const { x, y, width, height, wheelRotation } = minecart;

    this.ctx.save();

    if (hasShield) {
      this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(x + width / 2, y + height / 2, Math.max(width, height) * 0.7, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
      this.ctx.beginPath();
      this.ctx.arc(x + width / 2, y + height / 2, Math.max(width, height) * 0.7, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = color;
    this.drawPixelRect(x + 5, y + 10, width - 10, height - 25);

    this.ctx.fillStyle = this.darkenColor(color, 0.3);
    this.drawPixelRect(x, y + height - 25, width, 15);

    this.ctx.fillStyle = '#2a2a3a';
    this.drawPixelRect(x + 8, y, width - 16, 15);

    this.ctx.fillStyle = '#87ceeb';
    this.drawPixelRect(x + 12, y + 3, width - 24, 10);

    this.ctx.fillStyle = '#ffd700';
    this.drawPixelRect(x + 15, y + 18, 8, 8);
    this.drawPixelRect(x + width - 23, y + 18, 8, 8);

    this.ctx.fillStyle = '#1a1a1a';
    const wheelRadius = 12;
    const wheelY = y + height - 12;

    this.drawWheel(x + 15, wheelY, wheelRadius, wheelRotation);
    this.drawWheel(x + width - 15, wheelY, wheelRadius, wheelRotation);

    this.ctx.restore();
  }

  private drawWheel(x: number, y: number, radius: number, rotation: number): void {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);

    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#4a4a4a';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const spokeX = Math.cos(angle) * radius * 0.5;
      const spokeY = Math.sin(angle) * radius * 0.5;
      this.ctx.fillRect(spokeX - 2, spokeY - 2, 4, 4);
    }

    this.ctx.fillStyle = '#6a6a6a';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawEntity(entity: GameEntity): void {
    switch (entity.type) {
      case 'ore':
        this.drawOre(entity);
        break;
      case 'obstacle':
        this.drawObstacle(entity);
        break;
      case 'bat':
        this.drawBat(entity);
        break;
      case 'cavein':
        this.drawCaveIn(entity);
        break;
      case 'boost':
        this.drawBoost(entity);
        break;
      case 'shield':
        this.drawShieldItem(entity);
        break;
      case 'magnet':
        this.drawMagnetItem(entity);
        break;
    }
  }

  private drawOre(entity: GameEntity): void {
    const { x, y, width, height } = entity;

    this.ctx.fillStyle = '#ffd700';
    this.drawPixelRect(x + 4, y + 4, width - 8, height - 8);

    this.ctx.fillStyle = '#ffec8b';
    this.drawPixelRect(x + 8, y + 8, width - 20, height - 20);

    this.ctx.fillStyle = '#ffffff';
    this.drawPixelRect(x + 10, y + 10, 6, 6);

    this.ctx.fillStyle = '#b8860b';
    this.drawPixelRect(x, y + height - 8, width, 8);
  }

  private drawObstacle(entity: GameEntity): void {
    const { x, y, width, height } = entity;

    this.ctx.fillStyle = '#5a4a3a';
    this.drawPixelRect(x + 5, y + 5, width - 10, height - 10);

    this.ctx.fillStyle = '#7a6a5a';
    this.drawPixelRect(x + 10, y + 10, 15, 15);
    this.drawPixelRect(x + width - 25, y + height - 30, 12, 12);

    this.ctx.fillStyle = '#3a3a3a';
    this.drawPixelRect(x + 15, y + 5, 8, 15);
    this.drawPixelRect(x + width - 20, y + 20, 10, 8);

    this.ctx.fillStyle = '#8b0000';
    this.drawPixelRect(x + width / 2 - 4, y + 8, 8, 8);
  }

  private drawBat(entity: GameEntity): void {
    const { x, y, width, height } = entity;
    const wingOffset = Math.sin(Date.now() * 0.02) * 10;

    this.ctx.fillStyle = '#2a1a2a';
    this.drawPixelRect(x + width / 2 - 8, y + 5, 16, height - 10);

    this.ctx.fillStyle = '#3a2a3a';
    this.drawPixelRect(x, y + 10 + wingOffset, width / 2 - 5, height - 20);
    this.drawPixelRect(x + width / 2 + 5, y + 10 - wingOffset, width / 2 - 5, height - 20);

    this.ctx.fillStyle = '#ff0000';
    this.drawPixelRect(x + width / 2 - 6, y + 8, 4, 4);
    this.drawPixelRect(x + width / 2 + 2, y + 8, 4, 4);

    this.ctx.fillStyle = '#1a0a1a';
    this.drawPixelRect(x + width / 2 - 4, y + height - 8, 3, 6);
    this.drawPixelRect(x + width / 2 + 1, y + height - 8, 3, 6);
  }

  private drawCaveIn(entity: GameEntity): void {
    const { x, y, width, height } = entity;

    this.ctx.fillStyle = '#4a3a2a';
    this.drawPixelRect(x, y, width, height);

    this.ctx.fillStyle = '#6a5a4a';
    this.drawPixelRect(x + 5, y + 5, 20, 20);
    this.drawPixelRect(x + width - 30, y + 10, 15, 15);
    this.drawPixelRect(x + 15, y + height - 35, 18, 18);

    this.ctx.fillStyle = '#2a1a0a';
    this.drawPixelRect(x + 8, y + 30, 10, 10);
    this.drawPixelRect(x + width - 25, y + height - 25, 12, 12);

    this.ctx.fillStyle = '#5a4a3a';
    this.drawPixelRect(x + 2, y + 2, 4, 4);
    this.drawPixelRect(x + width - 6, y + 8, 4, 4);
  }

  private drawBoost(entity: GameEntity): void {
    const { x, y, width, height } = entity;
    const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;

    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.scale(pulse, pulse);
    this.ctx.translate(-(x + width / 2), -(y + height / 2));

    this.ctx.fillStyle = '#00ff88';
    this.drawPixelRect(x, y, width, height);

    this.ctx.fillStyle = '#88ffcc';
    for (let i = 0; i < width; i += 15) {
      this.drawPixelRect(x + i + 2, y + 4, 10, height - 8);
    }

    this.ctx.fillStyle = '#ffffff';
    this.drawPixelRect(x + 10, y + height / 2 - 4, 15, 8);
    this.drawPixelRect(x + width - 25, y + height / 2 - 4, 15, 8);

    this.ctx.restore();
  }

  private drawShieldItem(entity: GameEntity): void {
    const { x, y, width, height } = entity;
    const glow = 0.5 + Math.sin(Date.now() * 0.008) * 0.3;

    this.ctx.save();

    this.ctx.shadowColor = '#44aaff';
    this.ctx.shadowBlur = 10 * glow;

    this.ctx.fillStyle = '#4488ff';
    this.drawPixelRect(x + 5, y, width - 10, height * 0.3);
    this.drawPixelRect(x, y + height * 0.2, width, height * 0.5);
    this.drawPixelRect(x + 5, y + height * 0.6, width - 10, height * 0.4);

    this.ctx.fillStyle = '#88ccff';
    this.drawPixelRect(x + 10, y + 5, width - 20, 8);
    this.drawPixelRect(x + 8, y + height * 0.4, width - 16, 6);

    this.ctx.fillStyle = '#ffffff';
    this.drawPixelRect(x + width / 2 - 3, y + height * 0.35, 6, 15);
    this.drawPixelRect(x + width / 2 - 8, y + height * 0.45, 16, 6);

    this.ctx.restore();
  }

  private drawMagnetItem(entity: GameEntity): void {
    const { x, y, width, height } = entity;

    this.ctx.fillStyle = '#cc3333';
    this.drawPixelRect(x, y, width * 0.35, height * 0.8);

    this.ctx.fillStyle = '#3366cc';
    this.drawPixelRect(x + width * 0.65, y, width * 0.35, height * 0.8);

    this.ctx.fillStyle = '#aaaaaa';
    this.drawPixelRect(x + width * 0.35, y + height * 0.1, width * 0.3, height * 0.4);

    this.ctx.fillStyle = '#eeeeee';
    this.drawPixelRect(x, y + height * 0.8, width * 0.35, height * 0.2);
    this.drawPixelRect(x + width * 0.65, y + height * 0.8, width * 0.35, height * 0.2);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('N', x + width * 0.175, y + height * 0.5);
    this.ctx.fillText('S', x + width * 0.825, y + height * 0.5);
  }

  drawParticles(): void {
    if (!this.config.showParticles) return;

    const particles = this.particles.getParticles();
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;
      this.drawPixelRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    this.ctx.globalAlpha = 1;
  }

  drawHUD(state: EngineState, minecartHealth: number, maxHealth: number): void {
    this.ctx.save();

    if (this.hudConfig.showScore) {
      this.drawText(`分数: ${state.score}`, 20, 35, '#ffffff', 24);
    }

    if (this.hudConfig.showDistance) {
      this.drawText(`距离: ${Math.floor(state.distance)}m`, 20, 65, '#cccccc', 18);
    }

    if (this.hudConfig.showOres) {
      this.ctx.fillStyle = '#ffd700';
      this.drawPixelRect(20, 80, 20, 20);
      this.drawText(`x ${state.ores}`, 48, 97, '#ffd700', 18);
    }

    if (this.hudConfig.showHealth) {
      this.drawHealthBar(this.width - 220, 20, 200, 25, minecartHealth, maxHealth);
    }

    if (this.hudConfig.showEffects && state.activeEffects.length > 0) {
      this.drawActiveEffects(state.activeEffects, this.width / 2 - 100, 20);
    }

    if (state.isPaused && !state.isGameOver) {
      this.drawPauseOverlay();
    }

    if (state.isGameOver) {
      this.drawGameOverOverlay(state.score, state.distance, state.ores);
    }

    this.ctx.restore();
  }

  private drawHealthBar(x: number, y: number, width: number, height: number, current: number, max: number): void {
    const percentage = Math.max(0, current / max);

    this.ctx.fillStyle = '#333333';
    this.drawPixelRect(x, y, width, height);

    let color = '#00ff00';
    if (percentage < 0.3) {
      color = '#ff0000';
    } else if (percentage < 0.6) {
      color = '#ffff00';
    }

    this.ctx.fillStyle = color;
    this.drawPixelRect(x + 2, y + 2, (width - 4) * percentage, height - 4);

    this.ctx.strokeStyle = '#666666';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    this.drawText(`${Math.ceil(current)}/${max}`, x + width / 2, y + height / 2 + 5, '#ffffff', 14, 'center');
  }

  private drawActiveEffects(effects: ActiveEffect[], x: number, y: number): void {
    let offsetX = x;

    for (const effect of effects) {
      const percentage = effect.remainingTime / effect.duration;
      const color = this.getEffectColor(effect.type);
      const icon = this.getEffectIcon(effect.type);

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.drawPixelRect(offsetX, y, 50, 50);

      this.ctx.fillStyle = color;
      this.drawPixelRect(offsetX + 5, y + 5, 40, 40);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(icon, offsetX + 25, y + 32);

      this.ctx.fillStyle = '#333333';
      this.drawPixelRect(offsetX, y + 50, 50, 6);
      this.ctx.fillStyle = color;
      this.drawPixelRect(offsetX, y + 50, 50 * percentage, 6);

      this.drawText(`${Math.ceil(effect.remainingTime)}s`, offsetX + 25, y + 72, '#ffffff', 12, 'center');

      offsetX += 60;
    }
  }

  private getEffectColor(type: string): string {
    switch (type) {
      case 'boost':
        return '#00ff88';
      case 'shield':
        return '#4488ff';
      case 'magnet':
        return '#ff4488';
      default:
        return '#ffffff';
    }
  }

  private getEffectIcon(type: string): string {
    switch (type) {
      case 'boost':
        return '⚡';
      case 'shield':
        return '🛡';
      case 'magnet':
        return '🧲';
      default:
        return '?';
    }
  }

  private drawPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.drawText('游戏暂停', this.width / 2, this.height / 2 - 20, '#ffffff', 48, 'center');
    this.drawText('按 P 或 ESC 继续', this.width / 2, this.height / 2 + 30, '#cccccc', 24, 'center');
  }

  private drawGameOverOverlay(score: number, distance: number, ores: number): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.drawText('游戏结束', this.width / 2, this.height / 2 - 80, '#ff4444', 56, 'center');
    this.drawText(`最终得分: ${score}`, this.width / 2, this.height / 2 - 20, '#ffffff', 32, 'center');
    this.drawText(`距离: ${Math.floor(distance)}m`, this.width / 2, this.height / 2 + 20, '#cccccc', 24, 'center');
    this.drawText(`矿石: ${ores}`, this.width / 2, this.height / 2 + 55, '#ffd700', 24, 'center');
    this.drawText('按 空格键 重新开始', this.width / 2, this.height / 2 + 100, '#aaaaaa', 20, 'center');
  }

  applyScanlines(): void {
    if (!this.config.showScanlines || !this.scanlineCanvas || !this.scanlineCtx) return;

    const pattern = this.ctx.createPattern(this.scanlineCanvas, 'repeat');
    if (pattern) {
      this.ctx.fillStyle = pattern;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  private drawPixelRect(x: number, y: number, width: number, height: number): void {
    const px = Math.floor(x);
    const py = Math.floor(y);
    const pw = Math.ceil(width);
    const ph = Math.ceil(height);
    this.ctx.fillRect(px, py, pw, ph);
  }

  private drawText(
    text: string,
    x: number,
    y: number,
    color: string,
    fontSize: number,
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  getParticleSystem(): ParticleSystem {
    return this.particles;
  }

  updateParticles(deltaTime: number): void {
    this.particles.update(deltaTime);
  }

  emitParticles(
    x: number,
    y: number,
    color: string,
    count: number = 5,
    speed: number = 100,
    size: number = 4,
    life: number = 0.5
  ): void {
    this.particles.emit(x, y, color, count, speed, size, life);
  }

  render(
    minecart: MinecartState,
    entities: GameEntity[],
    state: EngineState,
    trackPositions: TrackPositions,
    trackWidth: number,
    minecartColor: string,
    minecartMaxHealth: number,
    backgroundColor: string
  ): void {
    this.clear();
    this.drawParallaxBackground(backgroundColor);
    this.drawTracks(trackPositions, trackWidth);

    for (const entity of entities) {
      this.drawEntity(entity);
    }

    const hasShield = state.activeEffects.some((e) => e.type === 'shield');
    this.drawMinecart(minecart, minecartColor, hasShield);

    this.drawParticles();
    this.drawHUD(state, minecartMaxHealth, minecartMaxHealth);
    this.applyScanlines();
  }
}
