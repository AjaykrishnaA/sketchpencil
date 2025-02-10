import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().min(3).max(20),
    email: z.string().min(3),
    password: z.string().min(5).max(15),
});

export const signinSchema = z.object({
    email: z.string().min(3),
    password: z.string().min(5).max(15),
});

export const createRoomSchema = z.object({
    name: z.string().min(3).max(20)
});