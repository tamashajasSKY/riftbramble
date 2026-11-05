#!/usr/bin/env python3
"""Original 30 second looping chiptune, composed/synthesized for Forintvedo.
No samples or third-party music. Requires numpy; output is 16-bit mono WAV.
"""
from pathlib import Path
import wave
import numpy as np

SR=22050;BEAT=60/128;DURATION=64*BEAT
out=np.zeros(round(DURATION*SR),dtype=np.float64)
rng=np.random.default_rng(20261023)
def add(start,signal):
 pos=round(start*SR);idx=(np.arange(len(signal))+pos)%len(out)
 np.add.at(out,idx,signal)
def note(midi,duration,volume=.12,duty=.25):
 t=np.arange(round(duration*SR))/SR;f=440*2**((midi-69)/12)
 phase=(t*f)%1
 osc=np.where(phase<duty,1.,-1.)
 # Softened square wave retains the retro timbre without harsh peaks.
 osc=np.convolve(osc,np.ones(4)/4,mode='same')
 env=np.minimum(1,t/.004)*np.exp(-t*5/duration)*np.minimum(1,(duration-t)/.015)
 return osc*env*volume
roots=[45,41,48,43]*4
melodies=[
 [69,72,76,79,76,72,71,67],
 [69,72,77,76,72,69,65,67],
 [67,72,76,79,84,79,76,72],
 [71,74,79,77,74,71,67,68]
]
for bar,root in enumerate(roots):
 start=bar*4*BEAT;mel=melodies[bar%4]
 for beat in range(4):
  add(start+beat*BEAT,note(root+(12 if beat==2 else 0),BEAT*.8,.13,.5))
 for eighth in range(8):
  midi=mel[eighth]+(12 if bar>=8 and bar%2==0 else 0)
  if not (bar%4==3 and eighth==7):add(start+eighth*.5*BEAT,note(midi,BEAT*.40,.07 if bar<4 else .095,.125))
  if bar>=4:add(start+eighth*.5*BEAT,note(root+24+[0,3,7,12][eighth%4],BEAT*.20,.035,.25))
 for beat in range(4):
  t=np.arange(round(.15*SR))/SR
  kick=np.sin(2*np.pi*(45*t+45*.025*(1-np.exp(-t/.025))))*np.exp(-t*25)*.23
  if beat in (0,2):add(start+beat*BEAT,kick)
  if beat in (1,3):
   t=np.arange(round(.12*SR))/SR
   snare=(rng.uniform(-1,1,len(t))*.65+np.sign(np.sin(2*np.pi*180*t))*.16)*np.exp(-t*35)*.10
   add(start+beat*BEAT,snare)
 for eighth in range(8):
  t=np.arange(round(.04*SR))/SR;noise=rng.uniform(-1,1,len(t));high=noise-np.roll(noise,1)
  add(start+eighth*BEAT*.5,high*np.exp(-t*120)*.025)
out=np.tanh(out*1.4)
out*=.83/max(abs(out).max(),.83)
dest=Path(__file__).parent/'app/src/main/assets/audio/ostrom.wav';dest.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(dest),'wb') as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR);f.writeframes((out*32767).astype('<i2').tobytes())
print(dest,round(DURATION,2),'seconds',dest.stat().st_size,'bytes')
