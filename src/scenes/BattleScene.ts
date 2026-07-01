    // Subscribe to EggSystem events
    this.eggSystem.on('EggGenerated', (eggs: RuntimeEgg[]) => {
      // refresh egg UI with runtime eggs (eggId is numeric)
      this.eggsUI?.refresh(eggs)
    })

    this.eggSystem.on('EggOpened', (egg: RuntimeEgg) => {
-      // For now just refresh UI
-      this.eggsUI?.refresh(this.eggSystem.getAll())
+      // When an egg is opened, let PetSystem roll and execute the pet effect
+      // PetSystem will decide targets and emit PetExecuted
+      this.petSystem.executeFromEgg(egg, this.monsterSystem.getAll())
+      // refresh egg UI immediately
+      this.eggsUI?.refresh(this.eggSystem.getAll())
    })
+
+    // Listen for executed pet effects
+    this.petSystem.on('PetExecuted', (p: any) => {
+      const petName = p.petName
+      const effect = p.effectType
+      if (effect === 'Attack') {
+        const targets: string[] = p.targets ?? []
+        const value: number = p.value ?? 0
+        // Forward damage to MonsterSystem for each target
+        for (const tid of targets) {
+          this.monsterSystem.damage(tid, value)
+        }
+        // Refresh enemy UI and append a single log line
+        this.enemies?.refresh(this.monsterSystem.getAll())
+        if (targets.length > 0) {
+          const firstTarget = this.monsterSystem.getAll().find(m => m.id === targets[0])
+          const targetName = firstTarget ? firstTarget.name : targets[0]
+          this.appendLog(`${petName} attacked ${targetName}`)
+        } else {
+          this.appendLog(`${petName} attacked`) 
+        }
+        this.logPanel?.refresh(this.logs)
+      } else if (effect === 'HealHP') {
+        const value: number = p.value ?? 0
+        this.playerRuntime.heal(value)
+        // Refresh HUD and PlayerPanel
+        const playerForUI = { ...this.playerConfig, currentHP: this.playerRuntime.getCurrentHp(), maxHP: this.playerRuntime.getMaxHp(), coin: this.playerRuntime.getCoins() }
+        this.topUI?.refresh(playerForUI as any)
+        this.playersUI?.refresh(playerForUI as any, this.petsConfig)
+        this.appendLog(`${petName} healed Player ${value} HP`)
+        this.logPanel?.refresh(this.logs)
+      } else if (effect === 'GainCoin') {
+        const value: number = p.value ?? 0
+        this.playerRuntime.gainCoin(value)
+        const playerForUI = { ...this.playerConfig, currentHP: this.playerRuntime.getCurrentHp(), maxHP: this.playerRuntime.getMaxHp(), coin: this.playerRuntime.getCoins() }
+        this.topUI?.refresh(playerForUI as any)
+        this.playersUI?.refresh(playerForUI as any, this.petsConfig)
+        this.appendLog(`${petName} gained ${value} Coins`)
+        this.logPanel?.refresh(this.logs)
+      } else {
+        // Unknown effect: just log name
+        this.appendLog(`${petName} executed ${effect}`)
+        this.logPanel?.refresh(this.logs)
+      }
+    })
