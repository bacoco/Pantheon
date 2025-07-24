# Create Document Task

## Purpose

Create a structured document using a specified template, ensuring all sections are properly filled and validated according to template rules.

## Input Requirements

- Template name (from templates directory)
- Document context and requirements
- Any pre-existing information to incorporate

## Sequential Task Execution

### 1. Load Template

First, load the specified template:
- Load template from `.claude/templates/{template-name}.yaml`
- Parse template structure and requirements
- Identify required vs optional sections
- Note any validation rules

If template not specified:
- List available templates with descriptions
- Ask user to select appropriate template
- Explain when each template is typically used

### 2. Gather Context

Before starting document creation:
- Understand the specific project/system being documented
- Identify the target audience
- Determine the document's purpose and goals
- Collect any existing relevant information

For each template variable:
- Prompt for value if not provided
- Validate format and constraints
- Use sensible defaults where appropriate

### 3. Section-by-Section Creation

For each template section:

#### Required Sections
- Must be completed with substantive content
- Cannot be marked as "TBD" or left empty
- Follow specific prompts provided in template
- Validate against section-specific rules

#### Optional Sections  
- Include if relevant to the context
- Can be marked as "Not Applicable" with reason
- Still maintain quality when included

#### Repeatable Sections
- Identify items needing repetition
- Create instance for each item
- Maintain consistency across instances

### 4. Content Generation Process

For each section:

1. **Review section requirements**:
   - Read all prompts carefully
   - Understand expected content type
   - Note any format requirements

2. **Generate content**:
   - Address each prompt comprehensively
   - Use clear, professional language
   - Include specific details and examples
   - Maintain consistent terminology

3. **Apply formatting**:
   - Use proper markdown syntax
   - Create clear hierarchy with headers
   - Include lists and tables where helpful
   - Add code blocks for technical content

4. **Cross-reference**:
   - Ensure consistency across sections
   - Link related sections appropriately
   - Avoid redundancy while maintaining clarity

### 5. Validation

After completing all sections:

#### Content Validation
- [ ] All required sections completed
- [ ] All prompts addressed
- [ ] No placeholder text remaining
- [ ] Technical accuracy verified
- [ ] Consistent terminology used

#### Template Rule Validation
- [ ] Minimum length requirements met
- [ ] Required subsections included
- [ ] Validation rules satisfied
- [ ] Format requirements followed

#### Quality Checks
- [ ] Clear and professional writing
- [ ] Appropriate technical depth
- [ ] Logical flow and organization
- [ ] No contradictions or gaps

### 6. Document Assembly

Combine all sections into final document:

1. **Add metadata header**:
   ```markdown
   # {Document Title}
   
   **Version**: 1.0
   **Created**: {Date}
   **Author**: {Agent Name}
   **Template**: {Template Name}
   **Status**: Draft
   ```

2. **Generate table of contents**:
   - Include all major sections
   - Add subsection links
   - Number sections if required

3. **Apply consistent formatting**:
   - Standardize header levels
   - Ensure consistent spacing
   - Format code blocks properly
   - Check list formatting

4. **Add navigation aids**:
   - Section anchors
   - Cross-references
   - Return-to-top links for long documents

### 7. Review and Polish

Final review steps:

1. **Read through entire document**:
   - Check for flow and coherence
   - Ensure all sections connect logically
   - Verify examples make sense

2. **Technical review**:
   - Validate technical claims
   - Check code examples compile/run
   - Ensure architectural diagrams accurate

3. **Editorial polish**:
   - Fix any grammar/spelling issues
   - Improve clarity where needed
   - Ensure consistent voice

### 8. Output Preparation

Prepare final deliverable:

1. **Save to appropriate location**:
   - Default: `docs/pantheon/{document-type}-{timestamp}.md`
   - Or user-specified location
   - Create directory if needed

2. **Generate summary**:
   ```yaml
   Document Created: {Title}
   Template Used: {Template}
   Sections: {Count}
   Word Count: {Approximate}
   Validation: Passed/Failed
   Location: {File Path}
   
   Key Sections Completed:
   - {Section 1}
   - {Section 2}
   - ...
   
   Next Steps:
   - Review with stakeholders
   - Run technical validation
   - Schedule periodic updates
   ```

## Template-Specific Behaviors

### Architecture Document
- Emphasize diagrams and component relationships
- Include technology rationale
- Focus on non-functional requirements

### Test Strategy
- Include specific test scenarios
- Define clear success criteria
- Map tests to requirements

### Security Assessment
- Be thorough with threat modeling
- Include mitigation strategies
- Reference compliance standards

### Implementation Plan
- Create realistic timelines
- Define clear milestones
- Include risk factors

## Error Handling

If issues arise:
- **Missing information**: Prompt for specifics
- **Template not found**: List available templates
- **Validation failure**: Show specific issues
- **Save failure**: Provide content for manual save

## Success Criteria

- [ ] Document follows template structure
- [ ] All required sections completed
- [ ] Validation rules satisfied
- [ ] Professional quality content
- [ ] Saved to specified location
- [ ] Summary provided to user