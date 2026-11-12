(function (root) {
  'use strict';
  const shapes = [ [[0,0]], [[0,0],[0,1]], [[0,0],[0,1],[0,2]], [[0,0],[0,1],[0,2],[0,3]], [[0,0],[0,1],[0,2],[0,3],[0,4]], [[0,0],[0,1],[1,0],[1,1]], [[0,0],[1,0],[2,0],[2,1]], [[0,1],[1,1],[2,0],[2,1]], [[0,0],[0,1],[0,2],[1,1]], [[0,1],[0,2],[1,0],[1,1]], [[0,0],[0,1],[1,1],[1,2]], [[0,0],[1,0],[1,1]], [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]], [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]] ];
  // Larger corners, branches, cups, stairs, crosses, and their mirrored variants.
  const extraPatterns = [
    ['###','.#.','.#.'], // T
    ['#.#','###'], // U
    ['#..','#..','###'], // V
    ['#..','##.','.##'], // W
    ['.#.','###','.#.'], // Cross
    ['#.', '##', '#.', '#.'], ['.#', '##', '.#', '.#'], // Y
    ['.##','##.','.#.'], ['##.','.##','.#.'], // F
    ['##','##','#.'], ['##','##','.#'], // P
    ['##..','.###'], ['..##','###.'], // Long zigzags
    ['#.', '#.', '#.', '##'], ['.#', '.#', '.#', '##'] // Long corners
  ];
  for(const pattern of extraPatterns) shapes.push(pattern.flatMap((row,r)=>[...row].flatMap((cell,c)=>cell==='#'?[[r,c]]:[])));
  function rotate(cells) { const max = Math.max(...cells.map(c=>c[0])); return cells.map(([r,c])=>[c,max-r]); }
  function shapeKey(cells) {
    const keys=[];
    for(let i=0;i<4;i++){
      const minR=Math.min(...cells.map(c=>c[0])),minC=Math.min(...cells.map(c=>c[1]));
      cells=cells.map(([r,c])=>[r-minR,c-minC]);
      keys.push(cells.map(c=>c.join(',')).sort().join(';'));cells=rotate(cells);
    }
    return keys.sort()[0];
  }
  const families=['dot','bar','bar','bar','bar','box','corner','corner','tee','zigzag','zigzag','corner','box','box','tee','cup','corner','zigzag','cross','branch','branch','fork','fork','compact','compact','zigzag','zigzag','corner','corner'];
  const catalog=shapes.map((cells,i)=>({cells,key:shapeKey(cells),family:families[i]}));
  function piece(random=Math.random,tray=[],lastPlayed=null) {
    const held=tray.filter(Boolean).map(p=>catalog.find(s=>s.key===shapeKey(p.cells))).filter(Boolean);
    const forbidden=lastPlayed?shapeKey(lastPlayed.cells):null;
    const candidates=catalog.filter(s=>s.key!==forbidden).map(s=>({shape:s,weight:held.some(p=>p.key===s.key)?.015:held.some(p=>p.family===s.family)?.08:1}));
    let draw=random()*candidates.reduce((sum,c)=>sum+c.weight,0),chosen=candidates[candidates.length-1].shape;
    for(const candidate of candidates){draw-=candidate.weight;if(draw<0){chosen=candidate.shape;break;}}
    let cells=chosen.cells.map(c=>[...c]);for(let i=Math.floor(random()*4);i>0;i--)cells=rotate(cells);
    const colors=[1,2,3,4,5,6].filter(color=>!tray.some(p=>p&&p.color===color));
    return {cells,color:colors[Math.floor(random()*colors.length)]};
  }
  function refill(s) { for(let i=0;i<s.tray.length;i++)if(!s.tray[i])s.tray[i]=piece(Math.random,s.tray); }
  function fresh(size) { const s={size,board:Array.from({length:size},()=>Array(size).fill(0)),tray:[null,null,null],score:0,lines:0,combo:0,moves:0,over:false,recorded:false};refill(s);return s; }
  function fits(board,cells,r,c) { return cells.every(([dr,dc])=>r+dr>=0&&c+dc>=0&&r+dr<board.length&&c+dc<board.length&&!board[r+dr][c+dc]); }
  function hasMove(s) { return s.tray.some(p=>{if(!p)return false;let cells=p.cells;for(let t=0;t<4;t++){for(let r=0;r<s.size;r++)for(let c=0;c<s.size;c++)if(fits(s.board,cells,r,c))return true;cells=rotate(cells);}return false;}); }
  function place(s,index,r,c) {
    const p=s.tray[index]; if(s.over||!p||!fits(s.board,p.cells,r,c))return null;
    p.cells.forEach(([dr,dc])=>s.board[r+dr][c+dc]=p.color);
    const rows=[],cols=[],cleared=[];
    for(let i=0;i<s.size;i++){if(s.board[i].every(Boolean))rows.push(i);if(s.board.every(row=>row[i]))cols.push(i);}
    for(let y=0;y<s.size;y++)for(let x=0;x<s.size;x++)if(rows.includes(y)||cols.includes(x)){cleared.push([y,x]);s.board[y][x]=0;}
    const count=rows.length+cols.length;s.combo=count?s.combo+1:0;
    const gained=p.cells.length*10+count*100*Math.max(1,count)+Math.max(0,s.combo-1)*50;
    s.score+=gained;s.lines+=count;s.moves++;s.tray[index]=null;
    s.tray[index]=piece(Math.random,s.tray,p);
    refill(s);
    s.over=!hasMove(s);return {gained,count,cleared};
  }
  function valid(s,size) { return !!s&&s.size===size&&Array.isArray(s.board)&&s.board.length===size&&s.board.every(row=>Array.isArray(row)&&row.length===size&&row.every(v=>Number.isInteger(v)&&v>=0&&v<=6))&&['score','lines','combo','moves'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0)&&typeof s.over==='boolean'&&typeof s.recorded==='boolean'&&Array.isArray(s.tray)&&s.tray.length===3&&s.tray.some(Boolean)&&s.tray.every(p=>p===null||(p&&Number.isInteger(p.color)&&p.color>=1&&p.color<=6&&Array.isArray(p.cells)&&p.cells.length>0&&p.cells.length<=9&&p.cells.every(c=>Array.isArray(c)&&c.length===2&&c.every(v=>Number.isInteger(v)&&v>=0&&v<5))&&new Set(p.cells.map(c=>c.join(','))).size===p.cells.length)); }
  const api={rotate,fresh,fits,hasMove,place,valid,refill,piece,shapeKey,shapeCount:shapes.length};if(typeof module!=='undefined')module.exports=api;else root.Blocks=api;
})(typeof globalThis!=='undefined'?globalThis:this);
