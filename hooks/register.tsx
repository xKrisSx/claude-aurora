import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { BAND_ROWS, frame } from './band'
import { PALETTES, sceneFor } from './palettes'

/** How often the aurora changes colour on its own. */
const ROTATE_MS = 20 * 60 * 1000

/** One frame of the terminal band while it moves (4 frames a second). */
const FRAME_MS = 250

/** How much the aurora fades in or out per frame: 0 to full in about a second. */
const FADE_STEP = 0.25

/**
 * The terminal band's mode, kept across sessions:
 * on = the aurora rises while Claude works and fades to a still night sky when it stops,
 * still = a still sky with the aurora always up, off = no band.
 */
type BandMode = 'on' | 'still' | 'off'
const BAND_MODES: BandMode[] = ['on', 'still', 'off']

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

// The terminal band. It only draws when something changed: while the aurora
// is up or fading, or once after a palette change, resize or mode change.
let band: { requestId: string; columns: number; isCollapsed: boolean } | undefined
let mode: BandMode = 'on'
let isWorking = false
let level = 0     // aurora strength, 0 = gone, 1 = full
let clock = 0     // the band's own time in seconds, frozen while the sky is still
let isDirty = true

const palette = () => PALETTES.find(p => p.id === current) ?? PALETTES[0]!
const shownLevel = () => (mode === 'still' ? 1 : level)

function pickOther(): string {
  const others = PALETTES.filter(p => p.id !== current)
  const [n] = crypto.getRandomValues(new Uint32Array(1))
  return others[(n ?? 0) % others.length]!.id
}

async function show($: EngineInterface, id: string) {
  current = id
  isDirty = true
  const look: ThemeSetArgs = {
    colors: theme,
    overrideColorScheme: 'dark',
    backdrop: { scene: `aurora-${id}`, glass: { blur: 18, tint: '#07080b', opacity: 0.62 } },
  }
  return $.theme.set(look)
}

/** One tick of the band: fade toward the target and repaint only if needed. */
function tick($: EngineInterface) {
  if (band === undefined || band.isCollapsed || mode === 'off') return

  if (mode === 'on') {
    const target = isWorking ? 1 : 0
    if (level !== target) {
      level = target > level ? Math.min(1, level + FADE_STEP) : Math.max(0, level - FADE_STEP)
      isDirty = true
    }
    if (level > 0) {
      clock += FRAME_MS / 1000
      isDirty = true
    }
  }
  if (!isDirty) return

  isDirty = false
  const { requestId, columns } = band
  void $.ui.blit({ requestId, key: 'sky', columns, rows: BAND_ROWS, cells: frame(columns, clock, shownLevel(), palette()) })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const stored = await $.store.get('band')
    if (BAND_MODES.includes(stored as BandMode)) mode = stored as BandMode

    await $.command.register({
      name: 'aurora',
      description: 'Aurora colours: /aurora, /aurora <name>; terminal band: /aurora band on|still|off',
    })
    // A surface that attaches later (the app, or a phone over Remote Control)
    // draws the theme then, so a terminal start is no cause for a message.
    await show($, pickOther())
    $.clock.every(ROTATE_MS, () => {
      void show($, pickOther())
    })
    $.clock.every(FRAME_MS, () => tick($))

    return next(e)
  })

  on('turn.start', ($, e, next) => {
    isWorking = true
    return next(e)
  })

  on('turn.complete', ($, e, next) => {
    isWorking = false
    return next(e)
  })

  on('turn.abort', ($, e, next) => {
    isWorking = false
    return next(e)
  })

  on('command.run', { command: 'aurora' }, async ($, e) => {
    const [first = '', second = ''] = e.args.trim().toLowerCase().split(/\s+/)
    const list = PALETTES.map(p => p.id).join(', ')

    if (first === 'band') {
      if (second === '') return { text: `Terminal band: ${mode}. Use /aurora band on|still|off` }
      if (!BAND_MODES.includes(second as BandMode)) return { text: `Unknown band mode "${second}". Use on, still or off` }

      mode = second as BandMode
      isDirty = true
      await $.store.set('band', mode)
      $.ui.invalidate('ui.render')

      return { text: `Terminal band: ${mode}` }
    }
    if (first !== '' && !PALETTES.some(p => p.id === first)) {
      return { text: `Unknown aurora "${first}". Available: ${list}` }
    }
    const id = first === '' ? pickOther() : first
    await show($, id)
    const name = PALETTES.find(p => p.id === id)!.name

    return { text: `Aurora: ${name}. Available: ${list}` }
  })

  // In the terminal, where no backdrop draws: a night sky above the prompt.
  on('ui.render', { component: 'AbovePrompt' }, ($, e, next) => {
    if (e.surface !== 'terminal' || e.props.hasSurvey || mode === 'off') {
      band = undefined
      return next(e)
    }
    const { Raster } = $.ui.resolve(e)
    const columns = Math.max(1, Math.min(512, e.props.bodyColumns))
    band = { requestId: e.requestId, columns, isCollapsed: e.props.isCollapsed }
    isDirty = false

    return <Raster key="sky" columns={columns} rows={BAND_ROWS} cells={frame(columns, clock, shownLevel(), palette())} />
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
