/******************************************************************************
 *
 * C3G - Cockpit Component Code Generator
 *
 * ----------------------------------------------------------------------------
 * File        : SevenSegmentModel.js
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
// C3G Seven Segment SVG Renderer
// Version : 1.0.0
// Status  : Stable
// ============================================================================*/
// ============================================================================
// Model Types
// ============================================================================

(() => {
    const DEFAULT_THEME = C3G.Renderer.DEFAULT_THEME;

    const DISPLAY_DIGIT_COUNT = 8;
    const MODEL_TYPES = Object.freeze({
        DIGIT: 'DIGIT',

        DISPLAY: 'DISPLAY',
    });

    const DEFAULT_DIGIT_MODEL = Object.freeze({
        character: ' ',

        decimal: false,

        enabled: false,

        brightness: 8,
    });

    const DEFAULT_DISPLAY_MODEL = Object.freeze({
        digits: [],

        theme: DEFAULT_THEME,

        brightness: 8,
    });

    function createDisplayModel() {
        const model = {
            ...DEFAULT_DISPLAY_MODEL,
        };

        model.digits = [];

        for (let i = 0; i < DISPLAY_DIGIT_COUNT; i++) {
            model.digits.push(createDigitModel());
        }

        return model;
    }

    function createDigitModel() {
        return {
            ...DEFAULT_DIGIT_MODEL,
        };
    }

    function populateDisplayModel(model, displayText) {
        displayText = normalizeDisplayText(displayText);

        displayText = applyReverse(displayText);

        displayText = applyLeadingZeroSuppression(displayText);

        populateDigits(model, displayText);

        console.table(
            model.digits.map((d, i) => ({
                digit: i,
                char: d.character,
                decimal: d.decimal,
            }))
        );

        return model;
    }

    // ============================================================================
    // Populate Digit Models
    // ============================================================================

    function populateDigits(model, displayText) {
        let digitIndex = 0;

        //  for (let i = 0; i < displayText.length && digitIndex < DISPLAY_DIGIT_COUNT; i++) {

        for (let i = 0; i < displayText.length; i++) {
            const ch = displayText[i];

            // Decimal point belongs to the previous digit
            if (ch === '.') {
                if (digitIndex > 0) {
                    model.digits[digitIndex - 1].decimal = true;
                }
                continue;
            }

            /*  const digit = model.digits[digitIndex];

            digit.character = ch;
            digit.enabled = ch !== ' ';
            digit.decimal = false;

            digitIndex++; */
            if (digitIndex >= DISPLAY_DIGIT_COUNT) {
                continue;
            }

            const digit = model.digits[digitIndex];

            digit.character = ch;
            digit.enabled = ch !== ' ';
            digit.decimal = false;

            digitIndex++;
        }

        // Clear remaining digits
        while (digitIndex < DISPLAY_DIGIT_COUNT) {
            model.digits[digitIndex].character = ' ';
            model.digits[digitIndex].enabled = false;
            model.digits[digitIndex].decimal = false;
            digitIndex++;
        }
    }

    function normalizeDisplayText(displayText) {
        return String(displayText);
    }

    function applyReverse(displayText) {
        return displayText;
    }

    function applyLeadingZeroSuppression(displayText) {
        return displayText;
    }

    function populateDigitModels(model, displayText) {}

    Object.assign(C3G.Renderer, {
        createDisplayModel,
        populateDisplayModel,
    });
})();
