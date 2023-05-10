const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

let baseTemp;
let values = [];

let xScale;
let yScale;

let minYear;
let maxYear;

let numberOfYears = maxYear - minYear;
let yAxisScale;
let xAxisScale;

let width = 1300;
let height = 500;
let padding = 50;

let canvas = d3.select('#canvas');
canvas.attr('width', width);
canvas.attr('height', height);


const generateScales = () => {

    minYear = d3.min(values, item => item['year']);
    maxYear = d3.max(values, item => item['year']);


    xScale = d3.scaleLinear()
        .domain([minYear, maxYear + 1])
        .range([padding, width - (padding / 2)])

    yScale = d3.scaleTime()
        .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
        .range([padding, height - padding])

}

const drawCells = () => {

    let tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden')
        .style('position', 'absolute')

    canvas.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('fill', item => {
            let variance = item['variance'];
            if (variance <= -1) {
                return 'rgb(198, 219, 239)';
            } else if (variance <= 0) {
                return 'rgb(107, 174, 214)';
            } else if (variance <= 1) {
                return 'rgb(33, 113, 181)';
            } else {
                return 'rgb(8, 48, 107)';
            }
        })
        .attr('data-month', item => item['month'] - 1)
        .attr('data-year', item => item['year'])
        .attr('data-temp', item => baseTemp + item['variance'])
        .attr('height', (height - (padding * 2)) / 12)
        .attr('y', item => yScale(new Date(0, item['month'] - 1, 0, 0, 0, 0, 0)))
        .attr('width', item => {
            numberOfYears = maxYear - minYear;
            return (width - (2 * padding)) / numberOfYears;
        })
        .attr('x', item => xScale(item['year']))
        .on('mouseover', item => {
            tooltip.transition()
                .style('visibility', 'visible')

            let monthNames = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'Augustus',
                'September',
                'October',
                'November',
                'December'
            ]

            tooltip.text(item['year'] + ' - ' + monthNames[item['month'] - 1] + '\n' + ((baseTemp + item['variance']).toFixed(3)) + '\n(' + item['variance'] + ')')
                .style('left', (xScale(item['year'])) + -20 + 'px')
                .style('top', + (yScale(new Date(0, item['month'], 0, 0, 0, 0, 0))) + -30 + 'px')


            tooltip.attr('data-year', item['year'])
        })
        .on('mouseout', item => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })
}

const drawAxes = () => {
    let xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'));
    let yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%B'))

    canvas.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0,' + (height - padding) + ')')

    canvas.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ',0)')
}

const createLegend = () => {

    const step = (maxYear - minYear) / 8;

    const colorsScale = d3.scaleThreshold()
        .domain(d3.range(minYear, maxYear, step))
        .range(d3.schemeBlues[9])

    const colors = [];

    for (let i = minYear; i <= maxYear; i += step) {
        colors.push(colorsScale(i));
    }

    const legendWidth = 175;
    const legendHeight = 30;

    const rectWidth = legendWidth / colors.length;

    const legend = d3.select('#description')
        .append('svg')
        .attr('id', 'legend')
        .attr('height', legendHeight)
        .attr('width', legendWidth)
        .selectAll('rect')
        .data(colors)
        .enter()
        .append('rect')
        .attr('x', (_, i) => i * rectWidth)
        .attr('y', 0)
        .attr('width', rectWidth)
        .attr('height', legendHeight)
        .attr('fill', c => c)
}

fetch(url)
    .then(response => response.json())
    .then(json => {
        baseTemp = json['baseTemperature']
        values = json['monthlyVariance'];

        generateScales();
        drawAxes();
        drawCells();
        createLegend();
    })

