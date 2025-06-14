document.addEventListener('DOMContentLoaded', () => {
    const fileList = document.getElementById('fileList');

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    async function loadFiles() {
        try {
            const response = await fetch('/api/files');
            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }
            
            const files = await response.json();
            
            if (files.length === 0) {
                fileList.innerHTML = '<div class="error">No files available for download.</div>';
                return;
            }

            fileList.innerHTML = files.map(file => `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-details">
                            Size: ${formatFileSize(file.size)} | 
                            Last Modified: ${formatDate(file.lastModified)}
                        </div>
                    </div>
                    <a href="/download/${encodeURIComponent(file.name)}" 
                       class="download-link" 
                       download>Download</a>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading files:', error);
            fileList.innerHTML = '<div class="error">Failed to load files. Please try again later.</div>';
        }
    }

    loadFiles();
});
