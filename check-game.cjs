const vm=require('vm'),fs=require('fs'),assert=require('assert');
const nodes=new Map();function node(){return {style:{setProperty(){}},classList:{toggle(){}},addEventListener(){},setAttribute(){},focus(){},getContext(){return {}},value:'',textContent:'',hidden:false,checked:false,dataset:{}}}const document={querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll(){return []},documentElement:node(),addEventListener(){}};
const context={document,window:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},requestAnimationFrame(){},structuredClone,performance:{now(){return 0}},setTimeout,clearTimeout,Blob,URL,console};vm.createContext(context);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),context);
vm.runInContext(`
function check(v,msg){if(!v)throw Error(msg)}
for(let i=0;i<3;i++)check(validWorld(makeLevel(i)),'level validity');
for(let i=0;i<120;i++)step();check(p.ground&&p.y===486,'lands on starting platform');
keys.Space=true;step();check(p.vy<0&&p.jumps===1,'first jump');keys.Space=false;step();keys.Space=true;step();check(p.vy<0&&p.jumps===2,'double jump');keys.Space=false;step();keys.Space=true;step();check(p.jumps===2,'no third jump');
restart();settings.doubleJump=false;keys={Space:true};jumpHeld=false;step();keys.Space=false;step();keys.Space=true;let vy=p.vy;step();check(p.jumps===1&&p.vy>vy,'double jump disabled');
restart();keys={};p.x=coins[0].x;p.y=coins[0].y;step();check(coins[0].got,'coin collected');
p.x=world.goal.x;p.y=world.goal.y;step();check(!playing,'finish triggers win');
restart();p.y=700;step();check(deaths===1&&p.y===world.spawn.y,'fall respawn');
mode='build';let old=p.y;step();check(p.y===old,'editor pauses physics');
check(!validWorld({platforms:[{x:0,y:0,w:-1,h:2}],coins:[],spikes:[],spawn:{x:0,y:0},goal:{x:1,y:1}}),'invalid import rejected');
console.log('PASS: three layouts, landing, double jump, jump limit, coin collection, finish, respawn, editor pause, import validation');
`,context);
