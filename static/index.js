$(document).ready(function() {
    //initialisation is done for the elements and css adjusted as per the use case
    $(".loader").css("visibility", "hidden");
    $("#datavalues").css("visibility", "hidden");
    $('#addminmax').prop('disabled', true);

    //initial variables declared
    var xdata = []
    var ydata = []
    cdata = []
    var data = []
    var counter = 0;
    var dps = []; // dataPoints
    var num = 1;
    c= 0 ;
    checker = 0;
    var xVal = 0;
    var realtime;

    //chart initialised: Canvas JS Chart is Used, this chart is for the single trace data fetch
    var chart = new CanvasJS.Chart("chartContainer", {
      title :{
        text: ""
      },
      axisX:{
        title: "THz",
        reversed: true,
        
      },
      animationEnabled: true,
      zoomEnabled: true,
      rangeChanged: function (e){
        if(e.axisX[0].viewportMinimum!=null && e.trigger == "zoom")
        {
              alert("Selected Range Details:"+ "\n" +"AxisX Minimum Value: " + e.axisX[0].viewportMinimum + "THz" + "\n" +
        "AxisX Maximum Value : " + e.axisX[0].viewportMaximum + "THz");
        }
      },
      axisY: {
        title: "dbM",
        includeZero: false
      },   
      data: [{
        type: "line",
        dataPoints: dps
      }]
    });

    //Canvas JS chart is used to acquire real time data
    var chart_single = new CanvasJS.Chart("chartContainer2", {
      title :{
        text: ""
      },
      axisX:{
        title: "THz",
        reversed: true,
        
      },
      animationEnabled: true,
      zoomEnabled: true,
      axisY: {
        title: "dbM",
        includeZero: false
      },    
      data: cdata
    });
    $('#stop').prop('disabled', true);
  //  $('#reset').prop('disabled', true);

      //click function when clicked on start button
    $("#start").click(function(){
      chart.data =[];
      $("#datavalues").css("visibility", "visible");
      $("#datavalues").height( 300 );
      $(".loader").css("visibility", "visible");
      $('#single').prop('disabled', true);
      $('#stop').prop('disabled', false);
      $('#start').prop('disabled', true);
      $.getJSON( "https://flaskosanalyzer.herokuapp.com/start", function( data ) {
        if(data.response == "OK")
        {
          calltrace();
          //called real-time every second untill someone clicks on stop
          window.realt = setInterval(function(){dps=[];calltrace()},1000); 
          $( ".logs" ).empty();
          for(var ij=0; ij<data.listofcommands.length;ij++)
          {
            $(".logs").append("<p>"+data.listofcommands[ij]+"</p>");
          }
        }
        else{
          $(".loader").css("visibility", "hidden");
          $("p").first().text("Backend Error. Please Refresh Page and Try Again.");
        }
      });       
    });

    //function to call trace
    var calltrace = function(){
      $.getJSON( "https://flaskosanalyzer.herokuapp.com/gettrace", function( data ) {
        $.each( data['ydata'], function( key, val ) {
          $('#dv').append("<tr><td>"+val+ "</td><td>"+data['xdata'][key]+"</td></tr>");
           });
        var rydata = data.ydata;
        var rxdata = data.xdata;
        var datacounter = data.count;
        updateChart2(datacounter,rydata,rxdata);
    });
    }

    //function to update second chart-> real-time
      var updateChart2 = function (datacounter,ydata,xdata) {
      if(checker < 1)
      {
        for (var j = 0; j < datacounter; j++) {
        dps.push({
          x: xdata[j],
          y: ydata[j]
          });
      }
      cdata.push({type:"line",dataPoints:dps});
      $(".loader").css("visibility", "hidden");
        chart_single.render();
        return j;
      }
      else{
        return 1;
      }
    }; 

    //function called when clicked on stop button
    $("#stop").click(function(){
      $('#single').prop('disabled', true);
      $('#start').prop('disabled', false);
      $('#stop').prop('disabled', true);
      $('#reset').prop('disabled', false);
    });

    $("#addminmax").click(function(){
      $("#myForm").prepend('<input type="text" id="min" name="min" class="form-control form-control-lg" placeholder="Enter range minimum value greater than 1515"/><br>');
      $("#myForm").prepend('<input type="text" id="max" name="max" class="form-control form-control-lg" placeholder="Enter range maximum value less than 1580"/><br>');
      $('#addminmax').prop('disabled', true);
    });

    $("#text").on("input", function() {
      if($(this).val() == "LIM")
      {
        $('#addminmax').prop('disabled', false);
      }
      else{
        $('#addminmax').prop('disabled', true);
      }
    });
      
  //function used to get input value of the command written and return output
    $('#myForm').submit(function(e) {
      var $inputs = $('#myForm :input');
      var values = {};
      $inputs.each(function() {
          values[this.name] = $(this).val();
      });
      var output = '';
      var listofcommands = [];        
      if(values['min'] && values['max'])
      {var url = "https://flaskosanalyzer.herokuapp.com/postcommand/"+values['text']+","+values['min']+","+values['max'];}
      else{
        var url = "https://flaskosanalyzer.herokuapp.com/postcommand/"+values['text'];
      }
      $.getJSON( url, function( data ) {
        output = data.result;
        $("#min").remove();
        $("#max").remove();
        $('#stop').prop('disabled', false);
        listofcommands = data.listofcommands;
        $("#output").text(output);
        $( ".logs" ).empty();
        for(var ij=0; ij<listofcommands.length;ij++)
        {
          $(".logs").append("<p>"+listofcommands[ij]+"</p>");
        }
      });
      e.preventDefault();
      });
  
    //function called when clicked on the single button
    $("#single").click(function(){
      $("#datavalues").css("visibility", "visible");
      $("#datavalues").height( 300 );
      $(".loader").css("visibility", "visible");
      $("#chartContainer2").css("visibility", "hidden");
      $('#stop').prop('disabled', true);
      //API called to get single trace
      $.getJSON( "https://flaskosanalyzer.herokuapp.com/single", function( data ) {
      if(data.response == "OK")
      {
        $.getJSON( "https://flaskosanalyzer.herokuapp.com/gettrace", function( data ) {
          var items = [];
          $.each( data['ydata'], function( key, val ) {
       $('#dv').append("<tr><td>"+val+ "</td><td>"+data['xdata'][key]+"</td></tr>");
      });
      if(data['status'] == 'success')
      {
        $('#start').prop('disabled', true);
        $('#single').prop('disabled', true);
        var ydata = data['ydata'];
        var xdata = data['xdata'];
        var datacount = data['count'];
        counter = datacount;
      }
      $( ".logs" ).empty();
      for(var ij=0; ij<data.listofcommands.length;ij++)
      {
        $(".logs").append("<p>"+data.listofcommands[ij]+"</p>");
      }
      var updateChart = function (count,ydata,xdata) {
      count = count || 1;
      for (var j = 0; j < count; j++) {
        if(xVal<datacount)
        {
          dps.push({
            x: xdata[xVal],
            y: ydata[xVal]
          });
          xVal++;
        }
      if(xVal>datacount)
        {
        $('#reset').prop('disabled', false);
        return xVal;
        }
      }  
      //graph scrolled to right whenever data appends to the graph
      $( "#graph" ).scrollLeft( 100 );
      $(".loader").css("visibility", "hidden");
      chart.render();
      return xVal;
      };  
    
      var callagain = function(num)
      {
        setTimeout(function()
        { 
        returned_val = updateChart(100,ydata,xdata);
        if(returned_val > 98 && returned_val < datacount)
          {
          callagain(num);
        }
        else{
          $('#reset').prop('disabled', false);
        }
        },100);
        num++;
      }
      //function called within timeout to append values
      callagain(num);
      });
      }
      else{
        $(".loader").css("visibility", "hidden");
        $("p").first().text("Backend Error. Please Refresh Page and Try Again.");
      }
    });
  });

    //function called when stop button is clicked
    $("#stop").click(function(){
      checker = 1;
      for (var i = 0; i < 2999; i++)
      {window.clearInterval(i);}
      $.getJSON( "https://flaskosanalyzer.herokuapp.com/stop", function( data ) {
        var items = [];
        $.each( data, function( key, val ) {
        items.push(val);
        });
        $( ".logs" ).empty();
        for(var ij=0; ij<data.listofcommands.length;ij++)
        {
          $(".logs").append("<p>"+data.listofcommands[ij]+"</p>");
        }
      });
    });
  });
