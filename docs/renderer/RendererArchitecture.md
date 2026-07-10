# C3G – Cockpit Component Code Generator

# Renderer Architecture

---

## Document Information

| Property    | Value                                  |
| ----------- | -------------------------------------- |
| Document ID | SDS-MAX7219-002                        |
| Subsystem   | Seven Segment SVG Renderer             |
| Document    | Renderer Architecture                  |
| Version     | 1.0 Draft                              |
| Status      | Draft                                  |
| Author      | Perur Chandramouli                     |
| Project     | C3G – Cockpit Component Code Generator |

---

# 1. Purpose

This document describes the software architecture of the Seven Segment
SVG Renderer used by the SPAD.neXt Cockpit Device Generator.

Unlike the Master Digit Specification, this document focuses on software
structure rather than geometry.

Its purpose is to explain how the renderer transforms display
configuration data into a scalable SVG representation.

---

# 2. Design Philosophy

The renderer follows four fundamental principles.

## Separation of Concerns

Each renderer component has one clearly defined responsibility.

Geometry

↓

Segment Rendering

↓

Digit Rendering

↓

Display Rendering

↓

Preview Rendering

---

## Single Responsibility

Each function performs one task only.

Examples

renderHorizontalSegment()

renderVerticalSegment()

renderDigit()

renderDisplay()

renderDisplayPreview()

No function shall perform multiple rendering responsibilities.

---

## Data Driven Rendering

The renderer never contains display-specific logic.

Instead it consumes renderer data.

Example

Character

↓

Segment Map

↓

Segments

↓

SVG

The renderer does not know what a COM radio or transponder is.

It only renders the supplied data.

---

## Geometry Independence

Renderer logic shall never generate geometry.

All geometry originates from the approved Master Digit Specification.

---

# 3. Rendering Pipeline

Display Configuration

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

Each stage has a single responsibility.

---

# 4. Architecture Layers

## Layer 1

Display Configuration

User configuration

• Active Digits

• Decimal Position

• Brightness

• Reverse

• Suppress Leading Zeros

↓

Produces

Preview Model

---

## Layer 2

Preview Model

Represents the virtual display.

Responsible for

• Character sequence

• Decimal placement

• Hidden digits

• Reverse order

↓

Produces

Character Model

---

## Layer 3

Character Model

Represents each display character.

Example

Character

Decimal

Brightness

Enabled

↓

Produces

Segment Model

---

## Layer 4

Segment Model

Converts characters into active LED segments.

Uses

SEGMENT_MAP

↓

Produces

Segment States

---

## Layer 5

Segment Renderer

Responsible only for rendering one LED segment.

Supported segment types

Horizontal

Vertical

---

## Layer 6

Digit Renderer

Responsible for assembling

A

B

C

D

E

F

G

Decimal

into one complete digit.

---

## Layer 7

Display Renderer

Responsible for

Digit spacing

Digit alignment

Module background

Theme

Brightness

↓

Produces

SVG Display

---

# 5. Public API

The renderer exposes one public entry point.

renderDisplay()

All remaining functions are considered internal implementation details.

---

# 6. Internal Functions

Typical renderer implementation.

renderDisplay()

↓

renderDigit()

↓

renderHorizontalSegment()

renderVerticalSegment()

No external module should directly invoke internal rendering functions.

---

# 7. Theme Engine

Renderer colours are defined by theme objects.

Example

Amber

Blue

Green

White

The renderer never contains hardcoded colours.

---

# 8. Brightness Engine

Brightness is implemented independently of geometry.

Brightness shall modify

Opacity

Glow

Filter intensity

Geometry shall remain unchanged.

---

# 9. Future Expansion

The architecture supports future renderers.

Examples

OLED Renderer

LCD Renderer

14 Segment Renderer

Matrix Display Renderer

No modifications shall be required to existing renderer layers.

---

# 10. Directory Structure

Recommended structure.

src/

renderers/

SevenSegmentRenderer.js

docs/

renderer/

MasterDigitSpecification.md

RendererArchitecture.md

RendererRoadmap.md

RendererChangeLog.md

---

# 11. Design Rules

Renderer code shall

✓ Be data driven

✓ Separate geometry from rendering

✓ Avoid duplicated geometry

✓ Avoid duplicated colours

✓ Avoid UI dependencies

✓ Support future themes

✓ Support future renderers

---

# 12. Version Strategy

Renderer Version

Independent from project version.

Example

Renderer v1.0

Approved Geometry

Renderer v1.1

Brightness

Renderer v1.2

Glow

Renderer v2.0

Multiple renderer support

---

# Revision History

| Version   | Date | Description                   |
| --------- | ---- | ----------------------------- |
| 1.0 Draft | 2026 | Initial Renderer Architecture |

---

**Project**

C3G – Cockpit Component Code Generator

**Subsystem**

Seven Segment SVG Renderer

**Document**

Renderer Architecture

**Status**

Draft
