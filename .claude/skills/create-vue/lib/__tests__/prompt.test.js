import { describe, it, expect } from 'vitest'
import { UI_LIBRARIES, ICON_LIBRARIES, DX_PLUGINS } from '../prompt.js'

describe('prompt choices', () => {
  it('UI_LIBRARIES includes null option', () => {
    expect(UI_LIBRARIES[0].value).toBeNull()
  })

  it('ICON_LIBRARIES are unchecked by default', () => {
    expect(ICON_LIBRARIES.every(c => c.checked === false)).toBe(true)
  })

  it('DX_PLUGINS are unchecked by default', () => {
    expect(DX_PLUGINS.every(c => c.checked === false)).toBe(true)
  })
})
