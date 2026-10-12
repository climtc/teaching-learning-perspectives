/* Optical constructions in a declared scene; historical paintings are references. */
(function(root){
'use strict';
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,k)=>a.map(x=>x*k),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm=a=>Math.hypot(...a),unit=a=>mul(a,1/(norm(a)||1)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function camera(E,T,up=[0,0,1]){const n=unit(sub(T,E)),r=unit(cross(n,up)),u=cross(r,n);return{E,T,n,r,u};}
function imagePoint(P,C){const q=sub(P,C.E),d=dot(q,C.n);return d>1e-7?[dot(q,C.r)/d,dot(q,C.u)/d,d]:null;}
function planePoint(P,E,axis,value){const d=P[axis]-E[axis];if(Math.abs(d)<1e-10)return null;const t=(value-E[axis])/d;return t>0?add(E,mul(sub(P,E),t)):null;}
function reflect(d,n){return sub(d,mul(n,2*dot(d,n)));}
function sphereHit(E,d,C,R){const v=sub(E,C),b=dot(v,d),c=dot(v,v)-R*R,q=b*b-c;if(q<0)return null;const t=-b-Math.sqrt(q);return t>1e-8?add(E,mul(d,t)):null;}
function mirrorSample(E,Q,C,planeY){const n=unit(sub(Q,C)),d=unit(sub(Q,E)),out=reflect(d,n);if(dot(sub(E,Q),n)<=0||Math.abs(out[1])<1e-9)return null;const t=(planeY-Q[1])/out[1];return t>0?{Q,n,out,P:add(Q,mul(out,t))}:null;}
function flatMirror(E,P,y){const virtual=[P[0],2*y-P[1],P[2]],Q=planePoint(virtual,E,1,y);return Q?{Q,virtual,path:[E,Q,P]}:null;}
const skull=[];
const outline=[[-.42,-.54],[-.36,-.82],[.36,-.82],[.42,-.54],[.63,-.25],[.68,.28],[.51,.62],[.2,.8],[-.2,.8],[-.51,.62],[-.68,.28],[-.63,-.25],[-.42,-.54]];
skull.push({points:outline,kind:'face',color:'#e4d9c2'});
for(const x of [-.26,.26])skull.push({points:Array.from({length:25},(_,i)=>[x+.16*Math.cos(2*Math.PI*i/24),.1+.2*Math.sin(2*Math.PI*i/24)]),kind:'face',color:'#273341'});
skull.push({points:[[-.08,-.25],[.08,-.25],[0,-.08],[-.08,-.25]],kind:'face',color:'#273341'});
for(let i=0;i<7;i++)skull.push({points:[[-.31+i*.1,-.5],[-.31+i*.1,-.76]],kind:'line',color:'#506173'});
const idealAnamorphEye=[-3.4,-.85,1.5],paintCentre=[0,0,1.5],AC=camera(idealAnamorphEye,paintCentre);
function anamorph(){const centre=add(idealAnamorphEye,mul(sub(paintCentre,idealAnamorphEye),1.25));return skull.map(s=>({...s,points:s.points.map(([u,v])=>planePoint(add(centre,add(mul(AC.r,u*.65),mul(AC.u,v*.65))),idealAnamorphEye,1,0))}));}
const domeEye=[0,-3.5,1.4];
function dome(){const paths=[];for(let i=0;i<12;i++){const t=2*Math.PI*i/12;paths.push(Array.from({length:25},(_,j)=>{const a=Math.PI*j/48;return[1.5*Math.cos(a)*Math.cos(t),1+1.5*Math.cos(a)*Math.sin(t),3.4+1.8*Math.sin(a)];}));}for(let j=0;j<6;j++){const a=Math.PI*j/12;paths.push(Array.from({length:73},(_,i)=>[1.5*Math.cos(a)*Math.cos(2*Math.PI*i/72),1+1.5*Math.cos(a)*Math.sin(2*Math.PI*i/72),3.4+1.8*Math.sin(a)]));}return paths;}
function paintedDome(){return dome().map(path=>path.map(P=>planePoint(P,domeEye,2,3.4)));}
const theatreEye=[0,-3,1.6];
function compress(P,k){const y=k*P[1],t=(y-theatreEye[1])/(P[1]-theatreEye[1]);return add(theatreEye,mul(sub(P,theatreEye),t));}
function street(k=1){const paths=[];for(let i=0;i<7;i++){const y=3*i;paths.push([[-1.6,y,0],[-1.6,y,2.8],[1.6,y,2.8],[1.6,y,0]].map(P=>compress(P,k)));}paths.push([[-1.6,0,0],[-1.6,18,0],[1.6,18,0],[1.6,0,0]].map(P=>compress(P,k)));return paths;}
function disparity(B,Z,D=.8,f=600){return f*B/(D+Z);}
function scrollWindow(progress,width,L=13.938){const start=(1-progress)*(L-width);return{start,end:start+width,left:start,right:L-start-width,u0:start/L,u1:(start+width)/L};}
function cylinderPoint(theta,R=112/(2*Math.PI),z=5){return[R*Math.cos(theta),R*Math.sin(theta),z];}
function shot(i,n=12,motion=true){const t=i/(n-1),E=[-1.2+2.4*t,-3-.25*Math.cos(t*Math.PI),1.35+.15*Math.sin(t*Math.PI)],T=[0,1.5,1.3],subject=[.65*Math.sin((motion?t:0)*Math.PI*1.6),1.5,1.2];return{i,t:motion?t:0,E,T,subject,C:camera(E,T)};}
const api={add,sub,mul,dot,norm,unit,cross,camera,imagePoint,planePoint,reflect,sphereHit,mirrorSample,flatMirror,skull,idealAnamorphEye,paintCentre,anamorph,domeEye,dome,paintedDome,theatreEye,compress,street,disparity,scrollWindow,cylinderPoint,shot};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GazeModels=api;
})(typeof window!=='undefined'?window:globalThis);
