// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Modal from '../Modal.vue'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

describe('Modal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('open=true 时渲染标题与默认插槽内容', async () => {
    mount(Modal, {
      attachTo: document.body,
      global: { stubs: { transition: false } },
      props: { open: true, title: '确认删除' },
      slots: { default: '<button>确定要删除该会议吗？</button>' },
    })
    await nextTick()

    expect(document.body.textContent).toContain('确认删除')
    expect(document.body.textContent).toContain('确定要删除该会议吗？')
  })

  it('未传入 title 时渲染默认的隐藏标题', async () => {
    mount(Modal, {
      attachTo: document.body,
      global: { stubs: { transition: false } },
      props: { open: true },
      slots: { default: '<button>内容</button>' },
    })
    await nextTick()

    expect(document.body.textContent).toContain('弹窗')
  })

  it('点击遮罩层触发 close 事件', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      global: { stubs: { transition: false } },
      props: { open: true, title: '提示' },
      slots: { default: '<button>内容</button>' },
    })
    await nextTick()

    const overlay = document.body.querySelector('[class*="bg-black/50"]') as HTMLElement | null
    expect(overlay).not.toBeNull()
    overlay!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    overlay!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('按下 Escape 键触发 close 事件', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      global: { stubs: { transition: false } },
      props: { open: true, title: '提示' },
      slots: { default: '<button>内容</button>' },
    })
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('传入 footer 插槽时渲染底部区域', async () => {
    mount(Modal, {
      attachTo: document.body,
      global: { stubs: { transition: false } },
      props: { open: true, title: '提示' },
      slots: {
        default: '<button>内容</button>',
        footer: '<button>确认</button>',
      },
    })
    await nextTick()

    const panelButtons = document.body.querySelector('[role="dialog"]')?.querySelectorAll('button') ?? []
    expect(panelButtons.length).toBe(2)
    expect(document.body.textContent).toContain('确认')
  })
})
