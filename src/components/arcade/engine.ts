/*
 * Ship It: a one-button endless runner drawn on a 2D canvas.
 * World units: the playfield is 200 units tall; its width follows the canvas aspect.
 */

export interface Palette {
  bg: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
}

type Kind = "bug" | "pair" | "wall" | "flyer";

interface Obstacle {
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Coffee {
  x: number;
  y: number;
  taken: boolean;
}

interface Popup {
  x: number;
  y: number;
  text: string;
  age: number;
}

export interface GameCallbacks {
  onScore: (score: number) => void;
  onOver: (score: number) => void;
}

const H = 200;
const GROUND = 166;
const PLAYER = { x: 46, w: 20, h: 24 };
const GRAVITY = 1900;
const JUMP_V = -560;
const HOLD_TIME = 0.18;
const STAGES = ["lint", "test", "build", "deploy"];

export class ShipItGame {
  private ctx: CanvasRenderingContext2D;
  private W = 600;
  private scale = 1;
  private dpr = 1;
  colors: Palette;
  cool = false;
  /** Font family for in-game text, read once from the canvas element. */
  private font: string;

  state: "idle" | "running" | "over" = "idle";
  private y = GROUND - PLAYER.h;
  private vy = 0;
  private grounded = true;
  private holding = false;
  private held = 0;
  private speed = 260;
  private elapsed = 0;
  private distance = 0;
  private bonus = 0;
  private obstacles: Obstacle[] = [];
  private coffees: Coffee[] = [];
  private popups: Popup[] = [];
  private nextSpawn = 0;
  private stageOffset = 0;
  private lastMilestone = 0;
  private flash = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    colors: Palette,
    private cb: GameCallbacks,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.colors = colors;
    this.font = getComputedStyle(canvas).fontFamily || "monospace";
  }

  get score() {
    return Math.floor(this.distance / 12) + this.bonus;
  }

  resize(cssWidth: number, cssHeight: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(cssWidth * this.dpr);
    this.canvas.height = Math.round(cssHeight * this.dpr);
    this.scale = cssHeight / H;
    this.W = cssWidth / this.scale;
    this.draw();
  }

  start() {
    this.state = "running";
    this.y = GROUND - PLAYER.h;
    this.vy = 0;
    this.grounded = true;
    this.holding = false;
    this.speed = 260;
    this.elapsed = 0;
    this.distance = 0;
    this.bonus = 0;
    this.obstacles = [];
    this.coffees = [];
    this.popups = [];
    this.nextSpawn = this.W * 0.9;
    this.lastMilestone = 0;
    this.flash = 0;
  }

  press() {
    if (this.state !== "running") return;
    this.holding = true;
    if (this.grounded) {
      this.vy = JUMP_V;
      this.grounded = false;
      this.held = 0;
    }
  }

  release() {
    this.holding = false;
    if (this.vy < -240) this.vy = -240;
  }

  update(dt: number) {
    if (this.state !== "running") return;
    this.elapsed += dt;
    this.speed = Math.min(640, 260 + this.elapsed * 8);
    const dx = this.speed * dt;
    this.distance += dx;
    this.stageOffset = (this.stageOffset + dx) % 100000;

    // Player: holding the button right after take-off jumps higher.
    if (!this.grounded) {
      this.held += dt;
      const g = this.holding && this.vy < 0 && this.held < HOLD_TIME ? GRAVITY * 0.45 : GRAVITY;
      this.vy += g * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND - PLAYER.h) {
        this.y = GROUND - PLAYER.h;
        this.vy = 0;
        this.grounded = true;
      }
    }

    // Spawning: the gap always leaves room to land and jump again.
    this.nextSpawn -= dx;
    if (this.nextSpawn <= 0) {
      this.spawn();
      const minGap = this.speed * 0.64 + 50;
      this.nextSpawn = minGap + Math.random() * 230;
    }

    for (const o of this.obstacles) o.x -= dx;
    for (const c of this.coffees) c.x -= dx;
    this.obstacles = this.obstacles.filter((o) => o.x + o.w > -20);
    this.coffees = this.coffees.filter((c) => c.x > -20 && !c.taken);
    for (const p of this.popups) p.age += dt;
    this.popups = this.popups.filter((p) => p.age < 0.9);
    this.flash = Math.max(0, this.flash - dt);

    // Collisions, with a small forgiving inset.
    const px = PLAYER.x + 3;
    const py = this.y + 3;
    const pw = PLAYER.w - 6;
    const ph = PLAYER.h - 4;
    for (const o of this.obstacles) {
      if (px < o.x + o.w - 2 && px + pw > o.x + 2 && py < o.y + o.h - 2 && py + ph > o.y + 2) {
        this.state = "over";
        this.cb.onOver(this.score);
        this.draw();
        return;
      }
    }
    for (const c of this.coffees) {
      if (Math.abs(c.x - (PLAYER.x + PLAYER.w / 2)) < 16 && Math.abs(c.y - (this.y + PLAYER.h / 2)) < 18) {
        c.taken = true;
        this.bonus += 25;
        this.popups.push({ x: c.x, y: c.y - 10, text: "+25", age: 0 });
      }
    }

    const milestone = Math.floor(this.score / 250);
    if (milestone > this.lastMilestone) {
      this.lastMilestone = milestone;
      this.flash = 1.4;
    }
    this.cb.onScore(this.score);
  }

  private spawn() {
    const x = this.W + 20;
    const r = Math.random();
    const flyersOn = this.score > 120;
    let kind: Kind;
    if (flyersOn && r < 0.22) kind = "flyer";
    else if (r < 0.55) kind = "bug";
    else if (r < 0.8) kind = "wall";
    else kind = "pair";

    if (kind === "bug") this.obstacles.push({ kind, x, y: GROUND - 16, w: 22, h: 16 });
    if (kind === "pair") this.obstacles.push({ kind, x, y: GROUND - 16, w: 46, h: 16 });
    if (kind === "wall") this.obstacles.push({ kind, x, y: GROUND - 32, w: 16, h: 32 });
    if (kind === "flyer") this.obstacles.push({ kind, x, y: GROUND - 47, w: 30, h: 15 });

    if (kind !== "flyer" && Math.random() < 0.28) this.coffees.push({ x: x + 6, y: GROUND - 82, taken: false });
  }

  draw() {
    const { ctx, colors: c } = this;
    const s = this.scale * this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(s, 0, 0, s, 0, 0);

    // Faint dot grid drifting at a fraction of the speed, for depth.
    ctx.fillStyle = c.line;
    const drift = (this.stageOffset * 0.25) % 24;
    for (let gx = -drift; gx < this.W; gx += 24) {
      for (let gy = 16; gy < GROUND - 20; gy += 24) ctx.fillRect(gx, gy, 1.2, 1.2);
    }

    // Ground and pipeline stage markers.
    ctx.fillStyle = c.ink;
    ctx.fillRect(0, GROUND, this.W, 1.5);
    ctx.fillStyle = c.muted;
    const dash = this.stageOffset % 18;
    for (let gx = -dash; gx < this.W; gx += 18) ctx.fillRect(gx, GROUND + 7, 8, 1);
    ctx.font = `500 8px ${this.font}`;
    const spacing = 260;
    const first = Math.floor(this.stageOffset / spacing);
    for (let i = first; i < first + Math.ceil(this.W / spacing) + 2; i++) {
      const sx = i * spacing - this.stageOffset + 120;
      ctx.fillStyle = c.muted;
      ctx.fillText(`${STAGES[((i % 4) + 4) % 4]} ok`, sx, GROUND + 22);
      ctx.fillRect(sx - 6, GROUND + 15, 3, 3);
    }

    // Coffee.
    for (const k of this.coffees) {
      ctx.fillStyle = c.accent;
      ctx.fillRect(k.x - 5, k.y - 4, 10, 10);
      ctx.fillRect(k.x + 5, k.y - 2, 3, 5);
      ctx.fillStyle = c.muted;
      const wave = Math.sin(this.elapsed * 8 + k.x) * 1.2;
      ctx.fillRect(k.x - 2 + wave, k.y - 10, 1.5, 4);
      ctx.fillRect(k.x + 2 - wave, k.y - 12, 1.5, 5);
    }

    // Obstacles.
    for (const o of this.obstacles) {
      ctx.fillStyle = c.ink;
      if (o.kind === "bug" || o.kind === "pair") {
        const count = o.kind === "pair" ? 2 : 1;
        for (let b = 0; b < count; b++) this.drawBug(o.x + b * 24, o.y);
      } else if (o.kind === "wall") {
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.fillStyle = c.bg;
        ctx.font = `700 7px ${this.font}`;
        for (let r = 0; r < 3; r++) ctx.fillText(r % 2 ? ">>" : "<<", o.x + 2.5, o.y + 9 + r * 9);
      } else {
        const bob = Math.sin(this.elapsed * 6 + o.x * 0.05) * 1.5;
        ctx.fillRect(o.x, o.y + bob, o.w, o.h);
        ctx.fillStyle = c.bg;
        ctx.font = `700 9px ${this.font}`;
        ctx.fillText("500", o.x + 4, o.y + 11 + bob);
      }
    }

    this.drawPlayer();

    // Popups and milestone banner.
    ctx.font = `600 9px ${this.font}`;
    for (const p of this.popups) {
      ctx.globalAlpha = 1 - p.age / 0.9;
      ctx.fillStyle = c.accent;
      ctx.fillText(p.text, p.x - 8, p.y - p.age * 24);
    }
    ctx.globalAlpha = 1;
    if (this.flash > 0) {
      ctx.globalAlpha = Math.min(1, this.flash * 2);
      ctx.fillStyle = c.accent;
      ctx.font = `700 13px ${this.font}`;
      const text = `v${this.lastMilestone}.0 shipped`;
      const w = ctx.measureText(text).width;
      ctx.fillText(text, this.W / 2 - w / 2, 44);
      ctx.globalAlpha = 1;
    }
  }

  private drawBug(x: number, y: number) {
    const { ctx } = this;
    const legs = Math.floor(this.elapsed * 14) % 2;
    ctx.fillRect(x + 4, y + 3, 14, 9);
    ctx.fillRect(x + 1, y + 5, 4, 5);
    ctx.fillRect(x + 6, y, 1.5, 4);
    ctx.fillRect(x + 1, y - 1, 1.5, 3);
    for (let l = 0; l < 3; l++) {
      const lx = x + 6 + l * 4 + (legs && l % 2 ? 1 : 0);
      ctx.fillRect(lx, y + 12, 1.5, 4);
    }
  }

  private drawPlayer() {
    const { ctx, colors: c } = this;
    const x = PLAYER.x;
    const y = this.y;
    const run = this.state === "running" && this.grounded ? Math.floor(this.elapsed * 12) % 2 : 0;
    // Body: a small packet with a header stripe.
    ctx.fillStyle = c.accent;
    ctx.fillRect(x, y, PLAYER.w, PLAYER.h - 5);
    ctx.fillStyle = c.ink;
    ctx.fillRect(x, y + 6, PLAYER.w, 1.5);
    // Eye, or sunglasses after the Konami code.
    if (this.cool) {
      ctx.fillRect(x + 8, y + 2.5, 11, 3.5);
    } else if (this.state === "over") {
      ctx.fillRect(x + 12, y + 2, 1.5, 1.5);
      ctx.fillRect(x + 15, y + 2, 1.5, 1.5);
      ctx.fillRect(x + 13.5, y + 3.5, 1.5, 1.5);
      ctx.fillRect(x + 12, y + 5, 1.5, 1.5);
      ctx.fillRect(x + 15, y + 5, 1.5, 1.5);
    } else {
      ctx.fillRect(x + 13, y + 2, 3, 3);
    }
    // Legs.
    ctx.fillStyle = c.ink;
    if (!this.grounded) {
      ctx.fillRect(x + 4, y + PLAYER.h - 5, 3, 3);
      ctx.fillRect(x + 13, y + PLAYER.h - 5, 3, 3);
    } else {
      ctx.fillRect(x + 4, y + PLAYER.h - 5, 3, run ? 5 : 3);
      ctx.fillRect(x + 13, y + PLAYER.h - 5, 3, run ? 3 : 5);
    }
  }
}
