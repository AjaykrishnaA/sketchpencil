import CanvasPage from "@/components/CanvasPage";
import { HTTP_BACKEND } from "@/config";
import axios, { AxiosError } from "axios";

interface RoomResponse {
    roomId: string;
}

interface ErrorResponse {
    error: string;
}

async function getRoomId(roomSlug: string) {
    let res;
    try{
        res = await axios.get<RoomResponse>(`${HTTP_BACKEND}/room/${roomSlug}`);
        return res.data.roomId
    } catch (err: unknown) {
        const error = err as AxiosError<ErrorResponse>;;
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Server Error:", error.response.data.error);
            return {
                error: error.response.data.error
            };
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Network Error:", error.message);
            return {
                error: "Network Error: No response received from the server."
            };
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Request Error:", error.message);
            return {
                error: error.message
            };
        }
    }
}

export default async function RoomCanvas({params}: {
    params: {
        roomSlug: string
    }
}) {
    const roomSlug = (await params).roomSlug;
    
    const roomId = await getRoomId(roomSlug);
    if (typeof roomId !== "string"){
        return roomId.error
    }
    return <CanvasPage roomId={roomId} />
}