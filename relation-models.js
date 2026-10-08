(function(root){
  'use strict';
  const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0), sub=(a,b)=>a.map((x,i)=>x-b[i]),add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,s)=>a.map(x=>x*s);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>mul(a,1/Math.hypot(...a));
  const vertices=[[-1.2,-.6,.6],[1.2,-.6,.6],[0,1,.9],[0,.2,-1]];
  function basis(degrees){const angle=degrees*Math.PI/180,n=norm([Math.cos(angle),Math.sin(angle),.45]),u=[-Math.sin(angle),Math.cos(angle),0];return {n,u,v:cross(n,u)};}
  function project(p,n,offset){return sub(p,mul(n,dot(p,n)-offset));}
  function section(points,n,offset){
    const result=[];const include=p=>{if(!result.some(q=>Math.hypot(...sub(p,q))<1e-7))result.push(p);};
    for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
      const a=points[i],b=points[j],da=dot(a,n)-offset,db=dot(b,n)-offset;
      if(Math.abs(da)<1e-8)include(a);if(Math.abs(db)<1e-8)include(b);
      if(da*db<0)include(add(a,mul(sub(b,a),da/(da-db))));
    }
    if(result.length>2){const c=mul(result.reduce((s,p)=>add(s,p),[0,0,0]),1/result.length),u=norm(sub(result[0],c)),v=cross(n,u);result.sort((a,b)=>Math.atan2(dot(sub(a,c),v),dot(sub(a,c),u))-Math.atan2(dot(sub(b,c),v),dot(sub(b,c),u)));}return result;
  }
  class GoBoard {
    constructor(size=19){this.size=size;this.board=Array(size*size).fill(0);this.history=new Set([this.board.join('')]);this.captures=[0,0];}
    coordinate(move){if(move.toLowerCase()==='pass')return -1;const letters='ABCDEFGHJKLMNOPQRST';const col=letters.indexOf(move[0]);const row=Number(move.slice(1))-1;if(col<0||col>=this.size||row<0||row>=this.size)throw Error('Invalid coordinate '+move);return row*this.size+col;}
    neighbors(i){const s=this.size,x=i%s,y=Math.floor(i/s),r=[];if(x)r.push(i-1);if(x<s-1)r.push(i+1);if(y)r.push(i-s);if(y<s-1)r.push(i+s);return r;}
    group(i,board=this.board){const color=board[i],stones=new Set([i]),liberties=new Set(),stack=[i];while(stack.length){for(const j of this.neighbors(stack.pop())){if(!board[j])liberties.add(j);else if(board[j]===color&&!stones.has(j)){stones.add(j);stack.push(j);}}}return {stones:[...stones],liberties:liberties.size};}
    play(color,move){const c=color==='B'?1:color==='W'?2:0;if(!c)throw Error('Invalid player');const i=this.coordinate(move);if(i<0)return {board:this.board.slice(),captures:this.captures.slice(),last:-1};if(this.board[i])throw Error('Occupied '+move);const next=this.board.slice();next[i]=c;let removed=0;for(const j of this.neighbors(i)){if(next[j]&&next[j]!==c){const g=this.group(j,next);if(!g.liberties)for(const k of g.stones){next[k]=0;removed++;}}}if(!this.group(i,next).liberties)throw Error('Suicide '+move);const key=next.join('');if(this.history.has(key))throw Error('Positional superko '+move);this.history.add(key);this.board=next;this.captures[c-1]+=removed;return {board:next.slice(),captures:this.captures.slice(),last:i};}
  }
  const api={dot,sub,add,mul,cross,basis,vertices,project,section,GoBoard};root.RelationModels=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
