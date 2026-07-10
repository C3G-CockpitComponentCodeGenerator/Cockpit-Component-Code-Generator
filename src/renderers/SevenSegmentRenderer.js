/******************************************************************************
 *
 * C3G - Cockpit Component Code Generator
 *
 * ----------------------------------------------------------------------------
 * File        : SevenSegmentRenderer.js
 *
 * Description :
 * SVG renderer for the virtual MAX7219 Seven Segment Display.
 *
 * This renderer consumes a SevenSegmentDisplayModel and produces
 * scalable SVG output.
 *
 ******************************************************************************/

// ============================================================================
// SVG Helpers
// ============================================================================

function svgPolygon(points, fill) {
    return `
        <polygon
            points="${points}"
            fill="${fill}"
        />
    `;
}

function svgCircle(cx, cy, radius, fill) {
    return `
        <circle
            cx="${cx}"
            cy="${cy}"
            r="${radius}"
            fill="${fill}"
        />
    `;
}

// ============================================================================
// Segment Renderer
// ============================================================================

function renderSegment(segmentDefinition, active, theme) {
    const fill = active ? theme.SEGMENT_ON : theme.SEGMENT_OFF;

    const path =
        segmentDefinition.TYPE === SEGMENT_TYPES.HORIZONTAL ? SEGMENT_PATHS.HORIZONTAL : SEGMENT_PATHS.VERTICAL;

    return `
        <g transform="translate(${segmentDefinition.X},${segmentDefinition.Y})">

            ${svgPolygon(path, fill)}

        </g>
    `;
}

// ============================================================================
// Digit Renderer
// ============================================================================

function renderDigit(digitModel, x, theme) {
    const activeSegments = SEGMENT_MAP[digitModel.character] ?? [];

    let svg = '';

    for (const [segmentName, segmentDefinition] of Object.entries(SEGMENT_DEFINITIONS)) {
        svg += renderSegment(segmentDefinition, activeSegments.includes(segmentName), theme);
    }

    // Decimal Point
    if (digitModel.decimal) {
        svg += svgCircle(DECIMAL_GEOMETRY.X, DECIMAL_GEOMETRY.Y, DECIMAL_GEOMETRY.RADIUS, theme.SEGMENT_ON);
    }

    return `
        <g transform="translate(${x},0)">
            ${svg}
        </g>
    `;
}
