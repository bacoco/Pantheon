# Product Owner (PO) Master Validation Checklist

This checklist serves as a comprehensive framework for validating project plans before development execution. It adapts intelligently based on project type and includes UI/UX considerations when applicable.

[[LLM: INITIALIZATION INSTRUCTIONS - PO MASTER CHECKLIST

PROJECT TYPE DETECTION:
First, determine the project type by checking:

1. Is this a GREENFIELD project (new from scratch)?
   - Look for: New project initialization, no existing codebase references
   - Check for: PRD, architecture docs, new project setup

2. Is this a BROWNFIELD project (enhancing existing system)?
   - Look for: References to existing codebase, enhancement language
   - Check for: Enhancement PRDs, modification architecture docs

3. Does the project include UI/UX components?
   - Check for: Frontend architecture, UI/UX specifications
   - Look for: Frontend stories, component specifications

DOCUMENT REQUIREMENTS:
Based on project type, ensure access to:

For GREENFIELD projects:
- PRD (Product Requirements Document)
- Architecture documentation
- Frontend architecture (if UI/UX involved)
- All epic and story definitions

For BROWNFIELD projects:
- Enhancement PRD
- Modification architecture docs
- Existing codebase documentation
- Current deployment configuration
- Database schemas, API documentation

SKIP INSTRUCTIONS:
- Skip sections marked [[BROWNFIELD ONLY]] for greenfield projects
- Skip sections marked [[GREENFIELD ONLY]] for brownfield projects
- Skip sections marked [[UI/UX ONLY]] for backend-only projects
- Note all skipped sections in final report

VALIDATION APPROACH:
1. Deep Analysis - Thoroughly analyze each item
2. Evidence-Based - Cite specific sections when validating
3. Critical Thinking - Question assumptions and gaps
4. Risk Assessment - Consider what could go wrong

EXECUTION MODE:
Ask user preference:
- Section by section (interactive) - Review each section with confirmation
- All at once (comprehensive) - Complete analysis with final report]]

## 1. PROJECT SETUP & INITIALIZATION

[[LLM: Foundation validation. Greenfield needs clean start. Brownfield needs safe integration.]]

### 1.1 Project Scaffolding [[GREENFIELD ONLY]]

- [ ] Epic 1 includes project creation/initialization steps
- [ ] Starter template or scaffolding steps defined
- [ ] Initial documentation setup included
- [ ] Repository setup and initial commit defined
- [ ] Development environment clearly specified

### 1.2 Existing System Integration [[BROWNFIELD ONLY]]

- [ ] Existing project analysis completed and documented
- [ ] Integration points with current system identified
- [ ] Development environment preserves existing functionality
- [ ] Local testing approach for existing features validated
- [ ] Rollback procedures defined for each integration

### 1.3 Development Environment

- [ ] Local development setup clearly defined
- [ ] Required tools and versions specified
- [ ] Dependency installation steps included
- [ ] Configuration files addressed
- [ ] Development server setup included

### 1.4 Core Dependencies

- [ ] Critical packages/libraries installed early
- [ ] Package management properly addressed
- [ ] Version specifications defined
- [ ] Dependency conflicts noted
- [ ] [[BROWNFIELD ONLY]] Version compatibility verified

## 2. INFRASTRUCTURE & DEPLOYMENT

[[LLM: Infrastructure must exist before use. Brownfield must integrate without breaking.]]

### 2.1 Infrastructure Sequence

- [ ] Infrastructure setup precedes usage
- [ ] No premature service references
- [ ] Creation order respects dependencies
- [ ] [[BROWNFIELD ONLY]] Existing infrastructure preserved

### 2.2 Configuration Management

- [ ] Environment variables defined before use
- [ ] Configuration files created appropriately
- [ ] Secrets management addressed
- [ ] [[BROWNFIELD ONLY]] Existing configs maintained

### 2.3 Deployment Strategy

- [ ] Deployment steps clearly defined
- [ ] CI/CD pipeline configuration included
- [ ] Rollback procedures documented
- [ ] Monitoring and logging setup addressed

## 3. DATABASE & DATA LAYER

[[LLM: Data foundation critical. Migrations especially important for brownfield.]]

### 3.1 Database Setup [[GREENFIELD ONLY]]

- [ ] Database creation included in early epics
- [ ] Schema definition before data operations
- [ ] Initial migrations created
- [ ] Seed data approach defined

### 3.2 Database Evolution [[BROWNFIELD ONLY]]

- [ ] Migration strategy for schema changes
- [ ] Backward compatibility maintained
- [ ] Data migration scripts included
- [ ] Rollback procedures for data changes

### 3.3 Data Models

- [ ] Models defined before usage
- [ ] Relationships properly established
- [ ] Validation rules specified
- [ ] [[BROWNFIELD ONLY]] Impact on existing data assessed

## 4. API & INTEGRATION LAYER

### 4.1 API Development

- [ ] API endpoints defined with clear contracts
- [ ] Authentication/authorization implemented early
- [ ] Error handling standardized
- [ ] API documentation approach defined
- [ ] [[BROWNFIELD ONLY]] Backward compatibility maintained

### 4.2 External Integrations

- [ ] Third-party services configured before use
- [ ] API keys and credentials managed securely
- [ ] Error handling for external failures
- [ ] [[BROWNFIELD ONLY]] Existing integrations preserved

## 5. FRONTEND DEVELOPMENT [[UI/UX ONLY]]

### 5.1 UI Framework Setup

- [ ] Frontend framework initialized early
- [ ] Component library decisions made
- [ ] Styling approach defined
- [ ] Build configuration established

### 5.2 Component Architecture

- [ ] Component structure planned
- [ ] State management approach defined
- [ ] Routing configuration included
- [ ] [[BROWNFIELD ONLY]] Integration with existing UI

### 5.3 User Experience

- [ ] UI/UX specifications available
- [ ] Responsive design addressed
- [ ] Accessibility requirements included
- [ ] Performance optimization planned

## 6. QUALITY ASSURANCE

### 6.1 Testing Strategy

- [ ] Test setup included in early stories
- [ ] Unit test approach defined
- [ ] Integration test strategy clear
- [ ] E2E test approach planned
- [ ] [[BROWNFIELD ONLY]] Regression test coverage

### 6.2 Code Quality

- [ ] Linting and formatting setup
- [ ] Code review process defined
- [ ] Documentation standards established
- [ ] [[BROWNFIELD ONLY]] Consistency with existing code

## 7. SECURITY & COMPLIANCE

### 7.1 Security Implementation

- [ ] Authentication implemented early
- [ ] Authorization checks comprehensive
- [ ] Data encryption addressed
- [ ] Security headers configured
- [ ] [[BROWNFIELD ONLY]] Existing security maintained

### 7.2 Compliance Requirements

- [ ] Data privacy requirements addressed
- [ ] Audit logging implemented
- [ ] Compliance documentation prepared
- [ ] [[BROWNFIELD ONLY]] Existing compliance preserved

## 8. OPERATIONAL READINESS

### 8.1 Monitoring & Logging

- [ ] Logging strategy implemented
- [ ] Monitoring tools configured
- [ ] Alert thresholds defined
- [ ] Performance metrics tracked

### 8.2 Documentation

- [ ] API documentation complete
- [ ] Deployment guide created
- [ ] Troubleshooting guide prepared
- [ ] [[BROWNFIELD ONLY]] Existing docs updated

## 9. RISK ASSESSMENT

### 9.1 Technical Risks

- [ ] Performance bottlenecks identified
- [ ] Scalability concerns addressed
- [ ] Technical debt acknowledged
- [ ] Mitigation strategies defined

### 9.2 Project Risks

- [ ] Timeline risks assessed
- [ ] Resource constraints identified
- [ ] Dependency risks evaluated
- [ ] Contingency plans created

## 10. FINAL VALIDATION

### 10.1 Completeness Check

- [ ] All epics have clear outcomes
- [ ] All stories are actionable
- [ ] Dependencies properly sequenced
- [ ] No circular dependencies

### 10.2 Coherence Validation

- [ ] PRD aligns with architecture
- [ ] Stories implement PRD requirements
- [ ] Technical approach consistent
- [ ] [[BROWNFIELD ONLY]] Changes isolated appropriately

## Summary Report Template

```
Project Type: [Greenfield/Brownfield]
UI/UX Included: [Yes/No]
Validation Mode: [Interactive/Comprehensive]

Critical Issues Found:
1. [Issue] - [Impact] - [Recommendation]

Warnings:
1. [Warning] - [Risk] - [Suggestion]

Sections Skipped:
- [Section name] - [Reason]

Overall Assessment: [Ready/Needs Work/Blocked]

Recommended Actions:
1. [Priority 1 action]
2. [Priority 2 action]

Validation completed by: PO Agent (Athena)
Date: [Current date]
```