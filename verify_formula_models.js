/* Independent checks: power series, finite differences, quadrature and Born probabilities. */
const assert=require('node:assert/strict'), M=require('./formula-models.js');
let checks=0;
function near(a,b,tol=1e-9){assert(Number.isFinite(a)&&Number.isFinite(b));assert(Math.abs(a-b)<=tol,`${a} ≠ ${b} (tol ${tol})`);checks++;}
function complexExp(theta){let re=1,im=0,tr=1,ti=0;for(let n=1;n<80;n++){const nr=-ti*theta/n,ni=tr*theta/n;tr=nr;ti=ni;re+=tr;im+=ti;}return [re,im];}
for(let j=-100;j<=100;j++){const t=j*Math.PI/50,q=M.euler(t),z=complexExp(t);near(q.re,z[0],1e-10);near(q.im,z[1],1e-10);near(Math.hypot(q.re,q.im),1);}
near(M.euler(Math.PI).re,-1);near(M.euler(Math.PI).im,0);near(M.euler(M.TAU).re,1);
for(const a of [1,1.5,2])for(const e of [0,.45,.8])for(let j=0;j<60;j++){
 const t=j*M.TAU/60,q=M.kepler(a,e,t),n=Math.sqrt(1/a**3),h=1e-5;
 near(q.E-e*Math.sin(q.E),q.M,1e-11);near(q.energy,-1/(2*a),1e-10);near(q.angularMomentum,Math.sqrt(a*(1-e*e)),1e-10);
 const before=M.kepler(a,e,t-n*h),after=M.kepler(a,e,t+n*h);
 for(let k=0;k<3;k++){near((after.position[k]-before.position[k])/(2*h),q.velocity[k],2e-7);near((after.velocity[k]-before.velocity[k])/(2*h),q.acceleration[k],3e-6);}
}
for(const lambda of [1,2,4])for(const p of [0,.4,Math.PI/2,Math.PI])for(const x of [-1.1,0,.6]){
 const t=.37,q=M.wave(x,t,lambda,p),h=1e-5,dxBefore=M.wave(x-h,t,lambda,p),dxAfter=M.wave(x+h,t,lambda,p),dtBefore=M.wave(x,t-h,lambda,p),dtAfter=M.wave(x,t+h,lambda,p);
 near(M.dot(q.E,q.B),0);near(Math.hypot(...q.E),Math.hypot(...q.B));near(M.cross(q.E,q.B)[0],M.dot(q.E,q.E));
 const dxE=q.E.map((_,i)=>(dxAfter.E[i]-dxBefore.E[i])/(2*h)),dtB=q.B.map((_,i)=>(dtAfter.B[i]-dtBefore.B[i])/(2*h));
 near(dtB[1]-dxE[2],0,2e-8);near(dtB[2]+dxE[1],0,2e-8);
}
for(const p of [[.5,.4,1.5],[1,0,1],[1.5,.4,.5],[-.8,.6,-2]])for(let j=-80;j<=80;j++){
 const beta=j/100,q=M.lorentz(p,beta),r=M.lorentz(q,-beta);near(M.interval(p),M.interval(q),1e-11);p.forEach((v,i)=>near(v,r[i],1e-11));
}
// Midpoint quadrature of the defining coefficient integral is independent of the odd-harmonic implementation.
for(let n=1;n<=23;n++) {const steps=24000,dx=M.TAU/steps;let coefficient=0;for(let j=0;j<steps;j++){const t=-Math.PI+(j+.5)*dx;coefficient+=(t<0?-1:1)*Math.sin(n*t)*dx/Math.PI;}near(coefficient,n%2?4/(Math.PI*n):0,3e-7);}
for(const n of [1,4,12]){near(M.fourier(n,0),0);near(M.fourier(n,Math.PI),0);let energy=0,steps=4000;for(let j=0;j<steps;j++)energy+=M.fourier(n,(j+.5)*M.TAU/steps)**2/steps;const analytic=Array.from({length:n},(_,i)=>(4/(Math.PI*(2*i+1)))**2/2).reduce((a,b)=>a+b,0);near(energy,analytic,1e-10);assert(energy<1);}
for(let i=0;i<=18;i++)for(let j=0;j<=36;j++){
 const theta=i*Math.PI/18,phi=j*Math.PI/18,r=M.bloch(theta,phi),a=Math.cos(theta/2),br=Math.cos(phi)*Math.sin(theta/2),bi=Math.sin(phi)*Math.sin(theta/2);
 near(Math.hypot(...r),1);near(M.probability(r,[0,0,1]),a*a);near(M.probability(r,[1,0,0]),((a+br)**2+bi*bi)/2);near(M.probability(r,[0,1,0]),(br*br+(bi+a)**2)/2);
 near(M.probability(r,r),1);near(M.probability(r,r.map(x=>-x)),0);
}
for(const x of [-1.2,0,.7,1.2])for(const y of [-1.2,0,.4,1.2]){
 const g=M.gradient(x,y),h=1e-5;near(g[0],(M.surface(x+h,y)-M.surface(x-h,y))/(2*h),1e-9);near(g[1],(M.surface(x,y+h)-M.surface(x,y-h))/(2*h),1e-9);near(M.tangent(x,y,x,y),M.surface(x,y));
 const norm=Math.hypot(...g);if(norm>0){const u=g.map(v=>v/norm);near((M.surface(x+h*u[0],y+h*u[1])-M.surface(x-h*u[0],y-h*u[1]))/(2*h),norm,1e-9);near(M.dot([-g[0],-g[1],1],[u[0],u[1],norm]),0);}
}
console.log(`Passed ${checks} numerical checks across seven mathematical models.`);
