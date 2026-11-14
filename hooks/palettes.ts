import { SCENE_TEMPLATE } from './scene'

/** One aurora: the lower curtain (top → middle → bottom) and the back curtain (top → bottom). */
export type Palette = { id: string; name: string; a: [string, string, string]; b: [string, string] }

export const PALETTES: Palette[] = [
  { id: 'classic', name: 'Classic', a: ['#8a6bff', '#3ee0a8', '#2bd17f'], b: ['#c06bff', '#4de8c0'] },
  { id: 'fire', name: 'Fire', a: ['#ff3d6e', '#ff8a3d', '#ffc94d'], b: ['#b03dff', '#ff5a5a'] },
  { id: 'ice', name: 'Ice', a: ['#6f8cff', '#5fd4ff', '#c9f4ff'], b: ['#3d5bff', '#8fe9ff'] },
  { id: 'neon', name: 'Neon', a: ['#ff2fd0', '#22e6ff', '#3dffb5'], b: ['#7a2fff', '#ff4fb0'] },
  { id: 'cosmic', name: 'Cosmic', a: ['#5a2fff', '#c45cff', '#ffb36b'], b: ['#2f6bff', '#e85cff'] },
  { id: 'toxic', name: 'Toxic', a: ['#2fff8a', '#c8ff3d', '#fff06b'], b: ['#00c9a7', '#9dff3d'] },
  { id: 'blood', name: 'Blood', a: ['#ff2f5a', '#ff3d3d', '#ff9a8a'], b: ['#8a1fff', '#ff2f8a'] },
]

export function sceneFor(id: string): string {
  const p = PALETTES.find(one => one.id === id) ?? PALETTES[0]!
  return SCENE_TEMPLATE.replace(/%A(\d)%/g, (_, i: string) => p.a[Number(i)] ?? p.a[0])
    .replace(/%B(\d)%/g, (_, i: string) => p.b[Number(i)] ?? p.b[0])
}
