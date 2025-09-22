"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    Connection,
    Edge,
    Node,
    Panel,
    useReactFlow,
    ReactFlowProvider,
    applyNodeChanges,
    applyEdgeChanges
} from "reactflow";

type MapData = {
    nodes: Node[];
    edges: Edge[];
};

function Toolbar({ onExportJson, onImportJson, onClear }: {
    onExportJson: () => void;
    onImportJson: (file: File) => void;
    onClear: () => void;
}) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onExportJson}>Export JSON</button>
            <button onClick={() => fileInputRef.current?.click()}>Import JSON</button>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportJson(file);
                    e.currentTarget.value = '';
                }}
            />
            <button onClick={onClear}>Clear</button>
        </div>
    );
}

function MindmapEditor() {
    const [nodes, setNodes] = useState<Node[]>([
        { id: "1", position: { x: 0, y: 0 }, data: { label: "中心アイデア" }, type: "default" }
    ]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const idCounterRef = useRef<number>(2);
    const { screenToFlowPosition } = useReactFlow();

    const onConnect = useCallback((connection: Connection) => {
        setEdges((prev) => addEdge({ ...connection, type: 'smoothstep' }, prev));
    }, []);

  const handlePaneDoubleClick = useCallback((event: React.MouseEvent) => {
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newId = String(idCounterRef.current++);
        setNodes((prev) => [
            ...prev,
            { id: newId, position, data: { label: `ノード ${newId}` }, type: 'default' }
        ]);
    }, [screenToFlowPosition]);

    const onExportJson = useCallback(() => {
        const data: MapData = { nodes, edges };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mindmap.json';
        a.click();
        URL.revokeObjectURL(url);
    }, [nodes, edges]);

    const onImportJson = useCallback(async (file: File) => {
        try {
            const text = await file.text();
            const parsed = JSON.parse(text) as MapData;
            setNodes(parsed.nodes ?? []);
            setEdges(parsed.edges ?? []);
            const maxId = parsed.nodes?.reduce((m, n) => Math.max(m, Number(n.id) || 0), 0) ?? 0;
            idCounterRef.current = Math.max(2, maxId + 1);
        } catch (e) {
            alert('JSONの読み込みに失敗しました');
        }
    }, []);

    const onClear = useCallback(() => {
        setNodes([]);
        setEdges([]);
        idCounterRef.current = 1;
    }, []);

    const nodeTypes = useMemo(() => ({}), []);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
                onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
                onConnect={onConnect}
        onDoubleClick={handlePaneDoubleClick}
                fitView
                nodeTypes={nodeTypes}
            >
                <Background />
                <MiniMap />
                <Controls />
                <Panel position="top-left">
                    <Toolbar onExportJson={onExportJson} onImportJson={onImportJson} onClear={onClear} />
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default function HomePage() {
    return (
        <ReactFlowProvider>
            <MindmapEditor />
        </ReactFlowProvider>
    );
}
