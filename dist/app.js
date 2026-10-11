import { clamp, damp, scrollState } from './motion.mjs';
const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reduced, sceneVariant = 0, rotationTarget = 0;
let sceneNeedsUpdate = true;
let renderScene = () => false;
const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) {e.target.classList.add('visible');observer.unobserve(e.target);} }), {threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
$('.menu').onclick=()=>{const open=$('nav').classList.toggle('active');$('.menu').setAttribute('aria-expanded',String(open));};
document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>{$('nav').classList.remove('active');$('.menu').setAttribute('aria-expanded','false');});
$('#year').textContent=new Date().getFullYear();
const briefDialog=$('#brief-dialog');
document.querySelectorAll('.open-brief').forEach(btn=>btn.onclick=()=>{if(btn.dataset.interest)$('#brief-form').elements.interest.value=btn.dataset.interest;briefDialog.showModal();});
document.querySelectorAll('.dialog-close').forEach(btn=>btn.onclick=()=>btn.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#brief-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);$('#brief-text').value=`ARCIVISTA — PROJECT BRIEF\n\nName: ${f.get('name')}\nBusiness: ${f.get('business')}\nServices: ${f.get('interest')}\nBudget: ${f.get('budget')}\nTimeline: ${f.get('timeline')}\n\nThe idea:\n${f.get('idea')}\n\nPrepared for Bilal Khaliq & Talha Mukhtar, Arcivista.\nThis brief has not been sent.`;e.target.hidden=true;$('#brief-result').hidden=false;$('#brief-text').focus();};
$('#edit-brief').onclick=()=>{$('#brief-form').hidden=false;$('#brief-result').hidden=true;};
$('#copy-brief').onclick=async()=>{try{await navigator.clipboard.writeText($('#brief-text').value);$('#brief-status').textContent='Brief copied. Ready to share.';}catch{$('#brief-text').select();$('#brief-status').textContent='Select and copy the brief above.';}};
$('#download-brief').onclick=()=>{const url=URL.createObjectURL(new Blob([$('#brief-text').value],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='Arcivista-Project-Brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#brief-status').textContent='Your brief is ready to download.';};
const concepts={form:{title:'FORM. The art of less.',intro:'An imagined premium fragrance launch, built around texture, restraint, and a memorable visual identity.',vt:'A product with presence.',v:'Slow product reveals, sculpted light, macro details, and elegant typography. A hero film with short-form cutdowns carries the same refined visual language across placements.',wt:'A considered storefront.',w:'An editorial product experience with clear scent notes, tactile imagery, considered product pages, and a straightforward path from discovery to purchase.'},velo:{title:'VELO. Forward, always.',intro:'An imagined performance brand brought to life through movement, sharp messaging, and confident digital design.',vt:'Momentum in every frame.',v:'Fast transitions, bold typography, and a distinctive green-and-charcoal palette set the pace. The campaign concept adapts into short hooks and a longer brand introduction.',wt:'An experience in motion.',w:'A responsive launch website with scroll-led storytelling, product exploration, and a focused call to action. Purposeful interaction extends the energy of the campaign.'}};
document.querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>{const p=concepts[b.dataset.project];$('#project-title').textContent=p.title;$('#project-intro').textContent=p.intro;$('#project-video-title').textContent=p.vt;$('#project-video').textContent=p.v;$('#project-web-title').textContent=p.wt;$('#project-web').textContent=p.w;$('#project-dialog').showModal();});
$('#concept-brief').onclick=()=>{$('#project-dialog').close();briefDialog.showModal();};
$('#rotate').onclick=()=>{rotationTarget = rotationTarget > .1 ? -.18 : .18; sceneNeedsUpdate = true;};
$('#change-scene').onclick=()=>{sceneVariant=(sceneVariant+1)%3;sceneNeedsUpdate=true;$('#change-scene span').textContent=['Change scene','Scene: VELO','Scene: ARC'][sceneVariant];};
function updateMotion(){document.querySelectorAll('[data-motion-toggle]').forEach(button=>{button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'▶ Play animations':'Ⅱ Pause animations';});document.body.classList.toggle('motion-paused',paused);$('#pause-motion').setAttribute('aria-pressed',String(paused));$('#pause-motion').innerHTML=paused?'▶ <span>Play motion</span>':'Ⅱ <span>Pause motion</span>';}
$('#pause-motion').onclick=()=>{paused=!paused;sceneNeedsUpdate=true;updateMotion();};updateMotion();
// A single frame loop drives copy, scroll choreography, and WebGL together.
const experience = $('.experience'), stage = $('.scene-sticky');
const heroCopy = $('.hero-copy'), chapterCopy = $('.chapter-copy'), middleCopy = $('.middle-copy');
const pageProgress = $('.scroll-progress'), chapterIndex = $('#chapter-index');
let metrics = {start:0, distance:1, page:1}, targetProgress = 0, progress = 0;
let isMobile = innerWidth <= 760, stageVisible = true, scrollDirty = true;
let lastFrame = 0, raf = 0, activeTime = 0, currentChapter = 0;
function measure() {
  metrics.start = experience.getBoundingClientRect().top + scrollY;
  metrics.distance = Math.max(1, experience.offsetHeight - stage.clientHeight);
  metrics.page = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  isMobile = innerWidth <= 760;
  readScroll();
}
function readScroll() {targetProgress=clamp((scrollY-metrics.start)/metrics.distance);scrollDirty=true;wake();}
function paintCopy(el, opacity, offset) {
  el.style.opacity=opacity.toFixed(4);
  el.style.transform=`translate3d(0,${reduced?0:offset}px,0)`;
  el.style.visibility=opacity<.001?'hidden':'visible';
  el.inert=opacity<.1;
}
function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
function frame(now){
  raf=0;const dt=lastFrame?Math.min((now-lastFrame)/1000,.05):1/60;lastFrame=now;
  const moving=Math.abs(progress-targetProgress)>.00005;
  progress=reduced?targetProgress:damp(progress,targetProgress,11,dt);
  if(Math.abs(progress-targetProgress)<.00005)progress=targetProgress;
  if(stageVisible&&!paused)activeTime+=dt;
  if(scrollDirty||moving){
    const state=scrollState(progress,isMobile);
    paintCopy(heroCopy,state.hero,-18*(1-state.hero));
    paintCopy(middleCopy,state.middle,18*(1-state.middle));
    paintCopy(chapterCopy,state.final,18*(1-state.final));
    if(currentChapter!==state.chapter){currentChapter=state.chapter;chapterIndex.textContent=`0${currentChapter} — 03`;document.querySelectorAll('.scene-steps span').forEach((el,i)=>el.classList.toggle('active',i===currentChapter-1));}
    pageProgress.style.transform=`scaleX(${clamp(scrollY/metrics.page)})`;
    scrollDirty=false;
  }
  const needsMore=stageVisible&&renderScene({dt,time:activeTime,progress,moving,paused,isMobile});
  if(stageVisible&&(!paused||moving||needsMore))wake();
}
addEventListener('scroll',readScroll,{passive:true});
addEventListener('resize',measure,{passive:true});
new ResizeObserver(measure).observe(document.body);
new IntersectionObserver(entries=>{stageVisible=entries[0].isIntersecting;if(stageVisible){lastFrame=0;sceneNeedsUpdate=true;wake();}}).observe(experience);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{lastFrame=0;measure();sceneNeedsUpdate=true;wake();}});
document.querySelectorAll('.scene-controls button').forEach(b=>b.addEventListener('click',wake));
measure();
async function init3D(){
  const THREE=await import('./three.module.js');
  const canvas=$('#studio-canvas'), wrap=$('.scene-wrap');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  const smallDevice=matchMedia('(max-width: 760px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio,smallDevice?1.25:1.5));
  renderer.setClearColor(0x101110,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,60);camera.position.set(0,0,14);
  scene.add(new THREE.HemisphereLight(0xf0f4e9,0x31352e,2.3));
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,7);scene.add(key);
  const edgeLight=new THREE.DirectionalLight(0xd7e9af,1.6);edgeLight.position.set(5,2,-3);scene.add(edgeLight);
  const rig=new THREE.Group();scene.add(rig);
  const chassis=new THREE.MeshStandardMaterial({color:0x343832,metalness:.48,roughness:.35});
  const trim=new THREE.MeshStandardMaterial({color:0x999e92,metalness:.62,roughness:.3});
  const black=new THREE.MeshStandardMaterial({color:0x080b08,metalness:.12,roughness:.4});
  const light=new THREE.MeshBasicMaterial({color:0xd4ff59});
  function shape(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  function body(w,h,d,r,mat,x,y,z){
    const geometry=new THREE.ExtrudeGeometry(shape(w,h,r),{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.018,curveSegments:6});
    geometry.translate(0,0,-d/2);const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);rig.add(m);return m;
  }
  function plane(w,h,r,mat,x,y,z){const geo=new THREE.ShapeGeometry(shape(w,h,r),8);const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);rig.add(m);return m;}
  // One coherent, physically separated shell: no coplanar trim or crossing rings.
  body(5.92,3.57,.19,.15,chassis,0,.24,0);
  plane(5.82,3.47,.12,trim,0,.24,.117);
  plane(5.77,3.42,.11,black,0,.24,.124);
  body(.31,1.06,.22,.065,trim,0,-1.58,-.045);
  const foot=body(1.67,.66,.065,.11,chassis,0,-2.1,.15);foot.rotation.x=-Math.PI/2;
  plane(.2,.015,.007,light,0,-1.426,.137);
  const video=screenCanvas(),web=screenCanvas();
  function screenCanvas(){const c=document.createElement('canvas');c.width=640;c.height=400;const ctx=c.getContext('2d',{alpha:false});const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.generateMipmaps=false;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;return {c,ctx,tex};}
  // Windows sit inside the same display, each kept at its native 16:10 aspect ratio.
  const videoMat=new THREE.MeshBasicMaterial({map:video.tex,toneMapped:false});
  const webMat=new THREE.MeshBasicMaterial({map:web.tex,toneMapped:false});
  plane(2.67,1.67,.04,videoMat,-1.39,.27,.143);
  plane(2.67,1.67,.04,webMat,1.39,.27,.143);
  const ui=document.createElement('canvas');ui.width=1280;ui.height=736;
  const ux=ui.getContext('2d',{alpha:false});
  ux.fillStyle='#141a13';ux.fillRect(0,0,1280,736);
  ux.fillStyle='#d4ff59';ux.font='bold 21px Arial';ux.fillText('ARCIVISTA',38,48);
  ux.fillStyle='#89947e';ux.font='13px Arial';ux.fillText('THE CONNECTED STUDIO',951,48);
  ux.fillStyle='#2b3427';ux.fillRect(30,76,1220,1);
  ux.fillStyle='#d3dcca';ux.font='15px Arial';ux.fillText('01   VIDEO & MARKETING',38,133);ux.fillText('02   WEB DEVELOPMENT',667,133);
  ux.fillStyle='#92a080';ux.font='12px Arial';ux.fillText('CAMPAIGN / FORM',38,625);ux.fillText('EXPERIENCE / FORM',667,625);
  ux.fillStyle='#283423';ux.fillRect(38,659,1204,2);ux.fillStyle='#d4ff59';ux.fillRect(38,659,470,2);
  ux.fillStyle='#718265';ux.font='11px Arial';ux.fillText('ONE IDEA. EVERY TOUCHPOINT.',38,701);ux.fillText('STUDIO CONCEPT  /  001',1060,701);
  const uiTexture=new THREE.CanvasTexture(ui);uiTexture.colorSpace=THREE.SRGBColorSpace;uiTexture.generateMipmaps=false;uiTexture.minFilter=THREE.LinearFilter;
  plane(5.64,3.245,.075,new THREE.MeshBasicMaterial({map:uiTexture,toneMapped:false}),0,.27,.135);
  // Subtle stationary studio floor gives the object weight without expensive shadows.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const sx=shadowCanvas.getContext('2d'),gradient=sx.createRadialGradient(64,64,5,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.55)');gradient.addColorStop(1,'rgba(0,0,0,0)');sx.fillStyle=gradient;sx.fillRect(0,0,128,128);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5.4,.72),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.position.set(0,-2.2,-.1);rig.add(shadow);
function rect(ctx,x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function drawVideo(t){const ctx=video.ctx;ctx.setTransform(.625,0,0,.625,0,0);const palettes=[['#b1b59a','#253821','#edf1d5'],['#d2f55d','#1e2a14','#243213'],['#242c24','#d4ff59','#f1f4e8']];const [bg,ink,light]=palettes[sceneVariant];ctx.fillStyle=bg;ctx.fillRect(0,0,1024,640);const g=ctx.createRadialGradient(510,290,30,510,290,500);g.addColorStop(0,sceneVariant===2?'#59694c':'#e6e8c0');g.addColorStop(1,bg);ctx.fillStyle=g;ctx.fillRect(0,0,1024,640);ctx.strokeStyle=ink+'28';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(512,320,260+i*65,90+i*25,-.5+t*.05,0,Math.PI*2);ctx.stroke();}ctx.fillStyle=ink;ctx.font='bold 34px Arial';ctx.fillText(['FORM®','VELO ↗','ARCIVISTA'][sceneVariant],40,55);ctx.font='12px Arial';ctx.fillText('ORIGINAL STUDIO CONCEPT',720,50);ctx.save();ctx.translate(535+Math.sin(t*.65)*40,306+Math.sin(t)*10);ctx.rotate(-.2+Math.sin(t*.5)*.12);ctx.shadowColor='#17260a66';ctx.shadowBlur=12;ctx.shadowOffsetX=30;ctx.shadowOffsetY=30;const bg2=ctx.createLinearGradient(-90,0,90,0);bg2.addColorStop(0,'#435133');bg2.addColorStop(.25,'#a5b786');bg2.addColorStop(.65,'#718556');bg2.addColorStop(1,'#394728');ctx.fillStyle=bg2;ctx.beginPath();ctx.roundRect(-85,-140,170,320,20);ctx.fill();ctx.shadowColor='transparent';rect(ctx,-51,-185,102,48,5,'#22291d');ctx.fillStyle='#e8efd8';ctx.textAlign='center';ctx.font='100px Georgia';ctx.fillText(['F','V','A'][sceneVariant],0,30);ctx.font='11px Arial';ctx.fillText(['F O R M','V E L O','A R C'][sceneVariant],0,63);ctx.font='8px Arial';ctx.fillText('THE ESSENTIAL EDITION',0,145);ctx.restore();ctx.fillStyle=ink;ctx.font='bold 46px Arial';ctx.fillText(['A NEW FORM','MOVE','A DIFFERENT'][sceneVariant],40,490);ctx.fillText(['OF FEELING.','DIFFERENT.','PERSPECTIVE.'][sceneVariant],40,541);ctx.fillStyle=ink+'44';ctx.fillRect(40,600,944,2);ctx.fillStyle=ink;ctx.fillRect(40,600,(t%12)/12*944,2);ctx.font='10px monospace';ctx.fillText('▶  '+String(Math.floor(t%12)).padStart(2,'0')+' / 12     CAMPAIGN FILM',40,627);ctx.fillText('SOUND OFF',900,627);video.tex.needsUpdate=true;}
function drawWeb(t){const ctx=web.ctx;ctx.setTransform(.625,0,0,.625,0,0);ctx.fillStyle='#eeefe5';ctx.fillRect(0,0,1024,640);const shift=(1-Math.cos(t*.28))*90;ctx.save();ctx.translate(0,-shift);ctx.fillStyle='#242e20';ctx.font='bold 30px Arial';ctx.fillText(['FORM®','VELO ↗','ARCIVISTA'][sceneVariant],45,124);ctx.font='14px Arial';ctx.fillText('Explore       Our story       Shop ↗',690,117);ctx.font='bold 73px Arial';ctx.fillText(['Less, but','Find your','A different'][sceneVariant],50,248);ctx.fillText(['extraordinary.','momentum.','perspective.'][sceneVariant],50,330);ctx.font='17px Arial';ctx.fillStyle='#69715f';ctx.fillText('Considered design. An experience that stays with you.',54,390);rect(ctx,54,422,225,54,4,'#2a3722');ctx.fillStyle='#eff5e4';ctx.font='14px Arial';ctx.fillText('Explore the collection  ↗',75,455);rect(ctx,680,177,290,330,8,sceneVariant===1?'#d2f55d':'#b4bda1');ctx.save();ctx.translate(821,335);ctx.rotate(.15+Math.sin(t*.5)*.05);rect(ctx,-54,-80,108,174,10,'#596846');rect(ctx,-30,-105,60,26,4,'#26311e');ctx.font='65px Georgia';ctx.fillStyle='#e9efd9';ctx.fillText(['F','V','A'][sceneVariant],-23,20);ctx.restore();ctx.fillStyle='#273321';ctx.font='bold 24px Arial';ctx.fillText('Made for the way you live.',54,583);for(let i=0;i<3;i++){rect(ctx,54+i*315,613,286,155,6,['#d7dccb','#c3cbb4','#adbca0'][i]);ctx.fillStyle='#566649';ctx.font='14px Arial';ctx.fillText(['The essentials','Our philosophy','Everyday rituals'][i],72+i*315,725);}ctx.restore();rect(ctx,0,0,1024,55,0,'#e1e4d9');['#d38879','#c8b870','#96af74'].forEach((c,i)=>{ctx.beginPath();ctx.fillStyle=c;ctx.arc(25+i*22,26,6,0,Math.PI*2);ctx.fill();});rect(ctx,290,12,440,29,7,'#f6f7f0');ctx.font='12px Arial';ctx.fillStyle='#6d7466';ctx.fillText(['form.studio / collection','velo.studio / explore','arcivista.studio / concept'][sceneVariant],375,32);ctx.fillStyle='#a6b197';ctx.fillRect(1008,73+shift,4,130);web.tex.needsUpdate=true;}
  let pointer=null,dragging=false,dragStart=0,smoothedOffset=0;
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};dragStart=rotationTarget;});
  canvas.addEventListener('pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
    if(!dragging&&Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)*1.25){dragging=true;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');}
    if(dragging){rotationTarget=clamp(dragStart+dx*.0025,-.28,.28);sceneNeedsUpdate=true;wake();}
  });
  function endDrag(e){if(pointer&&canvas.hasPointerCapture(pointer.id))canvas.releasePointerCapture(pointer.id);pointer=null;dragging=false;canvas.classList.remove('dragging');}
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',()=>{pointer=null;dragging=false;canvas.classList.remove('dragging');});
  let lastWidth=0,lastHeight=0,lastTextureTime=-1,lastVariant=-1,ready=false,contextLost=false;
  function resize(){
    const w=Math.round(wrap.clientWidth),h=Math.round(wrap.clientHeight);
    if(!w||!h||w===lastWidth&&h===lastHeight)return;
    lastWidth=w;lastHeight=h;renderer.setSize(w,h,false);camera.aspect=w/h;
    // Preserve horizontal composition at every breakpoint, including phones.
    const worldWidth=innerWidth<=760?Math.max(7.05,camera.aspect*6.0):Math.max(16.2,camera.aspect*8.2);
    camera.position.z=worldWidth/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect);
    camera.far=Math.max(60,camera.position.z+20);camera.updateProjectionMatrix();sceneNeedsUpdate=true;wake();
  }
  new ResizeObserver(resize).observe(wrap);resize();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;document.body.classList.remove('webgl-ready');});
  canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;ready=false;lastTextureTime=-1;sceneNeedsUpdate=true;wake();});
  renderScene=({dt,time,progress,moving,paused,isMobile})=>{
    if(contextLost)return false;
    const state=scrollState(progress,isMobile);
    const targetOffset=reduced?0:rotationTarget;
    smoothedOffset=damp(smoothedOffset,targetOffset,12,dt);
    if(Math.abs(smoothedOffset-targetOffset)<.00005)smoothedOffset=targetOffset;
    const interactionMoving=Math.abs(smoothedOffset-targetOffset)>.00005;
    if(paused&&!moving&&!sceneNeedsUpdate&&!interactionMoving&&ready)return false;
    rig.position.set(state.x,state.y,0);rig.rotation.set(state.pitch,state.yaw+smoothedOffset,0);rig.scale.setScalar(state.scale);
    if(lastTextureTime!==time||lastVariant!==sceneVariant){drawVideo(time);drawWeb(time);lastTextureTime=time;lastVariant=sceneVariant;}
    renderer.render(scene,camera);sceneNeedsUpdate=false;if(!ready){ready=true;document.body.classList.add('webgl-ready');}
    return interactionMoving;
  };
  sceneNeedsUpdate=true;wake();
}
init3D().catch(()=>{document.body.classList.add('no-webgl');$('#rotate').disabled=true;$('#change-scene').disabled=true;$('.interaction-hint').textContent='VIDEO × WEB — ONE CONNECTED EXPERIENCE';});

// CSS loops remain phase-continuous on touch, hover, and re-entry into view.
const loopObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>entry.target.style.setProperty('--loop-play',entry.isIntersecting?'running':'paused'));
},{threshold:.05});
document.querySelectorAll('[data-loop]').forEach(el=>loopObserver.observe(el));
document.querySelectorAll('[data-motion-toggle]').forEach(button=>button.addEventListener('click',()=>{paused=!paused;sceneNeedsUpdate=true;updateMotion();wake();}));
function syncBackgroundLoops(){document.body.classList.toggle('animation-backgrounded',document.hidden);}
document.addEventListener('visibilitychange',syncBackgroundLoops);syncBackgroundLoops();
