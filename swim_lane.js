function swimLane(data, colorKey) {
    console.log(data)
    let margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom,
        svg = d3.select('body').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    //    values
    var xStart = d => new Date(d['Start Date']),
        xEnd = d => new Date(d['Primary Completion Date']),
        yValue = d => xScale(xEnd(d))
    phaseValue = d => d["ADD_LOT"] ? d["ADD_LOT"] : d["ADD_LOT"] = 'No Phase'; //<-- 'null'


    //     x & y scales    
    var xScale = d3.scaleTime()
        .domain([d3.min(data, d => xStart(d)),
            d3.max(data, d => xEnd(d))
        ])
        .range([24, 900]);

    var yScale = d3.scaleBand()
        .domain(data.map(yValue).sort()) //<--y position is sorted by end dates
        .range([20, height - .1])
        .padding(0.1);

    //get the set of unique phases for labeling the legend
    var phases = [...new Set(data.map(phaseValue))]

    //assigne colors to phases
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(phases)



    //xAxis
    var xAxis = d3.axisBottom(xScale)

    //xAxis Group for year labels and tick marks
    var xAxisG = svg.append('g')
        .attr('class', 'axis')
        .call(xAxis.ticks(d3.timeYear))
        .call(g => g.select('.domain').remove())

    //xAxis ticks 
    xAxisG.selectAll('.tick line')
        .attr('y2', height)
        .attr('y1', 20)

    //creat another xAxis group for the month tick marks
    var monthTicks = svg.append('g')
        .attr('class', 'months')
        .call(xAxis.ticks(d3.timeMonth))
        .call(g => g.select('.domain').remove())

    //remove month labels
    monthTicks
        .selectAll(".tick text").remove()

    //month tick markes are not as long as year tick marks
    monthTicks
        .selectAll('.tick line')
        .attr('y2', height)
        .attr('y1', 25)
        .attr('opacity', .1)


    //#BARS
    var rWidth = d => xScale(xEnd(d)) - xScale(xStart(d))
    rWidths = data.map(rWidth)

    //bar label font size is proportional to bar width
    var fontScale = d3.scaleSqrt()
        .domain(d3.extent(rWidths))
        .range([10, 15])

    //add bars

    let colorValue = d => d[colorKey],
        colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
        fullColor = [...new Set(data.map(colorValue))].sort(),
        color = d => colors[fullColor.indexOf(colorValue(d))];

        const limitWidth = yScale.bandwidth() < 85 ? yScale.bandwidth() : 65

    var wrect = svg.selectAll('rect').data(data).enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(xStart(d))) //<-- x = value of Start Date
        .attr('y', d => yScale(yValue(d))) //<-- y is assigned by Completion Date
        .attr('height', limitWidth)
        .attr('width', d => rWidth(d)) //<--bar goes from Start to Completion
        .attr('fill', d => color(d)) //<--color code according to phase

    //labels   
    wrect.select('text').data(data).enter().append('text')
        .text(d => d['NCT Number'])
        .attr('class', 'nct')
        .attr('x', d => ((xScale(xStart(d)) + xScale(xEnd(d)))) / 2)
        .attr('y', d => yScale(yValue(d)) + limitWidth / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', d => fontScale(rWidth(d)))
        .attr('fill', 'white');
    console.log(limitWidth)
    //format star and end dates  
    var formatMonth = d3.timeFormat("%b, %Y"),
        dateLabelSize = fontScale(limitWidth);

    wrect.select('text').data(data).enter().append('text')
        .text(d => formatMonth(xStart(d)))
        .attr('text-anchor', 'end')
        .attr('x', d => xScale(xStart(d))) //<--position at bar start
        .attr('y', d => yScale(yValue(d)) + limitWidth / 2)
        .attr('font-size', d => dateLabelSize);

    wrect.select('text').data(data).enter().append('text')
        .text(d => formatMonth(xEnd(d)))
        .attr('text-anchor', 'start')
        .attr('x', d => xScale(xEnd(d))) //<--position at bar end
        .attr('y', d => yScale(yValue(d)) + limitWidth / 2)
        .attr('font-size', d => dateLabelSize);


    // Draw legend (addapted from Erik Vullings)
    var legendRectSize = 18,
        legendSpacing = 4,
        legHeight = legendRectSize + legendSpacing,
        legOffset = -30,
        legHorz = 400 + 335 + 40 - legendRectSize;

    var legend = svg.selectAll('.legend')
        .data(phases)
        .enter()
        .append('g')
        .attr('transform', (d, i) => {
            var vert = i * legHeight - legOffset;
            return 'translate(' + legHorz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', d => colorScale(d))
        .style('stroke', 'white')

    legend.append('text')
        .attr('class', 'legend')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(d => d);

}