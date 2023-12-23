import { Bodies, Body , Collision, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS_BASE } from "./fruits";

let FRUITS = FRUITS_BASE;

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8", //처음 색은 까맣게 나오는데 render의 wireframes라는 옵션이 true값으로 설정되어있기 때문.
    width: 620,
    height: 837,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true, // 왼쪽벽이 고정이됨
  render: { fillStyle: "#E6B143" }
});

const rightwall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true, // 왼쪽벽이 고정이됨
  render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(310, 810, 620, 50, {
  isStatic: true, // 왼쪽벽이 고정이됨
  render: { fillStyle: "#E6B143" }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name:"topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" }
})


World.add(world, [leftWall, rightwall, ground, topLine]); //물리 엔진이 적용되기때문에 벽이 떨어짐 isStatic필요.


Render.run(render);
Runner.run(engine);

let currentBody = null;
let currenntFruit = null;
let disableAction = false;
let interval = null;
let num_watermelon = 0;

function addFruit() {
  const index = Math.floor(Math.random()*5); //0~5사이의과일이 나옴. 수박 게임은 작은거부터 커지기 때문
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 0.5, //탄성을 주는 프로퍼티
  });

  currentBody = body;
  currenntFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) =>{

  if(disableAction){
    return;
  }

  switch(event.code){   
    case "ArrowLeft":
      if(interval){
        return;
      }
      interval = setInterval(()=>{
        if(currentBody.position.x - currenntFruit.radius>30)
          Body.setPosition(currentBody,{
            x : currentBody.position.x -1,
            y : currentBody.position.y,
          });
      },5);
      break;
    
      case "ArrowRight":
        if(currentBody.position.x + currenntFruit.radius<590)
          Body.setPosition(currentBody,{
            x : currentBody.position.x +10,
            y : currentBody.position.y,
          });
      break;

    case "ArrowDown":
      currentBody.isSleeping = false;
      disableAction = true;
      setTimeout(() => {
        addFruit();
        disableAction = false;
      },1000);
      break;
  }
}

window.onkeyup = (event) => {
  switch(event.code){
    case "ArrowLeft":
    case "ArrowRight":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine,"collisionStart", (event) => {
  event.pairs.forEach((collision)=>{
    if(collision.bodyA.index === collision.bodyB.index){
      const index = collision.bodyA.index;

      if(index === FRUITS.length-1){
        return;
      }

      World.remove(world,[collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1]

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render:{
            sprite: {texture:`${newFruit.name}.png`}
          },
          index: index +1,
        }
      );
      World.add(world,newBody);

      if(newFruit == FRUITS.length -1){
        num_watermelon++;
        if(num_watermelon == 2){
          alert("승리하였습니다.")
        }
      }
    }

    if(!disableAction && collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine"){
      alert("Game Over");
      location.reload();
    }

  })
});

addFruit();//실행은 http://localhost:5173/