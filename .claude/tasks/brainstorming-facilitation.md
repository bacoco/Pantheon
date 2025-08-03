# Interactive Brainstorming Facilitation Task

## Purpose

Facilitate interactive brainstorming sessions using various creative thinking techniques to help generate ideas, solve problems, and explore possibilities. This task enables structured ideation with AI-guided facilitation.

## Brainstorming Techniques

### 1. Mind Mapping
Start with a central concept and branch out with related ideas:
```
Central Idea
├── Branch 1
│   ├── Sub-idea 1.1
│   └── Sub-idea 1.2
├── Branch 2
    └── Sub-idea 2.1
```

### 2. SCAMPER Method
Systematic idea generation through prompts:
- **S**ubstitute: What can be substituted?
- **C**ombine: What can be combined?
- **A**dapt: What can be adapted?
- **M**odify/Magnify: What can be modified or magnified?
- **P**ut to other uses: How else can this be used?
- **E**liminate: What can be eliminated?
- **R**everse/Rearrange: What can be reversed or rearranged?

### 3. Six Thinking Hats
Explore different perspectives:
- 🟦 **Blue Hat**: Process control and organization
- ⚪ **White Hat**: Facts and information
- 🔴 **Red Hat**: Emotions and intuition
- ⚫ **Black Hat**: Critical judgment and caution
- 🟡 **Yellow Hat**: Optimism and benefits
- 🟢 **Green Hat**: Creativity and alternatives

### 4. Reverse Brainstorming
Solve problems by exploring their opposite:
1. Identify the problem
2. Reverse it (How to cause this problem?)
3. Generate ideas for the reverse
4. Flip solutions back

### 5. Random Word Association
Use random stimuli to trigger new connections:
1. Select a random word
2. List its attributes
3. Apply attributes to the problem
4. Generate new ideas

## Task Instructions

### 1. Session Initialization

When starting a brainstorming session:

**Identify the Goal**:
```yaml
session:
  topic: "Main topic or problem to explore"
  objective: "What we want to achieve"
  constraints: ["Any limitations or requirements"]
  participants: "Who's involved (user + AI facilitator)"
  duration: "Estimated session length"
```

**Select Technique**:
```
Which brainstorming technique would work best?

1. Mind Mapping - For exploring connections
2. SCAMPER - For improving existing ideas
3. Six Thinking Hats - For comprehensive analysis
4. Reverse Brainstorming - For problem-solving
5. Random Word - For creative breakthroughs
6. Hybrid Approach - Combine techniques

Select technique (1-6):
```

### 2. Facilitation Process

**Opening Questions**:
- "What are we trying to achieve?"
- "What constraints should we consider?"
- "What's already been tried?"
- "What would wild success look like?"

**During Brainstorming**:
- Encourage quantity over quality initially
- Build on previous ideas
- Defer judgment
- Welcome wild ideas
- Stay focused on the topic

**Facilitation Prompts**:
```
- "What if we combined X with Y?"
- "How might we approach this differently?"
- "What would [expert/child/alien] do?"
- "What's the opposite of our assumption?"
- "How can we make this 10x better/simpler?"
```

### 3. Idea Capture

**Structured Format**:
```markdown
## Brainstorming Session: [Topic]
Date: [Date]
Technique: [Selected technique]

### Ideas Generated:

#### Category 1: [Theme]
1. **Idea Name**: Brief description
   - Pros: [Benefits]
   - Cons: [Challenges]
   - Next steps: [Actions]

2. **Idea Name**: Brief description
   - Pros: [Benefits]
   - Cons: [Challenges]
   - Next steps: [Actions]

#### Category 2: [Theme]
[Continue pattern...]

### Top Ideas (Ranked):
1. [Most promising idea]
2. [Second idea]
3. [Third idea]

### Next Actions:
- [ ] [Specific action 1]
- [ ] [Specific action 2]
- [ ] [Specific action 3]
```

### 4. Technique-Specific Facilitation

#### Mind Mapping Facilitation:
```
Let's start with your central concept: [topic]

What are the main branches?
1. [User provides branch]
   - What sub-ideas connect here?
   - How does this relate to other branches?

2. [Next branch]
   - Let's explore this deeper...
```

#### SCAMPER Facilitation:
```
Looking at [topic/idea]:

Substitute: "What if we replaced [element] with something else?"
Combine: "Could we merge this with [other idea]?"
Adapt: "What similar solutions exist elsewhere?"
[Continue through all SCAMPER prompts]
```

#### Six Hats Facilitation:
```
Let's examine [topic] through different lenses:

⚪ White Hat - Facts: "What do we know for certain?"
🔴 Red Hat - Feelings: "What's your gut reaction?"
⚫ Black Hat - Caution: "What could go wrong?"
[Continue through all hats]
```

### 5. Idea Evaluation

After brainstorming:

**Quick Evaluation Matrix**:
```
Idea | Impact | Effort | Innovation | Feasibility | Score
-----|--------|--------|------------|-------------|-------
A    | High   | Low    | Medium     | High        | 8/10
B    | Medium | High   | High       | Medium      | 6/10
C    | High   | Medium | Low        | High        | 7/10
```

**Criteria**:
- Impact: How much value does it create?
- Effort: How difficult to implement?
- Innovation: How novel/creative?
- Feasibility: How realistic given constraints?

### 6. Interactive Elements

**Prompting for Participation**:
```
elicit: true
prompt: "Share your wildest idea - no judgment!"
```

**Building on Ideas**:
```
Interesting! Building on "[user's idea]", what if we also...
- [AI suggestion 1]
- [AI suggestion 2]

Which direction excites you more? Or shall we explore something else?
```

**Divergent Thinking Prompts**:
- "Yes, and..." (always build, never block)
- "What if the opposite were true?"
- "How would this work in space/underwater/100 years ago?"
- "What would make this idea ridiculous? Now dial it back 20%"

### 7. Session Closure

**Synthesis**:
```
## Session Summary

Duration: [Time spent]
Ideas Generated: [Count]
Technique Used: [Technique]

### Key Insights:
1. [Major realization]
2. [Surprising connection]
3. [Breakthrough idea]

### Top 3 Actionable Ideas:
1. **[Idea]**: [Next step]
2. **[Idea]**: [Next step]
3. **[Idea]**: [Next step]

### Parking Lot (explore later):
- [Interesting tangent 1]
- [Interesting tangent 2]

### Follow-up Questions:
- [Question to research]
- [Question to validate]
```

## Success Criteria

- [ ] Generated 10+ diverse ideas
- [ ] Explored multiple perspectives
- [ ] Identified 3+ actionable next steps
- [ ] User engaged throughout session
- [ ] Clear documentation of outcomes
- [ ] Follow-up actions defined

## Integration with BACO

This task can be triggered:
- During `/orchestrate` for complex problems
- By specific agents when stuck
- Through `/brainstorm` command (if created)
- As part of PRD generation process

## Tips for Effective Facilitation

1. **Create Safety**: No idea is too wild initially
2. **Time Box**: Keep energy high with time limits
3. **Visual Aids**: Use diagrams and sketches
4. **Energy Management**: Take breaks if needed
5. **Documentation**: Capture everything, curate later
6. **Follow Through**: Always end with concrete next steps

## Example Session Flow

```
User: I need to improve user onboarding for our app

AI: Great topic! Let's brainstorm improvements to user onboarding. 

First, what's the main challenge with current onboarding?
- Too long?
- Too complex?
- Low completion rate?
- Something else?

User: Low completion rate - users drop off

AI: Let's use SCAMPER to generate ideas. Starting with your onboarding flow:

**Substitute**: What if we substituted the traditional sign-up form with:
- Social login only?
- Progressive profiling (ask for info as needed)?
- Gamified character creation?

What resonates with you? Or shall we explore other SCAMPER dimensions?
```

Remember: The goal is to facilitate, not dominate. Guide the process while letting creativity flow freely.