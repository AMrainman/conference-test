// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Avatar from '../Avatar.vue'

describe('Avatar', () => {
  it('无头像时显示姓名首字母', () => {
    const wrapper = mount(Avatar, { props: { name: '张三' } })
    expect(wrapper.text()).toBe('张三')
  })

  it('有头像时渲染 img', () => {
    const wrapper = mount(Avatar, { props: { name: '张三', src: 'https://example.com/a.jpg' } })
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('alt')).toBe('张三')
  })
})
