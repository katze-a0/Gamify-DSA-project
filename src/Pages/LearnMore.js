import React from "react";
import NavBar from "../Components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "../styles/LearnMore.css";

const LearnMore = () => {
  return (
    <>
      <NavBar />
        <div className="lmHeaderStyle">
          <h1>🚀 Graph Algorithms Explained</h1>
          <p className="descriptionStyle">
            Explore the most efficient graph algorithms with simple explanations
            and implementations.
          </p>
        </div>
        <div className="accordionStyle">
          <div className="accordion mt-4" id="algorithmAccordion">
            {/* Prim's Algorithm */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#prims"
                  aria-controls="prims"
                >
                  🔹 Prim's Algorithm
                </button>
              </h2>
              <div
                id="prims"
                className="accordion-collapse collapse show"
                data-bs-parent="#algorithmAccordion"
              >
                <div className="accordion-body">
                  <p>
                    Prim’s Algorithm is a greedy approach to finding the Minimum
                    Spanning Tree (MST) of a weighted graph.
                  </p>
                  <pre>
                    {`function prim(graph):
  select arbitrary node as start
  add it to the MST
  while (MST doesn't have all nodes):
    find the minimum weight edge
    add the corresponding node to MST
  return MST`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Kruskal's Algorithm */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#kruskal"
                  aria-expanded="false"
                  aria-controls="kruskal"
                >
                  🛠️ Kruskal's Algorithm
                </button>
              </h2>
              <div
                id="kruskal"
                className="accordion-collapse collapse"
                data-bs-parent="#algorithmAccordion"
              >
                <div className="accordion-body">
                  <p>
                    Kruskal’s Algorithm sorts edges by weight and selects the
                    smallest ones to build the MST.
                  </p>
                  <pre>
                    {`function kruskal(graph):
  sort all edges by weight
  initialize empty MST
  for each edge in sorted list:
    if adding the edge doesn't create a cycle:
      add it to MST
  return MST`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Dijkstra's Algorithm */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#dijkstra"
                  aria-expanded="false"
                  aria-controls="dijkstra"
                >
                  ⚡ Dijkstra's Algorithm
                </button>
              </h2>
              <div
                id="dijkstra"
                className="accordion-collapse collapse"
                data-bs-parent="#algorithmAccordion"
              >
                <div className="accordion-body">
                  <p>
                    Dijkstra’s Algorithm finds the shortest path from a source
                    node to all other nodes in a graph.
                  </p>
                  <pre>
                    {`function dijkstra(graph, source):
  initialize distances with infinity, except source (0)
  create priority queue and insert source
  while queue is not empty:
    extract node with smallest distance
    update distances of adjacent nodes
  return shortest paths`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default LearnMore;
