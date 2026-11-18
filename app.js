import * as THREE from 'three';
import {OrbitControls} from './vendor/controls/OrbitControls.js';
import {RoomEnvironment} from './vendor/environments/RoomEnvironment.js';
import {createModel,componentInfo} from './model.js?v=studio';
import {formatRange, installationCosts, sumCosts} from './bremen.js';

const $=s=>document.querySelector(s);
const host=$('#canvasHost'),viewer=$('#viewer');
const projectDialog=$('#projectDialog');
const filmDialog=$('#filmDialog'),productFilm=$('#productFilm');
let focusComponent;
$('#projectBtn').addEventListener('click',()=>projectDialog.showModal());
if(filmDialog&&productFilm){
  const status=$('#filmStatus');
  const download=filmDialog.querySelector('.film-footer a');
  let filmSource;
  $('#filmBtn')?.addEventListener('click',async()=>{
    filmDialog.showModal();
    if(status){
      status.textContent='Film wird geladen …';
      status.hidden=false;
    }
    try{
      // The static host may respond with the full MP4 to range requests.
      // A local object URL keeps the playback timeline seekable.
      filmSource??=fetch(download.href).then(async response=>{
        if(!response.ok)throw new Error('Film konnte nicht geladen werden.');
        return URL.createObjectURL(await response.blob());
      });
      const source=await filmSource;
      if(productFilm.src!==source)productFilm.src=source;
      if(status)status.hidden=true;
      if(filmDialog.open)productFilm.play().catch(()=>{});
    }catch{
      filmSource=undefined;
      if(status)status.textContent='Der Film konnte nicht geladen werden. Bitte erneut öffnen oder MP4 herunterladen.';
    }
  });
  filmDialog.addEventListener('close',()=>productFilm.pause());
}
for(const info of componentInfo){
  const row=document.createElement('tr');
  row.innerHTML=`
    <th scope="row">
      <button class="price-component"><span class="component-number">${info.number}</span><span>${info.name}</span></button>
      ${info.type ? `<span class="part-type">${info.type}</span>` : ''}
      <span class="part-function">${info.description}</span>
    </th>
    <td>${formatRange(info.price)}</td>`;
  row.querySelector('button').addEventListener('click',()=>{
    if(!focusComponent)return;
    projectDialog.close();
    focusComponent(info.id);
  });
  $('#priceRows').appendChild(row);
}
for(const {name,price} of installationCosts){
  const line=document.createElement('div');
  line.innerHTML=`<dt>${name}</dt><dd>${formatRange(price)}</dd>`;
  $('#installationCosts').appendChild(line);
}
$('#partsTotal').textContent=formatRange(sumCosts(componentInfo));
$('#projectTotal').textContent=formatRange(sumCosts([...componentInfo,...installationCosts]));
let renderer;
try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}
catch(error){
  $('#loading').textContent='Für die 3D-Ansicht wird WebGL benötigt. Bitte öffnen Sie die Seite in Chrome oder Edge mit aktivierter Grafikbeschleunigung.';
  document.querySelectorAll('.price-component').forEach(button=>{button.disabled=true;});
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.8));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','SENIORCOOL-Modell. Zum Drehen ziehen, zum Zoomen das Mausrad verwenden.');renderer.domElement.tabIndex=0;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(34,1,.025,100);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=.22;controls.maxDistance=11;controls.maxPolarAngle=Math.PI*.92;controls.autoRotateSpeed=.65;controls.target.set(.25,1.12,0);
controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.040).texture;room.dispose();pmrem.dispose();scene.environmentIntensity=1.05;
scene.add(new THREE.HemisphereLight(0xf5faff,0x657689,1.08));
const key=new THREE.DirectionalLight(0xfff9eb,3.0);key.position.set(3,6,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=4;key.shadow.camera.bottom=-3;key.shadow.normalBias=.025;key.shadow.bias=-.00015;key.shadow.radius=3;scene.add(key);
const fill=new THREE.DirectionalLight(0xdce9ff,1.4);fill.position.set(-4,3,-3);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,1.6);rim.position.set(1,4,-3);scene.add(rim);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.10}));floor.rotation.x=-Math.PI/2;floor.position.y=-.005;floor.receiveShadow=true;scene.add(floor);
const disc=new THREE.Mesh(new THREE.CircleGeometry(1.45,96),new THREE.MeshBasicMaterial({color:0xdfE6de,transparent:true,opacity:.23,depthWrite:false}));disc.rotation.x=-Math.PI/2;disc.position.set(.3,-.012,0);scene.add(disc);
for(const radius of [1.46,1.57]){const p=[];for(let i=0;i<=128;i++){const a=i/128*Math.PI*2;p.push(new THREE.Vector3(.3+Math.cos(a)*radius,-.004,Math.sin(a)*radius));}const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),new THREE.LineDashedMaterial({color:0xadbfae,transparent:true,opacity:.35,dashSize:.025,gapSize:.025}));l.computeLineDistances();scene.add(l);}
const model=createModel();scene.add(model.root);
const particles=[];
model.flows.forEach((flow,fi)=>{const list=[];for(let i=0;i<(flow.air?2:7);i++){const p=new THREE.Mesh(new THREE.SphereGeometry(flow.air?.009:.010,8,6),new THREE.MeshBasicMaterial({color:flow.color,transparent:true,opacity:flow.air?.5:.95}));p.name='Animation de circulation';flow.parent.add(p);list.push(p);}particles.push({flow,list,phase:fi*.137});});
const state={mode:'cutaway',labels:true,flow:!matchMedia('(prefers-reduced-motion: reduce)').matches,selected:null,inside:false,transparency:0};
const spotButtons=[];
componentInfo.forEach(info=>{
  const b=document.createElement('button');b.className='component-button';b.dataset.component=info.id;b.setAttribute('aria-pressed','false');b.innerHTML=`<span class="component-number">${info.number}</span><span class="component-text">${info.name}</span><span class="component-arrow">↗</span>`;b.addEventListener('click',()=>selectComponent(info.id));$('#componentList').appendChild(b);
  const spot=document.createElement('button');spot.className='hotspot';spot.textContent=info.number;spot.setAttribute('aria-label',info.name);spot.addEventListener('click',()=>selectComponent(info.id));$('#hotspots').appendChild(spot);spotButtons.push({element:spot,info});
});
let transition=null,transitionTime=0;
const currentPos=new THREE.Vector3();
function moveCamera(pos,target,duration=1.05){transition={from:camera.position.clone(),to:new THREE.Vector3(...pos),fromTarget:controls.target.clone(),toTarget:new THREE.Vector3(...target),duration};transitionTime=0;controls.autoRotate=false;$('#rotateBtn').setAttribute('aria-pressed','false');}
function home(animated=true){const aspect=host.clientWidth/host.clientHeight;const d=Math.max(1,.65/aspect);const pos=[2.95*d,2.70*d,5.10*d];const target=[.26,1.28,0];if(animated)moveCamera(pos,target);else{camera.position.set(...pos);controls.target.set(...target);controls.update();}}
function clearSelected(){state.selected=null;document.querySelectorAll('.component-button').forEach(el=>{el.classList.remove('active');el.setAttribute('aria-pressed','false');});spotButtons.forEach(s=>s.element.classList.remove('active'));$('#componentDetail').hidden=true;$('#componentDetail').replaceChildren();}
function setMode(mode,{reset=true}={}){state.mode=mode;state.inside=false;$('#insideBtn').querySelector('span').textContent='Innenraum erkunden';document.querySelectorAll('[data-mode]').forEach(b=>{const selected=b.dataset.mode===mode;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',selected);});if(reset){clearSelected();if(mode==='exploded'){const aspect=host.clientWidth/host.clientHeight;const d=Math.max(1,.82/aspect);moveCamera([4.40*d,3.00*d,6.72*d],[.36,1.34,0]);}else home();}updateShellVisibility();}
function updateShellVisibility(){
  for(const group of model.shellGroups)group.visible=!state.inside;
  model.handle.visible=!state.inside;
  if(state.mode==='cutaway')model.removable.forEach(group=>{group.visible=false;});
  const behindFrontPanel=state.mode==='cutaway'&&['compressor','electrical'].includes(state.selected);
  model.fixed.visible=!state.inside&&!behindFrontPanel;
  model.parts.display.visible=model.fixed.visible;
  model.air.visible=state.flow&&state.mode!=='exploded';
}
function selectComponent(id,{toggle=true}={}){
  if(toggle&&state.selected===id){clearSelected();home();updateShellVisibility();return;}
  const info=componentInfo.find(component=>component.id===id);
  if(state.mode==='exterior'&&!info.exterior)setMode('cutaway',{reset:false});
  state.selected=id;
  state.inside=false;
  $('#insideBtn span').textContent='Innenraum erkunden';
  document.querySelectorAll('.component-button').forEach(button=>{
    const selected=button.dataset.component===id;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-pressed',selected);
  });
  spotButtons.forEach(spot=>spot.element.classList.toggle('active',spot.info.id===id));
  const detail=$('#componentDetail');
  detail.innerHTML=`<h3>${info.number} · ${info.name}</h3>${info.type ? `<span class="part-type">${info.type}</span>` : ''}<p>${info.description}</p><strong class="detail-price">${formatRange(info.price)}</strong>`;
  detail.hidden=false;
  const inspector=$('#inspector');
  inspector.open=true;
  inspector.scrollTop=0;
  const offset=state.mode==='exploded'?model.parts[id].userData.explode:[0,0,0];
  moveCamera(info.view.map((value,index)=>value+offset[index]),info.target.map((value,index)=>value+offset[index]));
  updateShellVisibility();
}
focusComponent=id=>{
  selectComponent(id,{toggle:false});
  $('#inspector summary').focus({preventScroll:true});
};
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$('#resetBtn').addEventListener('click',()=>{clearSelected();state.inside=false;$('#insideBtn span').textContent='Innenraum erkunden';state.transparency=0;$('#opacity').value=0;applyTransparency();setMode(state.mode);});
$('#rotateBtn').addEventListener('click',()=>{transition=null;controls.autoRotate=!controls.autoRotate;$('#rotateBtn').setAttribute('aria-pressed',controls.autoRotate);});
$('#fullscreenBtn').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(viewer.requestFullscreen)await viewer.requestFullscreen();else toast('Dieser Browser unterstützt den Vollbildmodus nicht.');}catch{toast('Der Vollbildmodus ist hier nicht verfügbar.');}});
$('#labelsBtn').addEventListener('click',()=>{state.labels=!state.labels;$('#labelsBtn').setAttribute('aria-pressed',state.labels);});
function updateFlow(){state.flow=!state.flow;$('#flowBtn').classList.toggle('on',state.flow);$('#flowBtn').setAttribute('aria-checked',state.flow);updateShellVisibility();}
$('#flowBtn').addEventListener('click',updateFlow);$('#flowBtn').classList.toggle('on',state.flow);$('#flowBtn').setAttribute('aria-checked',state.flow);
function applyTransparency(){state.transparency=Number($('#opacity').value);$('#opacityValue').value=state.transparency+' %';for(const o of model.shellMeshes){const original=o.userData.baseOpacity;o.material.opacity=original*(1-state.transparency/100);o.material.transparent=o.material.opacity<1;o.material.depthWrite=o.material.opacity>.90;o.material.needsUpdate=true;}}
$('#opacity').addEventListener('input',applyTransparency);
$('#insideBtn').addEventListener('click',()=>{const wasInside=state.inside;setMode('cutaway',{reset:false});clearSelected();state.inside=!wasInside;if(state.inside){moveCamera([1.07,1.44,1.62],[.02,1.16,.02]);$('#insideBtn span').textContent='Zur Gesamtansicht';}else home();$('#inspector').open=false;updateShellVisibility();});
let toastTimeout;function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
$('#downloadBtn').addEventListener('click',()=>toast('Das 3D-Modell wird als GLB heruntergeladen.'));
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerDown=null;
renderer.domElement.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY};transition=null;});
renderer.domElement.addEventListener('wheel',()=>{transition=null;},{passive:true});
renderer.domElement.addEventListener('pointerup',e=>{if(!pointerDown||Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>5)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObject(model.root,true);const hit=hits.find(h=>isVisible(h.object)&&h.object.userData.component);if(hit)selectComponent(hit.object.userData.component);});
function isVisible(o){let p=o;while(p){if(!p.visible)return false;p=p.parent;}return true;}
renderer.domElement.addEventListener('keydown',e=>{const left=new THREE.Vector3().subVectors(camera.position,controls.target);if(e.key==='ArrowLeft'||e.key==='ArrowRight'){left.applyAxisAngle(new THREE.Vector3(0,1,0),e.key==='ArrowLeft'?.13:-.13);camera.position.copy(controls.target).add(left);e.preventDefault();transition=null;}if(e.key==='+'||e.key==='='||e.key==='-'){left.multiplyScalar(e.key==='-'?1.12:.89);camera.position.copy(controls.target).add(left);e.preventDefault();transition=null;}if(e.key==='Home'){home();e.preventDefault();}});
function resize(){const w=host.clientWidth,h=host.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
new ResizeObserver(resize).observe(host);resize();home(false);setMode('cutaway',{reset:false});
model.grille.position.x=-.24;
model.grille.scale.x=.56;
$('#loading').remove();
let last,elapsed=0;
const world=new THREE.Vector3(),projected=new THREE.Vector3();
const movableGroups=new Set([...model.shellGroups,...Object.values(model.parts)]);
const modelOffset=new THREE.Vector3();
function animate(now){requestAnimationFrame(animate);const dt=THREE.MathUtils.clamp((now-(last??now))/1000,0,.05);last=now;
  if(filmDialog?.open)return;
  elapsed+=state.flow?dt:0;
  if(transition){transitionTime+=dt;const t=Math.min(transitionTime/transition.duration,1);const ease=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,ease);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,ease);if(t===1)transition=null;}
  const lerp=1-Math.exp(-dt*7.5);
  for(const g of movableGroups){const base=g.userData.basePosition,offset=state.mode==='exploded'?g.userData.explode:[0,0,0];currentPos.set(base[0]+offset[0],base[1]+offset[1],base[2]+offset[2]);if(g===model.grille&&state.mode==='cutaway')currentPos.x=-.24;g.position.lerp(currentPos,lerp);}
  model.grille.scale.x=THREE.MathUtils.lerp(model.grille.scale.x,state.mode==='cutaway'?.56:1,lerp);
  if(state.flow)model.animated.forEach(r=>r.rotation.z-=dt*4.3);
  particles.forEach(({flow,list,phase})=>list.forEach((p,i)=>{p.visible=state.flow&&state.mode!=='exploded';const t=((elapsed*(flow.air?.45:.18))+i/list.length+phase)%1;p.position.copy(flow.curve.getPointAt(t));}));
  controls.update();model.root.updateMatrixWorld();
  const r=host.getBoundingClientRect();
  spotButtons.forEach(({element,info})=>{
    const part=model.parts[info.id];
    const visible=state.labels&&part.visible&&(state.mode!=='exterior'||info.exterior||state.transparency>40);
    if(!visible){element.style.display='none';return;}
    modelOffset.set(...part.userData.basePosition);
    world.set(...info.anchor).add(part.position).sub(modelOffset);
    projected.copy(world).project(camera);
    const x=(projected.x*.5+.5)*r.width,y=(-projected.y*.5+.5)*r.height;
    const outside=projected.z>1||projected.z<-1||x<18||x>r.width-18||y<70||y>r.height-90;
    element.style.display=outside?'none':'grid';
    element.style.left=x+'px';
    element.style.top=y+'px';
  });
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
window.addEventListener('unhandledrejection',event=>{console.error('Application:',event.reason);});
