var dpi = 96;

Array.prototype.last = function() {
    return this[this.length-1];
}

var play = false;
var playing = false;
var finished = false;
var currentSource = null;

var graphsBehind = [];
var graphsAhead = [];

var isDraw = true;
var count = 0;

require(["jquery", "renderer", "goi-machine"],
	function ($, renderer, Machine) {

		var machine = new Machine();

		function clearGraph(callback) {
      count = 0;
			renderer.render('digraph G {\n\t\n}');
      graphsBehind = [];
      graphsAhead = [];
			$("#ta-graph").val("");
			pause();
			setTimeout(callback, 100);
		}

		function draw(result) {
      if (result == null) {
        var width = $("#graph").width();
		    var height = $("#graph").height();
		    // update stage with new dot source
        var result = machine.graph.draw(width/dpi, height/dpi, machine.token.rewriteFlag);
      }
    $("#ta-graph").val(result);
    $("#stepcount")[0].innerText = "Step Count: " + count;
    if (isDraw)	renderer.render(result);
		}

    function makeGraph() {
      machine.compile(currentSource);
      draw();
      finished = false;
    }

		// register onClick event
		$("#btn-make-graph").click(function(event) {
      clearGraph(function() {
        currentSource = $("#ta-program").val();
        currentSource = currentSource.replace(/(\/\/)(.*)(\r\n|\r|\n|$)/g,"");
        makeGraph();
      });
		});

		$("#btn-refresh").click(function(event) {
      count = 0;
      graphsBehind = [];
      graphsAhead = [];
			makeGraph();
		});

    $("#btn-prev").click(function(event) {
      if (count > 0) count -= 1;
      if (graphsBehind.length > 0) {
        graphsAhead = [$("#ta-graph").val()].concat(graphsAhead);
        var result = graphsBehind[graphsBehind.length-1];
        graphsBehind.splice(-1,1);
        draw(result);
      }
    });

		$("#btn-play").click(function(event) {
			if (!playing) {
        play = true;
      } else {
        pause();
      }
      autoPlay();
		});

		function autoPlay() {
			if (play) {
        playing = true;
        next();
				if (isDraw) {
					setTimeout(autoPlay, 1000);
				} else {
					autoPlay();
        }
			} else {
				playing = false;
      }
		}

		function pause() {
			play = false;
			playing = false;
		}

		function next() {
      if (count <= machine.count) count += 1;
      if (graphsAhead.length == 0) {
  			if (!finished) {
          graphsBehind.push($("#ta-graph").val());
  				machine.transition();
  				draw();
  			}
      } else {
        graphsBehind.push($("#ta-graph").val());
        draw(graphsAhead[0]);
        graphsAhead = graphsAhead.slice(1);
      }
		}

		$("#btn-next").click(function(event) {
			pause();
			next();
		});

    $("#btn-skip").click(function(event) {
      play = true;
      isDraw = false;
      autoPlay();
      isDraw = true;
      draw();
    });


		renderer.init("#graph");
		$("#ta-program").val(ex6);
  		$("#btn-make-graph").click();
	}
);
