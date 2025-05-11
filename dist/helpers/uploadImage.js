"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const uploadImage = (imageFile) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadsDir = path_1.default.join(process.cwd(), 'public/uploads');
    // Check if directory exists asynchronously
    try {
        yield fs_1.promises.access(uploadsDir);
    }
    catch (error) {
        yield fs_1.promises.mkdir(uploadsDir, { recursive: true });
    }
    const filename = `${Date.now()}-${imageFile.originalname}`;
    const filePath = path_1.default.join(uploadsDir, filename);
    // Save the file asynchronously
    yield fs_1.promises.writeFile(filePath, imageFile.buffer);
    return `/uploads/${filename}`; // Return relative path
});
exports.uploadImage = uploadImage;
