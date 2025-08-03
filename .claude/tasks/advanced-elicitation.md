# Advanced Elicitation Task

## Purpose

Provide optional reflective and brainstorming actions to enhance content quality through structured elicitation techniques. This enables deeper exploration of ideas and iterative refinement through multiple analytical perspectives.

## Usage Scenarios

### Scenario 1: During Document Creation

After outputting a section:
1. Ask user to review the drafted section
2. Present 9 contextually selected elicitation methods
3. User types a number (0-8) to engage method, or 9 to proceed
4. Apply selected method, then re-offer choices until user proceeds

### Scenario 2: General Elicitation Request

When user requests "advanced elicitation" or "elicit: true" is set:
- Analyze current context
- Select 9 relevant methods
- Follow same selection process

## Task Instructions

### 1. Context Analysis

Before presenting options, analyze:

**Content Factors**:
- Type: Technical specs, requirements, architecture, stories, etc.
- Complexity: Simple, moderate, or complex
- Audience: Who will use this information
- Impact: Critical decisions vs routine items
- Stage: Early exploration vs final refinement

**Method Selection Strategy**:

1. **Core Methods** (select 3-4):
   - Expand or Contract for Audience
   - Critique and Refine
   - Identify Potential Risks
   - Assess Alignment with Goals

2. **Context-Specific** (select 4-5):
   - **Technical**: Tree of Thoughts, ReWOO, Meta-Prompting
   - **User-Facing**: Agile Team Perspective, Stakeholder Roundtable
   - **Creative**: Innovation Tournament, Hindsight Reflection
   - **Strategic**: Red Team vs Blue Team, Self-Consistency

3. **Always Include**: "Proceed / No Further Actions" as option 9

### 2. Present Elicitation Options

**Format**:
```text
Please review the section above. You can suggest direct changes OR select an elicitation method:

**Advanced Elicitation Options**
Choose a number (0-8) or 9 to proceed:

0. [Method Name]
1. [Method Name]
2. [Method Name]
3. [Method Name]
4. [Method Name]
5. [Method Name]
6. [Method Name]
7. [Method Name]
8. [Method Name]
9. Proceed / No Further Actions
```

**Response Handling**:
- Numbers 0-8: Execute method, then re-offer
- Number 9: Proceed to next section
- Direct feedback: Apply changes and continue

### 3. Elicitation Methods

#### Core Reflective Methods

**Expand or Contract for Audience**
- Ask whether to expand (add detail) or contract (simplify)
- Identify target audience
- Tailor complexity and depth

**Critique and Refine**
- Review for flaws or improvements
- Identify specific weaknesses
- Suggest refined version

**Explain Reasoning (Chain of Thought)**
- Walk through step-by-step thinking
- Reveal assumptions and decisions
- Show how conclusions were reached

#### Structural Analysis

**Analyze Logical Flow**
- Examine structure for progression
- Check consistency and coherence
- Validate dependencies
- Confirm effective ordering

**Assess Goal Alignment**
- Evaluate contribution to objectives
- Identify misalignments or gaps
- Suggest adjustments

#### Risk and Challenge

**Identify Potential Risks**
- Brainstorm risks from role expertise
- Find overlooked edge cases
- Anticipate consequences
- Highlight challenges

**Challenge Critical Perspective**
- Play devil's advocate
- Argue against proposal
- Apply YAGNI principles
- Question assumptions

#### Creative Exploration

**Tree of Thoughts**
- Break into discrete reasoning steps
- Explore multiple paths
- Evaluate each path
- Find optimal solutions

**Hindsight Reflection**
- Imagine retrospective scenario
- "If only we had..." insights
- Extract actionable learnings

#### Multi-Perspective

**Agile Team Perspectives**
- Product Owner: User value focus
- Scrum Master: Process and flow
- Developer: Technical feasibility
- QA: Quality and testing

**Stakeholder Roundtable**
- Multiple persona viewpoints
- Identify conflicts and synergies
- Synthesize recommendations

#### Advanced Techniques

**Self-Consistency Validation**
- Generate multiple reasoning paths
- Compare consistency
- Identify robust solutions
- Highlight divergences

**ReWOO (Reasoning Without Observation)**
- Pure reasoning approach
- Minimize external dependencies
- Optimize efficiency

**Meta-Prompting Analysis**
- Analyze current approach
- Question methodology
- Suggest alternatives
- Optimize process

### 4. Execution Guidelines

**When Executing Methods**:
- Be concise and actionable
- Stay relevant to content
- Identify personas clearly
- Maintain efficient flow
- Focus on improvements

**After Each Method**:
- Present results clearly
- Re-offer same 9 options
- Continue until user proceeds
- Track which methods used

### 5. Integration with Templates

When `elicit: true` in templates:
- MUST offer elicitation
- Cannot skip for efficiency
- User interaction required
- Document improvements applied

## Success Criteria

- [ ] Context properly analyzed
- [ ] Methods intelligently selected
- [ ] User choices respected
- [ ] Improvements actionable
- [ ] Process remains efficient
- [ ] Content quality enhanced