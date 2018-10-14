require('fastclick')(document.body);

var assign = require('object-assign');
var createConfig = require('./config');
var createRenderer = require('./lib/wander/createRenderer');
var createbeatGame = require('./lib/cbeat/beatGame');
var createLoop = require('raf-loop');
var contrast = require('wcag-contrast');

var canvas = document.querySelector('#canvas');
var background = new window.Image();
var context = canvas.getContext('2d');

var svg = document.querySelector('#svg');
var rect = document.querySelector('#rect');

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

/**************************OUR CODE *********************/

var music = new Audio("./audio/sound.m4a");
var playing = false;

/**************************OUR CODE *********************/

var randomize = (ev) => {
  if (ev) ev.preventDefault();
  reload(createConfig());
};
randomize();
resize();

/* first time run the game */
const startGame = () => {
  svg.style.display="none";
  music.play();
  var e = document.getElementById("start");
  e.innerText = "Tap when circle fills up!";
}

//TODO: change visibility
const addEvents = (element) => {
  element.addEventListener('mousedown', (ev) => {
    if (ev.button === 0) {
      console.log("mousedown on " + element + " @ (" + ev.clientX + "," + ev.clientY + ")");
      playing = (playing || startGame()) || playing;
      randomize(ev);
    }
  });
  element.addEventListener('touchstart', randomize);
};

const targets = [ document.querySelector('#fill'), canvas, document.getElementById("start"), svg];
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

    if (opts.debugLuma) {
      renderer.debugLuma();
    } else {
      renderer.clear();
      var stepCount = 0;
      loop.on('tick', () => {
        renderer.step(opts.interval);
        stepCount++;
        game.step(stepCount);
        if (!opts.endlessBrowser && stepCount > opts.steps && !music.ended) {
          loop.stop();
          console.log(music.duration);
          console.log(music.ended);
          randomize();
        }

        //TODO: Add blur here
        //TODO: Add score here
        //TODO: Add share here
        if(music.ended) {
          loop.stop();
          svg.style.display="block";
        }
      });
      loop.start();
    }
  };

  background.src = config.backgroundSrc;
}

function resize () {
  var winh = window.innerHeight;
  var winw = window.innerWidth;
  console.log("window inner size: " + winw + "x" + winh);

  letterbox(canvas, [ winw, winh ]);
  rect.style.x = winw / 4;
  rect.style.y = winh / 4;
  rect.style.width = winw / 2;
  rect.style.height = winh / 2;


  console.log("rect at (" + rect.style.x + "," + rect.style.y + ")");
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
