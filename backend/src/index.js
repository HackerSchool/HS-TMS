require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const Redis = require("ioredis");
const RedisStore = require("connect-redis").default;
const passport = require("passport");
const cors = require("cors");
const morgan = require("morgan");
require("./auth/fenixOAuth2");
require("./auth/demoLocal");
const isLoggedIn = require("./middleware/isLoggedIn");
const { logger, logInfo } = require("./modules/logging");

const app = express();

app.use(express.json());
app.use(fileUpload());

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(
  cors({
    origin: process.env.CLIENT_ADDRESS,
    credentials: true,
  }),
);

const redisClient = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      sameSite: true,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(require("./middleware/parseMultipartFormData"));
app.use(require("./middleware/selectPool"));
app.use(require("./middleware/error").errorHandler);
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]',
    {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    },
  ),
);

app.use("/projects", isLoggedIn, require("./routes/projectRoutes"));
app.use("/reminders", isLoggedIn, require("./routes/reminderRoutes"));
app.use("/transactions", isLoggedIn, require("./routes/transactionRoutes"));
app.use("/users", isLoggedIn, require("./routes/userRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/logs", isLoggedIn, require("./routes/logRoutes"));
app.use(require("./middleware/error").errorHandler);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(process.env.PORT, () => {
  logInfo("index", `Server listening on port ${process.env.PORT}`);
});

require("./cron/weeklyBackup");
require("./cron/dailyReminders");
