/* Coordinate and forward models. Every time unit is specified by the caller. */
(function(root){
'use strict';
const pi=Math.PI, add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,k)=>a.map(x=>x*k),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm=a=>Math.hypot(...a),polar=(r,t,z=0)=>[r*Math.cos(t),r*Math.sin(t),z];
const mu=.0121505856;
function omega2(x,y,z=0){return x*x+y*y+2*(1-mu)/Math.hypot(x+mu,y,z)+2*mu/Math.hypot(x-1+mu,y,z);}
function eq(x){return x-(1-mu)*(x+mu)/Math.abs(x+mu)**3-mu*(x-1+mu)/Math.abs(x-1+mu)**3;}
function bisectRoot(a,b){let fa=eq(a);for(let i=0;i<70;i++){const m=(a+b)/2;if(eq(m)*fa>0){a=m;fa=eq(a);}else b=m;}return(a+b)/2;}
const libration=[bisectRoot(.1,1-mu-.001),bisectRoot(1-mu+.001,1.8),bisectRoot(-1.8,-mu-.001)];
function contour(C,z=0,n=46){const xmin=-1.45,xmax=1.55,ymin=-1.3,ymax=1.3,dx=(xmax-xmin)/n,dy=(ymax-ymin)/n,grid=Array.from({length:n+1},(_,i)=>Array.from({length:n+1},(_,j)=>omega2(xmin+i*dx,ymin+j*dy,z)-C)),segments=[];
for(let i=0;i<n;i++)for(let j=0;j<n;j++){const vs=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],ps=vs.map(([a,b])=>[xmin+a*dx,ymin+b*dy,z]),f=vs.map(([a,b])=>grid[a][b]);const hits=[];for(let k=0;k<4;k++){let l=(k+1)%4;if((f[k]>=0)!==(f[l]>=0)){const t=f[k]/(f[k]-f[l]);hits.push(add(ps[k],mul(sub(ps[l],ps[k]),t)));}}if(hits.length===2)segments.push(hits);else if(hits.length===4){const center=omega2(xmin+(i+.5)*dx,ymin+(j+.5)*dy,z)-C;const pairing=(center>=0)===(f[0]>=0)?[[0,1],[2,3]]:[[0,3],[1,2]];pairing.forEach(([a,b])=>segments.push([hits[a],hits[b]]));}}
return segments;}
function flyby(b,v=1,V=1){const a=1/(v*v),e=Math.sqrt(1+(b*v*v)**2),delta=2*Math.atan(1/(b*v*v)),vi=[v/e,v*Math.sqrt(e*e-1)/e,0],vo=[-v/e,vi[1],0],vp=[V,0,0];return{a,e,delta,rp:a*(e-1),vi,vo,vp,hin:add(vi,vp),hout:add(vo,vp),energy:(norm(add(vo,vp))**2-norm(add(vi,vp))**2)/2};}
function flyPoint(b,H,v=1,V=1){const f=flyby(b,v,V),t=f.a/v*(f.e*Math.sinh(H)-H);return{p:[f.a*(f.e-Math.cosh(H))+V*t,f.a*Math.sqrt(f.e*f.e-1)*Math.sinh(H),0],relative:[f.a*(f.e-Math.cosh(H)),f.a*Math.sqrt(f.e*f.e-1)*Math.sinh(H),0],t};}
function flyH(b,progress,v=1){const f=flyby(b,v,0),mean=(2*progress-1)*(f.e*Math.sinh(2)-2);let H=4*progress-2;for(let i=0;i<20;i++)H-=(f.e*Math.sinh(H)-H-mean)/(f.e*Math.cosh(H)-1);return H;}
function moon(t,inc,node){const n=node*pi/180,I=inc*pi/180,u=t*2*pi,p=[Math.cos(u),Math.sin(u)*Math.cos(I),Math.sin(u)*Math.sin(I)];return[Math.cos(n)*p[0]-Math.sin(n)*p[1],Math.sin(n)*p[0]+Math.cos(n)*p[1],p[2]];}
function moonLight(p){return (1-p[0]/norm(p))/2;}
function circleOverlap(d,R,r){if(d>=R+r)return 0;if(d<=Math.abs(R-r))return pi*Math.min(R,r)**2;const a=Math.acos((d*d+R*R-r*r)/(2*d*R)),b=Math.acos((d*d+r*r-R*R)/(2*d*r));return R*R*a+r*r*b-.5*Math.sqrt(Math.max(0,(-d+R+r)*(d+R-r)*(d-R+r)*(d+R+r)));}
function transit(phase,inc,r){const t=2*pi*phase,I=inc*pi/180,p=[5*Math.cos(t),5*Math.sin(t)*Math.cos(I),5*Math.sin(t)*Math.sin(I)],d=Math.hypot(p[0],p[1]),flux=p[2]>0?1-circleOverlap(d,1,r)/pi:1;return{p,d,flux,rv:-Math.sin(I)*Math.cos(t)};}
function star(row){const d=1000/row.parallax,a=row.ra*pi/180,b=row.dec*pi/180;return{p:[d*Math.cos(b)*Math.cos(a),d*Math.cos(b)*Math.sin(a),d*Math.sin(b)],d,sd:1000*row.parallax_error/row.parallax**2,MG:row.phot_g_mean_mag+5*Math.log10(row.parallax)-10};}
function lens(beta,E=1){if(Math.abs(beta)<1e-10)return{ring:true,r:E};const q=Math.sqrt(beta*beta+4*E*E);return{ring:false,images:[(beta+q)/2,(beta-q)/2]};}
function transfer(r=1.52){const a=(1+r)/2,t=pi*Math.sqrt(a*a*a),n=1/Math.sqrt(r**3),phi=pi-n*t,v1=Math.sqrt(2-1/a),v2=Math.sqrt(2/r-1/a);return{a,t,n,phi,dv1:v1-1,dv2:Math.sqrt(1/r)-v2,e:(r-1)/(r+1)};}
function transferPoint(f,r=1.52){const m=pi*f,q=transfer(r);let E=m;for(let i=0;i<12;i++)E-=(E-q.e*Math.sin(E)-m)/(1-q.e*Math.cos(E));return[q.a*(Math.cos(E)-q.e),q.a*Math.sqrt(1-q.e*q.e)*Math.sin(E),0];}
const people=[{a:[-1.4,-.45],b:[1.15,.65],t0:0,t1:60,color:'#62b6e9'},{a:[.1,1.25],b:[-.15,-1.1],t0:5,t1:55,color:'#efac62'}];
function accessible(p,t,v,person){return t>=person.t0&&t<=person.t1&&norm(sub(p,person.a))<=v*(t-person.t0)+1e-9&&norm(sub(p,person.b))<=v*(person.t1-t)+1e-9;}
function diskMeeting(t,v){if(!people.every(a=>t>=a.t0&&t<=a.t1))return false;const ds=people.flatMap(a=>[{c:a.a,r:v*(t-a.t0)},{c:a.b,r:v*(a.t1-t)}]).concat([{c:[0,0],r:.9}]),candidates=ds.map(d=>d.c);for(let i=0;i<ds.length;i++)for(let j=i+1;j<ds.length;j++){const A=ds[i],B=ds[j],d=norm(sub(B.c,A.c));if(d<1e-12||d>A.r+B.r+1e-10||d<Math.abs(A.r-B.r)-1e-10)continue;const u=mul(sub(B.c,A.c),1/d),x=(d*d+A.r*A.r-B.r*B.r)/(2*d),h=Math.sqrt(Math.max(0,A.r*A.r-x*x)),mid=add(A.c,mul(u,x));for(const sign of [-1,1])candidates.push(add(mid,[-sign*h*u[1],sign*h*u[0]]));}return candidates.some(p=>ds.every(d=>norm(sub(p,d.c))<=d.r+1e-9));}
function meeting(t,v,remote=false,open=true){let points=[];for(let x=-2;x<=2.001;x+=.08)for(let y=-2;y<=2.001;y+=.08){const p=[x,y];if(people.every(a=>accessible(p,t,v,a))&&open&&t>=20&&t<=40&&norm(p)<=.9)points.push(p);}const each=people.map(a=>norm(sub(a.a,a.b))<=v*(a.t1-a.t0));return{points,possible:open&&t>=20&&t<=40&&(remote?each.every(Boolean):diskMeeting(t,v))};}
// A bounded segment / oriented box test. Excludes the observer and target endpoints.
function boxHit(A,B,box){const c=Math.cos(box.angle||0),s=Math.sin(box.angle||0),rot=p=>{const v=sub(p,box.center);return[c*v[0]+s*v[1],-s*v[0]+c*v[1],v[2]];},a=rot(A),b=rot(B),d=sub(b,a);let lo=1e-6,hi=1-1e-6;for(let k=0;k<3;k++){if(Math.abs(d[k])<1e-12){if(Math.abs(a[k])>box.half[k])return false;continue;}let u=(-box.half[k]-a[k])/d[k],v=(box.half[k]-a[k])/d[k];if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v);if(lo>hi)return false;}return true;}
function building(){const walls=[];for(let k=0;k<3;k++)for(let j=0;j<24;j++){const t=j*2*pi/24;walls.push({center:polar(10,t,k*3+1.35),half:[2,.06,1.35],angle:t});}return walls;}
function annulusHit(A,B,z,rin,rout){const dz=B[2]-A[2];if(Math.abs(dz)<1e-10)return false;const t=(z-A[2])/dz;if(t<=1e-6||t>=1-1e-6)return false;const q=add(A,mul(sub(B,A),t)),r=Math.hypot(q[0],q[1]);return r>rin&&r<rout;}
function visible(A,B,walls=true,floors=true){if(walls&&building().some(w=>boxHit(A,B,w)))return false;if(floors)for(const z of [3,6])if(annulusHit(A,B,z,7,12)||annulusHit(A,B,z,2,4.5))return false;return true;}
const api={pi,add,sub,mul,dot,norm,polar,mu,omega2,libration,contour,flyby,flyPoint,flyH,moon,moonLight,circleOverlap,transit,star,lens,transfer,transferPoint,people,accessible,meeting,boxHit,building,annulusHit,visible};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AstronomySocial=api;
})(typeof window!=='undefined'?window:globalThis);
