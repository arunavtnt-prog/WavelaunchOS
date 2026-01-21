#!/bin/bash
exec > /Users/arunav/Desktop/WavelaunchOS/git_verify.log 2>&1
echo "Checking Git Remotes..."
git remote -v
echo "Checking Git Status..."
git status
echo "Checking last 3 commits..."
git log -n 3 --oneline
echo "Adding changes..."
git add .
echo "Committing fix if needed..."
git commit -m "Fix syntax error in submissions page" || echo "Nothing to commit"
echo "Pushing to origin..."
git push origin main
echo "Pushing to second-origin..."
git push second-origin main
echo "Done."
