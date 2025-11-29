// banner-handler.js - Shared functionality for banner image handling

// Function to update all ticket images with the banner
function updateBannerImages() {
    console.log("Updating banner images");
    const bannerImage = localStorage.getItem('bannerImage');
    
    if (!bannerImage) {
        console.log("No banner image found in localStorage");
        // Use a default image instead
        const defaultImage = 'https://source.unsplash.com/random/800x450/?concert';
        
        // Get all ticket image elements
        const ticketImages = document.querySelectorAll('.ticket-image');
        console.log("Found ticket image elements:", ticketImages.length);
        
        // Update each ticket image with the default banner
        ticketImages.forEach((imageDiv, index) => {
            imageDiv.style.backgroundImage = `url('${defaultImage}')`;
            console.log(`Updated ticket image ${index+1} with default banner`);
        });
        return;
    }
    
    console.log("Found banner image in localStorage");
    
    // Get all ticket image elements
    const ticketImages = document.querySelectorAll('.ticket-image');
    console.log("Found ticket image elements:", ticketImages.length);
    
    // Update each ticket image with the banner
    ticketImages.forEach((imageDiv, index) => {
        imageDiv.style.backgroundImage = `url('${bannerImage}')`;
        console.log(`Updated ticket image ${index+1} with custom banner`);
    });
}

// Initialize banner handling
function initBannerHandling() {
    console.log("Initializing banner handling");
    
    // Check if we're on the for-you page
    const bannerImageInput = document.getElementById('bannerImage');
    if (bannerImageInput) {
        console.log("Found banner image input, setting up event listener");
        
        // Set up event listener for file input
        bannerImageInput.addEventListener('change', handleBannerFileSelect);
        
        // Show preview if there's a saved banner
        const savedBannerImage = localStorage.getItem('bannerImage');
        const bannerPreview = document.getElementById('bannerPreview');
        const previewBanner = document.getElementById('previewBanner');
        
        if (savedBannerImage && bannerPreview && previewBanner) {
            console.log("Found saved banner image, displaying preview");
            bannerPreview.style.backgroundImage = `url('${savedBannerImage}')`;
            previewBanner.style.backgroundImage = `url('${savedBannerImage}')`;
        }
        
        // Set up event listener for default banner dropdown
        const defaultBannerSelect = document.getElementById('useDefaultBanner');
        if (defaultBannerSelect) {
            defaultBannerSelect.addEventListener('change', handleDefaultBannerSelect);
        }
    }
    
    // Check if we're on the index page
    const ticketImages = document.querySelectorAll('.ticket-image');
    if (ticketImages.length > 0) {
        console.log("Found ticket images, updating with banner");
        updateBannerImages();
    }
}

// Handle file selection for banner image
function handleBannerFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        console.log("No file selected");
        return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB. Please choose a smaller image.');
        this.value = ''; // Clear the file input
        return;
    }
    
    console.log("Processing file:", file.name, file.type, file.size);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        console.log("File read complete, data length:", imageData.length);
        
        // Save to localStorage
        localStorage.setItem('bannerImage', imageData);
        console.log('Banner image saved to localStorage');
        
        // Update preview if we're on the for-you page
        const bannerPreview = document.getElementById('bannerPreview');
        const previewBanner = document.getElementById('previewBanner');
        
        if (bannerPreview && previewBanner) {
            bannerPreview.style.backgroundImage = `url('${imageData}')`;
            previewBanner.style.backgroundImage = `url('${imageData}')`;
            console.log('Updated preview images');
        }
        
        // Clear the default banner dropdown
        const defaultBannerSelect = document.getElementById('useDefaultBanner');
        if (defaultBannerSelect) {
            defaultBannerSelect.value = '';
        }
        
        // Update banner images if we're on the index page
        updateBannerImages();
        
        // Trigger storage event for other tabs
        try {
            const storageEvent = new StorageEvent('storage', {
                key: 'bannerImage',
                newValue: imageData,
                url: window.location.href
            });
            window.dispatchEvent(storageEvent);
        } catch (e) {
            console.error("Could not dispatch storage event:", e);
        }
    };
    
    reader.onerror = function(error) {
        console.error("Error reading file:", error);
        alert('Error reading image file. Please try again.');
    };
    
    reader.readAsDataURL(file);
}

// Handle default banner selection
function handleDefaultBannerSelect() {
    const defaultBannerSelect = document.getElementById('useDefaultBanner');
    if (!defaultBannerSelect) return;
    
    const imageUrl = defaultBannerSelect.value;
    if (!imageUrl) return;
    
    console.log("Default banner selected:", imageUrl);
    
    // Save to localStorage
    localStorage.setItem('bannerImage', imageUrl);
    console.log('Default banner saved to localStorage');
    
    // Update preview if we're on the for-you page
    const bannerPreview = document.getElementById('bannerPreview');
    const previewBanner = document.getElementById('previewBanner');
    
    if (bannerPreview && previewBanner) {
        bannerPreview.style.backgroundImage = `url('${imageUrl}')`;
        previewBanner.style.backgroundImage = `url('${imageUrl}')`;
        console.log('Updated preview images');
    }
    
    // Clear the file input
    const bannerImageInput = document.getElementById('bannerImage');
    if (bannerImageInput) {
        bannerImageInput.value = '';
    }
    
    // Update banner images if we're on the index page
    updateBannerImages();
    
    // Trigger storage event for other tabs
    try {
        const storageEvent = new StorageEvent('storage', {
            key: 'bannerImage',
            newValue: imageUrl,
            url: window.location.href
        });
        window.dispatchEvent(storageEvent);
    } catch (e) {
        console.error("Could not dispatch storage event:", e);
    }
}

// Listen for storage events to update banner images when changed in another tab
window.addEventListener('storage', function(e) {
    console.log("Storage event detected:", e.key);
    if (e.key === 'bannerImage') {
        console.log("Banner image changed in storage, updating");
        updateBannerImages();
    }
});

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing banner handling");
    initBannerHandling();
});
