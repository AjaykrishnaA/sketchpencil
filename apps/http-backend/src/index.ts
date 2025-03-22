import express, { Request, Response } from "express";
import cors from "cors"
import jwt from "jsonwebtoken";
import { createUserSchema, signinSchema, createRoomSchema } from "@repo/common/types"; 
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
import { auth } from "./middleware";

const app = express();

app.use(cors({origin: "https://sketchpencil.ajaylabs.space"}))
app.use(express.json());
app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.post("/signup", async (req: Request, res: Response) => {
    const parsedUser = createUserSchema.safeParse(req.body);
    if (!parsedUser.success) {
        res.json({
            "message": "Invalid Credentials",
            "errors": parsedUser.error.errors
        });
        return;
    };
    try {
        const newUser = await prismaClient.user.create({
            data: {
                email: parsedUser.data.email,
                password: parsedUser.data.password,
                name: parsedUser.data.name
            }
        })
        const token = jwt.sign({
            userId: newUser.id
        }, JWT_SECRET);
        res.send({
            token
        });
    } catch(error) {
        res.status(401).json({
            "message": "A user with this email already exist!",
            "errors": error
        });
        return;
    }
})

app.post("/signin", async (req: Request, res: Response) => {
    const parsedUser = signinSchema.safeParse(req.body);
    if (!parsedUser.success) {
        res.json({
            "message": "Invalid Credentials",
            "errors": parsedUser.error.errors
        });
        return;
    };
    const dbUser = await prismaClient.user.findFirst({
        where: {
            email: parsedUser.data.email
        }
    });
    if (!dbUser) {
        res.status(401).json({
            "message": "User does not exist! Signup first."
        });
        return;
    }
    if (dbUser?.password!=parsedUser.data.password) {
        res.status(401).json({
            "message": "Incorrect password!"
        });
        return;
    }
    const token = jwt.sign({
        userId: dbUser.id
    }, JWT_SECRET);
    res.send({
        token
    });
});

// @ts-ignore
app.post("/room/create-room", auth, async (req: Request, res: Response) => {
    const parsedRoom = createRoomSchema.safeParse(req.body);
    if (!parsedRoom.success) {
        res.json({
            "message": "Invalid Input",
            "errors": parsedRoom.error.errors
        });
        return;
    };
    try {
        const newRoom = await prismaClient.room.create({
            data: {
                slug: parsedRoom.data.name,
                adminId: (req.userId as string)
            }
        });
        return res.json({
            "roomId": newRoom.roomId
        })
    } catch(error) {
        res.status(401).json({
            "message": "A database error occured!"
        });
        return;
    }
});

app.get("/chats/:roomId", async (req, res) => {
    const roomId = req.params.roomId;
    const recentChats = await prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        take: 50,
        orderBy: {
            chatId:"desc"
        }
    })
    res.json({
        recentChats
    })
})

app.get("/room/:roomSlug", async (req, res) => {
    const roomSlug = req.params.roomSlug;

    try {
        const room = await prismaClient.room.findFirst({
            where: { slug: roomSlug }
        });


        if (room==null) {
            res.status(404).json({
                error: "The requested room does not exist! Create a room first."
            });
            return;
        }

        res.json({ roomId: room.roomId });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(3001, () => {
    console.log("https-backend is running on port 3001");
});