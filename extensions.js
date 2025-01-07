(function() {
    const ImageUploadExtension = {
        name: 'ImageUpload',
        type: 'response',
        match: ({ trace }) =>
            trace.type === 'ext_image_upload' || trace.payload.name === 'ext_image_upload',
        render: ({ trace, element }) => {
            const uploadContainer = document.createElement('div');
            uploadContainer.innerHTML = `
                <style>
                    .image-upload-container {
                        width: 100%;
                        padding: 10px;
                    }
                    
                    .image-upload-label {
                        display: inline-block;
                        padding: 10px 20px;
                        background: linear-gradient(to right, #2e6ee1, #2e7ff1);
                        color: white;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-bottom: 10px;
                    }
                    
                    .image-upload-input {
                        display: none;
                    }
                    
                    .preview-image {
                        max-width: 200px;
                        max-height: 200px;
                        display: none;
                        margin-top: 10px;
                    }
                    
                    .upload-button {
                        background: linear-gradient(to right, #2e6ee1, #2e7ff1);
                        border: none;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        display: none;
                    }
                    
                    .upload-progress {
                        width: 100%;
                        height: 4px;
                        background-color: #f0f0f0;
                        border-radius: 2px;
                        margin: 10px 0;
                    }
                    
                    .progress-bar {
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(to right, #2e6ee1, #2e7ff1);
                        border-radius: 2px;
                        transition: width 0.3s ease;
                        animation: progress 1s infinite linear;
                    }
                    
                    @keyframes progress {
                        0% {
                            width: 0%;
                        }
                        100% {
                            width: 100%;
                        }
                    }
                    
                    .error-message {
                        font-size: 14px;
                        padding: 5px 0;
                    }
                </style>
                
                <div class="image-upload-container">
                    <label class="image-upload-label">
                        Choose Image
                        <input type="file" class="image-upload-input" accept="image/*">
                    </label>
                    <img class="preview-image">
                    <div class="upload-progress" style="display: none;">
                        <div class="progress-bar"></div>
                    </div>
                    <div class="error-message" style="display: none; color: red; margin-top: 10px;"></div>
                    <button class="upload-button">Upload Image</button>
                </div>
            `;

            const fileInput = uploadContainer.querySelector('.image-upload-input');
            const previewImage = uploadContainer.querySelector('.preview-image');
            const uploadButton = uploadContainer.querySelector('.upload-button');
            const progressDiv = uploadContainer.querySelector('.upload-progress');
            const errorDiv = uploadContainer.querySelector('.error-message');

            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    // Clear any previous errors
                    errorDiv.style.display = 'none';
                    
                    // Validate file size (e.g., max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        errorDiv.textContent = 'File size must be less than 5MB';
                        errorDiv.style.display = 'block';
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewImage.src = e.target.result;
                        previewImage.style.display = 'block';
                        uploadButton.style.display = 'block';
                    };
                    reader.onerror = () => {
                        errorDiv.textContent = 'Error reading file';
                        errorDiv.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });

            uploadButton.addEventListener('click', () => {
                const file = fileInput.files[0];
                if (file) {
                    // Show progress bar
                    progressDiv.style.display = 'block';
                    uploadButton.disabled = true;

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const base64Image = e.target.result;
                        
                        try {
                            // Return the data to Voiceflow
                            window.voiceflow.chat.interact({
                                type: 'complete',
                                payload: {
                                    data: {
                                        base64: base64Image,
                                        name: file.name,
                                        type: file.type
                                    }
                                },
                            });
                            
                            // Hide upload elements after successful upload
                            uploadButton.style.display = 'none';
                            progressDiv.style.display = 'none';
                        } catch (error) {
                            errorDiv.textContent = 'Error uploading image';
                            errorDiv.style.display = 'block';
                            uploadButton.disabled = false;
                        }
                    };
                    
                    reader.onerror = () => {
                        errorDiv.textContent = 'Error processing file';
                        errorDiv.style.display = 'block';
                        uploadButton.disabled = false;
                        progressDiv.style.display = 'none';
                    };
                    
                    reader.readAsDataURL(file);
                }
            });

            element.appendChild(uploadContainer);
        },
    };

    // Try to register the extension immediately
    try {
        window.voiceflow.chat.addExtension(ImageUploadExtension);
    } catch (e) {
        // If voiceflow isn't ready yet, wait for it
        window.addEventListener('voiceflow:ready', function() {
            window.voiceflow.chat.addExtension(ImageUploadExtension);
        });
    }
})(); 