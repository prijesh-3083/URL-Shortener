const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const {connectToMongoDB} = require("./connect");
const URL = require("./models/url");
const {checkForAuthentication, restrictTo} = require("./middlewares/auth");


const staticRoute = require("./routes/staticRouter");
const urlRoute = require("./routes/url");
const userRoute = require("./routes/user");


const app = express();
const PORT = 3001;
connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(()=>{
    console.log("MongoDB connected");  
})


app.set("view engine", "ejs");
app.set('views', path.join("./views"))


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(checkForAuthentication);


app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRoute);
app.use("/user", userRoute);
app.use("/", staticRoute);


app.get('/url/:shortID', async (req,res) => {
    const shortID = req.params.shortID;
    const entry = await URL.findOneAndUpdate(
        {
            shortID,
        },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        },
    );
    res.redirect(entry.redirectURL);
})


app.listen(PORT, ()=>{console.log("Server Started at port", PORT);})