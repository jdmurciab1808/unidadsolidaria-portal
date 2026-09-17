/*!
 * Bootstrap Icons
 * https://github.com/pixel-s-lab/bootstrapicon-iconpicker
 * This script is based on fontawesome-iconpicker by Javi Aguilar
 * @author Madalin Marius Stan, pixel.com.ro
 * @license MIT License
 * @see https://github.com/pixel-s-lab/bootstrapicon-iconpicker/blob/main/LICENSE
 */


(function (e) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], e);
  } else {
    e(jQuery);
  }
})(function (j) {
  j.ui = j.ui || {};
  var e = j.ui.version = "1.12.1";
  (function () {
    var r, y = Math.max, x = Math.abs, s = /left|center|right/, i = /top|center|bottom/, f = /[\+\-]\d+(\.[\d]+)?%?/,
      l = /^\w+/, c = /%$/, a = j.fn.pos;

    function q(e, a, t) {
      return [parseFloat(e[0]) * (c.test(e[0]) ? a / 100 : 1), parseFloat(e[1]) * (c.test(e[1]) ? t / 100 : 1)];
    }

    function C(e, a) {
      return parseInt(j.css(e, a), 10) || 0;
    }

    function t(e) {
      var a = e[0];
      if (a.nodeType === 9) {
        return {
          width: e.width(),
          height: e.height(),
          offset: {
            top: 0,
            left: 0
          }
        };
      }
      if (j.isWindow(a)) {
        return {
          width: e.width(),
          height: e.height(),
          offset: {
            top: e.scrollTop(),
            left: e.scrollLeft()
          }
        };
      }
      if (a.preventDefault) {
        return {
          width: 0,
          height: 0,
          offset: {
            top: a.pageY,
            left: a.pageX
          }
        };
      }
      return {
        width: e.outerWidth(),
        height: e.outerHeight(),
        offset: e.offset()
      };
    }

    j.pos = {
      scrollbarWidth: function () {
        if (r !== undefined) {
          return r;
        }
        var e, a,
          t = j("<div " + "style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" + "<div style='height:100px;width:auto;'></div></div>"),
          s = t.children()[0];
        j("body").append(t);
        e = s.offsetWidth;
        t.css("overflow", "scroll");
        a = s.offsetWidth;
        if (e === a) {
          a = t[0].clientWidth;
        }
        t.remove();
        return r = e - a;
      },
      getScrollInfo: function (e) {
        var a = e.isWindow || e.isDocument ? "" : e.element.css("overflow-x"),
          t = e.isWindow || e.isDocument ? "" : e.element.css("overflow-y"),
          s = a === "scroll" || a === "auto" && e.width < e.element[0].scrollWidth,
          r = t === "scroll" || t === "auto" && e.height < e.element[0].scrollHeight;
        return {
          width: r ? j.pos.scrollbarWidth() : 0,
          height: s ? j.pos.scrollbarWidth() : 0
        };
      },
      getWithinInfo: function (e) {
        var a = j(e || window), t = j.isWindow(a[0]), s = !!a[0] && a[0].nodeType === 9, r = !t && !s;
        return {
          element: a,
          isWindow: t,
          isDocument: s,
          offset: r ? j(e).offset() : {
            left: 0,
            top: 0
          },
          scrollLeft: a.scrollLeft(),
          scrollTop: a.scrollTop(),
          width: a.outerWidth(),
          height: a.outerHeight()
        };
      }
    };
    j.fn.pos = function (h) {
      if (!h || !h.of) {
        return a.apply(this, arguments);
      }
      h = j.extend({}, h);
      var m, p, d, u, T, e, g = j(h.of), b = j.pos.getWithinInfo(h.within), k = j.pos.getScrollInfo(b),
        w = (h.collision || "flip").split(" "), v = {};
      e = t(g);
      if (g[0].preventDefault) {
        h.at = "left top";
      }
      p = e.width;
      d = e.height;
      u = e.offset;
      T = j.extend({}, u);
      j.each(["my", "at"], function () {
        var e = (h[this] || "").split(" "), a, t;
        if (e.length === 1) {
          e = s.test(e[0]) ? e.concat(["center"]) : i.test(e[0]) ? ["center"].concat(e) : ["center", "center"];
        }
        e[0] = s.test(e[0]) ? e[0] : "center";
        e[1] = i.test(e[1]) ? e[1] : "center";
        a = f.exec(e[0]);
        t = f.exec(e[1]);
        v[this] = [a ? a[0] : 0, t ? t[0] : 0];
        h[this] = [l.exec(e[0])[0], l.exec(e[1])[0]];
      });
      if (w.length === 1) {
        w[1] = w[0];
      }
      if (h.at[0] === "right") {
        T.left += p;
      } else if (h.at[0] === "center") {
        T.left += p / 2;
      }
      if (h.at[1] === "bottom") {
        T.top += d;
      } else if (h.at[1] === "center") {
        T.top += d / 2;
      }
      m = q(v.at, p, d);
      T.left += m[0];
      T.top += m[1];
      return this.each(function () {
        var t, e, f = j(this), l = f.outerWidth(), c = f.outerHeight(), a = C(this, "marginLeft"),
          s = C(this, "marginTop"), r = l + a + C(this, "marginRight") + k.width,
          i = c + s + C(this, "marginBottom") + k.height, o = j.extend({}, T),
          n = q(v.my, f.outerWidth(), f.outerHeight());
        if (h.my[0] === "right") {
          o.left -= l;
        } else if (h.my[0] === "center") {
          o.left -= l / 2;
        }
        if (h.my[1] === "bottom") {
          o.top -= c;
        } else if (h.my[1] === "center") {
          o.top -= c / 2;
        }
        o.left += n[0];
        o.top += n[1];
        t = {
          marginLeft: a,
          marginTop: s
        };
        j.each(["left", "top"], function (e, a) {
          if (j.ui.pos[w[e]]) {
            j.ui.pos[w[e]][a](o, {
              targetWidth: p,
              targetHeight: d,
              elemWidth: l,
              elemHeight: c,
              collisionPosition: t,
              collisionWidth: r,
              collisionHeight: i,
              offset: [m[0] + n[0], m[1] + n[1]],
              my: h.my,
              at: h.at,
              within: b,
              elem: f
            });
          }
        });
        if (h.using) {
          e = function (e) {
            var a = u.left - o.left, t = a + p - l, s = u.top - o.top, r = s + d - c, i = {
              target: {
                element: g,
                left: u.left,
                top: u.top,
                width: p,
                height: d
              },
              element: {
                element: f,
                left: o.left,
                top: o.top,
                width: l,
                height: c
              },
              horizontal: t < 0 ? "left" : a > 0 ? "right" : "center",
              vertical: r < 0 ? "top" : s > 0 ? "bottom" : "middle"
            };
            if (p < l && x(a + t) < p) {
              i.horizontal = "center";
            }
            if (d < c && x(s + r) < d) {
              i.vertical = "middle";
            }
            if (y(x(a), x(t)) > y(x(s), x(r))) {
              i.important = "horizontal";
            } else {
              i.important = "vertical";
            }
            h.using.call(this, e, i);
          };
        }
        f.offset(j.extend(o, {
          using: e
        }));
      });
    };
    j.ui.pos = {
      _trigger: function (e, a, t, s) {
        if (a.elem) {
          a.elem.trigger({
            type: t,
            position: e,
            positionData: a,
            triggered: s
          });
        }
      },
      fit: {
        left: function (e, a) {
          j.ui.pos._trigger(e, a, "posCollide", "fitLeft");
          var t = a.within, s = t.isWindow ? t.scrollLeft : t.offset.left, r = t.width,
            i = e.left - a.collisionPosition.marginLeft, f = s - i, l = i + a.collisionWidth - r - s, c;
          if (a.collisionWidth > r) {
            if (f > 0 && l <= 0) {
              c = e.left + f + a.collisionWidth - r - s;
              e.left += f - c;
            } else if (l > 0 && f <= 0) {
              e.left = s;
            } else {
              if (f > l) {
                e.left = s + r - a.collisionWidth;
              } else {
                e.left = s;
              }
            }
          } else if (f > 0) {
            e.left += f;
          } else if (l > 0) {
            e.left -= l;
          } else {
            e.left = y(e.left - i, e.left);
          }
          j.ui.pos._trigger(e, a, "posCollided", "fitLeft");
        },
        top: function (e, a) {
          j.ui.pos._trigger(e, a, "posCollide", "fitTop");
          var t = a.within, s = t.isWindow ? t.scrollTop : t.offset.top, r = a.within.height,
            i = e.top - a.collisionPosition.marginTop, f = s - i, l = i + a.collisionHeight - r - s, c;
          if (a.collisionHeight > r) {
            if (f > 0 && l <= 0) {
              c = e.top + f + a.collisionHeight - r - s;
              e.top += f - c;
            } else if (l > 0 && f <= 0) {
              e.top = s;
            } else {
              if (f > l) {
                e.top = s + r - a.collisionHeight;
              } else {
                e.top = s;
              }
            }
          } else if (f > 0) {
            e.top += f;
          } else if (l > 0) {
            e.top -= l;
          } else {
            e.top = y(e.top - i, e.top);
          }
          j.ui.pos._trigger(e, a, "posCollided", "fitTop");
        }
      },
      flip: {
        left: function (e, a) {
          j.ui.pos._trigger(e, a, "posCollide", "flipLeft");
          var t = a.within, s = t.offset.left + t.scrollLeft, r = t.width,
            i = t.isWindow ? t.scrollLeft : t.offset.left, f = e.left - a.collisionPosition.marginLeft, l = f - i,
            c = f + a.collisionWidth - r - i,
            o = a.my[0] === "left" ? -a.elemWidth : a.my[0] === "right" ? a.elemWidth : 0,
            n = a.at[0] === "left" ? a.targetWidth : a.at[0] === "right" ? -a.targetWidth : 0, h = -2 * a.offset[0], m,
            p;
          if (l < 0) {
            m = e.left + o + n + h + a.collisionWidth - r - s;
            if (m < 0 || m < x(l)) {
              e.left += o + n + h;
            }
          } else if (c > 0) {
            p = e.left - a.collisionPosition.marginLeft + o + n + h - i;
            if (p > 0 || x(p) < c) {
              e.left += o + n + h;
            }
          }
          j.ui.pos._trigger(e, a, "posCollided", "flipLeft");
        },
        top: function (e, a) {
          j.ui.pos._trigger(e, a, "posCollide", "flipTop");
          var t = a.within, s = t.offset.top + t.scrollTop, r = t.height, i = t.isWindow ? t.scrollTop : t.offset.top,
            f = e.top - a.collisionPosition.marginTop, l = f - i, c = f + a.collisionHeight - r - i,
            o = a.my[1] === "top", n = o ? -a.elemHeight : a.my[1] === "bottom" ? a.elemHeight : 0,
            h = a.at[1] === "top" ? a.targetHeight : a.at[1] === "bottom" ? -a.targetHeight : 0, m = -2 * a.offset[1],
            p, d;
          if (l < 0) {
            d = e.top + n + h + m + a.collisionHeight - r - s;
            if (d < 0 || d < x(l)) {
              e.top += n + h + m;
            }
          } else if (c > 0) {
            p = e.top - a.collisionPosition.marginTop + n + h + m - i;
            if (p > 0 || x(p) < c) {
              e.top += n + h + m;
            }
          }
          j.ui.pos._trigger(e, a, "posCollided", "flipTop");
        }
      },
      flipfit: {
        left: function () {
          j.ui.pos.flip.left.apply(this, arguments);
          j.ui.pos.fit.left.apply(this, arguments);
        },
        top: function () {
          j.ui.pos.flip.top.apply(this, arguments);
          j.ui.pos.fit.top.apply(this, arguments);
        }
      }
    };
    (function () {
      var e, a, t, s, r, i = document.getElementsByTagName("body")[0], f = document.createElement("div");
      e = document.createElement(i ? "div" : "body");
      t = {
        visibility: "hidden",
        width: 0,
        height: 0,
        border: 0,
        margin: 0,
        background: "none"
      };
      if (i) {
        j.extend(t, {
          position: "absolute",
          left: "-1000px",
          top: "-1000px"
        });
      }
      for (r in t) {
        e.style[r] = t[r];
      }
      e.appendChild(f);
      a = i || document.documentElement;
      a.insertBefore(e, a.firstChild);
      f.style.cssText = "position: absolute; left: 10.7432222px;";
      s = j(f).offset().left;
      j.support.offsetFractions = s > 10 && s < 11;
      e.innerHTML = "";
      a.removeChild(e);
    })();
  })();
  var a = j.ui.position;
});

(function (e) {
  "use strict";
  if (typeof define === "function" && define.amd) {
    define(["jquery"], e);
  } else if (window.jQuery && !window.jQuery.fn.iconpicker) {
    e(window.jQuery);
  }
})(function (c) {
  "use strict";
  var f = {
    isEmpty: function (e) {
      return e === false || e === "" || e === null || e === undefined;
    },
    isEmptyObject: function (e) {
      return this.isEmpty(e) === true || e.length === 0;
    },
    isElement: function (e) {
      return c(e).length > 0;
    },
    isString: function (e) {
      return typeof e === "string" || e instanceof String;
    },
    isArray: function (e) {
      return c.isArray(e);
    },
    inArray: function (e, a) {
      return c.inArray(e, a) !== -1;
    },
    throwError: function (e) {
      throw "Font Awesome Icon Picker Exception: " + e;
    }
  };
  var t = function (e, a) {
    this._id = t._idCounter++;
    this.element = c(e).addClass("iconpicker-element");
    this._trigger("iconpickerCreate", {
      iconpickerValue: this.iconpickerValue
    });
    this.options = c.extend({}, t.defaultOptions, this.element.data(), a);
    this.options.templates = c.extend({}, t.defaultOptions.templates, this.options.templates);
    this.options.originalPlacement = this.options.placement;
    this.container = f.isElement(this.options.container) ? c(this.options.container) : false;
    if (this.container === false) {
      if (this.element.is(".dropdown-toggle")) {
        this.container = c("~ .dropdown-menu:first", this.element);
      } else {
        this.container = this.element.is("input,textarea,button,.btn") ? this.element.parent() : this.element;
      }
    }
    this.container.addClass("iconpicker-container");
    if (this.isDropdownMenu()) {
      this.options.placement = "inline";
    }
    this.input = this.element.is("input,textarea") ? this.element.addClass("iconpicker-input") : false;
    if (this.input === false) {
      this.input = this.container.find(this.options.input);
      if (!this.input.is("input,textarea")) {
        this.input = false;
      }
    }
    this.component = this.isDropdownMenu() ? this.container.parent().find(this.options.component) : this.container.find(this.options.component);
    if (this.component.length === 0) {
      this.component = false;
    } else {
      this.component.find("i").addClass("iconpicker-component");
    }
    this._createPopover();
    this._createIconpicker();
    if (this.getAcceptButton().length === 0) {
      this.options.mustAccept = false;
    }
    if (this.isInputGroup()) {
      this.container.parent().append(this.popover);
    } else {
      this.container.append(this.popover);
    }
    this._bindElementEvents();
    this._bindWindowEvents();
    this.update(this.options.selected);
    if (this.isInline()) {
      this.show();
    }
    this._trigger("iconpickerCreated", {
      iconpickerValue: this.iconpickerValue
    });
  };
  t._idCounter = 0;
  t.defaultOptions = {
    title: false,
    selected: false,
    defaultValue: false,
    placement: "bottom",
    collision: "none",
    animation: true,
    hideOnSelect: false,
    showFooter: false,
    searchInFooter: false,
    mustAccept: false,
    selectedCustomClass: "bg-primary",
    icons: [],
    fullClassFormatter: function (e) {
      return e;
    },
    input: "input,.iconpicker-input",
    inputSearch: false,
    container: false,
    component: ".input-group-addon,.iconpicker-component",
    templates: {
      popover: '<div class="iconpicker-popover popover" role="tooltip"><div class="arrow"></div>' + '<div class="popover-title"></div><div class="popover-content"></div></div>',
      footer: '<div class="popover-footer"></div>',
      buttons: '<button class="iconpicker-btn iconpicker-btn-cancel btn btn-default btn-sm">Cancel</button>' + ' <button class="iconpicker-btn iconpicker-btn-accept btn btn-primary btn-sm">Accept</button>',
      search: '<input type="search" class="form-control iconpicker-search" placeholder="Type to filter" />',
      iconpicker: '<div class="iconpicker"><div class="iconpicker-items"></div></div>',
      iconpickerItem: '<a role="button" href="javascript:;" class="iconpicker-item"><i></i></a>'
    }
  };
  t.batch = function (e, a) {
    var t = Array.prototype.slice.call(arguments, 2);
    return c(e).each(function () {
      var e = c(this).data("iconpicker");
      if (!!e) {
        e[a].apply(e, t);
      }
    });
  };
  t.prototype = {
    constructor: t,
    options: {},
    _id: 0,
    _trigger: function (e, a) {
      a = a || {};
      this.element.trigger(c.extend({
        type: e,
        iconpickerInstance: this
      }, a));
    },
    _createPopover: function () {
      this.popover = c(this.options.templates.popover);
      var e = this.popover.find(".popover-title");
      if (!!this.options.title) {
        e.append(c('<div class="popover-title-text">' + this.options.title + "</div>"));
      }
      if (this.hasSeparatedSearchInput() && !this.options.searchInFooter) {
        e.append(this.options.templates.search);
      } else if (!this.options.title) {
        e.remove();
      }
      if (this.options.showFooter && !f.isEmpty(this.options.templates.footer)) {
        var a = c(this.options.templates.footer);
        if (this.hasSeparatedSearchInput() && this.options.searchInFooter) {
          a.append(c(this.options.templates.search));
        }
        if (!f.isEmpty(this.options.templates.buttons)) {
          a.append(c(this.options.templates.buttons));
        }
        this.popover.append(a);
      }
      if (this.options.animation === true) {
        this.popover.addClass("fade show");
      }
      return this.popover;
    },
    _createIconpicker: function () {
      var t = this;
      this.iconpicker = c(this.options.templates.iconpicker);
      var e = function (e) {
        var a = c(this);
        if (a.is("i")) {
          a = a.parent();
        }
        t._trigger("iconpickerSelect", {
          iconpickerItem: a,
          iconpickerValue: t.iconpickerValue
        });
        if (t.options.mustAccept === false) {
          t.update(a.data("iconpickerValue"));
          t._trigger("iconpickerSelected", {
            iconpickerItem: this,
            iconpickerValue: t.iconpickerValue
          });
        } else {
          t.update(a.data("iconpickerValue"), true);
        }
        if (t.options.hideOnSelect && t.options.mustAccept === false) {
          t.hide();
        }
      };
      var a = c(this.options.templates.iconpickerItem);
      var s = [];
      for (var r in this.options.icons) {
        if (typeof this.options.icons[r].title === "string") {
          var i = a.clone();
          i.find("i").addClass(this.options.fullClassFormatter(this.options.icons[r].title));
          i.data("iconpickerValue", this.options.icons[r].title).on("click.iconpicker", e);
          i.attr("title", "." + this.options.icons[r].title);
          if (this.options.icons[r].searchTerms.length > 0) {
            var f = "";
            for (var l = 0; l < this.options.icons[r].searchTerms.length; l++) {
              f = f + this.options.icons[r].searchTerms[l] + " ";
            }
            i.attr("data-search-terms", f);
          }
          s.push(i);
        }
      }
      this.iconpicker.find(".iconpicker-items").append(s);
      this.popover.find(".popover-content").append(this.iconpicker);
      return this.iconpicker;
    },
    _isEventInsideIconpicker: function (e) {
      var a = c(e.target);
      if ((!a.hasClass("iconpicker-element") || a.hasClass("iconpicker-element") && !a.is(this.element)) && a.parents(".iconpicker-popover").length === 0) {
        return false;
      }
      return true;
    },
    _bindElementEvents: function () {
      var a = this;
      this.getSearchInput().on("keyup.iconpicker", function () {
        a.filter(c(this).val().toLowerCase());
      });
      this.getAcceptButton().on("click.iconpicker", function () {
        var e = a.iconpicker.find(".iconpicker-selected").get(0);
        a.update(a.iconpickerValue);
        a._trigger("iconpickerSelected", {
          iconpickerItem: e,
          iconpickerValue: a.iconpickerValue
        });
        if (!a.isInline()) {
          a.hide();
        }
      });
      this.getCancelButton().on("click.iconpicker", function () {
        if (!a.isInline()) {
          a.hide();
        }
      });
      this.element.on("focus.iconpicker", function (e) {
        a.show();
        e.stopPropagation();
      });
      if (this.hasComponent()) {
        this.component.on("click.iconpicker", function () {
          a.toggle();
        });
      }
      if (this.hasInput()) {
        this.input.on("keyup.iconpicker", function (e) {
          if (!f.inArray(e.keyCode, [38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86])) {
            a.update();
          } else {
            a._updateFormGroupStatus(a.getValid(this.value) !== false);
          }
          if (a.options.inputSearch === true) {
            a.filter(c(this).val().toLowerCase());
          }
        });
      }
    },
    _bindWindowEvents: function () {
      var e = c(window.document);
      var a = this;
      var t = ".iconpicker.inst" + this._id;
      c(window).on("resize.iconpicker" + t + " orientationchange.iconpicker" + t, function (e) {
        if (a.popover.hasClass("in")) {
          a.updatePlacement();
        }
      });
      if (!a.isInline()) {
        e.on("mouseup" + t, function (e) {
          if (!a._isEventInsideIconpicker(e) && !a.isInline()) {
            a.hide();
          }
        });
      }
    },
    _unbindElementEvents: function () {
      this.popover.off(".iconpicker");
      this.element.off(".iconpicker");
      if (this.hasInput()) {
        this.input.off(".iconpicker");
      }
      if (this.hasComponent()) {
        this.component.off(".iconpicker");
      }
      if (this.hasContainer()) {
        this.container.off(".iconpicker");
      }
    },
    _unbindWindowEvents: function () {
      c(window).off(".iconpicker.inst" + this._id);
      c(window.document).off(".iconpicker.inst" + this._id);
    },
    updatePlacement: function (e, a) {
      e = e || this.options.placement;
      this.options.placement = e;
      a = a || this.options.collision;
      a = a === true ? "flip" : a;
      var t = {
        at: "right bottom",
        my: "right top",
        of: this.hasInput() && !this.isInputGroup() ? this.input : this.container,
        collision: a === true ? "flip" : a,
        within: window
      };
      this.popover.removeClass("inline topLeftCorner topLeft top topRight topRightCorner " + "rightTop right rightBottom bottomRight bottomRightCorner " + "bottom bottomLeft bottomLeftCorner leftBottom left leftTop");
      if (typeof e === "object") {
        return this.popover.pos(c.extend({}, t, e));
      }
      switch (e) {
        case "inline": {
          t = false;
        }
          break;

        case "topLeftCorner": {
          t.my = "right bottom";
          t.at = "left top";
        }
          break;

        case "topLeft": {
          t.my = "left bottom";
          t.at = "left top";
        }
          break;

        case "top": {
          t.my = "center bottom";
          t.at = "center top";
        }
          break;

        case "topRight": {
          t.my = "right bottom";
          t.at = "right top";
        }
          break;

        case "topRightCorner": {
          t.my = "left bottom";
          t.at = "right top";
        }
          break;

        case "rightTop": {
          t.my = "left bottom";
          t.at = "right center";
        }
          break;

        case "right": {
          t.my = "left center";
          t.at = "right center";
        }
          break;

        case "rightBottom": {
          t.my = "left top";
          t.at = "right center";
        }
          break;

        case "bottomRightCorner": {
          t.my = "left top";
          t.at = "right bottom";
        }
          break;

        case "bottomRight": {
          t.my = "right top";
          t.at = "right bottom";
        }
          break;

        case "bottom": {
          t.my = "center top";
          t.at = "center bottom";
        }
          break;

        case "bottomLeft": {
          t.my = "left top";
          t.at = "left bottom";
        }
          break;

        case "bottomLeftCorner": {
          t.my = "right top";
          t.at = "left bottom";
        }
          break;

        case "leftBottom": {
          t.my = "right top";
          t.at = "left center";
        }
          break;

        case "left": {
          t.my = "right center";
          t.at = "left center";
        }
          break;

        case "leftTop": {
          t.my = "right bottom";
          t.at = "left center";
        }
          break;

        default: {
          return false;
        }
          break;
      }
      this.popover.css({
        display: this.options.placement === "inline" ? "" : "block"
      });
      if (t !== false) {
        this.popover.pos(t).css("maxWidth", c(window).width() - this.container.offset().left - 5);
      } else {
        this.popover.css({
          top: "auto",
          right: "auto",
          bottom: "auto",
          left: "auto",
          maxWidth: "none"
        });
      }
      this.popover.addClass(this.options.placement);
      return true;
    },
    _updateComponents: function () {
      this.iconpicker.find(".iconpicker-item.iconpicker-selected").removeClass("iconpicker-selected " + this.options.selectedCustomClass);
      if (this.iconpickerValue) {
        this.iconpicker.find("." + this.options.fullClassFormatter(this.iconpickerValue).replace(/ /g, ".")).parent().addClass("iconpicker-selected " + this.options.selectedCustomClass);
      }
      if (this.hasComponent()) {
        var e = this.component.find("i");
        if (e.length > 0) {
          e.attr("class", this.options.fullClassFormatter(this.iconpickerValue));
        } else {
          this.component.html(this.getHtml());
        }
      }
    },
    _updateFormGroupStatus: function (e) {
      if (this.hasInput()) {
        if (e !== false) {
          this.input.parents(".form-group:first").removeClass("has-error");
        } else {
          this.input.parents(".form-group:first").addClass("has-error");
        }
        return true;
      }
      return false;
    },
    getValid: function (e) {
      if (!f.isString(e)) {
        e = "";
      }
      var a = e === "";
      e = c.trim(e);
      var t = false;
      for (var s = 0; s < this.options.icons.length; s++) {
        if (this.options.icons[s].title === e) {
          t = true;
          break;
        }
      }
      if (t || a) {
        return e;
      }
      return false;
    },
    setValue: function (e) {
      var a = this.getValid(e);
      if (a !== false) {
        this.iconpickerValue = a;
        this._trigger("iconpickerSetValue", {
          iconpickerValue: a
        });
        return this.iconpickerValue;
      } else {
        this._trigger("iconpickerInvalid", {
          iconpickerValue: e
        });
        return false;
      }
    },
    getHtml: function () {
      return '<i class="' + this.options.fullClassFormatter(this.iconpickerValue) + '"></i>';
    },
    setSourceValue: function (e) {
      e = this.setValue(e);
      if (e !== false && e !== "") {
        if (this.hasInput()) {
          this.input.val(this.iconpickerValue);
        } else {
          this.element.data("iconpickerValue", this.iconpickerValue);
        }
        this._trigger("iconpickerSetSourceValue", {
          iconpickerValue: e
        });
      }
      return e;
    },
    getSourceValue: function (e) {
      e = e || this.options.defaultValue;
      var a = e;
      if (this.hasInput()) {
        a = this.input.val();
      } else {
        a = this.element.data("iconpickerValue");
      }
      if (a === undefined || a === "" || a === null || a === false) {
        a = e;
      }
      return a;
    },
    hasInput: function () {
      return this.input !== false;
    },
    isInputSearch: function () {
      return this.hasInput() && this.options.inputSearch === true;
    },
    isInputGroup: function () {
      return this.container.is(".input-group");
    },
    isDropdownMenu: function () {
      return this.container.is(".dropdown-menu");
    },
    hasSeparatedSearchInput: function () {
      return this.options.templates.search !== false && !this.isInputSearch();
    },
    hasComponent: function () {
      return this.component !== false;
    },
    hasContainer: function () {
      return this.container !== false;
    },
    getAcceptButton: function () {
      return this.popover.find(".iconpicker-btn-accept");
    },
    getCancelButton: function () {
      return this.popover.find(".iconpicker-btn-cancel");
    },
    getSearchInput: function () {
      return this.popover.find(".iconpicker-search");
    },
    filter: function (r) {
      if (f.isEmpty(r)) {
        this.iconpicker.find(".iconpicker-item").show();
        return c(false);
      } else {
        var i = [];
        this.iconpicker.find(".iconpicker-item").each(function () {
          var e = c(this);
          var a = e.attr("title").toLowerCase();
          var t = e.attr("data-search-terms") ? e.attr("data-search-terms").toLowerCase() : "";
          a = a + " " + t;
          var s = false;
          try {
            s = new RegExp("(^|\\W)" + r, "g");
          } catch (e) {
            s = false;
          }
          if (s !== false && a.match(s)) {
            i.push(e);
            e.show();
          } else {
            e.hide();
          }
        });
        return i;
      }
    },
    show: function () {
      if (this.popover.hasClass("in")) {
        return false;
      }
      c.iconpicker.batch(c(".iconpicker-popover.in:not(.inline)").not(this.popover), "hide");
      this._trigger("iconpickerShow", {
        iconpickerValue: this.iconpickerValue
      });
      this.updatePlacement();
      this.popover.addClass("in");
      setTimeout(c.proxy(function () {
        this.popover.css("display", this.isInline() ? "" : "block");
        this._trigger("iconpickerShown", {
          iconpickerValue: this.iconpickerValue
        });
      }, this), this.options.animation ? 300 : 1);
    },
    hide: function () {
      if (!this.popover.hasClass("in")) {
        return false;
      }
      this._trigger("iconpickerHide", {
        iconpickerValue: this.iconpickerValue
      });
      this.popover.removeClass("in");
      setTimeout(c.proxy(function () {
        this.popover.css("display", "none");
        this.getSearchInput().val("");
        this.filter("");
        this._trigger("iconpickerHidden", {
          iconpickerValue: this.iconpickerValue
        });
      }, this), this.options.animation ? 300 : 1);
    },
    toggle: function () {
      if (this.popover.is(":visible")) {
        this.hide();
      } else {
        this.show(true);
      }
    },
    update: function (e, a) {
      e = e ? e : this.getSourceValue(this.iconpickerValue);
      this._trigger("iconpickerUpdate", {
        iconpickerValue: this.iconpickerValue
      });
      if (a === true) {
        e = this.setValue(e);
      } else {
        e = this.setSourceValue(e);
        this._updateFormGroupStatus(e !== false);
      }
      if (e !== false) {
        this._updateComponents();
      }
      this._trigger("iconpickerUpdated", {
        iconpickerValue: this.iconpickerValue
      });
      return e;
    },
    destroy: function () {
      this._trigger("iconpickerDestroy", {
        iconpickerValue: this.iconpickerValue
      });
      this.element.removeData("iconpicker").removeData("iconpickerValue").removeClass("iconpicker-element");
      this._unbindElementEvents();
      this._unbindWindowEvents();
      c(this.popover).remove();
      this._trigger("iconpickerDestroyed", {
        iconpickerValue: this.iconpickerValue
      });
    },
    disable: function () {
      if (this.hasInput()) {
        this.input.prop("disabled", true);
        return true;
      }
      return false;
    },
    enable: function () {
      if (this.hasInput()) {
        this.input.prop("disabled", false);
        return true;
      }
      return false;
    },
    isDisabled: function () {
      if (this.hasInput()) {
        return this.input.prop("disabled") === true;
      }
      return false;
    },
    isInline: function () {
      return this.options.placement === "inline" || this.popover.hasClass("inline");
    }
  };
  c.iconpicker = t;
  c.fn.iconpicker = function (a) {
    return this.each(function () {
      var e = c(this);
      if (!e.data("iconpicker")) {
        e.data("iconpicker", new t(this, typeof a === "object" ? a : {}));
      }
    });
  };
});
