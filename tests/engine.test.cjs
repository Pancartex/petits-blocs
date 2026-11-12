const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine.js');
function catalogPiece(index){let call=0;return E.piece(()=>call++===0?(index+.5)/E.shapeCount:0);}
test('saved games restore board, piece orientations, score, and progress for all sizes',()=>{
 const saved={size:10,games:{},scores:{},bests:{},sound:false,theme:'dark'};
 for(const size of [8,10,12]){
   const s=E.fresh(size);
   s.tray[0]=catalogPiece(6);assert.ok(E.place(s,0,1,2));
   s.tray[1].cells=E.rotate(s.tray[1].cells);
   s.tray[2].cells=E.rotate(E.rotate(s.tray[2].cells));
   saved.games[size]=s;
 }
 // localStorage stores the JSON string; a fresh page parses it and validates each game.
 const reopened=JSON.parse(JSON.stringify(saved));assert.equal(reopened.size,10);
 for(const size of [8,10,12]){
   const restored=reopened.games[size];assert.ok(E.valid(restored,size));
   E.refill(restored);restored.over=!E.hasMove(restored);
   assert.deepEqual(restored,saved.games[size]);
   assert.ok(restored.score>0);assert.ok(restored.board.some(row=>row.some(Boolean)));
 }
});
test('replacement excludes the played shape in every orientation',()=>{
 for(let i=0;i<E.shapeCount;i++){
   let played=catalogPiece(i);
   for(let turn=0;turn<4;turn++){
     for(let j=0;j<100;j++){
       let call=0;const next=E.piece(()=>call++===0?(j+.5)/100:0,[catalogPiece(5),catalogPiece(8)],played);
       assert.notEqual(E.shapeKey(next.cells),E.shapeKey(played.cells));
     }
     played={...played,cells:E.rotate(played.cells)};
   }
 }
});
test('tray duplicates and similar bars are strongly downweighted; colors stay distinct',()=>{
 const held=[catalogPiece(3),catalogPiece(5)];held[0].color=1;held[1].color=2;
 let duplicates=0,bars=0;
 for(let j=0;j<4000;j++){
   let call=0;const p=E.piece(()=>call++===0?(j+.5)/4000:0,held);
   if(held.some(h=>E.shapeKey(h.cells)===E.shapeKey(p.cells)))duplicates++;
   if(p.cells.length>1&&(p.cells.every(c=>c[0]===0)||p.cells.every(c=>c[1]===0)))bars++;
   assert.ok(!held.some(h=>h.color===p.color));
 }
 assert.ok(duplicates/4000<.005,`duplicate rate ${duplicates/4000}`);
 assert.ok(bars/4000<.025,`bar-family rate ${bars/4000}`);
});
test('placement uses the non-repeating generator',()=>{
 for(let i=0;i<E.shapeCount;i++){
   const s=E.fresh(8);s.tray[0]=catalogPiece(i);const key=E.shapeKey(s.tray[0].cells);
   assert.ok(E.place(s,0,0,0));assert.notEqual(E.shapeKey(s.tray[0].cells),key);
 }
});
test('one rotation turns an asymmetric piece exactly 90 degrees clockwise',()=>{const cells=[[0,0],[1,0],[2,0],[2,1]];assert.deepEqual(E.rotate(cells),[[0,2],[0,1],[0,0],[1,0]]);assert.deepEqual(cells,[[0,0],[1,0],[2,0],[2,1]]);});
test('all board sizes start playable and validate',()=>{for(const n of [8,10,12]){const s=E.fresh(n);assert.equal(s.board.length,n);assert.ok(E.valid(s,n));assert.ok(E.hasMove(s));}});
test('collision and out-of-bounds placements leave state untouched',()=>{const s=E.fresh(8);s.tray[0]={cells:[[0,0],[0,1]],color:1};s.board[0][0]=2;const before=JSON.stringify(s);assert.equal(E.place(s,0,0,0),null);assert.equal(E.place(s,0,7,7),null);assert.equal(JSON.stringify(s),before);});
test('crossing row and column clear simultaneously, intersection counted once',()=>{for(const n of [8,10,12]){const s=E.fresh(n);for(let i=1;i<n;i++){s.board[0][i]=1;s.board[i][0]=1;}s.tray[0]={cells:[[0,0]],color:2};const result=E.place(s,0,0,0);assert.equal(result.count,2);assert.equal(result.cleared.length,n*2-1);assert.equal(s.score,410);assert.ok(s.board.every(row=>row.every(x=>!x)));}});
test('rotation prevents premature game over',()=>{const s=E.fresh(8);s.board.forEach(row=>row.fill(1));for(let r=0;r<3;r++)s.board[r][0]=0;s.tray=[{cells:[[0,0],[0,1],[0,2]],color:1},null,null];assert.ok(!E.fits(s.board,s.tray[0].cells,0,0));assert.ok(E.hasMove(s));s.board[1][0]=1;assert.ok(!E.hasMove(s));});
test('four rotations restore shape and last piece refreshes tray',()=>{let cells=[[0,0],[1,0],[1,1]];const original=JSON.stringify(cells);for(let i=0;i<4;i++)cells=E.rotate(cells);assert.equal(JSON.stringify(cells),original);const s=E.fresh(8);s.tray=[{cells:[[0,0]],color:1},null,null];E.place(s,0,0,0);assert.ok(s.tray.every(Boolean));});
test('clearing streak scores and resets on non-clear',()=>{const s=E.fresh(8);for(let turn=0;turn<2;turn++){for(let c=1;c<8;c++)s.board[0][c]=1;s.tray[0]={cells:[[0,0]],color:1};const result=E.place(s,0,0,0);assert.equal(result.gained,110+50*turn);}s.tray[0]={cells:[[0,0]],color:1};E.place(s,0,0,0);assert.equal(s.combo,0);});
test('invalid saved states are rejected',()=>{const s=E.fresh(8);assert.ok(!E.valid(s,10));s.board[0][0]=99;assert.ok(!E.valid(s,8));s.board[0][0]=0;s.tray[0].cells=[[0,0],[0,0]];assert.ok(!E.valid(s,8));});
test('every move refills only the played slot immediately',()=>{for(const size of [8,10,12]){const s=E.fresh(size);s.tray[1]={cells:[[0,0]],color:1};const before=[...s.tray];assert.ok(E.place(s,1,0,0));assert.ok(s.tray.every(Boolean));assert.notEqual(s.tray[1],before[1]);assert.equal(s.tray[0],before[0]);assert.equal(s.tray[2],before[2]);assert.ok(E.valid(s,size));}});
test('older partial trays refill without changing the board, score, or remaining pieces',()=>{const s=E.fresh(8);s.score=120;s.board[3][3]=2;const kept=s.tray[1];s.tray[0]=null;s.tray[2]=null;E.refill(s);assert.ok(s.tray.every(Boolean));assert.equal(s.tray[1],kept);assert.equal(s.score,120);assert.equal(s.board[3][3],2);});
test('expanded catalog has distinct, connected, valid shapes in every rotation',()=>{
 const seen=new Set();assert.ok(E.shapeCount>=28);
 for(let i=0;i<E.shapeCount;i++){
   let call=0;const p=E.piece(()=>call++===0?(i+.5)/E.shapeCount:0);
   const keys=[];
   for(let rotation=0;rotation<4;rotation++){
     const s=E.fresh(8);s.tray[0]=p;assert.ok(E.valid(s,8));assert.ok(E.fits(s.board,p.cells,0,0));
     keys.push(p.cells.map(c=>c.join(',')).sort().join(';'));
     const connected=new Set([p.cells[0].join(',')]);let previous;
     do{previous=connected.size;for(const [r,c]of p.cells)if([[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(n=>connected.has(n.join(','))))connected.add([r,c].join(','));}while(previous!==connected.size);
     assert.equal(connected.size,p.cells.length);p.cells=E.rotate(p.cells);
   }
   const canonical=keys.sort()[0];assert.ok(!seen.has(canonical),'duplicate rotational shape '+i);seen.add(canonical);
 }
});
