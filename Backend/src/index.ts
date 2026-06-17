import "./config.js";
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import zod from "zod";
import bcrypt from "bcrypt";
import { userMiddleware } from "./middleware/user.js";
import { userModel, contentModel, tagModel, linkModel } from "./database/db.js";
import crypto from "crypto";

const app = express();

app.use(express.json());

const signUpSchema = zod.object({
  username: zod.string().min(3, "Username must be at least 3 characters long"),
  password: zod
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const signInSchema = zod.object({
  username: zod.string().min(3, "Username must be at least 3 characters long"),
  password: zod
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

app.post("/api/v1/signup", async (req, res) => {
  try {
    const validateData = signUpSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(411).json({
        message: "Invalid Data",
      });
    }
    const { username, password } = validateData.data;

    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.status(403).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.create({
      username,
      password: hashedPassword,
    });

    res.status(200).json({
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  try {
    const validateData = signInSchema.safeParse(req.body);
    if(!validateData.success) {
      return res.status(411).json({
        message: "Invalid Data"
      })
    }
    const { username, password } = validateData.data;
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET || "",
    );
    res.status(200).json({
      token: token,
      message: "User signed in successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  try { 
    const { link, type, title, tags } = req.body;
    const userId = req.userId;

    const validTypes = ["image", "video", "article", "audio"];
    if(!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid content type",
      });
    }

    await contentModel.create({
      link,
      type,
      title,
      tags,
      userId
    })

    res.status(200).json({
      message: "Content Added Successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const content = await contentModel.find({
      userId
    }).populate("tags")

    res.status(200).json({
      content
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
})

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const contentId = req.body.contentId;
    const userId = req.userId;
    await contentModel.findOneAndDelete({
      _id: contentId,
      userId
    });

    res.status(200).json({
      message: "Content Delete successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    })
  }
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  try {
    const share = req.body.share;
    if(share) {
      const existingLink = await linkModel.findOne({
        userId: req.userId
      });
      if(existingLink) {
        return res.status(200).json({
          hash: existingLink.hash
        })
      }

      const hash = crypto.randomBytes(10).toString('hex'); 
      await linkModel.create({
        hash,
        userId: req.userId
      })

      res.status(200).json({
        hash
      })
    } else {
      await linkModel.deleteOne({
        userId: req.userId
      })

      res.status(200).json({
        message: "Link deleted successully"
      })
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    })
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  try {
    const hash = req.params.shareLink;

    const link = await linkModel.findOne({
      hash
    })

    if(!link) {
      return res.status(404).json({
        message: "Link not found"
      })
    }

    const content = await contentModel.find({
      userId: link.userId
    })

    const user = await userModel.findOne({
      _id: link.userId
    })

    if(!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    res.status(200).json({
      username: user.username,
      content
    })

  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    })
  }
});

async function connectDB() {
  try {
    const mongourl = process.env.MONGO_URL;
    await mongoose.connect(mongourl || "");
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
  } catch (error) {
    console.error("Error connecting to the database", error);
  }
}

connectDB();
