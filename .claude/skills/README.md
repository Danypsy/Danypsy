# Claude Skills - FALCON Analysis Framework

This directory contains custom skills for Claude Code.

## Available Skills

### 🦅 FALCON Analysis Framework

**File:** `falcon-analysis.md`

**Description:** A comprehensive analytical framework for deep strategic analysis of content focusing on AI, futurism, complex systems, epistemology, technological philosophy, and narrative analysis.

**FALCON** stands for: **Futurism & Advanced Logic CONtext Framework**

#### What it does

The FALCON framework provides exhaustive analysis through 10 analytical modules:

1. **Central Thesis** — Identifies and categorizes the main idea
2. **Argumentative Architecture** — Maps logical structure and premises
3. **Rhetoric & Persuasion** — Analyzes persuasive techniques and cognitive biases
4. **Epistemological Analysis** — Evaluates knowledge claims and evidence
5. **Systemic Analysis** — Maps actors, dynamics, and feedback loops
6. **Ideological/Anthropological Framework** — Uncovers worldviews and myths
7. **Creator Bias** — Examines author perspective and omissions
8. **Alternative Scenarios** — Develops contrary plausible futures
9. **Strategic Effectiveness** — Assesses persuasive power and impact
10. **Operational Synthesis** — Provides comprehensive evaluation

#### How to use

1. **Invoke the skill:**
   ```
   Use the Skill tool with command: "falcon-analysis"
   ```

2. **Provide content to analyze:**
   After invoking the skill, paste or describe the content you want analyzed (video transcript, article, text, podcast transcript, etc.)

3. **Receive comprehensive analysis:**
   The skill will produce a detailed analysis following all 10 modules with methodological rigor and analytical depth.

#### Use cases

- Analyzing AI/tech trend articles and predictions
- Evaluating futurist content and scenarios
- Deconstructing persuasive tech narratives
- Critical analysis of technological philosophy
- Strategic assessment of complex systems thinking
- Evaluating speculative content about AI and the future

#### Analysis Principles

- **No condensing** — Full comprehensive treatment
- **5-15 paragraphs per module minimum** — Deep analytical depth
- **Total analytical neutrality** — Objective over subjective
- **Structural over moral judgments** — Focus on mechanics
- **Clear fact/speculation distinction** — Rigorous epistemology
- **Meta-analysis conclusion** — Evaluates originality and impact

#### Example Usage

```
User: Analyze this article about AGI timelines using FALCON
[Paste article content]

Claude: [Invokes falcon-analysis skill]
[Provides comprehensive 10-module analysis]
[Concludes with meta-analysis on originality vs. recycled ideas]
```

---

## Creating New Skills

To create additional skills:

1. Create a new `.md` file in `.claude/skills/`
2. Structure your skill with:
   - Clear description
   - Usage instructions
   - Detailed methodology or framework
   - Examples if applicable
3. Document it in this README

---

## Notes

- Skills are custom prompts that give Claude specialized capabilities
- They can be invoked during any conversation
- Each skill should focus on a specific domain or methodology
- Skills should be self-contained and well-documented
