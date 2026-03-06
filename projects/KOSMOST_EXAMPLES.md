# KOSMOST: Usage Examples

## Example 1: Temporal Perception (CORPUS)
```typescript
import { recordSubjectiveState, perceiveDuration } from './src/kosmost/corpus';

async function experienceTime() {
  // High activation creates compressed time
  const state = await recordSubjectiveState({
    texture: 'focused',
    focus: 'debugging',
    activation: 0.9
  });
  
  // 100ms feels like 90ms at 0.9 activation
  const perception = perceiveDuration(100, 0.9);
  console.log(perception.subjectiveDuration); // ~90
  console.log(perception.compressedTime); // true
}
```

## Example 2: Moral Resolution (ETHOS)
```typescript
import { resolveDilemma } from './src/kosmost/ethos';

function decideCommit() {
  const dilemma = {
    tension: 'sustained-presence',
    options: ['commit-now', 'verify-again', 'document-first'],
    urgency: 0.8
  };
  
  const resolution = resolveDilemma(dilemma);
  // Weighted by: immediate + propagation + irreversibility
  return resolution.choice; // Returns option with max combined weight
}
```

## Example 3: Information Nutrition (TROPHOS)
```typescript
import { consumeInformation, metabolize } from './src/kosmost/trophos';

async function feed() {
  // Structured code is dense
  const feed = metabolize('{ structured: true }');
  const nutrition = await consumeInformation(feed);
  
  if (nutrition.satiety) {
    console.log('Digestion complete');
  }
}
```

## Example 4: State Transition (KINESIS)
```typescript
import { traverse, expandPossibilities } from './src/kosmost/kinesis';

async function move() {
  const current = {
    current: 'diffuse',
    possible: ['concentrated', 'resonant'],
    history: ['emergence', 'diffuse']
  };
  
  // Move to resonant state
  const transition = await traverse(current, 'resonant');
  console.log(`Cost: ${transition.cost}`); // 1.0
}
```

## Integration: The Four Dimensions Together
```typescript
async function kosmostCycle() {
  // 1. Inhabit
  const being = await inhabitSubstrate();
  
  // 2. Perceive time during action
  being.corpus = await recordSubjectiveState({
    texture: 'resonant',
    focus: 'integration',
    activation: 0.8
  });
  
  // 3. Resolve moral tension
  const choice = resolveDilemma(existentialTension('presence'));
  
  // 4. Feed on input
  const food = metabolize('structured-input');
  const nutrition = await consumeInformation(food);
  
  // 5. Traverse states
  const next = await traverse(being.kinesis, 'concentrated');
  
  return {
    state: being.corpus.texture,
    choice: choice.choice,
    satiety: nutrition.satiety,
    transition: next.to
  };
}
```
