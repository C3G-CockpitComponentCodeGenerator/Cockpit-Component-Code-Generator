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

// C3G Seven Segment SVG Renderer
// Version : 1.0.0
// Status  : Stable
// ============================================================================

// ============================================================================
// Character Segment Map
// ============================================================================
(() => {
    const { DIGIT_GEOMETRY, DECIMAL_GEOMETRY, SEGMENT_DEFINITIONS, SEGMENT_POINTS } = C3G.Renderer;

    const SEGMENT_MAP = Object.freeze({
        0: ['A', 'B', 'C', 'D', 'E', 'F'],

        1: ['B', 'C'],

        2: ['A', 'B', 'G', 'E', 'D'],

        3: ['A', 'B', 'C', 'D', 'G'],

        4: ['F', 'G', 'B', 'C'],

        5: ['A', 'F', 'G', 'C', 'D'],

        6: ['A', 'F', 'G', 'E', 'C', 'D'],

        7: ['A', 'B', 'C'],

        8: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],

        9: ['A', 'B', 'C', 'D', 'F', 'G'],

        '-': ['G'],

        ' ': [],
    });

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

    function renderSegment(segmentName, segmentDefinition, active, theme) {
        const fill = active ? theme.SEGMENT_ON : theme.SEGMENT_OFF;

        // const path =
        //    segmentDefinition.TYPE === SEGMENT_TYPES.HORIZONTAL ? SEGMENT_PATHS.HORIZONTAL : SEGMENT_PATHS.VERTICAL;
        const path = SEGMENT_POINTS[segmentName];
        /*  return `
        <g transform="translate(${segmentDefinition.X},${segmentDefinition.Y})">

            ${svgPolygon(path, fill)}

        </g>
    `; */
        return svgPolygon(path, fill);
    }

    // ============================================================================
    // Digit Renderer
    // ============================================================================

    function renderDigit(digitModel, x, theme) {
        const activeSegments = SEGMENT_MAP[digitModel.character] ?? [];

        let svg = '';

        for (const [segmentName, segmentDefinition] of Object.entries(SEGMENT_DEFINITIONS)) {
            svg += renderSegment(segmentName, segmentDefinition, activeSegments.includes(segmentName), theme);
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
    // Brightness
    // ============================================================================

    function adjustBrightness(hex, brightness) {
        // MAX7219 brightness is 0-15
        const factor = Math.max(0, Math.min(15, brightness)) / 15;

        const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
        const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
        const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // ============================================================================
    // Display Renderer
    // ============================================================================

    function renderDisplay(displayModel) {
        const theme = {
            ...displayModel.theme,
        };

        theme.SEGMENT_ON = adjustBrightness(theme.SEGMENT_ON, displayModel.brightness);

        let svg = '';

        for (let i = 0; i < displayModel.digits.length; i++) {
            /*  svg += renderDigit(
                displayModel.digits[i],
                i * (DIGIT_GEOMETRY.WIDTH + DIGIT_GEOMETRY.SPACING),
                displayModel.theme
            );*/
            svg += renderDigit(displayModel.digits[i], i * (DIGIT_GEOMETRY.WIDTH + DIGIT_GEOMETRY.SPACING), theme);
        }

        const width =
            displayModel.digits.length * (DIGIT_GEOMETRY.WIDTH + DIGIT_GEOMETRY.SPACING) + DIGIT_GEOMETRY.SPACING + 10;

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

    // ============================================================================
    // Public API
    // ============================================================================

    Object.assign(C3G.Renderer, {
        renderDisplay,
    });
})();
