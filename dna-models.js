(function(root){
  'use strict';
  const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,k)=>a.map(v=>v*k);
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>Math.hypot(...a),unit=a=>mul(a,1/norm(a)),mean=a=>mul(a.reduce(add,[0,0,0]),1/a.length);
  function framePoint(p,frame){const q=sub(p,frame.origin);return frame.basis.map(v=>dot(v,q));}
  function rotate(p,yaw,pitch){const [x,y,z]=p,c=Math.cos(yaw),s=Math.sin(yaw),a=x*c+z*s,b=-x*s+z*c;return [a,y*Math.cos(pitch)-b*Math.sin(pitch),y*Math.sin(pitch)+b*Math.cos(pitch)];}
  function create(data){
    const positions=data.atoms.map(a=>framePoint(a.xyz,data.displayFrame));
    const residues=data.residues.map(r=>{
      const ids=[...new Set(r.rings.flat())],center=mean(ids.map(i=>positions[i]));
      const points=r.rings[0].map(i=>positions[i]),normal=unit(cross(sub(points[1],points[0]),sub(points[2],points[0])));
      return {...r,center,normal};
    });
    const pairs=data.pairs.map(p=>{
      const a=residues[p.a],b=residues[p.b],ids=[...new Set([...a.rings.flat(),...b.rings.flat()])];
      const center=mean(ids.map(i=>positions[i]));let na=a.normal,nb=b.normal;if(dot(na,nb)<0)nb=mul(nb,-1);
      let normal=unit(add(na,nb));if(normal[1]<0)normal=mul(normal,-1);
      const basePlaneAngle=Math.acos(Math.min(1,Math.abs(dot(a.normal,b.normal))))*180/Math.PI;
      const distances=p.contacts.map(([i,j])=>norm(sub(positions[i],positions[j])));
      return {...p,center,normal,basePlaneAngle,distances,letters:a.base+'–'+b.base};
    });
    const backbone=chain=>data.residues.filter(r=>r.chain===chain).flatMap(r=>{
      const index=Object.fromEntries(r.atoms.map(i=>[data.atoms[i].name,i]));
      return ["P","O5'","C5'","C4'","C3'","O3'"].filter(n=>n in index).map(n=>index[n]);
    });
    function groove(index){
      const p=pairs[index],a=positions[residues[p.a].c1],b=positions[residues[p.b].c1];
      const planar=v=>sub(v,mul(p.normal,dot(v,p.normal)));
      const ra=planar(sub(a,p.center)),rb=planar(sub(b,p.center)),u=unit(ra),v=unit(cross(p.normal,u));
      const angle=Math.atan2(dot(rb,v),dot(rb,u)),radius=Math.max(norm(ra),norm(rb))+3;
      const arc=(end)=>Array.from({length:41},(_,i)=>{const t=end*i/40;return add(p.center,mul(add(mul(u,Math.cos(t)),mul(v,Math.sin(t))),radius));});
      const large=angle>0?angle-2*Math.PI:angle+2*Math.PI;
      return {minor:arc(angle),major:arc(large),minorAngle:Math.abs(angle)*180/Math.PI,
              majorAngle:360-Math.abs(angle)*180/Math.PI};
    }
    return {data,positions,residues,pairs,backbone,groove};
  }
  const api={add,sub,mul,dot,cross,norm,unit,mean,framePoint,rotate,create};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.DnaGeometry=api;
})(typeof window==='object'?window:globalThis);
