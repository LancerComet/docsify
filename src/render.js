import marked from 'marked'
import Prism from 'prismjs'
import * as tpl from './tpl'
import { activeLink, scrollActiveSidebar, bindToggle, scroll2Top, sticky } from './event'
import { genTree, getRoute, isMobile } from './util'

let OPTIONS = {}
const CACHE = {}

const renderTo = function (dom, content) {
  dom = typeof dom === 'object' ? dom : document.querySelector(dom)
  dom.innerHTML = content

  return dom
}
let toc = []
const renderer = new marked.Renderer()

/**
 * render anchor tag
 * @link https://github.com/chjj/marked#overriding-renderer-methods
 */
renderer.heading = function (text, level) {
  const slug = text.toLowerCase()
      .replace(/<(?:.|\n)*?>/gm, '')
      .replace(/[^\w|\u4e00-\u9fa5]+/g, '-')
  let route = ''

  if (OPTIONS.router) {
    route = `#/${getRoute()}`
  }

  toc.push({ level, slug: `${route}#${encodeURIComponent(slug)}`, title: text })

  return `<a href="${route}#${slug}" data-id="${slug}" class="anchor"><h${level} id="${slug}">${text}</h${level}></a>`
}
// highlight code
renderer.code = function (code, lang = '') {
  const hl = Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
    .replace(/{{/g, '<span>{{</span>')

  return `<pre data-lang="${lang}"><code class="lang-${lang}">${hl}</code></pre>`
}
renderer.link = function (href, title, text) {
  if (OPTIONS.router && !/^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(href)) {
    href = `#/${href}`.replace(/\/\//g, '/')
  }

  return `<a href="${href}" title="${title || ''}">${text}</a>`
}
marked.setOptions({ renderer })

/**
 * App
 */
export function renderApp (dom, replace) {
  const nav = document.querySelector('nav') || document.createElement('nav')

  if (!OPTIONS.repo) nav.classList.add('no-badge')

  dom[replace ? 'outerHTML' : 'innerHTML'] = tpl.corner(OPTIONS.repo) +
    (OPTIONS.coverpage ? tpl.cover() : '') +
    tpl.main(OPTIONS.sidebarToggle ? tpl.toggle() : '')
  document.body.insertBefore(nav, document.body.children[0])

  // bind toggle
  bindToggle('button.sidebar-toggle')
  // bind sticky effect
  if (OPTIONS.coverpage) {
    !isMobile() && window.addEventListener('scroll', sticky)
  } else {
    document.body.classList.add('sticky')
  }
}

/**
 * article
 */
export function renderArticle (content) {
  renderTo('article', content ? marked(content) : 'not found')
  if (!renderSidebar.rendered) renderSidebar(null, OPTIONS)
  if (!renderNavbar.rendered) renderNavbar(null, OPTIONS)
  renderSidebar.rendered = false
  renderNavbar.rendered = false

  if (content && typeof Vue !== 'undefined' && typeof Vuep !== 'undefined') new Vue({ el: 'main' }) // eslint-disable-line
  if (OPTIONS.auto2top) scroll2Top()
}

/**
 * navbar
 */
export function renderNavbar (content) {
  if (CACHE.navbar && CACHE.navbar === content) return
  CACHE.navbar = content
  renderNavbar.rendered = true

  if (content) renderTo('nav', marked(content))
  activeLink('nav')
}

/**
 * sidebar
 */
export function renderSidebar (content) {
  let isToc = false

  if (content) {
    content = marked(content)
  } else if (OPTIONS.sidebar) {
    content = tpl.tree(OPTIONS.sidebar, '<ul>')
  } else {
    content = tpl.tree(genTree(toc, OPTIONS.maxLevel), '<ul>')
    isToc = true
  }

  renderSidebar.rendered = true
  if (CACHE.sidebar && CACHE.sidebar === content) return
  CACHE.sidebar = content
  renderTo('aside.sidebar', content)
  if (isToc) scrollActiveSidebar()
  toc = []
}

/**
 * Cover Page
 */
export function renderCover (content) {
  renderCover.dom = renderCover.dom || document.querySelector('section.cover')
  if (!content) {
    renderCover.dom.classList.add('hidden')
  } else {
    renderCover.dom.classList.remove('hidden')
    !renderCover.rendered && renderTo('.cover-main', marked(content))
    renderCover.rendered = true
  }

  sticky()
}

/**
 * render loading bar
 * @return {[type]} [description]
 */
export function renderLoading ({ loaded, total, step }) {
  let num

  if (!CACHE.loading) {
    const div = document.createElement('div')

    div.classList.add('progress')
    document.body.appendChild(div)
    CACHE.loading = div
  }
  if (step) {
    num = parseInt(CACHE.loading.style.width, 10) + step
    num = num > 80 ? 80 : num
  } else {
    num = Math.floor(loaded / total * 100)
  }

  CACHE.loading.style.opacity = 1
  CACHE.loading.style.width = num >= 95 ? '100%' : num + '%'

  if (num >= 95) {
    clearTimeout(renderLoading.cacheTimeout)
    renderLoading.cacheTimeout = setTimeout(_ => {
      CACHE.loading.style.opacity = 0
      CACHE.loading.style.width = '0%'
    }, 200)
  }
}

/**
 * Load Config
 * @param  {Object} options
 */
export function config (options) {
  OPTIONS = options
}

