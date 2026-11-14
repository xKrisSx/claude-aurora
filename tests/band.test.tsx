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
