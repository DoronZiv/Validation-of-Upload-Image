const ImageUploadExtension = {
  name: 'image_upload',
  type: 'response',
  match: ({ trace }) => {
    console.log('Full trace object:', JSON.stringify(trace, null, 2));
    const isMatch = trace?.type === 'component' && 
                   trace?.payload?.name === 'image_upload';
    console.log('Is match?', isMatch);
    return isMatch;
  },
  render: ({ trace, element }) => {
    console.log('Rendering image upload...');
    const uploadContainer = document.createElement('div');
    uploadContainer.innerHTML = `
      <div style="padding: 10px;">
        <input type="file" accept="image/*" id="imageInput">
        <button type="button" id="uploadButton" style="display: none;">Upload</button>
      </div>
    `;
    
    const fileInput = uploadContainer.querySelector('#imageInput');
    const uploadButton = uploadContainer.querySelector('#uploadButton');
    
    fileInput.onchange = () => {
      if (fileInput.files.length > 0) {
        uploadButton.style.display = 'block';
      }
    };
    
    uploadButton.onclick = () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: {
            base64: e.target.result,
            name: file.name,
            type: file.type
          }
        });
      };
      reader.readAsDataURL(file);
    };
    
    element.appendChild(uploadContainer);
  }
};

// Register extension when Voiceflow is ready
window.addEventListener('voiceflow:ready', function() {
  window.voiceflow.chat.addExtension(ImageUploadExtension);
}); 