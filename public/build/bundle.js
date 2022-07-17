
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Header.svelte generated by Svelte v3.49.0 */

    const file$b = "src/components/Header.svelte";

    function create_fragment$b(ctx) {
    	let main;
    	let header;
    	let div3;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Filmes";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Inscrições";
    			attr_dev(div0, "class", "header-link svelte-1gt59t3");
    			add_location(div0, file$b, 10, 16, 177);
    			attr_dev(div1, "class", "header-link svelte-1gt59t3");
    			add_location(div1, file$b, 11, 16, 262);
    			attr_dev(div2, "id", "header-content");
    			attr_dev(div2, "class", "svelte-1gt59t3");
    			add_location(div2, file$b, 9, 12, 135);
    			attr_dev(div3, "id", "header-center");
    			add_location(div3, file$b, 8, 8, 98);
    			attr_dev(header, "id", "header");
    			attr_dev(header, "class", "svelte-1gt59t3");
    			add_location(header, file$b, 7, 3, 69);
    			add_location(main, file$b, 6, 0, 59);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { toggleScreen } = $$props;
    	const writable_props = ['toggleScreen'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => toggleScreen();
    	const click_handler_1 = () => toggleScreen();

    	$$self.$$set = $$props => {
    		if ('toggleScreen' in $$props) $$invalidate(0, toggleScreen = $$props.toggleScreen);
    	};

    	$$self.$capture_state = () => ({ toggleScreen });

    	$$self.$inject_state = $$props => {
    		if ('toggleScreen' in $$props) $$invalidate(0, toggleScreen = $$props.toggleScreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toggleScreen, click_handler, click_handler_1];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { toggleScreen: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggleScreen*/ ctx[0] === undefined && !('toggleScreen' in props)) {
    			console.warn("<Header> was created without expected prop 'toggleScreen'");
    		}
    	}

    	get toggleScreen() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleScreen(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let api = 'https://jsonplaceholder.typicode.com/todos/1';


    //create arrow function to return data from api
    const getData = () => {
        return fetch(api)
            .then(response => response.json())
            .then(data => {
                return data;
            })
    };

    /* src/components/Movie.svelte generated by Svelte v3.49.0 */

    const file$a = "src/components/Movie.svelte";

    function create_fragment$a(ctx) {
    	let main;
    	let div5;
    	let div4;
    	let div0;
    	let strong;
    	let t0_value = /*movie*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*movie*/ ctx[0].genre + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*movie*/ ctx[0].channel + "";
    	let t4;
    	let t5;
    	let div3;
    	let t6_value = /*movie*/ ctx[0].date + "";
    	let t6;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			t6 = text(t6_value);
    			add_location(strong, file$a, 8, 37, 159);
    			attr_dev(div0, "class", "movie-title svelte-16gb3ti");
    			add_location(div0, file$a, 8, 12, 134);
    			attr_dev(div1, "class", "movie-genre svelte-16gb3ti");
    			add_location(div1, file$a, 9, 12, 208);
    			attr_dev(div2, "class", "movie-channel svelte-16gb3ti");
    			add_location(div2, file$a, 10, 12, 265);
    			attr_dev(div3, "class", "movie-date svelte-16gb3ti");
    			add_location(div3, file$a, 11, 12, 326);
    			attr_dev(div4, "class", "movie-notification svelte-16gb3ti");
    			add_location(div4, file$a, 7, 8, 89);
    			attr_dev(div5, "class", "notification svelte-16gb3ti");
    			add_location(div5, file$a, 6, 4, 54);
    			add_location(main, file$a, 5, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, strong);
    			append_dev(strong, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, t4);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, t6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*movie*/ 1 && t0_value !== (t0_value = /*movie*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*movie*/ 1 && t2_value !== (t2_value = /*movie*/ ctx[0].genre + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*movie*/ 1 && t4_value !== (t4_value = /*movie*/ ctx[0].channel + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*movie*/ 1 && t6_value !== (t6_value = /*movie*/ ctx[0].date + "")) set_data_dev(t6, t6_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Movie', slots, []);
    	let { movie } = $$props;
    	const writable_props = ['movie'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Movie> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('movie' in $$props) $$invalidate(0, movie = $$props.movie);
    	};

    	$$self.$capture_state = () => ({ movie });

    	$$self.$inject_state = $$props => {
    		if ('movie' in $$props) $$invalidate(0, movie = $$props.movie);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [movie];
    }

    class Movie extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { movie: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Movie",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*movie*/ ctx[0] === undefined && !('movie' in props)) {
    			console.warn("<Movie> was created without expected prop 'movie'");
    		}
    	}

    	get movie() {
    		throw new Error("<Movie>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set movie(value) {
    		throw new Error("<Movie>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MoviesHeader.svelte generated by Svelte v3.49.0 */

    const file$9 = "src/components/MoviesHeader.svelte";

    function create_fragment$9(ctx) {
    	let main;
    	let div5;
    	let div4;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			div0.textContent = "Título";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Gênero";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Canal";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "Exibição";
    			attr_dev(div0, "class", "movie-title svelte-1373rkd");
    			add_location(div0, file$9, 8, 12, 121);
    			attr_dev(div1, "class", "movie-genre svelte-1373rkd");
    			add_location(div1, file$9, 9, 12, 171);
    			attr_dev(div2, "class", "movie-channel svelte-1373rkd");
    			add_location(div2, file$9, 10, 12, 221);
    			attr_dev(div3, "class", "movie-date svelte-1373rkd");
    			add_location(div3, file$9, 11, 12, 272);
    			attr_dev(div4, "class", "movies-header-description svelte-1373rkd");
    			add_location(div4, file$9, 7, 8, 69);
    			attr_dev(div5, "class", "movies-header svelte-1373rkd");
    			add_location(div5, file$9, 6, 4, 33);
    			add_location(main, file$9, 5, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MoviesHeader', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MoviesHeader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MoviesHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MoviesHeader",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/Movies.svelte generated by Svelte v3.49.0 */
    const file$8 = "src/components/Movies.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let moviesheader;
    	let t2;
    	let movie0;
    	let t3;
    	let movie1;
    	let t4;
    	let movie2;
    	let t5;
    	let movie3;
    	let t6;
    	let movie4;
    	let t7;
    	let movie5;
    	let current;
    	moviesheader = new MoviesHeader({ $$inline: true });

    	movie0 = new Movie({
    			props: { movie: /*movie*/ ctx[0] },
    			$$inline: true
    		});

    	movie1 = new Movie({
    			props: { movie: /*movie*/ ctx[0] },
    			$$inline: true
    		});

    	movie2 = new Movie({
    			props: { movie: /*movie*/ ctx[0] },
    			$$inline: true
    		});

    	movie3 = new Movie({
    			props: { movie: /*movie*/ ctx[0] },
    			$$inline: true
    		});

    	movie4 = new Movie({
    			props: { movie: /*movie*/ ctx[0] },
    			$$inline: true
    		});

    	movie5 = new Movie({
    			props: { movie: /*movie*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Lista de Filmes";
    			t1 = space();
    			create_component(moviesheader.$$.fragment);
    			t2 = space();
    			create_component(movie0.$$.fragment);
    			t3 = space();
    			create_component(movie1.$$.fragment);
    			t4 = space();
    			create_component(movie2.$$.fragment);
    			t5 = space();
    			create_component(movie3.$$.fragment);
    			t6 = space();
    			create_component(movie4.$$.fragment);
    			t7 = space();
    			create_component(movie5.$$.fragment);
    			attr_dev(h1, "class", "title");
    			add_location(h1, file$8, 15, 4, 275);
    			add_location(main, file$8, 14, 0, 264);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			mount_component(moviesheader, main, null);
    			append_dev(main, t2);
    			mount_component(movie0, main, null);
    			append_dev(main, t3);
    			mount_component(movie1, main, null);
    			append_dev(main, t4);
    			mount_component(movie2, main, null);
    			append_dev(main, t5);
    			mount_component(movie3, main, null);
    			append_dev(main, t6);
    			mount_component(movie4, main, null);
    			append_dev(main, t7);
    			mount_component(movie5, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(moviesheader.$$.fragment, local);
    			transition_in(movie0.$$.fragment, local);
    			transition_in(movie1.$$.fragment, local);
    			transition_in(movie2.$$.fragment, local);
    			transition_in(movie3.$$.fragment, local);
    			transition_in(movie4.$$.fragment, local);
    			transition_in(movie5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(moviesheader.$$.fragment, local);
    			transition_out(movie0.$$.fragment, local);
    			transition_out(movie1.$$.fragment, local);
    			transition_out(movie2.$$.fragment, local);
    			transition_out(movie3.$$.fragment, local);
    			transition_out(movie4.$$.fragment, local);
    			transition_out(movie5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(moviesheader);
    			destroy_component(movie0);
    			destroy_component(movie1);
    			destroy_component(movie2);
    			destroy_component(movie3);
    			destroy_component(movie4);
    			destroy_component(movie5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Movies', slots, []);

    	let movie = {
    		title: "The Shawshank Redemption",
    		genre: "Drama",
    		channel: "Netflix",
    		date: "14/10/1994"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Movies> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Movie, MoviesHeader, movie });

    	$$self.$inject_state = $$props => {
    		if ('movie' in $$props) $$invalidate(0, movie = $$props.movie);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [movie];
    }

    class Movies extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Movies",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/Subscription.svelte generated by Svelte v3.49.0 */

    const file$7 = "src/components/Subscription.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*genre*/ ctx[0]);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Excluir";
    			attr_dev(div0, "id", "subscription-genre");
    			add_location(div0, file$7, 10, 8, 119);
    			add_location(button, file$7, 13, 8, 194);
    			attr_dev(div1, "class", "subscription svelte-15x9k3m");
    			add_location(div1, file$7, 9, 4, 84);
    			add_location(main, file$7, 7, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*genre*/ 1) set_data_dev(t0, /*genre*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Subscription', slots, []);
    	let { genre } = $$props;
    	let { unsubscribe } = $$props;
    	const writable_props = ['genre', 'unsubscribe'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Subscription> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => unsubscribe(genre);

    	$$self.$$set = $$props => {
    		if ('genre' in $$props) $$invalidate(0, genre = $$props.genre);
    		if ('unsubscribe' in $$props) $$invalidate(1, unsubscribe = $$props.unsubscribe);
    	};

    	$$self.$capture_state = () => ({ genre, unsubscribe });

    	$$self.$inject_state = $$props => {
    		if ('genre' in $$props) $$invalidate(0, genre = $$props.genre);
    		if ('unsubscribe' in $$props) $$invalidate(1, unsubscribe = $$props.unsubscribe);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [genre, unsubscribe, click_handler];
    }

    class Subscription extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { genre: 0, unsubscribe: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subscription",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*genre*/ ctx[0] === undefined && !('genre' in props)) {
    			console.warn("<Subscription> was created without expected prop 'genre'");
    		}

    		if (/*unsubscribe*/ ctx[1] === undefined && !('unsubscribe' in props)) {
    			console.warn("<Subscription> was created without expected prop 'unsubscribe'");
    		}
    	}

    	get genre() {
    		throw new Error("<Subscription>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set genre(value) {
    		throw new Error("<Subscription>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unsubscribe() {
    		throw new Error("<Subscription>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unsubscribe(value) {
    		throw new Error("<Subscription>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Subscribe.svelte generated by Svelte v3.49.0 */

    const file$6 = "src/components/Subscribe.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let div;
    	let input;
    	let t0;
    	let button;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Inscrever-se";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Gênero");
    			add_location(input, file$6, 6, 8, 61);
    			add_location(button, file$6, 7, 8, 110);
    			attr_dev(div, "id", "subscribe");
    			attr_dev(div, "class", "svelte-1tn5ke9");
    			add_location(div, file$6, 5, 4, 32);
    			add_location(main, file$6, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Subscribe', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Subscribe> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Subscribe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subscribe",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/Notification.svelte generated by Svelte v3.49.0 */

    const file$5 = "src/components/Notification.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let div6;
    	let div4;
    	let div0;
    	let strong;
    	let t0_value = /*movie*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*movie*/ ctx[1].genre + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*movie*/ ctx[1].channel + "";
    	let t4;
    	let t5;
    	let div3;
    	let t6_value = /*movie*/ ctx[1].date + "";
    	let t6;
    	let t7;
    	let div5;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div6 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div5 = element("div");
    			button = element("button");
    			button.textContent = "Remover";
    			add_location(strong, file$5, 10, 37, 195);
    			attr_dev(div0, "class", "movie-title svelte-16gb3ti");
    			add_location(div0, file$5, 10, 12, 170);
    			attr_dev(div1, "class", "movie-genre svelte-16gb3ti");
    			add_location(div1, file$5, 11, 12, 244);
    			attr_dev(div2, "class", "movie-channel svelte-16gb3ti");
    			add_location(div2, file$5, 12, 12, 301);
    			attr_dev(div3, "class", "movie-date svelte-16gb3ti");
    			add_location(div3, file$5, 13, 12, 362);
    			attr_dev(div4, "class", "movie-notification svelte-16gb3ti");
    			add_location(div4, file$5, 9, 8, 125);
    			add_location(button, file$5, 16, 12, 473);
    			attr_dev(div5, "class", "notification-close");
    			add_location(div5, file$5, 15, 8, 428);
    			attr_dev(div6, "class", "notification svelte-16gb3ti");
    			add_location(div6, file$5, 8, 4, 90);
    			add_location(main, file$5, 7, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div6);
    			append_dev(div6, div4);
    			append_dev(div4, div0);
    			append_dev(div0, strong);
    			append_dev(strong, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, t4);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, t6);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*movie*/ 2 && t0_value !== (t0_value = /*movie*/ ctx[1].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*movie*/ 2 && t2_value !== (t2_value = /*movie*/ ctx[1].genre + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*movie*/ 2 && t4_value !== (t4_value = /*movie*/ ctx[1].channel + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*movie*/ 2 && t6_value !== (t6_value = /*movie*/ ctx[1].date + "")) set_data_dev(t6, t6_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Notification', slots, []);
    	let { removeNotification } = $$props;
    	let { movie } = $$props;
    	const writable_props = ['removeNotification', 'movie'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Notification> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => removeNotification();

    	$$self.$$set = $$props => {
    		if ('removeNotification' in $$props) $$invalidate(0, removeNotification = $$props.removeNotification);
    		if ('movie' in $$props) $$invalidate(1, movie = $$props.movie);
    	};

    	$$self.$capture_state = () => ({ removeNotification, movie });

    	$$self.$inject_state = $$props => {
    		if ('removeNotification' in $$props) $$invalidate(0, removeNotification = $$props.removeNotification);
    		if ('movie' in $$props) $$invalidate(1, movie = $$props.movie);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [removeNotification, movie, click_handler];
    }

    class Notification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { removeNotification: 0, movie: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notification",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*removeNotification*/ ctx[0] === undefined && !('removeNotification' in props)) {
    			console.warn("<Notification> was created without expected prop 'removeNotification'");
    		}

    		if (/*movie*/ ctx[1] === undefined && !('movie' in props)) {
    			console.warn("<Notification> was created without expected prop 'movie'");
    		}
    	}

    	get removeNotification() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set removeNotification(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get movie() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set movie(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MoviesNotificationHeader.svelte generated by Svelte v3.49.0 */

    const file$4 = "src/components/MoviesNotificationHeader.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let div6;
    	let div5;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			div0.textContent = "Título";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Gênero";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Canal";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "Exibição";
    			t7 = space();
    			div4 = element("div");
    			attr_dev(div0, "class", "movie-title svelte-1yoftm");
    			add_location(div0, file$4, 8, 12, 121);
    			attr_dev(div1, "class", "movie-genre svelte-1yoftm");
    			add_location(div1, file$4, 9, 12, 171);
    			attr_dev(div2, "class", "movie-channel svelte-1yoftm");
    			add_location(div2, file$4, 10, 12, 221);
    			attr_dev(div3, "class", "movie-date svelte-1yoftm");
    			add_location(div3, file$4, 11, 12, 272);
    			attr_dev(div4, "class", "spacing svelte-1yoftm");
    			add_location(div4, file$4, 12, 12, 323);
    			attr_dev(div5, "class", "movies-header-description svelte-1yoftm");
    			add_location(div5, file$4, 7, 8, 69);
    			attr_dev(div6, "class", "movies-header svelte-1yoftm");
    			add_location(div6, file$4, 6, 4, 33);
    			add_location(main, file$4, 5, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div5, t1);
    			append_dev(div5, div1);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MoviesNotificationHeader', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MoviesNotificationHeader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MoviesNotificationHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MoviesNotificationHeader",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Subscriptions.svelte generated by Svelte v3.49.0 */
    const file$3 = "src/components/Subscriptions.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div2;
    	let div0;
    	let h20;
    	let t3;
    	let subscribe_1;
    	let t4;
    	let h21;
    	let t6;
    	let subscription0;
    	let t7;
    	let subscription1;
    	let t8;
    	let subscription2;
    	let t9;
    	let div1;
    	let h22;
    	let t11;
    	let moviesheader;
    	let t12;
    	let notification0;
    	let t13;
    	let notification1;
    	let t14;
    	let notification2;
    	let current;
    	subscribe_1 = new Subscribe({ $$inline: true });
    	subscription0 = new Subscription({ props: { genre: "Ação" }, $$inline: true });

    	subscription1 = new Subscription({
    			props: { genre: "Aventura" },
    			$$inline: true
    		});

    	subscription2 = new Subscription({
    			props: { genre: "Comédia" },
    			$$inline: true
    		});

    	moviesheader = new MoviesNotificationHeader({ $$inline: true });

    	notification0 = new Notification({
    			props: { movie: /*movie*/ ctx[0] },
    			$$inline: true
    		});

    	notification1 = new Notification({
    			props: { movie: /*movie*/ ctx[0] },
    			$$inline: true
    		});

    	notification2 = new Notification({
    			props: { movie: /*movie*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Inscrições";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Adicionar Inscrição";
    			t3 = space();
    			create_component(subscribe_1.$$.fragment);
    			t4 = space();
    			h21 = element("h2");
    			h21.textContent = "Subscrições";
    			t6 = space();
    			create_component(subscription0.$$.fragment);
    			t7 = space();
    			create_component(subscription1.$$.fragment);
    			t8 = space();
    			create_component(subscription2.$$.fragment);
    			t9 = space();
    			div1 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Notificações";
    			t11 = space();
    			create_component(moviesheader.$$.fragment);
    			t12 = space();
    			create_component(notification0.$$.fragment);
    			t13 = space();
    			create_component(notification1.$$.fragment);
    			t14 = space();
    			create_component(notification2.$$.fragment);
    			attr_dev(h1, "class", "title");
    			add_location(h1, file$3, 16, 4, 402);
    			add_location(h20, file$3, 19, 12, 518);
    			add_location(h21, file$3, 21, 12, 585);
    			attr_dev(div0, "id", "left-side");
    			attr_dev(div0, "class", "side svelte-debqk4");
    			add_location(div0, file$3, 18, 8, 472);
    			add_location(h22, file$3, 28, 12, 810);
    			attr_dev(div1, "id", "right-side");
    			attr_dev(div1, "class", "side svelte-debqk4");
    			add_location(div1, file$3, 27, 8, 763);
    			attr_dev(div2, "id", "sides-holder");
    			attr_dev(div2, "class", "svelte-debqk4");
    			add_location(div2, file$3, 17, 4, 440);
    			add_location(main, file$3, 15, 0, 391);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t3);
    			mount_component(subscribe_1, div0, null);
    			append_dev(div0, t4);
    			append_dev(div0, h21);
    			append_dev(div0, t6);
    			mount_component(subscription0, div0, null);
    			append_dev(div0, t7);
    			mount_component(subscription1, div0, null);
    			append_dev(div0, t8);
    			mount_component(subscription2, div0, null);
    			append_dev(div2, t9);
    			append_dev(div2, div1);
    			append_dev(div1, h22);
    			append_dev(div1, t11);
    			mount_component(moviesheader, div1, null);
    			append_dev(div1, t12);
    			mount_component(notification0, div1, null);
    			append_dev(div1, t13);
    			mount_component(notification1, div1, null);
    			append_dev(div1, t14);
    			mount_component(notification2, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subscribe_1.$$.fragment, local);
    			transition_in(subscription0.$$.fragment, local);
    			transition_in(subscription1.$$.fragment, local);
    			transition_in(subscription2.$$.fragment, local);
    			transition_in(moviesheader.$$.fragment, local);
    			transition_in(notification0.$$.fragment, local);
    			transition_in(notification1.$$.fragment, local);
    			transition_in(notification2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subscribe_1.$$.fragment, local);
    			transition_out(subscription0.$$.fragment, local);
    			transition_out(subscription1.$$.fragment, local);
    			transition_out(subscription2.$$.fragment, local);
    			transition_out(moviesheader.$$.fragment, local);
    			transition_out(notification0.$$.fragment, local);
    			transition_out(notification1.$$.fragment, local);
    			transition_out(notification2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(subscribe_1);
    			destroy_component(subscription0);
    			destroy_component(subscription1);
    			destroy_component(subscription2);
    			destroy_component(moviesheader);
    			destroy_component(notification0);
    			destroy_component(notification1);
    			destroy_component(notification2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Subscriptions', slots, []);

    	let movie = {
    		title: "The Shawshank Redemption",
    		genre: "Drama",
    		channel: "Netflix",
    		date: "14/10/1994"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Subscriptions> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Subscription,
    		Subscribe,
    		Notification,
    		MoviesHeader: MoviesNotificationHeader,
    		movie
    	});

    	$$self.$inject_state = $$props => {
    		if ('movie' in $$props) $$invalidate(0, movie = $$props.movie);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [movie];
    }

    class Subscriptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subscriptions",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Main.svelte generated by Svelte v3.49.0 */
    const file$2 = "src/components/Main.svelte";

    // (20:8) {#if screen === "movies"}
    function create_if_block_1(ctx) {
    	let movies;
    	let current;
    	movies = new Movies({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(movies.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(movies, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(movies.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(movies.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(movies, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:8) {#if screen === \\\"movies\\\"}",
    		ctx
    	});

    	return block;
    }

    // (23:8) {#if screen === "subscriptions"}
    function create_if_block(ctx) {
    	let subscriptions;
    	let current;
    	subscriptions = new Subscriptions({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(subscriptions.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(subscriptions, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subscriptions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subscriptions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(subscriptions, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(23:8) {#if screen === \\\"subscriptions\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div;
    	let t;
    	let current;
    	let if_block0 = /*screen*/ ctx[0] === "movies" && create_if_block_1(ctx);
    	let if_block1 = /*screen*/ ctx[0] === "subscriptions" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-scxz3i");
    			add_location(div, file$2, 18, 4, 357);
    			add_location(main, file$2, 17, 0, 346);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*screen*/ ctx[0] === "movies") {
    				if (if_block0) {
    					if (dirty & /*screen*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*screen*/ ctx[0] === "subscriptions") {
    				if (if_block1) {
    					if (dirty & /*screen*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let from = "main component";
    	let { screen } = $$props;

    	onMount(async () => {
    		await getData();
    	});

    	const writable_props = ['screen'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('screen' in $$props) $$invalidate(0, screen = $$props.screen);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getData,
    		Movies,
    		Subscriptions,
    		from,
    		screen
    	});

    	$$self.$inject_state = $$props => {
    		if ('from' in $$props) from = $$props.from;
    		if ('screen' in $$props) $$invalidate(0, screen = $$props.screen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [screen];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { screen: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*screen*/ ctx[0] === undefined && !('screen' in props)) {
    			console.warn("<Main> was created without expected prop 'screen'");
    		}
    	}

    	get screen() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set screen(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Home.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/Home.svelte";

    function create_fragment$1(ctx) {
    	let main1;
    	let header;
    	let t;
    	let main0;
    	let current;

    	header = new Header({
    			props: { toggleScreen: /*toggleScreen*/ ctx[1] },
    			$$inline: true
    		});

    	main0 = new Main({
    			props: { screen: /*openedScreen*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main1 = element("main");
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(main0.$$.fragment);
    			add_location(main1, file$1, 26, 0, 542);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main1, anchor);
    			mount_component(header, main1, null);
    			append_dev(main1, t);
    			mount_component(main0, main1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const main0_changes = {};
    			if (dirty & /*openedScreen*/ 1) main0_changes.screen = /*openedScreen*/ ctx[0];
    			main0.$set(main0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main0.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main0.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main1);
    			destroy_component(header);
    			destroy_component(main0);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let openedScreen = "subscriptions";

    	const openMovieScreen = () => {
    		$$invalidate(0, openedScreen = "movies");
    	};

    	const openSubscriptionScreen = () => {
    		$$invalidate(0, openedScreen = "subscriptions");
    	};

    	const toggleScreen = () => {
    		console.log("screen being toggled");

    		if (openedScreen === "movies") {
    			openSubscriptionScreen();
    		} else {
    			openMovieScreen();
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Main,
    		openedScreen,
    		openMovieScreen,
    		openSubscriptionScreen,
    		toggleScreen
    	});

    	$$self.$inject_state = $$props => {
    		if ('openedScreen' in $$props) $$invalidate(0, openedScreen = $$props.openedScreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [openedScreen, toggleScreen];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(home.$$.fragment);
    			add_location(main, file, 5, 0, 67);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(home, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(home);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Home });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
