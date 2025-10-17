const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Memory storage - Render üçün daha yaxşıdır
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Yalnız PDF və Word fayllarına icazə verilir!'));
        }
    }
});

// Database əvəzi - JSON faylı yerinə memory-də saxlayırıq
let fileDatabase = {
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
};

// Əsas endpoint
app.get('/', (req, res) => {
    res.json({
        message: "Salam! Yeni Backend işləyir!",
        developer: "Kamil",
        timestamp: new Date().toISOString(),
        features: ["Fayl yükləmə", "Paylaşım", "Real-time yeniləmə", "Memory Storage"]
    });
});

// Bütün faylları gətir
app.get('/api/files', (req, res) => {
    res.json(fileDatabase);
});

// Müəyyən fən və modul üçün faylları gətir
app.get('/api/files/:subject/:module', (req, res) => {
    const { subject, module } = req.params;
    
    if (fileDatabase[subject] && fileDatabase[subject][module]) {
        res.json(fileDatabase[subject][module]);
    } else {
        res.status(404).json({ error: 'Fayl tapılmadı' });
    }
});

// Fayl yüklə - BASE64 formatında
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Fayl yüklənmədi' });
        }

        const { subject, module, fileName } = req.body;
        
        if (!subject || !module) {
            return res.status(400).json({ error: 'Fən və modul tələb olunur' });
        }

        // Fən və modulun olub-olmadığını yoxla
        if (!fileDatabase[subject]) {
            fileDatabase[subject] = { lecture: [], colloquium: [], seminar: [] };
        }
        if (!fileDatabase[subject][module]) {
            fileDatabase[subject][module] = [];
        }

        // Faylı BASE64-ə çevir
        const fileBuffer = req.file.buffer;
        const base64File = fileBuffer.toString('base64');
        const dataURL = `data:${req.file.mimetype};base64,${base64File}`;

        // Yeni fayl obyekti yarat
        const fileObj = {
            id: Date.now(),
            name: fileName || req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date().toISOString(),
            data: dataURL, // BASE64 data
            type: req.file.mimetype.includes('pdf') ? 'pdf' : 'word'
        };

        // Database-ə əlavə et
        fileDatabase[subject][module].push(fileObj);

        res.json({
            success: true,
            message: 'Fayl uğurla yükləndi',
            file: fileObj
        });

    } catch (error) {
        console.error('Fayl yükləmə xətası:', error);
        res.status(500).json({ error: 'Fayl yüklənərkən xəta baş verdi' });
    }
});

// Fayl endir - BASE64 data qaytar
app.get('/api/download/:subject/:module/:fileId', (req, res) => {
    const { subject, module, fileId } = req.params;
    
    if (fileDatabase[subject] && fileDatabase[subject][module]) {
        const file = fileDatabase[subject][module].find(f => f.id == fileId);
        
        if (file) {
            res.json({
                success: true,
                file: file
            });
        } else {
            res.status(404).json({ error: 'Fayl tapılmadı' });
        }
    } else {
        res.status(404).json({ error: 'Fən və ya modul tapılmadı' });
    }
});

// Fayl adını yenilə
app.put('/api/files/:id', (req, res) => {
    const { id } = req.params;
    const { newName, subject, module } = req.body;
    
    if (!newName || !subject || !module) {
        return res.status(400).json({ error: 'Yeni ad, fən və modul tələb olunur' });
    }
    
    if (fileDatabase[subject] && fileDatabase[subject][module]) {
        const fileIndex = fileDatabase[subject][module].findIndex(file => file.id == id);
        
        if (fileIndex !== -1) {
            fileDatabase[subject][module][fileIndex].name = newName;
            res.json({ success: true, message: 'Fayl adı yeniləndi' });
        } else {
            res.status(404).json({ error: 'Fayl tapılmadı' });
        }
    } else {
        res.status(404).json({ error: 'Fən və ya modul tapılmadı' });
    }
});

// Faylı sil
app.delete('/api/files/:id', (req, res) => {
    const { id } = req.params;
    const { subject, module } = req.body;
    
    if (!subject || !module) {
        return res.status(400).json({ error: 'Fən və modul tələb olunur' });
    }

    if (fileDatabase[subject] && fileDatabase[subject][module]) {
        const fileIndex = fileDatabase[subject][module].findIndex(file => file.id == id);
        
        if (fileIndex !== -1) {
            fileDatabase[subject][module].splice(fileIndex, 1);
            res.json({ success: true, message: 'Fayl silindi' });
        } else {
            res.status(404).json({ error: 'Fayl tapılmadı' });
        }
    } else {
        res.status(404).json({ error: 'Fən və ya modul tapılmadı' });
    }
});

// Serverı başlat
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} ünvanında işləyir`);
    console.log('✅ Yeni Backend hazırdır!');
    console.log('✅ Memory Storage aktivdir!');
    console.log('✅ BASE64 fayl sistemi işləyir!');
});
