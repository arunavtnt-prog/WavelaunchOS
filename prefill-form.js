javascript:(function(){
    // Prefill all form fields with test data
    const testData = {
        fullName: "Test User",
        email: `test-${Date.now()}@example.com`,
        country: "United States",
        industryNiche: "Technology",
        age: "25",
        // Add all other fields...
    };
    
    // Fill form fields (you'll need to adjust selectors)
    Object.keys(testData).forEach(key => {
        const field = document.querySelector(`[name="${key}"], #${key}`);
        if (field) field.value = testData[key];
    });
    
    alert('Form prefilled! Add a ZIP file and submit.');
})();
