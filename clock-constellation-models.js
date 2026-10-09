(function(root){
'use strict';
const pi=Math.PI,rad=pi/180,mas=rad/3600000,pcKm=3.085677581491367e13,yearSeconds=31557600;
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,k)=>a.map(v=>v*k),norm=a=>Math.hypot(...a),unit=a=>mul(a,1/norm(a));
function basis(ra=15,dec=60){const a=ra*rad,d=dec*rad;return {east:[-Math.sin(a),Math.cos(a),0],north:[-Math.cos(a)*Math.sin(d),-Math.sin(a)*Math.sin(d),Math.cos(d)],forward:[Math.cos(a)*Math.cos(d),Math.sin(a)*Math.cos(d),Math.sin(d)]};}
const skyBasis=basis();
const local=p=>[dot(p,skyBasis.east),dot(p,skyBasis.north),dot(p,skyBasis.forward)];
function stellarState(row,years=0){const a=row.ra*rad,d=row.dec*rad,b=basis(row.ra,row.dec),distance=1000/row.plx_value,p=mul(b.forward,distance),v=add(add(mul(b.east,distance*row.pmra*mas),mul(b.north,distance*row.pmdec*mas)),mul(b.forward,row.rvz_radvel*yearSeconds/pcKm));return {p:local(add(p,mul(v,years))),reference:local(p),v:local(v),distance,error:1000*row.plx_err/row.plx_value**2};}
function angles(p){return [Math.atan2(p[0],p[2])/rad,Math.atan2(p[1],Math.hypot(p[0],p[2]))/rad];}
function angular(a,b){return Math.acos(Math.max(-1,Math.min(1,dot(a,b)/(norm(a)*norm(b)))))/rad;}
function shapeDifference(reference,current){const errors=[];for(let i=0;i<reference.length;i++)for(let j=i+1;j<reference.length;j++)errors.push(angular(current[i],current[j])-angular(reference[i],reference[j]));return Math.sqrt(errors.reduce((s,e)=>s+e*e,0)/errors.length);}
function altitude(ra,dec,latitude,siderealHour){const h=(siderealHour*15-ra)*rad,p=latitude*rad,d=dec*rad;return Math.asin(Math.max(-1,Math.min(1,Math.sin(p)*Math.sin(d)+Math.cos(p)*Math.cos(d)*Math.cos(h))))/rad;}
function railway(offset=2,departure=2,speed=1,time=6,occupancy=.7){const arrivalA=6,startB=departure-offset,arrivalB=startB+6/speed,delta=arrivalB-arrivalA,intervalA=[arrivalA-occupancy/2,arrivalA+occupancy/2],intervalB=[arrivalB-occupancy/2,arrivalB+occupancy/2];return {arrivalA,arrivalB,startB,delta,clockA:time,clockB:time+offset,localArrivalB:departure+6/speed,risk:Math.abs(delta)<occupancy,intervalA,intervalB,A:[Math.max(-6,Math.min(6,time-6)),0],B:[0,Math.max(-6,Math.min(6,speed*(time-startB)-6))]};}
function lorentz(x,t,beta){const gamma=1/Math.sqrt(1-beta*beta);return {x:gamma*(x-beta*t),t:gamma*(t-beta*x),gamma};}
function lightSync(beta=0){const out=lorentz(-1,0,beta),bounce=lorentz(1,2,beta),back=lorentz(-1,4,beta),left=lorentz(-1,2,beta),right=lorentz(1,2,beta);return {out,bounce,back,stationMidpoint:2,deltaMoving:right.t-left.t,left,right};}
function roundTripSync(offset=2,outbound=.4,inbound=outbound,sent=0){const aSend=sent,bReflect=sent+outbound+offset,aReturn=sent+outbound+inbound,targetMid=(aSend+aReturn)/2,correction=targetMid-bReflect;return {aSend,bReflect,aReturn,targetMid,correction,residual:offset+correction};}
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function skyProjection(vectors){const forward=unit(vectors.map(unit).reduce((a,b)=>add(a,b),[0,0,0])),east=unit(cross([0,1,0],forward)),north=cross(forward,east);return vectors.map(v=>angles([dot(v,east),dot(v,north),dot(v,forward)]));}
const api={pi,rad,mas,pcKm,yearSeconds,dot,add,sub,mul,norm,unit,basis,local,stellarState,angles,angular,shapeDifference,altitude,railway,lorentz,lightSync,roundTripSync,cross,skyProjection};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ClockConstellation=api;
})(typeof window!=='undefined'?window:globalThis);
