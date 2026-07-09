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
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/a.jpg')
    expect(img.attributes('alt')).toBe('张三')
  })

  it('图片加载失败时回退到姓名首字母', async () => {
    const wrapper = mount(Avatar, { props: { name: 'Li Ming', src: 'https://example.com/broken.jpg' } })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('LM')
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

  it('单字/单词姓名取前两个字符', () => {
    const wrapper = mount(Avatar, { props: { name: '张三' } })
    expect(wrapper.text()).toBe('张三')
  })

  it.each([
    { src: 'https://example.com/a.jpg', expected: true, desc: '' },
    { src: 'http://example.com/a.jpg', expected: true, desc: '' },
    { src: '/avatar.jpg', expected: true, desc: '' },
    { src: 'data:image/png;base64,abc', expected: true, desc: '' },
    { src: 'javascript:alert(1)', expected: false, desc: '不' },
    { src: '//evil.com/avatar.jpg', expected: false, desc: '不' },
    { src: 'vbscript:msgbox(1)', expected: false, desc: '不' },
  ])('当 src 为 "$src" 时$desc渲染头像图片', ({ src, expected }) => {
    const wrapper = mount(Avatar, { props: { name: '张三', src } })
    expect(wrapper.find('img').exists()).toBe(expected)
    if (!expected) {
      expect(wrapper.text()).toBe('张三')
    }
  })
})
