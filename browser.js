require('fastclick')(document.body);

var assign = require('object-assign');
var createConfig = require('./config');
var createRenderer = require('./lib/wander/createRenderer');
var createbeatGame = require('./lib/cbeat/beatGame');
var createLoop = require('raf-loop');
var contrast = require('wcag-contrast');

var canvas = document.querySelector('#canvas');
var background = new window.Image();
background.crossOrigin = "Anonymous";
var context = canvas.getContext('2d');

var loop = createLoop();
var seedContainer = document.querySelector('.seed-container');
var seedText = document.querySelector('.seed-text');

var isIOS = /(iPad|iPhone|iPod)/i.test(navigator.userAgent);

if (isIOS) { // iOS bugs with full screen ...
  const fixScroll = () => {
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 500);
  };

  fixScroll();
  window.addEventListener('orientationchange', () => {
    fixScroll();
  }, false);
}

window.addEventListener('resize', resize);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
canvas.style.position = 'absolute';

/************************** Important *********************/

var music = new Audio("./audio/test.mp3");
var playing = false;

var score = 0;
var combo = 0;
var max_combo = 0;
var result = "";

function updateScoreBoard(userRatio) {
  let tmp = score;
  if(userRatio > 0.98) {
    score += 6;
    combo++;
    result = "SSS+++";
  }
  else if(userRatio > 0.95) {
    score += 3;
    combo++;
    result = "Perfect";
  }
  else if(userRatio > 0.9) {
    score += 1;
    combo++;
    result = "Good";
  }
  else {
    combo = 0;
    result = "Miss";
  }
  max_combo = (combo > max_combo) ? combo : max_combo;
  //console.log(result + " + " + (score - tmp));
  //
  document.getElementById('score').innerText = "Score: " + score;;
  document.getElementById('combo').innerText = "Combo: " + combo;
  document.getElementById('max_combo').innerText = "Max Combo: " + max_combo;
  document.getElementById('result').innerText = result;
}

/************************** Important *********************/

var randomize = (ev) => {
  if (ev) ev.preventDefault();
  reload(createConfig());
};
randomize();
resize();

/* first time run the game */
const startGame = () => {
  music.play();
  var e = document.getElementById("start");
  e.innerText = "Tap Screen or Press Space when circle fills up!";
}

//TODO: change visibility
const addEvents = (element) => {
  element.addEventListener('mousedown', (ev) => {
    if (ev.button === 0) {
      playing = (playing || startGame()) || true;
      randomize(ev);
    }
  });
  element.addEventListener('touchstart', ()=>{
    playing = (playing || startGame()) || true;
    randomize();
  });
};

const targets = [ document.querySelector('#fill'), canvas, document.getElementById("start") ];
targets.forEach(t => addEvents(t));

function reload (config) {
  loop.removeAllListeners('tick');
  loop.stop();

  var opts = assign({
    backgroundImage: background,
    context: context
  }, config);

  var pixelRatio = typeof opts.pixelRatio === 'number' ? opts.pixelRatio : 1;
  canvas.width = opts.width * pixelRatio;
  canvas.height = opts.height * pixelRatio;

  document.body.style.background = opts.palette[0];
  seedContainer.style.color = getBestContrast(opts.palette[0], opts.palette.slice(1));
  seedText.textContent = opts.seedName;

  background.onload = () => {
    var renderer = createRenderer(opts);
    var game = createbeatGame(opts);

    game.start();
    if(!playing) { game.hold(); }

    document.body.onkeyup = (e) => {
      if(e.which === 32) {
        console.log('Pressed space');
        var userRatio = game.press();
        updateScoreBoard(userRatio);
        loop.stop();
        randomize();
      }
    };

    const userPlay = (element) => {
      element.addEventListener('mousedown', (ev)=>{
        console.log("mousedown @ (" + ev.clientX + "," + ev.clientY + ")");
        var userRatio = game.press();
        //console.log("Press Once, ratio is " + userRatio);
        updateScoreBoard(userRatio);
        loop.stop();
        randomize();
      });
      element.addEventListener('touchstart', ()=> {
        var userRatio = game.press();
        //console.log("Press Once, ratio is " + userRatio);
        updateScoreBoard(userRatio);
        loop.stop();
        randomize();
      });
    };

    targets.forEach(t => userPlay(t));

    if (opts.debugLuma) {
      renderer.debugLuma();
    } else {
      renderer.clear();
      var stepCount = 0;
      console.log('Game start!!!!!');
      loop.on('tick', () => {
        renderer.step(opts.interval);
        stepCount++;
        game.step(stepCount);
        if (!opts.endlessBrowser && stepCount > opts.steps && !music.ended) {

          loop.stop();
          randomize();
        }

        //TODO: Add blur here
        //TODO: Add score here
        //TODO: Add share here
        if(music.ended) {
          loop.stop();
          alert("Good Game!")
        }
      });
      loop.start();
    }
  };

  background.src = config.backgroundSrc;
}

function resize () {
  letterbox(canvas, [ window.innerWidth, window.innerHeight ]);
}

function getBestContrast (background, colors) {
  var bestContrastIdx = 0;
  var bestContrast = 0;
  colors.forEach((p, i) => {
    var ratio = contrast.hex(background, p);
    if (ratio > bestContrast) {
      bestContrast = ratio;
      bestContrastIdx = i;
    }
  });
  return colors[bestContrastIdx];
}

// resize and reposition canvas to form a letterbox view
function letterbox (element, parent) {
  var aspect = element.width / element.height;
  var pwidth = parent[0];
  var pheight = parent[1];

  var width = pwidth;
  var height = Math.round(width / aspect);
  var y = Math.floor(pheight - height) / 2;

  if (isIOS) { // Stupid iOS bug with full screen nav bars
    width += 1;
    height += 1;
  }

  element.style.top = y + 'px';
  element.style.width = width + 'px';
  element.style.height = height + 'px';
}
