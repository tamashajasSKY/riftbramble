#!/usr/bin/env python3
"""Current focused regression suite; requires npm install and Chromium."""
import pathlib, subprocess
ROOT=pathlib.Path(__file__).resolve().parent
TESTS=['test-game.cjs','test-v1.6.cjs','test-mechanics16.cjs',
       'test-class-button.cjs','test-hud.cjs','test-offline.cjs',
       'test-backup16.cjs','test-campaign.cjs']
for test in TESTS:
    print(f'Running {test}',flush=True)
    subprocess.run(['node',test],cwd=ROOT,check=True)
