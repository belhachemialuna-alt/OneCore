/**
 * Custom Mouse Cursor Handler
 * Creates and manages custom cursor with various states
 */

class CustomCursor {
    constructor() {
        this.cursor = null;
        this.cursorDot = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isVisible = true;
        
        this.init();
    }
    
    init() {
        // Create cursor elements
        this.createCursor();
        
        // Bind events
        this.bindEvents();
        
        // Start animation loop
        this.animate();
    }
    
    createCursor() {
        // Create cursor container
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        
        // Create dot
        this.cursorDot = document.createElement('div');
        this.cursorDot.className = 'cursor-dot';
        
        // Create ring
        this.cursorRing = document.createElement('div');
        this.cursorRing.className = 'cursor-ring';
        
        // Append elements
        this.cursor.appendChild(this.cursorDot);
        this.cursor.appendChild(this.cursorRing);
        document.body.appendChild(this.cursor);
    }
    
    bindEvents() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            if (!this.isVisible) {
                this.show();
            }
        });
        
        // Mouse leave window
        document.addEventListener('mouseleave', () => {
            this.hide();
        });
        
        // Mouse enter window
        document.addEventListener('mouseenter', () => {
            this.show();
        });
        
        // Mouse down
        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('click');
        });
        
        // Mouse up
        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('click');
        });
        
        // Hover states for different elements
        this.setupHoverStates();
        
        // Drag and drop states
        this.setupDragStates();
    }
    
    setupHoverStates() {
        // Links
        document.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                this.cursor.classList.add('link');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                this.cursor.classList.remove('link');
            }
        });
        
        // Buttons
        document.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button') || 
                e.target.classList.contains('btn') || e.target.closest('.btn')) {
                this.cursor.classList.add('button');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button') ||
                e.target.classList.contains('btn') || e.target.closest('.btn')) {
                this.cursor.classList.remove('button');
            }
        });
        
        // Inputs
        document.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || 
                e.target.tagName === 'SELECT') {
                this.cursor.classList.add('input');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
                e.target.tagName === 'SELECT') {
                this.cursor.classList.remove('input');
            }
        });
        
        // Text selection
        document.addEventListener('mouseover', (e) => {
            const computedStyle = window.getComputedStyle(e.target);
            if (computedStyle.cursor === 'text' || e.target.isContentEditable) {
                this.cursor.classList.add('text');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const computedStyle = window.getComputedStyle(e.target);
            if (computedStyle.cursor === 'text' || e.target.isContentEditable) {
                this.cursor.classList.remove('text');
            }
        });
        
        // Generic hover
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('hover-effect') || 
                e.target.closest('.hover-effect') ||
                e.target.classList.contains('clickable') ||
                e.target.closest('.clickable')) {
                this.cursor.classList.add('hover');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('hover-effect') || 
                e.target.closest('.hover-effect') ||
                e.target.classList.contains('clickable') ||
                e.target.closest('.clickable')) {
                this.cursor.classList.remove('hover');
            }
        });
    }
    
    setupDragStates() {
        // Drag start
        document.addEventListener('dragstart', () => {
            this.cursor.classList.add('dragging');
        });
        
        // Drag end
        document.addEventListener('dragend', () => {
            this.cursor.classList.remove('dragging');
        });
        
        // Draggable elements hover
        document.addEventListener('mouseover', (e) => {
            if (e.target.draggable || e.target.classList.contains('draggable') ||
                e.target.closest('[draggable="true"]') || e.target.closest('.draggable')) {
                this.cursor.classList.add('hover');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.draggable || e.target.classList.contains('draggable') ||
                e.target.closest('[draggable="true"]') || e.target.closest('.draggable')) {
                this.cursor.classList.remove('hover');
            }
        });
    }
    
    animate() {
        // Smooth follow with easing
        const speed = 0.15;
        
        this.currentX += (this.mouseX - this.currentX) * speed;
        this.currentY += (this.mouseY - this.currentY) * speed;
        
        this.cursor.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
        
        requestAnimationFrame(() => this.animate());
    }
    
    startTrail() {
        let lastTrailTime = 0;
        const trailDelay = 50; // ms between trail dots
        
        const createTrail = () => {
            const now = Date.now();
            if (now - lastTrailTime > trailDelay) {
                const trail = document.createElement('div');
                trail.className = 'cursor-trail';
                trail.style.left = this.currentX + 'px';
                trail.style.top = this.currentY + 'px';
                document.body.appendChild(trail);
                
                // Remove after animation
                setTimeout(() => {
                    trail.remove();
                }, 500);
                
                lastTrailTime = now;
            }
            
            requestAnimationFrame(createTrail);
        };
        
        createTrail();
    }
    
    show() {
        this.isVisible = true;
        this.cursor.classList.remove('hidden');
    }
    
    hide() {
        this.isVisible = false;
        this.cursor.classList.add('hidden');
    }
    
    setDisabled(disabled) {
        if (disabled) {
            this.cursor.classList.add('disabled');
        } else {
            this.cursor.classList.remove('disabled');
        }
    }
}

// Initialize custom cursor when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if not on touch device
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            window.customCursor = new CustomCursor();
        }
    });
} else {
    // DOM already loaded
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.customCursor = new CustomCursor();
    }
}
