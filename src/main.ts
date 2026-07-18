import * as d3 from "d3";
import { createData, getLinkColor } from "./utils";
import type { Link } from "./models";

// Initialize visualization
function initializeVisualization(maxDataCount: number) {
  // Clear previous visualization
  d3.select("svg").selectAll("*").remove();

  // Create data
  const { data, linkedAreas, unlinkedAreas } = createData(0, maxDataCount);
  console.log("linkedAreas", linkedAreas);
  console.log("unlinkedAreas", unlinkedAreas);

  const unlinkedDrafts = data.filter(
    (d) => d.draft !== null && d.core === null,
  );

  const unlinkedCores = data.filter((d) => d.core !== null && d.draft === null);

  const width = window.innerWidth - 100;
  const height = 500;

  const coreDomain = [
    d3.min(data, (d) => d.core) ?? 0,
    d3.max(data, (d) => d.core) ?? 500,
  ];

  const draftDomain = [
    d3.min(data, (d) => d.draft) ?? 0,
    d3.max(data, (d) => d.draft) ?? 1000,
  ];
  console.log("coreDomain", coreDomain);
  console.log("draftDomain", draftDomain);

  const domain = [
    Math.min(draftDomain[0], coreDomain[0]),
    Math.max(draftDomain[1], coreDomain[1]),
  ];
  console.log("domain", domain);

  const svg = d3.select("svg");
  svg
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(50, 50)");

  // // define scales
  const scale = d3.scaleLinear().domain(domain).range([0, width]);

  // Original domain for brush reference
  const originalDomain = [...domain];

  // Create scales for brush navigation (always full domain)
  const brushDraftScale = d3
    .scaleLinear()
    .domain(originalDomain)
    .range([0, width])
    .nice();

  const coreAxis = d3.axisBottom(scale).ticks(20);

  const railroadHeight = 100;
  const railroadTop = 200;
  const railroadBottom = railroadTop + railroadHeight;
  const inspectionRailroadHeight = 5;

  const chartArea = svg.append("g").attr("transform", `translate(0, 0)`);

  const railroadGroup = chartArea
    .append("g")
    .attr("transform", `translate(0, ${railroadTop})`);

  // Function to update railroad visualization based on current scales
  function updateRailroad() {
    // Update draft references
    railroadGroup
      .selectAll<SVGLineElement, Link>(".draft-reference")
      .attr("x1", (d) => scale(d.draft!))
      .attr("x2", (d) => scale(d.draft!));

    // Update core references
    railroadGroup
      .selectAll<SVGLineElement, Link>(".core-reference")
      .attr("x1", (d) => scale(d.core!))
      .attr("x2", (d) => scale(d.core!));

    // Update links
    railroadGroup
      .selectAll<SVGLineElement, Link>(".link")
      .attr("x1", (d) => scale(d.draft!))
      .attr("x2", (d) => scale(d.core!));

    // Update linked areas
    railroadGroup
      .selectAll<SVGPolygonElement, (typeof linkedAreas)[0]>(".linked-area")
      .attr(
        "points",
        (d) =>
          `${scale(d.draftMin)},${inspectionRailroadHeight} ` +
          `${scale(d.draftMax)},${inspectionRailroadHeight} ` +
          `${scale(d.coreMax)},${railroadHeight - inspectionRailroadHeight} ` +
          `${scale(d.coreMin)},${railroadHeight - inspectionRailroadHeight}`,
      );

    // Update unlinked areas
    railroadGroup
      .selectAll<SVGPolygonElement, (typeof unlinkedAreas)[0]>(".unlinked-area")
      .attr(
        "points",
        (d) =>
          `${scale(d.draftMin)},${inspectionRailroadHeight} ` +
          `${scale(d.draftMax)},${inspectionRailroadHeight} ` +
          `${scale(d.coreMax)},${railroadHeight - inspectionRailroadHeight} ` +
          `${scale(d.coreMin)},${railroadHeight - inspectionRailroadHeight}`,
      );

    // Update railroad backgrounds
    railroadGroup.select("#core-railroad").attr("width", width);

    railroadGroup.select("#draft-railroad").attr("width", width);

    // Update axis
    coreAxisGroup.call(coreAxis);
  }

  // chartArea
  //   .append("g")
  //   .attr("transform", `translate(0, ${railroadTop})`)
  //   .call(draftAxis);

  const coreAxisGroup = chartArea
    .append("g")
    .attr("transform", `translate(0, ${railroadBottom + 100})`)
    .call(coreAxis);

  railroadGroup
    .append("rect")
    .attr("id", "core-railroad")
    .attr("width", width)
    .attr("height", inspectionRailroadHeight)
    .attr("fill", "gray")
    .attr("opacity", 0.3)
    .attr("transform", `translate(0,  0)`);

  railroadGroup
    .append("rect")
    .attr("id", "draft-railroad")
    .attr("width", width)
    .attr("height", inspectionRailroadHeight)
    .attr("fill", "gray")
    .attr("opacity", 0.3)
    .attr(
      "transform",
      `translate(0,  ${railroadHeight - inspectionRailroadHeight})`,
    );

  const draftReferences = data.filter((d) => d.draft !== null);
  const coreReferences = data.filter((d) => d.core !== null);
  const links = data.filter((d) => d.draft !== null && d.core !== null);

  console.log("draftReferences", draftReferences);
  console.log("coreReferences", coreReferences);

  // draft references
  railroadGroup
    .selectAll(".draft-reference")
    .data(draftReferences)
    .enter()
    .append("line")
    .attr("class", "draft-reference")
    .attr("x1", (d) => scale(d.draft!))
    .attr("y1", 0)
    .attr("x2", (d) => scale(d.draft!))
    .attr("y2", inspectionRailroadHeight)
    .attr("stroke", (d) => getLinkColor(d))
    .attr("stroke-width", 6);

  // core references
  railroadGroup
    .selectAll(".core-reference")
    .data(coreReferences)
    .enter()
    .append("line")
    .attr("class", "core-reference")
    .attr("x1", (d) => scale(d.core!))
    .attr("y1", railroadHeight - inspectionRailroadHeight)
    .attr("x2", (d) => scale(d.core!))
    .attr("y2", railroadHeight)
    .attr("stroke", (d) => getLinkColor(d))
    .attr("stroke-width", 6);

  // link
  railroadGroup
    .selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", (d) => scale(d.draft!))
    .attr("y1", inspectionRailroadHeight / 2)
    .attr("x2", (d) => scale(d.core!))
    .attr("y2", railroadHeight - inspectionRailroadHeight / 2)
    .attr("stroke", "green")
    .attr("stroke-width", 1);

  // draw areas

  railroadGroup
    .selectAll(".linked-area")
    .data(linkedAreas)
    .enter()
    .append("polygon")
    .attr("class", "linked-area")
    .attr(
      "points",
      (d) =>
        `${scale(d.draftMin)},${inspectionRailroadHeight} ` +
        `${scale(d.draftMax)},${inspectionRailroadHeight} ` +
        `${scale(d.coreMax)},${railroadHeight - inspectionRailroadHeight} ` +
        `${scale(d.coreMin)},${railroadHeight - inspectionRailroadHeight}`,
    )
    .attr("fill", "lightgreen")
    .attr("opacity", 0.5);

  railroadGroup
    .selectAll(".unlinked-area")
    .data(unlinkedAreas)
    .enter()
    .append("polygon")
    .attr("class", "unlinked-area")
    .attr(
      "points",
      (d) =>
        `${scale(d.draftMin)},${inspectionRailroadHeight} ` +
        `${scale(d.draftMax)},${inspectionRailroadHeight} ` +
        `${scale(d.coreMax)},${railroadHeight - inspectionRailroadHeight} ` +
        `${scale(d.coreMin)},${railroadHeight - inspectionRailroadHeight}`,
    )
    .attr("fill", "lightcoral")
    .attr("opacity", 0.5);

  /// navigation/status bar

  const navigationBarHeight = 6;

  const navigationBarGroup = svg
    .append("g")
    .attr("class", "navigation-bar")
    .attr("transform", `translate(0, 50)`);

  // add horizontal axis for navigation bar
  const navigationBarAxis = d3.axisBottom(scale).ticks(20);

  navigationBarGroup
    .append("rect")
    .attr("width", width)
    .attr("height", navigationBarHeight)
    .attr("stroke-width", 0.5)
    .attr("stroke", "black")
    .attr("fill", "lightgray");

  navigationBarGroup
    .append("g")
    .attr("class", "navigation-bar-axis")
    .attr("transform", `translate(0, ${navigationBarHeight + 10})`)
    .call(navigationBarAxis);

  // Draw linked areas
  navigationBarGroup
    .selectAll(".linked-area")
    .data(linkedAreas)
    .enter()
    .append("polygon")
    .attr("class", "linked-area")
    .attr(
      "points",
      (d) =>
        `${scale(d.draftMin)},0 ` +
        `${scale(d.draftMax)},0 ` +
        `${scale(d.coreMax)},${navigationBarHeight} ` +
        `${scale(d.coreMin)},${navigationBarHeight}`,
    )
    .attr("fill", "lightgreen")
    .attr("opacity", 0.5);

  // Draw unlinked areas
  navigationBarGroup
    .selectAll(".unlinked-area")
    .data(unlinkedAreas)
    .enter()
    .append("polygon")
    .attr("class", "unlinked-area")
    .attr(
      "points",
      (d) =>
        `${scale(d.draftMin)},0 ` +
        `${scale(d.draftMax)},0 ` +
        `${scale(d.coreMax)},${navigationBarHeight} ` +
        `${scale(d.coreMin)},${navigationBarHeight}`,
    )
    .attr("fill", "red")
    .attr("opacity", 0.5);

  navigationBarGroup
    .selectAll(".unconnected-draft")
    .data(unlinkedDrafts)
    .enter()
    .append("line")
    .attr("class", "unconnected-draft")
    .attr("x1", (d) => scale(d.draft!))
    .attr("y1", 0)
    .attr("x2", (d) => scale(d.draft!))
    .attr("y2", navigationBarHeight)
    .attr("stroke", (d) => (d.reviewed ? "black" : "red"))
    .attr("stroke-width", 1);
  // .attr("transform", `translate(0, -${navigationBarHeight / 2})`);

  navigationBarGroup
    .selectAll(".unconnected-core")
    .data(unlinkedCores)
    .enter()
    .append("line")
    .attr("class", "unconnected-core")
    .attr("x1", (d) => scale(d.core!))
    .attr("y1", 0)
    .attr("x2", (d) => scale(d.core!))
    .attr("y2", navigationBarHeight)
    .attr("stroke", (d) => (d.reviewed ? "black" : "red"))
    .attr("stroke-width", 1);
  // .attr("transform", `translate(0, ${navigationBarHeight / 2})`);

  // BRUSH / focus area

  // Create a brush with extent matching the navigation bar
  const brush = d3
    .brushX()
    .extent([
      [0, -navigationBarHeight],
      [width, navigationBarHeight * 2],
    ])
    .on("brush", onBrush)
    .on("end", onBrushEnd);

  // Add brush group to navigation bar
  const brushGroup = navigationBarGroup
    .append("g")
    .attr("class", "brush")
    .call(brush);

  // Set default brush selection by data values (100 to 200 meters)
  const defaultDataStart = 0;
  const defaultDataEnd = 200;
  const defaultBrushStart = brushDraftScale(defaultDataStart);
  const defaultBrushEnd = brushDraftScale(defaultDataEnd);
  brushGroup.call(brush.move as any, [defaultBrushStart, defaultBrushEnd]);

  // Style the brush selection
  brushGroup
    .selectAll(".selection")
    .attr("fill", "steelblue")
    .attr("opacity", 0.8)
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);

  // Style the brush handles
  brushGroup
    .selectAll(".handle")
    .attr("fill", "steelblue")
    .attr("opacity", 0.7)
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1);

  // Brush event handler
  function onBrush(event: d3.D3BrushEvent<unknown>) {
    const selection = event.selection as [number, number] | null;

    if (!selection) {
      return;
    }

    // Convert pixel coordinates back to data domain
    const minPixel = selection[0];
    const maxPixel = selection[1];

    // Use brush scales to invert the selection
    const newDraftMin = brushDraftScale.invert(minPixel);
    const newDraftMax = brushDraftScale.invert(maxPixel);

    // Update scales with zoomed domain
    scale.domain([newDraftMin, newDraftMax]);
    // coreScale.domain([newDraftMin, newDraftMax]);

    // Update railroad visualization
    updateRailroad();
  }

  // Brush end event handler - allows clearing selection
  function onBrushEnd(event: d3.D3BrushEvent<unknown>) {
    const selection = event.selection as [number, number] | null;

    // If selection is empty or cleared, reset to full domain
    if (!selection) {
      scale.domain(originalDomain);
      // coreScale.domain(originalDomain);
      updateRailroad();
    }
  }
}

// Initialize with default value 9000
// I want to show that, when there is a large amount of data within a specific range, the polygons appear as if they were rectangles.
// TODO: create yellow areas / unlinked reviewed areas
initializeVisualization(9000);

// Get DOM elements for user input
const dataCountInput = document.getElementById("dataCount") as HTMLInputElement;
const updateBtn = document.getElementById("updateBtn") as HTMLButtonElement;

// Handle button click
updateBtn.addEventListener("click", () => {
  const value = Number.parseInt(dataCountInput.value, 10);

  if (Number.isNaN(value) || value < 1) {
    alert("Por favor, ingresa un número válido mayor a 0");
    return;
  }

  initializeVisualization(value);
});

// Optional: Allow Enter key to update
dataCountInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    updateBtn.click();
  }
});
