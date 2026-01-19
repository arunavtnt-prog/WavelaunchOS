#!/bin/bash
git remote -v
git status
git add .
git commit -m "Implement features"
git remote add origin https://github.com/arunavtnt-prog/penguin-wavelaunch-os.git || true
git remote add second-origin https://github.com/arunavtnt-prog/WavelaunchOS.git || true
git push origin main
git push second-origin main
