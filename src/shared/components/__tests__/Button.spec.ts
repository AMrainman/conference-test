// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Button from '../Button.vue'

describe('Button', () => {
  it('渲染默认 primary 按钮', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('bg-primary-600')
  })

  it('点击触发 click 事件', async () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('disabled 时不可点击', async () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
