import { isMobile } from './util'

/**
 * Active sidebar when scroll
 * @link https://buble.surge.sh/
 */
export function scrollActiveSidebar () {
  if (isMobile()) return

  const anchors = document.querySelectorAll('.anchor')
  const nav = {}
  const lis = document.querySelectorAll('.sidebar li')
  let active = null

  for (let i = 0, len = lis.length; i < len; i += 1) {
    const li = lis[i]
    let href = li.querySelector('a').getAttribute('href')

    if (href !== '/') href = href.match(/#([^#]+)$/g)[0].slice(1)

    nav[decodeURIComponent(href)] = li
  }

  function highlight () {
    for (let i = 0, len = anchors.length; i < len; i += 1) {
      const node = anchors[i]
      const bcr = node.getBoundingClientRect()

      if (bcr.top < 10 && bcr.bottom > 10) {
        const li = nav[node.getAttribute('data-id')]

        if (!li || li === active) return
        if (active) active.setAttribute('class', '')

        li.setAttribute('class', 'active')
        active = li

        return
      }
    }
  }

  window.removeEventListener('scroll', highlight)
  window.addEventListener('scroll', highlight)
  highlight()
}

export function scrollIntoView () {
  const id = window.location.hash.match(/#[^#\/]+$/g)
  if (!id || !id.length) return
  const section = document.querySelector(decodeURIComponent(id[0]))

  if (section) section.scrollIntoView()
}

/**
 * Acitve link
 */
export function activeLink (dom, activeParent) {
  const host = window.location.href

  dom = typeof dom === 'object' ? dom : document.querySelector(dom)
  if (!dom) return

  ;[].slice.call(dom.querySelectorAll('a')).forEach(node => {
    if (node.href === host) {
      activeParent
        ? node.parentNode.setAttribute('class', 'active')
        : node.setAttribute('class', 'active')
    } else {
      activeParent
        ? node.parentNode.removeAttribute('class')
        : node.removeAttribute('class')
    }
  })
}

/**
 * sidebar toggle
 */
export function bindToggle (dom) {
  dom = typeof dom === 'object' ? dom : document.querySelector(dom)
  if (!dom) return
  const body = document.body

  dom.addEventListener('click', () => body.classList.toggle('close'))

  if (!/mobile/i.test(navigator.userAgent)) return
  document.querySelector('aside').addEventListener('click', event => {
    body.classList.toggle('close')
  })
}

let cacheContentDOM
export function scroll2Top () {
  if (!cacheContentDOM) {
    const dom = isMobile() ? 'body' : 'section.content'
    cacheContentDOM = document.querySelector(dom)
  }
  cacheContentDOM.scrollTop = 0
}

export function sticky () {
  const dom = document.querySelector('section.cover')
  const coverHeight = dom.getBoundingClientRect().height

  return (function () {
    if (window.pageYOffset >= coverHeight || dom.classList.contains('hidden')) {
      document.body.classList.add('sticky')
    } else {
      document.body.classList.remove('sticky')
    }
  })()
}
