const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const apiRouter = express.Router();

apiRouter.use("/auth", require("./routes/authRoutes"));
apiRouter.use("/loans", require("./routes/loanRoutes"));
// We will add more routes here
apiRouter.use("/payments", require("./routes/paymentRoutes"));
apiRouter.use("/dashboard", require("./routes/dashboardRoutes"));
apiRouter.use("/notifications", require("./routes/notificationRoutes"));

app.use("/api", apiRouter);
app.use("/", apiRouter); // For local backward compatibility

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

module.exports = app;
