// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Input from '../Input.vue'

describe('Input', () => {
  it('渲染标签并关联输入框', () => {
    const wrapper = mount(Input, {
      props: { modelValue: '', label: '用户名', id: 'user-name' },
    })

    const label = wrapper.find('label')
    expect(label.text()).toBe('用户名')
    expect(label.attributes('for')).toBe('user-name')
    expect(wrapper.find('input').attributes('id')).toBe('user-name')
  })

  it('未传入 id 时自动生成稳定 id', () => {
    const wrapper = mount(Input, {
      props: { modelValue: '', label: '邮箱' },
    })

    const inputId = wrapper.find('input').attributes('id')
    expect(inputId).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(inputId)
  })

  it('输入时更新 v-model', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: '' },
    })

    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['hello'])
  })

  it('渲染错误信息并应用错误样式', () => {
    const wrapper = mount(Input, {
      props: { modelValue: '', error: '不能为空' },
    })

    expect(wrapper.text()).toContain('不能为空')
    expect(wrapper.find('input').classes()).toContain('border-red-500')
  })

  it('无错误时使用默认样式', () => {
    const wrapper = mount(Input, {
      props: { modelValue: '' },
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('border-slate-300')
    expect(input.classes()).not.toContain('border-red-500')
  })
})
