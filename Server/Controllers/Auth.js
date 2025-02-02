import users from "../models/Auth.js"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {
    const { email } = req.body;
    console.log("email:",email);
    try {
        const extinguser = await users.findOne({ email })
        console.log("extinguser: ",extinguser);
        if (!extinguser) {
            try {
                const newuser = await users.create({ email });
                const token = jwt.sign({
                    email: newuser.email, id: newuser._id
                }, process.env.JWT_SECERT, {
                    expiresIn: "1h"
                }
                )
                res.status(201).json({ result: newuser, token })
            } catch (error) {
                console.error("Error creating new user:", error)
                res.status(500).json({ message: "something went wrong while creating new user." })
                // return
            }

        } else {
            const token = jwt.sign({
                email: extinguser.email, id: extinguser._id
            }, process.env.JWT_SECRET, {
                expiresIn: "1h"
            }
            )
            res.status(200).json({ result: extinguser ,token})
        }
    } catch (error) {
        console.error("Error finding user: ",error);
        res.status(500).json({ mess: "something went wrong while finding the user." })
        // return
    }
}