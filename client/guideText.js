const c1 = document.getElementById('navGuideCanvas');
const c2 = document.getElementById('editGuideCanvas');
const navGuideCanvas = document.getElementById('navGuideCanvas').getContext('2d');
const editGuideCanvas = document.getElementById('editGuideCanvas').getContext('2d');
navGuideCanvas.fillStyle = 'rgb(30, 30, 30)';
editGuideCanvas.fillStyle = 'rgb(30, 30, 30)';
navGuideCanvas.fillRect(0, 0, c1.width, c2.height);
editGuideCanvas.fillRect(0, 0, c2.width, c2.height);
navGuideCanvas.fillStyle = 'rgb(250, 250, 250)';
editGuideCanvas.fillStyle = 'rgb(250, 250, 250)';

navGuideCanvas.font = "20px sans-serif";
navGuideCanvas.fillText("Move/Navigate Keys:", 5, 25);
navGuideCanvas.font = "16px sans-serif";
navGuideCanvas.fillText("W: Jump  |  Q: Potion", 5, 50);
navGuideCanvas.fillText("A: Left  |  E: Use-Item", 5, 75);
navGuideCanvas.fillText("D: Right", 5, 100);
navGuideCanvas.fillText("Space: Attack", 5, 125);
navGuideCanvas.fillText("ESC: Return", 5, 150);
editGuideCanvas.font = "20px sans-serif";
editGuideCanvas.fillText("Level Editor Keys:", 5, 20);
editGuideCanvas.font = "16px sans-serif";
editGuideCanvas.fillText("G: Toggle Tile-Grid", 5, 50);
editGuideCanvas.fillText("B: Cylce Backgrounds", 5, 75);
editGuideCanvas.fillText("T: Tile insert", 5, 100);
editGuideCanvas.fillText("N: NPC insert", 5, 125);
editGuideCanvas.fillText("Y: Decoration insert", 5, 150);
editGuideCanvas.fillText("I: Item insert", 5, 175);
editGuideCanvas.font = "18px sans-serif";
editGuideCanvas.fillText("While Dragging: ", 5, 200);
editGuideCanvas.font = "16px sans-serif";
editGuideCanvas.fillText("Cycle Animations: -/+", 5, 225);
editGuideCanvas.fillText("DEL: Delete the entity", 5, 250);
editGuideCanvas.fillText("CTRL+Enter: Save&Exit", 5, 275);
editGuideCanvas.fillText("ESC: exit", 5, 300);
editGuideCanvas.fillText("Mouse1: Drag/Drop entity", 5, 325);