/**
 * --------------------------------------------
 * AdminLTE IFrame.js
 * License MIT
 * --------------------------------------------
 */

import $ from 'jquery'

/**
 * Constants
 * ====================================================
 */

const NAME = 'IFrame'
const DATA_KEY = 'lte.iframe'
const JQUERY_NO_CONFLICT = $.fn[NAME]

const SELECTOR_DATA_TOGGLE = '[data-widget="iframe"]'
const SELECTOR_CONTENT_WRAPPER = '.content-wrapper'
const SELECTOR_CONTENT_IFRAME = `${SELECTOR_CONTENT_WRAPPER} iframe`
const SELECTOR_TAB_NAV = `${SELECTOR_DATA_TOGGLE}.iframe-mode .nav`
const SELECTOR_TAB_NAVBAR_NAV = `${SELECTOR_DATA_TOGGLE}.iframe-mode .navbar-nav`
const SELECTOR_TAB_NAVBAR_NAV_ITEM = `${SELECTOR_TAB_NAVBAR_NAV} .nav-item`
const SELECTOR_TAB_CONTENT = `${SELECTOR_DATA_TOGGLE}.iframe-mode .tab-content`
const SELECTOR_TAB_EMPTY = `${SELECTOR_TAB_CONTENT} .tab-empty`
const SELECTOR_TAB_LOADING = `${SELECTOR_TAB_CONTENT} .tab-loading`
const SELECTOR_SIDEBAR_MENU_ITEM = '.main-sidebar .nav-item > a.nav-link'
const CLASS_NAME_IFRAME_MODE = 'iframe-mode'

const Default = {
  click(item) {
    return item
  },
  changed(item) {
    return item
  },
  autoIframeMode: true,
  autoShowNewTab: true,
  loadingScreen: true
}

/**
 * Class Definition
 * ====================================================
 */

class IFrame {
  constructor(element, config) {
    this._config = config
    this._element = element

    this._init()
  }

  // Public

  click(item) {
    this._config.click.call(item)
  }

  changed(item) {
    this._config.changed.call(item)
  }

  createTab(title, link, autoOpen) {
    const tabId = `panel-${link.replace('.html', '').replace('./', '').replaceAll('/', '-')}-${Math.floor(Math.random() * 1000)}`
    const navId = `tab-${link.replace('.html', '').replace('./', '').replaceAll('/', '-')}-${Math.floor(Math.random() * 1000)}`

    const newNavItem = `<li class="nav-item" role="presentation"><a class="nav-link" data-toggle="row" id="${navId}" href="#${tabId}" role="tab" aria-controls="${tabId}" aria-selected="false">${title}</a></li>`
    $(SELECTOR_TAB_NAVBAR_NAV).append(newNavItem)

    const newTabItem = `<div class="tab-pane fade" id="${tabId}" role="tabpanel" aria-labelledby="${navId}"><iframe src="${link}"></iframe></div>`
    $(SELECTOR_TAB_CONTENT).append(newTabItem)

    if (autoOpen) {
      this.switchTab(`#${navId}`, this._config.loadingScreen)
    }
  }

  openTabSidebar(item) {
    let $item = $(item).clone()

    if ($item.attr('href') === undefined) {
      $item = $(item).parent('a').clone()
    }

    const title = $item.find('p').text()
    const link = $item.attr('href')

    if (link === '#' || link === '' || link === undefined) {
      return
    }

    this.createTab(title, link, this._config.autoShowNewTab)
  }

  switchTab(item, loadingScreen = null) {
    $(SELECTOR_TAB_EMPTY).hide()
    $(`${SELECTOR_TAB_NAVBAR_NAV} .active`).tab('dispose').removeClass('active')
    this._fixHeight()
    const $item = $(item)

    if (loadingScreen) {
      const $loadingScreen = $(SELECTOR_TAB_LOADING)
      $loadingScreen.fadeIn()
      const tabId = $item.attr('href')
      $(`${tabId} iframe`).ready(() => {
        if (typeof loadingScreen === 'number') {
          setTimeout(() => {
            $loadingScreen.fadeOut()
          }, loadingScreen)
        } else {
          $loadingScreen.fadeOut()
        }
      })
    }

    $item.tab('show')
    $item.parents('li').addClass('active')
  }

  // Private

  _init() {
    if (window.frameElement && this._config.autoIframeMode) {
      $('body').addClass(CLASS_NAME_IFRAME_MODE)
    } else if ($(SELECTOR_CONTENT_WRAPPER).hasClass(CLASS_NAME_IFRAME_MODE)) {
      this._setupListeners()
      this._fixHeight(true)
    }
  }

  _setupListeners() {
    $(window).on('resize', () => {
      setTimeout(() => {
        this._fixHeight()
      }, 1)
    })
    $(document).on('click', SELECTOR_SIDEBAR_MENU_ITEM, e => {
      e.preventDefault()
      this.openTabSidebar(e.target)
    })
    $(document).on('click', SELECTOR_TAB_NAVBAR_NAV_ITEM, e => {
      e.preventDefault()
      this.switchTab(e.target)
    })
  }

  _fixHeight(tabEmpty = false) {
    const contentWrapperHeight = parseFloat($(SELECTOR_CONTENT_WRAPPER).css('min-height'))
    const navbarHeight = $(SELECTOR_TAB_NAV).outerHeight()
    if (tabEmpty == true) {
      setTimeout(() => {
        $(`${SELECTOR_TAB_EMPTY}, ${SELECTOR_TAB_LOADING}`).height(contentWrapperHeight - navbarHeight)
      }, 50)
    } else {
      $(SELECTOR_CONTENT_IFRAME).height(contentWrapperHeight - navbarHeight)
    }
  }

  // Static

  static _jQueryInterface(operation) {
    let data = $(this).data(DATA_KEY)
    const _options = $.extend({}, Default, $(this).data())

    if (!data) {
      data = new IFrame(this, _options)
      $(this).data(DATA_KEY, data)
    }

    if (typeof operation === 'string' && operation.match(/openTabSidebar/)) {
      data[operation]()
    }
  }
}

/**
 * Data API
 * ====================================================
 */

$(window).on('load', () => {
  IFrame._jQueryInterface.call($(SELECTOR_DATA_TOGGLE))
})

/**
 * jQuery API
 * ====================================================
 */

$.fn[NAME] = IFrame._jQueryInterface
$.fn[NAME].Constructor = IFrame
$.fn[NAME].noConflict = function () {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return IFrame._jQueryInterface
}

export default IFrame
