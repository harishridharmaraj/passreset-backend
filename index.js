import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UserModel from "./modals/users.js";
import cors from "cors";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello");
});
const tokentiming = new Date();
tokentiming.setMinutes(tokentiming.getMinutes() + 5);
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "personal@harisworkspace.com",
    pass: "Harishri@1990",
  },
});

app.put("/checkemail", async (req, res) => {
  const { email } = req.body;
  const users = await UserModel.findOne({ email: email });
  if (!users) {
    return res.status(404).json({ error: "User not found" });
  }
  const resetToken = randomstring.generate(32);
  console.log(resetToken);
  res.send(resetToken);
  const token = await UserModel.findOneAndUpdate(
    { email: email },
    { passwordtoken: resetToken, tokenexpiry: tokentiming }
  );

  const html = `We received your request to change your account password.<br/>

  To reset your password please <a href='https://password-rest-zo33.onrender.com/createpass/${resetToken}'>click here</a><br/>
  
  If you did not make this request and are concerned about the security of your account, Kindly ignore this mail.
  <br/>
  Best Regards,<br/>
  Guvi Tasks`;

  const info = await transporter.sendMail({
    from: "harisworkspace <personal@harisworkspace.com>",
    to: email,
    subject: "Password Reset Task✌️",
    html: html,
  });
  console.log("Message sent:" + info.messageId);
});

app.put("/createpass/:passtoken", async (req, res) => {
  const { newPass } = req.body;
  const { passtoken } = req.params;
  const users = await UserModel.find({
    passwordtoken: passtoken,
  });
  if (users) {
    const updatepass = await UserModel.findOneAndUpdate(
      { passwordtoken: passtoken, tokenexpiry: { $lte: new Date() } },
      { password: newPass, $unset: { passwordtoken: 1, tokenexpiry: 1 } }
    );
    if (updatepass) {
      res.send("Password changed successfully");
    } else {
      res.status(500).send("Error updating password");
    }
  } else {
    res.send("User not found");
    console.log("User not found");
  }
});

app.post("/createuser", async (req, res) => {
  try {
    const users = await UserModel.create(req.body);
    res.send("User Created");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/users", async (req, res) => {
  const users = await UserModel.find({});
  res.send(users);
});
app.listen(4000, () => {
  console.log("Backend Port is on 4000");
});
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO DB is Connected");
  })
  .catch((error) => {
    console.log("Mongo Connection Error", error);
  });
