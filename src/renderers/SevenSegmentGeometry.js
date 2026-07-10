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
    WIDTH: 60,

    HEIGHT: 100,

    SPACING: 8,
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
// Master Segment Paths
// ============================================================================

const SEGMENT_PATHS = Object.freeze({
    HORIZONTAL: '',

    VERTICAL: '',
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
