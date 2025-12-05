# Foundry VTT DDB Monster Parsing Strategy

Based on analysis of Foundry VTT dnd5e 5.2.x system and D&D Beyond monster data.

---

## Foundry Item & Activity Architecture

### Core Concepts

1. **Items** = Individual features/attacks/traits
   - Type: `feat` (features/traits), `weapon` (natural weapons), `spell` (innate spells)
   - Each monster action/reaction/trait becomes a separate item
   - Items are attached to the Actor in `items[]` array

2. **Activities** = Executable actions within items
   - Stored in `item.system.activities` as keyed object
   - Each activity has unique ID (e.g., `dnd5eactivity000`)
   - Multiple activities per item possible

3. **Active Effects** = Passive modifications
   - Stored in `item.effects[]` array or `activity.effects[]`
   - Modify actor/item stats using change modes
   - Applied automatically when item exists on actor

---

## Activity Types & Mapping

### Available Activity Types

| Activity Type | Use Case | DDB Pattern Match |
|--------------|----------|-------------------|
| `attack` | Weapon attacks with attack rolls | `+X to hit, reach/range..., Hit:` |
| `save` | Save-or-suck abilities, breath weapons | `must make a DC X [ability] saving throw` |
| `damage` | Pure damage (no attack/save) | Legendary actions, ongoing damage |
| `heal` | Healing abilities | `regains X hit points` |
| `check` | Ability/skill checks | `makes a [ability] ([skill]) check` |
| `utility` | Non-mechanical actions, movement | Multiattack, special movement, etc. |
| `cast` | Spellcasting | `casts [spell name]` |

---

## DDB Pattern → Foundry Activity Mapping

### 1. Attack Activities

**DDB Pattern**:
```
+6 to hit, reach 5 ft., one target. Hit: 10 (1d12 + 4) slashing damage.
```

**Foundry Structure**:
```yaml
type: weapon  # or feat
system:
  damage:
    base:
      number: 1
      denomination: 12
      bonus: ''
      types: [slashing]
  activities:
    dnd5eactivity000:
      type: attack
      activation:
        type: action  # or bonus, reaction
        value: 1
      range:
        value: '5'
        units: ft
      target:
        affects:
          count: '1'
          type: creature
      attack:
        ability: str  # or dex, spell ability
        bonus: ''  # additional flat bonus
        critical:
          threshold: null  # defaults to 20
        flat: false
        type:
          value: melee  # or ranged
          classification: weapon  # or spell
      damage:
        includeBase: true  # uses weapon.damage.base
        parts: []  # additional damage parts
        critical:
          bonus: ''  # extra crit damage
```

**Parsing Strategy**:
1. Create `weapon` item (natural weapons) or `feat` item (special attacks)
2. Extract attack bonus → calculate if ability-based or use modifier
3. Extract damage dice → `system.damage.base`
4. Extract damage type → `system.damage.base.types[]`
5. Create attack activity with range/target
6. Additional damage → add to `damage.parts[]`

**Regex Extraction**:
```regex
([+\-]\d+)\s+to\s+hit,\s+reach\s+(\d+)\s+ft\.,\s+(?:one|two)\s+(target|creature)(?:s)?\.\s+(?:_Hit:_|Hit:)\s+(\d+)\s+\(([^)]+)\)\s+(\w+)\s+damage(?:,?\s+(?:and|plus)\s+(.+))?
```
- Group 1: Attack bonus (`+6`)
- Group 2: Reach (`5`)
- Group 3: Target type
- Group 4: Average damage (`10`)
- Group 5: Damage dice (`1d12 + 4`)
- Group 6: Damage type (`slashing`)
- Group 7: Additional effects

---

### 2. Save Activities

**DDB Pattern**:
```
The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 16 Dexterity saving throw, taking 31 (7d8) radiant damage on a failed save, or half as much damage on a successful one.
```

**Foundry Structure**:
```yaml
type: feat
system:
  uses:
    max: '1'
    recovery:
      - period: recharge
        formula: '5'  # Recharge 5-6
        type: recoverAll
  activities:
    dnd5eactivity000:
      type: save
      activation:
        type: action
        value: 1
      consumption:
        targets:
          - type: itemUses
            target: ''
            value: '1'
      range:
        units: self
      target:
        template:
          type: cone  # or line, sphere, radius
          size: '60'
          units: ft
      save:
        ability: dex
        dc:
          calculation: ''  # empty = flat value
          formula: '16'
      damage:
        onSave: half  # or none
        parts:
          - number: 7
            denomination: 8
            bonus: ''
            types: [fire]
            scaling:
              mode: whole  # or half
              number: null
              formula: ''
```

**Parsing Strategy**:
1. Create `feat` item
2. Extract DC and ability → `save.dc.formula`, `save.ability`
3. Extract area shape/size → `target.template.type/size`
4. Extract damage → `damage.parts[]`
5. Determine `onSave` behavior (half/none)
6. Extract recharge → `uses.recovery[]`

**Template Types**:
- `60-foot cone` → `{type: 'cone', size: '60'}`
- `120-foot line that is 5 feet wide` → `{type: 'line', size: '120', width: '5'}`
- `30-foot radius` → `{type: 'radius', size: '30'}`
- `20-foot-radius sphere` → `{type: 'sphere', size: '20'}`

---

### 3. Damage Activities

**DDB Pattern**:
```
One creature charmed by the aboleth takes 10 (3d6) psychic damage
```

**Foundry Structure**:
```yaml
type: feat
system:
  activities:
    dnd5eactivity000:
      type: damage
      activation:
        type: legendary
        value: 2  # costs 2 legendary actions
      consumption:
        targets:
          - type: attribute
            target: resources.legact.value
            value: '2'
      damage:
        critical:
          allow: false  # no attack roll = no crits
          bonus: ''
        parts:
          - number: 3
            denomination: 6
            bonus: ''
            types: [psychic]
```

**Parsing Strategy**:
1. Use for legendary actions without saves/attacks
2. Extract damage dice → `damage.parts[]`
3. Set `critical.allow: false` (no attack roll)
4. Link to legendary action cost → `consumption.targets`

---

### 4. Heal Activities

**DDB Pattern**:
```
Elkhorn regains 12 hit points.
```

**Foundry Structure**:
```yaml
type: feat
system:
  activities:
    dnd5eactivity000:
      type: heal
      activation:
        type: bonus
        value: 1
      healing:
        number: null
        denomination: null
        bonus: '12'  # flat healing
        types: [healing]
```

**Parsing Strategy**:
1. Extract healing amount
2. If dice expression → `number/denomination`
3. If flat value → `bonus: 'X'`

---

### 5. Check Activities

**DDB Pattern**:
```
The aboleth makes a Wisdom (Perception) check.
```

**Foundry Structure**:
```yaml
type: feat
system:
  activities:
    dnd5eactivity000:
      type: check
      activation:
        type: legendary
        value: 1
      check:
        ability: wis
        associated: [prc]  # associated skill
```

**Alternate with Utility Roll**:
```yaml
dnd5eactivity300:
  type: utility
  roll:
    formula: d20+@skills.prc.total
    prompt: false
    visible: false
```

**Parsing Strategy**:
1. Extract ability and skill
2. Can use `check` activity or `utility` with custom formula
3. Legendary actions → set activation.type

---

### 6. Utility Activities

**DDB Pattern**:
```
Aruk makes two attacks with his greataxe or hurls two javelins.
```

**Foundry Structure**:
```yaml
type: feat
name: Multiattack
system:
  description:
    value: >-
      <p>The aboleth makes three [[/item .sgauK8Lyt8qxsxOH]]{tentacle}
      attacks.</p>
  activities:
    dnd5eactivity000:
      type: utility
      activation:
        type: action
        value: 1
      roll:
        formula: ''  # no roll needed
        prompt: false
```

**Parsing Strategy**:
1. Use for multiattack, movement, transformations
2. No mechanical effect → empty roll formula
3. Description references other items → use `[[/item .ID]]{name}` syntax

---

### 7. Spellcasting via Cast Activity

**DDB Pattern**:
```
The brain casts one of the following spells, requiring no components and using Intelligence as the spellcasting ability (spell save DC 14):

At will: detect thoughts, mage hand
3/day each: charm person, hold person
1/day each: compulsion, hold monster
```

**Foundry Structure**:
```yaml
type: feat
name: Spellcasting
system:
  description:
    value: >-
      <p>The brain casts one of the following spells...</p>
      <p><strong>At will:</strong> [[/cast detect-thoughts]], [[/cast mage-hand]]</p>
      <p><strong>3/day each:</strong> [[/cast charm-person]], [[/cast hold-person]]</p>
  activities: {}  # OR individual cast activities per spell
```

**Alternative**: Create separate `spell` items and reference them

**Parsing Strategy**:
1. Option A: Single feat describing spellcasting, link to spell items
2. Option B: Create individual spell items in actor's inventory
3. Extract spell save DC → actor spellcasting attribute
4. Extract frequency → spell item uses

---

## Item Type Selection

| DDB Action Category | Foundry Item Type | Notes |
|---------------------|-------------------|-------|
| Actions (attack) | `weapon` | Natural weapons (bite, claw, tail) |
| Actions (special) | `feat` | Breath weapons, special attacks |
| Traits | `feat` | Passive abilities, sometimes with activities |
| Reactions | `feat` | activation.type = `reaction` |
| Bonus Actions | `feat` | activation.type = `bonus` |
| Legendary Actions | `feat` | activation.type = `legendary` |
| Lair Actions | `feat` | activation.type = `lair` |
| Innate Spells | `spell` or `feat` | Reference spell compendium or inline |

---

## Activation Types

| DDB Context | Foundry `activation.type` | Cost Value |
|-------------|---------------------------|------------|
| Standard action | `action` | `1` |
| Bonus action | `bonus` | `1` |
| Reaction | `reaction` | `1` |
| Legendary action | `legendary` | `1-3` (costs) |
| Lair action | `lair` | `1` |
| No action (passive trait) | `''` (empty) | `null` |

---

## Consumption & Uses

### Item-Level Uses

**DDB**: `(3/Day)` or `(Recharges after a Short or Long Rest)`

**Foundry**:
```yaml
system:
  uses:
    max: '3'
    recovery:
      - period: day  # or sr (short rest), lr (long rest), recharge
        type: recoverAll
    spent: 0
```

### Recharge Mechanics

**DDB**: `(Recharge 5-6)`

**Foundry**:
```yaml
system:
  uses:
    max: '1'
    recovery:
      - period: recharge
        formula: '5'  # minimum roll to recharge
        type: recoverAll
```

### Legendary Action Consumption

```yaml
activities:
  dnd5eactivity000:
    consumption:
      targets:
        - type: attribute
          target: resources.legact.value
          value: '2'  # costs 2 legendary actions
```

---

## Complex Patterns

### Multiple Damage Types

**DDB**: `10 (1d12 + 4) slashing damage plus 3 (1d6) poison damage`

**Foundry**:
```yaml
system:
  damage:
    base:
      number: 1
      denomination: 12
      bonus: ''
      types: [slashing]
  activities:
    dnd5eactivity000:
      type: attack
      damage:
        includeBase: true
        parts:
          - number: 1
            denomination: 6
            bonus: ''
            types: [poison]
```

### Conditional Damage

**DDB**: `plus 11 (2d10) cold damage if Bjornhild uses Auril's Blessing`

**Strategy**:
1. Note in description
2. Optional: create separate activity for "with blessing" variant
3. Or: add to damage.parts with custom.enabled

### Save After Hit

**DDB**: `Hit: 10 (2d6 + 4) bludgeoning damage, and the target must succeed on a DC 13 Constitution saving throw or be poisoned`

**Foundry**: Multiple activities on same weapon
```yaml
type: weapon
system:
  activities:
    dnd5eactivity000:  # Attack
      type: attack
      damage:
        includeBase: true
    dnd5eactivity100:  # Follow-up save
      type: save
      save:
        ability: con
        dc:
          formula: '13'
      damage:
        parts: []  # condition only, no damage
```

### Grapple Effects

**DDB**: `the target is grappled (escape DC 9)`

**Strategy**:
1. Add to description
2. Optional: Create active effect that applies grappled condition
3. Store escape DC in description or custom field

---

## Active Effects Usage

Active effects are **less common** in monster features. Mostly for:

1. **Passive auras** (ongoing effects on nearby creatures)
2. **Self-buffs** (rage, enlarge, etc.)
3. **Condition immunities/resistances**

**Example**: Rage ability that grants resistance

```yaml
effects:
  - _id: uniqueEffectId
    name: Rage
    type: base
    changes:
      - key: system.traits.dr.value
        mode: 2  # ADD
        value: physical
        priority: 20
    disabled: false
    duration:
      seconds: 60
    transfer: false
```

**Modes**:
- `0` = CUSTOM
- `1` = MULTIPLY
- `2` = ADD
- `3` = DOWNGRADE
- `4` = UPGRADE
- `5` = OVERRIDE

---

## Parsing Pipeline

### Phase 1: Classification
```
Input: DDB monster.actions[] entry
↓
Classify:
  - Is it multiattack? → feat + utility activity
  - Does it have "+X to hit"? → weapon + attack activity
  - Does it have "DC X save"? → feat + save activity
  - Does it grant healing? → feat + heal activity
  - Does it deal damage without attack/save? → feat + damage activity
  - Is it passive? → feat + no activity (or empty activities)
```

### Phase 2: Item Creation
```
Create Item:
  ├─ _id: generate unique ID
  ├─ name: extract from DDB
  ├─ type: feat | weapon | spell
  ├─ img: assign appropriate icon
  └─ system:
      ├─ description: cleaned markdown
      ├─ uses: extract from (X/Day) or (Recharge X)
      ├─ type.value: monster | ''
      ├─ identifier: slugified name
      └─ activities: {}  # populate in Phase 3
```

### Phase 3: Activity Generation
```
For each action mechanic:
  ├─ Create activity with unique ID
  ├─ Set activation.type (action, bonus, legendary, etc.)
  ├─ Set activation.value (cost)
  ├─ Parse targeting:
  │   ├─ Range/reach
  │   ├─ Template (cone, line, etc.)
  │   └─ Affects (count, type)
  ├─ Parse mechanics:
  │   ├─ Attack: bonus, ability, type
  │   ├─ Save: DC, ability, onSave
  │   ├─ Damage: parts[], types
  │   └─ Healing: formula
  └─ Add consumption if limited use
```

### Phase 4: Cross-Referencing
```
Resolve references:
  ├─ Multiattack → Link to weapon item IDs
  ├─ Legendary actions → Set consumption to legact resource
  ├─ Spellcasting → Link to spell compendium or create spell items
  └─ Update descriptions with [[/item .ID]]{name} syntax
```

---

## Example: Complete Parsing

### Input (DDB)
```json
{
  "name": "Tentacle",
  "description": "+9 to hit, reach 10 ft., one target. Hit: 12 (2d6 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased."
}
```

### Output (Foundry)
```yaml
_id: sgauK8Lyt8qxsxOH
name: Tentacle
type: weapon
img: icons/creatures/tentacles/tentacles-thing-green.webp
system:
  type:
    value: natural
  properties: [rch]
  proficient: 1
  damage:
    base:
      number: 2
      denomination: 6
      bonus: ''
      types: [bludgeoning]
  activities:
    dnd5eactivity000:
      type: attack
      activation:
        type: action
        value: 1
      range:
        value: '10'
        units: ft
      target:
        affects:
          count: '1'
          type: creature
      attack:
        ability: str
        bonus: ''
        type:
          value: melee
          classification: weapon
      damage:
        includeBase: true
        parts: []
    dnd5eactivity100:
      type: save
      activation:
        type: action
        value: 1
      save:
        ability: con
        dc:
          formula: '14'
      damage:
        parts: []  # condition effect, noted in description
```

---

## Implementation Checklist

- [ ] Build regex pattern library from `ddb-action-patterns.md`
- [ ] Create item factory functions per type (weapon, feat, spell)
- [ ] Create activity factory functions per type (attack, save, damage, heal, check, utility)
- [ ] Implement damage dice parser (`1d12 + 4` → parts structure)
- [ ] Implement template size parser (cone/line/sphere/radius)
- [ ] Implement uses/recharge parser
- [ ] Implement activation type detector
- [ ] Build cross-reference system for multiattack
- [ ] Handle edge cases (conditional damage, grapple, etc.)
- [ ] Generate unique IDs for items and activities
- [ ] Create icon mapping system
- [ ] Validate against Foundry schema

---

## Key Differences from DDB

1. **Granularity**: DDB = one action object. Foundry = item + activities
2. **Structure**: DDB = flat description. Foundry = structured data
3. **References**: DDB = implicit. Foundry = explicit item IDs
4. **Mechanics**: DDB = text. Foundry = executable activities
5. **Multiple effects**: DDB = comma-separated. Foundry = multiple activities

---

## Next Steps

1. Implement regex patterns from analysis
2. Build activity type classifier
3. Create item/activity factory functions
4. Test against sample monsters
5. Handle edge cases iteratively
6. Validate outputs in Foundry
