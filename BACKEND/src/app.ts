import "dotenv/config";
import express from "express";
import cors from "cors";
import userRoute from "./infrastructure/route/user.route";
import reservationRoute from "./infrastructure/route/reservation.route";
import spaceRoute from "./infrastructure/route/space.route";

import dbInit from "./infrastructure/db/mongo";

console.clear();
const app = express();
app.use(express.json());

const allowedOrigins = ['http://localhost:5173/','http://localhost:5173',"*"];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type']
}));

const port = process.env.PORT || 3001;

app.use(userRoute);
app.use(reservationRoute);
app.use(spaceRoute);

dbInit().then();

app.get("/", (req, res) => {
    res.send("Api funcionando");
});

app.listen(port, () => console.log(`Servidor, listo por el puerto ${port}`));
