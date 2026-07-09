import Phaser from "phaser";
import { playCorrect, playWrong, playFanfare } from "../../lib/sounds";

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

interface ShapeDef {
  key: string;
  color: number;
  kind: "circle" | "square" | "triangle" | "star" | "diamond";
}

const SHAPES: ShapeDef[] = [
  { key: "shape-red", color: 0xf43f5e, kind: "circle" },
  { key: "shape-blue", color: 0x0ea5e9, kind: "square" },
  { key: "shape-yellow", color: 0xfacc15, kind: "star" },
  { key: "shape-green", color: 0x22c55e, kind: "triangle" },
  { key: "shape-purple", color: 0xa855f7, kind: "diamond" },
];

const SHAPE_SIZE = 72;

export class PatternScene extends Phaser.Scene {
  private sequence: ShapeDef[] = [];
  private target!: ShapeDef;
  private poolSize = 3; // how many distinct shapes are in play this level
  private level = 1;
  private score = 0;
  private lives = 3;
  private streak = 0;
  private roundsThisLevel = 0;
  private gameOver = false;

  private spawnTimer!: Phaser.Time.TimerEvent;
  private lastTargetSpawn = 0;
  private floaters!: Phaser.GameObjects.Group;

  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private sequenceIcons: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("pattern");
  }

  create() {
    this.drawTextures();
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.streak = 0;
    this.roundsThisLevel = 0;
    this.gameOver = false;
    this.lastTargetSpawn = 0;

    // Header panel for the sequence
    this.add.rectangle(GAME_WIDTH / 2, 55, GAME_WIDTH - 20, 96, 0xffffff, 0.92).setStrokeStyle(4, 0xdcfce8);

    this.floaters = this.add.group();

    this.scoreText = this.add
      .text(16, 116, "⭐ 0", { fontFamily: "Baloo 2, sans-serif", fontSize: "26px", color: "#1e293b" })
      .setDepth(10);
    this.levelText = this.add
      .text(GAME_WIDTH / 2, 116, "Level 1", { fontFamily: "Baloo 2, sans-serif", fontSize: "26px", color: "#16a34a" })
      .setOrigin(0.5, 0)
      .setDepth(10);
    this.livesText = this.add
      .text(GAME_WIDTH - 16, 116, "❤️❤️❤️", { fontSize: "24px" })
      .setOrigin(1, 0)
      .setDepth(10);

    this.newRound();

    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay(),
      loop: true,
      callback: () => this.spawnFloater(),
    });
  }

  private resetSpawnTimer() {
    this.spawnTimer.remove();
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay(),
      loop: true,
      callback: () => this.spawnFloater(),
    });
  }

  update() {
    if (this.gameOver) return;
    for (const obj of this.floaters.getChildren() as Phaser.GameObjects.Image[]) {
      if (obj.y < -SHAPE_SIZE) obj.destroy();
    }
  }

  // ------------------------------------------------------------- textures
  private drawTextures() {
    if (this.textures.exists(SHAPES[0].key)) return;
    const s = SHAPE_SIZE;
    for (const def of SHAPES) {
      const g = this.add.graphics();
      g.fillStyle(def.color, 1);
      g.lineStyle(5, 0xffffff, 0.9);
      const half = s / 2;
      switch (def.kind) {
        case "circle":
          g.fillCircle(half, half, half - 4);
          g.strokeCircle(half, half, half - 4);
          break;
        case "square":
          g.fillRoundedRect(6, 6, s - 12, s - 12, 12);
          g.strokeRoundedRect(6, 6, s - 12, s - 12, 12);
          break;
        case "triangle":
          g.fillTriangle(half, 6, s - 6, s - 8, 6, s - 8);
          g.strokeTriangle(half, 6, s - 6, s - 8, 6, s - 8);
          break;
        case "diamond": {
          const pts = [half, 4, s - 4, half, half, s - 4, 4, half];
          g.fillPoints(
            [new Phaser.Geom.Point(pts[0], pts[1]), new Phaser.Geom.Point(pts[2], pts[3]), new Phaser.Geom.Point(pts[4], pts[5]), new Phaser.Geom.Point(pts[6], pts[7])],
            true,
          );
          break;
        }
        case "star": {
          const points: Phaser.Geom.Point[] = [];
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? half - 4 : (half - 4) * 0.45;
            const a = -Math.PI / 2 + (i * Math.PI) / 5;
            points.push(new Phaser.Geom.Point(half + r * Math.cos(a), half + r * Math.sin(a)));
          }
          g.fillPoints(points, true);
          break;
        }
      }
      g.generateTexture(def.key, s, s);
      g.destroy();
    }
    // small white square for particles
    const p = this.add.graphics();
    p.fillStyle(0xffffff, 1);
    p.fillCircle(6, 6, 6);
    p.generateTexture("particle", 12, 12);
    p.destroy();
  }

  // ------------------------------------------------------------- rounds
  private sequenceLength(): number {
    return Math.min(4 + Math.floor((this.level - 1) / 2), 8);
  }

  private spawnDelay(): number {
    return Math.max(400, 950 - this.level * 60);
  }

  private floatSpeed(): number {
    return 90 + this.level * 18;
  }

  private newRound() {
    this.poolSize = Math.min(2 + Math.ceil(this.level / 2), SHAPES.length);
    const pool = SHAPES.slice(0, this.poolSize);
    const len = this.sequenceLength();

    // Build a repeating pattern: pick a motif of 2-3 shapes and repeat it.
    const motifLen = this.level < 3 ? 2 : Phaser.Math.Between(2, 3);
    const motif = Phaser.Utils.Array.Shuffle([...pool]).slice(0, motifLen);
    this.sequence = Array.from({ length: len }, (_, i) => motif[i % motifLen]);
    this.target = this.sequence[len - 1];
    this.lastTargetSpawn = this.time.now; // reset the guarantee clock

    this.renderSequence();
  }

  private renderSequence() {
    this.sequenceIcons.forEach((o) => o.destroy());
    this.sequenceIcons = [];
    const len = this.sequence.length;
    const iconSize = 52;
    const gap = 14;
    const totalW = len * iconSize + (len - 1) * gap;
    let x = GAME_WIDTH / 2 - totalW / 2 + iconSize / 2;
    for (let i = 0; i < len; i++) {
      if (i === len - 1) {
        const box = this.add
          .rectangle(x, 55, iconSize, iconSize, 0xf1f5f9)
          .setStrokeStyle(4, 0x94a3b8, 1);
        const q = this.add
          .text(x, 55, "?", { fontFamily: "Baloo 2, sans-serif", fontSize: "38px", color: "#64748b" })
          .setOrigin(0.5);
        this.tweens.add({ targets: [box, q], scale: { from: 1, to: 1.12 }, yoyo: true, repeat: -1, duration: 500 });
        this.sequenceIcons.push(box, q);
      } else {
        const img = this.add.image(x, 55, this.sequence[i].key).setDisplaySize(iconSize, iconSize);
        this.sequenceIcons.push(img);
      }
      x += iconSize + gap;
    }
  }

  // ------------------------------------------------------------- floaters
  private spawnFloater() {
    if (this.gameOver) return;

    const pool = SHAPES.slice(0, this.poolSize);
    // Guarantee the correct answer appears at least every ~2.5s
    let def: ShapeDef;
    if (this.time.now - this.lastTargetSpawn > 2500) {
      def = this.target;
    } else {
      def = Phaser.Utils.Array.GetRandom(pool);
    }
    if (def.key === this.target.key) this.lastTargetSpawn = this.time.now;

    const x = Phaser.Math.Between(60, GAME_WIDTH - 60);
    const img = this.add.image(x, GAME_HEIGHT + SHAPE_SIZE, def.key).setInteractive({ useHandCursor: true });
    img.setData("shapeKey", def.key);
    this.floaters.add(img);

    const speed = this.floatSpeed() * Phaser.Math.FloatBetween(0.85, 1.2);
    const duration = ((GAME_HEIGHT + SHAPE_SIZE * 2) / speed) * 1000;
    this.tweens.add({ targets: img, y: -SHAPE_SIZE, duration, ease: "Linear" });
    // gentle horizontal wobble
    this.tweens.add({
      targets: img,
      x: x + Phaser.Math.Between(-45, 45),
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: img,
      angle: Phaser.Math.Between(-14, 14),
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    img.on("pointerdown", () => this.onTap(img));
  }

  private onTap(img: Phaser.GameObjects.Image) {
    if (this.gameOver || !img.active) return;
    const key = img.getData("shapeKey") as string;
    if (key === this.target.key) {
      this.onCorrect(img);
    } else {
      this.onWrong(img);
    }
  }

  private onCorrect(img: Phaser.GameObjects.Image) {
    playCorrect();
    const def = SHAPES.find((s) => s.key === this.target.key)!;
    this.add.particles(img.x, img.y, "particle", {
      speed: { min: 120, max: 320 },
      lifespan: 600,
      quantity: 26,
      scale: { start: 1.2, end: 0 },
      tint: [def.color, 0xffffff, 0xfacc15],
      emitting: false,
    }).explode(26);
    img.destroy();

    this.streak += 1;
    this.roundsThisLevel += 1;
    this.score += 10 * this.level;
    this.scoreText.setText(`⭐ ${this.score}`);

    // popping "+N" feedback
    const pop = this.add
      .text(img.x, img.y - 20, `+${10 * this.level}`, {
        fontFamily: "Baloo 2, sans-serif",
        fontSize: "30px",
        color: "#16a34a",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: pop, y: pop.y - 60, alpha: 0, duration: 700, onComplete: () => pop.destroy() });

    // Adaptive difficulty: 3 rounds in a row → level up
    if (this.roundsThisLevel >= 3) {
      this.levelUp();
    }
    this.newRound();
  }

  private onWrong(img: Phaser.GameObjects.Image) {
    playWrong();
    this.cameras.main.shake(180, 0.006);
    img.setTint(0x666666);
    this.tweens.add({ targets: img, alpha: 0, scale: 0.4, duration: 300, onComplete: () => img.destroy() });

    this.streak = 0;
    this.lives -= 1;
    this.livesText.setText("❤️".repeat(Math.max(0, this.lives)) || "💔");

    // Adaptive difficulty: ease off after a miss
    if (this.level > 1 && this.roundsThisLevel === 0) {
      this.level -= 1;
      this.levelText.setText(`Level ${this.level}`);
      this.resetSpawnTimer();
    }
    this.roundsThisLevel = 0;

    if (this.lives <= 0) this.endGame();
  }

  private levelUp() {
    this.level += 1;
    this.roundsThisLevel = 0;
    this.levelText.setText(`Level ${this.level}`);
    this.resetSpawnTimer();
    playFanfare();
    const banner = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `LEVEL ${this.level}!`, {
        fontFamily: "Baloo 2, sans-serif",
        fontSize: "64px",
        color: "#facc15",
        stroke: "#1e293b",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setScale(0);
    this.tweens.add({
      targets: banner,
      scale: 1,
      duration: 350,
      ease: "Back.easeOut",
      onComplete: () => {
        this.tweens.add({ targets: banner, alpha: 0, delay: 600, duration: 300, onComplete: () => banner.destroy() });
      },
    });
  }

  private endGame() {
    this.gameOver = true;
    this.spawnTimer.remove();
    this.floaters.clear(true, true);

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1e293b, 0.75).setDepth(30);
    const title = this.add
      .text(GAME_WIDTH / 2, 220, "Nice run! 🎉", {
        fontFamily: "Baloo 2, sans-serif",
        fontSize: "56px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(31);
    const scoreLine = this.add
      .text(GAME_WIDTH / 2, 300, `Score: ${this.score}   ·   Level ${this.level}`, {
        fontFamily: "Baloo 2, sans-serif",
        fontSize: "32px",
        color: "#fde047",
      })
      .setOrigin(0.5)
      .setDepth(31);
    const btn = this.add
      .text(GAME_WIDTH / 2, 400, "▶ Play again", {
        fontFamily: "Baloo 2, sans-serif",
        fontSize: "36px",
        color: "#1e293b",
        backgroundColor: "#facc15",
        padding: { x: 28, y: 14 },
      })
      .setOrigin(0.5)
      .setDepth(31)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      overlay.destroy();
      title.destroy();
      scoreLine.destroy();
      btn.destroy();
      this.scene.restart();
    });
  }
}

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#e0f2fe",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [PatternScene],
  };
}
