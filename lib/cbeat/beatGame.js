

module.exports = function beatGame (opt) {
  opt = opt || {};
  var randFunc = opt.random || Math.random;
  var ctx = opt.context;
  var canvas = ctx.canvas;

  var width = canvas.width;
  var height = canvas.height;


  var count = opt.count || 0;
  var palette = opt.palette || ['#fff', '#000'];


  var max_steps = opt.steps;

  /*
     This enables circle to appear several times
   */
  /*
  var loop_times = Math.random(max_steps/60) + 2;
  max_steps /= loop_times;
  */



  /*
    The object containing funcitonality of the
   */
  return {
    clear: clear,
    step: step
  };


  function step(curr_steps) {
    // Start a brand new layer

    curr_steps %= max_steps;
    ctx.beginPath();

    // Draw the outter circle
    curr_steps++;
    ctx.arc(width/2, height/2, max_steps, 0, 2*Math.PI,0);
    ctx.lineWidth=10;
    ctx.strokeStyle = "black";
    ctx.globalAlpha = 1;
    ctx.stroke();

    // Draw the inner moving circle
    ctx.beginPath();
    //ctx.arc(width/2, height/2, curr, 0, 2*Math.PI*(curr_steps/max_steps),0);
    ctx.arc(width/2, height/2, curr_steps, 0, 2*Math.PI,0);
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.35;
    ctx.fill();
  };

  function clear() {

  };
};
