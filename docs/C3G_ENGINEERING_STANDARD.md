Rule 1

All internal board pin references must use canonical digital pin numbers. Human-readable labels (A0, A1, etc.) are presentation only and must be obtained through the board definition.

---

Rule 2 – Board Translation Authority

All board-specific pin translations must be performed through helper functions in boards.js. No other module may search or interpret analogPins directly.

---

Rule 3 – Resource Identifier Standard
Every connection inside C3G is represented as a Resource Identifier.
Examples: BOARD:54, MCP1:GPA0, SR165_1:Q5, MUX1:CH8

---

Rule 4 – Components Never Own Hardware

A component must never know:

Board
MCP23017
Shift Register
Multiplexer
ESP32 GPIO
RP2040 GPIO

A component only knows:

"I require one Digital Input."

or

"I require two Quadrature Inputs."

The allocator decides where those resources come from.

---

Rule 5 – Components Consume Capabilities, Not Pins

Instead of:

Axis
needs A0

think

Axis

requires

1 Analog Input Resource
