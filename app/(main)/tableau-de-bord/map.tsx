import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoPath, geoConicConformal } from 'd3-geo';

interface DepartementData {
  departement: string;
  totalCandidats: number;
  totalM: number;
  totalF: number;
  enAttente: number;
  valider: number;
  rejeter: number;
}

interface MapProps {
  geoJson: any;  // ton GeoJSON (ex: senegalGeoJSON)
  data: DepartementData[]; // stats par département
  width?: number;
  height?: number;
}

const MapComponent: React.FC<MapProps> = ({ geoJson, data, width = 550, height = 350 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!geoJson || !data) return;

    const maxValue = data && data.length > 0 ? d3.max(data, d => d.totalCandidats)! : 0;
    const midValue = maxValue / 2;
    const minValue = 0;


    const colorScale = d3.scaleLinear<string>()
      .domain([minValue, midValue, maxValue])
      .range(['#1eb53a', '#fcd116', '#ce1126']); // vert → jaune → rouge

    const projection = geoConicConformal()
      .center([-14.5, 14.5])
      .parallels([0, 0])
      .fitSize([width, height], geoJson);

    const path = geoPath().projection(projection);

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const tooltip = d3.select('body')
      .append('div')
      .attr('id', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(255, 255, 255, 0.95)')
      .style('border', '1px solid #ccc')
      .style('padding', '8px 12px')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('color', '#333')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 2px 3px rgba(0, 56, 196, 0.73)')
      .style('visibility', 'hidden');

    const g = svg.append('g');

    // --- Dessiner les départements ---
    g.selectAll('path')
      .data(geoJson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const departementData = data.find(item => item.departement === d.properties.NOM);
        return departementData ? colorScale(departementData.totalCandidats) : '#ccc';
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .on('mouseover', function (event, d: any) {
        d3.select(this).attr('fill', '#e7f0ffff');
        const departementData = data.find(item => item.departement === d.properties.NOM);
        tooltip.html(`
          <strong>${d.properties.NOM}</strong><br/>
          <b>Total Candidats :</b> ${departementData?.totalCandidats ?? '0'}<br/>
          <b>Garçons :</b> ${departementData?.totalM ?? '0'}<br/>
          <b>Filles :</b> ${departementData?.totalF ?? '0'}
        `).style('visibility', 'visible');
      })
      .on('mousemove', function (event) {
        tooltip.style('top', (event.pageY + 5) + 'px')
               .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function (event, d: any) {
        const departementData = data.find(item => item.departement === d.properties.NOM);
        d3.select(this).attr('fill', departementData ? colorScale(departementData.totalCandidats) : '#ccc');
        tooltip.style('visibility', 'hidden');
      });

    // --- Ajouter la légende ---
    const legendWidth = 150;
    const legendHeight = 10;
    const legendX = 340;
    const legendY = height - 350;

    const legendData = [minValue, midValue, maxValue];

    // créer un gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient');

    gradient.selectAll('stop')
      .data([
        { offset: '0%', color: '#1eb53a' },
        { offset: '50%', color: '#fcd116' },
        { offset: '100%', color: '#ce1126' }
      ])
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    svg.append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')
      .style('stroke', '#000');

    // ajouter les labels min / mid / max
    svg.selectAll('text.legend-label')
      .data(legendData)
      .enter()
      .append('text')
      .attr('class', 'legend-label')
      .attr('x', (d, i) => legendX + (i / (legendData.length - 1)) * legendWidth)
      .attr('y', legendY + legendHeight + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .text(d => d);

  }, [geoJson, data, width, height]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default MapComponent;