@echo off

echo Setting up Git hooks

if not exist .git (
    echo This script must be run from the root of a Git repository.
    exit /b 1
)

copy .github\git-hooks\pre-commit .git\hooks\pre-commit /Y
if %errorlevel% neq 0 (
    echo Failed to copy pre-commit hook.
    exit /b 1
)

copy .github\git-hooks\prepare-commit-msg .git\hooks\prepare-commit-msg /Y
if %errorlevel% neq 0 (
    echo Failed to copy prepare-commit-msg hook.
    exit /b 1
)

echo Git hooks have been set up successfully.
exit /b 0
