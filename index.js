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

// ========== API ROUTES ==========

// Esas route
app.get("/", (req, res) => {
    res.json({
        message: "Salam! Backend isleyir!",
        developer: "Kamil",
        timestamp: new Date().toISOString(),
        features: ["Fayl yukleme", "Paylasim", "Real-time yenileme"]
    });
});

// Butun melumatlari getir
app.get("/api/data", (req, res) => {
    const data = loadData();
    res.json(data.files);
});

// Muellim giriş məlumatları
app.get("/api/teachers", (req, res) => {
    const data = loadData();
    res.json(data.credentials.teachers);
});

// Modul giriş məlumatları
app.get("/api/modules", (req, res) => {
    const data = loadData();
    res.json(data.credentials.modules);
});

// Faylları getir (fenn ve modula gore)
app.get("/api/files/:subject/:module", (req, res) => {
    const { subject, module } = req.params;
    const data = loadData();
    
    if (data.files[subject] && data.files[subject][module]) {
        res.json(data.files[subject][module]);
    } else {
        res.json([]);
    }
});

// Muellim fayllarını getir
app.get("/api/teacher-files/:subject", (req, res) => {
    const { subject } = req.params;
    const data = loadData();
    
    if (data.files[subject]) {
        res.json(data.files[subject]);
    } else {
        res.json({ lecture: [], colloquium: [], seminar: [] });
    }
});

// Modul girişi
app.post("/api/module-login", (req, res) => {
    const { subject, username, password } = req.body;
    const data = loadData();
    
    if (data.credentials.modules[subject] && 
        data.credentials.modules[subject].username === username && 
        data.credentials.modules[subject].password === password) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Muellim girişi
app.post("/api/teacher-login", (req, res) => {
    const { username, password } = req.body;
    const data = loadData();
    
    if (data.credentials.teachers[username] && 
        data.credentials.teachers[username].password === password) {
        res.json({ 
            success: true, 
            subject: data.credentials.teachers[username].subject 
        });
    } else {
        res.json({ success: false });
    }
});

// Fayl yükleme
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Fayl yuklenmedi" });
        }

        const { subject, module, type } = req.body;
        const data = loadData();

        // Yeni fayl obyekti yarat
        const newFile = {
            id: Date.now(),
            filename: req.file.filename,
            originalname: req.file.originalname,
            type: type,
            uploadDate: new Date().toISOString()
        };

        // Faylı verilenler bazasına əlavə et
        if (!data.files[subject]) {
            data.files[subject] = { lecture: [], colloquium: [], seminar: [] };
        }
        
        if (!data.files[subject][module]) {
            data.files[subject][module] = [];
        }

        data.files[subject][module].push(newFile);
        
        // Verilenleri saxla
        if (saveData(data)) {
            res.json({ 
                success: true, 
                message: "Fayl ugurla yuklendi", 
                filename: req.file.filename 
            });
        } else {
            res.status(500).json({ error: "Verilenler saxlanilmadi" });
        }
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Server xetasi" });
    }
});

// Şifre yenileme
app.post("/api/update-password", (req, res) => {
    const { teacher, currentPassword, newPassword } = req.body;
    const data = loadData();
    
    if (data.credentials.teachers[teacher] && 
        data.credentials.teachers[teacher].password === currentPassword) {
        
        data.credentials.teachers[teacher].password = newPassword;
        
        if (saveData(data)) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } else {
        res.json({ success: false });
    }
});

// Fayl adını yenileme
app.post("/api/update-filename", (req, res) => {
    const { fileId, module, subject, newName } = req.body;
    const data = loadData();
    
    if (data.files[subject] && data.files[subject][module]) {
        const fileIndex = data.files[subject][module].findIndex(f => f.id == fileId);
        if (fileIndex !== -1) {
            data.files[subject][module][fileIndex].originalname = newName;
            
            if (saveData(data)) {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        } else {
            res.json({ success: false });
        }
    } else {
        res.json({ success: false });
    }
});

// Fayl silme
app.post("/api/delete-file", (req, res) => {
    const { fileId, module, subject } = req.body;
    const data = loadData();
    
    if (data.files[subject] && data.files[subject][module]) {
        const fileIndex = data.files[subject][module].findIndex(f => f.id == fileId);
        if (fileIndex !== -1) {
            const deletedFile = data.files[subject][module][fileIndex];
            
            // Faylı fiziki olarak sil
            try {
                const filePath = path.join(uploadsDir, deletedFile.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                console.error("Fayl silinmedi:", error);
            }
            
            data.files[subject][module].splice(fileIndex, 1);
            
            if (saveData(data)) {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        } else {
            res.json({ success: false });
        }
    } else {
        res.json({ success: false });
    }
});

// Xeta idareetmesi
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "Fayl hecmi 10MB-dan cox ola bilmez" });
        }
    }
    res.status(500).json({ error: error.message });
});

// Serveri baslat
app.listen(PORT, () => {
    console.log("Server http://localhost:" + PORT + " unvaninda isleyir");
    console.log("Upload qovlugu: " + uploadsDir);
});
