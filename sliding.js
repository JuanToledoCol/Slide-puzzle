var context = document.getElementById('puzzle').getContext('2d');

//Puzzle image
//--------------------------------------------------------------------
var img = new Image();
img.src = './image/Logo.jpg'; //Poner la ruta de la imagen
img.addEventListener('load', drawTiles, false);

//Puzzle variables
var boardSize = document.getElementById('puzzle').width;
var tileCount = document.getElementById('scale').value;
if (!localStorage.getItem('scale')) {
  localStorage.setItem('scale', tileCount);
} else {
  tileCount = localStorage.getItem('scale');
}
var tileSize = boardSize / tileCount;

var clickLoc = new Object;
clickLoc.x = 0;
clickLoc.y = 0;

var emptyLoc = new Object;
emptyLoc.x = 0;
emptyLoc.y = 0;

count = 0;

//Titulo Variables
let titulo = ''
if (!localStorage.getItem('titulo')) {
  localStorage.setItem('titulo', titulo);
} else {
  titulo = localStorage.getItem('titulo');
}

/* Config Fondo*/
let color = '#ff0fff';
if (!localStorage.getItem('fondo')) {
  localStorage.setItem('fondo', color);
} else {
  color = localStorage.getItem('fondo');
}

// Variable CountDown
// Get the countdown element from the DOM
var countdownElement = document.getElementById("countdown");
let timeLimitMinutes = 2;
let timeLimitSeconds = 0;
if (!localStorage.getItem('timeLimitMinutes') && !localStorage.getItem('timeLimitSeconds')) {
  localStorage.setItem('timeLimitMinutes', timeLimitMinutes);
} else {
  timeLimitMinutes = localStorage.getItem('timeLimitMinutes');
}
countdownElement.innerHTML = "0" + timeLimitMinutes + ":00";

var boardParts;
setBoard();

window.onload = function () {
  document.getElementById('count').value = count;
  document.getElementById('scale').value = tileCount;
  document.getElementById('body').style.backgroundColor = localStorage.getItem('fondo');
  document.getElementById('titulo').textContent = localStorage.getItem('titulo');
  timeLimitMinutes = localStorage.getItem('timeLimitMinutes');
  timeLimitSeconds = localStorage.getItem('timeLimitSeconds');
}

document.getElementById('scale').onchange = function () {
  count = 0;
  document.getElementById('count').value = count;
  tileCount = this.value;
  localStorage.setItem('scale', tileCount);
  tileSize = boardSize / tileCount;
  setBoard();
  drawTiles();
};

let initF = false;

document.getElementById('puzzle').onclick = function (e) {
  if (!initF) {
    initF = true;
    countdown();
  }
  clickLoc.x = Math.floor((e.pageX - this.offsetLeft) / tileSize);
  clickLoc.y = Math.floor((e.pageY - this.offsetTop) / tileSize);
  if (distance(clickLoc.x, clickLoc.y, emptyLoc.x, emptyLoc.y) == 1) {
    slideTile(emptyLoc, clickLoc);
    drawTiles();
  }
  if (solved) {
    swal.fire({
      title: "¡Ganaste!",
      text: "Completaste el juego en " + count + " movimientos.",
      icon: "success",
      confirmButtonText: "Jugar de nuevo",
      confirmButtonColor: "#15eb18",
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        location.reload();
        setBoard();
        drawTiles();
      }
    })
  }
};

document.getElementById('challenge_button').onclick = function (e) {
  count = 0;
  document.getElementById('count').value = count;
  location.reload();
  setBoard();
  drawTiles();
}

document.getElementById('fondo').onchange = function (e) {
  color = e.target.value
  document.getElementById('body').style.backgroundColor = color
  localStorage.setItem('fondo', color);
}

//functions 

function setBoard() {
  boardParts = new Array(tileCount);
  for (var i = 0; i < tileCount; ++i) {
    boardParts[i] = new Array(tileCount);
    for (var j = 0; j < tileCount; ++j) {
      boardParts[i][j] = new Object;
      boardParts[i][j].x = (tileCount - 1) - i;
      boardParts[i][j].y = (tileCount - 1) - j;
    }
  }
  emptyLoc.x = boardParts[tileCount - 1][tileCount - 1].x;
  emptyLoc.y = boardParts[tileCount - 1][tileCount - 1].y;
  solved = false;
}

function drawTiles() {
  context.clearRect(0, 0, boardSize, boardSize);
  for (var i = 0; i < tileCount; ++i) {
    for (var j = 0; j < tileCount; ++j) {
      var x = boardParts[i][j].x;
      var y = boardParts[i][j].y;
      if (i != emptyLoc.x || j != emptyLoc.y || solved == true) {
        context.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize,
          i * tileSize, j * tileSize, tileSize, tileSize);
      }
    }
  }
}

function distance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}


function slideTile(toLoc, fromLoc) {
  if (!solved) {
    boardParts[toLoc.x][toLoc.y].x = boardParts[fromLoc.x][fromLoc.y].x;
    boardParts[toLoc.x][toLoc.y].y = boardParts[fromLoc.x][fromLoc.y].y;
    boardParts[fromLoc.x][fromLoc.y].x = tileCount - 1;
    boardParts[fromLoc.x][fromLoc.y].y = tileCount - 1;
    toLoc.x = fromLoc.x;
    toLoc.y = fromLoc.y;
    count++;
    document.getElementById('count').value = count;
    checkSolved();
  }
}

function checkSolved() {
  var flag = true;
  for (var i = 0; i < tileCount; ++i) {
    for (var j = 0; j < tileCount; ++j) {
      if (boardParts[i][j].x != i || boardParts[i][j].y != j) {
        flag = false;
      }
    }
  }
  solved = flag;
}

// Cambio Titulo
document.getElementById('icon').onclick = async () => {
  const { value: title } = await Swal.fire({
    title: 'Cambiar Título',
    input: 'text',
    inputPlaceholder: 'Escribe el nuevo título',
    showCancelButton: true,
    allowOutsideClick: false,
    inputValidator: (value) => {
      if(value == ''){
        document.getElementById('titulo').innerHTML = '';
        localStorage.setItem('titulo', '');
      }
    }
  })
  if (title) {
    Swal.fire(`¡Nuevo título: ${title}!`)
    document.getElementById('titulo').innerHTML = title
    localStorage.setItem('titulo', title);
  }
}


// Convert the time limit to seconds
var timeLimit = timeLimitMinutes * 60 + timeLimitSeconds - 1;

function countdown() {

  var countdownInterval = setInterval(function () {
    // Calculate the minutes and seconds remaining
    let minutes = Math.floor(timeLimit / 60);
    let seconds = timeLimit - minutes * 60;
    // Display the remaining time
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    countdownElement.innerHTML = minutes + ":" + seconds + "";

    // Decrement the time limit
    timeLimit--;

    // Check if the countdown has ended
    if (timeLimit < 0) {
      clearInterval(countdownInterval);
      Swal.fire({
        title: "¡Perdiste!",
        text: "Se acabó el tiempo.",
        icon: "error",
        confirmButtonText: "Jugar de nuevo",
        confirmButtonColor: "#15eb18",
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          location.reload();
          setBoard();
          drawTiles();
        }
      })
    }
  }, 1000);

}

// Cambiar CountDown
countdownElement.onclick = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Cambiar Tiempo',
    html:
      '<input id="swal-input1" class="swal2-input" placeholder="Minutos">' +
      '<input id="swal-input2" class="swal2-input" placeholder="Segundos">',
    focusConfirm: false,
    allowOutsideClick: false,
    preConfirm: () => {
      return [
        document.getElementById('swal-input1').value,
        document.getElementById('swal-input2').value
      ]
    }
  })
  if (formValues) {
    Swal.fire(`¡Nuevo tiempo: ${formValues[0]}:${formValues[1]}!`)
    timeLimitMinutes = formValues[0];
    timeLimitSeconds = formValues[1];
    localStorage.setItem('timeLimitMinutes', timeLimitMinutes);
    localStorage.setItem('timeLimitSeconds', timeLimitSeconds);
    location.reload();
  }
}
