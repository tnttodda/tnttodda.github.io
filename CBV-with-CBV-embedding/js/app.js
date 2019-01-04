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

require(["jquery", "renderer", "goi-machine"],
	function ($, renderer, Machine) {

		var machine = new Machine();
    var quotiening = true;

		function clearGraph(callback) {
			renderer.render('digraph G {\n\t\n}');
      graphsBehind = [];
      graphsAhead = [];
			$("#ta-graph").val("");
			pause();
			setTimeout(callback, 100);
		}

		function draw(result) {
      if (quotiening) machine.term.quotient();
      if (result == null) {
        var width = $("#graph").width();
		    var height = $("#graph").height();
		    // update stage with new dot source
        var result = machine.graph.draw(width/dpi, height/dpi, machine.token.rewriteFlag);
      }
    $("#ta-graph").val(result);
    if (isDraw)	renderer.render(result);
		}

    $('#cb-qrules').change(function() {
      quotiening = this.checked;
      $("#btn-refresh").click();
    });

    function makeGraph() {
      $("#graphTxt").val("");
      $("#linkTxt").val("");
      $("#flagTxt").val("");
      machine.compile(currentSource);
      draw();
      machine.printHistory($("#graphTxt"),$("#linkTxt"),$("#flagTxt"));
      finished = false;
    }

		// register onClick event
		$("#btn-make-graph").click(function(event) {
      clearGraph(function() {
        currentSource = $("#ta-program").val();
        makeGraph()
      });
		});

		$("#btn-save").click(function (event) {
		      var img = renderer.stage.getImage(false);
		      img.onload = function () {
		        $("#download").attr("href", img.src);
		        $("#download")[0].click();
		      };
		      event.preventDefault();
		});

		$("#btn-info").click(function (event) {
		      alert("hello there");
		});

		$('#cb-show-key').change(function() {
	        showKey = this.checked;
	        $("#btn-refresh").click();
   		 });

		$("#btn-refresh").click(function(event) {
      graphsBehind = [];
      graphsAhead = [];
			makeGraph();
		});

    $("#btn-prev").click(function(event) {
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
					setTimeout(autoPlay, 500);
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
      // console.log(machine.graph.findNodeByKey("nd32").outLinks);
      if (graphsAhead.length == 0) {
  			if (!finished) {
          graphsBehind.push($("#ta-graph").val());
  				machine.transition($("#graphTxt"), $("#linkTxt"), $("#flagTxt"));
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

		$("#ta-program").on('input', function() {
		    specialChar(this);
		}).trigger('input');

		var $stacks = $('#flag, #dataStack, #boxStack');
		var sync = function(e){
		    var $other = $stacks.not(this);
		    $other.get(0).scrollTop = this.scrollTop;
		    $other.get(1).scrollTop = this.scrollTop;
		}
		$stacks.on('scroll', sync);

		renderer.init("#graph");
		//renderer.init({element: "#graph", zoom: {extent: [0.1, 10]}})
		$("#ta-program").val(ex6);
  		$("#btn-make-graph").click();
	}
);

function specialChar(textarea) {
	text = textarea.value;
	if (text.includes("\\lambda")) {
		var selection = textarea.selectionStart;
		textarea.value = text.replace("\\lambda", "λ");
		textarea.setSelectionRange(selection-6, selection-6);
	}
}

/*
var info =
      "Instructions:" +
+ "\n  1. Choose an example from the drop down menu or create your own program"
+ "\n  2. Click '>>' button to display the graph"
+ "\n  3. Click ";
*/
