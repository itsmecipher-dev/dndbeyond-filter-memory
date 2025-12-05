# MidiQoL Integration Strategy for DDB Monster Parsing

Analysis of MidiQoL v13 for enhanced automation when parsing D&D Beyond monsters to Foundry VTT.

---

## Executive Summary

**MidiQoL** is the most popular Foundry VTT automation module with extensive workflow management for attacks, saves, damage application, and effects. Integrating MidiQoL support during DDB monster parsing will create **production-ready, fully automated** monsters that work out-of-the-box in MidiQoL-enabled games.

**Key Benefits**:
- Automated attack resolution (roll → hit/miss → damage → apply)
- Automated save resolution (DC check → damage calculation → application)
- Advantage/disadvantage automation via flags
- Conditional effects (apply on hit, on failed save, etc.)
- Reaction prompting system
- Damage resistance/immunity automation
- Concentration tracking

---

## MidiQoL Architecture Overview

### Core Workflow System

MidiQoL operates via a **state machine workflow** that processes each item use through ~30+ stages:

```
preTargeting → preItemRoll → postWaitForAttackRoll →
isHit/isMissed → postWaitForDamageRoll →
preTargetSave → postWaitForSaves →
preTargetDamageApplication → postTargetDamageApplication →
preSave/postSave → postNoAction → complete
```

Each stage allows:
- **Macro execution** (`onUse` macros at specific stages)
- **Flag evaluation** (conditional advantage, bonus damage, etc.)
- **Active effect application** (on hit, on failed save, etc.)

### Integration Points

1. **Item Flags** (`flags.midi-qol.*`) - Behavior modifiers
2. **Activity Configuration** - Foundry 5e v5+ activities enhanced by MidiQoL
3. **Active Effects** - Applied at specific workflow stages
4. **On-Use Macros** - Custom logic at workflow stages

---

## MidiQoL Flags System

### Flag Structure

Flags are stored at `flags.midi-qol.{category}.{subcategory}`

**Format**: `flags["midi-qol"].{flagName} = value`

**Setting via Active Effects**: Use mode `OVERRIDE` (5) or `CUSTOM` (0) - **NOT** `ADD` (2)

### Critical Flag Categories for Monsters

#### 1. Advantage/Disadvantage Automation

**Pattern**: `flags.midi-qol.advantage.{context}.{type}`

```yaml
# Universal advantage
flags.midi-qol.advantage.all: true

# Attack advantage
flags.midi-qol.advantage.attack.all: true
flags.midi-qol.advantage.attack.mwak: true  # melee weapon
flags.midi-qol.advantage.attack.rwak: true  # ranged weapon
flags.midi-qol.advantage.attack.msak: true  # melee spell
flags.midi-qol.advantage.attack.rsak: true  # ranged spell

# Save advantage (for the creature making saves)
flags.midi-qol.advantage.ability.save.all: true
flags.midi-qol.advantage.ability.save.dex: true
flags.midi-qol.advantage.ability.save.wis: true

# Skill advantage
flags.midi-qol.advantage.skill.all: true
flags.midi-qol.advantage.skill.prc: true  # perception
flags.midi-qol.advantage.skill.ste: true  # stealth
```

**Conditional Advantage** (v10.0.4+):
```yaml
# Advantage against specific creature types
flags.midi-qol.advantage.attack.all: "@target.type === 'dragon'"
flags.midi-qol.advantage.attack.mwak: "@target.uuid === @flags.midi-qol.favoredEnemy"
```

**DDB Use Cases**:
- Pack Tactics → `advantage.attack.all` when ally adjacent
- Keen Senses → `advantage.skill.prc`
- Evasion → Not advantage, but see "fail.all" below

#### 2. Grants Advantage/Disadvantage to Attackers

```yaml
# Grants advantage to attackers
flags.midi-qol.grants.advantage.attack.all: true  # Restrained, Paralyzed
flags.midi-qol.grants.advantage.attack.mwak: true  # Prone (melee only)

# Grants disadvantage to attackers
flags.midi-qol.grants.disadvantage.attack.all: true  # Dodge action
flags.midi-qol.grants.disadvantage.attack.rwak: true  # Prone (ranged)
```

**DDB Use Cases**:
- Prone condition
- Restrained condition
- Invisible creature
- Dodge action

#### 3. Critical Hit Modifiers

```yaml
# Expanded crit range
flags.midi-qol.critical.all: 19  # Crits on 19-20
flags.midi-qol.critical.mwak: 18  # Melee weapon crits on 18-20

# No crits possible
flags.midi-qol.noCritical.all: true
flags.midi-qol.noCritical.mwak: true
```

**DDB Use Cases**:
- Champion fighter features
- Vorpal weapons
- Creatures immune to crits

#### 4. Save Modifiers

```yaml
# Bonus to saves
flags.midi-qol.saves.all: "+1d4"  # Bless
flags.midi-qol.saves.dex: "+2"

# Minimum save roll
flags.midi-qol.min.ability.save.all: 10  # Can't roll below 10
flags.midi-qol.min.ability.save.dex: 15

# Automatic save success
flags.midi-qol.fail.all.dex: false  # Always succeeds DEX saves
flags.midi-qol.success.ability.save.dex: true

# Legendary Resistance
flags.midi-qol.legendaryResistance.count: 3
```

**DDB Use Cases**:
- Magic Resistance (advantage on saves vs spells) → see advantage flags
- Legendary Resistance
- Evasion (DEX save = half damage on fail, no damage on success)
- Abilities granting save bonuses

#### 5. Damage Modifiers

```yaml
# Bonus damage
flags.midi-qol.damage.all: "1d6"  # Hunter's Mark
flags.midi-qol.damage.mwak: "1d8[radiant]"  # Divine Smite
flags.midi-qol.damage.rwak: "@abilities.dex.mod"

# Damage multipliers
flags.midi-qol.critical.damage: "1d6"  # Extra on crit

# Optional damage bonuses (prompts user)
flags.midi-qol.optional.NAME.damage.all: "2d6"
flags.midi-qol.optional.NAME.count: "prof"  # Uses per day
flags.midi-qol.optional.NAME.label: "Divine Smite"
```

**DDB Use Cases**:
- Sneak Attack damage
- Rage damage bonus
- Spell-based extra damage (Hunter's Mark, Hex)
- Smite features

#### 6. Save Damage Multipliers

```yaml
# Half damage on successful save
flags.midi-qol.potentCantrip: true  # Cantrips do half on save instead of 0

# Full damage on save
item.flags.midi-qol.onSaveMultiplier: "1.0"

# No damage on save
item.flags.midi-qol.onSaveMultiplier: "0.0"
```

**DDB Use Cases**:
- Breath weapons (half on save)
- Evasion (no damage on save)
- Potent Cantrip (half on save)

#### 7. Special Mechanics

```yaml
# Concentration
flags.midi-qol.concentration: true  # Auto-tracked
flags.midi-qol.concentrationSaveBonus: "+4"

# Reactions
flags.midi-qol.onUseMacroName: "MacroName"
flags.midi-qol.isReaction: true
flags.midi-qol.reactionCondition: "@hitTargets.size > 0"

# AC bonuses
flags.midi-qol.ac: "+2"  # Shield spell
flags.midi-qol.ac.all: "@abilities.wis.mod"  # Unarmored Defense
```

**DDB Use Cases**:
- Parry reactions (+AC against one attack)
- Deflect Missiles
- Shield spell
- Concentration spells

#### 8. Targeting & Range

```yaml
# Range checking
flags.midi-qol.range.mwak: 10  # Extended reach
flags.midi-qol.range.rwak: 120

# Self-targeting
flags.midi-qol.isSelfTarget: true

# Ignore cover
flags.midi-qol.ignoreTotalCover: true
```

**DDB Use Cases**:
- Reach weapons
- Ranged spell attacks
- Self-buffs
- Sharpshooter (ignore cover)

#### 9. Effects Application Control

```yaml
# Apply effects on specific outcomes
flags.midi-qol.effectsOnHit: true  # Apply effects only if attack hits
flags.midi-qol.effectsOnFail: true  # Apply effects only on failed save

# Remove effects
flags.midi-qol.effectsOnSave: false  # Don't apply if save succeeds
```

**DDB Use Cases**:
- Poison on hit (apply Poisoned condition on hit)
- Stunning Strike (apply Stunned on failed save)
- Paralysis effects

---

## Item-Level Configuration

### Midi-QoL Tab Fields

When `flags["midi-qol"]` are set on items (not actors), they affect that specific item's behavior.

#### Activation Conditions

```yaml
# When to trigger this item
flags.midi-qol.activation.condition: "@target.type === 'undead'"
flags.midi-qol.activation.condition: "@actor.hp < @actor.hp.max / 2"
```

**DDB Use Cases**:
- Favored Enemy (bonus damage vs specific types)
- Wounded Fury (bonus when bloodied)

#### Other Damage Formula Control

```yaml
# Control when Other Damage is rolled
flags.midi-qol.otherCondition: "true"  # Always
flags.midi-qol.otherCondition: "@target.save.fail"  # On failed save
```

**DDB Use Cases**:
- Spider bite (base damage + poison damage on failed save)
- Monk's Stunning Strike (damage + save or stunned)

#### Save Configuration

```yaml
# Override system save DC
flags.midi-qol.saveDC: "15"

# Save ability override
flags.midi-qol.saveAbility: "con"

# Save multiplier
flags.midi-qol.saveMultiplier: 0.5  # Half damage on save
```

---

## Active Effects for MidiQoL

### Effect Transfer Settings

```yaml
effects:
  - name: "Pack Tactics"
    transfer: true  # Always active on actor
    changes:
      - key: flags.midi-qol.advantage.attack.all
        mode: 0  # CUSTOM
        value: "@allies.adjacent > 0"  # Conditional
```

### Effect from Item Activities

```yaml
activities:
  dnd5eactivity000:
    effects:
      - _id: effectId000
        # Effect applied by this activity
```

**Application Timing**:
- **Passive effects** → `transfer: true` on actor
- **On-hit effects** → Activity-linked, applied when hit confirmed
- **On-save-fail effects** → Activity-linked with save condition

### Common Active Effect Patterns

#### 1. Advantage on Attacks (Pack Tactics)

```yaml
name: "Pack Tactics"
changes:
  - key: flags.midi-qol.advantage.attack.all
    mode: 5  # OVERRIDE
    value: "true"
```

With conditional (advanced):
```yaml
changes:
  - key: flags.midi-qol.advantage.attack.all
    mode: 0  # CUSTOM
    value: |
      const allies = canvas.tokens.placeables.filter(t =>
        t.actor?.uuid !== @actor.uuid &&
        t.disposition === @token.disposition &&
        canvas.grid.measureDistance(@token, t) <= 5
      );
      return allies.length > 0;
```

#### 2. Magic Resistance

```yaml
name: "Magic Resistance"
changes:
  - key: flags.midi-qol.advantage.ability.save.all
    mode: 5
    value: "@item.type === 'spell'"  # Conditional
```

#### 3. Rage Damage Bonus

```yaml
name: "Rage"
changes:
  - key: flags.midi-qol.damage.mwak
    mode: 5
    value: "+2"
  - key: flags.midi-qol.advantage.ability.check.str
    mode: 5
    value: "true"
```

#### 4. Poisoned Condition (from Spider Bite)

Applied via activity's effects array when save fails:
```yaml
activities:
  dnd5eactivity100:  # Save activity
    type: save
    effects:
      - _id: poisonedEffect
        # Applies Poisoned condition
```

---

## Macro Integration Points

### On-Use Macros

MidiQoL extends Foundry's item macros with **workflow stage targeting**:

```yaml
flags.midi-qol.onUseMacroName: "MyMacro"
flags.midi-qol.onUseMacroParts:
  - prePreambleComplete  # Before any rolls
  - postActiveEffects     # After effects applied
  - preAttackRoll
  - postAttackRoll
  - preDamageRoll
  - postDamageRoll
  - preSave
  - postSave
  - postDamageApplication
```

**DDB Use Cases**:
- Complex reactions (Shield spell: +5 AC after seeing attack roll)
- Multi-step abilities (Stunning Strike: damage, then save, then apply stun)
- Special damage calculations

### Damage Bonus Macros

```yaml
flags.dnd5e.DamageBonusMacro: |
  if (workflow.isCritical) {
    return {damageRoll: "2d6", flavor: "Brutal Critical"};
  }
```

Returns:
```javascript
{
  damageRoll: "1d6",
  flavor: "Sneak Attack",
  damageType: "piercing"
}
```

---

## Parsing Strategy: DDB → Foundry + MidiQoL

### Phase 1: Base Item Creation
Create Foundry items using existing strategy (see `foundry-parsing-strategy.md`)

### Phase 2: MidiQoL Enhancement

For each parsed item/trait, add MidiQoL flags:

#### Step 1: Detect Special Mechanics

| DDB Pattern | MidiQoL Enhancement |
|-------------|---------------------|
| "Pack Tactics" trait | `flags.midi-qol.advantage.attack.all: "@allies.adjacent > 0"` |
| "Magic Resistance" trait | `flags.midi-qol.advantage.ability.save.all` + condition |
| "Legendary Resistance (X/Day)" | `flags.midi-qol.legendaryResistance.count: X` |
| "Keen Senses" / "Keen Smell" | `flags.midi-qol.advantage.skill.prc: true` |
| "Evasion" | `flags.midi-qol.fail.all.dex: false` (auto-succeed DEX saves) |
| "Reckless Attack" | `flags.midi-qol.advantage.attack.mwak: true` + `grants.advantage.attack.all: true` |
| "Rage" | `flags.midi-qol.damage.mwak: "+2"` + resistance effect |

#### Step 2: Parse Conditions from Descriptions

**Regex Patterns for Flag Detection**:

```javascript
// Advantage patterns
/advantage on (attack rolls?|saves?|checks?)/i
/has advantage on .+ against (.+)/i

// Disadvantage patterns
/disadvantage on (attack rolls?|saves?|checks?)/i

// Damage bonuses
/deals an extra (\d+d\d+(?:\s*\+\s*\d+)?) (.+?) damage/i

// Critical hit changes
/critical hits? on a (\d+)/i
/scores a critical hit on a roll of (\d+)/i
```

**Example Detection**:
```
"The creature has advantage on attack rolls against any creature
that doesn't have all its hit points."
```
→ Flag: `flags.midi-qol.advantage.attack.all: "@target.hp < @target.hp.max"`

#### Step 3: Configure Save-Based Abilities

For abilities with saves (breath weapons, special attacks):

```yaml
# If "half damage on save"
flags.midi-qol.onSaveMultiplier: "0.5"

# If "no damage on save" (rare)
flags.midi-qol.onSaveMultiplier: "0.0"

# If effect only on failed save
activity.effects[]:
  # Only applied when save fails (MidiQoL handles automatically)
```

#### Step 4: Configure Reactions

For reactions (Parry, Shield, etc.):

```yaml
type: feat
system:
  activation:
    type: reaction
  activities:
    dnd5eactivity000:
      activation:
        type: reaction
flags:
  midi-qol:
    isReaction: true
    reactionCondition: "@workflow.attackRoll"  # Trigger on being attacked
```

**Common Reaction Patterns**:

| DDB Reaction | MidiQoL Config |
|--------------|----------------|
| Parry (+AC vs one attack) | `reactionCondition: "@workflow.hitTargets.has(@token)"`<br>`flags.midi-qol.ac: "+@abilities.dex.mod"` (macro) |
| Shield (+5 AC vs one attack) | Macro at `preCheckHits` stage, add +5 AC temporarily |
| Deflect Missile (reduce damage) | Macro at `preDamageApplication`, reduce damage |
| Counterspell | `reactionCondition: "@item.type === 'spell'"` |

#### Step 5: Handle Ongoing Effects

For traits like "Amphibious", "Sunlight Sensitivity", etc.:

```yaml
type: feat
system:
  activities: {}  # No active activities
effects:
  - name: "Sunlight Sensitivity"
    transfer: true  # Always active
    changes:
      - key: flags.midi-qol.disadvantage.attack.all
        mode: 5
        value: "@scene.darkness < 0.5"  # In bright light
      - key: flags.midi-qol.disadvantage.skill.prc
        mode: 5
        value: "@scene.darkness < 0.5"
```

---

## Priority Enhancements for Monster Parsing

### Tier 1: Essential (Implement First)

1. **Advantage/Disadvantage Flags**
   - Pack Tactics → `advantage.attack.all` (conditional)
   - Magic Resistance → `advantage.ability.save.all` (conditional vs spells)
   - Keen Senses → `advantage.skill.prc`
   - Reckless Attack → `advantage.attack.mwak` + `grants.advantage.attack.all`

2. **Save Configuration**
   - Breath weapons → `onSaveMultiplier: 0.5`
   - Poison effects → save activity with condition application

3. **Legendary Resistance**
   - Parse "(X/Day)" → `flags.midi-qol.legendaryResistance.count: X`

### Tier 2: High Value (Implement Second)

4. **Critical Hit Modifications**
   - "critical hit on 19-20" → `flags.midi-qol.critical.all: 19`

5. **Bonus Damage**
   - "deals extra Xd6 damage" → `flags.midi-qol.damage.{attackType}: "Xd6[type]"`

6. **Reaction Setup**
   - Parry/Shield/etc. → `isReaction: true` + condition

7. **Grants Advantage/Disadvantage**
   - Prone → `grants.advantage.attack.mwak` + `grants.disadvantage.attack.rwak`
   - Restrained → `grants.advantage.attack.all`

### Tier 3: Polish (Implement Third)

8. **Conditional Flags**
   - Complex advantage conditions based on target type/state
   - Bloodied mechanics

9. **On-Use Macros**
   - Complex multi-step abilities
   - Special damage calculations

10. **Effect Application Timing**
    - `effectsOnHit` for poison/conditions
    - `effectsOnFail` for save-or-suck

---

## Implementation Checklist

### Pre-Processing
- [ ] Build flag detection regex library
- [ ] Create flag mapping table (DDB trait → MidiQoL flags)
- [ ] Identify traits requiring macros vs flags

### Parsing Pipeline
- [ ] Phase 1: Create base Foundry items (existing strategy)
- [ ] Phase 2: Detect MidiQoL-enhanceable patterns
- [ ] Phase 3: Apply flags to items
- [ ] Phase 4: Create active effects with flags
- [ ] Phase 5: Configure reaction items
- [ ] Phase 6: Validate flag syntax

### Testing
- [ ] Test advantage/disadvantage automation
- [ ] Test save-based abilities
- [ ] Test legendary resistance
- [ ] Test reaction prompting
- [ ] Test damage application with resistance/immunity
- [ ] Test critical hit modifications

---

## Example: Complete Monster with MidiQoL

### Input (DDB Hobgoblin)

**Traits**:
- Martial Advantage: Once per turn, +2d6 damage if ally within 5ft of target

**Actions**:
- Longsword: +3 to hit, reach 5 ft., Hit: 5 (1d8+1) slashing damage

### Output (Foundry + MidiQoL)

```yaml
items:
  - name: "Martial Advantage"
    type: feat
    system:
      description:
        value: "Once per turn, the hobgoblin can deal an extra 2d6 damage..."
    effects:
      - name: "Martial Advantage"
        transfer: true
        changes:
          - key: flags.midi-qol.optional.MartialAdvantage.damage.all
            mode: 5
            value: "2d6"
          - key: flags.midi-qol.optional.MartialAdvantage.count
            mode: 5
            value: "1"
          - key: flags.midi-qol.optional.MartialAdvantage.label
            mode: 5
            value: "Martial Advantage"
          - key: flags.midi-qol.optional.MartialAdvantage.condition
            mode: 5
            value: "@allies.adjacent.target > 0"

  - name: "Longsword"
    type: weapon
    system:
      damage:
        base:
          number: 1
          denomination: 8
          bonus: "1"
          types: [slashing]
      activities:
        dnd5eactivity000:
          type: attack
          attack:
            ability: str
            bonus: ""
          damage:
            includeBase: true
    # MidiQoL will automatically prompt for Martial Advantage when conditions met
```

**Result**: When the hobgoblin attacks and an ally is within 5ft of the target, MidiQoL prompts whether to use Martial Advantage, automatically adding 2d6 damage if accepted, and tracking the once-per-turn use.

---

## Advanced: Conditional Flag Expressions

MidiQoL supports JavaScript expressions in flags (v10.0.4+):

```yaml
# Check target type
flags.midi-qol.advantage.attack.all: "@target.actor.type === 'dragon'"

# Check nearby allies
flags.midi-qol.advantage.attack.all: "@allies.adjacent.token > 0"

# Check actor HP
flags.midi-qol.damage.all: "@actor.hp < (@actor.hp.max / 2) ? '1d6' : '0'"

# Check target conditions
flags.midi-qol.advantage.attack.all: "@target.effects.some(e => e.name === 'Prone')"

# Check item properties
flags.midi-qol.advantage.ability.save.all: "@item.type === 'spell'"
```

**Available Variables**:
- `@actor` - The rolling actor
- `@token` - The rolling token
- `@target` - The targeted actor
- `@item` - The item being used
- `@allies` - Nearby allied tokens
- `@workflow` - Current workflow data

---

## Compatibility Notes

### Foundry v13 vs v12

MidiQoL v13 is compatible with:
- Foundry v12 + dnd5e 4.2+
- Foundry v13 + dnd5e 5.x

**Key Differences**:
- v13 uses new activity system (full support)
- v12 uses legacy item data (partial activity support)

**Recommendation**: Target Foundry v13 + dnd5e 5.x for full feature support. V12 support possible but may lack some automation features.

### Required Modules

For full MidiQoL automation:
- **Dynamic Active Effects (DAE)** - Effect management
- **libwrapper** - Core dependency
- **socketlib** - Core dependency
- **Times-Up** - Effect expiration (highly recommended)

---

## Benefits Summary

### Without MidiQoL
- Monster has attacks/features
- Manual advantage/disadvantage selection
- Manual damage application
- Manual condition tracking
- Manual reaction timing

### With MidiQoL Flags
- **Automated advantage** (Pack Tactics, etc.)
- **Automated save resolution** (half/full/no damage)
- **Automated damage application** (with resistance/immunity)
- **Automated condition application** (poison, stun, etc.)
- **Automated reaction prompts** (parry, shield, etc.)
- **Automated legendary resistance** tracking

### Result
Monsters that "just work" in MidiQoL games with minimal GM intervention, matching player expectations for automation quality.

---

## Next Steps

1. Extend regex pattern library to detect MidiQoL-enhanceable patterns
2. Build flag generation functions
3. Create active effect templates for common traits
4. Implement conditional expression builder
5. Test against sample monsters
6. Validate in live Foundry instance with MidiQoL active
