"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const patient_1 = __importDefault(require("./routes/patient"));
const appointment_1 = __importDefault(require("./routes/appointment"));
const authentication_1 = __importDefault(require("./middleware/authentication"));
const user_1 = __importDefault(require("./routes/user"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
mongoose_1.default.connect(process.env.DATABASE_URL || "")
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(`MongoDB connection error: ${err}`));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'uploads')));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.get('/', (req, res) => {
    res.send('Hello from the Node.js backend!');
});
app.use('/api', auth_1.default);
app.use('/api/patient', authentication_1.default, patient_1.default);
app.use('/api/appointment', authentication_1.default, appointment_1.default);
app.use('/api/user', authentication_1.default, user_1.default);
// Global Error-Handling Middleware
// Global Error-Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
