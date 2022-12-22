// -__________variable declaration start__________
let animationFrame = null;
let canvas = document.getElementById("canvas");
let c = canvas.getContext("2d");
let gridCount, gridSize;
let openList, closedList;
let nodes, startNode, endNode, currentNode;
let blockProbability = 0;
let isManhattan;
let startStopClickCount = 0;
let looping = 0;
let alreadyFound = false;
// -__________variable declaration end__________

//-__________event handling start___________

let stopFrame = () => cancelAnimationFrame(animationFrame);

document.getElementById("start_button").onclick = function () {
  if (!alreadyFound) draw();
  else alert("Puzzle is already solved!");
};
document.getElementById("stop_button").onclick = stopFrame;
document.getElementById("restart_button").onclick = reset;

document.getElementById("choose_start_stop").onclick = function () {
  reset();
  // -reset startNode and endNode
  startNode.show("WHITESMOKE");
  endNode.show("WHITESMOKE");

  alert("Click on the cell to define start(red) and end(blue) node!");
  canvas.addEventListener("click", chooseStartEnd);
};
document.getElementById("manhattan_distance").onclick = () => {
  isManhattan = true;
};
document.getElementById("euclidean_distance").onclick = () => {
  isManhattan = false;
};

document.getElementById("wall_threshold").onchange = reset;
document.getElementById("grid_count").onchange = reset;

//-__________event handling end___________

// -function to reset all the variable
function reset() {
  // -stop the draw loop
  stopFrame();

  openList = [];
  closedList = [];
  startStopClickCount = 0;
  alreadyFound = false;
  isManhattan = document.getElementById("manhattan_distance").checked;
  gridCount = parseInt(document.getElementById("grid_count").value);
  gridSize = canvas.width / gridCount;
  blockProbability =
    parseInt(document.getElementById("wall_threshold").value) / 100;
  // -create two dimensional nodes array
  nodes = new Array(gridCount);
  for (let i = 0; i < gridCount; i++) {
    nodes[i] = new Array(gridCount);
    for (let j = 0; j < gridCount; j++) {
      nodes[i][j] = new Node(i, j, blockProbability);
    }
  }

  // -set start and end nodes
  startNode = nodes[0][0];
  endNode = nodes[gridCount - 1][gridCount - 1];

  // -make sure startNode and endNode are not wall
  startNode.wall = false;
  endNode.wall = false;

  // -assign currentNode as the start node
  currentNode = startNode;

  // -first add the startNode to the to-search list
  openList.push(currentNode);

  // -display all the grids
  for (let i = 0; i < gridCount; i++) {
    for (let j = 0; j < gridCount; j++) {
      nodes[i][j].show("WHITESMOKE");
    }
  }

  // -show startNode & endNode
  startNode.show("RED");
  endNode.show("LIME");

  // -reset looping to 0
  document.getElementById("looping_count").innerHTML = 0;

  // -choosing mode off
  canvas.removeEventListener("click", chooseStartEnd);
}

// -function to draw canvas continueously
function draw() {
  ++looping;
  // console.log("Looping: " + looping);
  document.getElementById("looping_count").innerHTML = looping;

  // -clear the screen
  c.clearRect(0, 0, canvas.width, canvas.height);

  // -display all nodes
  for (let i = 0; i < gridCount; i++) {
    for (let j = 0; j < gridCount; j++) {
      nodes[i][j].show("WHITESMOKE");
    }
  }

  // -______algorithms start______
  if (openList.length > 0) {
    // -find the node with lowest cost(f)
    let minIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[minIndex].f) {
        minIndex = i;
      }
    }
    // -set the currentNode as the node with lowest cost
    currentNode = openList[minIndex];

    // -remove the first node from the to-search list
    openList.splice(minIndex, 1);

    // -mark the first node as already-searched node
    closedList.push(currentNode);

    //  -display openList (yellow)
    // openList.forEach((elt) => elt.show("YELLOW"));

    //  -display closedList (gray)
    closedList.forEach((elt) => elt.show("#C8C8C8"));

    // -show the path from the startNode to currentNode (BLUE)
    let currentPath = [];
    let currentTempNode = currentNode;
    currentPath.push(currentTempNode);
    while (currentTempNode.parent != null) {
      currentPath.push(currentTempNode.parent);
      currentTempNode = currentTempNode.parent;
    }
    currentPath.forEach((elt) => elt.show("#0064FF"));

    // -show startNode and endNode
    startNode.show("RED");
    endNode.show("LIME");

    // -if currentNode is the goal, then stop the loop
    if (currentNode.isSame(endNode)) {
      console.log("Found.");

      alreadyFound = true;
      console.log(currentPath);
      return;
    }

    // -add the next possible nodes from the current node
    currentNode.getNeighbours(nodes);

    for (let i = 0; i < currentNode.neighbours.length; i++) {
      // -get the first child of current node
      const neighbour = currentNode.neighbours[i];

      // -if the new child node is neithor in the already-searched list nor to-search list nor it is wall,
      // -then add the new child to to-search list
      if (
        !neighbour.isContain(closedList) &&
        !neighbour.isContain(openList) &&
        !neighbour.wall
      ) {
        // -update g value
        // -neighbour nodes are one step far from parent node
        neighbour.g = currentNode.g + 1;
        // -set the currentNode as parent of neighbour nodes
        neighbour.parent = currentNode;

        // -predict total step to goal (h)
        neighbour.h = heuristic(neighbour, endNode);
        // -f=g+h
        neighbour.f = neighbour.g + neighbour.h;

        openList.push(neighbour);
      }
    }
  } else {
    console.log("No solution.");
    alert("There is no solution! Please restart!");
    return;
  }
  // -______algorithms end______

  // -restart animation loop
  animationFrame = requestAnimationFrame(draw);
}

// -function to choose start and end node by user
function chooseStartEnd(e) {
  // -increase count by one when the canvas is clicked
  startStopClickCount += 1;

  // -if 2 clicks has been made, then remove the click event (assumed already chosen start & end nodes)
  if (startStopClickCount > 2) {
    this.removeEventListener("click", chooseStartEnd);
    return;
  }

  // -get the mouse coordinates relative to canvas
  let rect = e.target.getBoundingClientRect();
  let mouseX = e.clientX - Math.round(rect.left);
  let mouseY = e.clientY - Math.round(rect.top);

  // -get grid x,y position from mouse coordinate values
  gridPosX = Math.floor(mouseX / gridSize);
  gridPosY = Math.floor(mouseY / gridSize);

  // -choosing the start node
  if (startStopClickCount == 1) {
    startNode = nodes[gridPosX][gridPosY];
    c.fillStyle = "RED";
    c.fillRect(gridPosX * gridSize, gridPosY * gridSize, gridSize, gridSize);
  }

  // -choosing the end node
  if (startStopClickCount == 2) {
    endNode = nodes[gridPosX][gridPosY];
    c.fillStyle = "LIME";
    c.fillRect(gridPosX * gridSize, gridPosY * gridSize, gridSize, gridSize);
  }

  openList = [];

  // -add startNode to openList
  openList.push(startNode);
}

// -function to predict how many steps far to the goal
function heuristic(a, b) {
  // -calculated by manhattan distance
  if (isManhattan) return Math.abs(a.x - b.y) + Math.abs(a.y - b.y);
  // -calculated by direct distance
  let dx = Math.abs(a.x - b.x);
  let dy = Math.abs(a.y - b.y);
  return Math.sqrt(dx * dx + dy * dy);
}

reset();
