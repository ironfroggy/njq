function njq(arg) {
    let results
    if (typeof arg === 'undefined') {
        results = []
    } else if (arg instanceof Element) {
        results = [arg]
    } else if (typeof arg === 'string') {
        // If the argument looks like HTML, parse it into a DOM fragment
        if (arg.startsWith('<')) {
            let fragment = document.createRange().createContextualFragment(arg)
            results = [fragment]
        } else {
            // Convert the NodeList from querySelectorAll into a proper Array
            results = Array.prototype.slice.call(document.querySelectorAll(arg))
        }
    } else {
        // Assume an array-like argument and convert to an actual array
        results = Array.prototype.slice.call(arg)
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
    on: function(event) {
        let delegate, cb
        let root = this

        // When called with 2 args, accept 2nd arg as callback
        if (arguments.length === 2) {
            cb = arguments[1]
        // When called with 3 args, accept 2nd arg as delegate selector,
        // 3rd arg as callback
        } else {
            delegate = arguments[1]
            cb = arguments[2]
        }
        this.each((el) => {
            el.addEventListener(event, function(ev) {
                // If this was a delegate event binding,
                // skip the event if the event target is not inside
                // the delegate selection.
                if (typeof delegate !== 'undefined') {
                    if (!root.find(delegate).includes(ev.target)) {
                        return
                    }
                }
                // Invoke the event handler with the event arguments
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
        if (arguments.length === 0) {
            return this[0].innerText
        } else {
            this.each((el) => el.innerText = t)
        }
    },
    html: function(t) {
        if (arguments.length === 0) {
            return this[0].innerHTML
        } else {
            this.each((el) => el.innerHTML = t)
        }
    },
    css: function(style, value) {
        if (typeof style === 'string') {
            if (typeof value === 'undefined') {
                return getComputedStyle(this[0])[style]
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

    replaceWith: function(replacement) {
        let $replacement = njq(replacement)
        let combinedHTML = []
        $replacement.each((el) => {
            combinedHTML.push(el.innerHTML)
        })
        let fragment = document.createRange().createContextualFragment(combinedHTML)
        this.each((el) => {
            el.parentNode.replaceChild(fragment, el)
        })
    },
    replaceAll: function(target) {
        njq(target).replaceWith(this)
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
