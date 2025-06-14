const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

// Ensure downloads directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR);
}

// Serve static files from root directory
app.use(express.static('.'));

// API endpoint to get list of downloadable files
app.get('/api/files', (req, res) => {
    try {
        const files = fs.readdirSync(DOWNLOADS_DIR)
            .filter(file => fs.statSync(path.join(DOWNLOADS_DIR, file)).isFile())
            .map(file => ({
                name: file,
                size: fs.statSync(path.join(DOWNLOADS_DIR, file)).size,
                lastModified: fs.statSync(path.join(DOWNLOADS_DIR, file)).mtime
            }));
        res.json(files);
    } catch (error) {
        console.error('Error reading directory:', error);
        res.status(500).json({ error: 'Failed to read files directory' });
    }
});

// Download endpoint
app.get('/download/:filename', (req, res) => {
    const requestedFile = req.params.filename;
    const filePath = path.join(DOWNLOADS_DIR, requestedFile);

    // Prevent directory traversal by checking if the normalized path is still within downloads directory
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(DOWNLOADS_DIR)) {
        return res.status(403).send('Access denied');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    try {
        res.download(filePath);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
