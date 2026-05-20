#!/usr/bin/env node

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testFileUpload() {
  try {
    // Create a test ZIP file if it doesn't exist
    const testFilePath = './test-file.zip';
    if (!fs.existsSync(testFilePath)) {
      console.log('Creating test ZIP file...');
      // You can create a simple zip file or use an existing one
    }

    // Test file upload
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));

    console.log('Testing file upload...');
    const uploadResponse = await fetch('http://localhost:3009/api/upload', {
      method: 'POST',
      body: form
    });

    const uploadResult = await uploadResponse.json();
    console.log('Upload result:', uploadResult);

    if (uploadResult.success) {
      // Test application submission with file metadata
      const applicationData = {
        fullName: "Test User",
        email: "test@example.com",
        country: "United States",
        industryNiche: "Technology",
        age: 25,
        professionalMilestones: "Test milestones",
        personalTurningPoints: "Test turning points",
        visionForVenture: "Test vision",
        hopeToAchieve: "Test goals",
        targetAudience: "Test audience",
        demographicProfile: "Test demographics",
        targetDemographicAge: "25-35",
        audienceGenderSplit: "50/50",
        currentChannels: "Test channels",
        keyPainPoints: "Test pain points",
        brandValues: "Test values",
        differentiation: "Test differentiation",
        uniqueValueProps: "Test UVP",
        idealBrandImage: "Test brand image",
        brandingAesthetics: "Test aesthetics",
        brandPersonality: "Test personality",
        productCategories: ["test1", "test2"],
        scalingGoals: "Test scaling",
        longTermVision: "Test long term vision",
        termsAccepted: true,
        // File metadata from upload
        zipFilePath: uploadResult.data.filepath,
        zipFileName: uploadResult.data.filename,
        zipFileSize: uploadResult.data.filesize
      };

      console.log('Testing application submission...');
      const submitResponse = await fetch('http://localhost:3009/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      const submitResult = await submitResponse.json();
      console.log('Submission result:', submitResult);

      if (submitResult.success) {
        console.log('✅ Test passed! Check the admin dashboard for the uploaded file.');
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFileUpload();
