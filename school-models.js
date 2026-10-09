(function(root){
'use strict';
const pi=Math.PI,rad=pi/180;
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,k)=>a.map(v=>v*k),norm=a=>Math.hypot(...a),unit=a=>norm(a)?mul(a,1/norm(a)):a.map(()=>0);
function quadratic(c){return{discriminant:-4*c,roots:c<0?[-Math.sqrt(-c),Math.sqrt(-c)]:c===0?[0]:[],value:x=>x*x+c};}
function composition(x,b,order){const mid=order==='fg'?x*x:x+b;return{input:x,mid,output:order==='fg'?mid+b:mid*mid,other:order==='fg'?(x+b)**2:x*x+b};}
function sequence(r,n){let sum=0;const rows=[];for(let i=1;i<=n;i++){const a=r**(i-1);sum+=a;rows.push({n:i,a,sum});}return{rows,sum,limit:r<1?1/(1-r):null};}
function volume(L,N){const dx=L/N,rows=Array.from({length:N},(_,i)=>({x:(i+.5)*dx,r:1+.5*(i+.5)*dx,dx}));return{rows,approx:rows.reduce((s,q)=>s+pi*q.r*q.r*dx,0),exact:pi*(L+.5*L*L+L**3/12)};}
function conditional(p,a,b){const cells=[[p*(1-a),p*a],[(1-p)*(1-b),(1-p)*b]],defect=cells[0][1]+cells[1][1];return{cells,defect,posterior:cells[0][1]/defect};}
function projection(angle){const t=angle*rad,c=Math.cos(t),s=Math.sin(t),corners=[[-1,-1],[-1,1],[1,1],[1,-1]].map(([x,y])=>[x,y*c,1.2+y*s]);return{corners,area:4,projectedArea:4*c};}
function matrix(p,q,steps){let a=80,b=20;const rows=[{a,b}],flows=[];for(let n=0;n<steps;n++){flows.push([[a*(1-p),a*p],[b*q,b*(1-q)]]);[a,b]=[(1-p)*a+q*b,p*a+(1-q)*b];rows.push({a,b});}return{rows,flows,P:[[1-p,q],[p,1-q]]};}
function lens(d,h,screen,aperture){const image=d/(d-1),height=-h*image/d;const rays=Array.from({length:25},(_,i)=>{const a=i===0?[0,0,0]:[0,aperture*Math.cos(2*pi*(i-1)/24),aperture*Math.sin(2*pi*(i-1)/24)];return{object:[-d,0,h],aperture:a,image:[image,0,height],screen:[screen,a[1]*(1-screen/image),a[2]+(height-a[2])*screen/image]};});return{image,height,rays,blur:aperture*Math.abs(1-screen/image)};}
function torque(r,F,azimuth,elevation){const a=azimuth*rad,e=elevation*rad,force=[F*Math.cos(e)*Math.cos(a),F*Math.cos(e)*Math.sin(a),F*Math.sin(e)];return{force,axial:r*force[1],arm:r*Math.sin(a),horizontal:F*Math.cos(e)};}
function molecule(name,angle=0){let vecs,central,outer,lone,description;
 if(name==='CO2'){vecs=[[1,0,0],[-1,0,0]];central='C';outer='O';lone=[];description='선형 · 180°';}
 else if(name==='H2O'){const a=104.5*rad/2;vecs=[[Math.sin(a),0,Math.cos(a)],[-Math.sin(a),0,Math.cos(a)]];central='O';outer='H';lone=[[0,.8,-.6],[0,-.8,-.6]];description='굽은형 · 약 104.5°';}
 else if(name==='NH3'){const z=Math.sqrt((Math.cos(106.8*rad)+.5)/1.5),r=Math.sqrt(1-z*z);vecs=Array.from({length:3},(_,i)=>[r*Math.cos(2*pi*i/3),r*Math.sin(2*pi*i/3),-z]);central='N';outer='H';lone=[[0,0,1]];description='삼각뿔형 · 약 106.8°';}
 else{vecs=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(unit);central='C';outer='H';lone=[];description='정사면체 · 약 109.5°';}
 const t=angle*rad,R=p=>[Math.cos(t)*p[0]+Math.sin(t)*p[2],p[1],-Math.sin(t)*p[0]+Math.cos(t)*p[2]];vecs=vecs.map(R);lone=lone.map(R);const dipoles=vecs.map(v=>mul(v,name==='CO2'?1:-1)),net=dipoles.reduce(add,[0,0,0]);return{vecs,lone,dipoles,net,central,outer,description};}
function equilibrium(a,b,t){const total=a+b,eq=a/total,p=eq*(1-Math.exp(-total*t));return{p,eq,forward:a*(1-p),reverse:b*p};}
function reactionTrace(a,b,T=20,N=80,dt=.05){let seed=178234;const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};let bits=Array(N).fill(0);const lambda=a+b,e=1-Math.exp(-lambda*dt),ab=a/lambda*e,ba=b/lambda*e,rows=[{bits:[...bits],toA:[],toB:[]}];for(let i=1;i<=Math.round(T/dt);i++){const toA=[],toB=[];bits=bits.map((v,j)=>{if(random()<(v?ba:ab)){(v?toA:toB).push(j);return 1-v;}return v;});rows.push({bits:[...bits],toA,toB});}return{rows,dt,N};}
function meiosis(stage,flipA=false,flipB=false){const colors=['#62b6e9','#efac62'],flips=[flipA,flipB],cells=[],duplicated=stage<=4;
 if(stage<=2){cells.push({center:[0,0,0],chromosomes:[0,1].flatMap(pair=>[0,1].map(origin=>({pair,origin,color:colors[origin],duplicated:true,side:(origin^(flips[pair]?1:0))?1:-1}))) });}
 else if(stage<=5){for(let side=0;side<2;side++){const chroms=[0,1].map(pair=>({pair,origin:side^(flips[pair]?1:0),color:colors[side^(flips[pair]?1:0)],duplicated:true,side:0}));if(stage===5){const copies=chroms.flatMap(c=>[-1,1].map(s=>({...c,duplicated:false,side:s})));cells.push({center:[side?1.7:-1.7,0,0],chromosomes:copies});}else cells.push({center:[side?1.7:-1.7,0,0],chromosomes:chroms});}}
 else for(let side=0;side<2;side++)for(let sister=0;sister<2;sister++)cells.push({center:[side?1.7:-1.7,sister?1.2:-1.2,0],chromosomes:[0,1].map(pair=>({pair,origin:side^(flips[pair]?1:0),color:colors[side^(flips[pair]?1:0)],duplicated:false,side:0}))});
 return{cells,chromosomes:cells.reduce((s,c)=>s+c.chromosomes.length,0),chromatids:cells.reduce((s,c)=>s+c.chromosomes.reduce((a,x)=>a+(x.duplicated?2:1),0),0),stage,duplicated};}
function strata(dip,theta,offset,throwValue){const slope=Math.tan(dip*rad),t=theta*rad,v=[Math.cos(t),Math.sin(t)],normal=[-v[1],v[0]],P=(u,z)=>[u*v[0]+offset*normal[0],u*v[1]+offset*normal[1],z],height=(x,i)=>-.7+i*.4+slope*x+(x>=0?throwValue:0);let lo=-1e6,hi=1e6;for(let j=0;j<2;j++){if(Math.abs(v[j])<1e-9)continue;const a=(-2-offset*normal[j])/v[j],b=(2-offset*normal[j])/v[j];lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}const crossing=Math.abs(v[0])>1e-9?-offset*normal[0]/v[0]:null;return{P,height,lo,hi,crossing,apparent:Math.atan(slope*Math.cos(t))/rad,slope};}
function front(type,progress){return{x:-2+4*progress,slope:type==='cold'?-.5:2,coldLeft:type==='cold'};}
const api={dot,add,sub,mul,norm,unit,quadratic,composition,sequence,volume,conditional,projection,matrix,lens,torque,molecule,equilibrium,reactionTrace,meiosis,strata,front};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SchoolModels=api;
})(typeof window!=='undefined'?window:globalThis);
