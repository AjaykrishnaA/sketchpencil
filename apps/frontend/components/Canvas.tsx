"use client"
import initDraw from "@/draw";
import { useState, useEffect, useRef } from "react";
import { Square, Circle, Slash, MousePointer } from 'lucide-react';

interface ToolbarProps {
    activeTool: string;
    setActiveTool: (tool: Tool) => void;
    tools: Array<{
        id: string;
        icon: React.ElementType;  // Generic type for component
        label: string;
    }>;
}

export type Tool = "rect" | "circ" | "line" | "select"

interface toolItem {
    id: Tool
    icon : React.ComponentType
    label: string
}
const tools: toolItem[] = [
    { id: 'rect', icon: Square, label: 'Rectangle' },
    { id: 'circ', icon: Circle, label: 'Circle' },
    { id: 'line', icon: Slash, label: 'Line' },
    { id: 'select', icon: MousePointer, label: 'Select' }
];

export default function Canvas({roomId, socket}: {
    roomId: string,
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activeTool, setActiveTool] = useState<Tool>('circ');
    const activeToolRef = useRef(activeTool);
    useEffect(() => {
        activeToolRef.current = activeTool;
        console.log("activetool ref changed to ", activeToolRef.current)
    }, [activeTool]);


    console.log("inside_canvas: ", {
        activeTool
    })
    
    useEffect(() => {
        let cleanup: () => void;
        const setup = async () => {
          if (!canvasRef.current) return;
          cleanup = await initDraw(canvasRef.current, activeToolRef, roomId, socket);
        };

        setup();
        
        return () => {
            console.log("cleanup running...", cleanup)
          if (cleanup) cleanup();
        };
    }, [canvasRef, socket, roomId]);

    return <div className="h-screen overflow-hidden">
            <canvas ref={canvasRef}  width="3000" height="2000"></canvas>
            <Toolbar activeTool={activeTool} setActiveTool={setActiveTool}  tools={tools} />
        </div>
}


function Toolbar({activeTool, setActiveTool, tools}:ToolbarProps) {


    return (
        <div className="flex fixed bottom-10 right-10 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-1">
            {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id as Tool)}
                        className={`
                            relative group flex items-center justify-center
                            w-12 h-12 m-1 rounded-md transition-all duration-200
                            ${activeTool === tool.id 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
                        `}
                        aria-label={tool.label}
                        role="radio"
                        aria-checked={activeTool === tool.id}
                    >
                        <Icon className="w-5 h-5" />
                        
                        {/* Tooltip */}
                        <span className="
                            absolute -top-10 left-1/2 -translate-x-1/2
                            px-2 py-1 bg-gray-900 text-white text-sm rounded
                            opacity-0 group-hover:opacity-100 transition-opacity
                            whitespace-nowrap
                        ">
                            {tool.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}