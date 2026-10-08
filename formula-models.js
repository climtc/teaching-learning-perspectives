/* Exact mathematical models used by the seven formula experiments. */
(function(root) {
  const TAU=2*Math.PI;
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const euler=theta=>({re:Math.cos(theta),im:Math.sin(theta),theta});
  function kepler(a,e,M,mu=1) {
    if(!(a>0 && e>=0 && e<1 && mu>0)) throw new RangeError('Elliptic orbit requires a>0, 0≤e<1, μ>0');
    M=((M+Math.PI)%TAU+TAU)%TAU-Math.PI;
    let E=M;
    for(let i=0;i<30;i++) { const delta=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); E-=delta; if(Math.abs(delta)<1e-13) break; }
    const q=Math.sqrt(1-e*e), n=Math.sqrt(mu/(a*a*a)), rate=n/(1-e*Math.cos(E));
    const position=[a*(Math.cos(E)-e),a*q*Math.sin(E),0];
    const velocity=[-a*Math.sin(E)*rate,a*q*Math.cos(E)*rate,0];
    const r=Math.hypot(...position), energy=dot(velocity,velocity)/2-mu/r;
    return {position,velocity,r,E,M,energy,angularMomentum:cross(position,velocity)[2],period:TAU/n,acceleration:position.map(v=>-mu*v/(r*r*r))};
  }
  function wave(x,t,wavelength,polarization=0) {
    const k=TAU/wavelength, v=Math.cos(k*(x-t)); // normalized c=1
    const E=[0,v*Math.cos(polarization),v*Math.sin(polarization)];
    const B=[0,-v*Math.sin(polarization),v*Math.cos(polarization)];
    return {E,B,k,phase:k*(x-t)};
  }
  function lorentz(event,beta) {
    if(Math.abs(beta)>=1) throw new RangeError('|β| must be below 1');
    const [x,y,ct]=event, gamma=1/Math.sqrt(1-beta*beta);
    return [gamma*(x-beta*ct),y,gamma*(ct-beta*x)];
  }
  const interval=([x,y,ct])=>ct*ct-x*x-y*y;
  const harmonic=(j,t)=>4/Math.PI*Math.sin((2*j-1)*t)/(2*j-1);
  const fourier=(n,t)=>Array.from({length:n},(_,i)=>harmonic(i+1,t)).reduce((a,b)=>a+b,0);
  const bloch=(theta,phi)=>[Math.sin(theta)*Math.cos(phi),Math.sin(theta)*Math.sin(phi),Math.cos(theta)];
  const probability=(r,n)=>Math.max(0,Math.min(1,(1+dot(r,n))/2));
  const surface=(x,y)=>.5*x*x+.9*y*y;
  const gradient=(x,y)=>[x,1.8*y];
  const tangent=(x,y,x0,y0)=>surface(x0,y0)+x0*(x-x0)+1.8*y0*(y-y0);
  const api={TAU,dot,cross,euler,kepler,wave,lorentz,interval,harmonic,fourier,bloch,probability,surface,gradient,tangent};
  root.FormulaModels=api;
  if(typeof module!=='undefined' && module.exports) module.exports=api;
})(globalThis);
