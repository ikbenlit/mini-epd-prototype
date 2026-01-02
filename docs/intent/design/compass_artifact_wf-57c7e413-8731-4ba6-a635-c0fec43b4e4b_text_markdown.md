# Intent-Driven Design for Healthcare: A Framework Gap Analysis

The search for an established framework combining language-first interface design, multi-intent recognition, context-aware execution, and proactive suggestions for professional healthcare software reveals a significant gap. **No comprehensive, published methodology exists that matches all specified criteria**, though several emerging frameworks address individual components. This gap represents both a validation of the proposed approach's novelty and an opportunity for framework development.

## The closest existing framework: IBM's Natural Conversation Framework

The **IBM Natural Conversation Framework (NCF)**, published by ACM Books in 2019, represents the most academically rigorous methodology for language-first interface design. Developed by Robert J. Moore and Raphael Arar at IBM Research-Almaden, NCF is grounded in **Conversation Analysis** from social sciences and offers over 100 reusable conversational UX patterns organized into 15 activity modules.

NCF explicitly treats language as the primary interface paradigm rather than an add-on, replacing traditional wireframes with sample dialogs and sequence metrics. Its four core components—an interaction model of "expandable sequences," a six-slot content format, a pattern language, and navigation methods—provide systematic tools for designing conversational experiences. The framework handles context through sequential understanding across turns, distinguishes between local and global intents, and includes sophisticated repair mechanisms for error recovery.

However, NCF was designed for general enterprise applications and lacks healthcare-specific adaptations. It does not address clinical workflows, medical terminology handling, or the proactive suggestion patterns ("nudges") that distinguish modern agentic systems. While healthcare chapters exist in the broader NCF literature, these focus on chatbots rather than primary clinical interfaces.

## Emerging agentic AI design patterns fill part of the gap

Microsoft's **Agent UX Design Principles**, published in April 2025, introduces concepts that closely align with the proposed framework. The principle of "nudging more than notifying" explicitly describes systems that "proactively start chats, create artifacts, and dynamically generate cues" rather than delivering static notifications. Microsoft's temporal framework distinguishes between agents "reflecting on history" (using memory/context), operating in the present through nudges, and "adapting and evolving" for future interactions.

The **Shape of AI** pattern library offers the most comprehensive UX taxonomy for agentic interfaces, organizing patterns into categories including:

- **Wayfinders**: Suggestions, nudges, and follow-up patterns that help users navigate capabilities
- **Prompt Actions**: Transform, expand, summarize, and chained action patterns for multi-step execution  
- **Governors**: Action plans, verification, and "stream of thought" patterns for human oversight
- **Trust Builders**: Citations, footprints, and consent patterns for transparency

Google Cloud's **Agentic AI Design Patterns** provides architectural templates including sequential, parallel, coordinator, and hierarchical task decomposition patterns—useful for implementing multi-intent recognition and complex clinical workflows.

## Healthcare NLI remains focused on documentation, not primary interfaces

The dominant paradigm in healthcare natural language interfaces is **ambient clinical intelligence**—systems like Nuance DAX Copilot and AWS HealthScribe that capture clinician-patient conversations and generate documentation. These operate as sophisticated assistants augmenting traditional EHR interfaces rather than replacing them. **70% of clinicians** using ambient AI report reduced burnout, validating the speech-first approach, but these systems address documentation burden rather than reimagining the entire interaction model.

**Oracle Health EHR**, which received regulatory approval in November 2025 for ambulatory use, represents the first major departure from this pattern. Designed explicitly as a "voice-first intelligent solution," Oracle's approach enables clinicians to navigate the entire EHR through spoken commands: "Show me the patient's latest MRI results" rather than multi-menu navigation. The system synthesizes data from multiple sources and delivers contextual insights conversationally. However, as a commercial product launched recently, published design methodology documentation remains limited.

Academic research identified several healthcare-specific design principles including the **TURF framework** for EHR usability and the **Three-Phase User-Centered XAI-CDSS Framework** for clinical decision support. A critical finding from Frontiers in Computer Science's systematic review of 127 papers: clinicians prefer documentation methods aligned with workflows, and many resist AI-CDSS when they perceive no need for data support—emphasizing that successful NLI design must integrate seamlessly with existing clinical mental models.

## The proposed CAPTURE-INTERPRET-GOAL-EXECUTE-NUDGE pattern appears novel

Mapping existing frameworks against the proposed pattern reveals partial coverage but no complete alignment:

| Framework | CAPTURE | INTERPRET | GOAL | EXECUTE | NUDGE |
|-----------|---------|-----------|------|---------|-------|
| IBM NCF | Opening patterns | Intent recognition, repair | Activity modules | Sequence closers | Next-topic patterns (limited) |
| Microsoft Agent UX | Accessible entry | Context awareness | User-defined goals | Multi-modal actions | **Explicit "nudging" principle** |
| Shape of AI | Wayfinders | Tuners, filters | Prompt actions | Chained actions | Suggestions, nudges |
| Ambient AI (DAX) | Speech capture | NLU parsing | Documentation focus | Note generation | None |

The **NUDGE component**—proactive, context-aware suggestions that anticipate clinician needs—represents the least developed aspect in existing frameworks. Microsoft's principle comes closest, describing agents that "dynamically generate cues" based on context, but no healthcare-specific implementation methodology exists. This proactive layer distinguishes intent-driven interfaces from reactive voice command systems.

## Dutch healthcare context reveals significant implementation gaps

The Netherlands has **no published frameworks** for conversational or intent-driven EPD design. Current Dutch healthcare AI focuses primarily on speech-to-text documentation automation through vendors like Wellcom Health and HealthTalk.ai, addressing "registratielast" (registration burden) rather than reimagining interface paradigms.

Key Dutch resources include **MedRoBERTa.nl**, the first domain-specific language model for Dutch Electronic Health Records developed at VU Amsterdam. Pre-trained on 13GB of text from nearly 10 million hospital notes, MedRoBERTa.nl addresses unique Dutch medical language characteristics—shorter sentences, omitted functional words, specialized vocabulary differing from standard Dutch. This provides a foundation for Dutch clinical NLU but lacks accompanying interface design methodology.

**Nictiz**, the national standards organization, maintains **Zorginformatiebouwstenen (ZIBs)**—healthcare information building blocks providing standardized definitions for medical concepts linked to SNOMED CT, LOINC, and ICD. The "Eenheid van Taal" (Unity of Language) principle establishes semantic foundations that could support intent-driven interfaces, but no guidance exists for conversational design patterns.

**Platform AiGGz** provides GGZ-specific AI guidance, and the AI Kompas voor de Geestelijke Gezondheidszorg offers implementation frameworks. However, author Nicky Hekster notes "veel versnippering" (much fragmentation)—applications don't scale and coordination is lacking. Mental healthcare presents additional design challenges: clinicians prefer narrative documentation to capture uncertainty and nuance, workarounds are common when systems don't fit psychiatric workflows, and the therapeutic relationship creates unique considerations for voice interfaces.

## Recommended framework synthesis approach

Given the absence of a single comprehensive methodology, constructing a framework requires synthesizing elements from multiple sources:

**For design methodology (replacing wireframes):** Adapt IBM NCF's sample dialog and sequence metric approaches. NCF's 15 activity modules and 70+ patterns provide systematic tools for mapping user utterances to system behaviors. Design artifacts should include intent-system maps, dialog flow documentation, and conversational activity patterns rather than traditional screen wireframes.

**For multi-intent recognition and context awareness:** Apply Google Cloud's agentic patterns for handling complex, multi-step clinical workflows. The coordinator and hierarchical task decomposition patterns address scenarios where clinicians express compound intents ("Check the medication interactions and schedule a follow-up if the renal function allows it").

**For proactive suggestions (nudges):** Extend Microsoft's "nudging more than notifying" principle with the Shape of AI's wayfinder patterns. Design for context-triggered suggestions that surface relevant clinical information before the clinician explicitly requests it—medication alerts based on documented symptoms, care pathway recommendations based on diagnosis patterns.

**For healthcare-specific adaptation:** Incorporate the user-centered XAI-CDSS framework's emphasis on workflow alignment, the ambient AI literature's integration patterns, and mental health-specific considerations from the GGZ literature regarding narrative flexibility and therapeutic context.

**For Dutch implementation:** Build on MedRoBERTa.nl for language understanding, align with ZIB semantic standards for clinical concept mapping, and address the "registratielast" concern by demonstrating documentation efficiency gains alongside the interface paradigm shift.

## Key terminology note: the field lacks standard vocabulary

The search revealed no established terminology for this design approach. "Intent-driven design," "language-first interface design," "utterance-driven design," and "conversational design for enterprise" return general conversational AI resources rather than specific methodologies. "Agentic interface design" yields results focused on technical architecture rather than UX methodology. The closest established terms are:

- **Conversational UX Design** (IBM NCF's preferred terminology)
- **Voice-First Design** (common but typically consumer-focused)
- **Agent UX** (Microsoft's emerging terminology)
- **Natural Language Interface Design** (academic, broader scope)

The absence of standardized terminology reinforces the novelty of the proposed approach and suggests opportunity for establishing definitional frameworks alongside the design methodology.

## Conclusion

The research confirms that while individual components of intent-driven healthcare interface design exist across multiple frameworks, **no comprehensive methodology combines language-first primary interfaces, multi-intent clinical workflow recognition, context-aware action execution, and proactive clinical suggestions**. IBM's Natural Conversation Framework provides the strongest methodological foundation for conversational design, Microsoft's Agent UX principles introduce the critical "nudging" concept, and Oracle's voice-first EHR demonstrates commercial viability of primary voice interfaces in clinical settings.

For Dutch GGZ EPD development, the opportunity exists to synthesize these elements into a novel framework. The combination of MedRoBERTa.nl for Dutch clinical NLU, ZIB semantic standards for concept mapping, and adapted NCF patterns for conversational structure could form the basis for a CAPTURE→INTERPRET→GOAL→EXECUTE→NUDGE methodology specifically designed for mental healthcare workflows. Given the documented fragmentation in Dutch healthcare AI initiatives and the absence of published frameworks, such a methodology would represent a genuine contribution to the field.