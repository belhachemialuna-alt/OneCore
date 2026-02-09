/**
 * Hardware Schema Drag & Drop System
 * Enables interactive component manipulation in SVG
 */

class HardwareDragDrop {
    constructor() {
        this.svg = null;
        this.selectedComponent = null;
        this.isDragging = false;
        this.offset = { x: 0, y: 0 };
        this.flowAnimationActive = false;
        this.layersVisible = true;
        
        this.init();
    }
    
    init() {
        this.svg = document.getElementById('hardware-schema');
        if (!this.svg) return;
        
        this.setupDragDrop();
        this.setupControls();
        this.setupTooltips();
        this.animateStatusIndicators();
    }
    
    setupDragDrop() {
        // Get all draggable components
        const components = this.svg.querySelectorAll('.component');
        
        components.forEach(component => {
            component.classList.add('draggable');
            
            // Mouse down - start drag
            component.addEventListener('mousedown', (e) => {
                this.startDrag(component, e);
            });
        });
        
        // Global mouse move
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.selectedComponent) {
                this.drag(e);
            }
        });
        
        // Global mouse up - end drag
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.endDrag();
            }
        });
        
        // Component click for info
        components.forEach(component => {
            component.addEventListener('click', (e) => {
                if (!this.isDragging) {
                    this.showComponentInfo(component);
                }
            });
        });
    }
    
    startDrag(component, event) {
        this.isDragging = true;
        this.selectedComponent = component;
        component.classList.add('dragging');
        
        // Get SVG coordinates
        const svgRect = this.svg.getBoundingClientRect();
        const componentBBox = component.getBBox();
        
        this.offset = {
            x: event.clientX - svgRect.left - componentBBox.x,
            y: event.clientY - svgRect.top - componentBBox.y
        };
        
        // Update cursor
        if (window.customCursor) {
            window.customCursor.cursor.classList.add('dragging');
        }
    }
    
    drag(event) {
        if (!this.selectedComponent) return;
        
        const svgRect = this.svg.getBoundingClientRect();
        const svgPoint = this.svg.createSVGPoint();
        
        svgPoint.x = event.clientX;
        svgPoint.y = event.clientY;
        
        const ctm = this.svg.getScreenCTM();
        const transformedPoint = svgPoint.matrixTransform(ctm.inverse());
        
        const newX = transformedPoint.x - this.offset.x;
        const newY = transformedPoint.y - this.offset.y;
        
        // Apply transform
        this.selectedComponent.setAttribute('transform', `translate(${newX}, ${newY})`);
    }
    
    endDrag() {
        if (this.selectedComponent) {
            this.selectedComponent.classList.remove('dragging');
        }
        
        this.isDragging = false;
        this.selectedComponent = null;
        
        // Update cursor
        if (window.customCursor) {
            window.customCursor.cursor.classList.remove('dragging');
        }
    }
    
    setupControls() {
        // Toggle Layers
        const layersBtn = document.getElementById('toggleLayersBtn');
        if (layersBtn) {
            layersBtn.addEventListener('click', () => {
                this.toggleLayers();
                layersBtn.classList.toggle('active');
            });
        }
        
        // Toggle Flow Animation
        const flowBtn = document.getElementById('toggleFlowBtn');
        if (flowBtn) {
            flowBtn.addEventListener('click', () => {
                this.toggleFlow();
                flowBtn.classList.toggle('active');
            });
        }
        
        // Reset Schema
        const resetBtn = document.getElementById('resetSchemaBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSchema();
            });
        }
    }
    
    toggleLayers() {
        this.layersVisible = !this.layersVisible;
        const zones = this.svg.querySelectorAll('.zone');
        
        zones.forEach((zone, index) => {
            if (this.layersVisible) {
                zone.style.opacity = '1';
                zone.style.display = 'block';
            } else {
                // Show zones one by one
                setTimeout(() => {
                    zone.style.opacity = zone.style.opacity === '1' ? '0.3' : '1';
                }, index * 200);
            }
        });
    }
    
    toggleFlow() {
        this.flowAnimationActive = !this.flowAnimationActive;
        const pipes = this.svg.querySelectorAll('.pipe');
        
        pipes.forEach(pipe => {
            if (this.flowAnimationActive) {
                pipe.classList.add('flowing');
            } else {
                pipe.classList.remove('flowing');
            }
        });
        
        // Animate status indicators
        const statusIndicators = this.svg.querySelectorAll('.status-indicator');
        statusIndicators.forEach(indicator => {
            if (this.flowAnimationActive) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    resetSchema() {
        // Remove all transforms
        const components = this.svg.querySelectorAll('.component');
        components.forEach(component => {
            component.removeAttribute('transform');
            component.classList.remove('dragging', 'highlighted');
        });
        
        // Reset pipes
        const pipes = this.svg.querySelectorAll('.pipe');
        pipes.forEach(pipe => {
            pipe.classList.remove('flowing');
        });
        
        // Reset zones
        const zones = this.svg.querySelectorAll('.zone');
        zones.forEach(zone => {
            zone.style.opacity = '1';
            zone.style.display = 'block';
            zone.classList.remove('highlighted');
        });
        
        // Reset buttons
        document.querySelectorAll('.schema-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.flowAnimationActive = false;
        this.layersVisible = true;
    }
    
    setupTooltips() {
        const components = this.svg.querySelectorAll('.component');
        
        components.forEach(component => {
            component.addEventListener('mouseenter', (e) => {
                this.showTooltip(component, e);
            });
            
            component.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }
    
    showTooltip(component, event) {
        const componentId = component.id;
        const componentType = this.getComponentType(componentId);
        const status = this.getComponentStatus(component);
        
        // Create tooltip if it doesn't exist
        let tooltip = document.getElementById('schema-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'schema-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 0.75rem 1rem;
                border-radius: 6px;
                font-size: 0.875rem;
                pointer-events: none;
                z-index: 10000;
                border: 1px solid #FF0000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <strong>${componentType}</strong><br>
            ID: ${componentId}<br>
            Status: <span style="color: ${status.color}">${status.text}</span>
        `;
        
        tooltip.style.display = 'block';
        this.updateTooltipPosition(event);
    }
    
    updateTooltipPosition(event) {
        const tooltip = document.getElementById('schema-tooltip');
        if (tooltip) {
            tooltip.style.left = (event.clientX + 15) + 'px';
            tooltip.style.top = (event.clientY + 15) + 'px';
        }
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('schema-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    getComponentType(id) {
        if (id.includes('pump')) return 'Water Pump';
        if (id.includes('filter')) return 'Water Filter';
        if (id.includes('valve')) return 'Control Valve';
        if (id.includes('sensor')) return 'Soil Moisture Sensor';
        if (id.includes('pressure')) return 'Pressure Sensor';
        if (id.includes('sprinkler')) return 'Sprinkler Head';
        if (id.includes('source')) return 'Water Source';
        if (id.includes('control')) return 'Control System';
        return 'Component';
    }
    
    getComponentStatus(component) {
        const statusIndicator = component.querySelector('.status-indicator');
        if (!statusIndicator) {
            return { text: 'Unknown', color: '#999' };
        }
        
        const fill = statusIndicator.getAttribute('fill');
        
        if (fill === '#4caf50') {
            return { text: 'Online', color: '#4caf50' };
        } else if (fill === '#757575') {
            return { text: 'Offline', color: '#757575' };
        } else if (fill === '#f44336') {
            return { text: 'Error', color: '#f44336' };
        } else if (fill === '#ff9800') {
            return { text: 'Warning', color: '#ff9800' };
        }
        
        return { text: 'Unknown', color: '#999' };
    }
    
    showComponentInfo(component) {
        const componentId = component.id;
        const componentType = this.getComponentType(componentId);
        
        console.log(`Component clicked: ${componentType} (${componentId})`);
        
        // Highlight the component
        component.classList.add('highlighted');
        
        // Remove highlight after 2 seconds
        setTimeout(() => {
            component.classList.remove('highlighted');
        }, 2000);
        
        // If it's a zone, highlight all components in that zone
        if (component.classList.contains('zone')) {
            const zoneComponents = component.querySelectorAll('.component');
            zoneComponents.forEach(comp => {
                comp.classList.add('highlighted');
            });
            
            setTimeout(() => {
                zoneComponents.forEach(comp => {
                    comp.classList.remove('highlighted');
                });
            }, 2000);
        }
    }
    
    animateStatusIndicators() {
        // Randomly update status indicators to simulate real-time data
        setInterval(() => {
            const indicators = this.svg.querySelectorAll('.status-indicator');
            indicators.forEach(indicator => {
                // Randomly pulse some indicators
                if (Math.random() > 0.7) {
                    indicator.style.opacity = '0.5';
                    setTimeout(() => {
                        indicator.style.opacity = '1';
                    }, 300);
                }
            });
        }, 3000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.hardwareDragDrop = new HardwareDragDrop();
    });
} else {
    window.hardwareDragDrop = new HardwareDragDrop();
}
