function pizzaChart() {
    let margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        selectSlice,
        data = [],
        updateData,
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom,
        slices,
        phaseKey,
        phasesSet,
        rKey = 'Primary Completion Date',
        cwidth = width / 20,
        colorKey,
        colorSet,
        outDataOpacity = 0,
        columnDepth = 3,
        toppingSize = 190,
        toppings,
        tags = 'Label Index',
        left_Legend_xPosition = -cwidth * 9,
        right_Legend_xPosition = 380;

    function chart(selection) {
        selection.each(function () {
            //acessor funciton. these will come in handy later
            let sliceValue = d => d[slices],
                sliceSet = [...new Set(data.map(sliceValue))],
                phaseValue = d => d[phaseKey],
                colorValue = d => d[colorKey];

            const pieGen = d3.pie()
            // .startAngle(60 * Math.PI/180)
            // .endAngle(60 * Math.PI/180 + 2*Math.PI)
            arcGen = d3.arc();

            //==== if there is no svg group, then creat one and center it ===================//

            var svg = d3.select(this).select("svg > g");
            if (svg.empty()) {
                var svg = d3.select(this).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            }
            //============================================================================//

            //format possible r values//
            data.map((d, i) => d['Primary Completion Date'] = +new Date(d['Primary Completion Date']) + Math.floor(Math.random() * 1000)) //add i to prevent colissions
            data.map((d, i) => d['Label Index'] = +d['Label Index'])
            phasesSet.reverse()

            //counts and percentages for caluclations
            const sliceCount = d3.nest()
                .key(d => d[slices])
                .rollup(v => v.length)
                .object(data)

            const relativeSliceCount = d3.nest()
                .key(d => d[slices])
                .rollup(v => v.length)
                .object(data.filter(d => colorSet.includes(colorValue(d))))

            const phaseCount = d3.nest()
                .key(d => d[phaseKey])
                .rollup(v => v.length)
                .object(data.filter(d => colorSet.includes(d[colorKey])))

            const sliceByPhase = d3.nest()
                .key(d => d[phaseKey])
                .key(d => d[slices])
                .object(data)

            const colorCount = d3.nest()
                .key(d => d[colorKey])
                .rollup(v => v.length)
                .object(data.filter(d => colorSet.includes(d[colorKey])))

            const shapeCount = d3.nest()
                .key(d => colorSet.includes(d[colorKey]))
                .key(d => d[toppings])
                .rollup(v => v.length)
                .object(data)


            const totalIncluded = d3.values(colorCount).reduce((acc, val) => acc + val)

            const sc = d3.values(sliceCount)


            ///creat an object s.t. {phasesSet.index:[list of value counts for slices]}
            const gen = Object.fromEntries(phasesSet.map((x, i) => [i, sc]))

            //use with parentIndex of arcs to determin arcWidth for each arc
            const phaseCountMap = Object.fromEntries(phasesSet.map((x, i) => [i, phaseCount[x]]))
            const phaseSum = d3.values(phaseCountMap).reduce((a, v) => a + v)

            const phaseProp = Object.fromEntries(phasesSet.map((x, i) => [i, phaseCount[x] / phaseSum]))

            const prop = d3.values(phaseProp)
            const p = d => prop[d]
            const g = d => d === 0 ? 0 : (d - 1)
            const h = d => cwidth * g(d) > .2 ? cwidth + 5 : cwidth

            const blugr = ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'].reverse(),
                blupur = ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'].reverse(),
                blublu = ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'].reverse(),
                bluorg = ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'].reverse(),
                bluvi = ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'].reverse(),
                yelgr = ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'].reverse(),
                yelvi = ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'].reverse(),
                yelblu = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'].reverse(),
                yelor = ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'].reverse(),
                grey = ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'].reverse(),

                pallet = [blugr,
                    bluorg,
                    bluvi,
                    blupur,
                    blublu,
                    yelgr,
                    yelvi,
                    yelblu,
                    yelor,
                    grey
                ];

            const sliceColor = d3.scaleOrdinal();



            //    color scale
            let colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
                fullColor = [...new Set(data.map(colorValue))].sort()
            // missingValue = d => colorSet.includes(d) ? colorSet.indexOf(d) : colorSet.length + fullColor.indexOf(d)
            // fullColor.sort((a, b) => missingValue(a) - missingValue(b)) //<--complete color set from original data
            color = d => colors[fullColor.indexOf(colorValue(d))], //< -- just added 9 - full color
                op = d => colorSet.includes(colorValue(d)) ? 1 : outDataOpacity //<--obscure data not in the colorSet


            // toppings
            const circle = d3.symbol().type(d3.symbolCircle).size(toppingSize)(),
                square = d3.symbol().type(d3.symbolSquare).size(toppingSize)(),
                triangleU = d3.symbol().type(d3.symbolTriangle).size(toppingSize)(),
                cross = d3.symbol().type(d3.symbolCross).size(toppingSize)(),
                diamond = d3.symbol().type(d3.symbolDiamond).size(toppingSize)(),
                star = d3.symbol().type(d3.symbolStar).size(toppingSize)();

            const shapeValue = d => d[toppings],
                shapeDomain = [...new Set(data.map(shapeValue))],
                dataShape = d3.scaleOrdinal(d3.symbols)
                .domain(shapeDomain)
                .range([circle, square, triangleU, cross, diamond, star]),
                shape = d => dataShape(shapeValue(d));


            const gs = svg.selectAll("g")
                .data(d3.values(gen))
                .enter()
                .append("g")
            // .attr('transform', `rotate(${60})`);

            //retrun empty array if there is no value
            const fillNull = d => d === undefined ? [] : d

            const arcs = d3.values(gen).map((d, i) => pieGen(d).map((x, v) => ({
                ...x,
                arcSlice: sliceSet[v],
                arcPhase: phasesSet[i],
                innerRadius: h(i) * i,
                outerRadius: h(i + 1) * (i + 1),
                data: fillNull(sliceByPhase[phasesSet[i]][sliceSet[v]]), //add in nested data
                id: `${phasesSet[i]}_${sliceSet[v]}`
            })));

            const phase1Arcs = arcs.flat().filter(d => d.arcPhase === phasesSet[phasesSet.length - 1])

            // const sliceArcs = sparcs.filter(d => d.index === 0)
            const midangle = d => d.startAngle + (d.endAngle - d.startAngle) / 2
            // build the Arcs
            const path = gs.selectAll("path.arc")
                .data(arcs.flat()) //<--data is the flattend array
                .enter()
                .append('path')
                .attr('class', 'arc')
                .attr('fill', d => sliceColor.range(pallet[d.index % pallet.length].slice(9 - phasesSet.length))(phasesSet.indexOf(d.arcPhase)))
                .attr('stroke', '#334646')
                .attr('d', d => arcGen(d))
                .attr('id', d => d.id)
            // .attr('transform', `rotate(${60})`)


            const moreArcs = pieGen(gen[0]).map((d, i) => ({
                ...d,
                innerRadius: 0,
                outerRadius: h(phasesSet.length) * (phasesSet.length),
                id: `slice_${i}`
            }))




            //legends
            const legendRectSize = 18,
                legendRectHeight = 18,
                legendRectWidth = 25,
                legendGridX = d => d.index * legendRectWidth,
                legnedGridY = d => d.parentIndex * legendRectWidth,
                legendSpacing = 4,
                legHeight = legendRectSize + legendSpacing,
                legOffset = -30,
                legHorz = 400 + 335 + 40 - legendRectSize,
                legendSpread = 100;

            const legendGroup = svg.append('g')
                .attr('transform', `translate(${left_Legend_xPosition },${0})`)

            legendGroup.append('g')
                .attr('class', 'legendShape');

            const shapePercent = d => Math.round(shapeCount[true][d] / totalIncluded * 100) + '%'

            const shapeLegend = legendGroup.selectAll('.shapeLegend')
                .data(shapeDomain)
                .enter()
                .append('g')
                .attr('transform', (d, i) => `translate(${0}, ${i * (legendRectSize + 2)})`)

            shapeLegend.append('path')
                .attr('fill', 'none')
                .attr('stroke', '#334646')
                .attr('d', d => dataShape(d))
                .attr('transform', `translate(${5},${legendSpread/2})`)

            shapeLegend.append('text')
                .text((d, i) => `${d} (${shapeCount[true][d]} trails, ${shapePercent(d)})`)
                .attr('transform', `translate(${17},${legendSpread/2 + 6})`)
                .style('font-size', '.5em')
                .style('font-faimly', "'Playfair Display', serif")

            const colorLegend = legendGroup.selectAll('.colorLegend')
                .data(colorSet)
                .enter()
                .append('g')
                .attr('transform', (d, i) => `translate(${0},${i * (legendRectSize + 2)})`)

            colorLegend.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .style('fill', d => colors[fullColor.indexOf(d)])
                .style('stroke', 'white')
                .attr("transform", "translate(" + 0 + ", " + -legendSpread / 2 + ")")

            colorLegend.append('text')
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .text(d => d + ' (' + colorCount[d] + ' trials' + ', ' +
                    Math.round(colorCount[d] / totalIncluded * 100) + '%)')
                .attr("transform", "translate(" + 0 + ", " + -legendSpread / 2 + ")")
                .style('font-size', '.5em')
                .style('font-faimly', "'Playfair Display', serif")

            const count = legendGroup.select('text')
                .text(`Total number of trials = ${totalIncluded}`)
                .style('font-size', '.6em')
                .style('text-anchor', 'start')
                .attr('opacity', .8)
                .attr('y', -115)
                .attr('x', -16)

            const outerArc = d3.arc()
                .innerRadius(d => d.outerRadius)
                .outerRadius(d => d.outerRadius)


            const pos = d => {
                const pos = outerArc.centroid(d);
                pos[0] = d.outerRadius * 1.06 * (midangle(d) < Math.PI ? 1 : -1);
                return pos
            }

            svg.selectAll('line')
                .data(phase1Arcs)
                .enter()
                .append('path')
                .attr('stroke', "#334646")
                .attr('d', d => `M${outerArc.centroid(d)[0]},${outerArc.centroid(d)[1]}
                L${pos(d)[0]},${pos(d)[1]}`)
            // .attr('transform', `rotat(${60})`)

            // svg
            //     .selectAll('cirlce')
            //     .data(phase1Arcs)
            //     .enter()
            //     .append('circle')
            //     .attr('fill', d => sliceColor.range(pallet[d.index].slice(9 - phasesSet.length))(0))
            //     .attr('stroke', "#334646")
            //     .attr('cx', d => outerArc.centroid(d)[0])
            //     .attr('cy', d => outerArc.centroid(d)[1])
            //     .attr('r', 2.5)

            svg
                .selectAll(null)
                .data(phase1Arcs)
                .enter()
                .append('text')
                .text(d => d.arcSlice)

                .attr('transform', d => `translate(${pos(d)})`)
                .style('text-anchor', d => midangle(d) < Math.PI ? 'start' : 'end')
                .style('font-size', '.6em')

            svg.selectAll(null)
                .data(phase1Arcs)
                .enter()
                .append('text')
                .text(d => ' (' + relativeSliceCount[d.arcSlice] + ' trials, ' +
                    Math.round(relativeSliceCount[d.arcSlice] / totalIncluded * 100) + '%)')
                .attr('y', 7)
                .style('text-anchor', d => midangle(d) < Math.PI ? 'start' : 'end')
                .style('font-size', '.45em')
                .style('font-style', 'italic')
                .attr('transform', d => `translate(${pos(d)})`)




            function graph(arc) {
                const data = arc.data

                const rValue = d => d[rKey];

                const arcWidth = (-Math.PI / 2 + arc.endAngle) + (Math.PI / 2 + arc.startAngle)

                const div = d => Math.ceil(data.length / d)



                //data is binned according to r values
                const chunk = (arr, size) =>
                    Array.from({
                            length: Math.ceil(arr.length / size)
                        }, (v, i) =>
                        arr.slice(i * size, i * size + size)
                    );


                const dateBins = chunk(data.map(d => d[rKey]).sort(), div(columnDepth))
                //y value is the parent index of d's bin
                const yValue = d => dateBins.findIndex(bin => bin.includes(rValue(d)))
                //x value is d's index within it's bin
                const xValue = d => dateBins[yValue(d)].indexOf(rValue(d))




                //theat assignes a coordinate between arc's two inner edges
                const theta = d3.scaleLinear()
                    .domain([d3.min(data.map(xValue)), d3.max(data.map(xValue))])
                //     	.range([(-Math.PI/2 + arc.startAngle) + .11, (-Math.PI/2 + arc.endAngle) -.11])


                //rScale assignes a coordinate between arc's inner and outer radii
                const rScale = d3.scaleLinear()
                    .domain(d3.extent(data.map(yValue)))
                    .range([arc.innerRadius + (10 * (3 - phasesSet.indexOf(arc.arcPhase))), arc.outerRadius - 10, ]) //<--some padding
                const r = d => Math.hypot(rScale(yValue(d)))
                //     const symbol = d3.symbol().size(50)

                const offset = .1

                const thetaOffset = d =>
                    data.length <= columnDepth ? -Math.PI / 2 + midangle(arc) :
                    yValue(d) % 2 === 0 ?
                    theta.range([(-Math.PI / 2 + (arc.startAngle + offset)) + .13, (-Math.PI / 2 + (arc.endAngle + offset)) - .17])(xValue(d)) : theta.range([(-Math.PI / 2 + arc.startAngle) + .13, (-Math.PI / 2 + arc.endAngle) - .16])(xValue(d))

                //add data
                const shapes = gs.selectAll(null)
                    .data(data)
                    .enter()
                    .append("path")
                    .attr("class", "point")
                    .attr('fill', d => color(d))
                    .attr('opacity', d => op(d))
                    .attr('d', d => shape(d))
                    .attr('transform', d => `translate(${r(d) * Math.cos(thetaOffset(d))},
                                                ${r(d) * Math.sin(thetaOffset(d))})`)


                //                 //add data
                //                 const circles = gs.selectAll('circles')
                //                     .data(data)
                //                     .enter()
                //                     .append('circle')
                //                     .attr("class", "point")
                //                     .attr('fill', d => color(d))
                //                     .attr('cx', d => r(d) * Math.cos(thetaOffset(d)))
                //                     .attr('cy', d => r(d) * Math.sin(thetaOffset(d)))
                //                     .attr('r', 5)

                const grs = gs.selectAll(null)
                    .data(data)
                    .enter()
                    .append('g')
                    .attr('transform', d => `translate(${r(d)*Math.cos(thetaOffset(d))},
                                        ${r(d)*Math.sin(thetaOffset(d))})`)

                grs.append('text')
                    .attr('class', 'tag')
                    .text((d, i) => d[tags])
                    .attr('x', d => 0)
                    .attr('y', d => 2)
                    .attr('text-anchor', 'middle')
                    // .attr('transform', `rotate(${-60})`)
                    .attr('fill', 'white')
                    .attr('opacity', d => op(d))
            }
            let sparcs = arcs.flat()
            // graph(sparcs[1])
            // let sparcs = arcs.flat()
            for (let i = 0, len = sparcs.length; i < len; i++) {
                graph(sparcs[i])
            }

            //this funciton handels updates
            // dataUpdate = function () {
            //     console.log(data)
            //     // const newData = d3.selectAll('.point')
            //     //     .data(data)

            //     // newData.enter()
            //     //     .append("path")
            //     //     .attr("class", "point")
            //     //     .attr('fill', d => color(d))
            //     //     .attr('opacity', d => op(d))
            //     //     .attr('d', d => shape(d))
            //     //     .attr('transform', d => `translate(${r(d) * Math.cos(thetaOffset(d))},
            //     //                             ${r(d) * Math.sin(thetaOffset(d))})`)

            //     // newData.exit()
            //     //     .remove()
            //     // const theSlice = sliceValue(data[0])
            //     // // const arcs = d3.values(gen).map((d, i) => pieGen(d).map((x, v) => ({
            //     // //     ...x,
            //     // //     arcSlice: sliceSet[v],
            //     // //     arcPhase: phasesSet[i],
            //     // //     innerRadius: h(i) * i,
            //     // //     outerRadius: h(i + 1) * (i + 1),
            //     // //     data: fillNull(sliceByPhase[phasesSet[i]][sliceSet[v]]), //add in nested data
            //     // //     id: `${phasesSet[i]}_${sliceSet[v]}`
            //     // // })));

            //     // const newArcs = arcs.flat().filter(d => d.arcSlice === theSlice)
            //     // newArcs.forEach(d => d.endAngle = 2 * Math.P1)
            //     // const arcUpdate = d3.selectAll('path.arc').data(newArcs, d => d.id)

            //     // arcUpdate
            //     //     .transition()
            //     //     .duration(100)





            // }


            selectSlice = function () {
                let sliceSelected = flatArcs.filter(arc => arc.arcSlice === `slice_${data.indexOf(1)}`)
                const modSliceSelected = sliceSelected.map(ob => ({
                    ...ob,
                    endAngle: -(2 * Math.PI - ob.startAngle)
                }))
                console.log(data)

                function arcTween(a) { //<-- a is the datum bound to each arc
                    var startAngle = a.endAngle;
                    var i = d3.interpolate(a.endAngle, (2 * Math.PI + a.startAngle));
                    return function (t) {
                        a.endAngle = i(t);
                        return arc(a);
                    };
                }
                const updatePaths = d3.selectAll('path.arc')
                    .data(sliceSelected, d => d.id)

                updatePaths.enter()
                    .append('path')
                    .attr('class', 'arc')
                    .attr('stroke', '#334646')
                    .attr('id', d => d.id)
                    .merge(updatePaths.transition().duration(750).attrTween("d", arcTween))
                    .attr('fill', d => sliceColor.range(pallet[d.index])(arcRingValue(d)))

                updatePaths.exit()
                    //       .transition()
                    //       .delay(d => d.index * 100)
                    //       .attrTween('d', arcTweenOut)
                    .remove()



            }
        });

    }
    // chart.data = function (value) {
    //     if (!arguments.length) return data;
    //     data = value;
    //     if (typeof updateData === 'function') updateData();
    //     return chart;
    // };
    chart.selectSlice = function (value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') selectSlice();
        return chart;
    };

    chart.data = function (value) {
        if (!arguments.length) return data;
        data = value;
        return chart;
    };

    chart.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };
    chart.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.cwidth = function (value) {
        if (!arguments.length) return cwidth;
        cwidth = value;
        return chart;
    };

    chart.slices = function (value) {
        if (!arguments.length) return slices;
        slices = value;
        return chart;
    };

    chart.phaseKey = function (value) {
        if (!arguments.length) return phaseKey;
        phaseKey = value;
        return chart;
    };

    chart.phasesSet = function (value) {
        if (!arguments.length) return phasesSet;
        phasesSet = value;
        return chart;
    };
    chart.colorKey = function (value) {
        if (!arguments.length) return colorKey;
        colorKey = value;
        return chart;
    };
    chart.columnDepth = function (value) {
        if (!arguments.length) return columnDepth;
        columnDepth = value;
        return chart
    };
    chart.label = function (value) {
        if (!arguments.length) return label;
        label = value;
        return chart
    };
    chart.toppings = function (value) {
        if (!arguments.length) return toppings;
        toppings = value;
        return chart
    };
    chart.toppingSize = function (value) {
        if (!arguments.length) return toppingSize;
        toppingSize = value;
        return chart
    };
    chart.rKey = function (value) {
        if (!arguments.length) return rKey;
        rKey = value;
        return chart
    };
    chart.tags = function (value) {
        if (!arguments.length) return tags;
        tags = value;
        return chart
    };
    chart.outDataOpacity = function (value) {
        if (!arguments.length) return outDataOpacity;
        outDataOpacity = value;
        return chart
    };
    chart.colorSet = function (value) {
        if (!arguments.length) return colorSet;
        colorSet = value;
        return chart
    };
    chart.left_Legend_xPosition = function (value) {
        if (!arguments.length) return left_Legend_xPosition;
        left_Legend_xPosition = value;
        return chart
    };
    chart.right_Legend_xPosition = function (value) {
        if (!arguments.length) return right_Legend_xPosition;
        right_Legend_xPosition = value;
        return chart
    };
    return chart;
}