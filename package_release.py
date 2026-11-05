#!/usr/bin/env python3
"""Package APK and GitHub-ready sources. Signing material is NEVER included."""
from pathlib import Path
import os,zipfile,hashlib,shutil
ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent/'deliverables'; OUT.mkdir(exist_ok=True)
VERSION='1.6.1'; PREFIX=f'RiftBramble-{VERSION}'
FORBIDDEN={'.jks','.keystore','.p12','.pfx','.pem','.apk','.aab','.pyc'}
def atomic_copy(source,target):
    temp=target.with_suffix(target.suffix+'.pending')
    with temp.open('wb') as f:
        f.write(source.read_bytes());f.flush();os.fsync(f.fileno())
    os.replace(temp,target)
apk=ROOT/'dist'/f'{PREFIX}.apk'
with zipfile.ZipFile(apk) as z:assert z.testzip() is None
atomic_copy(apk,OUT/apk.name)
atomic_copy(ROOT/'CHANGELOG.md',OUT/'RiftBramble-valtozasnaplo.md')
atomic_copy(ROOT/'PROJECT_HANDOFF.md',OUT/'RiftBramble-Codex-atadas.md')
files=[]
for dirname in ['app','cloud','gradle','test-fixtures','changelogs']:
    files.extend(p for p in (ROOT/dirname).rglob('*') if p.is_file() and 'build' not in p.relative_to(ROOT).parts)
for pattern in ['*.py','*.cjs','*.md','*.json','*.gradle','.gitignore','.gitattributes']:
    files.extend(ROOT.glob(pattern))
files=[p for p in sorted(set(files)) if p.suffix.lower() not in FORBIDDEN]
name=f'{PREFIX}-forraskod.zip';temp=OUT/(name+'.pending')
with zipfile.ZipFile(temp,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,PREFIX+'/'+p.relative_to(ROOT).as_posix())
with zipfile.ZipFile(temp) as z:
    assert z.testzip() is None
    assert all(not any(part in {'signing','qa','build','node_modules','.git'} for part in Path(n).parts) and Path(n).suffix.lower() not in FORBIDDEN for n in z.namelist())
    for p in files:assert z.read(PREFIX+'/'+p.relative_to(ROOT).as_posix())==p.read_bytes()
    assert z.read(PREFIX+'/.gitignore')==(ROOT/'.gitignore').read_bytes()
os.replace(temp,OUT/name)
paths=[OUT/apk.name,OUT/name,OUT/'RiftBramble-Codex-atadas.md',OUT/'RiftBramble-valtozasnaplo.md']
(OUT/'RiftBramble-1.6.1-SHA256SUMS.txt').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n' for p in paths))
for p in paths:print(p.name,p.stat().st_size,hashlib.sha256(p.read_bytes()).hexdigest())
