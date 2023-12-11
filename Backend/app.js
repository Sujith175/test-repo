const express = require("express");
require("express-async-errors");
const app = express();
const connectDB = require('./DB/connect');
const cors = require("cors")

const login = require('./Routes/login')
const cookieParser = require("cookie-parser")

app.use(express.json());
app.use(cors({origin: "http://localhost:5173", credentials: true,}))


require('dotenv').config();

app.use(cookieParser())


app.use("/", login)
const notFound = require('./Middleware/not-found')
const errorHandlerMiddleware = require('./Middleware/Error-Handler')
app.use(notFound)
app.use(errorHandlerMiddleware)
const port = 5000

start = async() => {
    try{
        await connectDB(process.env.MONGO_URI);
        app.listen(port, console.log(`server running on port ${port}`));
    }catch(error){
        console.log(error)
    }
}

start()