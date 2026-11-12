'use strict';
const $=s=>document.querySelector(s), KEY='little-blocks.v1';
let storageOK=true,data={size:8,games:{},scores:{},bests:{},sound:false};
try { const d=JSON.parse(localStorage.getItem(KEY));if(d&&[8,10,12].includes(d.size)&&d.games&&d.scores&&d.bests){data=d;data.sound=!!d.sound;} }catch(e){storageOK=false;}
let size=data.size,state,selected=-1,cursor=[0,0],hover=null,drag=null,suppressClick=false,audioCtx;
const board=$('#board'),tray=$('#tray'),dialog=$('#dialog');
function save(){data.games[size]=state;data.size=size;try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){storageOK=false;}$('#save-label').textContent=storageOK?'Sauvegardé sur cet appareil':'Sauvegarde indisponible ici';}
function best(){return Math.max(Number(data.bests[size])||0,...history().map(x=>x.score),state.score);}
function history(){return Array.isArray(data.scores[size])?data.scores[size].filter(x=>x&&Number.isFinite(x.score)&&typeof x.date==='string').slice(0,10):[];}
function record(){if(state.recorded||!state.moves)return;data.scores[size]=[...history(),{score:state.score,lines:state.lines,date:new Date().toISOString()}].sort((a,b)=>b.score-a.score).slice(0,10);state.recorded=true;}
function enter(n){if(state)save();size=n;state=Blocks.valid(data.games[n],n)?data.games[n]:Blocks.fresh(n);if(!state.over)Blocks.refill(state);state.over=!Blocks.hasMove(state);selected=-1;hover=null;cursor=[0,0];if(state.over)record();render();save();if(state.over)endDialog();}
function color(n){return `var(--c${n})`;}
function render(){
 board.style.setProperty('--size',size);board.setAttribute('aria-label',`Grille de ${size} sur ${size}. Déplace-toi avec les flèches ; Entrée place le bloc sélectionné.`);board.innerHTML='';
 for(let r=0;r<size;r++)for(let c=0;c<size;c++){const b=document.createElement('button');b.className='cell'+(state.board[r][c]?' filled':'');b.dataset.r=r;b.dataset.c=c;b.style.setProperty('--block',color(state.board[r][c]));b.tabIndex=r===cursor[0]&&c===cursor[1]?0:-1;b.setAttribute('aria-label',`Ligne ${r+1}, colonne ${c+1}, ${state.board[r][c]?'occupée':'vide'}`);board.append(b);}
 tray.innerHTML='';state.tray.forEach((p,i)=>{const b=document.createElement('button');b.className='piece'+(!p?' used':'')+(selected===i?' selected':'');b.dataset.index=i;b.disabled=!p||state.over;b.setAttribute('aria-pressed',selected===i);if(p){const h=Math.max(...p.cells.map(c=>c[0]))+1,w=Math.max(...p.cells.map(c=>c[1]))+1;b.setAttribute('aria-label',`Bloc ${i+1}, ${p.cells.length} cases, ${w} de large sur ${h} de haut. Sélectionne-le, puis place-le ou tourne-le.`);const g=document.createElement('span');g.className='mini-grid';g.style.gridTemplateColumns=`repeat(${w},1fr)`;for(let r=0;r<h;r++)for(let c=0;c<w;c++){const bit=document.createElement('span');bit.className='mini-cell'+(p.cells.some(a=>a[0]===r&&a[1]===c)?'':' blank');bit.style.setProperty('--block',color(p.color));g.append(bit);}b.append(g);}else b.setAttribute('aria-label',`Bloc ${i+1} placé`);tray.append(b);});
 $('#score').textContent=state.score.toLocaleString('fr-FR');$('#best').textContent=best().toLocaleString('fr-FR');$('#lines').textContent=state.lines;$('#combo').textContent=state.combo>1?`${state.combo} coups gagnants de suite ♡`:'Prends ton temps';$('#rotate').disabled=false;
 const rotationLabel=selected<0?'Tourner les trois pièces de 90 degrés vers la droite':'Tourner la pièce sélectionnée de 90 degrés vers la droite';
 $('#rotate').setAttribute('aria-label',rotationLabel);$('#rotate').title=rotationLabel+' (R)';
 $('#rotate span').textContent=selected<0?'Tout tourner 90°':'Tourner 90°';$('#sound').setAttribute('aria-pressed',!!data.sound);$('#sound').setAttribute('aria-label',data.sound?'Couper le son':'Activer le son');document.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.size)===size));preview();
}
function say(text){$('#status').textContent=text;}
function choose(i,toggle=false){if(!state.tray[i]||state.over)return;if(toggle&&selected===i){selected=-1;hover=null;render();say('Pièce désélectionnée. Choisis un autre bloc quand tu veux.');return;}selected=i;render();say('R ou molette pour tourner. Reclique sur le bloc pour le désélectionner.');}
function preview(){board.querySelectorAll('.cell').forEach(b=>{b.classList.remove('preview','invalid','cursor');b.style.setProperty('--block',color(state.board[Number(b.dataset.r)][Number(b.dataset.c)]));});if(!hover||selected<0||!state.tray[selected])return;const p=state.tray[selected],ok=Blocks.fits(state.board,p.cells,...hover);p.cells.forEach(([dr,dc])=>{const r=hover[0]+dr,c=hover[1]+dc;if(r>=0&&r<size&&c>=0&&c<size){const b=board.children[r*size+c];b.style.setProperty('--block',color(p.color));b.classList.add(ok?'preview':'invalid');}});}
function tone(clear){if(!data.sound)return;try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();[0,...(clear?[.09,.18]:[])].forEach((delay,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=(clear?440:330)*Math.pow(1.25,i);g.gain.setValueAtTime(0,audioCtx.currentTime+delay);g.gain.linearRampToValueAtTime(.06,audioCtx.currentTime+delay+.01);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+delay+.25);o.connect(g);g.connect(audioCtx.destination);o.start(audioCtx.currentTime+delay);o.stop(audioCtx.currentTime+delay+.26);});}catch(e){}}
function put(r,c){if(selected<0){say('Choisis un des blocs ci-dessous pour commencer.');return;}const result=Blocks.place(state,selected,r,c);if(!result){say('Un peu trop serré ! Essaie ailleurs ou tourne le bloc.');return;}selected=-1;hover=null;data.bests[size]=best();if(state.over)record();save();render();tone(result.count);say(result.count?`${result.count} ${result.count===1?'ligne effacée':'lignes effacées'} ! +${result.gained} points.`:`Parfaitement placé ! +${result.gained} points.`);result.cleared.forEach(([r,c])=>board.children[r*size+c].classList.add('flash'));if(result.count){const el=$('#celebration');el.textContent=result.count>1?'Bien joué !':'Un peu de place pour la suite';el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}if(state.over)endDialog();}
function rotate(direction=1){
 const all=selected<0;
 const pieces=all?state.tray.filter(Boolean):[state.tray[selected]].filter(Boolean);
 for(const piece of pieces)for(let i=0;i<(direction<0?3:1);i++)piece.cells=Blocks.rotate(piece.cells);
 save();render();
 say(all?'Les trois pièces ont tourné de 90° vers la droite.':direction<0?'Un quart de tour vers la gauche (90°).':'Un quart de tour vers la droite (90°).');
}
function openDialog(html){$('#dialog-content').innerHTML=html;if(!dialog.open)dialog.showModal();}
function endDialog(){openDialog(`<span class="eyebrow">UNE JOLIE PETITE PARTIE</span><h2>Chaque bloc a eu son moment.</h2><div class="big-score">${state.score.toLocaleString('fr-FR')}</div><p>${state.lines} lignes effacées sur la grille ${size} × ${size}. Aucun bloc restant ne peut être placé, même en le tournant. Ton score est conservé${storageOK?' sur cet appareil':' uniquement pour cette visite'}.</p><button class="primary" id="again">Encore une petite partie</button>`);$('#again').onclick=newGame;}
function newGame(){record();state=Blocks.fresh(size);selected=-1;hover=null;dialog.close();save();render();say('Une nouvelle petite aventure. Amuse-toi bien !');}
$('#restart').onclick=()=>{if(!state.moves){newGame();return;}openDialog('<h2>Une nouvelle petite partie ?</h2><p>Ton score actuel sera conservé parmi tes meilleurs moments. Cette grille sera remplacée.</p><button class="primary" id="confirm-new">Recommencer</button><button class="secondary" id="keep">Continuer</button>');$('#confirm-new').onclick=newGame;$('#keep').onclick=()=>dialog.close();};
$('#close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('#help').onclick=()=>openDialog('<span class="eyebrow">PRENDS TON TEMPS</span><h2>Un petit guide</h2><ol><li>Glisse un bloc sur la grille, ou sélectionne-le puis touche une case pour y placer son coin supérieur gauche.</li><li>Sélectionne une pièce puis appuie sur Tourner 90° ou sur R : chaque pression la fait pivoter de 90° vers la droite. Sans sélection, le bouton Tout tourner 90° ou la touche R fait pivoter les trois pièces à la fois. Molette sur une pièce sélectionnée, vers le haut : 90° vers la gauche ; vers le bas : 90° vers la droite. Un second clic sur la pièce la désélectionne. La rotation est gratuite et illimitée. Chaque bloc placé est immédiatement remplacé par une nouvelle pièce. Les deux autres restent disponibles.</li><li>Complète des lignes ou des colonnes pour les effacer. La partie se termine quand aucun bloc ne peut être placé, même après rotation.</li></ol><p><b>Points :</b> 10 points par case placée, plus 100 × le nombre de lignes effacées au carré à chaque coup. Efface des lignes sur plusieurs coups consécutifs pour gagner 50 points de bonus supplémentaires à chaque coup de la série.</p><p><b>Clavier :</b> 1–3 pour choisir un bloc ; R pour tourner de 90° ; les flèches pour se déplacer ; Entrée ou Espace pour placer. Échap annule la sélection.</p><p>Chaque taille de grille conserve ses propres scores et sa partie en cours. La progression reste dans ce navigateur ; effacer ses données supprime les sauvegardes.</p>');
$('#scores').onclick=()=>{const list=history();openDialog(`<span class="eyebrow">GRILLE ${size} × ${size}</span><h2>Tes meilleurs moments</h2><p>Ton record : <b>${best().toLocaleString('fr-FR')}</b></p>${list.length?'<ol class="score-list">'+list.map((s,i)=>`<li><span>${i+1}. <b>${s.score.toLocaleString('fr-FR')}</b> points</span><small>${Number(s.lines)||0} lignes · ${Number.isNaN(Date.parse(s.date))?'':new Date(s.date).toLocaleDateString('fr-FR')}</small></li>`).join('')+'</ol>':'<p>Tes parties terminées apparaîtront ici. Une petite aventure t’attend.</p>'}<p>Tes 10 meilleurs scores de parties terminées ou recommencées, sauvegardés sur cet appareil. Change la taille de la grille pour voir ses scores.</p>`);};
$('#sound').onclick=()=>{data.sound=!data.sound;save();render();tone(false);};$('#rotate').onclick=()=>rotate();
document.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.size)===size)return;enter(Number(b.dataset.size));say(`Ta petite bulle ${size} × ${size}. Chaque taille conserve sa propre progression.`);});
tray.addEventListener('click',e=>{if(e.detail>0)return;if(suppressClick){suppressClick=false;return;}const b=e.target.closest('[data-index]');if(b)choose(Number(b.dataset.index),true);});
tray.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-index]');if(!b||b.disabled||e.button!==0)return;tray.setPointerCapture(e.pointerId);drag={id:e.pointerId,index:Number(b.dataset.index),x:e.clientX,y:e.clientY,moved:false};});
function atPoint(x,y){const rect=board.getBoundingClientRect(),border=parseFloat(getComputedStyle(board).borderLeftWidth),gap=parseFloat(getComputedStyle(board).gap);const step=(rect.width-2*border+gap)/size;return [Math.floor((y-rect.top-border)/step),Math.floor((x-rect.left-border)/step)];}
document.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){drag.moved=true;choose(drag.index);}if(drag.moved){hover=atPoint(e.clientX,e.clientY);preview();}});
document.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;if(drag.moved){suppressClick=true;const [r,c]=atPoint(e.clientX,e.clientY);if(r>=0&&r<size&&c>=0&&c<size)put(r,c);hover=null;preview();setTimeout(()=>suppressClick=false,0);}else{choose(drag.index,true);}drag=null;});
document.addEventListener('pointercancel',()=>{drag=null;hover=null;preview();});
board.addEventListener('click',e=>{if(suppressClick)return;const b=e.target.closest('.cell');if(b){cursor=[Number(b.dataset.r),Number(b.dataset.c)];put(...cursor);}});
board.addEventListener('pointermove',e=>{if(drag)return;hover=atPoint(e.clientX,e.clientY);preview();});board.addEventListener('pointerleave',()=>{if(!drag){hover=null;preview();}});
document.addEventListener('keydown',e=>{if(dialog.open)return;if(['1','2','3'].includes(e.key)){choose(Number(e.key)-1);return;}if(e.key.toLowerCase()==='r'){e.preventDefault();if(!e.repeat)rotate();return;}if(e.key==='Escape'){selected=-1;hover=null;render();return;}if(e.key.startsWith('Arrow')){e.preventDefault();const [r,c]=cursor;cursor=[Math.max(0,Math.min(size-1,r+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0))),Math.max(0,Math.min(size-1,c+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0)))];board.querySelectorAll('.cell').forEach(b=>b.tabIndex=-1);const b=board.children[cursor[0]*size+cursor[1]];b.tabIndex=0;b.focus({preventScroll:true});hover=cursor;preview();}if((e.key==='Enter'||e.key===' ')&&board.contains(document.activeElement)){e.preventDefault();put(...cursor);board.children[cursor[0]*size+cursor[1]].focus({preventScroll:true});}});
function applyTheme(){
 const dark=data.theme==='dark';
 document.documentElement.dataset.theme=dark?'dark':'light';
 $('#theme').setAttribute('aria-pressed',dark);
 $('#theme').setAttribute('aria-label',dark?'Activer le mode clair':'Activer le mode sombre');
 $('#theme').title=dark?'Mode clair':'Mode sombre';
 $('#theme').textContent=dark?'☀':'☾';
 $('meta[name="theme-color"]').content=dark?'#18211e':'#f6f3ec';
}
if(!['light','dark'].includes(data.theme))data.theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
$('#theme').onclick=()=>{data.theme=data.theme==='dark'?'light':'dark';applyTheme();save();};
document.addEventListener('wheel',e=>{
 if(dialog.open||selected<0||state.over||e.ctrlKey||!e.deltaY)return;
 e.preventDefault();
 rotate(e.deltaY<0?-1:1);
},{passive:false});
applyTheme();
enter(size);



