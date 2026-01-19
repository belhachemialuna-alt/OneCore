// Drag and Drop Functionality for Analytics Page
(function() {
    'use strict';
    
    let draggedElement = null;
    
    function initDragDrop() {
        const draggableElements = document.querySelectorAll('[data-draggable="true"]');
        
        draggableElements.forEach(element => {
            element.setAttribute('draggable', 'true');
            
            element.addEventListener('dragstart', handleDragStart);
            element.addEventListener('dragend', handleDragEnd);
            element.addEventListener('dragover', handleDragOver);
            element.addEventListener('drop', handleDrop);
            element.addEventListener('dragleave', handleDragLeave);
        });
    }
    
    function handleDragStart(e) {
        draggedElement = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }
    
    function handleDragEnd(e) {
        this.classList.remove('dragging');
        
        // Remove drag-over class from all elements
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    }
    
    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        
        e.dataTransfer.dropEffect = 'move';
        
        if (this !== draggedElement) {
            this.classList.add('drag-over');
        }
        
        return false;
    }
    
    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        if (draggedElement !== this) {
            // Swap the elements
            const parent = this.parentNode;
            const draggedIndex = Array.from(parent.children).indexOf(draggedElement);
            const targetIndex = Array.from(parent.children).indexOf(this);
            
            if (draggedIndex < targetIndex) {
                parent.insertBefore(draggedElement, this.nextSibling);
            } else {
                parent.insertBefore(draggedElement, this);
            }
        }
        
        this.classList.remove('drag-over');
        
        return false;
    }
    
    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDragDrop);
    } else {
        initDragDrop();
    }
    
    // Re-initialize if drag toggle button is clicked
    const dragToggleBtn = document.getElementById('dragToggleBtn');
    if (dragToggleBtn) {
        dragToggleBtn.addEventListener('click', function() {
            const draggableElements = document.querySelectorAll('[data-draggable="true"]');
            const isEnabled = draggableElements[0]?.getAttribute('draggable') === 'true';
            
            draggableElements.forEach(element => {
                element.setAttribute('draggable', !isEnabled);
                if (!isEnabled) {
                    element.style.cursor = 'move';
                } else {
                    element.style.cursor = 'default';
                }
            });
            
            // Toggle button appearance
            this.classList.toggle('active');
        });
    }
})();
