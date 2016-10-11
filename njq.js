function njq(selector) {
    let results
    if (typeof selector === 'undefined') {
        results = []
    } else if (selector instanceof Element) {
        results = [selector]
    } else if (typeof selector === 'string') {
        results = Array(...document.querySelectorAll(selector))
    } else {
        results = [...selector]
    }
    results.__proto__ = njq.methods
    return results
}

njq.methods = {
    each: function(func) {
        Array.prototype.forEach.call(this, func)
    },
    find: function(selector) {
        var seen = new Set()
        var results = njq()
        this.each((el) => {
            Array.prototype.forEach.call(el.querySelectorAll(selector), (child) => {
                if (!seen.has(child)) {
                    seen.add(child)
                    results.push(child)
                }
            })
        })
        return results
    },
    closest: function(selector) {
        var closest = new Set()
        this.each((el) => {
            let curEl = el
            while (curEl.parentElement && !curEl.parentElement.matches(selector)) {
                curEl = curEl.parentElement
            }
            if (curEl.parentElement) {
                closest.add(curEl.parentElement)
            }
        })
        return njq(closest)
    },
    on: function() {
        let event, delegate, cb
        let root = this
        event = arguments[0]
        if (arguments.length === 2) {
            cb = arguments[1]
        } else {
            delegate = arguments[1]
            cb = arguments[2]
        }
        this.each((el) => {
            el.addEventListener(event, function(ev) {
                if (typeof delegate !== 'undefined') {
                    if (!root.find(delegate).includes(ev.target)) {
                        return
                    }
                }
                cb.apply(this, arguments)
            }, cb, false)
        })
    },
    off: function(event, cb) {
        this.each((el) => {
            el.removeEventListener(event, cb)
        })
    },
    attr: function(name, value) {
        if (typeof value === 'undefined') {
            return this[0].getAttribute(name)
        } else {
            this.each((el) => el.setAttribute(name, value))
        }
    },
    text: function(t) {
        this.each((el) => el.innerText = t)
    },
    html: function(t) {
        this.each((el) => el.innerHTML = t)
    },
    css: function(style, value) {
        if (typeof style === 'string') {
            if (typeof value === 'undefined') {
                return this[0].style[style]
            } else {
                this.each((el) => el.style[style] = value)
            }
        } else {
            this.each((el) => Object.assign(el.style, style))
        }
    },
    toggle: function(className) {
        this.each((el) => {
            el.classList.toggle(className)
        })
    },
    addClass: function(className) {
        this.each((el) => {
            el.classList.add(className)
        })
    },
    removeClass: function(className) {
        this.each((el) => {
            el.classList.remove(className)
        })
    },

    clone: function() {
        return njq(Array.prototype.map.call(this, (el) => el.cloneNode(true)))
    },

    append: function(content) {
        if (typeof content === 'string') {
            this.each((el) => el.innerHTML += content)
        } else if (content instanceof Element) {
            this.each((el) => el.appendChild(content.cloneNode(true)))
        } else if (content instanceof Array) {
            content.forEach((each) => this.append(each))
        }
    },
    prepend: function(content) {
        if (typeof content === 'string') {
            this.each((el) => el.innerHTML = content + el.innerHTML)
        } else if (content instanceof Element) {
            this.each((el) => el.parentNode.insertBefore(content.cloneNode(true), el))
        } else if (content instanceof Array) {
            content.forEach((each) => this.prepend(each))
        }
    },
}
njq.methods.__proto__ = Array.prototype
