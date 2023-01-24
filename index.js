const canvas =document.querySelector('canvas');
const c = canvas.getContext ('2d');
const scoreEL = document.querySelector('#scoreEL');
let startDiv = document.getElementById('start');
let winGameDiv = document.getElementById('win-game');
let gameScore = document.getElementById('score');
let gameOver = document.getElementById('game-over');

canvas.width =1020;
canvas.height = 450;

class Boundary {
  static width=30;
  static height=30;
  constructor({position,image}){
      this.position = position;
      this.width =30;
      this.height=30;
      this.image = image;
    }
  draw () {
    c.drawImage(this.image,this.position.x,this.position.y);
  }   
}

class Player {
  static speed = 5;
  constructor({position,velocity}){
    this.position = position;
    this.velocity = velocity;
    this.speed = 5;
    this.radius = 15;
    this.radians = 0.75;
    this.openRate = 0.07;
    this.rotation = 0;
  }
  draw () {
    c.save();
    c.translate(this.position.x,this.position.y);
    c.rotate(this.rotation);
    c.translate(-this.position.x,-this.position.y);
    c.beginPath();
    c.arc(this.position.x,this.position.y,this.radius,this.radians,Math.PI*2 -this.radians);
    c.lineTo(this.position.x,this.position.y);
    c.fillStyle = 'yellow';
    c.fill();
    c.closePath();
    c.restore();
  }   
  update (){
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.radians<0 || this.radians> .75){
      this.openRate = -this.openRate;
    } this.radians += this.openRate;

  }
}
class Ghost {
  static speed = 4;
  constructor({position,velocity,color ='red'}){
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.originalColor = color;
    this.color = color;
    this.prevCollisions=[];
    this.speed = 4;
    this.scared = false;
  }
  draw () {
    c.beginPath();
    c.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2);
    c.fillStyle = this.scared ? 'blue': this.color
    c.fill();
    c.closePath();
  }   

  update (){
    this.draw();
    if(this.position.x < 0) {
        this.velocity.x = -Ghost.speed;
        this.position.x = canvas.width;
        this.prevCollisions = [];
    } else if (this.position.x > canvas.width) {
        this.velocity.x = Ghost.speed;
        this.position.x = 0;
        this.prevCollisions = [];
    }
    // בודק אם הרוח נתקע בקיר
     boundaries.forEach(boundary => {
      if (cCollidesWrecG({
        circle: this,
        rectangle: boundary
      })) {
        // משנה כיוון
        this.velocity.x = -this.velocity.x;
        this.velocity.y = -this.velocity.y;
        this.prevCollisions.push(boundary);
      }
    });
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Pellet {
  constructor({position}){
    this.position = position;
    this.radius = 3;
  }
  draw () {
    c.beginPath();
    c.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2);
    c.fillStyle = 'gold';
    c.fill();
    c.closePath();
  }   
}

class PowerUp {
  constructor({position}){
    this.position = position;
    this.radius = 8;
    this.opacity = 1;
  }
  draw () {
    c.beginPath();
    c.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2);
    c.fillStyle = 'gold';
    c.globalAlpha = this.opacity;
    c.fill();
    c.closePath();
  }   

}

const ghosts=[
  new Ghost({
    position: {
      x: Boundary.width* 1  + Boundary.width / 2,
      y: Boundary.height *1 + Boundary.height / 2
    },
    velocity:{
      x:Ghost.speed,
      y:Ghost.speed
    },
    color: '#ff0000'
  }),
  new Ghost({
    position: {
      x: Boundary.width* 1  + Boundary.width / 2,
      y: Boundary.height *1 + Boundary.height / 2
    },
    velocity:{
      x:Ghost.speed,
      y:Ghost.speed
    },
    color: '#ffb8ff'
  }),
  new Ghost({
    position: {
      x: Boundary.width* 1  + Boundary.width / 2,
      y: Boundary.height *1 + Boundary.height / 2
    },
    velocity:{
      x:Ghost.speed,
      y:Ghost.speed
    },
    color: '#00FFFF'
  }),
  new Ghost({
    position: {
      x: Boundary.width* 1  + Boundary.width / 2,
      y: Boundary.height *1 + Boundary.height / 2
    },
    velocity:{
      x:Ghost.speed,
      y:Ghost.speed
    },
    color: '#FFB852'
  }),
];

const currentLevel = Math.floor(Math.random() * 10) + 1;
const ghostColors = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'];
let pellets = [];
const powerUps = [];
const boundaries = [];
const player = new Player(
  {position: {
    x: Boundary.width* 15 + Boundary.width / 2,
      y: Boundary.height *1+ Boundary.height / 2
  }, velocity: {
    x:0,y:0
  }
}
)
const keys = {
  ArrowUp:{
    pressed: false
  },
  ArrowDown:{
    pressed: false
  },
  ArrowRight:{
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}
let lastKey='';
let score=0;

const map = [
    ['1','-','-','-','-','-','-','-','2',' ','1','-','2',' ','1','-','-','-','-','-','-','-','-','-','2',' ','1','-','2',' ',' ','1','-','2'],
    ['|','p','.','.','.','.','.','.','|',' ','|','.','|',' ','|','.','.','.','.','.','.','.','.','.','|',' ','|','.','|',' ',' ','|','.','|'],
    ['4','-','-','-','-','-','2','.','|',' ','|','.','4','_','3','.','1','-','-','-','-','-','2','.','4','_','3','.','|',' ',' ','|','p','|'],
    [' ',' ',' ',' ',' ',' ','|','.','|',' ','|','.','.','.','.','.','|',' ',' ',' ',' ',' ','|','.','.','.','.','.','|',' ',' ','|','.','|'],
    [' ',' ',' ',' ',' ',' ','|','.','4','_','3','.','1','_','2','.','|',' ',' ',' ',' ',' ','|','.','1','_','2','.','4','-','-','3','.','|'],
    [' ',' ',' ',' ',' ',' ','|','.','.','.','.','.','|',' ','|','.','|',' ',' ',' ',' ',' ','|','.','|',' ','|','.','.','.','.','.','.','|'],
    [' ',' ',' ',' ',' ',' ','|','.','1','_','2','.','|',' ','|','p','|',' ',' ',' ',' ',' ','|','.','|',' ','4','-','2','.','1','-','-','3'],
    ['1','-','2',' ',' ',' ','|','.','|',' ','4','-','3',' ','|','.','|',' ',' ',' ',' ',' ','|','.','|',' ',' ',' ','|','.','|',' ',' ',' '],
    ['|','.','|',' ',' ',' ','|','.','|',' ',' ',' ',' ',' ','|','.','|',' ',' ',' ',' ',' ','|','.','|',' ','1','-','3','.','4','-','-','2'],
    ['|','.','|',' ',' ',' ','|','.','|',' ',' ',' ',' ',' ','|','.','|',' ',' ',' ',' ',' ','|','.','|',' ','|','.','.','.','.','.','.','|'],
    ['|','.','|',' ',' ',' ','|','.','|',' ',' ',' ',' ',' ','|','.','4','2',' ',' ',' ','1','3','.','4','_','3','.','1','-','-','2','.','|'],
    ['|','.','|',' ',' ',' ','|','.','|',' ',' ',' ',' ',' ','|','.','.','4','2',' ','1','3','.','.','.','.','.','.','|',' ',' ','|','.','|'],
    ['|','p','4','_','_','_','3','.','|',' ',' ',' ',' ',' ','4','2','.','.','4','-','3','.','.','1','_','_','2','.','|',' ',' ','|','p','|'],
    ['|','.','.','.','.','.','.','.','|',' ',' ',' ',' ',' ',' ','4','2','.','.','.','.','.','1','3',' ',' ','|','.','|',' ',' ','|','.','|'],
    ['4','-','_','_','_','_','_','-','3',' ',' ',' ',' ',' ',' ',' ','4','-','-','-','-','-','3',' ',' ',' ','4','-','3',' ',' ','4','-','3'],
 
]

function createImage(src){
  const image = new Image();
  image.src = src;
  return image;
}

function addGhost() {
  setTimeout(() => {
  let colorIndex = Math.floor(Math.random() * ghostColors.length);
  let randomColor = ghostColors[colorIndex];

  let newGhost = new Ghost({
    position: {
      x: Boundary.width* 13  + Boundary.width / 2,
      y: Boundary.height *13 + Boundary.height / 2
    },
    velocity:{
      x:0,
      y:-Ghost.speed
    },
    color: randomColor
  });
  ghosts.push(newGhost);},3000);
}

function createMap() {
map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case '-':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage(`icons/lvl${currentLevel}/pipeHorizontal.png`)
          })
        )
        break
      case '|':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage(`icons/lvl${currentLevel}/pipeVertical.png`)
          })
        )
        break
      case '1':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage(`icons/lvl${currentLevel}/pipeCorner1.png`)
          })
        )
        break
      case '2':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage(`icons/lvl${currentLevel}/pipeCorner2.png`)
          })
        )
        break
      case '3':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage(`icons/lvl${currentLevel}/pipeCorner3.png`)
          })
        )
        break
      case '4':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage(`icons/lvl${currentLevel}/pipeCorner4.png`)
          })
        )
        break
      case '[':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage(`icons/lvl${currentLevel}/capLeft.png`)
          })
        )
        break
      case ']':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage(`icons/lvl${currentLevel}/capRight.png`)
          })
        )
        break
      case '_':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage(`icons/lvl${currentLevel}/pipeHorizontalS.png`)
          })
        )
        break
      case '.':
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2
            }
          })
        )
        break
      case 'p':
        powerUps.push(
          new PowerUp({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2
            }
          })
        )
        break
    }
  })
})}

function cCollidesWrecP ({
  circle,
  rectangle
}){
  const padding = Boundary.width / 2 - circle.radius - 2;
  return(
    circle.position.y-circle.radius +circle.velocity.y<=rectangle.position.y+rectangle.height+padding && 
    circle.position.x+circle.radius +circle.velocity.x>=rectangle.position.x -padding &&
    circle.position.y+circle.radius +circle.velocity.y>=rectangle.position.y-padding &&
    circle.position.x-circle.radius +circle.velocity.x<=rectangle.position.x+rectangle.width+padding)
}
function cCollidesWrecG ({
  circle,
  rectangle
}){
  const padding = Boundary.width / 2 - circle.radius - 1;
  return(
    circle.position.y-circle.radius +circle.velocity.y<=rectangle.position.y+rectangle.height+padding && 
    circle.position.x+circle.radius +circle.velocity.x>=rectangle.position.x -padding &&
    circle.position.y+circle.radius +circle.velocity.y>=rectangle.position.y-padding &&
    circle.position.x-circle.radius +circle.velocity.x<=rectangle.position.x+rectangle.width+padding)
}

let animationId;

function animate(){

  animationId= requestAnimationFrame(animate);
  c.clearRect(0,0,canvas.width,canvas.height)

  if (keys.ArrowUp.pressed && lastKey ==='ArrowUp'){
    for (let i=0;i<boundaries.length; i++){
      const boundary = boundaries [i];
      if(cCollidesWrecP({
        circle: {...player,velocity:{
          x:0,
          y:-player.speed,
          
        }},
        rectangle: boundary
      }))
      {player.velocity.y=0;
      break}
      else {
        player.velocity.y=-player.speed;
      }}
  }else if (keys.ArrowDown.pressed && lastKey ==='ArrowDown'){
    for (let i=0;i<boundaries.length; i++){
      const boundary = boundaries [i];
    if(cCollidesWrecP({
      circle: {...player,velocity:{
        x:0,
        y:player.speed
      }},
      rectangle: boundary
    }))
    {player.velocity.y=0;
    break}
    else {
      player.velocity.y=player.speed;
    }}
  
  }else if (keys.ArrowRight.pressed && lastKey ==='ArrowRight'){
    for (let i=0;i<boundaries.length; i++){
      const boundary = boundaries [i];
      if(cCollidesWrecP({
        circle: {...player,velocity:{
          x:player.speed,
          y:0
        }},
        rectangle: boundary
      }))
      {player.velocity.x=0;
      break}
      else {
        player.velocity.x=player.speed;
      }}
  }else if (keys.ArrowLeft.pressed && lastKey ==='ArrowLeft'){
    for (let i=0;i<boundaries.length; i++){
      const boundary = boundaries [i];
      if(cCollidesWrecP({
        circle: {...player,velocity:{
          x:-player.speed,
          y:0
        }},
        rectangle: boundary
      }))
      {player.velocity.x=0;
      break}
      else {
        player.velocity.x=-player.speed;
      }}
  }

  
  // אם הרוחות נוגעות בשחקן

  for(let i = ghosts.length - 1; 0<=i;i--){
    let ghost = ghosts[i]
    if(Math.hypot(
        ghost.position.x-player.position.x,
        ghost.position.y-player.position.y)<
        ghost.radius + player.radius){
        if(ghost.scared) {
          score+=100;
          scoreEL.innerHTML = score;
            ghosts.splice(i,1) 
            // addGhost();
        } else {
          startDiv.style.display = "none";
          scoreEL.style.display= "none";
          canvas.style.display = "none";
          gameScore.style.display = "none";
          gameOver.style.display = "block";
          cancelAnimationFrame(animationId)
        }
    }
  }


  // נצחון
  if (pellets.length === 0) { 
    winGame(); 
  }
  
  //אוספים את המחזק
  for(let i = powerUps.length - 1; 0<=i;i--){
    const powerUp = powerUps[i];
    powerUp.draw();
    if(Math.hypot(powerUp.position.x-player.position.x,
      powerUp.position.y-player.position.y)< powerUp.radius + player.radius){
        powerUps.splice(i,1);
        score+=50;
        scoreEL.innerHTML = score;
    
        // במידה ואוכלים את המחזק אז זה מחלש את הרוחות
        ghosts.forEach(ghost =>{
            if(ghost.scared){
                clearTimeout(ghost.scaredTimeout);
            }
            ghost.scared = true;
            ghost.scaredTimeout = setTimeout(() => {
                ghost.scared = false;
            }, 6000);
        })
    }}

    
  //אוספים מטבעות
  for(let i = pellets.length - 1; 0<=i;i--){
    const pellet = pellets[i];
    pellet.draw();
    if(Math.hypot(pellet.position.x-player.position.x,
      pellet.position.y-player.position.y)< pellet.radius + player.radius){
        pellets.splice(i,1);
        score+=10;
        scoreEL.innerHTML = score;
    }}

  boundaries.forEach ((boundary) =>{
    boundary.draw();

    if(cCollidesWrecP({
      circle: player,
      rectangle: boundary
    })){
        player.velocity.x=0;
        player.velocity.y=0;
    }
  });
  player.update();

  ghosts.forEach(ghost =>{
    
    ghost.update();
    
    const collisions=[];
    boundaries.forEach(boundary =>{
      if(!collisions.includes('right')&&cCollidesWrecG({
        circle: {...ghost,velocity:{
          x:ghost.speed,
          y:0
        }},
        rectangle: boundary
      })){
        collisions.push('right')
      }
      if(!collisions.includes('left')&&cCollidesWrecG({
        circle: {...ghost,velocity:{
          x:-ghost.speed,
          y:0
        }},
        rectangle: boundary
      })){
        collisions.push('left')
      }
      if(!collisions.includes('down')&&cCollidesWrecG({
        circle: {...ghost,velocity:{
          x:0,
          y:ghost.speed
        }},
        rectangle: boundary
      })){
        collisions.push('down')
      }
      if(!collisions.includes('up')&&cCollidesWrecG({
        circle: {...ghost,velocity:{
          x:0,
          y:-ghost.speed
        }},
        rectangle: boundary
      })){
        collisions.push('up')
      }
  })
    if(collisions.length>ghost.prevCollisions.length)
    ghost.prevCollisions=collisions
  
    if(JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)){
      if(ghost.velocity.x>0)
        {ghost.prevCollisions.push('right')}
      else if(ghost.velocity.x<0)
         {ghost.prevCollisions.push('left')}
      else if(ghost.velocity.y>0) 
        {ghost.prevCollisions.push('down')}
      else if(ghost.velocity.y<0) 
        {ghost.prevCollisions.push('up')}
      const pathWays = ghost.prevCollisions.filter((collision)=>
        {return !collisions.includes(collision)}) 
        const direction = pathWays [Math.floor(Math.random()*pathWays.length)]
        switch (direction) {
          case 'down':
            ghost.velocity.y = ghost.speed;
            ghost.velocity.x = 0;
            break
          case 'up':
            ghost.velocity.y = -ghost.speed;
            ghost.velocity.x = 0;
            break
          case 'right':
            ghost.velocity.y = 0;
            ghost.velocity.x = ghost.speed;
            break
          case 'left':
            ghost.velocity.y = 0;
            ghost.velocity.x = -ghost.speed;
            break
        }
        ghost.prevCollisions=[];
        //השחקן יוצא מצד אחד וחוזר בצד אחר
    if (player.position.x +  player.radius > canvas.width-0) {
      player.position.x = 0 - player.radius;
    } else if (player.position.x< 0 - player.radius) {
      player.position.x = canvas.width - player.radius;
    }
  }
  })
  //מסובב את השחקן
  if (player.velocity.x<0){ player.rotation = Math.PI;}
  else if (player.velocity.x>0){ player.rotation =0;}
  else if (player.velocity.y<0){ player.rotation = Math.PI * 1.5;}
  else if (player.velocity.y>0){ player.rotation = Math.PI /2;}

  console.log(player.speed)
  console.log(Ghost.speed)

}
addEventListener('keydown',({key}) => {
switch (key){
  case 'ArrowUp':
    keys.ArrowUp.pressed = true;
    lastKey='ArrowUp';
    break
  case 'ArrowDown':
    keys.ArrowDown.pressed = true;
    lastKey='ArrowDown';
    break
  case 'ArrowRight':
    keys.ArrowRight.pressed = true;
    lastKey='ArrowRight';
    break
  case 'ArrowLeft':
    keys.ArrowLeft.pressed = true;
    lastKey='ArrowLeft';
    break
}})

function startGame(){
  startDiv.style.display = "none";
  gameScore.style.display = "block";
  gameOver.style.display = "none";
  createMap();
  animate();
}
function winGame(){
  canvas.style.display = "none";
  startDiv.style.display = "none";
  gameScore.style.display = "none";
  scoreEL.style.display = "none"
  gameOver.style.display = "none";
  winGameDiv.style.display="block";
  cancelAnimationFrame(animationId) 
}