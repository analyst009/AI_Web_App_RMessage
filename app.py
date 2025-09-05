import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import json
from datetime import datetime

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size(file_path):
    """Get file size in bytes"""
    return os.path.getsize(file_path)

def get_file_type(filename):
    """Get file type from extension"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else 'unknown'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Get form data
        animal_type = request.form.get('animal_type')
        if not animal_type:
            return jsonify({'error': 'No animal type selected'}), 400
        
        # Validate animal type
        valid_types = ['cat', 'dog', 'elephant']
        if animal_type not in valid_types:
            return jsonify({'error': f'Invalid animal type: {animal_type}'}), 400
        
        # Check if file was uploaded
        if 'photo' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['photo']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Secure the filename
            filename = secure_filename(file.filename)
            
            # Get file info
            file_type = get_file_type(filename)
            
            # Save metadata to JSON file
            metadata_file = os.path.join(app.config['UPLOAD_FOLDER'], 'metadata.json')
            existing_data = []
            if os.path.exists(metadata_file):
                with open(metadata_file, 'r') as f:
                    existing_data = json.load(f)
            
            # Create unique filename with timestamp and animal type
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            name, ext = os.path.splitext(filename)
            unique_filename = f"{animal_type}_{timestamp}_{name}{ext}"
            
            # Save file
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Get file size after saving
            file_size = get_file_size(file_path)
            
            # Create metadata entry
            metadata = {
                'filename': unique_filename,
                'original_name': filename,
                'animal_type': animal_type,
                'file_size': file_size,
                'file_type': file_type,
                'upload_time': datetime.now().isoformat(),
                'file_path': file_path
            }
            
            existing_data.append(metadata)
            
            with open(metadata_file, 'w') as f:
                json.dump(existing_data, f, indent=2)
            
            return jsonify({
                'success': True,
                'message': f'File uploaded successfully for {animal_type}',
                'filename': unique_filename,
                'file_size': file_size,
                'file_type': file_type
            })
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/list', methods=['GET'])
def list_files():
    try:
        metadata_file = os.path.join(app.config['UPLOAD_FOLDER'], 'metadata.json')
        if not os.path.exists(metadata_file):
            return jsonify({'files': []})
        
        with open(metadata_file, 'r') as f:
            files_data = json.load(f)
        
        # Format file sizes for display
        for file_data in files_data:
            size_bytes = file_data['file_size']
            if size_bytes < 1024:
                file_data['file_size_formatted'] = f"{size_bytes} B"
            elif size_bytes < 1024 * 1024:
                file_data['file_size_formatted'] = f"{size_bytes / 1024:.1f} KB"
            else:
                file_data['file_size_formatted'] = f"{size_bytes / (1024 * 1024):.1f} MB"
        
        return jsonify({'files': files_data})
        
    except Exception as e:
        return jsonify({'error': f'Failed to list files: {str(e)}'}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/delete-all', methods=['DELETE'])
def delete_all_photos():
    try:
        metadata_file = os.path.join(app.config['UPLOAD_FOLDER'], 'metadata.json')
        
        # Check if metadata file exists
        if not os.path.exists(metadata_file):
            return jsonify({'message': 'No photos to delete'}), 200
        
        # Read existing metadata to get file paths
        with open(metadata_file, 'r') as f:
            files_data = json.load(f)
        
        # Delete all photo files
        deleted_count = 0
        for file_data in files_data:
            file_path = file_data.get('file_path')
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting file {file_path}: {e}")
        
        # Delete metadata file
        try:
            os.remove(metadata_file)
        except Exception as e:
            print(f"Error deleting metadata file: {e}")
        
        return jsonify({
            'success': True,
            'message': f'Successfully deleted {deleted_count} photos and all data',
            'deleted_count': deleted_count
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete photos: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
