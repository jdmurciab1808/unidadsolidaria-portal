/*!
 * Bootstrap Icons
 * https://github.com/pixel-s-lab/bootstrapicon-iconpicker
 * This script is based on fontawesome-iconpicker by Javi Aguilar
 * @author Madalin Marius Stan, pixel.com.ro
 * @license MIT License
 * @see https://github.com/pixel-s-lab/bootstrapicon-iconpicker/blob/main/LICENSE
 */

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  $.ui = $.ui || {};
  let version = $.ui.version = "1.12.1";

  (function () {
    let cachedScrollbarWidth,
      max = Math.max,
      abs = Math.abs,
      rhorizontal = /left|center|right/,
      rvertical = /top|center|bottom/,
      roffset = /[\+\-]\d+(\.[\d]+)?%?/,
      rposition = /^\w+/,
      rpercent = /%$/,
      _position = $.fn.pos;

    function getOffsets(offsets, width, height) {
      return [
        parseFloat(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1),
        parseFloat(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1)
      ];
    }

    function parseCss(element, property) {
      return parseInt($.css(element, property), 10) || 0;
    }

    function getDimensions(elem) {
      const raw = elem[0];
      if (raw.nodeType === 9) {
        return {
          width: elem.width(),
          height: elem.height(),
          offset: {
            top: 0,
            left: 0
          }
        };
      }
      if (raw != null && raw === raw.window) {
        return {
          width: elem.width(),
          height: elem.height(),
          offset: {
            top: elem.scrollTop(),
            left: elem.scrollLeft()
          }
        };
      }
      if (raw.preventDefault) {
        return {
          width: 0,
          height: 0,
          offset: {
            top: raw.pageY,
            left: raw.pageX
          }
        };
      }
      return {
        width: elem.outerWidth(),
        height: elem.outerHeight(),
        offset: elem.offset()
      };
    }

    $.pos = {
      scrollbarWidth: (() => {
        let cachedScrollbarWidth;
        return function () {
          if (cachedScrollbarWidth !== undefined) {
            return cachedScrollbarWidth;
          }
          const div = document.createElement("div");
          div.style.cssText = "display:block;position:absolute;width:50px;height:50px;overflow:hidden;";
          const innerDiv = document.createElement("div");
          innerDiv.style.cssText = "height:100px;width:auto;";
          div.appendChild(innerDiv);
          document.body.appendChild(div);
          const w1 = innerDiv.offsetWidth;
          div.style.overflow = "scroll";
          const w2 = innerDiv.offsetWidth || div.clientWidth;
          document.body.removeChild(div);
          cachedScrollbarWidth = w1 - w2;
          return cachedScrollbarWidth;
        };
      })(),
      getScrollInfo: function (within) {
        const overflowX = within.isWindow || within.isDocument ? "" : getComputedStyle(within.element).overflowX;
        const overflowY = within.isWindow || within.isDocument ? "" : getComputedStyle(within.element).overflowY;

        const hasOverflowX = overflowX === "scroll" || (overflowX === "auto" && within.width < within.element.scrollWidth);
        const hasOverflowY = overflowY === "scroll" || (overflowY === "auto" && within.height < within.element.scrollHeight);

        return {
          width: hasOverflowY ? pos.scrollbarWidth() : 0,
          height: hasOverflowX ? pos.scrollbarWidth() : 0,
        };
      },
      getWithinInfo:  function (element = window) {
        const isWindow = element === window;
        const isDocument = element.nodeType === 9; // DOCUMENT_NODE

        const withinElement = isWindow ? window : isDocument ? document.documentElement : element;

        return {
          element: withinElement,
          isWindow,
          isDocument,
          offset: isWindow || isDocument ? { left: 0, top: 0 } : withinElement.getBoundingClientRect(),
          scrollLeft: withinElement.scrollLeft || 0,
          scrollTop: withinElement.scrollTop || 0,
          width: isWindow ? window.innerWidth : withinElement.clientWidth,
          height: isWindow ? window.innerHeight : withinElement.clientHeight,
        };
      },
    };
    $.fn.pos = function (options) {
      if (!options || !options.of) {
        return _position.apply(this, arguments);
      }

      // Clone options to prevent modification
      const settings = { ...options };

      const target = $(settings.of);
      const within = $.pos.getWithinInfo(settings.within);
      const scrollInfo = $.pos.getScrollInfo(within);
      const collision = (settings.collision || "flip").split(" ");
      const offsets = {};

      const dimensions = getDimensions(target);
      const targetWidth = dimensions.width;
      const targetHeight = dimensions.height;
      const targetOffset = dimensions.offset;

      // Adjust base position based on "at" alignment
      let basePosition = { ...targetOffset };

      const normalizePositions = (positionArray, axis) => {
        if (positionArray.length === 1) {
          return axis === "horizontal"
            ? rhorizontal.test(positionArray[0])
              ? [positionArray[0], "center"]
              : ["center", "center"]
            : ["center", positionArray[0]];
        }
        return positionArray;
      };

      ["my", "at"].forEach((key) => {
        const position = normalizePositions((settings[key] || "").split(" "), key === "my" ? "horizontal" : "vertical");
        const [horizontalOffset, verticalOffset] = [roffset.exec(position[0]), roffset.exec(position[1])];
        offsets[key] = [
          horizontalOffset ? parseFloat(horizontalOffset[0]) : 0,
          verticalOffset ? parseFloat(verticalOffset[0]) : 0,
        ];
        settings[key] = [
          rposition.exec(position[0])[0] || "center",
          rposition.exec(position[1])[0] || "center",
        ];
      });

      // Adjust position based on "at" alignment
      if (settings.at[0] === "right") basePosition.left += targetWidth;
      else if (settings.at[0] === "center") basePosition.left += targetWidth / 2;

      if (settings.at[1] === "bottom") basePosition.top += targetHeight;
      else if (settings.at[1] === "center") basePosition.top += targetHeight / 2;

      const atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
      basePosition.left += atOffset[0];
      basePosition.top += atOffset[1];

      // Apply the calculated position to each element
      return this.each(function () {
        const elem = $(this);
        const elemWidth = elem.outerWidth();
        const elemHeight = elem.outerHeight();
        const marginLeft = parseCss(this, "marginLeft");
        const marginTop = parseCss(this, "marginTop");

        const collisionWidth = elemWidth + marginLeft + parseCss(this, "marginRight") + scrollInfo.width;
        const collisionHeight = elemHeight + marginTop + parseCss(this, "marginBottom") + scrollInfo.height;

        const myOffset = getOffsets(offsets.my, elemWidth, elemHeight);

        // Adjust position based on "my" alignment
        const position = {
          ...basePosition,
          left: basePosition.left + myOffset[0] - (settings.my[0] === "right" ? elemWidth : settings.my[0] === "center" ? elemWidth / 2 : 0),
          top: basePosition.top + myOffset[1] - (settings.my[1] === "bottom" ? elemHeight : settings.my[1] === "center" ? elemHeight / 2 : 0),
        };

        // Handle collision logic
        const collisionPosition = { marginLeft, marginTop };
        ["left", "top"].forEach((dir, i) => {
          if ($.ui.pos[collision[i]]) {
            $.ui.pos[collision[i]][dir](position, {
              targetWidth,
              targetHeight,
              elemWidth,
              elemHeight,
              collisionPosition,
              collisionWidth,
              collisionHeight,
              offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
              my: settings.my,
              at: settings.at,
              within,
              elem,
            });
          }
        });

        // If a custom "using" function is provided, call it
        if (settings.using) {
          settings.using.call(this, position, {
            target: {
              element: target,
              left: targetOffset.left,
              top: targetOffset.top,
              width: targetWidth,
              height: targetHeight,
            },
            element: {
              element: elem,
              left: position.left,
              top: position.top,
              width: elemWidth,
              height: elemHeight,
            },
          });
        }

        elem.offset(position);
      });
    };
    $.ui.pos = {
      _trigger(position, data, name, triggered) {
        if (data.elem) {
          data.elem.trigger({
            type: name,
            position,
            positionData: data,
            triggered,
          });
        }
      },

      _handleOverflow(position, data, dir, axis) {
        const { within, collisionPosition, collisionWidth, collisionHeight } = data;
        const withinOffset = axis === "x" ? within.scrollLeft : within.scrollTop;
        const outerSize = axis === "x" ? within.width : within.height;
        const collisionPos = axis === "x" ? position.left : position.top;
        const elemSize = axis === "x" ? collisionWidth : collisionHeight;

        const overStart = withinOffset - (collisionPos - collisionPosition[`margin${dir}`]);
        const overEnd = collisionPos + elemSize - outerSize - withinOffset;

        let newOverEnd;
        if (elemSize > outerSize) {
          if (overStart > 0 && overEnd <= 0) {
            newOverEnd = collisionPos + overStart + elemSize - outerSize - withinOffset;
            return collisionPos + overStart - newOverEnd;
          }
          if (overEnd > 0 && overStart <= 0) return withinOffset;
          return overStart > overEnd
            ? withinOffset + outerSize - elemSize
            : withinOffset;
        }

        if (overStart > 0) return collisionPos + overStart;
        if (overEnd > 0) return collisionPos - overEnd;
        return Math.max(collisionPos - (collisionPos - collisionPosition[`margin${dir}`]), collisionPos);
      },

      fit: {
        left(position, data) {
          $.ui.pos._trigger(position, data, "posCollide", "fitLeft");
          position.left = $.ui.pos._handleOverflow(position, data, "Left", "x");
          $.ui.pos._trigger(position, data, "posCollided", "fitLeft");
        },
        top(position, data) {
          $.ui.pos._trigger(position, data, "posCollide", "fitTop");
          position.top = $.ui.pos._handleOverflow(position, data, "Top", "y");
          $.ui.pos._trigger(position, data, "posCollided", "fitTop");
        },
      },

      flip: {
        left(position, data) {
          $.ui.pos._trigger(position, data, "posCollide", "flipLeft");
          const { within, my, at, offset, targetWidth, elemWidth } = data;
          const withinOffset = within.offset.left + within.scrollLeft;
          const outerWidth = within.width;
          const collisionPosLeft = position.left - data.collisionPosition.marginLeft;
          const overLeft = collisionPosLeft - withinOffset;
          const overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset;

          const myOffset = my[0] === "left" ? -elemWidth : my[0] === "right" ? elemWidth : 0;
          const atOffset = at[0] === "left" ? targetWidth : at[0] === "right" ? -targetWidth : 0;
          const totalOffset = myOffset + atOffset + offset[0] * -2;

          if (overLeft < 0 && (overRight <= 0 || Math.abs(overLeft) < overRight)) {
            position.left += totalOffset;
          } else if (overRight > 0 && (overLeft >= 0 || Math.abs(overRight) < overLeft)) {
            position.left += totalOffset;
          }
          $.ui.pos._trigger(position, data, "posCollided", "flipLeft");
        },
        top(position, data) {
          $.ui.pos._trigger(position, data, "posCollide", "flipTop");
          const { within, my, at, offset, targetHeight, elemHeight } = data;
          const withinOffset = within.offset.top + within.scrollTop;
          const outerHeight = within.height;
          const collisionPosTop = position.top - data.collisionPosition.marginTop;
          const overTop = collisionPosTop - withinOffset;
          const overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset;

          const myOffset = my[1] === "top" ? -elemHeight : my[1] === "bottom" ? elemHeight : 0;
          const atOffset = at[1] === "top" ? targetHeight : at[1] === "bottom" ? -targetHeight : 0;
          const totalOffset = myOffset + atOffset + offset[1] * -2;

          if (overTop < 0 && (overBottom <= 0 || Math.abs(overTop) < overBottom)) {
            position.top += totalOffset;
          } else if (overBottom > 0 && (overTop >= 0 || Math.abs(overBottom) < overTop)) {
            position.top += totalOffset;
          }
          $.ui.pos._trigger(position, data, "posCollided", "flipTop");
        },
      },

      flipfit: {
        left(...args) {
          $.ui.pos.flip.left(...args);
          $.ui.pos.fit.left(...args);
        },
        top(...args) {
          $.ui.pos.flip.top(...args);
          $.ui.pos.fit.top(...args);
        },
      },
    };
    (function () {
      const body = document.body;
      const fakeBody = document.createElement("div");
      const testDiv = document.createElement("div");

      // Apply styles to the fake body for testing
      Object.assign(fakeBody.style, {
        visibility: "hidden",
        width: "0",
        height: "0",
        border: "none",
        margin: "0",
        background: "none",
        position: "absolute",
        left: "-1000px",
        top: "-1000px",
      });

      // Add test div for measuring offset
      testDiv.style.cssText = "position: absolute; left: 10.7432222px;";
      fakeBody.appendChild(testDiv);

      // Insert the fake body into the DOM
      (body || document.documentElement).appendChild(fakeBody);

      // Determine if the browser supports fractional offsets
      const offsetLeft = testDiv.getBoundingClientRect().left;
      $.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;

      // Clean up by removing the fake body
      fakeBody.remove();
    })();
  })();
  var position = $.ui.position;
});

(function (factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (window.jQuery && !window.jQuery.fn.iconpicker) {
    factory(window.jQuery);
  }
})(function ($) {
  "use strict";
  const _helpers = {
    isEmpty: (val) => val === false || val === '' || val == null,
    isEmptyObject: (val) => _helpers.isEmpty(val) || (val.length === 0 && typeof val !== "undefined"),
    isElement: (selector) => document.querySelector(selector) !== null,
    isString: (val) => typeof val === "string" || val instanceof String,
    isArray: Array.isArray,
    inArray: (val, arr) => arr.includes(val),
    throwError: (text) => {
      throw new Error(`Font Awesome Icon Picker Exception: ${text}`);
    },
  };

  const Iconpicker = function (element, options) {
    this._id = Iconpicker._idCounter++;
    this.element = $(element).addClass('iconpicker-element');
    this._trigger('iconpickerCreate', {
      iconpickerValue: this.iconpickerValue
    });
    this.options = $.extend({}, Iconpicker.defaultOptions, this.element.data(), options);
    this.options.templates = $.extend({}, Iconpicker.defaultOptions.templates, this.options.templates);
    this.options.originalPlacement = this.options.placement;
    // Iconpicker container element
    this.container = (_helpers.isElement(this.options.container) ? $(this.options.container) : false);
    if (this.container === false) {
      if (this.element.is('.dropdown-toggle')) {
        this.container = $('~ .dropdown-menu:first', this.element);
      } else {
        this.container = (this.element.is('input,textarea,button,.btn') ? this.element.parent() : this.element);
      }
    }
    this.container.addClass('iconpicker-container');

    if (this.isDropdownMenu()) {
      this.options.placement = 'inline';
    }

    // Is the element an input? Should we search inside for any input?
    this.input = (this.element.is('input,textarea') ? this.element.addClass('iconpicker-input') : false);
    if (this.input === false) {
      this.input = (this.container.find(this.options.input));
      if (!this.input.is('input,textarea')) {
        this.input = false;
      }
    }

    // Plugin as component ?
    this.component = this.isDropdownMenu() ? this.container.parent().find(this.options.component) : this.container.find(this.options.component);
    if (this.component.length === 0) {
      this.component = false;
    } else {
      this.component.find('i').addClass('iconpicker-component');
    }

    // Create popover and iconpicker HTML
    this._createPopover();
    this._createIconpicker();

    if (this.getAcceptButton().length === 0) {
      // disable this because we don't have accept buttons
      this.options.mustAccept = false;
    }

    // Avoid CSS issues with input-group-addon(s)
    if (this.isInputGroup()) {
      this.container.parent().append(this.popover);
    } else {
      this.container.append(this.popover);
    }

    // Bind events
    this._bindElementEvents();
    this._bindWindowEvents();

    // Refresh everything
    this.update(this.options.selected);

    if (this.isInline()) {
      this.show();
    }

    this._trigger('iconpickerCreated', {
      iconpickerValue: this.iconpickerValue
    });
  };

  // Instance identifier counter
  Iconpicker._idCounter = 0;
  Iconpicker.defaultOptions = {
    title: false, // Popover title (optional) only if specified in the template
    selected: false, // use this value as the current item and ignore the original
    defaultValue: false, // use this value as the current item if input or element value is empty
    placement: 'bottom', // (has some issues with auto and CSS). auto, top, bottom, left, right
    collision: 'none', // If true, the popover will be repositioned to another position when collapses with the window borders
    animation: true, // fade in/out on show/hide ?
    //hide iconpicker automatically when a value is picked. it is ignored if mustAccept is not false and the accept button is visible
    hideOnSelect: false,
    showFooter: false,
    searchInFooter: false, // If true, the search will be added to the footer instead of the title
    mustAccept: false, // only applicable when there's an iconpicker-btn-accept button in the popover footer
    selectedCustomClass: 'bg-primary', // Appends this class when to the selected item
    icons: [], // list of icon classes (declared at the bottom of this script for maintainability)
    fullClassFormatter: function (val) {
      return val;
    },
    input: 'input,.iconpicker-input', // children input selector
    inputSearch: false, // use the input as a search box too?
    container: false, //  Appends the popover to a specific element. If not set, the selected element or element parent is used
    component: '.input-group-addon,.iconpicker-component', // children component jQuery selector or object, relative to the container element
    // Plugin templates:
    templates: {
      popover: '<div class="iconpicker-popover popover" role="tooltip"><div class="arrow"></div>' +
        '<div class="popover-title"></div><div class="popover-content"></div></div>',
      footer: '<div class="popover-footer"></div>',
      buttons: '<button class="iconpicker-btn iconpicker-btn-cancel btn btn-default btn-sm">Cancel</button>' +
        ' <button class="iconpicker-btn iconpicker-btn-accept btn btn-primary btn-sm">Accept</button>',
      search: '<input type="search" class="form-control iconpicker-search" placeholder="Type to filter" />',
      iconpicker: '<div class="iconpicker"><div class="iconpicker-items"></div></div>',
      iconpickerItem: '<a role="button" href="javascript:;" class="iconpicker-item"><i></i></a>',
    }
  };
  Iconpicker.batch = function (selector, method) {
    const args = Array.prototype.slice.call(arguments, 2);
    return $(selector).each(function () {
      const $inst = $(this).data('iconpicker');
      if (!!$inst) {
        $inst[method].apply($inst, args);
      }
    });
  };
  Iconpicker.prototype = {
    constructor: Iconpicker,
    options: {},
    _id: 0, // instance identifier for bind/unbind events
    _trigger(name, opts = {}) {
      // Triggers a custom event on the element with the provided name and options
      this.element.trigger({
        type: name,
        iconpickerInstance: this,
        ...opts,
      });
    },
    _createPopover() {
      const { templates, title, showFooter, animation, searchInFooter } = this.options;
      this.popover = $(templates.popover);
      // title (header)
      const _title = this.popover.find('.popover-title');
      if (title) {
        _title.append(`<div class="popover-title-text">${title}</div>`);
      }
      if (this.hasSeparatedSearchInput()) {
        const searchTemplate = templates.search;
        if (!searchInFooter) {
          _title.append(searchTemplate);
        } else if (!title) {
          _title.remove();
        }
      } else if (!title) {
        _title.remove();
      }
      // footer
      if (showFooter && !_helpers.isEmpty(templates.footer)) {
        const _footer = $(templates.footer);
        if (this.hasSeparatedSearchInput() && searchInFooter) {
          _footer.append(templates.search);
        }
        if (!_helpers.isEmpty(templates.buttons)) {
          _footer.append(templates.buttons);
        }
        this.popover.append(_footer);
      }
      if (animation) {
        this.popover.addClass('fade show');
      }
      return this.popover;
    },
    _createIconpicker() {
      const { templates, icons, fullClassFormatter, hideOnSelect, mustAccept } = this.options;
      this.iconpicker = $(templates.iconpicker);

      // Item click handler
      const itemClickFn = (event) => {
        const $item = $(event.currentTarget);
        const iconpickerValue = $item.data('iconpickerValue');

        this._trigger('iconpickerSelect', {
          iconpickerItem: $item,
          iconpickerValue: this.iconpickerValue,
        });

        this.update(iconpickerValue, mustAccept);
        if (!mustAccept) {
          this._trigger('iconpickerSelected', {
            iconpickerItem: $item,
            iconpickerValue: this.iconpickerValue,
          });
        }

        if (hideOnSelect && !mustAccept) {
          this.hide();
        }
      };

      // Generate items
      const $itemTemplate = $(templates.iconpickerItem);
      const $items = icons
        .filter((icon) => typeof icon.title === 'string')
        .map((icon) => {
          const $item = $itemTemplate.clone();
          const { title, searchTerms } = icon;

          $item.find('i').addClass(fullClassFormatter(title));
          $item.data('iconpickerValue', title).on('click.iconpicker', itemClickFn);
          $item.attr('title', `.${title}`);

          if (Array.isArray(searchTerms) && searchTerms.length > 0) {
            $item.attr('data-search-terms', searchTerms.join(' '));
          }

          return $item;
        });

      // Append items to the iconpicker
      this.iconpicker.find('.iconpicker-items').append($items);
      this.popover.find('.popover-content').append(this.iconpicker);

      return this.iconpicker;
    },
    _isEventInsideIconpicker(e) {
      const $target = $(e.target);

      return (
        $target.is(this.element) ||
        $target.hasClass('iconpicker-element') ||
        $target.closest('.iconpicker-popover').length > 0
      );
    },
    _bindElementEvents() {
      const handleKeyup = (event) => {
        const value = $(event.currentTarget).val().toLowerCase();
        this.filter(value);
      };

      const handleAccept = () => {
        const selectedItem = this.iconpicker.find('.iconpicker-selected').get(0);

        this.update(this.iconpickerValue);
        this._trigger('iconpickerSelected', {
          iconpickerItem: selectedItem,
          iconpickerValue: this.iconpickerValue,
        });

        if (!this.isInline()) {
          this.hide();
        }
      };

      const handleCancel = () => {
        if (!this.isInline()) {
          this.hide();
        }
      };

      const handleFocus = (event) => {
        this.show();
        event.stopPropagation();
      };

      const handleInputKeyup = (event) => {
        const ignoredKeys = [
          38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86,
        ];

        if (!_helpers.inArray(event.keyCode, ignoredKeys)) {
          this.update();
        } else {
          this._updateFormGroupStatus(this.getValid(event.currentTarget.value) !== false);
        }

        if (this.options.inputSearch) {
          this.filter($(event.currentTarget).val().toLowerCase());
        }
      };

      // Attach events
      this.getSearchInput().on('keyup.iconpicker', handleKeyup);
      this.getAcceptButton().on('click.iconpicker', handleAccept);
      this.getCancelButton().on('click.iconpicker', handleCancel);
      this.element.on('focus.iconpicker', handleFocus);

      if (this.hasComponent()) {
        this.component.on('click.iconpicker', () => this.toggle());
      }

      if (this.hasInput()) {
        this.input.on('keyup.iconpicker', handleInputKeyup);
      }
    },
    _bindWindowEvents() {
      const namespace = `.iconpicker.inst${this._id}`;

      // Reposition popover on window resize or orientation change
      $(window).on(`resize${namespace} orientationchange${namespace}`, () => {
        if (this.popover.hasClass('in')) {
          this.updatePlacement();
        }
      });

      // Hide popover on mouseup outside the iconpicker
      if (!this.isInline()) {
        $(document).on(`mouseup${namespace}`, (e) => {
          if (!this._isEventInsideIconpicker(e)) {
            this.hide();
          }
        });
      }
    },
    _unbindElementEvents() {
      const elements = [this.popover, this.element, this.input, this.component, this.container];

      elements.forEach((el) => {
        if (el && el.off) {
          el.off('.iconpicker');
        }
      });
    },
    _unbindWindowEvents() {
      const namespace = `.iconpicker.inst${this._id}`;
      [window, document].forEach((target) => $(target).off(namespace));
    },
    updatePlacement(placement = this.options.placement, collision = this.options.collision) {
      this.options.placement = placement;
      collision = collision === true ? "flip" : collision;
      let _pos = {
        // at: Defines which position (or side) on container element to align the
        // popover element against: "horizontal vertical" alignment.
        at: "right bottom",
        // my: Defines which position (or side) on the popover being positioned to align
        // with the container element: "horizontal vertical" alignment
        my: "right top",
        // of: Which element to position against.
        of: this.hasInput() && !this.isInputGroup() ? this.input : this.container,
        // collision: When the positioned element overflows the window (or within element)
        // in some direction, move it to an alternative position.
        collision,
        // within: Element to position within, affecting collision detection.
        within: window,
      };
      const placementClasses = [
        'inline', 'topLeftCorner', 'topLeft', 'top', 'topRight', 'topRightCorner',
        'rightTop', 'right', 'rightBottom', 'bottomRightCorner', 'bottomRight',
        'bottom', 'bottomLeft', 'bottomLeftCorner', 'leftBottom', 'left', 'leftTop',
      ];

      const placementMappings = {
        topLeftCorner: { my: 'right bottom', at: 'left top' },
        topLeft: { my: 'left bottom', at: 'left top' },
        top: { my: 'center bottom', at: 'center top' },
        topRight: { my: 'right bottom', at: 'right top' },
        topRightCorner: { my: 'left bottom', at: 'right top' },
        rightTop: { my: 'left bottom', at: 'right center' },
        right: { my: 'left center', at: 'right center' },
        rightBottom: { my: 'left top', at: 'right center' },
        bottomRightCorner: { my: 'left top', at: 'right bottom' },
        bottomRight: { my: 'right top', at: 'right bottom' },
        bottom: { my: 'center top', at: 'center bottom' },
        bottomLeft: { my: 'left top', at: 'left bottom' },
        bottomLeftCorner: { my: 'right top', at: 'left bottom' },
        leftBottom: { my: 'right top', at: 'left center' },
        left: { my: 'right center', at: 'left center' },
        leftTop: { my: 'right bottom', at: 'left center' },
      };

      // Remove previous placement classes
      this.popover.removeClass(placementClasses.join(' '));

      if (typeof placement === 'object') {
        // Custom position
        return this.popover.pos({ ..._pos, ...placement });
      }

      if (placement === 'inline') {
        _pos = false;
      } else if (placementMappings[placement]) {
        Object.assign(_pos, placementMappings[placement]);
      } else {
        return false;
      }

      // Update popover styles and position
      this.popover.css({ display: placement === "inline" ? "" : "block" });

      if (_pos) {
        this.popover
          .pos(_pos)
          .css("maxWidth", $(window).width() - this.container.offset().left - 5);
      } else {
        this.popover.css({
          top: "auto",
          right: "auto",
          bottom: "auto",
          left: "auto",
          maxWidth: "none",
        });
      }

      this.popover.addClass(this.options.placement);
      return true;
    },
    _updateComponents() {
      const { iconpickerValue, options } = this;

      // Remove previous selection
      this.iconpicker
        .find('.iconpicker-item.iconpicker-selected')
        .removeClass(`iconpicker-selected ${options.selectedCustomClass}`);

      // Add selection to the current value
      if (iconpickerValue) {
        this.iconpicker
          .find(`.${options.fullClassFormatter(iconpickerValue).replace(/ /g, '.')}`)
          .parent()
          .addClass(`iconpicker-selected ${options.selectedCustomClass}`);
      }

      // Update component item
      if (this.hasComponent()) {
        const $icon = this.component.find('i');
        const formattedClass = options.fullClassFormatter(iconpickerValue);

        if ($icon.length > 0) {
          $icon.attr('class', formattedClass);
        } else {
          this.component.html(this.getHtml());
        }
      }
    },
    _updateFormGroupStatus(isValid) {
      if (!this.hasInput()) return false;
      const formGroup = this.input.parents('.form-group:first');
      // Remove form-group error class if any
      formGroup.toggleClass('has-error', isValid === false);
      return true;
    },
    getValid(val) {
      if (!_helpers.isString(val)) val = '';

      // Trim the value
      if(val !== '') {
        val = val.trim();
      }

      // Check if the value is empty or matches any icon title
      const isValid = val === '' || this.options.icons.some(icon => icon.title === val);

      return isValid ? val : false;
    },
    /**
     * Sets the internal item value and updates everything, excepting the input or element.
     * For doing so, call setSourceValue() or update() instead
     */
    setValue(val) {
      // sanitize first
      const validValue = this.getValid(val);
      if (validValue !== false) {
        this.iconpickerValue = validValue;
        this._trigger('iconpickerSetValue', { iconpickerValue: validValue });
        return this.iconpickerValue;
      }

      this._trigger('iconpickerInvalid', { iconpickerValue: val });
      return false;
    },
    getHtml() {
      const iconClass = this.options.fullClassFormatter(this.iconpickerValue);
      return `<i class="${iconClass}"></i>`;
    },
    /**
     * Calls setValue and if it's a valid item value, sets the input or element value
     */
    setSourceValue(val) {
      const validValue = this.setValue(val);
      if (validValue) {
        if (this.hasInput()) {
          this.input.val(this.iconpickerValue);
        } else {
          this.element.data('iconpickerValue', this.iconpickerValue);
        }
        this._trigger('iconpickerSetSourceValue', { iconpickerValue: validValue });
      }
      return validValue;
    },
    /**
     * Returns the input or element item value, without formatting, or defaultValue
     * if it's empty string, undefined, false or null
     * @param {type} defaultValue
     * @returns string|mixed
     */
    getSourceValue(defaultValue = this.options.defaultValue) {
      let val = this.hasInput() ? this.input.val() : this.element.data('iconpickerValue');
      // Return defaultValue if val is undefined, null, false, or an empty string
      return val || defaultValue;
    },
    hasInput: function () {
      return (this.input !== false);
    },
    isInputSearch: function () {
      return (this.hasInput() && (this.options.inputSearch === true));
    },
    isInputGroup: function () {
      return this.container.is('.input-group');
    },
    isDropdownMenu: function () {
      return this.container.is('.dropdown-menu');
    },
    hasSeparatedSearchInput: function () {
      return (this.options.templates.search !== false) && (!this.isInputSearch());
    },
    hasComponent: function () {
      return (this.component !== false);
    },
    hasContainer: function () {
      return (this.container !== false);
    },
    getAcceptButton: function () {
      return this.popover.find('.iconpicker-btn-accept');
    },
    getCancelButton: function () {
      return this.popover.find('.iconpicker-btn-cancel');
    },
    getSearchInput: function () {
      return this.popover.find('.iconpicker-search');
    },
    filter(filterText) {
      if (_helpers.isEmpty(filterText)) {
        this.iconpicker.find('.iconpicker-item').show();
        return $();
      }
      const found = [];
      const regex = (() => {
        try {
          return new RegExp(`(^|\\W)${filterText.toLowerCase()}`, 'g');
        } catch {
          return null;
        }
      })();

      this.iconpicker.find('.iconpicker-item').each(function () {
        const $item = $(this);
        const title = $item.attr('title')?.toLowerCase() || '';
        const searchTerms = $item.attr('data-search-terms')?.toLowerCase() || '';
        const combinedText = `${title} ${searchTerms}`;

        if (regex && regex.test(combinedText)) {
          found.push($item);
          $item.show();
        } else {
          $item.hide();
        }
      });
      return found;
    },
    show() {
      if (this.popover.hasClass('in')) {
        return false;
      }
      // Hide other non-inline pickers
      $.iconpicker.batch(
        $('.iconpicker-popover.in:not(.inline)').not(this.popover),
        'hide'
      );
      this._trigger('iconpickerShow', { iconpickerValue: this.iconpickerValue });
      this.updatePlacement();
      this.popover.addClass('in');
      const animationDuration = this.options.animation ? 300 : 1;
      setTimeout(() => {
        this.popover.css('display', this.isInline() ? '' : 'block');
        this._trigger('iconpickerShown', { iconpickerValue: this.iconpickerValue });
      }, animationDuration);
    },
    hide() {
      if (!this.popover.hasClass('in')) {
        return false;
      }
      this._trigger('iconpickerHide', { iconpickerValue: this.iconpickerValue });
      this.popover.removeClass('in');
      const animationDuration = this.options.animation ? 300 : 1;
      setTimeout(() => {
        this.popover.css('display', 'none');
        this.getSearchInput().val(''); // Clear search input
        this.filter(''); // Clear filter
        this._trigger('iconpickerHidden', { iconpickerValue: this.iconpickerValue });
      }, animationDuration);
    },
    toggle() {
      this.popover.is(':visible') ? this.hide() : this.show(true);
    },
    update(val, updateOnlyInternal = false) {
      val = val || this.getSourceValue(this.iconpickerValue);
      // Reads the input or element value again and tries to update the plugin
      // fallback to the current selected item value
      this._trigger('iconpickerUpdate', { iconpickerValue: this.iconpickerValue });
      val = updateOnlyInternal ? this.setValue(val) : this.setSourceValue(val);
      if (!updateOnlyInternal) {
        this._updateFormGroupStatus(val !== false);
      }

      if (val !== false) {
        this._updateComponents();
      }

      // Trigger updated event
      this._trigger('iconpickerUpdated', { iconpickerValue: this.iconpickerValue });
      return val;
    },
    destroy() {
      this._trigger('iconpickerDestroy', { iconpickerValue: this.iconpickerValue });
      this.element.removeData('iconpicker').removeData('iconpickerValue').removeClass('iconpicker-element');
      // Unbinds events and resets everything to the initial state, including component mode
      this._unbindElementEvents();
      this._unbindWindowEvents();
      this.popover?.remove();
      this._trigger('iconpickerDestroyed', { iconpickerValue: this.iconpickerValue });
    },
    disable() {
      if (!this.hasInput()) return false;

      this.input.prop('disabled', true);
      return true;
    },
    enable() {
      if (!this.hasInput()) return false;

      this.input.prop('disabled', false);
      return true;
    },
    isDisabled() {
      return this.hasInput() && this.input.prop('disabled') === true;
    },
    isInline() {
      return this.options.placement === 'inline' || this.popover.hasClass('inline');
    }
  };
  $.iconpicker = Iconpicker;
  $.fn.iconpicker = function (options) {
    return this.each(function () {
      if (!$.data(this, "iconpicker")) {
        $.data(this, "iconpicker", new Iconpicker(this, $.isPlainObject(options) ? options : {}));
      }
    });
  };
});
