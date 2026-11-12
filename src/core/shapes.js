import { shapeKey } from './geometry.js';

// Base weight controls relative frequency; the dealer adjusts it for board fullness and the tray.
// Keep each shape, weight, and family together. # is occupied; . is empty.
// Reflections are separate shapes; rotations share the same canonical key.
const definitions = [
  { family: 'dot', weight: 1.5, pattern: ["#"] },
  { family: 'bar', weight: 1.2, pattern: ["##"] },
  { family: 'bar', weight: 1.1, pattern: ["###"] },
  { family: 'bar', weight: 1, pattern: ["####"] },
  { family: 'bar', weight: 0.8, pattern: ["#####"] },
  { family: 'box', weight: 1.1, pattern: ["##","##"] },
  { family: 'corner', weight: 1, pattern: ["#.","#.","##"] },
  { family: 'corner', weight: 1, pattern: [".#",".#","##"] },
  { family: 'tee', weight: 1, pattern: ["###",".#."] },
  { family: 'zigzag', weight: 1, pattern: [".##","##."] },
  { family: 'zigzag', weight: 1, pattern: ["##.",".##"] },
  { family: 'corner', weight: 1.2, pattern: ["#.","##"] },
  { family: 'box', weight: 0.7, pattern: ["###","###"] },
  { family: 'box', weight: 0.35, pattern: ["###","###","###"] },
  { family: 'tee', weight: 0.9, pattern: ["###",".#.",".#."] },
  { family: 'cup', weight: 0.9, pattern: ["#.#","###"] },
  { family: 'corner', weight: 0.85, pattern: ["#..","#..","###"] },
  { family: 'zigzag', weight: 0.85, pattern: ["#..","##.",".##"] },
  { family: 'cross', weight: 0.9, pattern: [".#.","###",".#."] },
  { family: 'branch', weight: 0.85, pattern: ["#.","##","#.","#."] },
  { family: 'branch', weight: 0.85, pattern: [".#","##",".#",".#"] },
  { family: 'fork', weight: 0.85, pattern: [".##","##.",".#."] },
  { family: 'fork', weight: 0.85, pattern: ["##.",".##",".#."] },
  { family: 'compact', weight: 0.95, pattern: ["##","##","#."] },
  { family: 'compact', weight: 0.95, pattern: ["##","##",".#"] },
  { family: 'zigzag', weight: 0.8, pattern: ["##..",".###"] },
  { family: 'zigzag', weight: 0.8, pattern: ["..##","###."] },
  { family: 'corner', weight: 0.8, pattern: ["#.","#.","#.","##"] },
  { family: 'corner', weight: 0.8, pattern: [".#",".#",".#","##"] },

  { family: 'fork', weight: 0.6, pattern: ["#.#","###","#.#"] },
  { family: 'tee', weight: 0.65, pattern: ["####",".#..",".#.."] },
  { family: 'cup', weight: 0.65, pattern: ["#..#","####"] },
  { family: 'zigzag', weight: 0.65, pattern: ["##..",".##.","..##"] },
  { family: 'zigzag', weight: 0.5, pattern: ["###.","..#.","..##","...#"] },
  { family: 'compact', weight: 0.7, pattern: ["###","##.","#.."] },
  { family: 'cup', weight: 0.55, pattern: ["#.#","#.#","###"] },
  { family: 'cup', weight: 0.65, pattern: ["###","#..","##."] },
  { family: 'cross', weight: 0.65, pattern: [".#..","####","..#."] },
  { family: 'compact', weight: 0.7, pattern: [".##.","####"] },
  { family: 'compact', weight: 0.55, pattern: [".##","###","##."] },
  { family: 'compact', weight: 0.5, pattern: ["##..","###.","..##"] },
  { family: 'fork', weight: 0.65, pattern: ["#.#","###",".#."] },
  { family: 'cross', weight: 0.65, pattern: [".#.","###",".#.",".#."] },
];

export const catalog = definitions.map(({ family, weight, pattern }) => {
  const cells = pattern.flatMap((row, r) =>
    [...row].flatMap((cell, c) => cell === '#' ? [[r, c]] : []));
  return { family, weight, cells, key: shapeKey(cells) };
});
export const shapeCount = catalog.length;
