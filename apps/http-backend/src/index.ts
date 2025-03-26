import express, { Request, Response } from "express";
import cors from "cors"
import jwt from "jsonwebtoken";
import { createUserSchema, signinSchema, createRoomSchema } from "@repo/common/types"; 
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
import { auth } from "./middleware";

const app = express();

app.use(cors({
    origin: [
        "https://sketchpencil.ajaylabs.space"
        ]
}));
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
app.get("/roomAccess/recentrooms", auth, async (req, res) => {
    const userId = req.userId;
    try {
        const recentRooms = await prismaClient.userRoomAccess.findMany({
            where: {
                userId: userId
            },
            take: 10,
            orderBy: {
                lastAccessed: "desc"
            },
            include: {
                room: {
                    select: {
                        slug: true
                    }
                }
            }
        });
        
        res.json({
            recentRooms: recentRooms || []
        });
    } catch (error) {
        console.error('Error fetching recent rooms:', error);
        res.json({
            recentRooms: []
        });
    }
});

// Update user's room access record
//@ts-ignore
app.post("/roomaccess/update", auth, async (req, res) => {
    if(!req.userId) {
        return res.status(401).json({
            "message": "userId is required"
        });
    }
    const userId = req.userId;
    const { roomSlug } = req.body;

    if (!roomSlug) {
        return res.status(400).json({
            "message": "Room slug is required"
        });
    }

    try {
        // First get the roomId from the slug
        const room = await prismaClient.room.findFirst({
            where: { slug: roomSlug }
        });

        if (!room) {
            return res.status(404).json({
                "message": "Room not found"
            });
        }

        const userRoomAccess = await prismaClient.userRoomAccess.findFirst({
            where: {
                userId: userId,
                roomId: room.roomId
            }
        });

        if (userRoomAccess) {
            await prismaClient.userRoomAccess.update({
                where: {
                    id: userRoomAccess.id
                },
                data: {
                    lastAccessed: new Date()
                }
            });
        } else {
            await prismaClient.userRoomAccess.create({
                data: {
                    userId: userId,
                    roomId: room.roomId,
                    lastAccessed: new Date()
                }
            });
        }

        res.json({
            "message": `Successfully updated the room access for user ${userId} and room ${roomSlug}`
        });
    } catch(error) {
        console.error('Error updating room access:', error);
        res.status(500).json({
            "message": "A database error occurred while updating userRoomAccess!"
        });
    }
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
            "message": "A database error occured! Maybe a Room with this name already exist!"
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
});

/**
 * Endpoint to get room details by room slug
 * @route GET /room/:roomSlug
 * @param {string} req.params.roomSlug - The slug of the room to find
 * @returns {Object} Room ID if found, error message if not found or server error
 */
app.get("/room/:roomSlug", async (req, res) => {
    const roomSlug = req.params.roomSlug;

    try {
        const room = await prismaClient.room.findFirst({
            where: { slug: roomSlug }
        });


        if (room==null) {
            res.status(404).json({
                error: "The requested room does not exist! You can create a room from the dashboard."
            });
            return;
        }

        res.json({ roomId: room.roomId });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
const port = 8080;
app.listen(port, () => {
    console.log(`https-backend is running on port ${port}`);
});