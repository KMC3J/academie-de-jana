@echo off
title L'Academie de Jana
cd /d "%~dp0"

REM Ouvre l'application dans le navigateur, en local, sans rien installer.
if not exist "dist\index.html" (
  echo Construction de l'application...
  call npm install
  call npm run build
)

start "" http://127.0.0.1:59559/
node scripts\serve-dist.mjs 59559
