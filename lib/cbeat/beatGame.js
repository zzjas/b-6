

module.exports = function beatGame (opt) {
  opt = opt || {};
  var playing = false;

  var ctx = opt.context;

  var width = canvas.width;
  var height = canvas.height;


  var curr_s = 0;
  var max_steps = opt.steps;

  var score = 0;
  var combo = 0;
  var max_combo = 0;
  var result = "";

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
    start: start,
    hold: hold,
    press: press,
    step: step
  };


  function start() { playing = true; }

  function hold() { playing = false; }


  function step(curr_steps) {
    if(playing) {
      curr_s = curr_steps;
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
      ctx.globalAlpha = 0.25;
      ctx.fill();
    }
  };

  function press() {
    return curr_s/max_steps;
  };
};
