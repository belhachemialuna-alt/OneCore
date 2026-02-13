/**
 * PDF Export for Irrigation Schedules
 * Creates professional PDF reports with black and red theme
 */

class IrrigationPDFExporter {
    constructor() {
        this.init();
    }

    init() {
        // Initialize PDF export functionality
        const exportBtn = document.getElementById('export-pdf-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSchedulesToPDF());
        }
    }

    async exportSchedulesToPDF() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Get irrigation schedules data
            const schedules = await this.getIrrigationSchedules();
            
            // Generate PDF
            await this.generatePDF(schedules);
            
            // Show success notification
            if (typeof notificationSystem !== 'undefined') {
                notificationSystem.success('PDF exported successfully!', {
                    title: 'Export Complete',
                    icon: 'fa-solid fa-file-pdf'
                });
            }
        } catch (error) {
            console.error('PDF export failed:', error);
            if (typeof notificationSystem !== 'undefined') {
                notificationSystem.error('Failed to export PDF. Please try again.', {
                    title: 'Export Failed',
                    persistent: true
                });
            }
        } finally {
            this.hideLoadingState();
        }
    }

    async getIrrigationSchedules() {
        // Mock data for demonstration - replace with actual API call
        return [
            {
                id: 1,
                name: "Morning Vegetables",
                startTime: "06:00",
                duration: "15 min",
                days: ["Mon", "Wed", "Fri"],
                zone: "Zone A",
                soilMoisture: "30%",
                status: "Active",
                nextRun: "Tomorrow 06:00"
            },
            {
                id: 2,
                name: "Evening Lawn",
                startTime: "18:30",
                duration: "20 min",
                days: ["Tue", "Thu", "Sat"],
                zone: "Zone B",
                soilMoisture: "25%",
                status: "Active",
                nextRun: "Today 18:30"
            },
            {
                id: 3,
                name: "Weekend Garden",
                startTime: "07:00",
                duration: "30 min",
                days: ["Sat", "Sun"],
                zone: "Zone C",
                soilMoisture: "35%",
                status: "Paused",
                nextRun: "Saturday 07:00"
            },
            {
                id: 4,
                name: "Greenhouse Mist",
                startTime: "12:00",
                duration: "5 min",
                days: ["Daily"],
                zone: "Zone D",
                soilMoisture: "40%",
                status: "Active",
                nextRun: "Today 12:00"
            }
        ];
    }

    async generatePDF(schedules) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // PDF dimensions
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;

        // Colors
        const redColor = [255, 0, 0];
        const blackColor = [0, 0, 0];
        const whiteColor = [255, 255, 255];
        const grayColor = [128, 128, 128];

        // Create black background
        doc.setFillColor(...blackColor);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Header section with red accent
        doc.setFillColor(...redColor);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Title
        doc.setTextColor(...whiteColor);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IRRIGATION SCHEDULES REPORT', pageWidth / 2, 25, { align: 'center' });

        // Subtitle
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Generated on ${currentDate}`, pageWidth / 2, 35, { align: 'center' });

        // System info section
        let yPos = 60;
        doc.setFillColor(...redColor);
        doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 20, 'F');
        
        doc.setTextColor(...whiteColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SYSTEM OVERVIEW', margin + 5, yPos + 7);

        yPos += 30;
        doc.setTextColor(...whiteColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Schedules: ${schedules.length}`, margin, yPos);
        doc.text(`Active Schedules: ${schedules.filter(s => s.status === 'Active').length}`, margin + 80, yPos);
        doc.text(`System Status: Online`, margin + 160, yPos);

        // Table header
        yPos += 25;
        doc.setFillColor(...redColor);
        doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 15, 'F');

        doc.setTextColor(...whiteColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        
        // Table headers
        const headers = ['Schedule Name', 'Time', 'Duration', 'Days', 'Zone', 'Moisture', 'Status', 'Next Run'];
        const colWidths = [35, 20, 20, 25, 20, 20, 20, 30];
        let xPos = margin;
        
        headers.forEach((header, index) => {
            doc.text(header, xPos + 2, yPos + 7);
            xPos += colWidths[index];
        });

        // Table rows
        yPos += 20;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        schedules.forEach((schedule, index) => {
            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(20, 20, 20);
                doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 12, 'F');
            }

            xPos = margin;
            const rowData = [
                schedule.name,
                schedule.startTime,
                schedule.duration,
                Array.isArray(schedule.days) ? schedule.days.join(', ') : schedule.days,
                schedule.zone,
                schedule.soilMoisture,
                schedule.status,
                schedule.nextRun
            ];

            rowData.forEach((data, colIndex) => {
                // Color code status
                if (colIndex === 6) { // Status column
                    if (data === 'Active') {
                        doc.setTextColor(0, 255, 0);
                    } else if (data === 'Paused') {
                        doc.setTextColor(255, 165, 0);
                    } else {
                        doc.setTextColor(...grayColor);
                    }
                } else {
                    doc.setTextColor(...whiteColor);
                }

                // Truncate long text
                let displayText = data.toString();
                if (displayText.length > 15 && colIndex !== 0) {
                    displayText = displayText.substring(0, 12) + '...';
                }

                doc.text(displayText, xPos + 2, yPos + 5);
                xPos += colWidths[colIndex];
            });

            yPos += 12;

            // Add new page if needed
            if (yPos > pageHeight - 40) {
                doc.addPage();
                doc.setFillColor(...blackColor);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');
                yPos = 30;
            }
        });

        // Footer
        const footerY = pageHeight - 20;
        doc.setFillColor(...redColor);
        doc.rect(0, footerY - 5, pageWidth, 25, 'F');

        doc.setTextColor(...whiteColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('TiOne Smart Irrigation System', pageWidth / 2, footerY + 5, { align: 'center' });
        doc.text('Automated Irrigation Management', pageWidth / 2, footerY + 15, { align: 'center' });

        // Save the PDF
        const fileName = `irrigation-schedules-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }

    showLoadingState() {
        const exportBtn = document.getElementById('export-pdf-btn');
        if (exportBtn) {
            exportBtn.disabled = true;
            exportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            exportBtn.title = 'Generating PDF...';
        }
    }

    hideLoadingState() {
        const exportBtn = document.getElementById('export-pdf-btn');
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i>';
            exportBtn.title = 'Export Schedules to PDF';
        }
    }
}

// Initialize PDF exporter when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new IrrigationPDFExporter();
    });
} else {
    new IrrigationPDFExporter();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IrrigationPDFExporter;
}
