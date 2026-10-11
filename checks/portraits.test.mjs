import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../dist/portraits.js',import.meta.url),'utf8');
function boot(reduced){
 const animations=[],listeners={},buttonListeners={};let intersection;
 const makeElement=()=>({animate(frames,options){const a={frames,options,state:'running',time:123,play(){this.state='running'},pause(){this.state='paused'}};animations.push(a);return a;}});
 const cards=['bilal','talha'].map(name=>{const elements=Object.fromEntries(['.portrait-photo','.portrait-frame','.portrait-trace','.portrait-glint'].map(s=>[s,makeElement()]));return {dataset:{},classList:{contains:c=>c===name},querySelector:s=>elements[s]};});
 const button={textContent:'',attributes:{},setAttribute(k,v){this.attributes[k]=v},addEventListener(k,f){buttonListeners[k]=f}};
 const document={hidden:false,querySelectorAll:()=>cards,querySelector:()=>button,addEventListener:(k,f)=>listeners[k]=f};
 vm.runInNewContext(source,{document,matchMedia:()=>({matches:reduced,addEventListener(){}}),IntersectionObserver:class{constructor(f){intersection=f}observe(){}}});
 return {cards,animations,button,document,show(){intersection(cards.map(target=>({target,isIntersecting:true})))},hide(){intersection(cards.map(target=>({target,isIntersecting:false})))},click(){buttonListeners.click()},visibility(){listeners.visibilitychange()}};
}
const normal=boot(false);assert.equal(normal.animations.length,8);
normal.show();assert.ok(normal.animations.every(a=>a.state==='running'));assert.ok(normal.cards.every(c=>c.dataset.motionState==='playing'));
normal.click();assert.ok(normal.animations.every(a=>a.state==='paused'));assert.match(normal.button.textContent,/Play/);
normal.click();assert.ok(normal.animations.every(a=>a.state==='running'));
normal.hide();assert.ok(normal.animations.every(a=>a.state==='paused'));
normal.show();assert.ok(normal.animations.every(a=>a.state==='running'&&a.time===123));
normal.document.hidden=true;normal.visibility();assert.ok(normal.animations.every(a=>a.state==='paused'));
normal.document.hidden=false;normal.visibility();assert.ok(normal.animations.every(a=>a.state==='running'));
const reduced=boot(true);reduced.show();assert.ok(reduced.animations.every(a=>a.state==='paused'));
reduced.click();assert.ok(reduced.animations.every(a=>a.state==='running'));assert.match(reduced.button.textContent,/Pause/);
console.log('Portrait controls verified: both portraits play, pause, resume on re-entry, suspend in background, and honor explicit Play with reduced motion enabled.');
