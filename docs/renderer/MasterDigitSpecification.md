# C3G – Cockpit Component Code Generator

# Master Digit Specification

---

## Document Information

| Property    | Value                                  |
| ----------- | -------------------------------------- |
| Document ID | SDS-MAX7219-001                        |
| Subsystem   | Seven Segment SVG Renderer             |
| Document    | Master Digit Specification             |
| Version     | 1.0 Draft                              |
| Status      | Draft                                  |
| Author      | Perur Chandramouli                     |
| Project     | C3G – Cockpit Component Code Generator |

---

# 1. Purpose

This document defines the engineering specification for the SVG-based
7-Segment display renderer used by the SPAD.neXt Cockpit Device Generator.

Its purpose is to establish a permanent reference for the geometry,
layout and rendering rules of the virtual MAX7219 display.

Once Version 1.0 is approved, the geometry defined within this document
shall remain unchanged for all future renderer releases.

Future enhancements such as themes, brightness, glow effects and
animations shall be implemented without modifying the approved master
geometry.

---

# 2. Scope

This specification applies to the following renderer components.

• Master Digit Geometry

• Horizontal Segment

• Vertical Segment

• Decimal Point

• Segment Coordinate System

• Segment Naming Convention

• Digit Dimensions

• Digit Spacing

• Renderer Coordinate System

---

# 3. Design Objectives

The renderer has been designed with the following goals.

• Produce a virtual display visually matching a commercial MAX7219 module.

• Provide a scalable vector implementation.

• Maintain identical geometry for every rendered digit.

• Separate geometry from rendering logic.

• Support multiple display themes.

• Support brightness simulation.

• Support decimal point rendering.

• Support reverse digit rendering.

• Support suppression of leading zeros.

• Support future animation capabilities.

---

# 4. Design Philosophy

The renderer follows a layered architecture.

Configuration

↓

Preview Model

↓

Character Model

↓

Segment Map

↓

Segment Renderer

↓

Digit Renderer

↓

Display Renderer

↓

SVG Output

The renderer shall never contain geometry calculations generated at
runtime.

Instead, all geometry is defined once within this specification and
reused throughout the renderer.

---

# 5. Coordinate System

The renderer uses a Cartesian coordinate system.

Origin

(0,0)

Top Left Corner

Positive X →

Positive Y ↓

Every digit is rendered within a fixed coordinate space.

Digit Width

60 Units

Digit Height

100 Units

The coordinate system shall never change after Version 1 approval.

---

# 6. Master Digit Layout

The master digit consists of seven independent LED segments together
with an independent decimal point.

            A

      ─────────────

    F             B

    │             │

      ─────────────

            G

    │             │

    E             C

      ─────────────

            D

                 ● DP

Each segment is rendered independently.

The decimal point is not considered part of Segment C.

---

# 7. Segment Naming Convention

The following naming convention shall be used throughout the renderer.

Segment A

Top Horizontal

Segment B

Upper Right Vertical

Segment C

Lower Right Vertical

Segment D

Bottom Horizontal

Segment E

Lower Left Vertical

Segment F

Upper Left Vertical

Segment G

Centre Horizontal

Segment DP

Decimal Point

These identifiers shall remain constant for all renderer versions.

---

# 8. Segment Geometry

Two master segment geometries shall exist.

Horizontal Segment

Used by

• Segment A

• Segment D

• Segment G

Vertical Segment

Used by

• Segment B

• Segment C

• Segment E

• Segment F

No additional segment geometries shall be introduced.

---

# 9. Digit Dimensions

Bounding Box

Width

60 Units

Height

100 Units

Recommended Segment Thickness

8 Units

Recommended Chamfer

4 Units

Recommended Segment Gap

4 Units

These values represent the approved Version 1 geometry.

---

# 10. Decimal Point

The decimal point is rendered independently of all seven segments.

Properties

• Circular geometry

• Independent visibility

• Independent colour

• Independent brightness

The decimal point shall always occupy the same physical location within
the digit bounding box.

---

# 11. Digit Spacing

Recommended Digit Width

60 Units

Recommended Inter-Digit Spacing

8 Units

Recommended Digit Pitch

68 Units

The spacing shall remain constant throughout the display.

---

# 12. Renderer Independence

The renderer shall never depend upon UI controls.

Instead, it shall receive a renderer model describing the display state.

Example

Character

Brightness

Theme

Decimal

Enabled

The renderer is responsible only for visual representation.

---

# 13. Future Compatibility

The approved geometry supports future implementation of

• Amber Theme

• Blue Theme

• Green Theme

• White Theme

• Brightness Simulation

• Glow Effects

• Test Mode

• Flashing Digits

• LCD Renderer

• OLED Renderer

No future feature shall require modification of the approved master
geometry.

---

# 14. Geometry Freeze

Once Version 1.0 is approved the following elements become frozen.

✓ Coordinate System

✓ Segment Naming

✓ Master Horizontal Segment

✓ Master Vertical Segment

✓ Decimal Position

✓ Digit Dimensions

✓ Digit Spacing

Future renderer versions may extend functionality but shall not modify
the approved geometry.

---

# Revision History

| Version   | Date | Description                        |
| --------- | ---- | ---------------------------------- |
| 1.0 Draft | 2026 | Initial Master Digit Specification |

---

**Project**

C3G – Cockpit Component Code Generator

**Subsystem**

Seven Segment SVG Renderer

**Document**

Master Digit Specification

**Status**

Draft
