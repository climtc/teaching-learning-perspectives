/* Mathematical models and synthetic data. No external dependencies. */
(function(root){
 'use strict';
 const pi=Math.PI, rad=pi/180;
 const add=(a,b)=>a.map((v,i)=>v+b[i]), sub=(a,b)=>a.map((v,i)=>v-b[i]);
 const scale=(a,s)=>a.map(v=>v*s), dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 const norm=a=>Math.sqrt(dot(a,a)), unit=a=>scale(a,1/(norm(a)||1));
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const mv=(a,v)=>a.map(row=>dot(row,v)), transpose=a=>a[0].map((_,i)=>a.map(row=>row[i]));
 const mm=(a,b)=>a.map(row=>transpose(b).map(col=>dot(row,col)));
 const eye=()=>[[1,0,0],[0,1,0],[0,0,1]];
 function rotation(axis,a){let c=Math.cos(a),s=Math.sin(a);return axis==='X'?[[1,0,0],[0,c,-s],[0,s,c]]:axis==='Y'?[[c,0,s],[0,1,0],[-s,0,c]]:[[c,-s,0],[s,c,0],[0,0,1]];}
 function euler(yaw,pitch,roll,order='ZYX'){
  const angles={[order[0]]:yaw,[order[1]]:pitch,[order[2]]:roll};
  return order.split('').reduce((r,a)=>mm(r,rotation(a,angles[a]*rad)),eye());
 }
 function qmul(a,b){return [a[0]*b[0]-dot(a.slice(1),b.slice(1)),...add(add(scale(b.slice(1),a[0]),scale(a.slice(1),b[0])),cross(a.slice(1),b.slice(1)))];}
 function quaternion(yaw,pitch,roll,order='ZYX'){
  return order.split('').reduce((q,a,i)=>{let v=[0,0,0],t=[yaw,pitch,roll][i]*rad/2;v['XYZ'.indexOf(a)]=Math.sin(t);return qmul(q,[Math.cos(t),...v]);},[1,0,0,0]);
 }
 function qmatrix(q){q=unit(q);let [w,x,y,z]=q;return [[1-2*(y*y+z*z),2*(x*y-w*z),2*(x*z+w*y)],[2*(x*y+w*z),1-2*(x*x+z*z),2*(y*z-w*x)],[2*(x*z-w*y),2*(y*z+w*x),1-2*(x*x+y*y)]];}
 function recoverZYX(r){let p=Math.asin(Math.max(-1,Math.min(1,-r[2][0])));return Math.abs(Math.cos(p))<1e-7?null:[Math.atan2(r[1][0],r[0][0])/rad,p/rad,Math.atan2(r[2][1],r[2][2])/rad];}
 function rng(seed=913){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+.5)/4294967296;};}
 function normal(random){return Math.sqrt(-2*Math.log(random()))*Math.cos(2*pi*random());}
 function correlation(points,x=0,y=1){if(points.length<3)return null;let a=points.reduce((s,p)=>s+p[x],0)/points.length,b=points.reduce((s,p)=>s+p[y],0)/points.length;let xx=0,yy=0,xy=0;for(let p of points){let u=p[x]-a,v=p[y]-b;xx+=u*u;yy+=v*v;xy+=u*v;}return xx*yy>1e-18?xy/Math.sqrt(xx*yy):null;}
 const selectionBase=(()=>{let r=rng(4407);return Array.from({length:2400},()=>[normal(r),normal(r),normal(r)]);})();
 function selection(sigma,center,width,mode='band',variable='C'){
  let points=selectionBase.map(([x,y,e])=>[x,y,x+y+sigma*e]);
  let selected=points.filter(p=>{let v=p[variable==='X'?0:2];return mode==='threshold'?v>=center:Math.abs(v-center)<=width/2;});
  return {points,selected,all:correlation(points),observed:correlation(selected),thinTheory:-1/(1+sigma*sigma)};
 }
 function phantom(which='A'){let separation=which==='A'?.48:.22;return [{x:0,y:0,a:.92,b:.92,z:.6,density:.2},{x:0,y:-separation,a:.17,b:.16,z:.3,density:1},{x:0,y:separation,a:.17,b:.16,z:.3,density:1}];}
 function attenuation(x,y,which='A'){return phantom(which).reduce((s,e)=>s+(((x-e.x)/e.a)**2+((y-e.y)/e.b)**2<=1?e.density:0),0);}
 function projection(theta,t,which='A'){
  let c=Math.cos(theta),s=Math.sin(theta);
  return phantom(which).reduce((sum,e)=>{let h2=(e.a*c)**2+(e.b*s)**2,d=t-e.x*c-e.y*s;return sum+(d*d<h2?2*e.density*e.a*e.b/Math.sqrt(h2)*Math.sqrt(1-d*d/h2):0);},0);
 }
 function reconstruct(which='A',count=36,coverage=180,noise=0,size=64){
  const detector=129,extent=1.25,d=2*extent/(detector-1),dtheta=coverage*rad/count;
  const random=rng(6510),angles=[],sino=[],filtered=[];
  for(let a=0;a<count;a++){
   let theta=(a+.5)*dtheta,p=Array.from({length:detector},(_,i)=>projection(theta,-extent+i*d,which)+noise*normal(random));angles.push(theta);sino.push(p);
   let f=p.map((_,i)=>{let sum=p[i]/(4*d*d);for(let j=0;j<detector;j++){let k=i-j;if(k%2!==0)sum-=p[j]/(pi*pi*k*k*d*d);}return sum*d;});filtered.push(f);
  }
  let image=[],truth=[],se=0;
  for(let j=0;j<size;j++)for(let i=0;i<size;i++){
   let x=-1.05+(i+.5)*2.1/size,y=1.05-(j+.5)*2.1/size,v=0;
   for(let a=0;a<count;a++){let u=(x*Math.cos(angles[a])+y*Math.sin(angles[a])+extent)/d,k=Math.floor(u);if(k>=0&&k<detector-1)v+=(filtered[a][k]*(1-u+k)+filtered[a][k+1]*(u-k))*dtheta;}
   let exact=attenuation(x,y,which);image.push(v);truth.push(exact);se+=(v-exact)**2;
  }
  return {image,truth,size,sino,detector,angles,error:Math.sqrt(se/(size*size))};
 }
 const contacts={forward:[['A','B',1],['B','C',2],['C','D',3],['D','E',4],['B','F',5]],reverse:[['B','C',1],['A','B',2],['C','D',3],['D','E',4],['B','F',5]],simultaneous:[['A','B',1],['B','C',1],['C','D',3],['D','E',4],['B','F',5]]};
 function reachable(events,source='A',start=0,end=6,memory=Infinity){
  if(start>end)return {arrival:{},used:[],retaining:[],history:{}};
  let arrival={[source]:start},last={[source]:start},used=[],history={[source]:[start]};
  let times=[...new Set(events.filter(e=>e[2]>=start&&e[2]<=end).map(e=>e[2]))].sort((a,b)=>a-b);
  for(let t of times){let before={...last},updates={};for(let [a,b,time] of events.filter(e=>e[2]===t)){
    let has=n=>before[n]!==undefined&&t-before[n]<=memory;
    if(has(a)&&!has(b)){updates[b]=t;used.push([a,b,t]);}if(has(b)&&!has(a)){updates[a]=t;used.push([b,a,t]);}
    if(has(a)||has(b)){updates[a]=t;updates[b]=t;}
   }for(let [n,time] of Object.entries(updates)){last[n]=time;if(arrival[n]===undefined)arrival[n]=time;(history[n]||(history[n]=[])).push(time);}
  }
  return {arrival,used,retaining:Object.keys(last).filter(n=>end-last[n]<=memory),history};
 }
 function stress(principal,azimuth,polar,frame=0){
  let a=azimuth*rad,p=polar*rad,n=[Math.sin(p)*Math.cos(a),Math.sin(p)*Math.sin(a),Math.cos(p)];
  let tensor=principal.map((v,i)=>[0,1,2].map(j=>i===j?v:0));
  let traction=mv(tensor,n),normalStress=dot(n,traction),shear=sub(traction,scale(n,normalStress));
  let basis=rotation('Z',-frame*rad),components=mm(mm(basis,tensor),transpose(basis));
  return {n,tensor,traction,normalStress,shear,shearMagnitude:norm(shear),basis,components,normalComponents:mv(basis,n),tractionComponents:mv(basis,traction)};
 }
 const pressure=(T,v)=>8*T/(3*v-1)-3/(v*v);
 const dpdv=(T,v)=>-24*T/(3*v-1)**2+6/v**3;
 function bisect(f,a,b,steps=72){let fa=f(a),fb=f(b);if(fa*fb>0)throw Error('Root is not bracketed');for(let i=0;i<steps;i++){let c=(a+b)/2,fc=f(c);if(fa*fc<=0){b=c;fb=fc;}else{a=c;fa=fc;}}return(a+b)/2;}
 function coexist(T){
  if(T>=1)return null;
  let s1=bisect(v=>dpdv(T,v),1/3+1e-6,1),s2=bisect(v=>dpdv(T,v),1,100),pmin=pressure(T,s1),pmax=pressure(T,s2);
  function endpoints(p){return [bisect(v=>pressure(T,v)-p,1/3+1e-7,s1),bisect(v=>pressure(T,v)-p,s2,Math.max(100,20/p))];}
  function area(p){let [l,g]=endpoints(p),F=v=>8*T/3*Math.log(3*v-1)+3/v-p*v;return F(g)-F(l);}
  let margin=Math.max(Number.EPSILON,(pmax-pmin)*1e-6);
  let p=bisect(area,Math.max(1e-8,pmin+margin),pmax-margin),[liquid,gas]=endpoints(p);
  return {p,liquid,gas,area:area(p),spinodal:[s1,s2]};
 }
 const galaxies=(()=>{let r=rng(5126);return Array.from({length:420},()=>({pos:[normal(r)*2.5,normal(r)*2.5,normal(r)*2.5],velocity:[normal(r),normal(r),normal(r)]}));})();
 function redshift(dispersion,H0,azimuth=0){
  let n=[Math.cos(azimuth*rad),Math.sin(azimuth*rad),0],observer=scale(n,-150);
  let points=galaxies.map(g=>{let los=unit(sub(g.pos,observer)),v=dot(g.velocity,los)*dispersion,s=add(g.pos,scale(los,v/H0));return {real:g.pos,observed:s,los,v,shift:v/H0};});
  let spread=key=>Math.sqrt(points.reduce((s,p)=>s+dot(p[key],n)**2,0)/points.length);
  return {n,observer,points,trueSpread:spread('real'),redshiftSpread:spread('observed')};
 }
 const phyloNodes={R:{time:0,x:0,y:0},E:{time:4,x:2.1,y:1.2},AB:{time:1,x:-1,y:-.35},CD:{time:1,x:1,y:.35},a:{time:2,x:-1.5,y:-.6},b:{time:2,x:-.5,y:.1},c:{time:2,x:.5,y:-.1},d:{time:2,x:1.5,y:.6},H:{time:3,x:-.5,y:.1},A:{time:4,x:-1.5,y:-.6},B:{time:4,x:-.5,y:.1},C:{time:4,x:.5,y:-.1},D:{time:4,x:1.5,y:.6}};
 const phyloEdges=[['R','E'],['R','AB'],['R','CD'],['AB','a'],['AB','b'],['CD','c'],['CD','d'],['a','A'],['b','H'],['H','B'],['c','C'],['d','D']];
 function phylogeny(gene='A',transfer=true,time=4){
  let all=phyloEdges.map(e=>e.slice());if(transfer)all.push(['c','H']);
  // Only locus B follows the donor edge into H. Locus A keeps vertical ancestry.
  let selected=all.filter(([a,b])=>b!=='H'||a===((gene==='B'&&transfer)?'c':'b'));
  let visible=all.filter(([a,b])=>phyloNodes[a].time<=time&&phyloNodes[b].time<=time);
  return {nodes:phyloNodes,all,selected,visible,split:gene==='B'&&transfer?'A | B C | D':'A B | C D',quartets:transfer?['AB|CD','AD|BC']:['AB|CD']};
 }
 const api={pi,rad,add,sub,scale,dot,norm,unit,cross,mv,mm,transpose,eye,rotation,euler,quaternion,qmatrix,recoverZYX,rng,normal,correlation,selection,phantom,attenuation,projection,reconstruct,contacts,reachable,stress,pressure,dpdv,bisect,coexist,redshift,phylogeny};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Inference=api;
})(typeof window!=='undefined'?window:globalThis);
