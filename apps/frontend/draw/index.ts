import { Tool } from "@/components/Canvas";
import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape  = {
    type: "rect"
    values: [x:number, y:number, width:number, height:number]
} | {
    type: "circ"
    values: [cx:number, cy:number, r:number, sAngle:number, eAngle:number]
} | {
    type: "line"
    values: [sx:number, sy:number, ex:number, ey:number]
}



export default async function initDraw(canvas:HTMLCanvasElement, activeToolRef: React.RefObject<Tool>,  roomId:string, socket:WebSocket) : Promise<() => void> {

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Canvas context not available");
        // Return a no-op cleanup function
        return () => {};
    }

    let existingShapes : Shape[] = await getExistingShapes(roomId);

    // if (activeToolRef==null || activeToolRef.current ==null) {
    //     console.log("activeToolRef is null: ", activeToolRef);
    //     return () => {};
    // }
    

    clearCanvas(existingShapes, canvas, ctx);
    const socketOnMessageHandler = (event: MessageEvent) => {
        console.log("message...")
        const data = JSON.parse(event.data);
        if (data.type=="chat") {
            const newShape:Shape = JSON.parse(data.message);
            existingShapes.push(newShape);
            clearCanvas(existingShapes, canvas, ctx);
        }
        console.log("gotMessage...", data)
    }

    let clicked = false;
    let startX = 0, startY = 0, radius = 0, centerX = 100, centerY = 100;
    
    // Define handlers
    const mouseDownHandler = (e: MouseEvent) => {
        console.log("Current tool:", activeToolRef.current);
            clicked = true;
            startX = e.clientX;
            startY = e.clientY;
        console.log(startX, startY)
    };
    const mouseMoveHandler = (e: MouseEvent) => {
        if (!clicked) return;
        clearCanvas(existingShapes, canvas, ctx);
    
        if (activeToolRef.current === "rect") {
            ctx.strokeRect(startX, startY, e.clientX - startX, e.clientY - startY);
        } else if (activeToolRef.current === "circ") {
            console.log("circ script running...")
            radius = Math.sqrt(
                Math.pow(e.clientX - startX, 2) +
                Math.pow(e.clientY - startY, 2)
              )/(2*Math.sqrt(2));
            centerX = e.clientX - ((e.clientX - startX)/2);
            centerY = e.clientY - ((e.clientY - startY)/2);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (activeToolRef.current === "line") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
        }
    };
    const mouseUpHandler = (e: MouseEvent) => {
        clicked = false;
        let newShape: Shape | null = null;
    
        if (activeToolRef.current === "rect") {
            newShape = {
                type: "rect",
                values: [startX, startY, e.clientX - startX, e.clientY - startY]
            };
        } else if (activeToolRef.current === "circ") {
            newShape = {
                type: "circ",
                values: [centerX, centerY, radius, 0, 2 * Math.PI]
            };
        } else if (activeToolRef.current === "line") {
            newShape = {
                type: "line",
                values: [startX, startY, e.clientX, e.clientY]
            };
        }
        console.log("newShape created is : ", newShape?.type)
        
        if (newShape !== null) {
            existingShapes.push(newShape);
            socket.send(JSON.stringify({
                type: "chat",
                roomId: roomId,
                message: JSON.stringify(newShape)
            }));
        }
    };

    // Add event listeners
    socket.addEventListener("message", socketOnMessageHandler);
    canvas.addEventListener("mousedown", mouseDownHandler);
    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("mouseup", mouseUpHandler);

    // Return cleanup function
    return () => {
        socket.removeEventListener("message", socketOnMessageHandler);
        canvas.removeEventListener("mousedown", mouseDownHandler);
        canvas.removeEventListener("mousemove", mouseMoveHandler);
        canvas.removeEventListener("mouseup", mouseUpHandler);
    };
}

function clearCanvas(existingShapes:Shape[], canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";
    existingShapes.forEach( (shape) => {
    if (shape.type=='rect') {
        ctx.strokeRect(...shape.values)
    } else if (shape.type=='circ') {
        ctx.beginPath();
        ctx.arc(...shape.values);
        ctx.stroke();
    } else if (shape.type=='line') {
        const [startX, startY, endX, endY] = shape.values;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    });
}

async function getExistingShapes(roomId:string) {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const chats = res.data.recentChats;
    const shapes = chats.map( (chat: {message: string}) => {
        return JSON.parse(chat.message)
    })
    console.log({shapes})
    return shapes
};