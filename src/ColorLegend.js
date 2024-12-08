import React, { Component } from 'react';
import * as d3 from 'd3';

class ColorLegend extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.domain = this.props.colorScale.domain();
    this.mounted = false;
  }

  componentDidMount() {
    if (this.mounted) return; 

    this.mounted = true; 

    const { colorScale, width, height } = this.props;
    const svg = d3.select(this.svgRef.current);
    const domain = this.domain;

    // Create linear gradient for color legend
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'colorGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    for (let i = 0; i <= 100; i++) {
      gradient.append('stop')
        .attr('offset', i + '%')
        .attr('stop-color', colorScale(parseFloat(i) / 100.0 * (domain[1] - domain[0]) + domain[0]))
        .attr('stop-opacity', 1);
    }

    // Append gradient color bar
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'url(#colorGradient)');

    // Append labels with "dB"
    const labels = [25, 50, 75, 100]; // Adjust as needed
    labels.forEach((value) => {
      const labelValue = parseFloat(value) / 100.0 * (domain[1] - domain[0]) + domain[0];

      svg.append('text')
        .attr('x', (width / 100) * value)
        .attr('y', height + 20)
        .text(labelValue)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10px')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle');

      // Append "dB" text
      svg.append('text')
        .attr('x', (width / 100) * value + 12)
        .attr('y', height + 20) // Adjust y position as needed
        .text('dB')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10px')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle');
    });
  }

  render() {
    const { width, height } = this.props;
    return (
      <svg id="colorScale" ref={this.svgRef} width={width + 30} height={height + 30} />
    );
  }
}

export default ColorLegend;
