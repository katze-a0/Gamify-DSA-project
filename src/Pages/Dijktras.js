import React, { useRef, useState, useEffect } from "react";
import NavBar from "../Components/Navbar";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import "../styles/algorithm.css";
import Button from "react-bootstrap/Button";

const Dijkstra = () => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [mode, setMode] = useState("quiz");
  const [shortestPathEdges, setShortestPathEdges] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState(new Set());
  const [feedback, setFeedback] = useState("");
  const [originalEdgeColors, setOriginalEdgeColors] = useState(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);

  const nodes = useRef(
    new DataSet([
      { id: 1, label: "A" },
      { id: 2, label: "B" },
      { id: 3, label: "C" },
      { id: 4, label: "D" },
      { id: 5, label: "E" },
    ])
  );

  const edges = useRef(
    new DataSet([
      { id: "1-2", from: 1, to: 2, label: "3", weight: 3 },
      { id: "1-3", from: 1, to: 3, label: "1", weight: 1 },
      { id: "2-3", from: 2, to: 3, label: "2", weight: 2 },
      { id: "2-4", from: 2, to: 4, label: "4", weight: 4 },
      { id: "3-4", from: 3, to: 4, label: "5", weight: 5 },
      { id: "4-5", from: 4, to: 5, label: "7", weight: 7 },
      { id: "3-5", from: 3, to: 5, label: "6", weight: 6 },
    ])
  );

  useEffect(() => {
    const data = { nodes: nodes.current, edges: edges.current };
    const options = {
      edges: { font: { align: "top" }, color: { color: "#aaa" } },
      physics: false,
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    const computedShortestPath = computeDijkstra(1, 5, edges.current);
    setShortestPathEdges(computedShortestPath);
    setSteps(computeDijkstraSteps(1, 5, edges.current));
    
    const handleSelectEdge = (params) => {
      if (mode === "quiz" && params.edges.length > 0) {
        const edgeId = params.edges[0];
        toggleEdgeSelection(edgeId);
      }
    };

    network.on("selectEdge", handleSelectEdge);

    return () => {
      network.off("selectEdge", handleSelectEdge);
      network.destroy();
    };
  }, [mode]);

  const visualizeStep = (stepIndex) => {
    if (!steps || steps.length === 0 || stepIndex < 0 || stepIndex >= steps.length) {
      return;
    }

    const step = steps[stepIndex];
    edges.current.forEach((edge) => updateEdgeColor(edge.id, "#aaa"));
    nodes.current.forEach((node) => updateNodeColor(node.id, "#fff"));

    if (step?.currentEdge) {
      updateEdgeColor(step.currentEdge.id, "#f00");
    }
    if (step?.shortestPathEdges) {
      step.shortestPathEdges.forEach((edgeId) => updateEdgeColor(edgeId, "#0f0"));
    }
    if (step?.candidates) {
      step.candidates.forEach((edgeId) => updateEdgeColor(edgeId, "#ff0"));
    }
    if (step?.visited) {
      step.visited.forEach((nodeId) => updateNodeColor(nodeId, "#7f7"));
    }

    setCurrentStep(stepIndex);
  };

  const toggleEdgeSelection = (edgeId) => {
    setSelectedEdges((prev) => {
      const updated = new Set(prev);
      if (updated.has(edgeId)) {
        updated.delete(edgeId);
        updateEdgeColor(edgeId, originalEdgeColors.get(edgeId) || "#aaa");
      } else {
        const edge = edges.current.get(edgeId);
        if (edge) {
          const edgeColor = edge.color?.color || "#aaa";
          setOriginalEdgeColors((prevColors) => new Map(prevColors).set(edgeId, edgeColor));
          updated.add(edgeId);
          updateEdgeColor(edgeId, "#00f");
        }
      }
      return updated;
    });
  };

  const updateEdgeColor = (edgeId, color) => {
    edges.current.update({ id: edgeId, color: { color } });
    networkRef.current?.redraw();
  };

  const updateNodeColor = (nodeId, color) => {
    nodes.current.update({ id: nodeId, color: { background: color } });
    networkRef.current?.redraw();
  };

  const computeDijkstra = (start, end, edgesData) => {
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    
    edgesData.forEach((edge) => {
      unvisited.add(edge.from);
      unvisited.add(edge.to);
      distances[edge.from] = Infinity;
      distances[edge.to] = Infinity;
    });

    distances[start] = 0;
    while (unvisited.size > 0) {
      const current = Array.from(unvisited).reduce((minNode, node) => 
        distances[node] < distances[minNode] ? node : minNode
      );
      
      if (current === end) break;
      if (distances[current] === Infinity) break;

      unvisited.delete(current);
      
      edgesData.forEach((edge) => {
        if (edge.from === current || edge.to === current) {
          const neighbor = edge.from === current ? edge.to : edge.from;
          if (unvisited.has(neighbor)) {
            const newDist = distances[current] + edge.weight;
            if (newDist < distances[neighbor]) {
              distances[neighbor] = newDist;
              previous[neighbor] = edge.id;
            }
          }
        }
      });
    }

    const path = [];
    let current = end;
    while (previous[current]) {
      path.unshift(previous[current]);
      const edge = edgesData.get(previous[current]);
      current = edge.from === current ? edge.to : edge.from;
    }
    return path;
  };

  const computeDijkstraSteps = (start, end, edgesData) => {
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    const steps = [];

    edgesData.forEach((edge) => {
      unvisited.add(edge.from);
      unvisited.add(edge.to);
      distances[edge.from] = Infinity;
      distances[edge.to] = Infinity;
    });

    distances[start] = 0;
    while (unvisited.size > 0) {
      const current = Array.from(unvisited).reduce((minNode, node) => 
        distances[node] < distances[minNode] ? node : minNode
      );

      unvisited.delete(current);
      
      edgesData.forEach((edge) => {
        if (edge.from === current || edge.to === current) {
          const neighbor = edge.from === current ? edge.to : edge.from;
          if (unvisited.has(neighbor)) {
            const newDist = distances[current] + edge.weight;
            if (newDist < distances[neighbor]) {
              distances[neighbor] = newDist;
              previous[neighbor] = edge.id;
              
              steps.push({
                visited: new Set(unvisited),
                candidates: edgesData.getIds().filter(id => 
                  unvisited.has(edgesData.get(id).from) || unvisited.has(edgesData.get(id).to)
                ),
                currentEdge: edge,
                shortestPathEdges: Object.values(previous)
              });
            }
          }
        }
      });
    }
    return steps;
  };

  const generateRandomGraph = () => {
    const numNodes = Math.floor(Math.random() * 5) + 5;
    const newNodes = [];
    const radius = 100;
    const center = { x: 0, y: 0 };
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 1; i <= numNodes; i++) {
      const angle = (2 * Math.PI * i) / numNodes;
      newNodes.push({
        id: i,
        label: labels[i - 1],
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      });
    }

    const newEdges = [];
    const connected = new Set([1]);
    for (let i = 2; i <= numNodes; i++) {
      const targets = Array.from(connected);
      const target = targets[Math.floor(Math.random() * targets.length)];
      const weight = Math.floor(Math.random() * 10) + 1;
      newEdges.push({
        id: `${i}-${target}`,
        from: i,
        to: target,
        label: `${weight}`,
        weight,
      });
      connected.add(i);
    }

    nodes.current.clear();
    edges.current.clear();
    nodes.current.add(newNodes);
    edges.current.add(newEdges);
    
    const newPath = computeDijkstra(1, numNodes, edges.current);
    setShortestPathEdges(newPath);
    setSteps(computeDijkstraSteps(1, numNodes, edges.current));
  };

  const handleSubmit = () => {
    const correctSet = new Set(shortestPathEdges);
    let correctCount = 0;

    selectedEdges.forEach((edgeId) => {
      if (correctSet.has(edgeId)) {
        updateEdgeColor(edgeId, "#0f0");
        correctCount++;
      } else {
        updateEdgeColor(edgeId, "#f00");
      }
    });

    setFeedback(`You got ${correctCount} out of ${shortestPathEdges.length} correct!`);

    if (correctCount === shortestPathEdges.length) {
      setTimeout(() => {
        alert("All answers are correct!");
        generateRandomGraph();
        handleReset();
      }, 1000);
    }
  };

  const handleSkip = () => {
    generateRandomGraph();
    handleReset();
  };

  const handleReset = () => {
    setSelectedEdges(new Set());
    setFeedback("");
    setOriginalEdgeColors(new Map());
    edges.current.forEach((edge) => updateEdgeColor(edge.id, "#aaa"));
    nodes.current.forEach((node) => updateNodeColor(node.id, "#fff"));
    networkRef.current?.unselectAll();

    if (mode === "visualize") {
      setCurrentStep(0);
      setIsRunning(false);
      visualizeStep(0);
    }
  };

  const handlePlayPause = () => {
    if (!isRunning && currentStep < steps.length - 1) {
      setIsRunning(true);
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            setIsRunning(false);
            return prev;
          }
          visualizeStep(prev + 1);
          return prev + 1;
        });
      }, 1000);
    } else {
      setIsRunning(false);
    }
  };

  const switchMode = (newMode) => {
    handleReset();
    setMode(newMode);
    if (newMode === "visualize") {
      visualizeStep(0);
    }
  };

  const getEdgeLabel = (edgeId) => {
    const edge = edges.current.get(edgeId);
    return edge ? `${edge.label} (A${edge.from}-A${edge.to})` : "";
  };

  return (
    <div className="algoContainer">
      <NavBar />
      <div className="title">
        <h2>Guess the Shortest Path (Dijkstra's Algorithm)</h2>
      </div>
      <div className="graph-container">
        <div className="graph" ref={containerRef} />
      </div>
      {mode === "quiz" ? (
        <div className="quiz-controls">
          <Button className="btn" variant="success" onClick={handleSubmit}>
            Submit
          </Button>
          <Button className="btn" variant="danger" onClick={handleReset}>
            Reset
          </Button>
          <Button className="btn" variant="primary" onClick={handleSkip}>
            Skip
          </Button>
          <Button variant="info" onClick={() => switchMode("visualize")}>
            Show Visualization
          </Button>
          <p className="feedback">{feedback}</p>
        </div>
      ) : (
        <div className="visualizer-controls">
          <div className="controls">
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="primary" onClick={handlePlayPause}>
              {isRunning ? "Pause" : "Play"}
            </Button>
            <Button
              variant="info"
              onClick={() => visualizeStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              Previous Step
            </Button>
            <Button
              variant="info"
              onClick={() => visualizeStep(currentStep + 1)}
              disabled={currentStep === steps.length - 1}
            >
              Next Step
            </Button>
            <Button variant="warning" onClick={() => switchMode("quiz")}>
              Back to Quiz
            </Button>
          </div>
          <div className="status">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dijkstra;


