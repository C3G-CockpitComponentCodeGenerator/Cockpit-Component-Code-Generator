import { ExpansionManager } from "./ExpansionManager";

const manager = new ExpansionManager();

manager.addMCP23017();
manager.addMCP23017();
manager.addMCP23017();

console.log(
    manager.getDevices()
);