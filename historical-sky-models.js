(function(root){
 'use strict';
 const rad=Math.PI/180,add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),scale=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>Math.sqrt(dot(a,a)),unit=a=>scale(a,1/norm(a));
 const documents=[
  {id:'grammar',year:1660,field:0,short:'일반·이성 문법',author:'Arnauld · Lancelot',title:'Grammaire générale et raisonnée',note:'1660년 출판. 일반 문법의 분석 계열로 선택한 서지 기록.'},
  {id:'linnaeus',year:1735,field:1,short:'자연의 체계',author:'Linnaeus',title:'Systema Naturae',note:'1735년 초판. 이후 판본의 명명법을 이 초판에 소급하지 않는다.'},
  {id:'buffon',year:1749,field:1,short:'자연사',author:'Buffon · Daubenton',title:'Histoire naturelle',note:'1749년 출판 시작. 단일 완결권의 연도가 아니라 여러 권으로 이어지는 저술의 시작.'},
  {id:'cantillon',year:1755,field:2,short:'상업의 본성',author:'Cantillon',title:'Essai sur la nature du commerce en général',note:'1755년 출판. 집필 시점과 출판 시점은 다를 수 있다.'},
  {id:'quesnay',year:1758,field:2,short:'경제표',author:'Quesnay',title:'Tableau économique',note:'1758년 첫 경제표. 1758–1759년에 여러 판본이 있으며 연결된 공개 자료는 그 판본 차이를 설명한다.'}
 ];
 const fields=['일반 문법','자연사','부의 분석'];
 function group(d,mode,boundary){return mode==='field'?d.field:mode==='period'?(d.year<boundary?0:1):documents.indexOf(d);}
 function groups(mode,boundary){return documents.map(d=>({...d,group:group(d,mode,boundary)}));}
 function decimal(date){let d=new Date(date+'T00:00:00Z'),y=d.getUTCFullYear(),s=Date.UTC(y,0,1),e=Date.UTC(y+1,0,1);return y+(d.getTime()-s)/(e-s);}
 const events=[['1815-06-15','벨기에 진입'],['1815-06-16','리니·카트르브라'],['1815-06-17','워털루로 후퇴'],['1815-06-18','워털루 전투'],['1815-07-07','파리 점령']].map(([date,title])=>({date,title,year:decimal(date)}));
 const phases=[{lo:1791,hi:1817,title:'유럽 물가 상승 국면',sign:1},{lo:1817,hi:1852,title:'유럽 물가 하락 국면',sign:-1}];
 function bins(width,origin=1791){let b={};for(let e of events){let k=Math.floor((e.year-origin)/width);if(!b[k])b[k]={lo:origin+k*width,count:0,events:[]};b[k].count++;b[k].events.push(e);}return Object.values(b).sort((a,b)=>a.lo-b.lo);}
 function visibleEvents(center,width){return events.filter(e=>Math.abs(e.year-center)<=width/2);}
 function statement(example,context,scaleName){
  if(example==='keyboard')return {form:'A Z E R T',left:'타자기 자판',right:'타자 교본',count:context==='both'?2:1,conditions:context==='keyboard'?['타이핑 장치','키의 공간 배열','입력하는 사용자','문자를 입력하기']:context==='manual'?['교육용 교본','배열을 설명하는 문장','설명자의 위치','프랑스 자판 순서']:['타자기 자판','타자 교본','서로 다른 사용 목적','배열 / 배열에 관한 설명'],verdict:context==='both'?'같은 배열 · 다른 기능':context==='keyboard'?'자판의 배열 자체는 진술이 아니다':'교본에서 배열을 서술하면 진술이 된다'};
  return {form:'종은 진화한다',left:'Darwin의 논의',right:'Simpson의 논의',count:scaleName==='broad'?1:2,conditions:['담론의 역사적 맥락','주변의 다른 진술','사용·반복의 조건','선택한 분석 규모'],verdict:scaleName==='broad'?'큰 역사 구분: 같은 진술로 묶기':'세밀한 담론 구분: 다른 진술로 분석'};
 }
 function rayDisk(o,d,R=1,h=.01){
  let A=d[0]**2+d[1]**2,B=2*(o[0]*d[0]+o[1]*d[1]),C=o[0]**2+o[1]**2-R*R,lo=-Infinity,hi=Infinity;
  if(A<1e-15){if(C>0)return null;}else{let q=B*B-4*A*C;if(q<0)return null;let s=Math.sqrt(q);lo=(-B-s)/(2*A);hi=(-B+s)/(2*A);}
  if(Math.abs(d[2])<1e-15){if(Math.abs(o[2])>h)return null;}else{let a=(-h-o[2])/d[2],b=(h-o[2])/d[2];lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}
  lo=Math.max(0,lo);return hi>lo?[lo,hi]:null;
 }
 function rayBulge(o,d){let radii=[.18,.12,.08],a=o.map((v,i)=>v/radii[i]),b=d.map((v,i)=>v/radii[i]),A=dot(b,b),B=2*dot(a,b),C=dot(a,a)-1,q=B*B-4*A*C;if(q<0)return null;let s=Math.sqrt(q),lo=Math.max(0,(-B-s)/(2*A)),hi=(-B+s)/(2*A);return hi>lo?[lo,hi]:null;}
 function opticalLength(s,interval){return interval?Math.max(0,Math.min(s,interval[1])-interval[0]):0;}
 function integrate(interval,disk,alpha){
  if(!interval)return 0;let [lo,hi]=interval,cuts=[lo,hi];if(disk)for(let b of disk)if(b>lo&&b<hi)cuts.push(b);cuts.sort((a,b)=>a-b);let I=0;
  for(let i=1;i<cuts.length;i++){let a=cuts[i-1],b=cuts[i],mid=(a+b)/2,trans=Math.exp(-alpha*opticalLength(a,disk));I+=disk&&mid>=disk[0]&&mid<=disk[1]&&alpha>1e-12?trans*(-Math.expm1(-alpha*(b-a)))/alpha:trans*(b-a);}
  return I;
 }
 function ray(l,b){l*=rad;b*=rad;return [-Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)];}
 function bearing(d){return [Math.atan2(d[1],-d[0])/rad,Math.asin(d[2]/norm(d))/rad];}
 function radiance(o,d,alpha=0){let disk=rayDisk(o,d),bulge=rayBulge(o,d);return {disk,bulge,I:integrate(disk,disk,alpha)+2*integrate(bulge,disk,alpha)};}
 function perspective(l,b,fov,x,y,aspect){let f=ray(l,b),right=[Math.sin(l*rad),Math.cos(l*rad),0],up=[Math.sin(b*rad)*Math.cos(l*rad),-Math.sin(b*rad)*Math.sin(l*rad),Math.cos(b*rad)],t=Math.tan(fov*rad/2);return unit(add(f,add(scale(right,x*t),scale(up,y*t/aspect))));}
 function observer(name){return name==='solar'?[.52,0,0]:name==='center'?[0,0,0]:[.52,0,.2];}
 function samples(){let out=[];for(let i=0;i<1700;i++){let r=Math.sqrt((i+.5)/1700),t=i*2.399963229728653;out.push({p:[r*Math.cos(t),r*Math.sin(t),.01*(2*((i*137%1700)/1699)-1)],bulge:false});}for(let i=0;i<320;i++){let z=1-2*(i+.5)/320,t=i*2.399963229728653,r=Math.cbrt((i*73%320+.5)/320);out.push({p:[.18*r*Math.sqrt(1-z*z)*Math.cos(t),.12*r*Math.sqrt(1-z*z)*Math.sin(t),.08*r*z],bulge:true});}return out;}
 const api={rad,add,sub,scale,dot,norm,unit,documents,fields,groups,decimal,events,phases,bins,visibleEvents,statement,rayDisk,rayBulge,opticalLength,integrate,ray,bearing,radiance,perspective,observer,samples};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.HistorySky=api;
})(typeof window==='object'?window:globalThis);
