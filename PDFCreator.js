//====================================================
// PDF Creator
// Cockpit Device Generator for SPAD.neXt
//====================================================
const PDFCreator = {
    exportWiringPDF,
};

//====================================================
// PDF Theme
//====================================================

const PDF_THEME = {
    primary: [32, 70, 135],
    light: [245, 245, 245],
    border: [190, 190, 190],
    text: [40, 40, 40],
};

function drawPageHeader(doc, title) {
    doc.setFillColor(...PDF_THEME.primary);
    doc.rect(0, 0, 210, 18, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255);
    doc.text(title, 15, 12);

    doc.setTextColor(...PDF_THEME.text);
}

function drawPageFooter(doc) {
    const page = doc.getCurrentPageInfo().pageNumber;

    doc.setDrawColor(...PDF_THEME.border);
    doc.line(15, 285, 195, 285);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120);

    doc.text(`Project: ${project.projectName || 'Untitled Project'}`, 15, 291);

    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 85, 291);

    doc.text(`Page ${page}`, 180, 291);
}

function createStyledTable(doc, head, body, startY = 25) {
    doc.autoTable({
        startY,

        head,

        body,

        theme: 'grid',

        margin: {
            left: 15,
            right: 15,
        },

        styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 3,
            lineColor: PDF_THEME.border,
            lineWidth: 0.2,
            textColor: PDF_THEME.text,
            valign: 'middle',
        },

        headStyles: {
            fillColor: PDF_THEME.primary,
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
        },

        alternateRowStyles: {
            fillColor: PDF_THEME.light,
        },
    });

    drawPageFooter(doc);
}

function exportWiringPDF() {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    addCoverPage(doc);
    addProjectSummaryPage(doc);
    addComponentAllocationPage(doc);
    addBoardPinPage(doc);
    addMCPPages(doc);
    addPDFSupportPage(doc);

    doc.save(`${project.projectName || 'Project'}-Wiring-Guide.pdf`);
}

function addCoverPage(doc) {
    doc.setFillColor(...PDF_THEME.primary);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(255);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Cockpit Device Generator', 105, 55, { align: 'center' });

    doc.setFontSize(18);
    doc.text('Hardware Wiring Guide', 105, 70, { align: 'center' });

    doc.setFontSize(12);

    doc.text(`Project`, 105, 105, { align: 'center' });
    doc.text(project.projectName || 'Untitled Project', 105, 115, { align: 'center' });

    doc.text(`Board`, 105, 135, { align: 'center' });
    doc.text(getSelectedBoard().name, 105, 145, { align: 'center' });

    doc.text(`Generated`, 105, 165, { align: 'center' });
    doc.text(new Date().toLocaleDateString(), 105, 175, { align: 'center' });

    doc.setFontSize(10);

    doc.text('Generated automatically by SPAD.neXt Cockpit Device Generator', 105, 270, { align: 'center' });

    doc.addPage();
}
function addProjectSummaryPage(doc) {
    const allocation = allocatePins(project);

    //   doc.setFontSize(18);

    //   doc.text('Project Summary', 20, 20);
    drawPageHeader(doc, 'Project Summary');

    const gpioUsed = allocation.reservedPins.length;

    const analogUsed = allocation.allocations.filter((a) => a.pins.some((p) => String(p).startsWith('A'))).length;

    const pwmUsed = 0; // until allocator tracks PWM

    const displayUsed = project.components.filter((c) => c.type === 'sevensegment').length;

    const rows = [
        ['Board', getSelectedBoard().name],
        ['Components', String(project.components.length)],
        ['MCP23017', String(expansionManager.getDevices().length)],
        ['GPIO Used', String(gpioUsed)],
        ['Analog Used', String(analogUsed)],
        ['PWM Used', String(pwmUsed)],
        ['Displays', String(displayUsed)],
    ];

    doc.autoTable({
        startY: 30,
        head: [['Item', 'Value']],
        body: rows,
    });

    doc.addPage();
}
function addComponentAllocationPage(doc) {
    const allocation = allocatePins(project);

    //  doc.setFontSize(18);

    //   doc.text('Component Allocation', 20, 20);
    drawPageHeader(doc, 'Component Allocation');

    const rows = allocation.allocations.map((a) => [
        a.component.id,
        a.component.label,
        a.component.type,
        getAssignedDeviceName(a.component),
        a.pins.join(', '),
    ]);

    doc.autoTable({
        startY: 30,
        head: [['ID', 'Label', 'Type', 'Assigned To', 'Pins']],
        body: rows,
    });

    doc.addPage();
}
function addBoardPinPage(doc) {
    //   doc.setFontSize(18);

    //   doc.text('Board Pin Allocation', 20, 20);
    drawPageHeader(doc, 'Board Pin Allocation');

    const allocation = allocatePins(project);

    const rows = [];

    allocation.allocations.forEach((a) => {
        a.pins.forEach((pin) => {
            if (String(pin).startsWith('0x')) return;

            rows.push([pin, a.component.label, a.component.type]);
        });
    });

    doc.autoTable({
        startY: 30,
        head: [['Pin', 'Component', 'Type']],
        body: rows,
    });

    doc.addPage();
}
function addMCPPages(doc) {
    const allocation = allocatePins(project);

    const devices = expansionManager.getDevices();

    devices.forEach((device) => {
        doc.setFontSize(18);

        doc.text(`MCP23017 (${device.address})`, 20, 20);

        const rows = [];

        allocation.allocations.forEach((a) => {
            a.pins.forEach((pin) => {
                if (String(pin).startsWith(`0x${device.address.toString(16).toUpperCase()}`)) {
                    rows.push([pin, a.component.label, a.component.type]);
                }
            });
        });

        /*      doc.autoTable({
            startY: 30,
            head: [['Pin', 'Component', 'Type']],
            body: rows,
        }); */
        createStyledTable(doc, [['Item', 'Value']], rows);

        doc.addPage();
    });
}
/*function addPDFSupportPage(doc) {
    doc.setFontSize(20);

    //  doc.text('Support & Resources', 20, 30);

    //  doc.setFontSize(12);
    drawPageHeader(doc, 'Support & Resources');

    doc.text('GitHub Repository', 20, 60);

    doc.text('https://github.com/YOURNAME/SPAD.neXt-Cockpit-Device-Generator', 20, 70);

    doc.text('Documentation and Releases', 20, 90);
} */

function addPDFSupportPage(doc) {
    drawPageHeader(doc, 'Support & Resources');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    doc.text('GitHub Repository', 20, 35);

    doc.setFont('helvetica', 'normal');

    doc.text('https://github.com/C3G-CockpitComponentCodeGenerator/Cockpit-Component-Code-Generator', 20, 45);

    doc.text('Documentation', 20, 65);
    doc.text('Bug Reports', 20, 75);
    doc.text('Feature Requests', 20, 85);

    drawPageFooter(doc);
}
