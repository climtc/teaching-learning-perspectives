(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LagrangeModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function potential(p,mu){const[x,y,z]=p,r1=Math.hypot(x+mu,y,z),r2=Math.hypot(x-1+mu,y,z);return .5*(x*x+y*y)+(1-mu)/r1+mu/r2;}
function gradient(p,mu){const[x,y,z]=p,a=(1-mu)/Math.hypot(x+mu,y,z)**3,b=mu/Math.hypot(x-1+mu,y,z)**3;return[x-a*(x+mu)-b*(x-1+mu),y-(a+b)*y,-(a+b)*z];}
function dynamics(q,mu){const g=gradient(q,mu);return[q[3],q[4],q[5],2*q[4]+g[0],-2*q[3]+g[1],g[2]];}
function jacobi(q,mu){return 2*potential(q,mu)-q[3]**2-q[4]**2-q[5]**2;}
function rotate(p,t){const c=Math.cos(t),s=Math.sin(t);return[c*p[0]-s*p[1],s*p[0]+c*p[1],p[2]];}
function inertialState(q,t){const p=rotate(q,t),v=rotate([q[3]-q[1],q[4]+q[0],q[5]],t);return[...p,...v];}
function state(orbit,fraction){const a=orbit.states,u=Math.max(0,Math.min(1,fraction))*(a.length-1),i=Math.min(a.length-2,Math.floor(u)),v=u-i,p=a[i],q=a[i+1],h=q[0]-p[0],v2=v*v,v3=v2*v,out=[];
 for(let j=1;j<=3;j++)out.push((2*v3-3*v2+1)*p[j]+(v3-2*v2+v)*h*p[j+3]+(-2*v3+3*v2)*q[j]+(v3-v2)*h*q[j+3]);
 for(let j=1;j<=3;j++)out.push(((6*v2-6*v)*p[j]+(3*v2-4*v+1)*h*p[j+3]+(-6*v2+6*v)*q[j]+(3*v2-2*v)*h*q[j+3])/h);
 return out;
}
function stableTriangular(mu){return 27*mu*(1-mu)<1;}
function distance(a,b){return Math.hypot(...a.slice(0,3).map((x,i)=>x-b[i]));}
// Unequal UTC samples, geometric Earth-centred states (km, km/s).
function ephemeris(rows,time){
 if(time<rows[0][0]-.001||time>rows.at(-1)[0]+.001)return null;
 time=Math.max(rows[0][0],Math.min(rows.at(-1)[0],time));let lo=0,hi=rows.length-1;
 while(hi-lo>1){const mid=(lo+hi)>>1;if(rows[mid][0]<=time)lo=mid;else hi=mid;}
 const p=rows[lo],q=rows[hi],h=q[0]-p[0],u=(time-p[0])/h,u2=u*u,u3=u2*u,out=[];
 for(let j=1;j<=3;j++)out.push((2*u3-3*u2+1)*p[j]+(u3-2*u2+u)*h*p[j+3]+(-2*u3+3*u2)*q[j]+(u3-u2)*h*q[j+3]);
 for(let j=1;j<=3;j++)out.push(((6*u2-6*u)*p[j]+(3*u2-4*u+1)*h*p[j+3]+(-6*u2+6*u)*q[j]+(3*u2-2*u)*h*q[j+3])/h);
 return out;
}
const dot=(a,b)=>a.slice(0,3).reduce((v,x,i)=>v+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const n=Math.hypot(...a);return a.map(x=>x/n);};
function sunBasis(sun){const x=unit(sun.slice(0,3).map(v=>-v)),z=unit(cross(sun.slice(0,3),sun.slice(3,6))),y=cross(z,x);return[x,y,z];}
function missionPosition(earthRelative,sun,frame){return frame==='inertial'?earthRelative.slice(0,3).map((x,i)=>x-sun[i]):sunBasis(sun).map(axis=>dot(earthRelative,axis));}
// Instantaneous two-body axes. Input states are geometric Earth-relative km, km/s.
function pairBasis(sun,moon,system){if(system==='sun-earth')return sunBasis(sun);const x=unit(moon.slice(0,3)),z=unit(cross(moon.slice(0,3),moon.slice(3,6))),y=cross(z,x);return[x,y,z];}
function fromBasis(p,basis){return [0,1,2].map(j=>p.reduce((v,x,i)=>v+x*basis[i][j],0));}
function scenePosition(q,sun,moon,system,frame){return frame==='inertial'?q.slice(0,3).map((x,i)=>x-sun[i]):pairBasis(sun,moon,system).map(axis=>dot(q,axis));}
function referencePosition(p,mu,sun,moon,system,frame){const length=Math.hypot(...(system==='sun-earth'?sun:moon).slice(0,3)),origin=system==='sun-earth'?1-mu:-mu,rel=p.map((v,i)=>(v-(i===0?origin:0))*length);return scenePosition(fromBasis(rel,pairBasis(sun,moon,system)),sun,moon,system,frame);}
function missionTime(window,fraction){return window.start+Math.max(0,Math.min(1,fraction))*(window.end-window.start);}
return{potential,gradient,dynamics,jacobi,rotate,inertialState,state,stableTriangular,distance,ephemeris,sunBasis,missionPosition,missionTime,pairBasis,fromBasis,scenePosition,referencePosition};
});
