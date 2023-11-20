import express from "express";
import { User } from "../models/userSchema";
import { UserInterface } from "../types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signUp = async (req: express.Request, res: express.Response) => {
  try {
    const { userName, email, password } = req.body as UserInterface;
    const alreadyUser = await User.findOne({ email });
    if (!alreadyUser) {
      const saltRounts: number = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounts);
      const newUser = await User.create({
        userName: userName,
        password: hashedPassword,
        email: email,
      });

      res.status(201).json({ userName, email });
    } else {
      res.status(400).json({ error: "User with this email already exists." });
    }
  } catch (error: unknown) {
    let errorMessage = "Something went wrong";
    if (error instanceof Error) {
      errorMessage += error.message;
    }
    res.status(400).send({ error: errorMessage });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body as UserInterface;

    const matchedUser = await User.findOne({ email }).select("+password");

    if (matchedUser) {
      const matchedPassword = await bcrypt.compare(
        password,
        matchedUser.password
      );
      if (matchedPassword) {
        const payload = {
          email: matchedUser.email,
          userName: matchedUser.userName,
          id: matchedUser._id,
        };
        const JWT_SECRET = process.env.SECRET || "";
        const token = jwt.sign(payload, JWT_SECRET, {
          expiresIn: "800000s",
        });
        res
          .cookie("access_token", token, {
            maxAge: 1000 * 2000,
          })
          .json(payload);
      } else {
        res.status(400).json({ error: "Invalid Password" });
      }
    } else {
      res.status(400).json({ error: "Invalid Email" });
    }
  } catch (error: unknown) {
    let errorMessage = "Something went wrong";
    if (error instanceof Error) {
      errorMessage += error.message;
    }
    res.status(400).send({ error: errorMessage });
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  console.log();
  try {
    res
      .cookie("access_token", "", { maxAge: 0 })
      .send("You have been logged out successfully!");
  } catch (error: unknown) {
    let errorMessage = "Something went wrong";
    if (error instanceof Error) {
      errorMessage += error.message;
    }
    res.status(400).send({ error: errorMessage });
  }
};
