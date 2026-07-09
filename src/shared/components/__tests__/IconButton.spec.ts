// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IconButton from '../IconButton.vue'

describe('IconButton', () => {
  it('渲染默认状态的按钮', () => {
    const wrapper = mount(IconButton, {
      props: { label: '设置' },
      slots: { default: '<span data-testid="icon">⚙</span>' },
    })

    expect(wrapper.text()).toContain('设置')
    expect(wrapper.find('button').attributes('aria-label')).toBe('设置')
    expect(wrapper.find('button').classes()).toContain('text-slate-600')
  })

  it('active 状态应用对应样式', () => {
    const wrapper = mount(IconButton, {
      props: { label: '已选', active: true },
    })

    expect(wrapper.find('button').classes()).toContain('bg-primary-100')
    expect(wrapper.find('button').classes()).toContain('text-primary-700')
  })

  it('danger 状态应用对应样式', () => {
    const wrapper = mount(IconButton, {
      props: { label: '删除', danger: true },
    })

    expect(wrapper.find('button').classes()).toContain('text-red-600')
    expect(wrapper.find('button').classes()).toContain('hover:bg-red-50')
  })

  it('danger 与 active 同时存在时 danger 优先', () => {
    const wrapper = mount(IconButton, {
      props: { label: '危险且激活', active: true, danger: true },
    })

    expect(wrapper.find('button').classes()).toContain('text-red-600')
    expect(wrapper.find('button').classes()).not.toContain('bg-primary-100')
  })

  it('点击触发 click 事件', async () => {
    const wrapper = mount(IconButton, {
      props: { label: '点击' },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
