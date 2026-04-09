const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/auth", require("./routes/authRoutes"));
app.use("/loans", require("./routes/loanRoutes"));
// We will add more routes here
app.use("/payments", require("./routes/paymentRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/notifications", require("./routes/notificationRoutes"));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
