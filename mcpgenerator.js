function generateMCPObjects(project) {
    if (!project.expansionDevices || project.expansionDevices.length === 0) {
        return '';
    }

    return project.expansionDevices

        .filter((d) => d.type === 'MCP23017')

        .map((d) => {
            const name = d.address.replace('0x', 'mcp');

            return `Adafruit_MCP23X17 ${name};`;
        })

        .join('\n');
}

function generateMCPIncludes(project) {
    if (!project.expansionDevices || project.expansionDevices.length === 0) {
        return '';
    }

    return ['#include <Wire.h>', '#include <Adafruit_MCP23X17.h>'].join('\n');
}

function generateMCPSetup(project) {
    if (!project.expansionDevices || project.expansionDevices.length === 0) {
        return '';
    }

    const lines = [];

    lines.push('Wire.begin();');

    lines.push('');

    project.expansionDevices

        .filter((d) => d.type === 'MCP23017')

        .forEach((d) => {
            const name = d.address.replace('0x', 'mcp');

            lines.push(`${name}.begin_I2C(${d.address});`);
        });

    return lines.join('\n');
}
