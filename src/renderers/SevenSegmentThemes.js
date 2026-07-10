/******************************************************************************
 *
 * C3G - Cockpit Component Code Generator
 *
 * ----------------------------------------------------------------------------
 * File        : SevenSegmentThemes.js
 *
 * Description :
 * Theme definitions for the Seven Segment SVG Renderer.
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
// Available Themes
// ============================================================================

const THEME_TYPES = Object.freeze({
    AMBER: 'AMBER',

    BLUE: 'BLUE',

    GREEN: 'GREEN',

    WHITE: 'WHITE',
});

// ============================================================================
// Colour Palette
// ============================================================================

const THEME_COLOURS = Object.freeze({
    BLACK: '#000000',

    DARK_GREY: '#1A1A1A',

    GREY: '#2A2A2A',

    LIGHT_GREY: '#505050',

    AMBER: '#FFC000',

    BLUE: '#33CCFF',

    GREEN: '#66FF66',

    WHITE: '#F5F5F5',
});

// ============================================================================
// Amber Theme
// ============================================================================

const AMBER_THEME = Object.freeze({
    NAME: THEME_TYPES.AMBER,

    DISPLAY_NAME: 'Amber',

    SEGMENT_ON: THEME_COLOURS.AMBER,

    SEGMENT_OFF: THEME_COLOURS.GREY,

    MODULE_BACKGROUND: THEME_COLOURS.BLACK,

    MODULE_BORDER: THEME_COLOURS.LIGHT_GREY,

    GLOW_COLOUR: THEME_COLOURS.AMBER,

    GLOW_STRENGTH: 0.35,
});

// ============================================================================
// Blue Theme
// ============================================================================

const BLUE_THEME = Object.freeze({
    NAME: THEME_TYPES.BLUE,

    DISPLAY_NAME: 'Blue',

    SEGMENT_ON: THEME_COLOURS.BLUE,

    SEGMENT_OFF: THEME_COLOURS.GREY,

    MODULE_BACKGROUND: THEME_COLOURS.BLACK,

    MODULE_BORDER: THEME_COLOURS.LIGHT_GREY,

    GLOW_COLOUR: THEME_COLOURS.BLUE,

    GLOW_STRENGTH: 0.35,
});

// ============================================================================
// Green Theme
// ============================================================================

const GREEN_THEME = Object.freeze({
    NAME: THEME_TYPES.GREEN,

    DISPLAY_NAME: 'Green',

    SEGMENT_ON: THEME_COLOURS.GREEN,

    SEGMENT_OFF: THEME_COLOURS.GREY,

    MODULE_BACKGROUND: THEME_COLOURS.BLACK,

    MODULE_BORDER: THEME_COLOURS.LIGHT_GREY,

    GLOW_COLOUR: THEME_COLOURS.GREEN,

    GLOW_STRENGTH: 0.35,
});

// ============================================================================
// White Theme
// ============================================================================

const WHITE_THEME = Object.freeze({
    NAME: THEME_TYPES.WHITE,

    DISPLAY_NAME: 'White',

    SEGMENT_ON: THEME_COLOURS.WHITE,

    SEGMENT_OFF: THEME_COLOURS.GREY,

    MODULE_BACKGROUND: THEME_COLOURS.BLACK,

    MODULE_BORDER: THEME_COLOURS.LIGHT_GREY,

    GLOW_COLOUR: THEME_COLOURS.WHITE,

    GLOW_STRENGTH: 0.35,
});

const DISPLAY_THEMES = Object.freeze({
    AMBER: AMBER_THEME,

    BLUE: BLUE_THEME,

    GREEN: GREEN_THEME,

    WHITE: WHITE_THEME,
});

// ============================================================================
//Deafult Theme
// ============================================================================

const DEFAULT_THEME = DISPLAY_THEMES.AMBER;
