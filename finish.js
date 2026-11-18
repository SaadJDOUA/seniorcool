import * as THREE from 'three';

function grainTexture(brushed) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(canvas.width, canvas.height);
  let randomState = 0x28aedfab;
  const noise = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
  };
  for (let y = 0; y < canvas.height; y++) {
    const groove = brushed ? (noise() - .5) * 48 : 0;
    for (let x = 0; x < canvas.width; x++) {
      const value = 196 + groove + (noise() - .5) * (brushed ? 9 : 40);
      const index = (y * canvas.width + x) * 4;
      pixels.data.set([value, value, value, 255], index);
    }
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.name = brushed ? 'Gebürstetes Aluminium' : 'Feinstruktur Polymer';
  return texture;
}

export function industrialFinishes() {
  const steel = grainTexture(true);
  const polymer = grainTexture(false);
  return {
    metal: new THREE.MeshStandardMaterial({name:'Gebürstetes Aluminium',color:0xb8c2cb,metalness:.91,roughness:.42,roughnessMap:steel,bumpMap:steel,bumpScale:.001}),
    edge: new THREE.MeshStandardMaterial({name:'Polierter Edelstahl',color:0xd6dfe5,metalness:.96,roughness:.23,roughnessMap:steel}),
    shell: new THREE.MeshPhysicalMaterial({name:'Satiniertes Aluminium',color:0xc7cfd5,metalness:.77,roughness:.52,roughnessMap:steel,bumpMap:steel,bumpScale:.0007,clearcoat:.16,clearcoatRoughness:.52}),
    dark: new THREE.MeshStandardMaterial({name:'Pulverbeschichteter Stahl',color:0x233948,metalness:.55,roughness:.53,roughnessMap:polymer,bumpMap:polymer,bumpScale:.001}),
    rubber: new THREE.MeshStandardMaterial({name:'Griffiges Gummi',color:0x151a20,roughness:.92,roughnessMap:polymer,bumpMap:polymer,bumpScale:.0018}),
    molded: new THREE.MeshPhysicalMaterial({name:'Blaues Spritzgussteil',color:0x095ba0,metalness:.06,roughness:.42,roughnessMap:polymer,clearcoat:.34,clearcoatRoughness:.46}),
    tank: new THREE.MeshPhysicalMaterial({name:'Transluzenter HDPE-Tank',color:0xaac6d9,roughness:.41,transparent:true,opacity:.42,depthWrite:false,clearcoat:.19,clearcoatRoughness:.45,side:THREE.DoubleSide}),
    water: new THREE.MeshPhysicalMaterial({name:'Wasserfüllung',color:0x0c5587,roughness:.18,transparent:true,opacity:.64,depthWrite:false,clearcoat:.65,clearcoatRoughness:.16,side:THREE.DoubleSide}),
    screen: new THREE.MeshPhysicalMaterial({name:'Displayglas',color:0x071424,metalness:.24,roughness:.17,clearcoat:1,clearcoatRoughness:.1}),
  };
}
