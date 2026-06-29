import Phaser from 'phaser'
import { SCREEN_WIDTH, MARGIN, PANEL_SIZES } from '../ui/UIConstants'

// LayoutManager centralizes UI layout calculations. It uses the fixed
// virtual resolution (SCREEN_WIDTH) to compute scale and derives panel
// rectangles from UIConstants. BattleScene should only read these
// rectangles and never compute positions itself.

export default class LayoutManager {
  private static screenWidth = SCREEN_WIDTH
  private static screenHeight = 0
  private static scale = 1

  private static topHUDRect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle()
  private static enemyPanelRect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle()
  private static eggPanelRect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle()
  private static playerPanelRect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle()
  private static battleLogRect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle()
  private static primaryButtonRect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle()

  // initialize with actual screen size (from scene.scale)
  static initialize(screenWidth: number, screenHeight: number) {
    LayoutManager.screenWidth = screenWidth
    LayoutManager.screenHeight = screenHeight
    LayoutManager.scale = screenWidth / SCREEN_WIDTH
    LayoutManager.computeRects()
  }

  private static computeRects() {
    const s = LayoutManager.scale
    const w = LayoutManager.screenWidth
    const h = LayoutManager.screenHeight

    const topH = Math.round(PANEL_SIZES.topHudHeight * s)
    const enemyH = Math.round(PANEL_SIZES.enemyPanelHeight * s)
    const eggH = Math.round(PANEL_SIZES.eggPanelHeight * s)
    const playerH = Math.round(PANEL_SIZES.playerPanelHeight * s)
    const logW = Math.round(PANEL_SIZES.logPanelWidth * s)
    const logH = Math.round(PANEL_SIZES.logPanelHeight * s)
    const btnW = Math.round(PANEL_SIZES.buttonWidth * s)
    const btnH = Math.round(PANEL_SIZES.buttonHeight * s)
    const margin = Math.round(MARGIN * s)

    LayoutManager.topHUDRect.setTo(0, 0, w, topH)

    const enemyY = topH + margin
    LayoutManager.enemyPanelRect.setTo(0, enemyY, w, enemyH)

    const eggY = enemyY + enemyH + margin
    LayoutManager.eggPanelRect.setTo(0, eggY, w, eggH)

    LayoutManager.playerPanelRect.setTo(0, h - playerH, w, playerH)

    LayoutManager.battleLogRect.setTo(margin, h - logH - margin, logW, logH)

    LayoutManager.primaryButtonRect.setTo(Math.round((w - btnW) / 2), h - btnH - Math.round(margin / 2), btnW, btnH)
  }

  static getTopHUDRect(): Phaser.Geom.Rectangle {
    const r = LayoutManager.topHUDRect
    return new Phaser.Geom.Rectangle(r.x, r.y, r.width, r.height)
  }

  static getEnemyPanelRect(): Phaser.Geom.Rectangle {
    const r = LayoutManager.enemyPanelRect
    return new Phaser.Geom.Rectangle(r.x, r.y, r.width, r.height)
  }

  static getEggPanelRect(): Phaser.Geom.Rectangle {
    const r = LayoutManager.eggPanelRect
    return new Phaser.Geom.Rectangle(r.x, r.y, r.width, r.height)
  }

  static getPlayerPanelRect(): Phaser.Geom.Rectangle {
    const r = LayoutManager.playerPanelRect
    return new Phaser.Geom.Rectangle(r.x, r.y, r.width, r.height)
  }

  static getBattleLogRect(): Phaser.Geom.Rectangle {
    const r = LayoutManager.battleLogRect
    return new Phaser.Geom.Rectangle(r.x, r.y, r.width, r.height)
  }

  static getPrimaryButtonRect(): Phaser.Geom.Rectangle {
    const r = LayoutManager.primaryButtonRect
    return new Phaser.Geom.Rectangle(r.x, r.y, r.width, r.height)
  }
}
