# GitHub Issues Guide

**Project**: `session-booker-pro`
**Repository**: `https://github.com/TRWchwuik/session-booker-pro.git`
**Objective**: Maintain a rigorous, transparent, and up-to-date history of all work, decisions, and progress. Make sure you add datetime when creating and closing the issue.

---

## ⚠️ Prime Directive
**No code changes are committed without a corresponding GitHub Issue.** Taking 30 seconds to track work saves hours of confusion later.

---

## 1. Initialization (Start of Task)
Before writing any code or planning detailed implementation:

1. **Search & Check**: Look for existing issues related to the user's request. Record the current datetime in the issue body or as a comment if you are starting a new session on an existing issue.
   - *Tool*: `github_search_issues`
   - *Metadata*: Record `**Last Reviewed Datetime**`: `[ISO Timestamp]`
2. **Create (if not found)**: Create a new issue if one does not exist.
   - *Tool*: `github_create_issue`
3. **Update (if found)**: If an issue exists but is outdated, update it with new context and the current datetime.

### Issue Structure Template
When creating an issue, use this structure:

```markdown
**Title**: `[Type] Concise Description`
*Types*: `Feature`, `Bug`, `Refactor`, `Docs`, `Chore`

**Body**:
**Start Datetime**: `[ISO Timestamp, e.g., 2026-06-13T07:45:00Z]`

## Objective
[Brief description of what needs to be achieved]

## Acceptance Criteria
- [ ] Criterion 1 (e.g., Page loads without errors)
- [ ] Criterion 2 (e.g., User can click X)

## Technical Notes
- [Optional: Brief note on implementation strategy, e.g., "Using generic-ui library"]
```
