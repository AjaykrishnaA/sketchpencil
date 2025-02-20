"use client"
import { WS_BACKEND } from "@/config"
import { useEffect, useState } from "react"
import Canvas from "./Canvas";

export default function CanvasPage({roomId}: {
    roomId: string
}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(()=> {
        const ws = new WebSocket(`${WS_BACKEND}/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiNWEzMzQ5Yi0zZTkzLTRhNGQtOTFmNC02YTAzZjZjYmM2OTgiLCJpYXQiOjE3Mzg2NTYxMjV9.bCYBRURWSRs9-EcOxd2Odpmx_B7X9G8dx1L4A_XIXyY`) //token
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

    },[roomId])
    if(!socket) {
        return "WebSocket Loading...";
    }
    return <Canvas roomId={roomId} socket={socket} />
}