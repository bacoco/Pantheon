# /learn-pattern Command - Pattern Learning System

ACTIVATION: When user types `/learn-pattern <task> <outcome>`, evaluate and potentially store the pattern.

## Pattern Evaluation Process

### Step 1: Analyze the Implementation
Review the task, approach, and outcome to determine if this represents a reusable pattern.

### Step 2: Evaluate Pattern Quality

Consider these factors:

1. **Generalizability**: Can this approach work for similar tasks?
2. **Success Indicators**: What made this implementation successful?
3. **Uniqueness**: Is this different from existing patterns?
4. **Complexity Match**: Does the solution fit the problem complexity?
5. **Best Practices**: Does it follow good engineering principles?

### Step 3: Determine Action

Based on evaluation, decide:
- **STORE**: Valuable new pattern worth remembering
- **REFINE**: Update existing similar pattern
- **REJECT**: Too specific or not successful enough

## Pattern Storage Format

```json
{
  "id": "[timestamp-based-id]",
  "name": "[Descriptive pattern name]",
  "category": "[architecture|implementation|testing|security|integration]",
  "complexity_level": "[simple|moderate|complex|extreme]",
  "description": "[What this pattern solves]",
  "context": {
    "task": "[Original task description]",
    "complexity_profile": {
      "technical": X,
      "domain": X,
      "scale": X,
      "team": X,
      "timeline": X
    }
  },
  "approach": {
    "summary": "[High-level approach]",
    "key_decisions": [
      "[Important decision made]",
      "[Important decision made]"
    ],
    "technologies": ["tech1", "tech2"],
    "architecture_pattern": "[Pattern used]"
  },
  "outcomes": {
    "success_metrics": {
      "implementation_time": "[Actual time]",
      "quality_score": "[0-1]",
      "complexity_handled": "[How well complexity was managed]"
    },
    "lessons_learned": [
      "[Key insight]",
      "[Key insight]"
    ]
  },
  "applicability": {
    "when_to_use": [
      "[Condition]",
      "[Condition]"
    ],
    "when_not_to_use": [
      "[Anti-condition]",
      "[Anti-condition]"
    ],
    "prerequisites": [
      "[Required condition]",
      "[Required condition]"
    ]
  },
  "usage_count": 1,
  "success_rate": 1.0,
  "last_used": "[timestamp]",
  "tags": ["tag1", "tag2", "tag3"]
}
```

## Pattern Matching

When evaluating new tasks, patterns are matched based on:
1. **Similarity of complexity profile**
2. **Matching tags and keywords**
3. **Applicable conditions**
4. **Success rate of pattern**
5. **Recency of use**

## Output Format

```yaml
Pattern Evaluation: [Pattern Name]

Evaluation Result: [STORE|REFINE|REJECT]
Confidence: [0.0-1.0]

Analysis:
  Generalizability: [High|Medium|Low]
  - [Reasoning]
  
  Uniqueness: [High|Medium|Low]
  - [Reasoning]
  
  Success Indicators:
  - [What made this successful]
  - [Key factors]

Decision Rationale:
  [Why this pattern should be stored/refined/rejected]

Pattern Summary:
  Name: [Descriptive name]
  Category: [Category]
  When to Use: [Brief conditions]
  Key Benefit: [Primary advantage]

Similar Patterns:
  - [Existing pattern name]: [How it relates]
```

## Guidelines

1. **Quality over Quantity**: Only store truly valuable patterns
2. **Clear Conditions**: Be specific about when to use/not use
3. **Concrete Benefits**: Quantify success where possible
4. **Evolution**: Patterns should improve over time with use
5. **Actionable**: Patterns must provide clear guidance

## Example

User: `/learn-pattern "Implemented real-time chat with WebSockets" "Success: 50ms latency, handling 10k concurrent users"`

You would:
1. Analyze the WebSocket implementation approach
2. Evaluate its generalizability to other real-time features
3. Document key decisions (protocol choice, scaling strategy)
4. Store as pattern if valuable for future real-time features
5. Tag appropriately for future retrieval

The pattern helps future similar tasks benefit from this successful implementation.