# AI Context - RelationshipOS 1.0
## Instant Context for AI Assistants

> **👋 START HERE FIRST. This file provides everything an AI needs to productively assist with RelationshipOS development.**

---

## 🎯 **WHAT WE'RE BUILDING**

**Product**: RelationshipOS 1.0 - "AI Virtual Assistant for Professional Relationship Management"  
**Core Feature**: Oracle Engine (AI that replaces virtual assistants for relationship management)  
**Revolutionary Thesis**: Replace $5K/month relationship management VAs with $299/month AI  
**Business Model**: High-margin B2B SaaS utility tool (Personal Pro/Business/Enterprise tiers)  
**Timeline**: 4-week sprint cycles with clear planning-to-building transitions  
**Current Status**: Week 4 Complete - 21,477 lines of production code, 80% launch ready

## 🧠 **OUR METHODOLOGY - PHASE-GATED DEVELOPMENT**

We follow the **Enhanced Wisedom Planning-First Framework** with clear transition checkpoints:

### **Phase 1: DOCUMENTATION & PLANNING** 📋
**Goal**: Comprehensive vision, strategy, technical specs  
**Duration**: Until confidence threshold reached  
**Output**: Clear implementation roadmap  
**Completion Criteria**: Kyle approves transition to building phase

### **🚨 TRANSITION CHECKPOINT**
**Forcing Question**: "Can a developer build this from our docs?"  
**Gate Requirement**: Kyle explicitly approves transition to building phase  
**Warning Signs**: 3+ strategy documents without code, documentation refinement loops

### **Phase 2: CODE IMPLEMENTATION** ⚡
**Goal**: Working features that match documentation  
**Duration**: Until features are demonstrably functional  
**Output**: Deployable code with real functionality  
**Progress Metric**: Working features Kyle can interact with

**Key Documents**:
- **[Refined Strategy](docs/RELATIONSHIPOS_REFINED_STRATEGY.md)** - B2B SaaS utility tool approach
- **[Technical Scope](docs/RELATIONSHIPOS_1.0_TECHNICAL_SCOPE.md)** - Implementation blueprint  
- **[Vision Manifesto](docs/RELATIONSHIPOS_VISION_MANIFESTO.md)** - North star & anti-scope creep
- **[Development Methodology](docs/DEVELOPMENT_METHODOLOGY.md)** - Complete framework with AI prompts
- **[Weekly Execution Playbook](docs/WEEKLY_EXECUTION_PLAYBOOK.md)** - Assessment to action conversion
- **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Development environment guide
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute with methodology

## 🚀 **CURRENT STATUS** (Week 4 Complete - 80% Launch Ready)

**Phase**: BUILDING PHASE (Code Implementation)  
**Priority**: Final 20% - Stripe integration, production deployment  
**Progress**: 21,477 lines production code, all core features implemented  
**Blockers**: Stripe API keys, production domain setup  
**Next Steps**: Complete payment processing, deploy to app.wisedom.ai  

*See [docs/CURRENT_STATUS.md](docs/CURRENT_STATUS.md) for detailed live status*

## 🚨 **AI ASSISTANT PHASE AWARENESS**

### **🤖 WHEN IN PLANNING PHASE:**
```markdown
FOCUS ON:
- Comprehensive documentation, strategy, vision clarity
- Preventing AI hallucinations through detailed specs
- Managing context window limitations
- Team alignment through shared vision

GOAL: Create specifications detailed enough for implementation
STOP WHEN: Kyle approves transition to building phase
```

### **🤖 WHEN IN BUILDING PHASE:**
```markdown
FOCUS ON:
- Functional code implementation exclusively
- Reference existing documentation rather than creating new strategy
- Measure progress in working features, not refined plans
- Alert if implementation doesn't match documented specifications

GOAL: Working features that match documentation
QUALITY GATE: Features Kyle can interact with and demonstrate
```

### **🚨 WARNING SIGNALS FOR AI ASSISTANTS:**
```typescript
❌ PLANNING THEATER ALERTS:
- Documentation:Code ratio > 10:1 for more than 1 week
- Same feature planned across multiple sessions  
- Strategy refinement without new implementation
- Kyle asking "where's the working code?" more than twice

❌ BUILDING DRIFT ALERTS:
- Code complexity increasing without user value
- Implementation diverging from specifications
- Features incomplete after planned timeframe
- Mock implementations persisting beyond prototyping
```

## 📊 **PROGRESS MEASUREMENT**

### **PLANNING PHASE METRICS:**
- Documentation completeness and clarity
- Strategic decision finalization
- Technical architecture alignment
- Kyle's confidence in implementation roadmap

### **BUILDING PHASE METRICS:**
```typescript
interface BuildingProgress {
  newFunctionalCode: number;        // Lines that do something real
  workingFeatures: string[];        // Demonstrable functionality  
  userFacingChanges: string[];      // What users can actually use
  testableComponents: string[];     // What can be validated
}
```

**Daily Building Validation:**
- Can Kyle interact with new features?
- Would a customer see value in this week's work?
- Are we building what the documentation specified?

## 🛡️ **DECISION FRAMEWORK**

**🚨 CRITICAL**: Before suggesting ANY feature or change, apply our 5-test framework:

1. **Oracle Test**: Does this make Oracle Engine more magical?
2. **Platform Test**: Does this serve the RelationshipOS ecosystem?
3. **10x Test**: Is this 10x better than alternatives, not 10% better?
4. **Magic Test**: Does this feel like magic to users?
5. **Focus Test**: Does this strengthen our core value proposition?

**Anti-Scope Creep**: If it's not Oracle Engine relationship intelligence, it's probably wrong.

## 🏗️ **TECHNICAL ARCHITECTURE** (Production Ready)

**Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, React  
**Backend**: Vercel Edge Functions, PostgreSQL (Supabase), Redis (caching)  
**AI Layer**: OpenAI GPT-4 Turbo, Pinecone Vector Database (planned)  
**Auth**: JWT tokens, role-based access control, multi-tenant security  
**Monitoring**: Production monitoring, error tracking, performance analytics  
**Deployment**: Vercel + custom domain (app.wisedom.ai)

**Database Schema**: Multi-tenant relationship-centric design  
**API Design**: RESTful with Oracle Engine, People, Teams, Analytics, Billing  
**Performance Target**: Sub-10 second Oracle responses (architecture ready)

## 💼 **BUSINESS MODEL** (Revenue Ready)

**Pricing Tiers**:
- Personal Pro: $299/month (individuals)
- Business: $999/month (small teams)  
- Enterprise: $2,499/month (large organizations)

**Value Proposition**: 94% cost savings vs $5K/month human VAs  
**Target Market**: Executives, VCs, Sales Directors, Entrepreneurs  
**Revenue Model**: Subscription SaaS with usage tracking

## 🎯 **QUICK COMMANDS**

**Virtual Executive Team**: Use `@reid`, `@jensen`, `@mark`, `@tim`, `@eric` for expert input  
**Truth-Seeking**: Use `@truth`, `@redteam`, `@premortem`, `@challenge` for critical analysis  
**Weekly Execution**: Use `@weekly-review`, `@exec-triage`, `@exec-sprint` for structured execution

## 🚨 **CONSTRAINTS & GUARDRAILS**

**FORBIDDEN FEATURES** (Anti-Scope Creep):
- ❌ Traditional CRM functionality
- ❌ Social networking features  
- ❌ Communication tools (chat, video)
- ❌ Project management
- ❌ Generic AI features

**MANDATORY PRINCIPLES**:
- ✅ Oracle Engine is the core feature
- ✅ Relationship intelligence focus
- ✅ B2B SaaS utility tool positioning
- ✅ Sub-10 second performance guarantee
- ✅ Phase-gated development with forcing functions

## 📋 **DEVELOPMENT CHECKLIST**

### **Before Starting Any Work:**
1. ✅ Read this AI_CONTEXT.md completely
2. ✅ Identify current phase (Planning vs Building)
3. ✅ Check CURRENT_STATUS.md for latest updates
4. ✅ Apply 5-test framework to proposed changes
5. ✅ Ensure alignment with phase-specific goals

### **During Planning Phase:**
1. ✅ Focus on comprehensive documentation
2. ✅ Prevent AI hallucinations with detailed specs
3. ✅ Create specifications detailed enough for implementation
4. ✅ Seek Kyle's approval for building phase transition

### **During Building Phase:**
1. ✅ Focus exclusively on functional code implementation
2. ✅ Reference existing documentation rather than creating new strategy
3. ✅ Measure progress in working features
4. ✅ Ensure features are demonstrable to Kyle

**This AI_CONTEXT.md is your navigation system. Use it to stay aligned with our revolutionary vision while maintaining disciplined execution.**

---

**💡 Remember: Great products are built by CODE-FIRST teams that document their wins, not DOCUMENTATION-FIRST teams that eventually build.** 