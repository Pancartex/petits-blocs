import { shapeKey } from './geometry.js';

// Keep each shape and its family together. # is occupied; . is empty.
// Reflections are separate shapes; rotations share the same canonical key.
const definitions = [
  { family: 'dot', pattern: ["#"] },
  { family: 'bar', pattern: ["##"] },
  { family: 'bar', pattern: ["###"] },
  { family: 'bar', pattern: ["####"] },
  { family: 'bar', pattern: ["#####"] },
  { family: 'box', pattern: ["##","##"] },
  { family: 'corner', pattern: ["#.","#.","##"] },
  { family: 'corner', pattern: [".#",".#","##"] },
  { family: 'tee', pattern: ["###",".#."] },
  { family: 'zigzag', pattern: [".##","##."] },
  { family: 'zigzag', pattern: ["##.",".##"] },
  { family: 'corner', pattern: ["#.","##"] },
  { family: 'box', pattern: ["###","###"] },
  { family: 'box', pattern: ["###","###","###"] },
  { family: 'tee', pattern: ["###",".#.",".#."] },
  { family: 'cup', pattern: ["#.#","###"] },
  { family: 'corner', pattern: ["#..","#..","###"] },
  { family: 'zigzag', pattern: ["#..","##.",".##"] },
  { family: 'cross', pattern: [".#.","###",".#."] },
  { family: 'branch', pattern: ["#.","##","#.","#."] },
  { family: 'branch', pattern: [".#","##",".#",".#"] },
  { family: 'fork', pattern: [".##","##.",".#."] },
  { family: 'fork', pattern: ["##.",".##",".#."] },
  { family: 'compact', pattern: ["##","##","#."] },
  { family: 'compact', pattern: ["##","##",".#"] },
  { family: 'zigzag', pattern: ["##..",".###"] },
  { family: 'zigzag', pattern: ["..##","###."] },
  { family: 'corner', pattern: ["#.","#.","#.","##"] },
  { family: 'corner', pattern: [".#",".#",".#","##"] },
  { family: 'ring', pattern: ["###","#.#","###"] },
  { family: 'fork', pattern: ["#.#","###","#.#"] },
  { family: 'tee', pattern: ["####",".#..",".#.."] },
  { family: 'cup', pattern: ["#..#","####"] },
  { family: 'zigzag', pattern: ["##..",".##.","..##"] },
  { family: 'zigzag', pattern: ["###.","..#.","..##","...#"] },
  { family: 'compact', pattern: ["###","##.","#.."] },
  { family: 'cup', pattern: ["#.#","#.#","###"] },
  { family: 'cup', pattern: ["###","#..","##."] },
  { family: 'cross', pattern: [".#..","####","..#."] },
  { family: 'compact', pattern: [".##.","####"] },
  { family: 'compact', pattern: [".##","###","##."] },
  { family: 'compact', pattern: ["##..","###.","..##"] },
  { family: 'fork', pattern: ["#.#","###",".#."] },
  { family: 'cross', pattern: [".#.","###",".#.",".#."] },
];

export const catalog = definitions.map(({ family, pattern }) => {
  const cells = pattern.flatMap((row, r) =>
    [...row].flatMap((cell, c) => cell === '#' ? [[r, c]] : []));
  return { family, cells, key: shapeKey(cells) };
});
export const shapeCount = catalog.length;
