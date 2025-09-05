document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('photo');
    const fileInfo = document.getElementById('fileInfo');
    const uploadStatus = document.getElementById('uploadStatus');
    const photosList = document.getElementById('photosList');
    const refreshBtn = document.getElementById('refreshBtn');
    const deleteAllBtn = document.getElementById('deleteAllBtn');

    // Load photos on page load
    loadPhotos();

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            displayFileInfo(file);
        } else {
            fileInfo.style.display = 'none';
        }
    });

    // Upload form submit handler
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(uploadForm);
        const animalType = formData.get('animal_type');
        const file = formData.get('photo');

        if (!animalType) {
            showStatus('Please select an animal type', 'error');
            return;
        }

        if (!file || file.size === 0) {
            showStatus('Please select a photo', 'error');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showStatus('Please select a valid image file (JPEG, PNG, GIF, BMP, WebP)', 'error');
            return;
        }

        // Validate file size (16MB max)
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (file.size > maxSize) {
            showStatus('File size must be less than 16MB', 'error');
            return;
        }

        try {
            showStatus('Uploading photo...', 'info');
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showStatus(result.message, 'success');
                uploadForm.reset();
                fileInfo.style.display = 'none';
                loadPhotos(); // Refresh the photos list
            } else {
                showStatus(result.error || 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showStatus('Upload failed. Please try again.', 'error');
        }
    });

    // Refresh button handler
    refreshBtn.addEventListener('click', function() {
        loadPhotos();
    });

    // Delete all button handler
    deleteAllBtn.addEventListener('click', function() {
        deleteAllPhotos();
    });

    // Drag and drop functionality
    const fileUpload = document.querySelector('.file-upload');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUpload.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileUpload.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileUpload.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        fileUpload.style.borderColor = '#667eea';
        fileUpload.style.background = '#edf2f7';
    }

    function unhighlight(e) {
        fileUpload.style.borderColor = '#cbd5e0';
        fileUpload.style.background = '#f7fafc';
    }

    fileUpload.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            displayFileInfo(files[0]);
        }
    }

    function displayFileInfo(file) {
        const size = formatFileSize(file.size);
        const type = file.type || 'Unknown';
        
        fileInfo.innerHTML = `
            <strong>Selected File:</strong><br>
            Name: ${file.name}<br>
            Size: ${size}<br>
            Type: ${type}
        `;
        fileInfo.style.display = 'block';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = `status-message ${type}`;
        uploadStatus.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                uploadStatus.style.display = 'none';
            }, 5000);
        }
    }

    async function loadPhotos() {
        try {
            photosList.innerHTML = '<div class="loading">Loading photos...</div>';
            
            const response = await fetch('/list');
            const data = await response.json();

            if (response.ok) {
                displayPhotos(data.files);
            } else {
                photosList.innerHTML = '<div class="error">Failed to load photos</div>';
            }
        } catch (error) {
            console.error('Load photos error:', error);
            photosList.innerHTML = '<div class="error">Failed to load photos</div>';
        }
    }

    function displayPhotos(files) {
        if (files.length === 0) {
            photosList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📷</div>
                    <p>No photos uploaded yet</p>
                    <p>Upload your first animal photo!</p>
                </div>
            `;
            return;
        }

        const photosHTML = files.map(file => {
            const uploadDate = new Date(file.upload_time).toLocaleString();
            const animalEmoji = {
                'cat': '🐱',
                'dog': '🐕',
                'elephant': '🐘'
            }[file.animal_type] || '🐾';

            return `
                <div class="photo-card">
                    <img src="/uploads/${file.filename}" alt="${file.original_name}" class="photo-image" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo='">
                    <div class="photo-info">
                        <div>
                            <span class="info-label">Animal:</span>
                            <span class="animal-badge ${file.animal_type}">${animalEmoji} ${file.animal_type}</span>
                        </div>
                        <div>
                            <span class="info-label">Original Name:</span>
                            <span class="info-value">${file.original_name}</span>
                        </div>
                        <div>
                            <span class="info-label">File Size:</span>
                            <span class="info-value">${file.file_size_formatted}</span>
                        </div>
                        <div>
                            <span class="info-label">File Type:</span>
                            <span class="info-value">${file.file_type.toUpperCase()}</span>
                        </div>
                        <div>
                            <span class="info-label">Upload Date:</span>
                            <span class="info-value">${uploadDate}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        photosList.innerHTML = photosHTML;
    }

    async function deleteAllPhotos() {
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to delete ALL photos and data? This action cannot be undone.');
        
        if (!confirmed) {
            return;
        }
        
        try {
            showStatus('Deleting all photos...', 'info');
            
            const response = await fetch('/delete-all', {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showStatus(result.message, 'success');
                loadPhotos(); // Refresh the photos list to show empty state
            } else {
                showStatus(result.error || 'Failed to delete photos', 'error');
            }
        } catch (error) {
            console.error('Delete all error:', error);
            showStatus('Failed to delete photos. Please try again.', 'error');
        }
    }
});
