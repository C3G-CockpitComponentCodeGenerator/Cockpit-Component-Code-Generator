//====================================================
// PDF Creator
// Cockpit Device Generator for SPAD.neXt
//====================================================
const PDFCreator = {
    exportWiringPDF,
};

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
    doc.setFontSize(20);

    doc.text('SPAD.neXt Cockpit Device Generator', 20, 30);

    doc.text('Hardware Wiring Guide', 20, 45);

    doc.addPage();
}
function addProjectSummaryPage(doc) {
    const allocation = allocatePins(project);

    doc.setFontSize(18);

    doc.text('Project Summary', 20, 20);

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

    doc.setFontSize(18);

    doc.text('Component Allocation', 20, 20);

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
    doc.setFontSize(18);

    doc.text('Board Pin Allocation', 20, 20);

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

        doc.autoTable({
            startY: 30,
            head: [['Pin', 'Component', 'Type']],
            body: rows,
        });

        doc.addPage();
    });
}
function addPDFSupportPage(doc) {
    doc.setFontSize(20);

    doc.text('Support & Resources', 20, 30);

    doc.setFontSize(12);

    doc.text('GitHub Repository', 20, 60);

    doc.text('https://github.com/YOURNAME/SPAD.neXt-Cockpit-Device-Generator', 20, 70);

    doc.text('Documentation and Releases', 20, 90);
}
