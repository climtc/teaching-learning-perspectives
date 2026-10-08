(function(root){
  'use strict';
  const states={
    '1s':{n:1,l:0,label:'1s · n=1, ℓ=0',mean:1.5,node:'밀도 마디 없음'},
    '2s':{n:2,l:0,label:'2s · n=2, ℓ=0',mean:6,node:'구면 마디 r=2a₀'},
    '2pz':{n:2,l:1,label:'2p_z · n=2, ℓ=1, m=0',mean:5,node:'평면 마디 z=0'},
    '2px':{n:2,l:1,label:'2p_x · n=2, ℓ=1, 실수 조합',mean:5,node:'평면 마디 x=0'}
  };
  function amplitude(s,x,y,z){
    const r=Math.hypot(x,y,z);
    if(s==='1s')return Math.exp(-r)/Math.sqrt(Math.PI);
    const a=Math.exp(-r/2)/(4*Math.sqrt(2*Math.PI));
    return a*(s==='2s'?2-r:s==='2pz'?z:x);
  }
  function density(s,x,y,z){const a=amplitude(s,x,y,z);return a*a;}
  function radial(s,r){
    if(r<0)return 0;
    if(s==='1s')return 4*r*r*Math.exp(-2*r);
    if(s==='2s')return r*r*(2-r)**2*Math.exp(-r)/8;
    return r**4*Math.exp(-r)/24;
  }
  function cdf(s,r){
    if(r<=0)return 0;
    if(!Number.isFinite(r))return 1;
    let q;
    if(s==='1s')q=Math.exp(-2*r)*(1+2*r+2*r*r);
    else if(s==='2s')q=Math.exp(-r)*(1+r+r*r/2+r**4/8);
    else q=Math.exp(-r)*(1+r+r*r/2+r**3/6+r**4/24);
    return Math.max(0,Math.min(1,1-q));
  }
  function quantile(s,p){
    if(p<=0)return 0;if(p>=1)return Infinity;
    let lo=0,hi=8;while(cdf(s,hi)<p)hi*=2;
    for(let k=0;k<55;k++){const mid=(lo+hi)/2;if(cdf(s,mid)<p)lo=mid;else hi=mid;}
    return (lo+hi)/2;
  }
  function random(seed){
    let a=seed>>>0;
    return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
  }
  function samples(s,count,seed=1931){
    const rng=random(seed),out=[];
    for(let k=0;k<count;k++){
      const r=quantile(s,(rng()+1e-12)/(1+2e-12));
      const u=s.startsWith('2p')?Math.cbrt(2*rng()-1):2*rng()-1;
      const phi=2*Math.PI*rng(),v=Math.sqrt(Math.max(0,1-u*u));
      let x=r*v*Math.cos(phi),y=r*v*Math.sin(phi),z=r*u;
      if(s==='2px')[x,z]=[z,x];
      out.push({x,y,z,r});
    }
    return out;
  }
  function planePoint(u,v,offset,plane){return plane==='xz'?[u,offset,v]:[u,v,offset];}
  function slice(s,u,v,offset,plane){return density(s,...planePoint(u,v,offset,plane));}
  function marginal(s,u,v,plane,steps=160,limit=40){
    if(steps%2)steps++;
    const h=limit/steps;
    let sum=slice(s,u,v,0,plane)+slice(s,u,v,limit,plane);
    for(let k=1;k<steps;k++)sum+=(k%2?4:2)*slice(s,u,v,k*h,plane);
    return sum*h/3*2;
  }
  const api={states,amplitude,density,radial,cdf,quantile,random,samples,planePoint,slice,marginal,energy:s=>-13.6/states[s].n**2};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.AtomicProbability=api;
})(typeof window==='object'?window:globalThis);
