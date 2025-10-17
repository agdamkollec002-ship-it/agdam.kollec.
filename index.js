'@'
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Uploads qovluğunu yoxla/yarat
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Fayl yükləmə konfiqurasiyası
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [".pdf", ".doc", ".docx"];
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new Error("Yalnız PDF ve Word faylları yükleye bilersiniz!"));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Verilenler bazası (müvəqqəti olaraq JSON faylı)
const dataFile = path.join(__dirname, "data.json");

// Verilenleri yükle
function loadData() {
    try {
        if (fs.existsSync(dataFile)) {
            return JSON.parse(fs.readFileSync(dataFile, "utf8"));
        }
    } catch (error) {
        console.error("Error loading data:", error);
    }
    
    // Default strukturu
    return {
        files: {
            transport: { lecture: [], colloquium: [], seminar: [] },
            computer: { lecture: [], colloquium: [], seminar: [] },
            math: { lecture: [], colloquium: [], seminar: [] },
            economics: { lecture: [], colloquium: [], seminar: [] },
            azerbaijani: { lecture: [], colloquium: [], seminar: [] },
            english: { lecture: [], colloquium: [], seminar: [] },
            physical: { lecture: [], colloquium: [], seminar: [] },
            pedagogy: { lecture: [], colloquium: [], seminar: [] },
            agriculture: { lecture: [], colloquium: [], seminar: [] },
            history: { lecture: [], colloquium: [], seminar: [] }
        },
        credentials: {
            teachers: {
                "Neqliyyat": { password: "pass1234", subject: "transport" },
                "Kompyuter sistemleri": { password: "pass1234", subject: "computer" },
                "Riyaziyyat": { password: "pass1234", subject: "math" },
                "Iqtisadiyyat": { password: "pass1234", subject: "economics" },
                "Azerbaycan dili": { password: "pass1234", subject: "azerbaijani" },
                "Ingilis dili": { password: "pass1234", subject: "english" },
                "Fiziki terbiye": { password: "pass1234", subject: "physical" },
                "Pedaqogika": { password: "pass1234", subject: "pedagogy" },
                "Kend teserrufati": { password: "pass1234", subject: "agriculture" },
                "Tarix": { password: "pass1234", subject: "history" }
            },
            modules: {
                "transport": { username: "neqliyyat", password: "pass1234" },
                "computer": { username: "kompyuter", password: "pass1234" },
                "math": { username: "riyaziyyat", password: "pass1234" },
                "economics": { username: "iqtisadiyyat", password: "pass1234" },
                "azerbaijani": { username: "azdili", password: "pass1234" },
                "english": { username: "ingilisdili", password: "pass1234" },
                "physical": { username: "fiziki", password: "pass1234" },
                "pedagogy": { username: "pedagogiya", password: "pass1234" },
                "agriculture": { username: "kend", password: "pass1234" },
                "history": { username: "tarix", password: "pass1234" }
            }
        }
    };
}

// Verilenleri saxla
function saveData(data) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error("Error saving data:", error);
        return false;
    }
}

// Esas route
app.get("/", (req, res) => {
    res.json({
        message: "Salam! Backend isleyir!",
        developer: "Kamil",
        timestamp: new Date().toISOString(),
        features: ["Fayl yukleme", "Paylasim", "Real-time yenileme"]
    });
});

// Serveri baslat
app.listen(PORT, () => {
    console.log("Server http://localhost:" + PORT + " unvaninda isleyir");
    console.log("Upload qovlugu: " + uploadsDir);
});
'@ | Out-File index.js -Encoding utf8'