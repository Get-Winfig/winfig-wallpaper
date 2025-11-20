#!/usr/bin/env sh
set -eu

echo "Setting up Git hooks"

if [ ! -d ".git" ]; then
    echo "This script must be run from the root of a Git repository." >&2
    exit 1
fi

cp .github/git-hooks/pre-commit .git/hooks/pre-commit

if [ $? -ne 0 ]; then
    echo "Failed to copy pre-commit hook." >&2
    exit 1
fi

chmod +x .git/hooks/pre-commit

cp .github/git-hooks/prepare-commit-msg .git/hooks/prepare-commit-msg

if [ $? -ne 0 ]; then
    echo "Failed to copy prepare-commit-msg hook." >&2
    exit 1
fi

chmod +x .git/hooks/prepare-commit-msg

echo "Git hooks have been set up successfully."
exit 0
