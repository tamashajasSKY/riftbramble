#!/usr/bin/env python3
"""Build a signed, dependency-free Android APK with JDK 17 and Android SDK 35.
Usage: ANDROID_HOME=/path/to/sdk python3 build.py
Signing: uses signing/forintvedo.jks, new test identity only with ALLOW_NEW_SIGNING_KEY=1.
Set FORINTVEDO_KEY_PASSWORD to override the local development password.
"""
import os, pathlib, subprocess, shutil, zipfile, hashlib

ROOT = pathlib.Path(__file__).resolve().parent
SDK = pathlib.Path(os.environ.get('ANDROID_HOME', os.environ.get('ANDROID_SDK_ROOT', '')))
BT = SDK / 'build-tools' / '35.0.0'
JAR = SDK / 'platforms' / 'android-35' / 'android.jar'
BUILD = ROOT / 'build'
OUT = ROOT / 'dist'
KEY = pathlib.Path(os.environ.get('FORINTVEDO_KEYSTORE', str(ROOT / 'signing' / 'forintvedo.jks')))
PASSWORD = os.environ.get('FORINTVEDO_KEY_PASSWORD')
if not PASSWORD:
    raise SystemExit('Set FORINTVEDO_KEY_PASSWORD privately before building. Never commit the keystore or its password.')
os.environ['FORINTVEDO_BUILD_PASS'] = PASSWORD

def run(*args):
    subprocess.run([str(x) for x in args], check=True, cwd=ROOT)

if not JAR.is_file() or not BT.is_dir():
    raise SystemExit('Android SDK Platform 35 and Build Tools 35.0.0 are required. Set ANDROID_HOME.')
if not KEY.is_file() and os.environ.get('ALLOW_NEW_SIGNING_KEY') != '1':
    raise SystemExit('Original signing key missing. Restore it privately or set FORINTVEDO_KEYSTORE. For a separate test identity only: ALLOW_NEW_SIGNING_KEY=1.')
if BUILD.exists(): shutil.rmtree(BUILD)
(BUILD / 'classes').mkdir(parents=True)
OUT.mkdir(exist_ok=True)
KEY.parent.mkdir(exist_ok=True)
run(BT/'aapt2', 'compile', '--dir', ROOT/'app/src/main/res', '-o', BUILD/'resources.zip')
run(BT/'aapt2', 'link', '-o', BUILD/'base.apk', '--manifest', ROOT/'app/src/main/AndroidManifest.xml', '-I', JAR, '-A', ROOT/'app/src/main/assets', '--min-sdk-version', '24', '--target-sdk-version', '35', BUILD/'resources.zip')
sources = sorted((ROOT/'app/src/main/java').rglob('*.java'))
compiler = ['java', '-jar', os.environ['ECJ_JAR']] if os.environ.get('ECJ_JAR') else ['javac']
boot=str(JAR)
if os.environ.get('ECJ_JAR'):
    jmod=pathlib.Path(shutil.which('java')).resolve().parent.parent/'jmods/java.base.jmod'
    if jmod.is_file():boot+=os.pathsep+str(jmod)
    else:
        jrt=jmod.parent.parent/'lib/jrt-fs.jar'
        if jrt.is_file():boot+=os.pathsep+str(jrt)
run(*compiler, '-encoding', 'UTF-8', '-source', '8', '-target', '8', '-bootclasspath', boot, '-d', BUILD/'classes', *sources)
classes = sorted((BUILD/'classes').rglob('*.class'))
run('java', '-cp', BT/'lib/d8.jar', 'com.android.tools.r8.D8', '--lib', JAR, '--min-api', '24', '--output', BUILD, *classes)
with zipfile.ZipFile(BUILD/'base.apk', 'a', zipfile.ZIP_DEFLATED) as apk:
    apk.write(BUILD/'classes.dex', 'classes.dex')
run(BT/'zipalign', '-f', '-p', '4', BUILD/'base.apk', BUILD/'aligned.apk')
if not KEY.exists():
    run('keytool', '-genkeypair', '-keystore', KEY, '-storepass', PASSWORD, '-keypass', PASSWORD, '-alias', 'forintvedo', '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000', '-dname', 'CN=Forintvedo Personal Game, O=Personal Project, C=HU')
apk = OUT/'RiftBramble-1.6.1.apk'
signed = BUILD/'signed.apk'
run(BT/'apksigner', 'sign', '--v4-signing-enabled', 'false', '--ks', KEY, '--ks-key-alias', 'forintvedo', '--ks-pass', 'env:FORINTVEDO_BUILD_PASS', '--key-pass', 'env:FORINTVEDO_BUILD_PASS', '--out', signed, BUILD/'aligned.apk')
run(BT/'apksigner', 'verify', '--verbose', signed)
with zipfile.ZipFile(signed) as archive:
    if archive.testzip() is not None:
        raise RuntimeError('APK ZIP integrity verification failed')
# Publish only a complete, flushed APK so file sync never observes a partial build.
pending = apk.with_suffix('.apk.pending')
with pending.open('wb') as output:
    output.write(signed.read_bytes())
    output.flush()
    os.fsync(output.fileno())
os.replace(pending, apk)
run(BT/'apksigner', 'verify', apk)
print('APK:', apk)
print('SHA256:', hashlib.sha256(apk.read_bytes()).hexdigest())
