// THE EDITOR: ED holds the character editor's state and head shapes, and W3.applyE places edits.
import {THREE} from './003-shx.js';
import {ED, W3} from './003b-systems.js';
Object.assign(ED,{on:false,anim:false});
{ const mS=new THREE.Matrix4(), mT=new THREE.Matrix4(), mQ=new THREE.Matrix4(), qq=new THREE.Quaternion();
  W3.applyE=(M,E,o)=>{ M.multiply(mS.makeScale(E.s[0],E.s[1],E.s[2])); M.premultiply(mT.makeTranslation(-o.x,-o.y,-o.z)); M.premultiply(mQ.makeRotationFromQuaternion(qq.set(...E.q))); M.premultiply(mT.makeTranslation(o.x+E.o[0],o.y+E.o[1],o.z+E.o[2])); }; }
ED.HEADS={round:{w:1,h:1,d:1,sq:0,tp:0},oval:{w:.94,h:1.08,d:.98,sq:0,tp:0},square:{w:1.03,h:.98,d:1,sq:.85,tp:0},long:{w:.92,h:1.13,d:.96,sq:.2,tp:0},
  wide:{w:1.12,h:.93,d:1.02,sq:.2,tp:0},heart:{w:1.02,h:1.02,d:1,sq:0,tp:.2},pear:{w:1,h:1,d:1,sq:.25,tp:-.18}};
