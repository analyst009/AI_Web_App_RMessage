# 🐾 Animal Photo Upload System

A Flask-based web application for uploading and managing photos of cats, dogs, and elephants. The system provides a modern, responsive web interface with drag-and-drop file upload functionality and a comprehensive photo gallery.

## Features

- **Animal Selection**: Choose one animal type (cat, dog, elephant) using radio buttons
- **File Upload**: Upload photos with drag-and-drop support
- **File Validation**: Automatic validation of file types and sizes
- **Photo Gallery**: View all uploaded photos with detailed information
- **Delete All**: Remove all photos and data with a single click
- **Responsive Design**: Modern UI that works on desktop and mobile devices
- **Real-time Updates**: Automatic refresh of photo list after upload

## Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)

## File Size Limits

- Maximum file size: 16MB
- Files are automatically validated before upload

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd class_code
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   or if using uv:
   ```bash
   uv sync
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

## Usage

### Uploading Photos

1. **Select Animal Type**: Choose one animal type (cat 🐱, dog 🐕, elephant 🐘) using the radio buttons
2. **Choose Photo**: Click the upload area or drag and drop an image file
3. **Upload**: Click the "Upload Photo" button
4. **View Results**: The photo will appear in the gallery for the selected animal type

### Viewing Photos

- All uploaded photos are displayed in the gallery section
- Each photo card shows:
  - The uploaded image
  - Animal type with emoji badge
  - Original filename
  - File size (formatted)
  - File type
  - Upload date and time
- Use the "Refresh List" button to manually update the gallery
- Use the "Delete All Photos" button to remove all photos and data (with confirmation)

### File Management

- Photos are stored in the `uploads/` directory
- Metadata is stored in `uploads/metadata.json`
- Files are automatically renamed with timestamps to prevent conflicts
- Original filenames are preserved in the metadata

## API Endpoints

- `GET /` - Main web interface
- `POST /upload` - Upload a photo (multipart/form-data)
- `GET /list` - Get list of all uploaded photos (JSON)
- `DELETE /delete-all` - Delete all photos and metadata
- `GET /uploads/<filename>` - Serve uploaded files

## Project Structure

```
class_code/
├── app.py              # Main Flask application
├── templates/
│   └── index.html      # Web interface template
├── static/
│   ├── styles.css      # CSS styling
│   └── script.js       # JavaScript functionality
├── uploads/            # Uploaded files directory (created automatically)
│   └── metadata.json   # Photo metadata
├── pyproject.toml      # Project dependencies
└── README.md          # This file
```

## Technical Details

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **File Storage**: Local filesystem
- **Data Storage**: JSON file for metadata
- **Security**: Secure filename handling, file type validation
- **Responsive**: Mobile-first design with CSS Grid and Flexbox

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

To run in development mode with auto-reload:

```bash
python app.py
```

The application will be available at `http://localhost:5000` with debug mode enabled.

## Error Handling

The application includes comprehensive error handling for:
- Invalid file types
- File size limits
- Missing animal type selection
- Network errors
- File upload failures

All errors are displayed to the user with clear, actionable messages.

## License

This project is open source and available under the MIT License.
