function Node(x, y, blockProbability) {
  this.x = x;
  this.y = y;
  this.neighbours = [];
  this.f = 9999;
  this.g = 0;
  this.h = 9999;
  this.parent = null;
  this.wall = false;

  // -set the node as the wall based on probability
  if (Math.random() < blockProbability) {
    this.wall = true;
  }

  // -function to show a grid
  this.show = function (color) {
    c.fillStyle = this.wall ? "BLACK" : color;
    c.strokeStyle = "BLACK";
    c.fillRect(this.x * gridSize, this.y * gridSize, gridSize, gridSize);
    c.strokeStyle = "BLACK";
    c.lineWidth = 0.2;
    c.strokeRect(this.x * gridSize, this.y * gridSize, gridSize, gridSize);
  };

  // -add the next possible nodes from this current node
  // -you can only move at most 4 moves
  this.getNeighbours = function (nodes) {
    // -right node
    if (this.x < gridCount - 1) {
      this.neighbours.push(nodes[this.x + 1][this.y]);
    }
    // -left node
    if (this.x > 0) {
      this.neighbours.push(nodes[this.x - 1][this.y]);
    }
    // -down node
    if (this.y < gridCount - 1) {
      this.neighbours.push(nodes[this.x][this.y + 1]);
    }
    // -up node
    if (this.y > 0) {
      this.neighbours.push(nodes[this.x][this.y - 1]);
    }
  };

  // -function to check if the two node are the same
  this.isSame = function (node) {
    if (this.x == node.x && this.y == node.y) {
      return true;
    }
    return false;
  };

  // -function to check if a node is already appeared in the list
  this.isContain = function (list) {
    for (let i = 0; i < list.length; i++) {
      // -if one of the node in the list matches with this node, then true
      if (this.isSame(list[i])) {
        return true;
      }
    }
    return false;
  };
}
