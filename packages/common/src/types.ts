import { z } from "zod";

const emailSchema = z.string()
  .min(3, { message: "Email must contain at least 3 characters" })
  .email({ message: "Please enter a valid email address" });

const passwordSchema = z.string()
  .min(5, { message: "Password must contain at least 5 characters" })
  .max(15, { message: "Password cannot exceed 15 characters" });

// Create a custom name validator with combined error message
const nameValidator = (fieldName: string = "Name") => 
  z.string()
    .refine(val => val.length >= 3 && val.length <= 20, {
      message: `${fieldName} must be between 3 and 20 characters`
    });

export const createUserSchema = z.object({
    name: nameValidator(),
    email: emailSchema,
    password: passwordSchema,
});

export const signinSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const createRoomSchema = z.object({
    name: nameValidator("Room name")
});