import {WebSocket, WebSocketServer} from "ws";
import { IncomingMessage } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
import { parse } from "path";
import { stringify } from "querystring";

interface User {
  userId: string,
  ws: WebSocket,
  rooms: string[]
};
const users:User[] = [];


const wss = new WebSocketServer({ port: 8081 });

function checkAuth(token:string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return (decoded as JwtPayload).userId;
  } catch(error) {
    console.log(error);
    return null;
  }
}

wss.on('connection', function connection(ws, request) {
  ws.on('error', console.error);
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }
  const searchParams = new URLSearchParams(url.split("?")[1]);
  const token = searchParams.get("token");
  if (token==null) {
    // console.log("there was no token!")
    ws.close();
    return;
  }
  const AuthedUserId = checkAuth(token);
  if (AuthedUserId==null) {
    ws.close();
    return;
  }

  users.push({
    userId:AuthedUserId,
    ws:ws,
    rooms: []
  })
  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !=="string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data as unknown as string);

    }
    if (parsedData.type === 'join_room') {
      const user = users.find(x => x.ws === ws); // cf. x.ws==ws
      user?.rooms.push(parsedData.roomId);
      ws.send(`Room ${parsedData.roomId} joined!`);
    }
    if (parsedData.type === 'leave_room') {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return; 
      }
      user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
      ws.send(`Room ${parsedData.roomId} left!`);
    }
    if (parsedData.type === 'chat') {
      const message = parsedData.message;
      const roomId = parsedData.roomId;

      // ideally this should be in a queue
      await prismaClient.chat.create({
        data: {
          message,
          authorId: AuthedUserId,
          roomId
        }
      });
      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message,
            roomId
          }))
        }
      })
    }

  })
}); 
