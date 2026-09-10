# Recovery

If the agent edits application code/configuration during Phase 0, stop it. Revert those changes and preserve only valid additive audit documentation.

If the checkout was not clean before installation, do not try to disentangle audit work from unknown local work. Return to a known clean commit/worktree and reinstall the seed.

If Git history is shallow, fetch enough history to perform archaeology rather than guessing. If branches/PRs are unavailable, document that limitation.

If the live site differs from the checked-out `main`, treat that as a deployment-state finding and investigate evidence; do not silently force one to match the other during audit.
