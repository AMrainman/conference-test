// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Button from '../Button.vue'

describe('Button', () => {
  it('渲染默认 primary 按钮', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('bg-primary')
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

  it('danger 变体应用对应的背景色类', () => {
    const wrapper = mount(Button, {
      props: { variant: 'danger' },
      slots: { default: 'Delete' },
    })
    expect(wrapper.classes()).toContain('bg-danger')
  })

  it('lg 尺寸应用对应的内边距类', () => {
    const wrapper = mount(Button, {
      props: { size: 'lg' },
      slots: { default: 'Large' },
    })
    expect(wrapper.classes()).toContain('px-6')
  })

  it('支持设置 submit 类型', () => {
    const wrapper = mount(Button, {
      props: { type: 'submit' },
      slots: { default: 'Submit' },
    })
    expect(wrapper.find('button').attributes('type')).toBe('submit')
  })
})
