/******************************************************************************
 *
 * C3G - Cockpit Component Code Generator
 *
 * ----------------------------------------------------------------------------
 * File        : SevenSegmentGeometry.js
 *
 * Description :
 * Master geometry definitions for the Seven Segment SVG Renderer.
 *
 * This file contains the approved renderer geometry including digit
 * dimensions, segment dimensions, decimal point location, segment
 * positions and master SVG paths.
 *
 * IMPORTANT
 * ---------
 * This file contains geometry definitions ONLY.
 *
 * Rendering logic shall never be implemented here.
 *
 * Geometry defined within this file is considered frozen once approved.
 *
 * ----------------------------------------------------------------------------
 * Renderer Version : 1.0.0
 * Geometry Version : 1.0
 *
 ******************************************************************************/

// ============================================================================
// Digit Geometry
// ============================================================================

const DIGIT_GEOMETRY = Object.freeze({
    WIDTH: 56,

    HEIGHT: 100,

    SPACING: 12,
});

// ============================================================================
// Segment Geometry
// ============================================================================

const SEGMENT_GEOMETRY = Object.freeze({
    LENGTH: 40,

    THICKNESS: 8,

    CHAMFER: 4,

    GAP: 4,
});

// ============================================================================
// Decimal Geometry
// ============================================================================

const DECIMAL_GEOMETRY = Object.freeze({
    RADIUS: 4,

    X: 54,

    Y: 94,

    VISIBLE: true,
});

// ============================================================================
// Segment Types
// ============================================================================

const SEGMENT_TYPES = Object.freeze({
    HORIZONTAL: 'HORIZONTAL',

    VERTICAL: 'VERTICAL',
});

// ============================================================================
// Segment Points
// ============================================================================

const SEGMENT_POINTS = Object.freeze({
    // A: '8,6 12,2 48,2 52,6 48,10 12,10',
    A: '10,6 14,2 46,2 50,6 46,10 14,10',

    B: '50,8 54,12 54,44 50,48 46,44 46,12',

    C: '50,50 54,54 54,86 50,90 46,86 46,54',

    // D: '8,88 12,84 48,84 52,88 48,92 12,92',

    D: '10,88 14,84 46,84 50,88 46,92 14,92',

    E: '4,50 8,54 8,86 4,90 0,86 0,54',

    F: '4,8 8,12 8,44 4,48 0,44 0,12',

    //  G: '8,47 12,43 48,43 52,47 48,51 12,51',
    G: '10,47 14,43 46,43 50,47 46,51 14,51',
});
// ============================================================================
// Segment Definitions
// ============================================================================

const SEGMENT_DEFINITIONS = Object.freeze({
    A: Object.freeze({
        TYPE: SEGMENT_TYPES.HORIZONTAL,

        X: 10,

        Y: 6,
    }),

    B: Object.freeze({
        TYPE: SEGMENT_TYPES.VERTICAL,

        X: 46,

        Y: 12,
    }),

    C: Object.freeze({
        TYPE: SEGMENT_TYPES.VERTICAL,

        X: 46,

        Y: 54,
    }),

    D: Object.freeze({
        TYPE: SEGMENT_TYPES.HORIZONTAL,

        X: 10,

        Y: 88,
    }),

    E: Object.freeze({
        TYPE: SEGMENT_TYPES.VERTICAL,

        X: 6,

        Y: 54,
    }),

    F: Object.freeze({
        TYPE: SEGMENT_TYPES.VERTICAL,

        X: 6,

        Y: 12,
    }),

    G: Object.freeze({
        TYPE: SEGMENT_TYPES.HORIZONTAL,

        X: 10,

        Y: 47,
    }),
});

// ============================================================================
// Digit ViewBox
// ============================================================================

const DIGIT_VIEWBOX = Object.freeze({
    X: 0,

    Y: 0,

    WIDTH: DIGIT_GEOMETRY.WIDTH,

    HEIGHT: DIGIT_GEOMETRY.HEIGHT,
});
