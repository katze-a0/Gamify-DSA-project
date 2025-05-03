import React, { useRef, useState, useEffect } from "react";
import NavBar from "../Components/Navbar";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import "../styles/algorithm.css";
import Button from "react-bootstrap/Button";
import Heap from "heap-js";

const Prim = () => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [mode, setMode] = useState("quiz"); // 'quiz' or 'visualize'
  const [mstEdges, setMstEdges] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState(new Set());
  const [feedback, setFeedback] = useState("");
  const [originalEdgeColors, setOriginalEdgeColors] = useState(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);

  // Shared graph data
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
      edges: {
        font: { align: "top" },
        color: { color: "#aaa" },
        smooth: false,
      },
      physics: false,
      interaction: {
        dragNodes: true, // Allow dragging nodes
        dragView: true, // Allow dragging the view
        zoomView: true, // Allow zooming the view
      },
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    // Initialize both MST and steps
    const computedMST = computeMST(edges.current);
    setMstEdges(computedMST);
    setSteps(computeMSTSteps(edges.current));

    // Visualize the first step
    visualizeStep(0);

    const handleSelectEdge = (params) => {
      if (mode === "quiz") {
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

  // Shared graph operations
  const generateRandomGraph = () => {
    const numNodes = Math.floor(Math.random() * 2) + 5; // 5–6 nodes
    const newNodes = [];
    const radius = 100;
    const center = { x: 0, y: 0 };
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Assign positions in a circle
    for (let i = 1; i <= numNodes; i++) {
      const angle = (2 * Math.PI * i) / numNodes;
      newNodes.push({
        id: i,
        label: labels[i - 1], // Use letters for labels
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      });
    }

    // Generate a spanning tree (connected with n-1 edges)
    const newEdges = [];
    const inTree = new Set([1]); // Start with node 1

    // Connect each node to the tree
    for (let i = 2; i <= numNodes; i++) {
      const possibleTargets = Array.from(inTree);
      const target =
        possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      const weight = Math.floor(Math.random() * 10) + 1;
      newEdges.push({
        id: `${i}-${target}`,
        from: i,
        to: target,
        label: `${weight}`,
        weight,
      });
      inTree.add(i);
    }

    // Add additional edges up to 7 total
    const existingEdges = new Set(newEdges.map((e) => `${e.from}-${e.to}`));
    let edgeCount = newEdges.length;

    // Collect all possible non-tree edges
    const possibleEdges = [];
    for (let i = 1; i <= numNodes; i++) {
      for (let j = i + 1; j <= numNodes; j++) {
        const edgeId = `${i}-${j}`;
        if (!existingEdges.has(edgeId) && !existingEdges.has(`${j}-${i}`)) {
          possibleEdges.push({ from: i, to: j });
        }
      }
    }

    // Shuffle and add edges until we reach 7 or run out
    possibleEdges.sort(() => Math.random() - 0.5);
    for (const edge of possibleEdges) {
      if (edgeCount >= 7) break;
      const weight = Math.floor(Math.random() * 10) + 1;
      const edgeId = `${edge.from}-${edge.to}`;
      newEdges.push({
        id: edgeId,
        from: edge.from,
        to: edge.to,
        label: `${weight}`,
        weight,
      });
      existingEdges.add(edgeId);
      edgeCount++;
    }

    return { newNodes, newEdges };
  };

  const computeMST = (edges) => {
    const mst = [];
    const mstNodes = new Set();
    const edgeQueue = new Heap((a, b) => a.weight - b.weight); // Min-Heap

    const addEdges = (node) => {
      edges.forEach((edge) => {
        if (
          (edge.from === node && !mstNodes.has(edge.to)) ||
          (edge.to === node && !mstNodes.has(edge.from))
        ) {
          edgeQueue.push(edge); // Efficient O(log n) insertion
        }
      });
    };

    mstNodes.add(1);
    addEdges(1);

    while (mstNodes.size < nodes.current.length && !edgeQueue.isEmpty()) {
      const minEdge = edgeQueue.pop(); // Extract min edge in O(log n)

      if (!minEdge) break;

      const { from, to } = minEdge;
      if (mstNodes.has(from) && mstNodes.has(to)) continue; // Avoid cycles

      const newNode = mstNodes.has(from) ? to : from;
      mst.push(minEdge.id);
      mstNodes.add(newNode);
      addEdges(newNode);
    }

    return mst;
  };

  const computeMSTSteps = (edges) => {
    const steps = [];
    const visited = new Set([1]);
    let candidates = [];

    // Initial step
    steps.push({
      visited: new Set([1]),
      candidates: [],
      currentEdge: null,
      mstEdges: [],
    });

    const addEdges = (node) => {
      edges.forEach((edge) => {
        const connectsUnvisited =
          visited.has(edge.from) !== visited.has(edge.to);
        const existsInCandidates = candidates.some((e) => e.id === edge.id);

        if (connectsUnvisited && !existsInCandidates) {
          candidates.push(edge);
        }
      });
    };

    addEdges(1);

    while (visited.size < nodes.current.length && candidates.length > 0) {
      // Remove edges that no longer connect unvisited nodes
      candidates = candidates.filter(
        (edge) => visited.has(edge.from) !== visited.has(edge.to)
      );

      if (candidates.length === 0) break;

      candidates.sort((a, b) => a.weight - b.weight);
      const minEdge = candidates.shift();
      const [from, to] = [minEdge.from, minEdge.to];
      const newNode = visited.has(from) ? to : from;

      // Update steps before modifying candidates
      steps.push({
        visited: new Set([...visited, newNode]),
        candidates: [...candidates],
        currentEdge: minEdge,
        mstEdges: [...steps[steps.length - 1].mstEdges, minEdge.id],
      });

      visited.add(newNode);
      addEdges(newNode);
    }

    return steps;
  };

  const visualizeStep = (stepIndex) => {
    if (
      !steps ||
      steps.length === 0 ||
      stepIndex < 0 ||
      stepIndex >= steps.length
    ) {
      return;
    }

    const step = steps[stepIndex];

    // Reset all edges
    edges.current.forEach((edge) => {
      updateEdgeColor(edge.id, "#aaa");
    });

    // Highlight current edge
    if (step?.currentEdge) {
      updateEdgeColor(step.currentEdge.id, "#f00");
    }

    // Show MST edges
    if (step?.mstEdges) {
      step.mstEdges.forEach((edgeId) => {
        updateEdgeColor(edgeId, "#0f0");
      });
    }

    // Highlight candidate edges
    if (step?.candidates) {
      step.candidates.forEach((edge) => {
        updateEdgeColor(edge.id, "#ff0");
      });
    }

    // Update node colors
    nodes.current.forEach((node) => {
      updateNodeColor(node.id, step?.visited?.has(node.id) ? "#7f7" : "#fff");
    });

    setCurrentStep(stepIndex);
  };

  const toggleEdgeSelection = (edgeId) => {
    setSelectedEdges((prev) => {
      const updated = new Set(prev);
      if (updated.has(edgeId)) {
        updated.delete(edgeId);
        updateEdgeColor(edgeId, originalEdgeColors.get(edgeId) || "#aaa"); // reset edge color
      } else {
        if (!originalEdgeColors.has(edgeId)) {
          const edge = edges.current.get(edgeId);
          if (edge) {
            const edgeColor = edge.color?.color || "#aaa"; // Default to the normal gray if undefined
            setOriginalEdgeColors((prevColors) =>
              new Map(prevColors).set(edgeId, edgeColor)
            );
          }
        }
        updated.add(edgeId);
        updateEdgeColor(edgeId, "#00f"); // blue - selected edge
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    const correctSet = new Set(mstEdges);
    const correctNodes = new Set();
    const wrongNodes = new Set();

    console.log(mstEdges);
    console.log(selectedEdges);

    let correctCount = 0;
    selectedEdges.forEach((edgeId) => {
      const edge = edges.current.get(edgeId);
      if (!edge) return; // Skip if edge doesn't exist

      if (correctSet.has(edgeId)) {
        updateEdgeColor(edgeId, "#0f0"); // green - correct edge
        correctNodes.add(edge.from);
        correctNodes.add(edge.to);
        correctCount++;
      } else {
        updateEdgeColor(edgeId, "#f00"); // red - wrong edge
        wrongNodes.add(edge.from);
        wrongNodes.add(edge.to);
      }
    });

    // For every edge in the MST not selected by the user, ensure it retains its original color.
    mstEdges.forEach((edgeId) => {
      if (!selectedEdges.has(edgeId)) {
        const originalColor = originalEdgeColors.get(edgeId) || "#aaa";
        updateEdgeColor(edgeId, originalColor); // reset edge color
        const edge = edges.current.get(edgeId);
        if (edge) {
          correctNodes.add(edge.from);
          correctNodes.add(edge.to);
        }
      }
    });

    setFeedback(`You got ${correctCount} out of ${mstEdges.length} correct!`);

    // Move to another graph if all answers are correct
    if (correctCount === mstEdges.length) {
      setTimeout(() => {
        alert("All answers are correct!");
        // Generate new graph data as arrays
        const { newNodes, newEdges } = generateRandomGraph();
        // Clear existing data and add new nodes/edges
        nodes.current.clear();
        edges.current.clear();
        nodes.current.add(newNodes);
        edges.current.add(newEdges);
        // Recalculate MST with the updated edges DataSet
        setMstEdges(computeMST(edges.current));
        // Reset UI elements
        handleReset();
      }, 1000);
    }
  };

  const handleReset = () => {
    setSelectedEdges(new Set());
    setFeedback("");
    setOriginalEdgeColors(new Map());
    edges.current.forEach((edge) => updateEdgeColor(edge.id, "#aaa"));
    nodes.current.forEach((node) => updateNodeColor(node.id, "#fff"));
    networkRef.current.unselectAll();

    if (mode === "visualize") {
      setCurrentStep(0);
      setIsRunning(false);
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

  const handleSkip = () => {
    // Generate new graph data as arrays
    const { newNodes, newEdges } = generateRandomGraph();
    // Clear existing data and add new nodes/edges
    nodes.current.clear();
    edges.current.clear();
    nodes.current.add(newNodes);
    edges.current.add(newEdges);
    // Recalculate MST with the updated edges DataSet
    setMstEdges(computeMST(edges.current));
    // Regenerate both MST and steps
    const newMST = computeMST(edges.current);
    setMstEdges(newMST);
    setSteps(computeMSTSteps(edges.current));
    // Reset UI elements
    handleReset();
  };

  const updateEdgeColor = (edgeId, color) => {
    const edge = edges.current.get(edgeId);
    if (edge) {
      edges.current.update({ id: edgeId, color: { color } });
      networkRef.current.redraw();
    }
  };

  const updateNodeColor = (nodeId, color) => {
    nodes.current.update({ id: nodeId, color: { background: color } });
    networkRef.current.redraw();
  };

  const switchMode = (newMode) => {
    handleReset();
    setMode(newMode);
    if (newMode === "visualize") {
      visualizeStep(0);
    }
  };

  return (
    <div className="algoContainer">
      <NavBar />
      <div className="title">
        <h2>
          {mode === "quiz" ? "Find the MST" : "Prim's Algorithm Visualizer"}
        </h2>
      </div>

      <div className="graph-container">
        <div className="graph" ref={containerRef} />
      </div>

      {mode === "quiz" ? (
        <div className="quiz-controls">
          <Button variant="success" onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant="danger" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleSkip}>
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

export default Prim;
