(function(root){
'use strict';
const TAU=2*Math.PI;
function frontierBase(d){return 2.5+5.5*d+.6*Math.sin(TAU*d);}
function frontierRate(d){return .22+.04*Math.cos(TAU*d);}
function frontier(t,d,resource=0,speed=1,scenario='growth'){
 const human=.035*t+.1*d;
 const gap=scenario==='bounded'?-1/(1+.25*t):frontierRate(d)*(speed*t-frontierBase(d))+.22*resource;
 return {human,ai:human+gap,gap};
}
function crossing(d,resource=0,speed=1,scenario='growth'){
 return scenario==='bounded'?null:(frontierBase(d)-.22*resource/frontierRate(d))/speed;
}
function aggregate(mix){
 const weights={A:.5-.4*mix,B:.5+.4*mix};
 const rates={A:[.9,.3],B:[.8,.2]};
 const overall={A:weights.A*rates.A[0]+(1-weights.A)*rates.A[1],B:weights.B*rates.B[0]+(1-weights.B)*rates.B[1]};
 return {weights,rates,overall};
}
function moving(t,follow,reference='lab'){
 const target=.45*t+.045*t*t,observer=follow*target;
 const origin=reference==='observer'?observer:0;
 return {target,observer,landmark:0,shownTarget:target-origin,shownObserver:observer-origin,shownLandmark:-origin};
}
function mapY(lat,projection='mercator'){return projection==='equalarea'?Math.sin(lat):Math.log(Math.tan(Math.PI/4+lat/2));}
function patch(centerDegrees,halfSin=.025,width=.45){
 const s=Math.sin(centerDegrees*Math.PI/180),south=Math.asin(s-halfSin),north=Math.asin(s+halfSin);
 return {south,north,width,sphericalArea:width*2*halfSin,mercatorArea:width*(mapY(north)-mapY(south)),equalArea:width*(Math.sin(north)-Math.sin(south)),localFactor:1/(1-s*s)};
}
function globe(lon,lat){return [Math.cos(lat)*Math.cos(lon),Math.cos(lat)*Math.sin(lon),Math.sin(lat)];}
const api={frontierBase,frontierRate,frontier,crossing,aggregate,moving,mapY,patch,globe};
root.CompressionModels=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
