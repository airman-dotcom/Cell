import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
kaboom({
  width: innerWidth,
  debug: true,
  height: innerHeight,
});
//make a rectangle at the bottom of the screen
add([rect(width(), 50), color(BLACK), pos(0, height() - 50)]);

const db = {
  phosphate: {
    polar: false,
    charge: -1,
  },
  serine: {
    polar: true,
    charge: 0,
  },
  hydrophobic: {
    name: "phospholipid head",
    components: ["phosphate", "serine"],
    polar: true,
    color: GREEN,
    charge: -1,
  },
  water: {
    color: BLUE,
    polar: true,
    charge: 0,
  },
};
let vecs = {};
const ENERGY = 1600;
const REPEL_COEF = -4;
const ATTRACT_COEF = 8;
const ENABLE_BONDING = false;
let parents = {};
let deltas = {};
const deltaRadius = 100;
let deltaThetas = {};
let deltaVecs = {}
function spawn(num, type) {
  for (let x = 0; x < num; x++) {
    let sp = pos(Math.random() * width(), Math.random() * height())
    let d = add([
      sp,
      circle(20),
      body({ gravityScale: 0 }),
      area(),
      offscreen({ pause: true }),
      rotate(0),
      color(db[type].color),
      `${type}`,
      z(10),
      "particle",
      `${x}`,
      "t",
    ]);
    let zz = add([
      circle(deltaRadius),
      pos(d.pos.x + (-0.791 * (deltaRadius+50)), d.pos.y + (+0.612 * (deltaRadius + 50))),
      area(),
      color(CYAN),
      `${x}`,
      "particle",
      opacity(0.7),
      "delta",
      "positive",
    ]);
    console.log(zz.c(rect()));
    let zy = add([
      circle(deltaRadius),
      pos(d.pos.x + (-0.1 * (deltaRadius + 50)), d.pos.y + (-1 * (deltaRadius + 50))),
      area(),
      color(RED),
      `${x}`,
      "particle",
      opacity(0.7),

      "delta",
      "negative",
    ]);
    let zw = add([
      circle(deltaRadius),
      pos(d.pos.x + (+0.1 * (deltaRadius + 50)), d.pos.y + (-1 * (deltaRadius + 50))),
      area(),
      color(RED),
      `${x}`,
      "particle",
      opacity(0.7),

      "delta",
      "negative"
    ])
    let zx = add([
      circle(deltaRadius),
      pos(d.pos.x + (0.791 * (deltaRadius + 50)), d.pos.y + (+0.612 * (deltaRadius + 50))),
      area(),
      color(CYAN),
      `${x}`,
      "particle",
      opacity(0.7),

      "delta",
      "positive",
    ])
    deltas[zz.id] = d;
    deltas[zy.id] = d;
    deltas[zx.id] = d;
    deltas[zw.id] = d;
    deltaThetas[d.id] = 0;
    deltaThetas[zy.id] = [Math.PI + 0.659, 0];
    deltaThetas[zz.id] = [Math.PI - 0.828, 0];
    deltaThetas[zx.id] = [2 * Math.PI - 0.659, 0]
    deltaThetas[zw.id] = [0.828, 0];
    vecs[d.id] = [[],[],[]];
    //x,y,theta
  }
}
spawn(10, "water");

/*add([
  rect(200, 10),
  pos(50,50),
  area(),
  body({gravityScale:0})
])*/

onCollide("hydrophobic", "hydrophobic", (c, d) => {
  if (!ENABLE_BONDING){
    return;
  }
  if (!c.is("bond") && !d.is("bond")) {
    //console.log(c.id, d.id);
    d.unuse(body());
    d.use("bond1");
    d.use("bond");
    d.unuse("t");
    parents[d.id] = c;
    c.add([circle(0.00001)]);
    c.color = MAGENTA;
    d.color = MAGENTA;
    d.pos.x = c.pos.x + 20;
    d.pos.y = c.pos.y + 30;
    c.use("bond1");
    c.use("bond");
  } else if (!c.is("bond") && d.is("bond1")) {
    //a blue + not green
    //no bond + one bonded on
    //console.log(d.id, c.id);

    c.unuse(body());
    c.use("bond1");
    c.unuse("t");
    c.use("bond");

    if (Object.keys(parents).includes(d.id.toString())) {
      parents[c.id] = parents[d.id];
      let u = parents[d.id];
      c.pos.x = d.pos.x - 40;
      c.pos.y = d.pos.y + 10;
      //console.log("non parent")
    } else {
      parents[c.id] = d;
      c.pos.x = d.pos.x - 40;
      c.pos.y = d.pos.y + 10;
      //console.log("parent")
    }
    d.add([circle(0.00001)]);
    d.color = CYAN;
    c.color = MAGENTA;
    d.use("bond2");
    d.unuse("bond1");
    //console.log(parents);
  } else if (c.is("bond1") && d.is("bond1")) {
    if (parents[c.id] == d || parents[d.id] == c) return;

    c.use("bond2");
    d.use("bond2");
    c.unuse("bond1");
    d.unuse("bond1");
    let isParent = findChild(c) != null;
    if (Object.keys(parents).includes(d.id.toString())) {
      if (!isParent) {
        //ischild
        parents[c.id] = parents[d.id];
      } else {
        fixchilds(c, parents[d.id]);
      }

      //console.log("non parent")
    } else {
      fixchilds(c, d);
      parents[c.id] = d;
      //console.log("parent")
    }

    c.pos.x = d.pos.x - 40;
    c.pos.y = d.pos.y + 10;
  }
});


onCollide("water", "water", (c, d) => {
  if (!ENABLE_BONDING){
    return;
  }
  if (!c.is("bond") && !d.is("bond")) {
    //console.log(c.id, d.id);
    d.unuse(body());
    d.use("bond1");
    d.use("bond");
    d.unuse("t");
    parents[d.id] = c;
    c.add([circle(0.00001)]);
    c.color = GREEN;
    d.color = GREEN;
    d.pos.x = c.pos.x + 20;
    d.pos.y = c.pos.y + 30;
    c.use("bond1");
    c.use("bond");
  } else if (!c.is("bond") && d.is("bond1")) {
    //a blue + not green
    //no bond + one bonded on
    //console.log(d.id, c.id);

    c.unuse(body());
    c.use("bond1");
    c.unuse("t");
    c.use("bond");

    if (Object.keys(parents).includes(d.id.toString())) {
      parents[c.id] = parents[d.id];
      let u = parents[d.id];
      c.pos.x = d.pos.x - 40;
      c.pos.y = d.pos.y + 10;
      //console.log("non parent")
    } else {
      parents[c.id] = d;
      c.pos.x = d.pos.x - 40;
      c.pos.y = d.pos.y + 10;
      //console.log("parent")
    }
    d.add([circle(0.00001)]);
    d.color = BLACK;
    c.color = GREEN;
    d.use("bond2");
    d.unuse("bond1");
    //console.log(parents);
  } else if (c.is("bond1") && d.is("bond1")) {
    if (parents[c.id] == d || parents[d.id] == c) return;

    c.use("bond2");
    d.use("bond2");
    c.unuse("bond1");
    d.unuse("bond1");
    let isParent = findChild(c) != null;
    if (Object.keys(parents).includes(d.id.toString())) {
      if (!isParent) {
        //ischild
        parents[c.id] = parents[d.id];
      } else {
        fixchilds(c, parents[d.id]);
      }

      //console.log("non parent")
    } else {
      fixchilds(c, d);
      parents[c.id] = d;
      //console.log("parent")
    }

    c.pos.x = d.pos.x - 40;
    c.pos.y = d.pos.y + 10;
  }
  /*else if (c.is("bond2") && d.is("bond1")){
    //c wants to leave one of its bonds to make a bond with d
    let isParent = findChild(c) != null;
    if (isParent){
      //console.log("parent")
      let child = findChild(c);
      child.use("t");
      delete parents[child.id];
      let c2 = findChild(c);
      parents[c2.id] = child;
      parents[c.id] = d;
      c.unuse("t");
    }
  }*/
});

onCollide("positive","positive",(n1,n2) => {
  console.log("bb")
  let n1Vec = vec2(n1.pos.x,n1.pos.y)
  let n2Vec = vec2(n2.pos.x,n2.pos.y)
  //Force of repulsion exerted from n2 on n1
  let n1n2 = Vec2.fromAngle(n1Vec.angle(n2Vec))
  //Vice Versa
  let n2n1 = Vec2.fromAngle(n2Vec.angle(n1Vec))
  let p1 = deltas[n1.id]
  let p2 = deltas[n2.id]
  if (deltaVecs[p1.id] == undefined){
    deltaVecs[p1.id] = [n1n2]
  }
  else{
    let x = deltaVecs[p1.id]
    x.push(n1n2)
    deltaVecs[p1.id] = x
  }
  if (deltaVecs[p2.id] == undefined){
    deltaVecs[p2.id] = [n2n1]
  }
  else {
    let x = deltaVecs[p2.id]
    x.push(n2n1)
    deltaVecs[p2.id] = x
  }
})

onCollide("positive","negative",(n1,n2) => {
  console.log("cc")
  let n1Vec = vec2(n1.pos.x,n1.pos.y)
  let n2Vec = vec2(n2.pos.x,n2.pos.y)
  //Force of repulsion exerted from n2 on n1
  let n1n2 = Vec2.fromAngle(n1Vec.angle(n2Vec))
  n1n2 = n1n2.scale(-1)
  //Vice Versa
  let n2n1 = Vec2.fromAngle(n2Vec.angle(n1Vec))
  n2n1 = n2n1.scale(-1)
  let p1 = deltas[n1.id]
  let p2 = deltas[n2.id]
  if (deltaVecs[p1.id] == undefined){
    deltaVecs[p1.id] = [n1n2]
  }
  else{
    let x = deltaVecs[p1.id]
    x.push(n1n2)
    deltaVecs[p1.id] = x
  }
  if (deltaVecs[p2.id] == undefined){
    deltaVecs[p2.id] = [n2n1]
  }
  else {
    let x = deltaVecs[p2.id]
    x.push(n2n1)
    deltaVecs[p2.id] = x
  }
})


onCollide("negative","negative",(n1,n2) => {
  console.log("aa")
  let n1Vec = vec2(n1.pos.x,n1.pos.y)
  let n2Vec = vec2(n2.pos.x,n2.pos.y)
  //Force of repulsion exerted from n2 on n1
  let n1n2 = Vec2.fromAngle(n1Vec.angle(n2Vec))
  //Vice Versa
  let n2n1 = Vec2.fromAngle(n2Vec.angle(n1Vec))
  let p1 = deltas[n1.id]
  let p2 = deltas[n2.id]
  if (deltaVecs[p1.id] == undefined){
    deltaVecs[p1.id] = [n1n2]
  }
  else{
    let x = deltaVecs[p1.id]
    for (let i =0;i<ATTRACT_COEF;i++){
      x.push(n1n2)
    }
    deltaVecs[p1.id] = x
  }
  if (deltaVecs[p2.id] == undefined){
    deltaVecs[p2.id] = [n2n1]
  }
  else {
    let x = deltaVecs[p2.id]
    for (let i =0;i<ATTRACT_COEF;i++){
      x.push(n2n1)
    }
    deltaVecs[p2.id] = x
  }
})


function findChild(n) {
  //check if parent
  let d = null;
  let w = Object.values(parents);
  for (let i = 0; i < w.length; i++) {
    let u = w[i];
    console.log(u.id);
    if (u.id == n.id) {
      d = i;
      break;
    }
  }
  return d;
}
 

function fixchilds(n, z) {
  let d = null;
  if (findChild(n)) d = findChild(n);
  else return null;
  let u = Object.keys(parents)[d];
  parents[u.id] = z;
}


function sim() {
  onUpdate("particle", (c) => {
    if (c.is("t")) {
      let averageTheta = rand(0, 350);
      let imp = Vec2.fromAngle(averageTheta).scale(
        ENERGY / (2),
        );
      let a = imp
      let x = deltaVecs[c.id]
      if (x != undefined){
      for (let i = 0;i<x.length;i++){
        let b = x[i]
        b = b.scale(REPEL_COEF * ENERGY)
        imp = imp.add(b)
      }
      }
      console.log(a.eq(imp))
      c.move(imp)
      
      deltaVecs[c.id] = []
    }
    else if (c.is("bond")) {
      let parent = parents[c.id];
      c.move(vecs[parent.id]);
    }
    else if (c.is("delta")) {
      let parent = deltas[c.id];
      c.move(vecs[parent.id]);
      let theta = deltaThetas[c.id][0];
      let rng = Math.random();
      if (rng > 0.5){
        rng = 1;
      } else {
        rng = -1;
      }
      let ntheta = theta + Math.PI / (50 * 1);
      //let bt = deltaThetas[c.id][1]
      if (ntheta > 2 * Math.PI) {
        ntheta -= 2 * Math.PI;
      }
      /*let kaz = new vec2(Math.sin(ntheta) * 25, Math.cos(ntheta) * 25);
      c.move(kaz);*/
      let newx = (Math.cos(ntheta)*100) + parent.pos.x
      let newy = (Math.sin(ntheta)*100) + parent.pos.y
      c.pos.x = newx;
      c.pos.y = newy;
      //c.use(rotate(bt - .58))
      //debug.log(ntheta)
      //debug.log(parent.angle)
      //c.use(rotate(ntheta * -57.2958 + 50));
      // deltaThetas[c.id][0] = ntheta;
      //deltaThetas[c.id][1] = bt - .58;
    }
  });
}

sim();
