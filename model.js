import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/geometries/RoundedBoxGeometry.js';
import { industrialFinishes } from './finish.js';

// All dimensions are proportional estimates from the single supplied concept image.
export const componentInfo = [
  {id:'compressor',number:1,name:'Kompressor',type:'Kältekreislauf',description:'Verdichtet das Kältemittel im Kältekreislauf des 5-kW-Kühlmoduls.',price:[1200,2800],anchor:[.28,.46,.19],view:[1.0,.79,1.64],target:[.32,.56,-.13]},
  {id:'exchanger',number:2,name:'Wärmetauscher',type:'Luftkühlung',description:'Überträgt die Wärme der Raumluft über den Wasserkreislauf an das Kühlmodul.',price:[150,350],anchor:[.25,1.31,.34],view:[1.25,1.58,1.90],target:[.22,1.28,.14]},
  {id:'fan',number:3,name:'Ventilator',type:'EC-Ventilator',description:'Verteilt die gekühlte Luft leise und energieeffizient über das vordere Lüftungsgitter.',price:[40,120],anchor:[.25,1.8,.39],view:[1.55,2.10,2.20],target:[.22,1.79,.11]},
  {id:'pump',number:4,name:'Wasserpumpe',description:'Zirkuliert das Wasser durch den Wärmetauscher.',price:[60,150],anchor:[.43,.91,.28],view:[1.48,1.15,1.63],target:[.37,.86,.12]},
  {id:'tank',number:5,name:'Externer Wassertank',type:'20 Liter',description:'Speichert 20 Liter Kühlwasser. Der seitlich befestigte Tank ist mobil und nachfüllbar.',price:[30,70],anchor:[1.15,1.08,.28],view:[2.35,1.45,2.25],target:[.94,.9,.02],exterior:true},
  {id:'buffer',number:6,name:'Wasserpuffer',type:'Integriert · ca. 5–10 Liter',description:'Stabilisiert den Wasserkreislauf durch einen integrierten Speicher.',price:[20,50],anchor:[.10,.68,.35],view:[.85,.90,1.65],target:[.15,.62,.19]},
  {id:'display',number:7,name:'Display & Steuerung',type:'WLAN / App',description:'Zeigt die Temperatur an und ermöglicht automatische Regelung sowie App-Steuerung.',price:[20,80],anchor:[-.40,1.47,.47],view:[-.7,1.55,1.85],target:[-.265,1.37,.43],exterior:true},
  {id:'housing',number:8,name:'Gehäuse',type:'Schallgedämmte Verkleidung',description:'Die robuste Verkleidung dämmt Betriebsgeräusche und ist pflegeleicht.',price:[80,200],anchor:[-.51,.82,.44],view:[-1.10,1.17,2.34],target:[-.26,.97,.38],exterior:true},
  {id:'casters',number:9,name:'Rollen',type:'4 Stück mit Feststellern',description:'Die Schwenkrollen ermöglichen den mobilen Einsatz. Feststeller sichern das Gerät am Aufstellort.',price:[40,100],anchor:[-.53,.17,.42],view:[-.89,.62,1.79],target:[-.36,.16,.31],exterior:true},
  {id:'lines',number:10,name:'Leitungen, Ventile, Filter, Anschlüsse',description:'Führen das Wasser und ermöglichen Absperrung, Filterung und Wartung.',price:[40,120],anchor:[.62,.51,.25],view:[1.80,.92,1.50],target:[.53,.5,.08]},
  {id:'electrical',number:11,name:'Elektrik & Schutztechnik',description:'Netzteil, Steuerbox, FI-Schutz und weitere elektrische Sicherheitskomponenten.',price:[50,150],anchor:[-.034,1.03,.31],view:[.70,1.19,1.66],target:[-.015,.98,.22]},
];

export function createModel({labels=true}={}) {
  const root=new THREE.Group();root.name='SENIORCOOL 5 kW | Projekt Bremen';
  root.userData={source:'SENIORCOOL – Projekt Bremen',coolingCapacityKW:5,roomAreaM2:50,externalTankLiters:20,dimensions:'Geschätzte Proportionen aus der Konzeptzeichnung'};
  const parts={},shellGroups=[],shellMeshes=[],flows=[],animated=[];
  const mats={
    ...industrialFinishes(),
    black:new THREE.MeshStandardMaterial({color:0x111b20,metalness:.25,roughness:.47}),
    copper:new THREE.MeshStandardMaterial({color:0xc58a44,metalness:.85,roughness:.27}),
    brass:new THREE.MeshStandardMaterial({color:0xc9a763,metalness:.85,roughness:.25}),
    blue:new THREE.MeshStandardMaterial({color:0x0877bb,metalness:.5,roughness:.28}),
    cold:new THREE.MeshStandardMaterial({color:0x078ccc,metalness:.45,roughness:.25,emissive:0x0077ac,emissiveIntensity:.25}),
    warm:new THREE.MeshStandardMaterial({color:0xd18a43,metalness:.55,roughness:.3,emissive:0x9e4312,emissiveIntensity:.11}),
    glass:new THREE.MeshPhysicalMaterial({color:0xc8e5e7,metalness:0,roughness:.09,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}),
    led:new THREE.MeshStandardMaterial({color:0x71dcff,emissive:0x00baff,emissiveIntensity:2.5,roughness:.2}),
    pcb:new THREE.MeshStandardMaterial({color:0x205e43,roughness:.62,metalness:.1})
  };
  function group(name,parent=root,position=[0,0,0]){const g=new THREE.Group();g.name=name;g.position.set(...position);parent.add(g);return g;}
  function mesh(geo,mat,pos,parent,name){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.name=name||'Bauteil';m.castShadow=!mat.transparent;m.receiveShadow=!mat.transparent;parent.add(m);return m;}
  function box(w,h,d,pos,mat,parent=root,r=.018,name){return mesh(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/2,h/2,d/2)):new THREE.BoxGeometry(w,h,d),mat,pos,parent,name);}
  function cylinder(r,h,pos,mat,parent=root,r2=r,segments=32){return mesh(new THREE.CylinderGeometry(r,r2,h,segments),mat,pos,parent,'Cylindre');}
  function sphere(r,pos,mat,parent=root){return mesh(new THREE.SphereGeometry(r,12,8),mat,pos,parent,'Raccord');}
  function tube(points,r,mat,parent=root,name='Tube',smooth=.18){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',smooth);const m=mesh(new THREE.TubeGeometry(curve,Math.max(20,points.length*8),r,10,false),mat,[0,0,0],parent,name);return {mesh:m,curve};}
  function rod(a,b,r,mat,parent=root){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),v=vb.clone().sub(va);const m=cylinder(r,v.length(),va.clone().add(vb).multiplyScalar(.5).toArray(),mat,parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
  function screw(x,y,z,parent){
    cylinder(.0105,.006,[x,y,z],mats.edge,parent,.0105,16).rotation.x=Math.PI/2;
    box(.012,.0018,.001,[x,y,z+.0035],mats.black,parent,0,'Schraubenkopf');
    box(.0018,.012,.001,[x,y,z+.0035],mats.black,parent,0,'Schraubenkopf');
  }
  function torus(r,t,pos,mat,parent=root){return mesh(new THREE.TorusGeometry(r,t,8,48),mat,pos,parent,'Anneau');}
  function label(w,h,pos,draw,parent=root){if(!labels||typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=768;c.height=Math.round(768*h/w);const ctx=c.getContext('2d');draw(ctx,c.width,c.height);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;const m=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}),pos,parent,'Marquage');m.castShadow=false;return m;}
  function makeShell(name,offset){const g=group(name);g.userData.explode=offset;shellGroups.push(g);return g;}
  function part(id,pos,explode){
    const info=componentInfo.find(p=>p.id===id);
    const g=group(`${info.number} · ${info.name}`,root,pos);
    g.userData={component:id,basePosition:pos,explode};
    parts[id]=g;
    return g;
  }
  const frame=group('Rahmen');
  box(1.23,.105,.87,[0,.285,0],mats.metal,frame,.04,'Socle aluminium');
  box(1.13,.055,.77,[0,.35,0],mats.black,frame,.02,'Plancher technique');
  const casters=part('casters',[0,0,0],[0,-.18,.55]);
  for(const x of [-.49,.49])for(const z of [-.31,.31]){
    const caster=group('Schwenkrolle',casters,[x,0,z]);
    cylinder(.075,.055,[0,.225,0],mats.edge,caster);
    box(.13,.027,.13,[0,.25,0],mats.dark,caster,.007);
    for(const dx of [-.047,.047])box(.018,.115,.065,[dx,.15,-.008],mats.metal,caster,.007);
    const tire=cylinder(.104,.07,[0,.109,.013],mats.rubber,caster,.104,40);tire.rotation.z=Math.PI/2;
    const hub=cylinder(.055,.078,[0,.109,.013],mats.metal,caster,.055,28);hub.rotation.z=Math.PI/2;
    const axle=cylinder(.019,.09,[0,.109,.013],mats.dark,caster,.019,12);axle.rotation.z=Math.PI/2;
    for(const dx of [-.039,.039])torus(.074,.003,[dx,.109,.013],mats.rubber,caster).rotation.y=Math.PI/2;
    box(.105,.020,.086,[0,.177,.085],mats.dark,caster,.006,'Feststeller').rotation.x=.18;
    for(const z of [.064,.080,.096,.112])box(.083,.005,.005,[0,.188+(z-.085)*.18,z],mats.edge,caster,.002,'Pedalprofil');
  }
  for(const x of [-.553,.553])for(const z of [-.35,.35]){
    rod([x,.35,z],[x,2.04,z],.023,mats.edge,frame);
    for(const y of [.4,1.05,1.6,1.98])screw(x,y,z+.024,frame);
  }
  for(const y of [.38,2.015])for(const z of [-.35,.35])rod([-.55,y,z],[.55,y,z],.023,mats.metal,frame);
  const top=makeShell('Capot superieur',[0,.65,0]);
  box(1.20,.07,.83,[0,2.04,0],mats.shell,top,.031);
  box(1.167,.012,.798,[0,2.006,0],mats.black,top,.006,'Dichtung der Abdeckung');
  box(1.13,.014,.76,[0,2.079,0],mats.metal,top,.005);
  const handle=group('Poignee de transport');
  tube([[-.41,2.075,-.18],[-.41,2.24,-.18],[-.36,2.35,-.18],[-.29,2.38,-.18],[.29,2.38,-.18],[.36,2.35,-.18],[.41,2.24,-.18],[.41,2.075,-.18]],.028,mats.edge,handle);
  rod([-.305,2.38,-.18],[.305,2.38,-.18],.040,mats.rubber,handle);
  for(const x of [-.304,-.290,.290,.304])torus(.039,.003,[x,2.38,-.18],mats.rubber,handle).rotation.y=Math.PI/2;
  for(const x of [-.41,.41])box(.13,.018,.10,[x,2.085,-.18],mats.dark,handle,.008);
  const fixed=makeShell('Facade gauche',[-.50,0,.60]);
  parts.housing=fixed;
  fixed.name='8 · Gehäuse';
  box(.62,1.26,.055,[-.265,1.01,.393],mats.shell,fixed,.024,'Facade de commande');
  box(.636,1.275,.017,[-.265,1.01,.365],mats.dark,fixed,.015);
  for(const x of [-.554,.021])for(const y of [.41,1.61])screw(x,y,.424,fixed);
  const display=part('display',[0,0,0],[-.55,.17,1.02]);
  box(.489,.437,.020,[-.265,1.37,.429],mats.rubber,display,.025,'Displaydichtung');
  box(.48,.43,.025,[-.265,1.37,.437],mats.edge,display,.025,'Displayrahmen');
  box(.446,.393,.018,[-.265,1.37,.451],mats.screen,display,.021,'Temperaturanzeige');
  label(.419,.366,[-.265,1.37,.462],(c,w,h)=>{
    const glass=c.createLinearGradient(0,0,w,h);
    glass.addColorStop(0,'#133048');glass.addColorStop(.42,'#081827');glass.addColorStop(1,'#06101b');
    c.beginPath();c.roundRect(0,0,w,h,38);c.clip();
    c.fillStyle=glass;c.fillRect(0,0,w,h);
    c.fillStyle='#9cc6e1';c.font='600 31px sans-serif';c.fillText('RAUMTEMPERATUR',w*.11,h*.20);
    c.strokeStyle='#87cfff';c.lineWidth=7;
    for(const r of [.038,.024]){c.beginPath();c.arc(w*.88,h*.19,w*r,Math.PI*1.17,Math.PI*1.83);c.stroke();}
    c.fillStyle='#e5f6ff';c.font='600 180px sans-serif';c.fillText('22°',w*.11,h*.61);
    c.fillStyle='#80acc9';c.font='500 75px sans-serif';c.fillText('C',w*.52,h*.60);
    c.fillStyle='#254b66';c.fillRect(w*.11,h*.7,w*.78,3);
    c.fillStyle='#5de0a7';c.beginPath();c.arc(w*.128,h*.83,12,0,Math.PI*2);c.fill();
    c.fillStyle='#cfeae7';c.font='500 38px sans-serif';c.fillText('Kühlbetrieb',w*.18,h*.86);
  },display);
  label(.49,.32,[-.265,1.00,.425],(c,w,h)=>{
    c.strokeStyle='#2a5588';c.lineWidth=9;c.beginPath();c.moveTo(w*.32,h*.47);c.lineTo(w*.32,h*.21);c.lineTo(w*.5,h*.05);c.lineTo(w*.68,h*.21);c.lineTo(w*.68,h*.47);c.stroke();c.font='85px sans-serif';c.fillStyle='#2d6896';c.textAlign='center';c.fillText('❄',w*.5,h*.48);c.font='bold 69px sans-serif';c.fillStyle='#274b7c';c.fillText('SENIORCOOL',w*.5,h*.83);
  },fixed);
  box(.51,.035,.018,[-.265,.81,.433],mats.dark,fixed,.009);
  box(.49,.014,.012,[-.265,.813,.445],mats.led,fixed,.006,'Bande lumineuse');
  box(.528,.328,.007,[-.265,.584,.426],mats.black,fixed,.014,'Lufteinlass');
  const intake=new THREE.Shape();
  intake.moveTo(-.256,-.155);intake.lineTo(.256,-.155);intake.lineTo(.256,.155);intake.lineTo(-.256,.155);intake.closePath();
  for(let y=0;y<9;y++)for(let x=0;x<15;x++){
    const hole=new THREE.Path();
    hole.absarc(-.224+x*.031+(y%2)*.007,-.124+y*.031,.0087,0,Math.PI*2,true);
    intake.holes.push(hole);
  }
  const intakePlate=new THREE.ExtrudeGeometry(intake,{depth:.006,bevelEnabled:false,curveSegments:5});
  mesh(intakePlate,mats.metal,[-.265,.584,.437],fixed,'Perforiertes Ansauggitter');
  for(const x of [-.504,-.026])for(const y of [.443,.725])screw(x,y,.445,fixed);
  const frontRight=makeShell('Facade droite amovible',[-1.30,0,-.30]);
  box(.505,1.26,.05,[.302,1.01,.39],mats.shell,frontRight,.024);
  box(.018,1.21,.03,[.554,1.01,.381],mats.rubber,frontRight,.007,'Seitliche Dichtung');
  for(let y=0;y<11;y++)box(.34,.013,.005,[.29,.49+y*.035,.42],mats.black,frontRight,.003,'Ouie de ventilation');
  const right=makeShell('Panneau lateral droit',[.85,0,-.05]);
  box(.045,1.64,.72,[.575,1.19,0],mats.shell,right,.021);
  for(let y=0;y<12;y++)box(.005,.012,.44,[.602,1.39+y*.033,-.04],mats.black,right,.002,'Ouie laterale');
  for(const z of [-.27,.27])for(const y of [.48,1.92]){const screwMesh=cylinder(.013,.009,[.604,y,z],mats.edge,right,.013,12);screwMesh.rotation.z=Math.PI/2;}
  const left=makeShell('Panneau lateral gauche',[-.85,0,0]);
  box(.045,1.64,.72,[-.575,1.19,0],mats.shell,left,.021);
  for(let y=0;y<17;y++)box(.006,.012,.47,[-.601,.58+y*.029,0],mats.black,left,.001,'Ouie laterale');
  const rear=makeShell('Panneau arriere',[0,0,-.80]);
  box(1.13,1.64,.04,[0,1.19,-.372],mats.shell,rear,.02);
  box(.87,.67,.011,[0,1.55,-.398],mats.dark,rear,.016,'Grille aspiration');
  for(let i=0;i<19;i++)box(.83,.012,.018,[0,1.25+i*.032,-.414],mats.metal,rear,.002);
  box(.35,.18,.015,[-.20,.67,-.404],mats.black,rear,.005,'Plaque technique');
  box(.10,.075,.028,[.29,.53,-.418],mats.black,rear,.008,'Prise electrique');
  const grille=makeShell('Grille de soufflage',[0,.25,.65]);
  box(1.10,.36,.027,[0,1.81,.331],mats.black,grille,.024,'Luftkanal');
  for(const y of [1.639,1.982])box(1.095,.035,.138,[0,y,.396],mats.edge,grille,.009,'Auslassrahmen');
  for(const x of [-.534,.534])box(.036,.34,.13,[x,1.81,.395],mats.dark,grille,.008,'Auslassrahmen');
  for(let i=0;i<5;i++)box(1.04,.026,.116,[0,1.68+i*.065,.415],mats.metal,grille,.008,'Luftleitlamelle').rotation.x=-.24;
  box(.015,.31,.094,[0,1.81,.396],mats.dark,grille,.003,'Lamellenstütze');
  // Structural side braces remain visible in cutaway mode.
  for(const y of [.44,1.55,1.98])box(.045,.035,.67,[.53,y,0],mats.dark,frame,.006);
  const fan=part('fan',[.22,1.79,.07],[.30,.40,.10]);
  const housing=cylinder(.224,.17,[0,0,0],mats.dark,fan);housing.rotation.x=Math.PI/2;
  torus(.214,.018,[0,0,.1],mats.edge,fan);
  torus(.178,.014,[0,0,.131],mats.metal,fan);
  const rotor=group('Turbine du ventilateur',fan,[0,0,.122]);animated.push(rotor);
  for(let i=0;i<42;i++){const a=i*Math.PI*2/42;const b=box(.011,.044,.085,[Math.cos(a)*.192,Math.sin(a)*.192,0],mats.edge,rotor,.002,'Ailette de turbine');b.rotation.z=a-.3;}
  const disk=cylinder(.16,.018,[0,0,0],mats.black,rotor);disk.rotation.x=Math.PI/2;
  const blade=new THREE.Shape();
  blade.moveTo(-.013,.042);blade.quadraticCurveTo(-.026,.13,.018,.159);blade.lineTo(.046,.151);
  blade.quadraticCurveTo(.011,.11,.015,.044);blade.closePath();
  const bladeGeometry=new THREE.ExtrudeGeometry(blade,{depth:.014,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:2,curveSegments:9});
  for(let i=0;i<8;i++)mesh(bladeGeometry,mats.metal,[0,0,.02],rotor,'Gebogenes Lüfterblatt').rotation.z=i*Math.PI/4;
  const hub=cylinder(.049,.055,[0,0,.05],mats.edge,rotor);hub.rotation.x=Math.PI/2;
  const hub2=cylinder(.021,.065,[0,0,.061],mats.dark,rotor,.021,16);hub2.rotation.x=Math.PI/2;
  rod([-.20,-.20,-.04],[-.20,.20,-.04],.012,mats.metal,fan);rod([.20,-.20,-.04],[.20,.20,-.04],.012,mats.metal,fan);
  const exchanger=part('exchanger',[.22,1.28,.14],[.48,.04,.50]);
  box(.48,.45,.11,[0,0,0],mats.dark,exchanger,.009,'Cadre echangeur');
  for(let i=0;i<36;i++)box(.432,.0038,.14,[0,-.195+i*.01115,.018],i%6===0?mats.edge:mats.metal,exchanger,.001,'Wärmetauscherlamelle');
  for(const x of [-.235,.235])box(.018,.45,.155,[x,0,0],mats.edge,exchanger,.003);
  const serpentine=[];for(let i=0;i<6;i++){const y=.17-i*.065;if(i%2===0)serpentine.push([-.18,y,.105],[.18,y,.105]);else serpentine.push([.18,y,.105],[-.18,y,.105]);}
  tube(serpentine,.009,mats.cold,exchanger,'Serpentin de refroidissement',.03);
  for(const x of [-.232,.232])for(const y of [-.18,.18])screw(x,y,.085,exchanger);
  for(const x of [-.262,.262]){cylinder(.016,.43,[x,0,.01],mats.brass,exchanger);for(const y of [-.21,.21])cylinder(.023,.035,[x,y,.01],mats.copper,exchanger,.023,6);}
  const pump=part('pump',[.36,.89,.02],[.82,-.04,.23]);
  const motor=cylinder(.083,.20,[0,0,0],mats.blue,pump);motor.rotation.x=Math.PI/2;
  const motorCap=cylinder(.086,.032,[0,0,.105],mats.dark,pump);motorCap.rotation.x=Math.PI/2;
  cylinder(.04,.12,[0,.07,.115],mats.brass,pump,.04,6);
  const port=cylinder(.034,.14,[-.075,0,.105],mats.brass,pump,.034,6);port.rotation.z=Math.PI/2;
  box(.11,.045,.14,[0,-.10,0],mats.metal,pump,.008,'Support de pompe');
  box(.085,.065,.075,[0,.10,-.04],mats.black,pump,.008,'Boitier pompe');
  for(let i=0;i<14;i++){const a=i*Math.PI*2/14;box(.009,.009,.14,[Math.cos(a)*.08,Math.sin(a)*.08,-.015],mats.metal,pump,.002);}
  const buffer=part('buffer',[.075,.62,.23],[.36,-.08,.48]);
  cylinder(.115,.35,[0,0,0],mats.glass,buffer);
  cylinder(.106,.23,[0,-.052,0],mats.water,buffer);
  cylinder(.109,.007,[0,.066,0],mats.cold,buffer);
  for(const y of [-.18,.18]){cylinder(.122,.027,[0,y,0],mats.metal,buffer);cylinder(.098,.008,[0,y+(y>0?.019:-.019),0],mats.dark,buffer);}
  cylinder(.028,.07,[0,.22,0],mats.brass,buffer,.028,6);
  cylinder(.028,.055,[0,-.22,0],mats.brass,buffer,.028,6);
  for(const a of [Math.PI*.25,Math.PI*.75,Math.PI*1.25,Math.PI*1.75])rod([Math.cos(a)*.11,-.18,Math.sin(a)*.11],[Math.cos(a)*.11,.18,Math.sin(a)*.11],.006,mats.edge,buffer);
  for(let i=0;i<12;i++)sphere(.006+(i%3)*.002,[Math.sin(i*2.3)*.06,-.13+(i%7)*.023,Math.cos(i*1.7)*.07],mats.glass,buffer);
  const compressor=part('compressor',[.30,.57,-.15],[-.68,-.04,.68]);
  cylinder(.148,.34,[0,0,0],mats.black,compressor);
  mesh(new THREE.SphereGeometry(.148,28,16,0,Math.PI*2,0,Math.PI/2),mats.black,[0,.17,0],compressor,'Dome du compresseur').scale.y=.50;
  cylinder(.15,.017,[0,-.155,0],mats.metal,compressor);
  for(const x of [-.12,.12])for(const z of [-.09,.09]){box(.08,.022,.08,[x,-.199,z],mats.dark,compressor,.005);cylinder(.020,.035,[x,-.22,z],mats.rubber,compressor);}
  box(.09,.11,.08,[.14,.06,0],mats.black,compressor,.01,'Bornier');
  tube([[.06,.19,.03],[.09,.27,.03],[.16,.28,.03]],.014,mats.copper,compressor);
  tube([[-.09,.15,.06],[-.20,.17,.06],[-.20,.31,.06]],.012,mats.copper,compressor);
  const tank=part('tank',[.94,.83,-.015],[.67,0,0]);
  const holder=group('Support du reservoir',frame);
  box(.66,.055,.68,[.94,.29,-.015],mats.dark,holder,.035);
  for(const z of [-.28,.25])box(.5,.045,.045,[.69,.30,z],mats.metal,holder,.006);
  for(const z of [-.29,.26])box(.04,.42,.04,[1.205,.52,z],mats.dark,holder,.009);
  const tankOutline=new THREE.Shape();
  tankOutline.moveTo(-.170,-.503);tankOutline.lineTo(.170,-.503);
  tankOutline.quadraticCurveTo(.244,-.503,.248,-.433);tankOutline.lineTo(.248,.317);
  tankOutline.quadraticCurveTo(.248,.408,.174,.440);tankOutline.quadraticCurveTo(.129,.460,.104,.489);
  tankOutline.quadraticCurveTo(.088,.515,.057,.515);tankOutline.lineTo(-.143,.515);
  tankOutline.quadraticCurveTo(-.239,.485,-.247,.399);tankOutline.lineTo(-.248,-.429);
  tankOutline.quadraticCurveTo(-.248,-.503,-.170,-.503);tankOutline.closePath();
  const tankBody=new THREE.ExtrudeGeometry(tankOutline,{depth:.488,bevelEnabled:true,bevelThickness:.024,bevelSize:.022,bevelSegments:5,curveSegments:12});
  mesh(tankBody,mats.tank,[0,0,-.244],tank,'Transluzenter 20-Liter-Tank');
  box(.470,.59,.471,[0,-.174,0],mats.water,tank,.038,'Wasserfüllung');
  for(const y of [-.397,.314])for(const z of [-.266,.266])box(.395,.018,.013,[0,y,z],mats.tank,tank,.006,'Verstärkungsrippe');
  cylinder(.101,.10,[-.075,.60,0],mats.tank,tank);
  cylinder(.112,.071,[-.075,.666,0],mats.molded,tank,.112,56);
  torus(.10,.006,[-.075,.702,0],mats.molded,tank).rotation.x=Math.PI/2;
  for(let i=0;i<32;i++){const a=i*Math.PI*2/32;rod([-.075+Math.sin(a)*.111,.638,Math.cos(a)*.111],[-.075+Math.sin(a)*.111,.688,Math.cos(a)*.111],.0045,mats.molded,tank);}
  tube([[.055,.555,0],[.075,.65,0],[.19,.65,0],[.21,.555,0]],.027,mats.tank,tank,'Poignee moulee');
  for(const z of [-.283,.283])box(.57,.058,.022,[0,-.14,z],mats.rubber,tank,.006,'Haltegurt');
  for(const x of [-.283,.283])box(.022,.058,.56,[x,-.14,0],mats.rubber,tank,.006,'Haltegurt');
  label(.208,.137,[0,.023,.270],(c,w,h)=>{
    c.fillStyle='#0b304e';c.beginPath();c.roundRect(0,0,w,h,35);c.fill();
    c.fillStyle='#c3def3';c.textAlign='center';c.font='600 75px sans-serif';c.fillText('WASSERTANK',w/2,h*.29);
    c.fillStyle='#fff';c.font='600 221px sans-serif';c.fillText('20 L',w/2,h*.80);
  },tank);
  label(.061,.30,[.164,.093,.270],(c,w,h)=>{
    c.strokeStyle='#183b53';c.fillStyle='#183b53';c.lineWidth=16;c.font='600 145px sans-serif';
    for(const [i,value] of ['20','15','10','5'].entries()){
      const y=h*(.14+i*.24);
      c.beginPath();c.moveTo(0,y);c.lineTo(w*.29,y);c.stroke();c.fillText(value,w*.4,y+45);
    }
  },tank);
  for(const y of [-.28,.25]){const p=cylinder(.034,.10,[-.29,y,0],mats.brass,tank,.034,8);p.rotation.z=Math.PI/2;}
  // Hydraulic lines illustrate the source schematic. Their precise routing is interpreted.
  const lines=part('lines',[0,0,0],[.87,.11,-1.01]);
  const hydraulic=group('Wasserkreislauf',lines);
  function waterLine(points,mat,id){const t=tube(points,.019,mat,hydraulic,id,.10);flows.push({curve:t.curve,parent:hydraulic,color:mat===mats.warm?0xffc087:0x88e9ff});return t;}
  waterLine([[.65,.55,-.02],[.57,.55,.12],[.53,.53,.12],[.44,.49,.12],[.40,.60,.12],[.36,.79,.12]],mats.cold,'Tank zur Pumpe');
  waterLine([[.36,1.02,.135],[.40,1.06,.13],[.49,1.08,.08],[.49,1.51,.10],[.40,1.52,.14]],mats.cold,'Pumpe zum Wärmetauscher');
  waterLine([[.04,1.12,.24],[.016,1.06,.32],[.016,.93,.32],[.075,.90,.23],[.075,.84,.23]],mats.warm,'Wärmetauscher zum Wasserpuffer');
  waterLine([[.075,.40,.23],[.075,.38,.23],[.04,.38,.15],[.04,.78,-.22],[.14,.85,-.22],[.23,.85,-.22]],mats.warm,'Wasserpuffer zum Kühlmodul');
  waterLine([[.34,.84,-.235],[.39,.98,-.25],[.50,1.04,-.22],[.61,1.04,-.22],[.65,1.08,-.02]],mats.cold,'Gekühlter Rücklauf zum Tank');
  // Brass collars make tube junctions readable.
  for(const p of [[.49,1.09,.08],[.075,.86,.23],[.075,.40,.23],[.65,.55,-.02],[.65,1.08,-.02]]){const c=cylinder(.028,.032,p,mats.brass,hydraulic,.028,6);if(p[0]===.65)c.rotation.z=Math.PI/2;}
  const filter=cylinder(.039,.095,[.53,.53,.12],mats.metal,lines,.039,20);
  filter.name='Wasserfilter';
  filter.rotation.z=Math.PI/2+.2;
  const valve=cylinder(.03,.047,[.453,.51,.12],mats.brass,lines,.03,8);
  valve.name='Absperrventil';
  valve.rotation.z=Math.PI/2;
  box(.072,.012,.022,[.453,.552,.12],mats.blue,lines,.003,'Ventilhebel');
  const refrigerant=group('Kupferleitungen des Kältekreislaufs',lines);
  tube([[.46,.85,-.12],[.46,1.0,-.17],[.46,1.12,-.20],[.33,1.12,-.21],[.03,1.12,-.20],[-.25,1.20,-.20],[-.25,1.51,-.04],[-.11,1.53,-.04]],.012,mats.copper,refrigerant);
  tube([[.10,.88,-.09],[.10,.98,-.09],[-.13,.98,-.09],[-.43,.98,-.08],[-.43,1.64,-.04],[-.18,1.64,-.04],[-.18,1.87,-.04]],.012,mats.copper,refrigerant);
  const electronics=part('electrical',[-.015,1.015,.294],[-.29,.49,.12]);
  box(.09,.30,.015,[0,0,0],mats.pcb,electronics,.004);
  for(let i=0;i<8;i++){box(.025,.018,.018,[(i%2)*.041-.02,-.10+Math.floor(i/2)*.055,.015],mats.black,electronics,.002);}
  for(let i=0;i<12;i++)cylinder(.004,.007,[.035,-.12+i*.022,.015],mats.brass,electronics,.004,6).rotation.x=Math.PI/2;
  tube([[0,-.15,-.01],[-.03,-.20,-.03],[-.03,-.52,-.08],[.02,-.59,-.08]],.007,mats.black,electronics,'Versorgungsleitung');
  box(.17,.19,.13,[.021,-.56,-.083],mats.dark,electronics,.012,'Netzteil und FI-Schutzschalter');
  box(.135,.14,.009,[.021,-.56,-.014],mats.edge,electronics,.004,'Gehäuse des Schutzmoduls');
  box(.048,.05,.010,[.020,-.535,-.005],mats.black,electronics,.004,'Schalter');
  box(.016,.014,.010,[.053,-.592,-.005],mats.blue,electronics,.003,'Prüftaste');
  // Air ribbons are intentionally subtle and can be switched off with circuit animation.
  const air=group('Air rafraichi');
  const airMat=new THREE.MeshBasicMaterial({color:0x78c9da,transparent:true,opacity:.13,depthWrite:false});
  for(let i=0;i<4;i++){const y=1.73+i*.07;const t=tube([[-.30,y,.48],[-.36,y,.70],[-.48,y+.025,.96],[-.58,y+.07,1.15]],.006,airMat,air,'Flux air');flows.push({curve:t.curve,parent:air,color:0xb5efff,air:true});}
  shellGroups.forEach(g=>{g.userData.component='housing';g.userData.basePosition=[0,0,0];g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.userData.baseOpacity=o.material.opacity;shellMeshes.push(o);}});});
  root.traverse(o=>{if(o.isMesh){o.userData.component ||= findComponent(o);}});
  function findComponent(o){let p=o.parent;while(p){if(p.userData.component)return p.userData.component;p=p.parent;}return null;}
  let meshCount=0,triangles=0;root.traverse(o=>{if(o.isMesh){meshCount++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);}});
  return {root,parts,shellGroups,shellMeshes,removable:[frontRight,right],fixed,grille,top,left,rear,handle,hydraulic,refrigerant,air,flows,animated,mats,stats:{meshCount,triangles}};
}
