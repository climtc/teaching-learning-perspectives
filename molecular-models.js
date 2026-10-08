(function(root){
  'use strict';
  const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,k)=>a.map(v=>v*k);
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>Math.hypot(...a),unit=a=>mul(a,1/norm(a));
  function rotate(p,yaw,pitch){const[x,y,z]=p,c=Math.cos(yaw),s=Math.sin(yaw),a=x*c+z*s,b=-x*s+z*c;return[a,y*Math.cos(pitch)-b*Math.sin(pitch),y*Math.sin(pitch)+b*Math.cos(pitch)];}
  const reflect=points=>points.map(([x,y,z])=>[x,y,-z]);
  function create(m){return {...m,positions:m.atoms.map(a=>m.displayFrame.basis.map(v=>dot(v,sub(a.xyz,m.displayFrame.origin))))};}
  function handedness(m,points=m.positions){const p=m.marks.priority.map(i=>points[i]);return dot(sub(p[0],p[3]),cross(sub(p[1],p[3]),sub(p[2],p[3])));}
  function methylAngle(m,points=m.positions){const[a,b]=m.marks.double,[c,d]=m.marks.methyl,axis=unit(sub(points[b],points[a]));const planar=v=>unit(sub(v,mul(axis,dot(axis,v))));return Math.acos(Math.max(-1,Math.min(1,dot(planar(sub(points[c],points[a])),planar(sub(points[d],points[b]))))))*180/Math.PI;}
  const api={add,sub,mul,dot,cross,norm,unit,rotate,reflect,create,handedness,methylAngle};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.MolecularGeometry=api;
})(typeof window==='object'?window:globalThis);
