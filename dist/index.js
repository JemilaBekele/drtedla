"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const authentication_1 = __importDefault(require("./middleware/authentication"));
const authEmployee_1 = __importDefault(require("./middleware/authEmployee"));
// Routes
const rigisterpatient_1 = __importDefault(require("./routes/rigisterpatient")); // Patient public auth (register, login, verify, etc.)
const patient_1 = __importDefault(require("./routes/patient")); // Patient protected routes
const employee_1 = __importDefault(require("./routes/employee")); // Employee auth + protected routes
const appointment_1 = __importDefault(require("./routes/appointment"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 6000;
mongoose_1.default.connect(process.env.DATABASE_URL || "")
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(`MongoDB connection error: ${err}`));
// ─── Global middleware ───────────────────────────────────────────────────────
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'uploads')));
// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send('Hello from the Node.js backend!');
});
// ─── Patient routes ──────────────────────────────────────────────────────────
app.use('/api/auth', rigisterpatient_1.default); // Public: register, login, verify, refresh, logout, forgot/reset
app.use('/api/patient', authentication_1.default, patient_1.default); // Protected: patient data (requires patient JWT)
// ─── Employee/Staff routes ───────────────────────────────────────────────────
app.use('/api/employee', employee_1.default); // Public + protected (middleware applied per-route inside)
app.use('/api/appointment', authEmployee_1.default, appointment_1.default); // Protected: appointments (requires employee JWT)
// ─── Global Error-Handling Middleware ────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
