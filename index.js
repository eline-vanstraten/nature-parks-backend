import express from "express";
import mongoose from "mongoose";
import parksRouter from './routes/parks.js';


try {
    const app = express();
    await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
        serverSelectionTimeoutMS: 3000
    })

    //middleware to support application/json Content-Type
    app.use(express.json());

    //Middleware to support application/x-www-form-urlencoded Content-Type
    app.use(express.urlencoded({extended: true}));

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');

        //Block non Accept: application/json requests
        if (req.header('Accept') !== "application/json" && req.method !== "OPTIONS") {
            res.status(406).json({error: "Only JSON is allowed as Accept header"})
            return;
        }

        next();
    })

    app.get("/", (req, res) => {
        res.json("Hello world");

    });


    app.use('/parks', parksRouter);

    app.listen(process.env.EXPRESS_PORT, () => {
        console.log(`Server is listening on port ${process.env.EXPRESS_PORT}`);
    });
} catch (e) {
    console.log(e)
}
