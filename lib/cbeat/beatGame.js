

module.exports = function beatGame (opt) {
  opt = opt || {};
  var randFunc = opt.random || Math.random;
  var ctx = opt.context;
  var canvas = ctx.canvas;

  var width = canvas.width;
  var height = canvas.height;

  var count = opt.count || 0;
  var palette = opt.palette || ['#fff', '#000'];


  var time = 0;
  var speed = random(1,2);



  /*
    The object containing funcitonality of the
   */
  return {
    clear: clear,
    step: step
  }


  function step() {
    ctx.stroke();
  };

  function clear() {

  };
};
