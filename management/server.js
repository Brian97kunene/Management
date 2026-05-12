import express from "express";
import cors from "cors";

import connectDB from "./mongoDB.js";
import itemRoutes from "./routes.js";


await connectDB();  // top-level await — works with "type": "module"

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", itemRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
    const status = err.status ?? 500;
    res.status(status).json({ message: err.message ?? "Server error" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));