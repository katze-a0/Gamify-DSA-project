import React, { useRef, useState, useEffect } from "react";
import NavBar from "../Components/Navbar";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import "../styles/algorithm.css";
import Button from "react-bootstrap/Button";

const Kruskal = () => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [mode, setMode] = useState("quiz");
  const [mstEdges, setMstEdges] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState(new Set());
  const [feedback, setFeedback] = useState("");
  const [originalEdgeColors, setOriginalEdgeColors] = useState(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);

  // Graph data setup
  const nodes = useRef(new DataSet([]));
  const edges = useRef(new DataSet([]));

  useEffect(() => {
    initializeGraph();
  }, []);

  const initializeGraph = () => {
    const initialNodes = [
      { id: 1, label: "A" },
      { id: 2, label: "B" },
      { id: 3, label: "C" },
      { id: 4, label: "D" },
      { id: 5, label: "E" },
    ];

    const initialEdges = [
      { id: "1-2", from: 1, to: 2, label: "3", weight: 3 },
      { id: "1-3", from: 1, to: 3, label: "1", weight: 1 },
      { id: "2-3", from: 2, to: 3, label: "2", weight: 2 },
      { id: "2-4", from: 2, to: 4, label: "4", weight: 4 },
      { id: "3-4", from: 3, to: 4, label: "5", weight: 5 },
      { id: "4-5", from: 4, to: 5, label: "7", weight: 7 },
      { id: "3-5", from: 3, to: 5, label: "6", weight: 6 },
    ];

    nodes.current.clear();
    edges.current.clear();
    nodes.current.add(initialNodes);
    edges.current.add(initialEdges);

    const data = { nodes: nodes.current, edges: edges.current };
    const options = {
      edges: {
        font: { align: "top" },
        color: { color: "#aaa" },
        smooth: false,
      },
      physics: false,
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    const computedMST = computeKruskalMST(edges.current);
    setMstEdges(computedMST);
    setSteps(computeKruskalSteps(edges.current));

    network.on("selectEdge", handleEdgeSelect);

    return () => network.destroy();
  };

  // Union-Find implementation
  const find = (parent, i) => (parent[i] === i ? i : find(parent, parent[i]));

  const union = (parent, rank, x, y) => {
    const rootX = find(parent, x);
    const rootY = find(parent, y);
    if (rootX !== rootY) {
      if (rank[rootX] < rank[rootY]) parent[rootX] = rootY;
      else if (rank[rootX] > rank[rootY]) parent[rootY] = rootX;
      else {
        parent[rootY] = rootX;
        rank[rootX]++;
      }
    }
  };

  const computeKruskalMST = (edgesDataSet) => {
    const edgesArray = edgesDataSet.get();
    const sortedEdges = [...edgesArray].sort((a, b) => a.weight - b.weight);
    const parent = {};
    const rank = {};

    nodes.current.forEach((node) => {
      parent[node.id] = node.id;
      rank[node.id] = 0;
    });

    const mst = [];
    for (const edge of sortedEdges) {
      const rootFrom = find(parent, edge.from);
      const rootTo = find(parent, edge.to);
      if (rootFrom !== rootTo) {
        mst.push(edge.id);
        union(parent, rank, rootFrom, rootTo);
      }
    }
    return mst;
  };

  const computeKruskalSteps = (edgesDataSet) => {
    const edgesArray = edgesDataSet.get();
    const sortedEdges = [...edgesArray].sort((a, b) => a.weight - b.weight);
    const parent = {};
    const rank = {};
    const steps = [];
    const mstEdges = [];
    const rejectedEdges = [];

    nodes.current.forEach((node) => {
      parent[node.id] = node.id;
      rank[node.id] = 0;
    });

    for (const edge of sortedEdges) {
      const rootFrom = find(parent, edge.from);
      const rootTo = find(parent, edge.to);
      const added = rootFrom !== rootTo;

      if (added) {
        union(parent, rank, rootFrom, rootTo);
        mstEdges.push(edge.id);
      } else {
        rejectedEdges.push(edge.id);
      }

      steps.push({
        currentEdge: edge,
        added,
        mstEdges: [...mstEdges],
        rejectedEdges: [...rejectedEdges],
      });
    }

    return steps;
  };

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

  // Visualization functions
  const visualizeStep = (stepIndex) => {
    if (!steps.length || stepIndex < 0 || stepIndex >= steps.length) return;

    const step = steps[stepIndex];
    edges.current.forEach((edge) => updateEdgeColor(edge.id, "#aaa"));

    step.mstEdges.forEach((edgeId) => updateEdgeColor(edgeId, "#0f0"));
    step.rejectedEdges.forEach((edgeId) => updateEdgeColor(edgeId, "#f00"));

    if (step.currentEdge) {
      updateEdgeColor(step.currentEdge.id, step.added ? "#0f0" : "#f00");
    }

    setCurrentStep(stepIndex);
  };

  const handleEdgeSelect = (params) => {
    if (mode === "quiz" && params.edges.length) {
      toggleEdgeSelection(params.edges[0]);
    }
  };

  const toggleEdgeSelection = (edgeId) => {
    setSelectedEdges((prev) => {
      const updated = new Set(prev);
      if (updated.has(edgeId)) {
        updated.delete(edgeId);
        updateEdgeColor(edgeId, originalEdgeColors.get(edgeId) || "#aaa");
      } else {
        if (!originalEdgeColors.has(edgeId)) {
          const edge = edges.current.get(edgeId);
          setOriginalEdgeColors((prev) =>
            new Map(prev).set(edgeId, edge.color?.color || "#aaa")
          );
        }
        updated.add(edgeId);
        updateEdgeColor(edgeId, "#00f");
      }
      return updated;
    });
  };

  // Control handlers
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
        setMstEdges(computeKruskalMST(edges.current));
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

  const handleSkip = () => {
    const { newNodes, newEdges } = generateRandomGraph();
    nodes.current.clear();
    edges.current.clear();
    nodes.current.add(newNodes);
    edges.current.add(newEdges);
    setMstEdges(computeKruskalMST(edges.current));
    setSteps(computeKruskalSteps(edges.current));
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
    if (newMode === "visualize") visualizeStep(0);
  };

  return (
    <div className="algoContainer">
      <NavBar />
      <div className="title">
        <h2>
          {mode === "quiz" ? "Find the MST" : "Kruskal's Algorithm Visualizer"}
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
              Previous
            </Button>
            <Button
              variant="info"
              onClick={() => visualizeStep(currentStep + 1)}
              disabled={currentStep >= steps.length - 1}
            >
              Next
            </Button>
            <Button variant="warning" onClick={() => switchMode("quiz")}>
              Back to Quiz
            </Button>
          </div>
          <div className="status">
            Step {currentStep + 1} of {steps.length}
          </div>
          <br />
          <br />
        </div>
      )}
    </div>
  );
};

export default Kruskal;
