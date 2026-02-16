// Mobile Search Bar Synchronization
document.addEventListener('DOMContentLoaded', function() {
    const mobileSearchBar = document.getElementById('mobileSearchBar');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const desktopSearchInput = document.getElementById('global-search');
    const desktopSearchBtn = document.getElementById('search-btn');
    
    if (mobileSearchBar && desktopSearchInput) {
        // Sync mobile search to desktop search
        mobileSearchBar.addEventListener('input', function() {
            desktopSearchInput.value = this.value;
            // Trigger input event on desktop search to activate search functionality
            const event = new Event('input', { bubbles: true });
            desktopSearchInput.dispatchEvent(event);
        });
        
        // Sync desktop search to mobile search
        desktopSearchInput.addEventListener('input', function() {
            mobileSearchBar.value = this.value;
        });
        
        // Handle Enter key on mobile search
        mobileSearchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (desktopSearchBtn) {
                    desktopSearchBtn.click();
                }
            }
        });
        
        // Handle mobile search button click
        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (desktopSearchBtn) {
                    desktopSearchBtn.click();
                } else {
                    // Trigger search functionality if desktop button doesn't exist
                    const event = new Event('submit', { bubbles: true });
                    if (mobileSearchBar.form) {
                        mobileSearchBar.form.dispatchEvent(event);
                    }
                }
            });
        }
    }
});
