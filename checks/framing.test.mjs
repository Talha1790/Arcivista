import assert from 'node:assert/strict';
import * as THREE from '../dist/three.module.js';
import {scrollState} from '../dist/motion.mjs';
// Check the complete chassis/stand against the actual perspective frustum at
// scroll checkpoints, phone dimensions, landscape, and desktop resolutions.
for(const [w,h,mobile] of [[1440,900,false],[1920,1080,false],[2560,1080,false],[1024,768,false],[900,450,false],[390,329,true],[375,240,true],[360,216,true]]){
 const aspect=w/h,worldWidth=mobile?Math.max(7.05,aspect*6.0):Math.max(16.2,aspect*8.2);
 const camera=new THREE.PerspectiveCamera(32,aspect,.1,60);camera.position.z=worldWidth/(2*Math.tan(THREE.MathUtils.degToRad(16))*aspect);camera.updateMatrixWorld();
 for(let p=0;p<=1.001;p+=.025){
  const s=scrollState(p,mobile);
  for(const offset of [-.28,0,.28]){
   const rig=new THREE.Object3D();rig.position.set(s.x,s.y,0);rig.rotation.set(s.pitch,s.yaw+offset,0);rig.scale.setScalar(s.scale);rig.updateMatrixWorld();
   for(const x of [-3,3])for(const y of [-2.15,2.06])for(const z of [-.25,.5]){
    const point=new THREE.Vector3(x,y,z).applyMatrix4(rig.matrixWorld).project(camera);
    assert.ok(Math.abs(point.x)<.98&&Math.abs(point.y)<.98,`Clipped at ${w}x${h}, p=${p}, offset=${offset}: ${point.toArray()}`);
   }
  }
 }
}
console.log('Framing checks passed: full model remains inside the view across eight viewport sizes, all scroll stages, and drag limits.');
