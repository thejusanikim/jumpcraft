const vm=require('vm'),fs=require('fs'),assert=require('assert');
const nodes=new Map();function node(){return {style:{setProperty(){}},classList:{toggle(){}},addEventListener(){},setAttribute(){},focus(){},getContext(){return {}},value:'',textContent:'',hidden:false,checked:false,dataset:{}}}const document={querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll(){return []},documentElement:node(),addEventListener(){}};
const context={document,window:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},requestAnimationFrame(){},structuredClone,performance:{now(){return 0}},setTimeout,clearTimeout,Blob,URL,console};vm.createContext(context);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),context);
vm.runInContext(`
function check(v,msg){if(!v)throw Error(msg)}
for(let i=0;i<3;i++){const level=makeLevel(i);check(validWorld(level),'level validity');check(level.blocks.every(b=>b.w===25&&b.h===25),'all terrain uses small blocks')}
for(let i=0;i<120;i++)step();check(p.ground&&p.y===491,'lands on starting blocks');
keys.Space=true;step();check(p.vy<0&&p.jumps===1,'first jump');keys.Space=false;step();keys.Space=true;step();check(p.vy<0&&p.jumps===2,'double jump');keys.Space=false;step();keys.Space=true;step();check(p.jumps===2,'no third jump');
restart();settings.doubleJump=false;keys={Space:true};jumpHeld=false;step();keys.Space=false;step();keys.Space=true;let vy=p.vy;step();check(p.jumps===1&&p.vy>vy,'double jump disabled');
restart();keys={};p.x=coins[0].x;p.y=coins[0].y;step();check(coins[0].got,'coin collected');
p.x=world.goal.x;p.y=world.goal.y;step();check(!playing,'finish triggers win');
restart();p.y=deathFloor()+100;step();check(deaths===1&&p.y===world.spawn.y,'fall respawn');
mode='build';let old=p.y;step();check(p.y===old,'editor pauses physics');
check(!validWorld({platforms:[{x:0,y:0,w:-1,h:2}],coins:[],spikes:[],spawn:{x:0,y:0},goal:{x:1,y:1}}),'invalid import rejected');
const before=world.blocks.length;tool='block';lastCell='';editAt({x:-10025,y:-2025});check(world.blocks.length===before+1&&world.blocks.some(b=>b.x===-10025&&b.y===-2025&&b.w===25),'build far beyond old map');
lastCell='';editAt({x:-10025,y:-2025});check(world.blocks.length===before+1,'no duplicate blocks');
tool='goal';lastCell='';editAt({x:15000,y:-3000});check(world.goal.x===15000&&world.goal.y===-3040,'finish moves beyond viewport');
tool='erase';lastCell='';editAt({x:15002,y:-3020});check(world.goal===null,'finish erasable');
mode='play';playing=true;step();check(playing,'no finish does not win or crash');
mode='build';tool='goal';lastCell='';editAt({x:-5000,y:1800});check(world.goal.x===-5000,'finish re-added');
check(validWorld(world),'unbounded coordinates validate');let migrated=normalizeWorld({platforms:[{x:0,y:0,w:100,h:25}],coins:[],spikes:[],spawn:{x:-100,y:-100},goal:null});check(migrated.blocks.length===4&&migrated.goal===null,'legacy world migrates without losing empty finish');
world=normalizeWorld({blocks:[{x:3000,y:3000,w:25,h:25}],coins:[],spikes:[],spawn:{x:3000,y:2950},goal:null});restart();mode='play';keys={};for(let i=0;i<60;i++)step();check(p.ground&&p.y===2966,'deep world playable');
p.x=-2000;p.y=0;keys={KeyA:true};step();check(p.x<-2000,'no horizontal wall');
mode='build';keys={ArrowLeft:true};let cx=camera.x;step();check(camera.x<cx,'editor camera pans');
keys={};camera.x=0;camera.y=0;camera.zoom=1;canvas.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:600});canvas.setPointerCapture=()=>{};
world.goal={x:200,y:200};tool='block';canvas.onpointerdown({clientX:210,clientY:210,button:0,pointerId:1,preventDefault(){}});canvas.onpointermove({clientX:410,clientY:310});canvas.onpointerup({pointerId:1});check(world.goal.x===400&&world.goal.y===310,'direct flag dragging persists');
tool='erase';lastCell='';canvas.onpointerdown({clientX:410,clientY:320,button:0,pointerId:2,preventDefault(){}});canvas.onpointerup({pointerId:2});check(world.goal===null,'pointer erases flag');
tool='pan';canvas.onpointerdown({clientX:500,clientY:300,button:0,pointerId:3,preventDefault(){}});canvas.onpointermove({clientX:700,clientY:500});canvas.onpointerup({pointerId:3});check(camera.x===-200&&camera.y===-200,'drag pans into negative coordinates');
zoomView(.5);check(camera.zoom===.5,'zoom out');
const calls=[];for(const method of ['fillRect','beginPath','ellipse','fill','moveTo','lineTo','closePath','save','scale','translate','strokeRect','arc','stroke','roundRect','setLineDash','fillText','restore'])ctx[method]=(...args)=>calls.push([method,...args]);
world.coins=[{x:0,y:0}];coins=[{x:0,y:0,got:false}];world.goal={x:0,y:0};draw();check(calls.some(c=>c[0]==='arc'&&c[3]===9),'gold coin drawn as a circle');world.goal=null;draw();
console.log('PASS: terrain migration, one-block landings, gameplay, unbounded editing and play, camera pan, finish move/erase/re-add, import validation');
`,context);
