import React from 'react';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import { ReactFlow, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

const CustomNode = ({ data }) => (
  <div>
    {data.status === 'running' && <CircularProgress />}
    {data.status === 'waiting'}
    <span>{data.label}</span>
    <Handle
      type="target"
      position={Position.Left}
      isConnectable={false}
    />
    <Handle
      type="source"
      position={Position.Right}
      isConnectable={false}
    />
  </div>
);

const nodeTypes = { customNode: CustomNode };

const AnalysesFlow = (props) => {

  const { taskData } = props;

  // loop through taskData and add nodes

  const nodes = []

  const followUpAnalyses = []

  taskData.steps.forEach((element, index) => {
    console.log(element);
    console.log(index);

    let position = { x: 100, y: 100 };
    if (element.analysisLevel === "followUp") {
      position = { x: 300, y: 50 };
      if (followUpAnalyses.length > 0) {
        position = { x: 300, y: 150 };
      }
      followUpAnalyses.push(element);
    }

    const id = index + 1;
    const node = {
      id: id.toString(),
      type: 'customNode',
      position,
      data: { label: element.name, status: element.status },
    };

    nodes.push(node);
  });

  console.log("nodes", nodes);

  return (
    <div style={{ height: 150 }}>
      <ReactFlow
        nodes={nodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        elementsSelectable={false}
        nodesDraggable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        panOnScroll={false}
        connectable={false}
      />
    </div>
  );
};

export default AnalysesFlow;
