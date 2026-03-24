function e(t) {
	"@babel/helpers - typeof";
	return e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, e(t);
}
function t(t, n) {
	if (e(t) != "object" || !t) return t;
	var r = t[Symbol.toPrimitive];
	if (r !== void 0) {
		var i = r.call(t, n || "default");
		if (e(i) != "object") return i;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (n === "string" ? String : Number)(t);
}
function n(n) {
	var r = t(n, "string");
	return e(r) == "symbol" ? r : r + "";
}
function r(e, t, r) {
	return (t = n(t)) in e ? Object.defineProperty(e, t, {
		value: r,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = r, e;
}
function i(e, t, n, r, i, a, o) {
	try {
		var s = e[a](o), c = s.value;
	} catch (e) {
		n(e);
		return;
	}
	s.done ? t(c) : Promise.resolve(c).then(r, i);
}
function a(e) {
	return function() {
		var t = this, n = arguments;
		return new Promise(function(r, a) {
			var o = e.apply(t, n);
			function s(e) {
				i(o, r, a, s, c, "next", e);
			}
			function c(e) {
				i(o, r, a, s, c, "throw", e);
			}
			s(void 0);
		});
	};
}
function o(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function s(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? o(Object(n), !0).forEach(function(t) {
			r(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : o(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
var c = class {
	constructor() {
		r(this, "field", "value");
	}
	method() {
		var e = this;
		return a(function* () {
			return yield e.getData();
		})();
	}
	getData() {
		return a(function* () {
			return Promise.resolve("data");
		})();
	}
}, l = s({ a: 1 }, { b: 2 }), u = [
	1,
	2,
	...[3, 4]
], d = () => "arrow function";
export { c as MyClass, u as arr, d as arrow, l as obj };
