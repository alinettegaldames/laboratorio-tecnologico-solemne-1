import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import data from './data.json' with {type: 'json'};

const width = 1000;
const height = 1000;
const innerRadius = 120;   // radio interior del anillo
const outerRadius = 350;   // radio exterior del anillo
const centralRadius = 100; // radio del circulo central

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svg.append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  .domain(data.map(d => d.Año));


const pie = d3.pie().value(1).sort(null);
const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

// Circulo central
g.append("circle")
  .attr("r", centralRadius)
  .attr("fill", "white")
  .attr("stroke", "none");

// Texto central
g.append("text")
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "middle")
  .style("font-size", "18px")
  .style("font-family", "Helvetica, sans-serif")
  .text("Tasa de Accidentabilidad");

// Secciones del anillo
const arcs = g.selectAll("arc")
  .data(pie(data))
  .join("g")
  .attr("class", d => "arc-" + d.data.Año);

// Texto fijo en el borde exterior
arcs.append("text")
  .attr("transform", d => {
    const [x, y] = arc.centroid(d);
    const factor = (outerRadius + 200) / outerRadius;
    return `translate(${x * factor}, ${y * factor})`;
  })
  .attr("text-anchor", d => {
    const [x] = arc.centroid(d);
    return x >= 0 ? "start" : "end";
  })
  .attr("dominant-baseline", "middle")
  .style("font-size", "14px")
  .style("font-family", "Helvetica, sans-serif")
  .style("font-weight", "bold")
  .text(d => d.data.Año);


function descomponerValor(valor, simbolos) {
  const pelotitas = [];
  let restante = valor;

  simbolos.forEach(s => {
    while (restante >= s) {
      pelotitas.push(s);
      restante -= s;
    }
  });

  return pelotitas;
}

// Generar pelotitas y conexiones
arcs.each(function (d) {
  const group = d3.select(this);
  const tasa = d.data["Tasa de accidentabilidad"];

  // Descomponer en pelotitas (segun simbologia fija)
  const radiosPelotitas = descomponerValor(tasa, [5, 4, 3, 2, 1, 0.5]);

  const nodes = radiosPelotitas.map(radio => {
    const angle = d.startAngle + Math.random() * (d.endAngle - d.startAngle);
    const r = innerRadius + Math.random() * (outerRadius - innerRadius);

    return {
      x: Math.cos(angle - Math.PI / 2) * r,
      y: Math.sin(angle - Math.PI / 2) * r,
      r: radio
    };
  });

  // Dibujar conexiones entre pelotitas 
  for (let i = 0; i < nodes.length; i++) {
    const distances = nodes
      .map((n, j) => ({node: n, dist: Math.hypot(nodes[i].x - n.x, nodes[i].y - n.y), index: j}))
      .filter(d => d.index !== i)
      .sort((a, b) => a.dist - b.dist);

    for (let k = 0; k < Math.min(3, distances.length); k++) {
      const target = distances[k].node;
      group.append("line")
        .attr("x1", nodes[i].x)
        .attr("y1", nodes[i].y)
        .attr("x2", target.x)
        .attr("y2", target.y)
        .attr("stroke", colorScale(d.data.Año))
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.5);
    }
  }

  // Dibujar pelotitas mas grandes
  group.selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.r * 3) // aumento de tamaño
    .attr("fill", colorScale(d.data.Año))
    .attr("opacity", 0.8);
});


arcs.on("mouseover", function (event, d) {
  d3.select(this).selectAll("circle")
    .transition().duration(200)
    .style("filter", "brightness(0.6)");

  const [cx, cy] = arc.centroid(d);
  const labelX = cx * 1.8;
  const labelY = cy * 1.8;

  const labelGroup = g.append("g")
    .attr("class", "label-group");

  labelGroup.append("line")
    .attr("x1", cx * 1.2)
    .attr("y1", cy * 1.2)
    .attr("x2", labelX)
    .attr("y2", labelY)
    .attr("stroke", "#333")
    .attr("stroke-width", 2);

  labelGroup.append("rect")
    .attr("x", labelX - 60)
    .attr("y", labelY - 20)
    .attr("width", 120)
    .attr("height", 40)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("fill", "white")
    .attr("stroke", "#333");

  labelGroup.append("text")
    .attr("x", labelX)
    .attr("y", labelY)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "14px")
    .style("font-family", "Helvetica, sans-serif")
    .text(` ${d.data["Tasa de accidentabilidad"]}`);
})
.on("mouseout", function () {
  d3.select(this).selectAll("circle")
    .transition().duration(200)
    .style("filter", "brightness(1)");

  g.selectAll(".label-group").remove();
});


const legendValues = [5, 4, 3, 2, 1, 0.5];
const legend = svg.append("g")
  .attr("transform", `translate(${width / 2 - 150}, ${height - 80})`);

legend.append("rect")
  .attr("width", 300)
  .attr("height", 70)
  .attr("rx", 8)
  .attr("ry", 8)
  .attr("fill", "#f9f9f9")
  .attr("stroke", "#999")
  .attr("stroke-width", 1.5);

const legendGroup = legend.selectAll("g")
  .data(legendValues)
  .join("g")
  .attr("transform", (d, i) => `translate(${40 + i * 45}, 30)`);

legendGroup.append("circle")
  .attr("r", d => d * 3) // mismo factor que arriba
  .attr("fill", "gray");

legendGroup.append("text")
  .attr("y", 30)
  .attr("text-anchor", "middle")
  .style("font-size", "12px")
  .style("font-family", "Helvetica, sans-serif")
  .text(d => d);

  // Titulo en la parte superior del grafico
svg.append("text")
  .attr("x", width / 2)
  .attr("y", 40) // margen superior
  .attr("text-anchor", "middle")
  .style("font-size", "24px")
  .style("font-family", "Helvetica, sans-serif")
  .style("font-weight", "bold")
  .text("Tasa de accidentabilidad de vehículos de carga");
