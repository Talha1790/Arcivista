import assert from 'node:assert/strict';
import {clamp,damp,scrollState} from '../dist/motion.mjs';
// Equal elapsed time must converge equally on 30, 60, and 120 Hz screens.
const atRate=hz=>{let v=0;for(let n=0;n<hz;n++)v=damp(v,1,11,1/hz);return v;};
for(const hz of [30,60,120])assert.ok(Math.abs(atRate(hz)-atRate(60))<1e-12);
for(const mobile of [true,false]){
 let prior=scrollState(0,mobile);
 for(let i=0;i<=1000;i++){
  const state=scrollState(i/1000,mobile);
  for(const [key,v] of Object.entries(state))assert.ok(Number.isFinite(v),key);
  for(const key of ['hero','middle','final'])assert.ok(state[key]>=0&&state[key]<=1);
  assert.ok(state.hero+state.middle+state.final<=1.00001,'Overlapping copy');
  for(const key of ['x','y','yaw','pitch','scale'])assert.ok(Math.abs(state[key]-prior[key])<.04,`Discontinuous ${key}`);
  if(mobile)assert.equal(state.x,0);
  prior=state;
 }
}
assert.equal(scrollState(0).hero,1);assert.equal(scrollState(.5).middle,1);assert.equal(scrollState(1).final,1);
assert.equal(clamp(-10),0);assert.equal(clamp(20),1);
console.log('Motion checks passed: frame-rate independence, continuous choreography, separate copy stages, bounded phone positioning.');
