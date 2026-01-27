// Paste this in browser console on apply.wavelaunch.org
async function quickTest() {
  // Create a test file
  const testContent = new Uint8Array([80, 75, 3, 4, 20, 0, 0, 0, 8, 0]); // ZIP header
  const testFile = new File([testContent], 'test.zip', { type: 'application/zip' });
  
  // Test upload
  const formData = new FormData();
  formData.append('file', testFile);
  
  try {
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    console.log('Upload result:', uploadResult);
    
    if (uploadResult.success) {
      alert('✅ File upload works! Check admin dashboard.');
    } else {
      alert('❌ Upload failed: ' + uploadResult.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Upload error: ' + error.message);
  }
}

// Run the test
quickTest();
