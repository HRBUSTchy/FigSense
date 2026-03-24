#!/usr/bin/env node
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (e && (t = e(e = 0)), t), s = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), c = (e, n) => {
	let r = {};
	for (var i in e) t(r, i, {
		get: e[i],
		enumerable: !0
	});
	return n || t(r, Symbol.toStringTag, { value: "Module" }), r;
}, l = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, u = (n, r, a) => (a = n == null ? {} : e(i(n)), l(r || !n || !n.__esModule ? t(a, "default", {
	value: n,
	enumerable: !0
}) : a, n)), d = (e) => a.call(e, "module.exports") ? e["module.exports"] : l(t({}, "__esModule", { value: !0 }), e), f;
(function(e) {
	e.assertEqual = (e) => {};
	function t(e) {}
	e.assertIs = t;
	function n(e) {
		throw Error();
	}
	e.assertNever = n, e.arrayToEnum = (e) => {
		let t = {};
		for (let n of e) t[n] = n;
		return t;
	}, e.getValidEnumValues = (t) => {
		let n = e.objectKeys(t).filter((e) => typeof t[t[e]] != "number"), r = {};
		for (let e of n) r[e] = t[e];
		return e.objectValues(r);
	}, e.objectValues = (t) => e.objectKeys(t).map(function(e) {
		return t[e];
	}), e.objectKeys = typeof Object.keys == "function" ? (e) => Object.keys(e) : (e) => {
		let t = [];
		for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
		return t;
	}, e.find = (e, t) => {
		for (let n of e) if (t(n)) return n;
	}, e.isInteger = typeof Number.isInteger == "function" ? (e) => Number.isInteger(e) : (e) => typeof e == "number" && Number.isFinite(e) && Math.floor(e) === e;
	function r(e, t = " | ") {
		return e.map((e) => typeof e == "string" ? `'${e}'` : e).join(t);
	}
	e.joinValues = r, e.jsonStringifyReplacer = (e, t) => typeof t == "bigint" ? t.toString() : t;
})(f ||= {});
var p;
(function(e) {
	e.mergeShapes = (e, t) => ({
		...e,
		...t
	});
})(p ||= {});
const m = f.arrayToEnum([
	"string",
	"nan",
	"number",
	"integer",
	"float",
	"boolean",
	"date",
	"bigint",
	"symbol",
	"function",
	"undefined",
	"null",
	"array",
	"object",
	"unknown",
	"promise",
	"void",
	"never",
	"map",
	"set"
]), h = (e) => {
	switch (typeof e) {
		case "undefined": return m.undefined;
		case "string": return m.string;
		case "number": return Number.isNaN(e) ? m.nan : m.number;
		case "boolean": return m.boolean;
		case "function": return m.function;
		case "bigint": return m.bigint;
		case "symbol": return m.symbol;
		case "object": return Array.isArray(e) ? m.array : e === null ? m.null : e.then && typeof e.then == "function" && e.catch && typeof e.catch == "function" ? m.promise : typeof Map < "u" && e instanceof Map ? m.map : typeof Set < "u" && e instanceof Set ? m.set : typeof Date < "u" && e instanceof Date ? m.date : m.object;
		default: return m.unknown;
	}
}, g = f.arrayToEnum([
	"invalid_type",
	"invalid_literal",
	"custom",
	"invalid_union",
	"invalid_union_discriminator",
	"invalid_enum_value",
	"unrecognized_keys",
	"invalid_arguments",
	"invalid_return_type",
	"invalid_date",
	"invalid_string",
	"too_small",
	"too_big",
	"invalid_intersection_types",
	"not_multiple_of",
	"not_finite"
]);
var _ = class e extends Error {
	get errors() {
		return this.issues;
	}
	constructor(e) {
		super(), this.issues = [], this.addIssue = (e) => {
			this.issues = [...this.issues, e];
		}, this.addIssues = (e = []) => {
			this.issues = [...this.issues, ...e];
		};
		let t = new.target.prototype;
		Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
	}
	format(e) {
		let t = e || function(e) {
			return e.message;
		}, n = { _errors: [] }, r = (e) => {
			for (let i of e.issues) if (i.code === "invalid_union") i.unionErrors.map(r);
			else if (i.code === "invalid_return_type") r(i.returnTypeError);
			else if (i.code === "invalid_arguments") r(i.argumentsError);
			else if (i.path.length === 0) n._errors.push(t(i));
			else {
				let e = n, r = 0;
				for (; r < i.path.length;) {
					let n = i.path[r];
					r === i.path.length - 1 ? (e[n] = e[n] || { _errors: [] }, e[n]._errors.push(t(i))) : e[n] = e[n] || { _errors: [] }, e = e[n], r++;
				}
			}
		};
		return r(this), n;
	}
	static assert(t) {
		if (!(t instanceof e)) throw Error(`Not a ZodError: ${t}`);
	}
	toString() {
		return this.message;
	}
	get message() {
		return JSON.stringify(this.issues, f.jsonStringifyReplacer, 2);
	}
	get isEmpty() {
		return this.issues.length === 0;
	}
	flatten(e = (e) => e.message) {
		let t = Object.create(null), n = [];
		for (let r of this.issues) if (r.path.length > 0) {
			let n = r.path[0];
			t[n] = t[n] || [], t[n].push(e(r));
		} else n.push(e(r));
		return {
			formErrors: n,
			fieldErrors: t
		};
	}
	get formErrors() {
		return this.flatten();
	}
};
_.create = (e) => new _(e);
var v = (e, t) => {
	let n;
	switch (e.code) {
		case g.invalid_type:
			n = e.received === m.undefined ? "Required" : `Expected ${e.expected}, received ${e.received}`;
			break;
		case g.invalid_literal:
			n = `Invalid literal value, expected ${JSON.stringify(e.expected, f.jsonStringifyReplacer)}`;
			break;
		case g.unrecognized_keys:
			n = `Unrecognized key(s) in object: ${f.joinValues(e.keys, ", ")}`;
			break;
		case g.invalid_union:
			n = "Invalid input";
			break;
		case g.invalid_union_discriminator:
			n = `Invalid discriminator value. Expected ${f.joinValues(e.options)}`;
			break;
		case g.invalid_enum_value:
			n = `Invalid enum value. Expected ${f.joinValues(e.options)}, received '${e.received}'`;
			break;
		case g.invalid_arguments:
			n = "Invalid function arguments";
			break;
		case g.invalid_return_type:
			n = "Invalid function return type";
			break;
		case g.invalid_date:
			n = "Invalid date";
			break;
		case g.invalid_string:
			typeof e.validation == "object" ? "includes" in e.validation ? (n = `Invalid input: must include "${e.validation.includes}"`, typeof e.validation.position == "number" && (n = `${n} at one or more positions greater than or equal to ${e.validation.position}`)) : "startsWith" in e.validation ? n = `Invalid input: must start with "${e.validation.startsWith}"` : "endsWith" in e.validation ? n = `Invalid input: must end with "${e.validation.endsWith}"` : f.assertNever(e.validation) : n = e.validation === "regex" ? "Invalid" : `Invalid ${e.validation}`;
			break;
		case g.too_small:
			n = e.type === "array" ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "more than"} ${e.minimum} element(s)` : e.type === "string" ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "over"} ${e.minimum} character(s)` : e.type === "number" || e.type === "bigint" ? `Number must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${e.minimum}` : e.type === "date" ? `Date must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(e.minimum))}` : "Invalid input";
			break;
		case g.too_big:
			n = e.type === "array" ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "less than"} ${e.maximum} element(s)` : e.type === "string" ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "under"} ${e.maximum} character(s)` : e.type === "number" ? `Number must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : e.type === "bigint" ? `BigInt must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : e.type === "date" ? `Date must be ${e.exact ? "exactly" : e.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(e.maximum))}` : "Invalid input";
			break;
		case g.custom:
			n = "Invalid input";
			break;
		case g.invalid_intersection_types:
			n = "Intersection results could not be merged";
			break;
		case g.not_multiple_of:
			n = `Number must be a multiple of ${e.multipleOf}`;
			break;
		case g.not_finite:
			n = "Number must be finite";
			break;
		default: n = t.defaultError, f.assertNever(e);
	}
	return { message: n };
}, ee = v;
function te() {
	return ee;
}
const y = (e) => {
	let { data: t, path: n, errorMaps: r, issueData: i } = e, a = [...n, ...i.path || []], o = {
		...i,
		path: a
	};
	if (i.message !== void 0) return {
		...i,
		path: a,
		message: i.message
	};
	let s = "", c = r.filter((e) => !!e).slice().reverse();
	for (let e of c) s = e(o, {
		data: t,
		defaultError: s
	}).message;
	return {
		...i,
		path: a,
		message: s
	};
};
function b(e, t) {
	let n = te(), r = y({
		issueData: t,
		data: e.data,
		path: e.path,
		errorMaps: [
			e.common.contextualErrorMap,
			e.schemaErrorMap,
			n,
			n === v ? void 0 : v
		].filter((e) => !!e)
	});
	e.common.issues.push(r);
}
var x = class e {
	constructor() {
		this.value = "valid";
	}
	dirty() {
		this.value === "valid" && (this.value = "dirty");
	}
	abort() {
		this.value !== "aborted" && (this.value = "aborted");
	}
	static mergeArray(e, t) {
		let n = [];
		for (let r of t) {
			if (r.status === "aborted") return S;
			r.status === "dirty" && e.dirty(), n.push(r.value);
		}
		return {
			status: e.value,
			value: n
		};
	}
	static async mergeObjectAsync(t, n) {
		let r = [];
		for (let e of n) {
			let t = await e.key, n = await e.value;
			r.push({
				key: t,
				value: n
			});
		}
		return e.mergeObjectSync(t, r);
	}
	static mergeObjectSync(e, t) {
		let n = {};
		for (let r of t) {
			let { key: t, value: i } = r;
			if (t.status === "aborted" || i.status === "aborted") return S;
			t.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), t.value !== "__proto__" && (i.value !== void 0 || r.alwaysSet) && (n[t.value] = i.value);
		}
		return {
			status: e.value,
			value: n
		};
	}
};
const S = Object.freeze({ status: "aborted" }), ne = (e) => ({
	status: "dirty",
	value: e
}), C = (e) => ({
	status: "valid",
	value: e
}), re = (e) => e.status === "aborted", ie = (e) => e.status === "dirty", ae = (e) => e.status === "valid", oe = (e) => typeof Promise < "u" && e instanceof Promise;
var w;
(function(e) {
	e.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, e.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(w ||= {});
var se = class {
	constructor(e, t, n, r) {
		this._cachedPath = [], this.parent = e, this.data = t, this._path = n, this._key = r;
	}
	get path() {
		return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
	}
}, ce = (e, t) => {
	if (ae(t)) return {
		success: !0,
		data: t.value
	};
	if (!e.common.issues.length) throw Error("Validation failed but no issues detected.");
	return {
		success: !1,
		get error() {
			return this._error ||= new _(e.common.issues), this._error;
		}
	};
};
function T(e) {
	if (!e) return {};
	let { errorMap: t, invalid_type_error: n, required_error: r, description: i } = e;
	if (t && (n || r)) throw Error("Can't use \"invalid_type_error\" or \"required_error\" in conjunction with custom error map.");
	return t ? {
		errorMap: t,
		description: i
	} : {
		errorMap: (t, i) => {
			let { message: a } = e;
			return t.code === "invalid_enum_value" ? { message: a ?? i.defaultError } : i.data === void 0 ? { message: a ?? r ?? i.defaultError } : t.code === "invalid_type" ? { message: a ?? n ?? i.defaultError } : { message: i.defaultError };
		},
		description: i
	};
}
var E = class {
	get description() {
		return this._def.description;
	}
	_getType(e) {
		return h(e.data);
	}
	_getOrReturnCtx(e, t) {
		return t || {
			common: e.parent.common,
			data: e.data,
			parsedType: h(e.data),
			schemaErrorMap: this._def.errorMap,
			path: e.path,
			parent: e.parent
		};
	}
	_processInputParams(e) {
		return {
			status: new x(),
			ctx: {
				common: e.parent.common,
				data: e.data,
				parsedType: h(e.data),
				schemaErrorMap: this._def.errorMap,
				path: e.path,
				parent: e.parent
			}
		};
	}
	_parseSync(e) {
		let t = this._parse(e);
		if (oe(t)) throw Error("Synchronous parse encountered promise.");
		return t;
	}
	_parseAsync(e) {
		let t = this._parse(e);
		return Promise.resolve(t);
	}
	parse(e, t) {
		let n = this.safeParse(e, t);
		if (n.success) return n.data;
		throw n.error;
	}
	safeParse(e, t) {
		let n = {
			common: {
				issues: [],
				async: (t == null ? void 0 : t.async) ?? !1,
				contextualErrorMap: t == null ? void 0 : t.errorMap
			},
			path: (t == null ? void 0 : t.path) || [],
			schemaErrorMap: this._def.errorMap,
			parent: null,
			data: e,
			parsedType: h(e)
		};
		return ce(n, this._parseSync({
			data: e,
			path: n.path,
			parent: n
		}));
	}
	"~validate"(e) {
		let t = {
			common: {
				issues: [],
				async: !!this["~standard"].async
			},
			path: [],
			schemaErrorMap: this._def.errorMap,
			parent: null,
			data: e,
			parsedType: h(e)
		};
		if (!this["~standard"].async) try {
			let n = this._parseSync({
				data: e,
				path: [],
				parent: t
			});
			return ae(n) ? { value: n.value } : { issues: t.common.issues };
		} catch (e) {
			var n;
			!(e == null || (n = e.message) == null || (n = n.toLowerCase()) == null) && n.includes("encountered") && (this["~standard"].async = !0), t.common = {
				issues: [],
				async: !0
			};
		}
		return this._parseAsync({
			data: e,
			path: [],
			parent: t
		}).then((e) => ae(e) ? { value: e.value } : { issues: t.common.issues });
	}
	async parseAsync(e, t) {
		let n = await this.safeParseAsync(e, t);
		if (n.success) return n.data;
		throw n.error;
	}
	async safeParseAsync(e, t) {
		let n = {
			common: {
				issues: [],
				contextualErrorMap: t == null ? void 0 : t.errorMap,
				async: !0
			},
			path: (t == null ? void 0 : t.path) || [],
			schemaErrorMap: this._def.errorMap,
			parent: null,
			data: e,
			parsedType: h(e)
		}, r = this._parse({
			data: e,
			path: n.path,
			parent: n
		});
		return ce(n, await (oe(r) ? r : Promise.resolve(r)));
	}
	refine(e, t) {
		let n = (e) => typeof t == "string" || t === void 0 ? { message: t } : typeof t == "function" ? t(e) : t;
		return this._refinement((t, r) => {
			let i = e(t), a = () => r.addIssue({
				code: g.custom,
				...n(t)
			});
			return typeof Promise < "u" && i instanceof Promise ? i.then((e) => e ? !0 : (a(), !1)) : i ? !0 : (a(), !1);
		});
	}
	refinement(e, t) {
		return this._refinement((n, r) => e(n) ? !0 : (r.addIssue(typeof t == "function" ? t(n, r) : t), !1));
	}
	_refinement(e) {
		return new dt({
			schema: this,
			typeName: D.ZodEffects,
			effect: {
				type: "refinement",
				refinement: e
			}
		});
	}
	superRefine(e) {
		return this._refinement(e);
	}
	constructor(e) {
		this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
			version: 1,
			vendor: "zod",
			validate: (e) => this["~validate"](e)
		};
	}
	optional() {
		return ft.create(this, this._def);
	}
	nullable() {
		return pt.create(this, this._def);
	}
	nullish() {
		return this.nullable().optional();
	}
	array() {
		return Ke.create(this);
	}
	promise() {
		return ut.create(this, this._def);
	}
	or(e) {
		return Ye.create([this, e], this._def);
	}
	and(e) {
		return $e.create(this, e, this._def);
	}
	transform(e) {
		return new dt({
			...T(this._def),
			schema: this,
			typeName: D.ZodEffects,
			effect: {
				type: "transform",
				transform: e
			}
		});
	}
	default(e) {
		let t = typeof e == "function" ? e : () => e;
		return new mt({
			...T(this._def),
			innerType: this,
			defaultValue: t,
			typeName: D.ZodDefault
		});
	}
	brand() {
		return new _t({
			typeName: D.ZodBranded,
			type: this,
			...T(this._def)
		});
	}
	catch(e) {
		let t = typeof e == "function" ? e : () => e;
		return new ht({
			...T(this._def),
			innerType: this,
			catchValue: t,
			typeName: D.ZodCatch
		});
	}
	describe(e) {
		let t = this.constructor;
		return new t({
			...this._def,
			description: e
		});
	}
	pipe(e) {
		return vt.create(this, e);
	}
	readonly() {
		return yt.create(this);
	}
	isOptional() {
		return this.safeParse(void 0).success;
	}
	isNullable() {
		return this.safeParse(null).success;
	}
}, le = /^c[^\s-]{8,}$/i, ue = /^[0-9a-z]+$/, de = /^[0-9A-HJKMNP-TV-Z]{26}$/i, fe = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, pe = /^[a-z0-9_-]{21}$/i, me = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, he = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, ge = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, _e = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", ve, ye = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, be = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, xe = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Se = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ce = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, we = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Te = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Ee = RegExp(`^${Te}$`);
function De(e) {
	let t = "[0-5]\\d";
	e.precision ? t = `${t}\\.\\d{${e.precision}}` : e.precision ?? (t = `${t}(\\.\\d+)?`);
	let n = e.precision ? "+" : "?";
	return `([01]\\d|2[0-3]):[0-5]\\d(:${t})${n}`;
}
function Oe(e) {
	return RegExp(`^${De(e)}$`);
}
function ke(e) {
	let t = `${Te}T${De(e)}`, n = [];
	return n.push(e.local ? "Z?" : "Z"), e.offset && n.push("([+-]\\d{2}:?\\d{2})"), t = `${t}(${n.join("|")})`, RegExp(`^${t}$`);
}
function Ae(e, t) {
	return !!((t === "v4" || !t) && ye.test(e) || (t === "v6" || !t) && xe.test(e));
}
function je(e, t) {
	if (!me.test(e)) return !1;
	try {
		let [n] = e.split(".");
		if (!n) return !1;
		let r = n.replace(/-/g, "+").replace(/_/g, "/").padEnd(n.length + (4 - n.length % 4) % 4, "="), i = JSON.parse(atob(r));
		return !(typeof i != "object" || !i || "typ" in i && (i == null ? void 0 : i.typ) !== "JWT" || !i.alg || t && i.alg !== t);
	} catch {
		return !1;
	}
}
function Me(e, t) {
	return !!((t === "v4" || !t) && be.test(e) || (t === "v6" || !t) && Se.test(e));
}
var Ne = class e extends E {
	_parse(e) {
		if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== m.string) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.string,
				received: t.parsedType
			}), S;
		}
		let t = new x(), n;
		for (let r of this._def.checks) if (r.kind === "min") e.data.length < r.value && (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.too_small,
			minimum: r.value,
			type: "string",
			inclusive: !0,
			exact: !1,
			message: r.message
		}), t.dirty());
		else if (r.kind === "max") e.data.length > r.value && (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.too_big,
			maximum: r.value,
			type: "string",
			inclusive: !0,
			exact: !1,
			message: r.message
		}), t.dirty());
		else if (r.kind === "length") {
			let i = e.data.length > r.value, a = e.data.length < r.value;
			(i || a) && (n = this._getOrReturnCtx(e, n), i ? b(n, {
				code: g.too_big,
				maximum: r.value,
				type: "string",
				inclusive: !0,
				exact: !0,
				message: r.message
			}) : a && b(n, {
				code: g.too_small,
				minimum: r.value,
				type: "string",
				inclusive: !0,
				exact: !0,
				message: r.message
			}), t.dirty());
		} else if (r.kind === "email") ge.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "email",
			code: g.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "emoji") ve ||= new RegExp(_e, "u"), ve.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "emoji",
			code: g.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "uuid") fe.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "uuid",
			code: g.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "nanoid") pe.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "nanoid",
			code: g.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "cuid") le.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "cuid",
			code: g.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "cuid2") ue.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "cuid2",
			code: g.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "ulid") de.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "ulid",
			code: g.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "url") try {
			new URL(e.data);
		} catch {
			n = this._getOrReturnCtx(e, n), b(n, {
				validation: "url",
				code: g.invalid_string,
				message: r.message
			}), t.dirty();
		}
		else r.kind === "regex" ? (r.regex.lastIndex = 0, r.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "regex",
			code: g.invalid_string,
			message: r.message
		}), t.dirty())) : r.kind === "trim" ? e.data = e.data.trim() : r.kind === "includes" ? e.data.includes(r.value, r.position) || (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.invalid_string,
			validation: {
				includes: r.value,
				position: r.position
			},
			message: r.message
		}), t.dirty()) : r.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : r.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : r.kind === "startsWith" ? e.data.startsWith(r.value) || (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.invalid_string,
			validation: { startsWith: r.value },
			message: r.message
		}), t.dirty()) : r.kind === "endsWith" ? e.data.endsWith(r.value) || (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.invalid_string,
			validation: { endsWith: r.value },
			message: r.message
		}), t.dirty()) : r.kind === "datetime" ? ke(r).test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.invalid_string,
			validation: "datetime",
			message: r.message
		}), t.dirty()) : r.kind === "date" ? Ee.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.invalid_string,
			validation: "date",
			message: r.message
		}), t.dirty()) : r.kind === "time" ? Oe(r).test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.invalid_string,
			validation: "time",
			message: r.message
		}), t.dirty()) : r.kind === "duration" ? he.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "duration",
			code: g.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "ip" ? Ae(e.data, r.version) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "ip",
			code: g.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "jwt" ? je(e.data, r.alg) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "jwt",
			code: g.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "cidr" ? Me(e.data, r.version) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "cidr",
			code: g.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "base64" ? Ce.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "base64",
			code: g.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "base64url" ? we.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
			validation: "base64url",
			code: g.invalid_string,
			message: r.message
		}), t.dirty()) : f.assertNever(r);
		return {
			status: t.value,
			value: e.data
		};
	}
	_regex(e, t, n) {
		return this.refinement((t) => e.test(t), {
			validation: t,
			code: g.invalid_string,
			...w.errToObj(n)
		});
	}
	_addCheck(t) {
		return new e({
			...this._def,
			checks: [...this._def.checks, t]
		});
	}
	email(e) {
		return this._addCheck({
			kind: "email",
			...w.errToObj(e)
		});
	}
	url(e) {
		return this._addCheck({
			kind: "url",
			...w.errToObj(e)
		});
	}
	emoji(e) {
		return this._addCheck({
			kind: "emoji",
			...w.errToObj(e)
		});
	}
	uuid(e) {
		return this._addCheck({
			kind: "uuid",
			...w.errToObj(e)
		});
	}
	nanoid(e) {
		return this._addCheck({
			kind: "nanoid",
			...w.errToObj(e)
		});
	}
	cuid(e) {
		return this._addCheck({
			kind: "cuid",
			...w.errToObj(e)
		});
	}
	cuid2(e) {
		return this._addCheck({
			kind: "cuid2",
			...w.errToObj(e)
		});
	}
	ulid(e) {
		return this._addCheck({
			kind: "ulid",
			...w.errToObj(e)
		});
	}
	base64(e) {
		return this._addCheck({
			kind: "base64",
			...w.errToObj(e)
		});
	}
	base64url(e) {
		return this._addCheck({
			kind: "base64url",
			...w.errToObj(e)
		});
	}
	jwt(e) {
		return this._addCheck({
			kind: "jwt",
			...w.errToObj(e)
		});
	}
	ip(e) {
		return this._addCheck({
			kind: "ip",
			...w.errToObj(e)
		});
	}
	cidr(e) {
		return this._addCheck({
			kind: "cidr",
			...w.errToObj(e)
		});
	}
	datetime(e) {
		return typeof e == "string" ? this._addCheck({
			kind: "datetime",
			precision: null,
			offset: !1,
			local: !1,
			message: e
		}) : this._addCheck({
			kind: "datetime",
			precision: (e == null ? void 0 : e.precision) === void 0 ? null : e == null ? void 0 : e.precision,
			offset: (e == null ? void 0 : e.offset) ?? !1,
			local: (e == null ? void 0 : e.local) ?? !1,
			...w.errToObj(e == null ? void 0 : e.message)
		});
	}
	date(e) {
		return this._addCheck({
			kind: "date",
			message: e
		});
	}
	time(e) {
		return typeof e == "string" ? this._addCheck({
			kind: "time",
			precision: null,
			message: e
		}) : this._addCheck({
			kind: "time",
			precision: (e == null ? void 0 : e.precision) === void 0 ? null : e == null ? void 0 : e.precision,
			...w.errToObj(e == null ? void 0 : e.message)
		});
	}
	duration(e) {
		return this._addCheck({
			kind: "duration",
			...w.errToObj(e)
		});
	}
	regex(e, t) {
		return this._addCheck({
			kind: "regex",
			regex: e,
			...w.errToObj(t)
		});
	}
	includes(e, t) {
		return this._addCheck({
			kind: "includes",
			value: e,
			position: t == null ? void 0 : t.position,
			...w.errToObj(t == null ? void 0 : t.message)
		});
	}
	startsWith(e, t) {
		return this._addCheck({
			kind: "startsWith",
			value: e,
			...w.errToObj(t)
		});
	}
	endsWith(e, t) {
		return this._addCheck({
			kind: "endsWith",
			value: e,
			...w.errToObj(t)
		});
	}
	min(e, t) {
		return this._addCheck({
			kind: "min",
			value: e,
			...w.errToObj(t)
		});
	}
	max(e, t) {
		return this._addCheck({
			kind: "max",
			value: e,
			...w.errToObj(t)
		});
	}
	length(e, t) {
		return this._addCheck({
			kind: "length",
			value: e,
			...w.errToObj(t)
		});
	}
	/**
	* Equivalent to `.min(1)`
	*/
	nonempty(e) {
		return this.min(1, w.errToObj(e));
	}
	trim() {
		return new e({
			...this._def,
			checks: [...this._def.checks, { kind: "trim" }]
		});
	}
	toLowerCase() {
		return new e({
			...this._def,
			checks: [...this._def.checks, { kind: "toLowerCase" }]
		});
	}
	toUpperCase() {
		return new e({
			...this._def,
			checks: [...this._def.checks, { kind: "toUpperCase" }]
		});
	}
	get isDatetime() {
		return !!this._def.checks.find((e) => e.kind === "datetime");
	}
	get isDate() {
		return !!this._def.checks.find((e) => e.kind === "date");
	}
	get isTime() {
		return !!this._def.checks.find((e) => e.kind === "time");
	}
	get isDuration() {
		return !!this._def.checks.find((e) => e.kind === "duration");
	}
	get isEmail() {
		return !!this._def.checks.find((e) => e.kind === "email");
	}
	get isURL() {
		return !!this._def.checks.find((e) => e.kind === "url");
	}
	get isEmoji() {
		return !!this._def.checks.find((e) => e.kind === "emoji");
	}
	get isUUID() {
		return !!this._def.checks.find((e) => e.kind === "uuid");
	}
	get isNANOID() {
		return !!this._def.checks.find((e) => e.kind === "nanoid");
	}
	get isCUID() {
		return !!this._def.checks.find((e) => e.kind === "cuid");
	}
	get isCUID2() {
		return !!this._def.checks.find((e) => e.kind === "cuid2");
	}
	get isULID() {
		return !!this._def.checks.find((e) => e.kind === "ulid");
	}
	get isIP() {
		return !!this._def.checks.find((e) => e.kind === "ip");
	}
	get isCIDR() {
		return !!this._def.checks.find((e) => e.kind === "cidr");
	}
	get isBase64() {
		return !!this._def.checks.find((e) => e.kind === "base64");
	}
	get isBase64url() {
		return !!this._def.checks.find((e) => e.kind === "base64url");
	}
	get minLength() {
		let e = null;
		for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
		return e;
	}
	get maxLength() {
		let e = null;
		for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
		return e;
	}
};
Ne.create = (e) => new Ne({
	checks: [],
	typeName: D.ZodString,
	coerce: (e == null ? void 0 : e.coerce) ?? !1,
	...T(e)
});
function Pe(e, t) {
	let n = (e.toString().split(".")[1] || "").length, r = (t.toString().split(".")[1] || "").length, i = n > r ? n : r;
	return Number.parseInt(e.toFixed(i).replace(".", "")) % Number.parseInt(t.toFixed(i).replace(".", "")) / 10 ** i;
}
var Fe = class e extends E {
	constructor() {
		super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
	}
	_parse(e) {
		if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== m.number) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.number,
				received: t.parsedType
			}), S;
		}
		let t, n = new x();
		for (let r of this._def.checks) r.kind === "int" ? f.isInteger(e.data) || (t = this._getOrReturnCtx(e, t), b(t, {
			code: g.invalid_type,
			expected: "integer",
			received: "float",
			message: r.message
		}), n.dirty()) : r.kind === "min" ? (r.inclusive ? e.data < r.value : e.data <= r.value) && (t = this._getOrReturnCtx(e, t), b(t, {
			code: g.too_small,
			minimum: r.value,
			type: "number",
			inclusive: r.inclusive,
			exact: !1,
			message: r.message
		}), n.dirty()) : r.kind === "max" ? (r.inclusive ? e.data > r.value : e.data >= r.value) && (t = this._getOrReturnCtx(e, t), b(t, {
			code: g.too_big,
			maximum: r.value,
			type: "number",
			inclusive: r.inclusive,
			exact: !1,
			message: r.message
		}), n.dirty()) : r.kind === "multipleOf" ? Pe(e.data, r.value) !== 0 && (t = this._getOrReturnCtx(e, t), b(t, {
			code: g.not_multiple_of,
			multipleOf: r.value,
			message: r.message
		}), n.dirty()) : r.kind === "finite" ? Number.isFinite(e.data) || (t = this._getOrReturnCtx(e, t), b(t, {
			code: g.not_finite,
			message: r.message
		}), n.dirty()) : f.assertNever(r);
		return {
			status: n.value,
			value: e.data
		};
	}
	gte(e, t) {
		return this.setLimit("min", e, !0, w.toString(t));
	}
	gt(e, t) {
		return this.setLimit("min", e, !1, w.toString(t));
	}
	lte(e, t) {
		return this.setLimit("max", e, !0, w.toString(t));
	}
	lt(e, t) {
		return this.setLimit("max", e, !1, w.toString(t));
	}
	setLimit(t, n, r, i) {
		return new e({
			...this._def,
			checks: [...this._def.checks, {
				kind: t,
				value: n,
				inclusive: r,
				message: w.toString(i)
			}]
		});
	}
	_addCheck(t) {
		return new e({
			...this._def,
			checks: [...this._def.checks, t]
		});
	}
	int(e) {
		return this._addCheck({
			kind: "int",
			message: w.toString(e)
		});
	}
	positive(e) {
		return this._addCheck({
			kind: "min",
			value: 0,
			inclusive: !1,
			message: w.toString(e)
		});
	}
	negative(e) {
		return this._addCheck({
			kind: "max",
			value: 0,
			inclusive: !1,
			message: w.toString(e)
		});
	}
	nonpositive(e) {
		return this._addCheck({
			kind: "max",
			value: 0,
			inclusive: !0,
			message: w.toString(e)
		});
	}
	nonnegative(e) {
		return this._addCheck({
			kind: "min",
			value: 0,
			inclusive: !0,
			message: w.toString(e)
		});
	}
	multipleOf(e, t) {
		return this._addCheck({
			kind: "multipleOf",
			value: e,
			message: w.toString(t)
		});
	}
	finite(e) {
		return this._addCheck({
			kind: "finite",
			message: w.toString(e)
		});
	}
	safe(e) {
		return this._addCheck({
			kind: "min",
			inclusive: !0,
			value: -(2 ** 53 - 1),
			message: w.toString(e)
		})._addCheck({
			kind: "max",
			inclusive: !0,
			value: 2 ** 53 - 1,
			message: w.toString(e)
		});
	}
	get minValue() {
		let e = null;
		for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
		return e;
	}
	get maxValue() {
		let e = null;
		for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
		return e;
	}
	get isInt() {
		return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && f.isInteger(e.value));
	}
	get isFinite() {
		let e = null, t = null;
		for (let n of this._def.checks) if (n.kind === "finite" || n.kind === "int" || n.kind === "multipleOf") return !0;
		else n.kind === "min" ? (t === null || n.value > t) && (t = n.value) : n.kind === "max" && (e === null || n.value < e) && (e = n.value);
		return Number.isFinite(t) && Number.isFinite(e);
	}
};
Fe.create = (e) => new Fe({
	checks: [],
	typeName: D.ZodNumber,
	coerce: (e == null ? void 0 : e.coerce) || !1,
	...T(e)
});
var Ie = class e extends E {
	constructor() {
		super(...arguments), this.min = this.gte, this.max = this.lte;
	}
	_parse(e) {
		if (this._def.coerce) try {
			e.data = BigInt(e.data);
		} catch {
			return this._getInvalidInput(e);
		}
		if (this._getType(e) !== m.bigint) return this._getInvalidInput(e);
		let t, n = new x();
		for (let r of this._def.checks) r.kind === "min" ? (r.inclusive ? e.data < r.value : e.data <= r.value) && (t = this._getOrReturnCtx(e, t), b(t, {
			code: g.too_small,
			type: "bigint",
			minimum: r.value,
			inclusive: r.inclusive,
			message: r.message
		}), n.dirty()) : r.kind === "max" ? (r.inclusive ? e.data > r.value : e.data >= r.value) && (t = this._getOrReturnCtx(e, t), b(t, {
			code: g.too_big,
			type: "bigint",
			maximum: r.value,
			inclusive: r.inclusive,
			message: r.message
		}), n.dirty()) : r.kind === "multipleOf" ? e.data % r.value !== BigInt(0) && (t = this._getOrReturnCtx(e, t), b(t, {
			code: g.not_multiple_of,
			multipleOf: r.value,
			message: r.message
		}), n.dirty()) : f.assertNever(r);
		return {
			status: n.value,
			value: e.data
		};
	}
	_getInvalidInput(e) {
		let t = this._getOrReturnCtx(e);
		return b(t, {
			code: g.invalid_type,
			expected: m.bigint,
			received: t.parsedType
		}), S;
	}
	gte(e, t) {
		return this.setLimit("min", e, !0, w.toString(t));
	}
	gt(e, t) {
		return this.setLimit("min", e, !1, w.toString(t));
	}
	lte(e, t) {
		return this.setLimit("max", e, !0, w.toString(t));
	}
	lt(e, t) {
		return this.setLimit("max", e, !1, w.toString(t));
	}
	setLimit(t, n, r, i) {
		return new e({
			...this._def,
			checks: [...this._def.checks, {
				kind: t,
				value: n,
				inclusive: r,
				message: w.toString(i)
			}]
		});
	}
	_addCheck(t) {
		return new e({
			...this._def,
			checks: [...this._def.checks, t]
		});
	}
	positive(e) {
		return this._addCheck({
			kind: "min",
			value: BigInt(0),
			inclusive: !1,
			message: w.toString(e)
		});
	}
	negative(e) {
		return this._addCheck({
			kind: "max",
			value: BigInt(0),
			inclusive: !1,
			message: w.toString(e)
		});
	}
	nonpositive(e) {
		return this._addCheck({
			kind: "max",
			value: BigInt(0),
			inclusive: !0,
			message: w.toString(e)
		});
	}
	nonnegative(e) {
		return this._addCheck({
			kind: "min",
			value: BigInt(0),
			inclusive: !0,
			message: w.toString(e)
		});
	}
	multipleOf(e, t) {
		return this._addCheck({
			kind: "multipleOf",
			value: e,
			message: w.toString(t)
		});
	}
	get minValue() {
		let e = null;
		for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
		return e;
	}
	get maxValue() {
		let e = null;
		for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
		return e;
	}
};
Ie.create = (e) => new Ie({
	checks: [],
	typeName: D.ZodBigInt,
	coerce: (e == null ? void 0 : e.coerce) ?? !1,
	...T(e)
});
var Le = class extends E {
	_parse(e) {
		if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== m.boolean) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.boolean,
				received: t.parsedType
			}), S;
		}
		return C(e.data);
	}
};
Le.create = (e) => new Le({
	typeName: D.ZodBoolean,
	coerce: (e == null ? void 0 : e.coerce) || !1,
	...T(e)
});
var Re = class e extends E {
	_parse(e) {
		if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== m.date) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.date,
				received: t.parsedType
			}), S;
		}
		if (Number.isNaN(e.data.getTime())) return b(this._getOrReturnCtx(e), { code: g.invalid_date }), S;
		let t = new x(), n;
		for (let r of this._def.checks) r.kind === "min" ? e.data.getTime() < r.value && (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.too_small,
			message: r.message,
			inclusive: !0,
			exact: !1,
			minimum: r.value,
			type: "date"
		}), t.dirty()) : r.kind === "max" ? e.data.getTime() > r.value && (n = this._getOrReturnCtx(e, n), b(n, {
			code: g.too_big,
			message: r.message,
			inclusive: !0,
			exact: !1,
			maximum: r.value,
			type: "date"
		}), t.dirty()) : f.assertNever(r);
		return {
			status: t.value,
			value: new Date(e.data.getTime())
		};
	}
	_addCheck(t) {
		return new e({
			...this._def,
			checks: [...this._def.checks, t]
		});
	}
	min(e, t) {
		return this._addCheck({
			kind: "min",
			value: e.getTime(),
			message: w.toString(t)
		});
	}
	max(e, t) {
		return this._addCheck({
			kind: "max",
			value: e.getTime(),
			message: w.toString(t)
		});
	}
	get minDate() {
		let e = null;
		for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
		return e == null ? null : new Date(e);
	}
	get maxDate() {
		let e = null;
		for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
		return e == null ? null : new Date(e);
	}
};
Re.create = (e) => new Re({
	checks: [],
	coerce: (e == null ? void 0 : e.coerce) || !1,
	typeName: D.ZodDate,
	...T(e)
});
var ze = class extends E {
	_parse(e) {
		if (this._getType(e) !== m.symbol) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.symbol,
				received: t.parsedType
			}), S;
		}
		return C(e.data);
	}
};
ze.create = (e) => new ze({
	typeName: D.ZodSymbol,
	...T(e)
});
var Be = class extends E {
	_parse(e) {
		if (this._getType(e) !== m.undefined) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.undefined,
				received: t.parsedType
			}), S;
		}
		return C(e.data);
	}
};
Be.create = (e) => new Be({
	typeName: D.ZodUndefined,
	...T(e)
});
var Ve = class extends E {
	_parse(e) {
		if (this._getType(e) !== m.null) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.null,
				received: t.parsedType
			}), S;
		}
		return C(e.data);
	}
};
Ve.create = (e) => new Ve({
	typeName: D.ZodNull,
	...T(e)
});
var He = class extends E {
	constructor() {
		super(...arguments), this._any = !0;
	}
	_parse(e) {
		return C(e.data);
	}
};
He.create = (e) => new He({
	typeName: D.ZodAny,
	...T(e)
});
var Ue = class extends E {
	constructor() {
		super(...arguments), this._unknown = !0;
	}
	_parse(e) {
		return C(e.data);
	}
};
Ue.create = (e) => new Ue({
	typeName: D.ZodUnknown,
	...T(e)
});
var We = class extends E {
	_parse(e) {
		let t = this._getOrReturnCtx(e);
		return b(t, {
			code: g.invalid_type,
			expected: m.never,
			received: t.parsedType
		}), S;
	}
};
We.create = (e) => new We({
	typeName: D.ZodNever,
	...T(e)
});
var Ge = class extends E {
	_parse(e) {
		if (this._getType(e) !== m.undefined) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.void,
				received: t.parsedType
			}), S;
		}
		return C(e.data);
	}
};
Ge.create = (e) => new Ge({
	typeName: D.ZodVoid,
	...T(e)
});
var Ke = class e extends E {
	_parse(e) {
		let { ctx: t, status: n } = this._processInputParams(e), r = this._def;
		if (t.parsedType !== m.array) return b(t, {
			code: g.invalid_type,
			expected: m.array,
			received: t.parsedType
		}), S;
		if (r.exactLength !== null) {
			let e = t.data.length > r.exactLength.value, i = t.data.length < r.exactLength.value;
			(e || i) && (b(t, {
				code: e ? g.too_big : g.too_small,
				minimum: i ? r.exactLength.value : void 0,
				maximum: e ? r.exactLength.value : void 0,
				type: "array",
				inclusive: !0,
				exact: !0,
				message: r.exactLength.message
			}), n.dirty());
		}
		if (r.minLength !== null && t.data.length < r.minLength.value && (b(t, {
			code: g.too_small,
			minimum: r.minLength.value,
			type: "array",
			inclusive: !0,
			exact: !1,
			message: r.minLength.message
		}), n.dirty()), r.maxLength !== null && t.data.length > r.maxLength.value && (b(t, {
			code: g.too_big,
			maximum: r.maxLength.value,
			type: "array",
			inclusive: !0,
			exact: !1,
			message: r.maxLength.message
		}), n.dirty()), t.common.async) return Promise.all([...t.data].map((e, n) => r.type._parseAsync(new se(t, e, t.path, n)))).then((e) => x.mergeArray(n, e));
		let i = [...t.data].map((e, n) => r.type._parseSync(new se(t, e, t.path, n)));
		return x.mergeArray(n, i);
	}
	get element() {
		return this._def.type;
	}
	min(t, n) {
		return new e({
			...this._def,
			minLength: {
				value: t,
				message: w.toString(n)
			}
		});
	}
	max(t, n) {
		return new e({
			...this._def,
			maxLength: {
				value: t,
				message: w.toString(n)
			}
		});
	}
	length(t, n) {
		return new e({
			...this._def,
			exactLength: {
				value: t,
				message: w.toString(n)
			}
		});
	}
	nonempty(e) {
		return this.min(1, e);
	}
};
Ke.create = (e, t) => new Ke({
	type: e,
	minLength: null,
	maxLength: null,
	exactLength: null,
	typeName: D.ZodArray,
	...T(t)
});
function qe(e) {
	if (e instanceof Je) {
		let t = {};
		for (let n in e.shape) {
			let r = e.shape[n];
			t[n] = ft.create(qe(r));
		}
		return new Je({
			...e._def,
			shape: () => t
		});
	} else if (e instanceof Ke) return new Ke({
		...e._def,
		type: qe(e.element)
	});
	else if (e instanceof ft) return ft.create(qe(e.unwrap()));
	else if (e instanceof pt) return pt.create(qe(e.unwrap()));
	else if (e instanceof et) return et.create(e.items.map((e) => qe(e)));
	else return e;
}
var Je = class e extends E {
	constructor() {
		/**
		* @deprecated Use `.extend` instead
		*  */
		super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
	}
	_getCached() {
		if (this._cached !== null) return this._cached;
		let e = this._def.shape();
		return this._cached = {
			shape: e,
			keys: f.objectKeys(e)
		}, this._cached;
	}
	_parse(e) {
		if (this._getType(e) !== m.object) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.object,
				received: t.parsedType
			}), S;
		}
		let { status: t, ctx: n } = this._processInputParams(e), { shape: r, keys: i } = this._getCached(), a = [];
		if (!(this._def.catchall instanceof We && this._def.unknownKeys === "strip")) for (let e in n.data) i.includes(e) || a.push(e);
		let o = [];
		for (let e of i) {
			let t = r[e], i = n.data[e];
			o.push({
				key: {
					status: "valid",
					value: e
				},
				value: t._parse(new se(n, i, n.path, e)),
				alwaysSet: e in n.data
			});
		}
		if (this._def.catchall instanceof We) {
			let e = this._def.unknownKeys;
			if (e === "passthrough") for (let e of a) o.push({
				key: {
					status: "valid",
					value: e
				},
				value: {
					status: "valid",
					value: n.data[e]
				}
			});
			else if (e === "strict") a.length > 0 && (b(n, {
				code: g.unrecognized_keys,
				keys: a
			}), t.dirty());
			else if (e !== "strip") throw Error("Internal ZodObject error: invalid unknownKeys value.");
		} else {
			let e = this._def.catchall;
			for (let t of a) {
				let r = n.data[t];
				o.push({
					key: {
						status: "valid",
						value: t
					},
					value: e._parse(new se(n, r, n.path, t)),
					alwaysSet: t in n.data
				});
			}
		}
		return n.common.async ? Promise.resolve().then(async () => {
			let e = [];
			for (let t of o) {
				let n = await t.key, r = await t.value;
				e.push({
					key: n,
					value: r,
					alwaysSet: t.alwaysSet
				});
			}
			return e;
		}).then((e) => x.mergeObjectSync(t, e)) : x.mergeObjectSync(t, o);
	}
	get shape() {
		return this._def.shape();
	}
	strict(t) {
		return w.errToObj, new e({
			...this._def,
			unknownKeys: "strict",
			...t === void 0 ? {} : { errorMap: (e, n) => {
				var r, i;
				let a = ((r = (i = this._def).errorMap) == null ? void 0 : r.call(i, e, n).message) ?? n.defaultError;
				return e.code === "unrecognized_keys" ? { message: w.errToObj(t).message ?? a } : { message: a };
			} }
		});
	}
	strip() {
		return new e({
			...this._def,
			unknownKeys: "strip"
		});
	}
	passthrough() {
		return new e({
			...this._def,
			unknownKeys: "passthrough"
		});
	}
	extend(t) {
		return new e({
			...this._def,
			shape: () => ({
				...this._def.shape(),
				...t
			})
		});
	}
	/**
	* Prior to zod@1.0.12 there was a bug in the
	* inferred type of merged objects. Please
	* upgrade if you are experiencing issues.
	*/
	merge(t) {
		return new e({
			unknownKeys: t._def.unknownKeys,
			catchall: t._def.catchall,
			shape: () => ({
				...this._def.shape(),
				...t._def.shape()
			}),
			typeName: D.ZodObject
		});
	}
	setKey(e, t) {
		return this.augment({ [e]: t });
	}
	catchall(t) {
		return new e({
			...this._def,
			catchall: t
		});
	}
	pick(t) {
		let n = {};
		for (let e of f.objectKeys(t)) t[e] && this.shape[e] && (n[e] = this.shape[e]);
		return new e({
			...this._def,
			shape: () => n
		});
	}
	omit(t) {
		let n = {};
		for (let e of f.objectKeys(this.shape)) t[e] || (n[e] = this.shape[e]);
		return new e({
			...this._def,
			shape: () => n
		});
	}
	/**
	* @deprecated
	*/
	deepPartial() {
		return qe(this);
	}
	partial(t) {
		let n = {};
		for (let e of f.objectKeys(this.shape)) {
			let r = this.shape[e];
			t && !t[e] ? n[e] = r : n[e] = r.optional();
		}
		return new e({
			...this._def,
			shape: () => n
		});
	}
	required(t) {
		let n = {};
		for (let e of f.objectKeys(this.shape)) if (t && !t[e]) n[e] = this.shape[e];
		else {
			let t = this.shape[e];
			for (; t instanceof ft;) t = t._def.innerType;
			n[e] = t;
		}
		return new e({
			...this._def,
			shape: () => n
		});
	}
	keyof() {
		return st(f.objectKeys(this.shape));
	}
};
Je.create = (e, t) => new Je({
	shape: () => e,
	unknownKeys: "strip",
	catchall: We.create(),
	typeName: D.ZodObject,
	...T(t)
}), Je.strictCreate = (e, t) => new Je({
	shape: () => e,
	unknownKeys: "strict",
	catchall: We.create(),
	typeName: D.ZodObject,
	...T(t)
}), Je.lazycreate = (e, t) => new Je({
	shape: e,
	unknownKeys: "strip",
	catchall: We.create(),
	typeName: D.ZodObject,
	...T(t)
});
var Ye = class extends E {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = this._def.options;
		function r(e) {
			for (let t of e) if (t.result.status === "valid") return t.result;
			for (let n of e) if (n.result.status === "dirty") return t.common.issues.push(...n.ctx.common.issues), n.result;
			let n = e.map((e) => new _(e.ctx.common.issues));
			return b(t, {
				code: g.invalid_union,
				unionErrors: n
			}), S;
		}
		if (t.common.async) return Promise.all(n.map(async (e) => {
			let n = {
				...t,
				common: {
					...t.common,
					issues: []
				},
				parent: null
			};
			return {
				result: await e._parseAsync({
					data: t.data,
					path: t.path,
					parent: n
				}),
				ctx: n
			};
		})).then(r);
		{
			let e, r = [];
			for (let i of n) {
				let n = {
					...t,
					common: {
						...t.common,
						issues: []
					},
					parent: null
				}, a = i._parseSync({
					data: t.data,
					path: t.path,
					parent: n
				});
				if (a.status === "valid") return a;
				a.status === "dirty" && !e && (e = {
					result: a,
					ctx: n
				}), n.common.issues.length && r.push(n.common.issues);
			}
			if (e) return t.common.issues.push(...e.ctx.common.issues), e.result;
			let i = r.map((e) => new _(e));
			return b(t, {
				code: g.invalid_union,
				unionErrors: i
			}), S;
		}
	}
	get options() {
		return this._def.options;
	}
};
Ye.create = (e, t) => new Ye({
	options: e,
	typeName: D.ZodUnion,
	...T(t)
});
var Xe = (e) => e instanceof at ? Xe(e.schema) : e instanceof dt ? Xe(e.innerType()) : e instanceof ot ? [e.value] : e instanceof ct ? e.options : e instanceof lt ? f.objectValues(e.enum) : e instanceof mt ? Xe(e._def.innerType) : e instanceof Be ? [void 0] : e instanceof Ve ? [null] : e instanceof ft ? [void 0, ...Xe(e.unwrap())] : e instanceof pt ? [null, ...Xe(e.unwrap())] : e instanceof _t || e instanceof yt ? Xe(e.unwrap()) : e instanceof ht ? Xe(e._def.innerType) : [], Ze = class e extends E {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		if (t.parsedType !== m.object) return b(t, {
			code: g.invalid_type,
			expected: m.object,
			received: t.parsedType
		}), S;
		let n = this.discriminator, r = t.data[n], i = this.optionsMap.get(r);
		return i ? t.common.async ? i._parseAsync({
			data: t.data,
			path: t.path,
			parent: t
		}) : i._parseSync({
			data: t.data,
			path: t.path,
			parent: t
		}) : (b(t, {
			code: g.invalid_union_discriminator,
			options: Array.from(this.optionsMap.keys()),
			path: [n]
		}), S);
	}
	get discriminator() {
		return this._def.discriminator;
	}
	get options() {
		return this._def.options;
	}
	get optionsMap() {
		return this._def.optionsMap;
	}
	/**
	* The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
	* However, it only allows a union of objects, all of which need to share a discriminator property. This property must
	* have a different value for each object in the union.
	* @param discriminator the name of the discriminator property
	* @param types an array of object schemas
	* @param params
	*/
	static create(t, n, r) {
		let i = /* @__PURE__ */ new Map();
		for (let e of n) {
			let n = Xe(e.shape[t]);
			if (!n.length) throw Error(`A discriminator value for key \`${t}\` could not be extracted from all schema options`);
			for (let r of n) {
				if (i.has(r)) throw Error(`Discriminator property ${String(t)} has duplicate value ${String(r)}`);
				i.set(r, e);
			}
		}
		return new e({
			typeName: D.ZodDiscriminatedUnion,
			discriminator: t,
			options: n,
			optionsMap: i,
			...T(r)
		});
	}
};
function Qe(e, t) {
	let n = h(e), r = h(t);
	if (e === t) return {
		valid: !0,
		data: e
	};
	if (n === m.object && r === m.object) {
		let n = f.objectKeys(t), r = f.objectKeys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		for (let n of r) {
			let r = Qe(e[n], t[n]);
			if (!r.valid) return { valid: !1 };
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	} else if (n === m.array && r === m.array) {
		if (e.length !== t.length) return { valid: !1 };
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = Qe(i, a);
			if (!o.valid) return { valid: !1 };
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	} else if (n === m.date && r === m.date && +e == +t) return {
		valid: !0,
		data: e
	};
	else return { valid: !1 };
}
var $e = class extends E {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e), r = (e, r) => {
			if (re(e) || re(r)) return S;
			let i = Qe(e.value, r.value);
			return i.valid ? ((ie(e) || ie(r)) && t.dirty(), {
				status: t.value,
				value: i.data
			}) : (b(n, { code: g.invalid_intersection_types }), S);
		};
		return n.common.async ? Promise.all([this._def.left._parseAsync({
			data: n.data,
			path: n.path,
			parent: n
		}), this._def.right._parseAsync({
			data: n.data,
			path: n.path,
			parent: n
		})]).then(([e, t]) => r(e, t)) : r(this._def.left._parseSync({
			data: n.data,
			path: n.path,
			parent: n
		}), this._def.right._parseSync({
			data: n.data,
			path: n.path,
			parent: n
		}));
	}
};
$e.create = (e, t, n) => new $e({
	left: e,
	right: t,
	typeName: D.ZodIntersection,
	...T(n)
});
var et = class e extends E {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== m.array) return b(n, {
			code: g.invalid_type,
			expected: m.array,
			received: n.parsedType
		}), S;
		if (n.data.length < this._def.items.length) return b(n, {
			code: g.too_small,
			minimum: this._def.items.length,
			inclusive: !0,
			exact: !1,
			type: "array"
		}), S;
		!this._def.rest && n.data.length > this._def.items.length && (b(n, {
			code: g.too_big,
			maximum: this._def.items.length,
			inclusive: !0,
			exact: !1,
			type: "array"
		}), t.dirty());
		let r = [...n.data].map((e, t) => {
			let r = this._def.items[t] || this._def.rest;
			return r ? r._parse(new se(n, e, n.path, t)) : null;
		}).filter((e) => !!e);
		return n.common.async ? Promise.all(r).then((e) => x.mergeArray(t, e)) : x.mergeArray(t, r);
	}
	get items() {
		return this._def.items;
	}
	rest(t) {
		return new e({
			...this._def,
			rest: t
		});
	}
};
et.create = (e, t) => {
	if (!Array.isArray(e)) throw Error("You must pass an array of schemas to z.tuple([ ... ])");
	return new et({
		items: e,
		typeName: D.ZodTuple,
		rest: null,
		...T(t)
	});
};
var tt = class e extends E {
	get keySchema() {
		return this._def.keyType;
	}
	get valueSchema() {
		return this._def.valueType;
	}
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== m.object) return b(n, {
			code: g.invalid_type,
			expected: m.object,
			received: n.parsedType
		}), S;
		let r = [], i = this._def.keyType, a = this._def.valueType;
		for (let e in n.data) r.push({
			key: i._parse(new se(n, e, n.path, e)),
			value: a._parse(new se(n, n.data[e], n.path, e)),
			alwaysSet: e in n.data
		});
		return n.common.async ? x.mergeObjectAsync(t, r) : x.mergeObjectSync(t, r);
	}
	get element() {
		return this._def.valueType;
	}
	static create(t, n, r) {
		return n instanceof E ? new e({
			keyType: t,
			valueType: n,
			typeName: D.ZodRecord,
			...T(r)
		}) : new e({
			keyType: Ne.create(),
			valueType: t,
			typeName: D.ZodRecord,
			...T(n)
		});
	}
}, nt = class extends E {
	get keySchema() {
		return this._def.keyType;
	}
	get valueSchema() {
		return this._def.valueType;
	}
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== m.map) return b(n, {
			code: g.invalid_type,
			expected: m.map,
			received: n.parsedType
		}), S;
		let r = this._def.keyType, i = this._def.valueType, a = [...n.data.entries()].map(([e, t], a) => ({
			key: r._parse(new se(n, e, n.path, [a, "key"])),
			value: i._parse(new se(n, t, n.path, [a, "value"]))
		}));
		if (n.common.async) {
			let e = /* @__PURE__ */ new Map();
			return Promise.resolve().then(async () => {
				for (let n of a) {
					let r = await n.key, i = await n.value;
					if (r.status === "aborted" || i.status === "aborted") return S;
					(r.status === "dirty" || i.status === "dirty") && t.dirty(), e.set(r.value, i.value);
				}
				return {
					status: t.value,
					value: e
				};
			});
		} else {
			let e = /* @__PURE__ */ new Map();
			for (let n of a) {
				let r = n.key, i = n.value;
				if (r.status === "aborted" || i.status === "aborted") return S;
				(r.status === "dirty" || i.status === "dirty") && t.dirty(), e.set(r.value, i.value);
			}
			return {
				status: t.value,
				value: e
			};
		}
	}
};
nt.create = (e, t, n) => new nt({
	valueType: t,
	keyType: e,
	typeName: D.ZodMap,
	...T(n)
});
var rt = class e extends E {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== m.set) return b(n, {
			code: g.invalid_type,
			expected: m.set,
			received: n.parsedType
		}), S;
		let r = this._def;
		r.minSize !== null && n.data.size < r.minSize.value && (b(n, {
			code: g.too_small,
			minimum: r.minSize.value,
			type: "set",
			inclusive: !0,
			exact: !1,
			message: r.minSize.message
		}), t.dirty()), r.maxSize !== null && n.data.size > r.maxSize.value && (b(n, {
			code: g.too_big,
			maximum: r.maxSize.value,
			type: "set",
			inclusive: !0,
			exact: !1,
			message: r.maxSize.message
		}), t.dirty());
		let i = this._def.valueType;
		function a(e) {
			let n = /* @__PURE__ */ new Set();
			for (let r of e) {
				if (r.status === "aborted") return S;
				r.status === "dirty" && t.dirty(), n.add(r.value);
			}
			return {
				status: t.value,
				value: n
			};
		}
		let o = [...n.data.values()].map((e, t) => i._parse(new se(n, e, n.path, t)));
		return n.common.async ? Promise.all(o).then((e) => a(e)) : a(o);
	}
	min(t, n) {
		return new e({
			...this._def,
			minSize: {
				value: t,
				message: w.toString(n)
			}
		});
	}
	max(t, n) {
		return new e({
			...this._def,
			maxSize: {
				value: t,
				message: w.toString(n)
			}
		});
	}
	size(e, t) {
		return this.min(e, t).max(e, t);
	}
	nonempty(e) {
		return this.min(1, e);
	}
};
rt.create = (e, t) => new rt({
	valueType: e,
	minSize: null,
	maxSize: null,
	typeName: D.ZodSet,
	...T(t)
});
var it = class e extends E {
	constructor() {
		super(...arguments), this.validate = this.implement;
	}
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		if (t.parsedType !== m.function) return b(t, {
			code: g.invalid_type,
			expected: m.function,
			received: t.parsedType
		}), S;
		function n(e, n) {
			return y({
				data: e,
				path: t.path,
				errorMaps: [
					t.common.contextualErrorMap,
					t.schemaErrorMap,
					te(),
					v
				].filter((e) => !!e),
				issueData: {
					code: g.invalid_arguments,
					argumentsError: n
				}
			});
		}
		function r(e, n) {
			return y({
				data: e,
				path: t.path,
				errorMaps: [
					t.common.contextualErrorMap,
					t.schemaErrorMap,
					te(),
					v
				].filter((e) => !!e),
				issueData: {
					code: g.invalid_return_type,
					returnTypeError: n
				}
			});
		}
		let i = { errorMap: t.common.contextualErrorMap }, a = t.data;
		if (this._def.returns instanceof ut) {
			let e = this;
			return C(async function(...t) {
				let o = new _([]), s = await e._def.args.parseAsync(t, i).catch((e) => {
					throw o.addIssue(n(t, e)), o;
				}), c = await Reflect.apply(a, this, s);
				return await e._def.returns._def.type.parseAsync(c, i).catch((e) => {
					throw o.addIssue(r(c, e)), o;
				});
			});
		} else {
			let e = this;
			return C(function(...t) {
				let o = e._def.args.safeParse(t, i);
				if (!o.success) throw new _([n(t, o.error)]);
				let s = Reflect.apply(a, this, o.data), c = e._def.returns.safeParse(s, i);
				if (!c.success) throw new _([r(s, c.error)]);
				return c.data;
			});
		}
	}
	parameters() {
		return this._def.args;
	}
	returnType() {
		return this._def.returns;
	}
	args(...t) {
		return new e({
			...this._def,
			args: et.create(t).rest(Ue.create())
		});
	}
	returns(t) {
		return new e({
			...this._def,
			returns: t
		});
	}
	implement(e) {
		return this.parse(e);
	}
	strictImplement(e) {
		return this.parse(e);
	}
	static create(t, n, r) {
		return new e({
			args: t || et.create([]).rest(Ue.create()),
			returns: n || Ue.create(),
			typeName: D.ZodFunction,
			...T(r)
		});
	}
}, at = class extends E {
	get schema() {
		return this._def.getter();
	}
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		return this._def.getter()._parse({
			data: t.data,
			path: t.path,
			parent: t
		});
	}
};
at.create = (e, t) => new at({
	getter: e,
	typeName: D.ZodLazy,
	...T(t)
});
var ot = class extends E {
	_parse(e) {
		if (e.data !== this._def.value) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				received: t.data,
				code: g.invalid_literal,
				expected: this._def.value
			}), S;
		}
		return {
			status: "valid",
			value: e.data
		};
	}
	get value() {
		return this._def.value;
	}
};
ot.create = (e, t) => new ot({
	value: e,
	typeName: D.ZodLiteral,
	...T(t)
});
function st(e, t) {
	return new ct({
		values: e,
		typeName: D.ZodEnum,
		...T(t)
	});
}
var ct = class e extends E {
	_parse(e) {
		if (typeof e.data != "string") {
			let t = this._getOrReturnCtx(e), n = this._def.values;
			return b(t, {
				expected: f.joinValues(n),
				received: t.parsedType,
				code: g.invalid_type
			}), S;
		}
		if (this._cache ||= new Set(this._def.values), !this._cache.has(e.data)) {
			let t = this._getOrReturnCtx(e), n = this._def.values;
			return b(t, {
				received: t.data,
				code: g.invalid_enum_value,
				options: n
			}), S;
		}
		return C(e.data);
	}
	get options() {
		return this._def.values;
	}
	get enum() {
		let e = {};
		for (let t of this._def.values) e[t] = t;
		return e;
	}
	get Values() {
		let e = {};
		for (let t of this._def.values) e[t] = t;
		return e;
	}
	get Enum() {
		let e = {};
		for (let t of this._def.values) e[t] = t;
		return e;
	}
	extract(t, n = this._def) {
		return e.create(t, {
			...this._def,
			...n
		});
	}
	exclude(t, n = this._def) {
		return e.create(this.options.filter((e) => !t.includes(e)), {
			...this._def,
			...n
		});
	}
};
ct.create = st;
var lt = class extends E {
	_parse(e) {
		let t = f.getValidEnumValues(this._def.values), n = this._getOrReturnCtx(e);
		if (n.parsedType !== m.string && n.parsedType !== m.number) {
			let e = f.objectValues(t);
			return b(n, {
				expected: f.joinValues(e),
				received: n.parsedType,
				code: g.invalid_type
			}), S;
		}
		if (this._cache ||= new Set(f.getValidEnumValues(this._def.values)), !this._cache.has(e.data)) {
			let e = f.objectValues(t);
			return b(n, {
				received: n.data,
				code: g.invalid_enum_value,
				options: e
			}), S;
		}
		return C(e.data);
	}
	get enum() {
		return this._def.values;
	}
};
lt.create = (e, t) => new lt({
	values: e,
	typeName: D.ZodNativeEnum,
	...T(t)
});
var ut = class extends E {
	unwrap() {
		return this._def.type;
	}
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		return t.parsedType !== m.promise && t.common.async === !1 ? (b(t, {
			code: g.invalid_type,
			expected: m.promise,
			received: t.parsedType
		}), S) : C((t.parsedType === m.promise ? t.data : Promise.resolve(t.data)).then((e) => this._def.type.parseAsync(e, {
			path: t.path,
			errorMap: t.common.contextualErrorMap
		})));
	}
};
ut.create = (e, t) => new ut({
	type: e,
	typeName: D.ZodPromise,
	...T(t)
});
var dt = class extends E {
	innerType() {
		return this._def.schema;
	}
	sourceType() {
		return this._def.schema._def.typeName === D.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
	}
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e), r = this._def.effect || null, i = {
			addIssue: (e) => {
				b(n, e), e.fatal ? t.abort() : t.dirty();
			},
			get path() {
				return n.path;
			}
		};
		if (i.addIssue = i.addIssue.bind(i), r.type === "preprocess") {
			let e = r.transform(n.data, i);
			if (n.common.async) return Promise.resolve(e).then(async (e) => {
				if (t.value === "aborted") return S;
				let r = await this._def.schema._parseAsync({
					data: e,
					path: n.path,
					parent: n
				});
				return r.status === "aborted" ? S : r.status === "dirty" || t.value === "dirty" ? ne(r.value) : r;
			});
			{
				if (t.value === "aborted") return S;
				let r = this._def.schema._parseSync({
					data: e,
					path: n.path,
					parent: n
				});
				return r.status === "aborted" ? S : r.status === "dirty" || t.value === "dirty" ? ne(r.value) : r;
			}
		}
		if (r.type === "refinement") {
			let e = (e) => {
				let t = r.refinement(e, i);
				if (n.common.async) return Promise.resolve(t);
				if (t instanceof Promise) throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
				return e;
			};
			if (n.common.async === !1) {
				let r = this._def.schema._parseSync({
					data: n.data,
					path: n.path,
					parent: n
				});
				return r.status === "aborted" ? S : (r.status === "dirty" && t.dirty(), e(r.value), {
					status: t.value,
					value: r.value
				});
			} else return this._def.schema._parseAsync({
				data: n.data,
				path: n.path,
				parent: n
			}).then((n) => n.status === "aborted" ? S : (n.status === "dirty" && t.dirty(), e(n.value).then(() => ({
				status: t.value,
				value: n.value
			}))));
		}
		if (r.type === "transform") if (n.common.async === !1) {
			let e = this._def.schema._parseSync({
				data: n.data,
				path: n.path,
				parent: n
			});
			if (!ae(e)) return S;
			let a = r.transform(e.value, i);
			if (a instanceof Promise) throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
			return {
				status: t.value,
				value: a
			};
		} else return this._def.schema._parseAsync({
			data: n.data,
			path: n.path,
			parent: n
		}).then((e) => ae(e) ? Promise.resolve(r.transform(e.value, i)).then((e) => ({
			status: t.value,
			value: e
		})) : S);
		f.assertNever(r);
	}
};
dt.create = (e, t, n) => new dt({
	schema: e,
	typeName: D.ZodEffects,
	effect: t,
	...T(n)
}), dt.createWithPreprocess = (e, t, n) => new dt({
	schema: t,
	effect: {
		type: "preprocess",
		transform: e
	},
	typeName: D.ZodEffects,
	...T(n)
});
var ft = class extends E {
	_parse(e) {
		return this._getType(e) === m.undefined ? C(void 0) : this._def.innerType._parse(e);
	}
	unwrap() {
		return this._def.innerType;
	}
};
ft.create = (e, t) => new ft({
	innerType: e,
	typeName: D.ZodOptional,
	...T(t)
});
var pt = class extends E {
	_parse(e) {
		return this._getType(e) === m.null ? C(null) : this._def.innerType._parse(e);
	}
	unwrap() {
		return this._def.innerType;
	}
};
pt.create = (e, t) => new pt({
	innerType: e,
	typeName: D.ZodNullable,
	...T(t)
});
var mt = class extends E {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = t.data;
		return t.parsedType === m.undefined && (n = this._def.defaultValue()), this._def.innerType._parse({
			data: n,
			path: t.path,
			parent: t
		});
	}
	removeDefault() {
		return this._def.innerType;
	}
};
mt.create = (e, t) => new mt({
	innerType: e,
	typeName: D.ZodDefault,
	defaultValue: typeof t.default == "function" ? t.default : () => t.default,
	...T(t)
});
var ht = class extends E {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = {
			...t,
			common: {
				...t.common,
				issues: []
			}
		}, r = this._def.innerType._parse({
			data: n.data,
			path: n.path,
			parent: { ...n }
		});
		return oe(r) ? r.then((e) => ({
			status: "valid",
			value: e.status === "valid" ? e.value : this._def.catchValue({
				get error() {
					return new _(n.common.issues);
				},
				input: n.data
			})
		})) : {
			status: "valid",
			value: r.status === "valid" ? r.value : this._def.catchValue({
				get error() {
					return new _(n.common.issues);
				},
				input: n.data
			})
		};
	}
	removeCatch() {
		return this._def.innerType;
	}
};
ht.create = (e, t) => new ht({
	innerType: e,
	typeName: D.ZodCatch,
	catchValue: typeof t.catch == "function" ? t.catch : () => t.catch,
	...T(t)
});
var gt = class extends E {
	_parse(e) {
		if (this._getType(e) !== m.nan) {
			let t = this._getOrReturnCtx(e);
			return b(t, {
				code: g.invalid_type,
				expected: m.nan,
				received: t.parsedType
			}), S;
		}
		return {
			status: "valid",
			value: e.data
		};
	}
};
gt.create = (e) => new gt({
	typeName: D.ZodNaN,
	...T(e)
});
var _t = class extends E {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = t.data;
		return this._def.type._parse({
			data: n,
			path: t.path,
			parent: t
		});
	}
	unwrap() {
		return this._def.type;
	}
}, vt = class e extends E {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.common.async) return (async () => {
			let e = await this._def.in._parseAsync({
				data: n.data,
				path: n.path,
				parent: n
			});
			return e.status === "aborted" ? S : e.status === "dirty" ? (t.dirty(), ne(e.value)) : this._def.out._parseAsync({
				data: e.value,
				path: n.path,
				parent: n
			});
		})();
		{
			let e = this._def.in._parseSync({
				data: n.data,
				path: n.path,
				parent: n
			});
			return e.status === "aborted" ? S : e.status === "dirty" ? (t.dirty(), {
				status: "dirty",
				value: e.value
			}) : this._def.out._parseSync({
				data: e.value,
				path: n.path,
				parent: n
			});
		}
	}
	static create(t, n) {
		return new e({
			in: t,
			out: n,
			typeName: D.ZodPipeline
		});
	}
}, yt = class extends E {
	_parse(e) {
		let t = this._def.innerType._parse(e), n = (e) => (ae(e) && (e.value = Object.freeze(e.value)), e);
		return oe(t) ? t.then((e) => n(e)) : n(t);
	}
	unwrap() {
		return this._def.innerType;
	}
};
yt.create = (e, t) => new yt({
	innerType: e,
	typeName: D.ZodReadonly,
	...T(t)
}), Je.lazycreate;
var D;
(function(e) {
	e.ZodString = "ZodString", e.ZodNumber = "ZodNumber", e.ZodNaN = "ZodNaN", e.ZodBigInt = "ZodBigInt", e.ZodBoolean = "ZodBoolean", e.ZodDate = "ZodDate", e.ZodSymbol = "ZodSymbol", e.ZodUndefined = "ZodUndefined", e.ZodNull = "ZodNull", e.ZodAny = "ZodAny", e.ZodUnknown = "ZodUnknown", e.ZodNever = "ZodNever", e.ZodVoid = "ZodVoid", e.ZodArray = "ZodArray", e.ZodObject = "ZodObject", e.ZodUnion = "ZodUnion", e.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", e.ZodIntersection = "ZodIntersection", e.ZodTuple = "ZodTuple", e.ZodRecord = "ZodRecord", e.ZodMap = "ZodMap", e.ZodSet = "ZodSet", e.ZodFunction = "ZodFunction", e.ZodLazy = "ZodLazy", e.ZodLiteral = "ZodLiteral", e.ZodEnum = "ZodEnum", e.ZodEffects = "ZodEffects", e.ZodNativeEnum = "ZodNativeEnum", e.ZodOptional = "ZodOptional", e.ZodNullable = "ZodNullable", e.ZodDefault = "ZodDefault", e.ZodCatch = "ZodCatch", e.ZodPromise = "ZodPromise", e.ZodBranded = "ZodBranded", e.ZodPipeline = "ZodPipeline", e.ZodReadonly = "ZodReadonly";
})(D ||= {}), Ne.create, Fe.create, gt.create, Ie.create, Le.create, Re.create, ze.create, Be.create, Ve.create, He.create, Ue.create, We.create, Ge.create, Ke.create;
var bt = Je.create;
Je.strictCreate, Ye.create, Ze.create, $e.create, et.create, tt.create, nt.create, rt.create, it.create, at.create, ot.create, ct.create, lt.create, ut.create, dt.create, ft.create, pt.create, dt.createWithPreprocess, vt.create, Object.freeze({ status: "aborted" });
function O(e, t, n) {
	function r(n, r) {
		if (n._zod || Object.defineProperty(n, "_zod", {
			value: {
				def: r,
				constr: o,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: !1
		}), n._zod.traits.has(e)) return;
		n._zod.traits.add(e), t(n, r);
		let i = o.prototype, a = Object.keys(i);
		for (let e = 0; e < a.length; e++) {
			let t = a[e];
			t in n || (n[t] = i[t].bind(n));
		}
	}
	let i = (n == null ? void 0 : n.Parent) ?? Object;
	class a extends i {}
	Object.defineProperty(a, "name", { value: e });
	function o(e) {
		var t;
		let i = n != null && n.Parent ? new a() : this;
		r(i, e), (t = i._zod).deferred ?? (t.deferred = []);
		for (let e of i._zod.deferred) e();
		return i;
	}
	return Object.defineProperty(o, "init", { value: r }), Object.defineProperty(o, Symbol.hasInstance, { value: (t) => {
		var r;
		return n != null && n.Parent && t instanceof n.Parent ? !0 : t == null || (r = t._zod) == null || (r = r.traits) == null ? void 0 : r.has(e);
	} }), Object.defineProperty(o, "name", { value: e }), o;
}
var xt = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, St = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
const Ct = {};
function wt(e) {
	return e && Object.assign(Ct, e), Ct;
}
function Tt(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function Et(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
function Dt(e) {
	return { get value() {
		{
			let t = e();
			return Object.defineProperty(this, "value", { value: t }), t;
		}
		throw Error("cached value already set");
	} };
}
function Ot(e) {
	return e == null;
}
function kt(e) {
	let t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function At(e, t) {
	let n = (e.toString().split(".")[1] || "").length, r = t.toString(), i = (r.split(".")[1] || "").length;
	if (i === 0 && /\d?e-\d?/.test(r)) {
		let e = r.match(/\d?e-(\d?)/);
		e != null && e[1] && (i = Number.parseInt(e[1]));
	}
	let a = n > i ? n : i;
	return Number.parseInt(e.toFixed(a).replace(".", "")) % Number.parseInt(t.toFixed(a).replace(".", "")) / 10 ** a;
}
var jt = Symbol("evaluating");
function k(e, t, n) {
	let r;
	Object.defineProperty(e, t, {
		get() {
			if (r !== jt) return r === void 0 && (r = jt, r = n()), r;
		},
		set(n) {
			Object.defineProperty(e, t, { value: n });
		},
		configurable: !0
	});
}
function Mt(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function Nt(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function Pt(e) {
	return JSON.stringify(e);
}
function Ft(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const It = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function Lt(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
const Rt = Dt(() => {
	var e;
	if (typeof navigator < "u" && !((e = navigator) == null || (e = e.userAgent) == null) && e.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function zt(e) {
	if (Lt(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return !(Lt(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function Bt(e) {
	return zt(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const Vt = new Set([
	"string",
	"number",
	"symbol"
]);
function Ht(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Ut(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n != null && n.parent) && (r._zod.parent = e), r;
}
function A(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if ((t == null ? void 0 : t.message) !== void 0) {
		if ((t == null ? void 0 : t.error) !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function Wt(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const Gt = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function Kt(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	return Ut(e, Nt(e._zod.def, {
		get shape() {
			let e = {};
			for (let r in t) {
				if (!(r in n.shape)) throw Error(`Unrecognized key: "${r}"`);
				t[r] && (e[r] = n.shape[r]);
			}
			return Mt(this, "shape", e), e;
		},
		checks: []
	}));
}
function qt(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	return Ut(e, Nt(e._zod.def, {
		get shape() {
			let r = { ...e._zod.def.shape };
			for (let e in t) {
				if (!(e in n.shape)) throw Error(`Unrecognized key: "${e}"`);
				t[e] && delete r[e];
			}
			return Mt(this, "shape", r), r;
		},
		checks: []
	}));
}
function Jt(e, t) {
	if (!zt(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = e._zod.def.shape;
		for (let e in t) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return Ut(e, Nt(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return Mt(this, "shape", n), n;
	} }));
}
function Yt(e, t) {
	if (!zt(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return Ut(e, Nt(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return Mt(this, "shape", n), n;
	} }));
}
function Xt(e, t) {
	return Ut(e, Nt(e._zod.def, {
		get shape() {
			let n = {
				...e._zod.def.shape,
				...t._zod.def.shape
			};
			return Mt(this, "shape", n), n;
		},
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: []
	}));
}
function Zt(e, t, n) {
	let r = t._zod.def.checks;
	if (r && r.length > 0) throw Error(".partial() cannot be used on object schemas containing refinements");
	return Ut(t, Nt(t._zod.def, {
		get shape() {
			let r = t._zod.def.shape, i = { ...r };
			if (n) for (let t in n) {
				if (!(t in r)) throw Error(`Unrecognized key: "${t}"`);
				n[t] && (i[t] = e ? new e({
					type: "optional",
					innerType: r[t]
				}) : r[t]);
			}
			else for (let t in r) i[t] = e ? new e({
				type: "optional",
				innerType: r[t]
			}) : r[t];
			return Mt(this, "shape", i), i;
		},
		checks: []
	}));
}
function Qt(e, t, n) {
	return Ut(t, Nt(t._zod.def, { get shape() {
		let r = t._zod.def.shape, i = { ...r };
		if (n) for (let t in n) {
			if (!(t in i)) throw Error(`Unrecognized key: "${t}"`);
			n[t] && (i[t] = new e({
				type: "nonoptional",
				innerType: r[t]
			}));
		}
		else for (let t in r) i[t] = new e({
			type: "nonoptional",
			innerType: r[t]
		});
		return Mt(this, "shape", i), i;
	} }));
}
function $t(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let r = t; r < e.issues.length; r++) {
		var n;
		if (((n = e.issues[r]) == null ? void 0 : n.continue) !== !0) return !0;
	}
	return !1;
}
function en(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function tn(e) {
	return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function nn(e, t, n) {
	let r = {
		...e,
		path: e.path ?? []
	};
	if (!e.message) {
		var i, a, o, s, c;
		r.message = tn((i = e.inst) == null || (i = i._zod.def) == null || (a = i.error) == null ? void 0 : a.call(i, e)) ?? tn(t == null || (o = t.error) == null ? void 0 : o.call(t, e)) ?? tn((s = n.customError) == null ? void 0 : s.call(n, e)) ?? tn((c = n.localeError) == null ? void 0 : c.call(n, e)) ?? "Invalid input";
	}
	return delete r.inst, delete r.continue, t != null && t.reportInput || delete r.input, r;
}
function rn(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function an(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
var on = (e, t) => {
	e.name = "$ZodError", Object.defineProperty(e, "_zod", {
		value: e._zod,
		enumerable: !1
	}), Object.defineProperty(e, "issues", {
		value: t,
		enumerable: !1
	}), e.message = JSON.stringify(t, Et, 2), Object.defineProperty(e, "toString", {
		value: () => e.message,
		enumerable: !1
	});
};
const sn = O("$ZodError", on), cn = O("$ZodError", on, { Parent: Error });
function ln(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? (n[i.path[0]] = n[i.path[0]] || [], n[i.path[0]].push(t(i))) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function un(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e) => {
		for (let i of e.issues) if (i.code === "invalid_union" && i.errors.length) i.errors.map((e) => r({ issues: e }));
		else if (i.code === "invalid_key") r({ issues: i.issues });
		else if (i.code === "invalid_element") r({ issues: i.issues });
		else if (i.path.length === 0) n._errors.push(t(i));
		else {
			let e = n, r = 0;
			for (; r < i.path.length;) {
				let n = i.path[r];
				r === i.path.length - 1 ? (e[n] = e[n] || { _errors: [] }, e[n]._errors.push(t(i))) : e[n] = e[n] || { _errors: [] }, e = e[n], r++;
			}
		}
	};
	return r(e), n;
}
const dn = (e) => (t, n, r, i) => {
	let a = r ? Object.assign(r, { async: !1 }) : { async: !1 }, o = t._zod.run({
		value: n,
		issues: []
	}, a);
	if (o instanceof Promise) throw new xt();
	if (o.issues.length) {
		let t = new ((i == null ? void 0 : i.Err) ?? e)(o.issues.map((e) => nn(e, a, wt())));
		throw It(t, i == null ? void 0 : i.callee), t;
	}
	return o.value;
}, fn = /* @__PURE__ */ dn(cn), pn = (e) => async (t, n, r, i) => {
	let a = r ? Object.assign(r, { async: !0 }) : { async: !0 }, o = t._zod.run({
		value: n,
		issues: []
	}, a);
	if (o instanceof Promise && (o = await o), o.issues.length) {
		let t = new ((i == null ? void 0 : i.Err) ?? e)(o.issues.map((e) => nn(e, a, wt())));
		throw It(t, i == null ? void 0 : i.callee), t;
	}
	return o.value;
}, mn = /* @__PURE__ */ pn(cn), hn = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new xt();
	return a.issues.length ? {
		success: !1,
		error: new (e ?? sn)(a.issues.map((e) => nn(e, i, wt())))
	} : {
		success: !0,
		data: a.value
	};
}, gn = /* @__PURE__ */ hn(cn), _n = (e) => async (t, n, r) => {
	let i = r ? Object.assign(r, { async: !0 }) : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? {
		success: !1,
		error: new e(a.issues.map((e) => nn(e, i, wt())))
	} : {
		success: !0,
		data: a.value
	};
}, vn = /* @__PURE__ */ _n(cn), yn = (e) => (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return dn(e)(t, n, i);
}, bn = (e) => (t, n, r) => dn(e)(t, n, r), xn = (e) => async (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return pn(e)(t, n, i);
}, Sn = (e) => async (t, n, r) => pn(e)(t, n, r), Cn = (e) => (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return hn(e)(t, n, i);
}, wn = (e) => (t, n, r) => hn(e)(t, n, r), Tn = (e) => async (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return _n(e)(t, n, i);
}, En = (e) => async (t, n, r) => _n(e)(t, n, r), Dn = /^[cC][^\s-]{8,}$/, On = /^[0-9a-z]+$/, kn = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, An = /^[0-9a-vA-V]{20}$/, jn = /^[A-Za-z0-9]{27}$/, Mn = /^[a-zA-Z0-9_-]{21}$/, Nn = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Pn = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Fn = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, In = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var Ln = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Rn() {
	return new RegExp(Ln, "u");
}
const zn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Bn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Vn = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Hn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Un = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Wn = /^[A-Za-z0-9_-]*$/, Gn = /^\+[1-9]\d{6,14}$/;
var Kn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
const qn = /* @__PURE__ */ RegExp(`^${Kn}$`);
function Jn(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Yn(e) {
	return RegExp(`^${Jn(e)}$`);
}
function Xn(e) {
	let t = Jn({ precision: e.precision }), n = ["Z"];
	e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let r = `${t}(?:${n.join("|")})`;
	return RegExp(`^${Kn}T(?:${r})$`);
}
const Zn = (e) => {
	let t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
	return RegExp(`^${t}$`);
}, Qn = /^-?\d+$/, $n = /^-?\d+(?:\.\d+)?$/, er = /^(?:true|false)$/i;
var tr = /^null$/i;
const nr = /^[^A-Z]*$/, rr = /^[^a-z]*$/, ir = /* @__PURE__ */ O("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
});
var ar = {
	number: "number",
	bigint: "bigint",
	object: "date"
};
const or = /* @__PURE__ */ O("$ZodCheckLessThan", (e, t) => {
	ir.init(e, t);
	let n = ar[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.maximum : n.exclusiveMaximum) ?? Infinity;
		t.value < r && (t.inclusive ? n.maximum = t.value : n.exclusiveMaximum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), sr = /* @__PURE__ */ O("$ZodCheckGreaterThan", (e, t) => {
	ir.init(e, t);
	let n = ar[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.minimum : n.exclusiveMinimum) ?? -Infinity;
		t.value > r && (t.inclusive ? n.minimum = t.value : n.exclusiveMinimum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), cr = /* @__PURE__ */ O("$ZodCheckMultipleOf", (e, t) => {
	ir.init(e, t), e._zod.onattach.push((e) => {
		var n;
		(n = e._zod.bag).multipleOf ?? (n.multipleOf = t.value);
	}), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : At(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), lr = /* @__PURE__ */ O("$ZodCheckNumberFormat", (e, t) => {
	var n;
	ir.init(e, t), t.format = t.format || "float64";
	let r = (n = t.format) == null ? void 0 : n.includes("int"), i = r ? "int" : "number", [a, o] = Gt[t.format];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.format = t.format, n.minimum = a, n.maximum = o, r && (n.pattern = Qn);
	}), e._zod.check = (n) => {
		let s = n.value;
		if (r) {
			if (!Number.isInteger(s)) {
				n.issues.push({
					expected: i,
					format: t.format,
					code: "invalid_type",
					continue: !1,
					input: s,
					inst: e
				});
				return;
			}
			if (!Number.isSafeInteger(s)) {
				s > 0 ? n.issues.push({
					input: s,
					code: "too_big",
					maximum: 2 ** 53 - 1,
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: i,
					inclusive: !0,
					continue: !t.abort
				}) : n.issues.push({
					input: s,
					code: "too_small",
					minimum: -(2 ** 53 - 1),
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: i,
					inclusive: !0,
					continue: !t.abort
				});
				return;
			}
		}
		s < a && n.issues.push({
			origin: "number",
			input: s,
			code: "too_small",
			minimum: a,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), s > o && n.issues.push({
			origin: "number",
			input: s,
			code: "too_big",
			maximum: o,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		});
	};
}), ur = /* @__PURE__ */ O("$ZodCheckMaxLength", (e, t) => {
	var n;
	ir.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !Ot(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.maximum ?? Infinity;
		t.maximum < n && (e._zod.bag.maximum = t.maximum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length <= t.maximum) return;
		let i = rn(r);
		n.issues.push({
			origin: i,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), dr = /* @__PURE__ */ O("$ZodCheckMinLength", (e, t) => {
	var n;
	ir.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !Ot(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.minimum ?? -Infinity;
		t.minimum > n && (e._zod.bag.minimum = t.minimum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length >= t.minimum) return;
		let i = rn(r);
		n.issues.push({
			origin: i,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), fr = /* @__PURE__ */ O("$ZodCheckLengthEquals", (e, t) => {
	var n;
	ir.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !Ot(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.minimum = t.length, n.maximum = t.length, n.length = t.length;
	}), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if (i === t.length) return;
		let a = rn(r), o = i > t.length;
		n.issues.push({
			origin: a,
			...o ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), pr = /* @__PURE__ */ O("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	ir.init(e, t), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.format = t.format, t.pattern && (n.patterns ??= /* @__PURE__ */ new Set(), n.patterns.add(t.pattern));
	}), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), mr = /* @__PURE__ */ O("$ZodCheckRegex", (e, t) => {
	pr.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), hr = /* @__PURE__ */ O("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= nr, pr.init(e, t);
}), gr = /* @__PURE__ */ O("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= rr, pr.init(e, t);
}), _r = /* @__PURE__ */ O("$ZodCheckIncludes", (e, t) => {
	ir.init(e, t);
	let n = Ht(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
	t.pattern = r, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(r);
	}), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), vr = /* @__PURE__ */ O("$ZodCheckStartsWith", (e, t) => {
	ir.init(e, t);
	let n = RegExp(`^${Ht(t.prefix)}.*`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), yr = /* @__PURE__ */ O("$ZodCheckEndsWith", (e, t) => {
	ir.init(e, t);
	let n = RegExp(`.*${Ht(t.suffix)}$`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), br = /* @__PURE__ */ O("$ZodCheckOverwrite", (e, t) => {
	ir.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
});
var xr = class {
	constructor(e = []) {
		this.content = [], this.indent = 0, this && (this.args = e);
	}
	indented(e) {
		this.indent += 1, e(this), --this.indent;
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		var e, t;
		let n = Function, r = (e = this) == null ? void 0 : e.args, i = [...(((t = this) == null ? void 0 : t.content) ?? [""]).map((e) => `  ${e}`)];
		return new n(...r, i.join("\n"));
	}
};
const Sr = {
	major: 4,
	minor: 3,
	patch: 6
}, j = /* @__PURE__ */ O("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Sr;
	let r = [...e._zod.def.checks ?? []];
	e._zod.traits.has("$ZodCheck") && r.unshift(e);
	for (let t of r) for (let n of t._zod.onattach) n(e);
	if (r.length === 0) {
		var i;
		(n = e._zod).deferred ?? (n.deferred = []), (i = e._zod.deferred) == null || i.push(() => {
			e._zod.run = e._zod.parse;
		});
	} else {
		let t = (e, t, n) => {
			let r = $t(e), i;
			for (let a of t) {
				if (a._zod.def.when) {
					if (!a._zod.def.when(e)) continue;
				} else if (r) continue;
				let t = e.issues.length, o = a._zod.check(e);
				if (o instanceof Promise && (n == null ? void 0 : n.async) === !1) throw new xt();
				if (i || o instanceof Promise) i = (i ?? Promise.resolve()).then(async () => {
					await o, e.issues.length !== t && (r ||= $t(e, t));
				});
				else {
					if (e.issues.length === t) continue;
					r ||= $t(e, t);
				}
			}
			return i ? i.then(() => e) : e;
		}, n = (n, i, a) => {
			if ($t(n)) return n.aborted = !0, n;
			let o = t(i, r, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new xt();
				return o.then((t) => e._zod.parse(t, a));
			}
			return e._zod.parse(o, a);
		};
		e._zod.run = (i, a) => {
			if (a.skipChecks) return e._zod.parse(i, a);
			if (a.direction === "backward") {
				let t = e._zod.parse({
					value: i.value,
					issues: []
				}, {
					...a,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => n(e, i, a)) : n(t, i, a);
			}
			let o = e._zod.parse(i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new xt();
				return o.then((e) => t(e, r, a));
			}
			return t(o, r, a);
		};
	}
	k(e, "~standard", () => ({
		validate: (t) => {
			try {
				var n;
				let r = gn(e, t);
				return r.success ? { value: r.data } : { issues: (n = r.error) == null ? void 0 : n.issues };
			} catch {
				return vn(e, t).then((e) => {
					var t;
					return e.success ? { value: e.data } : { issues: (t = e.error) == null ? void 0 : t.issues };
				});
			}
		},
		vendor: "zod",
		version: 1
	}));
}), Cr = /* @__PURE__ */ O("$ZodString", (e, t) => {
	var n;
	j.init(e, t), e._zod.pattern = [...(e == null || (n = e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? Zn(e._zod.bag), e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), M = /* @__PURE__ */ O("$ZodStringFormat", (e, t) => {
	pr.init(e, t), Cr.init(e, t);
}), wr = /* @__PURE__ */ O("$ZodGUID", (e, t) => {
	t.pattern ??= Pn, M.init(e, t);
}), Tr = /* @__PURE__ */ O("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= Fn(e);
	} else t.pattern ??= Fn();
	M.init(e, t);
}), Er = /* @__PURE__ */ O("$ZodEmail", (e, t) => {
	t.pattern ??= In, M.init(e, t);
}), Dr = /* @__PURE__ */ O("$ZodURL", (e, t) => {
	M.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = new URL(r);
			t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(i.hostname) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(i.protocol.endsWith(":") ? i.protocol.slice(0, -1) : i.protocol) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.normalize ? n.value = i.href : n.value = r;
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), Or = /* @__PURE__ */ O("$ZodEmoji", (e, t) => {
	t.pattern ??= Rn(), M.init(e, t);
}), kr = /* @__PURE__ */ O("$ZodNanoID", (e, t) => {
	t.pattern ??= Mn, M.init(e, t);
}), Ar = /* @__PURE__ */ O("$ZodCUID", (e, t) => {
	t.pattern ??= Dn, M.init(e, t);
}), jr = /* @__PURE__ */ O("$ZodCUID2", (e, t) => {
	t.pattern ??= On, M.init(e, t);
}), Mr = /* @__PURE__ */ O("$ZodULID", (e, t) => {
	t.pattern ??= kn, M.init(e, t);
}), Nr = /* @__PURE__ */ O("$ZodXID", (e, t) => {
	t.pattern ??= An, M.init(e, t);
}), Pr = /* @__PURE__ */ O("$ZodKSUID", (e, t) => {
	t.pattern ??= jn, M.init(e, t);
}), Fr = /* @__PURE__ */ O("$ZodISODateTime", (e, t) => {
	t.pattern ??= Xn(t), M.init(e, t);
}), Ir = /* @__PURE__ */ O("$ZodISODate", (e, t) => {
	t.pattern ??= qn, M.init(e, t);
}), Lr = /* @__PURE__ */ O("$ZodISOTime", (e, t) => {
	t.pattern ??= Yn(t), M.init(e, t);
}), Rr = /* @__PURE__ */ O("$ZodISODuration", (e, t) => {
	t.pattern ??= Nn, M.init(e, t);
}), zr = /* @__PURE__ */ O("$ZodIPv4", (e, t) => {
	t.pattern ??= zn, M.init(e, t), e._zod.bag.format = "ipv4";
}), Br = /* @__PURE__ */ O("$ZodIPv6", (e, t) => {
	t.pattern ??= Bn, M.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
		try {
			new URL(`http://[${n.value}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), Vr = /* @__PURE__ */ O("$ZodCIDRv4", (e, t) => {
	t.pattern ??= Vn, M.init(e, t);
}), Hr = /* @__PURE__ */ O("$ZodCIDRv6", (e, t) => {
	t.pattern ??= Hn, M.init(e, t), e._zod.check = (n) => {
		let r = n.value.split("/");
		try {
			if (r.length !== 2) throw Error();
			let [e, t] = r;
			if (!t) throw Error();
			let n = Number(t);
			if (`${n}` !== t || n < 0 || n > 128) throw Error();
			new URL(`http://[${e}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
});
function Ur(e) {
	if (e === "") return !0;
	if (e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
const Wr = /* @__PURE__ */ O("$ZodBase64", (e, t) => {
	t.pattern ??= Un, M.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
		Ur(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function Gr(e) {
	if (!Wn.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return Ur(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
const Kr = /* @__PURE__ */ O("$ZodBase64URL", (e, t) => {
	t.pattern ??= Wn, M.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
		Gr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), qr = /* @__PURE__ */ O("$ZodE164", (e, t) => {
	t.pattern ??= Gn, M.init(e, t);
});
function Jr(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && (i == null ? void 0 : i.typ) !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
const Yr = /* @__PURE__ */ O("$ZodJWT", (e, t) => {
	M.init(e, t), e._zod.check = (n) => {
		Jr(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Xr = /* @__PURE__ */ O("$ZodNumber", (e, t) => {
	j.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? $n, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = Number(n.value);
		} catch {}
		let i = n.value;
		if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i)) return n;
		let a = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : "Infinity" : void 0;
		return n.issues.push({
			expected: "number",
			code: "invalid_type",
			input: i,
			inst: e,
			...a ? { received: a } : {}
		}), n;
	};
}), Zr = /* @__PURE__ */ O("$ZodNumberFormat", (e, t) => {
	lr.init(e, t), Xr.init(e, t);
}), Qr = /* @__PURE__ */ O("$ZodBoolean", (e, t) => {
	j.init(e, t), e._zod.pattern = er, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), $r = /* @__PURE__ */ O("$ZodNull", (e, t) => {
	j.init(e, t), e._zod.pattern = tr, e._zod.values = new Set([null]), e._zod.parse = (t, n) => {
		let r = t.value;
		return r === null || t.issues.push({
			expected: "null",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
	};
}), ei = /* @__PURE__ */ O("$ZodUnknown", (e, t) => {
	j.init(e, t), e._zod.parse = (e) => e;
}), ti = /* @__PURE__ */ O("$ZodNever", (e, t) => {
	j.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function ni(e, t, n) {
	e.issues.length && t.issues.push(...en(n, e.issues)), t.value[n] = e.value;
}
const ri = /* @__PURE__ */ O("$ZodArray", (e, t) => {
	j.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!Array.isArray(i)) return n.issues.push({
			expected: "array",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		n.value = Array(i.length);
		let a = [];
		for (let e = 0; e < i.length; e++) {
			let o = i[e], s = t.element._zod.run({
				value: o,
				issues: []
			}, r);
			s instanceof Promise ? a.push(s.then((t) => ni(t, n, e))) : ni(s, n, e);
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
});
function ii(e, t, n, r, i) {
	if (e.issues.length) {
		if (i && !(n in r)) return;
		t.issues.push(...en(n, e.issues));
	}
	e.value === void 0 ? n in r && (t.value[n] = void 0) : t.value[n] = e.value;
}
function ai(e) {
	let t = Object.keys(e.shape);
	for (let r of t) {
		var n;
		if (!(!((n = e.shape) == null || (n = n[r]) == null || (n = n._zod) == null || (n = n.traits) == null) && n.has("$ZodType"))) throw Error(`Invalid element at key "${r}": expected a Zod schema`);
	}
	let r = Wt(e.shape);
	return {
		...e,
		keys: t,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(r)
	};
}
function oi(e, t, n, r, i, a) {
	let o = [], s = i.keySet, c = i.catchall._zod, l = c.def.type, u = c.optout === "optional";
	for (let i in t) {
		if (s.has(i)) continue;
		if (l === "never") {
			o.push(i);
			continue;
		}
		let a = c.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => ii(e, n, i, t, u))) : ii(a, n, i, t, u);
	}
	return o.length && n.issues.push({
		code: "unrecognized_keys",
		keys: o,
		input: t,
		inst: a
	}), e.length ? Promise.all(e).then(() => n) : n;
}
const si = /* @__PURE__ */ O("$ZodObject", (e, t) => {
	j.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape");
	if (!(n != null && n.get)) {
		let e = t.shape;
		Object.defineProperty(t, "shape", { get: () => {
			let n = { ...e };
			return Object.defineProperty(t, "shape", { value: n }), n;
		} });
	}
	let r = Dt(() => ai(t));
	k(e._zod, "propValues", () => {
		let e = t.shape, n = {};
		for (let t in e) {
			let r = e[t]._zod;
			if (r.values) {
				n[t] ?? (n[t] = /* @__PURE__ */ new Set());
				for (let e of r.values) n[t].add(e);
			}
		}
		return n;
	});
	let i = Lt, a = t.catchall, o;
	e._zod.parse = (t, n) => {
		o ??= r.value;
		let s = t.value;
		if (!i(s)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: s,
			inst: e
		}), t;
		t.value = {};
		let c = [], l = o.shape;
		for (let e of o.keys) {
			let r = l[e], i = r._zod.optout === "optional", a = r._zod.run({
				value: s[e],
				issues: []
			}, n);
			a instanceof Promise ? c.push(a.then((n) => ii(n, t, e, s, i))) : ii(a, t, e, s, i);
		}
		return a ? oi(c, s, t, n, r.value, e) : c.length ? Promise.all(c).then(() => t) : t;
	};
}), ci = /* @__PURE__ */ O("$ZodObjectJIT", (e, t) => {
	si.init(e, t);
	let n = e._zod.parse, r = Dt(() => ai(t)), i = (e) => {
		let t = new xr([
			"shape",
			"payload",
			"ctx"
		]), n = r.value, i = (e) => {
			let t = Pt(e);
			return `shape[${t}]._zod.run({ value: input[${t}], issues: [] }, ctx)`;
		};
		t.write("const input = payload.value;");
		let a = Object.create(null), o = 0;
		for (let e of n.keys) a[e] = `key_${o++}`;
		t.write("const newResult = {};");
		for (let r of n.keys) {
			var s;
			let n = a[r], o = Pt(r), c = e[r], l = (c == null || (s = c._zod) == null ? void 0 : s.optout) === "optional";
			t.write(`const ${n} = ${i(r)};`), l ? t.write(`
        if (${n}.issues.length) {
          if (${o} in input) {
            payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${o}, ...iss.path] : [${o}]
            })));
          }
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `) : t.write(`
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `);
		}
		t.write("payload.value = newResult;"), t.write("return payload;");
		let c = t.compile();
		return (t, n) => c(e, t, n);
	}, a, o = Lt, s = !Ct.jitless, c = s && Rt.value, l = t.catchall, u;
	e._zod.parse = (d, f) => {
		u ??= r.value;
		let p = d.value;
		return o(p) ? s && c && (f == null ? void 0 : f.async) === !1 && f.jitless !== !0 ? (a ||= i(t.shape), d = a(d, f), l ? oi([], p, d, f, u, e) : d) : n(d, f) : (d.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), d);
	};
});
function li(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !$t(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => nn(e, r, wt())))
	}), t);
}
const ui = /* @__PURE__ */ O("$ZodUnion", (e, t) => {
	j.init(e, t), k(e._zod, "optin", () => t.options.some((e) => e._zod.optin === "optional") ? "optional" : void 0), k(e._zod, "optout", () => t.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), k(e._zod, "values", () => {
		if (t.options.every((e) => e._zod.values)) return new Set(t.options.flatMap((e) => Array.from(e._zod.values)));
	}), k(e._zod, "pattern", () => {
		if (t.options.every((e) => e._zod.pattern)) {
			let e = t.options.map((e) => e._zod.pattern);
			return RegExp(`^(${e.map((e) => kt(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1, r = t.options[0]._zod.run;
	e._zod.parse = (i, a) => {
		if (n) return r(i, a);
		let o = !1, s = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: i.value,
				issues: []
			}, a);
			if (t instanceof Promise) s.push(t), o = !0;
			else {
				if (t.issues.length === 0) return t;
				s.push(t);
			}
		}
		return o ? Promise.all(s).then((t) => li(t, i, e, a)) : li(s, i, e, a);
	};
}), di = /* @__PURE__ */ O("$ZodDiscriminatedUnion", (e, t) => {
	t.inclusive = !1, ui.init(e, t);
	let n = e._zod.parse;
	k(e._zod, "propValues", () => {
		let e = {};
		for (let n of t.options) {
			let r = n._zod.propValues;
			if (!r || Object.keys(r).length === 0) throw Error(`Invalid discriminated union option at index "${t.options.indexOf(n)}"`);
			for (let [t, n] of Object.entries(r)) {
				e[t] || (e[t] = /* @__PURE__ */ new Set());
				for (let r of n) e[t].add(r);
			}
		}
		return e;
	});
	let r = Dt(() => {
		let e = t.options, n = /* @__PURE__ */ new Map();
		for (let i of e) {
			var r;
			let e = (r = i._zod.propValues) == null ? void 0 : r[t.discriminator];
			if (!e || e.size === 0) throw Error(`Invalid discriminated union option at index "${t.options.indexOf(i)}"`);
			for (let t of e) {
				if (n.has(t)) throw Error(`Duplicate discriminator value "${String(t)}"`);
				n.set(t, i);
			}
		}
		return n;
	});
	e._zod.parse = (i, a) => {
		let o = i.value;
		if (!Lt(o)) return i.issues.push({
			code: "invalid_type",
			expected: "object",
			input: o,
			inst: e
		}), i;
		let s = r.value.get(o == null ? void 0 : o[t.discriminator]);
		return s ? s._zod.run(i, a) : t.unionFallback ? n(i, a) : (i.issues.push({
			code: "invalid_union",
			errors: [],
			note: "No matching discriminator",
			discriminator: t.discriminator,
			input: o,
			path: [t.discriminator],
			inst: e
		}), i);
	};
}), fi = /* @__PURE__ */ O("$ZodIntersection", (e, t) => {
	j.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => mi(e, t, n)) : mi(e, i, a);
	};
});
function pi(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (zt(e) && zt(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		for (let n of r) {
			let r = pi(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = pi(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function mi(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i;
	for (let n of t.issues) if (n.code === "unrecognized_keys") {
		i ??= n;
		for (let e of n.keys) r.has(e) || r.set(e, {}), r.get(e).l = !0;
	} else e.issues.push(n);
	for (let t of n.issues) if (t.code === "unrecognized_keys") for (let e of t.keys) r.has(e) || r.set(e, {}), r.get(e).r = !0;
	else e.issues.push(t);
	let a = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
	if (a.length && i && e.issues.push({
		...i,
		keys: a
	}), $t(e)) return e;
	let o = pi(t.value, n.value);
	if (!o.valid) throw Error(`Unmergable intersection. Error path: ${JSON.stringify(o.mergeErrorPath)}`);
	return e.value = o.data, e;
}
const hi = /* @__PURE__ */ O("$ZodRecord", (e, t) => {
	j.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!zt(i)) return n.issues.push({
			expected: "record",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		let a = [], o = t.keyType._zod.values;
		if (o) {
			n.value = {};
			let s = /* @__PURE__ */ new Set();
			for (let e of o) if (typeof e == "string" || typeof e == "number" || typeof e == "symbol") {
				s.add(typeof e == "number" ? e.toString() : e);
				let o = t.valueType._zod.run({
					value: i[e],
					issues: []
				}, r);
				o instanceof Promise ? a.push(o.then((t) => {
					t.issues.length && n.issues.push(...en(e, t.issues)), n.value[e] = t.value;
				})) : (o.issues.length && n.issues.push(...en(e, o.issues)), n.value[e] = o.value);
			}
			let c;
			for (let e in i) s.has(e) || (c ??= [], c.push(e));
			c && c.length > 0 && n.issues.push({
				code: "unrecognized_keys",
				input: i,
				inst: e,
				keys: c
			});
		} else {
			n.value = {};
			for (let o of Reflect.ownKeys(i)) {
				if (o === "__proto__") continue;
				let s = t.keyType._zod.run({
					value: o,
					issues: []
				}, r);
				if (s instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (typeof o == "string" && $n.test(o) && s.issues.length) {
					let e = t.keyType._zod.run({
						value: Number(o),
						issues: []
					}, r);
					if (e instanceof Promise) throw Error("Async schemas not supported in object keys currently");
					e.issues.length === 0 && (s = e);
				}
				if (s.issues.length) {
					t.mode === "loose" ? n.value[o] = i[o] : n.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: s.issues.map((e) => nn(e, r, wt())),
						input: o,
						path: [o],
						inst: e
					});
					continue;
				}
				let c = t.valueType._zod.run({
					value: i[o],
					issues: []
				}, r);
				c instanceof Promise ? a.push(c.then((e) => {
					e.issues.length && n.issues.push(...en(o, e.issues)), n.value[s.value] = e.value;
				})) : (c.issues.length && n.issues.push(...en(o, c.issues)), n.value[s.value] = c.value);
			}
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
}), gi = /* @__PURE__ */ O("$ZodEnum", (e, t) => {
	j.init(e, t);
	let n = Tt(t.entries), r = new Set(n);
	e._zod.values = r, e._zod.pattern = RegExp(`^(${n.filter((e) => Vt.has(typeof e)).map((e) => typeof e == "string" ? Ht(e) : e.toString()).join("|")})$`), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), _i = /* @__PURE__ */ O("$ZodLiteral", (e, t) => {
	if (j.init(e, t), t.values.length === 0) throw Error("Cannot create literal schema with no valid values");
	let n = new Set(t.values);
	e._zod.values = n, e._zod.pattern = RegExp(`^(${t.values.map((e) => typeof e == "string" ? Ht(e) : e ? Ht(e.toString()) : String(e)).join("|")})$`), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), vi = /* @__PURE__ */ O("$ZodTransform", (e, t) => {
	j.init(e, t), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new St(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new xt();
		return n.value = i, n;
	};
});
function yi(e, t) {
	return e.issues.length && t === void 0 ? {
		issues: [],
		value: void 0
	} : e;
}
const bi = /* @__PURE__ */ O("$ZodOptional", (e, t) => {
	j.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", k(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, void 0]) : void 0), k(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${kt(e.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (t.innerType._zod.optin === "optional") {
			let r = t.innerType._zod.run(e, n);
			return r instanceof Promise ? r.then((t) => yi(t, e.value)) : yi(r, e.value);
		}
		return e.value === void 0 ? e : t.innerType._zod.run(e, n);
	};
}), xi = /* @__PURE__ */ O("$ZodExactOptional", (e, t) => {
	bi.init(e, t), k(e._zod, "values", () => t.innerType._zod.values), k(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Si = /* @__PURE__ */ O("$ZodNullable", (e, t) => {
	j.init(e, t), k(e._zod, "optin", () => t.innerType._zod.optin), k(e._zod, "optout", () => t.innerType._zod.optout), k(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${kt(e.source)}|null)$`) : void 0;
	}), k(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Ci = /* @__PURE__ */ O("$ZodDefault", (e, t) => {
	j.init(e, t), e._zod.optin = "optional", k(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0)
 /**
		* $ZodDefault returns the default value immediately in forward direction.
		* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
		return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => wi(e, t)) : wi(r, t);
	};
});
function wi(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Ti = /* @__PURE__ */ O("$ZodPrefault", (e, t) => {
	j.init(e, t), e._zod.optin = "optional", k(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), Ei = /* @__PURE__ */ O("$ZodNonOptional", (e, t) => {
	j.init(e, t), k(e._zod, "values", () => {
		let e = t.innerType._zod.values;
		return e ? new Set([...e].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => Di(t, e)) : Di(i, e);
	};
});
function Di(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
const Oi = /* @__PURE__ */ O("$ZodCatch", (e, t) => {
	j.init(e, t), k(e._zod, "optin", () => t.innerType._zod.optin), k(e._zod, "optout", () => t.innerType._zod.optout), k(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((r) => (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => nn(e, n, wt())) },
			input: e.value
		}), e.issues = []), e)) : (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => nn(e, n, wt())) },
			input: e.value
		}), e.issues = []), e);
	};
}), ki = /* @__PURE__ */ O("$ZodPipe", (e, t) => {
	j.init(e, t), k(e._zod, "values", () => t.in._zod.values), k(e._zod, "optin", () => t.in._zod.optin), k(e._zod, "optout", () => t.out._zod.optout), k(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => Ai(e, t.in, n)) : Ai(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Ai(e, t.out, n)) : Ai(r, t.out, n);
	};
});
function Ai(e, t, n) {
	return e.issues.length ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
const ji = /* @__PURE__ */ O("$ZodReadonly", (e, t) => {
	j.init(e, t), k(e._zod, "propValues", () => t.innerType._zod.propValues), k(e._zod, "values", () => t.innerType._zod.values), k(e._zod, "optin", () => {
		var e;
		return (e = t.innerType) == null || (e = e._zod) == null ? void 0 : e.optin;
	}), k(e._zod, "optout", () => {
		var e;
		return (e = t.innerType) == null || (e = e._zod) == null ? void 0 : e.optout;
	}), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(Mi) : Mi(r);
	};
});
function Mi(e) {
	return e.value = Object.freeze(e.value), e;
}
const Ni = /* @__PURE__ */ O("$ZodCustom", (e, t) => {
	ir.init(e, t), j.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => Pi(t, n, r, e));
		Pi(i, n, r, e);
	};
});
function Pi(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(an(e));
	}
}
var Fi, Ii = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function Li() {
	return new Ii();
}
(Fi = globalThis).__zod_globalRegistry ?? (Fi.__zod_globalRegistry = Li());
const Ri = globalThis.__zod_globalRegistry;
/* @__NO_SIDE_EFFECTS__ */
function zi(e, t) {
	return new e({
		type: "string",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Bi(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Vi(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Hi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ui(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Wi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Gi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ki(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function qi(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ji(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Yi(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Xi(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Zi(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Qi(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function $i(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ea(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ta(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function na(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ra(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ia(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function aa(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function oa(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function sa(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ca(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function la(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ua(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function da(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function fa(e, t) {
	return new e({
		type: "number",
		checks: [],
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function pa(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ma(e, t) {
	return new e({
		type: "boolean",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ha(e, t) {
	return new e({
		type: "null",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ga(e) {
	return new e({ type: "unknown" });
}
/* @__NO_SIDE_EFFECTS__ */
function _a(e, t) {
	return new e({
		type: "never",
		...A(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function va(e, t) {
	return new or({
		check: "less_than",
		...A(t),
		value: e,
		inclusive: !1
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ya(e, t) {
	return new or({
		check: "less_than",
		...A(t),
		value: e,
		inclusive: !0
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ba(e, t) {
	return new sr({
		check: "greater_than",
		...A(t),
		value: e,
		inclusive: !1
	});
}
/* @__NO_SIDE_EFFECTS__ */
function xa(e, t) {
	return new sr({
		check: "greater_than",
		...A(t),
		value: e,
		inclusive: !0
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Sa(e, t) {
	return new cr({
		check: "multiple_of",
		...A(t),
		value: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ca(e, t) {
	return new ur({
		check: "max_length",
		...A(t),
		maximum: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function wa(e, t) {
	return new dr({
		check: "min_length",
		...A(t),
		minimum: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ta(e, t) {
	return new fr({
		check: "length_equals",
		...A(t),
		length: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ea(e, t) {
	return new mr({
		check: "string_format",
		format: "regex",
		...A(t),
		pattern: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Da(e) {
	return new hr({
		check: "string_format",
		format: "lowercase",
		...A(e)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Oa(e) {
	return new gr({
		check: "string_format",
		format: "uppercase",
		...A(e)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ka(e, t) {
	return new _r({
		check: "string_format",
		format: "includes",
		...A(t),
		includes: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Aa(e, t) {
	return new vr({
		check: "string_format",
		format: "starts_with",
		...A(t),
		prefix: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ja(e, t) {
	return new yr({
		check: "string_format",
		format: "ends_with",
		...A(t),
		suffix: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ma(e) {
	return new br({
		check: "overwrite",
		tx: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Na(e) {
	return /* @__PURE__ */ Ma((t) => t.normalize(e));
}
/* @__NO_SIDE_EFFECTS__ */
function Pa() {
	return /* @__PURE__ */ Ma((e) => e.trim());
}
/* @__NO_SIDE_EFFECTS__ */
function Fa() {
	return /* @__PURE__ */ Ma((e) => e.toLowerCase());
}
/* @__NO_SIDE_EFFECTS__ */
function Ia() {
	return /* @__PURE__ */ Ma((e) => e.toUpperCase());
}
/* @__NO_SIDE_EFFECTS__ */
function La() {
	return /* @__PURE__ */ Ma((e) => Ft(e));
}
/* @__NO_SIDE_EFFECTS__ */
function Ra(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...A(n)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function za(e, t, n) {
	let r = A(n);
	return r.abort ??= !0, new e({
		type: "custom",
		check: "custom",
		fn: t,
		...r
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ba(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...A(n)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Va(e) {
	let t = /* @__PURE__ */ Ha((n) => (n.addIssue = (e) => {
		if (typeof e == "string") n.issues.push(an(e, n.value, t._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", r.input ??= n.value, r.inst ??= t, r.continue ??= !t._zod.def.abort, n.issues.push(an(r));
		}
	}, e(n.value, n)));
	return t;
}
/* @__NO_SIDE_EFFECTS__ */
function Ha(e, t) {
	let n = new ir({
		check: "custom",
		...A(t)
	});
	return n._zod.check = e, n;
}
function Ua(e) {
	let t = (e == null ? void 0 : e.target) ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: (e == null ? void 0 : e.metadata) ?? Ri,
		target: t,
		unrepresentable: (e == null ? void 0 : e.unrepresentable) ?? "throw",
		override: (e == null ? void 0 : e.override) ?? (() => {}),
		io: (e == null ? void 0 : e.io) ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		cycles: (e == null ? void 0 : e.cycles) ?? "ref",
		reused: (e == null ? void 0 : e.reused) ?? "inline",
		external: (e == null ? void 0 : e.external) ?? void 0
	};
}
function N(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r, i, a;
	let o = e._zod.def, s = t.seen.get(e);
	if (s) return s.count++, n.schemaPath.includes(e) && (s.cycle = n.path), s.schema;
	let c = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, c);
	let l = (r = (i = e._zod).toJSONSchema) == null ? void 0 : r.call(i);
	if (l) c.schema = l;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		};
		if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, c.schema, r);
		else {
			let n = c.schema, i = t.processors[o.type];
			if (!i) throw Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
			i(e, t, n, r);
		}
		let i = e._zod.parent;
		i && (c.ref ||= i, N(i, t, r), t.seen.get(i).isParent = !0);
	}
	let u = t.metadataRegistry.get(e);
	return u && Object.assign(c.schema, u), t.io === "input" && Ka(e) && (delete c.schema.examples, delete c.schema.default), t.io === "input" && c.schema._prefault && ((a = c.schema).default ?? (a.default = c.schema._prefault)), delete c.schema._prefault, t.seen.get(e).schema;
}
function Wa(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = /* @__PURE__ */ new Map();
	for (let t of e.seen.entries()) {
		var i;
		let n = (i = e.metadataRegistry.get(t[0])) == null ? void 0 : i.id;
		if (n) {
			let e = r.get(n);
			if (e && e !== t[0]) throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			r.set(n, t[0]);
		}
	}
	let a = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			var i;
			let n = (i = e.external.registry.get(t[0])) == null ? void 0 : i.id, a = e.external.uri ?? ((e) => e);
			if (n) return { ref: a(n) };
			let o = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = o, {
				defId: o,
				ref: `${a("__shared")}#/${r}/${o}`
			};
		}
		if (t[1] === n) return { ref: "#" };
		let a = `#/${r}/`, o = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: o,
			ref: a + o
		};
	}, o = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: r } = a(e);
		t.def = { ...t.schema }, r && (t.defId = r);
		let i = t.schema;
		for (let e in i) delete i[e];
		i.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) {
			var s;
			throw Error(`Cycle detected: #/${(s = e.cycle) == null ? void 0 : s.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
		}
	}
	for (let n of e.seen.entries()) {
		var c;
		let r = n[1];
		if (t === n[0]) {
			o(n);
			continue;
		}
		if (e.external) {
			var l;
			let r = (l = e.external.registry.get(n[0])) == null ? void 0 : l.id;
			if (t !== n[0] && r) {
				o(n);
				continue;
			}
		}
		if ((c = e.metadataRegistry.get(n[0])) != null && c.id) {
			o(n);
			continue;
		}
		if (r.cycle) {
			o(n);
			continue;
		}
		if (r.count > 1 && e.reused === "ref") {
			o(n);
			continue;
		}
	}
}
function Ga(e, t) {
	var n, r;
	let i = e.seen.get(t);
	if (!i) throw Error("Unprocessed schema. This is a bug in Zod.");
	let a = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let r = n.def ?? n.schema, i = { ...r }, o = n.ref;
		if (n.ref = null, o) {
			a(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (r.allOf = r.allOf ?? [], r.allOf.push(s)) : Object.assign(r, s), Object.assign(r, i), t._zod.parent === o) for (let e in r) e === "$ref" || e === "allOf" || e in i || delete r[e];
			if (s.$ref && n.def) for (let e in r) e === "$ref" || e === "allOf" || e in n.def && JSON.stringify(r[e]) === JSON.stringify(n.def[e]) && delete r[e];
		}
		let s = t._zod.parent;
		if (s && s !== o) {
			a(s);
			let t = e.seen.get(s);
			if (t != null && t.schema.$ref && (r.$ref = t.schema.$ref, t.def)) for (let e in r) e === "$ref" || e === "allOf" || e in t.def && JSON.stringify(r[e]) === JSON.stringify(t.def[e]) && delete r[e];
		}
		e.override({
			zodSchema: t,
			jsonSchema: r,
			path: n.path ?? []
		});
	};
	for (let t of [...e.seen.entries()].reverse()) a(t[0]);
	let o = {};
	if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, (n = e.external) != null && n.uri) {
		var s;
		let n = (s = e.external.registry.get(t)) == null ? void 0 : s.id;
		if (!n) throw Error("Schema is missing an `id` property");
		o.$id = e.external.uri(n);
	}
	Object.assign(o, i.def ?? i.schema);
	let c = ((r = e.external) == null ? void 0 : r.defs) ?? {};
	for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (c[e.defId] = e.def);
	}
	e.external || Object.keys(c).length > 0 && (e.target === "draft-2020-12" ? o.$defs = c : o.definitions = c);
	try {
		let n = JSON.parse(JSON.stringify(o));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: Ja(t, "input", e.processors),
					output: Ja(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function Ka(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return Ka(r.element, n);
	if (r.type === "set") return Ka(r.valueType, n);
	if (r.type === "lazy") return Ka(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault") return Ka(r.innerType, n);
	if (r.type === "intersection") return Ka(r.left, n) || Ka(r.right, n);
	if (r.type === "record" || r.type === "map") return Ka(r.keyType, n) || Ka(r.valueType, n);
	if (r.type === "pipe") return Ka(r.in, n) || Ka(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (Ka(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (Ka(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (Ka(e, n)) return !0;
		return !!(r.rest && Ka(r.rest, n));
	}
	return !1;
}
/**
* Creates a toJSONSchema method for a schema instance.
* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
*/
const qa = (e, t = {}) => (n) => {
	let r = Ua({
		...n,
		processors: t
	});
	return N(e, r), Wa(r, e), Ga(r, e);
}, Ja = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Ua({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return N(e, o), Wa(o, e), Ga(o, e);
};
var Ya = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
};
const Xa = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l } = e._zod.bag;
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = Ya[s] ?? s, i.format === "" && delete i.format, s === "time" && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c];
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, Za = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, format: s, multipleOf: c, exclusiveMaximum: l, exclusiveMinimum: u } = e._zod.bag;
	typeof s == "string" && s.includes("int") ? i.type = "integer" : i.type = "number", typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (i.minimum = u, i.exclusiveMinimum = !0) : i.exclusiveMinimum = u), typeof a == "number" && (i.minimum = a, typeof u == "number" && t.target !== "draft-04" && (u >= a ? delete i.minimum : delete i.exclusiveMinimum)), typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (i.maximum = l, i.exclusiveMaximum = !0) : i.exclusiveMaximum = l), typeof o == "number" && (i.maximum = o, typeof l == "number" && t.target !== "draft-04" && (l <= o ? delete i.maximum : delete i.exclusiveMaximum)), typeof c == "number" && (i.multipleOf = c);
}, Qa = (e, t, n, r) => {
	n.type = "boolean";
}, $a = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("BigInt cannot be represented in JSON Schema");
}, eo = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Symbols cannot be represented in JSON Schema");
}, to = (e, t, n, r) => {
	t.target === "openapi-3.0" ? (n.type = "string", n.nullable = !0, n.enum = [null]) : n.type = "null";
}, no = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Undefined cannot be represented in JSON Schema");
}, ro = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Void cannot be represented in JSON Schema");
}, io = (e, t, n, r) => {
	n.not = {};
}, ao = (e, t, n, r) => {}, oo = (e, t, n, r) => {}, so = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Date cannot be represented in JSON Schema");
}, co = (e, t, n, r) => {
	let i = e._zod.def, a = Tt(i.entries);
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, lo = (e, t, n, r) => {
	let i = e._zod.def, a = [];
	for (let e of i.values) if (e === void 0) {
		if (t.unrepresentable === "throw") throw Error("Literal `undefined` cannot be represented in JSON Schema");
	} else if (typeof e == "bigint") {
		if (t.unrepresentable === "throw") throw Error("BigInt literals cannot be represented in JSON Schema");
		a.push(Number(e));
	} else a.push(e);
	if (a.length !== 0) if (a.length === 1) {
		let e = a[0];
		n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
	} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
}, uo = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("NaN cannot be represented in JSON Schema");
}, fo = (e, t, n, r) => {
	let i = n, a = e._zod.pattern;
	if (!a) throw Error("Pattern not found in template literal");
	i.type = "string", i.pattern = a.source;
}, po = (e, t, n, r) => {
	let i = n, a = {
		type: "string",
		format: "binary",
		contentEncoding: "binary"
	}, { minimum: o, maximum: s, mime: c } = e._zod.bag;
	o !== void 0 && (a.minLength = o), s !== void 0 && (a.maxLength = s), c ? c.length === 1 ? (a.contentMediaType = c[0], Object.assign(i, a)) : (Object.assign(i, a), i.anyOf = c.map((e) => ({ contentMediaType: e }))) : Object.assign(i, a);
}, mo = (e, t, n, r) => {
	n.type = "boolean";
}, ho = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Custom types cannot be represented in JSON Schema");
}, go = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Function types cannot be represented in JSON Schema");
}, _o = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Transforms cannot be represented in JSON Schema");
}, vo = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Map cannot be represented in JSON Schema");
}, yo = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Set cannot be represented in JSON Schema");
}, bo = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = e._zod.bag;
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = N(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
}, xo = (e, t, n, r) => {
	var i;
	let a = n, o = e._zod.def;
	a.type = "object", a.properties = {};
	let s = o.shape;
	for (let e in s) a.properties[e] = N(s[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	});
	let c = new Set(Object.keys(s)), l = new Set([...c].filter((e) => {
		let n = o.shape[e]._zod;
		return t.io === "input" ? n.optin === void 0 : n.optout === void 0;
	}));
	l.size > 0 && (a.required = Array.from(l)), ((i = o.catchall) == null ? void 0 : i._zod.def.type) === "never" ? a.additionalProperties = !1 : o.catchall ? o.catchall && (a.additionalProperties = N(o.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (a.additionalProperties = !1);
}, So = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => N(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Co = (e, t, n, r) => {
	let i = e._zod.def, a = N(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = N(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1;
	n.allOf = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
}, wo = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "array";
	let o = t.target === "draft-2020-12" ? "prefixItems" : "items", s = t.target === "draft-2020-12" || t.target === "openapi-3.0" ? "items" : "additionalItems", c = a.items.map((e, n) => N(e, t, {
		...r,
		path: [
			...r.path,
			o,
			n
		]
	})), l = a.rest ? N(a.rest, t, {
		...r,
		path: [
			...r.path,
			s,
			...t.target === "openapi-3.0" ? [a.items.length] : []
		]
	}) : null;
	t.target === "draft-2020-12" ? (i.prefixItems = c, l && (i.items = l)) : t.target === "openapi-3.0" ? (i.items = { anyOf: c }, l && i.items.anyOf.push(l), i.minItems = c.length, l || (i.maxItems = c.length)) : (i.items = c, l && (i.additionalItems = l));
	let { minimum: u, maximum: d } = e._zod.bag;
	typeof u == "number" && (i.minItems = u), typeof d == "number" && (i.maxItems = d);
}, To = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = o._zod.bag, c = s == null ? void 0 : s.patterns;
	if (a.mode === "loose" && c && c.size > 0) {
		let e = N(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of c) i.patternProperties[t.source] = e;
	} else (t.target === "draft-07" || t.target === "draft-2020-12") && (i.propertyNames = N(a.keyType, t, {
		...r,
		path: [...r.path, "propertyNames"]
	})), i.additionalProperties = N(a.valueType, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	});
	let l = o._zod.values;
	if (l) {
		let e = [...l].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e);
	}
}, Eo = (e, t, n, r) => {
	let i = e._zod.def, a = N(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, Do = (e, t, n, r) => {
	let i = e._zod.def;
	N(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Oo = (e, t, n, r) => {
	let i = e._zod.def;
	N(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.default = JSON.parse(JSON.stringify(i.defaultValue));
}, ko = (e, t, n, r) => {
	let i = e._zod.def;
	N(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(i.defaultValue)));
}, Ao = (e, t, n, r) => {
	let i = e._zod.def;
	N(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		throw Error("Dynamic catch values are not supported in JSON Schema");
	}
	n.default = o;
}, jo = (e, t, n, r) => {
	let i = e._zod.def, a = t.io === "input" ? i.in._zod.def.type === "transform" ? i.out : i.in : i.out;
	N(a, t, r);
	let o = t.seen.get(e);
	o.ref = a;
}, Mo = (e, t, n, r) => {
	let i = e._zod.def;
	N(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, No = (e, t, n, r) => {
	let i = e._zod.def;
	N(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Po = (e, t, n, r) => {
	let i = e._zod.def;
	N(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Fo = {
	string: Xa,
	number: Za,
	boolean: Qa,
	bigint: $a,
	symbol: eo,
	null: to,
	undefined: no,
	void: ro,
	never: io,
	any: ao,
	unknown: oo,
	date: so,
	enum: co,
	literal: lo,
	nan: uo,
	template_literal: fo,
	file: po,
	success: mo,
	custom: ho,
	function: go,
	transform: _o,
	map: vo,
	set: yo,
	array: bo,
	object: xo,
	union: So,
	intersection: Co,
	tuple: wo,
	record: To,
	nullable: Eo,
	nonoptional: Do,
	default: Oo,
	prefault: ko,
	catch: Ao,
	pipe: jo,
	readonly: Mo,
	promise: No,
	optional: Po,
	lazy: (e, t, n, r) => {
		let i = e._zod.innerType;
		N(i, t, r);
		let a = t.seen.get(e);
		a.ref = i;
	}
};
function Io(e, t) {
	if ("_idmap" in e) {
		let n = e, r = Ua({
			...t,
			processors: Fo
		}), i = {};
		for (let e of n._idmap.entries()) {
			let [t, n] = e;
			N(n, r);
		}
		let a = {};
		r.external = {
			registry: n,
			uri: t == null ? void 0 : t.uri,
			defs: i
		};
		for (let e of n._idmap.entries()) {
			let [t, n] = e;
			Wa(r, n), a[t] = Ga(r, n);
		}
		return Object.keys(i).length > 0 && (a.__shared = { [r.target === "draft-2020-12" ? "$defs" : "definitions"]: i }), { schemas: a };
	}
	let n = Ua({
		...t,
		processors: Fo
	});
	return N(e, n), Wa(n, e), Ga(n, e);
}
const Lo = /* @__PURE__ */ O("ZodMiniType", (e, t) => {
	if (!e._zod) throw Error("Uninitialized schema in ZodMiniType.");
	j.init(e, t), e.def = t, e.type = t.type, e.parse = (t, n) => fn(e, t, n, { callee: e.parse }), e.safeParse = (t, n) => gn(e, t, n), e.parseAsync = async (t, n) => mn(e, t, n, { callee: e.parseAsync }), e.safeParseAsync = async (t, n) => vn(e, t, n), e.check = (...n) => e.clone({
		...t,
		checks: [...t.checks ?? [], ...n.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)]
	}, { parent: !0 }), e.with = e.check, e.clone = (t, n) => Ut(e, t, n), e.brand = () => e, e.register = ((t, n) => (t.add(e, n), e)), e.apply = (t) => t(e);
}), Ro = /* @__PURE__ */ O("ZodMiniObject", (e, t) => {
	si.init(e, t), Lo.init(e, t), k(e, "shape", () => t.shape);
});
/* @__NO_SIDE_EFFECTS__ */
function zo(e, t) {
	return new Ro({
		type: "object",
		shape: e ?? {},
		...A(t)
	});
}
function Bo(e) {
	return !!e._zod;
}
function Vo(e) {
	let t = Object.values(e);
	if (t.length === 0) return /* @__PURE__ */ zo({});
	let n = t.every(Bo), r = t.every((e) => !Bo(e));
	if (n) return /* @__PURE__ */ zo(e);
	if (r) return bt(e);
	throw Error("Mixed Zod versions detected in object shape.");
}
function Ho(e, t) {
	return Bo(e) ? gn(e, t) : e.safeParse(t);
}
async function Uo(e, t) {
	return Bo(e) ? await vn(e, t) : await e.safeParseAsync(t);
}
function Wo(e) {
	if (!e) return;
	let t;
	if (Bo(e)) {
		var n;
		t = (n = e._zod) == null || (n = n.def) == null ? void 0 : n.shape;
	} else t = e.shape;
	if (t) {
		if (typeof t == "function") try {
			return t();
		} catch {
			return;
		}
		return t;
	}
}
/**
* Normalizes a schema to an object schema. Handles both:
* - Already-constructed object schemas (v3 or v4)
* - Raw shapes that need to be wrapped into object schemas
*/
function Go(e) {
	if (e) {
		if (typeof e == "object") {
			let t = e, n = e;
			if (!t._def && !n._zod) {
				let t = Object.values(e);
				if (t.length > 0 && t.every((e) => typeof e == "object" && !!e && (e._def !== void 0 || e._zod !== void 0 || typeof e.parse == "function"))) return Vo(e);
			}
		}
		if (Bo(e)) {
			var t;
			let n = (t = e._zod) == null ? void 0 : t.def;
			if (n && (n.type === "object" || n.shape !== void 0)) return e;
		} else if (e.shape !== void 0) return e;
	}
}
/**
* Safely extracts an error message from a parse result error.
* Zod errors can have different structures, so we handle various cases.
*/
function Ko(e) {
	if (e && typeof e == "object") {
		if ("message" in e && typeof e.message == "string") return e.message;
		if ("issues" in e && Array.isArray(e.issues) && e.issues.length > 0) {
			let t = e.issues[0];
			if (t && typeof t == "object" && "message" in t) return String(t.message);
		}
		try {
			return JSON.stringify(e);
		} catch {
			return String(e);
		}
	}
	return String(e);
}
/**
* Gets the description from a schema, if available.
* Works with both Zod v3 and v4.
*
* Both versions expose a `.description` getter that returns the description
* from their respective internal storage (v3: _def, v4: globalRegistry).
*/
function qo(e) {
	return e.description;
}
/**
* Checks if a schema is optional.
* Works with both Zod v3 and v4.
*/
function Jo(e) {
	var t;
	if (Bo(e)) {
		var n;
		return ((n = e._zod) == null || (n = n.def) == null ? void 0 : n.type) === "optional";
	}
	let r = e;
	return typeof e.isOptional == "function" ? e.isOptional() : ((t = r._def) == null ? void 0 : t.typeName) === "ZodOptional";
}
/**
* Gets the literal value from a schema, if it's a literal schema.
* Works with both Zod v3 and v4.
* Returns undefined if the schema is not a literal or the value cannot be determined.
*/
function Yo(e) {
	if (Bo(e)) {
		var t;
		let n = (t = e._zod) == null ? void 0 : t.def;
		if (n) {
			if (n.value !== void 0) return n.value;
			if (Array.isArray(n.values) && n.values.length > 0) return n.values[0];
		}
	}
	let n = e._def;
	if (n) {
		if (n.value !== void 0) return n.value;
		if (Array.isArray(n.values) && n.values.length > 0) return n.values[0];
	}
	let r = e.value;
	if (r !== void 0) return r;
}
const Xo = /* @__PURE__ */ O("ZodISODateTime", (e, t) => {
	Fr.init(e, t), I.init(e, t);
});
function Zo(e) {
	return /* @__PURE__ */ ca(Xo, e);
}
const Qo = /* @__PURE__ */ O("ZodISODate", (e, t) => {
	Ir.init(e, t), I.init(e, t);
});
function $o(e) {
	return /* @__PURE__ */ la(Qo, e);
}
const es = /* @__PURE__ */ O("ZodISOTime", (e, t) => {
	Lr.init(e, t), I.init(e, t);
});
function ts(e) {
	return /* @__PURE__ */ ua(es, e);
}
const ns = /* @__PURE__ */ O("ZodISODuration", (e, t) => {
	Rr.init(e, t), I.init(e, t);
});
function rs(e) {
	return /* @__PURE__ */ da(ns, e);
}
var is = (e, t) => {
	sn.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
		format: { value: (t) => un(e, t) },
		flatten: { value: (t) => ln(e, t) },
		addIssue: { value: (t) => {
			e.issues.push(t), e.message = JSON.stringify(e.issues, Et, 2);
		} },
		addIssues: { value: (t) => {
			e.issues.push(...t), e.message = JSON.stringify(e.issues, Et, 2);
		} },
		isEmpty: { get() {
			return e.issues.length === 0;
		} }
	});
};
O("ZodError", is);
const as = O("ZodError", is, { Parent: Error }), os = /* @__PURE__ */ dn(as), ss = /* @__PURE__ */ pn(as), cs = /* @__PURE__ */ hn(as), ls = /* @__PURE__ */ _n(as), us = /* @__PURE__ */ yn(as), ds = /* @__PURE__ */ bn(as), fs = /* @__PURE__ */ xn(as), ps = /* @__PURE__ */ Sn(as), ms = /* @__PURE__ */ Cn(as), hs = /* @__PURE__ */ wn(as), gs = /* @__PURE__ */ Tn(as), _s = /* @__PURE__ */ En(as), P = /* @__PURE__ */ O("ZodType", (e, t) => (j.init(e, t), Object.assign(e["~standard"], { jsonSchema: {
	input: Ja(e, "input"),
	output: Ja(e, "output")
} }), e.toJSONSchema = qa(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(Nt(t, { checks: [...t.checks ?? [], ...n.map((e) => typeof e == "function" ? { _zod: {
	check: e,
	def: { check: "custom" },
	onattach: []
} } : e)] }), { parent: !0 }), e.with = e.check, e.clone = (t, n) => Ut(e, t, n), e.brand = () => e, e.register = ((t, n) => (t.add(e, n), e)), e.parse = (t, n) => os(e, t, n, { callee: e.parse }), e.safeParse = (t, n) => cs(e, t, n), e.parseAsync = async (t, n) => ss(e, t, n, { callee: e.parseAsync }), e.safeParseAsync = async (t, n) => ls(e, t, n), e.spa = e.safeParseAsync, e.encode = (t, n) => us(e, t, n), e.decode = (t, n) => ds(e, t, n), e.encodeAsync = async (t, n) => fs(e, t, n), e.decodeAsync = async (t, n) => ps(e, t, n), e.safeEncode = (t, n) => ms(e, t, n), e.safeDecode = (t, n) => hs(e, t, n), e.safeEncodeAsync = async (t, n) => gs(e, t, n), e.safeDecodeAsync = async (t, n) => _s(e, t, n), e.refine = (t, n) => e.check(Dc(t, n)), e.superRefine = (t) => e.check(Oc(t)), e.overwrite = (t) => e.check(/* @__PURE__ */ Ma(t)), e.optional = () => G(e), e.exactOptional = () => uc(e), e.nullable = () => fc(e), e.nullish = () => G(fc(e)), e.nonoptional = (t) => vc(e, t), e.array = () => B(e), e.or = (t) => H([e, t]), e.and = (t) => tc(e, t), e.transform = (t) => Sc(e, sc(t)), e.default = (t) => mc(e, t), e.prefault = (t) => gc(e, t), e.catch = (t) => bc(e, t), e.pipe = (t) => Sc(e, t), e.readonly = () => wc(e), e.describe = (t) => {
	let n = e.clone();
	return Ri.add(n, { description: t }), n;
}, Object.defineProperty(e, "description", {
	get() {
		var t;
		return (t = Ri.get(e)) == null ? void 0 : t.description;
	},
	configurable: !0
}), e.meta = (...t) => {
	if (t.length === 0) return Ri.get(e);
	let n = e.clone();
	return Ri.add(n, t[0]), n;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (t) => t(e), e)), vs = /* @__PURE__ */ O("_ZodString", (e, t) => {
	Cr.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Xa(e, t, n, r);
	let n = e._zod.bag;
	e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...t) => e.check(/* @__PURE__ */ Ea(...t)), e.includes = (...t) => e.check(/* @__PURE__ */ ka(...t)), e.startsWith = (...t) => e.check(/* @__PURE__ */ Aa(...t)), e.endsWith = (...t) => e.check(/* @__PURE__ */ ja(...t)), e.min = (...t) => e.check(/* @__PURE__ */ wa(...t)), e.max = (...t) => e.check(/* @__PURE__ */ Ca(...t)), e.length = (...t) => e.check(/* @__PURE__ */ Ta(...t)), e.nonempty = (...t) => e.check(/* @__PURE__ */ wa(1, ...t)), e.lowercase = (t) => e.check(/* @__PURE__ */ Da(t)), e.uppercase = (t) => e.check(/* @__PURE__ */ Oa(t)), e.trim = () => e.check(/* @__PURE__ */ Pa()), e.normalize = (...t) => e.check(/* @__PURE__ */ Na(...t)), e.toLowerCase = () => e.check(/* @__PURE__ */ Fa()), e.toUpperCase = () => e.check(/* @__PURE__ */ Ia()), e.slugify = () => e.check(/* @__PURE__ */ La());
}), ys = /* @__PURE__ */ O("ZodString", (e, t) => {
	Cr.init(e, t), vs.init(e, t), e.email = (t) => e.check(/* @__PURE__ */ Bi(bs, t)), e.url = (t) => e.check(/* @__PURE__ */ Ki(Cs, t)), e.jwt = (t) => e.check(/* @__PURE__ */ sa(Rs, t)), e.emoji = (t) => e.check(/* @__PURE__ */ qi(ws, t)), e.guid = (t) => e.check(/* @__PURE__ */ Vi(xs, t)), e.uuid = (t) => e.check(/* @__PURE__ */ Hi(Ss, t)), e.uuidv4 = (t) => e.check(/* @__PURE__ */ Ui(Ss, t)), e.uuidv6 = (t) => e.check(/* @__PURE__ */ Wi(Ss, t)), e.uuidv7 = (t) => e.check(/* @__PURE__ */ Gi(Ss, t)), e.nanoid = (t) => e.check(/* @__PURE__ */ Ji(Ts, t)), e.guid = (t) => e.check(/* @__PURE__ */ Vi(xs, t)), e.cuid = (t) => e.check(/* @__PURE__ */ Yi(Es, t)), e.cuid2 = (t) => e.check(/* @__PURE__ */ Xi(Ds, t)), e.ulid = (t) => e.check(/* @__PURE__ */ Zi(Os, t)), e.base64 = (t) => e.check(/* @__PURE__ */ ia(Fs, t)), e.base64url = (t) => e.check(/* @__PURE__ */ aa(Is, t)), e.xid = (t) => e.check(/* @__PURE__ */ Qi(ks, t)), e.ksuid = (t) => e.check(/* @__PURE__ */ $i(As, t)), e.ipv4 = (t) => e.check(/* @__PURE__ */ ea(js, t)), e.ipv6 = (t) => e.check(/* @__PURE__ */ ta(Ms, t)), e.cidrv4 = (t) => e.check(/* @__PURE__ */ na(Ns, t)), e.cidrv6 = (t) => e.check(/* @__PURE__ */ ra(Ps, t)), e.e164 = (t) => e.check(/* @__PURE__ */ oa(Ls, t)), e.datetime = (t) => e.check(Zo(t)), e.date = (t) => e.check($o(t)), e.time = (t) => e.check(ts(t)), e.duration = (t) => e.check(rs(t));
});
function F(e) {
	return /* @__PURE__ */ zi(ys, e);
}
const I = /* @__PURE__ */ O("ZodStringFormat", (e, t) => {
	M.init(e, t), vs.init(e, t);
}), bs = /* @__PURE__ */ O("ZodEmail", (e, t) => {
	Er.init(e, t), I.init(e, t);
}), xs = /* @__PURE__ */ O("ZodGUID", (e, t) => {
	wr.init(e, t), I.init(e, t);
}), Ss = /* @__PURE__ */ O("ZodUUID", (e, t) => {
	Tr.init(e, t), I.init(e, t);
}), Cs = /* @__PURE__ */ O("ZodURL", (e, t) => {
	Dr.init(e, t), I.init(e, t);
}), ws = /* @__PURE__ */ O("ZodEmoji", (e, t) => {
	Or.init(e, t), I.init(e, t);
}), Ts = /* @__PURE__ */ O("ZodNanoID", (e, t) => {
	kr.init(e, t), I.init(e, t);
}), Es = /* @__PURE__ */ O("ZodCUID", (e, t) => {
	Ar.init(e, t), I.init(e, t);
}), Ds = /* @__PURE__ */ O("ZodCUID2", (e, t) => {
	jr.init(e, t), I.init(e, t);
}), Os = /* @__PURE__ */ O("ZodULID", (e, t) => {
	Mr.init(e, t), I.init(e, t);
}), ks = /* @__PURE__ */ O("ZodXID", (e, t) => {
	Nr.init(e, t), I.init(e, t);
}), As = /* @__PURE__ */ O("ZodKSUID", (e, t) => {
	Pr.init(e, t), I.init(e, t);
}), js = /* @__PURE__ */ O("ZodIPv4", (e, t) => {
	zr.init(e, t), I.init(e, t);
}), Ms = /* @__PURE__ */ O("ZodIPv6", (e, t) => {
	Br.init(e, t), I.init(e, t);
}), Ns = /* @__PURE__ */ O("ZodCIDRv4", (e, t) => {
	Vr.init(e, t), I.init(e, t);
}), Ps = /* @__PURE__ */ O("ZodCIDRv6", (e, t) => {
	Hr.init(e, t), I.init(e, t);
}), Fs = /* @__PURE__ */ O("ZodBase64", (e, t) => {
	Wr.init(e, t), I.init(e, t);
}), Is = /* @__PURE__ */ O("ZodBase64URL", (e, t) => {
	Kr.init(e, t), I.init(e, t);
}), Ls = /* @__PURE__ */ O("ZodE164", (e, t) => {
	qr.init(e, t), I.init(e, t);
}), Rs = /* @__PURE__ */ O("ZodJWT", (e, t) => {
	Yr.init(e, t), I.init(e, t);
}), zs = /* @__PURE__ */ O("ZodNumber", (e, t) => {
	Xr.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Za(e, t, n, r), e.gt = (t, n) => e.check(/* @__PURE__ */ ba(t, n)), e.gte = (t, n) => e.check(/* @__PURE__ */ xa(t, n)), e.min = (t, n) => e.check(/* @__PURE__ */ xa(t, n)), e.lt = (t, n) => e.check(/* @__PURE__ */ va(t, n)), e.lte = (t, n) => e.check(/* @__PURE__ */ ya(t, n)), e.max = (t, n) => e.check(/* @__PURE__ */ ya(t, n)), e.int = (t) => e.check(Vs(t)), e.safe = (t) => e.check(Vs(t)), e.positive = (t) => e.check(/* @__PURE__ */ ba(0, t)), e.nonnegative = (t) => e.check(/* @__PURE__ */ xa(0, t)), e.negative = (t) => e.check(/* @__PURE__ */ va(0, t)), e.nonpositive = (t) => e.check(/* @__PURE__ */ ya(0, t)), e.multipleOf = (t, n) => e.check(/* @__PURE__ */ Sa(t, n)), e.step = (t, n) => e.check(/* @__PURE__ */ Sa(t, n)), e.finite = () => e;
	let n = e._zod.bag;
	e.minValue = Math.max(n.minimum ?? -Infinity, n.exclusiveMinimum ?? -Infinity) ?? null, e.maxValue = Math.min(n.maximum ?? Infinity, n.exclusiveMaximum ?? Infinity) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? .5), e.isFinite = !0, e.format = n.format ?? null;
});
function L(e) {
	return /* @__PURE__ */ fa(zs, e);
}
const Bs = /* @__PURE__ */ O("ZodNumberFormat", (e, t) => {
	Zr.init(e, t), zs.init(e, t);
});
function Vs(e) {
	return /* @__PURE__ */ pa(Bs, e);
}
const Hs = /* @__PURE__ */ O("ZodBoolean", (e, t) => {
	Qr.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Qa(e, t, n, r);
});
function R(e) {
	return /* @__PURE__ */ ma(Hs, e);
}
const Us = /* @__PURE__ */ O("ZodNull", (e, t) => {
	$r.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => to(e, t, n, r);
});
function Ws(e) {
	return /* @__PURE__ */ ha(Us, e);
}
const Gs = /* @__PURE__ */ O("ZodUnknown", (e, t) => {
	ei.init(e, t), P.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function z() {
	return /* @__PURE__ */ ga(Gs);
}
const Ks = /* @__PURE__ */ O("ZodNever", (e, t) => {
	ti.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => io(e, t, n, r);
});
function qs(e) {
	return /* @__PURE__ */ _a(Ks, e);
}
const Js = /* @__PURE__ */ O("ZodArray", (e, t) => {
	ri.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => bo(e, t, n, r), e.element = t.element, e.min = (t, n) => e.check(/* @__PURE__ */ wa(t, n)), e.nonempty = (t) => e.check(/* @__PURE__ */ wa(1, t)), e.max = (t, n) => e.check(/* @__PURE__ */ Ca(t, n)), e.length = (t, n) => e.check(/* @__PURE__ */ Ta(t, n)), e.unwrap = () => e.element;
});
function B(e, t) {
	return /* @__PURE__ */ Ra(Js, e, t);
}
const Ys = /* @__PURE__ */ O("ZodObject", (e, t) => {
	ci.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => xo(e, t, n, r), k(e, "shape", () => t.shape), e.keyof = () => ic(Object.keys(e._zod.def.shape)), e.catchall = (t) => e.clone({
		...e._zod.def,
		catchall: t
	}), e.passthrough = () => e.clone({
		...e._zod.def,
		catchall: z()
	}), e.loose = () => e.clone({
		...e._zod.def,
		catchall: z()
	}), e.strict = () => e.clone({
		...e._zod.def,
		catchall: qs()
	}), e.strip = () => e.clone({
		...e._zod.def,
		catchall: void 0
	}), e.extend = (t) => Jt(e, t), e.safeExtend = (t) => Yt(e, t), e.merge = (t) => Xt(e, t), e.pick = (t) => Kt(e, t), e.omit = (t) => qt(e, t), e.partial = (...t) => Zt(cc, e, t[0]), e.required = (...t) => Qt(_c, e, t[0]);
});
function V(e, t) {
	return new Ys({
		type: "object",
		shape: e ?? {},
		...A(t)
	});
}
function Xs(e, t) {
	return new Ys({
		type: "object",
		shape: e,
		catchall: z(),
		...A(t)
	});
}
const Zs = /* @__PURE__ */ O("ZodUnion", (e, t) => {
	ui.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => So(e, t, n, r), e.options = t.options;
});
function H(e, t) {
	return new Zs({
		type: "union",
		options: e,
		...A(t)
	});
}
const Qs = /* @__PURE__ */ O("ZodDiscriminatedUnion", (e, t) => {
	Zs.init(e, t), di.init(e, t);
});
function $s(e, t, n) {
	return new Qs({
		type: "union",
		options: t,
		discriminator: e,
		...A(n)
	});
}
const ec = /* @__PURE__ */ O("ZodIntersection", (e, t) => {
	fi.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Co(e, t, n, r);
});
function tc(e, t) {
	return new ec({
		type: "intersection",
		left: e,
		right: t
	});
}
const nc = /* @__PURE__ */ O("ZodRecord", (e, t) => {
	hi.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => To(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function U(e, t, n) {
	return new nc({
		type: "record",
		keyType: e,
		valueType: t,
		...A(n)
	});
}
const rc = /* @__PURE__ */ O("ZodEnum", (e, t) => {
	gi.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => co(e, t, n, r), e.enum = t.entries, e.options = Object.values(t.entries);
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new rc({
			...t,
			checks: [],
			...A(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new rc({
			...t,
			checks: [],
			...A(r),
			entries: i
		});
	};
});
function ic(e, t) {
	return new rc({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...A(t)
	});
}
const ac = /* @__PURE__ */ O("ZodLiteral", (e, t) => {
	_i.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => lo(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function W(e, t) {
	return new ac({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...A(t)
	});
}
const oc = /* @__PURE__ */ O("ZodTransform", (e, t) => {
	vi.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => _o(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new St(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(an(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", t.input ??= n.value, t.inst ??= e, n.issues.push(an(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function sc(e) {
	return new oc({
		type: "transform",
		transform: e
	});
}
const cc = /* @__PURE__ */ O("ZodOptional", (e, t) => {
	bi.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Po(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function G(e) {
	return new cc({
		type: "optional",
		innerType: e
	});
}
const lc = /* @__PURE__ */ O("ZodExactOptional", (e, t) => {
	xi.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Po(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function uc(e) {
	return new lc({
		type: "optional",
		innerType: e
	});
}
const dc = /* @__PURE__ */ O("ZodNullable", (e, t) => {
	Si.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Eo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function fc(e) {
	return new dc({
		type: "nullable",
		innerType: e
	});
}
const pc = /* @__PURE__ */ O("ZodDefault", (e, t) => {
	Ci.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oo(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function mc(e, t) {
	return new pc({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Bt(t);
		}
	});
}
const hc = /* @__PURE__ */ O("ZodPrefault", (e, t) => {
	Ti.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => ko(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function gc(e, t) {
	return new hc({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Bt(t);
		}
	});
}
const _c = /* @__PURE__ */ O("ZodNonOptional", (e, t) => {
	Ei.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Do(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function vc(e, t) {
	return new _c({
		type: "nonoptional",
		innerType: e,
		...A(t)
	});
}
const yc = /* @__PURE__ */ O("ZodCatch", (e, t) => {
	Oi.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ao(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function bc(e, t) {
	return new yc({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : () => t
	});
}
const xc = /* @__PURE__ */ O("ZodPipe", (e, t) => {
	ki.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => jo(e, t, n, r), e.in = t.in, e.out = t.out;
});
function Sc(e, t) {
	return new xc({
		type: "pipe",
		in: e,
		out: t
	});
}
const Cc = /* @__PURE__ */ O("ZodReadonly", (e, t) => {
	ji.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => Mo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function wc(e) {
	return new Cc({
		type: "readonly",
		innerType: e
	});
}
const Tc = /* @__PURE__ */ O("ZodCustom", (e, t) => {
	Ni.init(e, t), P.init(e, t), e._zod.processJSONSchema = (t, n, r) => ho(e, t, n, r);
});
function Ec(e, t) {
	return /* @__PURE__ */ za(Tc, e ?? (() => !0), t);
}
function Dc(e, t = {}) {
	return /* @__PURE__ */ Ba(Tc, e, t);
}
function Oc(e) {
	return /* @__PURE__ */ Va(e);
}
function kc(e, t) {
	return Sc(sc(e), t);
}
const Ac = "2025-11-25", jc = [
	Ac,
	"2025-06-18",
	"2025-03-26",
	"2024-11-05",
	"2024-10-07"
], Mc = "io.modelcontextprotocol/related-task";
/**
* Assert 'object' type schema.
*
* @internal
*/
var K = Ec((e) => e !== null && (typeof e == "object" || typeof e == "function"));
/**
* A progress token, used to associate progress notifications with the original request.
*/
const Nc = H([F(), L().int()]), Pc = F();
Xs({
	ttl: H([L(), Ws()]).optional(),
	pollInterval: L().optional()
});
const Fc = V({ ttl: L().optional() }), Ic = V({ taskId: F() });
var Lc = Xs({
	progressToken: Nc.optional(),
	[Mc]: Ic.optional()
}), Rc = V({ _meta: Lc.optional() });
/**
* Common params for any task-augmented request.
*/
const zc = Rc.extend({ task: Fc.optional() }), Bc = (e) => zc.safeParse(e).success, q = V({
	method: F(),
	params: Rc.loose().optional()
});
var Vc = V({ _meta: Lc.optional() });
const Hc = V({
	method: F(),
	params: Vc.loose().optional()
}), Uc = Xs({ _meta: Lc.optional() }), Wc = H([F(), L().int()]), Gc = V({
	jsonrpc: W("2.0"),
	id: Wc,
	...q.shape
}).strict(), Kc = (e) => Gc.safeParse(e).success, qc = V({
	jsonrpc: W("2.0"),
	...Hc.shape
}).strict(), Jc = (e) => qc.safeParse(e).success, Yc = V({
	jsonrpc: W("2.0"),
	id: Wc,
	result: Uc
}).strict(), Xc = (e) => Yc.safeParse(e).success;
/**
* Error codes defined by the JSON-RPC specification.
*/
var J;
(function(e) {
	e[e.ConnectionClosed = -32e3] = "ConnectionClosed", e[e.RequestTimeout = -32001] = "RequestTimeout", e[e.ParseError = -32700] = "ParseError", e[e.InvalidRequest = -32600] = "InvalidRequest", e[e.MethodNotFound = -32601] = "MethodNotFound", e[e.InvalidParams = -32602] = "InvalidParams", e[e.InternalError = -32603] = "InternalError", e[e.UrlElicitationRequired = -32042] = "UrlElicitationRequired";
})(J ||= {});
/**
* A response to a request that indicates an error occurred.
*/
const Zc = V({
	jsonrpc: W("2.0"),
	id: Wc.optional(),
	error: V({
		code: L().int(),
		message: F(),
		data: z().optional()
	})
}).strict(), Qc = (e) => Zc.safeParse(e).success, $c = H([
	Gc,
	qc,
	Yc,
	Zc
]);
H([Yc, Zc]);
/**
* A response that indicates success but carries no data.
*/
const el = Uc.strict(), tl = Vc.extend({
	requestId: Wc.optional(),
	reason: F().optional()
}), nl = Hc.extend({
	method: W("notifications/cancelled"),
	params: tl
}), rl = V({ icons: B(V({
	src: F(),
	mimeType: F().optional(),
	sizes: B(F()).optional(),
	theme: ic(["light", "dark"]).optional()
})).optional() }), il = V({
	name: F(),
	title: F().optional()
}), al = il.extend({
	...il.shape,
	...rl.shape,
	version: F(),
	websiteUrl: F().optional(),
	description: F().optional()
});
var ol = kc((e) => e && typeof e == "object" && !Array.isArray(e) && Object.keys(e).length === 0 ? { form: {} } : e, tc(V({
	form: tc(V({ applyDefaults: R().optional() }), U(F(), z())).optional(),
	url: K.optional()
}), U(F(), z()).optional()));
/**
* Task capabilities for clients, indicating which request types support task creation.
*/
const sl = Xs({
	list: K.optional(),
	cancel: K.optional(),
	requests: Xs({
		sampling: Xs({ createMessage: K.optional() }).optional(),
		elicitation: Xs({ create: K.optional() }).optional()
	}).optional()
}), cl = Xs({
	list: K.optional(),
	cancel: K.optional(),
	requests: Xs({ tools: Xs({ call: K.optional() }).optional() }).optional()
}), ll = V({
	experimental: U(F(), K).optional(),
	sampling: V({
		context: K.optional(),
		tools: K.optional()
	}).optional(),
	elicitation: ol.optional(),
	roots: V({ listChanged: R().optional() }).optional(),
	tasks: sl.optional()
}), ul = Rc.extend({
	protocolVersion: F(),
	capabilities: ll,
	clientInfo: al
}), dl = q.extend({
	method: W("initialize"),
	params: ul
}), fl = V({
	experimental: U(F(), K).optional(),
	logging: K.optional(),
	completions: K.optional(),
	prompts: V({ listChanged: R().optional() }).optional(),
	resources: V({
		subscribe: R().optional(),
		listChanged: R().optional()
	}).optional(),
	tools: V({ listChanged: R().optional() }).optional(),
	tasks: cl.optional()
}), pl = Uc.extend({
	protocolVersion: F(),
	capabilities: fl,
	serverInfo: al,
	instructions: F().optional()
}), ml = Hc.extend({
	method: W("notifications/initialized"),
	params: Vc.optional()
}), hl = q.extend({
	method: W("ping"),
	params: Rc.optional()
}), gl = V({
	progress: L(),
	total: G(L()),
	message: G(F())
}), _l = V({
	...Vc.shape,
	...gl.shape,
	progressToken: Nc
}), vl = Hc.extend({
	method: W("notifications/progress"),
	params: _l
}), yl = Rc.extend({ cursor: Pc.optional() }), bl = q.extend({ params: yl.optional() }), xl = Uc.extend({ nextCursor: Pc.optional() }), Sl = ic([
	"working",
	"input_required",
	"completed",
	"failed",
	"cancelled"
]), Cl = V({
	taskId: F(),
	status: Sl,
	ttl: H([L(), Ws()]),
	createdAt: F(),
	lastUpdatedAt: F(),
	pollInterval: G(L()),
	statusMessage: G(F())
}), wl = Uc.extend({ task: Cl }), Tl = Vc.merge(Cl), El = Hc.extend({
	method: W("notifications/tasks/status"),
	params: Tl
}), Dl = q.extend({
	method: W("tasks/get"),
	params: Rc.extend({ taskId: F() })
}), Ol = Uc.merge(Cl), kl = q.extend({
	method: W("tasks/result"),
	params: Rc.extend({ taskId: F() })
});
Uc.loose();
/**
* A request to list tasks.
*/
const Al = bl.extend({ method: W("tasks/list") }), jl = xl.extend({ tasks: B(Cl) }), Ml = q.extend({
	method: W("tasks/cancel"),
	params: Rc.extend({ taskId: F() })
}), Nl = Uc.merge(Cl), Pl = V({
	uri: F(),
	mimeType: G(F()),
	_meta: U(F(), z()).optional()
}), Fl = Pl.extend({ text: F() });
/**
* A Zod schema for validating Base64 strings that is more performant and
* robust for very large inputs than the default regex-based check. It avoids
* stack overflows by using the native `atob` function for validation.
*/
var Il = F().refine((e) => {
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}, { message: "Invalid Base64 string" });
const Ll = Pl.extend({ blob: Il }), Rl = ic(["user", "assistant"]), zl = V({
	audience: B(Rl).optional(),
	priority: L().min(0).max(1).optional(),
	lastModified: Zo({ offset: !0 }).optional()
}), Bl = V({
	...il.shape,
	...rl.shape,
	uri: F(),
	description: G(F()),
	mimeType: G(F()),
	annotations: zl.optional(),
	_meta: G(Xs({}))
}), Vl = V({
	...il.shape,
	...rl.shape,
	uriTemplate: F(),
	description: G(F()),
	mimeType: G(F()),
	annotations: zl.optional(),
	_meta: G(Xs({}))
}), Hl = bl.extend({ method: W("resources/list") }), Ul = xl.extend({ resources: B(Bl) }), Wl = bl.extend({ method: W("resources/templates/list") }), Gl = xl.extend({ resourceTemplates: B(Vl) }), Kl = Rc.extend({ uri: F() }), ql = Kl, Jl = q.extend({
	method: W("resources/read"),
	params: ql
}), Yl = Uc.extend({ contents: B(H([Fl, Ll])) }), Xl = Hc.extend({
	method: W("notifications/resources/list_changed"),
	params: Vc.optional()
}), Zl = Kl, Ql = q.extend({
	method: W("resources/subscribe"),
	params: Zl
}), $l = Kl, eu = q.extend({
	method: W("resources/unsubscribe"),
	params: $l
}), tu = Vc.extend({ uri: F() }), nu = Hc.extend({
	method: W("notifications/resources/updated"),
	params: tu
}), ru = V({
	name: F(),
	description: G(F()),
	required: G(R())
}), iu = V({
	...il.shape,
	...rl.shape,
	description: G(F()),
	arguments: G(B(ru)),
	_meta: G(Xs({}))
}), au = bl.extend({ method: W("prompts/list") }), ou = xl.extend({ prompts: B(iu) }), su = Rc.extend({
	name: F(),
	arguments: U(F(), F()).optional()
}), cu = q.extend({
	method: W("prompts/get"),
	params: su
}), lu = V({
	type: W("text"),
	text: F(),
	annotations: zl.optional(),
	_meta: U(F(), z()).optional()
}), uu = V({
	type: W("image"),
	data: Il,
	mimeType: F(),
	annotations: zl.optional(),
	_meta: U(F(), z()).optional()
}), du = V({
	type: W("audio"),
	data: Il,
	mimeType: F(),
	annotations: zl.optional(),
	_meta: U(F(), z()).optional()
}), fu = V({
	type: W("tool_use"),
	name: F(),
	id: F(),
	input: U(F(), z()),
	_meta: U(F(), z()).optional()
}), pu = V({
	type: W("resource"),
	resource: H([Fl, Ll]),
	annotations: zl.optional(),
	_meta: U(F(), z()).optional()
}), mu = H([
	lu,
	uu,
	du,
	Bl.extend({ type: W("resource_link") }),
	pu
]), hu = V({
	role: Rl,
	content: mu
}), gu = Uc.extend({
	description: F().optional(),
	messages: B(hu)
}), _u = Hc.extend({
	method: W("notifications/prompts/list_changed"),
	params: Vc.optional()
}), vu = V({
	title: F().optional(),
	readOnlyHint: R().optional(),
	destructiveHint: R().optional(),
	idempotentHint: R().optional(),
	openWorldHint: R().optional()
}), yu = V({ taskSupport: ic([
	"required",
	"optional",
	"forbidden"
]).optional() }), bu = V({
	...il.shape,
	...rl.shape,
	description: F().optional(),
	inputSchema: V({
		type: W("object"),
		properties: U(F(), K).optional(),
		required: B(F()).optional()
	}).catchall(z()),
	outputSchema: V({
		type: W("object"),
		properties: U(F(), K).optional(),
		required: B(F()).optional()
	}).catchall(z()).optional(),
	annotations: vu.optional(),
	execution: yu.optional(),
	_meta: U(F(), z()).optional()
}), xu = bl.extend({ method: W("tools/list") }), Su = xl.extend({ tools: B(bu) }), Cu = Uc.extend({
	content: B(mu).default([]),
	structuredContent: U(F(), z()).optional(),
	isError: R().optional()
});
Cu.or(Uc.extend({ toolResult: z() }));
/**
* Parameters for a `tools/call` request.
*/
const wu = zc.extend({
	name: F(),
	arguments: U(F(), z()).optional()
}), Tu = q.extend({
	method: W("tools/call"),
	params: wu
}), Eu = Hc.extend({
	method: W("notifications/tools/list_changed"),
	params: Vc.optional()
});
V({
	autoRefresh: R().default(!0),
	debounceMs: L().int().nonnegative().default(300)
});
/**
* The severity of a log message.
*/
const Du = ic([
	"debug",
	"info",
	"notice",
	"warning",
	"error",
	"critical",
	"alert",
	"emergency"
]), Ou = Rc.extend({ level: Du }), ku = q.extend({
	method: W("logging/setLevel"),
	params: Ou
}), Au = Vc.extend({
	level: Du,
	logger: F().optional(),
	data: z()
}), ju = Hc.extend({
	method: W("notifications/message"),
	params: Au
}), Mu = V({
	hints: B(V({ name: F().optional() })).optional(),
	costPriority: L().min(0).max(1).optional(),
	speedPriority: L().min(0).max(1).optional(),
	intelligencePriority: L().min(0).max(1).optional()
}), Nu = V({ mode: ic([
	"auto",
	"required",
	"none"
]).optional() }), Pu = V({
	type: W("tool_result"),
	toolUseId: F().describe("The unique identifier for the corresponding tool call."),
	content: B(mu).default([]),
	structuredContent: V({}).loose().optional(),
	isError: R().optional(),
	_meta: U(F(), z()).optional()
}), Fu = $s("type", [
	lu,
	uu,
	du
]), Iu = $s("type", [
	lu,
	uu,
	du,
	fu,
	Pu
]), Lu = V({
	role: Rl,
	content: H([Iu, B(Iu)]),
	_meta: U(F(), z()).optional()
}), Ru = zc.extend({
	messages: B(Lu),
	modelPreferences: Mu.optional(),
	systemPrompt: F().optional(),
	includeContext: ic([
		"none",
		"thisServer",
		"allServers"
	]).optional(),
	temperature: L().optional(),
	maxTokens: L().int(),
	stopSequences: B(F()).optional(),
	metadata: K.optional(),
	tools: B(bu).optional(),
	toolChoice: Nu.optional()
}), zu = q.extend({
	method: W("sampling/createMessage"),
	params: Ru
}), Bu = Uc.extend({
	model: F(),
	stopReason: G(ic([
		"endTurn",
		"stopSequence",
		"maxTokens"
	]).or(F())),
	role: Rl,
	content: Fu
}), Vu = Uc.extend({
	model: F(),
	stopReason: G(ic([
		"endTurn",
		"stopSequence",
		"maxTokens",
		"toolUse"
	]).or(F())),
	role: Rl,
	content: H([Iu, B(Iu)])
}), Hu = V({
	type: W("boolean"),
	title: F().optional(),
	description: F().optional(),
	default: R().optional()
}), Uu = V({
	type: W("string"),
	title: F().optional(),
	description: F().optional(),
	minLength: L().optional(),
	maxLength: L().optional(),
	format: ic([
		"email",
		"uri",
		"date",
		"date-time"
	]).optional(),
	default: F().optional()
}), Wu = V({
	type: ic(["number", "integer"]),
	title: F().optional(),
	description: F().optional(),
	minimum: L().optional(),
	maximum: L().optional(),
	default: L().optional()
}), Gu = V({
	type: W("string"),
	title: F().optional(),
	description: F().optional(),
	enum: B(F()),
	default: F().optional()
}), Ku = V({
	type: W("string"),
	title: F().optional(),
	description: F().optional(),
	oneOf: B(V({
		const: F(),
		title: F()
	})),
	default: F().optional()
}), qu = H([
	H([
		V({
			type: W("string"),
			title: F().optional(),
			description: F().optional(),
			enum: B(F()),
			enumNames: B(F()).optional(),
			default: F().optional()
		}),
		H([Gu, Ku]),
		H([V({
			type: W("array"),
			title: F().optional(),
			description: F().optional(),
			minItems: L().optional(),
			maxItems: L().optional(),
			items: V({
				type: W("string"),
				enum: B(F())
			}),
			default: B(F()).optional()
		}), V({
			type: W("array"),
			title: F().optional(),
			description: F().optional(),
			minItems: L().optional(),
			maxItems: L().optional(),
			items: V({ anyOf: B(V({
				const: F(),
				title: F()
			})) }),
			default: B(F()).optional()
		})])
	]),
	Hu,
	Uu,
	Wu
]), Ju = H([zc.extend({
	mode: W("form").optional(),
	message: F(),
	requestedSchema: V({
		type: W("object"),
		properties: U(F(), qu),
		required: B(F()).optional()
	})
}), zc.extend({
	mode: W("url"),
	message: F(),
	elicitationId: F(),
	url: F().url()
})]), Yu = q.extend({
	method: W("elicitation/create"),
	params: Ju
}), Xu = Vc.extend({ elicitationId: F() }), Zu = Hc.extend({
	method: W("notifications/elicitation/complete"),
	params: Xu
}), Qu = Uc.extend({
	action: ic([
		"accept",
		"decline",
		"cancel"
	]),
	content: kc((e) => e === null ? void 0 : e, U(F(), H([
		F(),
		L(),
		R(),
		B(F())
	])).optional())
}), $u = V({
	type: W("ref/resource"),
	uri: F()
}), ed = V({
	type: W("ref/prompt"),
	name: F()
}), td = Rc.extend({
	ref: H([ed, $u]),
	argument: V({
		name: F(),
		value: F()
	}),
	context: V({ arguments: U(F(), F()).optional() }).optional()
}), nd = q.extend({
	method: W("completion/complete"),
	params: td
});
function rd(e) {
	if (e.params.ref.type !== "ref/prompt") throw TypeError(`Expected CompleteRequestPrompt, but got ${e.params.ref.type}`);
}
function id(e) {
	if (e.params.ref.type !== "ref/resource") throw TypeError(`Expected CompleteRequestResourceTemplate, but got ${e.params.ref.type}`);
}
/**
* The server's response to a completion/complete request
*/
const ad = Uc.extend({ completion: Xs({
	values: B(F()).max(100),
	total: G(L().int()),
	hasMore: G(R())
}) }), od = V({
	uri: F().startsWith("file://"),
	name: F().optional(),
	_meta: U(F(), z()).optional()
}), sd = q.extend({
	method: W("roots/list"),
	params: Rc.optional()
}), cd = Uc.extend({ roots: B(od) }), ld = Hc.extend({
	method: W("notifications/roots/list_changed"),
	params: Vc.optional()
});
H([
	hl,
	dl,
	nd,
	ku,
	cu,
	au,
	Hl,
	Wl,
	Jl,
	Ql,
	eu,
	Tu,
	xu,
	Dl,
	kl,
	Al,
	Ml
]), H([
	nl,
	vl,
	ml,
	ld,
	El
]), H([
	el,
	Bu,
	Vu,
	Qu,
	cd,
	Ol,
	jl,
	wl
]), H([
	hl,
	zu,
	Yu,
	sd,
	Dl,
	kl,
	Al,
	Ml
]), H([
	nl,
	vl,
	ju,
	nu,
	Xl,
	Eu,
	_u,
	El,
	Zu
]), H([
	el,
	pl,
	ad,
	gu,
	ou,
	Ul,
	Gl,
	Yl,
	Cu,
	Su,
	Ol,
	jl,
	wl
]);
var Y = class e extends Error {
	constructor(e, t, n) {
		super(`MCP error ${e}: ${t}`), this.code = e, this.data = n, this.name = "McpError";
	}
	/**
	* Factory method to create the appropriate error type based on the error code and data
	*/
	static fromError(t, n, r) {
		if (t === J.UrlElicitationRequired && r) {
			let e = r;
			if (e.elicitations) return new ud(e.elicitations, n);
		}
		return new e(t, n, r);
	}
}, ud = class extends Y {
	constructor(e, t = `URL elicitation${e.length > 1 ? "s" : ""} required`) {
		super(J.UrlElicitationRequired, t, { elicitations: e });
	}
	get elicitations() {
		var e;
		return ((e = this.data) == null ? void 0 : e.elicitations) ?? [];
	}
};
/**
* Experimental task interfaces for MCP SDK.
* WARNING: These APIs are experimental and may change without notice.
*/
/**
* Checks if a task status represents a terminal state.
* Terminal states are those where the task has finished and will not change.
*
* @param status - The task status to check
* @returns True if the status is terminal (completed, failed, or cancelled)
* @experimental
*/
function dd(e) {
	return e === "completed" || e === "failed" || e === "cancelled";
}
const fd = Symbol("Let zodToJsonSchema decide on which parser to use"), pd = {
	name: void 0,
	$refStrategy: "root",
	basePath: ["#"],
	effectStrategy: "input",
	pipeStrategy: "all",
	dateStrategy: "format:date-time",
	mapStrategy: "entries",
	removeAdditionalStrategy: "passthrough",
	allowedAdditionalProperties: !0,
	rejectedAdditionalProperties: !1,
	definitionPath: "definitions",
	target: "jsonSchema7",
	strictUnions: !1,
	definitions: {},
	errorMessages: !1,
	markdownDescription: !1,
	patternStrategy: "escape",
	applyRegexFlags: !1,
	emailStrategy: "format:email",
	base64Strategy: "contentEncoding:base64",
	nameStrategy: "ref",
	openAiAnyTypeName: "OpenAiAnyType"
}, md = (e) => typeof e == "string" ? {
	...pd,
	name: e
} : {
	...pd,
	...e
}, hd = (e) => {
	let t = md(e), n = t.name === void 0 ? t.basePath : [
		...t.basePath,
		t.definitionPath,
		t.name
	];
	return {
		...t,
		flags: { hasReferencedOpenAiAnyType: !1 },
		currentPath: n,
		propertyPath: void 0,
		seen: new Map(Object.entries(t.definitions).map(([e, n]) => [n._def, {
			def: n._def,
			path: [
				...t.basePath,
				t.definitionPath,
				e
			],
			jsonSchema: void 0
		}]))
	};
};
function gd(e, t, n, r) {
	r != null && r.errorMessages && n && (e.errorMessage = {
		...e.errorMessage,
		[t]: n
	});
}
function X(e, t, n, r, i) {
	e[t] = n, gd(e, t, r, i);
}
const _d = (e, t) => {
	let n = 0;
	for (; n < e.length && n < t.length && e[n] === t[n]; n++);
	return [(e.length - n).toString(), ...t.slice(n)].join("/");
};
function vd(e) {
	if (e.target !== "openAi") return {};
	let t = [
		...e.basePath,
		e.definitionPath,
		e.openAiAnyTypeName
	];
	return e.flags.hasReferencedOpenAiAnyType = !0, { $ref: e.$refStrategy === "relative" ? _d(t, e.currentPath) : t.join("/") };
}
function yd(e, t) {
	var n, r;
	let i = { type: "array" };
	return (n = e.type) != null && n._def && ((r = e.type) == null || (r = r._def) == null ? void 0 : r.typeName) !== D.ZodAny && (i.items = Z(e.type._def, {
		...t,
		currentPath: [...t.currentPath, "items"]
	})), e.minLength && X(i, "minItems", e.minLength.value, e.minLength.message, t), e.maxLength && X(i, "maxItems", e.maxLength.value, e.maxLength.message, t), e.exactLength && (X(i, "minItems", e.exactLength.value, e.exactLength.message, t), X(i, "maxItems", e.exactLength.value, e.exactLength.message, t)), i;
}
function bd(e, t) {
	let n = {
		type: "integer",
		format: "int64"
	};
	if (!e.checks) return n;
	for (let r of e.checks) switch (r.kind) {
		case "min":
			t.target === "jsonSchema7" ? r.inclusive ? X(n, "minimum", r.value, r.message, t) : X(n, "exclusiveMinimum", r.value, r.message, t) : (r.inclusive || (n.exclusiveMinimum = !0), X(n, "minimum", r.value, r.message, t));
			break;
		case "max":
			t.target === "jsonSchema7" ? r.inclusive ? X(n, "maximum", r.value, r.message, t) : X(n, "exclusiveMaximum", r.value, r.message, t) : (r.inclusive || (n.exclusiveMaximum = !0), X(n, "maximum", r.value, r.message, t));
			break;
		case "multipleOf":
			X(n, "multipleOf", r.value, r.message, t);
			break;
	}
	return n;
}
function xd() {
	return { type: "boolean" };
}
function Sd(e, t) {
	return Z(e.type._def, t);
}
const Cd = (e, t) => Z(e.innerType._def, t);
function wd(e, t, n) {
	let r = n ?? t.dateStrategy;
	if (Array.isArray(r)) return { anyOf: r.map((n, r) => wd(e, t, n)) };
	switch (r) {
		case "string":
		case "format:date-time": return {
			type: "string",
			format: "date-time"
		};
		case "format:date": return {
			type: "string",
			format: "date"
		};
		case "integer": return Td(e, t);
	}
}
var Td = (e, t) => {
	let n = {
		type: "integer",
		format: "unix-time"
	};
	if (t.target === "openApi3") return n;
	for (let r of e.checks) switch (r.kind) {
		case "min":
			X(n, "minimum", r.value, r.message, t);
			break;
		case "max":
			X(n, "maximum", r.value, r.message, t);
			break;
	}
	return n;
};
function Ed(e, t) {
	return {
		...Z(e.innerType._def, t),
		default: e.defaultValue()
	};
}
function Dd(e, t) {
	return t.effectStrategy === "input" ? Z(e.schema._def, t) : vd(t);
}
function Od(e) {
	return {
		type: "string",
		enum: Array.from(e.values)
	};
}
var kd = (e) => "type" in e && e.type === "string" ? !1 : "allOf" in e;
function Ad(e, t) {
	let n = [Z(e.left._def, {
		...t,
		currentPath: [
			...t.currentPath,
			"allOf",
			"0"
		]
	}), Z(e.right._def, {
		...t,
		currentPath: [
			...t.currentPath,
			"allOf",
			"1"
		]
	})].filter((e) => !!e), r = t.target === "jsonSchema2019-09" ? { unevaluatedProperties: !1 } : void 0, i = [];
	return n.forEach((e) => {
		if (kd(e)) i.push(...e.allOf), e.unevaluatedProperties === void 0 && (r = void 0);
		else {
			let t = e;
			if ("additionalProperties" in e && e.additionalProperties === !1) {
				let { additionalProperties: n, ...r } = e;
				t = r;
			} else r = void 0;
			i.push(t);
		}
	}), i.length ? {
		allOf: i,
		...r
	} : void 0;
}
function jd(e, t) {
	let n = typeof e.value;
	return n !== "bigint" && n !== "number" && n !== "boolean" && n !== "string" ? { type: Array.isArray(e.value) ? "array" : "object" } : t.target === "openApi3" ? {
		type: n === "bigint" ? "integer" : n,
		enum: [e.value]
	} : {
		type: n === "bigint" ? "integer" : n,
		const: e.value
	};
}
var Md = void 0;
/**
* Generated from the regular expressions found here as of 2024-05-22:
* https://github.com/colinhacks/zod/blob/master/src/types.ts.
*
* Expressions with /i flag have been changed accordingly.
*/
const Nd = {
	cuid: /^[cC][^\s-]{8,}$/,
	cuid2: /^[0-9a-z]+$/,
	ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
	email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
	emoji: () => (Md === void 0 && (Md = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u")), Md),
	uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
	ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
	ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
	ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
	ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
	base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
	base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
	nanoid: /^[a-zA-Z0-9_-]{21}$/,
	jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};
function Pd(e, t) {
	let n = { type: "string" };
	if (e.checks) for (let r of e.checks) switch (r.kind) {
		case "min":
			X(n, "minLength", typeof n.minLength == "number" ? Math.max(n.minLength, r.value) : r.value, r.message, t);
			break;
		case "max":
			X(n, "maxLength", typeof n.maxLength == "number" ? Math.min(n.maxLength, r.value) : r.value, r.message, t);
			break;
		case "email":
			switch (t.emailStrategy) {
				case "format:email":
					Rd(n, "email", r.message, t);
					break;
				case "format:idn-email":
					Rd(n, "idn-email", r.message, t);
					break;
				case "pattern:zod":
					zd(n, Nd.email, r.message, t);
					break;
			}
			break;
		case "url":
			Rd(n, "uri", r.message, t);
			break;
		case "uuid":
			Rd(n, "uuid", r.message, t);
			break;
		case "regex":
			zd(n, r.regex, r.message, t);
			break;
		case "cuid":
			zd(n, Nd.cuid, r.message, t);
			break;
		case "cuid2":
			zd(n, Nd.cuid2, r.message, t);
			break;
		case "startsWith":
			zd(n, RegExp(`^${Fd(r.value, t)}`), r.message, t);
			break;
		case "endsWith":
			zd(n, RegExp(`${Fd(r.value, t)}$`), r.message, t);
			break;
		case "datetime":
			Rd(n, "date-time", r.message, t);
			break;
		case "date":
			Rd(n, "date", r.message, t);
			break;
		case "time":
			Rd(n, "time", r.message, t);
			break;
		case "duration":
			Rd(n, "duration", r.message, t);
			break;
		case "length":
			X(n, "minLength", typeof n.minLength == "number" ? Math.max(n.minLength, r.value) : r.value, r.message, t), X(n, "maxLength", typeof n.maxLength == "number" ? Math.min(n.maxLength, r.value) : r.value, r.message, t);
			break;
		case "includes":
			zd(n, RegExp(Fd(r.value, t)), r.message, t);
			break;
		case "ip":
			r.version !== "v6" && Rd(n, "ipv4", r.message, t), r.version !== "v4" && Rd(n, "ipv6", r.message, t);
			break;
		case "base64url":
			zd(n, Nd.base64url, r.message, t);
			break;
		case "jwt":
			zd(n, Nd.jwt, r.message, t);
			break;
		case "cidr":
			r.version !== "v6" && zd(n, Nd.ipv4Cidr, r.message, t), r.version !== "v4" && zd(n, Nd.ipv6Cidr, r.message, t);
			break;
		case "emoji":
			zd(n, Nd.emoji(), r.message, t);
			break;
		case "ulid":
			zd(n, Nd.ulid, r.message, t);
			break;
		case "base64":
			switch (t.base64Strategy) {
				case "format:binary":
					Rd(n, "binary", r.message, t);
					break;
				case "contentEncoding:base64":
					X(n, "contentEncoding", "base64", r.message, t);
					break;
				case "pattern:zod":
					zd(n, Nd.base64, r.message, t);
					break;
			}
			break;
		case "nanoid": zd(n, Nd.nanoid, r.message, t);
		case "toLowerCase":
		case "toUpperCase":
		case "trim": break;
		default: ((e) => {})(r);
	}
	return n;
}
function Fd(e, t) {
	return t.patternStrategy === "escape" ? Ld(e) : e;
}
var Id = /* @__PURE__ */ new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
function Ld(e) {
	let t = "";
	for (let n = 0; n < e.length; n++) Id.has(e[n]) || (t += "\\"), t += e[n];
	return t;
}
function Rd(e, t, n, r) {
	var i;
	e.format || (i = e.anyOf) != null && i.some((e) => e.format) ? (e.anyOf ||= [], e.format && (e.anyOf.push({
		format: e.format,
		...e.errorMessage && r.errorMessages && { errorMessage: { format: e.errorMessage.format } }
	}), delete e.format, e.errorMessage && (delete e.errorMessage.format, Object.keys(e.errorMessage).length === 0 && delete e.errorMessage)), e.anyOf.push({
		format: t,
		...n && r.errorMessages && { errorMessage: { format: n } }
	})) : X(e, "format", t, n, r);
}
function zd(e, t, n, r) {
	var i;
	e.pattern || (i = e.allOf) != null && i.some((e) => e.pattern) ? (e.allOf ||= [], e.pattern && (e.allOf.push({
		pattern: e.pattern,
		...e.errorMessage && r.errorMessages && { errorMessage: { pattern: e.errorMessage.pattern } }
	}), delete e.pattern, e.errorMessage && (delete e.errorMessage.pattern, Object.keys(e.errorMessage).length === 0 && delete e.errorMessage)), e.allOf.push({
		pattern: Bd(t, r),
		...n && r.errorMessages && { errorMessage: { pattern: n } }
	})) : X(e, "pattern", Bd(t, r), n, r);
}
function Bd(e, t) {
	if (!t.applyRegexFlags || !e.flags) return e.source;
	let n = {
		i: e.flags.includes("i"),
		m: e.flags.includes("m"),
		s: e.flags.includes("s")
	}, r = n.i ? e.source.toLowerCase() : e.source, i = "", a = !1, o = !1, s = !1;
	for (let e = 0; e < r.length; e++) {
		if (a) {
			i += r[e], a = !1;
			continue;
		}
		if (n.i) {
			if (o) {
				if (r[e].match(/[a-z]/)) {
					var c;
					s ? (i += r[e], i += `${r[e - 2]}-${r[e]}`.toUpperCase(), s = !1) : r[e + 1] === "-" && (c = r[e + 2]) != null && c.match(/[a-z]/) ? (i += r[e], s = !0) : i += `${r[e]}${r[e].toUpperCase()}`;
					continue;
				}
			} else if (r[e].match(/[a-z]/)) {
				i += `[${r[e]}${r[e].toUpperCase()}]`;
				continue;
			}
		}
		if (n.m) {
			if (r[e] === "^") {
				i += "(^|(?<=[\r\n]))";
				continue;
			} else if (r[e] === "$") {
				i += "($|(?=[\r\n]))";
				continue;
			}
		}
		if (n.s && r[e] === ".") {
			i += o ? `${r[e]}\r\n` : `[${r[e]}\r\n]`;
			continue;
		}
		i += r[e], r[e] === "\\" ? a = !0 : o && r[e] === "]" ? o = !1 : !o && r[e] === "[" && (o = !0);
	}
	try {
		new RegExp(i);
	} catch {
		return console.warn(`Could not convert regex pattern at ${t.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`), e.source;
	}
	return i;
}
function Vd(e, t) {
	var n, r, i, a, o, s;
	if (t.target === "openAi" && console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead."), t.target === "openApi3" && ((n = e.keyType) == null ? void 0 : n._def.typeName) === D.ZodEnum) return {
		type: "object",
		required: e.keyType._def.values,
		properties: e.keyType._def.values.reduce((n, r) => ({
			...n,
			[r]: Z(e.valueType._def, {
				...t,
				currentPath: [
					...t.currentPath,
					"properties",
					r
				]
			}) ?? vd(t)
		}), {}),
		additionalProperties: t.rejectedAdditionalProperties
	};
	let c = {
		type: "object",
		additionalProperties: Z(e.valueType._def, {
			...t,
			currentPath: [...t.currentPath, "additionalProperties"]
		}) ?? t.allowedAdditionalProperties
	};
	if (t.target === "openApi3") return c;
	if (((r = e.keyType) == null ? void 0 : r._def.typeName) === D.ZodString && (i = e.keyType._def.checks) != null && i.length) {
		let { type: n, ...r } = Pd(e.keyType._def, t);
		return {
			...c,
			propertyNames: r
		};
	} else if (((a = e.keyType) == null ? void 0 : a._def.typeName) === D.ZodEnum) return {
		...c,
		propertyNames: { enum: e.keyType._def.values }
	};
	else if (((o = e.keyType) == null ? void 0 : o._def.typeName) === D.ZodBranded && e.keyType._def.type._def.typeName === D.ZodString && (s = e.keyType._def.type._def.checks) != null && s.length) {
		let { type: n, ...r } = Sd(e.keyType._def, t);
		return {
			...c,
			propertyNames: r
		};
	}
	return c;
}
function Hd(e, t) {
	return t.mapStrategy === "record" ? Vd(e, t) : {
		type: "array",
		maxItems: 125,
		items: {
			type: "array",
			items: [Z(e.keyType._def, {
				...t,
				currentPath: [
					...t.currentPath,
					"items",
					"items",
					"0"
				]
			}) || vd(t), Z(e.valueType._def, {
				...t,
				currentPath: [
					...t.currentPath,
					"items",
					"items",
					"1"
				]
			}) || vd(t)],
			minItems: 2,
			maxItems: 2
		}
	};
}
function Ud(e) {
	let t = e.values, n = Object.keys(e.values).filter((e) => typeof t[t[e]] != "number").map((e) => t[e]), r = Array.from(new Set(n.map((e) => typeof e)));
	return {
		type: r.length === 1 ? r[0] === "string" ? "string" : "number" : ["string", "number"],
		enum: n
	};
}
function Wd(e) {
	return e.target === "openAi" ? void 0 : { not: vd({
		...e,
		currentPath: [...e.currentPath, "not"]
	}) };
}
function Gd(e) {
	return e.target === "openApi3" ? {
		enum: ["null"],
		nullable: !0
	} : { type: "null" };
}
const Kd = {
	ZodString: "string",
	ZodNumber: "number",
	ZodBigInt: "integer",
	ZodBoolean: "boolean",
	ZodNull: "null"
};
function qd(e, t) {
	if (t.target === "openApi3") return Jd(e, t);
	let n = e.options instanceof Map ? Array.from(e.options.values()) : e.options;
	if (n.every((e) => e._def.typeName in Kd && (!e._def.checks || !e._def.checks.length))) {
		let e = n.reduce((e, t) => {
			let n = Kd[t._def.typeName];
			return n && !e.includes(n) ? [...e, n] : e;
		}, []);
		return { type: e.length > 1 ? e : e[0] };
	} else if (n.every((e) => e._def.typeName === "ZodLiteral" && !e.description)) {
		let e = n.reduce((e, t) => {
			let n = typeof t._def.value;
			switch (n) {
				case "string":
				case "number":
				case "boolean": return [...e, n];
				case "bigint": return [...e, "integer"];
				case "object": if (t._def.value === null) return [...e, "null"];
				default: return e;
			}
		}, []);
		if (e.length === n.length) {
			let t = e.filter((e, t, n) => n.indexOf(e) === t);
			return {
				type: t.length > 1 ? t : t[0],
				enum: n.reduce((e, t) => e.includes(t._def.value) ? e : [...e, t._def.value], [])
			};
		}
	} else if (n.every((e) => e._def.typeName === "ZodEnum")) return {
		type: "string",
		enum: n.reduce((e, t) => [...e, ...t._def.values.filter((t) => !e.includes(t))], [])
	};
	return Jd(e, t);
}
var Jd = (e, t) => {
	let n = (e.options instanceof Map ? Array.from(e.options.values()) : e.options).map((e, n) => Z(e._def, {
		...t,
		currentPath: [
			...t.currentPath,
			"anyOf",
			`${n}`
		]
	})).filter((e) => !!e && (!t.strictUnions || typeof e == "object" && Object.keys(e).length > 0));
	return n.length ? { anyOf: n } : void 0;
};
function Yd(e, t) {
	if ([
		"ZodString",
		"ZodNumber",
		"ZodBigInt",
		"ZodBoolean",
		"ZodNull"
	].includes(e.innerType._def.typeName) && (!e.innerType._def.checks || !e.innerType._def.checks.length)) return t.target === "openApi3" ? {
		type: Kd[e.innerType._def.typeName],
		nullable: !0
	} : { type: [Kd[e.innerType._def.typeName], "null"] };
	if (t.target === "openApi3") {
		let n = Z(e.innerType._def, {
			...t,
			currentPath: [...t.currentPath]
		});
		return n && "$ref" in n ? {
			allOf: [n],
			nullable: !0
		} : n && {
			...n,
			nullable: !0
		};
	}
	let n = Z(e.innerType._def, {
		...t,
		currentPath: [
			...t.currentPath,
			"anyOf",
			"0"
		]
	});
	return n && { anyOf: [n, { type: "null" }] };
}
function Xd(e, t) {
	let n = { type: "number" };
	if (!e.checks) return n;
	for (let r of e.checks) switch (r.kind) {
		case "int":
			n.type = "integer", gd(n, "type", r.message, t);
			break;
		case "min":
			t.target === "jsonSchema7" ? r.inclusive ? X(n, "minimum", r.value, r.message, t) : X(n, "exclusiveMinimum", r.value, r.message, t) : (r.inclusive || (n.exclusiveMinimum = !0), X(n, "minimum", r.value, r.message, t));
			break;
		case "max":
			t.target === "jsonSchema7" ? r.inclusive ? X(n, "maximum", r.value, r.message, t) : X(n, "exclusiveMaximum", r.value, r.message, t) : (r.inclusive || (n.exclusiveMaximum = !0), X(n, "maximum", r.value, r.message, t));
			break;
		case "multipleOf":
			X(n, "multipleOf", r.value, r.message, t);
			break;
	}
	return n;
}
function Zd(e, t) {
	let n = t.target === "openAi", r = {
		type: "object",
		properties: {}
	}, i = [], a = e.shape();
	for (let e in a) {
		let o = a[e];
		if (o === void 0 || o._def === void 0) continue;
		let s = $d(o);
		s && n && (o._def.typeName === "ZodOptional" && (o = o._def.innerType), o.isNullable() || (o = o.nullable()), s = !1);
		let c = Z(o._def, {
			...t,
			currentPath: [
				...t.currentPath,
				"properties",
				e
			],
			propertyPath: [
				...t.currentPath,
				"properties",
				e
			]
		});
		c !== void 0 && (r.properties[e] = c, s || i.push(e));
	}
	i.length && (r.required = i);
	let o = Qd(e, t);
	return o !== void 0 && (r.additionalProperties = o), r;
}
function Qd(e, t) {
	if (e.catchall._def.typeName !== "ZodNever") return Z(e.catchall._def, {
		...t,
		currentPath: [...t.currentPath, "additionalProperties"]
	});
	switch (e.unknownKeys) {
		case "passthrough": return t.allowedAdditionalProperties;
		case "strict": return t.rejectedAdditionalProperties;
		case "strip": return t.removeAdditionalStrategy === "strict" ? t.allowedAdditionalProperties : t.rejectedAdditionalProperties;
	}
}
function $d(e) {
	try {
		return e.isOptional();
	} catch {
		return !0;
	}
}
const ef = (e, t) => {
	var n;
	if (t.currentPath.toString() === ((n = t.propertyPath) == null ? void 0 : n.toString())) return Z(e.innerType._def, t);
	let r = Z(e.innerType._def, {
		...t,
		currentPath: [
			...t.currentPath,
			"anyOf",
			"1"
		]
	});
	return r ? { anyOf: [{ not: vd(t) }, r] } : vd(t);
}, tf = (e, t) => {
	if (t.pipeStrategy === "input") return Z(e.in._def, t);
	if (t.pipeStrategy === "output") return Z(e.out._def, t);
	let n = Z(e.in._def, {
		...t,
		currentPath: [
			...t.currentPath,
			"allOf",
			"0"
		]
	});
	return { allOf: [n, Z(e.out._def, {
		...t,
		currentPath: [
			...t.currentPath,
			"allOf",
			n ? "1" : "0"
		]
	})].filter((e) => e !== void 0) };
};
function nf(e, t) {
	return Z(e.type._def, t);
}
function rf(e, t) {
	let n = {
		type: "array",
		uniqueItems: !0,
		items: Z(e.valueType._def, {
			...t,
			currentPath: [...t.currentPath, "items"]
		})
	};
	return e.minSize && X(n, "minItems", e.minSize.value, e.minSize.message, t), e.maxSize && X(n, "maxItems", e.maxSize.value, e.maxSize.message, t), n;
}
function af(e, t) {
	return e.rest ? {
		type: "array",
		minItems: e.items.length,
		items: e.items.map((e, n) => Z(e._def, {
			...t,
			currentPath: [
				...t.currentPath,
				"items",
				`${n}`
			]
		})).reduce((e, t) => t === void 0 ? e : [...e, t], []),
		additionalItems: Z(e.rest._def, {
			...t,
			currentPath: [...t.currentPath, "additionalItems"]
		})
	} : {
		type: "array",
		minItems: e.items.length,
		maxItems: e.items.length,
		items: e.items.map((e, n) => Z(e._def, {
			...t,
			currentPath: [
				...t.currentPath,
				"items",
				`${n}`
			]
		})).reduce((e, t) => t === void 0 ? e : [...e, t], [])
	};
}
function of(e) {
	return { not: vd(e) };
}
function sf(e) {
	return vd(e);
}
const cf = (e, t) => Z(e.innerType._def, t), lf = (e, t, n) => {
	switch (t) {
		case D.ZodString: return Pd(e, n);
		case D.ZodNumber: return Xd(e, n);
		case D.ZodObject: return Zd(e, n);
		case D.ZodBigInt: return bd(e, n);
		case D.ZodBoolean: return xd();
		case D.ZodDate: return wd(e, n);
		case D.ZodUndefined: return of(n);
		case D.ZodNull: return Gd(n);
		case D.ZodArray: return yd(e, n);
		case D.ZodUnion:
		case D.ZodDiscriminatedUnion: return qd(e, n);
		case D.ZodIntersection: return Ad(e, n);
		case D.ZodTuple: return af(e, n);
		case D.ZodRecord: return Vd(e, n);
		case D.ZodLiteral: return jd(e, n);
		case D.ZodEnum: return Od(e);
		case D.ZodNativeEnum: return Ud(e);
		case D.ZodNullable: return Yd(e, n);
		case D.ZodOptional: return ef(e, n);
		case D.ZodMap: return Hd(e, n);
		case D.ZodSet: return rf(e, n);
		case D.ZodLazy: return () => e.getter()._def;
		case D.ZodPromise: return nf(e, n);
		case D.ZodNaN:
		case D.ZodNever: return Wd(n);
		case D.ZodEffects: return Dd(e, n);
		case D.ZodAny: return vd(n);
		case D.ZodUnknown: return sf(n);
		case D.ZodDefault: return Ed(e, n);
		case D.ZodBranded: return Sd(e, n);
		case D.ZodReadonly: return cf(e, n);
		case D.ZodCatch: return Cd(e, n);
		case D.ZodPipeline: return tf(e, n);
		case D.ZodFunction:
		case D.ZodVoid:
		case D.ZodSymbol: return;
		default: return ((e) => void 0)(t);
	}
};
function Z(e, t, n = !1) {
	let r = t.seen.get(e);
	if (t.override) {
		var i;
		let a = (i = t.override) == null ? void 0 : i.call(t, e, t, r, n);
		if (a !== fd) return a;
	}
	if (r && !n) {
		let e = uf(r, t);
		if (e !== void 0) return e;
	}
	let a = {
		def: e,
		path: t.currentPath,
		jsonSchema: void 0
	};
	t.seen.set(e, a);
	let o = lf(e, e.typeName, t), s = typeof o == "function" ? Z(o(), t) : o;
	if (s && df(e, t, s), t.postProcess) {
		let n = t.postProcess(s, e, t);
		return a.jsonSchema = s, n;
	}
	return a.jsonSchema = s, s;
}
var uf = (e, t) => {
	switch (t.$refStrategy) {
		case "root": return { $ref: e.path.join("/") };
		case "relative": return { $ref: _d(t.currentPath, e.path) };
		case "none":
		case "seen": return e.path.length < t.currentPath.length && e.path.every((e, n) => t.currentPath[n] === e) ? (console.warn(`Recursive reference detected at ${t.currentPath.join("/")}! Defaulting to any`), vd(t)) : t.$refStrategy === "seen" ? vd(t) : void 0;
	}
}, df = (e, t, n) => (e.description && (n.description = e.description, t.markdownDescription && (n.markdownDescription = e.description)), n), ff = (e, t) => {
	let n = hd(t), r = typeof t == "object" && t.definitions ? Object.entries(t.definitions).reduce((e, [t, r]) => ({
		...e,
		[t]: Z(r._def, {
			...n,
			currentPath: [
				...n.basePath,
				n.definitionPath,
				t
			]
		}, !0) ?? vd(n)
	}), {}) : void 0, i = typeof t == "string" ? t : (t == null ? void 0 : t.nameStrategy) === "title" || t == null ? void 0 : t.name, a = Z(e._def, i === void 0 ? n : {
		...n,
		currentPath: [
			...n.basePath,
			n.definitionPath,
			i
		]
	}, !1) ?? vd(n), o = typeof t == "object" && t.name !== void 0 && t.nameStrategy === "title" ? t.name : void 0;
	o !== void 0 && (a.title = o), n.flags.hasReferencedOpenAiAnyType && (r ||= {}, r[n.openAiAnyTypeName] || (r[n.openAiAnyTypeName] = {
		type: [
			"string",
			"number",
			"integer",
			"boolean",
			"array",
			"null"
		],
		items: { $ref: n.$refStrategy === "relative" ? "1" : [
			...n.basePath,
			n.definitionPath,
			n.openAiAnyTypeName
		].join("/") }
	}));
	let s = i === void 0 ? r ? {
		...a,
		[n.definitionPath]: r
	} : a : {
		$ref: [
			...n.$refStrategy === "relative" ? [] : n.basePath,
			n.definitionPath,
			i
		].join("/"),
		[n.definitionPath]: {
			...r,
			[i]: a
		}
	};
	return n.target === "jsonSchema7" ? s.$schema = "http://json-schema.org/draft-07/schema#" : (n.target === "jsonSchema2019-09" || n.target === "openAi") && (s.$schema = "https://json-schema.org/draft/2019-09/schema#"), n.target === "openAi" && ("anyOf" in s || "oneOf" in s || "allOf" in s || "type" in s && Array.isArray(s.type)) && console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property."), s;
};
function pf(e) {
	return !e || e === "jsonSchema7" || e === "draft-7" ? "draft-7" : e === "jsonSchema2019-09" || e === "draft-2020-12" ? "draft-2020-12" : "draft-7";
}
function mf(e, t) {
	return Bo(e) ? Io(e, {
		target: pf(t == null ? void 0 : t.target),
		io: (t == null ? void 0 : t.pipeStrategy) ?? "input"
	}) : ff(e, {
		strictUnions: (t == null ? void 0 : t.strictUnions) ?? !0,
		pipeStrategy: (t == null ? void 0 : t.pipeStrategy) ?? "input"
	});
}
function hf(e) {
	let t = Wo(e), n = t == null ? void 0 : t.method;
	if (!n) throw Error("Schema is missing a method literal");
	let r = Yo(n);
	if (typeof r != "string") throw Error("Schema method literal must be a string");
	return r;
}
function gf(e, t) {
	let n = Ho(e, t);
	if (!n.success) throw n.error;
	return n.data;
}
/**
* Implements MCP protocol framing on top of a pluggable transport, including
* features like request/response linking, notifications, and progress.
*/
var _f = class {
	constructor(e) {
		this._options = e, this._requestMessageId = 0, this._requestHandlers = /* @__PURE__ */ new Map(), this._requestHandlerAbortControllers = /* @__PURE__ */ new Map(), this._notificationHandlers = /* @__PURE__ */ new Map(), this._responseHandlers = /* @__PURE__ */ new Map(), this._progressHandlers = /* @__PURE__ */ new Map(), this._timeoutInfo = /* @__PURE__ */ new Map(), this._pendingDebouncedNotifications = /* @__PURE__ */ new Set(), this._taskProgressTokens = /* @__PURE__ */ new Map(), this._requestResolvers = /* @__PURE__ */ new Map(), this.setNotificationHandler(nl, (e) => {
			this._oncancel(e);
		}), this.setNotificationHandler(vl, (e) => {
			this._onprogress(e);
		}), this.setRequestHandler(hl, (e) => ({})), this._taskStore = e == null ? void 0 : e.taskStore, this._taskMessageQueue = e == null ? void 0 : e.taskMessageQueue, this._taskStore && (this.setRequestHandler(Dl, async (e, t) => {
			let n = await this._taskStore.getTask(e.params.taskId, t.sessionId);
			if (!n) throw new Y(J.InvalidParams, "Failed to retrieve task: Task not found");
			return { ...n };
		}), this.setRequestHandler(kl, async (e, t) => {
			let n = async () => {
				let r = e.params.taskId;
				if (this._taskMessageQueue) {
					let e;
					for (; e = await this._taskMessageQueue.dequeue(r, t.sessionId);) {
						var i;
						if (e.type === "response" || e.type === "error") {
							let t = e.message, n = t.id, r = this._requestResolvers.get(n);
							if (r) if (this._requestResolvers.delete(n), e.type === "response") r(t);
							else {
								let e = t;
								r(new Y(e.error.code, e.error.message, e.error.data));
							}
							else {
								let t = e.type === "response" ? "Response" : "Error";
								this._onerror(/* @__PURE__ */ Error(`${t} handler missing for request ${n}`));
							}
							continue;
						}
						await ((i = this._transport) == null ? void 0 : i.send(e.message, { relatedRequestId: t.requestId }));
					}
				}
				let a = await this._taskStore.getTask(r, t.sessionId);
				if (!a) throw new Y(J.InvalidParams, `Task not found: ${r}`);
				if (!dd(a.status)) return await this._waitForTaskUpdate(r, t.signal), await n();
				if (dd(a.status)) {
					let e = await this._taskStore.getTaskResult(r, t.sessionId);
					return this._clearTaskQueue(r), {
						...e,
						_meta: {
							...e._meta,
							[Mc]: { taskId: r }
						}
					};
				}
				return await n();
			};
			return await n();
		}), this.setRequestHandler(Al, async (e, t) => {
			try {
				var n;
				let { tasks: r, nextCursor: i } = await this._taskStore.listTasks((n = e.params) == null ? void 0 : n.cursor, t.sessionId);
				return {
					tasks: r,
					nextCursor: i,
					_meta: {}
				};
			} catch (e) {
				throw new Y(J.InvalidParams, `Failed to list tasks: ${e instanceof Error ? e.message : String(e)}`);
			}
		}), this.setRequestHandler(Ml, async (e, t) => {
			try {
				let n = await this._taskStore.getTask(e.params.taskId, t.sessionId);
				if (!n) throw new Y(J.InvalidParams, `Task not found: ${e.params.taskId}`);
				if (dd(n.status)) throw new Y(J.InvalidParams, `Cannot cancel task in terminal status: ${n.status}`);
				await this._taskStore.updateTaskStatus(e.params.taskId, "cancelled", "Client cancelled task execution.", t.sessionId), this._clearTaskQueue(e.params.taskId);
				let r = await this._taskStore.getTask(e.params.taskId, t.sessionId);
				if (!r) throw new Y(J.InvalidParams, `Task not found after cancellation: ${e.params.taskId}`);
				return {
					_meta: {},
					...r
				};
			} catch (e) {
				throw e instanceof Y ? e : new Y(J.InvalidRequest, `Failed to cancel task: ${e instanceof Error ? e.message : String(e)}`);
			}
		}));
	}
	async _oncancel(e) {
		if (!e.params.requestId) return;
		let t = this._requestHandlerAbortControllers.get(e.params.requestId);
		t == null || t.abort(e.params.reason);
	}
	_setupTimeout(e, t, n, r, i = !1) {
		this._timeoutInfo.set(e, {
			timeoutId: setTimeout(r, t),
			startTime: Date.now(),
			timeout: t,
			maxTotalTimeout: n,
			resetTimeoutOnProgress: i,
			onTimeout: r
		});
	}
	_resetTimeout(e) {
		let t = this._timeoutInfo.get(e);
		if (!t) return !1;
		let n = Date.now() - t.startTime;
		if (t.maxTotalTimeout && n >= t.maxTotalTimeout) throw this._timeoutInfo.delete(e), Y.fromError(J.RequestTimeout, "Maximum total timeout exceeded", {
			maxTotalTimeout: t.maxTotalTimeout,
			totalElapsed: n
		});
		return clearTimeout(t.timeoutId), t.timeoutId = setTimeout(t.onTimeout, t.timeout), !0;
	}
	_cleanupTimeout(e) {
		let t = this._timeoutInfo.get(e);
		t && (clearTimeout(t.timeoutId), this._timeoutInfo.delete(e));
	}
	/**
	* Attaches to the given transport, starts it, and starts listening for messages.
	*
	* The Protocol object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
	*/
	async connect(e) {
		var t, n, r;
		if (this._transport) throw Error("Already connected to a transport. Call close() before connecting to a new transport, or use a separate Protocol instance per connection.");
		this._transport = e;
		let i = (t = this.transport) == null ? void 0 : t.onclose;
		this._transport.onclose = () => {
			i == null || i(), this._onclose();
		};
		let a = (n = this.transport) == null ? void 0 : n.onerror;
		this._transport.onerror = (e) => {
			a == null || a(e), this._onerror(e);
		};
		let o = (r = this._transport) == null ? void 0 : r.onmessage;
		this._transport.onmessage = (e, t) => {
			o == null || o(e, t), Xc(e) || Qc(e) ? this._onresponse(e) : Kc(e) ? this._onrequest(e, t) : Jc(e) ? this._onnotification(e) : this._onerror(/* @__PURE__ */ Error(`Unknown message type: ${JSON.stringify(e)}`));
		}, await this._transport.start();
	}
	_onclose() {
		var e;
		let t = this._responseHandlers;
		this._responseHandlers = /* @__PURE__ */ new Map(), this._progressHandlers.clear(), this._taskProgressTokens.clear(), this._pendingDebouncedNotifications.clear();
		for (let e of this._requestHandlerAbortControllers.values()) e.abort();
		this._requestHandlerAbortControllers.clear();
		let n = Y.fromError(J.ConnectionClosed, "Connection closed");
		this._transport = void 0, (e = this.onclose) == null || e.call(this);
		for (let e of t.values()) e(n);
	}
	_onerror(e) {
		var t;
		(t = this.onerror) == null || t.call(this, e);
	}
	_onnotification(e) {
		let t = this._notificationHandlers.get(e.method) ?? this.fallbackNotificationHandler;
		t !== void 0 && Promise.resolve().then(() => t(e)).catch((e) => this._onerror(/* @__PURE__ */ Error(`Uncaught error in notification handler: ${e}`)));
	}
	_onrequest(e, t) {
		var n, r;
		let i = this._requestHandlers.get(e.method) ?? this.fallbackRequestHandler, a = this._transport, o = (n = e.params) == null || (n = n._meta) == null || (n = n["io.modelcontextprotocol/related-task"]) == null ? void 0 : n.taskId;
		if (i === void 0) {
			let t = {
				jsonrpc: "2.0",
				id: e.id,
				error: {
					code: J.MethodNotFound,
					message: "Method not found"
				}
			};
			o && this._taskMessageQueue ? this._enqueueTaskMessage(o, {
				type: "error",
				message: t,
				timestamp: Date.now()
			}, a == null ? void 0 : a.sessionId).catch((e) => this._onerror(/* @__PURE__ */ Error(`Failed to enqueue error response: ${e}`))) : a == null || a.send(t).catch((e) => this._onerror(/* @__PURE__ */ Error(`Failed to send an error response: ${e}`)));
			return;
		}
		let s = new AbortController();
		this._requestHandlerAbortControllers.set(e.id, s);
		let c = Bc(e.params) ? e.params.task : void 0, l = this._taskStore ? this.requestTaskStore(e, a == null ? void 0 : a.sessionId) : void 0, u = {
			signal: s.signal,
			sessionId: a == null ? void 0 : a.sessionId,
			_meta: (r = e.params) == null ? void 0 : r._meta,
			sendNotification: async (t) => {
				if (s.signal.aborted) return;
				let n = { relatedRequestId: e.id };
				o && (n.relatedTask = { taskId: o }), await this.notification(t, n);
			},
			sendRequest: async (t, n, r) => {
				var i;
				if (s.signal.aborted) throw new Y(J.ConnectionClosed, "Request was cancelled");
				let a = {
					...r,
					relatedRequestId: e.id
				};
				o && !a.relatedTask && (a.relatedTask = { taskId: o });
				let c = ((i = a.relatedTask) == null ? void 0 : i.taskId) ?? o;
				return c && l && await l.updateTaskStatus(c, "input_required"), await this.request(t, n, a);
			},
			authInfo: t == null ? void 0 : t.authInfo,
			requestId: e.id,
			requestInfo: t == null ? void 0 : t.requestInfo,
			taskId: o,
			taskStore: l,
			taskRequestedTtl: c == null ? void 0 : c.ttl,
			closeSSEStream: t == null ? void 0 : t.closeSSEStream,
			closeStandaloneSSEStream: t == null ? void 0 : t.closeStandaloneSSEStream
		};
		Promise.resolve().then(() => {
			c && this.assertTaskHandlerCapability(e.method);
		}).then(() => i(e, u)).then(async (t) => {
			if (s.signal.aborted) return;
			let n = {
				result: t,
				jsonrpc: "2.0",
				id: e.id
			};
			o && this._taskMessageQueue ? await this._enqueueTaskMessage(o, {
				type: "response",
				message: n,
				timestamp: Date.now()
			}, a == null ? void 0 : a.sessionId) : await (a == null ? void 0 : a.send(n));
		}, async (t) => {
			if (s.signal.aborted) return;
			let n = {
				jsonrpc: "2.0",
				id: e.id,
				error: {
					code: Number.isSafeInteger(t.code) ? t.code : J.InternalError,
					message: t.message ?? "Internal error",
					...t.data !== void 0 && { data: t.data }
				}
			};
			o && this._taskMessageQueue ? await this._enqueueTaskMessage(o, {
				type: "error",
				message: n,
				timestamp: Date.now()
			}, a == null ? void 0 : a.sessionId) : await (a == null ? void 0 : a.send(n));
		}).catch((e) => this._onerror(/* @__PURE__ */ Error(`Failed to send response: ${e}`))).finally(() => {
			this._requestHandlerAbortControllers.delete(e.id);
		});
	}
	_onprogress(e) {
		let { progressToken: t, ...n } = e.params, r = Number(t), i = this._progressHandlers.get(r);
		if (!i) {
			this._onerror(/* @__PURE__ */ Error(`Received a progress notification for an unknown token: ${JSON.stringify(e)}`));
			return;
		}
		let a = this._responseHandlers.get(r), o = this._timeoutInfo.get(r);
		if (o && a && o.resetTimeoutOnProgress) try {
			this._resetTimeout(r);
		} catch (e) {
			this._responseHandlers.delete(r), this._progressHandlers.delete(r), this._cleanupTimeout(r), a(e);
			return;
		}
		i(n);
	}
	_onresponse(e) {
		let t = Number(e.id), n = this._requestResolvers.get(t);
		if (n) {
			this._requestResolvers.delete(t), Xc(e) ? n(e) : n(new Y(e.error.code, e.error.message, e.error.data));
			return;
		}
		let r = this._responseHandlers.get(t);
		if (r === void 0) {
			this._onerror(/* @__PURE__ */ Error(`Received a response for an unknown message ID: ${JSON.stringify(e)}`));
			return;
		}
		this._responseHandlers.delete(t), this._cleanupTimeout(t);
		let i = !1;
		if (Xc(e) && e.result && typeof e.result == "object") {
			let n = e.result;
			if (n.task && typeof n.task == "object") {
				let e = n.task;
				typeof e.taskId == "string" && (i = !0, this._taskProgressTokens.set(e.taskId, t));
			}
		}
		i || this._progressHandlers.delete(t), Xc(e) ? r(e) : r(Y.fromError(e.error.code, e.error.message, e.error.data));
	}
	get transport() {
		return this._transport;
	}
	/**
	* Closes the connection.
	*/
	async close() {
		var e;
		await ((e = this._transport) == null ? void 0 : e.close());
	}
	/**
	* Sends a request and returns an AsyncGenerator that yields response messages.
	* The generator is guaranteed to end with either a 'result' or 'error' message.
	*
	* @example
	* ```typescript
	* const stream = protocol.requestStream(request, resultSchema, options);
	* for await (const message of stream) {
	*   switch (message.type) {
	*     case 'taskCreated':
	*       console.log('Task created:', message.task.taskId);
	*       break;
	*     case 'taskStatus':
	*       console.log('Task status:', message.task.status);
	*       break;
	*     case 'result':
	*       console.log('Final result:', message.result);
	*       break;
	*     case 'error':
	*       console.error('Error:', message.error);
	*       break;
	*   }
	* }
	* ```
	*
	* @experimental Use `client.experimental.tasks.requestStream()` to access this method.
	*/
	async *requestStream(e, t, n) {
		let { task: r } = n ?? {};
		if (!r) {
			try {
				yield {
					type: "result",
					result: await this.request(e, t, n)
				};
			} catch (e) {
				yield {
					type: "error",
					error: e instanceof Y ? e : new Y(J.InternalError, String(e))
				};
			}
			return;
		}
		let i;
		try {
			let r = await this.request(e, wl, n);
			if (r.task) i = r.task.taskId, yield {
				type: "taskCreated",
				task: r.task
			};
			else throw new Y(J.InternalError, "Task creation did not return a task");
			for (;;) {
				var a, o;
				let e = await this.getTask({ taskId: i }, n);
				if (yield {
					type: "taskStatus",
					task: e
				}, dd(e.status)) {
					e.status === "completed" ? yield {
						type: "result",
						result: await this.getTaskResult({ taskId: i }, t, n)
					} : e.status === "failed" ? yield {
						type: "error",
						error: new Y(J.InternalError, `Task ${i} failed`)
					} : e.status === "cancelled" && (yield {
						type: "error",
						error: new Y(J.InternalError, `Task ${i} was cancelled`)
					});
					return;
				}
				if (e.status === "input_required") {
					yield {
						type: "result",
						result: await this.getTaskResult({ taskId: i }, t, n)
					};
					return;
				}
				let r = e.pollInterval ?? ((a = this._options) == null ? void 0 : a.defaultTaskPollInterval) ?? 1e3;
				await new Promise((e) => setTimeout(e, r)), n == null || (o = n.signal) == null || o.throwIfAborted();
			}
		} catch (e) {
			yield {
				type: "error",
				error: e instanceof Y ? e : new Y(J.InternalError, String(e))
			};
		}
	}
	/**
	* Sends a request and waits for a response.
	*
	* Do not use this method to emit notifications! Use notification() instead.
	*/
	request(e, t, n) {
		let { relatedRequestId: r, resumptionToken: i, onresumptiontoken: a, task: o, relatedTask: s } = n ?? {};
		return new Promise((c, l) => {
			var u, d, f;
			let p = (e) => {
				l(e);
			};
			if (!this._transport) {
				p(/* @__PURE__ */ Error("Not connected"));
				return;
			}
			if (((u = this._options) == null ? void 0 : u.enforceStrictCapabilities) === !0) try {
				this.assertCapabilityForMethod(e.method), o && this.assertTaskCapability(e.method);
			} catch (e) {
				p(e);
				return;
			}
			n == null || (d = n.signal) == null || d.throwIfAborted();
			let m = this._requestMessageId++, h = {
				...e,
				jsonrpc: "2.0",
				id: m
			};
			if (n != null && n.onprogress) {
				var g;
				this._progressHandlers.set(m, n.onprogress), h.params = {
					...e.params,
					_meta: {
						...((g = e.params) == null ? void 0 : g._meta) || {},
						progressToken: m
					}
				};
			}
			if (o && (h.params = {
				...h.params,
				task: o
			}), s) {
				var _;
				h.params = {
					...h.params,
					_meta: {
						...((_ = h.params) == null ? void 0 : _._meta) || {},
						[Mc]: s
					}
				};
			}
			let v = (e) => {
				var t;
				this._responseHandlers.delete(m), this._progressHandlers.delete(m), this._cleanupTimeout(m), (t = this._transport) == null || t.send({
					jsonrpc: "2.0",
					method: "notifications/cancelled",
					params: {
						requestId: m,
						reason: String(e)
					}
				}, {
					relatedRequestId: r,
					resumptionToken: i,
					onresumptiontoken: a
				}).catch((e) => this._onerror(/* @__PURE__ */ Error(`Failed to send cancellation: ${e}`))), l(e instanceof Y ? e : new Y(J.RequestTimeout, String(e)));
			};
			this._responseHandlers.set(m, (e) => {
				var r;
				if (!(!(n == null || (r = n.signal) == null) && r.aborted)) {
					if (e instanceof Error) return l(e);
					try {
						let n = Ho(t, e.result);
						n.success ? c(n.data) : l(n.error);
					} catch (e) {
						l(e);
					}
				}
			}), n == null || (f = n.signal) == null || f.addEventListener("abort", () => {
				var e;
				v(n == null || (e = n.signal) == null ? void 0 : e.reason);
			});
			let ee = (n == null ? void 0 : n.timeout) ?? 6e4;
			this._setupTimeout(m, ee, n == null ? void 0 : n.maxTotalTimeout, () => v(Y.fromError(J.RequestTimeout, "Request timed out", { timeout: ee })), (n == null ? void 0 : n.resetTimeoutOnProgress) ?? !1);
			let te = s == null ? void 0 : s.taskId;
			te ? (this._requestResolvers.set(m, (e) => {
				let t = this._responseHandlers.get(m);
				t ? t(e) : this._onerror(/* @__PURE__ */ Error(`Response handler missing for side-channeled request ${m}`));
			}), this._enqueueTaskMessage(te, {
				type: "request",
				message: h,
				timestamp: Date.now()
			}).catch((e) => {
				this._cleanupTimeout(m), l(e);
			})) : this._transport.send(h, {
				relatedRequestId: r,
				resumptionToken: i,
				onresumptiontoken: a
			}).catch((e) => {
				this._cleanupTimeout(m), l(e);
			});
		});
	}
	/**
	* Gets the current status of a task.
	*
	* @experimental Use `client.experimental.tasks.getTask()` to access this method.
	*/
	async getTask(e, t) {
		return this.request({
			method: "tasks/get",
			params: e
		}, Ol, t);
	}
	/**
	* Retrieves the result of a completed task.
	*
	* @experimental Use `client.experimental.tasks.getTaskResult()` to access this method.
	*/
	async getTaskResult(e, t, n) {
		return this.request({
			method: "tasks/result",
			params: e
		}, t, n);
	}
	/**
	* Lists tasks, optionally starting from a pagination cursor.
	*
	* @experimental Use `client.experimental.tasks.listTasks()` to access this method.
	*/
	async listTasks(e, t) {
		return this.request({
			method: "tasks/list",
			params: e
		}, jl, t);
	}
	/**
	* Cancels a specific task.
	*
	* @experimental Use `client.experimental.tasks.cancelTask()` to access this method.
	*/
	async cancelTask(e, t) {
		return this.request({
			method: "tasks/cancel",
			params: e
		}, Nl, t);
	}
	/**
	* Emits a notification, which is a one-way message that does not expect a response.
	*/
	async notification(e, t) {
		var n, r;
		if (!this._transport) throw Error("Not connected");
		this.assertNotificationCapability(e.method);
		let i = t == null || (n = t.relatedTask) == null ? void 0 : n.taskId;
		if (i) {
			var a;
			let n = {
				...e,
				jsonrpc: "2.0",
				params: {
					...e.params,
					_meta: {
						...((a = e.params) == null ? void 0 : a._meta) || {},
						[Mc]: t.relatedTask
					}
				}
			};
			await this._enqueueTaskMessage(i, {
				type: "notification",
				message: n,
				timestamp: Date.now()
			});
			return;
		}
		if ((((r = this._options) == null ? void 0 : r.debouncedNotificationMethods) ?? []).includes(e.method) && !e.params && !(t != null && t.relatedRequestId) && !(t != null && t.relatedTask)) {
			if (this._pendingDebouncedNotifications.has(e.method)) return;
			this._pendingDebouncedNotifications.add(e.method), Promise.resolve().then(() => {
				var n;
				if (this._pendingDebouncedNotifications.delete(e.method), !this._transport) return;
				let r = {
					...e,
					jsonrpc: "2.0"
				};
				if (t != null && t.relatedTask) {
					var i;
					r = {
						...r,
						params: {
							...r.params,
							_meta: {
								...((i = r.params) == null ? void 0 : i._meta) || {},
								[Mc]: t.relatedTask
							}
						}
					};
				}
				(n = this._transport) == null || n.send(r, t).catch((e) => this._onerror(e));
			});
			return;
		}
		let o = {
			...e,
			jsonrpc: "2.0"
		};
		if (t != null && t.relatedTask) {
			var s;
			o = {
				...o,
				params: {
					...o.params,
					_meta: {
						...((s = o.params) == null ? void 0 : s._meta) || {},
						[Mc]: t.relatedTask
					}
				}
			};
		}
		await this._transport.send(o, t);
	}
	/**
	* Registers a handler to invoke when this protocol object receives a request with the given method.
	*
	* Note that this will replace any previous request handler for the same method.
	*/
	setRequestHandler(e, t) {
		let n = hf(e);
		this.assertRequestHandlerCapability(n), this._requestHandlers.set(n, (n, r) => {
			let i = gf(e, n);
			return Promise.resolve(t(i, r));
		});
	}
	/**
	* Removes the request handler for the given method.
	*/
	removeRequestHandler(e) {
		this._requestHandlers.delete(e);
	}
	/**
	* Asserts that a request handler has not already been set for the given method, in preparation for a new one being automatically installed.
	*/
	assertCanSetRequestHandler(e) {
		if (this._requestHandlers.has(e)) throw Error(`A request handler for ${e} already exists, which would be overridden`);
	}
	/**
	* Registers a handler to invoke when this protocol object receives a notification with the given method.
	*
	* Note that this will replace any previous notification handler for the same method.
	*/
	setNotificationHandler(e, t) {
		let n = hf(e);
		this._notificationHandlers.set(n, (n) => {
			let r = gf(e, n);
			return Promise.resolve(t(r));
		});
	}
	/**
	* Removes the notification handler for the given method.
	*/
	removeNotificationHandler(e) {
		this._notificationHandlers.delete(e);
	}
	/**
	* Cleans up the progress handler associated with a task.
	* This should be called when a task reaches a terminal status.
	*/
	_cleanupTaskProgressHandler(e) {
		let t = this._taskProgressTokens.get(e);
		t !== void 0 && (this._progressHandlers.delete(t), this._taskProgressTokens.delete(e));
	}
	/**
	* Enqueues a task-related message for side-channel delivery via tasks/result.
	* @param taskId The task ID to associate the message with
	* @param message The message to enqueue
	* @param sessionId Optional session ID for binding the operation to a specific session
	* @throws Error if taskStore is not configured or if enqueue fails (e.g., queue overflow)
	*
	* Note: If enqueue fails, it's the TaskMessageQueue implementation's responsibility to handle
	* the error appropriately (e.g., by failing the task, logging, etc.). The Protocol layer
	* simply propagates the error.
	*/
	async _enqueueTaskMessage(e, t, n) {
		var r;
		if (!this._taskStore || !this._taskMessageQueue) throw Error("Cannot enqueue task message: taskStore and taskMessageQueue are not configured");
		let i = (r = this._options) == null ? void 0 : r.maxTaskQueueSize;
		await this._taskMessageQueue.enqueue(e, t, n, i);
	}
	/**
	* Clears the message queue for a task and rejects any pending request resolvers.
	* @param taskId The task ID whose queue should be cleared
	* @param sessionId Optional session ID for binding the operation to a specific session
	*/
	async _clearTaskQueue(e, t) {
		if (this._taskMessageQueue) {
			let n = await this._taskMessageQueue.dequeueAll(e, t);
			for (let t of n) if (t.type === "request" && Kc(t.message)) {
				let n = t.message.id, r = this._requestResolvers.get(n);
				r ? (r(new Y(J.InternalError, "Task cancelled or completed")), this._requestResolvers.delete(n)) : this._onerror(/* @__PURE__ */ Error(`Resolver missing for request ${n} during task ${e} cleanup`));
			}
		}
	}
	/**
	* Waits for a task update (new messages or status change) with abort signal support.
	* Uses polling to check for updates at the task's configured poll interval.
	* @param taskId The task ID to wait for
	* @param signal Abort signal to cancel the wait
	* @returns Promise that resolves when an update occurs or rejects if aborted
	*/
	async _waitForTaskUpdate(e, t) {
		var n;
		let r = ((n = this._options) == null ? void 0 : n.defaultTaskPollInterval) ?? 1e3;
		try {
			var i;
			let t = await ((i = this._taskStore) == null ? void 0 : i.getTask(e));
			t != null && t.pollInterval && (r = t.pollInterval);
		} catch {}
		return new Promise((e, n) => {
			if (t.aborted) {
				n(new Y(J.InvalidRequest, "Request cancelled"));
				return;
			}
			let i = setTimeout(e, r);
			t.addEventListener("abort", () => {
				clearTimeout(i), n(new Y(J.InvalidRequest, "Request cancelled"));
			}, { once: !0 });
		});
	}
	requestTaskStore(e, t) {
		let n = this._taskStore;
		if (!n) throw Error("No task store configured");
		return {
			createTask: async (r) => {
				if (!e) throw Error("No request provided");
				return await n.createTask(r, e.id, {
					method: e.method,
					params: e.params
				}, t);
			},
			getTask: async (e) => {
				let r = await n.getTask(e, t);
				if (!r) throw new Y(J.InvalidParams, "Failed to retrieve task: Task not found");
				return r;
			},
			storeTaskResult: async (e, r, i) => {
				await n.storeTaskResult(e, r, i, t);
				let a = await n.getTask(e, t);
				if (a) {
					let t = El.parse({
						method: "notifications/tasks/status",
						params: a
					});
					await this.notification(t), dd(a.status) && this._cleanupTaskProgressHandler(e);
				}
			},
			getTaskResult: (e) => n.getTaskResult(e, t),
			updateTaskStatus: async (e, r, i) => {
				let a = await n.getTask(e, t);
				if (!a) throw new Y(J.InvalidParams, `Task "${e}" not found - it may have been cleaned up`);
				if (dd(a.status)) throw new Y(J.InvalidParams, `Cannot update task "${e}" from terminal status "${a.status}" to "${r}". Terminal states (completed, failed, cancelled) cannot transition to other states.`);
				await n.updateTaskStatus(e, r, i, t);
				let o = await n.getTask(e, t);
				if (o) {
					let t = El.parse({
						method: "notifications/tasks/status",
						params: o
					});
					await this.notification(t), dd(o.status) && this._cleanupTaskProgressHandler(e);
				}
			},
			listTasks: (e) => n.listTasks(e, t)
		};
	}
};
function vf(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function yf(e, t) {
	let n = { ...e };
	for (let e in t) {
		let r = e, i = t[r];
		if (i === void 0) continue;
		let a = n[r];
		vf(a) && vf(i) ? n[r] = {
			...a,
			...i
		} : n[r] = i;
	}
	return n;
}
var bf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
	var t = class {};
	e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
	var n = class extends t {
		constructor(t) {
			if (super(), !e.IDENTIFIER.test(t)) throw Error("CodeGen: name must be a valid identifier");
			this.str = t;
		}
		toString() {
			return this.str;
		}
		emptyStr() {
			return !1;
		}
		get names() {
			return { [this.str]: 1 };
		}
	};
	e.Name = n;
	var r = class extends t {
		constructor(e) {
			super(), this._items = typeof e == "string" ? [e] : e;
		}
		toString() {
			return this.str;
		}
		emptyStr() {
			if (this._items.length > 1) return !1;
			let e = this._items[0];
			return e === "" || e === "\"\"";
		}
		get str() {
			return this._str ??= this._items.reduce((e, t) => `${e}${t}`, "");
		}
		get names() {
			return this._names ??= this._items.reduce((e, t) => (t instanceof n && (e[t.str] = (e[t.str] || 0) + 1), e), {});
		}
	};
	e._Code = r, e.nil = new r("");
	function i(e, ...t) {
		let n = [e[0]], i = 0;
		for (; i < t.length;) s(n, t[i]), n.push(e[++i]);
		return new r(n);
	}
	e._ = i;
	var a = new r("+");
	function o(e, ...t) {
		let n = [p(e[0])], i = 0;
		for (; i < t.length;) n.push(a), s(n, t[i]), n.push(a, p(e[++i]));
		return c(n), new r(n);
	}
	e.str = o;
	function s(e, t) {
		t instanceof r ? e.push(...t._items) : t instanceof n ? e.push(t) : e.push(d(t));
	}
	e.addCodeArg = s;
	function c(e) {
		let t = 1;
		for (; t < e.length - 1;) {
			if (e[t] === a) {
				let n = l(e[t - 1], e[t + 1]);
				if (n !== void 0) {
					e.splice(t - 1, 3, n);
					continue;
				}
				e[t++] = "+";
			}
			t++;
		}
	}
	function l(e, t) {
		if (t === "\"\"") return e;
		if (e === "\"\"") return t;
		if (typeof e == "string") return t instanceof n || e[e.length - 1] !== "\"" ? void 0 : typeof t == "string" ? t[0] === "\"" ? e.slice(0, -1) + t.slice(1) : void 0 : `${e.slice(0, -1)}${t}"`;
		if (typeof t == "string" && t[0] === "\"" && !(e instanceof n)) return `"${e}${t.slice(1)}`;
	}
	function u(e, t) {
		return t.emptyStr() ? e : e.emptyStr() ? t : o`${e}${t}`;
	}
	e.strConcat = u;
	function d(e) {
		return typeof e == "number" || typeof e == "boolean" || e === null ? e : p(Array.isArray(e) ? e.join(",") : e);
	}
	function f(e) {
		return new r(p(e));
	}
	e.stringify = f;
	function p(e) {
		return JSON.stringify(e).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
	}
	e.safeStringify = p;
	function m(t) {
		return typeof t == "string" && e.IDENTIFIER.test(t) ? new r(`.${t}`) : i`[${t}]`;
	}
	e.getProperty = m;
	function h(t) {
		if (typeof t == "string" && e.IDENTIFIER.test(t)) return new r(`${t}`);
		throw Error(`CodeGen: invalid export name: ${t}, use explicit $id name mapping`);
	}
	e.getEsmExportName = h;
	function g(e) {
		return new r(e.toString());
	}
	e.regexpCode = g;
})), xf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
	var t = bf(), n = class extends Error {
		constructor(e) {
			super(`CodeGen: "code" for ${e} not defined`), this.value = e.value;
		}
	}, r;
	(function(e) {
		e[e.Started = 0] = "Started", e[e.Completed = 1] = "Completed";
	})(r || (e.UsedValueState = r = {})), e.varKinds = {
		const: new t.Name("const"),
		let: new t.Name("let"),
		var: new t.Name("var")
	};
	var i = class {
		constructor({ prefixes: e, parent: t } = {}) {
			this._names = {}, this._prefixes = e, this._parent = t;
		}
		toName(e) {
			return e instanceof t.Name ? e : this.name(e);
		}
		name(e) {
			return new t.Name(this._newName(e));
		}
		_newName(e) {
			let t = this._names[e] || this._nameGroup(e);
			return `${e}${t.index++}`;
		}
		_nameGroup(e) {
			var t, n;
			if ((n = (t = this._parent) == null ? void 0 : t._prefixes) != null && n.has(e) || this._prefixes && !this._prefixes.has(e)) throw Error(`CodeGen: prefix "${e}" is not allowed in this scope`);
			return this._names[e] = {
				prefix: e,
				index: 0
			};
		}
	};
	e.Scope = i;
	var a = class extends t.Name {
		constructor(e, t) {
			super(t), this.prefix = e;
		}
		setValue(e, { property: n, itemIndex: r }) {
			this.value = e, this.scopePath = (0, t._)`.${new t.Name(n)}[${r}]`;
		}
	};
	e.ValueScopeName = a;
	var o = (0, t._)`\n`;
	e.ValueScope = class extends i {
		constructor(e) {
			super(e), this._values = {}, this._scope = e.scope, this.opts = {
				...e,
				_n: e.lines ? o : t.nil
			};
		}
		get() {
			return this._scope;
		}
		name(e) {
			return new a(e, this._newName(e));
		}
		value(e, t) {
			if (t.ref === void 0) throw Error("CodeGen: ref must be passed in value");
			let n = this.toName(e), { prefix: r } = n, i = t.key ?? t.ref, a = this._values[r];
			if (a) {
				let e = a.get(i);
				if (e) return e;
			} else a = this._values[r] = /* @__PURE__ */ new Map();
			a.set(i, n);
			let o = this._scope[r] || (this._scope[r] = []), s = o.length;
			return o[s] = t.ref, n.setValue(t, {
				property: r,
				itemIndex: s
			}), n;
		}
		getValue(e, t) {
			let n = this._values[e];
			if (n) return n.get(t);
		}
		scopeRefs(e, n = this._values) {
			return this._reduceValues(n, (n) => {
				if (n.scopePath === void 0) throw Error(`CodeGen: name "${n}" has no value`);
				return (0, t._)`${e}${n.scopePath}`;
			});
		}
		scopeCode(e = this._values, t, n) {
			return this._reduceValues(e, (e) => {
				if (e.value === void 0) throw Error(`CodeGen: name "${e}" has no value`);
				return e.value.code;
			}, t, n);
		}
		_reduceValues(i, a, o = {}, s) {
			let c = t.nil;
			for (let l in i) {
				let u = i[l];
				if (!u) continue;
				let d = o[l] = o[l] || /* @__PURE__ */ new Map();
				u.forEach((i) => {
					if (d.has(i)) return;
					d.set(i, r.Started);
					let o = a(i);
					if (o) {
						let n = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
						c = (0, t._)`${c}${n} ${i} = ${o};${this.opts._n}`;
					} else if (o = s == null ? void 0 : s(i)) c = (0, t._)`${c}${o}${this.opts._n}`;
					else throw new n(i);
					d.set(i, r.Completed);
				});
			}
			return c;
		}
	};
})), Q = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
	var t = bf(), n = xf(), r = bf();
	Object.defineProperty(e, "_", {
		enumerable: !0,
		get: function() {
			return r._;
		}
	}), Object.defineProperty(e, "str", {
		enumerable: !0,
		get: function() {
			return r.str;
		}
	}), Object.defineProperty(e, "strConcat", {
		enumerable: !0,
		get: function() {
			return r.strConcat;
		}
	}), Object.defineProperty(e, "nil", {
		enumerable: !0,
		get: function() {
			return r.nil;
		}
	}), Object.defineProperty(e, "getProperty", {
		enumerable: !0,
		get: function() {
			return r.getProperty;
		}
	}), Object.defineProperty(e, "stringify", {
		enumerable: !0,
		get: function() {
			return r.stringify;
		}
	}), Object.defineProperty(e, "regexpCode", {
		enumerable: !0,
		get: function() {
			return r.regexpCode;
		}
	}), Object.defineProperty(e, "Name", {
		enumerable: !0,
		get: function() {
			return r.Name;
		}
	});
	var i = xf();
	Object.defineProperty(e, "Scope", {
		enumerable: !0,
		get: function() {
			return i.Scope;
		}
	}), Object.defineProperty(e, "ValueScope", {
		enumerable: !0,
		get: function() {
			return i.ValueScope;
		}
	}), Object.defineProperty(e, "ValueScopeName", {
		enumerable: !0,
		get: function() {
			return i.ValueScopeName;
		}
	}), Object.defineProperty(e, "varKinds", {
		enumerable: !0,
		get: function() {
			return i.varKinds;
		}
	}), e.operators = {
		GT: new t._Code(">"),
		GTE: new t._Code(">="),
		LT: new t._Code("<"),
		LTE: new t._Code("<="),
		EQ: new t._Code("==="),
		NEQ: new t._Code("!=="),
		NOT: new t._Code("!"),
		OR: new t._Code("||"),
		AND: new t._Code("&&"),
		ADD: new t._Code("+")
	};
	var a = class {
		optimizeNodes() {
			return this;
		}
		optimizeNames(e, t) {
			return this;
		}
	}, o = class extends a {
		constructor(e, t, n) {
			super(), this.varKind = e, this.name = t, this.rhs = n;
		}
		render({ es5: e, _n: t }) {
			let r = e ? n.varKinds.var : this.varKind, i = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
			return `${r} ${this.name}${i};` + t;
		}
		optimizeNames(e, t) {
			if (e[this.name.str]) return this.rhs &&= ae(this.rhs, e, t), this;
		}
		get names() {
			return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
		}
	}, s = class extends a {
		constructor(e, t, n) {
			super(), this.lhs = e, this.rhs = t, this.sideEffects = n;
		}
		render({ _n: e }) {
			return `${this.lhs} = ${this.rhs};` + e;
		}
		optimizeNames(e, n) {
			if (!(this.lhs instanceof t.Name && !e[this.lhs.str] && !this.sideEffects)) return this.rhs = ae(this.rhs, e, n), this;
		}
		get names() {
			return ie(this.lhs instanceof t.Name ? {} : { ...this.lhs.names }, this.rhs);
		}
	}, c = class extends s {
		constructor(e, t, n, r) {
			super(e, n, r), this.op = t;
		}
		render({ _n: e }) {
			return `${this.lhs} ${this.op}= ${this.rhs};` + e;
		}
	}, l = class extends a {
		constructor(e) {
			super(), this.label = e, this.names = {};
		}
		render({ _n: e }) {
			return `${this.label}:` + e;
		}
	}, u = class extends a {
		constructor(e) {
			super(), this.label = e, this.names = {};
		}
		render({ _n: e }) {
			return `break${this.label ? ` ${this.label}` : ""};` + e;
		}
	}, d = class extends a {
		constructor(e) {
			super(), this.error = e;
		}
		render({ _n: e }) {
			return `throw ${this.error};` + e;
		}
		get names() {
			return this.error.names;
		}
	}, f = class extends a {
		constructor(e) {
			super(), this.code = e;
		}
		render({ _n: e }) {
			return `${this.code};` + e;
		}
		optimizeNodes() {
			return `${this.code}` ? this : void 0;
		}
		optimizeNames(e, t) {
			return this.code = ae(this.code, e, t), this;
		}
		get names() {
			return this.code instanceof t._CodeOrName ? this.code.names : {};
		}
	}, p = class extends a {
		constructor(e = []) {
			super(), this.nodes = e;
		}
		render(e) {
			return this.nodes.reduce((t, n) => t + n.render(e), "");
		}
		optimizeNodes() {
			let { nodes: e } = this, t = e.length;
			for (; t--;) {
				let n = e[t].optimizeNodes();
				Array.isArray(n) ? e.splice(t, 1, ...n) : n ? e[t] = n : e.splice(t, 1);
			}
			return e.length > 0 ? this : void 0;
		}
		optimizeNames(e, t) {
			let { nodes: n } = this, r = n.length;
			for (; r--;) {
				let i = n[r];
				i.optimizeNames(e, t) || (oe(e, i.names), n.splice(r, 1));
			}
			return n.length > 0 ? this : void 0;
		}
		get names() {
			return this.nodes.reduce((e, t) => re(e, t.names), {});
		}
	}, m = class extends p {
		render(e) {
			return "{" + e._n + super.render(e) + "}" + e._n;
		}
	}, h = class extends p {}, g = class extends m {};
	g.kind = "else";
	var _ = class e extends m {
		constructor(e, t) {
			super(t), this.condition = e;
		}
		render(e) {
			let t = `if(${this.condition})` + super.render(e);
			return this.else && (t += "else " + this.else.render(e)), t;
		}
		optimizeNodes() {
			super.optimizeNodes();
			let t = this.condition;
			if (t === !0) return this.nodes;
			let n = this.else;
			if (n) {
				let e = n.optimizeNodes();
				n = this.else = Array.isArray(e) ? new g(e) : e;
			}
			if (n) return t === !1 ? n instanceof e ? n : n.nodes : this.nodes.length ? this : new e(w(t), n instanceof e ? [n] : n.nodes);
			if (!(t === !1 || !this.nodes.length)) return this;
		}
		optimizeNames(e, t) {
			var n;
			if (this.else = (n = this.else) == null ? void 0 : n.optimizeNames(e, t), super.optimizeNames(e, t) || this.else) return this.condition = ae(this.condition, e, t), this;
		}
		get names() {
			let e = super.names;
			return ie(e, this.condition), this.else && re(e, this.else.names), e;
		}
	};
	_.kind = "if";
	var v = class extends m {};
	v.kind = "for";
	var ee = class extends v {
		constructor(e) {
			super(), this.iteration = e;
		}
		render(e) {
			return `for(${this.iteration})` + super.render(e);
		}
		optimizeNames(e, t) {
			if (super.optimizeNames(e, t)) return this.iteration = ae(this.iteration, e, t), this;
		}
		get names() {
			return re(super.names, this.iteration.names);
		}
	}, te = class extends v {
		constructor(e, t, n, r) {
			super(), this.varKind = e, this.name = t, this.from = n, this.to = r;
		}
		render(e) {
			let t = e.es5 ? n.varKinds.var : this.varKind, { name: r, from: i, to: a } = this;
			return `for(${t} ${r}=${i}; ${r}<${a}; ${r}++)` + super.render(e);
		}
		get names() {
			return ie(ie(super.names, this.from), this.to);
		}
	}, y = class extends v {
		constructor(e, t, n, r) {
			super(), this.loop = e, this.varKind = t, this.name = n, this.iterable = r;
		}
		render(e) {
			return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(e);
		}
		optimizeNames(e, t) {
			if (super.optimizeNames(e, t)) return this.iterable = ae(this.iterable, e, t), this;
		}
		get names() {
			return re(super.names, this.iterable.names);
		}
	}, b = class extends m {
		constructor(e, t, n) {
			super(), this.name = e, this.args = t, this.async = n;
		}
		render(e) {
			return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(e);
		}
	};
	b.kind = "func";
	var x = class extends p {
		render(e) {
			return "return " + super.render(e);
		}
	};
	x.kind = "return";
	var S = class extends m {
		render(e) {
			let t = "try" + super.render(e);
			return this.catch && (t += this.catch.render(e)), this.finally && (t += this.finally.render(e)), t;
		}
		optimizeNodes() {
			var e, t;
			return super.optimizeNodes(), (e = this.catch) == null || e.optimizeNodes(), (t = this.finally) == null || t.optimizeNodes(), this;
		}
		optimizeNames(e, t) {
			var n, r;
			return super.optimizeNames(e, t), (n = this.catch) == null || n.optimizeNames(e, t), (r = this.finally) == null || r.optimizeNames(e, t), this;
		}
		get names() {
			let e = super.names;
			return this.catch && re(e, this.catch.names), this.finally && re(e, this.finally.names), e;
		}
	}, ne = class extends m {
		constructor(e) {
			super(), this.error = e;
		}
		render(e) {
			return `catch(${this.error})` + super.render(e);
		}
	};
	ne.kind = "catch";
	var C = class extends m {
		render(e) {
			return "finally" + super.render(e);
		}
	};
	C.kind = "finally", e.CodeGen = class {
		constructor(e, t = {}) {
			this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = {
				...t,
				_n: t.lines ? "\n" : ""
			}, this._extScope = e, this._scope = new n.Scope({ parent: e }), this._nodes = [new h()];
		}
		toString() {
			return this._root.render(this.opts);
		}
		name(e) {
			return this._scope.name(e);
		}
		scopeName(e) {
			return this._extScope.name(e);
		}
		scopeValue(e, t) {
			let n = this._extScope.value(e, t);
			return (this._values[n.prefix] || (this._values[n.prefix] = /* @__PURE__ */ new Set())).add(n), n;
		}
		getScopeValue(e, t) {
			return this._extScope.getValue(e, t);
		}
		scopeRefs(e) {
			return this._extScope.scopeRefs(e, this._values);
		}
		scopeCode() {
			return this._extScope.scopeCode(this._values);
		}
		_def(e, t, n, r) {
			let i = this._scope.toName(t);
			return n !== void 0 && r && (this._constants[i.str] = n), this._leafNode(new o(e, i, n)), i;
		}
		const(e, t, r) {
			return this._def(n.varKinds.const, e, t, r);
		}
		let(e, t, r) {
			return this._def(n.varKinds.let, e, t, r);
		}
		var(e, t, r) {
			return this._def(n.varKinds.var, e, t, r);
		}
		assign(e, t, n) {
			return this._leafNode(new s(e, t, n));
		}
		add(t, n) {
			return this._leafNode(new c(t, e.operators.ADD, n));
		}
		code(e) {
			return typeof e == "function" ? e() : e !== t.nil && this._leafNode(new f(e)), this;
		}
		object(...e) {
			let n = ["{"];
			for (let [r, i] of e) n.length > 1 && n.push(","), n.push(r), (r !== i || this.opts.es5) && (n.push(":"), (0, t.addCodeArg)(n, i));
			return n.push("}"), new t._Code(n);
		}
		if(e, t, n) {
			if (this._blockNode(new _(e)), t && n) this.code(t).else().code(n).endIf();
			else if (t) this.code(t).endIf();
			else if (n) throw Error("CodeGen: \"else\" body without \"then\" body");
			return this;
		}
		elseIf(e) {
			return this._elseNode(new _(e));
		}
		else() {
			return this._elseNode(new g());
		}
		endIf() {
			return this._endBlockNode(_, g);
		}
		_for(e, t) {
			return this._blockNode(e), t && this.code(t).endFor(), this;
		}
		for(e, t) {
			return this._for(new ee(e), t);
		}
		forRange(e, t, r, i, a = this.opts.es5 ? n.varKinds.var : n.varKinds.let) {
			let o = this._scope.toName(e);
			return this._for(new te(a, o, t, r), () => i(o));
		}
		forOf(e, r, i, a = n.varKinds.const) {
			let o = this._scope.toName(e);
			if (this.opts.es5) {
				let e = r instanceof t.Name ? r : this.var("_arr", r);
				return this.forRange("_i", 0, (0, t._)`${e}.length`, (n) => {
					this.var(o, (0, t._)`${e}[${n}]`), i(o);
				});
			}
			return this._for(new y("of", a, o, r), () => i(o));
		}
		forIn(e, r, i, a = this.opts.es5 ? n.varKinds.var : n.varKinds.const) {
			if (this.opts.ownProperties) return this.forOf(e, (0, t._)`Object.keys(${r})`, i);
			let o = this._scope.toName(e);
			return this._for(new y("in", a, o, r), () => i(o));
		}
		endFor() {
			return this._endBlockNode(v);
		}
		label(e) {
			return this._leafNode(new l(e));
		}
		break(e) {
			return this._leafNode(new u(e));
		}
		return(e) {
			let t = new x();
			if (this._blockNode(t), this.code(e), t.nodes.length !== 1) throw Error("CodeGen: \"return\" should have one node");
			return this._endBlockNode(x);
		}
		try(e, t, n) {
			if (!t && !n) throw Error("CodeGen: \"try\" without \"catch\" and \"finally\"");
			let r = new S();
			if (this._blockNode(r), this.code(e), t) {
				let e = this.name("e");
				this._currNode = r.catch = new ne(e), t(e);
			}
			return n && (this._currNode = r.finally = new C(), this.code(n)), this._endBlockNode(ne, C);
		}
		throw(e) {
			return this._leafNode(new d(e));
		}
		block(e, t) {
			return this._blockStarts.push(this._nodes.length), e && this.code(e).endBlock(t), this;
		}
		endBlock(e) {
			let t = this._blockStarts.pop();
			if (t === void 0) throw Error("CodeGen: not in self-balancing block");
			let n = this._nodes.length - t;
			if (n < 0 || e !== void 0 && n !== e) throw Error(`CodeGen: wrong number of nodes: ${n} vs ${e} expected`);
			return this._nodes.length = t, this;
		}
		func(e, n = t.nil, r, i) {
			return this._blockNode(new b(e, n, r)), i && this.code(i).endFunc(), this;
		}
		endFunc() {
			return this._endBlockNode(b);
		}
		optimize(e = 1) {
			for (; e-- > 0;) this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
		}
		_leafNode(e) {
			return this._currNode.nodes.push(e), this;
		}
		_blockNode(e) {
			this._currNode.nodes.push(e), this._nodes.push(e);
		}
		_endBlockNode(e, t) {
			let n = this._currNode;
			if (n instanceof e || t && n instanceof t) return this._nodes.pop(), this;
			throw Error(`CodeGen: not in block "${t ? `${e.kind}/${t.kind}` : e.kind}"`);
		}
		_elseNode(e) {
			let t = this._currNode;
			if (!(t instanceof _)) throw Error("CodeGen: \"else\" without \"if\"");
			return this._currNode = t.else = e, this;
		}
		get _root() {
			return this._nodes[0];
		}
		get _currNode() {
			let e = this._nodes;
			return e[e.length - 1];
		}
		set _currNode(e) {
			let t = this._nodes;
			t[t.length - 1] = e;
		}
	};
	function re(e, t) {
		for (let n in t) e[n] = (e[n] || 0) + (t[n] || 0);
		return e;
	}
	function ie(e, n) {
		return n instanceof t._CodeOrName ? re(e, n.names) : e;
	}
	function ae(e, n, r) {
		if (e instanceof t.Name) return i(e);
		if (!a(e)) return e;
		return new t._Code(e._items.reduce((e, n) => (n instanceof t.Name && (n = i(n)), n instanceof t._Code ? e.push(...n._items) : e.push(n), e), []));
		function i(e) {
			let t = r[e.str];
			return t === void 0 || n[e.str] !== 1 ? e : (delete n[e.str], t);
		}
		function a(e) {
			return e instanceof t._Code && e._items.some((e) => e instanceof t.Name && n[e.str] === 1 && r[e.str] !== void 0);
		}
	}
	function oe(e, t) {
		for (let n in t) e[n] = (e[n] || 0) - (t[n] || 0);
	}
	function w(e) {
		return typeof e == "boolean" || typeof e == "number" || e === null ? !e : (0, t._)`!${ue(e)}`;
	}
	e.not = w;
	var se = le(e.operators.AND);
	function ce(...e) {
		return e.reduce(se);
	}
	e.and = ce;
	var T = le(e.operators.OR);
	function E(...e) {
		return e.reduce(T);
	}
	e.or = E;
	function le(e) {
		return (n, r) => n === t.nil ? r : r === t.nil ? n : (0, t._)`${ue(n)} ${e} ${ue(r)}`;
	}
	function ue(e) {
		return e instanceof t.Name ? e : (0, t._)`(${e})`;
	}
})), $ = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.checkStrictMode = e.getErrorPath = e.Type = e.useFunc = e.setEvaluated = e.evaluatedPropsToName = e.mergeEvaluated = e.eachItem = e.unescapeJsonPointer = e.escapeJsonPointer = e.escapeFragment = e.unescapeFragment = e.schemaRefOrVal = e.schemaHasRulesButRef = e.schemaHasRules = e.checkUnknownRules = e.alwaysValidSchema = e.toHash = void 0;
	var t = Q(), n = bf();
	function r(e) {
		let t = {};
		for (let n of e) t[n] = !0;
		return t;
	}
	e.toHash = r;
	function i(e, t) {
		return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (a(e, t), !o(t, e.self.RULES.all));
	}
	e.alwaysValidSchema = i;
	function a(e, t = e.schema) {
		let { opts: n, self: r } = e;
		if (!n.strictSchema || typeof t == "boolean") return;
		let i = r.RULES.keywords;
		for (let n in t) i[n] || y(e, `unknown keyword: "${n}"`);
	}
	e.checkUnknownRules = a;
	function o(e, t) {
		if (typeof e == "boolean") return !e;
		for (let n in e) if (t[n]) return !0;
		return !1;
	}
	e.schemaHasRules = o;
	function s(e, t) {
		if (typeof e == "boolean") return !e;
		for (let n in e) if (n !== "$ref" && t.all[n]) return !0;
		return !1;
	}
	e.schemaHasRulesButRef = s;
	function c({ topSchemaRef: e, schemaPath: n }, r, i, a) {
		if (!a) {
			if (typeof r == "number" || typeof r == "boolean") return r;
			if (typeof r == "string") return (0, t._)`${r}`;
		}
		return (0, t._)`${e}${n}${(0, t.getProperty)(i)}`;
	}
	e.schemaRefOrVal = c;
	function l(e) {
		return f(decodeURIComponent(e));
	}
	e.unescapeFragment = l;
	function u(e) {
		return encodeURIComponent(d(e));
	}
	e.escapeFragment = u;
	function d(e) {
		return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
	}
	e.escapeJsonPointer = d;
	function f(e) {
		return e.replace(/~1/g, "/").replace(/~0/g, "~");
	}
	e.unescapeJsonPointer = f;
	function p(e, t) {
		if (Array.isArray(e)) for (let n of e) t(n);
		else t(e);
	}
	e.eachItem = p;
	function m({ mergeNames: e, mergeToName: n, mergeValues: r, resultToName: i }) {
		return (a, o, s, c) => {
			let l = s === void 0 ? o : s instanceof t.Name ? (o instanceof t.Name ? e(a, o, s) : n(a, o, s), s) : o instanceof t.Name ? (n(a, s, o), o) : r(o, s);
			return c === t.Name && !(l instanceof t.Name) ? i(a, l) : l;
		};
	}
	e.mergeEvaluated = {
		props: m({
			mergeNames: (e, n, r) => e.if((0, t._)`${r} !== true && ${n} !== undefined`, () => {
				e.if((0, t._)`${n} === true`, () => e.assign(r, !0), () => e.assign(r, (0, t._)`${r} || {}`).code((0, t._)`Object.assign(${r}, ${n})`));
			}),
			mergeToName: (e, n, r) => e.if((0, t._)`${r} !== true`, () => {
				n === !0 ? e.assign(r, !0) : (e.assign(r, (0, t._)`${r} || {}`), g(e, r, n));
			}),
			mergeValues: (e, t) => e === !0 ? !0 : {
				...e,
				...t
			},
			resultToName: h
		}),
		items: m({
			mergeNames: (e, n, r) => e.if((0, t._)`${r} !== true && ${n} !== undefined`, () => e.assign(r, (0, t._)`${n} === true ? true : ${r} > ${n} ? ${r} : ${n}`)),
			mergeToName: (e, n, r) => e.if((0, t._)`${r} !== true`, () => e.assign(r, n === !0 ? !0 : (0, t._)`${r} > ${n} ? ${r} : ${n}`)),
			mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
			resultToName: (e, t) => e.var("items", t)
		})
	};
	function h(e, n) {
		if (n === !0) return e.var("props", !0);
		let r = e.var("props", (0, t._)`{}`);
		return n !== void 0 && g(e, r, n), r;
	}
	e.evaluatedPropsToName = h;
	function g(e, n, r) {
		Object.keys(r).forEach((r) => e.assign((0, t._)`${n}${(0, t.getProperty)(r)}`, !0));
	}
	e.setEvaluated = g;
	var _ = {};
	function v(e, t) {
		return e.scopeValue("func", {
			ref: t,
			code: _[t.code] || (_[t.code] = new n._Code(t.code))
		});
	}
	e.useFunc = v;
	var ee;
	(function(e) {
		e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
	})(ee || (e.Type = ee = {}));
	function te(e, n, r) {
		if (e instanceof t.Name) {
			let i = n === ee.Num;
			return r ? i ? (0, t._)`"[" + ${e} + "]"` : (0, t._)`"['" + ${e} + "']"` : i ? (0, t._)`"/" + ${e}` : (0, t._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
		}
		return r ? (0, t.getProperty)(e).toString() : "/" + d(e);
	}
	e.getErrorPath = te;
	function y(e, t, n = e.opts.strictSchema) {
		if (n) {
			if (t = `strict mode: ${t}`, n === !0) throw Error(t);
			e.self.logger.warn(t);
		}
	}
	e.checkStrictMode = y;
})), Sf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q();
	e.default = {
		data: new t.Name("data"),
		valCxt: new t.Name("valCxt"),
		instancePath: new t.Name("instancePath"),
		parentData: new t.Name("parentData"),
		parentDataProperty: new t.Name("parentDataProperty"),
		rootData: new t.Name("rootData"),
		dynamicAnchors: new t.Name("dynamicAnchors"),
		vErrors: new t.Name("vErrors"),
		errors: new t.Name("errors"),
		this: new t.Name("this"),
		self: new t.Name("self"),
		scope: new t.Name("scope"),
		json: new t.Name("json"),
		jsonPos: new t.Name("jsonPos"),
		jsonLen: new t.Name("jsonLen"),
		jsonPart: new t.Name("jsonPart")
	};
})), Cf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
	var t = Q(), n = $(), r = Sf();
	e.keywordError = { message: ({ keyword: e }) => (0, t.str)`must pass "${e}" keyword validation` }, e.keyword$DataError = { message: ({ keyword: e, schemaType: n }) => n ? (0, t.str)`"${e}" keyword must be ${n} ($data)` : (0, t.str)`"${e}" keyword is invalid ($data)` };
	function i(n, r = e.keywordError, i, a) {
		let { it: o } = n, { gen: s, compositeRule: u, allErrors: f } = o, p = d(n, r, i);
		a ?? (u || f) ? c(s, p) : l(o, (0, t._)`[${p}]`);
	}
	e.reportError = i;
	function a(t, n = e.keywordError, i) {
		let { it: a } = t, { gen: o, compositeRule: s, allErrors: u } = a;
		c(o, d(t, n, i)), s || u || l(a, r.default.vErrors);
	}
	e.reportExtraError = a;
	function o(e, n) {
		e.assign(r.default.errors, n), e.if((0, t._)`${r.default.vErrors} !== null`, () => e.if(n, () => e.assign((0, t._)`${r.default.vErrors}.length`, n), () => e.assign(r.default.vErrors, null)));
	}
	e.resetErrorsCount = o;
	function s({ gen: e, keyword: n, schemaValue: i, data: a, errsCount: o, it: s }) {
		/* istanbul ignore if */
		if (o === void 0) throw Error("ajv implementation error");
		let c = e.name("err");
		e.forRange("i", o, r.default.errors, (o) => {
			e.const(c, (0, t._)`${r.default.vErrors}[${o}]`), e.if((0, t._)`${c}.instancePath === undefined`, () => e.assign((0, t._)`${c}.instancePath`, (0, t.strConcat)(r.default.instancePath, s.errorPath))), e.assign((0, t._)`${c}.schemaPath`, (0, t.str)`${s.errSchemaPath}/${n}`), s.opts.verbose && (e.assign((0, t._)`${c}.schema`, i), e.assign((0, t._)`${c}.data`, a));
		});
	}
	e.extendErrors = s;
	function c(e, n) {
		let i = e.const("err", n);
		e.if((0, t._)`${r.default.vErrors} === null`, () => e.assign(r.default.vErrors, (0, t._)`[${i}]`), (0, t._)`${r.default.vErrors}.push(${i})`), e.code((0, t._)`${r.default.errors}++`);
	}
	function l(e, n) {
		let { gen: r, validateName: i, schemaEnv: a } = e;
		a.$async ? r.throw((0, t._)`new ${e.ValidationError}(${n})`) : (r.assign((0, t._)`${i}.errors`, n), r.return(!1));
	}
	var u = {
		keyword: new t.Name("keyword"),
		schemaPath: new t.Name("schemaPath"),
		params: new t.Name("params"),
		propertyName: new t.Name("propertyName"),
		message: new t.Name("message"),
		schema: new t.Name("schema"),
		parentSchema: new t.Name("parentSchema")
	};
	function d(e, n, r) {
		let { createErrors: i } = e.it;
		return i === !1 ? (0, t._)`{}` : f(e, n, r);
	}
	function f(e, t, n = {}) {
		let { gen: r, it: i } = e, a = [p(i, n), m(e, n)];
		return h(e, t, a), r.object(...a);
	}
	function p({ errorPath: e }, { instancePath: i }) {
		let a = i ? (0, t.str)`${e}${(0, n.getErrorPath)(i, n.Type.Str)}` : e;
		return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, a)];
	}
	function m({ keyword: e, it: { errSchemaPath: r } }, { schemaPath: i, parentSchema: a }) {
		let o = a ? r : (0, t.str)`${r}/${e}`;
		return i && (o = (0, t.str)`${o}${(0, n.getErrorPath)(i, n.Type.Str)}`), [u.schemaPath, o];
	}
	function h(e, { params: n, message: i }, a) {
		let { keyword: o, data: s, schemaValue: c, it: l } = e, { opts: d, propertyName: f, topSchemaRef: p, schemaPath: m } = l;
		a.push([u.keyword, o], [u.params, typeof n == "function" ? n(e) : n || (0, t._)`{}`]), d.messages && a.push([u.message, typeof i == "function" ? i(e) : i]), d.verbose && a.push([u.schema, c], [u.parentSchema, (0, t._)`${p}${m}`], [r.default.data, s]), f && a.push([u.propertyName, f]);
	}
})), wf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.boolOrEmptySchema = e.topBoolOrEmptySchema = void 0;
	var t = Cf(), n = Q(), r = Sf(), i = { message: "boolean schema is false" };
	function a(e) {
		let { gen: t, schema: i, validateName: a } = e;
		i === !1 ? s(e, !1) : typeof i == "object" && i.$async === !0 ? t.return(r.default.data) : (t.assign((0, n._)`${a}.errors`, null), t.return(!0));
	}
	e.topBoolOrEmptySchema = a;
	function o(e, t) {
		let { gen: n, schema: r } = e;
		r === !1 ? (n.var(t, !1), s(e)) : n.var(t, !0);
	}
	e.boolOrEmptySchema = o;
	function s(e, n) {
		let { gen: r, data: a } = e, o = {
			gen: r,
			keyword: "false schema",
			data: a,
			schema: !1,
			schemaCode: !1,
			schemaValue: !1,
			params: {},
			it: e
		};
		(0, t.reportError)(o, i, void 0, n);
	}
})), Tf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.getRules = e.isJSONType = void 0;
	var t = new Set([
		"string",
		"number",
		"integer",
		"boolean",
		"null",
		"object",
		"array"
	]);
	function n(e) {
		return typeof e == "string" && t.has(e);
	}
	e.isJSONType = n;
	function r() {
		let e = {
			number: {
				type: "number",
				rules: []
			},
			string: {
				type: "string",
				rules: []
			},
			array: {
				type: "array",
				rules: []
			},
			object: {
				type: "object",
				rules: []
			}
		};
		return {
			types: {
				...e,
				integer: !0,
				boolean: !0,
				null: !0
			},
			rules: [
				{ rules: [] },
				e.number,
				e.string,
				e.array,
				e.object
			],
			post: { rules: [] },
			all: {},
			keywords: {}
		};
	}
	e.getRules = r;
})), Ef = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.shouldUseRule = e.shouldUseGroup = e.schemaHasRulesForType = void 0;
	function t({ schema: e, self: t }, r) {
		let i = t.RULES.types[r];
		return i && i !== !0 && n(e, i);
	}
	e.schemaHasRulesForType = t;
	function n(e, t) {
		return t.rules.some((t) => r(e, t));
	}
	e.shouldUseGroup = n;
	function r(e, t) {
		var n;
		return e[t.keyword] !== void 0 || ((n = t.definition.implements) == null ? void 0 : n.some((t) => e[t] !== void 0));
	}
	e.shouldUseRule = r;
})), Df = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.reportTypeError = e.checkDataTypes = e.checkDataType = e.coerceAndCheckDataType = e.getJSONTypes = e.getSchemaTypes = e.DataType = void 0;
	var t = Tf(), n = Ef(), r = Cf(), i = Q(), a = $(), o;
	(function(e) {
		e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
	})(o || (e.DataType = o = {}));
	function s(e) {
		let t = c(e.type);
		if (t.includes("null")) {
			if (e.nullable === !1) throw Error("type: null contradicts nullable: false");
		} else {
			if (!t.length && e.nullable !== void 0) throw Error("\"nullable\" cannot be used without \"type\"");
			e.nullable === !0 && t.push("null");
		}
		return t;
	}
	e.getSchemaTypes = s;
	function c(e) {
		let n = Array.isArray(e) ? e : e ? [e] : [];
		if (n.every(t.isJSONType)) return n;
		throw Error("type must be JSONType or JSONType[]: " + n.join(","));
	}
	e.getJSONTypes = c;
	function l(e, t) {
		let { gen: r, data: i, opts: a } = e, s = d(t, a.coerceTypes), c = t.length > 0 && !(s.length === 0 && t.length === 1 && (0, n.schemaHasRulesForType)(e, t[0]));
		if (c) {
			let n = h(t, i, a.strictNumbers, o.Wrong);
			r.if(n, () => {
				s.length ? f(e, t, s) : _(e);
			});
		}
		return c;
	}
	e.coerceAndCheckDataType = l;
	var u = new Set([
		"string",
		"number",
		"integer",
		"boolean",
		"null"
	]);
	function d(e, t) {
		return t ? e.filter((e) => u.has(e) || t === "array" && e === "array") : [];
	}
	function f(e, t, n) {
		let { gen: r, data: a, opts: o } = e, s = r.let("dataType", (0, i._)`typeof ${a}`), c = r.let("coerced", (0, i._)`undefined`);
		o.coerceTypes === "array" && r.if((0, i._)`${s} == 'object' && Array.isArray(${a}) && ${a}.length == 1`, () => r.assign(a, (0, i._)`${a}[0]`).assign(s, (0, i._)`typeof ${a}`).if(h(t, a, o.strictNumbers), () => r.assign(c, a))), r.if((0, i._)`${c} !== undefined`);
		for (let e of n) (u.has(e) || e === "array" && o.coerceTypes === "array") && l(e);
		r.else(), _(e), r.endIf(), r.if((0, i._)`${c} !== undefined`, () => {
			r.assign(a, c), p(e, c);
		});
		function l(e) {
			switch (e) {
				case "string":
					r.elseIf((0, i._)`${s} == "number" || ${s} == "boolean"`).assign(c, (0, i._)`"" + ${a}`).elseIf((0, i._)`${a} === null`).assign(c, (0, i._)`""`);
					return;
				case "number":
					r.elseIf((0, i._)`${s} == "boolean" || ${a} === null
              || (${s} == "string" && ${a} && ${a} == +${a})`).assign(c, (0, i._)`+${a}`);
					return;
				case "integer":
					r.elseIf((0, i._)`${s} === "boolean" || ${a} === null
              || (${s} === "string" && ${a} && ${a} == +${a} && !(${a} % 1))`).assign(c, (0, i._)`+${a}`);
					return;
				case "boolean":
					r.elseIf((0, i._)`${a} === "false" || ${a} === 0 || ${a} === null`).assign(c, !1).elseIf((0, i._)`${a} === "true" || ${a} === 1`).assign(c, !0);
					return;
				case "null":
					r.elseIf((0, i._)`${a} === "" || ${a} === 0 || ${a} === false`), r.assign(c, null);
					return;
				case "array": r.elseIf((0, i._)`${s} === "string" || ${s} === "number"
              || ${s} === "boolean" || ${a} === null`).assign(c, (0, i._)`[${a}]`);
			}
		}
	}
	function p({ gen: e, parentData: t, parentDataProperty: n }, r) {
		e.if((0, i._)`${t} !== undefined`, () => e.assign((0, i._)`${t}[${n}]`, r));
	}
	function m(e, t, n, r = o.Correct) {
		let a = r === o.Correct ? i.operators.EQ : i.operators.NEQ, s;
		switch (e) {
			case "null": return (0, i._)`${t} ${a} null`;
			case "array":
				s = (0, i._)`Array.isArray(${t})`;
				break;
			case "object":
				s = (0, i._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
				break;
			case "integer":
				s = c((0, i._)`!(${t} % 1) && !isNaN(${t})`);
				break;
			case "number":
				s = c();
				break;
			default: return (0, i._)`typeof ${t} ${a} ${e}`;
		}
		return r === o.Correct ? s : (0, i.not)(s);
		function c(e = i.nil) {
			return (0, i.and)((0, i._)`typeof ${t} == "number"`, e, n ? (0, i._)`isFinite(${t})` : i.nil);
		}
	}
	e.checkDataType = m;
	function h(e, t, n, r) {
		if (e.length === 1) return m(e[0], t, n, r);
		let o, s = (0, a.toHash)(e);
		if (s.array && s.object) {
			let e = (0, i._)`typeof ${t} != "object"`;
			o = s.null ? e : (0, i._)`!${t} || ${e}`, delete s.null, delete s.array, delete s.object;
		} else o = i.nil;
		s.number && delete s.integer;
		for (let e in s) o = (0, i.and)(o, m(e, t, n, r));
		return o;
	}
	e.checkDataTypes = h;
	var g = {
		message: ({ schema: e }) => `must be ${e}`,
		params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, i._)`{type: ${e}}` : (0, i._)`{type: ${t}}`
	};
	function _(e) {
		let t = v(e);
		(0, r.reportError)(t, g);
	}
	e.reportTypeError = _;
	function v(e) {
		let { gen: t, data: n, schema: r } = e, i = (0, a.schemaRefOrVal)(e, r, "type");
		return {
			gen: t,
			keyword: "type",
			data: n,
			schema: r.type,
			schemaCode: i,
			schemaValue: i,
			parentSchema: r,
			params: {},
			it: e
		};
	}
})), Of = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.assignDefaults = void 0;
	var t = Q(), n = $();
	function r(e, t) {
		let { properties: n, items: r } = e.schema;
		if (t === "object" && n) for (let t in n) i(e, t, n[t].default);
		else t === "array" && Array.isArray(r) && r.forEach((t, n) => i(e, n, t.default));
	}
	e.assignDefaults = r;
	function i(e, r, i) {
		let { gen: a, compositeRule: o, data: s, opts: c } = e;
		if (i === void 0) return;
		let l = (0, t._)`${s}${(0, t.getProperty)(r)}`;
		if (o) {
			(0, n.checkStrictMode)(e, `default is ignored for: ${l}`);
			return;
		}
		let u = (0, t._)`${l} === undefined`;
		c.useDefaults === "empty" && (u = (0, t._)`${u} || ${l} === null || ${l} === ""`), a.if(u, (0, t._)`${l} = ${(0, t.stringify)(i)}`);
	}
})), kf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.validateUnion = e.validateArray = e.usePattern = e.callValidateCode = e.schemaProperties = e.allSchemaProperties = e.noPropertyInData = e.propertyInData = e.isOwnProperty = e.hasPropFunc = e.reportMissingProp = e.checkMissingProp = e.checkReportMissingProp = void 0;
	var t = Q(), n = $(), r = Sf(), i = $();
	function a(e, n) {
		let { gen: r, data: i, it: a } = e;
		r.if(d(r, i, n, a.opts.ownProperties), () => {
			e.setParams({ missingProperty: (0, t._)`${n}` }, !0), e.error();
		});
	}
	e.checkReportMissingProp = a;
	function o({ gen: e, data: n, it: { opts: r } }, i, a) {
		return (0, t.or)(...i.map((i) => (0, t.and)(d(e, n, i, r.ownProperties), (0, t._)`${a} = ${i}`)));
	}
	e.checkMissingProp = o;
	function s(e, t) {
		e.setParams({ missingProperty: t }, !0), e.error();
	}
	e.reportMissingProp = s;
	function c(e) {
		return e.scopeValue("func", {
			ref: Object.prototype.hasOwnProperty,
			code: (0, t._)`Object.prototype.hasOwnProperty`
		});
	}
	e.hasPropFunc = c;
	function l(e, n, r) {
		return (0, t._)`${c(e)}.call(${n}, ${r})`;
	}
	e.isOwnProperty = l;
	function u(e, n, r, i) {
		let a = (0, t._)`${n}${(0, t.getProperty)(r)} !== undefined`;
		return i ? (0, t._)`${a} && ${l(e, n, r)}` : a;
	}
	e.propertyInData = u;
	function d(e, n, r, i) {
		let a = (0, t._)`${n}${(0, t.getProperty)(r)} === undefined`;
		return i ? (0, t.or)(a, (0, t.not)(l(e, n, r))) : a;
	}
	e.noPropertyInData = d;
	function f(e) {
		return e ? Object.keys(e).filter((e) => e !== "__proto__") : [];
	}
	e.allSchemaProperties = f;
	function p(e, t) {
		return f(t).filter((r) => !(0, n.alwaysValidSchema)(e, t[r]));
	}
	e.schemaProperties = p;
	function m({ schemaCode: e, data: n, it: { gen: i, topSchemaRef: a, schemaPath: o, errorPath: s }, it: c }, l, u, d) {
		let f = d ? (0, t._)`${e}, ${n}, ${a}${o}` : n, p = [
			[r.default.instancePath, (0, t.strConcat)(r.default.instancePath, s)],
			[r.default.parentData, c.parentData],
			[r.default.parentDataProperty, c.parentDataProperty],
			[r.default.rootData, r.default.rootData]
		];
		c.opts.dynamicRef && p.push([r.default.dynamicAnchors, r.default.dynamicAnchors]);
		let m = (0, t._)`${f}, ${i.object(...p)}`;
		return u === t.nil ? (0, t._)`${l}(${m})` : (0, t._)`${l}.call(${u}, ${m})`;
	}
	e.callValidateCode = m;
	var h = (0, t._)`new RegExp`;
	function g({ gen: e, it: { opts: n } }, r) {
		let a = n.unicodeRegExp ? "u" : "", { regExp: o } = n.code, s = o(r, a);
		return e.scopeValue("pattern", {
			key: s.toString(),
			ref: s,
			code: (0, t._)`${o.code === "new RegExp" ? h : (0, i.useFunc)(e, o)}(${r}, ${a})`
		});
	}
	e.usePattern = g;
	function _(e) {
		let { gen: r, data: i, keyword: a, it: o } = e, s = r.name("valid");
		if (o.allErrors) {
			let e = r.let("valid", !0);
			return c(() => r.assign(e, !1)), e;
		}
		return r.var(s, !0), c(() => r.break()), s;
		function c(o) {
			let c = r.const("len", (0, t._)`${i}.length`);
			r.forRange("i", 0, c, (i) => {
				e.subschema({
					keyword: a,
					dataProp: i,
					dataPropType: n.Type.Num
				}, s), r.if((0, t.not)(s), o);
			});
		}
	}
	e.validateArray = _;
	function v(e) {
		let { gen: r, schema: i, keyword: a, it: o } = e;
		/* istanbul ignore if */
		if (!Array.isArray(i)) throw Error("ajv implementation error");
		if (i.some((e) => (0, n.alwaysValidSchema)(o, e)) && !o.opts.unevaluated) return;
		let s = r.let("valid", !1), c = r.name("_valid");
		r.block(() => i.forEach((n, i) => {
			let o = e.subschema({
				keyword: a,
				schemaProp: i,
				compositeRule: !0
			}, c);
			r.assign(s, (0, t._)`${s} || ${c}`), e.mergeValidEvaluated(o, c) || r.if((0, t.not)(s));
		})), e.result(s, () => e.reset(), () => e.error(!0));
	}
	e.validateUnion = v;
})), Af = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.validateKeywordUsage = e.validSchemaType = e.funcKeywordCode = e.macroKeywordCode = void 0;
	var t = Q(), n = Sf(), r = kf(), i = Cf();
	function a(e, n) {
		let { gen: r, keyword: i, schema: a, parentSchema: o, it: s } = e, c = n.macro.call(s.self, a, o, s), l = u(r, i, c);
		s.opts.validateSchema !== !1 && s.self.validateSchema(c, !0);
		let d = r.name("valid");
		e.subschema({
			schema: c,
			schemaPath: t.nil,
			errSchemaPath: `${s.errSchemaPath}/${i}`,
			topSchemaRef: l,
			compositeRule: !0
		}, d), e.pass(d, () => e.error(!0));
	}
	e.macroKeywordCode = a;
	function o(e, i) {
		let { gen: a, keyword: o, schema: d, parentSchema: f, $data: p, it: m } = e;
		l(m, i);
		let h = u(a, o, !p && i.compile ? i.compile.call(m.self, d, f, m) : i.validate), g = a.let("valid");
		e.block$data(g, _), e.ok(i.valid ?? g);
		function _() {
			if (i.errors === !1) te(), i.modifying && s(e), y(() => e.error());
			else {
				let t = i.async ? v() : ee();
				i.modifying && s(e), y(() => c(e, t));
			}
		}
		function v() {
			let e = a.let("ruleErrs", null);
			return a.try(() => te((0, t._)`await `), (n) => a.assign(g, !1).if((0, t._)`${n} instanceof ${m.ValidationError}`, () => a.assign(e, (0, t._)`${n}.errors`), () => a.throw(n))), e;
		}
		function ee() {
			let e = (0, t._)`${h}.errors`;
			return a.assign(e, null), te(t.nil), e;
		}
		function te(o = i.async ? (0, t._)`await ` : t.nil) {
			let s = m.opts.passContext ? n.default.this : n.default.self, c = !("compile" in i && !p || i.schema === !1);
			a.assign(g, (0, t._)`${o}${(0, r.callValidateCode)(e, h, s, c)}`, i.modifying);
		}
		function y(e) {
			a.if((0, t.not)(i.valid ?? g), e);
		}
	}
	e.funcKeywordCode = o;
	function s(e) {
		let { gen: n, data: r, it: i } = e;
		n.if(i.parentData, () => n.assign(r, (0, t._)`${i.parentData}[${i.parentDataProperty}]`));
	}
	function c(e, r) {
		let { gen: a } = e;
		a.if((0, t._)`Array.isArray(${r})`, () => {
			a.assign(n.default.vErrors, (0, t._)`${n.default.vErrors} === null ? ${r} : ${n.default.vErrors}.concat(${r})`).assign(n.default.errors, (0, t._)`${n.default.vErrors}.length`), (0, i.extendErrors)(e);
		}, () => e.error());
	}
	function l({ schemaEnv: e }, t) {
		if (t.async && !e.$async) throw Error("async keyword in sync schema");
	}
	function u(e, n, r) {
		if (r === void 0) throw Error(`keyword "${n}" failed to compile`);
		return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : {
			ref: r,
			code: (0, t.stringify)(r)
		});
	}
	function d(e, t, n = !1) {
		return !t.length || t.some((t) => t === "array" ? Array.isArray(e) : t === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == t || n && e === void 0);
	}
	e.validSchemaType = d;
	function f({ schema: e, opts: t, self: n, errSchemaPath: r }, i, a) {
		/* istanbul ignore if */
		if (Array.isArray(i.keyword) ? !i.keyword.includes(a) : i.keyword !== a) throw Error("ajv implementation error");
		let o = i.dependencies;
		if (o != null && o.some((t) => !Object.prototype.hasOwnProperty.call(e, t))) throw Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
		if (i.validateSchema && !i.validateSchema(e[a])) {
			let e = `keyword "${a}" value is invalid at path "${r}": ` + n.errorsText(i.validateSchema.errors);
			if (t.validateSchema === "log") n.logger.error(e);
			else throw Error(e);
		}
	}
	e.validateKeywordUsage = f;
})), jf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.extendSubschemaMode = e.extendSubschemaData = e.getSubschema = void 0;
	var t = Q(), n = $();
	function r(e, { keyword: r, schemaProp: i, schema: a, schemaPath: o, errSchemaPath: s, topSchemaRef: c }) {
		if (r !== void 0 && a !== void 0) throw Error("both \"keyword\" and \"schema\" passed, only one allowed");
		if (r !== void 0) {
			let a = e.schema[r];
			return i === void 0 ? {
				schema: a,
				schemaPath: (0, t._)`${e.schemaPath}${(0, t.getProperty)(r)}`,
				errSchemaPath: `${e.errSchemaPath}/${r}`
			} : {
				schema: a[i],
				schemaPath: (0, t._)`${e.schemaPath}${(0, t.getProperty)(r)}${(0, t.getProperty)(i)}`,
				errSchemaPath: `${e.errSchemaPath}/${r}/${(0, n.escapeFragment)(i)}`
			};
		}
		if (a !== void 0) {
			if (o === void 0 || s === void 0 || c === void 0) throw Error("\"schemaPath\", \"errSchemaPath\" and \"topSchemaRef\" are required with \"schema\"");
			return {
				schema: a,
				schemaPath: o,
				topSchemaRef: c,
				errSchemaPath: s
			};
		}
		throw Error("either \"keyword\" or \"schema\" must be passed");
	}
	e.getSubschema = r;
	function i(e, r, { dataProp: i, dataPropType: a, data: o, dataTypes: s, propertyName: c }) {
		if (o !== void 0 && i !== void 0) throw Error("both \"data\" and \"dataProp\" passed, only one allowed");
		let { gen: l } = r;
		if (i !== void 0) {
			let { errorPath: o, dataPathArr: s, opts: c } = r;
			u(l.let("data", (0, t._)`${r.data}${(0, t.getProperty)(i)}`, !0)), e.errorPath = (0, t.str)`${o}${(0, n.getErrorPath)(i, a, c.jsPropertySyntax)}`, e.parentDataProperty = (0, t._)`${i}`, e.dataPathArr = [...s, e.parentDataProperty];
		}
		o !== void 0 && (u(o instanceof t.Name ? o : l.let("data", o, !0)), c !== void 0 && (e.propertyName = c)), s && (e.dataTypes = s);
		function u(t) {
			e.data = t, e.dataLevel = r.dataLevel + 1, e.dataTypes = [], r.definedProperties = /* @__PURE__ */ new Set(), e.parentData = r.data, e.dataNames = [...r.dataNames, t];
		}
	}
	e.extendSubschemaData = i;
	function a(e, { jtdDiscriminator: t, jtdMetadata: n, compositeRule: r, createErrors: i, allErrors: a }) {
		r !== void 0 && (e.compositeRule = r), i !== void 0 && (e.createErrors = i), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = n;
	}
	e.extendSubschemaMode = a;
})), Mf = /* @__PURE__ */ s(((e, t) => {
	t.exports = function e(t, n) {
		if (t === n) return !0;
		if (t && n && typeof t == "object" && typeof n == "object") {
			if (t.constructor !== n.constructor) return !1;
			var r, i, a;
			if (Array.isArray(t)) {
				if (r = t.length, r != n.length) return !1;
				for (i = r; i-- !== 0;) if (!e(t[i], n[i])) return !1;
				return !0;
			}
			if (t.constructor === RegExp) return t.source === n.source && t.flags === n.flags;
			if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === n.valueOf();
			if (t.toString !== Object.prototype.toString) return t.toString() === n.toString();
			if (a = Object.keys(t), r = a.length, r !== Object.keys(n).length) return !1;
			for (i = r; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(n, a[i])) return !1;
			for (i = r; i-- !== 0;) {
				var o = a[i];
				if (!e(t[o], n[o])) return !1;
			}
			return !0;
		}
		return t !== t && n !== n;
	};
})), Nf = /* @__PURE__ */ s(((e, t) => {
	var n = t.exports = function(e, t, n) {
		typeof t == "function" && (n = t, t = {}), n = t.cb || n;
		var i = typeof n == "function" ? n : n.pre || function() {}, a = n.post || function() {};
		r(t, i, a, e, "", e);
	};
	n.keywords = {
		additionalItems: !0,
		items: !0,
		contains: !0,
		additionalProperties: !0,
		propertyNames: !0,
		not: !0,
		if: !0,
		then: !0,
		else: !0
	}, n.arrayKeywords = {
		items: !0,
		allOf: !0,
		anyOf: !0,
		oneOf: !0
	}, n.propsKeywords = {
		$defs: !0,
		definitions: !0,
		properties: !0,
		patternProperties: !0,
		dependencies: !0
	}, n.skipKeywords = {
		default: !0,
		enum: !0,
		const: !0,
		required: !0,
		maximum: !0,
		minimum: !0,
		exclusiveMaximum: !0,
		exclusiveMinimum: !0,
		multipleOf: !0,
		maxLength: !0,
		minLength: !0,
		pattern: !0,
		format: !0,
		maxItems: !0,
		minItems: !0,
		uniqueItems: !0,
		maxProperties: !0,
		minProperties: !0
	};
	function r(e, t, a, o, s, c, l, u, d, f) {
		if (o && typeof o == "object" && !Array.isArray(o)) {
			for (var p in t(o, s, c, l, u, d, f), o) {
				var m = o[p];
				if (Array.isArray(m)) {
					if (p in n.arrayKeywords) for (var h = 0; h < m.length; h++) r(e, t, a, m[h], s + "/" + p + "/" + h, c, s, p, o, h);
				} else if (p in n.propsKeywords) {
					if (m && typeof m == "object") for (var g in m) r(e, t, a, m[g], s + "/" + p + "/" + i(g), c, s, p, o, g);
				} else (p in n.keywords || e.allKeys && !(p in n.skipKeywords)) && r(e, t, a, m, s + "/" + p, c, s, p, o);
			}
			a(o, s, c, l, u, d, f);
		}
	}
	function i(e) {
		return e.replace(/~/g, "~0").replace(/\//g, "~1");
	}
})), Pf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.getSchemaRefs = e.resolveUrl = e.normalizeId = e._getFullPath = e.getFullPath = e.inlineRef = void 0;
	var t = $(), n = Mf(), r = Nf(), i = new Set([
		"type",
		"format",
		"pattern",
		"maxLength",
		"minLength",
		"maxProperties",
		"minProperties",
		"maxItems",
		"minItems",
		"maximum",
		"minimum",
		"uniqueItems",
		"multipleOf",
		"required",
		"enum",
		"const"
	]);
	function a(e, t = !0) {
		return typeof e == "boolean" ? !0 : t === !0 ? !s(e) : t ? c(e) <= t : !1;
	}
	e.inlineRef = a;
	var o = new Set([
		"$ref",
		"$recursiveRef",
		"$recursiveAnchor",
		"$dynamicRef",
		"$dynamicAnchor"
	]);
	function s(e) {
		for (let t in e) {
			if (o.has(t)) return !0;
			let n = e[t];
			if (Array.isArray(n) && n.some(s) || typeof n == "object" && s(n)) return !0;
		}
		return !1;
	}
	function c(e) {
		let n = 0;
		for (let r in e) if (r === "$ref" || (n++, !i.has(r) && (typeof e[r] == "object" && (0, t.eachItem)(e[r], (e) => n += c(e)), n === Infinity))) return Infinity;
		return n;
	}
	function l(e, t = "", n) {
		return n !== !1 && (t = f(t)), u(e, e.parse(t));
	}
	e.getFullPath = l;
	function u(e, t) {
		return e.serialize(t).split("#")[0] + "#";
	}
	e._getFullPath = u;
	var d = /#\/?$/;
	function f(e) {
		return e ? e.replace(d, "") : "";
	}
	e.normalizeId = f;
	function p(e, t, n) {
		return n = f(n), e.resolve(t, n);
	}
	e.resolveUrl = p;
	var m = /^[a-z_][-a-z0-9._]*$/i;
	function h(e, t) {
		if (typeof e == "boolean") return {};
		let { schemaId: i, uriResolver: a } = this.opts, o = f(e[i] || t), s = { "": o }, c = l(a, o, !1), u = {}, d = /* @__PURE__ */ new Set();
		return r(e, { allKeys: !0 }, (e, t, n, r) => {
			if (r === void 0) return;
			let a = c + t, o = s[r];
			typeof e[i] == "string" && (o = l.call(this, e[i])), g.call(this, e.$anchor), g.call(this, e.$dynamicAnchor), s[t] = o;
			function l(t) {
				let n = this.opts.uriResolver.resolve;
				if (t = f(o ? n(o, t) : t), d.has(t)) throw h(t);
				d.add(t);
				let r = this.refs[t];
				return typeof r == "string" && (r = this.refs[r]), typeof r == "object" ? p(e, r.schema, t) : t !== f(a) && (t[0] === "#" ? (p(e, u[t], t), u[t] = e) : this.refs[t] = a), t;
			}
			function g(e) {
				if (typeof e == "string") {
					if (!m.test(e)) throw Error(`invalid anchor "${e}"`);
					l.call(this, `#${e}`);
				}
			}
		}), u;
		function p(e, t, r) {
			if (t !== void 0 && !n(e, t)) throw h(r);
		}
		function h(e) {
			return /* @__PURE__ */ Error(`reference "${e}" resolves to more than one schema`);
		}
	}
	e.getSchemaRefs = h;
})), Ff = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.getData = e.KeywordCxt = e.validateFunctionCode = void 0;
	var t = wf(), n = Df(), r = Ef(), i = Df(), a = Of(), o = Af(), s = jf(), c = Q(), l = Sf(), u = Pf(), d = $(), f = Cf();
	function p(e) {
		if (b(e) && (S(e), y(e))) {
			_(e);
			return;
		}
		m(e, () => (0, t.topBoolOrEmptySchema)(e));
	}
	e.validateFunctionCode = p;
	function m({ gen: e, validateName: t, schema: n, schemaEnv: r, opts: i }, a) {
		i.code.es5 ? e.func(t, (0, c._)`${l.default.data}, ${l.default.valCxt}`, r.$async, () => {
			e.code((0, c._)`"use strict"; ${ee(n, i)}`), g(e, i), e.code(a);
		}) : e.func(t, (0, c._)`${l.default.data}, ${h(i)}`, r.$async, () => e.code(ee(n, i)).code(a));
	}
	function h(e) {
		return (0, c._)`{${l.default.instancePath}="", ${l.default.parentData}, ${l.default.parentDataProperty}, ${l.default.rootData}=${l.default.data}${e.dynamicRef ? (0, c._)`, ${l.default.dynamicAnchors}={}` : c.nil}}={}`;
	}
	function g(e, t) {
		e.if(l.default.valCxt, () => {
			e.var(l.default.instancePath, (0, c._)`${l.default.valCxt}.${l.default.instancePath}`), e.var(l.default.parentData, (0, c._)`${l.default.valCxt}.${l.default.parentData}`), e.var(l.default.parentDataProperty, (0, c._)`${l.default.valCxt}.${l.default.parentDataProperty}`), e.var(l.default.rootData, (0, c._)`${l.default.valCxt}.${l.default.rootData}`), t.dynamicRef && e.var(l.default.dynamicAnchors, (0, c._)`${l.default.valCxt}.${l.default.dynamicAnchors}`);
		}, () => {
			e.var(l.default.instancePath, (0, c._)`""`), e.var(l.default.parentData, (0, c._)`undefined`), e.var(l.default.parentDataProperty, (0, c._)`undefined`), e.var(l.default.rootData, l.default.data), t.dynamicRef && e.var(l.default.dynamicAnchors, (0, c._)`{}`);
		});
	}
	function _(e) {
		let { schema: t, opts: n, gen: r } = e;
		m(e, () => {
			n.$comment && t.$comment && oe(e), re(e), r.let(l.default.vErrors, null), r.let(l.default.errors, 0), n.unevaluated && v(e), ne(e), w(e);
		});
	}
	function v(e) {
		let { gen: t, validateName: n } = e;
		e.evaluated = t.const("evaluated", (0, c._)`${n}.evaluated`), t.if((0, c._)`${e.evaluated}.dynamicProps`, () => t.assign((0, c._)`${e.evaluated}.props`, (0, c._)`undefined`)), t.if((0, c._)`${e.evaluated}.dynamicItems`, () => t.assign((0, c._)`${e.evaluated}.items`, (0, c._)`undefined`));
	}
	function ee(e, t) {
		let n = typeof e == "object" && e[t.schemaId];
		return n && (t.code.source || t.code.process) ? (0, c._)`/*# sourceURL=${n} */` : c.nil;
	}
	function te(e, n) {
		if (b(e) && (S(e), y(e))) {
			x(e, n);
			return;
		}
		(0, t.boolOrEmptySchema)(e, n);
	}
	function y({ schema: e, self: t }) {
		if (typeof e == "boolean") return !e;
		for (let n in e) if (t.RULES.all[n]) return !0;
		return !1;
	}
	function b(e) {
		return typeof e.schema != "boolean";
	}
	function x(e, t) {
		let { schema: n, gen: r, opts: i } = e;
		i.$comment && n.$comment && oe(e), ie(e), ae(e);
		let a = r.const("_errs", l.default.errors);
		ne(e, a), r.var(t, (0, c._)`${a} === ${l.default.errors}`);
	}
	function S(e) {
		(0, d.checkUnknownRules)(e), C(e);
	}
	function ne(e, t) {
		if (e.opts.jtd) return ce(e, [], !1, t);
		let r = (0, n.getSchemaTypes)(e.schema);
		ce(e, r, !(0, n.coerceAndCheckDataType)(e, r), t);
	}
	function C(e) {
		let { schema: t, errSchemaPath: n, opts: r, self: i } = e;
		t.$ref && r.ignoreKeywordsWithRef && (0, d.schemaHasRulesButRef)(t, i.RULES) && i.logger.warn(`$ref: keywords ignored in schema at path "${n}"`);
	}
	function re(e) {
		let { schema: t, opts: n } = e;
		t.default !== void 0 && n.useDefaults && n.strictSchema && (0, d.checkStrictMode)(e, "default is ignored in the schema root");
	}
	function ie(e) {
		let t = e.schema[e.opts.schemaId];
		t && (e.baseId = (0, u.resolveUrl)(e.opts.uriResolver, e.baseId, t));
	}
	function ae(e) {
		if (e.schema.$async && !e.schemaEnv.$async) throw Error("async schema in sync schema");
	}
	function oe({ gen: e, schemaEnv: t, schema: n, errSchemaPath: r, opts: i }) {
		let a = n.$comment;
		if (i.$comment === !0) e.code((0, c._)`${l.default.self}.logger.log(${a})`);
		else if (typeof i.$comment == "function") {
			let n = (0, c.str)`${r}/$comment`, i = e.scopeValue("root", { ref: t.root });
			e.code((0, c._)`${l.default.self}.opts.$comment(${a}, ${n}, ${i}.schema)`);
		}
	}
	function w(e) {
		let { gen: t, schemaEnv: n, validateName: r, ValidationError: i, opts: a } = e;
		n.$async ? t.if((0, c._)`${l.default.errors} === 0`, () => t.return(l.default.data), () => t.throw((0, c._)`new ${i}(${l.default.vErrors})`)) : (t.assign((0, c._)`${r}.errors`, l.default.vErrors), a.unevaluated && se(e), t.return((0, c._)`${l.default.errors} === 0`));
	}
	function se({ gen: e, evaluated: t, props: n, items: r }) {
		n instanceof c.Name && e.assign((0, c._)`${t}.props`, n), r instanceof c.Name && e.assign((0, c._)`${t}.items`, r);
	}
	function ce(e, t, n, a) {
		let { gen: o, schema: s, data: u, allErrors: f, opts: p, self: m } = e, { RULES: h } = m;
		if (s.$ref && (p.ignoreKeywordsWithRef || !(0, d.schemaHasRulesButRef)(s, h))) {
			o.block(() => _e(e, "$ref", h.all.$ref.definition));
			return;
		}
		p.jtd || E(e, t), o.block(() => {
			for (let e of h.rules) g(e);
			g(h.post);
		});
		function g(d) {
			(0, r.shouldUseGroup)(s, d) && (d.type ? (o.if((0, i.checkDataType)(d.type, u, p.strictNumbers)), T(e, d), t.length === 1 && t[0] === d.type && n && (o.else(), (0, i.reportTypeError)(e)), o.endIf()) : T(e, d), f || o.if((0, c._)`${l.default.errors} === ${a || 0}`));
		}
	}
	function T(e, t) {
		let { gen: n, schema: i, opts: { useDefaults: o } } = e;
		o && (0, a.assignDefaults)(e, t.type), n.block(() => {
			for (let n of t.rules) (0, r.shouldUseRule)(i, n) && _e(e, n.keyword, n.definition, t.type);
		});
	}
	function E(e, t) {
		e.schemaEnv.meta || !e.opts.strictTypes || (le(e, t), e.opts.allowUnionTypes || ue(e, t), de(e, e.dataTypes));
	}
	function le(e, t) {
		if (t.length) {
			if (!e.dataTypes.length) {
				e.dataTypes = t;
				return;
			}
			t.forEach((t) => {
				pe(e.dataTypes, t) || he(e, `type "${t}" not allowed by context "${e.dataTypes.join(",")}"`);
			}), me(e, t);
		}
	}
	function ue(e, t) {
		t.length > 1 && !(t.length === 2 && t.includes("null")) && he(e, "use allowUnionTypes to allow union type keyword");
	}
	function de(e, t) {
		let n = e.self.RULES.all;
		for (let i in n) {
			let a = n[i];
			if (typeof a == "object" && (0, r.shouldUseRule)(e.schema, a)) {
				let { type: n } = a.definition;
				n.length && !n.some((e) => fe(t, e)) && he(e, `missing type "${n.join(",")}" for keyword "${i}"`);
			}
		}
	}
	function fe(e, t) {
		return e.includes(t) || t === "number" && e.includes("integer");
	}
	function pe(e, t) {
		return e.includes(t) || t === "integer" && e.includes("number");
	}
	function me(e, t) {
		let n = [];
		for (let r of e.dataTypes) pe(t, r) ? n.push(r) : t.includes("integer") && r === "number" && n.push("integer");
		e.dataTypes = n;
	}
	function he(e, t) {
		let n = e.schemaEnv.baseId + e.errSchemaPath;
		t += ` at "${n}" (strictTypes)`, (0, d.checkStrictMode)(e, t, e.opts.strictTypes);
	}
	var ge = class {
		constructor(e, t, n) {
			if ((0, o.validateKeywordUsage)(e, t, n), this.gen = e.gen, this.allErrors = e.allErrors, this.keyword = n, this.data = e.data, this.schema = e.schema[n], this.$data = t.$data && e.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, d.schemaRefOrVal)(e, this.schema, n, this.$data), this.schemaType = t.schemaType, this.parentSchema = e.schema, this.params = {}, this.it = e, this.def = t, this.$data) this.schemaCode = e.gen.const("vSchema", be(this.$data, e));
			else if (this.schemaCode = this.schemaValue, !(0, o.validSchemaType)(this.schema, t.schemaType, t.allowUndefined)) throw Error(`${n} value must be ${JSON.stringify(t.schemaType)}`);
			("code" in t ? t.trackErrors : t.errors !== !1) && (this.errsCount = e.gen.const("_errs", l.default.errors));
		}
		result(e, t, n) {
			this.failResult((0, c.not)(e), t, n);
		}
		failResult(e, t, n) {
			this.gen.if(e), n ? n() : this.error(), t ? (this.gen.else(), t(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
		}
		pass(e, t) {
			this.failResult((0, c.not)(e), void 0, t);
		}
		fail(e) {
			if (e === void 0) {
				this.error(), this.allErrors || this.gen.if(!1);
				return;
			}
			this.gen.if(e), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
		}
		fail$data(e) {
			if (!this.$data) return this.fail(e);
			let { schemaCode: t } = this;
			this.fail((0, c._)`${t} !== undefined && (${(0, c.or)(this.invalid$data(), e)})`);
		}
		error(e, t, n) {
			if (t) {
				this.setParams(t), this._error(e, n), this.setParams({});
				return;
			}
			this._error(e, n);
		}
		_error(e, t) {
			(e ? f.reportExtraError : f.reportError)(this, this.def.error, t);
		}
		$dataError() {
			(0, f.reportError)(this, this.def.$dataError || f.keyword$DataError);
		}
		reset() {
			if (this.errsCount === void 0) throw Error("add \"trackErrors\" to keyword definition");
			(0, f.resetErrorsCount)(this.gen, this.errsCount);
		}
		ok(e) {
			this.allErrors || this.gen.if(e);
		}
		setParams(e, t) {
			t ? Object.assign(this.params, e) : this.params = e;
		}
		block$data(e, t, n = c.nil) {
			this.gen.block(() => {
				this.check$data(e, n), t();
			});
		}
		check$data(e = c.nil, t = c.nil) {
			if (!this.$data) return;
			let { gen: n, schemaCode: r, schemaType: i, def: a } = this;
			n.if((0, c.or)((0, c._)`${r} === undefined`, t)), e !== c.nil && n.assign(e, !0), (i.length || a.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), e !== c.nil && n.assign(e, !1)), n.else();
		}
		invalid$data() {
			let { gen: e, schemaCode: t, schemaType: n, def: r, it: a } = this;
			return (0, c.or)(o(), s());
			function o() {
				if (n.length) {
					/* istanbul ignore if */
					if (!(t instanceof c.Name)) throw Error("ajv implementation error");
					let e = Array.isArray(n) ? n : [n];
					return (0, c._)`${(0, i.checkDataTypes)(e, t, a.opts.strictNumbers, i.DataType.Wrong)}`;
				}
				return c.nil;
			}
			function s() {
				if (r.validateSchema) {
					let n = e.scopeValue("validate$data", { ref: r.validateSchema });
					return (0, c._)`!${n}(${t})`;
				}
				return c.nil;
			}
		}
		subschema(e, t) {
			let n = (0, s.getSubschema)(this.it, e);
			(0, s.extendSubschemaData)(n, this.it, e), (0, s.extendSubschemaMode)(n, e);
			let r = {
				...this.it,
				...n,
				items: void 0,
				props: void 0
			};
			return te(r, t), r;
		}
		mergeEvaluated(e, t) {
			let { it: n, gen: r } = this;
			n.opts.unevaluated && (n.props !== !0 && e.props !== void 0 && (n.props = d.mergeEvaluated.props(r, e.props, n.props, t)), n.items !== !0 && e.items !== void 0 && (n.items = d.mergeEvaluated.items(r, e.items, n.items, t)));
		}
		mergeValidEvaluated(e, t) {
			let { it: n, gen: r } = this;
			if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0)) return r.if(t, () => this.mergeEvaluated(e, c.Name)), !0;
		}
	};
	e.KeywordCxt = ge;
	function _e(e, t, n, r) {
		let i = new ge(e, n, t);
		"code" in n ? n.code(i, r) : i.$data && n.validate ? (0, o.funcKeywordCode)(i, n) : "macro" in n ? (0, o.macroKeywordCode)(i, n) : (n.compile || n.validate) && (0, o.funcKeywordCode)(i, n);
	}
	var ve = /^\/(?:[^~]|~0|~1)*$/, ye = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
	function be(e, { dataLevel: t, dataNames: n, dataPathArr: r }) {
		let i, a;
		if (e === "") return l.default.rootData;
		if (e[0] === "/") {
			if (!ve.test(e)) throw Error(`Invalid JSON-pointer: ${e}`);
			i = e, a = l.default.rootData;
		} else {
			let o = ye.exec(e);
			if (!o) throw Error(`Invalid JSON-pointer: ${e}`);
			let s = +o[1];
			if (i = o[2], i === "#") {
				if (s >= t) throw Error(u("property/index", s));
				return r[t - s];
			}
			if (s > t) throw Error(u("data", s));
			if (a = n[t - s], !i) return a;
		}
		let o = a, s = i.split("/");
		for (let e of s) e && (a = (0, c._)`${a}${(0, c.getProperty)((0, d.unescapeJsonPointer)(e))}`, o = (0, c._)`${o} && ${a}`);
		return o;
		function u(e, n) {
			return `Cannot access ${e} ${n} levels up, current level is ${t}`;
		}
	}
	e.getData = be;
})), If = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.default = class extends Error {
		constructor(e) {
			super("validation failed"), this.errors = e, this.ajv = this.validation = !0;
		}
	};
})), Lf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Pf();
	e.default = class extends Error {
		constructor(e, n, r, i) {
			super(i || `can't resolve reference ${r} from id ${n}`), this.missingRef = (0, t.resolveUrl)(e, n, r), this.missingSchema = (0, t.normalizeId)((0, t.getFullPath)(e, this.missingRef));
		}
	};
})), Rf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.resolveSchema = e.getCompilingSchema = e.resolveRef = e.compileSchema = e.SchemaEnv = void 0;
	var t = Q(), n = If(), r = Sf(), i = Pf(), a = $(), o = Ff(), s = class {
		constructor(e) {
			this.refs = {}, this.dynamicAnchors = {};
			let t;
			typeof e.schema == "object" && (t = e.schema), this.schema = e.schema, this.schemaId = e.schemaId, this.root = e.root || this, this.baseId = e.baseId ?? (0, i.normalizeId)(t == null ? void 0 : t[e.schemaId || "$id"]), this.schemaPath = e.schemaPath, this.localRefs = e.localRefs, this.meta = e.meta, this.$async = t == null ? void 0 : t.$async, this.refs = {};
		}
	};
	e.SchemaEnv = s;
	function c(e) {
		let a = d.call(this, e);
		if (a) return a;
		let s = (0, i.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: c, lines: l } = this.opts.code, { ownProperties: u } = this.opts, f = new t.CodeGen(this.scope, {
			es5: c,
			lines: l,
			ownProperties: u
		}), p;
		e.$async && (p = f.scopeValue("Error", {
			ref: n.default,
			code: (0, t._)`require("ajv/dist/runtime/validation_error").default`
		}));
		let m = f.scopeName("validate");
		e.validateName = m;
		let h = {
			gen: f,
			allErrors: this.opts.allErrors,
			data: r.default.data,
			parentData: r.default.parentData,
			parentDataProperty: r.default.parentDataProperty,
			dataNames: [r.default.data],
			dataPathArr: [t.nil],
			dataLevel: 0,
			dataTypes: [],
			definedProperties: /* @__PURE__ */ new Set(),
			topSchemaRef: f.scopeValue("schema", this.opts.code.source === !0 ? {
				ref: e.schema,
				code: (0, t.stringify)(e.schema)
			} : { ref: e.schema }),
			validateName: m,
			ValidationError: p,
			schema: e.schema,
			schemaEnv: e,
			rootId: s,
			baseId: e.baseId || s,
			schemaPath: t.nil,
			errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
			errorPath: (0, t._)`""`,
			opts: this.opts,
			self: this
		}, g;
		try {
			this._compilations.add(e), (0, o.validateFunctionCode)(h), f.optimize(this.opts.code.optimize);
			let n = f.toString();
			g = `${f.scopeRefs(r.default.scope)}return ${n}`, this.opts.code.process && (g = this.opts.code.process(g, e));
			let i = Function(`${r.default.self}`, `${r.default.scope}`, g)(this, this.scope.get());
			if (this.scope.value(m, { ref: i }), i.errors = null, i.schema = e.schema, i.schemaEnv = e, e.$async && (i.$async = !0), this.opts.code.source === !0 && (i.source = {
				validateName: m,
				validateCode: n,
				scopeValues: f._values
			}), this.opts.unevaluated) {
				let { props: e, items: n } = h;
				i.evaluated = {
					props: e instanceof t.Name ? void 0 : e,
					items: n instanceof t.Name ? void 0 : n,
					dynamicProps: e instanceof t.Name,
					dynamicItems: n instanceof t.Name
				}, i.source && (i.source.evaluated = (0, t.stringify)(i.evaluated));
			}
			return e.validate = i, e;
		} catch (t) {
			throw delete e.validate, delete e.validateName, g && this.logger.error("Error compiling schema, function code:", g), t;
		} finally {
			this._compilations.delete(e);
		}
	}
	e.compileSchema = c;
	function l(e, t, n) {
		var r;
		n = (0, i.resolveUrl)(this.opts.uriResolver, t, n);
		let a = e.refs[n];
		if (a) return a;
		let o = p.call(this, e, n);
		if (o === void 0) {
			let i = (r = e.localRefs) == null ? void 0 : r[n], { schemaId: a } = this.opts;
			i && (o = new s({
				schema: i,
				schemaId: a,
				root: e,
				baseId: t
			}));
		}
		if (o !== void 0) return e.refs[n] = u.call(this, o);
	}
	e.resolveRef = l;
	function u(e) {
		return (0, i.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : c.call(this, e);
	}
	function d(e) {
		for (let t of this._compilations) if (f(t, e)) return t;
	}
	e.getCompilingSchema = d;
	function f(e, t) {
		return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
	}
	function p(e, t) {
		let n;
		for (; typeof (n = this.refs[t]) == "string";) t = n;
		return n || this.schemas[t] || m.call(this, e, t);
	}
	function m(e, t) {
		let n = this.opts.uriResolver.parse(t), r = (0, i._getFullPath)(this.opts.uriResolver, n), a = (0, i.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
		if (Object.keys(e.schema).length > 0 && r === a) return g.call(this, n, e);
		let o = (0, i.normalizeId)(r), l = this.refs[o] || this.schemas[o];
		if (typeof l == "string") {
			let t = m.call(this, e, l);
			return typeof (t == null ? void 0 : t.schema) == "object" ? g.call(this, n, t) : void 0;
		}
		if (typeof (l == null ? void 0 : l.schema) == "object") {
			if (l.validate || c.call(this, l), o === (0, i.normalizeId)(t)) {
				let { schema: t } = l, { schemaId: n } = this.opts, r = t[n];
				return r && (a = (0, i.resolveUrl)(this.opts.uriResolver, a, r)), new s({
					schema: t,
					schemaId: n,
					root: e,
					baseId: a
				});
			}
			return g.call(this, n, l);
		}
	}
	e.resolveSchema = m;
	var h = new Set([
		"properties",
		"patternProperties",
		"enum",
		"dependencies",
		"definitions"
	]);
	function g(e, { baseId: t, schema: n, root: r }) {
		var o;
		if (((o = e.fragment) == null ? void 0 : o[0]) !== "/") return;
		for (let r of e.fragment.slice(1).split("/")) {
			if (typeof n == "boolean") return;
			let e = n[(0, a.unescapeFragment)(r)];
			if (e === void 0) return;
			n = e;
			let o = typeof n == "object" && n[this.opts.schemaId];
			!h.has(r) && o && (t = (0, i.resolveUrl)(this.opts.uriResolver, t, o));
		}
		let c;
		if (typeof n != "boolean" && n.$ref && !(0, a.schemaHasRulesButRef)(n, this.RULES)) {
			let e = (0, i.resolveUrl)(this.opts.uriResolver, t, n.$ref);
			c = m.call(this, r, e);
		}
		let { schemaId: l } = this.opts;
		if (c ||= new s({
			schema: n,
			schemaId: l,
			root: r,
			baseId: t
		}), c.schema !== c.root.schema) return c;
	}
})), zf = /* @__PURE__ */ c({
	$id: () => Bf,
	additionalProperties: () => !1,
	default: () => Gf,
	description: () => Vf,
	properties: () => Wf,
	required: () => Uf,
	type: () => Hf
}), Bf, Vf, Hf, Uf, Wf, Gf, Kf = o((() => {
	Bf = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Vf = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Hf = "object", Uf = ["$data"], Wf = { $data: {
		type: "string",
		anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
	} }, Gf = {
		$id: Bf,
		description: Vf,
		type: Hf,
		required: Uf,
		properties: Wf,
		additionalProperties: !1
	};
})), qf = /* @__PURE__ */ s(((e, t) => {
	/** @type {(value: string) => boolean} */
	var n = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), r = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
	/**
	* @param {Array<string>} input
	* @returns {string}
	*/
	function i(e) {
		let t = "", n = 0, r = 0;
		for (r = 0; r < e.length; r++) if (n = e[r].charCodeAt(0), n !== 48) {
			if (!(n >= 48 && n <= 57 || n >= 65 && n <= 70 || n >= 97 && n <= 102)) return "";
			t += e[r];
			break;
		}
		for (r += 1; r < e.length; r++) {
			if (n = e[r].charCodeAt(0), !(n >= 48 && n <= 57 || n >= 65 && n <= 70 || n >= 97 && n <= 102)) return "";
			t += e[r];
		}
		return t;
	}
	/**
	* @typedef {Object} GetIPV6Result
	* @property {boolean} error - Indicates if there was an error parsing the IPv6 address.
	* @property {string} address - The parsed IPv6 address.
	* @property {string} [zone] - The zone identifier, if present.
	*/
	/**
	* @param {string} value
	* @returns {boolean}
	*/
	var a = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
	/**
	* @param {Array<string>} buffer
	* @returns {boolean}
	*/
	function o(e) {
		return e.length = 0, !0;
	}
	/**
	* @param {Array<string>} buffer
	* @param {Array<string>} address
	* @param {GetIPV6Result} output
	* @returns {boolean}
	*/
	function s(e, t, n) {
		if (e.length) {
			let r = i(e);
			if (r !== "") t.push(r);
			else return n.error = !0, !1;
			e.length = 0;
		}
		return !0;
	}
	/**
	* @param {string} input
	* @returns {GetIPV6Result}
	*/
	function c(e) {
		let t = 0, n = {
			error: !1,
			address: "",
			zone: ""
		}, r = [], a = [], c = !1, l = !1, u = s;
		for (let i = 0; i < e.length; i++) {
			let s = e[i];
			if (!(s === "[" || s === "]")) if (s === ":") {
				if (c === !0 && (l = !0), !u(a, r, n)) break;
				if (++t > 7) {
					n.error = !0;
					break;
				}
				i > 0 && e[i - 1] === ":" && (c = !0), r.push(":");
				continue;
			} else if (s === "%") {
				if (!u(a, r, n)) break;
				u = o;
			} else {
				a.push(s);
				continue;
			}
		}
		return a.length && (u === o ? n.zone = a.join("") : l ? r.push(a.join("")) : r.push(i(a))), n.address = r.join(""), n;
	}
	/**
	* @typedef {Object} NormalizeIPv6Result
	* @property {string} host - The normalized host.
	* @property {string} [escapedHost] - The escaped host.
	* @property {boolean} isIPV6 - Indicates if the host is an IPv6 address.
	*/
	/**
	* @param {string} host
	* @returns {NormalizeIPv6Result}
	*/
	function l(e) {
		if (u(e, ":") < 2) return {
			host: e,
			isIPV6: !1
		};
		let t = c(e);
		if (t.error) return {
			host: e,
			isIPV6: !1
		};
		{
			let e = t.address, n = t.address;
			return t.zone && (e += "%" + t.zone, n += "%25" + t.zone), {
				host: e,
				isIPV6: !0,
				escapedHost: n
			};
		}
	}
	/**
	* @param {string} str
	* @param {string} token
	* @returns {number}
	*/
	function u(e, t) {
		let n = 0;
		for (let r = 0; r < e.length; r++) e[r] === t && n++;
		return n;
	}
	/**
	* @param {string} path
	* @returns {string}
	*
	* @see https://datatracker.ietf.org/doc/html/rfc3986#section-5.2.4
	*/
	function d(e) {
		let t = e, n = [], r = -1, i = 0;
		for (; i = t.length;) {
			if (i === 1) {
				if (t === ".") break;
				if (t === "/") {
					n.push("/");
					break;
				} else {
					n.push(t);
					break;
				}
			} else if (i === 2) {
				if (t[0] === ".") {
					if (t[1] === ".") break;
					if (t[1] === "/") {
						t = t.slice(2);
						continue;
					}
				} else if (t[0] === "/" && (t[1] === "." || t[1] === "/")) {
					n.push("/");
					break;
				}
			} else if (i === 3 && t === "/..") {
				n.length !== 0 && n.pop(), n.push("/");
				break;
			}
			if (t[0] === ".") {
				if (t[1] === ".") {
					if (t[2] === "/") {
						t = t.slice(3);
						continue;
					}
				} else if (t[1] === "/") {
					t = t.slice(2);
					continue;
				}
			} else if (t[0] === "/" && t[1] === ".") {
				if (t[2] === "/") {
					t = t.slice(2);
					continue;
				} else if (t[2] === "." && t[3] === "/") {
					t = t.slice(3), n.length !== 0 && n.pop();
					continue;
				}
			}
			if ((r = t.indexOf("/", 1)) === -1) {
				n.push(t);
				break;
			} else n.push(t.slice(0, r)), t = t.slice(r);
		}
		return n.join("");
	}
	/**
	* @param {import('../types/index').URIComponent} component
	* @param {boolean} esc
	* @returns {import('../types/index').URIComponent}
	*/
	function f(e, t) {
		let n = t === !0 ? unescape : escape;
		return e.scheme !== void 0 && (e.scheme = n(e.scheme)), e.userinfo !== void 0 && (e.userinfo = n(e.userinfo)), e.host !== void 0 && (e.host = n(e.host)), e.path !== void 0 && (e.path = n(e.path)), e.query !== void 0 && (e.query = n(e.query)), e.fragment !== void 0 && (e.fragment = n(e.fragment)), e;
	}
	/**
	* @param {import('../types/index').URIComponent} component
	* @returns {string|undefined}
	*/
	function p(e) {
		let t = [];
		if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
			let n = unescape(e.host);
			if (!r(n)) {
				let t = l(n);
				n = t.isIPV6 === !0 ? `[${t.escapedHost}]` : e.host;
			}
			t.push(n);
		}
		return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
	}
	t.exports = {
		nonSimpleDomain: a,
		recomposeAuthority: p,
		normalizeComponentEncoding: f,
		removeDotSegments: d,
		isIPv4: r,
		isUUID: n,
		normalizeIPv6: l,
		stringArrayToHexStripped: i
	};
})), Jf = /* @__PURE__ */ s(((e, t) => {
	var { isUUID: n } = qf(), r = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, i = [
		"http",
		"https",
		"ws",
		"wss",
		"urn",
		"urn:uuid"
	];
	/** @typedef {supportedSchemeNames[number]} SchemeName */
	/**
	* @param {string} name
	* @returns {name is SchemeName}
	*/
	function a(e) {
		return i.indexOf(e) !== -1;
	}
	/**
	* @callback SchemeFn
	* @param {import('../types/index').URIComponent} component
	* @param {import('../types/index').Options} options
	* @returns {import('../types/index').URIComponent}
	*/
	/**
	* @typedef {Object} SchemeHandler
	* @property {SchemeName} scheme - The scheme name.
	* @property {boolean} [domainHost] - Indicates if the scheme supports domain hosts.
	* @property {SchemeFn} parse - Function to parse the URI component for this scheme.
	* @property {SchemeFn} serialize - Function to serialize the URI component for this scheme.
	* @property {boolean} [skipNormalize] - Indicates if normalization should be skipped for this scheme.
	* @property {boolean} [absolutePath] - Indicates if the scheme uses absolute paths.
	* @property {boolean} [unicodeSupport] - Indicates if the scheme supports Unicode.
	*/
	/**
	* @param {import('../types/index').URIComponent} wsComponent
	* @returns {boolean}
	*/
	function o(e) {
		return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
	}
	/** @type {SchemeFn} */
	function s(e) {
		return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
	}
	/** @type {SchemeFn} */
	function c(e) {
		let t = String(e.scheme).toLowerCase() === "https";
		return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path ||= "/", e;
	}
	/** @type {SchemeFn} */
	function l(e) {
		return e.secure = o(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
	}
	/** @type {SchemeFn} */
	function u(e) {
		if ((e.port === (o(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
			let [t, n] = e.resourceName.split("?");
			e.path = t && t !== "/" ? t : void 0, e.query = n, e.resourceName = void 0;
		}
		return e.fragment = void 0, e;
	}
	/** @type {SchemeFn} */
	function d(e, t) {
		if (!e.path) return e.error = "URN can not be parsed", e;
		let n = e.path.match(r);
		if (n) {
			let r = t.scheme || e.scheme || "urn";
			e.nid = n[1].toLowerCase(), e.nss = n[2];
			let i = b(`${r}:${t.nid || e.nid}`);
			e.path = void 0, i && (e = i.parse(e, t));
		} else e.error = e.error || "URN can not be parsed.";
		return e;
	}
	/** @type {SchemeFn} */
	function f(e, t) {
		if (e.nid === void 0) throw Error("URN without nid cannot be serialized");
		let n = t.scheme || e.scheme || "urn", r = e.nid.toLowerCase(), i = b(`${n}:${t.nid || r}`);
		i && (e = i.serialize(e, t));
		let a = e, o = e.nss;
		return a.path = `${r || t.nid}:${o}`, t.skipEscape = !0, a;
	}
	/** @type {SchemeFn} */
	function p(e, t) {
		let r = e;
		return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !n(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
	}
	/** @type {SchemeFn} */
	function m(e) {
		let t = e;
		return t.nss = (e.uuid || "").toLowerCase(), t;
	}
	var h = {
		scheme: "http",
		domainHost: !0,
		parse: s,
		serialize: c
	}, g = {
		scheme: "https",
		domainHost: h.domainHost,
		parse: s,
		serialize: c
	}, _ = {
		scheme: "ws",
		domainHost: !0,
		parse: l,
		serialize: u
	}, v = {
		scheme: "wss",
		domainHost: _.domainHost,
		parse: _.parse,
		serialize: _.serialize
	}, ee = {
		scheme: "urn",
		parse: d,
		serialize: f,
		skipNormalize: !0
	}, te = {
		scheme: "urn:uuid",
		parse: p,
		serialize: m,
		skipNormalize: !0
	}, y = {
		http: h,
		https: g,
		ws: _,
		wss: v,
		urn: ee,
		"urn:uuid": te
	};
	Object.setPrototypeOf(y, null);
	/**
	* @param {string|undefined} scheme
	* @returns {SchemeHandler|undefined}
	*/
	function b(e) {
		return e && (y[e] || y[e.toLowerCase()]) || void 0;
	}
	t.exports = {
		wsIsSecure: o,
		SCHEMES: y,
		isValidSchemeName: a,
		getSchemeHandler: b
	};
})), Yf = /* @__PURE__ */ s(((e, t) => {
	var { normalizeIPv6: n, removeDotSegments: r, recomposeAuthority: i, normalizeComponentEncoding: a, isIPv4: o, nonSimpleDomain: s } = qf(), { SCHEMES: c, getSchemeHandler: l } = Jf();
	/**
	* @template {import('./types/index').URIComponent|string} T
	* @param {T} uri
	* @param {import('./types/index').Options} [options]
	* @returns {T}
	*/
	function u(e, t) {
		return typeof e == "string" ? e = m(g(e, t), t) : typeof e == "object" && (e = g(m(e, t), t)), e;
	}
	/**
	* @param {string} baseURI
	* @param {string} relativeURI
	* @param {import('./types/index').Options} [options]
	* @returns {string}
	*/
	function d(e, t, n) {
		let r = n ? Object.assign({ scheme: "null" }, n) : { scheme: "null" }, i = f(g(e, r), g(t, r), r, !0);
		return r.skipEscape = !0, m(i, r);
	}
	/**
	* @param {import ('./types/index').URIComponent} base
	* @param {import ('./types/index').URIComponent} relative
	* @param {import('./types/index').Options} [options]
	* @param {boolean} [skipNormalization=false]
	* @returns {import ('./types/index').URIComponent}
	*/
	function f(e, t, n, i) {
		/** @type {import('./types/index').URIComponent} */
		let a = {};
		return i || (e = g(m(e, n), n), t = g(m(t, n), n)), n ||= {}, !n.tolerant && t.scheme ? (a.scheme = t.scheme, a.userinfo = t.userinfo, a.host = t.host, a.port = t.port, a.path = r(t.path || ""), a.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (a.userinfo = t.userinfo, a.host = t.host, a.port = t.port, a.path = r(t.path || ""), a.query = t.query) : (t.path ? (t.path[0] === "/" ? a.path = r(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? a.path = "/" + t.path : e.path ? a.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : a.path = t.path, a.path = r(a.path)), a.query = t.query) : (a.path = e.path, t.query === void 0 ? a.query = e.query : a.query = t.query), a.userinfo = e.userinfo, a.host = e.host, a.port = e.port), a.scheme = e.scheme), a.fragment = t.fragment, a;
	}
	/**
	* @param {import ('./types/index').URIComponent|string} uriA
	* @param {import ('./types/index').URIComponent|string} uriB
	* @param {import ('./types/index').Options} options
	* @returns {boolean}
	*/
	function p(e, t, n) {
		return typeof e == "string" ? (e = unescape(e), e = m(a(g(e, n), !0), {
			...n,
			skipEscape: !0
		})) : typeof e == "object" && (e = m(a(e, !0), {
			...n,
			skipEscape: !0
		})), typeof t == "string" ? (t = unescape(t), t = m(a(g(t, n), !0), {
			...n,
			skipEscape: !0
		})) : typeof t == "object" && (t = m(a(t, !0), {
			...n,
			skipEscape: !0
		})), e.toLowerCase() === t.toLowerCase();
	}
	/**
	* @param {Readonly<import('./types/index').URIComponent>} cmpts
	* @param {import('./types/index').Options} [opts]
	* @returns {string}
	*/
	function m(e, t) {
		let n = {
			host: e.host,
			scheme: e.scheme,
			userinfo: e.userinfo,
			port: e.port,
			path: e.path,
			query: e.query,
			nid: e.nid,
			nss: e.nss,
			uuid: e.uuid,
			fragment: e.fragment,
			reference: e.reference,
			resourceName: e.resourceName,
			secure: e.secure,
			error: ""
		}, a = Object.assign({}, t), o = [], s = l(a.scheme || n.scheme);
		s && s.serialize && s.serialize(n, a), n.path !== void 0 && (a.skipEscape ? n.path = unescape(n.path) : (n.path = escape(n.path), n.scheme !== void 0 && (n.path = n.path.split("%3A").join(":")))), a.reference !== "suffix" && n.scheme && o.push(n.scheme, ":");
		let c = i(n);
		if (c !== void 0 && (a.reference !== "suffix" && o.push("//"), o.push(c), n.path && n.path[0] !== "/" && o.push("/")), n.path !== void 0) {
			let e = n.path;
			!a.absolutePath && (!s || !s.absolutePath) && (e = r(e)), c === void 0 && e[0] === "/" && e[1] === "/" && (e = "/%2F" + e.slice(2)), o.push(e);
		}
		return n.query !== void 0 && o.push("?", n.query), n.fragment !== void 0 && o.push("#", n.fragment), o.join("");
	}
	var h = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
	/**
	* @param {string} uri
	* @param {import('./types/index').Options} [opts]
	* @returns
	*/
	function g(e, t) {
		let r = Object.assign({}, t), i = {
			scheme: void 0,
			userinfo: void 0,
			host: "",
			port: void 0,
			path: "",
			query: void 0,
			fragment: void 0
		}, a = !1;
		r.reference === "suffix" && (e = r.scheme ? r.scheme + ":" + e : "//" + e);
		let c = e.match(h);
		if (c) {
			if (i.scheme = c[1], i.userinfo = c[3], i.host = c[4], i.port = parseInt(c[5], 10), i.path = c[6] || "", i.query = c[7], i.fragment = c[8], isNaN(i.port) && (i.port = c[5]), i.host) if (o(i.host) === !1) {
				let e = n(i.host);
				i.host = e.host.toLowerCase(), a = e.isIPV6;
			} else a = !0;
			i.scheme === void 0 && i.userinfo === void 0 && i.host === void 0 && i.port === void 0 && i.query === void 0 && !i.path ? i.reference = "same-document" : i.scheme === void 0 ? i.reference = "relative" : i.fragment === void 0 ? i.reference = "absolute" : i.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== i.reference && (i.error = i.error || "URI is not a " + r.reference + " reference.");
			let t = l(r.scheme || i.scheme);
			if (!r.unicodeSupport && (!t || !t.unicodeSupport) && i.host && (r.domainHost || t && t.domainHost) && a === !1 && s(i.host)) try {
				i.host = URL.domainToASCII(i.host.toLowerCase());
			} catch (e) {
				i.error = i.error || "Host's domain name can not be converted to ASCII: " + e;
			}
			(!t || t && !t.skipNormalize) && (e.indexOf("%") !== -1 && (i.scheme !== void 0 && (i.scheme = unescape(i.scheme)), i.host !== void 0 && (i.host = unescape(i.host))), i.path &&= escape(unescape(i.path)), i.fragment &&= encodeURI(decodeURIComponent(i.fragment))), t && t.parse && t.parse(i, r);
		} else i.error = i.error || "URI can not be parsed.";
		return i;
	}
	var _ = {
		SCHEMES: c,
		normalize: u,
		resolve: d,
		resolveComponent: f,
		equal: p,
		serialize: m,
		parse: g
	};
	t.exports = _, t.exports.default = _, t.exports.fastUri = _;
})), Xf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Yf();
	t.code = "require(\"ajv/dist/runtime/uri\").default", e.default = t;
})), Zf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
	var t = Ff();
	Object.defineProperty(e, "KeywordCxt", {
		enumerable: !0,
		get: function() {
			return t.KeywordCxt;
		}
	});
	var n = Q();
	Object.defineProperty(e, "_", {
		enumerable: !0,
		get: function() {
			return n._;
		}
	}), Object.defineProperty(e, "str", {
		enumerable: !0,
		get: function() {
			return n.str;
		}
	}), Object.defineProperty(e, "stringify", {
		enumerable: !0,
		get: function() {
			return n.stringify;
		}
	}), Object.defineProperty(e, "nil", {
		enumerable: !0,
		get: function() {
			return n.nil;
		}
	}), Object.defineProperty(e, "Name", {
		enumerable: !0,
		get: function() {
			return n.Name;
		}
	}), Object.defineProperty(e, "CodeGen", {
		enumerable: !0,
		get: function() {
			return n.CodeGen;
		}
	});
	var r = If(), i = Lf(), a = Tf(), o = Rf(), s = Q(), c = Pf(), l = Df(), u = $(), f = (Kf(), d(zf).default), p = Xf(), m = (e, t) => new RegExp(e, t);
	m.code = "new RegExp";
	var h = [
		"removeAdditional",
		"useDefaults",
		"coerceTypes"
	], g = new Set([
		"validate",
		"serialize",
		"parse",
		"wrapper",
		"root",
		"schema",
		"keyword",
		"pattern",
		"formats",
		"validate$data",
		"func",
		"obj",
		"Error"
	]), _ = {
		errorDataPath: "",
		format: "`validateFormats: false` can be used instead.",
		nullable: "\"nullable\" keyword is supported by default.",
		jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
		extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
		missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
		processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
		sourceCode: "Use option `code: {source: true}`",
		strictDefaults: "It is default now, see option `strict`.",
		strictKeywords: "It is default now, see option `strict`.",
		uniqueItems: "\"uniqueItems\" keyword is always validated.",
		unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
		cache: "Map is used as cache, schema object as key.",
		serialize: "Map is used as cache, schema object as key.",
		ajvErrors: "It is default now."
	}, v = {
		ignoreKeywordsWithRef: "",
		jsPropertySyntax: "",
		unicode: "\"minLength\"/\"maxLength\" account for unicode characters by default."
	}, ee = 200;
	function te(e) {
		var t, n;
		let r = e.strict, i = (t = e.code) == null ? void 0 : t.optimize, a = i === !0 || i === void 0 ? 1 : i || 0, o = ((n = e.code) == null ? void 0 : n.regExp) ?? m, s = e.uriResolver ?? p.default;
		return {
			strictSchema: e.strictSchema ?? r ?? !0,
			strictNumbers: e.strictNumbers ?? r ?? !0,
			strictTypes: e.strictTypes ?? r ?? "log",
			strictTuples: e.strictTuples ?? r ?? "log",
			strictRequired: e.strictRequired ?? r ?? !1,
			code: e.code ? {
				...e.code,
				optimize: a,
				regExp: o
			} : {
				optimize: a,
				regExp: o
			},
			loopRequired: e.loopRequired ?? ee,
			loopEnum: e.loopEnum ?? ee,
			meta: e.meta ?? !0,
			messages: e.messages ?? !0,
			inlineRefs: e.inlineRefs ?? !0,
			schemaId: e.schemaId ?? "$id",
			addUsedSchema: e.addUsedSchema ?? !0,
			validateSchema: e.validateSchema ?? !0,
			validateFormats: e.validateFormats ?? !0,
			unicodeRegExp: e.unicodeRegExp ?? !0,
			int32range: e.int32range ?? !0,
			uriResolver: s
		};
	}
	var y = class {
		constructor(e = {}) {
			this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), e = this.opts = {
				...e,
				...te(e)
			};
			let { es5: t, lines: n } = this.opts.code;
			this.scope = new s.ValueScope({
				scope: {},
				prefixes: g,
				es5: t,
				lines: n
			}), this.logger = ae(e.logger);
			let r = e.validateFormats;
			e.validateFormats = !1, this.RULES = (0, a.getRules)(), b.call(this, _, e, "NOT SUPPORTED"), b.call(this, v, e, "DEPRECATED", "warn"), this._metaOpts = re.call(this), e.formats && ne.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), e.keywords && C.call(this, e.keywords), typeof e.meta == "object" && this.addMetaSchema(e.meta), S.call(this), e.validateFormats = r;
		}
		_addVocabularies() {
			this.addKeyword("$async");
		}
		_addDefaultMetaSchema() {
			let { $data: e, meta: t, schemaId: n } = this.opts, r = f;
			n === "id" && (r = { ...f }, r.id = r.$id, delete r.$id), t && e && this.addMetaSchema(r, r[n], !1);
		}
		defaultMeta() {
			let { meta: e, schemaId: t } = this.opts;
			return this.opts.defaultMeta = typeof e == "object" ? e[t] || e : void 0;
		}
		validate(e, t) {
			let n;
			if (typeof e == "string") {
				if (n = this.getSchema(e), !n) throw Error(`no schema with key or ref "${e}"`);
			} else n = this.compile(e);
			let r = n(t);
			return "$async" in n || (this.errors = n.errors), r;
		}
		compile(e, t) {
			let n = this._addSchema(e, t);
			return n.validate || this._compileSchemaEnv(n);
		}
		compileAsync(e, t) {
			if (typeof this.opts.loadSchema != "function") throw Error("options.loadSchema should be a function");
			let { loadSchema: n } = this.opts;
			return r.call(this, e, t);
			async function r(e, t) {
				await a.call(this, e.$schema);
				let n = this._addSchema(e, t);
				return n.validate || o.call(this, n);
			}
			async function a(e) {
				e && !this.getSchema(e) && await r.call(this, { $ref: e }, !0);
			}
			async function o(e) {
				try {
					return this._compileSchemaEnv(e);
				} catch (t) {
					if (!(t instanceof i.default)) throw t;
					return s.call(this, t), await c.call(this, t.missingSchema), o.call(this, e);
				}
			}
			function s({ missingSchema: e, missingRef: t }) {
				if (this.refs[e]) throw Error(`AnySchema ${e} is loaded but ${t} cannot be resolved`);
			}
			async function c(e) {
				let n = await l.call(this, e);
				this.refs[e] || await a.call(this, n.$schema), this.refs[e] || this.addSchema(n, e, t);
			}
			async function l(e) {
				let t = this._loading[e];
				if (t) return t;
				try {
					return await (this._loading[e] = n(e));
				} finally {
					delete this._loading[e];
				}
			}
		}
		addSchema(e, t, n, r = this.opts.validateSchema) {
			if (Array.isArray(e)) {
				for (let t of e) this.addSchema(t, void 0, n, r);
				return this;
			}
			let i;
			if (typeof e == "object") {
				let { schemaId: t } = this.opts;
				if (i = e[t], i !== void 0 && typeof i != "string") throw Error(`schema ${t} must be string`);
			}
			return t = (0, c.normalizeId)(t || i), this._checkUnique(t), this.schemas[t] = this._addSchema(e, n, t, r, !0), this;
		}
		addMetaSchema(e, t, n = this.opts.validateSchema) {
			return this.addSchema(e, t, !0, n), this;
		}
		validateSchema(e, t) {
			if (typeof e == "boolean") return !0;
			let n;
			if (n = e.$schema, n !== void 0 && typeof n != "string") throw Error("$schema must be a string");
			if (n = n || this.opts.defaultMeta || this.defaultMeta(), !n) return this.logger.warn("meta-schema not available"), this.errors = null, !0;
			let r = this.validate(n, e);
			if (!r && t) {
				let e = "schema is invalid: " + this.errorsText();
				if (this.opts.validateSchema === "log") this.logger.error(e);
				else throw Error(e);
			}
			return r;
		}
		getSchema(e) {
			let t;
			for (; typeof (t = x.call(this, e)) == "string";) e = t;
			if (t === void 0) {
				let { schemaId: n } = this.opts, r = new o.SchemaEnv({
					schema: {},
					schemaId: n
				});
				if (t = o.resolveSchema.call(this, r, e), !t) return;
				this.refs[e] = t;
			}
			return t.validate || this._compileSchemaEnv(t);
		}
		removeSchema(e) {
			if (e instanceof RegExp) return this._removeAllSchemas(this.schemas, e), this._removeAllSchemas(this.refs, e), this;
			switch (typeof e) {
				case "undefined": return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
				case "string": {
					let t = x.call(this, e);
					return typeof t == "object" && this._cache.delete(t.schema), delete this.schemas[e], delete this.refs[e], this;
				}
				case "object": {
					let t = e;
					this._cache.delete(t);
					let n = e[this.opts.schemaId];
					return n && (n = (0, c.normalizeId)(n), delete this.schemas[n], delete this.refs[n]), this;
				}
				default: throw Error("ajv.removeSchema: invalid parameter");
			}
		}
		addVocabulary(e) {
			for (let t of e) this.addKeyword(t);
			return this;
		}
		addKeyword(e, t) {
			let n;
			if (typeof e == "string") n = e, typeof t == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), t.keyword = n);
			else if (typeof e == "object" && t === void 0) {
				if (t = e, n = t.keyword, Array.isArray(n) && !n.length) throw Error("addKeywords: keyword must be string or non-empty array");
			} else throw Error("invalid addKeywords parameters");
			if (w.call(this, n, t), !t) return (0, u.eachItem)(n, (e) => se.call(this, e)), this;
			T.call(this, t);
			let r = {
				...t,
				type: (0, l.getJSONTypes)(t.type),
				schemaType: (0, l.getJSONTypes)(t.schemaType)
			};
			return (0, u.eachItem)(n, r.type.length === 0 ? (e) => se.call(this, e, r) : (e) => r.type.forEach((t) => se.call(this, e, r, t))), this;
		}
		getKeyword(e) {
			let t = this.RULES.all[e];
			return typeof t == "object" ? t.definition : !!t;
		}
		removeKeyword(e) {
			let { RULES: t } = this;
			delete t.keywords[e], delete t.all[e];
			for (let n of t.rules) {
				let t = n.rules.findIndex((t) => t.keyword === e);
				t >= 0 && n.rules.splice(t, 1);
			}
			return this;
		}
		addFormat(e, t) {
			return typeof t == "string" && (t = new RegExp(t)), this.formats[e] = t, this;
		}
		errorsText(e = this.errors, { separator: t = ", ", dataVar: n = "data" } = {}) {
			return !e || e.length === 0 ? "No errors" : e.map((e) => `${n}${e.instancePath} ${e.message}`).reduce((e, n) => e + t + n);
		}
		$dataMetaSchema(e, t) {
			let n = this.RULES.all;
			e = JSON.parse(JSON.stringify(e));
			for (let r of t) {
				let t = r.split("/").slice(1), i = e;
				for (let e of t) i = i[e];
				for (let e in n) {
					let t = n[e];
					if (typeof t != "object") continue;
					let { $data: r } = t.definition, a = i[e];
					r && a && (i[e] = le(a));
				}
			}
			return e;
		}
		_removeAllSchemas(e, t) {
			for (let n in e) {
				let r = e[n];
				(!t || t.test(n)) && (typeof r == "string" ? delete e[n] : r && !r.meta && (this._cache.delete(r.schema), delete e[n]));
			}
		}
		_addSchema(e, t, n, r = this.opts.validateSchema, i = this.opts.addUsedSchema) {
			let a, { schemaId: s } = this.opts;
			if (typeof e == "object") a = e[s];
			else if (this.opts.jtd) throw Error("schema must be object");
			else if (typeof e != "boolean") throw Error("schema must be object or boolean");
			let l = this._cache.get(e);
			if (l !== void 0) return l;
			n = (0, c.normalizeId)(a || n);
			let u = c.getSchemaRefs.call(this, e, n);
			return l = new o.SchemaEnv({
				schema: e,
				schemaId: s,
				meta: t,
				baseId: n,
				localRefs: u
			}), this._cache.set(l.schema, l), i && !n.startsWith("#") && (n && this._checkUnique(n), this.refs[n] = l), r && this.validateSchema(e, !0), l;
		}
		_checkUnique(e) {
			if (this.schemas[e] || this.refs[e]) throw Error(`schema with key or id "${e}" already exists`);
		}
		_compileSchemaEnv(e) {
			/* istanbul ignore if */
			if (e.meta ? this._compileMetaSchema(e) : o.compileSchema.call(this, e), !e.validate) throw Error("ajv implementation error");
			return e.validate;
		}
		_compileMetaSchema(e) {
			let t = this.opts;
			this.opts = this._metaOpts;
			try {
				o.compileSchema.call(this, e);
			} finally {
				this.opts = t;
			}
		}
	};
	y.ValidationError = r.default, y.MissingRefError = i.default, e.default = y;
	function b(e, t, n, r = "error") {
		for (let i in e) {
			let a = i;
			a in t && this.logger[r](`${n}: option ${i}. ${e[a]}`);
		}
	}
	function x(e) {
		return e = (0, c.normalizeId)(e), this.schemas[e] || this.refs[e];
	}
	function S() {
		let e = this.opts.schemas;
		if (e) if (Array.isArray(e)) this.addSchema(e);
		else for (let t in e) this.addSchema(e[t], t);
	}
	function ne() {
		for (let e in this.opts.formats) {
			let t = this.opts.formats[e];
			t && this.addFormat(e, t);
		}
	}
	function C(e) {
		if (Array.isArray(e)) {
			this.addVocabulary(e);
			return;
		}
		this.logger.warn("keywords option as map is deprecated, pass array");
		for (let t in e) {
			let n = e[t];
			n.keyword ||= t, this.addKeyword(n);
		}
	}
	function re() {
		let e = { ...this.opts };
		for (let t of h) delete e[t];
		return e;
	}
	var ie = {
		log() {},
		warn() {},
		error() {}
	};
	function ae(e) {
		if (e === !1) return ie;
		if (e === void 0) return console;
		if (e.log && e.warn && e.error) return e;
		throw Error("logger must implement log, warn and error methods");
	}
	var oe = /^[a-z_$][a-z0-9_$:-]*$/i;
	function w(e, t) {
		let { RULES: n } = this;
		if ((0, u.eachItem)(e, (e) => {
			if (n.keywords[e]) throw Error(`Keyword ${e} is already defined`);
			if (!oe.test(e)) throw Error(`Keyword ${e} has invalid name`);
		}), t && t.$data && !("code" in t || "validate" in t)) throw Error("$data keyword must have \"code\" or \"validate\" function");
	}
	function se(e, t, n) {
		var r;
		let i = t == null ? void 0 : t.post;
		if (n && i) throw Error("keyword with \"post\" flag cannot have \"type\"");
		let { RULES: a } = this, o = i ? a.post : a.rules.find(({ type: e }) => e === n);
		if (o || (o = {
			type: n,
			rules: []
		}, a.rules.push(o)), a.keywords[e] = !0, !t) return;
		let s = {
			keyword: e,
			definition: {
				...t,
				type: (0, l.getJSONTypes)(t.type),
				schemaType: (0, l.getJSONTypes)(t.schemaType)
			}
		};
		t.before ? ce.call(this, o, s, t.before) : o.rules.push(s), a.all[e] = s, (r = t.implements) == null || r.forEach((e) => this.addKeyword(e));
	}
	function ce(e, t, n) {
		let r = e.rules.findIndex((e) => e.keyword === n);
		r >= 0 ? e.rules.splice(r, 0, t) : (e.rules.push(t), this.logger.warn(`rule ${n} is not defined`));
	}
	function T(e) {
		let { metaSchema: t } = e;
		t !== void 0 && (e.$data && this.opts.$data && (t = le(t)), e.validateSchema = this.compile(t, !0));
	}
	var E = { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" };
	function le(e) {
		return { anyOf: [e, E] };
	}
})), Qf = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.default = {
		keyword: "id",
		code() {
			throw Error("NOT SUPPORTED: keyword \"id\", use \"$id\" for schema ID");
		}
	};
})), $f = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.callRef = e.getValidate = void 0;
	var t = Lf(), n = kf(), r = Q(), i = Sf(), a = Rf(), o = $(), s = {
		keyword: "$ref",
		schemaType: "string",
		code(e) {
			let { gen: n, schema: i, it: o } = e, { baseId: s, schemaEnv: u, validateName: d, opts: f, self: p } = o, { root: m } = u;
			if ((i === "#" || i === "#/") && s === m.baseId) return g();
			let h = a.resolveRef.call(p, m, s, i);
			if (h === void 0) throw new t.default(o.opts.uriResolver, s, i);
			if (h instanceof a.SchemaEnv) return _(h);
			return v(h);
			function g() {
				if (u === m) return l(e, d, u, u.$async);
				let t = n.scopeValue("root", { ref: m });
				return l(e, (0, r._)`${t}.validate`, m, m.$async);
			}
			function _(t) {
				l(e, c(e, t), t, t.$async);
			}
			function v(t) {
				let a = n.scopeValue("schema", f.code.source === !0 ? {
					ref: t,
					code: (0, r.stringify)(t)
				} : { ref: t }), o = n.name("valid"), s = e.subschema({
					schema: t,
					dataTypes: [],
					schemaPath: r.nil,
					topSchemaRef: a,
					errSchemaPath: i
				}, o);
				e.mergeEvaluated(s), e.ok(o);
			}
		}
	};
	function c(e, t) {
		let { gen: n } = e;
		return t.validate ? n.scopeValue("validate", { ref: t.validate }) : (0, r._)`${n.scopeValue("wrapper", { ref: t })}.validate`;
	}
	e.getValidate = c;
	function l(e, t, a, s) {
		let { gen: c, it: l } = e, { allErrors: u, schemaEnv: d, opts: f } = l, p = f.passContext ? i.default.this : r.nil;
		s ? m() : h();
		function m() {
			if (!d.$async) throw Error("async schema referenced by sync schema");
			let i = c.let("valid");
			c.try(() => {
				c.code((0, r._)`await ${(0, n.callValidateCode)(e, t, p)}`), _(t), u || c.assign(i, !0);
			}, (e) => {
				c.if((0, r._)`!(${e} instanceof ${l.ValidationError})`, () => c.throw(e)), g(e), u || c.assign(i, !1);
			}), e.ok(i);
		}
		function h() {
			e.result((0, n.callValidateCode)(e, t, p), () => _(t), () => g(t));
		}
		function g(e) {
			let t = (0, r._)`${e}.errors`;
			c.assign(i.default.vErrors, (0, r._)`${i.default.vErrors} === null ? ${t} : ${i.default.vErrors}.concat(${t})`), c.assign(i.default.errors, (0, r._)`${i.default.vErrors}.length`);
		}
		function _(e) {
			var t;
			if (!l.opts.unevaluated) return;
			let n = (t = a == null ? void 0 : a.validate) == null ? void 0 : t.evaluated;
			if (l.props !== !0) if (n && !n.dynamicProps) n.props !== void 0 && (l.props = o.mergeEvaluated.props(c, n.props, l.props));
			else {
				let t = c.var("props", (0, r._)`${e}.evaluated.props`);
				l.props = o.mergeEvaluated.props(c, t, l.props, r.Name);
			}
			if (l.items !== !0) if (n && !n.dynamicItems) n.items !== void 0 && (l.items = o.mergeEvaluated.items(c, n.items, l.items));
			else {
				let t = c.var("items", (0, r._)`${e}.evaluated.items`);
				l.items = o.mergeEvaluated.items(c, t, l.items, r.Name);
			}
		}
	}
	e.callRef = l, e.default = s;
})), ep = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Qf(), n = $f();
	e.default = [
		"$schema",
		"$id",
		"$defs",
		"$vocabulary",
		{ keyword: "$comment" },
		"definitions",
		t.default,
		n.default
	];
})), tp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = t.operators, r = {
		maximum: {
			okStr: "<=",
			ok: n.LTE,
			fail: n.GT
		},
		minimum: {
			okStr: ">=",
			ok: n.GTE,
			fail: n.LT
		},
		exclusiveMaximum: {
			okStr: "<",
			ok: n.LT,
			fail: n.GTE
		},
		exclusiveMinimum: {
			okStr: ">",
			ok: n.GT,
			fail: n.LTE
		}
	};
	e.default = {
		keyword: Object.keys(r),
		type: "number",
		schemaType: "number",
		$data: !0,
		error: {
			message: ({ keyword: e, schemaCode: n }) => (0, t.str)`must be ${r[e].okStr} ${n}`,
			params: ({ keyword: e, schemaCode: n }) => (0, t._)`{comparison: ${r[e].okStr}, limit: ${n}}`
		},
		code(e) {
			let { keyword: n, data: i, schemaCode: a } = e;
			e.fail$data((0, t._)`${i} ${r[n].fail} ${a} || isNaN(${i})`);
		}
	};
})), np = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q();
	e.default = {
		keyword: "multipleOf",
		type: "number",
		schemaType: "number",
		$data: !0,
		error: {
			message: ({ schemaCode: e }) => (0, t.str)`must be multiple of ${e}`,
			params: ({ schemaCode: e }) => (0, t._)`{multipleOf: ${e}}`
		},
		code(e) {
			let { gen: n, data: r, schemaCode: i, it: a } = e, o = a.opts.multipleOfPrecision, s = n.let("res"), c = o ? (0, t._)`Math.abs(Math.round(${s}) - ${s}) > 1e-${o}` : (0, t._)`${s} !== parseInt(${s})`;
			e.fail$data((0, t._)`(${i} === 0 || (${s} = ${r}/${i}, ${c}))`);
		}
	};
})), rp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	function t(e) {
		let t = e.length, n = 0, r = 0, i;
		for (; r < t;) n++, i = e.charCodeAt(r++), i >= 55296 && i <= 56319 && r < t && (i = e.charCodeAt(r), (i & 64512) == 56320 && r++);
		return n;
	}
	e.default = t, t.code = "require(\"ajv/dist/runtime/ucs2length\").default";
})), ip = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = $(), r = rp();
	e.default = {
		keyword: ["maxLength", "minLength"],
		type: "string",
		schemaType: "number",
		$data: !0,
		error: {
			message({ keyword: e, schemaCode: n }) {
				let r = e === "maxLength" ? "more" : "fewer";
				return (0, t.str)`must NOT have ${r} than ${n} characters`;
			},
			params: ({ schemaCode: e }) => (0, t._)`{limit: ${e}}`
		},
		code(e) {
			let { keyword: i, data: a, schemaCode: o, it: s } = e, c = i === "maxLength" ? t.operators.GT : t.operators.LT, l = s.opts.unicode === !1 ? (0, t._)`${a}.length` : (0, t._)`${(0, n.useFunc)(e.gen, r.default)}(${a})`;
			e.fail$data((0, t._)`${l} ${c} ${o}`);
		}
	};
})), ap = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = kf(), n = $(), r = Q();
	e.default = {
		keyword: "pattern",
		type: "string",
		schemaType: "string",
		$data: !0,
		error: {
			message: ({ schemaCode: e }) => (0, r.str)`must match pattern "${e}"`,
			params: ({ schemaCode: e }) => (0, r._)`{pattern: ${e}}`
		},
		code(e) {
			let { gen: i, data: a, $data: o, schema: s, schemaCode: c, it: l } = e, u = l.opts.unicodeRegExp ? "u" : "";
			if (o) {
				let { regExp: t } = l.opts.code, o = t.code === "new RegExp" ? (0, r._)`new RegExp` : (0, n.useFunc)(i, t), s = i.let("valid");
				i.try(() => i.assign(s, (0, r._)`${o}(${c}, ${u}).test(${a})`), () => i.assign(s, !1)), e.fail$data((0, r._)`!${s}`);
			} else {
				let n = (0, t.usePattern)(e, s);
				e.fail$data((0, r._)`!${n}.test(${a})`);
			}
		}
	};
})), op = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q();
	e.default = {
		keyword: ["maxProperties", "minProperties"],
		type: "object",
		schemaType: "number",
		$data: !0,
		error: {
			message({ keyword: e, schemaCode: n }) {
				let r = e === "maxProperties" ? "more" : "fewer";
				return (0, t.str)`must NOT have ${r} than ${n} properties`;
			},
			params: ({ schemaCode: e }) => (0, t._)`{limit: ${e}}`
		},
		code(e) {
			let { keyword: n, data: r, schemaCode: i } = e, a = n === "maxProperties" ? t.operators.GT : t.operators.LT;
			e.fail$data((0, t._)`Object.keys(${r}).length ${a} ${i}`);
		}
	};
})), sp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = kf(), n = Q(), r = $();
	e.default = {
		keyword: "required",
		type: "object",
		schemaType: "array",
		$data: !0,
		error: {
			message: ({ params: { missingProperty: e } }) => (0, n.str)`must have required property '${e}'`,
			params: ({ params: { missingProperty: e } }) => (0, n._)`{missingProperty: ${e}}`
		},
		code(e) {
			let { gen: i, schema: a, schemaCode: o, data: s, $data: c, it: l } = e, { opts: u } = l;
			if (!c && a.length === 0) return;
			let d = a.length >= u.loopRequired;
			if (l.allErrors ? f() : p(), u.strictRequired) {
				let t = e.parentSchema.properties, { definedProperties: n } = e.it;
				for (let e of a) if ((t == null ? void 0 : t[e]) === void 0 && !n.has(e)) {
					let t = `required property "${e}" is not defined at "${l.schemaEnv.baseId + l.errSchemaPath}" (strictRequired)`;
					(0, r.checkStrictMode)(l, t, l.opts.strictRequired);
				}
			}
			function f() {
				if (d || c) e.block$data(n.nil, m);
				else for (let n of a) (0, t.checkReportMissingProp)(e, n);
			}
			function p() {
				let n = i.let("missing");
				if (d || c) {
					let t = i.let("valid", !0);
					e.block$data(t, () => h(n, t)), e.ok(t);
				} else i.if((0, t.checkMissingProp)(e, a, n)), (0, t.reportMissingProp)(e, n), i.else();
			}
			function m() {
				i.forOf("prop", o, (n) => {
					e.setParams({ missingProperty: n }), i.if((0, t.noPropertyInData)(i, s, n, u.ownProperties), () => e.error());
				});
			}
			function h(r, a) {
				e.setParams({ missingProperty: r }), i.forOf(r, o, () => {
					i.assign(a, (0, t.propertyInData)(i, s, r, u.ownProperties)), i.if((0, n.not)(a), () => {
						e.error(), i.break();
					});
				}, n.nil);
			}
		}
	};
})), cp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q();
	e.default = {
		keyword: ["maxItems", "minItems"],
		type: "array",
		schemaType: "number",
		$data: !0,
		error: {
			message({ keyword: e, schemaCode: n }) {
				let r = e === "maxItems" ? "more" : "fewer";
				return (0, t.str)`must NOT have ${r} than ${n} items`;
			},
			params: ({ schemaCode: e }) => (0, t._)`{limit: ${e}}`
		},
		code(e) {
			let { keyword: n, data: r, schemaCode: i } = e, a = n === "maxItems" ? t.operators.GT : t.operators.LT;
			e.fail$data((0, t._)`${r}.length ${a} ${i}`);
		}
	};
})), lp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Mf();
	t.code = "require(\"ajv/dist/runtime/equal\").default", e.default = t;
})), up = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Df(), n = Q(), r = $(), i = lp();
	e.default = {
		keyword: "uniqueItems",
		type: "array",
		schemaType: "boolean",
		$data: !0,
		error: {
			message: ({ params: { i: e, j: t } }) => (0, n.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
			params: ({ params: { i: e, j: t } }) => (0, n._)`{i: ${e}, j: ${t}}`
		},
		code(e) {
			let { gen: a, data: o, $data: s, schema: c, parentSchema: l, schemaCode: u, it: d } = e;
			if (!s && !c) return;
			let f = a.let("valid"), p = l.items ? (0, t.getSchemaTypes)(l.items) : [];
			e.block$data(f, m, (0, n._)`${u} === false`), e.ok(f);
			function m() {
				let t = a.let("i", (0, n._)`${o}.length`), r = a.let("j");
				e.setParams({
					i: t,
					j: r
				}), a.assign(f, !0), a.if((0, n._)`${t} > 1`, () => (h() ? g : _)(t, r));
			}
			function h() {
				return p.length > 0 && !p.some((e) => e === "object" || e === "array");
			}
			function g(r, i) {
				let s = a.name("item"), c = (0, t.checkDataTypes)(p, s, d.opts.strictNumbers, t.DataType.Wrong), l = a.const("indices", (0, n._)`{}`);
				a.for((0, n._)`;${r}--;`, () => {
					a.let(s, (0, n._)`${o}[${r}]`), a.if(c, (0, n._)`continue`), p.length > 1 && a.if((0, n._)`typeof ${s} == "string"`, (0, n._)`${s} += "_"`), a.if((0, n._)`typeof ${l}[${s}] == "number"`, () => {
						a.assign(i, (0, n._)`${l}[${s}]`), e.error(), a.assign(f, !1).break();
					}).code((0, n._)`${l}[${s}] = ${r}`);
				});
			}
			function _(t, s) {
				let c = (0, r.useFunc)(a, i.default), l = a.name("outer");
				a.label(l).for((0, n._)`;${t}--;`, () => a.for((0, n._)`${s} = ${t}; ${s}--;`, () => a.if((0, n._)`${c}(${o}[${t}], ${o}[${s}])`, () => {
					e.error(), a.assign(f, !1).break(l);
				})));
			}
		}
	};
})), dp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = $(), r = lp();
	e.default = {
		keyword: "const",
		$data: !0,
		error: {
			message: "must be equal to constant",
			params: ({ schemaCode: e }) => (0, t._)`{allowedValue: ${e}}`
		},
		code(e) {
			let { gen: i, data: a, $data: o, schemaCode: s, schema: c } = e;
			o || c && typeof c == "object" ? e.fail$data((0, t._)`!${(0, n.useFunc)(i, r.default)}(${a}, ${s})`) : e.fail((0, t._)`${c} !== ${a}`);
		}
	};
})), fp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = $(), r = lp();
	e.default = {
		keyword: "enum",
		schemaType: "array",
		$data: !0,
		error: {
			message: "must be equal to one of the allowed values",
			params: ({ schemaCode: e }) => (0, t._)`{allowedValues: ${e}}`
		},
		code(e) {
			let { gen: i, data: a, $data: o, schema: s, schemaCode: c, it: l } = e;
			if (!o && s.length === 0) throw Error("enum must have non-empty array");
			let u = s.length >= l.opts.loopEnum, d, f = () => d ??= (0, n.useFunc)(i, r.default), p;
			if (u || o) p = i.let("valid"), e.block$data(p, m);
			else {
				/* istanbul ignore if */
				if (!Array.isArray(s)) throw Error("ajv implementation error");
				let e = i.const("vSchema", c);
				p = (0, t.or)(...s.map((t, n) => h(e, n)));
			}
			e.pass(p);
			function m() {
				i.assign(p, !1), i.forOf("v", c, (e) => i.if((0, t._)`${f()}(${a}, ${e})`, () => i.assign(p, !0).break()));
			}
			function h(e, n) {
				let r = s[n];
				return typeof r == "object" && r ? (0, t._)`${f()}(${a}, ${e}[${n}])` : (0, t._)`${a} === ${r}`;
			}
		}
	};
})), pp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = tp(), n = np(), r = ip(), i = ap(), a = op(), o = sp(), s = cp(), c = up(), l = dp(), u = fp();
	e.default = [
		t.default,
		n.default,
		r.default,
		i.default,
		a.default,
		o.default,
		s.default,
		c.default,
		{
			keyword: "type",
			schemaType: ["string", "array"]
		},
		{
			keyword: "nullable",
			schemaType: "boolean"
		},
		l.default,
		u.default
	];
})), mp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.validateAdditionalItems = void 0;
	var t = Q(), n = $(), r = {
		keyword: "additionalItems",
		type: "array",
		schemaType: ["boolean", "object"],
		before: "uniqueItems",
		error: {
			message: ({ params: { len: e } }) => (0, t.str)`must NOT have more than ${e} items`,
			params: ({ params: { len: e } }) => (0, t._)`{limit: ${e}}`
		},
		code(e) {
			let { parentSchema: t, it: r } = e, { items: a } = t;
			if (!Array.isArray(a)) {
				(0, n.checkStrictMode)(r, "\"additionalItems\" is ignored when \"items\" is not an array of schemas");
				return;
			}
			i(e, a);
		}
	};
	function i(e, r) {
		let { gen: i, schema: a, data: o, keyword: s, it: c } = e;
		c.items = !0;
		let l = i.const("len", (0, t._)`${o}.length`);
		if (a === !1) e.setParams({ len: r.length }), e.pass((0, t._)`${l} <= ${r.length}`);
		else if (typeof a == "object" && !(0, n.alwaysValidSchema)(c, a)) {
			let n = i.var("valid", (0, t._)`${l} <= ${r.length}`);
			i.if((0, t.not)(n), () => u(n)), e.ok(n);
		}
		function u(a) {
			i.forRange("i", r.length, l, (r) => {
				e.subschema({
					keyword: s,
					dataProp: r,
					dataPropType: n.Type.Num
				}, a), c.allErrors || i.if((0, t.not)(a), () => i.break());
			});
		}
	}
	e.validateAdditionalItems = i, e.default = r;
})), hp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.validateTuple = void 0;
	var t = Q(), n = $(), r = kf(), i = {
		keyword: "items",
		type: "array",
		schemaType: [
			"object",
			"array",
			"boolean"
		],
		before: "uniqueItems",
		code(e) {
			let { schema: t, it: i } = e;
			if (Array.isArray(t)) return a(e, "additionalItems", t);
			i.items = !0, !(0, n.alwaysValidSchema)(i, t) && e.ok((0, r.validateArray)(e));
		}
	};
	function a(e, r, i = e.schema) {
		let { gen: a, parentSchema: o, data: s, keyword: c, it: l } = e;
		f(o), l.opts.unevaluated && i.length && l.items !== !0 && (l.items = n.mergeEvaluated.items(a, i.length, l.items));
		let u = a.name("valid"), d = a.const("len", (0, t._)`${s}.length`);
		i.forEach((r, i) => {
			(0, n.alwaysValidSchema)(l, r) || (a.if((0, t._)`${d} > ${i}`, () => e.subschema({
				keyword: c,
				schemaProp: i,
				dataProp: i
			}, u)), e.ok(u));
		});
		function f(e) {
			let { opts: t, errSchemaPath: a } = l, o = i.length, s = o === e.minItems && (o === e.maxItems || e[r] === !1);
			if (t.strictTuples && !s) {
				let e = `"${c}" is ${o}-tuple, but minItems or maxItems/${r} are not specified or different at path "${a}"`;
				(0, n.checkStrictMode)(l, e, t.strictTuples);
			}
		}
	}
	e.validateTuple = a, e.default = i;
})), gp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = hp();
	e.default = {
		keyword: "prefixItems",
		type: "array",
		schemaType: ["array"],
		before: "uniqueItems",
		code: (e) => (0, t.validateTuple)(e, "items")
	};
})), _p = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = $(), r = kf(), i = mp();
	e.default = {
		keyword: "items",
		type: "array",
		schemaType: ["object", "boolean"],
		before: "uniqueItems",
		error: {
			message: ({ params: { len: e } }) => (0, t.str)`must NOT have more than ${e} items`,
			params: ({ params: { len: e } }) => (0, t._)`{limit: ${e}}`
		},
		code(e) {
			let { schema: t, parentSchema: a, it: o } = e, { prefixItems: s } = a;
			o.items = !0, !(0, n.alwaysValidSchema)(o, t) && (s ? (0, i.validateAdditionalItems)(e, s) : e.ok((0, r.validateArray)(e)));
		}
	};
})), vp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = $();
	e.default = {
		keyword: "contains",
		type: "array",
		schemaType: ["object", "boolean"],
		before: "uniqueItems",
		trackErrors: !0,
		error: {
			message: ({ params: { min: e, max: n } }) => n === void 0 ? (0, t.str)`must contain at least ${e} valid item(s)` : (0, t.str)`must contain at least ${e} and no more than ${n} valid item(s)`,
			params: ({ params: { min: e, max: n } }) => n === void 0 ? (0, t._)`{minContains: ${e}}` : (0, t._)`{minContains: ${e}, maxContains: ${n}}`
		},
		code(e) {
			let { gen: r, schema: i, parentSchema: a, data: o, it: s } = e, c, l, { minContains: u, maxContains: d } = a;
			s.opts.next ? (c = u === void 0 ? 1 : u, l = d) : c = 1;
			let f = r.const("len", (0, t._)`${o}.length`);
			if (e.setParams({
				min: c,
				max: l
			}), l === void 0 && c === 0) {
				(0, n.checkStrictMode)(s, "\"minContains\" == 0 without \"maxContains\": \"contains\" keyword ignored");
				return;
			}
			if (l !== void 0 && c > l) {
				(0, n.checkStrictMode)(s, "\"minContains\" > \"maxContains\" is always invalid"), e.fail();
				return;
			}
			if ((0, n.alwaysValidSchema)(s, i)) {
				let n = (0, t._)`${f} >= ${c}`;
				l !== void 0 && (n = (0, t._)`${n} && ${f} <= ${l}`), e.pass(n);
				return;
			}
			s.items = !0;
			let p = r.name("valid");
			l === void 0 && c === 1 ? h(p, () => r.if(p, () => r.break())) : c === 0 ? (r.let(p, !0), l !== void 0 && r.if((0, t._)`${o}.length > 0`, m)) : (r.let(p, !1), m()), e.result(p, () => e.reset());
			function m() {
				let e = r.name("_valid"), t = r.let("count", 0);
				h(e, () => r.if(e, () => g(t)));
			}
			function h(t, i) {
				r.forRange("i", 0, f, (r) => {
					e.subschema({
						keyword: "contains",
						dataProp: r,
						dataPropType: n.Type.Num,
						compositeRule: !0
					}, t), i();
				});
			}
			function g(e) {
				r.code((0, t._)`${e}++`), l === void 0 ? r.if((0, t._)`${e} >= ${c}`, () => r.assign(p, !0).break()) : (r.if((0, t._)`${e} > ${l}`, () => r.assign(p, !1).break()), c === 1 ? r.assign(p, !0) : r.if((0, t._)`${e} >= ${c}`, () => r.assign(p, !0)));
			}
		}
	};
})), yp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
	var t = Q(), n = $(), r = kf();
	e.error = {
		message: ({ params: { property: e, depsCount: n, deps: r } }) => {
			let i = n === 1 ? "property" : "properties";
			return (0, t.str)`must have ${i} ${r} when property ${e} is present`;
		},
		params: ({ params: { property: e, depsCount: n, deps: r, missingProperty: i } }) => (0, t._)`{property: ${e},
    missingProperty: ${i},
    depsCount: ${n},
    deps: ${r}}`
	};
	var i = {
		keyword: "dependencies",
		type: "object",
		schemaType: "object",
		error: e.error,
		code(e) {
			let [t, n] = a(e);
			o(e, t), s(e, n);
		}
	};
	function a({ schema: e }) {
		let t = {}, n = {};
		for (let r in e) {
			if (r === "__proto__") continue;
			let i = Array.isArray(e[r]) ? t : n;
			i[r] = e[r];
		}
		return [t, n];
	}
	function o(e, n = e.schema) {
		let { gen: i, data: a, it: o } = e;
		if (Object.keys(n).length === 0) return;
		let s = i.let("missing");
		for (let c in n) {
			let l = n[c];
			if (l.length === 0) continue;
			let u = (0, r.propertyInData)(i, a, c, o.opts.ownProperties);
			e.setParams({
				property: c,
				depsCount: l.length,
				deps: l.join(", ")
			}), o.allErrors ? i.if(u, () => {
				for (let t of l) (0, r.checkReportMissingProp)(e, t);
			}) : (i.if((0, t._)`${u} && (${(0, r.checkMissingProp)(e, l, s)})`), (0, r.reportMissingProp)(e, s), i.else());
		}
	}
	e.validatePropertyDeps = o;
	function s(e, t = e.schema) {
		let { gen: i, data: a, keyword: o, it: s } = e, c = i.name("valid");
		for (let l in t) (0, n.alwaysValidSchema)(s, t[l]) || (i.if((0, r.propertyInData)(i, a, l, s.opts.ownProperties), () => {
			let t = e.subschema({
				keyword: o,
				schemaProp: l
			}, c);
			e.mergeValidEvaluated(t, c);
		}, () => i.var(c, !0)), e.ok(c));
	}
	e.validateSchemaDeps = s, e.default = i;
})), bp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = $();
	e.default = {
		keyword: "propertyNames",
		type: "object",
		schemaType: ["object", "boolean"],
		error: {
			message: "property name must be valid",
			params: ({ params: e }) => (0, t._)`{propertyName: ${e.propertyName}}`
		},
		code(e) {
			let { gen: r, schema: i, data: a, it: o } = e;
			if ((0, n.alwaysValidSchema)(o, i)) return;
			let s = r.name("valid");
			r.forIn("key", a, (n) => {
				e.setParams({ propertyName: n }), e.subschema({
					keyword: "propertyNames",
					data: n,
					dataTypes: ["string"],
					propertyName: n,
					compositeRule: !0
				}, s), r.if((0, t.not)(s), () => {
					e.error(!0), o.allErrors || r.break();
				});
			}), e.ok(s);
		}
	};
})), xp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = kf(), n = Q(), r = Sf(), i = $();
	e.default = {
		keyword: "additionalProperties",
		type: ["object"],
		schemaType: ["boolean", "object"],
		allowUndefined: !0,
		trackErrors: !0,
		error: {
			message: "must NOT have additional properties",
			params: ({ params: e }) => (0, n._)`{additionalProperty: ${e.additionalProperty}}`
		},
		code(e) {
			let { gen: a, schema: o, parentSchema: s, data: c, errsCount: l, it: u } = e;
			/* istanbul ignore if */
			if (!l) throw Error("ajv implementation error");
			let { allErrors: d, opts: f } = u;
			if (u.props = !0, f.removeAdditional !== "all" && (0, i.alwaysValidSchema)(u, o)) return;
			let p = (0, t.allSchemaProperties)(s.properties), m = (0, t.allSchemaProperties)(s.patternProperties);
			h(), e.ok((0, n._)`${l} === ${r.default.errors}`);
			function h() {
				a.forIn("key", c, (e) => {
					!p.length && !m.length ? v(e) : a.if(g(e), () => v(e));
				});
			}
			function g(r) {
				let o;
				if (p.length > 8) {
					let e = (0, i.schemaRefOrVal)(u, s.properties, "properties");
					o = (0, t.isOwnProperty)(a, e, r);
				} else o = p.length ? (0, n.or)(...p.map((e) => (0, n._)`${r} === ${e}`)) : n.nil;
				return m.length && (o = (0, n.or)(o, ...m.map((i) => (0, n._)`${(0, t.usePattern)(e, i)}.test(${r})`))), (0, n.not)(o);
			}
			function _(e) {
				a.code((0, n._)`delete ${c}[${e}]`);
			}
			function v(t) {
				if (f.removeAdditional === "all" || f.removeAdditional && o === !1) {
					_(t);
					return;
				}
				if (o === !1) {
					e.setParams({ additionalProperty: t }), e.error(), d || a.break();
					return;
				}
				if (typeof o == "object" && !(0, i.alwaysValidSchema)(u, o)) {
					let r = a.name("valid");
					f.removeAdditional === "failing" ? (ee(t, r, !1), a.if((0, n.not)(r), () => {
						e.reset(), _(t);
					})) : (ee(t, r), d || a.if((0, n.not)(r), () => a.break()));
				}
			}
			function ee(t, n, r) {
				let a = {
					keyword: "additionalProperties",
					dataProp: t,
					dataPropType: i.Type.Str
				};
				r === !1 && Object.assign(a, {
					compositeRule: !0,
					createErrors: !1,
					allErrors: !1
				}), e.subschema(a, n);
			}
		}
	};
})), Sp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Ff(), n = kf(), r = $(), i = xp();
	e.default = {
		keyword: "properties",
		type: "object",
		schemaType: "object",
		code(e) {
			let { gen: a, schema: o, parentSchema: s, data: c, it: l } = e;
			l.opts.removeAdditional === "all" && s.additionalProperties === void 0 && i.default.code(new t.KeywordCxt(l, i.default, "additionalProperties"));
			let u = (0, n.allSchemaProperties)(o);
			for (let e of u) l.definedProperties.add(e);
			l.opts.unevaluated && u.length && l.props !== !0 && (l.props = r.mergeEvaluated.props(a, (0, r.toHash)(u), l.props));
			let d = u.filter((e) => !(0, r.alwaysValidSchema)(l, o[e]));
			if (d.length === 0) return;
			let f = a.name("valid");
			for (let t of d) p(t) ? m(t) : (a.if((0, n.propertyInData)(a, c, t, l.opts.ownProperties)), m(t), l.allErrors || a.else().var(f, !0), a.endIf()), e.it.definedProperties.add(t), e.ok(f);
			function p(e) {
				return l.opts.useDefaults && !l.compositeRule && o[e].default !== void 0;
			}
			function m(t) {
				e.subschema({
					keyword: "properties",
					schemaProp: t,
					dataProp: t
				}, f);
			}
		}
	};
})), Cp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = kf(), n = Q(), r = $(), i = $();
	e.default = {
		keyword: "patternProperties",
		type: "object",
		schemaType: "object",
		code(e) {
			let { gen: a, schema: o, data: s, parentSchema: c, it: l } = e, { opts: u } = l, d = (0, t.allSchemaProperties)(o), f = d.filter((e) => (0, r.alwaysValidSchema)(l, o[e]));
			if (d.length === 0 || f.length === d.length && (!l.opts.unevaluated || l.props === !0)) return;
			let p = u.strictSchema && !u.allowMatchingProperties && c.properties, m = a.name("valid");
			l.props !== !0 && !(l.props instanceof n.Name) && (l.props = (0, i.evaluatedPropsToName)(a, l.props));
			let { props: h } = l;
			g();
			function g() {
				for (let e of d) p && _(e), l.allErrors ? v(e) : (a.var(m, !0), v(e), a.if(m));
			}
			function _(e) {
				for (let t in p) new RegExp(e).test(t) && (0, r.checkStrictMode)(l, `property ${t} matches pattern ${e} (use allowMatchingProperties)`);
			}
			function v(r) {
				a.forIn("key", s, (o) => {
					a.if((0, n._)`${(0, t.usePattern)(e, r)}.test(${o})`, () => {
						let t = f.includes(r);
						t || e.subschema({
							keyword: "patternProperties",
							schemaProp: r,
							dataProp: o,
							dataPropType: i.Type.Str
						}, m), l.opts.unevaluated && h !== !0 ? a.assign((0, n._)`${h}[${o}]`, !0) : !t && !l.allErrors && a.if((0, n.not)(m), () => a.break());
					});
				});
			}
		}
	};
})), wp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = $();
	e.default = {
		keyword: "not",
		schemaType: ["object", "boolean"],
		trackErrors: !0,
		code(e) {
			let { gen: n, schema: r, it: i } = e;
			if ((0, t.alwaysValidSchema)(i, r)) {
				e.fail();
				return;
			}
			let a = n.name("valid");
			e.subschema({
				keyword: "not",
				compositeRule: !0,
				createErrors: !1,
				allErrors: !1
			}, a), e.failResult(a, () => e.reset(), () => e.error());
		},
		error: { message: "must NOT be valid" }
	};
})), Tp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.default = {
		keyword: "anyOf",
		schemaType: "array",
		trackErrors: !0,
		code: kf().validateUnion,
		error: { message: "must match a schema in anyOf" }
	};
})), Ep = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = $();
	e.default = {
		keyword: "oneOf",
		schemaType: "array",
		trackErrors: !0,
		error: {
			message: "must match exactly one schema in oneOf",
			params: ({ params: e }) => (0, t._)`{passingSchemas: ${e.passing}}`
		},
		code(e) {
			let { gen: r, schema: i, parentSchema: a, it: o } = e;
			/* istanbul ignore if */
			if (!Array.isArray(i)) throw Error("ajv implementation error");
			if (o.opts.discriminator && a.discriminator) return;
			let s = i, c = r.let("valid", !1), l = r.let("passing", null), u = r.name("_valid");
			e.setParams({ passing: l }), r.block(d), e.result(c, () => e.reset(), () => e.error(!0));
			function d() {
				s.forEach((i, a) => {
					let s;
					(0, n.alwaysValidSchema)(o, i) ? r.var(u, !0) : s = e.subschema({
						keyword: "oneOf",
						schemaProp: a,
						compositeRule: !0
					}, u), a > 0 && r.if((0, t._)`${u} && ${c}`).assign(c, !1).assign(l, (0, t._)`[${l}, ${a}]`).else(), r.if(u, () => {
						r.assign(c, !0), r.assign(l, a), s && e.mergeEvaluated(s, t.Name);
					});
				});
			}
		}
	};
})), Dp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = $();
	e.default = {
		keyword: "allOf",
		schemaType: "array",
		code(e) {
			let { gen: n, schema: r, it: i } = e;
			/* istanbul ignore if */
			if (!Array.isArray(r)) throw Error("ajv implementation error");
			let a = n.name("valid");
			r.forEach((n, r) => {
				if ((0, t.alwaysValidSchema)(i, n)) return;
				let o = e.subschema({
					keyword: "allOf",
					schemaProp: r
				}, a);
				e.ok(a), e.mergeEvaluated(o);
			});
		}
	};
})), Op = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = $(), r = {
		keyword: "if",
		schemaType: ["object", "boolean"],
		trackErrors: !0,
		error: {
			message: ({ params: e }) => (0, t.str)`must match "${e.ifClause}" schema`,
			params: ({ params: e }) => (0, t._)`{failingKeyword: ${e.ifClause}}`
		},
		code(e) {
			let { gen: r, parentSchema: a, it: o } = e;
			a.then === void 0 && a.else === void 0 && (0, n.checkStrictMode)(o, "\"if\" without \"then\" and \"else\" is ignored");
			let s = i(o, "then"), c = i(o, "else");
			if (!s && !c) return;
			let l = r.let("valid", !0), u = r.name("_valid");
			if (d(), e.reset(), s && c) {
				let t = r.let("ifClause");
				e.setParams({ ifClause: t }), r.if(u, f("then", t), f("else", t));
			} else s ? r.if(u, f("then")) : r.if((0, t.not)(u), f("else"));
			e.pass(l, () => e.error(!0));
			function d() {
				let t = e.subschema({
					keyword: "if",
					compositeRule: !0,
					createErrors: !1,
					allErrors: !1
				}, u);
				e.mergeEvaluated(t);
			}
			function f(n, i) {
				return () => {
					let a = e.subschema({ keyword: n }, u);
					r.assign(l, u), e.mergeValidEvaluated(a, l), i ? r.assign(i, (0, t._)`${n}`) : e.setParams({ ifClause: n });
				};
			}
		}
	};
	function i(e, t) {
		let r = e.schema[t];
		return r !== void 0 && !(0, n.alwaysValidSchema)(e, r);
	}
	e.default = r;
})), kp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = $();
	e.default = {
		keyword: ["then", "else"],
		schemaType: ["object", "boolean"],
		code({ keyword: e, parentSchema: n, it: r }) {
			n.if === void 0 && (0, t.checkStrictMode)(r, `"${e}" without "if" is ignored`);
		}
	};
})), Ap = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = mp(), n = gp(), r = hp(), i = _p(), a = vp(), o = yp(), s = bp(), c = xp(), l = Sp(), u = Cp(), d = wp(), f = Tp(), p = Ep(), m = Dp(), h = Op(), g = kp();
	function _(e = !1) {
		let _ = [
			d.default,
			f.default,
			p.default,
			m.default,
			h.default,
			g.default,
			s.default,
			c.default,
			o.default,
			l.default,
			u.default
		];
		return e ? _.push(n.default, i.default) : _.push(t.default, r.default), _.push(a.default), _;
	}
	e.default = _;
})), jp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q();
	e.default = {
		keyword: "format",
		type: ["number", "string"],
		schemaType: "string",
		$data: !0,
		error: {
			message: ({ schemaCode: e }) => (0, t.str)`must match format "${e}"`,
			params: ({ schemaCode: e }) => (0, t._)`{format: ${e}}`
		},
		code(e, n) {
			let { gen: r, data: i, $data: a, schema: o, schemaCode: s, it: c } = e, { opts: l, errSchemaPath: u, schemaEnv: d, self: f } = c;
			if (!l.validateFormats) return;
			a ? p() : m();
			function p() {
				let a = r.scopeValue("formats", {
					ref: f.formats,
					code: l.code.formats
				}), o = r.const("fDef", (0, t._)`${a}[${s}]`), c = r.let("fType"), u = r.let("format");
				r.if((0, t._)`typeof ${o} == "object" && !(${o} instanceof RegExp)`, () => r.assign(c, (0, t._)`${o}.type || "string"`).assign(u, (0, t._)`${o}.validate`), () => r.assign(c, (0, t._)`"string"`).assign(u, o)), e.fail$data((0, t.or)(p(), m()));
				function p() {
					return l.strictSchema === !1 ? t.nil : (0, t._)`${s} && !${u}`;
				}
				function m() {
					let e = d.$async ? (0, t._)`(${o}.async ? await ${u}(${i}) : ${u}(${i}))` : (0, t._)`${u}(${i})`, r = (0, t._)`(typeof ${u} == "function" ? ${e} : ${u}.test(${i}))`;
					return (0, t._)`${u} && ${u} !== true && ${c} === ${n} && !${r}`;
				}
			}
			function m() {
				let a = f.formats[o];
				if (!a) {
					m();
					return;
				}
				if (a === !0) return;
				let [s, c, p] = h(a);
				s === n && e.pass(g());
				function m() {
					if (l.strictSchema === !1) {
						f.logger.warn(e());
						return;
					}
					throw Error(e());
					function e() {
						return `unknown format "${o}" ignored in schema at path "${u}"`;
					}
				}
				function h(e) {
					let n = e instanceof RegExp ? (0, t.regexpCode)(e) : l.code.formats ? (0, t._)`${l.code.formats}${(0, t.getProperty)(o)}` : void 0, i = r.scopeValue("formats", {
						key: o,
						ref: e,
						code: n
					});
					return typeof e == "object" && !(e instanceof RegExp) ? [
						e.type || "string",
						e.validate,
						(0, t._)`${i}.validate`
					] : [
						"string",
						e,
						i
					];
				}
				function g() {
					if (typeof a == "object" && !(a instanceof RegExp) && a.async) {
						if (!d.$async) throw Error("async format in sync schema");
						return (0, t._)`await ${p}(${i})`;
					}
					return typeof c == "function" ? (0, t._)`${p}(${i})` : (0, t._)`${p}.test(${i})`;
				}
			}
		}
	};
})), Mp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.default = [jp().default];
})), Np = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.contentVocabulary = e.metadataVocabulary = void 0, e.metadataVocabulary = [
		"title",
		"description",
		"default",
		"deprecated",
		"readOnly",
		"writeOnly",
		"examples"
	], e.contentVocabulary = [
		"contentMediaType",
		"contentEncoding",
		"contentSchema"
	];
})), Pp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = ep(), n = pp(), r = Ap(), i = Mp(), a = Np();
	e.default = [
		t.default,
		n.default,
		(0, r.default)(),
		i.default,
		a.metadataVocabulary,
		a.contentVocabulary
	];
})), Fp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.DiscrError = void 0;
	var t;
	(function(e) {
		e.Tag = "tag", e.Mapping = "mapping";
	})(t || (e.DiscrError = t = {}));
})), Ip = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Q(), n = Fp(), r = Rf(), i = Lf(), a = $();
	e.default = {
		keyword: "discriminator",
		type: "object",
		schemaType: "object",
		error: {
			message: ({ params: { discrError: e, tagName: t } }) => e === n.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
			params: ({ params: { discrError: e, tag: n, tagName: r } }) => (0, t._)`{error: ${e}, tag: ${r}, tagValue: ${n}}`
		},
		code(e) {
			let { gen: o, data: s, schema: c, parentSchema: l, it: u } = e, { oneOf: d } = l;
			if (!u.opts.discriminator) throw Error("discriminator: requires discriminator option");
			let f = c.propertyName;
			if (typeof f != "string") throw Error("discriminator: requires propertyName");
			if (c.mapping) throw Error("discriminator: mapping is not supported");
			if (!d) throw Error("discriminator: requires oneOf keyword");
			let p = o.let("valid", !1), m = o.const("tag", (0, t._)`${s}${(0, t.getProperty)(f)}`);
			o.if((0, t._)`typeof ${m} == "string"`, () => h(), () => e.error(!1, {
				discrError: n.DiscrError.Tag,
				tag: m,
				tagName: f
			})), e.ok(p);
			function h() {
				let r = _();
				o.if(!1);
				for (let e in r) o.elseIf((0, t._)`${m} === ${e}`), o.assign(p, g(r[e]));
				o.else(), e.error(!1, {
					discrError: n.DiscrError.Mapping,
					tag: m,
					tagName: f
				}), o.endIf();
			}
			function g(n) {
				let r = o.name("valid"), i = e.subschema({
					keyword: "oneOf",
					schemaProp: n
				}, r);
				return e.mergeEvaluated(i, t.Name), r;
			}
			function _() {
				var e;
				let t = {}, n = s(l), o = !0;
				for (let t = 0; t < d.length; t++) {
					let l = d[t];
					if (l != null && l.$ref && !(0, a.schemaHasRulesButRef)(l, u.self.RULES)) {
						let e = l.$ref;
						if (l = r.resolveRef.call(u.self, u.schemaEnv.root, u.baseId, e), l instanceof r.SchemaEnv && (l = l.schema), l === void 0) throw new i.default(u.opts.uriResolver, u.baseId, e);
					}
					let p = (e = l == null ? void 0 : l.properties) == null ? void 0 : e[f];
					if (typeof p != "object") throw Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${f}"`);
					o &&= n || s(l), c(p, t);
				}
				if (!o) throw Error(`discriminator: "${f}" must be required`);
				return t;
				function s({ required: e }) {
					return Array.isArray(e) && e.includes(f);
				}
				function c(e, t) {
					if (e.const) p(e.const, t);
					else if (e.enum) for (let n of e.enum) p(n, t);
					else throw Error(`discriminator: "properties/${f}" must have "const" or "enum"`);
				}
				function p(e, n) {
					if (typeof e != "string" || e in t) throw Error(`discriminator: "${f}" values must be unique strings`);
					t[e] = n;
				}
			}
		}
	};
})), Lp = /* @__PURE__ */ c({
	$id: () => zp,
	$schema: () => Rp,
	default: () => Wp,
	definitions: () => Vp,
	properties: () => Up,
	title: () => Bp,
	type: () => Hp
}), Rp, zp, Bp, Vp, Hp, Up, Wp, Gp = o((() => {
	Rp = "http://json-schema.org/draft-07/schema#", zp = "http://json-schema.org/draft-07/schema#", Bp = "Core schema meta-schema", Vp = {
		schemaArray: {
			type: "array",
			minItems: 1,
			items: { $ref: "#" }
		},
		nonNegativeInteger: {
			type: "integer",
			minimum: 0
		},
		nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] },
		simpleTypes: { enum: [
			"array",
			"boolean",
			"integer",
			"null",
			"number",
			"object",
			"string"
		] },
		stringArray: {
			type: "array",
			items: { type: "string" },
			uniqueItems: !0,
			default: []
		}
	}, Hp = ["object", "boolean"], Up = {
		$id: {
			type: "string",
			format: "uri-reference"
		},
		$schema: {
			type: "string",
			format: "uri"
		},
		$ref: {
			type: "string",
			format: "uri-reference"
		},
		$comment: { type: "string" },
		title: { type: "string" },
		description: { type: "string" },
		default: !0,
		readOnly: {
			type: "boolean",
			default: !1
		},
		examples: {
			type: "array",
			items: !0
		},
		multipleOf: {
			type: "number",
			exclusiveMinimum: 0
		},
		maximum: { type: "number" },
		exclusiveMaximum: { type: "number" },
		minimum: { type: "number" },
		exclusiveMinimum: { type: "number" },
		maxLength: { $ref: "#/definitions/nonNegativeInteger" },
		minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
		pattern: {
			type: "string",
			format: "regex"
		},
		additionalItems: { $ref: "#" },
		items: {
			anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
			default: !0
		},
		maxItems: { $ref: "#/definitions/nonNegativeInteger" },
		minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
		uniqueItems: {
			type: "boolean",
			default: !1
		},
		contains: { $ref: "#" },
		maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
		minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
		required: { $ref: "#/definitions/stringArray" },
		additionalProperties: { $ref: "#" },
		definitions: {
			type: "object",
			additionalProperties: { $ref: "#" },
			default: {}
		},
		properties: {
			type: "object",
			additionalProperties: { $ref: "#" },
			default: {}
		},
		patternProperties: {
			type: "object",
			additionalProperties: { $ref: "#" },
			propertyNames: { format: "regex" },
			default: {}
		},
		dependencies: {
			type: "object",
			additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] }
		},
		propertyNames: { $ref: "#" },
		const: !0,
		enum: {
			type: "array",
			items: !0,
			minItems: 1,
			uniqueItems: !0
		},
		type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, {
			type: "array",
			items: { $ref: "#/definitions/simpleTypes" },
			minItems: 1,
			uniqueItems: !0
		}] },
		format: { type: "string" },
		contentMediaType: { type: "string" },
		contentEncoding: { type: "string" },
		if: { $ref: "#" },
		then: { $ref: "#" },
		else: { $ref: "#" },
		allOf: { $ref: "#/definitions/schemaArray" },
		anyOf: { $ref: "#/definitions/schemaArray" },
		oneOf: { $ref: "#/definitions/schemaArray" },
		not: { $ref: "#" }
	}, Wp = {
		$schema: Rp,
		$id: zp,
		title: Bp,
		definitions: Vp,
		type: Hp,
		properties: Up,
		default: !0
	};
})), Kp = /* @__PURE__ */ s(((e, t) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = e.Ajv = void 0;
	var n = Zf(), r = Pp(), i = Ip(), a = (Gp(), d(Lp).default), o = ["/properties"], s = "http://json-schema.org/draft-07/schema", c = class extends n.default {
		_addVocabularies() {
			super._addVocabularies(), r.default.forEach((e) => this.addVocabulary(e)), this.opts.discriminator && this.addKeyword(i.default);
		}
		_addDefaultMetaSchema() {
			if (super._addDefaultMetaSchema(), !this.opts.meta) return;
			let e = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
			this.addMetaSchema(e, s, !1), this.refs["http://json-schema.org/schema"] = s;
		}
		defaultMeta() {
			return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(s) ? s : void 0);
		}
	};
	e.Ajv = c, t.exports = e = c, t.exports.Ajv = c, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = c;
	var l = Ff();
	Object.defineProperty(e, "KeywordCxt", {
		enumerable: !0,
		get: function() {
			return l.KeywordCxt;
		}
	});
	var u = Q();
	Object.defineProperty(e, "_", {
		enumerable: !0,
		get: function() {
			return u._;
		}
	}), Object.defineProperty(e, "str", {
		enumerable: !0,
		get: function() {
			return u.str;
		}
	}), Object.defineProperty(e, "stringify", {
		enumerable: !0,
		get: function() {
			return u.stringify;
		}
	}), Object.defineProperty(e, "nil", {
		enumerable: !0,
		get: function() {
			return u.nil;
		}
	}), Object.defineProperty(e, "Name", {
		enumerable: !0,
		get: function() {
			return u.Name;
		}
	}), Object.defineProperty(e, "CodeGen", {
		enumerable: !0,
		get: function() {
			return u.CodeGen;
		}
	});
	var f = If();
	Object.defineProperty(e, "ValidationError", {
		enumerable: !0,
		get: function() {
			return f.default;
		}
	});
	var p = Lf();
	Object.defineProperty(e, "MissingRefError", {
		enumerable: !0,
		get: function() {
			return p.default;
		}
	});
})), qp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
	function t(e, t) {
		return {
			validate: e,
			compare: t
		};
	}
	e.fullFormats = {
		date: t(a, o),
		time: t(c(!0), l),
		"date-time": t(f(!0), p),
		"iso-time": t(c(), u),
		"iso-date-time": t(f(), m),
		duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
		uri: _,
		"uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
		"uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
		url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
		email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
		hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
		ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
		ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
		regex: C,
		uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
		"json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
		"json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
		"relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
		byte: ee,
		int32: {
			type: "number",
			validate: b
		},
		int64: {
			type: "number",
			validate: x
		},
		float: {
			type: "number",
			validate: S
		},
		double: {
			type: "number",
			validate: S
		},
		password: !0,
		binary: !0
	}, e.fastFormats = {
		...e.fullFormats,
		date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
		time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, l),
		"date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, p),
		"iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, u),
		"iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, m),
		uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
		"uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
		email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
	}, e.formatNames = Object.keys(e.fullFormats);
	function n(e) {
		return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
	}
	var r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, i = [
		0,
		31,
		28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	];
	function a(e) {
		let t = r.exec(e);
		if (!t) return !1;
		let a = +t[1], o = +t[2], s = +t[3];
		return o >= 1 && o <= 12 && s >= 1 && s <= (o === 2 && n(a) ? 29 : i[o]);
	}
	function o(e, t) {
		if (e && t) return e > t ? 1 : e < t ? -1 : 0;
	}
	var s = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
	function c(e) {
		return function(t) {
			let n = s.exec(t);
			if (!n) return !1;
			let r = +n[1], i = +n[2], a = +n[3], o = n[4], c = n[5] === "-" ? -1 : 1, l = +(n[6] || 0), u = +(n[7] || 0);
			if (l > 23 || u > 59 || e && !o) return !1;
			if (r <= 23 && i <= 59 && a < 60) return !0;
			let d = i - u * c, f = r - l * c - (d < 0 ? 1 : 0);
			return (f === 23 || f === -1) && (d === 59 || d === -1) && a < 61;
		};
	}
	function l(e, t) {
		if (!(e && t)) return;
		let n = (/* @__PURE__ */ new Date("2020-01-01T" + e)).valueOf(), r = (/* @__PURE__ */ new Date("2020-01-01T" + t)).valueOf();
		if (n && r) return n - r;
	}
	function u(e, t) {
		if (!(e && t)) return;
		let n = s.exec(e), r = s.exec(t);
		if (n && r) return e = n[1] + n[2] + n[3], t = r[1] + r[2] + r[3], e > t ? 1 : e < t ? -1 : 0;
	}
	var d = /t|\s/i;
	function f(e) {
		let t = c(e);
		return function(e) {
			let n = e.split(d);
			return n.length === 2 && a(n[0]) && t(n[1]);
		};
	}
	function p(e, t) {
		if (!(e && t)) return;
		let n = new Date(e).valueOf(), r = new Date(t).valueOf();
		if (n && r) return n - r;
	}
	function m(e, t) {
		if (!(e && t)) return;
		let [n, r] = e.split(d), [i, a] = t.split(d), s = o(n, i);
		if (s !== void 0) return s || l(r, a);
	}
	var h = /\/|:/, g = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
	function _(e) {
		return h.test(e) && g.test(e);
	}
	var v = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
	function ee(e) {
		return v.lastIndex = 0, v.test(e);
	}
	var te = -(2 ** 31), y = 2 ** 31 - 1;
	function b(e) {
		return Number.isInteger(e) && e <= y && e >= te;
	}
	function x(e) {
		return Number.isInteger(e);
	}
	function S() {
		return !0;
	}
	var ne = /[^\\]\\Z/;
	function C(e) {
		if (ne.test(e)) return !1;
		try {
			return new RegExp(e), !0;
		} catch {
			return !1;
		}
	}
})), Jp = /* @__PURE__ */ s(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
	var t = Kp(), n = Q(), r = n.operators, i = {
		formatMaximum: {
			okStr: "<=",
			ok: r.LTE,
			fail: r.GT
		},
		formatMinimum: {
			okStr: ">=",
			ok: r.GTE,
			fail: r.LT
		},
		formatExclusiveMaximum: {
			okStr: "<",
			ok: r.LT,
			fail: r.GTE
		},
		formatExclusiveMinimum: {
			okStr: ">",
			ok: r.GT,
			fail: r.LTE
		}
	};
	e.formatLimitDefinition = {
		keyword: Object.keys(i),
		type: "string",
		schemaType: "string",
		$data: !0,
		error: {
			message: ({ keyword: e, schemaCode: t }) => (0, n.str)`should be ${i[e].okStr} ${t}`,
			params: ({ keyword: e, schemaCode: t }) => (0, n._)`{comparison: ${i[e].okStr}, limit: ${t}}`
		},
		code(e) {
			let { gen: r, data: a, schemaCode: o, keyword: s, it: c } = e, { opts: l, self: u } = c;
			if (!l.validateFormats) return;
			let d = new t.KeywordCxt(c, u.RULES.all.format.definition, "format");
			d.$data ? f() : p();
			function f() {
				let t = r.scopeValue("formats", {
					ref: u.formats,
					code: l.code.formats
				}), i = r.const("fmt", (0, n._)`${t}[${d.schemaCode}]`);
				e.fail$data((0, n.or)((0, n._)`typeof ${i} != "object"`, (0, n._)`${i} instanceof RegExp`, (0, n._)`typeof ${i}.compare != "function"`, m(i)));
			}
			function p() {
				let t = d.schema, i = u.formats[t];
				if (!i || i === !0) return;
				if (typeof i != "object" || i instanceof RegExp || typeof i.compare != "function") throw Error(`"${s}": format "${t}" does not define "compare" function`);
				let a = r.scopeValue("formats", {
					key: t,
					ref: i,
					code: l.code.formats ? (0, n._)`${l.code.formats}${(0, n.getProperty)(t)}` : void 0
				});
				e.fail$data(m(a));
			}
			function m(e) {
				return (0, n._)`${e}.compare(${a}, ${o}) ${i[s].fail} 0`;
			}
		},
		dependencies: ["format"]
	}, e.default = (t) => (t.addKeyword(e.formatLimitDefinition), t);
})), Yp = /* @__PURE__ */ s(((e, t) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var n = qp(), r = Jp(), i = Q(), a = new i.Name("fullFormats"), o = new i.Name("fastFormats"), s = (e, t = { keywords: !0 }) => {
		if (Array.isArray(t)) return c(e, t, n.fullFormats, a), e;
		let [i, s] = t.mode === "fast" ? [n.fastFormats, o] : [n.fullFormats, a];
		return c(e, t.formats || n.formatNames, i, s), t.keywords && (0, r.default)(e), e;
	};
	s.get = (e, t = "full") => {
		let r = (t === "fast" ? n.fastFormats : n.fullFormats)[e];
		if (!r) throw Error(`Unknown format "${e}"`);
		return r;
	};
	function c(e, t, n, r) {
		var a;
		(a = e.opts.code).formats ?? (a.formats = (0, i._)`require("ajv-formats/dist/formats").${r}`);
		for (let r of t) e.addFormat(r, n[r]);
	}
	t.exports = e = s, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = s;
})), Xp = /* @__PURE__ */ u(Kp(), 1), Zp = /* @__PURE__ */ u(Yp(), 1);
function Qp() {
	let e = new Xp.default({
		strict: !1,
		validateFormats: !0,
		validateSchema: !1,
		allErrors: !0
	});
	return (0, Zp.default)(e), e;
}
/**
* @example
* ```typescript
* // Use with default AJV instance (recommended)
* import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv';
* const validator = new AjvJsonSchemaValidator();
*
* // Use with custom AJV instance
* import { Ajv } from 'ajv';
* const ajv = new Ajv({ strict: true, allErrors: true });
* const validator = new AjvJsonSchemaValidator(ajv);
* ```
*/
var $p = class {
	/**
	* Create an AJV validator
	*
	* @param ajv - Optional pre-configured AJV instance. If not provided, a default instance will be created.
	*
	* @example
	* ```typescript
	* // Use default configuration (recommended for most cases)
	* import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv';
	* const validator = new AjvJsonSchemaValidator();
	*
	* // Or provide custom AJV instance for advanced configuration
	* import { Ajv } from 'ajv';
	* import addFormats from 'ajv-formats';
	*
	* const ajv = new Ajv({ validateFormats: true });
	* addFormats(ajv);
	* const validator = new AjvJsonSchemaValidator(ajv);
	* ```
	*/
	constructor(e) {
		this._ajv = e ?? Qp();
	}
	/**
	* Create a validator for the given JSON Schema
	*
	* The validator is compiled once and can be reused multiple times.
	* If the schema has an $id, it will be cached by AJV automatically.
	*
	* @param schema - Standard JSON Schema object
	* @returns A validator function that validates input data
	*/
	getValidator(e) {
		let t = "$id" in e && typeof e.$id == "string" ? this._ajv.getSchema(e.$id) ?? this._ajv.compile(e) : this._ajv.compile(e);
		return (e) => t(e) ? {
			valid: !0,
			data: e,
			errorMessage: void 0
		} : {
			valid: !1,
			data: void 0,
			errorMessage: this._ajv.errorsText(t.errors)
		};
	}
}, em = class {
	constructor(e) {
		this._server = e;
	}
	/**
	* Sends a request and returns an AsyncGenerator that yields response messages.
	* The generator is guaranteed to end with either a 'result' or 'error' message.
	*
	* This method provides streaming access to request processing, allowing you to
	* observe intermediate task status updates for task-augmented requests.
	*
	* @param request - The request to send
	* @param resultSchema - Zod schema for validating the result
	* @param options - Optional request options (timeout, signal, task creation params, etc.)
	* @returns AsyncGenerator that yields ResponseMessage objects
	*
	* @experimental
	*/
	requestStream(e, t, n) {
		return this._server.requestStream(e, t, n);
	}
	/**
	* Sends a sampling request and returns an AsyncGenerator that yields response messages.
	* The generator is guaranteed to end with either a 'result' or 'error' message.
	*
	* For task-augmented requests, yields 'taskCreated' and 'taskStatus' messages
	* before the final result.
	*
	* @example
	* ```typescript
	* const stream = server.experimental.tasks.createMessageStream({
	*     messages: [{ role: 'user', content: { type: 'text', text: 'Hello' } }],
	*     maxTokens: 100
	* }, {
	*     onprogress: (progress) => {
	*         // Handle streaming tokens via progress notifications
	*         console.log('Progress:', progress.message);
	*     }
	* });
	*
	* for await (const message of stream) {
	*     switch (message.type) {
	*         case 'taskCreated':
	*             console.log('Task created:', message.task.taskId);
	*             break;
	*         case 'taskStatus':
	*             console.log('Task status:', message.task.status);
	*             break;
	*         case 'result':
	*             console.log('Final result:', message.result);
	*             break;
	*         case 'error':
	*             console.error('Error:', message.error);
	*             break;
	*     }
	* }
	* ```
	*
	* @param params - The sampling request parameters
	* @param options - Optional request options (timeout, signal, task creation params, onprogress, etc.)
	* @returns AsyncGenerator that yields ResponseMessage objects
	*
	* @experimental
	*/
	createMessageStream(e, t) {
		var n;
		let r = this._server.getClientCapabilities();
		if ((e.tools || e.toolChoice) && !(!(r == null || (n = r.sampling) == null) && n.tools)) throw Error("Client does not support sampling tools capability.");
		if (e.messages.length > 0) {
			let t = e.messages[e.messages.length - 1], n = Array.isArray(t.content) ? t.content : [t.content], r = n.some((e) => e.type === "tool_result"), i = e.messages.length > 1 ? e.messages[e.messages.length - 2] : void 0, a = i ? Array.isArray(i.content) ? i.content : [i.content] : [], o = a.some((e) => e.type === "tool_use");
			if (r) {
				if (n.some((e) => e.type !== "tool_result")) throw Error("The last message must contain only tool_result content if any is present");
				if (!o) throw Error("tool_result blocks are not matching any tool_use from the previous message");
			}
			if (o) {
				let e = new Set(a.filter((e) => e.type === "tool_use").map((e) => e.id)), t = new Set(n.filter((e) => e.type === "tool_result").map((e) => e.toolUseId));
				if (e.size !== t.size || ![...e].every((e) => t.has(e))) throw Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
			}
		}
		return this.requestStream({
			method: "sampling/createMessage",
			params: e
		}, Bu, t);
	}
	/**
	* Sends an elicitation request and returns an AsyncGenerator that yields response messages.
	* The generator is guaranteed to end with either a 'result' or 'error' message.
	*
	* For task-augmented requests (especially URL-based elicitation), yields 'taskCreated'
	* and 'taskStatus' messages before the final result.
	*
	* @example
	* ```typescript
	* const stream = server.experimental.tasks.elicitInputStream({
	*     mode: 'url',
	*     message: 'Please authenticate',
	*     elicitationId: 'auth-123',
	*     url: 'https://example.com/auth'
	* }, {
	*     task: { ttl: 300000 } // Task-augmented for long-running auth flow
	* });
	*
	* for await (const message of stream) {
	*     switch (message.type) {
	*         case 'taskCreated':
	*             console.log('Task created:', message.task.taskId);
	*             break;
	*         case 'taskStatus':
	*             console.log('Task status:', message.task.status);
	*             break;
	*         case 'result':
	*             console.log('User action:', message.result.action);
	*             break;
	*         case 'error':
	*             console.error('Error:', message.error);
	*             break;
	*     }
	* }
	* ```
	*
	* @param params - The elicitation request parameters
	* @param options - Optional request options (timeout, signal, task creation params, etc.)
	* @returns AsyncGenerator that yields ResponseMessage objects
	*
	* @experimental
	*/
	elicitInputStream(e, t) {
		let n = this._server.getClientCapabilities(), r = e.mode ?? "form";
		switch (r) {
			case "url":
				var i;
				if (!(!(n == null || (i = n.elicitation) == null) && i.url)) throw Error("Client does not support url elicitation.");
				break;
			case "form":
				var a;
				if (!(!(n == null || (a = n.elicitation) == null) && a.form)) throw Error("Client does not support form elicitation.");
				break;
		}
		let o = r === "form" && e.mode === void 0 ? {
			...e,
			mode: "form"
		} : e;
		return this.requestStream({
			method: "elicitation/create",
			params: o
		}, Qu, t);
	}
	/**
	* Gets the current status of a task.
	*
	* @param taskId - The task identifier
	* @param options - Optional request options
	* @returns The task status
	*
	* @experimental
	*/
	async getTask(e, t) {
		return this._server.getTask({ taskId: e }, t);
	}
	/**
	* Retrieves the result of a completed task.
	*
	* @param taskId - The task identifier
	* @param resultSchema - Zod schema for validating the result
	* @param options - Optional request options
	* @returns The task result
	*
	* @experimental
	*/
	async getTaskResult(e, t, n) {
		return this._server.getTaskResult({ taskId: e }, t, n);
	}
	/**
	* Lists tasks with optional pagination.
	*
	* @param cursor - Optional pagination cursor
	* @param options - Optional request options
	* @returns List of tasks with optional next cursor
	*
	* @experimental
	*/
	async listTasks(e, t) {
		return this._server.listTasks(e ? { cursor: e } : void 0, t);
	}
	/**
	* Cancels a running task.
	*
	* @param taskId - The task identifier
	* @param options - Optional request options
	*
	* @experimental
	*/
	async cancelTask(e, t) {
		return this._server.cancelTask({ taskId: e }, t);
	}
};
/**
* Experimental task capability assertion helpers.
* WARNING: These APIs are experimental and may change without notice.
*
* @experimental
*/
/**
* Asserts that task creation is supported for tools/call.
* Used by Client.assertTaskCapability and Server.assertTaskHandlerCapability.
*
* @param requests - The task requests capability object
* @param method - The method being checked
* @param entityName - 'Server' or 'Client' for error messages
* @throws Error if the capability is not supported
*
* @experimental
*/
function tm(e, t, n) {
	if (!e) throw Error(`${n} does not support task creation (required for ${t})`);
	switch (t) {
		case "tools/call":
			var r;
			if (!((r = e.tools) != null && r.call)) throw Error(`${n} does not support task creation for tools/call (required for ${t})`);
			break;
		default: break;
	}
}
/**
* Asserts that task creation is supported for sampling/createMessage or elicitation/create.
* Used by Server.assertTaskCapability and Client.assertTaskHandlerCapability.
*
* @param requests - The task requests capability object
* @param method - The method being checked
* @param entityName - 'Server' or 'Client' for error messages
* @throws Error if the capability is not supported
*
* @experimental
*/
function nm(e, t, n) {
	if (!e) throw Error(`${n} does not support task creation (required for ${t})`);
	switch (t) {
		case "sampling/createMessage":
			var r;
			if (!((r = e.sampling) != null && r.createMessage)) throw Error(`${n} does not support task creation for sampling/createMessage (required for ${t})`);
			break;
		case "elicitation/create":
			var i;
			if (!((i = e.elicitation) != null && i.create)) throw Error(`${n} does not support task creation for elicitation/create (required for ${t})`);
			break;
		default: break;
	}
}
/**
* An MCP server on top of a pluggable transport.
*
* This server will automatically respond to the initialization flow as initiated from the client.
*
* To use with custom types, extend the base Request/Notification/Result types and pass them as type parameters:
*
* ```typescript
* // Custom schemas
* const CustomRequestSchema = RequestSchema.extend({...})
* const CustomNotificationSchema = NotificationSchema.extend({...})
* const CustomResultSchema = ResultSchema.extend({...})
*
* // Type aliases
* type CustomRequest = z.infer<typeof CustomRequestSchema>
* type CustomNotification = z.infer<typeof CustomNotificationSchema>
* type CustomResult = z.infer<typeof CustomResultSchema>
*
* // Create typed server
* const server = new Server<CustomRequest, CustomNotification, CustomResult>({
*   name: "CustomServer",
*   version: "1.0.0"
* })
* ```
* @deprecated Use `McpServer` instead for the high-level API. Only use `Server` for advanced use cases.
*/
var rm = class extends _f {
	/**
	* Initializes this server with the given name and version information.
	*/
	constructor(e, t) {
		super(t), this._serverInfo = e, this._loggingLevels = /* @__PURE__ */ new Map(), this.LOG_LEVEL_SEVERITY = new Map(Du.options.map((e, t) => [e, t])), this.isMessageIgnored = (e, t) => {
			let n = this._loggingLevels.get(t);
			return n ? this.LOG_LEVEL_SEVERITY.get(e) < this.LOG_LEVEL_SEVERITY.get(n) : !1;
		}, this._capabilities = (t == null ? void 0 : t.capabilities) ?? {}, this._instructions = t == null ? void 0 : t.instructions, this._jsonSchemaValidator = (t == null ? void 0 : t.jsonSchemaValidator) ?? new $p(), this.setRequestHandler(dl, (e) => this._oninitialize(e)), this.setNotificationHandler(ml, () => {
			var e;
			return (e = this.oninitialized) == null ? void 0 : e.call(this);
		}), this._capabilities.logging && this.setRequestHandler(ku, async (e, t) => {
			var n;
			let r = t.sessionId || ((n = t.requestInfo) == null ? void 0 : n.headers["mcp-session-id"]) || void 0, { level: i } = e.params, a = Du.safeParse(i);
			return a.success && this._loggingLevels.set(r, a.data), {};
		});
	}
	/**
	* Access experimental features.
	*
	* WARNING: These APIs are experimental and may change without notice.
	*
	* @experimental
	*/
	get experimental() {
		return this._experimental ||= { tasks: new em(this) }, this._experimental;
	}
	/**
	* Registers new capabilities. This can only be called before connecting to a transport.
	*
	* The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
	*/
	registerCapabilities(e) {
		if (this.transport) throw Error("Cannot register capabilities after connecting to transport");
		this._capabilities = yf(this._capabilities, e);
	}
	/**
	* Override request handler registration to enforce server-side validation for tools/call.
	*/
	setRequestHandler(e, t) {
		let n = Wo(e), r = n == null ? void 0 : n.method;
		if (!r) throw Error("Schema is missing a method literal");
		let i;
		if (Bo(r)) {
			var a;
			let e = r, t = (a = e._zod) == null ? void 0 : a.def;
			i = (t == null ? void 0 : t.value) ?? e.value;
		} else {
			let e = r, t = e._def;
			i = (t == null ? void 0 : t.value) ?? e.value;
		}
		if (typeof i != "string") throw Error("Schema method literal must be a string");
		return i === "tools/call" ? super.setRequestHandler(e, async (e, n) => {
			let r = Ho(Tu, e);
			if (!r.success) {
				let e = r.error instanceof Error ? r.error.message : String(r.error);
				throw new Y(J.InvalidParams, `Invalid tools/call request: ${e}`);
			}
			let { params: i } = r.data, a = await Promise.resolve(t(e, n));
			if (i.task) {
				let e = Ho(wl, a);
				if (!e.success) {
					let t = e.error instanceof Error ? e.error.message : String(e.error);
					throw new Y(J.InvalidParams, `Invalid task creation result: ${t}`);
				}
				return e.data;
			}
			let o = Ho(Cu, a);
			if (!o.success) {
				let e = o.error instanceof Error ? o.error.message : String(o.error);
				throw new Y(J.InvalidParams, `Invalid tools/call result: ${e}`);
			}
			return o.data;
		}) : super.setRequestHandler(e, t);
	}
	assertCapabilityForMethod(e) {
		switch (e) {
			case "sampling/createMessage":
				var t;
				if (!((t = this._clientCapabilities) != null && t.sampling)) throw Error(`Client does not support sampling (required for ${e})`);
				break;
			case "elicitation/create":
				var n;
				if (!((n = this._clientCapabilities) != null && n.elicitation)) throw Error(`Client does not support elicitation (required for ${e})`);
				break;
			case "roots/list":
				var r;
				if (!((r = this._clientCapabilities) != null && r.roots)) throw Error(`Client does not support listing roots (required for ${e})`);
				break;
			case "ping": break;
		}
	}
	assertNotificationCapability(e) {
		switch (e) {
			case "notifications/message":
				if (!this._capabilities.logging) throw Error(`Server does not support logging (required for ${e})`);
				break;
			case "notifications/resources/updated":
			case "notifications/resources/list_changed":
				if (!this._capabilities.resources) throw Error(`Server does not support notifying about resources (required for ${e})`);
				break;
			case "notifications/tools/list_changed":
				if (!this._capabilities.tools) throw Error(`Server does not support notifying of tool list changes (required for ${e})`);
				break;
			case "notifications/prompts/list_changed":
				if (!this._capabilities.prompts) throw Error(`Server does not support notifying of prompt list changes (required for ${e})`);
				break;
			case "notifications/elicitation/complete":
				var t;
				if (!(!((t = this._clientCapabilities) == null || (t = t.elicitation) == null) && t.url)) throw Error(`Client does not support URL elicitation (required for ${e})`);
				break;
			case "notifications/cancelled": break;
			case "notifications/progress": break;
		}
	}
	assertRequestHandlerCapability(e) {
		if (this._capabilities) switch (e) {
			case "completion/complete":
				if (!this._capabilities.completions) throw Error(`Server does not support completions (required for ${e})`);
				break;
			case "logging/setLevel":
				if (!this._capabilities.logging) throw Error(`Server does not support logging (required for ${e})`);
				break;
			case "prompts/get":
			case "prompts/list":
				if (!this._capabilities.prompts) throw Error(`Server does not support prompts (required for ${e})`);
				break;
			case "resources/list":
			case "resources/templates/list":
			case "resources/read":
				if (!this._capabilities.resources) throw Error(`Server does not support resources (required for ${e})`);
				break;
			case "tools/call":
			case "tools/list":
				if (!this._capabilities.tools) throw Error(`Server does not support tools (required for ${e})`);
				break;
			case "tasks/get":
			case "tasks/list":
			case "tasks/result":
			case "tasks/cancel":
				if (!this._capabilities.tasks) throw Error(`Server does not support tasks capability (required for ${e})`);
				break;
			case "ping":
			case "initialize": break;
		}
	}
	assertTaskCapability(e) {
		var t;
		nm((t = this._clientCapabilities) == null || (t = t.tasks) == null ? void 0 : t.requests, e, "Client");
	}
	assertTaskHandlerCapability(e) {
		var t;
		this._capabilities && tm((t = this._capabilities.tasks) == null ? void 0 : t.requests, e, "Server");
	}
	async _oninitialize(e) {
		let t = e.params.protocolVersion;
		return this._clientCapabilities = e.params.capabilities, this._clientVersion = e.params.clientInfo, {
			protocolVersion: jc.includes(t) ? t : Ac,
			capabilities: this.getCapabilities(),
			serverInfo: this._serverInfo,
			...this._instructions && { instructions: this._instructions }
		};
	}
	/**
	* After initialization has completed, this will be populated with the client's reported capabilities.
	*/
	getClientCapabilities() {
		return this._clientCapabilities;
	}
	/**
	* After initialization has completed, this will be populated with information about the client's name and version.
	*/
	getClientVersion() {
		return this._clientVersion;
	}
	getCapabilities() {
		return this._capabilities;
	}
	async ping() {
		return this.request({ method: "ping" }, el);
	}
	async createMessage(e, t) {
		if (e.tools || e.toolChoice) {
			var n;
			if (!(!((n = this._clientCapabilities) == null || (n = n.sampling) == null) && n.tools)) throw Error("Client does not support sampling tools capability.");
		}
		if (e.messages.length > 0) {
			let t = e.messages[e.messages.length - 1], n = Array.isArray(t.content) ? t.content : [t.content], r = n.some((e) => e.type === "tool_result"), i = e.messages.length > 1 ? e.messages[e.messages.length - 2] : void 0, a = i ? Array.isArray(i.content) ? i.content : [i.content] : [], o = a.some((e) => e.type === "tool_use");
			if (r) {
				if (n.some((e) => e.type !== "tool_result")) throw Error("The last message must contain only tool_result content if any is present");
				if (!o) throw Error("tool_result blocks are not matching any tool_use from the previous message");
			}
			if (o) {
				let e = new Set(a.filter((e) => e.type === "tool_use").map((e) => e.id)), t = new Set(n.filter((e) => e.type === "tool_result").map((e) => e.toolUseId));
				if (e.size !== t.size || ![...e].every((e) => t.has(e))) throw Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
			}
		}
		return e.tools ? this.request({
			method: "sampling/createMessage",
			params: e
		}, Vu, t) : this.request({
			method: "sampling/createMessage",
			params: e
		}, Bu, t);
	}
	/**
	* Creates an elicitation request for the given parameters.
	* For backwards compatibility, `mode` may be omitted for form requests and will default to `'form'`.
	* @param params The parameters for the elicitation request.
	* @param options Optional request options.
	* @returns The result of the elicitation request.
	*/
	async elicitInput(e, t) {
		switch (e.mode ?? "form") {
			case "url": {
				var n;
				if (!(!((n = this._clientCapabilities) == null || (n = n.elicitation) == null) && n.url)) throw Error("Client does not support url elicitation.");
				let r = e;
				return this.request({
					method: "elicitation/create",
					params: r
				}, Qu, t);
			}
			case "form": {
				var r;
				if (!(!((r = this._clientCapabilities) == null || (r = r.elicitation) == null) && r.form)) throw Error("Client does not support form elicitation.");
				let n = e.mode === "form" ? e : {
					...e,
					mode: "form"
				}, i = await this.request({
					method: "elicitation/create",
					params: n
				}, Qu, t);
				if (i.action === "accept" && i.content && n.requestedSchema) try {
					let e = this._jsonSchemaValidator.getValidator(n.requestedSchema)(i.content);
					if (!e.valid) throw new Y(J.InvalidParams, `Elicitation response content does not match requested schema: ${e.errorMessage}`);
				} catch (e) {
					throw e instanceof Y ? e : new Y(J.InternalError, `Error validating elicitation response: ${e instanceof Error ? e.message : String(e)}`);
				}
				return i;
			}
		}
	}
	/**
	* Creates a reusable callback that, when invoked, will send a `notifications/elicitation/complete`
	* notification for the specified elicitation ID.
	*
	* @param elicitationId The ID of the elicitation to mark as complete.
	* @param options Optional notification options. Useful when the completion notification should be related to a prior request.
	* @returns A function that emits the completion notification when awaited.
	*/
	createElicitationCompletionNotifier(e, t) {
		var n;
		if (!(!((n = this._clientCapabilities) == null || (n = n.elicitation) == null) && n.url)) throw Error("Client does not support URL elicitation (required for notifications/elicitation/complete)");
		return () => this.notification({
			method: "notifications/elicitation/complete",
			params: { elicitationId: e }
		}, t);
	}
	async listRoots(e, t) {
		return this.request({
			method: "roots/list",
			params: e
		}, cd, t);
	}
	/**
	* Sends a logging message to the client, if connected.
	* Note: You only need to send the parameters object, not the entire JSON RPC message
	* @see LoggingMessageNotification
	* @param params
	* @param sessionId optional for stateless and backward compatibility
	*/
	async sendLoggingMessage(e, t) {
		if (this._capabilities.logging && !this.isMessageIgnored(e.level, t)) return this.notification({
			method: "notifications/message",
			params: e
		});
	}
	async sendResourceUpdated(e) {
		return this.notification({
			method: "notifications/resources/updated",
			params: e
		});
	}
	async sendResourceListChanged() {
		return this.notification({ method: "notifications/resources/list_changed" });
	}
	async sendToolListChanged() {
		return this.notification({ method: "notifications/tools/list_changed" });
	}
	async sendPromptListChanged() {
		return this.notification({ method: "notifications/prompts/list_changed" });
	}
};
const im = Symbol.for("mcp.completable");
/**
* Checks if a schema is completable (has completion metadata).
*/
function am(e) {
	return !!e && typeof e == "object" && im in e;
}
/**
* Gets the completer callback from a completable schema, if it exists.
*/
function om(e) {
	let t = e[im];
	return t == null ? void 0 : t.complete;
}
var sm;
(function(e) {
	e.Completable = "McpCompletable";
})(sm ||= {});
/**
* Tool name validation utilities according to SEP: Specify Format for Tool Names
*
* Tool names SHOULD be between 1 and 128 characters in length (inclusive).
* Tool names are case-sensitive.
* Allowed characters: uppercase and lowercase ASCII letters (A-Z, a-z), digits
* (0-9), underscore (_), dash (-), and dot (.).
* Tool names SHOULD NOT contain spaces, commas, or other special characters.
*/
/**
* Regular expression for valid tool names according to SEP-986 specification
*/
var cm = /^[A-Za-z0-9._-]{1,128}$/;
/**
* Validates a tool name according to the SEP specification
* @param name - The tool name to validate
* @returns An object containing validation result and any warnings
*/
function lm(e) {
	let t = [];
	if (e.length === 0) return {
		isValid: !1,
		warnings: ["Tool name cannot be empty"]
	};
	if (e.length > 128) return {
		isValid: !1,
		warnings: [`Tool name exceeds maximum length of 128 characters (current: ${e.length})`]
	};
	if (e.includes(" ") && t.push("Tool name contains spaces, which may cause parsing issues"), e.includes(",") && t.push("Tool name contains commas, which may cause parsing issues"), (e.startsWith("-") || e.endsWith("-")) && t.push("Tool name starts or ends with a dash, which may cause parsing issues in some contexts"), (e.startsWith(".") || e.endsWith(".")) && t.push("Tool name starts or ends with a dot, which may cause parsing issues in some contexts"), !cm.test(e)) {
		let n = e.split("").filter((e) => !/[A-Za-z0-9._-]/.test(e)).filter((e, t, n) => n.indexOf(e) === t);
		return t.push(`Tool name contains invalid characters: ${n.map((e) => `"${e}"`).join(", ")}`, "Allowed characters are: A-Z, a-z, 0-9, underscore (_), dash (-), and dot (.)"), {
			isValid: !1,
			warnings: t
		};
	}
	return {
		isValid: !0,
		warnings: t
	};
}
/**
* Issues warnings for non-conforming tool names
* @param name - The tool name that triggered the warnings
* @param warnings - Array of warning messages
*/
function um(e, t) {
	if (t.length > 0) {
		console.warn(`Tool name validation warning for "${e}":`);
		for (let e of t) console.warn(`  - ${e}`);
		console.warn("Tool registration will proceed, but this may cause compatibility issues."), console.warn("Consider updating the tool name to conform to the MCP tool naming standard."), console.warn("See SEP: Specify Format for Tool Names (https://github.com/modelcontextprotocol/modelcontextprotocol/issues/986) for more details.");
	}
}
/**
* Validates a tool name and issues warnings for non-conforming names
* @param name - The tool name to validate
* @returns true if the name is valid, false otherwise
*/
function dm(e) {
	let t = lm(e);
	return um(e, t.warnings), t.isValid;
}
/**
* Experimental McpServer task features for MCP SDK.
* WARNING: These APIs are experimental and may change without notice.
*
* @experimental
*/
/**
* Experimental task features for McpServer.
*
* Access via `server.experimental.tasks`:
* ```typescript
* server.experimental.tasks.registerToolTask('long-running', config, handler);
* ```
*
* @experimental
*/
var fm = class {
	constructor(e) {
		this._mcpServer = e;
	}
	registerToolTask(e, t, n) {
		let r = {
			taskSupport: "required",
			...t.execution
		};
		if (r.taskSupport === "forbidden") throw Error(`Cannot register task-based tool '${e}' with taskSupport 'forbidden'. Use registerTool() instead.`);
		return this._mcpServer._createRegisteredTool(e, t.title, t.description, t.inputSchema, t.outputSchema, t.annotations, r, t._meta, n);
	}
}, pm = class {
	constructor(e, t) {
		this._registeredResources = {}, this._registeredResourceTemplates = {}, this._registeredTools = {}, this._registeredPrompts = {}, this._toolHandlersInitialized = !1, this._completionHandlerInitialized = !1, this._resourceHandlersInitialized = !1, this._promptHandlersInitialized = !1, this.server = new rm(e, t);
	}
	/**
	* Access experimental features.
	*
	* WARNING: These APIs are experimental and may change without notice.
	*
	* @experimental
	*/
	get experimental() {
		return this._experimental ||= { tasks: new fm(this) }, this._experimental;
	}
	/**
	* Attaches to the given transport, starts it, and starts listening for messages.
	*
	* The `server` object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
	*/
	async connect(e) {
		return await this.server.connect(e);
	}
	/**
	* Closes the connection.
	*/
	async close() {
		await this.server.close();
	}
	setToolRequestHandlers() {
		this._toolHandlersInitialized ||= (this.server.assertCanSetRequestHandler(bm(xu)), this.server.assertCanSetRequestHandler(bm(Tu)), this.server.registerCapabilities({ tools: { listChanged: !0 } }), this.server.setRequestHandler(xu, () => ({ tools: Object.entries(this._registeredTools).filter(([, e]) => e.enabled).map(([e, t]) => {
			let n = {
				name: e,
				title: t.title,
				description: t.description,
				inputSchema: (() => {
					let e = Go(t.inputSchema);
					return e ? mf(e, {
						strictUnions: !0,
						pipeStrategy: "input"
					}) : mm;
				})(),
				annotations: t.annotations,
				execution: t.execution,
				_meta: t._meta
			};
			if (t.outputSchema) {
				let e = Go(t.outputSchema);
				e && (n.outputSchema = mf(e, {
					strictUnions: !0,
					pipeStrategy: "output"
				}));
			}
			return n;
		}) })), this.server.setRequestHandler(Tu, async (e, t) => {
			try {
				var n;
				let r = this._registeredTools[e.params.name];
				if (!r) throw new Y(J.InvalidParams, `Tool ${e.params.name} not found`);
				if (!r.enabled) throw new Y(J.InvalidParams, `Tool ${e.params.name} disabled`);
				let i = !!e.params.task, a = (n = r.execution) == null ? void 0 : n.taskSupport, o = "createTask" in r.handler;
				if ((a === "required" || a === "optional") && !o) throw new Y(J.InternalError, `Tool ${e.params.name} has taskSupport '${a}' but was not registered with registerToolTask`);
				if (a === "required" && !i) throw new Y(J.MethodNotFound, `Tool ${e.params.name} requires task augmentation (taskSupport: 'required')`);
				if (a === "optional" && !i && o) return await this.handleAutomaticTaskPolling(r, e, t);
				let s = await this.validateToolInput(r, e.params.arguments, e.params.name), c = await this.executeToolHandler(r, s, t);
				return i || await this.validateToolOutput(r, c, e.params.name), c;
			} catch (e) {
				if (e instanceof Y && e.code === J.UrlElicitationRequired) throw e;
				return this.createToolError(e instanceof Error ? e.message : String(e));
			}
		}), !0);
	}
	/**
	* Creates a tool error result.
	*
	* @param errorMessage - The error message.
	* @returns The tool error result.
	*/
	createToolError(e) {
		return {
			content: [{
				type: "text",
				text: e
			}],
			isError: !0
		};
	}
	/**
	* Validates tool input arguments against the tool's input schema.
	*/
	async validateToolInput(e, t, n) {
		if (!e.inputSchema) return;
		let r = await Uo(Go(e.inputSchema) ?? e.inputSchema, t);
		if (!r.success) {
			let e = Ko("error" in r ? r.error : "Unknown error");
			throw new Y(J.InvalidParams, `Input validation error: Invalid arguments for tool ${n}: ${e}`);
		}
		return r.data;
	}
	/**
	* Validates tool output against the tool's output schema.
	*/
	async validateToolOutput(e, t, n) {
		if (!e.outputSchema || !("content" in t) || t.isError) return;
		if (!t.structuredContent) throw new Y(J.InvalidParams, `Output validation error: Tool ${n} has an output schema but no structured content was provided`);
		let r = await Uo(Go(e.outputSchema), t.structuredContent);
		if (!r.success) {
			let e = Ko("error" in r ? r.error : "Unknown error");
			throw new Y(J.InvalidParams, `Output validation error: Invalid structured content for tool ${n}: ${e}`);
		}
	}
	/**
	* Executes a tool handler (either regular or task-based).
	*/
	async executeToolHandler(e, t, n) {
		let r = e.handler;
		if ("createTask" in r) {
			if (!n.taskStore) throw Error("No task store provided.");
			let i = {
				...n,
				taskStore: n.taskStore
			};
			if (e.inputSchema) {
				let e = r;
				return await Promise.resolve(e.createTask(t, i));
			} else {
				let e = r;
				return await Promise.resolve(e.createTask(i));
			}
		}
		if (e.inputSchema) {
			let e = r;
			return await Promise.resolve(e(t, n));
		} else {
			let e = r;
			return await Promise.resolve(e(n));
		}
	}
	/**
	* Handles automatic task polling for tools with taskSupport 'optional'.
	*/
	async handleAutomaticTaskPolling(e, t, n) {
		if (!n.taskStore) throw Error("No task store provided for task-capable tool.");
		let r = await this.validateToolInput(e, t.params.arguments, t.params.name), i = e.handler, a = {
			...n,
			taskStore: n.taskStore
		}, o = r ? await Promise.resolve(i.createTask(r, a)) : await Promise.resolve(i.createTask(a)), s = o.task.taskId, c = o.task, l = c.pollInterval ?? 5e3;
		for (; c.status !== "completed" && c.status !== "failed" && c.status !== "cancelled";) {
			await new Promise((e) => setTimeout(e, l));
			let e = await n.taskStore.getTask(s);
			if (!e) throw new Y(J.InternalError, `Task ${s} not found during polling`);
			c = e;
		}
		return await n.taskStore.getTaskResult(s);
	}
	setCompletionRequestHandler() {
		this._completionHandlerInitialized ||= (this.server.assertCanSetRequestHandler(bm(nd)), this.server.registerCapabilities({ completions: {} }), this.server.setRequestHandler(nd, async (e) => {
			switch (e.params.ref.type) {
				case "ref/prompt": return rd(e), this.handlePromptCompletion(e, e.params.ref);
				case "ref/resource": return id(e), this.handleResourceCompletion(e, e.params.ref);
				default: throw new Y(J.InvalidParams, `Invalid completion reference: ${e.params.ref}`);
			}
		}), !0);
	}
	async handlePromptCompletion(e, t) {
		let n = this._registeredPrompts[t.name];
		if (!n) throw new Y(J.InvalidParams, `Prompt ${t.name} not found`);
		if (!n.enabled) throw new Y(J.InvalidParams, `Prompt ${t.name} disabled`);
		if (!n.argsSchema) return Sm;
		let r = Wo(n.argsSchema), i = r == null ? void 0 : r[e.params.argument.name];
		if (!am(i)) return Sm;
		let a = om(i);
		return a ? xm(await a(e.params.argument.value, e.params.context)) : Sm;
	}
	async handleResourceCompletion(e, t) {
		let n = Object.values(this._registeredResourceTemplates).find((e) => e.resourceTemplate.uriTemplate.toString() === t.uri);
		if (!n) {
			if (this._registeredResources[t.uri]) return Sm;
			throw new Y(J.InvalidParams, `Resource template ${e.params.ref.uri} not found`);
		}
		let r = n.resourceTemplate.completeCallback(e.params.argument.name);
		return r ? xm(await r(e.params.argument.value, e.params.context)) : Sm;
	}
	setResourceRequestHandlers() {
		this._resourceHandlersInitialized ||= (this.server.assertCanSetRequestHandler(bm(Hl)), this.server.assertCanSetRequestHandler(bm(Wl)), this.server.assertCanSetRequestHandler(bm(Jl)), this.server.registerCapabilities({ resources: { listChanged: !0 } }), this.server.setRequestHandler(Hl, async (e, t) => {
			let n = Object.entries(this._registeredResources).filter(([e, t]) => t.enabled).map(([e, t]) => ({
				uri: e,
				name: t.name,
				...t.metadata
			})), r = [];
			for (let e of Object.values(this._registeredResourceTemplates)) {
				if (!e.resourceTemplate.listCallback) continue;
				let n = await e.resourceTemplate.listCallback(t);
				for (let t of n.resources) r.push({
					...e.metadata,
					...t
				});
			}
			return { resources: [...n, ...r] };
		}), this.server.setRequestHandler(Wl, async () => ({ resourceTemplates: Object.entries(this._registeredResourceTemplates).map(([e, t]) => ({
			name: e,
			uriTemplate: t.resourceTemplate.uriTemplate.toString(),
			...t.metadata
		})) })), this.server.setRequestHandler(Jl, async (e, t) => {
			let n = new URL(e.params.uri), r = this._registeredResources[n.toString()];
			if (r) {
				if (!r.enabled) throw new Y(J.InvalidParams, `Resource ${n} disabled`);
				return r.readCallback(n, t);
			}
			for (let e of Object.values(this._registeredResourceTemplates)) {
				let r = e.resourceTemplate.uriTemplate.match(n.toString());
				if (r) return e.readCallback(n, r, t);
			}
			throw new Y(J.InvalidParams, `Resource ${n} not found`);
		}), !0);
	}
	setPromptRequestHandlers() {
		this._promptHandlersInitialized ||= (this.server.assertCanSetRequestHandler(bm(au)), this.server.assertCanSetRequestHandler(bm(cu)), this.server.registerCapabilities({ prompts: { listChanged: !0 } }), this.server.setRequestHandler(au, () => ({ prompts: Object.entries(this._registeredPrompts).filter(([, e]) => e.enabled).map(([e, t]) => ({
			name: e,
			title: t.title,
			description: t.description,
			arguments: t.argsSchema ? ym(t.argsSchema) : void 0
		})) })), this.server.setRequestHandler(cu, async (e, t) => {
			let n = this._registeredPrompts[e.params.name];
			if (!n) throw new Y(J.InvalidParams, `Prompt ${e.params.name} not found`);
			if (!n.enabled) throw new Y(J.InvalidParams, `Prompt ${e.params.name} disabled`);
			if (n.argsSchema) {
				let r = await Uo(Go(n.argsSchema), e.params.arguments);
				if (!r.success) {
					let t = Ko("error" in r ? r.error : "Unknown error");
					throw new Y(J.InvalidParams, `Invalid arguments for prompt ${e.params.name}: ${t}`);
				}
				let i = r.data, a = n.callback;
				return await Promise.resolve(a(i, t));
			} else {
				let e = n.callback;
				return await Promise.resolve(e(t));
			}
		}), !0);
	}
	resource(e, t, ...n) {
		let r;
		typeof n[0] == "object" && (r = n.shift());
		let i = n[0];
		if (typeof t == "string") {
			if (this._registeredResources[t]) throw Error(`Resource ${t} is already registered`);
			let n = this._createRegisteredResource(e, void 0, t, r, i);
			return this.setResourceRequestHandlers(), this.sendResourceListChanged(), n;
		} else {
			if (this._registeredResourceTemplates[e]) throw Error(`Resource template ${e} is already registered`);
			let n = this._createRegisteredResourceTemplate(e, void 0, t, r, i);
			return this.setResourceRequestHandlers(), this.sendResourceListChanged(), n;
		}
	}
	registerResource(e, t, n, r) {
		if (typeof t == "string") {
			if (this._registeredResources[t]) throw Error(`Resource ${t} is already registered`);
			let i = this._createRegisteredResource(e, n.title, t, n, r);
			return this.setResourceRequestHandlers(), this.sendResourceListChanged(), i;
		} else {
			if (this._registeredResourceTemplates[e]) throw Error(`Resource template ${e} is already registered`);
			let i = this._createRegisteredResourceTemplate(e, n.title, t, n, r);
			return this.setResourceRequestHandlers(), this.sendResourceListChanged(), i;
		}
	}
	_createRegisteredResource(e, t, n, r, i) {
		let a = {
			name: e,
			title: t,
			metadata: r,
			readCallback: i,
			enabled: !0,
			disable: () => a.update({ enabled: !1 }),
			enable: () => a.update({ enabled: !0 }),
			remove: () => a.update({ uri: null }),
			update: (e) => {
				e.uri !== void 0 && e.uri !== n && (delete this._registeredResources[n], e.uri && (this._registeredResources[e.uri] = a)), e.name !== void 0 && (a.name = e.name), e.title !== void 0 && (a.title = e.title), e.metadata !== void 0 && (a.metadata = e.metadata), e.callback !== void 0 && (a.readCallback = e.callback), e.enabled !== void 0 && (a.enabled = e.enabled), this.sendResourceListChanged();
			}
		};
		return this._registeredResources[n] = a, a;
	}
	_createRegisteredResourceTemplate(e, t, n, r, i) {
		let a = {
			resourceTemplate: n,
			title: t,
			metadata: r,
			readCallback: i,
			enabled: !0,
			disable: () => a.update({ enabled: !1 }),
			enable: () => a.update({ enabled: !0 }),
			remove: () => a.update({ name: null }),
			update: (t) => {
				t.name !== void 0 && t.name !== e && (delete this._registeredResourceTemplates[e], t.name && (this._registeredResourceTemplates[t.name] = a)), t.title !== void 0 && (a.title = t.title), t.template !== void 0 && (a.resourceTemplate = t.template), t.metadata !== void 0 && (a.metadata = t.metadata), t.callback !== void 0 && (a.readCallback = t.callback), t.enabled !== void 0 && (a.enabled = t.enabled), this.sendResourceListChanged();
			}
		};
		this._registeredResourceTemplates[e] = a;
		let o = n.uriTemplate.variableNames;
		return Array.isArray(o) && o.some((e) => !!n.completeCallback(e)) && this.setCompletionRequestHandler(), a;
	}
	_createRegisteredPrompt(e, t, n, r, i) {
		let a = {
			title: t,
			description: n,
			argsSchema: r === void 0 ? void 0 : Vo(r),
			callback: i,
			enabled: !0,
			disable: () => a.update({ enabled: !1 }),
			enable: () => a.update({ enabled: !0 }),
			remove: () => a.update({ name: null }),
			update: (t) => {
				t.name !== void 0 && t.name !== e && (delete this._registeredPrompts[e], t.name && (this._registeredPrompts[t.name] = a)), t.title !== void 0 && (a.title = t.title), t.description !== void 0 && (a.description = t.description), t.argsSchema !== void 0 && (a.argsSchema = Vo(t.argsSchema)), t.callback !== void 0 && (a.callback = t.callback), t.enabled !== void 0 && (a.enabled = t.enabled), this.sendPromptListChanged();
			}
		};
		return this._registeredPrompts[e] = a, r && Object.values(r).some((e) => {
			var t;
			return am(e instanceof cc ? (t = e._def) == null ? void 0 : t.innerType : e);
		}) && this.setCompletionRequestHandler(), a;
	}
	_createRegisteredTool(e, t, n, r, i, a, o, s, c) {
		dm(e);
		let l = {
			title: t,
			description: n,
			inputSchema: vm(r),
			outputSchema: vm(i),
			annotations: a,
			execution: o,
			_meta: s,
			handler: c,
			enabled: !0,
			disable: () => l.update({ enabled: !1 }),
			enable: () => l.update({ enabled: !0 }),
			remove: () => l.update({ name: null }),
			update: (t) => {
				t.name !== void 0 && t.name !== e && (typeof t.name == "string" && dm(t.name), delete this._registeredTools[e], t.name && (this._registeredTools[t.name] = l)), t.title !== void 0 && (l.title = t.title), t.description !== void 0 && (l.description = t.description), t.paramsSchema !== void 0 && (l.inputSchema = Vo(t.paramsSchema)), t.outputSchema !== void 0 && (l.outputSchema = Vo(t.outputSchema)), t.callback !== void 0 && (l.handler = t.callback), t.annotations !== void 0 && (l.annotations = t.annotations), t._meta !== void 0 && (l._meta = t._meta), t.enabled !== void 0 && (l.enabled = t.enabled), this.sendToolListChanged();
			}
		};
		return this._registeredTools[e] = l, this.setToolRequestHandlers(), this.sendToolListChanged(), l;
	}
	/**
	* tool() implementation. Parses arguments passed to overrides defined above.
	*/
	tool(e, ...t) {
		if (this._registeredTools[e]) throw Error(`Tool ${e} is already registered`);
		let n, r, i;
		if (typeof t[0] == "string" && (n = t.shift()), t.length > 1) {
			let e = t[0];
			_m(e) ? (r = t.shift(), t.length > 1 && typeof t[0] == "object" && t[0] !== null && !_m(t[0]) && (i = t.shift())) : typeof e == "object" && e && (i = t.shift());
		}
		let a = t[0];
		return this._createRegisteredTool(e, void 0, n, r, void 0, i, { taskSupport: "forbidden" }, void 0, a);
	}
	/**
	* Registers a tool with a config object and callback.
	*/
	registerTool(e, t, n) {
		if (this._registeredTools[e]) throw Error(`Tool ${e} is already registered`);
		let { title: r, description: i, inputSchema: a, outputSchema: o, annotations: s, _meta: c } = t;
		return this._createRegisteredTool(e, r, i, a, o, s, { taskSupport: "forbidden" }, c, n);
	}
	prompt(e, ...t) {
		if (this._registeredPrompts[e]) throw Error(`Prompt ${e} is already registered`);
		let n;
		typeof t[0] == "string" && (n = t.shift());
		let r;
		t.length > 1 && (r = t.shift());
		let i = t[0], a = this._createRegisteredPrompt(e, void 0, n, r, i);
		return this.setPromptRequestHandlers(), this.sendPromptListChanged(), a;
	}
	/**
	* Registers a prompt with a config object and callback.
	*/
	registerPrompt(e, t, n) {
		if (this._registeredPrompts[e]) throw Error(`Prompt ${e} is already registered`);
		let { title: r, description: i, argsSchema: a } = t, o = this._createRegisteredPrompt(e, r, i, a, n);
		return this.setPromptRequestHandlers(), this.sendPromptListChanged(), o;
	}
	/**
	* Checks if the server is connected to a transport.
	* @returns True if the server is connected
	*/
	isConnected() {
		return this.server.transport !== void 0;
	}
	/**
	* Sends a logging message to the client, if connected.
	* Note: You only need to send the parameters object, not the entire JSON RPC message
	* @see LoggingMessageNotification
	* @param params
	* @param sessionId optional for stateless and backward compatibility
	*/
	async sendLoggingMessage(e, t) {
		return this.server.sendLoggingMessage(e, t);
	}
	/**
	* Sends a resource list changed event to the client, if connected.
	*/
	sendResourceListChanged() {
		this.isConnected() && this.server.sendResourceListChanged();
	}
	/**
	* Sends a tool list changed event to the client, if connected.
	*/
	sendToolListChanged() {
		this.isConnected() && this.server.sendToolListChanged();
	}
	/**
	* Sends a prompt list changed event to the client, if connected.
	*/
	sendPromptListChanged() {
		this.isConnected() && this.server.sendPromptListChanged();
	}
}, mm = {
	type: "object",
	properties: {}
};
/**
* Checks if a value looks like a Zod schema by checking for parse/safeParse methods.
*/
function hm(e) {
	return typeof e == "object" && !!e && "parse" in e && typeof e.parse == "function" && "safeParse" in e && typeof e.safeParse == "function";
}
/**
* Checks if an object is a Zod schema instance (v3 or v4).
*
* Zod schemas have internal markers:
* - v3: `_def` property
* - v4: `_zod` property
*
* This includes transformed schemas like z.preprocess(), z.transform(), z.pipe().
*/
function gm(e) {
	return "_def" in e || "_zod" in e || hm(e);
}
/**
* Checks if an object is a "raw shape" - a plain object where values are Zod schemas.
*
* Raw shapes are used as shorthand: `{ name: z.string() }` instead of `z.object({ name: z.string() })`.
*
* IMPORTANT: This must NOT match actual Zod schema instances (like z.preprocess, z.pipe),
* which have internal properties that could be mistaken for schema values.
*/
function _m(e) {
	return typeof e != "object" || !e || gm(e) ? !1 : Object.keys(e).length === 0 ? !0 : Object.values(e).some(hm);
}
/**
* Converts a provided Zod schema to a Zod object if it is a ZodRawShapeCompat,
* otherwise returns the schema as is.
*/
function vm(e) {
	if (e) return _m(e) ? Vo(e) : e;
}
function ym(e) {
	let t = Wo(e);
	return t ? Object.entries(t).map(([e, t]) => ({
		name: e,
		description: qo(t),
		required: !Jo(t)
	})) : [];
}
function bm(e) {
	let t = Wo(e), n = t == null ? void 0 : t.method;
	if (!n) throw Error("Schema is missing a method literal");
	let r = Yo(n);
	if (typeof r == "string") return r;
	throw Error("Schema method literal must be a string");
}
function xm(e) {
	return { completion: {
		values: e.slice(0, 100),
		total: e.length,
		hasMore: e.length > 100
	} };
}
var Sm = { completion: {
	values: [],
	hasMore: !1
} }, Cm = /* @__PURE__ */ u((/* @__PURE__ */ s(((e, t) => {
	t.exports = {};
})))(), 1), wm = class {
	append(e) {
		this._buffer = this._buffer ? Buffer.concat([this._buffer, e]) : e;
	}
	readMessage() {
		if (!this._buffer) return null;
		let e = this._buffer.indexOf("\n");
		if (e === -1) return null;
		let t = this._buffer.toString("utf8", 0, e).replace(/\r$/, "");
		return this._buffer = this._buffer.subarray(e + 1), Tm(t);
	}
	clear() {
		this._buffer = void 0;
	}
};
function Tm(e) {
	return $c.parse(JSON.parse(e));
}
function Em(e) {
	return JSON.stringify(e) + "\n";
}
/**
* Server transport for stdio: this communicates with an MCP client by reading from the current process' stdin and writing to stdout.
*
* This transport is only available in Node.js environments.
*/
var Dm = class {
	constructor(e = Cm.default.stdin, t = Cm.default.stdout) {
		this._stdin = e, this._stdout = t, this._readBuffer = new wm(), this._started = !1, this._ondata = (e) => {
			this._readBuffer.append(e), this.processReadBuffer();
		}, this._onerror = (e) => {
			var t;
			(t = this.onerror) == null || t.call(this, e);
		};
	}
	/**
	* Starts listening for messages on stdin.
	*/
	async start() {
		if (this._started) throw Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");
		this._started = !0, this._stdin.on("data", this._ondata), this._stdin.on("error", this._onerror);
	}
	processReadBuffer() {
		for (;;) try {
			var e;
			let t = this._readBuffer.readMessage();
			if (t === null) break;
			(e = this.onmessage) == null || e.call(this, t);
		} catch (e) {
			var t;
			(t = this.onerror) == null || t.call(this, e);
		}
	}
	async close() {
		var e;
		this._stdin.off("data", this._ondata), this._stdin.off("error", this._onerror), this._stdin.listenerCount("data") === 0 && this._stdin.pause(), this._readBuffer.clear(), (e = this.onclose) == null || e.call(this);
	}
	send(e) {
		return new Promise((t) => {
			let n = Em(e);
			this._stdout.write(n) ? t() : this._stdout.once("drain", t);
		});
	}
};
function Om(e) {
	return e == null ? [] : Array.isArray(e) ? e : [e];
}
function km(e, t, n, r) {
	var i, a = e[t], o = ~r.string.indexOf(t) ? n == null || n === !0 ? "" : String(n) : typeof n == "boolean" ? n : ~r.boolean.indexOf(t) ? n === "false" ? !1 : n === "true" || (e._.push((i = +n, i * 0 == 0 ? i : n)), !!n) : (i = +n, i * 0 == 0 ? i : n);
	e[t] = a == null ? o : Array.isArray(a) ? a.concat(o) : [a, o];
}
function Am(e, t) {
	e ||= [], t ||= {};
	var n, r, i, a, o, s = { _: [] }, c = 0, l = 0, u = 0, d = e.length;
	let f = t.alias !== void 0, p = t.unknown !== void 0, m = t.default !== void 0;
	if (t.alias = t.alias || {}, t.string = Om(t.string), t.boolean = Om(t.boolean), f) for (n in t.alias) for (r = t.alias[n] = Om(t.alias[n]), c = 0; c < r.length; c++) (t.alias[r[c]] = r.concat(n)).splice(c, 1);
	for (c = t.boolean.length; c-- > 0;) for (r = t.alias[t.boolean[c]] || [], l = r.length; l-- > 0;) t.boolean.push(r[l]);
	for (c = t.string.length; c-- > 0;) for (r = t.alias[t.string[c]] || [], l = r.length; l-- > 0;) t.string.push(r[l]);
	if (m) {
		for (n in t.default) if (a = typeof t.default[n], r = t.alias[n] = t.alias[n] || [], t[a] !== void 0) for (t[a].push(n), c = 0; c < r.length; c++) t[a].push(r[c]);
	}
	let h = p ? Object.keys(t.alias) : [];
	for (c = 0; c < d; c++) {
		if (i = e[c], i === "--") {
			s._ = s._.concat(e.slice(++c));
			break;
		}
		for (l = 0; l < i.length && i.charCodeAt(l) === 45; l++);
		if (l === 0) s._.push(i);
		else if (i.substring(l, l + 3) === "no-") {
			if (a = i.substring(l + 3), p && !~h.indexOf(a)) return t.unknown(i);
			s[a] = !1;
		} else {
			for (u = l + 1; u < i.length && i.charCodeAt(u) !== 61; u++);
			for (a = i.substring(l, u), o = i.substring(++u) || c + 1 === d || ("" + e[c + 1]).charCodeAt(0) === 45 || e[++c], r = l === 2 ? [a] : a, u = 0; u < r.length; u++) {
				if (a = r[u], p && !~h.indexOf(a)) return t.unknown("-".repeat(l) + a);
				km(s, a, u + 1 < r.length || o, t);
			}
		}
	}
	if (m) for (n in t.default) s[n] === void 0 && (s[n] = t.default[n]);
	if (f) for (n in s) for (r = t.alias[n] || []; r.length > 0;) s[r.shift()] = s[n];
	return s;
}
var jm = (e) => e.replace(/[<[].+/, "").trim(), Mm = (e) => {
	let t = /<([^>]+)>/g, n = /\[([^\]]+)\]/g, r = [], i = (e) => {
		let t = !1, n = e[1];
		return n.startsWith("...") && (n = n.slice(3), t = !0), {
			required: e[0].startsWith("<"),
			value: n,
			variadic: t
		};
	}, a;
	for (; a = t.exec(e);) r.push(i(a));
	let o;
	for (; o = n.exec(e);) r.push(i(o));
	return r;
}, Nm = (e) => {
	let t = {
		alias: {},
		boolean: []
	};
	for (let [n, r] of e.entries()) r.names.length > 1 && (t.alias[r.names[0]] = r.names.slice(1)), r.isBoolean && (r.negated && e.some((e, t) => t !== n && e.names.some((e) => r.names.includes(e)) && typeof e.required == "boolean") || t.boolean.push(r.names[0]));
	return t;
}, Pm = (e) => e.sort((e, t) => e.length > t.length ? -1 : 1)[0], Fm = (e, t) => e.length >= t ? e : `${e}${" ".repeat(t - e.length)}`, Im = (e) => e.replace(/([a-z])-([a-z])/g, (e, t, n) => t + n.toUpperCase()), Lm = (e, t, n) => {
	let r = 0, i = t.length, a = e, o;
	for (; r < i; ++r) o = a[t[r]], a = a[t[r]] = r === i - 1 ? n : o ?? (~t[r + 1].indexOf(".") || !(+t[r + 1] > -1) ? {} : []);
}, Rm = (e, t) => {
	for (let n of Object.keys(t)) {
		let r = t[n];
		r.shouldTransform && (e[n] = Array.prototype.concat.call([], e[n]), typeof r.transformFunction == "function" && (e[n] = e[n].map(r.transformFunction)));
	}
}, zm = (e) => {
	let t = /([^\\\/]+)$/.exec(e);
	return t ? t[1] : "";
}, Bm = (e) => e.split(".").map((e, t) => t === 0 ? Im(e) : e).join("."), Vm = class extends Error {
	constructor(e) {
		super(e), this.name = this.constructor.name, typeof Error.captureStackTrace == "function" ? Error.captureStackTrace(this, this.constructor) : this.stack = Error(e).stack;
	}
}, Hm = class {
	constructor(e, t, n) {
		this.rawName = e, this.description = t, this.config = Object.assign({}, n), e = e.replace(/\.\*/g, ""), this.negated = !1, this.names = jm(e).split(",").map((e) => {
			let t = e.trim().replace(/^-{1,2}/, "");
			return t.startsWith("no-") && (this.negated = !0, t = t.replace(/^no-/, "")), Bm(t);
		}).sort((e, t) => e.length > t.length ? 1 : -1), this.name = this.names[this.names.length - 1], this.negated && this.config.default == null && (this.config.default = !0), e.includes("<") ? this.required = !0 : e.includes("[") ? this.required = !1 : this.isBoolean = !0;
	}
}, Um = process.argv, Wm = `${process.platform}-${process.arch} node-${process.version}`, Gm = class {
	constructor(e, t, n = {}, r) {
		this.rawName = e, this.description = t, this.config = n, this.cli = r, this.options = [], this.aliasNames = [], this.name = jm(e), this.args = Mm(e), this.examples = [];
	}
	usage(e) {
		return this.usageText = e, this;
	}
	allowUnknownOptions() {
		return this.config.allowUnknownOptions = !0, this;
	}
	ignoreOptionDefaultValue() {
		return this.config.ignoreOptionDefaultValue = !0, this;
	}
	version(e, t = "-v, --version") {
		return this.versionNumber = e, this.option(t, "Display version number"), this;
	}
	example(e) {
		return this.examples.push(e), this;
	}
	option(e, t, n) {
		let r = new Hm(e, t, n);
		return this.options.push(r), this;
	}
	alias(e) {
		return this.aliasNames.push(e), this;
	}
	action(e) {
		return this.commandAction = e, this;
	}
	isMatched(e) {
		return this.name === e || this.aliasNames.includes(e);
	}
	get isDefaultCommand() {
		return this.name === "" || this.aliasNames.includes("!");
	}
	get isGlobalCommand() {
		return this instanceof Km;
	}
	hasOption(e) {
		return e = e.split(".")[0], this.options.find((t) => t.names.includes(e));
	}
	outputHelp() {
		let { name: e, commands: t } = this.cli, { versionNumber: n, options: r, helpCallback: i } = this.cli.globalCommand, a = [{ body: `${e}${n ? `/${n}` : ""}` }];
		if (a.push({
			title: "Usage",
			body: `  $ ${e} ${this.usageText || this.rawName}`
		}), (this.isGlobalCommand || this.isDefaultCommand) && t.length > 0) {
			let n = Pm(t.map((e) => e.rawName));
			a.push({
				title: "Commands",
				body: t.map((e) => `  ${Fm(e.rawName, n.length)}  ${e.description}`).join("\n")
			}), a.push({
				title: "For more info, run any command with the `--help` flag",
				body: t.map((t) => `  $ ${e}${t.name === "" ? "" : ` ${t.name}`} --help`).join("\n")
			});
		}
		let o = this.isGlobalCommand ? r : [...this.options, ...r || []];
		if (!this.isGlobalCommand && !this.isDefaultCommand && (o = o.filter((e) => e.name !== "version")), o.length > 0) {
			let e = Pm(o.map((e) => e.rawName));
			a.push({
				title: "Options",
				body: o.map((t) => `  ${Fm(t.rawName, e.length)}  ${t.description} ${t.config.default === void 0 ? "" : `(default: ${t.config.default})`}`).join("\n")
			});
		}
		this.examples.length > 0 && a.push({
			title: "Examples",
			body: this.examples.map((t) => typeof t == "function" ? t(e) : t).join("\n")
		}), i && (a = i(a) || a), console.log(a.map((e) => e.title ? `${e.title}:
${e.body}` : e.body).join("\n\n"));
	}
	outputVersion() {
		let { name: e } = this.cli, { versionNumber: t } = this.cli.globalCommand;
		t && console.log(`${e}/${t} ${Wm}`);
	}
	checkRequiredArgs() {
		let e = this.args.filter((e) => e.required).length;
		if (this.cli.args.length < e) throw new Vm(`missing required args for command \`${this.rawName}\``);
	}
	checkUnknownOptions() {
		let { options: e, globalCommand: t } = this.cli;
		if (!this.config.allowUnknownOptions) {
			for (let n of Object.keys(e)) if (n !== "--" && !this.hasOption(n) && !t.hasOption(n)) throw new Vm(`Unknown option \`${n.length > 1 ? `--${n}` : `-${n}`}\``);
		}
	}
	checkOptionValue() {
		let { options: e, globalCommand: t } = this.cli, n = [...t.options, ...this.options];
		for (let t of n) {
			let r = e[t.name.split(".")[0]];
			if (t.required) {
				let e = n.some((e) => e.negated && e.names.includes(t.name));
				if (r === !0 || r === !1 && !e) throw new Vm(`option \`${t.rawName}\` value is missing`);
			}
		}
	}
}, Km = class extends Gm {
	constructor(e) {
		super("@@global@@", "", {}, e);
	}
}, qm = Object.assign, Jm = class extends Cm.EventEmitter {
	constructor(e = "") {
		super(), this.name = e, this.commands = [], this.rawArgs = [], this.args = [], this.options = {}, this.globalCommand = new Km(this), this.globalCommand.usage("<command> [options]");
	}
	usage(e) {
		return this.globalCommand.usage(e), this;
	}
	command(e, t, n) {
		let r = new Gm(e, t || "", n, this);
		return r.globalCommand = this.globalCommand, this.commands.push(r), r;
	}
	option(e, t, n) {
		return this.globalCommand.option(e, t, n), this;
	}
	help(e) {
		return this.globalCommand.option("-h, --help", "Display this message"), this.globalCommand.helpCallback = e, this.showHelpOnExit = !0, this;
	}
	version(e, t = "-v, --version") {
		return this.globalCommand.version(e, t), this.showVersionOnExit = !0, this;
	}
	example(e) {
		return this.globalCommand.example(e), this;
	}
	outputHelp() {
		this.matchedCommand ? this.matchedCommand.outputHelp() : this.globalCommand.outputHelp();
	}
	outputVersion() {
		this.globalCommand.outputVersion();
	}
	setParsedInfo({ args: e, options: t }, n, r) {
		return this.args = e, this.options = t, n && (this.matchedCommand = n), r && (this.matchedCommandName = r), this;
	}
	unsetMatchedCommand() {
		this.matchedCommand = void 0, this.matchedCommandName = void 0;
	}
	parse(e = Um, { run: t = !0 } = {}) {
		this.rawArgs = e, this.name ||= e[1] ? zm(e[1]) : "cli";
		let n = !0;
		for (let t of this.commands) {
			let r = this.mri(e.slice(2), t), i = r.args[0];
			if (t.isMatched(i)) {
				n = !1;
				let e = qm(qm({}, r), { args: r.args.slice(1) });
				this.setParsedInfo(e, t, i), this.emit(`command:${i}`, t);
			}
		}
		if (n) {
			for (let t of this.commands) if (t.name === "") {
				n = !1;
				let r = this.mri(e.slice(2), t);
				this.setParsedInfo(r, t), this.emit("command:!", t);
			}
		}
		if (n) {
			let t = this.mri(e.slice(2));
			this.setParsedInfo(t);
		}
		this.options.help && this.showHelpOnExit && (this.outputHelp(), t = !1, this.unsetMatchedCommand()), this.options.version && this.showVersionOnExit && this.matchedCommandName == null && (this.outputVersion(), t = !1, this.unsetMatchedCommand());
		let r = {
			args: this.args,
			options: this.options
		};
		return t && this.runMatchedCommand(), !this.matchedCommand && this.args[0] && this.emit("command:*"), r;
	}
	mri(e, t) {
		let n = [...this.globalCommand.options, ...t ? t.options : []], r = Nm(n), i = [], a = e.indexOf("--");
		a > -1 && (i = e.slice(a + 1), e = e.slice(0, a));
		let o = Am(e, r);
		o = Object.keys(o).reduce((e, t) => qm(qm({}, e), { [Bm(t)]: o[t] }), { _: [] });
		let s = o._, c = { "--": i }, l = t && t.config.ignoreOptionDefaultValue ? t.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue, u = Object.create(null);
		for (let e of n) {
			if (!l && e.config.default !== void 0) for (let t of e.names) c[t] = e.config.default;
			Array.isArray(e.config.type) && u[e.name] === void 0 && (u[e.name] = Object.create(null), u[e.name].shouldTransform = !0, u[e.name].transformFunction = e.config.type[0]);
		}
		for (let e of Object.keys(o)) e !== "_" && (Lm(c, e.split("."), o[e]), Rm(c, u));
		return {
			args: s,
			options: c
		};
	}
	runMatchedCommand() {
		let { args: e, options: t, matchedCommand: n } = this;
		if (!n || !n.commandAction) return;
		n.checkUnknownOptions(), n.checkOptionValue(), n.checkRequiredArgs();
		let r = [];
		return n.args.forEach((t, n) => {
			t.variadic ? r.push(e.slice(n)) : r.push(e[n]);
		}), r.push(t), n.commandAction.apply(this, r);
	}
}, Ym = (e = "") => new Jm(e);
const Xm = (e, t) => {
	let n = t(e) ?? {};
	return e.children && e.children.length > 0 && (n.children = e.children.map((e) => Xm(e, t))), n;
};
var Zm = JSON.parse(Cm.default.readFileSync("/Users/chiyao/Desktop/FigSense/demo/test.json", "utf8"));
const Qm = async (e) => {
	var t, n;
	let r = String((t = e.params.arguments) == null ? void 0 : t.title), i = String((n = e.params.arguments) == null ? void 0 : n.content);
	if (!r || !i) throw Error("Title and content are required");
	let a = Xm(Zm, (e) => e.type === "TEXT" ? {
		id: e.id,
		type: e.type,
		children: [],
		content: e.characters
	} : {
		id: e.id,
		type: e.type,
		children: []
	});
	return { content: [{
		type: "text",
		text: JSON.stringify(a)
	}] };
}, $m = async (e) => {
	var t;
	if (!String((t = e.params.arguments) == null ? void 0 : t.ids)) throw Error("IDs are required");
	return { content: [{
		type: "text",
		text: "{\n					\"type\":\"container\",\n					\"id\":\"123\",\n					\"children\":[\n						{\n							\"type\":\"text\",\n							\"id\":\"456\",\n							\"text\":\"Hello\"\n						},\n						{\n							\"type\":\"container\",\n							\"id\":\"789\",\n							\"children\":[\n								{\n									\"type\":\"text\",\n									\"id\":\"101112\",\n									\"text\":\"World\"\n								}\n							]\n						}\n					]\n				}"
	}] };
};
var eh = JSON.parse(Cm.default.readFileSync("/Users/chiyao/Desktop/FigSense/demo/test.json", "utf8"));
const th = async (e) => {
	var t, n;
	let r = String((t = e.params.arguments) == null ? void 0 : t.id), i = !!((n = e.params.arguments) != null && n.isRecursive);
	if (!r) throw Error("ID is required");
	let a = !1, o = {};
	return Xm(eh, (e) => {
		(e.id === r || a && i) && (a = !0, o[e.id] = e.style);
	}), { content: [{
		type: "text",
		text: JSON.stringify(o)
	}] };
};
var nh = JSON.parse(Cm.default.readFileSync("/Users/chiyao/Desktop/FigSense/demo/test.json", "utf8"));
const rh = async (e) => {
	var t;
	let n = String((t = e.params.arguments) == null ? void 0 : t.id);
	if (!n) throw Error("ID is required");
	let r = null, i = {};
	return Xm(nh, (e) => {
		e.id === n && (r = e), r && (i[e.id] = {
			x: e.absoluteRenderBounds.x - r.absoluteRenderBounds.x,
			y: e.absoluteRenderBounds.y - r.absoluteRenderBounds.y,
			width: e.absoluteRenderBounds.width,
			height: e.absoluteRenderBounds.height
		});
	}), { content: [{
		type: "text",
		text: JSON.stringify(i)
	}] };
}, ih = [
	{
		name: "get_dom_hierarchy",
		description: "Obtain the DOM hierarchy of the design draft element to generate the initial layout",
		inputSchema: {
			type: "object",
			properties: {},
			required: []
		}
	},
	{
		name: "get_non_layout_styles",
		description: "Get the non-layout styles of the element and its optional child elements by node ID, which is used to restore the element styles in the design draft.",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The ID of the element to get styles"
				},
				isRecursive: {
					type: "boolean",
					description: "Whether to recursively get styles of child elements",
					default: !0
				}
			},
			required: ["id"]
		}
	},
	{
		name: "get_layout_relation",
		description: "Get the Bounding Box of a child element of the specified ID node, positioned relative to the top-left corner of that node. This data can be used for organizing well-structured flow layouts.",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The ID of the element to get layout relation"
				},
				isRecursive: {
					type: "boolean",
					description: "Whether to recursively get layout relation of child elements (relative to the top-left corner of the specified ID node), pass true when only a few child elements are needed",
					default: !1
				}
			},
			required: ["id"]
		}
	},
	{
		name: "get_spacing",
		description: "Get the layout spacing of elements evenly arranged in the horizontal or vertical direction.",
		inputSchema: {
			type: "object",
			properties: {
				ids: {
					type: "array",
					description: "The IDs of the elements to get equal spacing, organized in arrangement order",
					items: { type: "string" }
				},
				direction: {
					type: "string",
					description: "The direction of equal spacing, horizontal or vertical"
				}
			},
			required: ["ids", "direction"]
		}
	}
], ah = (e) => {
	e.setRequestHandler(xu, async () => ({ tools: ih })), e.setRequestHandler(Tu, async (e) => {
		switch (e.params.name) {
			case "get_dom_hierarchy": return await Qm(e);
			case "get_spacing": return await $m(e);
			case "get_non_layout_styles": return await th(e);
			case "get_layout_relation": return await rh(e);
			default: throw Error("Unknown tool");
		}
	});
};
var oh = new pm({
	name: "@figsence/mcp-server",
	version: "0.1.0"
}, { capabilities: {
	resources: {},
	tools: {},
	prompts: {}
} }), sh = Ym();
sh.command("", "Run figsence mcp server").action(async () => {
	let e = new Dm();
	ah(oh.server), await oh.server.connect(e);
}), sh.help(), sh.parse();
