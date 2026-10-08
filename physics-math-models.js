/* Coordinates, equilibria and wavefunctions used by the six comparisons. */
(function(root){
'use strict';
const pi=Math.PI,add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>Math.hypot(...a);
function rotateY(p,a){return[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];}
function ewald(hkl,a,lambda,angle){const g=rotateY(mul(hkl,1/a),angle),kin=[0,0,1/lambda],kout=add(kin,g),mismatch=norm(kout)-1/lambda;return{g,kin,kout,mismatch,residual:2*dot(kin,g)+dot(g,g)};}
function braggAngle(hkl,a,lambda){const g=mul(hkl,1/a),r=Math.hypot(g[0],g[2]),target=-lambda*dot(g,g)/2;if(r===0||Math.abs(target)>r)return null;return Math.acos(target/r)-Math.atan2(g[0],g[2]);}
function field(p,charge,q){const d=sub(p,charge),r=norm(d);return r<1e-10?null:mul(d,q/(r*r*r));}
function sphereFlux(radius,x,q,n=4096){if(Math.abs(Math.abs(x)-radius)<1e-7)return null;let sum=0;for(let i=0;i<n;i++){const u=-1+(2*i+1)/n,d2=radius*radius+x*x-2*radius*x*u;sum+=q*radius*radius*(radius-x*u)/Math.pow(d2,1.5);}return sum/n;}
function roots(a,b){const D=b*b/4-a*a*a/27;if(D>1e-12){const s=Math.sqrt(D);return[Math.cbrt(b/2+s)+Math.cbrt(b/2-s)];}if(Math.abs(D)<=1e-12){const u=Math.cbrt(b/2);return Math.abs(u)<1e-10?[0]:[2*u,-u].sort((x,y)=>x-y);}const r=2*Math.sqrt(a/3),theta=Math.acos(Math.max(-1,Math.min(1,3*b/(2*a)*Math.sqrt(3/a))))/3;return[0,1,2].map(k=>r*Math.cos(theta-2*pi*k/3)).sort((x,y)=>x-y);}
const potential=(x,a,b)=>x**4/4-a*x*x/2-b*x;
function cuspPath(a,s){const up=s<=.5,b=up?-3+12*s:9-12*s,r=roots(a,b),stable=r.filter(x=>3*x*x-a>1e-7),candidates=stable.length?stable:r;return{a,b,up,roots:r,x:up?candidates[0]:candidates[candidates.length-1]};}
function complexValue(type,r,theta){return type==='sqrt'?[Math.sqrt(r)*Math.cos(theta/2),Math.sqrt(r)*Math.sin(theta/2)]:[Math.log(r),theta];}
function principal(type,r,theta){const arg=Math.atan2(Math.sin(theta),Math.cos(theta));return complexValue(type,r,arg);}
function packet(x,t,p,sigma,phase=0){const tau=t/(2*sigma*sigma),X=x-p*t,s=1+tau*tau,A=(2*pi*sigma*sigma)**(-.25)*s**(-.25)*Math.exp(-X*X/(4*sigma*sigma*s)),arg=-.5*Math.atan(tau)+X*X*tau/(4*sigma*sigma*s)+p*x-p*p*t/2+phase;return[A*Math.cos(arg),A*Math.sin(arg)];}
function packetStats(t,p,sigma){const sx=sigma*Math.sqrt(1+(t/(2*sigma*sigma))**2),sp=1/(2*sigma);return{mean:p*t,sx,sp,uncertainty:sx*sp};}
const gaussian=(x,mean,s)=>Math.exp(-((x-mean)**2)/(2*s*s))/(Math.sqrt(2*pi)*s);
function conicPoint(m,c,phi,nappe=1){const den=nappe-m*Math.cos(phi);if(Math.abs(den)<1e-10)return null;const r=c/den;return r>=0?[r*Math.cos(phi),r*Math.sin(phi),nappe*r]:null;}
function conicType(m,c){if(Math.abs(c)<1e-9)return Math.abs(m)<1-1e-7?'점':Math.abs(m)>1+1e-7?'두 직선':'한 생성선';return Math.abs(m)<1-1e-7?'타원':Math.abs(m)>1+1e-7?'쌍곡선':'포물선';}
function conicIntrinsic(p,m){return[p[0]*Math.sqrt(1+m*m),p[1]];}
const api={add,sub,mul,dot,norm,rotateY,ewald,braggAngle,field,sphereFlux,roots,potential,cuspPath,complexValue,principal,packet,packetStats,gaussian,conicPoint,conicType,conicIntrinsic};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PhysicsMath=api;
})(typeof window!=='undefined'?window:globalThis);
