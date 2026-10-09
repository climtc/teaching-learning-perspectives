/* Geographic corridors and synthetic timetable calculations. No historic timetable is implied. */
(function(root,factory){const M=factory();if(typeof module==='object'&&module.exports)module.exports=M;else root.EuropeRailway=M;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function km(a,b){const rad=Math.PI/180,p=a.lat*rad,q=b.lat*rad,d=(b.lon-a.lon)*rad,f=(b.lat-a.lat)*rad;const h=Math.sin(f/2)**2+Math.cos(p)*Math.cos(q)*Math.sin(d/2)**2;return 6371*2*Math.asin(Math.sqrt(clamp(h,0,1)));}
 function compile(D){const nodes=Object.fromEntries(D.nodes.map(n=>[n.id,n])),reserved={},trains=[];
  for(const [i,route]of D.routes.entries()){
   const times=[0];for(let j=1;j<route.length;j++)times.push(times[j-1]+Math.ceil(km(nodes[route[j-1]],nodes[route[j]])/D.model_speed_kmh*60)+D.dwell_minutes);
   let departure=i*6;
   // Each node represents a single shared switch resource. Place all visits at least clearance minutes apart.
   for(let step=0;step<10000;step++){let next=departure;for(let j=0;j<route.length;j++)for(const old of reserved[route[j]]||[]){const t=departure+times[j];if(Math.abs(t-old)<D.clearance-1e-8)next=Math.max(next,old+D.clearance-times[j]);}if(next===departure)break;departure=next;if(step===9999)throw Error('Schedule did not converge');}
   const events=route.map((node,j)=>({node,time:departure+times[j]}));for(const e of events)(reserved[e.node]??=[]).push(e.time);
   trains.push({id:i+1,route,events,departure,duration:times.at(-1),origin:route[0],destination:route.at(-1)});
  }
  return {nodes,trains,clearance:D.clearance,horizon:Math.ceil((Math.max(...trains.map(t=>t.events.at(-1).time))+150)/60)*60};
 }
 function clockOffsets(C,amplitude,aligned=false){return Object.fromEntries(Object.keys(C.nodes).map((id,i)=>[id,(aligned||id==='Frankfurt')?0:amplitude*Math.sin((i+1)*2.37)]));}
 function scenario(C,{amplitude=20,aligned=false,count=24,unsafe=false}={}){
  const offsets=clockOffsets(C,amplitude,aligned),selected=C.trains.slice(0,count),changes={};
  if(unsafe){const visits=selected.flatMap(t=>t.events.filter(e=>e.node==='Frankfurt').map(e=>({id:t.id,time:e.time}))).sort((a,b)=>a.time-b.time);if(visits.length>1){let pair=[visits[0],visits[1]];for(let i=1;i<visits.length;i++)if(visits[i].time-visits[i-1].time<pair[1].time-pair[0].time)pair=[visits[i-1],visits[i]];changes[pair[0].id]=pair[1].time-pair[0].time;}}
  const trains=selected.map(t=>{const shift=(changes[t.id]||0)-offsets[t.origin];return {...t,planned:t.events.map(e=>({...e,time:e.time+(changes[t.id]||0)})),events:t.events.map(e=>({...e,time:e.time+shift})),actualDeparture:t.departure+shift,clockError:offsets[t.origin]};});
  const byNode={};for(const t of trains)for(const e of t.events)(byNode[e.node]??=[]).push({...e,train:t.id});
  const conflicts=[];for(const [node,list]of Object.entries(byNode)){list.sort((a,b)=>a.time-b.time);for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length&&list[j].time-list[i].time<C.clearance-1e-8;j++)conflicts.push({node,a:list[i].train,b:list[j].train,from:list[j].time-C.clearance/2,to:list[i].time+C.clearance/2,time:(list[i].time+list[j].time)/2,gap:list[j].time-list[i].time});}
  conflicts.sort((a,b)=>a.time-b.time);return {trains,offsets,byNode,conflicts,horizon:C.horizon,clearance:C.clearance};
 }
 function position(t,time){if(time<t.events[0].time)return {node:t.origin,active:false,finished:false};if(time>t.events.at(-1).time)return {node:t.destination,active:false,finished:true};for(let j=1;j<t.events.length;j++)if(time<=t.events[j].time){const a=t.events[j-1],b=t.events[j];return {from:a.node,to:b.node,f:(time-a.time)/(b.time-a.time),active:true};}return {node:t.destination,active:false,finished:true};}
 function sync(offset,outbound=0.4,inbound=outbound){const receive=outbound+offset,returned=outbound+inbound,target=returned/2,correction=target-receive;return {receive,returned,target,correction,residual:offset+correction};}
 function timeText(min){let absolute=Math.round(360+min),day=Math.floor(absolute/1440);absolute=((absolute%1440)+1440)%1440;return (day>0?`+${day}일 `:day<0?`${day}일 `:'')+String(Math.floor(absolute/60)).padStart(2,'0')+':'+String(absolute%60).padStart(2,'0');}
 return {clamp,km,compile,clockOffsets,scenario,position,sync,timeText};
});
