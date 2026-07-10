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

// ============================================================================
// Display Renderer
// ============================================================================

function renderDisplay(displayModel) {
    let svg = '';

    for (let i = 0; i < displayModel.digits.length; i++) {
        svg += renderDigit(
            displayModel.digits[i],
            i * (DIGIT_GEOMETRY.WIDTH + DIGIT_GEOMETRY.SPACING),
            displayModel.theme
        );
    }

    const width = displayModel.digits.length * (DIGIT_GEOMETRY.WIDTH + DIGIT_GEOMETRY.SPACING) + DIGIT_GEOMETRY.SPACING;

    return `
        <svg
            width="100%"
            height="${DIGIT_GEOMETRY.HEIGHT}"
            viewBox="0 0 ${width} ${DIGIT_GEOMETRY.HEIGHT}"
            xmlns="http://www.w3.org/2000/svg">

            <rect
                x="0"
                y="0"
                width="${width}"
                height="${DIGIT_GEOMETRY.HEIGHT}"
                rx="8"
                fill="${displayModel.theme.MODULE_BACKGROUND}"
                stroke="${displayModel.theme.MODULE_BORDER}"
                stroke-width="2"/>

            ${svg}

        </svg>
    `;
}
