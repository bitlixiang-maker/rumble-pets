import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import StartScene from './scenes/StartScene'
import BattleScene from './scenes/BattleScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.NONE,
    width: 1920,
    height: 1080,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, StartScene, BattleScene],
  parent: 'app'
}

window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
  ;(window as any).game = game
})
