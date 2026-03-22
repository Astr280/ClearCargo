import cors from "cors";
import express from "express";
import platformRoutes from "./routes/platform.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());
app.use("/api", platformRoutes);

app.listen(port, () => {
  console.log(`CargoClear API listening on http://localhost:${port}`);
});
