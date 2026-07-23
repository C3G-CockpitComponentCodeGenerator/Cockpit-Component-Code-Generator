//====================================================
// Project Generator
//====================================================

function generateProject(firmwareModel) {
    const files = [];

    // Main Firmware
    files.push({
        type: 'firmware',

        name: `${project.projectName}.ino`,

        content: generateFirmware(firmwareModel),
    });

    // Display Support Files
    files.push(...generateDisplayFiles(firmwareModel));

    return {
        projectName: project.projectName,

        files,
    };
}
