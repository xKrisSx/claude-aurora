import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'aurora',
  component: 'AbovePrompt',
  requestId: 'band',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 12,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 12 },
    view: {},
  },
} as const

test('the terminal draws a sky band; the apps leave it to the engine', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })

  const term = await $.ui.mount({ ...BAND, surface: 'terminal' })
  const sky = await term.find({ type: 'Raster' })
  expect(sky?.props.columns).toBe(80)
  expect(sky?.props.rows).toBe(5)
  await term.unmount()

  const desk = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await desk.find({ type: 'Text' }))?.text).toBe('engine')
  await desk.unmount()
})

const run = (args: string) =>
  ({ command: 'aurora', args, origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 80 } }) as const

test('/aurora band switches the band off and on, and remembers it', async ($, on) => {
  const saved: Record<string, unknown> = {}
  on('command.register', () => ({ value: { command: 'aurora' } }))
  on('store.set', (_, e) => {
    saved[e.key] = e.value
    return { value: undefined }
  })
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })

  const off = await $.command.run(run('band off'))
  expect(off.text).toBe('Terminal band: off')
  expect(saved.band).toBe('off')

  const term = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await term.find({ type: 'Text' }))?.text).toBe('engine')
  await term.unmount()

  const back = await $.command.run(run('band on'))
  expect(back.text).toBe('Terminal band: on')
  const again = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await again.find({ type: 'Raster' }))?.props.rows).toBe(5)
  await again.unmount()

  const wrong = await $.command.run(run('band loud'))
  expect(wrong.text).toBe('Unknown band mode "loud". Use on, still or off')
})
