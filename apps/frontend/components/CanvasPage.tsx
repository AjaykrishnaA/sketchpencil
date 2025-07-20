"use client"
import { WS_BACKEND } from "@/config"
import { useEffect, useState } from "react"
import Canvas from "./Canvas";
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from "next/navigation";

export default function CanvasPage({roomId}: {
    roomId: string
}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const router = useRouter();

    useEffect(()=> {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }
        const ws = new WebSocket(`${WS_BACKEND}/?token=${token}`);
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                    type: "join_room",
                    roomId: roomId
            }));
            console.log("joining..", JSON.stringify({
                    type: "join_room",
                    roomId: roomId
            }))
        }
        ws.onerror = (error) => {
            console.log("WebSocket Error: ", error);
        }
        return () => {
            console.log("cleanup inside canPage..")
            ws.close()
        }

    },[roomId, router])
    if(!socket) {
        return "WebSocket Loading...";
    }
    return (
        <AuthGuard>
            <Canvas roomId={roomId} socket={socket} />
        </AuthGuard>
    )
}