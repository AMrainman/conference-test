// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Avatar from '../Avatar.vue'

describe('Avatar', () => {
  it('无头像时显示姓名首字母', () => {
    const wrapper = mount(Avatar, { props: { name: 'Li Ming' } })
    expect(wrapper.text()).toBe('LM')
  })

  it('有头像时渲染 img', () => {
    const wrapper = mount(Avatar, { props: { name: '张三', src: 'https://example.com/a.jpg' } })
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('alt')).toBe('张三')
  })

  it.each([
    ['sm', ['h-8', 'w-8', 'text-xs']],
    ['md', ['h-10', 'w-10', 'text-sm']],
    ['lg', ['h-14', 'w-14', 'text-lg']],
  ] as const)('size=%s 时应用对应尺寸类', (size, classes) => {
    const wrapper = mount(Avatar, { props: { name: 'Test', size } })
    for (const cls of classes) {
      expect(wrapper.classes()).toContain(cls)
    }
  })

  it('空姓名时回退为空字符串', () => {
    const wrapper = mount(Avatar, { props: { name: '' } })
    expect(wrapper.text()).toBe('')
  })

  it('单字/单词姓名取前两个字符大写', () => {
    const wrapper = mount(Avatar, { props: { name: '张三' } })
    expect(wrapper.text()).toBe('张三')
  })
})
