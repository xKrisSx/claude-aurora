import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { PALETTES, sceneFor } from './palettes'

/** How often the aurora changes colour on its own. */
const ROTATE_MS = 20 * 60 * 1000

// Near-black night: neutral surfaces with only a breath of cool blue.
const { theme, problems } = makeColors({
  label: 'Aurora',
  only: 'dark',
  roles: { accent: '#3ee0a8', danger: '#f0607a', success: '#7fe08a', warning: '#f2c25b', pro: '#a98bff' },
  codeTheme: { dark: 'nord' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#07080b',
        'surface-1': '#0c0e12',
        'surface-2': '#111318',
        'surface-3': '#16191f',
        'text-primary': '#eceef2',
        'text-secondary': '#bfc4cd',
        'text-muted': '#9198a4',
      },
    },
  },
})

let current = ''

function pickOther(): string {
  const others = PALETTES.filter(p => p.id !== current)
  const [n] = crypto.getRandomValues(new Uint32Array(1))
  return others[(n ?? 0) % others.length]!.id
}

async function show($: EngineInterface, id: string) {
  current = id
  const look: ThemeSetArgs = {
    colors: theme,
    overrideColorScheme: 'dark',
    backdrop: { scene: `aurora-${id}`, glass: { blur: 18, tint: '#07080b', opacity: 0.62 } },
  }
  return $.theme.set(look)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await $.command.register({
      name: 'aurora',
      description: 'Change the aurora colours: /aurora (random) or /aurora <name>',
    })
    const set = await show($, pickOther())

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    $.clock.every(ROTATE_MS, () => void show($, pickOther()))

    return next(e)
  })

  on('command.run', { command: 'aurora' }, async ($, e) => {
    const wanted = e.args.trim().toLowerCase()
    const list = PALETTES.map(p => p.id).join(', ')

    if (wanted !== '' && !PALETTES.some(p => p.id === wanted)) {
      return { text: `Unknown aurora "${wanted}". Available: ${list}` }
    }
    const id = wanted === '' ? pickOther() : wanted
    await show($, id)
    const name = PALETTES.find(p => p.id === id)!.name

    return { text: `Aurora: ${name}. Available: ${list}` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    const id = e.props.scene.startsWith('aurora-') ? e.props.scene.slice('aurora-'.length) : ''

    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || !PALETTES.some(p => p.id === id)) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={sceneFor(id)} alt="Northern lights over misty mountains under a starry sky" isInteractive />
  })
}
