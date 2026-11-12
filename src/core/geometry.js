export function rotate(cells) {
  const maxRow = Math.max(...cells.map(([r]) => r));
  return cells.map(([r, c]) => [c, maxRow - r]);
}

export function shapeKey(cells) {
  const keys = [];
  for (let turn = 0; turn < 4; turn++) {
    const minRow = Math.min(...cells.map(([r]) => r));
    const minColumn = Math.min(...cells.map(([, c]) => c));
    cells = cells.map(([r, c]) => [r - minRow, c - minColumn]);
    keys.push(cells.map(cell => cell.join(',')).sort().join(';'));
    cells = rotate(cells);
  }
  return keys.sort()[0];
}

export function fits(board, cells, row, column) {
  return cells.every(([dr, dc]) => {
    const r = row + dr;
    const c = column + dc;
    return r >= 0 && c >= 0 && r < board.length && c < board.length && !board[r][c];
  });
}

export function canFit(board, cells) {
  for (let turn = 0; turn < 4; turn++) {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board.length; c++) {
        if (fits(board, cells, r, c)) return true;
      }
    }
    cells = rotate(cells);
  }
  return false;
}

export function rotatePieces(tray, selected = -1, direction = 1) {
  const pieces = selected < 0 ? tray.filter(Boolean) : [tray[selected]].filter(Boolean);
  for (const piece of pieces) {
    for (let turn = 0; turn < (direction < 0 ? 3 : 1); turn++) {
      piece.cells = rotate(piece.cells);
    }
  }
}

// Flood-fill empty space from outside the shape; any unreachable gap is a hole.
export function hasEnclosedHole(cells) {
  const height = Math.max(...cells.map(([r]) => r)) + 3;
  const width = Math.max(...cells.map(([, c]) => c)) + 3;
  const occupied = new Set(cells.map(([r, c]) => `${r + 1},${c + 1}`));
  const visited = new Set(['0,0']);
  const queue = [[0, 0]];
  for (let index = 0; index < queue.length; index++) {
    const [r, c] = queue[index];
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      const key = `${nr},${nc}`;
      if (nr < 0 || nc < 0 || nr >= height || nc >= width || occupied.has(key) || visited.has(key)) continue;
      visited.add(key);
      queue.push([nr, nc]);
    }
  }
  return visited.size + occupied.size < width * height;
}
