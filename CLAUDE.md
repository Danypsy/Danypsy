# CLAUDE.md - AI Assistant Guide

## Repository Overview

### Purpose
This is a GitHub profile repository (`Danypsy/Danypsy`) - a special repository where the README.md file is automatically displayed on the GitHub profile page. This serves as a personal introduction and professional showcase.

### Owner Focus Areas
- Machine Learning and Artificial Intelligence
- Python programming
- Statistics and data analysis
- Collaborative machine learning projects

## Repository Structure

```
Danypsy/
├── .git/              # Git version control
├── README.md          # Profile page content (public-facing)
└── CLAUDE.md          # AI assistant guide (this file)
```

### Current State
- **Primary Content**: Single README.md file with profile introduction
- **Language**: Markdown with emoji formatting
- **Complexity**: Minimal (profile repository)

## Development Workflows

### Branch Strategy

#### Main Branch
- **Purpose**: Production-ready profile content
- **Protection**: Direct commits should be avoided; use feature branches
- **Merging**: Only merge tested and reviewed changes

#### Feature Branches
- **Naming Convention**: `claude/claude-md-{session-id}`
- **Example**: `claude/claude-md-mi69eywrfegcwe09-01X8zmuUAfEzJAX845Ac9572`
- **Purpose**: Development and testing of changes before merging to main
- **Lifecycle**: Create → Develop → Test → Push → Create PR → Merge → Delete

### Git Operations

#### Pushing Changes
```bash
# CRITICAL: Branch must start with 'claude/' and match session ID
git push -u origin <branch-name>

# Network error handling: Retry up to 4 times with exponential backoff
# Retry delays: 2s, 4s, 8s, 16s
```

#### Fetching/Pulling
```bash
# Prefer specific branch fetches
git fetch origin <branch-name>

# For pulls
git pull origin <branch-name>
```

#### Commit Messages
- **Format**: Clear, descriptive, imperative mood
- **Example**: "Add ML project showcase section" (not "Added ML projects")
- **Focus**: Explain WHY, not just WHAT

### Standard Workflow for AI Assistants

1. **Analyze Current State**
   - Read README.md to understand current content
   - Check git status and branch information
   - Review recent commits for context

2. **Plan Changes**
   - Use TodoWrite tool for multi-step tasks
   - Break down complex changes into manageable steps
   - Consider impact on profile presentation

3. **Implement Changes**
   - Make targeted edits to README.md
   - Maintain consistent formatting and style
   - Preserve emoji usage (profile uses emojis)

4. **Commit and Push**
   - Stage relevant changes
   - Write descriptive commit message
   - Push to feature branch (claude/*)
   - Verify push success

5. **Create Pull Request** (when requested)
   - Use clear PR title
   - Provide summary of changes
   - Include test plan/verification steps

## File-Specific Conventions

### README.md

#### Purpose
Public-facing profile introduction that appears on GitHub profile page.

#### Content Guidelines
- **Tone**: Friendly, professional, welcoming
- **Emojis**: Use emojis for visual interest (current style: 👋 👀 🌱 💞️ 📫)
- **Sections**: Introduction, interests, learning focus, collaboration goals, contact
- **Length**: Concise (5-10 bullet points typical)

#### Formatting Standards
- Use markdown bullet lists (-)
- Start with emoji, followed by content
- Keep lines focused and scannable
- Maintain HTML comment for GitHub template

#### Example Structure
```markdown
- 👋 Hi, I'm @Username
- 👀 I'm interested in [interests]
- 🌱 I'm currently learning [learning focus]
- 💞️ I'm looking to collaborate on [collaboration areas]
- 📫 How to reach me [contact info]
```

## Key Conventions

### Content Updates
1. **Preserve User Voice**: Maintain the personal, friendly tone
2. **Accuracy**: Only add information that's verifiable or user-provided
3. **Relevance**: Keep content focused on professional/technical interests
4. **Privacy**: Never add personal contact details without explicit permission

### Code Quality
- **Markdown Linting**: Ensure valid markdown syntax
- **Link Validation**: Verify any URLs added
- **Emoji Rendering**: Test that emojis display correctly

### Security
- **No Credentials**: Never commit API keys, tokens, or passwords
- **No Personal Data**: Avoid adding sensitive personal information
- **Public Repository**: Remember this is publicly visible

## Common Tasks for AI Assistants

### Task 1: Update Profile Information
```markdown
Steps:
1. Read current README.md
2. Identify section to update
3. Make targeted edit preserving format
4. Commit: "Update [section] in profile"
5. Push to feature branch
```

### Task 2: Add New Section
```markdown
Steps:
1. Read README.md for context
2. Determine appropriate placement
3. Write section matching existing style
4. Ensure emoji usage is consistent
5. Commit: "Add [section name] section"
6. Push to feature branch
```

### Task 3: Enhance ML/AI Focus
```markdown
Steps:
1. Review current ML/AI mentions
2. Consider: projects, skills, learning goals
3. Draft enhancement maintaining brevity
4. Preserve user's voice and style
5. Commit: "Enhance ML/AI section"
6. Push to feature branch
```

### Task 4: Create Pull Request
```markdown
Prerequisites:
- All changes committed and pushed
- Feature branch is up to date

Steps:
1. Verify git status (clean working tree)
2. Review git diff vs main branch
3. Draft PR summary with bullet points
4. Create PR with gh CLI or prompt user
5. Provide PR URL to user
```

## Technology Context

### Repository Type
- **Platform**: GitHub
- **Visibility**: Public
- **Special Feature**: Profile README (displays on profile)
- **Documentation**: [About Profile READMEs](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

### Tools and Languages
- **Primary Language**: Markdown
- **Version Control**: Git
- **Remote**: GitHub (proxied through local endpoint)
- **Branch Prefix**: `claude/*` for AI assistant work

## Best Practices for AI Assistants

### Do's ✅
- Read existing content before making changes
- Preserve the user's tone and style
- Use TodoWrite for multi-step tasks
- Test markdown rendering mentally
- Commit frequently with clear messages
- Push to feature branches only
- Ask for clarification when uncertain

### Don'ts ❌
- Don't push directly to main branch
- Don't add information without user approval
- Don't remove existing content without reason
- Don't change the friendly/emoji style
- Don't add credentials or sensitive data
- Don't create files unnecessarily
- Don't use bash echo for user communication

## Troubleshooting

### Push Failures (403 Error)
**Cause**: Branch name doesn't match required pattern
**Solution**: Ensure branch starts with `claude/` and includes correct session ID

### Network Errors
**Solution**: Implement retry logic with exponential backoff (2s, 4s, 8s, 16s)

### Merge Conflicts
**Prevention**: Fetch latest changes before starting work
**Resolution**: Manually resolve conflicts preserving user's content

## Additional Notes

### Repository Growth
Currently minimal, but may expand to include:
- Project showcases
- Portfolio items
- Blog post links
- Technical achievements
- Contribution graphs

### AI Assistant Sessions
Each session gets unique branch: `claude/claude-md-{session-id}`
This enables parallel work and clear tracking of AI-generated changes.

### User Preferences
Based on README.md:
- Interested in ML/AI collaboration
- Learning Python and statistics
- Open to networking and project collaboration

## Quick Reference

### Essential Commands
```bash
# Check status
git status

# View current branch
git branch

# See recent commits
git log --oneline -5

# Read profile
cat README.md

# Push changes
git push -u origin claude/claude-md-{session-id}
```

### File Locations
- Profile content: `/home/user/Danypsy/README.md`
- This guide: `/home/user/Danypsy/CLAUDE.md`
- Git directory: `/home/user/Danypsy/.git`

---

**Last Updated**: 2025-11-19
**Repository**: Danypsy/Danypsy
**Purpose**: Guide AI assistants in maintaining and enhancing this GitHub profile repository
