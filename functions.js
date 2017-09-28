function fillMap(selection, color, data) {

  selection
    .attr("fill", function(d) { return typeof data[d.id] === 'undefined' ? color_na :
                                              d3.rgb(color(data[d.id])); });
}

function setPathTitle(selection, data) {
    selection
    .text(function(d) { return "" + d.id + ", " +
                               (typeof data[d.id] === 'undefined' ? 'N/A' : data[d.id]); });
    console.log(data)
}

function updateMap(color, data) {

  // fill paths
  d3.selectAll("svg#map path").transition()
    .delay(100)
    .call(fillMap, color, data);

  // update path titles
  d3.selectAll("svg#map path title")
    .call(setPathTitle, data);

  // update headline
  d3.select("h3").text(d3.select("#year").node().value);
}

function renderComment(color, data){
  let svg_height = +d3.select("svg#bars").attr("height");
  let svg_width = +d3.select("svg#bars").attr("width");
  let legend_items = pairQuantiles(color.domain());

  let comment = d3.select("svg#bars g.comment").selectAll('h1').data(color.range());

  comment.exit().remove();

  comment.enter().append("text").merge(comment)
          .attr("y", (svg_height-150))
          .attr("x", (svg_width -600))
      .attr("font-family","Arial")
      .attr("font-size","9pt")
      .attr("fill","#727272")
      .attr("letter-spacing", ".15em")
      .text("* data provided by u.s department of homeland security");
}

function renderLegend(color, data) {

  var remove = 130;
  let svg_height = +d3.select("svg#map").attr("height");
  let legend_items = pairQuantiles(color.domain());

  let legend = d3.select("svg#map g.legend").selectAll("rect")
               .data(color.range());

  legend.exit().remove();

  legend.enter()
          .append("rect")
        .merge(legend)
          .attr("width", "100")
          .attr("height", "25")
          .attr("y", function(d, i) { return (svg_height-29-remove) - 25*i; })
          .attr("x", 40)
          .attr("fill", function(d, i) { return d3.rgb(d); })
          .on("mouseover", function(d) { legendMouseOver(d, color, data); })
          .on("mouseout", function() { legendMouseOut(color, data); });
    
  let legend_head = d3.select("svg#map g.legend_head").selectAll("rect")
               .data(color.range()); 

  legend_head.exit().remove();

  legend_head.enter()
      .append("rect")
    .merge(legend_head)  
      .attr("width", "100")
      .attr("height", "24")
      .attr("y", (svg_height-128-remove))
      .attr("x", 40)
      .attr("fill", '#ddd')
      .attr('z-index', '-1');
  
 let legend_title = d3.select("svg#map g.legend_head").selectAll("text");

   legend_title.data(legend_items)
      .enter().append("text").merge(legend_title)
        .attr("x", 73)
        .attr("y",315-remove)
        .attr("font-family","Arial")
        .attr("font-size","9pt")
        .attr("fill","#727272")
        .attr("letter-spacing", ".3em")
        .text("KEY");

  let text = d3.select("svg#map g.legend").selectAll("text");

    text.data(legend_items)
    .enter().append("text").merge(text)
      .attr("x", 56)
      .attr("y",339-remove)
      .attr("font-family","Arial")
      .attr("font-size","9pt")
      .attr("fill","#FFFCF6")
      .attr("letter-spacing", ".15em")
      .text("Above 100");

    text.data(legend_items)
    .enter().append("text").merge(text)
      .attr("x", 56)
      .attr("y",339-remove)
      .attr("font-family","Arial")
      .attr("font-size","9pt")
      .attr("fill","#FFFCF6")
      // .attr("fill","#FFFCF6")
      .attr("letter-spacing", ".15em")
      .text("Above 100");

    text.data(legend_items)
    .enter().append("text").merge(text)
      .attr("x", 60)
      .attr("y",364-remove)
      .attr("font-family","Arial")
      .attr("font-size","9pt")
      .attr("fill","#FFFCF6")
      .attr("letter-spacing", ".15em")
      .text("50 - 100");

    text.data(legend_items)
    .enter().append("text").merge(text)
      .attr("x", 66)
      .attr("y",389-remove)
      .attr("font-family","Arial")
      .attr("font-size","9pt")
      .attr("fill","#FFFCF6")
      .attr("letter-spacing", ".15em")
      .text("1 - 50");

    text.data(legend_items)
    .enter().append("text").merge(text)
      .attr("x", 69)
      .attr("y",415-remove)
      .attr("font-family","Arial")
      .attr("font-size","9pt")
      .attr("fill","#727272")
      .attr("letter-spacing", ".15em")
      .text("None");

}

function renderBars(color, data) {

  // turn data into array of objects
  array = [];
  for( let key of Object.keys(data)) {
    array.push({'id':key, 'value': data[key]})
  }

  // sort by value, how many bars to show
  array = sortArrObj(array, 'value', barnum);

  x.domain(array.map(function(d) {return d.id;}));
  y.domain([0, d3.max(Object.values(data), function(d) {return d;})]);

  d3.select("svg#bars g.axis").remove();

  let axis = d3.select("svg#bars").append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate("+ 0 +"," + (svgBarsHeight+margin.top) + ")")
              .call(d3.axisBottom(x))
                .selectAll("text")
                  .style("text-anchor", "end")
                  .attr("dx", "-.8em")
                  .attr("dy", ".15em")
                  .attr("transform", "rotate(-65)");

  let bars = d3.select("svg#bars g.bars").selectAll("rect").data(array);
  bars.exit().remove();
  bars.enter().append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d.value); })
        .attr("x", function(d) { return x(d.id) - 30; })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) {return svgBarsHeight - y(d.value); });

  let annot = d3.select("svg#bars g.bars").selectAll("text").data(array);
  annot.exit().remove();
  annot.enter().append("text")
        .merge(annot)
        .text(function(d) {return d.value;})
        .attr("class", "barlabel")
        .attr("font-size", barfont)
        .attr("x", function(d) { return x(d.id) + x.bandwidth()/2 -30; })
        .attr("y", function(d) { return y(d.value) - 5 })
        .attr("fill","black");
}


function calcColorScale(data) {

  // TODO: minor, check how many data points we've got
  // with few datapoints the resulting legend gets confusing

  // get values and sort

  let data_values = Object.values(data).sort( function(a, b){ return a-b; });

  quantiles_calc = quantiles.map( function(elem) {
                  return Math.ceil(d3.quantile(data_values, elem));
  });

  // let scale = d3.scaleQuantile()
  //             .domain(data_values) //quantiles_calc
  //             .range(d3.schemeReds[(quantiles_calc.length)-1]);

  var scale = d3.scaleThreshold()
      .domain([1, 50, 100])
      .range(d3.schemeReds[(quantiles_calc.length)-2]);

  return scale;
}

/// event handlers /////

function legendMouseOver(color_key, color, data) {

  // cancels ongoing transitions (e.g., for quick mouseovers)
  d3.selectAll("svg#map path").interrupt();

  // then we also need to refill the map
  d3.selectAll("svg#map path")
    .call(fillMap, color, data);

  // and fade all other regions
  d3.selectAll("svg#map path:not([fill = '"+ d3.rgb(color_key) +"'])")
      .attr("fill", color_na);
}

function legendMouseOut(color, data) {

  // refill entire map
  d3.selectAll("svg#map path").transition()
    .delay(100)
    .call(fillMap, color, data);
}

// sorts an array of equally structured objects by a key
function sortArrObj(arr,sortkey, numbars) {

  var result = arr.sort(function(a, b) {
  return b.value - a.value;
  });
  return result.slice(0,numbars);
}

// pairs neighboring elements in array of quantile bins
function pairQuantiles(arr) {

  new_arr = [];
  for (let i=0; i<arr.length-1; i++) {

    // allow for closed intervals (depends on d3.scaleQuantile)
    // assumes that neighboring elements are equal
    if(i == arr.length-2) {
      new_arr.push([arr[i],  arr[i+1]]);
    }
    else {
      new_arr.push([arr[i], arr[i+1]-1]);
    }
  }

  new_arr = new_arr.map(function(elem) { return elem[0] === elem[1] ?
    d3.format(",")(elem[0]) :
    d3.format(",")(elem[0]) + " - " + d3.format(",")(elem[1]);
  });

  return new_arr;
}
