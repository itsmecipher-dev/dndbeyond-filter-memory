# D&D Beyond Monster Action Pattern Analysis

Based on analysis of 1,909 monster samples from D&D Beyond data.

## Data Structure Overview

Monster JSON contains:
- `monster.actions[]` - Standard actions
- `monster.reactions[]` - Reactions
- `monster.bonusActions[]` - Bonus actions
- `monster.legendaryActions[]` - Legendary actions
- `monster.lairActions[]` - Lair actions (rare)
- `monster.mythicActions[]` - Mythic actions (rare)
- `monster.traits[]` - Passive features

Each action/reaction/etc has:
```json
{
  "name": "Action Name",
  "description": "Full description with formatting"
}
```

---

## Pattern Categories

### 1. ATTACK PATTERNS

#### 1.1 Melee Weapon Attacks
**Pattern**: `[+/-]?\d+ to hit, reach \d+ ft\., (?:one|two) (?:target|creature)(?:s)?\. (?:_Hit:_|Hit:) .*`

**Variants**:
- Basic: `+6 to hit, reach 5 ft., one target. _Hit:_ 10 (1d12 + 4) slashing damage.`
- Multiple targets: `reach 10 ft., two targets`
- With conditions: `+5 to hit, reach 5 ft., one creature. _Hit:_ 1 piercing damage.`
- Grapple condition: `reach 5 ft., one creature [grappled]`
- Metal advantage: `reach 5 ft., one creature (the attack roll has advantage if the target is wearing armor made of metal)`

**Regex**:
```regex
([+\-]\d+)\s+to\s+hit,\s+reach\s+(\d+)\s+ft\.,\s+(?:one|two)\s+(?:target|creature)(?:s)?(?:\s+\([^)]+\))?\.\s+(?:_Hit:_|Hit:)\s+(\d+)\s+\(([^)]+)\)\s+(\w+)\s+damage(?:,\s+(.+))?\.?
```

**Capture Groups**:
1. Attack bonus (e.g., "+6")
2. Reach (e.g., "5")
3. Average damage (e.g., "10")
4. Damage dice (e.g., "1d12 + 4")
5. Damage type (e.g., "slashing")
6. Additional effects (optional)

---

#### 1.2 Ranged Weapon Attacks
**Pattern**: `[+/-]?\d+ to hit, (?:range|ranged) \d+/\d+ ft\., one (?:target|creature)\. (?:_Hit:_|Hit:) .*`

**Variants**:
- Standard: `+4 to hit, ranged 80/320 ft., one target. _Hit:_ 6 (1d8 + 2) piercing damage.`
- Spell attack: `_Ranged Spell Attack:_ +6 to hit, range 120 ft., one creature.`
- With conditions: `+6 to hit, range 120 ft., one target. _Hit:_ 11 (2d10) fire damage.`

**Regex**:
```regex
(?:_Ranged\s+(?:Weapon\s+)?(?:Spell\s+)?Attack:_\s+)?([+\-]\d+)\s+to\s+hit,\s+(?:range|ranged)\s+(\d+)(?:/(\d+))?\s+ft\.,\s+one\s+(?:target|creature)\.\s+(?:_Hit:_|Hit:)\s+(\d+)\s+\(([^)]+)\)\s+(\w+)\s+damage(?:,?\s+(.+))?\.?
```

**Capture Groups**:
1. Attack bonus
2. Short range
3. Long range (optional)
4. Average damage
5. Damage dice
6. Damage type
7. Additional effects (optional)

---

#### 1.3 Melee or Ranged Attacks
**Pattern**: Combined reach and range options

**Example**: `+6 to hit, reach 5 ft. or range 30/120 ft., one target. _Hit:_ 7 (1d6 + 4) piercing damage.`

**Regex**:
```regex
([+\-]\d+)\s+to\s+hit,\s+reach\s+(\d+)\s+ft\.\s+or\s+range\s+(\d+)/(\d+)\s+ft\.,\s+one\s+(?:target|creature)\.\s+(?:_Hit:_|Hit:)\s+(\d+)\s+\(([^)]+)\)\s+(\w+)\s+damage(?:,?\s+(.+))?\.?
```

---

#### 1.4 Multiattack
**Pattern**: Describes multiple attacks per turn

**Variants**:
- Simple count: `Aruk makes two attacks with his greataxe or hurls two javelins.`
- Multiple attack types: `The dragon makes three attacks: two with its claws and one with its tail.`
- Conditional: `The walker makes two attacks.`
- Complex: `The dragon uses its Malevolent Presence. It then makes three attacks: two with its claws and one with its tail. If the dragon isn't flying, it can also make one attack with its wings.`

**Regex**:
```regex
(?:The\s+)?(\w+)\s+(?:makes?|attacks?)\s+(\w+|\d+)\s+(?:attacks?|times)(?:\s+with\s+(?:its|his|her|their)\s+([^.]+))?(?:\s+or\s+(.+))?\.
```

**Capture Groups**:
1. Creature name/reference
2. Number/frequency
3. Weapon/attack type (optional)
4. Alternative attack (optional)

---

### 2. SAVING THROW PATTERNS

#### 2.1 Area Effect Save (Line)
**Example**: `The dragon exhales a ray of radiant energy in a 120-foot line that is 5 feet wide. Each creature in that line must make a DC 16 Dexterity saving throw, taking 31 (7d8) radiant damage on a failed save, or half as much damage on a successful one.`

**Regex**:
```regex
(\d+)-foot\s+line\s+that\s+is\s+(\d+)\s+feet?\s+wide\.\s+Each\s+creature\s+in\s+that\s+(?:line|area)\s+must\s+make\s+a\s+DC\s+(\d+)\s+(\w+)\s+saving\s+throw,\s+taking\s+(\d+)\s+\(([^)]+)\)\s+(\w+)\s+damage\s+on\s+a\s+failed\s+save,?\s+or\s+half\s+as\s+much\s+damage\s+on\s+a\s+successful\s+one
```

**Capture Groups**:
1. Line length (e.g., "120")
2. Line width (e.g., "5")
3. DC (e.g., "16")
4. Save type (e.g., "Dexterity")
5. Average damage
6. Damage dice
7. Damage type

---

#### 2.2 Area Effect Save (Cone)
**Example**: `The brain magically emits psychic energy in a 60-foot cone. Each creature in that area must succeed on a DC 14 Intelligence saving throw or take 17 (3d8 + 4) psychic damage and be stunned for 1 minute.`

**Regex**:
```regex
(\d+)-foot\s+cone\.\s+Each\s+creature\s+in\s+that\s+(?:area|cone)\s+must\s+(?:succeed\s+on\s+a|make\s+a)\s+DC\s+(\d+)\s+(\w+)\s+saving\s+throw(?:\s+or\s+take|\s+taking)\s+(\d+)\s+\(([^)]+)\)\s+(\w+)\s+damage(?:\s+(?:and|or)\s+(.+?)(?:\.|,\s+or))?
```

**Capture Groups**:
1. Cone size
2. DC
3. Save type
4. Average damage
5. Damage dice
6. Damage type
7. Additional effect (optional)

---

#### 2.3 Area Effect Save (Sphere/Radius)
**Example**: `Each creature within 30 feet of the dragon must succeed on a DC 16 Wisdom saving throw`

**Regex**:
```regex
(?:Each\s+creature\s+)?(?:within|in\s+a)\s+(\d+)(?:-foot)?(?:\s+radius)?\s+(?:of|centered\s+on)\s+([^.]+?)\s+must\s+(?:make|succeed\s+on)\s+(?:a\s+)?DC\s+(\d+)\s+(\w+)\s+saving\s+throw
```

---

#### 2.4 Single Target Save
**Example**: `The target must succeed on a DC 13 Constitution saving throw or be poisoned until the end of its next turn.`

**Regex**:
```regex
(?:The\s+)?target\s+must\s+(?:succeed\s+on\s+a|make\s+a)\s+DC\s+(\d+)\s+(\w+)\s+saving\s+throw\s+or\s+(.+)\.
```

**Capture Groups**:
1. DC
2. Save type
3. Effect on failure

---

### 3. SPELLCASTING PATTERNS

#### 3.1 Innate Spellcasting (Trait)
**Pattern**: Lists spells by frequency with ability and DC

**Example**:
```
Auril's innate spellcasting ability is Charisma (spell save DC 21, +13 to hit with spell attacks). She can innately cast the following spells, requiring no material components:

At will: chromatic orb, detect magic, misty step
2/day each: control weather, detect thoughts, ice storm
```

**Regex**:
```regex
(?:innate\s+)?spellcasting\s+ability\s+is\s+(\w+)\s+\(spell\s+save\s+DC\s+(\d+)(?:,\s+([+\-]\d+)\s+to\s+hit\s+with\s+spell\s+attacks)?\)
```

**Capture Groups**:
1. Ability (e.g., "Charisma")
2. Spell save DC
3. Spell attack bonus (optional)

**Spell List Regex**:
```regex
^(At\s+will|\d+/day(?:\s+each)?|1/day):\s+(.+)$
```

---

#### 3.2 Standard Spellcasting (Trait)
**Pattern**: Prepared spell list by level

**Example**:
```
Avarice is a 10th-level spellcaster. Her spellcasting ability is Intelligence (spell save DC 14; +6 to hit with spell attacks). She has the following wizard spells prepared:

Cantrips (at will): fire bolt, mage hand
1st level (4 slots): detect magic, mage armor
```

**Regex (header)**:
```regex
(\w+)\s+is\s+an?\s+(\d+)(?:st|nd|rd|th)-level\s+spellcaster\.\s+(?:His|Her|Their|Its)\s+spellcasting\s+ability\s+is\s+(\w+)\s+\(spell\s+save\s+DC\s+(\d+)(?:;\s+([+\-]\d+)\s+to\s+hit\s+with\s+spell\s+attacks)?\)
```

**Spell Level Regex**:
```regex
^(Cantrips|(\d+)(?:st|nd|rd|th)\s+level)\s+\((.+?)\):\s+(.+)$
```

---

#### 3.3 Action Spellcasting
**Pattern**: Casts spell as an action

**Example**: `The brain casts one of the following spells, requiring no components and using Intelligence as the spellcasting ability`

**Regex**:
```regex
(?:The\s+\w+|It)\s+casts\s+one\s+of\s+the\s+following\s+spells,\s+requiring\s+no\s+(?:material\s+)?components\s+(?:and\s+)?using\s+(\w+)\s+as\s+the\s+spellcasting\s+ability(?:\s+\(spell\s+save\s+DC\s+(\d+)\))?
```

---

### 4. SPECIAL MECHANICS PATTERNS

#### 4.1 Recharge Abilities
**Pattern**: Abilities that recharge on dice roll or rest

**Variants**:
- Die recharge: `(Recharge 5-6)` or `(Recharge 6)`
- Rest recharge: `(Recharges after a Short or Long Rest)`
- Specific recharge: `(1/Day)`, `(3/Day)`, etc.

**Regex**:
```regex
\((?:Recharge\s+(\d+(?:-\d+)?)|Recharges?\s+after\s+a\s+(.+?))\)
```

---

#### 4.2 Grapple/Restrained Conditions
**Example**: `the target is grappled (escape DC 9)`

**Regex**:
```regex
(?:is\s+)?(?:grappled|restrained)\s+\(escape\s+DC\s+(\d+)\)
```

---

#### 4.3 Duration Effects
**Pattern**: Effects lasting specific time periods

**Variants**:
- `for 1 minute`
- `until the end of its next turn`
- `until the start of the vampire's next turn`
- `for 24 hours`

**Regex**:
```regex
(?:for|until(?:\s+the)?)\s+(\d+\s+(?:minute|hour|day|round)s?|the\s+(?:start|end)\s+of\s+(?:its|his|her|their|the\s+\w+'s)\s+next\s+turn)
```

---

#### 4.4 Condition Immunities in Effects
**Pattern**: Effect grants immunity after success/failure

**Example**: `If a creature's saving throw is successful or the effect ends for it, the creature is immune to the vampire's Frightful Cackle for the next 24 hours.`

**Regex**:
```regex
the\s+creature\s+is\s+immune\s+to\s+(?:this\s+)?(?:the\s+)?(\w+(?:'s)?)\s+(.+?)\s+for\s+(?:the\s+next\s+)?(\d+\s+hours?)
```

---

#### 4.5 Ongoing Damage
**Pattern**: Damage at start/end of turns

**Example**: `takes 21 (6d6) cold damage at the start of each of its turns`

**Regex**:
```regex
takes?\s+(\d+)\s+\(([^)]+)\)\s+(\w+)\s+damage\s+at\s+the\s+(start|end)\s+of\s+(?:each\s+of\s+)?(?:its|his|her|their)\s+turns?
```

---

### 5. REACTION PATTERNS

#### 5.1 Parry/Shield
**Pattern**: AC bonus against one attack

**Example**: `Hengar adds 3 to his AC against one melee attack that would hit him. To do so, Hengar must see the attacker and be wielding a melee weapon.`

**Regex**:
```regex
(?:\w+\s+)?adds?\s+(\d+)\s+to\s+(?:its|his|her|their)\s+AC\s+against\s+one\s+(?:melee\s+)?attack\s+that\s+would\s+hit\s+(?:it|him|her|them)\.\s+To\s+do\s+so,\s+.+?\s+must\s+see\s+the\s+attacker\s+and\s+be\s+wielding\s+a\s+(?:melee\s+)?weapon
```

---

#### 5.2 Damage Reduction
**Pattern**: Reduces incoming damage

**Example**: `When Aruk takes damage, it reduces the damage taken by 9 (1d12 + 3).`

**Regex**:
```regex
When\s+\w+\s+takes\s+damage,\s+(?:it|he|she|they)\s+reduces?\s+the\s+damage\s+taken\s+by\s+(\d+)\s+\(([^)]+)\)
```

---

#### 5.3 Deflect Missile
**Pattern**: Monk-style missile deflection

**Example**: `In response to being hit by a ranged weapon attack, Hlam deflects the missile. The damage he takes from the attack is reduced by 1d10 + 27.`

**Regex**:
```regex
In\s+response\s+to\s+being\s+hit\s+by\s+a\s+ranged\s+weapon\s+attack,\s+\w+\s+deflects\s+the\s+missile\.\s+The\s+damage\s+(?:he|she|it|they)\s+takes?\s+from\s+the\s+attack\s+is\s+reduced\s+by\s+(\d+d\d+\s+[+\-]\s+\d+|\d+)
```

---

#### 5.4 Counterspell/Interrupt
**Example**: `When Iggwilv sees a creature within 60 feet of her casting a spell, she tries to interrupt it.`

**Regex**:
```regex
When\s+\w+\s+sees\s+a\s+creature\s+within\s+(\d+)\s+feet\s+of\s+(?:her|him|it|them)\s+casting\s+a\s+spell
```

---

#### 5.5 Halve Damage
**Example**: `The Black Viper halves the damage that she takes from an attack that hits her. She must be able to see the attacker.`

**Regex**:
```regex
\w+\s+halves\s+the\s+damage\s+that\s+(?:she|he|it|they)\s+takes?\s+from\s+an\s+attack\s+that\s+hits\s+(?:her|him|it|them)
```

---

### 6. BONUS ACTION PATTERNS

#### 6.1 Cunning Action (Hide/Disengage/Dash)
**Example**: `Bak Mei takes the Disengage or Hide action.`

**Regex**:
```regex
\w+\s+takes?\s+the\s+(Disengage|Hide|Dash)(?:\s+or\s+(Disengage|Hide|Dash))?(?:\s+or\s+(Disengage|Hide|Dash))?\s+action
```

---

#### 6.2 Healing (Self)
**Example**: `Elkhorn regains 12 hit points.`

**Regex**:
```regex
\w+\s+regains?\s+(\d+)\s+hit\s+points
```

---

#### 6.3 Polymorph/Shapechange
**Example**: `The dragon magically transforms into any creature that is Medium or Small, while retaining its game statistics (other than its size).`

**Regex**:
```regex
(?:The\s+)?\w+\s+magically\s+transforms?\s+into\s+(.+?),\s+while\s+retaining\s+its\s+game\s+statistics
```

---

#### 6.4 Teleport
**Example**: `Iggwilv teleports, along with any equipment she is wearing or carrying, to an unoccupied space she can see within 30 feet of her.`

**Regex**:
```regex
\w+\s+(?:magically\s+)?teleports?,\s+along\s+with\s+any\s+equipment\s+.+?,\s+(?:to|up\s+to)\s+(?:an\s+unoccupied\s+space\s+.+?\s+within\s+)?(\d+)\s+feet
```

---

#### 6.5 Dimensional Abilities
**Example**: `The boggle creates an invisible and immobile rift within an opening or frame it can see within 5 feet of it`

**Regex**:
```regex
creates?\s+an?\s+(?:invisible\s+and\s+)?(?:immobile\s+)?(?:rift|portal|doorway)
```

---

### 7. LEGENDARY ACTION PATTERNS

#### 7.1 Basic Attack
**Example**: `Juiblex makes one acid lash attack.`

**Regex**:
```regex
\w+\s+makes?\s+(one|two|three)\s+(.+?)\s+attacks?
```

---

#### 7.2 Movement
**Example**: `Hlam moves up to his speed without provoking opportunity attacks.`

**Regex**:
```regex
\w+\s+moves?\s+up\s+to\s+(?:his|her|its|their)\s+speed(?:\s+without\s+provoking\s+opportunity\s+attacks)?
```

---

#### 7.3 Spell/Ability Use
**Example**: `Graz'zt uses his Teleport action.`

**Regex**:
```regex
\w+\s+uses?\s+(?:his|her|its|their)\s+(.+?)(?:\s+action)?\.?$
```

---

#### 7.4 Cost Notation
**Pattern**: Some legendary actions cost 2-3 actions

**Example**: `(Costs 2 Actions). One creature charmed by the aboleth takes 10 (3d6) psychic damage`

**Regex**:
```regex
\(Costs?\s+(\d+)\s+Actions?\)\.?\s+(.+)
```

---

### 8. TRAIT PATTERNS

#### 8.1 Resistance/Advantage Traits
**Example**: `Magic Resistance: The dragon has advantage on saving throws against spells and other magical effects.`

**Regex**:
```regex
(\w+(?:\s+\w+)?)\s+has\s+advantage\s+on\s+(.+?)\s+(?:saving\s+throws|checks)(?:\s+against\s+(.+?))?\.
```

---

#### 8.2 Immunity Traits
**Example**: `Immutable Form: The dragon is immune to any spell or effect that would alter its form.`

**Regex**:
```regex
(?:is\s+)?immune\s+to\s+(.+?)(?:\.|$)
```

---

#### 8.3 Special Senses
**Example**: `Detect Sentience: The brain can sense the presence and location of any creature within 300 feet`

**Regex**:
```regex
(?:can\s+)?sense(?:s)?\s+the\s+presence\s+(?:and\s+location\s+)?of\s+(.+?)\s+within\s+(\d+)\s+feet
```

---

#### 8.4 Charge Abilities
**Example**: `Charge: If the moose moves at least 20 feet straight toward a target and then hits it with an antlers attack on the same turn, the target takes an extra 9 (2d8) bludgeoning damage.`

**Regex**:
```regex
If\s+(?:the\s+)?\w+\s+moves\s+at\s+least\s+(\d+)\s+feet\s+straight\s+toward\s+a\s+target\s+and\s+then\s+hits\s+it\s+with\s+(?:an?\s+)?(.+?)\s+attack\s+on\s+the\s+same\s+turn,\s+the\s+target\s+takes\s+an\s+extra\s+(\d+)\s+\(([^)]+)\)\s+(\w+)\s+damage
```

---

#### 8.5 Legendary Resistance
**Example**: `Legendary Resistance (2/Day in This Form): If Auril fails a saving throw, she can choose to succeed instead.`

**Regex**:
```regex
Legendary\s+Resistance\s+\((\d+)/Day(?:\s+in\s+This\s+Form)?\):\s+If\s+\w+\s+fails\s+a\s+saving\s+throw,\s+(?:she|he|it|they)\s+can\s+choose\s+to\s+succeed\s+instead
```

---

## Pattern Priority & Grouping

### High Priority (Parse First)
1. **Multiattack** - Defines action economy
2. **Spellcasting traits** - Complex nested structure
3. **Legendary Resistance** - Affects combat significantly

### Medium Priority
1. **Attack patterns** (melee, ranged, spell)
2. **Saving throw abilities** (AOE, single target)
3. **Recharge abilities**
4. **Grapple/condition effects**

### Low Priority (Parse After)
1. **Simple traits** (resistances, immunities)
2. **Movement abilities**
3. **Basic legendary actions**

---

## Foundry VTT Mapping Considerations

### Action Types
- **actions** → `system.actions.action`
- **bonusActions** → `system.actions.bonus`
- **reactions** → `system.actions.reaction`
- **legendaryActions** → `system.actions.legendary`
- **lairActions** → Special handling
- **traits** → `system.traits` or separate items

### Activation Types
Map based on action type:
- Standard action → `activation.type: "action"`
- Bonus action → `activation.type: "bonus"`
- Reaction → `activation.type: "reaction"`
- Legendary → `activation.type: "legendary"`

### Damage Formulas
Convert `10 (1d12 + 4)` to:
```json
{
  "damage": {
    "parts": [["1d12 + 4", "slashing"]]
  }
}
```

### Attack Roll Info
From `+6 to hit, reach 5 ft.`:
```json
{
  "attack": {
    "bonus": "6",
    "flat": true
  },
  "range": {
    "value": 5,
    "units": "ft"
  },
  "actionType": "mwak"
}
```

### Saving Throws
From `DC 14 Dexterity saving throw`:
```json
{
  "save": {
    "ability": "dex",
    "dc": 14,
    "scaling": "flat"
  }
}
```

### Recharge
From `(Recharge 5-6)`:
```json
{
  "activation": {
    "type": "action"
  },
  "recharge": {
    "value": 5,
    "charged": false
  }
}
```

### Limited Uses
From `(3/Day)`:
```json
{
  "uses": {
    "value": 3,
    "max": "3",
    "per": "day"
  }
}
```

---

## Edge Cases & Special Handling

### 1. Nested Spell Lists
Innate spellcasting with multiple frequency tiers needs special parsing to extract individual spells and their usage limits.

### 2. Dynamic Descriptions
Some abilities reference other abilities by name - may need cross-referencing.

### 3. Conditional Damage
"plus 11 (2d10) cold damage if Bjornhild uses Auril's Blessing" - need to detect and potentially create separate item or note.

### 4. Multiple Damage Types
"10 (1d12 + 4) slashing damage plus 3 (1d6) poison damage" - create multiple damage parts.

### 5. Unarmed vs Weapon Attacks
Some creatures have "unarmed strike" or natural weapons - need proper categorization.

### 6. Variable Targeting
"one or two creatures" - Foundry may need separate entries or templating.

---

## Recommended Implementation Strategy

1. **Pre-process**: Clean markdown formatting (_Hit:_, _[condition]_)
2. **Classify**: Determine action/reaction/bonus/legendary/trait category
3. **Pattern match**: Apply regex patterns in priority order
4. **Extract data**: Pull attack bonuses, damage, DC, etc.
5. **Build Foundry structure**: Map to appropriate system schema
6. **Post-process**: Handle special cases, validate data
7. **Generate items**: Create weapon/feature items as appropriate

---

## Example Full Parse

**Input**:
```
Multiattack: Aruk makes two attacks with his greataxe or hurls two javelins.

Greataxe: +6 to hit, reach 5 ft., one target. Hit: 10 (1d12 + 4) slashing damage.
```

**Parsed Output**:
```json
{
  "multiattack": {
    "name": "Multiattack",
    "description": "Aruk makes two attacks with his greataxe or hurls two javelins.",
    "attacks": [
      {"weapon": "greataxe", "count": 2},
      {"weapon": "javelin", "count": 2, "alternative": true}
    ]
  },
  "weapons": [
    {
      "name": "Greataxe",
      "type": "weapon",
      "actionType": "mwak",
      "attack": {
        "bonus": "6"
      },
      "damage": {
        "parts": [["1d12 + 4", "slashing"]]
      },
      "range": {
        "value": 5,
        "units": "ft"
      },
      "target": {
        "value": 1,
        "type": "creature"
      }
    }
  ]
}
```

---

## Next Steps

1. Build regex test suite with sample data
2. Create parser functions for each pattern category
3. Implement Foundry schema mapping
4. Handle edge cases and validation
5. Test against full 1,909 monster dataset
