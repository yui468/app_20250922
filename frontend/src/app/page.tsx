"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    applyEdgeChanges,
    type NodeProps,
    Handle,
    Position
} from "reactflow";

type MapData = {
    nodes: Node[];
    edges: Edge[];
};

type EditableNodeData = {
    label: string;
    onChangeLabel?: (id: string, next: string) => void;
};

function EditableNode({ id, data, selected }: NodeProps<EditableNodeData>) {
    const [editing, setEditing] = useState<boolean>(false);
    const [value, setValue] = useState<string>(data.label ?? "");

    useEffect(() => {
        setValue(data.label ?? "");
    }, [data.label]);

    const startEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditing(true);
    };

    const stopEdit = () => {
        setEditing(false);
        data.onChangeLabel?.(id, value);
    };

    return (
        <div
            onClick={startEdit}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
                padding: 8,
                borderRadius: 8,
                background: "#fff",
                border: selected ? "2px solid #8b5cf6" : "1px solid #e5e7eb",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                minWidth: 100,
                textAlign: "center"
            }}
        >
            <Handle type="target" position={Position.Left} style={{ background: "#a78bfa", width: 10, height: 10, border: "2px solid #fff" }} />
            <Handle type="source" position={Position.Right} style={{ background: "#a78bfa", width: 10, height: 10, border: "2px solid #fff" }} />
            {editing ? (
                <input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={stopEdit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") stopEdit();
                        if (e.key === "Escape") setEditing(false);
                    }}
                    style={{
                        width: "100%",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        padding: "4px 6px"
                    }}
                />
            ) : (
                <span>{data.label}</span>
            )}
        </div>
    );
}

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
    const [nodes, setNodes] = useState<Node<EditableNodeData>[]>([
        { id: "1", position: { x: 0, y: 0 }, data: { label: "中心アイデア" }, type: "editable" }
    ]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const idCounterRef = useRef<number>(2);
    const { screenToFlowPosition } = useReactFlow();

    const randomPastel = (): string => {
        const h = Math.floor(Math.random() * 360);
        return `hsl(${h} 70% 70%)`;
    };

    const onConnect = useCallback((connection: Connection) => {
        setEdges((prev) => addEdge({ ...connection, type: 'bezier', style: { stroke: randomPastel(), strokeWidth: 2 } }, prev));
    }, []);

    const onChangeLabel = useCallback((id: string, next: string) => {
        setNodes((prev) => prev.map((n) => n.id === id ? { ...n, data: { ...(n.data as any), label: next } } : n));
    }, []);

    useEffect(() => {
        setNodes((prev) => prev.map((n) => ({ ...n, data: { ...(n.data as any), onChangeLabel } })));
    }, [onChangeLabel]);

    const handlePaneClick = useCallback((event: React.MouseEvent) => {
        if (event.detail !== 2) return; // ダブルクリック時のみ
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newId = String(idCounterRef.current++);
        setNodes((prev) => [
            ...prev,
            { id: newId, position, data: { label: `ノード ${newId}`, onChangeLabel }, type: 'editable' }
        ]);
    }, [screenToFlowPosition, onChangeLabel]);

    const onExportJson = useCallback(() => {
        const nodesForExport: Node[] = nodes.map((n) => ({
            ...n,
            data: { label: (n.data as EditableNodeData).label }
        }));
        const data: MapData = { nodes: nodesForExport, edges };
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
            const restored = (parsed.nodes ?? []).map((n) => ({
                ...n,
                type: 'editable',
                data: { label: (n as any).data?.label, onChangeLabel }
            })) as Node<EditableNodeData>[];
            setNodes(restored);
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

    const nodeTypes = useMemo(() => ({ editable: EditableNode }), []);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
                onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
                onConnect={onConnect}
                onPaneClick={handlePaneClick}
                fitView
                nodeTypes={nodeTypes}
                defaultEdgeOptions={{ type: 'bezier', style: { stroke: '#a78bfa', strokeWidth: 2 } }}
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
