const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/CornerstoneViewer-mfokm9So.js","assets/CornerstoneViewer-D2H0-jPP.css"])))=>i.map(i=>d[i]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
* @vue/shared v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Bu(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const wt={},lr=[],ii=()=>{},tp=()=>!1,Jo=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),Qo=n=>n.startsWith("onUpdate:"),Jt=Object.assign,zu=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},Bg=Object.prototype.hasOwnProperty,gt=(n,e)=>Bg.call(n,e),We=Array.isArray,Gi=n=>Sa(n)==="[object Map]",ws=n=>Sa(n)==="[object Set]",Bd=n=>Sa(n)==="[object Date]",Ye=n=>typeof n=="function",Ct=n=>typeof n=="string",Tn=n=>typeof n=="symbol",xt=n=>n!==null&&typeof n=="object",np=n=>(xt(n)||Ye(n))&&Ye(n.then)&&Ye(n.catch),ip=Object.prototype.toString,Sa=n=>ip.call(n),zg=n=>Sa(n).slice(8,-1),sp=n=>Sa(n)==="[object Object]",el=n=>Ct(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,Zr=Bu(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),tl=n=>{const e=Object.create(null);return(t=>e[t]||(e[t]=n(t)))},Vg=/-\w/g,hn=tl(n=>n.replace(Vg,e=>e.slice(1).toUpperCase())),Hg=/\B([A-Z])/g,ts=tl(n=>n.replace(Hg,"-$1").toLowerCase()),nl=tl(n=>n.charAt(0).toUpperCase()+n.slice(1)),wl=tl(n=>n?`on${nl(n)}`:""),ti=(n,e)=>!Object.is(n,e),Mo=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},rp=(n,e,t,i=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:i,value:t})},il=n=>{const e=parseFloat(n);return isNaN(e)?n:e};let zd;const sl=()=>zd||(zd=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Pi(n){if(We(n)){const e={};for(let t=0;t<n.length;t++){const i=n[t],s=Ct(i)?Xg(i):Pi(i);if(s)for(const r in s)e[r]=s[r]}return e}else if(Ct(n)||xt(n))return n}const $g=/;(?![^(]*\))/g,Gg=/:([^]+)/,Wg=/\/\*[^]*?\*\//g;function Xg(n){const e={};return n.replace(Wg,"").split($g).forEach(t=>{if(t){const i=t.split(Gg);i.length>1&&(e[i[0].trim()]=i[1].trim())}}),e}function Yt(n){let e="";if(Ct(n))e=n;else if(We(n))for(let t=0;t<n.length;t++){const i=Yt(n[t]);i&&(e+=i+" ")}else if(xt(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const qg="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Yg=Bu(qg);function ap(n){return!!n||n===""}function jg(n,e){if(n.length!==e.length)return!1;let t=!0;for(let i=0;t&&i<n.length;i++)t=Ki(n[i],e[i]);return t}function Vd(n,e){if(n.size!==e.size)return!1;const t=Array.from(e),i=new Uint8Array(t.length);for(const s of n){let r=-1;for(let a=0;a<t.length;a++)if(!i[a]&&Ki(s,t[a])){r=a;break}if(r<0)return!1;i[r]=1}return!0}function Ki(n,e){if(n===e)return!0;let t=Bd(n),i=Bd(e);if(t||i)return t&&i?n.getTime()===e.getTime():!1;if(t=Tn(n),i=Tn(e),t||i)return n===e;if(t=We(n),i=We(e),t||i)return t&&i?jg(n,e):!1;if(t=xt(n),i=xt(e),t||i){if(!t||!i)return!1;if(t=Gi(n),i=Gi(e),t||i||(t=ws(n),i=ws(e),t||i))return t&&i?Vd(n,e):!1;const s=Object.keys(n).length,r=Object.keys(e).length;if(s!==r)return!1;for(const a in n){const o=n.hasOwnProperty(a),l=e.hasOwnProperty(a);if(o&&!l||!o&&l||!Ki(n[a],e[a]))return!1}}return String(n)===String(e)}function Kg(n,e){return n.findIndex(t=>Ki(t,e))}const op=n=>!!(n&&n.__v_isRef===!0),D=n=>Ct(n)?n:n==null?"":We(n)||xt(n)&&(n.toString===ip||!Ye(n.toString))?op(n)?D(n.value):JSON.stringify(n,lp,2):String(n),lp=(n,e)=>op(e)?lp(n,e.value):Gi(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[i,s],r)=>(t[Al(i,r)+" =>"]=s,t),{})}:ws(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>Al(t))}:Tn(e)?Al(e):xt(e)&&!We(e)&&!sp(e)?String(e):e,Al=(n,e="")=>{var t;return Tn(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Ht;class cp{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this._warnOnRun=!0,this.__v_skip=!0,!e&&Ht&&(Ht.active?(this.parent=Ht,this.index=(Ht.scopes||(Ht.scopes=[])).push(this)-1):(this._active=!1,this._warnOnRun=!1))}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes){const i=this.scopes.slice();for(e=0,t=i.length;e<t;e++)i[e].pause()}for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes){const s=this.scopes.slice();for(e=0,t=s.length;e<t;e++)s[e].resume()}const i=this.effects.slice();for(e=0,t=i.length;e<t;e++)i[e].resume()}}run(e){if(this._active){const t=Ht;try{return Ht=this,e()}finally{Ht=t}}}on(){++this._on===1&&(this.prevScope=Ht,Ht=this)}off(){if(this._on>0&&--this._on===0){if(Ht===this)Ht=this.prevScope;else{let e=Ht;for(;e;){if(e.prevScope===this){e.prevScope=this.prevScope;break}e=e.prevScope}}this.prevScope=void 0}}stop(e){if(this._active){this._active=!1;let t,i;for(t=0,i=this.effects.length;t<i;t++)this.effects[t].stop();for(this.effects.length=0,t=0,i=this.cleanups.length;t<i;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){const s=this.scopes.slice();for(t=0,i=s.length;t<i;t++)s[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function up(n){return new cp(n)}function dp(){return Ht}function Zg(n,e=!1){Ht&&Ht.cleanups.push(n)}let At;const Tl=new WeakSet;class hp{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Ht&&(Ht.active?Ht.effects.push(this):this.flags&=-2)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Tl.has(this)&&(Tl.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||pp(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Hd(this),mp(this);const e=At,t=Gn;At=this,Gn=!0;try{return this.fn()}finally{gp(this),At=e,Gn=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)$u(e);this.deps=this.depsTail=void 0,Hd(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Tl.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Ic(this)&&this.run()}get dirty(){return Ic(this)}}let fp=0,Jr,Qr;function pp(n,e=!1){if(n.flags|=8,e){n.next=Qr,Qr=n;return}n.next=Jr,Jr=n}function Vu(){fp++}function Hu(){if(--fp>0)return;if(Qr){let e=Qr;for(Qr=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;Jr;){let e=Jr;for(Jr=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(i){n||(n=i)}e=t}}if(n)throw n}function mp(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function gp(n){let e,t=n.depsTail,i=t;for(;i;){const s=i.prevDep;i.version===-1?(i===t&&(t=s),$u(i),Jg(i)):e=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=s}n.deps=e,n.depsTail=t}function Ic(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(vp(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function vp(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===ua)||(n.globalVersion=ua,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!Ic(n))))return;n.flags|=2;const e=n.dep,t=At,i=Gn;At=n,Gn=!0;try{mp(n);const s=n.fn(n._value);(e.version===0||ti(s,n._value))&&(n.flags|=128,n._value=s,e.version++)}catch(s){throw e.version++,s}finally{At=t,Gn=i,gp(n),n.flags&=-3}}function $u(n,e=!1){const{dep:t,prevSub:i,nextSub:s}=n;if(i&&(i.nextSub=s,n.prevSub=void 0),s&&(s.prevSub=i,n.nextSub=void 0),t.subs===n&&(t.subs=i,!i&&t.computed)){t.computed.flags&=-5;for(let r=t.computed.deps;r;r=r.nextDep)$u(r,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function Jg(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let Gn=!0;const _p=[];function Ai(){_p.push(Gn),Gn=!1}function Ti(){const n=_p.pop();Gn=n===void 0?!0:n}function Hd(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=At;At=void 0;try{e()}finally{At=t}}}let ua=0;class Qg{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Gu{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!At||!Gn||At===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==At)t=this.activeLink=new Qg(At,this),At.deps?(t.prevDep=At.depsTail,At.depsTail.nextDep=t,At.depsTail=t):At.deps=At.depsTail=t,yp(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const i=t.nextDep;i.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=i),t.prevDep=At.depsTail,t.nextDep=void 0,At.depsTail.nextDep=t,At.depsTail=t,At.deps===t&&(At.deps=i)}return t}trigger(e){this.version++,ua++,this.notify(e)}notify(e){Vu();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{Hu()}}}function yp(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let i=e.deps;i;i=i.nextDep)yp(i)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const Lo=new WeakMap,Ss=Symbol(""),Dc=Symbol(""),da=Symbol("");function nn(n,e,t){if(Gn&&At){let i=Lo.get(n);i||Lo.set(n,i=new Map);let s=i.get(t);s||(i.set(t,s=new Gu),s.map=i,s.key=t),s.track()}}function yi(n,e,t,i,s,r){const a=Lo.get(n);if(!a){ua++;return}const o=l=>{l&&l.trigger()};if(Vu(),e==="clear")a.forEach(o);else{const l=We(n),c=l&&el(t);if(l&&t==="length"){const u=Number(i);a.forEach((d,h)=>{(h==="length"||h===da||!Tn(h)&&h>=u)&&o(d)})}else switch((t!==void 0||a.has(void 0))&&o(a.get(t)),c&&o(a.get(da)),e){case"add":l?c&&o(a.get("length")):(o(a.get(Ss)),Gi(n)&&o(a.get(Dc)));break;case"delete":l||(o(a.get(Ss)),Gi(n)&&o(a.get(Dc)));break;case"set":Gi(n)&&o(a.get(Ss));break}}Hu()}function ev(n,e){const t=Lo.get(n);return t&&t.get(e)}function Ns(n){const e=dt(n);return e===n?e:(nn(e,"iterate",da),An(n)?e:e.map(qn))}function rl(n){return nn(n=dt(n),"iterate",da),n}function Jn(n,e){return Ri(n)?gr(Mi(n)?qn(e):e):qn(e)}const tv={__proto__:null,[Symbol.iterator](){return Rl(this,Symbol.iterator,n=>Jn(this,n))},concat(...n){return Ns(this).concat(...n.map(e=>We(e)?Ns(e):e))},entries(){return Rl(this,"entries",n=>(n[1]=Jn(this,n[1]),n))},every(n,e){return ci(this,"every",n,e,void 0,arguments)},filter(n,e){return ci(this,"filter",n,e,t=>t.map(i=>Jn(this,i)),arguments)},find(n,e){return ci(this,"find",n,e,t=>Jn(this,t),arguments)},findIndex(n,e){return ci(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return ci(this,"findLast",n,e,t=>Jn(this,t),arguments)},findLastIndex(n,e){return ci(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return ci(this,"forEach",n,e,void 0,arguments)},includes(...n){return Cl(this,"includes",n)},indexOf(...n){return Cl(this,"indexOf",n)},join(n){return Ns(this).join(n)},lastIndexOf(...n){return Cl(this,"lastIndexOf",n)},map(n,e){return ci(this,"map",n,e,void 0,arguments)},pop(){return Or(this,"pop")},push(...n){return Or(this,"push",n)},reduce(n,...e){return $d(this,"reduce",n,e)},reduceRight(n,...e){return $d(this,"reduceRight",n,e)},shift(){return Or(this,"shift")},some(n,e){return ci(this,"some",n,e,void 0,arguments)},splice(...n){return Or(this,"splice",n)},toReversed(){return Ns(this).toReversed()},toSorted(n){return Ns(this).toSorted(n)},toSpliced(...n){return Ns(this).toSpliced(...n)},unshift(...n){return Or(this,"unshift",n)},values(){return Rl(this,"values",n=>Jn(this,n))}};function Rl(n,e,t){const i=rl(n),s=i[e]();return i!==n&&!An(n)&&(s._next=s.next,s.next=()=>{const r=s._next();return r.done||(r.value=t(r.value)),r}),s}const nv=Array.prototype;function ci(n,e,t,i,s,r){const a=rl(n),o=a!==n&&!An(n),l=a[e];if(l!==nv[e]){const d=l.apply(n,r);return o?qn(d):d}let c=t;a!==n&&(o?c=function(d,h){return t.call(this,Jn(n,d),h,n)}:t.length>2&&(c=function(d,h){return t.call(this,d,h,n)}));const u=l.call(a,c,i);return o&&s?s(u):u}function $d(n,e,t,i){const s=rl(n),r=s!==n&&!An(n);let a=t,o=!1;s!==n&&(r?(o=i.length===0,a=function(c,u,d){return o&&(o=!1,c=Jn(n,c)),t.call(this,c,Jn(n,u),d,n)}):t.length>3&&(a=function(c,u,d){return t.call(this,c,u,d,n)}));const l=s[e](a,...i);return o?Jn(n,l):l}function Cl(n,e,t){const i=dt(n);nn(i,"iterate",da);const s=i[e](...t);return(s===-1||s===!1)&&al(t[0])?(t[0]=dt(t[0]),i[e](...t)):s}function Or(n,e,t=[]){Ai(),Vu();const i=dt(n)[e].apply(n,t);return Hu(),Ti(),i}const iv=Bu("__proto__,__v_isRef,__isVue"),bp=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(Tn));function sv(n){Tn(n)||(n=String(n));const e=dt(this);return nn(e,"has",n),e.hasOwnProperty(n)}class xp{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,i){if(t==="__v_skip")return e.__v_skip;const s=this._isReadonly,r=this._isShallow;if(t==="__v_isReactive")return!s;if(t==="__v_isReadonly")return s;if(t==="__v_isShallow")return r;if(t==="__v_raw")return i===(s?r?pv:wp:r?Ep:Mp).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(i)?e:void 0;const a=We(e);if(!s){let l;if(a&&(l=tv[t]))return l;if(t==="hasOwnProperty")return sv}const o=Reflect.get(e,t,Ut(e)?e:i);if((Tn(t)?bp.has(t):iv(t))||(s||nn(e,"get",t),r))return o;if(Ut(o)){const l=a&&el(t)?o:o.value;return s&&xt(l)?Uc(l):l}return xt(o)?s?Uc(o):si(o):o}}class Sp extends xp{constructor(e=!1){super(!1,e)}set(e,t,i,s){let r=e[t];const a=We(e)&&el(t);if(!this._isShallow){const c=Ri(r);if(!An(i)&&!Ri(i)&&(r=dt(r),i=dt(i)),!a&&Ut(r)&&!Ut(i))return c||(r.value=i),!0}const o=a?Number(t)<e.length:gt(e,t),l=Reflect.set(e,t,i,Ut(e)?e:s);return e===dt(s)&&l&&(o?ti(i,r)&&yi(e,"set",t,i):yi(e,"add",t,i)),l}deleteProperty(e,t){const i=gt(e,t);e[t];const s=Reflect.deleteProperty(e,t);return s&&i&&yi(e,"delete",t,void 0),s}has(e,t){const i=Reflect.has(e,t);return(!Tn(t)||!bp.has(t))&&nn(e,"has",t),i}ownKeys(e){return nn(e,"iterate",We(e)?"length":Ss),Reflect.ownKeys(e)}}class rv extends xp{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const av=new Sp,ov=new rv,lv=new Sp(!0);const Lc=n=>n,Ua=n=>Reflect.getPrototypeOf(n);function cv(n,e,t){return function(...i){const s=this.__v_raw,r=dt(s),a=Gi(r),o=n==="entries"||n===Symbol.iterator&&a,l=n==="keys"&&a,c=s[n](...i),u=t?Lc:e?gr:qn;return!e&&nn(r,"iterate",l?Dc:Ss),Jt(Object.create(c),{next(){const{value:d,done:h}=c.next();return h?{value:d,done:h}:{value:o?[u(d[0]),u(d[1])]:u(d),done:h}}})}}function Na(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function uv(n,e){const t={get(s){const r=this.__v_raw,a=dt(r),o=dt(s);n||(ti(s,o)&&nn(a,"get",s),nn(a,"get",o));const{has:l}=Ua(a),c=e?Lc:n?gr:qn;if(l.call(a,s))return c(r.get(s));if(l.call(a,o))return c(r.get(o));r!==a&&r.get(s)},get size(){const s=this.__v_raw;return!n&&nn(dt(s),"iterate",Ss),s.size},has(s){const r=this.__v_raw,a=dt(r),o=dt(s);return n||(ti(s,o)&&nn(a,"has",s),nn(a,"has",o)),s===o?r.has(s):r.has(s)||r.has(o)},forEach(s,r){const a=this,o=a.__v_raw,l=dt(o),c=e?Lc:n?gr:qn;return!n&&nn(l,"iterate",Ss),o.forEach((u,d)=>s.call(r,c(u),c(d),a))}};return Jt(t,n?{add:Na("add"),set:Na("set"),delete:Na("delete"),clear:Na("clear")}:{add(s){const r=dt(this),a=Ua(r),o=dt(s),l=!e&&!An(s)&&!Ri(s)?o:s;return a.has.call(r,l)||ti(s,l)&&a.has.call(r,s)||ti(o,l)&&a.has.call(r,o)||(r.add(l),yi(r,"add",l,l)),this},set(s,r){!e&&!An(r)&&!Ri(r)&&(r=dt(r));const a=dt(this),{has:o,get:l}=Ua(a);let c=o.call(a,s);c||(s=dt(s),c=o.call(a,s));const u=l.call(a,s);return a.set(s,r),c?ti(r,u)&&yi(a,"set",s,r):yi(a,"add",s,r),this},delete(s){const r=dt(this),{has:a,get:o}=Ua(r);let l=a.call(r,s);l||(s=dt(s),l=a.call(r,s)),o&&o.call(r,s);const c=r.delete(s);return l&&yi(r,"delete",s,void 0),c},clear(){const s=dt(this),r=s.size!==0,a=s.clear();return r&&yi(s,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(s=>{t[s]=cv(s,n,e)}),t}function Wu(n,e){const t=uv(n,e);return(i,s,r)=>s==="__v_isReactive"?!n:s==="__v_isReadonly"?n:s==="__v_raw"?i:Reflect.get(gt(t,s)&&s in i?t:i,s,r)}const dv={get:Wu(!1,!1)},hv={get:Wu(!1,!0)},fv={get:Wu(!0,!1)};const Mp=new WeakMap,Ep=new WeakMap,wp=new WeakMap,pv=new WeakMap;function mv(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function si(n){return Ri(n)?n:Xu(n,!1,av,dv,Mp)}function Ap(n){return Xu(n,!1,lv,hv,Ep)}function Uc(n){return Xu(n,!0,ov,fv,wp)}function Xu(n,e,t,i,s){if(!xt(n)||n.__v_raw&&!(e&&n.__v_isReactive)||n.__v_skip||!Object.isExtensible(n))return n;const r=s.get(n);if(r)return r;const a=mv(zg(n));if(a===0)return n;const o=new Proxy(n,a===2?i:t);return s.set(n,o),o}function Mi(n){return Ri(n)?Mi(n.__v_raw):!!(n&&n.__v_isReactive)}function Ri(n){return!!(n&&n.__v_isReadonly)}function An(n){return!!(n&&n.__v_isShallow)}function al(n){return n?!!n.__v_raw:!1}function dt(n){const e=n&&n.__v_raw;return e?dt(e):n}function qu(n){return!gt(n,"__v_skip")&&Object.isExtensible(n)&&rp(n,"__v_skip",!0),n}const qn=n=>xt(n)?si(n):n,gr=n=>xt(n)?Uc(n):n;function Ut(n){return n?n.__v_isRef===!0:!1}function ze(n){return Tp(n,!1)}function gv(n){return Tp(n,!0)}function Tp(n,e){return Ut(n)?n:new vv(n,e)}class vv{constructor(e,t){this.dep=new Gu,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:dt(e),this._value=t?e:qn(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,i=this.__v_isShallow||An(e)||Ri(e);e=i?e:dt(e),ti(e,t)&&(this._rawValue=e,this._value=i?e:qn(e),this.dep.trigger())}}function J(n){return Ut(n)?n.value:n}const _v={get:(n,e,t)=>e==="__v_raw"?n:J(Reflect.get(n,e,t)),set:(n,e,t,i)=>{const s=n[e];return Ut(s)&&!Ut(t)?(s.value=t,!0):Reflect.set(n,e,t,i)}};function Rp(n){return Mi(n)?n:new Proxy(n,_v)}function yv(n){const e=We(n)?new Array(n.length):{};for(const t in n)e[t]=xv(n,t);return e}class bv{constructor(e,t,i){this._object=e,this._defaultValue=i,this.__v_isRef=!0,this._value=void 0,this._key=Tn(t)?t:String(t),this._raw=dt(e);let s=!0,r=e;if(!We(e)||Tn(this._key)||!el(this._key))do s=!al(r)||An(r);while(s&&(r=r.__v_raw));this._shallow=s}get value(){let e=this._object[this._key];return this._shallow&&(e=J(e)),this._value=e===void 0?this._defaultValue:e}set value(e){if(this._shallow&&Ut(this._raw[this._key])){const t=this._object[this._key];if(Ut(t)){t.value=e;return}}this._object[this._key]=e}get dep(){return ev(this._raw,this._key)}}function xv(n,e,t){return new bv(n,e,t)}class Sv{constructor(e,t,i){this.fn=e,this.setter=t,this._value=void 0,this.dep=new Gu(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=ua-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&At!==this)return pp(this,!0),!0}get value(){const e=this.dep.track();return vp(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function Mv(n,e,t=!1){let i,s;return Ye(n)?i=n:(i=n.get,s=n.set),new Sv(i,s,t)}const Oa={},Uo=new WeakMap;let fs;function Ev(n,e=!1,t=fs){if(t){let i=Uo.get(t);i||Uo.set(t,i=[]),i.push(n)}}function wv(n,e,t=wt){const{immediate:i,deep:s,once:r,scheduler:a,augmentJob:o,call:l}=t,c=m=>s?m:An(m)||s===!1||s===0?bi(m,1):bi(m);let u,d,h,f,b=!1,x=!1;if(Ut(n)?(d=()=>n.value,b=An(n)):Mi(n)?(d=()=>c(n),b=!0):We(n)?(x=!0,b=n.some(m=>Mi(m)||An(m)),d=()=>n.map(m=>{if(Ut(m))return m.value;if(Mi(m))return c(m);if(Ye(m))return l?l(m,2):m()})):Ye(n)?e?d=l?()=>l(n,2):n:d=()=>{if(h){Ai();try{h()}finally{Ti()}}const m=fs;fs=u;try{return l?l(n,3,[f]):n(f)}finally{fs=m}}:d=ii,e&&s){const m=d,w=s===!0?1/0:s;d=()=>bi(m(),w)}const y=dp(),g=()=>{u.stop(),y&&y.active&&zu(y.effects,u)};if(r&&e){const m=e;e=(...w)=>{const T=m(...w);return g(),T}}let A=x?new Array(n.length).fill(Oa):Oa;const S=m=>{if(!(!(u.flags&1)||!u.dirty&&!m))if(e){const w=u.run();if(m||s||b||(x?w.some((T,R)=>ti(T,A[R])):ti(w,A))){h&&h();const T=fs;fs=u;try{const R=[w,A===Oa?void 0:x&&A[0]===Oa?[]:A,f];A=w,l?l(e,3,R):e(...R)}finally{fs=T}}}else u.run()};return o&&o(S),u=new hp(d),u.scheduler=a?()=>a(S,!1):S,f=m=>Ev(m,!1,u),h=u.onStop=()=>{const m=Uo.get(u);if(m){if(l)l(m,4);else for(const w of m)w();Uo.delete(u)}},e?i?S(!0):A=u.run():a?a(S.bind(null,!0),!0):u.run(),g.pause=u.pause.bind(u),g.resume=u.resume.bind(u),g.stop=g,g}function bi(n,e=1/0,t){if(e<=0||!xt(n)||n.__v_skip||(t=t||new Map,(t.get(n)||0)>=e))return n;if(t.set(n,e),e--,Ut(n))bi(n.value,e,t);else if(We(n))for(let i=0;i<n.length;i++)bi(n[i],e,t);else if(ws(n)||Gi(n))n.forEach(i=>{bi(i,e,t)});else if(sp(n)){for(const i in n)bi(n[i],e,t);for(const i of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,i)&&bi(n[i],e,t)}return n}/**
* @vue/runtime-core v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Ma(n,e,t,i){try{return i?n(...i):n()}catch(s){Ea(s,e,t)}}function Yn(n,e,t,i){if(Ye(n)){const s=Ma(n,e,t,i);return s&&np(s)&&s.catch(r=>{Ea(r,e,t)}),s}if(We(n)){const s=[];for(let r=0;r<n.length;r++)s.push(Yn(n[r],e,t,i));return s}}function Ea(n,e,t,i=!0){const s=e?e.vnode:null,{errorHandler:r,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||wt;if(e){let o=e.parent;const l=e.proxy,c=`https://vuejs.org/error-reference/#runtime-${t}`;for(;o;){const u=o.ec;if(u){for(let d=0;d<u.length;d++)if(u[d](n,l,c)===!1)return}o=o.parent}if(r){Ai(),Ma(r,null,10,[n,l,c]),Ti();return}}Av(n,t,s,i,a)}function Av(n,e,t,i=!0,s=!1){if(s)throw n;console.error(n)}const dn=[];let Zn=-1;const cr=[];let zi=null,tr=0;const Cp=Promise.resolve();let No=null;function ol(n){const e=No||Cp;return n?e.then(this?n.bind(this):n):e}function Tv(n){let e=Zn+1,t=dn.length;for(;e<t;){const i=e+t>>>1,s=dn[i],r=ha(s);r<n||r===n&&s.flags&2?e=i+1:t=i}return e}function Yu(n){if(!(n.flags&1)){const e=ha(n),t=dn[dn.length-1];!t||!(n.flags&2)&&e>=ha(t)?dn.push(n):dn.splice(Tv(e),0,n),n.flags|=1,Pp()}}function Pp(){No||(No=Cp.then(Dp))}function Rv(n){if(!We(n))zi&&n.id===-1?zi.splice(tr+1,0,n):n.flags&1||(cr.push(n),n.flags|=1);else for(let e=0;e<n.length;e++)cr.push(n[e]);Pp()}function Gd(n,e,t=Zn+1){for(;t<dn.length;t++){const i=dn[t];if(i&&i.flags&2){if(n&&i.id!==n.uid)continue;dn.splice(t,1),t--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function Ip(n){if(cr.length){const e=[...new Set(cr)].sort((t,i)=>ha(t)-ha(i));if(cr.length=0,zi){for(let t=0;t<e.length;t++)zi.push(e[t]);return}for(zi=e,tr=0;tr<zi.length;tr++){const t=zi[tr];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}zi=null,tr=0}}const ha=n=>n.id==null?n.flags&2?-1:1/0:n.id;function Dp(n){try{for(Zn=0;Zn<dn.length;Zn++){const e=dn[Zn];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),Ma(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;Zn<dn.length;Zn++){const e=dn[Zn];e&&(e.flags&=-2)}Zn=-1,dn.length=0,Ip(),No=null,(dn.length||cr.length)&&Dp()}}let Zt=null,Lp=null;function Oo(n){const e=Zt;return Zt=n,Lp=n&&n.type.__scopeId||null,e}function Zi(n,e=Zt,t){if(!e||n._n)return n;const i=(...s)=>{i._d&&Bo(-1);const r=Oo(e),a=Ei.length;let o;try{o=n(...s)}finally{for(let l=Ei.length;l>a;l--)ed();Oo(r),i._d&&Bo(1)}return o};return i._n=!0,i._c=!0,i._d=!0,i}function Nt(n,e){if(Zt===null)return n;const t=fl(Zt),i=n.dirs||(n.dirs=[]);for(let s=0;s<e.length;s++){let[r,a,o,l=wt]=e[s];r&&(Ye(r)&&(r={mounted:r,updated:r}),r.deep&&bi(a),i.push({dir:r,instance:t,value:a,oldValue:void 0,arg:o,modifiers:l}))}return n}function rs(n,e,t,i){const s=n.dirs,r=e&&e.dirs;for(let a=0;a<s.length;a++){const o=s[a];r&&(o.oldValue=r[a].value);let l=o.dir[i];l&&(Ai(),Yn(l,t,8,[n.el,o,n,e]),Ti())}}function Eo(n,e){if(Kt){let t=Kt.provides;const i=Kt.parent&&Kt.parent.provides;i===t&&(t=Kt.provides=Object.create(i)),t[n]=e}}function Un(n,e,t=!1){const i=cm();if(i||Ms){let s=Ms?Ms._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(s&&n in s)return s[n];if(arguments.length>1)return t&&Ye(e)?e.call(i&&i.proxy):e}}function Cv(){return!!(cm()||Ms)}const Pv=Symbol.for("v-scx"),Iv=()=>Un(Pv);function Bt(n,e,t){return Up(n,e,t)}function Up(n,e,t=wt){const{immediate:i,deep:s,flush:r,once:a}=t,o=Jt({},t),l=e&&i||!e&&r!=="post";let c;if(_r){if(r==="sync"){const f=Iv();c=f.__watcherHandles||(f.__watcherHandles=[])}else if(!l){const f=()=>{};return f.stop=ii,f.resume=ii,f.pause=ii,f}}const u=Kt;o.call=(f,b,x)=>Yn(f,u,b,x);let d=!1;r==="post"?o.scheduler=f=>{vn(f,u&&u.suspense)}:r!=="sync"&&(d=!0,o.scheduler=(f,b)=>{b?f():Yu(f)}),o.augmentJob=f=>{e&&(f.flags|=4),d&&(f.flags|=2,u&&(f.id=u.uid,f.i=u))};const h=wv(n,e,o);return _r&&(c?c.push(h):l&&h()),h}function Dv(n,e,t){const i=this.proxy,s=Ct(n)?n.includes(".")?Np(i,n):()=>i[n]:n.bind(i,i);let r;Ye(e)?r=e:(r=e.handler,t=e);const a=wa(this),o=Up(s,r.bind(i),t);return a(),o}function Np(n,e){const t=e.split(".");return()=>{let i=n;for(let s=0;s<t.length&&i;s++)i=i[t[s]];return i}}const Lv=Symbol("_vte"),ll=n=>n.__isTeleport,Pl=Symbol("_leaveCb");function Uv(n){let e=n[0];if(n.length>1){for(const t of n)if(t.type!==ri){e=t;break}}return e}function Op(n){if(!cl(n))return ll(n.type)&&n.children?Uv(n.children):n;if(n.component)return n.component.subTree;const{shapeFlag:e,children:t}=n;if(t){if(e&16)return t[0];if(e&32&&Ye(t.default))return t.default()}}function ju(n,e){if(n.shapeFlag&6&&n.component){n.transition=e;const t=n.component.subTree;ju(ll(t.type)&&Op(t)||t,e)}else n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function it(n,e){return Ye(n)?Jt({name:n.name},e,{setup:n}):n}function Ku(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}function Wd(n,e){let t;return!!((t=Object.getOwnPropertyDescriptor(n,e))&&!t.configurable)}const Fo=new WeakMap;function ea(n,e,t,i,s=!1){if(We(n)){n.forEach((x,y)=>ea(x,e&&(We(e)?e[y]:e),t,i,s));return}if(ur(i)&&!s){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&ea(n,e,t,i.component.subTree);return}const r=i.shapeFlag&4?fl(i.component):i.el,a=s?null:r,{i:o,r:l}=n,c=e&&e.r,u=o.refs===wt?o.refs={}:o.refs,d=o.setupState,h=dt(d),f=d===wt?tp:x=>Wd(u,x)?!1:gt(h,x),b=(x,y)=>!(y&&Wd(u,y));if(c!=null&&c!==l){if(Xd(e),Ct(c))u[c]=null,f(c)&&(d[c]=null);else if(Ut(c)){const x=e;b(c,x.k)&&(c.value=null),x.k&&(u[x.k]=null)}}if(Ye(l))Ma(l,o,12,[a,u]);else{const x=Ct(l),y=Ut(l);if(x||y){const g=()=>{if(n.f){const A=x?f(l)?d[l]:u[l]:b()||!n.k?l.value:u[n.k];if(s)We(A)&&zu(A,r);else if(We(A))A.includes(r)||A.push(r);else if(x)u[l]=[r],f(l)&&(d[l]=u[l]);else{const S=[r];b(l,n.k)&&(l.value=S),n.k&&(u[n.k]=S)}}else x?(u[l]=a,f(l)&&(d[l]=a)):y&&(b(l,n.k)&&(l.value=a),n.k&&(u[n.k]=a))};if(a){const A=()=>{g(),Fo.delete(n)};A.id=-1,Fo.set(n,A),vn(A,t)}else Xd(n),g()}}}function Xd(n){const e=Fo.get(n);e&&(e.flags|=8,Fo.delete(n))}const qd=n=>n.nodeType===8;sl().requestIdleCallback;sl().cancelIdleCallback;function Nv(n,e){if(qd(n)&&n.data==="["){let t=1,i=n.nextSibling;for(;i;){if(i.nodeType===1){if(e(i)===!1)break}else if(qd(i))if(i.data==="]"){if(--t===0)break}else i.data==="["&&t++;i=i.nextSibling}}else e(n)}const ur=n=>!!n.type.__asyncLoader;function Ov(n){Ye(n)&&(n={loader:n});const{loader:e,loadingComponent:t,errorComponent:i,delay:s=200,hydrate:r,timeout:a,suspensible:o=!0,onError:l}=n;let c=null,u,d=0;const h=()=>(d++,c=null,f()),f=()=>{let b;return c||(b=c=e().catch(x=>{if(x=x instanceof Error?x:new Error(String(x)),l)return new Promise((y,g)=>{l(x,()=>y(h()),()=>g(x),d+1)});throw x}).then(x=>b!==c&&c?c:(x&&(x.__esModule||x[Symbol.toStringTag]==="Module")&&(x=x.default),u=x,x)))};return it({name:"AsyncComponentWrapper",__asyncLoader:f,__asyncHydrate(b,x,y){const g=b.isConnected;let A=!1;(x.bu||(x.bu=[])).push(()=>A=!0);const S=()=>{A||!b.parentNode||g&&!b.isConnected||y()},m=r?()=>{const w=r(S,T=>Nv(b,T));w&&(x.bum||(x.bum=[])).push(w)}:S;u?m():f().then(()=>!x.isUnmounted&&m())},get __asyncResolved(){return u},setup(){const b=Kt;if(Ku(b),u)return()=>Fa(u,b);const x=w=>{c=null,Ea(w,b,13,!i)};if(o&&b.suspense||_r)return f().then(w=>()=>Fa(w,b)).catch(w=>(x(w),()=>i?ne(i,{error:w}):null));const y=ze(!1),g=ze(),A=ze(!!s);let S,m;return Zu(()=>{S!=null&&clearTimeout(S),m!=null&&clearTimeout(m)}),s&&(m=setTimeout(()=>{b.isUnmounted||(A.value=!1)},s)),a!=null&&(S=setTimeout(()=>{if(!b.isUnmounted&&!y.value&&!g.value){const w=new Error(`Async component timed out after ${a}ms.`);x(w),g.value=w}},a)),f().then(()=>{b.isUnmounted||(y.value=!0,b.parent&&cl(b.parent.vnode)&&b.parent.update())}).catch(w=>{if(b.isUnmounted){c=null;return}x(w),g.value=w}),()=>{if(y.value&&u)return Fa(u,b);if(g.value&&i)return ne(i,{error:g.value});if(t&&!A.value)return Fa(t,b)}}})}function Fa(n,e){const{ref:t,props:i,children:s,ce:r}=e.vnode,a=ne(n,i,s);return a.ref=t,a.ce=r,delete e.vnode.ce,a}const cl=n=>n.type.__isKeepAlive;function Fv(n,e){Fp(n,"a",e)}function kv(n,e){Fp(n,"da",e)}function Fp(n,e,t=Kt){const i=n.__wdc||(n.__wdc=()=>{let s=t;for(;s;){if(s.isDeactivated)return;s=s.parent}return n()});if(ul(e,i,t),t){let s=t.parent;for(;s&&s.parent;)cl(s.parent.vnode)&&Bv(i,e,t,s),s=s.parent}}function Bv(n,e,t,i){const s=ul(e,n,i,!0);Zu(()=>{zu(i[e],s)},t)}function ul(n,e,t=Kt,i=!1){if(t){const s=t[n]||(t[n]=[]),r=e.__weh||(e.__weh=(...a)=>{Ai();const o=wa(t),l=Yn(e,t,n,a);return o(),Ti(),l});return i?s.unshift(r):s.push(r),r}}const Ii=n=>(e,t=Kt)=>{(!_r||n==="sp")&&ul(n,(...i)=>e(...i),t)},zv=Ii("bm"),sn=Ii("m"),Vv=Ii("bu"),Hv=Ii("u"),ns=Ii("bum"),Zu=Ii("um"),$v=Ii("sp"),Gv=Ii("rtg"),Wv=Ii("rtc");function Xv(n,e=Kt){ul("ec",n,e)}const kp="components";function fa(n,e){return Vp(kp,n,!0,e)||n}const Bp=Symbol.for("v-ndc");function zp(n){return Ct(n)?Vp(kp,n,!1)||n:n||Bp}function Vp(n,e,t=!0,i=!1){const s=Zt||Kt;if(s){const r=s.type;{const o=C_(r,!1);if(o&&(o===e||o===hn(e)||o===nl(hn(e))))return r}const a=Yd(s[n]||r[n],e)||Yd(s.appContext[n],e);return!a&&i?r:a}}function Yd(n,e){return n&&(n[e]||n[hn(e)]||n[nl(hn(e))])}function kt(n,e,t,i){let s;const r=t,a=We(n);if(a||Ct(n)){const o=a&&Mi(n);let l=!1,c=!1;o&&(l=!An(n),c=Ri(n),n=rl(n)),s=new Array(n.length);for(let u=0,d=n.length;u<d;u++)s[u]=e(l?c?gr(qn(n[u])):qn(n[u]):n[u],u,void 0,r)}else if(typeof n=="number"){s=new Array(n);for(let o=0;o<n;o++)s[o]=e(o+1,o,void 0,r)}else if(xt(n))if(n[Symbol.iterator])s=Array.from(n,(o,l)=>e(o,l,void 0,r));else{const o=Object.keys(n);s=new Array(o.length);for(let l=0,c=o.length;l<c;l++){const u=o[l];s[l]=e(n[u],u,l,r)}}else s=[];return s}function Hp(n,e,t,i,s,r){if(t==null&&(t={}),Zt.ce||Zt.parent&&ur(Zt.parent)&&Zt.parent.ce){const c=t,u=Object.keys(c).length>0;return e!=="default"&&(c.name=e),Z(),bt(lt,null,[ne("slot",c,i)],u?-2:64)}let a=n[e];a&&a._c&&(a._d=!1);const o=Ei.length;Z();let l;try{const c=a&&$p(a(t)),u=t.key||r||c&&c.key;l=bt(lt,{key:(u&&!Tn(u)?u:`_${e}`)+(!c&&i?"_fb":"")},c||(i?i():[]),c&&n._===1?64:-2)}catch(c){for(let u=Ei.length;u>o;u--)ed();throw c}finally{a&&a._c&&(a._d=!0)}return l}function $p(n){return n.some(e=>ma(e)?!(e.type===ri||e.type===lt&&!$p(e.children)):!0)?n:null}const Nc=n=>n?um(n)?fl(n):Nc(n.parent):null,ta=Jt(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>Nc(n.parent),$root:n=>Nc(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>Wp(n),$forceUpdate:n=>n.f||(n.f=()=>{Yu(n.update)}),$nextTick:n=>n.n||(n.n=ol.bind(n.proxy)),$watch:n=>Dv.bind(n)}),Il=(n,e)=>n!==wt&&!n.__isScriptSetup&&gt(n,e),qv={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:i,data:s,props:r,accessCache:a,type:o,appContext:l}=n;if(e[0]!=="$"){const h=a[e];if(h!==void 0)switch(h){case 1:return i[e];case 2:return s[e];case 4:return t[e];case 3:return r[e]}else{if(Il(i,e))return a[e]=1,i[e];if(s!==wt&&gt(s,e))return a[e]=2,s[e];if(gt(r,e))return a[e]=3,r[e];if(t!==wt&&gt(t,e))return a[e]=4,t[e];Oc&&(a[e]=0)}}const c=ta[e];let u,d;if(c)return e==="$attrs"&&nn(n.attrs,"get",""),c(n);if((u=o.__cssModules)&&(u=u[e]))return u;if(t!==wt&&gt(t,e))return a[e]=4,t[e];if(d=l.config.globalProperties,gt(d,e))return d[e]},set({_:n},e,t){const{data:i,setupState:s,ctx:r}=n;return Il(s,e)?(s[e]=t,!0):i!==wt&&gt(i,e)?(i[e]=t,!0):gt(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(r[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:i,appContext:s,props:r,type:a}},o){let l;return!!(t[o]||n!==wt&&o[0]!=="$"&&gt(n,o)||Il(e,o)||gt(r,o)||gt(i,o)||gt(ta,o)||gt(s.config.globalProperties,o)||(l=a.__cssModules)&&l[o])},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:gt(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function jd(n){return We(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let Oc=!0;function Yv(n){const e=Wp(n),t=n.proxy,i=n.ctx;Oc=!1,e.beforeCreate&&Kd(e.beforeCreate,n,"bc");const{data:s,computed:r,methods:a,watch:o,provide:l,inject:c,created:u,beforeMount:d,mounted:h,beforeUpdate:f,updated:b,activated:x,deactivated:y,beforeDestroy:g,beforeUnmount:A,destroyed:S,unmounted:m,render:w,renderTracked:T,renderTriggered:R,errorCaptured:U,serverPrefetch:M,expose:C,inheritAttrs:F,components:G,directives:B,filters:$}=e;if(c&&jv(c,i,null),a)for(const re in a){const K=a[re];Ye(K)&&(i[re]=K.bind(t))}if(s){const re=s.call(t,t);xt(re)&&(n.data=si(re))}if(Oc=!0,r)for(const re in r){const K=r[re],Se=Ye(K)?K.bind(t,t):Ye(K.get)?K.get.bind(t,t):ii,Re=!Ye(K)&&Ye(K.set)?K.set.bind(t):ii,De=Me({get:Se,set:Re});Object.defineProperty(i,re,{enumerable:!0,configurable:!0,get:()=>De.value,set:Ve=>De.value=Ve})}if(o)for(const re in o)Gp(o[re],i,t,re);if(l){const re=Ye(l)?l.call(t):l;Reflect.ownKeys(re).forEach(K=>{Eo(K,re[K])})}u&&Kd(u,n,"c");function Y(re,K){We(K)?K.forEach(Se=>re(Se.bind(t))):K&&re(K.bind(t))}if(Y(zv,d),Y(sn,h),Y(Vv,f),Y(Hv,b),Y(Fv,x),Y(kv,y),Y(Xv,U),Y(Wv,T),Y(Gv,R),Y(ns,A),Y(Zu,m),Y($v,M),We(C))if(C.length){const re=n.exposed||(n.exposed={});C.forEach(K=>{Object.defineProperty(re,K,{get:()=>t[K],set:Se=>t[K]=Se,enumerable:!0})})}else n.exposed||(n.exposed={});w&&n.render===ii&&(n.render=w),F!=null&&(n.inheritAttrs=F),G&&(n.components=G),B&&(n.directives=B),M&&Ku(n)}function jv(n,e,t=ii){We(n)&&(n=Fc(n));for(const i in n){const s=n[i];let r;xt(s)?"default"in s?r=Un(s.from||i,s.default,!0):r=Un(s.from||i):r=Un(s),Ut(r)?Object.defineProperty(e,i,{enumerable:!0,configurable:!0,get:()=>r.value,set:a=>r.value=a}):e[i]=r}}function Kd(n,e,t){Yn(We(n)?n.map(i=>i.bind(e.proxy)):n.bind(e.proxy),e,t)}function Gp(n,e,t,i){let s=i.includes(".")?Np(t,i):()=>t[i];if(Ct(n)){const r=e[n];Ye(r)&&Bt(s,r)}else if(Ye(n))Bt(s,n.bind(t));else if(xt(n))if(We(n))n.forEach(r=>Gp(r,e,t,i));else{const r=Ye(n.handler)?n.handler.bind(t):e[n.handler];Ye(r)&&Bt(s,r,n)}}function Wp(n){const e=n.type,{mixins:t,extends:i}=e,{mixins:s,optionsCache:r,config:{optionMergeStrategies:a}}=n.appContext,o=r.get(e);let l;return o?l=o:!s.length&&!t&&!i?l=e:(l={},s.length&&s.forEach(c=>ko(l,c,a,!0)),ko(l,e,a)),xt(e)&&r.set(e,l),l}function ko(n,e,t,i=!1){const{mixins:s,extends:r}=e;r&&ko(n,r,t,!0),s&&s.forEach(a=>ko(n,a,t,!0));for(const a in e)if(!(i&&a==="expose")){const o=Kv[a]||t&&t[a];n[a]=o?o(n[a],e[a]):e[a]}return n}const Kv={data:Zd,props:Jd,emits:Jd,methods:qr,computed:qr,beforeCreate:on,created:on,beforeMount:on,mounted:on,beforeUpdate:on,updated:on,beforeDestroy:on,beforeUnmount:on,destroyed:on,unmounted:on,activated:on,deactivated:on,errorCaptured:on,serverPrefetch:on,components:qr,directives:qr,watch:Jv,provide:Zd,inject:Zv};function Zd(n,e){return e?n?function(){return Jt(Ye(n)?n.call(this,this):n,Ye(e)?e.call(this,this):e)}:e:n}function Zv(n,e){return qr(Fc(n),Fc(e))}function Fc(n){if(We(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function on(n,e){return n?[...new Set([].concat(n,e))]:e}function qr(n,e){return n?Jt(Object.create(null),n,e):e}function Jd(n,e){return n?We(n)&&We(e)?[...new Set([...n,...e])]:Jt(Object.create(null),jd(n),jd(e??{})):e}function Jv(n,e){if(!n)return e;if(!e)return n;const t=Jt(Object.create(null),n);for(const i in e)t[i]=on(n[i],e[i]);return t}function Xp(){return{app:null,config:{isNativeTag:tp,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Qv=0;function e_(n,e){return function(i,s=null){Ye(i)||(i=Jt({},i)),s!=null&&!xt(s)&&(s=null);const r=Xp(),a=new WeakSet,o=[];let l=!1;const c=r.app={_uid:Qv++,_component:i,_props:s,_container:null,_context:r,_instance:null,version:I_,get config(){return r.config},set config(u){},use(u,...d){return a.has(u)||(u&&Ye(u.install)?(a.add(u),u.install(c,...d)):Ye(u)&&(a.add(u),u(c,...d))),c},mixin(u){return r.mixins.includes(u)||r.mixins.push(u),c},component(u,d){return d?(r.components[u]=d,c):r.components[u]},directive(u,d){return d?(r.directives[u]=d,c):r.directives[u]},mount(u,d,h){if(!l){const f=c._ceVNode||ne(i,s);return f.appContext=r,h===!0?h="svg":h===!1&&(h=void 0),n(f,u,h),l=!0,c._container=u,u.__vue_app__=c,fl(f.component)}},onUnmount(u){o.push(u)},unmount(){l&&(Yn(o,c._instance,16),n(null,c._container),delete c._container.__vue_app__)},provide(u,d){return r.provides[u]=d,c},runWithContext(u){const d=Ms;Ms=c;try{return u()}finally{Ms=d}}};return c}}let Ms=null;const t_=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${hn(e)}Modifiers`]||n[`${ts(e)}Modifiers`];function n_(n,e,...t){if(n.isUnmounted)return;const i=n.vnode.props||wt;let s=t;const r=e.startsWith("update:"),a=r&&t_(i,e.slice(7));a&&(a.trim&&(s=t.map(u=>Ct(u)?u.trim():u)),a.number&&(s=s.map(il)));let o,l=i[o=wl(e)]||i[o=wl(hn(e))];!l&&r&&(l=i[o=wl(ts(e))]),l&&Yn(l,n,6,s);const c=i[o+"Once"];if(c){if(!n.emitted)n.emitted={};else if(n.emitted[o])return;n.emitted[o]=!0,Yn(c,n,6,s)}}const i_=new WeakMap;function qp(n,e,t=!1){const i=t?i_:e.emitsCache,s=i.get(n);if(s!==void 0)return s;const r=n.emits;let a={},o=!1;if(!Ye(n)){const l=c=>{const u=qp(c,e,!0);u&&(o=!0,Jt(a,u))};!t&&e.mixins.length&&e.mixins.forEach(l),n.extends&&l(n.extends),n.mixins&&n.mixins.forEach(l)}return!r&&!o?(xt(n)&&i.set(n,null),null):(We(r)?r.forEach(l=>a[l]=null):Jt(a,r),xt(n)&&i.set(n,a),a)}function dl(n,e){return!n||!Jo(e)?!1:(e=e.slice(2),e=e==="Once"?e:e.replace(/Once$/,""),gt(n,e[0].toLowerCase()+e.slice(1))||gt(n,ts(e))||gt(n,e))}function Qd(n){const{type:e,vnode:t,proxy:i,withProxy:s,propsOptions:[r],slots:a,attrs:o,emit:l,render:c,renderCache:u,props:d,data:h,setupState:f,ctx:b,inheritAttrs:x}=n,y=Oo(n);let g,A;try{if(t.shapeFlag&4){const m=s||i,w=m;g=Qn(c.call(w,m,u,d,f,h,b)),A=o}else{const m=e;g=Qn(m.length>1?m(d,{attrs:o,slots:a,emit:l}):m(d,null)),A=e.props?o:s_(o)}}catch(m){Ei.length=0,Ea(m,n,1),g=ne(ri)}let S=g;if(A&&x!==!1){const m=Object.keys(A),{shapeFlag:w}=S;m.length&&w&7&&(r&&m.some(Qo)&&(A=r_(A,r)),S=vr(S,A,!1,!0))}if(t.dirs&&(S=vr(S,null,!1,!0),S.dirs=S.dirs?S.dirs.concat(t.dirs):t.dirs),t.transition){const m=ll(S.type)&&Op(S)||S;ju(m,t.transition)}return g=S,Oo(y),g}const s_=n=>{let e;for(const t in n)(t==="class"||t==="style"||Jo(t))&&((e||(e={}))[t]=n[t]);return e},r_=(n,e)=>{const t={};for(const i in n)(!Qo(i)||!(i.slice(9)in e))&&(t[i]=n[i]);return t};function a_(n,e,t){const{props:i,children:s,component:r}=n,{props:a,children:o,patchFlag:l}=e,c=r.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&l>=0){if(l&1024)return!0;if(l&16)return i?eh(i,a,c):!!a;if(l&8){const u=e.dynamicProps;for(let d=0;d<u.length;d++){const h=u[d];if(Yp(a,i,h)&&!dl(c,h))return!0}}}else return(s||o)&&(!o||!o.$stable)?!0:i===a?!1:i?a?eh(i,a,c):!0:!!a;return!1}function eh(n,e,t){const i=Object.keys(e);if(i.length!==Object.keys(n).length)return!0;for(let s=0;s<i.length;s++){const r=i[s];if(Yp(e,n,r)&&!dl(t,r))return!0}return!1}function Yp(n,e,t){const i=n[t],s=e[t];return t==="style"&&xt(i)&&xt(s)?!Ki(i,s):i!==s}function o_({vnode:n,parent:e,suspense:t},i){for(;e;){const s=e.subTree;if(s.suspense&&s.suspense.activeBranch===n&&(s.suspense.vnode.el=s.el=i,n=s),s===n)(n=e.vnode).el=i,e=e.parent;else break}t&&t.activeBranch===n&&(t.vnode.el=i)}const jp={},Kp=()=>Object.create(jp),Zp=n=>Object.getPrototypeOf(n)===jp;function l_(n,e,t,i=!1){const s={},r=Kp();n.propsDefaults=Object.create(null),Jp(n,e,s,r);for(const a in n.propsOptions[0])a in s||(s[a]=void 0);t?n.props=i?s:Ap(s):n.type.props?n.props=s:n.props=r,n.attrs=r}function c_(n,e,t,i){const{props:s,attrs:r,vnode:{patchFlag:a}}=n,o=dt(s),[l]=n.propsOptions;let c=!1;if((i||a>0)&&!(a&16)){if(a&8){const u=n.vnode.dynamicProps;for(let d=0;d<u.length;d++){let h=u[d];if(dl(n.emitsOptions,h))continue;const f=e[h];if(l)if(gt(r,h))f!==r[h]&&(r[h]=f,c=!0);else{const b=hn(h);s[b]=kc(l,o,b,f,n,!1)}else f!==r[h]&&(r[h]=f,c=!0)}}}else{Jp(n,e,s,r)&&(c=!0);let u;for(const d in o)(!e||!gt(e,d)&&((u=ts(d))===d||!gt(e,u)))&&(l?t&&(t[d]!==void 0||t[u]!==void 0)&&(s[d]=kc(l,o,d,void 0,n,!0)):delete s[d]);if(r!==o)for(const d in r)(!e||!gt(e,d))&&(delete r[d],c=!0)}c&&yi(n.attrs,"set","")}function Jp(n,e,t,i){const[s,r]=n.propsOptions;let a=!1,o;if(e)for(let l in e){if(Zr(l))continue;const c=e[l];let u;s&&gt(s,u=hn(l))?!r||!r.includes(u)?t[u]=c:(o||(o={}))[u]=c:dl(n.emitsOptions,l)||(!(l in i)||c!==i[l])&&(i[l]=c,a=!0)}if(r){const l=dt(t),c=o||wt;for(let u=0;u<r.length;u++){const d=r[u];t[d]=kc(s,l,d,c[d],n,!gt(c,d))}}return a}function kc(n,e,t,i,s,r){const a=n[t];if(a!=null){const o=gt(a,"default");if(o&&i===void 0){const l=a.default;if(a.type!==Function&&!a.skipFactory&&Ye(l)){const{propsDefaults:c}=s;if(t in c)i=c[t];else{const u=wa(s);i=c[t]=l.call(null,e),u()}}else i=l;s.ce&&s.ce._setProp(t,i)}a[0]&&(r&&!o?i=!1:a[1]&&(i===""||i===ts(t))&&(i=!0))}return i}const u_=new WeakMap;function Qp(n,e,t=!1){const i=t?u_:e.propsCache,s=i.get(n);if(s)return s;const r=n.props,a={},o=[];let l=!1;if(!Ye(n)){const u=d=>{l=!0;const[h,f]=Qp(d,e,!0);Jt(a,h),f&&o.push(...f)};!t&&e.mixins.length&&e.mixins.forEach(u),n.extends&&u(n.extends),n.mixins&&n.mixins.forEach(u)}if(!r&&!l)return xt(n)&&i.set(n,lr),lr;if(We(r))for(let u=0;u<r.length;u++){const d=hn(r[u]);th(d)&&(a[d]=wt)}else if(r)for(const u in r){const d=hn(u);if(th(d)){const h=r[u],f=a[d]=We(h)||Ye(h)?{type:h}:Jt({},h),b=f.type;let x=!1,y=!0;if(We(b))for(let g=0;g<b.length;++g){const A=b[g],S=Ye(A)&&A.name;if(S==="Boolean"){x=!0;break}else S==="String"&&(y=!1)}else x=Ye(b)&&b.name==="Boolean";f[0]=x,f[1]=y,(x||gt(f,"default"))&&o.push(d)}}const c=[a,o];return xt(n)&&i.set(n,c),c}function th(n){return n[0]!=="$"&&!Zr(n)}const Ju=n=>n==="_"||n==="_ctx"||n==="$stable",Qu=n=>We(n)?n.map(Qn):[Qn(n)],d_=(n,e,t)=>{if(e._n)return e;const i=Zi((...s)=>Qu(e(...s)),t);return i._c=!1,i},em=(n,e,t)=>{const i=n._ctx;for(const s in n){if(Ju(s))continue;const r=n[s];if(Ye(r))e[s]=d_(s,r,i);else if(r!=null){const a=Qu(r);e[s]=()=>a}}},tm=(n,e)=>{const t=Qu(e);n.slots.default=()=>t},nm=(n,e,t)=>{for(const i in e)(t||!Ju(i))&&(n[i]=e[i])},h_=(n,e,t)=>{const i=n.slots=Kp();if(n.vnode.shapeFlag&32){const s=e._;s?(nm(i,e,t),t&&rp(i,"_",s,!0)):em(e,i)}else e&&tm(n,e)},f_=(n,e,t)=>{const{vnode:i,slots:s}=n;let r=!0,a=wt;if(i.shapeFlag&32){const o=e._;o?t&&o===1?r=!1:nm(s,e,t):(r=!e.$stable,em(e,s)),a=e}else e&&(tm(n,e),a={default:1});if(r)for(const o in s)!Ju(o)&&a[o]==null&&delete s[o]},vn=__;function p_(n){return m_(n)}function m_(n,e){const t=sl();t.__VUE__=!0;const{insert:i,remove:s,patchProp:r,createElement:a,createText:o,createComment:l,setText:c,setElementText:u,parentNode:d,nextSibling:h,setScopeId:f=ii,insertStaticContent:b}=n,x=(O,z,I,le=null,ie=null,Q=null,ce=void 0,ve=null,ae=!!z.dynamicChildren)=>{if(O===z)return;O&&!Fr(O,z)&&(le=H(O),Ve(O,ie,Q,!0),O=null),z.patchFlag===-2&&(ae=!1,z.dynamicChildren=null);const{type:p,ref:v,shapeFlag:P}=z;switch(p){case hl:y(O,z,I,le);break;case ri:g(O,z,I,le);break;case Ll:O==null&&A(z,I,le,ce);break;case lt:G(O,z,I,le,ie,Q,ce,ve,ae);break;default:P&1?w(O,z,I,le,ie,Q,ce,ve,ae):P&6?B(O,z,I,le,ie,Q,ce,ve,ae):(P&64||P&128)&&p.process(O,z,I,le,ie,Q,ce,ve,ae,ye)}v!=null&&ie?ea(v,O&&O.ref,Q,z||O,!z):v==null&&O&&O.ref!=null&&ea(O.ref,null,Q,O,!0)},y=(O,z,I,le)=>{if(O==null)i(z.el=o(z.children),I,le);else{const ie=z.el=O.el;z.children!==O.children&&c(ie,z.children)}},g=(O,z,I,le)=>{O==null?i(z.el=l(z.children||""),I,le):z.el=O.el},A=(O,z,I,le)=>{[O.el,O.anchor]=b(O.children,z,I,le,O.el,O.anchor)},S=({el:O,anchor:z},I,le)=>{let ie;for(;O&&O!==z;)ie=h(O),i(O,I,le),O=ie;i(z,I,le)},m=({el:O,anchor:z})=>{let I;for(;O&&O!==z;)I=h(O),s(O),O=I;s(z)},w=(O,z,I,le,ie,Q,ce,ve,ae)=>{if(z.type==="svg"?ce="svg":z.type==="math"&&(ce="mathml"),O==null)T(z,I,le,ie,Q,ce,ve,ae);else{const p=O.el&&O.el._isVueCE?O.el:null;try{p&&p._beginPatch(),M(O,z,ie,Q,ce,ve,ae)}finally{p&&p._endPatch()}}},T=(O,z,I,le,ie,Q,ce,ve)=>{let ae,p;const{props:v,shapeFlag:P,transition:E,dirs:N}=O;if(ae=O.el=a(O.type,Q,v&&v.is,v),P&8?u(ae,O.children):P&16&&U(O.children,ae,null,le,ie,Dl(O,Q),ce,ve),N&&rs(O,null,le,"created"),R(ae,O,O.scopeId,ce,le),v){for(const ee in v)ee!=="value"&&!Zr(ee)&&r(ae,ee,null,v[ee],Q,le);"value"in v&&r(ae,"value",null,v.value,Q),(p=v.onVnodeBeforeMount)&&Kn(p,le,O)}N&&rs(O,null,le,"beforeMount");const k=g_(ie,E);k&&E.beforeEnter(ae),i(ae,z,I),((p=v&&v.onVnodeMounted)||k||N)&&vn(()=>{try{p&&Kn(p,le,O),k&&E.enter(ae),N&&rs(O,null,le,"mounted")}finally{}},ie)},R=(O,z,I,le,ie)=>{if(I&&f(O,I),le)for(let Q=0;Q<le.length;Q++)f(O,le[Q]);if(ie){let Q=ie.subTree;if(z===Q||am(Q.type)&&(Q.ssContent===z||Q.ssFallback===z)){const ce=ie.vnode;R(O,ce,ce.scopeId,ce.slotScopeIds,ie.parent)}}},U=(O,z,I,le,ie,Q,ce,ve,ae=0)=>{for(let p=ae;p<O.length;p++){const v=O[p]=ve?_i(O[p]):Qn(O[p]);x(null,v,z,I,le,ie,Q,ce,ve)}},M=(O,z,I,le,ie,Q,ce)=>{const ve=z.el=O.el;let{patchFlag:ae,dynamicChildren:p,dirs:v}=z;ae|=O.patchFlag&16;const P=O.props||wt,E=z.props||wt;let N;if(I&&as(I,!1),(N=E.onVnodeBeforeUpdate)&&Kn(N,I,z,O),v&&rs(z,O,I,"beforeUpdate"),I&&as(I,!0),p&&(!O.dynamicChildren||O.dynamicChildren.length!==p.length)&&(ae=0,ce=!1,p=null),(P.innerHTML&&E.innerHTML==null||P.textContent&&E.textContent==null)&&u(ve,""),p?C(O.dynamicChildren,p,ve,I,le,Dl(z,ie),Q):ce||K(O,z,ve,null,I,le,Dl(z,ie),Q,!1),ae>0){if(ae&16)F(ve,P,E,I,ie);else if(ae&2&&P.class!==E.class&&r(ve,"class",null,E.class,ie),ae&4&&r(ve,"style",P.style,E.style,ie),ae&8){const k=z.dynamicProps;for(let ee=0;ee<k.length;ee++){const oe=k[ee],ge=P[oe],Fe=E[oe];(Fe!==ge||oe==="value")&&r(ve,oe,ge,Fe,ie,I)}}ae&1&&O.children!==z.children&&u(ve,z.children)}else!ce&&p==null&&F(ve,P,E,I,ie);((N=E.onVnodeUpdated)||v)&&vn(()=>{N&&Kn(N,I,z,O),v&&rs(z,O,I,"updated")},le)},C=(O,z,I,le,ie,Q,ce)=>{for(let ve=0;ve<z.length;ve++){const ae=O[ve],p=z[ve],v=ae.el&&(ae.type===lt||!Fr(ae,p)||ae.shapeFlag&198)?d(ae.el):I;x(ae,p,v,null,le,ie,Q,ce,!0)}},F=(O,z,I,le,ie)=>{if(z!==I){if(z!==wt)for(const Q in z)!Zr(Q)&&!(Q in I)&&r(O,Q,z[Q],null,ie,le);for(const Q in I){if(Zr(Q))continue;const ce=I[Q],ve=z[Q];ce!==ve&&Q!=="value"&&r(O,Q,ve,ce,ie,le)}"value"in I&&r(O,"value",z.value,I.value,ie)}},G=(O,z,I,le,ie,Q,ce,ve,ae)=>{const p=z.el=O?O.el:o(""),v=z.anchor=O?O.anchor:o("");let{patchFlag:P,dynamicChildren:E,slotScopeIds:N}=z;N&&(ve=ve?ve.concat(N):N),O==null?(i(p,I,le),i(v,I,le),U(z.children||[],I,v,ie,Q,ce,ve,ae)):P>0&&P&64&&E&&O.dynamicChildren&&O.dynamicChildren.length===E.length?(C(O.dynamicChildren,E,I,ie,Q,ce,ve),(z.key!=null||ie&&z===ie.subTree)&&im(O,z,!0)):K(O,z,I,v,ie,Q,ce,ve,ae)},B=(O,z,I,le,ie,Q,ce,ve,ae)=>{z.slotScopeIds=ve,O==null?z.shapeFlag&512?ie.ctx.activate(z,I,le,ce,ae):$(z,I,le,ie,Q,ce,ae):j(O,z,ae)},$=(O,z,I,le,ie,Q,ce)=>{const ve=O.component=E_(O,le,ie);if(cl(O)&&(ve.ctx.renderer=ye),w_(ve,!1,ce),ve.asyncDep){if(ie&&ie.registerDep(ve,Y,ce),!O.el){const ae=ve.subTree=ne(ri);g(null,ae,z,I),O.placeholder=ae.el}}else Y(ve,O,z,I,ie,Q,ce)},j=(O,z,I)=>{const le=z.component=O.component;if(a_(O,z,I))if(le.asyncDep&&!le.asyncResolved){re(le,z,I);return}else le.next=z,le.update();else z.el=O.el,le.vnode=z},Y=(O,z,I,le,ie,Q,ce)=>{const ve=()=>{if(O.isMounted){let{next:P,bu:E,u:N,parent:k,vnode:ee}=O;{const we=sm(O);if(we){P&&(P.el=ee.el,re(O,P,ce)),we.asyncDep.then(()=>{vn(()=>{O.isUnmounted||p()},ie)});return}}let oe=P,ge;as(O,!1),P?(P.el=ee.el,re(O,P,ce)):P=ee,E&&Mo(E),(ge=P.props&&P.props.onVnodeBeforeUpdate)&&Kn(ge,k,P,ee),as(O,!0);const Fe=Qd(O),pe=O.subTree;O.subTree=Fe,x(pe,Fe,d(pe.el),H(pe),O,ie,Q),P.el=Fe.el,oe===null&&o_(O,Fe.el),N&&vn(N,ie),(ge=P.props&&P.props.onVnodeUpdated)&&vn(()=>Kn(ge,k,P,ee),ie)}else{let P;const{el:E,props:N}=z,{bm:k,m:ee,parent:oe,root:ge,type:Fe}=O,pe=ur(z);as(O,!1),k&&Mo(k),!pe&&(P=N&&N.onVnodeBeforeMount)&&Kn(P,oe,z),as(O,!0);{ge.ce&&ge.ce._hasShadowRoot()&&ge.ce._injectChildStyle(Fe,O.parent?O.parent.type:void 0);const we=O.subTree=Qd(O);x(null,we,I,le,O,ie,Q),z.el=we.el}if(ee&&vn(ee,ie),!pe&&(P=N&&N.onVnodeMounted)){const we=z;vn(()=>Kn(P,oe,we),ie)}(z.shapeFlag&256||oe&&ur(oe.vnode)&&oe.vnode.shapeFlag&256)&&O.a&&vn(O.a,ie),O.isMounted=!0,z=I=le=null}};O.scope.on();const ae=O.effect=new hp(ve);O.scope.off();const p=O.update=ae.run.bind(ae),v=O.job=ae.runIfDirty.bind(ae);v.i=O,v.id=O.uid,ae.scheduler=()=>Yu(v),as(O,!0),p()},re=(O,z,I)=>{z.component=O;const le=O.vnode.props;O.vnode=z,O.next=null,c_(O,z.props,le,I),f_(O,z.children,I),Ai(),Gd(O),Ti()},K=(O,z,I,le,ie,Q,ce,ve,ae=!1)=>{const p=O&&O.children,v=O?O.shapeFlag:0,P=z.children,{patchFlag:E,shapeFlag:N}=z;if(E>0){if(E&128){Re(p,P,I,le,ie,Q,ce,ve,ae);return}else if(E&256){Se(p,P,I,le,ie,Q,ce,ve,ae);return}}N&8?(v&16&&Te(p,ie,Q),P!==p&&u(I,P)):v&16?N&16?Re(p,P,I,le,ie,Q,ce,ve,ae):Te(p,ie,Q,!0):(v&8&&u(I,""),N&16&&U(P,I,le,ie,Q,ce,ve,ae))},Se=(O,z,I,le,ie,Q,ce,ve,ae)=>{O=O||lr,z=z||lr;const p=O.length,v=z.length,P=Math.min(p,v);let E;for(E=0;E<P;E++){const N=z[E]=ae?_i(z[E]):Qn(z[E]);x(O[E],N,I,null,ie,Q,ce,ve,ae)}p>v?Te(O,ie,Q,!0,!1,P):U(z,I,le,ie,Q,ce,ve,ae,P)},Re=(O,z,I,le,ie,Q,ce,ve,ae)=>{let p=0;const v=z.length;let P=O.length-1,E=v-1;for(;p<=P&&p<=E;){const N=O[p],k=z[p]=ae?_i(z[p]):Qn(z[p]);if(Fr(N,k))x(N,k,I,null,ie,Q,ce,ve,ae);else break;p++}for(;p<=P&&p<=E;){const N=O[P],k=z[E]=ae?_i(z[E]):Qn(z[E]);if(Fr(N,k))x(N,k,I,null,ie,Q,ce,ve,ae);else break;P--,E--}if(p>P){if(p<=E){const N=E+1,k=N<v?z[N].el:le;for(;p<=E;)x(null,z[p]=ae?_i(z[p]):Qn(z[p]),I,k,ie,Q,ce,ve,ae),p++}}else if(p>E)for(;p<=P;)Ve(O[p],ie,Q,!0),p++;else{const N=p,k=p,ee=new Map;for(p=k;p<=E;p++){const Ae=z[p]=ae?_i(z[p]):Qn(z[p]);Ae.key!=null&&ee.set(Ae.key,p)}let oe,ge=0;const Fe=E-k+1;let pe=!1,we=0;const Ne=new Array(Fe);for(p=0;p<Fe;p++)Ne[p]=0;for(p=N;p<=P;p++){const Ae=O[p];if(ge>=Fe){Ve(Ae,ie,Q,!0);continue}let Xe;if(Ae.key!=null)Xe=ee.get(Ae.key);else for(oe=k;oe<=E;oe++)if(Ne[oe-k]===0&&Fr(Ae,z[oe])){Xe=oe;break}Xe===void 0?Ve(Ae,ie,Q,!0):(Ne[Xe-k]=p+1,Xe>=we?we=Xe:pe=!0,x(Ae,z[Xe],I,null,ie,Q,ce,ve,ae),ge++)}const He=pe?v_(Ne):lr;for(oe=He.length-1,p=Fe-1;p>=0;p--){const Ae=k+p,Xe=z[Ae],Ze=z[Ae+1],vt=Ae+1<v?Ze.el||rm(Ze):le;Ne[p]===0?x(null,Xe,I,vt,ie,Q,ce,ve,ae):pe&&(oe<0||p!==He[oe]?De(Xe,I,vt,2):oe--)}}},De=(O,z,I,le,ie=null)=>{const{el:Q,type:ce,transition:ve,children:ae,shapeFlag:p}=O;if(p&6){De(O.component.subTree,z,I,le);return}if(p&128){O.suspense.move(z,I,le);return}if(p&64){ce.move(O,z,I,ye);return}if(ce===lt){i(Q,z,I);for(let P=0;P<ae.length;P++)De(ae[P],z,I,le);i(O.anchor,z,I);return}if(ce===Ll){S(O,z,I);return}if(le!==2&&p&1&&ve)if(le===0)ve.persisted&&!Q[Pl]?i(Q,z,I):(ve.beforeEnter(Q),i(Q,z,I),vn(()=>ve.enter(Q),ie));else{const{leave:P,delayLeave:E,afterLeave:N}=ve,k=()=>{O.ctx.isUnmounted?s(Q):i(Q,z,I)},ee=()=>{const oe=Q._isLeaving||!!Q[Pl];Q._isLeaving&&Q[Pl](!0),ve.persisted&&!oe?k():P(Q,()=>{k(),N&&N()})};E?E(Q,k,ee):ee()}else i(Q,z,I)},Ve=(O,z,I,le=!1,ie=!1)=>{const{type:Q,props:ce,ref:ve,children:ae,dynamicChildren:p,shapeFlag:v,patchFlag:P,dirs:E,cacheIndex:N,memo:k}=O;if(P===-2&&(ie=!1),ve!=null&&(Ai(),ea(ve,null,I,O,!0),Ti()),N!=null&&(z.renderCache[N]=void 0),v&256){z.ctx.deactivate(O);return}const ee=v&1&&E,oe=!ur(O);let ge;if(oe&&(ge=ce&&ce.onVnodeBeforeUnmount)&&Kn(ge,z,O),v&6)xe(O.component,I,le);else{if(v&128){O.suspense.unmount(I,le);return}ee&&rs(O,null,z,"beforeUnmount"),v&64?O.type.remove(O,z,I,ye,le):p&&!p.hasOnce&&(Q!==lt||P>0&&P&64)?Te(p,z,I,!1,!0):(Q===lt&&P&384||!ie&&v&16)&&Te(ae,z,I),le&&st(O)}const Fe=k!=null&&N==null;(oe&&(ge=ce&&ce.onVnodeUnmounted)||ee||Fe)&&vn(()=>{ge&&Kn(ge,z,O),ee&&rs(O,null,z,"unmounted"),Fe&&(O.el=null)},I)},st=O=>{const{type:z,el:I,anchor:le,transition:ie}=O;if(z===lt){fe(I,le);return}if(z===Ll){m(O);return}const Q=()=>{s(I),ie&&!ie.persisted&&ie.afterLeave&&ie.afterLeave()};if(O.shapeFlag&1&&ie&&!ie.persisted){const{leave:ce,delayLeave:ve}=ie,ae=()=>ce(I,Q);ve?ve(O.el,Q,ae):ae()}else Q()},fe=(O,z)=>{let I;for(;O!==z;)I=h(O),s(O),O=I;s(z)},xe=(O,z,I)=>{const{bum:le,scope:ie,job:Q,subTree:ce,um:ve,m:ae,a:p}=O;nh(ae),nh(p),le&&Mo(le),ie.stop(),Q&&(Q.flags|=8,Ve(ce,O,z,I)),ve&&vn(ve,z),vn(()=>{O.isUnmounted=!0},z)},Te=(O,z,I,le=!1,ie=!1,Q=0)=>{for(let ce=Q;ce<O.length;ce++)Ve(O[ce],z,I,le,ie)},H=O=>{if(O.shapeFlag&6)return H(O.component.subTree);if(O.shapeFlag&128)return O.suspense.next();const z=h(O.anchor||O.el),I=z&&z[Lv];return I?h(I):z};let me=!1;const he=(O,z,I)=>{let le;O==null?z._vnode&&(Ve(z._vnode,null,null,!0),le=z._vnode.component):x(z._vnode||null,O,z,null,null,null,I),z._vnode=O,me||(me=!0,Gd(le),Ip(),me=!1)},ye={p:x,um:Ve,m:De,r:st,mt:$,mc:U,pc:K,pbc:C,n:H,o:n};return{render:he,hydrate:void 0,createApp:e_(he)}}function Dl({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function as({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function g_(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function im(n,e,t=!1){const i=n.children,s=e.children;if(We(i)&&We(s))for(let r=0;r<i.length;r++){const a=i[r];let o=s[r];o.shapeFlag&1&&!o.dynamicChildren&&((o.patchFlag<=0||o.patchFlag===32)&&(o=s[r]=_i(s[r]),o.el=a.el),!t&&o.patchFlag!==-2&&im(a,o)),o.type===hl&&(o.patchFlag===-1&&(o=s[r]=_i(o)),o.el=a.el),o.type===ri&&!o.el&&(o.el=a.el)}}function v_(n){const e=n.slice(),t=[0];let i,s,r,a,o;const l=n.length;for(i=0;i<l;i++){const c=n[i];if(c!==0){if(s=t[t.length-1],n[s]<c){e[i]=s,t.push(i);continue}for(r=0,a=t.length-1;r<a;)o=r+a>>1,n[t[o]]<c?r=o+1:a=o;c<n[t[r]]&&(r>0&&(e[i]=t[r-1]),t[r]=i)}}for(r=t.length,a=t[r-1];r-- >0;)t[r]=a,a=e[a];return t}function sm(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:sm(e)}function nh(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}function rm(n){if(n.placeholder)return n.placeholder;const e=n.component;return e?rm(e.subTree):null}const am=n=>n.__isSuspense;function __(n,e){e&&e.pendingBranch?We(n)?e.effects.push(...n):e.effects.push(n):Rv(n)}const lt=Symbol.for("v-fgt"),hl=Symbol.for("v-txt"),ri=Symbol.for("v-cmt"),Ll=Symbol.for("v-stc"),Ei=[];let wn=null;function Z(n=!1){Ei.push(wn=n?null:[])}function ed(){Ei.pop(),wn=Ei[Ei.length-1]||null}let pa=1;function Bo(n,e=!1){pa+=n,n<0&&wn&&e&&(wn.hasOnce=!0)}function om(n){return n.dynamicChildren=pa>0?wn||lr:null,ed(),pa>0&&wn&&wn.push(n),n}function de(n,e,t,i,s,r){return om(_(n,e,t,i,s,r,!0))}function bt(n,e,t,i,s){return om(ne(n,e,t,i,s,!0))}function ma(n){return n?n.__v_isVNode===!0:!1}function Fr(n,e){return n.type===e.type&&n.key===e.key}const lm=({key:n})=>n??null,wo=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?Ct(n)||Ut(n)||Ye(n)?{i:Zt,r:n,k:e,f:!!t}:n:null);function _(n,e=null,t=null,i=0,s=null,r=n===lt?0:1,a=!1,o=!1){const l={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&lm(e),ref:e&&wo(e),scopeId:Lp,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:i,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Zt};return o?(zo(l,t),r&128&&n.normalize(l)):t&&(l.shapeFlag|=Ct(t)?8:16),pa>0&&!a&&wn&&(l.patchFlag>0||r&6)&&l.patchFlag!==32&&wn.push(l),l}const ne=y_;function y_(n,e=null,t=null,i=0,s=null,r=!1){if((!n||n===Bp)&&(n=ri),ma(n)){const o=vr(n,e,!0);return t&&zo(o,t),pa>0&&!r&&wn&&(o.shapeFlag&6?wn[wn.indexOf(n)]=o:wn.push(o)),o.patchFlag=-2,o}if(P_(n)&&(n=n.__vccOpts),e){e=b_(e);let{class:o,style:l}=e;o&&!Ct(o)&&(e.class=Yt(o)),xt(l)&&(al(l)&&!We(l)&&(l=Jt({},l)),e.style=Pi(l))}const a=Ct(n)?1:am(n)?128:ll(n)?64:xt(n)?4:Ye(n)?2:0;return _(n,e,t,i,s,a,r,!0)}function b_(n){return n?al(n)||Zp(n)?Jt({},n):n:null}function vr(n,e,t=!1,i=!1){const{props:s,ref:r,patchFlag:a,children:o,transition:l}=n,c=e?x_(s||{},e):s,u={__v_isVNode:!0,__v_skip:!0,type:n.type,props:c,key:c&&lm(c),ref:e&&e.ref?t&&r?We(r)?r.concat(wo(e)):[r,wo(e)]:wo(e):r,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:o,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==lt?a===-1?16:a|16:a,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:l,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&vr(n.ssContent),ssFallback:n.ssFallback&&vr(n.ssFallback),placeholder:n.placeholder,el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return l&&i&&ju(u,l.clone(u)),u}function ot(n=" ",e=0){return ne(hl,null,n,e)}function tt(n="",e=!1){return e?(Z(),bt(ri,null,n)):ne(ri,null,n)}function Qn(n){return n==null||typeof n=="boolean"?ne(ri):We(n)?ne(lt,null,n.slice()):ma(n)?_i(n):ne(hl,null,String(n))}function _i(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:vr(n)}function zo(n,e){let t=0;const{shapeFlag:i}=n;if(e==null)e=null;else if(We(e))t=16;else if(typeof e=="object")if(i&65){const s=e.default;s&&(s._c&&(s._d=!1),zo(n,s()),s._c&&(s._d=!0));return}else{t=32;const s=e._;!s&&!Zp(e)?e._ctx=Zt:s===3&&Zt&&(Zt.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else if(Ye(e)){if(i&65){zo(n,{default:e});return}e={default:e,_ctx:Zt},t=32}else e=String(e),i&64?(t=16,e=[ot(e)]):t=8;n.children=e,n.shapeFlag|=t}function x_(...n){const e={};for(let t=0;t<n.length;t++){const i=n[t];for(const s in i)if(s==="class")e.class!==i.class&&(e.class=Yt([e.class,i.class]));else if(s==="style")e.style=Pi([e.style,i.style]);else if(Jo(s)){const r=e[s],a=i[s];a&&r!==a&&!(We(r)&&r.includes(a))?e[s]=r?[].concat(r,a):a:a==null&&r==null&&!Qo(s)&&(e[s]=a)}else s!==""&&(e[s]=i[s])}return e}function Kn(n,e,t,i=null){Yn(n,e,7,[t,i])}const S_=Xp();let M_=0;function E_(n,e,t){const i=n.type,s=(e?e.appContext:n.appContext)||S_,r={uid:M_++,vnode:n,type:i,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new cp(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:Qp(i,s),emitsOptions:qp(i,s),emit:null,emitted:null,propsDefaults:wt,inheritAttrs:i.inheritAttrs,ctx:wt,data:wt,props:wt,attrs:wt,slots:wt,refs:wt,setupState:wt,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=e?e.root:r,r.emit=n_.bind(null,r),n.ce&&n.ce(r),r}let Kt=null;const cm=()=>Kt||Zt;let Vo,ga;{const n=sl(),e=(t,i)=>{let s;return(s=n[t])||(s=n[t]=[]),s.push(i),r=>{s.length>1?s.forEach(a=>a(r)):s[0](r)}};Vo=e("__VUE_INSTANCE_SETTERS__",t=>Kt=t),ga=e("__VUE_SSR_SETTERS__",t=>_r=t)}const wa=n=>{const e=Kt;return Vo(n),n.scope.on(),()=>{n.scope.off(),Vo(e)}},ih=()=>{Kt&&Kt.scope.off(),Vo(null)};function um(n){return n.vnode.shapeFlag&4}let _r=!1;function w_(n,e=!1,t=!1){e&&ga(e);const{props:i,children:s}=n.vnode,r=um(n);l_(n,i,r,e),h_(n,s,t||e);const a=r?A_(n,e):void 0;return e&&ga(!1),a}function A_(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,qv);const{setup:i}=t;if(i){Ai();const s=n.setupContext=i.length>1?R_(n):null,r=wa(n),a=Ma(i,n,0,[n.props,s]),o=np(a);if(Ti(),r(),(o||n.sp)&&!ur(n)&&Ku(n),o){if(a.then(ih,ih),e)return a.then(l=>{ga(!0);try{sh(n,l,e)}finally{ga(!1)}}).catch(l=>{Ea(l,n,0)});n.asyncDep=a}else sh(n,a)}else dm(n)}function sh(n,e,t){Ye(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:xt(e)&&(n.setupState=Rp(e)),dm(n)}function dm(n,e,t){const i=n.type;n.render||(n.render=i.render||ii);{const s=wa(n);Ai();try{Yv(n)}finally{Ti(),s()}}}const T_={get(n,e){return nn(n,"get",""),n[e]}};function R_(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,T_),slots:n.slots,emit:n.emit,expose:e}}function fl(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(Rp(qu(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in ta)return ta[t](n)},has(e,t){return t in e||t in ta}})):n.proxy}function C_(n,e=!0){return Ye(n)?n.displayName||n.name:n.name||e&&n.__name}function P_(n){return Ye(n)&&"__vccOpts"in n}const Me=(n,e)=>Mv(n,e,_r);function va(n,e,t){try{Bo(-1);const i=arguments.length;return i===2?xt(e)&&!We(e)?ma(e)?ne(n,null,[e]):ne(n,e):ne(n,null,e):(i>3?t=Array.prototype.slice.call(arguments,2):i===3&&ma(t)&&(t=[t]),ne(n,e,t))}finally{Bo(1)}}const I_="3.5.42";/**
* @vue/runtime-dom v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Bc;const rh=typeof window<"u"&&window.trustedTypes;if(rh)try{Bc=rh.createPolicy("vue",{createHTML:n=>n})}catch{}const hm=Bc?n=>Bc.createHTML(n):n=>n,D_="http://www.w3.org/2000/svg",L_="http://www.w3.org/1998/Math/MathML",vi=typeof document<"u"?document:null,ah=vi&&vi.createElement("template"),U_={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,i)=>{const s=e==="svg"?vi.createElementNS(D_,n):e==="mathml"?vi.createElementNS(L_,n):t?vi.createElement(n,{is:t}):vi.createElement(n);return n==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:n=>vi.createTextNode(n),createComment:n=>vi.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>vi.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,i,s,r){const a=t?t.previousSibling:e.lastChild;if(s&&(s===r||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),t),!(s===r||!(s=s.nextSibling)););else{ah.innerHTML=hm(i==="svg"?`<svg>${n}</svg>`:i==="mathml"?`<math>${n}</math>`:n);const o=ah.content;if(i==="svg"||i==="mathml"){const l=o.firstChild;for(;l.firstChild;)o.appendChild(l.firstChild);o.removeChild(l)}e.insertBefore(o,t)}return[a?a.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},N_=Symbol("_vtc");function O_(n,e,t){const i=n[N_];i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const oh=Symbol("_vod"),F_=Symbol("_vsh"),k_=Symbol(""),B_=/(?:^|;)\s*display\s*:/;function z_(n,e,t){const i=n.style,s=Ct(t);let r=!1;if(t&&!s){if(e)if(Ct(e))for(const a of e.split(";")){const o=a.slice(0,a.indexOf(":")).trim();t[o]==null&&Yr(i,o,"")}else for(const a in e)t[a]==null&&Yr(i,a,"");for(const a in t){a==="display"&&(r=!0);const o=t[a];o!=null?H_(n,a,!Ct(e)&&e?e[a]:void 0,o)||Yr(i,a,o):Yr(i,a,"")}}else if(s){if(e!==t){const a=i[k_];a&&(t+=";"+a),i.cssText=t,r=B_.test(t)}}else e&&n.removeAttribute("style");oh in n&&(n[oh]=r?i.display:"",n[F_]&&(i.display="none"))}const ka=/\s*!important$/;function Yr(n,e,t){if(We(t))t.forEach(i=>Yr(n,e,i));else if(t==null&&(t=""),e.startsWith("--"))ka.test(t)?n.setProperty(e,t.replace(ka,""),"important"):n.setProperty(e,t);else{const i=V_(n,e);ka.test(t)?n.setProperty(ts(i),t.replace(ka,""),"important"):n[i]=t}}const lh=["Webkit","Moz","ms"],Ul={};function V_(n,e){const t=Ul[e];if(t)return t;let i=hn(e);if(i!=="filter"&&i in n)return Ul[e]=i;i=nl(i);for(let s=0;s<lh.length;s++){const r=lh[s]+i;if(r in n)return Ul[e]=r}return e}function H_(n,e,t,i){return n.tagName==="TEXTAREA"&&(e==="width"||e==="height")&&Ct(i)&&t===i}const ch="http://www.w3.org/1999/xlink";function uh(n,e,t,i,s,r=Yg(e)){i&&e.startsWith("xlink:")?t==null?n.removeAttributeNS(ch,e.slice(6,e.length)):n.setAttributeNS(ch,e,t):t==null||r&&!ap(t)?n.removeAttribute(e):n.setAttribute(e,r?"":Tn(t)?String(t):t)}function dh(n,e,t,i,s){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?hm(t):t);return}const r=n.tagName;if(e==="value"&&r!=="PROGRESS"&&!r.includes("-")){const o=r==="OPTION"?n.getAttribute("value")||"":n.value,l=t==null?n.type==="checkbox"?"on":"":String(t);(o!==l||!("_value"in n))&&(n.value=l),t==null&&n.removeAttribute(e),n._value=t;return}let a=!1;if(t===""||t==null){const o=typeof n[e];o==="boolean"?t=ap(t):t==null&&o==="string"?(t="",a=!0):o==="number"&&(t=0,a=!0)}try{n[e]=t}catch{}a&&n.removeAttribute(s||e)}function ms(n,e,t,i){n.addEventListener(e,t,i)}function $_(n,e,t,i){n.removeEventListener(e,t,i)}const hh=Symbol("_vei");function G_(n,e,t,i,s=null){const r=n[hh]||(n[hh]={}),a=r[e];if(i&&a)a.value=i;else{const[o,l]=q_(e);if(i){const c=r[e]=K_(i,s);ms(n,o,c,l)}else a&&($_(n,o,a,l),r[e]=void 0)}}const W_=/(Once|Passive|Capture)$/,X_=/^on:?(?:Once|Passive|Capture)$/;function q_(n){let e,t;for(;(t=n.match(W_))&&!X_.test(n);)e||(e={}),n=n.slice(0,n.length-t[1].length),e[t[1].toLowerCase()]=!0;return[n[2]===":"?n.slice(3):ts(n.slice(2)),e]}let Nl=0;const Y_=Promise.resolve(),j_=()=>Nl||(Y_.then(()=>Nl=0),Nl=Date.now());function K_(n,e){const t=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=t.attached)return;const s=t.value;if(We(s)){const r=i.stopImmediatePropagation;i.stopImmediatePropagation=()=>{r.call(i),i._stopped=!0};const a=s.slice(),o=[i];for(let l=0;l<a.length&&!i._stopped;l++){const c=a[l];c&&Yn(c,e,5,o)}}else Yn(s,e,5,[i])};return t.value=n,t.attached=j_(),t}const fh=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,Z_=(n,e,t,i,s,r)=>{const a=s==="svg";e==="class"?O_(n,i,a):e==="style"?z_(n,t,i):Jo(e)?Qo(e)||G_(n,e,t,i,r):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):J_(n,e,i,a))?(dh(n,e,i),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&uh(n,e,i,a,r,e!=="value")):n._isVueCE&&(Q_(n,e)||n._def.__asyncLoader&&(/[A-Z]/.test(e)||!Ct(i)))?dh(n,hn(e),i,r,e):(e==="true-value"?n._trueValue=i:e==="false-value"&&(n._falseValue=i),uh(n,e,i,a))};function J_(n,e,t,i){if(i)return!!(e==="innerHTML"||e==="textContent"||e in n&&fh(e)&&Ye(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&n.tagName==="IFRAME"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=n.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return fh(e)&&Ct(t)?!1:e in n}function Q_(n,e){const t=n._def.props;if(!t)return!1;const i=hn(e);return Array.isArray(t)?t.some(s=>hn(s)===i):Object.keys(t).some(s=>hn(s)===i)}const Ho=n=>{const e=n.props["onUpdate:modelValue"]||!1;return We(e)?t=>Mo(e,t):e};function e0(n){n.target.composing=!0}function ph(n){const e=n.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const _s=Symbol("_assign"),Ba=Symbol("_initialValue");function Ol(n,e,t){return e&&(n=n.trim()),t&&(n=il(n)),n}const Wi={created(n,{modifiers:{lazy:e,trim:t,number:i}},s){n.parentNode&&(n.type==="text"?n[Ba]=n.defaultValue.replace(/[\r\n]/g,""):n.type==="textarea"&&(n[Ba]=n.defaultValue.replace(/\r\n?/g,`
`))),n[_s]=Ho(s);const r=i||s.props&&s.props.type==="number";ms(n,e?"change":"input",a=>{a.target.composing||n[_s](Ol(n.value,t,r))}),(t||r)&&ms(n,"change",()=>{n.value=Ol(n.value,t,r)}),e||(ms(n,"compositionstart",e0),ms(n,"compositionend",ph),ms(n,"change",ph))},mounted(n,{value:e,modifiers:{trim:t,number:i}}){const s=e??"",r=n[Ba];delete n[Ba],r!==void 0&&(n.type==="text"||n.type==="textarea")&&n.value!==r?n[_s](Ol(n.value,t,i)):n.value=s},beforeUpdate(n,{value:e,oldValue:t,modifiers:{lazy:i,trim:s,number:r}},a){if(n[_s]=Ho(a),n.composing)return;const o=(r||n.type==="number")&&!/^0\d/.test(n.value)?il(n.value):n.value,l=e??"";if(o===l)return;const c=n.getRootNode();(c instanceof Document||c instanceof ShadowRoot)&&c.activeElement===n&&n.type!=="range"&&(i&&e===t||s&&n.value.trim()===l)||(n.value=l)}},Mn={deep:!0,created(n,{value:e,modifiers:{number:t}},i){n._modelValue=e,ms(n,"change",()=>{const s=Array.prototype.filter.call(n.options,l=>l.selected).map(l=>t?il($o(l)):$o(l)),r=n.multiple,a=r?ws(n._modelValue)?new Set(s):s:s[0],o=n._pendingValue=[r,r?We(a)?s.slice():s:a];try{n[_s](a)}finally{ol(()=>{n._pendingValue===o&&(n._pendingValue=void 0)})}}),n[_s]=Ho(i)},mounted(n,{value:e}){mh(n,e)},beforeUpdate(n,{value:e},t){n._modelValue=e,n[_s]=Ho(t)},updated(n,{value:e}){const t=n._pendingValue;n._pendingValue=void 0,(!t||t[0]!==n.multiple||!t0(e,t[1],t[0]))&&mh(n,e)}};function t0(n,e,t){if(!t||We(n))return Ki(n,e);if(ws(n)){if(n.size!==e.length)return!1;for(const i of e)if(!n.has(i))return!1;return!0}return!1}function mh(n,e){const t=n.multiple,i=We(e);if(!(t&&!i&&!ws(e))){for(let s=0,r=n.options.length;s<r;s++){const a=n.options[s],o=$o(a);if(t)if(i){const l=typeof o;l==="string"||l==="number"?a.selected=e.some(c=>String(c)===String(o)):a.selected=Kg(e,o)>-1}else a.selected=e.has(o);else if(Ki($o(a),e)){n.selectedIndex!==s&&(n.selectedIndex=s);return}}!t&&n.selectedIndex!==-1&&(n.selectedIndex=-1)}}function $o(n){return"_value"in n?n._value:n.value}const n0=["ctrl","shift","alt","meta"],i0={stop:n=>n.stopPropagation(),prevent:n=>n.preventDefault(),self:n=>n.target!==n.currentTarget,ctrl:n=>!n.ctrlKey,shift:n=>!n.shiftKey,alt:n=>!n.altKey,meta:n=>!n.metaKey,left:n=>"button"in n&&n.button!==0,middle:n=>"button"in n&&n.button!==1,right:n=>"button"in n&&n.button!==2,exact:(n,e)=>n0.some(t=>n[`${t}Key`]&&!e.includes(t))},rr=(n,e)=>{if(!n)return n;const t=n._withMods||(n._withMods={}),i=e.join(".");return t[i]||(t[i]=((s,...r)=>{for(let a=0;a<e.length;a++){const o=i0[e[a]];if(o&&o(s,e))return}return n(s,...r)}))},s0={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},r0=(n,e)=>{const t=n._withKeys||(n._withKeys={}),i=e.join(".");return t[i]||(t[i]=(s=>{if(!("key"in s))return;const r=ts(s.key);if(e.some(a=>a===r||s0[a]===r))return n(s)}))},a0=Jt({patchProp:Z_},U_);let gh;function o0(){return gh||(gh=p_(a0))}const l0=((...n)=>{const e=o0().createApp(...n),{mount:t}=e;return e.mount=i=>{const s=u0(i);if(!s)return;const r=e._component;!Ye(r)&&!r.render&&!r.template&&(r.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const a=t(s,!1,c0(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),a},e});function c0(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function u0(n){return Ct(n)?document.querySelector(n):n}/*!
 * pinia v2.3.1
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let fm;const pl=n=>fm=n,pm=Symbol();function zc(n){return n&&typeof n=="object"&&Object.prototype.toString.call(n)==="[object Object]"&&typeof n.toJSON!="function"}var na;(function(n){n.direct="direct",n.patchObject="patch object",n.patchFunction="patch function"})(na||(na={}));function d0(){const n=up(!0),e=n.run(()=>ze({}));let t=[],i=[];const s=qu({install(r){pl(s),s._a=r,r.provide(pm,s),r.config.globalProperties.$pinia=s,i.forEach(a=>t.push(a)),i=[]},use(r){return this._a?t.push(r):i.push(r),this},_p:t,_a:null,_e:n,_s:new Map,state:e});return s}const mm=()=>{};function vh(n,e,t,i=mm){n.push(e);const s=()=>{const r=n.indexOf(e);r>-1&&(n.splice(r,1),i())};return!t&&dp()&&Zg(s),s}function Os(n,...e){n.slice().forEach(t=>{t(...e)})}const h0=n=>n(),_h=Symbol(),Fl=Symbol();function Vc(n,e){n instanceof Map&&e instanceof Map?e.forEach((t,i)=>n.set(i,t)):n instanceof Set&&e instanceof Set&&e.forEach(n.add,n);for(const t in e){if(!e.hasOwnProperty(t))continue;const i=e[t],s=n[t];zc(s)&&zc(i)&&n.hasOwnProperty(t)&&!Ut(i)&&!Mi(i)?n[t]=Vc(s,i):n[t]=i}return n}const f0=Symbol();function p0(n){return!zc(n)||!n.hasOwnProperty(f0)}const{assign:Bi}=Object;function m0(n){return!!(Ut(n)&&n.effect)}function g0(n,e,t,i){const{state:s,actions:r,getters:a}=e,o=t.state.value[n];let l;function c(){o||(t.state.value[n]=s?s():{});const u=yv(t.state.value[n]);return Bi(u,r,Object.keys(a||{}).reduce((d,h)=>(d[h]=qu(Me(()=>{pl(t);const f=t._s.get(n);return a[h].call(f,f)})),d),{}))}return l=gm(n,c,e,t,i,!0),l}function gm(n,e,t={},i,s,r){let a;const o=Bi({actions:{}},t),l={deep:!0};let c,u,d=[],h=[],f;const b=i.state.value[n];!r&&!b&&(i.state.value[n]={});let x;function y(U){let M;c=u=!1,typeof U=="function"?(U(i.state.value[n]),M={type:na.patchFunction,storeId:n,events:f}):(Vc(i.state.value[n],U),M={type:na.patchObject,payload:U,storeId:n,events:f});const C=x=Symbol();ol().then(()=>{x===C&&(c=!0)}),u=!0,Os(d,M,i.state.value[n])}const g=r?function(){const{state:M}=t,C=M?M():{};this.$patch(F=>{Bi(F,C)})}:mm;function A(){a.stop(),d=[],h=[],i._s.delete(n)}const S=(U,M="")=>{if(_h in U)return U[Fl]=M,U;const C=function(){pl(i);const F=Array.from(arguments),G=[],B=[];function $(re){G.push(re)}function j(re){B.push(re)}Os(h,{args:F,name:C[Fl],store:w,after:$,onError:j});let Y;try{Y=U.apply(this&&this.$id===n?this:w,F)}catch(re){throw Os(B,re),re}return Y instanceof Promise?Y.then(re=>(Os(G,re),re)).catch(re=>(Os(B,re),Promise.reject(re))):(Os(G,Y),Y)};return C[_h]=!0,C[Fl]=M,C},m={_p:i,$id:n,$onAction:vh.bind(null,h),$patch:y,$reset:g,$subscribe(U,M={}){const C=vh(d,U,M.detached,()=>F()),F=a.run(()=>Bt(()=>i.state.value[n],G=>{(M.flush==="sync"?u:c)&&U({storeId:n,type:na.direct,events:f},G)},Bi({},l,M)));return C},$dispose:A},w=si(m);i._s.set(n,w);const R=(i._a&&i._a.runWithContext||h0)(()=>i._e.run(()=>(a=up()).run(()=>e({action:S}))));for(const U in R){const M=R[U];if(Ut(M)&&!m0(M)||Mi(M))r||(b&&p0(M)&&(Ut(M)?M.value=b[U]:Vc(M,b[U])),i.state.value[n][U]=M);else if(typeof M=="function"){const C=S(M,U);R[U]=C,o.actions[U]=M}}return Bi(w,R),Bi(dt(w),R),Object.defineProperty(w,"$state",{get:()=>i.state.value[n],set:U=>{y(M=>{Bi(M,U)})}}),i._p.forEach(U=>{Bi(w,a.run(()=>U({store:w,app:i._a,pinia:i,options:o})))}),b&&r&&t.hydrate&&t.hydrate(w.$state,b),c=!0,u=!0,w}/*! #__NO_SIDE_EFFECTS__ */function vm(n,e,t){let i,s;const r=typeof e=="function";typeof n=="string"?(i=n,s=r?t:e):(s=n,i=n.id);function a(o,l){const c=Cv();return o=o||(c?Un(pm,null):null),o&&pl(o),o=fm,o._s.has(i)||(r?gm(i,e,s,o):g0(i,s,o)),o._s.get(i)}return a.$id=i,a}const at=(n,e)=>{const t=n.__vccOpts||n;for(const[i,s]of e)t[i]=s;return t},v0={};function _0(n,e){const t=fa("RouterView");return Z(),bt(t)}const y0=at(v0,[["render",_0]]);/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */const nr=typeof document<"u";function _m(n){return typeof n=="object"||"displayName"in n||"props"in n||"__vccOpts"in n}function b0(n){return n.__esModule||n[Symbol.toStringTag]==="Module"||n.default&&_m(n.default)}const mt=Object.assign;function kl(n,e){const t={};for(const i in e){const s=e[i];t[i]=jn(s)?s.map(n):n(s)}return t}const ia=()=>{},jn=Array.isArray;function yh(n,e){const t={};for(const i in n)t[i]=i in e?e[i]:n[i];return t}const ym=/#/g,x0=/&/g,S0=/\//g,M0=/=/g,E0=/\?/g,bm=/\+/g,w0=/%5B/g,A0=/%5D/g,xm=/%5E/g,T0=/%60/g,Sm=/%7B/g,R0=/%7C/g,Mm=/%7D/g,C0=/%20/g;function td(n){return n==null?"":encodeURI(""+n).replace(R0,"|").replace(w0,"[").replace(A0,"]")}function P0(n){return td(n).replace(Sm,"{").replace(Mm,"}").replace(xm,"^")}function Hc(n){return td(n).replace(bm,"%2B").replace(C0,"+").replace(ym,"%23").replace(x0,"%26").replace(T0,"`").replace(Sm,"{").replace(Mm,"}").replace(xm,"^")}function I0(n){return Hc(n).replace(M0,"%3D")}function D0(n){return td(n).replace(ym,"%23").replace(E0,"%3F")}function L0(n){return D0(n).replace(S0,"%2F")}function _a(n){if(n==null)return null;try{return decodeURIComponent(""+n)}catch{}return""+n}const U0=/\/$/,N0=n=>n.replace(U0,"");function Bl(n,e,t="/"){let i,s={},r="",a="";const o=e.indexOf("#");let l=e.indexOf("?");return l=o>=0&&l>o?-1:l,l>=0&&(i=e.slice(0,l),r=e.slice(l,o>0?o:e.length),s=n(r.slice(1))),o>=0&&(i=i||e.slice(0,o),a=e.slice(o,e.length)),i=B0(i??e,t),{fullPath:i+r+a,path:i,query:s,hash:_a(a)}}function O0(n,e){const t=e.query?n(e.query):"";return e.path+(t&&"?")+t+(e.hash||"")}function bh(n,e){return!e||!n.toLowerCase().startsWith(e.toLowerCase())?n:n.slice(e.length)||"/"}function F0(n,e,t){const i=e.matched.length-1,s=t.matched.length-1;return i>-1&&i===s&&yr(e.matched[i],t.matched[s])&&Em(e.params,t.params)&&n(e.query)===n(t.query)&&e.hash===t.hash}function yr(n,e){return(n.aliasOf||n)===(e.aliasOf||e)}function Em(n,e){if(Object.keys(n).length!==Object.keys(e).length)return!1;for(var t in n)if(!k0(n[t],e[t]))return!1;return!0}function k0(n,e){return jn(n)?xh(n,e):jn(e)?xh(e,n):(n==null?void 0:n.valueOf())===(e==null?void 0:e.valueOf())}function xh(n,e){return jn(e)?n.length===e.length&&n.every((t,i)=>t===e[i]):n.length===1&&n[0]===e}function B0(n,e){if(n.startsWith("/"))return n;if(!n)return e;const t=e.split("/"),i=n.split("/"),s=i[i.length-1];(s===".."||s===".")&&i.push("");let r=t.length-1,a,o;for(a=0;a<i.length;a++)if(o=i[a],o!==".")if(o==="..")r>1&&r--;else break;return t.slice(0,r).join("/")+"/"+i.slice(a).join("/")}const Di={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};let $c=(function(n){return n.pop="pop",n.push="push",n})({}),zl=(function(n){return n.back="back",n.forward="forward",n.unknown="",n})({});function z0(n){if(!n)if(nr){const e=document.querySelector("base");n=e&&e.getAttribute("href")||"/",n=n.replace(/^\w+:\/\/[^\/]+/,"")}else n="/";return n[0]!=="/"&&n[0]!=="#"&&(n="/"+n),N0(n)}const V0=/^[^#]+#/;function H0(n,e){return n.replace(V0,"#")+e}function $0(n,e){const t=document.documentElement.getBoundingClientRect(),i=n.getBoundingClientRect();return{behavior:e.behavior,left:i.left-t.left-(e.left||0),top:i.top-t.top-(e.top||0)}}const ml=()=>({left:window.scrollX,top:window.scrollY});function G0(n){let e;if("el"in n){const t=n.el,i=typeof t=="string"&&t.startsWith("#"),s=typeof t=="string"?i?document.getElementById(t.slice(1)):document.querySelector(t):t;if(!s)return;e=$0(s,n)}else e=n;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Sh(n,e){return(history.state?history.state.position-e:-1)+n}const Gc=new Map;function W0(n,e){Gc.set(n,e)}function X0(n){const e=Gc.get(n);return Gc.delete(n),e}function q0(n){return typeof n=="string"||n&&typeof n=="object"}function wm(n){return typeof n=="string"||typeof n=="symbol"}let Dt=(function(n){return n[n.MATCHER_NOT_FOUND=1]="MATCHER_NOT_FOUND",n[n.NAVIGATION_GUARD_REDIRECT=2]="NAVIGATION_GUARD_REDIRECT",n[n.NAVIGATION_ABORTED=4]="NAVIGATION_ABORTED",n[n.NAVIGATION_CANCELLED=8]="NAVIGATION_CANCELLED",n[n.NAVIGATION_DUPLICATED=16]="NAVIGATION_DUPLICATED",n})({});const Am=Symbol("");Dt.MATCHER_NOT_FOUND+"",Dt.NAVIGATION_GUARD_REDIRECT+"",Dt.NAVIGATION_ABORTED+"",Dt.NAVIGATION_CANCELLED+"",Dt.NAVIGATION_DUPLICATED+"";function br(n,e){return mt(new Error,{type:n,[Am]:!0},e)}function ui(n,e){return n instanceof Error&&Am in n&&(e==null||!!(n.type&e))}const Y0=["params","query","hash"];function j0(n){if(typeof n=="string")return n;if(n.path!=null)return n.path;const e={};for(const t of Y0)t in n&&(e[t]=n[t]);return JSON.stringify(e,null,2)}function K0(n){const e={};if(n===""||n==="?")return e;const t=(n[0]==="?"?n.slice(1):n).split("&");for(let i=0;i<t.length;++i){const s=t[i].replace(bm," "),r=s.indexOf("="),a=_a(r<0?s:s.slice(0,r)),o=r<0?null:_a(s.slice(r+1));if(a in e){let l=e[a];jn(l)||(l=e[a]=[l]),l.push(o)}else e[a]=o}return e}function Mh(n){let e="";for(let t in n){const i=n[t];if(t=I0(t),i==null){i!==void 0&&(e+=(e.length?"&":"")+t);continue}(jn(i)?i.map(s=>s&&Hc(s)):[i&&Hc(i)]).forEach(s=>{s!==void 0&&(e+=(e.length?"&":"")+t,s!=null&&(e+="="+s))})}return e}function Z0(n){const e={};for(const t in n){const i=n[t];i!==void 0&&(e[t]=jn(i)?i.map(s=>s==null?null:""+s):i==null?i:""+i)}return e}const J0=Symbol(""),Eh=Symbol(""),gl=Symbol(""),nd=Symbol(""),Wc=Symbol("");function kr(){let n=[];function e(i){return n.push(i),()=>{const s=n.indexOf(i);s>-1&&n.splice(s,1)}}function t(){n=[]}return{add:e,list:()=>n.slice(),reset:t}}function Vi(n,e,t,i,s,r=a=>a()){const a=i&&(i.enterCallbacks[s]=i.enterCallbacks[s]||[]);return()=>new Promise((o,l)=>{const c=h=>{h===!1?l(br(Dt.NAVIGATION_ABORTED,{from:t,to:e})):h instanceof Error?l(h):q0(h)?l(br(Dt.NAVIGATION_GUARD_REDIRECT,{from:e,to:h})):(a&&i.enterCallbacks[s]===a&&typeof h=="function"&&a.push(h),o())},u=r(()=>n.call(i&&i.instances[s],e,t,c));let d=Promise.resolve(u);n.length<3&&(d=d.then(c)),d.catch(h=>l(h))})}function Vl(n,e,t,i,s=r=>r()){const r=[];for(const a of n)for(const o in a.components){let l=a.components[o];if(!(e!=="beforeRouteEnter"&&!a.instances[o]))if(_m(l)){const c=(l.__vccOpts||l)[e];c&&r.push(Vi(c,t,i,a,o,s))}else{let c=l();r.push(()=>c.then(u=>{if(!u)throw new Error(`Couldn't resolve component "${o}" at "${a.path}"`);const d=b0(u)?u.default:u;a.mods[o]=u,a.components[o]=d;const h=(d.__vccOpts||d)[e];return h&&Vi(h,t,i,a,o,s)()}))}}return r}function Q0(n,e){const t=[],i=[],s=[],r=Math.max(e.matched.length,n.matched.length);for(let a=0;a<r;a++){const o=e.matched[a];o&&(n.matched.find(c=>yr(c,o))?i.push(o):t.push(o));const l=n.matched[a];l&&(e.matched.find(c=>yr(c,l))||s.push(l))}return[t,i,s]}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let ey=()=>location.protocol+"//"+location.host;function Tm(n,e){const{pathname:t,search:i,hash:s}=e,r=n.indexOf("#");if(r>-1){let a=s.includes(n.slice(r))?n.slice(r).length:1,o=s.slice(a);return o[0]!=="/"&&(o="/"+o),bh(o,"")}return bh(t,n)+i+s}function ty(n,e,t,i){let s=[],r=[],a=null;const o=({state:h})=>{const f=Tm(n,location),b=t.value,x=e.value;let y=0;if(h){if(t.value=f,e.value=h,a&&a===b){a=null;return}y=x?h.position-x.position:0}else i(f);s.forEach(g=>{g(t.value,b,{delta:y,type:$c.pop,direction:y?y>0?zl.forward:zl.back:zl.unknown})})};function l(){a=t.value}function c(h){s.push(h);const f=()=>{const b=s.indexOf(h);b>-1&&s.splice(b,1)};return r.push(f),f}function u(){if(document.visibilityState==="hidden"){const{history:h}=window;if(!h.state)return;h.replaceState(mt({},h.state,{scroll:ml()}),"")}}function d(){for(const h of r)h();r=[],window.removeEventListener("popstate",o),window.removeEventListener("pagehide",u),document.removeEventListener("visibilitychange",u)}return window.addEventListener("popstate",o),window.addEventListener("pagehide",u),document.addEventListener("visibilitychange",u),{pauseListeners:l,listen:c,destroy:d}}function wh(n,e,t,i=!1,s=!1){return{back:n,current:e,forward:t,replaced:i,position:window.history.length,scroll:s?ml():null}}function ny(n){const{history:e,location:t}=window,i={value:Tm(n,t)},s={value:e.state};s.value||r(i.value,{back:null,current:i.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function r(l,c,u){const d=n.indexOf("#"),h=d>-1?(t.host&&document.querySelector("base")?n:n.slice(d))+l:ey()+n+l;try{e[u?"replaceState":"pushState"](c,"",h),s.value=c}catch(f){console.error(f),t[u?"replace":"assign"](h)}}function a(l,c){r(l,mt({},e.state,wh(s.value.back,l,s.value.forward,!0),c,{position:s.value.position}),!0),i.value=l}function o(l,c){const u=mt({},s.value,e.state,{forward:l,scroll:ml()});r(u.current,u,!0),r(l,mt({},wh(i.value,l,null),{position:u.position+1},c),!1),i.value=l}return{location:i,state:s,push:o,replace:a}}function iy(n){n=z0(n);const e=ny(n),t=ty(n,e.state,e.location,e.replace);function i(r,a=!0){a||t.pauseListeners(),history.go(r)}const s=mt({location:"",base:n,go:i,createHref:H0.bind(null,n)},e,t);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}let ys=(function(n){return n[n.Static=0]="Static",n[n.Param=1]="Param",n[n.Group=2]="Group",n})({});var Vt=(function(n){return n[n.Static=0]="Static",n[n.Param=1]="Param",n[n.ParamRegExp=2]="ParamRegExp",n[n.ParamRegExpEnd=3]="ParamRegExpEnd",n[n.EscapeNext=4]="EscapeNext",n})(Vt||{});const sy={type:ys.Static,value:""},ry=/[a-zA-Z0-9_]/;function ay(n){if(!n)return[[]];if(n==="/")return[[sy]];if(!n.startsWith("/"))throw new Error(`Invalid path "${n}"`);function e(f){throw new Error(`ERR (${t})/"${c}": ${f}`)}let t=Vt.Static,i=t;const s=[];let r;function a(){r&&s.push(r),r=[]}let o=0,l,c="",u="";function d(){c&&(t===Vt.Static?r.push({type:ys.Static,value:c}):t===Vt.Param||t===Vt.ParamRegExp||t===Vt.ParamRegExpEnd?(r.length>1&&(l==="*"||l==="+")&&e(`A repeatable param (${c}) must be alone in its segment. eg: '/:ids+.`),r.push({type:ys.Param,value:c,regexp:u,repeatable:l==="*"||l==="+",optional:l==="*"||l==="?"})):e("Invalid state to consume buffer"),c="")}function h(){c+=l}for(;o<n.length;){if(l=n[o++],l==="\\"&&t!==Vt.ParamRegExp){i=t,t=Vt.EscapeNext;continue}switch(t){case Vt.Static:l==="/"?(c&&d(),a()):l===":"?(d(),t=Vt.Param):h();break;case Vt.EscapeNext:h(),t=i;break;case Vt.Param:l==="("?t=Vt.ParamRegExp:ry.test(l)?h():(d(),t=Vt.Static,l!=="*"&&l!=="?"&&l!=="+"&&o--);break;case Vt.ParamRegExp:l===")"?u[u.length-1]=="\\"?u=u.slice(0,-1)+l:t=Vt.ParamRegExpEnd:u+=l;break;case Vt.ParamRegExpEnd:d(),t=Vt.Static,l!=="*"&&l!=="?"&&l!=="+"&&o--,u="";break;default:e("Unknown state");break}}return t===Vt.ParamRegExp&&e(`Unfinished custom RegExp for param "${c}"`),d(),a(),s}const Ah="[^/]+?",oy={sensitive:!1,strict:!1,start:!0,end:!0};var cn=(function(n){return n[n._multiplier=10]="_multiplier",n[n.Root=90]="Root",n[n.Segment=40]="Segment",n[n.SubSegment=30]="SubSegment",n[n.Static=40]="Static",n[n.Dynamic=20]="Dynamic",n[n.BonusCustomRegExp=10]="BonusCustomRegExp",n[n.BonusWildcard=-50]="BonusWildcard",n[n.BonusRepeatable=-20]="BonusRepeatable",n[n.BonusOptional=-8]="BonusOptional",n[n.BonusStrict=.7000000000000001]="BonusStrict",n[n.BonusCaseSensitive=.25]="BonusCaseSensitive",n})(cn||{});const ly=/[.+*?^${}()[\]/\\]/g;function cy(n,e){const t=mt({},oy,e),i=[];let s=t.start?"^":"";const r=[];for(const c of n){const u=c.length?[]:[cn.Root];t.strict&&!c.length&&(s+="/");for(let d=0;d<c.length;d++){const h=c[d];let f=cn.Segment+(t.sensitive?cn.BonusCaseSensitive:0);if(h.type===ys.Static)d||(s+="/"),s+=h.value.replace(ly,"\\$&"),f+=cn.Static;else if(h.type===ys.Param){const{value:b,repeatable:x,optional:y,regexp:g}=h;r.push({name:b,repeatable:x,optional:y});const A=g||Ah;if(A!==Ah){f+=cn.BonusCustomRegExp;try{`${A}`}catch(m){throw new Error(`Invalid custom RegExp for param "${b}" (${A}): `+m.message)}}let S=x?`((?:${A})(?:/(?:${A}))*)`:`(${A})`;d||(S=y&&c.length<2?`(?:/${S})`:"/"+S),y&&(S+="?"),s+=S,f+=cn.Dynamic,y&&(f+=cn.BonusOptional),x&&(f+=cn.BonusRepeatable),A===".*"&&(f+=cn.BonusWildcard)}u.push(f)}i.push(u)}if(t.strict&&t.end){const c=i.length-1;i[c][i[c].length-1]+=cn.BonusStrict}t.strict||(s+="/?"),t.end?s+="$":t.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const a=new RegExp(s,t.sensitive?"":"i");function o(c){const u=c.match(a),d={};if(!u)return null;for(let h=1;h<u.length;h++){const f=u[h]||"",b=r[h-1];d[b.name]=f&&b.repeatable?f.split("/"):f}return d}function l(c){let u="",d=!1;for(const h of n){(!d||!u.endsWith("/"))&&(u+="/"),d=!1;for(const f of h)if(f.type===ys.Static)u+=f.value;else if(f.type===ys.Param){const{value:b,repeatable:x,optional:y}=f,g=b in c?c[b]:"";if(jn(g)&&!x)throw new Error(`Provided param "${b}" is an array but it is not repeatable (* or + modifiers)`);const A=jn(g)?g.join("/"):g;if(!A)if(y)h.length<2&&(u.endsWith("/")?u=u.slice(0,-1):d=!0);else throw new Error(`Missing required param "${b}"`);u+=A}}return u||"/"}return{re:a,score:i,keys:r,parse:o,stringify:l}}function uy(n,e){let t=0;for(;t<n.length&&t<e.length;){const i=e[t]-n[t];if(i)return i;t++}return n.length<e.length?n.length===1&&n[0]===cn.Static+cn.Segment?-1:1:n.length>e.length?e.length===1&&e[0]===cn.Static+cn.Segment?1:-1:0}function Rm(n,e){let t=0;const i=n.score,s=e.score;for(;t<i.length&&t<s.length;){const r=uy(i[t],s[t]);if(r)return r;t++}if(Math.abs(s.length-i.length)===1){if(Th(i))return 1;if(Th(s))return-1}return s.length-i.length}function Th(n){const e=n[n.length-1];return n.length>0&&e[e.length-1]<0}const dy={strict:!1,end:!0,sensitive:!1};function hy(n,e,t){const i=cy(ay(n.path),t),s=mt(i,{record:n,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function fy(n,e){const t=[],i=new Map;e=yh(dy,e);function s(d){return i.get(d)}function r(d,h,f){const b=!f,x=Ch(d);x.aliasOf=f&&f.record;const y=yh(e,d),g=[x];if("alias"in d){const m=typeof d.alias=="string"?[d.alias]:d.alias;for(const w of m)g.push(Ch(mt({},x,{components:f?f.record.components:x.components,path:w,aliasOf:f?f.record:x})))}let A,S;for(const m of g){const{path:w}=m;if(h&&w[0]!=="/"){const T=h.record.path,R=T[T.length-1]==="/"?"":"/";m.path=h.record.path+(w&&R+w)}if(A=hy(m,h,y),f?f.alias.push(A):(S=S||A,S!==A&&S.alias.push(A),b&&d.name&&!Ph(A)&&a(d.name)),Cm(A)&&l(A),x.children){const T=x.children;for(let R=0;R<T.length;R++)r(T[R],A,f&&f.children[R])}f=f||A}return S?()=>{a(S)}:ia}function a(d){if(wm(d)){const h=i.get(d);h&&(i.delete(d),t.splice(t.indexOf(h),1),h.children.forEach(a),h.alias.forEach(a))}else{const h=t.indexOf(d);h>-1&&(t.splice(h,1),d.record.name&&i.delete(d.record.name),d.children.forEach(a),d.alias.forEach(a))}}function o(){return t}function l(d){const h=gy(d,t);t.splice(h,0,d),d.record.name&&!Ph(d)&&i.set(d.record.name,d)}function c(d,h){let f,b={},x,y;if("name"in d&&d.name){if(f=i.get(d.name),!f)throw br(Dt.MATCHER_NOT_FOUND,{location:d});y=f.record.name,b=mt(Rh(h.params,f.keys.filter(S=>!S.optional).concat(f.parent?f.parent.keys.filter(S=>S.optional):[]).map(S=>S.name)),d.params&&Rh(d.params,f.keys.map(S=>S.name))),x=f.stringify(b)}else if(d.path!=null)x=d.path,f=t.find(S=>S.re.test(x)),f&&(b=f.parse(x),y=f.record.name);else{if(f=h.name?i.get(h.name):t.find(S=>S.re.test(h.path)),!f)throw br(Dt.MATCHER_NOT_FOUND,{location:d,currentLocation:h});y=f.record.name,b=mt({},h.params,d.params),x=f.stringify(b)}const g=[];let A=f;for(;A;)g.unshift(A.record),A=A.parent;return{name:y,path:x,params:b,matched:g,meta:my(g)}}n.forEach(d=>r(d));function u(){t.length=0,i.clear()}return{addRoute:r,resolve:c,removeRoute:a,clearRoutes:u,getRoutes:o,getRecordMatcher:s}}function Rh(n,e){const t={};for(const i of e)i in n&&(t[i]=n[i]);return t}function Ch(n){const e={path:n.path,redirect:n.redirect,name:n.name,meta:n.meta||{},aliasOf:n.aliasOf,beforeEnter:n.beforeEnter,props:py(n),children:n.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in n?n.components||null:n.component&&{default:n.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function py(n){const e={},t=n.props||!1;if("component"in n)e.default=t;else for(const i in n.components)e[i]=typeof t=="object"?t[i]:t;return e}function Ph(n){for(;n;){if(n.record.aliasOf)return!0;n=n.parent}return!1}function my(n){return n.reduce((e,t)=>mt(e,t.meta),{})}function gy(n,e){let t=0,i=e.length;for(;t!==i;){const r=t+i>>1;Rm(n,e[r])<0?i=r:t=r+1}const s=vy(n);return s&&(i=e.lastIndexOf(s,i-1)),i}function vy(n){let e=n;for(;e=e.parent;)if(Cm(e)&&Rm(n,e)===0)return e}function Cm({record:n}){return!!(n.name||n.components&&Object.keys(n.components).length||n.redirect)}function Ih(n){const e=Un(gl),t=Un(nd),i=Me(()=>{const l=J(n.to);return e.resolve(l)}),s=Me(()=>{const{matched:l}=i.value,{length:c}=l,u=l[c-1],d=t.matched;if(!u||!d.length)return-1;const h=d.findIndex(yr.bind(null,u));if(h>-1)return h;const f=Dh(l[c-2]);return c>1&&Dh(u)===f&&d[d.length-1].path!==f?d.findIndex(yr.bind(null,l[c-2])):h}),r=Me(()=>s.value>-1&&Sy(t.params,i.value.params)),a=Me(()=>s.value>-1&&s.value===t.matched.length-1&&Em(t.params,i.value.params));function o(l={}){if(xy(l)){const c=e[J(n.replace)?"replace":"push"](J(n.to)).catch(ia);return n.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>c),c}return Promise.resolve()}return{route:i,href:Me(()=>i.value.href),isActive:r,isExactActive:a,navigate:o}}function _y(n){return n.length===1?n[0]:n}const yy=it({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:Ih,setup(n,{slots:e}){const t=si(Ih(n)),{options:i}=Un(gl),s=Me(()=>({[Lh(n.activeClass,i.linkActiveClass,"router-link-active")]:t.isActive,[Lh(n.exactActiveClass,i.linkExactActiveClass,"router-link-exact-active")]:t.isExactActive}));return()=>{const r=e.default&&_y(e.default(t));return n.custom?r:va("a",{"aria-current":t.isExactActive?n.ariaCurrentValue:null,href:t.href,onClick:t.navigate,class:s.value},r)}}}),by=yy;function xy(n){if(!(n.metaKey||n.altKey||n.ctrlKey||n.shiftKey)&&!n.defaultPrevented&&!(n.button!==void 0&&n.button!==0)){if(n.currentTarget&&n.currentTarget.getAttribute){const e=n.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return n.preventDefault&&n.preventDefault(),!0}}function Sy(n,e){for(const t in e){const i=e[t],s=n[t];if(typeof i=="string"){if(i!==s)return!1}else if(!jn(s)||s.length!==i.length||i.some((r,a)=>r.valueOf()!==s[a].valueOf()))return!1}return!0}function Dh(n){return n?n.aliasOf?n.aliasOf.path:n.path:""}const Lh=(n,e,t)=>n??e??t,My=it({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(n,{attrs:e,slots:t}){const i=Un(Wc),s=Me(()=>n.route||i.value),r=Un(Eh,0),a=Me(()=>{let c=J(r);const{matched:u}=s.value;let d;for(;(d=u[c])&&!d.components;)c++;return c}),o=Me(()=>s.value.matched[a.value]);Eo(Eh,Me(()=>a.value+1)),Eo(J0,o),Eo(Wc,s);const l=ze();return Bt(()=>[l.value,o.value,n.name],([c,u,d],[h,f,b])=>{u&&(u.instances[d]=c,f&&f!==u&&c&&c===h&&(u.leaveGuards.size||(u.leaveGuards=f.leaveGuards),u.updateGuards.size||(u.updateGuards=f.updateGuards))),c&&u&&(!f||!yr(u,f)||!h)&&(u.enterCallbacks[d]||[]).forEach(x=>x(c))},{flush:"post"}),()=>{const c=s.value,u=n.name,d=o.value,h=d&&d.components[u];if(!h)return Uh(t.default,{Component:h,route:c});const f=d.props[u],b=f?f===!0?c.params:typeof f=="function"?f(c):f:null,y=va(h,mt({},b,e,{onVnodeUnmounted:g=>{g.component.isUnmounted&&(d.instances[u]=null)},ref:l}));return Uh(t.default,{Component:y,route:c})||y}}});function Uh(n,e){if(!n)return null;const t=n(e);return t.length===1?t[0]:t}const Ey=My;function wy(n){const e=fy(n.routes,n),t=n.parseQuery||K0,i=n.stringifyQuery||Mh,s=n.history,r=kr(),a=kr(),o=kr(),l=gv(Di);let c=Di;nr&&n.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const u=kl.bind(null,H=>""+H),d=kl.bind(null,L0),h=kl.bind(null,_a);function f(H,me){let he,ye;return wm(H)?(he=e.getRecordMatcher(H),ye=me):ye=H,e.addRoute(ye,he)}function b(H){const me=e.getRecordMatcher(H);me&&e.removeRoute(me)}function x(){return e.getRoutes().map(H=>H.record)}function y(H){return!!e.getRecordMatcher(H)}function g(H,me){if(me=mt({},me||l.value),typeof H=="string"){const I=Bl(t,H,me.path),le=e.resolve({path:I.path},me),ie=s.createHref(I.fullPath);return mt(I,le,{params:h(le.params),hash:_a(I.hash),redirectedFrom:void 0,href:ie})}let he;if(H.path!=null)he=mt({},H,{path:Bl(t,H.path,me.path).path});else{const I=mt({},H.params);for(const le in I)I[le]==null&&delete I[le];he=mt({},H,{params:d(I)}),me.params=d(me.params)}const ye=e.resolve(he,me),Be=H.hash||"";ye.params=u(h(ye.params));const O=O0(i,mt({},H,{hash:P0(Be),path:ye.path})),z=s.createHref(O);return mt({fullPath:O,hash:Be,query:i===Mh?Z0(H.query):H.query||{}},ye,{redirectedFrom:void 0,href:z})}function A(H){return typeof H=="string"?Bl(t,H,l.value.path):mt({},H)}function S(H,me){if(c!==H)return br(Dt.NAVIGATION_CANCELLED,{from:me,to:H})}function m(H){return R(H)}function w(H){return m(mt(A(H),{replace:!0}))}function T(H,me){const he=H.matched[H.matched.length-1];if(he&&he.redirect){const{redirect:ye}=he;let Be=typeof ye=="function"?ye(H,me):ye;return typeof Be=="string"&&(Be=Be.includes("?")||Be.includes("#")?Be=A(Be):{path:Be},Be.params={}),mt({query:H.query,hash:H.hash,params:Be.path!=null?{}:H.params},Be)}}function R(H,me){const he=c=g(H),ye=l.value,Be=H.state,O=H.force,z=H.replace===!0,I=T(he,ye);if(I)return R(mt(A(I),{state:typeof I=="object"?mt({},Be,I.state):Be,force:O,replace:z}),me||he);const le=he;le.redirectedFrom=me;let ie;return!O&&F0(i,ye,he)&&(ie=br(Dt.NAVIGATION_DUPLICATED,{to:le,from:ye}),De(ye,ye,!0,!1)),(ie?Promise.resolve(ie):C(le,ye)).catch(Q=>ui(Q)?ui(Q,Dt.NAVIGATION_GUARD_REDIRECT)?Q:Re(Q):K(Q,le,ye)).then(Q=>{if(Q){if(ui(Q,Dt.NAVIGATION_GUARD_REDIRECT))return R(mt({replace:z},A(Q.to),{state:typeof Q.to=="object"?mt({},Be,Q.to.state):Be,force:O}),me||le)}else Q=G(le,ye,!0,z,Be);return F(le,ye,Q),Q})}function U(H,me){const he=S(H,me);return he?Promise.reject(he):Promise.resolve()}function M(H){const me=fe.values().next().value;return me&&typeof me.runWithContext=="function"?me.runWithContext(H):H()}function C(H,me){let he;const[ye,Be,O]=Q0(H,me);he=Vl(ye.reverse(),"beforeRouteLeave",H,me);for(const I of ye)I.leaveGuards.forEach(le=>{he.push(Vi(le,H,me))});const z=U.bind(null,H,me);return he.push(z),Te(he).then(()=>{he=[];for(const I of r.list())he.push(Vi(I,H,me));return he.push(z),Te(he)}).then(()=>{he=Vl(Be,"beforeRouteUpdate",H,me);for(const I of Be)I.updateGuards.forEach(le=>{he.push(Vi(le,H,me))});return he.push(z),Te(he)}).then(()=>{he=[];for(const I of O)if(I.beforeEnter)if(jn(I.beforeEnter))for(const le of I.beforeEnter)he.push(Vi(le,H,me));else he.push(Vi(I.beforeEnter,H,me));return he.push(z),Te(he)}).then(()=>(H.matched.forEach(I=>I.enterCallbacks={}),he=Vl(O,"beforeRouteEnter",H,me,M),he.push(z),Te(he))).then(()=>{he=[];for(const I of a.list())he.push(Vi(I,H,me));return he.push(z),Te(he)}).catch(I=>ui(I,Dt.NAVIGATION_CANCELLED)?I:Promise.reject(I))}function F(H,me,he){o.list().forEach(ye=>M(()=>ye(H,me,he)))}function G(H,me,he,ye,Be){const O=S(H,me);if(O)return O;const z=me===Di,I=nr?history.state:{};he&&(ye||z?s.replace(H.fullPath,mt({scroll:z&&I&&I.scroll},Be)):s.push(H.fullPath,Be)),l.value=H,De(H,me,he,z),Re()}let B;function $(){B||(B=s.listen((H,me,he)=>{if(!xe.listening)return;const ye=g(H),Be=T(ye,xe.currentRoute.value);if(Be){R(mt(Be,{replace:!0,force:!0}),ye).catch(ia);return}c=ye;const O=l.value;nr&&W0(Sh(O.fullPath,he.delta),ml()),C(ye,O).catch(z=>ui(z,Dt.NAVIGATION_ABORTED|Dt.NAVIGATION_CANCELLED)?z:ui(z,Dt.NAVIGATION_GUARD_REDIRECT)?(R(mt(A(z.to),{force:!0}),ye).then(I=>{ui(I,Dt.NAVIGATION_ABORTED|Dt.NAVIGATION_DUPLICATED)&&!he.delta&&he.type===$c.pop&&s.go(-1,!1)}).catch(ia),Promise.reject()):(he.delta&&s.go(-he.delta,!1),K(z,ye,O))).then(z=>{z=z||G(ye,O,!1),z&&(he.delta&&!ui(z,Dt.NAVIGATION_CANCELLED)?s.go(-he.delta,!1):he.type===$c.pop&&ui(z,Dt.NAVIGATION_ABORTED|Dt.NAVIGATION_DUPLICATED)&&s.go(-1,!1)),F(ye,O,z)}).catch(ia)}))}let j=kr(),Y=kr(),re;function K(H,me,he){Re(H);const ye=Y.list();return ye.length?ye.forEach(Be=>Be(H,me,he)):console.error(H),Promise.reject(H)}function Se(){return re&&l.value!==Di?Promise.resolve():new Promise((H,me)=>{j.add([H,me])})}function Re(H){return re||(re=!H,$(),j.list().forEach(([me,he])=>H?he(H):me()),j.reset()),H}function De(H,me,he,ye){const{scrollBehavior:Be}=n;if(!nr||!Be)return Promise.resolve();const O=!he&&X0(Sh(H.fullPath,0))||(ye||!he)&&history.state&&history.state.scroll||null;return ol().then(()=>Be(H,me,O)).then(z=>z&&G0(z)).catch(z=>K(z,H,me))}const Ve=H=>s.go(H);let st;const fe=new Set,xe={currentRoute:l,listening:!0,addRoute:f,removeRoute:b,clearRoutes:e.clearRoutes,hasRoute:y,getRoutes:x,resolve:g,options:n,push:m,replace:w,go:Ve,back:()=>Ve(-1),forward:()=>Ve(1),beforeEach:r.add,beforeResolve:a.add,afterEach:o.add,onError:Y.add,isReady:Se,install(H){H.component("RouterLink",by),H.component("RouterView",Ey),H.config.globalProperties.$router=xe,Object.defineProperty(H.config.globalProperties,"$route",{enumerable:!0,get:()=>J(l)}),nr&&!st&&l.value===Di&&(st=!0,m(s.location).catch(ye=>{}));const me={};for(const ye in Di)Object.defineProperty(me,ye,{get:()=>l.value[ye],enumerable:!0});H.provide(gl,xe),H.provide(nd,Ap(me)),H.provide(Wc,l);const he=H.unmount;fe.add(H),H.unmount=function(){fe.delete(H),fe.size<1&&(c=Di,B&&B(),B=null,l.value=Di,st=!1,re=!1),he()}}};function Te(H){return H.reduce((me,he)=>me.then(()=>M(he)),Promise.resolve())}return xe}function Rn(){return Un(gl)}function Ps(n){return Un(nd)}const Hl={id:"D-1008",name:"Dr. Zhang Wei",title:"Radiologist"},Pm=[{id:"P20260021",name:"Zhang San",age:58,gender:"Male",phone:"+86 138 0000 2101",email:"zhang.san@example.com",bloodType:"A",rhType:"Positive",allergies:["Penicillin"],risk:"High",status:"Pending Review",lastExamDate:"2026-09-01",modality:"CT",organ:"Lung",aiStatus:"AI Completed",avatarColor:"#317e82"},{id:"P20260037",name:"Li Wei",age:46,gender:"Female",phone:"+86 139 0000 3702",email:"li.wei@example.com",bloodType:"O",rhType:"Positive",allergies:[],risk:"Medium",status:"Reviewed",lastExamDate:"2026-08-28",modality:"CT",organ:"Lung",aiStatus:"Reviewed",avatarColor:"#5c6f9c"},{id:"P20260044",name:"Wang Fang",age:62,gender:"Male",phone:"+86 137 0000 4403",email:"wang.fang@example.com",bloodType:"B",rhType:"Positive",allergies:["Iodine contrast"],risk:"High",status:"Abnormal",lastExamDate:"2026-09-02",modality:"MRI",organ:"Brain",aiStatus:"Abnormal",avatarColor:"#8b5f78"},{id:"P20260058",name:"Chen Yu",age:35,gender:"Female",phone:"+86 136 0000 5804",email:"chen.yu@example.com",bloodType:"AB",rhType:"Positive",allergies:[],risk:"Low",status:"Completed",lastExamDate:"2026-08-20",modality:"X-Ray",organ:"Chest",aiStatus:"Completed",avatarColor:"#4b7f6b"},{id:"P20260069",name:"Liu Min",age:71,gender:"Male",phone:"+86 135 0000 6905",email:"liu.min@example.com",bloodType:"O",rhType:"Negative",allergies:["Sulfa drugs"],risk:"High",status:"Reviewed",lastExamDate:"2026-08-31",modality:"CT",organ:"Lung",aiStatus:"Reviewed",avatarColor:"#756b9a"}],Xc=[{id:"E20260901",patientId:"P20260021",type:"CT",organ:"Lung",bodyPart:"Chest",date:"2026-09-01",status:"Pending Review",description:"Low-dose chest CT, 1.0 mm axial reconstruction.",sliceCount:12},{id:"E20260710",patientId:"P20260021",type:"MRI",organ:"Brain",bodyPart:"Head",date:"2026-07-10",status:"Reviewed",description:"Brain MRI without contrast.",sliceCount:10},{id:"E20260402",patientId:"P20260021",type:"X-Ray",organ:"Chest",bodyPart:"Chest",date:"2026-04-02",status:"Completed",description:"Posteroanterior chest radiograph.",sliceCount:1},{id:"E20260828",patientId:"P20260037",type:"CT",organ:"Lung",bodyPart:"Chest",date:"2026-08-28",status:"Reviewed",description:"Low-dose chest CT follow-up.",sliceCount:12},{id:"E20260902",patientId:"P20260044",type:"MRI",organ:"Brain",bodyPart:"Head",date:"2026-09-02",status:"Abnormal",description:"Brain MRI with contrast.",sliceCount:10},{id:"E20260820",patientId:"P20260058",type:"X-Ray",organ:"Chest",bodyPart:"Chest",date:"2026-08-20",status:"Completed",description:"Two-view chest radiograph.",sliceCount:1},{id:"E20260831",patientId:"P20260069",type:"CT",organ:"Lung",bodyPart:"Chest",date:"2026-08-31",status:"Reviewed",description:"Low-dose chest CT, 1.25 mm axial reconstruction.",sliceCount:12}],Ay=[{id:"F-1001",examinationId:"E20260901",patientId:"P20260021",organ:"Lung",side:"right",location:"upper_lobe",label:"Pulmonary Nodule",severity:"Medium",confidence:.93,description:"Solid nodule measuring 9 mm in the apical segment of the right upper lobe.",status:"pending"},{id:"F-1002",examinationId:"E20260901",patientId:"P20260021",organ:"Lung",side:"right",location:"lower_lobe",label:"Ground-glass Opacity",severity:"Low",confidence:.78,description:"Faint ground-glass opacity in the posterior basal segment.",status:"pending"},{id:"F-1003",examinationId:"E20260710",patientId:"P20260021",organ:"Brain",side:"left",location:"frontal_lobe",label:"Age-related Atrophy",severity:"Low",confidence:.9,description:"Mild cortical atrophy without acute abnormality.",status:"confirmed"},{id:"F-1004",examinationId:"E20260828",patientId:"P20260037",organ:"Lung",side:"left",location:"upper_lobe",label:"Pulmonary Nodule",severity:"Medium",confidence:.88,description:"Stable 7 mm nodule in the left upper lobe.",status:"confirmed"},{id:"F-1005",examinationId:"E20260902",patientId:"P20260044",organ:"Brain",side:"right",location:"temporal_lobe",label:"Suspected Infarct",severity:"High",confidence:.82,description:"Restricted diffusion in the right temporal lobe, suggestive of acute infarct.",status:"pending"},{id:"F-1006",examinationId:"E20260831",patientId:"P20260069",organ:"Lung",side:"right",location:"middle_lobe",label:"Pulmonary Nodule",severity:"Medium",confidence:.91,description:"11 mm nodule in the right middle lobe with irregular margins.",status:"confirmed"}],id=[{id:"R-1001",patientId:"P20260021",examinationId:"E20260901",diagnosis:"Right upper lobe pulmonary nodule requiring follow-up.",description:"A 9 mm solid nodule is present in the apical segment of the right upper lobe. No pleural effusion or mediastinal lymphadenopathy is identified.",recommendation:"Recommend follow-up chest CT in 6 months and multidisciplinary review.",doctor:"Dr. Zhang Wei",date:"2026-09-01",reviewed:!1},{id:"R-1002",patientId:"P20260021",examinationId:"E20260710",diagnosis:"Mild age-related brain atrophy.",description:"No acute intracranial hemorrhage, mass effect, or midline shift.",recommendation:"No urgent follow-up required.",doctor:"Dr. Zhang Wei",date:"2026-07-11",reviewed:!0},{id:"R-1003",patientId:"P20260021",examinationId:"E20260402",diagnosis:"Clear lungs with no active cardiopulmonary disease.",description:"Heart size is normal. No focal consolidation or pneumothorax.",recommendation:"Routine annual screening is sufficient.",doctor:"Dr. Zhang Wei",date:"2026-04-03",reviewed:!0},{id:"R-1004",patientId:"P20260037",examinationId:"E20260828",diagnosis:"Stable left upper lobe nodule.",description:"The 7 mm nodule is unchanged compared with the prior examination.",recommendation:"Continue routine surveillance.",doctor:"Dr. Zhang Wei",date:"2026-08-29",reviewed:!0},{id:"R-1005",patientId:"P20260058",examinationId:"E20260820",diagnosis:"Normal cardiomediastinal silhouette.",description:"No acute pulmonary disease is seen.",recommendation:"No follow-up required.",doctor:"Dr. Zhang Wei",date:"2026-08-21",reviewed:!0},{id:"R-1006",patientId:"P20260069",examinationId:"E20260831",diagnosis:"Right middle lobe nodule requiring biopsy consideration.",description:"An irregular 11 mm nodule is present in the right middle lobe.",recommendation:"Consider PET-CT and respiratory specialist referral.",doctor:"Dr. Zhang Wei",date:"2026-09-01",reviewed:!0}],Go=[{id:"lung",organ:"Lung",label:"Lung",color:"#4ba3a6",description:"Bilateral pulmonary analysis",modelUrl:"mock://organs/lung",position:[0,.38,0]},{id:"brain",organ:"Brain",label:"Brain",color:"#7e8fc4",description:"Neurological analysis",modelUrl:"mock://organs/brain",position:[0,.82,0]},{id:"heart",organ:"Heart",label:"Heart",color:"#c4737b",description:"Cardiovascular analysis",modelUrl:"mock://organs/heart",position:[-.12,.22,0]},{id:"liver",organ:"Liver",label:"Liver",color:"#b4805d",description:"Hepatobiliary analysis",modelUrl:"mock://organs/liver",position:[.18,-.04,0]},{id:"kidney",organ:"Kidney",label:"Kidney",color:"#9879a8",description:"Renal analysis",modelUrl:"mock://organs/kidney",position:[-.22,-.22,0]},{id:"bone",organ:"Bone",label:"Skeleton",color:"#d6c9a2",description:"Musculoskeletal analysis",modelUrl:"mock://organs/bone",position:[0,-.5,0]}],qc="pulmolink-session";function Ty(){try{const n=window.localStorage.getItem(qc);return n?JSON.parse(n):null}catch{return null}}function $l(n){n?window.localStorage.setItem(qc,JSON.stringify(n)):window.localStorage.removeItem(qc)}const Nn=vm("auth",()=>{const n=ze(Ty()),e=Me(()=>n.value!==null),t=Me(()=>{var r;return((r=n.value)==null?void 0:r.role)??null});function i(r){if(r==="doctor"){n.value={id:Hl.id,name:Hl.name,role:"doctor",title:Hl.title},$l(n.value);return}const a=Pm[0];n.value={id:a.id,name:a.name,role:"patient"},$l(n.value)}function s(){n.value=null,$l(null)}return{session:n,isAuthenticated:e,portal:t,login:i,logout:s}});/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ry=n=>n.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var za={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cy=({size:n,strokeWidth:e=2,absoluteStrokeWidth:t,color:i,iconNode:s,name:r,class:a,...o},{slots:l})=>va("svg",{...za,width:n||za.width,height:n||za.height,stroke:i||za.stroke,"stroke-width":t?Number(e)*24/Number(n):e,class:["lucide",`lucide-${Ry(r??"icon")}`],...o},[...s.map(c=>va(...c)),...l.default?[l.default()]:[]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=(n,e)=>(t,{slots:i})=>va(Cy,{...t,iconNode:e,name:n},i);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pr=je("ActivityIcon",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Im=je("ArrowLeftIcon",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nh=je("ArrowRightIcon",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oh=je("BellIcon",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yc=je("BoxIcon",[["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Py=je("BrainCircuitIcon",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M9 13a4.5 4.5 0 0 0 3-4",key:"10igwf"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M12 13h4",key:"1ku699"}],["path",{d:"M12 18h6a2 2 0 0 1 2 2v1",key:"105ag5"}],["path",{d:"M12 8h8",key:"1lhi5i"}],["path",{d:"M16 8V5a2 2 0 0 1 2-2",key:"u6izg6"}],["circle",{cx:"16",cy:"13",r:".5",key:"ry7gng"}],["circle",{cx:"18",cy:"3",r:".5",key:"1aiba7"}],["circle",{cx:"20",cy:"21",r:".5",key:"yhc1fs"}],["circle",{cx:"20",cy:"8",r:".5",key:"1e43v0"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sd=je("CalendarDaysIcon",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Iy=je("CheckCheckIcon",[["path",{d:"M18 6 7 17l-5-5",key:"116fxf"}],["path",{d:"m22 10-7.5 7.5L13 16",key:"ke71qq"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dm=je("CheckIcon",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dy=je("ChevronLeftIcon",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Aa=je("ChevronRightIcon",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gl=je("CircleAlertIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lm=je("CircleCheckIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ly=je("CircleDotIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uy=je("ClipboardListIcon",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rd=je("Clock3Icon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16.5 12",key:"1aq6pp"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ad=je("CrosshairIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"22",x2:"18",y1:"12",y2:"12",key:"l9bcsi"}],["line",{x1:"6",x2:"2",y1:"12",y2:"12",key:"13hhkx"}],["line",{x1:"12",x2:"12",y1:"6",y2:"2",key:"10w3f3"}],["line",{x1:"12",x2:"12",y1:"22",y2:"18",key:"15g9kq"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fh=je("DropletsIcon",[["path",{d:"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",key:"1ptgy4"}],["path",{d:"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",key:"1sl1rz"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ny=je("FileArchiveIcon",[["path",{d:"M10 12v-1",key:"v7bkov"}],["path",{d:"M10 18v-2",key:"1cjy8d"}],["path",{d:"M10 7V6",key:"dljcrl"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 .274 1.01",key:"gkbcor"}],["circle",{cx:"10",cy:"20",r:"2",key:"1xzdoj"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Um=je("FileCheck2Icon",[["path",{d:"M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4",key:"1pf5j1"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m3 15 2 2 4-4",key:"1lhrkk"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oy=je("FileImageIcon",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["circle",{cx:"10",cy:"12",r:"2",key:"737tya"}],["path",{d:"m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22",key:"wt3hpn"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const As=je("FileTextIcon",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fy=je("Grid3x3Icon",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"M15 3v18",key:"14nvp0"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ya=je("HeartPulseIcon",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}],["path",{d:"M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",key:"1uw2ng"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ky=je("HouseIcon",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const By=je("InfoIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zy=je("LanguagesIcon",[["path",{d:"m5 8 6 6",key:"1wu5hv"}],["path",{d:"m4 14 6-6 2-3",key:"1k1g8d"}],["path",{d:"M2 5h12",key:"or177f"}],["path",{d:"M7 2h1",key:"1t2jsx"}],["path",{d:"m22 22-5-10-5 10",key:"don7ne"}],["path",{d:"M14 18h6",key:"1m8k6r"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vy=je("LayoutDashboardIcon",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hy=je("LogOutIcon",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $y=je("MenuIcon",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const od=je("MinusIcon",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gy=je("PenLineIcon",[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wy=je("PhoneIcon",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ld=je("PlusIcon",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cd=je("RotateCcwIcon",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xy=je("SaveIcon",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xr=je("ScanLineIcon",[["path",{d:"M3 7V5a2 2 0 0 1 2-2h2",key:"aa7l1z"}],["path",{d:"M17 3h2a2 2 0 0 1 2 2v2",key:"4qcy5o"}],["path",{d:"M21 17v2a2 2 0 0 1-2 2h-2",key:"6vwrx8"}],["path",{d:"M7 21H5a2 2 0 0 1-2-2v-2",key:"ioqczr"}],["path",{d:"M7 12h10",key:"b7w52i"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nm=je("SearchIcon",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qy=je("ShieldAlertIcon",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yy=je("ShieldCheckIcon",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jc=je("StethoscopeIcon",[["path",{d:"M11 2v2",key:"1539x4"}],["path",{d:"M5 2v2",key:"1yf1q8"}],["path",{d:"M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1",key:"rb5t3r"}],["path",{d:"M8 15a6 6 0 0 0 12 0v-3",key:"x18d4x"}],["circle",{cx:"20",cy:"10",r:"2",key:"ts1r5v"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jy=je("TriangleAlertIcon",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kh=je("UploadIcon",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Om=je("UsersIcon",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ta=je("XIcon",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),Ky={class:"brand"},Zy={class:"brand-mark"},Jy={class:"brand-copy"},Qy=["aria-label"],eb={class:"sidebar-label"},tb={class:"nav"},nb={class:"sidebar-footer"},ib={class:"session-person"},sb={class:"avatar"},rb={class:"session-copy"},ab=["title"],Va="P20260021",ob=it({__name:"Sidebar",props:{open:{type:Boolean}},emits:["close"],setup(n,{emit:e}){const t=n,i=e,s=Nn(),r=Rn(),a=Me(()=>[{label:"Dashboard",to:"/doctor/dashboard",icon:Vy},{label:"Patients",to:"/doctor/patients",icon:Om},{label:"Imaging",to:`/doctor/patients/${Va}/imaging`,icon:xr},{label:"Reports",to:`/doctor/patients/${Va}/report`,icon:As},{label:"Medical Records",to:`/doctor/patients/${Va}/overview`,icon:Uy},{label:"Digital Human",to:`/doctor/patients/${Va}/3d`,icon:Yc}]),o=Me(()=>[{label:"Home",to:"/patient/dashboard",icon:ky},{label:"My Health",to:"/patient/dashboard",icon:ya},{label:"My Examinations",to:"/patient/examinations",icon:jc},{label:"My Reports",to:"/patient/reports",icon:As},{label:"My Body",to:"/patient/body",icon:Yc}]),l=Me(()=>s.portal==="doctor"?a.value:o.value);function c(){s.logout(),r.push({name:"login"})}return(u,d)=>{var f,b,x;const h=fa("RouterLink");return Z(),de("aside",{class:Yt(["sidebar",{"is-open":t.open}])},[_("div",Ky,[_("span",Zy,[ne(J(Pr),{size:20})]),_("span",Jy,[_("strong",null,D(u.$t("PulmoLink")),1),_("small",null,D(u.$t("Medical AI Platform")),1)]),_("button",{class:"sidebar-close",type:"button","aria-label":u.$t("Close navigation"),onClick:d[0]||(d[0]=y=>i("close"))},[ne(J(Ta),{size:18})],8,Qy)]),_("div",eb,D(u.$t(J(s).portal==="doctor"?"Clinical Workspace":"Personal Health")),1),_("nav",tb,[(Z(!0),de(lt,null,kt(l.value,y=>(Z(),bt(h,{key:y.label,to:y.to,class:"nav-item","active-class":"is-active",onClick:d[1]||(d[1]=g=>i("close"))},{default:Zi(()=>[(Z(),bt(zp(y.icon),{size:18})),_("span",null,D(u.$t(y.label)),1)]),_:2},1032,["to"]))),128))]),_("div",nb,[_("div",ib,[_("span",sb,D(u.$t((b=(f=J(s).session)==null?void 0:f.name)==null?void 0:b.split(" ").map(y=>y[0]).join("").slice(0,2))),1),_("span",rb,[_("strong",null,D(u.$t((x=J(s).session)==null?void 0:x.name)),1),_("small",null,D(u.$t(J(s).portal==="doctor"?"Radiology":"Patient Portal")),1)])]),_("button",{class:"logout-btn",type:"button",title:u.$t("Sign out"),onClick:c},[ne(J(Hy),{size:18})],8,ab)])],2)}}}),lb=at(ob,[["__scopeId","data-v-bc658000"]]),Vn=(n,e=320)=>new Promise(t=>{window.setTimeout(()=>t(n),e)});function Fm(){return new Promise((n,e)=>{const t=indexedDB.open("pulmolink-studies-v2",1);t.onupgradeneeded=()=>t.result.createObjectStore("studies",{keyPath:"examination.id"}),t.onsuccess=()=>n(t.result),t.onerror=()=>e(t.error)})}async function cb(n){const e=await Fm();try{await new Promise((t,i)=>{const s=e.transaction("studies","readwrite");s.objectStore("studies").put(n),s.oncomplete=()=>t(),s.onerror=()=>i(s.error),s.onabort=()=>i(s.error)})}finally{e.close()}}async function Wo(){const n=await Fm();try{return await new Promise((e,t)=>{const i=n.transaction("studies").objectStore("studies").getAll();i.onsuccess=()=>e(i.result),i.onerror=()=>t(i.error)})}finally{n.close()}}async function ub(n){var e;return((e=(await Wo()).find(t=>t.examination.id===n))==null?void 0:e.files)??[]}function Ra(n,e){try{const t=localStorage.getItem(`pulmolink-v2-${n}`);return t?JSON.parse(t):structuredClone(e)}catch{return structuredClone(e)}}function ud(n,e){localStorage.setItem(`pulmolink-v2-${n}`,JSON.stringify(e))}const db={async getExaminationsByPatient(n){const e=(await Wo()).map(s=>s.examination).filter(s=>s.patientId===n),t=e.length?e:Xc.filter(s=>s.patientId===n),i=Ra("reports",id);return Vn(t.map(s=>i.some(r=>r.examinationId===s.id&&r.reviewed)?{...s,status:"Reviewed"}:s).sort((s,r)=>r.date.localeCompare(s.date)||r.id.localeCompare(s.id)))},async getExaminationById(n){var t;const e=await Wo();return Vn(((t=e.find(i=>i.examination.id===n))==null?void 0:t.examination)??Xc.find(i=>i.id===n))}},Wl=()=>Ra("findings",Ay),Xl={async getFindingsByExamination(n){return Vn(Wl().filter(e=>e.examinationId===n))},async getFindingsByPatient(n){return Vn(Wl().filter(e=>e.patientId===n))},async updateFindingStatus(n,e){return this.updateFinding(n,{status:e})},async updateFinding(n,e){const t=Wl(),i=t.findIndex(r=>r.id===n);if(i<0)throw new Error("Finding not found.");const s={...t[i],...e};return t[i]=s,ud("findings",t),Vn(s)}},Bh={async getPatients(){const n=await Wo(),e=Ra("reports",id);return Vn(Pm.map(t=>{const i=n.filter(a=>a.examination.patientId===t.id).map(a=>a.examination).sort((a,o)=>o.id.localeCompare(a.id))[0],s=i??Xc.filter(a=>a.patientId===t.id).sort((a,o)=>o.date.localeCompare(a.date))[0],r=e.find(a=>a.examinationId===(s==null?void 0:s.id));return{...t,...i?{modality:i.type,organ:i.organ,lastExamDate:i.date}:{},status:r!=null&&r.reviewed?"Reviewed":i?"Pending Review":t.status}}))},async getPatientById(n){return(await this.getPatients()).find(e=>e.id===n)}},Ha=()=>Ra("reports",id),ql={async getReportsByPatient(n){return Vn(Ha().filter(e=>e.patientId===n).sort((e,t)=>t.date.localeCompare(e.date)))},async getReviewedReportsByPatient(n){return Vn(Ha().filter(e=>e.patientId===n&&e.reviewed).sort((e,t)=>t.date.localeCompare(e.date)))},async getReportById(n){return Vn(Ha().find(e=>e.id===n))},async saveReport(n){const e=Ha(),t=e.findIndex(i=>i.id===n.id);return t>=0?e[t]=n:e.push(n),ud("reports",e),Vn({...n})}},pn=vm("patients",()=>{const n=ze([]),e=ze(null),t=ze([]),i=ze([]),s=ze([]),r=ze([]),a=ze(null),o=ze(!1),l=ze(null);let c=0;const u=Me(()=>n.value.find(g=>g.id===e.value)??null);async function d(){o.value=!0,l.value=null;try{n.value=await Bh.getPatients()}catch{l.value="Unable to load patient list."}finally{o.value=!1}}async function h(g){e.value!==g&&(a.value=null),e.value=g,await f(g)}async function f(g){var S;const A=++c;o.value=!0,l.value=null;try{const[m,w,T,R]=await Promise.all([db.getExaminationsByPatient(g),Xl.getFindingsByPatient(g),ql.getReportsByPatient(g),ql.getReviewedReportsByPatient(g)]);if(A!==c)return;t.value=m;const U=new Set(m.map(M=>M.id));i.value=w.filter(M=>U.has(M.examinationId)),s.value=T.filter(M=>U.has(M.examinationId)),r.value=R.filter(M=>U.has(M.examinationId)),(!a.value||!U.has(a.value))&&(a.value=((S=m[0])==null?void 0:S.id)??null)}catch{A===c&&(l.value="Unable to load patient record.")}finally{A===c&&(o.value=!1)}}async function b(g,A){const S=await Xl.updateFindingStatus(g,A);if(S){const m=i.value.findIndex(w=>w.id===g);m>=0&&(i.value[m]=S)}}async function x(g){const A=await ql.saveReport(g),S=s.value.findIndex(m=>m.id===g.id);S>=0?s.value[S]=A:s.value.push(A),r.value=s.value.filter(m=>m.reviewed),t.value=t.value.map(m=>m.id===A.examinationId?{...m,status:A.reviewed?"Reviewed":"Pending Review"}:m),n.value=await Bh.getPatients()}async function y(g,A){const S=await Xl.updateFinding(g,{...A,status:"modified"});i.value=i.value.map(m=>m.id===g?S:m)}return{patients:n,selectedPatientId:e,selectedPatient:u,examinations:t,findings:i,reports:s,reviewedReports:r,activeExamId:a,loading:o,error:l,loadPatients:d,selectPatient:h,loadPatientContext:f,updateFindingStatus:b,modifyFinding:y,saveReport:x}}),zh={"Across all modules":"所有模块","Needs doctor action":"等待医生处理","High priority cases":"重点关注病例","Scheduled for review":"等待安排审核","vs last week":"较上周","Unable to load patient list.":"加载患者列表失败。","Unable to load patient record.":"加载患者档案失败。","Medical AI Platform":"医学 AI 平台","AI Medical Imaging & Digital Human":"AI 医学影像与数字人体","Connecting imaging, AI findings, and clinical review.":"连接医学影像、AI 发现与临床审核。","A clinical workspace for doctors and a calm digital health portal for patients, starting with the lung workflow.":"连接医生工作台与患者健康门户，从肺部影像检查开启完整诊疗流程。","Doctor-reviewed workflow":"医生审核流程","Lung-first clinical module":"肺部临床模块","Select workspace":"选择工作空间","Sign in to PulmoLink":"登录 PulmoLink","Choose a demo portal to continue.":"选择演示入口以继续。","Doctor Portal":"医生端","Patient Portal":"患者端","Clinical review, imaging, AI findings, and reporting.":"临床审核、医学影像、AI 发现与报告。","Your health, examinations, reports, and body.":"查看健康、检查、报告与数字人体。","Demo environment · Synthetic patient data only":"演示环境 · 使用示例患者数据","Clinical Workspace":"临床工作台","Personal Health":"个人健康",Dashboard:"工作台","Doctor Dashboard":"医生工作台","Patient List":"患者列表","Patient Record":"患者档案","Medical Imaging":"医学影像",Imaging:"影像","AI Findings":"AI 发现","Doctor Report":"医生报告","Digital Human":"数字人体",Patients:"患者",Reports:"报告","Medical Records":"医疗档案",Home:"首页","My Health":"我的健康","My Examinations":"我的检查","My Reports":"我的报告","My Body":"我的身体","Examination Detail":"检查详情",Overview:"概览",Report:"报告","3D Viewer":"3D 影像",Radiologist:"影像科医生",Radiology:"影像科",Patient:"患者",Doctor:"医生","Open navigation":"打开导航","Close navigation":"关闭导航","Sign out":"退出登录",Search:"搜索","Search patient name or ID...":"搜索患者姓名或编号…","Clear search":"清除搜索","Switch language":"切换语言",Notifications:"通知","Close notifications":"关闭通知","Mark all as read":"全部标为已读","No notifications yet.":"暂无通知。",unread:"条未读","Examination awaiting review":"检查等待审核","Report signed":"报告已签署","Total Patients":"患者总数","Today's Exams":"今日检查","Pending Review":"待审核","Abnormal Findings":"异常发现","AI Completed":"AI 分析完成",Completed:"已完成",Reviewed:"已审核",Abnormal:"异常","Review and open the latest imaging studies.":"查看并审核最新影像检查。","Search, filter, and open the complete patient record.":"搜索、筛选并打开完整患者档案。",All:"全部","All dates":"全部日期",Today:"今天","Last 7 days":"最近 7 天","Modality filter":"影像类型筛选","Organ filter":"器官筛选","Risk filter":"风险筛选","Status filter":"状态筛选","Date filter":"日期筛选",Name:"姓名",ID:"编号",Age:"年龄",Gender:"性别",Male:"男",Female:"女",Modality:"影像类型",Organ:"器官",Organs:"器官",Risk:"风险",Status:"状态","Status:":"状态：","AI Status":"AI 状态",Action:"操作","Last examination":"最近检查","Last exam":"最近检查","Last Exam":"最近检查","Last Examination":"最近检查","Latest Examination":"最新检查","Latest examination":"最新检查","Selected Patient":"选中患者","Select a patient to preview their record.":"选择患者以预览档案。","View Imaging":"查看影像","View Report":"查看报告","View Reports":"查看报告","View 3D":"查看 3D",patients:"位患者",years:"岁","years ·":"岁 ·","ABO blood type":"ABO 血型","Blood type":"血型",Positive:"阳性",Negative:"阴性",Unknown:"未知",Contact:"联系方式",Allergies:"过敏史","None recorded":"暂无记录",Penicillin:"青霉素","Iodine contrast":"含碘造影剂","Sulfa drugs":"磺胺类药物","Current status":"当前状态","Latest:":"最新：","Patient record sections":"患者档案栏目","Loading patient record...":"正在加载患者档案…","Examination Timeline":"检查时间线","Historical studies for":"历史检查 ·","External AI output shown for clinical review.":"AI 分析结果供医生审核。","Review all":"审核全部","Patient Information":"患者信息","Latest clinical summary.":"最新临床摘要。","No report has been drafted.":"尚未创建报告。","No AI findings for the latest examination.":"最新检查暂无 AI 发现。","Imaging Study":"影像检查","Load a patient study or import local CT / MRI / X-Ray files.":"查看患者检查或导入本地 CT / MRI / X-Ray 文件。","Upload imaging":"上传影像","Sample study":"示例检查","Show sample history":"显示示例历史","Hide sample history":"收起示例历史","Linked Finding":"关联发现","Select a marker in the image.":"选择影像中的标记。","No marker is selected.":"尚未选择标记。","AI Results":"AI 结果","findings in this study.":"项检查发现","No AI findings for this study.":"此检查暂无 AI 发现。","Import imaging study":"导入影像检查","Add local imaging files to this patient record.":"将本地影像添加至患者档案。","Close upload dialog":"关闭上传窗口","Drop DICOM or image files here":"将 DICOM 或图片文件拖至此处",or:"或","Choose files":"选择文件","Selected files":"已选文件","Detecting...":"识别中…",and:"另有","more files":"个文件","Imaging type":"影像类型","Auto-detect":"自动识别","No imaging type found. Select CT, MRI, or X-Ray to continue.":"文件未提供影像类型，请选择 CT、MRI 或 X-Ray。",Cancel:"取消","Importing...":"导入中…","Import study":"导入检查","Uploaded study":"已上传检查",files:"个文件","Loading study...":"正在加载检查…",Image:"图像",Images:"图像数","Zoom out":"缩小","Zoom in":"放大","Reset view":"重置视图","Could not read the selected files.":"读取文件失败。","Import failed. Check browser storage and try again.":"导入失败，请检查浏览器存储后重试。","Mixed imaging types. Import CT, MRI, and X-Ray as separate studies.":"检测到多种影像类型，请将 CT、MRI、X-Ray 分别导入。","Choose DICOM, PNG, JPEG, WebP, or BMP files. Extract archives before importing.":"请选择 DICOM、PNG、JPEG、WebP 或 BMP 文件；压缩包请先解压。","Import DICOM and image files separately.":"请分别导入 DICOM 文件和普通图片。","The uploaded files are not available. Import the study again.":"上传文件缺失，请重新导入检查。","Could not load the uploaded study.":"加载上传检查失败。","Could not display this image.":"显示图片失败。","Loading DICOM study...":"正在加载 DICOM 检查…","DICOM load failed":"DICOM 加载失败","Drag: window / level · Right drag: pan · Wheel: slices":"左键拖动：窗宽窗位 · 右键拖动：平移 · 滚轮：切片","Projection viewer":"投影视图","Multiplanar reconstruction":"多平面重建",Slice:"切片","Slice position":"切片位置","Window preset":"窗宽窗位预设","Soft tissue":"软组织","Reset zoom":"重置缩放","Toggle grid":"切换网格","X-Ray Projection":"X 光投影",Axial:"横断面",Coronal:"冠状面",Sagittal:"矢状面","3D Volume":"3D 体积","3D volume preview":"3D 体积预览","Previous slice":"上一切片","Next slice":"下一切片",Lung:"肺",Brain:"脑",Bone:"骨骼",Chest:"胸部",Head:"头部",Heart:"心脏",Liver:"肝脏",Kidney:"肾脏",Skeleton:"骨骼",Unspecified:"未指定","AI Finding Review":"AI 发现审核","Confirm, modify, or dismiss each model-generated finding.":"逐项确认、修改或忽略 AI 发现。",pending:"待审核",confirmed:"已确认",modified:"已修改",dismissed:"已忽略",reviewed:"已审核","No AI findings are available for this examination.":"此检查暂无 AI 发现。","Review Checklist":"审核提示","Confirm findings that match the imaging evidence.":"确认与影像证据相符的发现。","Modify any finding text before it reaches the final report.":"进入最终报告前，可编辑发现内容。","Dismiss findings that are not clinically relevant.":"忽略与临床判断不符的发现。","Continue to Report":"继续编写报告",Confidence:"置信度",Confirm:"确认",Modify:"修改",Dismiss:"忽略","Undo dismiss":"撤销忽略","Finding title":"发现标题",Description:"所见描述","Risk level":"风险等级",Low:"低",Medium:"中",High:"高","Save changes":"保存修改","Saving...":"保存中…","Enter a finding title and description.":"请填写发现标题和描述。","Finding confirmed.":"发现已确认。","Finding dismissed. It will not be included in the report.":"发现已忽略，不会纳入 AI 报告摘要。","Finding restored for review.":"发现已恢复为待审核。","Changes saved.":"修改已保存。","Save failed. Please try again.":"保存失败，请重试。","Clinical report":"临床报告","Doctor Review":"医生审核","Review, refine, and sign your clinical assessment.":"审阅影像所见，完善结论并签署报告。",Signed:"已签署","Unsaved changes":"修改未保存",Draft:"草稿","Report examination":"报告对应检查","Final diagnosis":"诊断结论","Final Diagnosis":"诊断结论","Write your clinical impression...":"填写诊断结论…","Describe the imaging findings...":"描述影像所见…","Use reviewed AI findings":"填入已审核的 AI 发现",Recommendation:"建议","Add follow-up recommendations...":"填写后续建议…","Mark reviewed and sign":"完成审核并签署","Save draft":"保存草稿",Reset:"重置","Live preview":"实时预览","The patient sees this report after you sign it.":"签署后，患者可在自己的门户中查看报告。","Restored the last saved report.":"已恢复至上次保存的报告。","Draft cleared.":"草稿已清空。","Confirmed and modified findings added. Review the text before signing.":"已填入确认及修改后的发现，请审阅后签署。","Select an examination first.":"请先选择检查。","Enter a diagnosis and description before signing.":"签署前请填写诊断结论和所见描述。","Report signed and available in the patient portal.":"报告已签署，患者端已可查看。","Draft saved.":"草稿已保存。","Doctor Reviewed":"医生已审核","Signed by":"签署医生","Prepared by":"编写医生","AI Finding Marker":"AI 发现标记","Lung 3D Model":"肺部 3D 模型","Standard anatomical model with AI finding marker.":"带 AI 发现标记的标准解剖模型。","Select an organ to open its visualization.":"选择器官以打开可视化。","Select an organ for more information.":"选择器官以查看详情。","Drag to rotate · Scroll to zoom":"拖动旋转 · 滚轮缩放","View CT":"查看影像","The clinical module for this organ is available in a future release.":"该器官的临床模块将在后续版本开放。","The full organ module will be available in a future release.":"完整器官模块将在后续版本开放。","My Health Overview":"我的健康概览","Your most recent doctor-reviewed examination.":"最近一次经医生审核的检查。","Understand your body, starting with your lungs.":"从肺部开始，了解自己的身体。","Recent Examinations":"近期检查","Your imaging history in one place.":"集中查看历次影像检查。","View all":"查看全部","No examinations are available.":"暂无检查。","Doctor's Report":"医生报告","Your latest reviewed final report.":"最近一份已审核的正式报告。","Your reviewed report will appear here.":"审核后的报告将在此显示。","Your complete imaging history, shown in plain language.":"清晰查看完整影像检查记录。","About this examination":"关于本次检查","Body region":"检查部位","Only reviewed results are shown here.":"此处仅展示已审核结果。","Your doctor is still reviewing this examination.":"医生正在审核本次检查。","Doctor-reviewed results, written for you.":"查看医生审核后的检查结果。","No reviewed reports are available yet.":"暂无已审核报告。","Explore your digital human and understand your body.":"探索数字人体，了解身体状况。","Only doctor-reviewed information is shown.":"仅展示医生审核后的信息。","Your latest doctor-reviewed lung information.":"最近一次经医生审核的肺部检查信息。","Lung Examination":"肺部检查","Your lung report is being reviewed by your doctor.":"医生正在审核您的肺部报告。",left:"左侧",right:"右侧","upper lobe":"上叶","lower lobe":"下叶","middle lobe":"中叶","frontal lobe":"额叶","temporal lobe":"颞叶","Pulmonary Nodule":"肺结节","Ground-glass Opacity":"磨玻璃影","Age-related Atrophy":"年龄相关萎缩","Suspected Infarct":"疑似梗死","Bilateral pulmonary analysis":"双肺分析","Neurological analysis":"神经系统分析","Cardiovascular analysis":"心血管分析","Hepatobiliary analysis":"肝胆分析","Renal analysis":"肾脏分析","Musculoskeletal analysis":"肌肉骨骼分析","Solid nodule measuring 9 mm in the apical segment of the right upper lobe.":"右肺上叶尖段见 9 mm 实性结节。","Faint ground-glass opacity in the posterior basal segment.":"后基底段见淡磨玻璃影。","Mild cortical atrophy without acute abnormality.":"轻度皮质萎缩，未见急性异常。","Stable 7 mm nodule in the left upper lobe.":"左肺上叶 7 mm 结节，较前稳定。","Restricted diffusion in the right temporal lobe, suggestive of acute infarct.":"右侧颞叶弥散受限，提示急性梗死。","11 mm nodule in the right middle lobe with irregular margins.":"右肺中叶见 11 mm 结节，边缘不规则。","Low-dose chest CT, 1.0 mm axial reconstruction.":"低剂量胸部 CT，1.0 mm 横断面重建。","Brain MRI without contrast.":"头部 MRI 平扫。","Posteroanterior chest radiograph.":"胸部后前位 X 光片。","Low-dose chest CT follow-up.":"低剂量胸部 CT 随访。","Brain MRI with contrast.":"头部增强 MRI。","Two-view chest radiograph.":"胸部正侧位 X 光片。","Low-dose chest CT, 1.25 mm axial reconstruction.":"低剂量胸部 CT，1.25 mm 横断面重建。","Right upper lobe pulmonary nodule requiring follow-up.":"右肺上叶结节，需随访。","A 9 mm solid nodule is present in the apical segment of the right upper lobe. No pleural effusion or mediastinal lymphadenopathy is identified.":"右肺上叶尖段见 9 mm 实性结节。未见胸腔积液或纵隔淋巴结肿大。","Recommend follow-up chest CT in 6 months and multidisciplinary review.":"建议 6 个月后复查胸部 CT，并进行多学科会诊。","Mild age-related brain atrophy.":"轻度年龄相关脑萎缩。","No acute intracranial hemorrhage, mass effect, or midline shift.":"未见急性颅内出血、占位效应或中线移位。","No urgent follow-up required.":"无需紧急随访。","Clear lungs with no active cardiopulmonary disease.":"双肺清晰，未见活动性心肺病变。","Heart size is normal. No focal consolidation or pneumothorax.":"心脏大小正常，未见局灶性实变或气胸。","Routine annual screening is sufficient.":"建议常规年度筛查。","Stable left upper lobe nodule.":"左肺上叶结节，较前稳定。","The 7 mm nodule is unchanged compared with the prior examination.":"7 mm 结节较前次检查未见变化。","Continue routine surveillance.":"继续常规随访。","Normal cardiomediastinal silhouette.":"心纵隔影正常。","No acute pulmonary disease is seen.":"未见急性肺部病变。","No follow-up required.":"无需随访。","Right middle lobe nodule requiring biopsy consideration.":"右肺中叶结节，建议考虑活检。","An irregular 11 mm nodule is present in the right middle lobe.":"右肺中叶见 11 mm 不规则结节。","Consider PET-CT and respiratory specialist referral.":"建议考虑 PET-CT 检查并转诊呼吸科。"};function hb(){try{return localStorage.getItem("pulmolink-language")==="en"?"en":"zh"}catch{return"zh"}}const Ji=ze(hb());document.documentElement.lang=Ji.value==="zh"?"zh-CN":"en";function km(n){Ji.value=n,document.documentElement.lang=n==="zh"?"zh-CN":"en";try{localStorage.setItem("pulmolink-language",n)}catch{}}function ir(n){if(n==null)return"";const e=String(n);if(Ji.value==="en")return e;const t=e.trim().replace(/\s+/g," ");if(zh[t])return zh[t];const i=t.match(/^Good morning, (.*)\. Here is today's clinical queue\.$/);if(i)return`您好，${i[1]}。这是今天的临床工作列表。`;const s=t.match(/^Good morning, (.*?)(\. Here is your health overview\.)?$/);return s?`您好，${s[1]}${s[2]?"。这是您的健康概览。":""}`:t.startsWith("Uploaded study: ")?`上传检查：${t.slice(16)}`:e}const fb={class:"topbar"},pb={class:"topbar-left"},mb=["aria-label"],gb={class:"title-wrap"},vb={class:"eyebrow"},_b={class:"topbar-actions"},yb={class:"greeting"},bb={class:"topbar-search"},xb=["placeholder","aria-label"],Sb=["aria-label"],Mb=["aria-label","aria-expanded"],Eb={key:0,class:"notification-dot"},wb=["aria-label"],Ab={class:"notification-heading"},Tb=["aria-label"],Rb={class:"notification-list"},Cb=["onClick"],Pb={key:0,class:"empty-state"},Ib={class:"topbar-profile"},Db={class:"profile-avatar"},Lb={class:"profile-copy"},Ub=it({__name:"Topbar",emits:["openSidebar"],setup(n,{emit:e}){const t=e,i=Nn(),s=Ps(),r=Rn(),a=pn(),o=ze(!1),l=ze(null),c=ze(Ra("notification-read",[])),u=Me(()=>{const m=i.portal==="doctor"?a.patients.filter(T=>T.status==="Pending Review"||T.status==="Abnormal").map(T=>({id:`review-${T.id}-${T.lastExamDate}`,title:"Examination awaiting review",detail:`${T.name} · ${T.modality}`,to:`/doctor/patients/${T.id}/report`})):[],w=(i.portal==="patient"?a.reviewedReports:a.reports.filter(T=>T.reviewed)).filter(T=>{var R;return i.portal==="doctor"||T.patientId===((R=i.session)==null?void 0:R.id)}).map(T=>({id:`signed-${T.id}-${T.date}-${T.description}`,title:"Report signed",detail:`${T.examinationId} · ${T.date}`,to:i.portal==="doctor"?`/doctor/patients/${T.patientId}/report?exam=${T.examinationId}`:"/patient/reports"}));return[...m,...w]}),d=Me(()=>u.value.filter(m=>!c.value.includes(m.id)).length);function h(m){c.value=[...new Set([...c.value,...m])],ud("notification-read",c.value)}function f(m){h([m.id]),o.value=!1,r.push(m.to)}function b(m){var w;(w=l.value)!=null&&w.contains(m.target)||(o.value=!1)}function x(m){m.key==="Escape"&&(o.value=!1)}sn(()=>{document.addEventListener("pointerdown",b),document.addEventListener("keydown",x)}),ns(()=>{document.removeEventListener("pointerdown",b),document.removeEventListener("keydown",x)});const y={"doctor-dashboard":"Doctor Dashboard","doctor-patients":"Patient List","doctor-patient-overview":"Patient Record","doctor-patient-imaging":"Medical Imaging","doctor-patient-ai":"AI Findings","doctor-patient-report":"Doctor Report","doctor-patient-3d":"Digital Human","patient-dashboard":"My Health","patient-examinations":"My Examinations","patient-examination-detail":"Examination Detail","patient-reports":"My Reports","patient-body":"My Body"},g=Me(()=>y[String(s.name)]??"PulmoLink"),A=Me(()=>{var m,w;return i.portal==="patient"?`Good morning, ${((m=i.session)==null?void 0:m.name)??"Patient"}`:`Good morning, ${((w=i.session)==null?void 0:w.name)??"Doctor"}`}),S=Me(()=>{var m,w;return(w=(m=i.session)==null?void 0:m.name)==null?void 0:w.split(" ").map(T=>T[0]).join("").slice(0,2)});return(m,w)=>{var T;return Z(),de("header",fb,[_("div",pb,[_("button",{class:"mobile-menu",type:"button","aria-label":m.$t("Open navigation"),onClick:w[0]||(w[0]=R=>t("openSidebar"))},[ne(J($y),{size:20})],8,mb),_("div",gb,[_("span",vb,D(m.$t(J(i).portal==="doctor"?"Clinical Workspace":"Personal Health")),1),_("strong",null,D(m.$t(g.value)),1)])]),_("div",_b,[_("div",yb,D(m.$t(A.value)),1),_("label",bb,[ne(J(Nm),{size:16}),_("input",{type:"search",placeholder:m.$t("Search"),"aria-label":m.$t("Search")},null,8,xb)]),_("button",{class:"language-switch",type:"button","aria-label":m.$t("Switch language"),onClick:w[1]||(w[1]=R=>J(km)(J(Ji)==="zh"?"en":"zh"))},[ne(J(zy),{size:16}),_("span",null,D(J(Ji)==="zh"?"English":"中文"),1)],8,Sb),_("div",{ref_key:"notificationRoot",ref:l,class:"notification-root"},[_("button",{class:"icon-btn notification",type:"button","aria-label":m.$t("Notifications"),"aria-expanded":o.value,"aria-controls":"notification-panel",onClick:w[2]||(w[2]=R=>o.value=!o.value)},[ne(J(Oh),{size:18}),d.value?(Z(),de("span",Eb)):tt("",!0)],8,Mb),o.value?(Z(),de("section",{key:0,id:"notification-panel",class:"notification-panel","aria-label":m.$t("Notifications")},[_("div",Ab,[_("strong",null,D(m.$t("Notifications")),1),_("span",null,D(m.$t(d.value))+" "+D(m.$t("unread")),1),_("button",{class:"icon-btn",type:"button","aria-label":m.$t("Close notifications"),onClick:w[3]||(w[3]=R=>o.value=!1)},[ne(J(Ta),{size:16})],8,Tb)]),d.value?(Z(),de("button",{key:0,type:"button",class:"mark-read",onClick:w[4]||(w[4]=R=>h(u.value.map(U=>U.id)))},[ne(J(Iy),{size:15}),ot(" "+D(m.$t("Mark all as read")),1)])):tt("",!0),_("div",Rb,[(Z(!0),de(lt,null,kt(u.value,R=>(Z(),de("button",{key:R.id,type:"button",class:Yt(["notification-item",{unread:!c.value.includes(R.id)}]),onClick:U=>f(R)},[ne(J(Oh),{size:17}),_("span",null,[_("strong",null,D(m.$t(R.title)),1),_("small",null,D(m.$t(R.detail)),1)])],10,Cb))),128)),u.value.length?tt("",!0):(Z(),de("div",Pb,D(m.$t("No notifications yet.")),1))])],8,wb)):tt("",!0)],512),_("div",Ib,[_("span",Db,D(m.$t(S.value)),1),_("span",Lb,[_("strong",null,D(m.$t((T=J(i).session)==null?void 0:T.name)),1),_("small",null,D(m.$t(J(i).portal==="doctor"?"Radiologist":"Patient")),1)])])])])}}}),Nb=at(Ub,[["__scopeId","data-v-47f4cf0e"]]),Ob={class:"app-main"},Fb={class:"app-content"},kb=["aria-label"],Bb=it({__name:"AppLayout",setup(n){const e=Nn(),t=ze(!1),i=Me(()=>`portal-${e.portal??"doctor"}`);return(s,r)=>{const a=fa("RouterView");return Z(),de("div",{class:Yt(["app-shell",i.value])},[ne(lb,{open:t.value,onClose:r[0]||(r[0]=o=>t.value=!1)},null,8,["open"]),_("div",Ob,[ne(Nb,{onOpenSidebar:r[1]||(r[1]=o=>t.value=!0)}),_("main",Fb,[ne(a)])]),t.value?(Z(),de("button",{key:0,class:"sidebar-backdrop",type:"button","aria-label":s.$t("Close navigation"),onClick:r[2]||(r[2]=o=>t.value=!1)},null,8,kb)):tt("",!0)],2)}}}),Vh=at(Bb,[["__scopeId","data-v-f715d33c"]]),zb={class:"login-page"},Vb={class:"login-brand"},Hb={class:"brand-lockup"},$b={class:"brand-symbol"},Gb={class:"brand-message"},Wb={class:"kicker"},Xb={class:"brand-notes"},qb={class:"login-panel"},Yb=["aria-label"],jb={class:"login-heading"},Kb={class:"kicker"},Zb={class:"role-options"},Jb={class:"role-icon"},Qb={class:"role-copy"},ex={class:"role-icon"},tx={class:"role-copy"},nx={class:"login-footnote"},ix=it({__name:"LoginView",setup(n){const e=Rn(),t=Nn();function i(s){t.login(s),e.push(s==="doctor"?"/doctor/dashboard":"/patient/dashboard")}return(s,r)=>(Z(),de("main",zb,[_("section",Vb,[_("div",Hb,[_("span",$b,[ne(J(Pr),{size:23})]),_("span",null,[_("strong",null,D(s.$t("PulmoLink")),1),_("small",null,D(s.$t("Medical AI Platform")),1)])]),_("div",Gb,[_("span",Wb,D(s.$t("AI Medical Imaging & Digital Human")),1),_("h1",null,D(s.$t("Connecting imaging, AI findings, and clinical review.")),1),_("p",null,D(s.$t("A clinical workspace for doctors and a calm digital health portal for patients, starting with the lung workflow.")),1)]),_("div",Xb,[_("span",null,[ne(J(ya),{size:17}),ot(" "+D(s.$t("Doctor-reviewed workflow")),1)]),_("span",null,[ne(J(jc),{size:17}),ot(" "+D(s.$t("Lung-first clinical module")),1)])])]),_("section",qb,[_("button",{type:"button",class:"login-language btn btn-secondary btn-sm","aria-label":s.$t("Switch language"),onClick:r[0]||(r[0]=a=>J(km)(J(Ji)==="zh"?"en":"zh"))},D(J(Ji)==="zh"?"English":"中文"),9,Yb),_("div",jb,[_("span",Kb,D(s.$t("Select workspace")),1),_("h2",null,D(s.$t("Sign in to PulmoLink")),1),_("p",null,D(s.$t("Choose a demo portal to continue.")),1)]),_("div",Zb,[_("button",{class:"role-card doctor",type:"button",onClick:r[1]||(r[1]=a=>i("doctor"))},[_("span",Jb,[ne(J(jc),{size:24})]),_("span",Qb,[_("strong",null,D(s.$t("Doctor Portal")),1),_("small",null,D(s.$t("Clinical review, imaging, AI findings, and reporting.")),1)]),ne(J(Nh),{size:19})]),_("button",{class:"role-card patient",type:"button",onClick:r[2]||(r[2]=a=>i("patient"))},[_("span",ex,[ne(J(ya),{size:24})]),_("span",tx,[_("strong",null,D(s.$t("Patient Portal")),1),_("small",null,D(s.$t("Your health, examinations, reports, and body.")),1)]),ne(J(Nh),{size:19})])]),_("div",nx,D(s.$t("Demo environment · Synthetic patient data only")),1)])]))}}),sx=at(ix,[["__scopeId","data-v-b2e232a2"]]),rx={class:"page-header"},ax={key:0},ox={class:"actions"},lx=it({__name:"PageHeader",props:{title:{},subtitle:{}},setup(n){return(e,t)=>(Z(),de("div",rx,[_("div",null,[_("h1",null,D(e.$t(n.title)),1),n.subtitle?(Z(),de("p",ax,D(e.$t(n.subtitle)),1)):tt("",!0)]),_("div",ox,[Hp(e.$slots,"actions",{},void 0)])]))}}),Ir=at(lx,[["__scopeId","data-v-cba43d34"]]),cx={class:"stats-icon"},ux={class:"stats-copy"},dx={class:"stats-label"},hx=it({__name:"StatsCard",props:{label:{},value:{},note:{default:"vs last week"},icon:{},tone:{default:"teal"}},setup(n){return(e,t)=>(Z(),de("article",{class:Yt(["stats-card",`tone-${n.tone}`])},[_("div",cx,[(Z(),bt(zp(n.icon),{size:19}))]),_("div",ux,[_("span",dx,D(e.$t(n.label)),1),_("strong",null,D(e.$t(n.value)),1),_("small",null,D(e.$t(n.note)),1)])],2))}}),$a=at(hx,[["__scopeId","data-v-5649a5f6"]]),fx={class:"search-bar"},px=["value","placeholder"],mx=["aria-label"],gx=it({__name:"SearchBar",props:{modelValue:{},placeholder:{default:"Search patients..."}},emits:["update:modelValue"],setup(n,{emit:e}){const t=n,i=e;function s(r){i("update:modelValue",r)}return(r,a)=>(Z(),de("label",fx,[ne(J(Nm),{size:17}),_("input",{value:t.modelValue,type:"search",placeholder:r.$t(n.placeholder),onInput:a[0]||(a[0]=o=>s(o.target.value))},null,40,px),t.modelValue?(Z(),de("button",{key:0,type:"button","aria-label":r.$t("Clear search"),onClick:a[1]||(a[1]=o=>s(""))},[ne(J(Ta),{size:14})],8,mx)):tt("",!0)]))}}),Bm=at(gx,[["__scopeId","data-v-d67c973a"]]),vx={},_x={class:"filter-bar"};function yx(n,e){return Z(),de("div",_x,[Hp(n.$slots,"default",{},void 0)])}const zm=at(vx,[["render",yx],["__scopeId","data-v-67566ff0"]]),bx=it({__name:"RiskBadge",props:{level:{}},setup(n){const e=n,t=Me(()=>e.level.toLowerCase());return(i,s)=>(Z(),de("span",{class:Yt(["risk-badge",t.value])},D(i.$t(n.level)),3))}}),Ca=at(bx,[["__scopeId","data-v-d157f13f"]]),xx=it({__name:"StatusBadge",props:{status:{}},setup(n){const e=n,t=Me(()=>e.status.toLowerCase().replace(/\s+/g,"-"));return(i,s)=>(Z(),de("span",{class:Yt(["status-badge",t.value])},[s[0]||(s[0]=_("span",{class:"dot"},null,-1)),ot(" "+D(i.$t(n.status)),1)],2))}}),Is=at(xx,[["__scopeId","data-v-0ce44cbb"]]),Sx={class:"table-wrap"},Mx={class:"patient-table"},Ex={class:"action-col"},wx={class:"sr-only"},Ax=["onClick","onKeydown"],Tx={class:"patient-cell"},Rx={class:"mono"},Cx={class:"modality"},Px={class:"action-col"},Ix=it({__name:"PatientTable",props:{patients:{},selectedId:{}},emits:["select"],setup(n,{emit:e}){const t=e;function i(s){return new Intl.DateTimeFormat("en",{year:"numeric",month:"short",day:"2-digit"}).format(new Date(`${s}T00:00:00`))}return(s,r)=>(Z(),de("div",Sx,[_("table",Mx,[_("thead",null,[_("tr",null,[_("th",null,D(s.$t("Patient")),1),_("th",null,D(s.$t("ID")),1),_("th",null,D(s.$t("Age")),1),_("th",null,D(s.$t("Gender")),1),_("th",null,D(s.$t("Latest Examination")),1),_("th",null,D(s.$t("Modality")),1),_("th",null,D(s.$t("Organ")),1),_("th",null,D(s.$t("AI Status")),1),_("th",null,D(s.$t("Risk")),1),_("th",Ex,[_("span",wx,D(s.$t("Action")),1)])])]),_("tbody",null,[(Z(!0),de(lt,null,kt(n.patients,a=>(Z(),de("tr",{key:a.id,class:Yt({"is-selected":a.id===n.selectedId}),tabindex:"0",onClick:o=>t("select",a),onKeydown:r0(o=>t("select",a),["enter"])},[_("td",null,[_("div",Tx,[_("span",{class:"patient-avatar",style:Pi({background:a.avatarColor})},D(s.$t(a.name.split(" ").map(o=>o[0]).join(""))),5),_("strong",null,D(s.$t(a.name)),1)])]),_("td",Rx,D(s.$t(a.id)),1),_("td",null,D(s.$t(a.age)),1),_("td",null,D(s.$t(a.gender)),1),_("td",null,D(s.$t(i(a.lastExamDate))),1),_("td",null,[_("span",Cx,D(s.$t(a.modality)),1)]),_("td",null,D(s.$t(a.organ)),1),_("td",null,[ne(Is,{status:a.aiStatus},null,8,["status"])]),_("td",null,[ne(Ca,{level:a.risk},null,8,["level"])]),_("td",Px,[ne(J(Aa),{size:17})])],42,Ax))),128))])])]))}}),Vm=at(Ix,[["__scopeId","data-v-f4a4990f"]]),Dx={class:"page"},Lx={class:"grid four-col stats-grid"},Ux={class:"dashboard-grid"},Nx={class:"patient-section"},Ox={class:"card"},Fx={class:"card-header"},kx={class:"muted"},Bx={class:"filter-row"},zx=["aria-label"],Vx=["value"],Hx=["aria-label"],$x=["value"],Gx=["aria-label"],Wx=["value"],Xx=["aria-label"],qx=["value"],Yx=["aria-label"],jx={value:"All"},Kx={value:"Today"},Zx={value:"Recent"},Jx={class:"selected-panel card"},Qx={class:"card-header"},eS={key:0,class:"selected-content"},tS={class:"selected-person"},nS={class:"selected-meta"},iS={class:"preview-caption"},sS={class:"selected-status"},rS={class:"selected-actions"},aS={key:1,class:"empty-state"},oS=it({__name:"DoctorDashboardView",setup(n){const e=Rn(),t=Nn(),i=pn(),s=si({search:"",modality:"All",organ:"All",status:"All",risk:"All",date:"All"}),r=ze("P20260021"),a=Me(()=>i.patients.length),o=Me(()=>i.patients.filter(g=>g.status==="Pending Review").length),l=Me(()=>i.patients.filter(g=>g.status==="Abnormal"||g.risk==="High").length),c=Me(()=>i.patients.filter(g=>g.lastExamDate==="2026-09-01").length),u=["All","CT","MRI","X-Ray"],d=Me(()=>["All",...new Set(i.patients.map(g=>g.organ))]),h=["All","Pending Review","AI Completed","Reviewed","Abnormal","Completed"],f=["All","Low","Medium","High"],b=Me(()=>{const g=s.search.trim().toLowerCase();return i.patients.filter(A=>{const S=!g||A.name.toLowerCase().includes(g)||A.id.toLowerCase().includes(g),m=s.modality==="All"||A.modality===s.modality,w=s.organ==="All"||A.organ===s.organ,T=s.status==="All"||A.status===s.status,R=s.risk==="All"||A.risk===s.risk,U=s.date==="All"||s.date==="Today"&&A.lastExamDate==="2026-09-01"||s.date==="Recent"&&A.lastExamDate>="2026-08-25";return S&&m&&w&&T&&R&&U})}),x=Me(()=>i.patients.find(g=>g.id===r.value)??null);function y(g){r.value=g.id,e.push({name:"doctor-patient-overview",params:{id:g.id}})}return sn(()=>{i.patients.length||i.loadPatients()}),(g,A)=>{var S;return Z(),de("div",Dx,[ne(Ir,{title:g.$t("Doctor Dashboard"),subtitle:g.$t(`Good morning, ${((S=J(t).session)==null?void 0:S.name)??"Doctor"}. Here is today's clinical queue.`)},{actions:Zi(()=>[ne(Bm,{modelValue:s.search,"onUpdate:modelValue":A[0]||(A[0]=m=>s.search=m),placeholder:g.$t("Search patient name or ID...")},null,8,["modelValue","placeholder"])]),_:1},8,["title","subtitle"]),_("section",Lx,[ne($a,{label:g.$t("Total Patients"),value:a.value,note:"Across all modules",icon:J(Om),tone:"teal"},null,8,["label","value","icon"]),ne($a,{label:g.$t("Pending Review"),value:o.value,note:"Needs doctor action",icon:J(rd),tone:"amber"},null,8,["label","value","icon"]),ne($a,{label:g.$t("Abnormal Findings"),value:l.value,note:"High priority cases",icon:J(jy),tone:"red"},null,8,["label","value","icon"]),ne($a,{label:g.$t("Today's Exams"),value:c.value,note:"Scheduled for review",icon:J(sd),tone:"blue"},null,8,["label","value","icon"])]),_("section",Ux,[_("div",Nx,[_("div",Ox,[_("div",Fx,[_("div",null,[_("h2",null,D(g.$t("Patient List")),1),_("p",kx,D(g.$t("Review and open the latest imaging studies.")),1)])]),_("div",Bx,[ne(zm,null,{default:Zi(()=>[Nt(_("select",{"onUpdate:modelValue":A[1]||(A[1]=m=>s.modality=m),class:"select","aria-label":g.$t("Modality filter")},[(Z(),de(lt,null,kt(u,m=>_("option",{key:m,value:m},D(g.$t(m)),9,Vx)),64))],8,zx),[[Mn,s.modality]]),Nt(_("select",{"onUpdate:modelValue":A[2]||(A[2]=m=>s.organ=m),class:"select","aria-label":g.$t("Organ filter")},[(Z(!0),de(lt,null,kt(d.value,m=>(Z(),de("option",{key:m,value:m},D(g.$t(m)),9,$x))),128))],8,Hx),[[Mn,s.organ]]),Nt(_("select",{"onUpdate:modelValue":A[3]||(A[3]=m=>s.status=m),class:"select","aria-label":g.$t("Status filter")},[(Z(),de(lt,null,kt(h,m=>_("option",{key:m,value:m},D(g.$t(m)),9,Wx)),64))],8,Gx),[[Mn,s.status]]),Nt(_("select",{"onUpdate:modelValue":A[4]||(A[4]=m=>s.risk=m),class:"select","aria-label":g.$t("Risk filter")},[(Z(),de(lt,null,kt(f,m=>_("option",{key:m,value:m},D(g.$t(m)),9,qx)),64))],8,Xx),[[Mn,s.risk]]),Nt(_("select",{"onUpdate:modelValue":A[5]||(A[5]=m=>s.date=m),class:"select","aria-label":g.$t("Date filter")},[_("option",jx,D(g.$t("All dates")),1),_("option",Kx,D(g.$t("Today")),1),_("option",Zx,D(g.$t("Last 7 days")),1)],8,Yx),[[Mn,s.date]])]),_:1})]),ne(Vm,{patients:b.value,"selected-id":r.value,onSelect:y},null,8,["patients","selected-id"])])]),_("aside",Jx,[_("div",Qx,[_("h3",null,D(g.$t("Selected Patient")),1)]),x.value?(Z(),de("div",eS,[_("div",tS,[_("span",{class:"large-avatar",style:Pi({background:x.value.avatarColor})},D(g.$t(x.value.name.split(" ").map(m=>m[0]).join(""))),5),_("div",null,[_("strong",null,D(g.$t(x.value.name)),1),_("span",null,D(g.$t(x.value.id)),1)])]),_("div",nS,[_("span",null,D(g.$t(x.value.age))+" "+D(g.$t("years")),1),_("span",null,D(g.$t(x.value.gender)),1),_("span",null,D(g.$t(x.value.modality))+" · "+D(g.$t(x.value.organ)),1)]),A[9]||(A[9]=_("div",{class:"ct-preview"},[_("div",{class:"lung-shape left"}),_("div",{class:"lung-shape right"}),_("span",{class:"preview-marker"})],-1)),_("div",iS,[_("span",null,[ne(J(xr),{size:14}),ot(" "+D(g.$t("Latest examination")),1)]),_("span",null,D(g.$t(x.value.lastExamDate)),1)]),_("div",sS,[ne(Is,{status:x.value.aiStatus},null,8,["status"]),ne(Ca,{level:x.value.risk},null,8,["level"])]),_("div",rS,[_("button",{type:"button",class:"btn btn-primary",onClick:A[6]||(A[6]=m=>J(e).push({name:"doctor-patient-imaging",params:{id:x.value.id}}))},[ne(J(xr),{size:16}),ot(" "+D(g.$t("View Imaging")),1)]),_("button",{type:"button",class:"btn btn-secondary",onClick:A[7]||(A[7]=m=>J(e).push({name:"doctor-patient-report",params:{id:x.value.id}}))},[ne(J(As),{size:16}),ot(" "+D(g.$t("View Report")),1)]),_("button",{type:"button",class:"btn btn-secondary",onClick:A[8]||(A[8]=m=>J(e).push({name:"doctor-patient-3d",params:{id:x.value.id}}))},[ne(J(Pr),{size:16}),ot(" "+D(g.$t("View 3D")),1)])])])):(Z(),de("div",aS,D(g.$t("Select a patient to preview their record.")),1))])])])}}}),lS=at(oS,[["__scopeId","data-v-68099f3c"]]),cS={class:"page"},uS={class:"card patient-list-card"},dS={class:"list-toolbar"},hS=["aria-label"],fS={value:"All"},pS={value:"CT"},mS={value:"MRI"},gS={value:"X-Ray"},vS=["aria-label"],_S=["aria-label"],yS={value:"All"},bS={value:"Pending Review"},xS={value:"AI Completed"},SS={value:"Reviewed"},MS={value:"Abnormal"},ES={value:"Completed"},wS=["aria-label"],AS={value:"All"},TS={value:"Low"},RS={value:"Medium"},CS={value:"High"},PS={class:"result-count"},IS=it({__name:"PatientListView",setup(n){const e=Rn(),t=pn(),i=si({search:"",modality:"All",organ:"All",status:"All",risk:"All"}),s=Me(()=>["All",...new Set(t.patients.map(o=>o.organ))]),r=Me(()=>{const o=i.search.trim().toLowerCase();return t.patients.filter(l=>{const c=!o||l.name.toLowerCase().includes(o)||l.id.toLowerCase().includes(o),u=i.modality==="All"||l.modality===i.modality,d=i.organ==="All"||l.organ===i.organ,h=i.status==="All"||l.status===i.status,f=i.risk==="All"||l.risk===i.risk;return c&&u&&d&&h&&f})});function a(o){e.push({name:"doctor-patient-overview",params:{id:o.id}})}return sn(()=>{t.patients.length||t.loadPatients()}),(o,l)=>(Z(),de("div",cS,[ne(Ir,{title:o.$t("Patients"),subtitle:o.$t("Search, filter, and open the complete patient record.")},{actions:Zi(()=>[ne(Bm,{modelValue:i.search,"onUpdate:modelValue":l[0]||(l[0]=c=>i.search=c)},null,8,["modelValue"])]),_:1},8,["title","subtitle"]),_("section",uS,[_("div",dS,[ne(zm,null,{default:Zi(()=>[Nt(_("select",{"onUpdate:modelValue":l[1]||(l[1]=c=>i.modality=c),class:"select","aria-label":o.$t("Modality filter")},[_("option",fS,D(o.$t("All")),1),_("option",pS,D(o.$t("CT")),1),_("option",mS,D(o.$t("MRI")),1),_("option",gS,D(o.$t("X-Ray")),1)],8,hS),[[Mn,i.modality]]),Nt(_("select",{"onUpdate:modelValue":l[2]||(l[2]=c=>i.organ=c),class:"select","aria-label":o.$t("Organ filter")},[(Z(!0),de(lt,null,kt(s.value,c=>(Z(),de("option",{key:c},D(o.$t(c)),1))),128))],8,vS),[[Mn,i.organ]]),Nt(_("select",{"onUpdate:modelValue":l[3]||(l[3]=c=>i.status=c),class:"select","aria-label":o.$t("Status filter")},[_("option",yS,D(o.$t("All")),1),_("option",bS,D(o.$t("Pending Review")),1),_("option",xS,D(o.$t("AI Completed")),1),_("option",SS,D(o.$t("Reviewed")),1),_("option",MS,D(o.$t("Abnormal")),1),_("option",ES,D(o.$t("Completed")),1)],8,_S),[[Mn,i.status]]),Nt(_("select",{"onUpdate:modelValue":l[4]||(l[4]=c=>i.risk=c),class:"select","aria-label":o.$t("Risk filter")},[_("option",AS,D(o.$t("All")),1),_("option",TS,D(o.$t("Low")),1),_("option",RS,D(o.$t("Medium")),1),_("option",CS,D(o.$t("High")),1)],8,wS),[[Mn,i.risk]])]),_:1}),_("span",PS,D(o.$t(r.value.length))+" "+D(o.$t("patients")),1)]),ne(Vm,{patients:r.value,onSelect:a},null,8,["patients"])])]))}}),DS=at(IS,[["__scopeId","data-v-c737054c"]]),LS={class:"page patient-detail"},US={key:0,class:"patient-hero card"},NS={class:"patient-identity"},OS={class:"name-row"},FS={class:"patient-status"},kS={class:"status-label"},BS={class:"latest-label"},zS=["aria-label"],VS={key:1,class:"loading"},HS={key:2,class:"empty-state"},$S=it({__name:"PatientDetailView",setup(n){const e=Ps(),t=Rn(),i=pn(),s=Me(()=>String(e.params.id)),r=Me(()=>i.selectedPatient),a=[{label:"Overview",name:"doctor-patient-overview"},{label:"Imaging",name:"doctor-patient-imaging"},{label:"AI Findings",name:"doctor-patient-ai"},{label:"Report",name:"doctor-patient-report"},{label:"3D Viewer",name:"doctor-patient-3d"}];async function o(){i.patients.length||await i.loadPatients(),await i.selectPatient(s.value),l()}function l(){const c=String(e.query.exam??"");i.examinations.some(u=>u.id===c)&&(i.activeExamId=c)}return sn(o),Bt(s,o),Bt(()=>e.query.exam,l),(c,u)=>{const d=fa("RouterLink"),h=fa("RouterView");return Z(),de("div",LS,[_("button",{type:"button",class:"back-link",onClick:u[0]||(u[0]=f=>J(t).push({name:"doctor-patients"}))},[ne(J(Im),{size:16}),ot(" "+D(c.$t("Patient List")),1)]),r.value?(Z(),de("section",US,[_("div",NS,[_("span",{class:"patient-avatar",style:Pi({background:r.value.avatarColor})},D(c.$t(r.value.name.split(" ").map(f=>f[0]).join(""))),5),_("div",null,[_("div",OS,[_("h1",null,D(c.$t(r.value.name)),1),ne(Ca,{level:r.value.risk},null,8,["level"])]),_("p",null,D(c.$t(r.value.id))+" · "+D(c.$t(r.value.age))+" "+D(c.$t("years ·"))+" "+D(c.$t(r.value.gender))+" "+D(c.$t("· ABO"))+" "+D(c.$t(r.value.bloodType))+" "+D(c.$t("· Rh(D)"))+" "+D(c.$t(r.value.rhType??"Unknown")),1)])]),_("div",FS,[_("span",kS,D(c.$t("Current status")),1),ne(Is,{status:r.value.status},null,8,["status"]),_("span",BS,D(c.$t("Latest:"))+" "+D(c.$t(r.value.modality))+" "+D(c.$t(r.value.organ)),1)])])):tt("",!0),_("nav",{class:"detail-tabs","aria-label":c.$t("Patient record sections")},[(Z(),de(lt,null,kt(a,f=>ne(d,{key:f.name,to:{name:f.name,params:{id:s.value},query:J(i).activeExamId?{exam:J(i).activeExamId}:{}},class:"detail-tab","active-class":"is-active"},{default:Zi(()=>[ot(D(c.$t(f.label)),1)]),_:2},1032,["to"])),64))],8,zS),J(i).loading?(Z(),de("div",VS,D(c.$t("Loading patient record...")),1)):J(i).error?(Z(),de("div",HS,D(c.$t(J(i).error)),1)):(Z(),bt(h,{key:3}))])}}}),GS=at($S,[["__scopeId","data-v-818ae9bc"]]),WS={class:"timeline"},XS=["onClick"],qS={class:"timeline-rail"},YS={class:"timeline-dot"},jS={key:0,class:"timeline-line"},KS={class:"timeline-content"},ZS=it({__name:"PatientTimeline",props:{examinations:{}},emits:["select"],setup(n,{emit:e}){const t=e;function i(s){return new Intl.DateTimeFormat("en",{year:"numeric",month:"short",day:"2-digit"}).format(new Date(`${s}T00:00:00`))}return(s,r)=>(Z(),de("div",WS,[(Z(!0),de(lt,null,kt(n.examinations,(a,o)=>(Z(),de("button",{key:a.id,class:"timeline-item",type:"button",onClick:l=>t("select",a)},[_("span",qS,[_("span",YS,[ne(J(xr),{size:13})]),o<n.examinations.length-1?(Z(),de("span",jS)):tt("",!0)]),_("span",KS,[_("strong",null,D(s.$t(a.type))+" · "+D(s.$t(a.organ)),1),_("span",null,D(s.$t(i(a.date))),1),ne(Is,{status:a.status},null,8,["status"])])],8,XS))),128))]))}}),JS=at(ZS,[["__scopeId","data-v-be27c45d"]]),QS={class:"record-card"},e1={class:"record-row"},t1={class:"record-row"},n1={class:"record-row"},i1={class:"record-row"},s1={class:"record-row"},r1=it({__name:"MedicalRecordCard",props:{patient:{}},setup(n){return(e,t)=>(Z(),de("article",QS,[_("div",e1,[ne(J(sd),{size:16}),_("span",null,D(e.$t("Age")),1),_("strong",null,D(e.$t(n.patient.age))+" "+D(e.$t("years ·"))+" "+D(e.$t(n.patient.gender)),1)]),_("div",t1,[ne(J(Fh),{size:16}),_("span",null,D(e.$t("ABO blood type")),1),_("strong",null,D(e.$t(n.patient.bloodType)),1)]),_("div",n1,[ne(J(Fh),{size:16}),_("span",null,D(e.$t("Rh(D)")),1),_("strong",null,D(e.$t(n.patient.rhType??"Unknown")),1)]),_("div",i1,[ne(J(Wy),{size:16}),_("span",null,D(e.$t("Contact")),1),_("strong",null,D(e.$t(n.patient.phone)),1)]),_("div",s1,[ne(J(qy),{size:16}),_("span",null,D(e.$t("Allergies")),1),_("strong",null,D(e.$t(n.patient.allergies.length?n.patient.allergies.join(", "):"None recorded")),1)])]))}}),a1=at(r1,[["__scopeId","data-v-1196d868"]]),o1={class:"finding-top"},l1={class:"finding-icon"},c1={class:"finding-title"},u1={class:"finding-description"},d1={key:0,class:"finding-meta"},h1=["for"],f1=["id","disabled"],p1=["for"],m1=["id","disabled"],g1=["for"],v1=["id","disabled"],_1={value:"Low"},y1={value:"Medium"},b1={value:"High"},x1={class:"finding-actions"},S1=["disabled"],M1=["disabled"],E1={key:2,class:"finding-actions"},w1=["disabled"],A1=["disabled"],T1=["disabled"],R1=["disabled"],C1={key:3,class:"action-message",role:"status"},P1={key:4,class:"action-error",role:"alert"},I1=it({__name:"AIResultCard",props:{finding:{},compact:{type:Boolean}},setup(n){const e=n,t=pn(),i=ze(!1),s=ze(!1),r=ze(""),a=ze(""),o=si({label:"",description:"",severity:"Low"});function l(){Object.assign(o,{label:e.finding.label,description:e.finding.description,severity:e.finding.severity}),i.value=!0,r.value="",a.value=""}async function c(u){s.value=!0,a.value="",r.value="";try{if(u==="modified"){if(!o.label.trim()||!o.description.trim()){a.value="Enter a finding title and description.";return}await t.modifyFinding(e.finding.id,{...o,label:o.label.trim(),description:o.description.trim()}),i.value=!1}else await t.updateFindingStatus(e.finding.id,u);r.value=u==="confirmed"?"Finding confirmed.":u==="dismissed"?"Finding dismissed. It will not be included in the report.":u==="pending"?"Finding restored for review.":"Changes saved."}catch{a.value="Save failed. Please try again."}finally{s.value=!1}}return(u,d)=>(Z(),de("article",{class:Yt(["finding-card",n.finding.status,{compact:n.compact}])},[_("div",o1,[_("span",l1,[ne(J(Py),{size:18})]),_("div",c1,[_("strong",null,D(u.$t(n.finding.label)),1),_("span",null,D(u.$t(n.finding.side))+" "+D(u.$t(n.finding.location.replaceAll("_"," "))),1)]),ne(Ca,{level:n.finding.severity},null,8,["level"])]),_("p",u1,D(u.$t(n.finding.description)),1),n.compact?tt("",!0):(Z(),de("div",d1,[_("span",null,[ne(J(Ly),{size:14}),ot(" "+D(u.$t("Confidence"))+" "+D(u.$t(Math.round(n.finding.confidence*100)))+"% ",1)]),_("span",null,D(u.$t("Status:"))+" "+D(u.$t(n.finding.status)),1)])),i.value?(Z(),de("form",{key:1,class:"finding-edit",onSubmit:d[4]||(d[4]=rr(h=>c("modified"),["prevent"]))},[_("label",{class:"label",for:`${n.finding.id}-label`},D(u.$t("Finding title")),9,h1),Nt(_("input",{id:`${n.finding.id}-label`,"onUpdate:modelValue":d[0]||(d[0]=h=>o.label=h),class:"input",required:"",disabled:s.value},null,8,f1),[[Wi,o.label]]),_("label",{class:"label",for:`${n.finding.id}-description`},D(u.$t("Description")),9,p1),Nt(_("textarea",{id:`${n.finding.id}-description`,"onUpdate:modelValue":d[1]||(d[1]=h=>o.description=h),class:"textarea",required:"",disabled:s.value},null,8,m1),[[Wi,o.description]]),_("label",{class:"label",for:`${n.finding.id}-severity`},D(u.$t("Risk level")),9,g1),Nt(_("select",{id:`${n.finding.id}-severity`,"onUpdate:modelValue":d[2]||(d[2]=h=>o.severity=h),class:"select",disabled:s.value},[_("option",_1,D(u.$t("Low")),1),_("option",y1,D(u.$t("Medium")),1),_("option",b1,D(u.$t("High")),1)],8,v1),[[Mn,o.severity]]),_("div",x1,[_("button",{class:"btn btn-sm btn-primary",disabled:s.value},D(u.$t(s.value?"Saving...":"Save changes")),9,S1),_("button",{type:"button",class:"btn btn-sm btn-secondary",disabled:s.value,onClick:d[3]||(d[3]=h=>i.value=!1)},D(u.$t("Cancel")),9,M1)])],32)):tt("",!0),!n.compact&&!i.value?(Z(),de("div",E1,[_("button",{type:"button",class:"btn btn-sm btn-secondary",disabled:s.value||n.finding.status==="confirmed",onClick:d[5]||(d[5]=h=>c("confirmed"))},[ne(J(Dm),{size:14}),ot(" "+D(u.$t("Confirm")),1)],8,w1),_("button",{type:"button",class:"btn btn-sm btn-secondary",disabled:s.value,onClick:l},[ne(J(cd),{size:14}),ot(" "+D(u.$t("Modify")),1)],8,A1),n.finding.status!=="dismissed"?(Z(),de("button",{key:0,type:"button",class:"btn btn-sm btn-danger",disabled:s.value,onClick:d[6]||(d[6]=h=>c("dismissed"))},[ne(J(Ta),{size:14}),ot(" "+D(u.$t("Dismiss")),1)],8,T1)):(Z(),de("button",{key:1,type:"button",class:"btn btn-sm btn-secondary",disabled:s.value,onClick:d[7]||(d[7]=h=>c("pending"))},D(u.$t("Undo dismiss")),9,R1))])):tt("",!0),r.value?(Z(),de("p",C1,D(u.$t(r.value)),1)):tt("",!0),a.value?(Z(),de("p",P1,D(u.$t(a.value)),1)):tt("",!0)],2))}}),dd=at(I1,[["__scopeId","data-v-92da2eb4"]]),D1={class:"report-card"},L1={class:"report-header"},U1={class:"report-icon"},N1={class:"report-heading"},O1={class:"report-content"},F1={class:"report-section"},k1={class:"report-footer"},B1=it({__name:"ReportCard",props:{report:{},patientFacing:{type:Boolean}},setup(n){return(e,t)=>(Z(),de("article",D1,[_("div",L1,[_("span",U1,[ne(J(As),{size:18})]),_("div",N1,[_("strong",null,D(e.$t("Final Diagnosis")),1),_("span",null,D(e.$t(n.report.date)),1)]),_("span",{class:Yt(["review-state",{reviewed:n.report.reviewed}])},[n.report.reviewed?(Z(),bt(J(Lm),{key:0,size:14})):(Z(),bt(J(rd),{key:1,size:14})),ot(" "+D(e.$t(n.report.reviewed?"Doctor Reviewed":"Pending Review")),1)],2)]),_("h4",null,D(e.$t(n.report.diagnosis)),1),_("p",null,D(e.$t(n.report.description)),1),_("div",O1,[_("div",F1,[_("span",null,D(e.$t("Recommendation")),1),_("p",null,D(e.$t(n.report.recommendation)),1)]),_("div",k1,[_("span",null,D(e.$t(n.report.reviewed?"Signed by":"Prepared by"))+" "+D(e.$t(n.report.doctor)),1),_("span",null,D(e.$t(n.report.date)),1)])])]))}}),Dr=at(B1,[["__scopeId","data-v-0fe51917"]]),z1={class:"overview-grid"},V1={class:"main-column"},H1={class:"card"},$1={class:"card-header"},G1={class:"muted"},W1={class:"card-body"},X1={class:"card"},q1={class:"card-header"},Y1={class:"muted"},j1={class:"card-body stack"},K1={key:0,class:"finding-grid"},Z1={key:1,class:"empty-state"},J1={class:"side-column"},Q1={key:0},eM={class:"section-heading"},tM={class:"card report-block"},nM={class:"card-header"},iM={class:"muted"},sM={class:"card-body"},rM={key:1,class:"empty-state"},aM=it({__name:"PatientOverviewView",setup(n){const e=Ps(),t=Rn(),i=pn(),s=Me(()=>String(e.params.id)),r=Me(()=>i.examinations[0]),a=Me(()=>r.value?i.findings.filter(c=>{var u;return c.examinationId===((u=r.value)==null?void 0:u.id)}):[]),o=Me(()=>r.value?i.reports.find(c=>{var u;return c.examinationId===((u=r.value)==null?void 0:u.id)}):void 0);function l(c){t.push({name:"doctor-patient-imaging",params:{id:s.value},query:{exam:c.id}})}return(c,u)=>{var d;return Z(),de("div",z1,[_("section",V1,[_("div",H1,[_("div",$1,[_("div",null,[_("h3",null,D(c.$t("Examination Timeline")),1),_("p",G1,D(c.$t("Historical studies for"))+" "+D(c.$t((d=J(i).selectedPatient)==null?void 0:d.name)),1)])]),_("div",W1,[ne(JS,{examinations:J(i).examinations,onSelect:l},null,8,["examinations"])])]),_("div",X1,[_("div",q1,[_("div",null,[_("h3",null,D(c.$t("AI Findings")),1),_("p",Y1,D(c.$t("External AI output shown for clinical review.")),1)]),_("button",{type:"button",class:"btn btn-sm btn-secondary",onClick:u[0]||(u[0]=h=>J(t).push({name:"doctor-patient-ai",params:{id:s.value}}))},D(c.$t("Review all")),1)]),_("div",j1,[a.value.length?(Z(),de("div",K1,[(Z(!0),de(lt,null,kt(a.value,h=>(Z(),bt(dd,{key:h.id,finding:h},null,8,["finding"]))),128))])):(Z(),de("div",Z1,D(c.$t("No AI findings for the latest examination.")),1))])])]),_("aside",J1,[J(i).selectedPatient?(Z(),de("div",Q1,[_("div",eM,[_("h3",null,D(c.$t("Patient Information")),1)]),ne(a1,{patient:J(i).selectedPatient},null,8,["patient"])])):tt("",!0),_("div",tM,[_("div",nM,[_("div",null,[_("h3",null,D(c.$t("Doctor Report")),1),_("p",iM,D(c.$t("Latest clinical summary.")),1)])]),_("div",sM,[o.value?(Z(),bt(Dr,{key:0,report:o.value},null,8,["report"])):(Z(),de("div",rM,D(c.$t("No report has been drafted.")),1))])])])])}}}),oM=at(aM,[["__scopeId","data-v-1c28226a"]]),lM=it({__name:"SyntheticSlice",props:{modality:{},orientation:{},sliceIndex:{},sliceCount:{},preset:{default:"lung"},showGrid:{type:Boolean,default:!0},findings:{default:()=>[]},activeFindingId:{default:null},zoom:{default:1}},emits:["selectFinding"],setup(n,{emit:e}){const t=n,i=e,s=ze(null),r=ze([]);let a=null;const o={lung:"#0c1518",brain:"#0b1118",bone:"#15110d",soft:"#0d1415"},l={lung:"rgba(204,235,232,0.34)",brain:"rgba(205,220,238,0.34)",bone:"rgba(238,220,183,0.38)",soft:"rgba(214,227,228,0.34)"};function c(m,w,T){m.save(),m.strokeStyle="rgba(255,255,255,0.08)",m.lineWidth=1;const R=Math.max(24,Math.min(w,T)/14);for(let U=R;U<w;U+=R)m.beginPath(),m.moveTo(U,0),m.lineTo(U,T),m.stroke();for(let U=R;U<T;U+=R)m.beginPath(),m.moveTo(0,U),m.lineTo(w,U),m.stroke();m.restore()}function u(m,w,T){const R=w/2,U=T/2,M=Math.min(w,T)*.34,C=Math.sin(t.sliceIndex*.7)*M*.04;m.fillStyle="#283b3d",m.beginPath(),m.ellipse(R,U,M*1.32,M*1.02,0,0,Math.PI*2),m.fill(),m.strokeStyle="#496263",m.stroke(),m.fillStyle="rgba(0,0,0,0.82)",m.beginPath(),m.ellipse(R-M*.42,U,M*.5,M*.74+C,0,0,Math.PI*2),m.fill(),m.beginPath(),m.ellipse(R+M*.42,U,M*.5,M*.74+C,0,0,Math.PI*2),m.fill(),m.strokeStyle=l[t.preset],m.lineWidth=1.2,m.beginPath(),m.ellipse(R,U,M*.16,M*.43,0,0,Math.PI*2),m.stroke();for(let F=-1;F<=1;F+=2)for(let G=0;G<5;G+=1)m.beginPath(),m.moveTo(R+F*M*.16,U+M*.16),m.lineTo(R+F*M*(.58+G*.06),U+M*(.24+G*.13)),m.stroke()}function d(m,w,T){const R=w/2,U=T*.52,M=T*.46,C=w*.17;m.fillStyle="#1d2d30",m.beginPath(),m.moveTo(R,T*.05),m.lineTo(R-w*.34,T*.28),m.lineTo(R-w*.28,T*.92),m.lineTo(R+w*.28,T*.92),m.lineTo(R+w*.34,T*.28),m.closePath(),m.fill(),m.strokeStyle="#496263",m.stroke(),m.fillStyle="rgba(0,0,0,0.82)",m.beginPath(),m.ellipse(R-w*.12,U,C,M,0,0,Math.PI*2),m.fill(),m.beginPath(),m.ellipse(R+w*.12,U,C,M,0,0,Math.PI*2),m.fill(),m.strokeStyle=l[t.preset],m.lineWidth=1.2,m.beginPath(),m.moveTo(R,T*.15),m.lineTo(R,T*.82),m.stroke()}function h(m,w,T){const R=w*.48,U=T*.52;m.fillStyle="#1d2d30",m.beginPath(),m.moveTo(R-w*.32,T*.05),m.quadraticCurveTo(R+w*.1,T*.02,R+w*.34,T*.26),m.lineTo(R+w*.22,T*.91),m.lineTo(R-w*.22,T*.91),m.lineTo(R-w*.3,T*.3),m.closePath(),m.fill(),m.strokeStyle="#496263",m.stroke(),m.fillStyle="rgba(0,0,0,0.82)",m.beginPath(),m.ellipse(R,U,w*.22,T*.3,-.08,0,Math.PI*2),m.fill(),m.strokeStyle=l[t.preset],m.lineWidth=1.2,m.beginPath(),m.moveTo(R-w*.03,T*.12),m.lineTo(R+w*.03,T*.72),m.stroke()}function f(m,w,T){const R=w/2,U=T/2,M=t.orientation==="axial",C=M?w*.32:w*.27,F=M?T*.35:T*.4;m.fillStyle="#25323d",m.beginPath(),m.ellipse(R,U,C,F,0,0,Math.PI*2),m.fill(),m.strokeStyle="#546674",m.lineWidth=2,m.stroke(),m.strokeStyle="rgba(205,220,238,0.18)",m.lineWidth=1;for(let G=1;G<6;G+=1)m.beginPath(),m.ellipse(R,U,C*(G/6),F*(G/6),0,0,Math.PI*2),m.stroke();m.fillStyle="rgba(218,229,239,0.12)",m.beginPath(),m.ellipse(R,U-F*.08,C*.43,F*.58,0,0,Math.PI*2),m.fill()}function b(m,w,T){const R=w/2,U=T/2,M=Math.min(w,T)*.35;m.fillStyle="#111b20",m.beginPath(),m.moveTo(R-M*.62,U-M*.52),m.quadraticCurveTo(R-M*1.02,U-M*.18,R-M*.9,U+M*.28),m.lineTo(R-M*.16,U+M*.58),m.lineTo(R+M*.16,U+M*.58),m.lineTo(R+M*.9,U+M*.28),m.quadraticCurveTo(R+M*1.02,U-M*.18,R+M*.62,U-M*.52),m.closePath(),m.fill(),m.strokeStyle="rgba(224,239,236,0.34)",m.lineWidth=1.2,m.stroke(),m.fillStyle="rgba(230,240,236,0.2)",m.beginPath(),m.ellipse(R,U+M*.06,M*.25,M*.37,0,0,Math.PI*2),m.fill(),m.strokeStyle="rgba(224,239,236,0.2)";for(let C=-1;C<=1;C+=2)for(let F=0;F<5;F+=1)m.beginPath(),m.moveTo(R+C*M*.08,U-M*.18),m.lineTo(R+C*M*(.18+F*.05),U+M*(.04+F*.05)),m.stroke()}function x(m,w,T){const R=m.side==="right"?1:-1,U=m.location.includes("upper")?-.2:m.location.includes("lower")?.22:0;return t.modality==="MRI"?{x:w/2+R*w*.14,y:T/2-T*.16}:t.modality==="X-Ray"?{x:w/2+R*w*.2,y:T/2-T*.08}:t.orientation==="axial"?{x:w/2+R*w*.16,y:T/2+U*T}:t.orientation==="coronal"?{x:w/2+R*w*.12,y:T*.52+U*T}:{x:w*.48+R*w*.03,y:T*.52+U*T}}function y(m,w,T){r.value=[];const R=Math.ceil(t.sliceCount*.58);(t.findings??[]).forEach(M=>{if(!(t.orientation!=="axial"||Math.abs(t.sliceIndex-R)<=2))return;const F=x(M,w,T);r.value.push({finding:M,...F}),m.save(),m.shadowColor="rgba(255,90,102,0.9)",m.shadowBlur=13,m.strokeStyle="#ff6b75",m.fillStyle="rgba(255,107,117,0.28)",m.lineWidth=2,m.beginPath(),m.arc(F.x,F.y,8,0,Math.PI*2),m.fill(),m.stroke(),m.shadowBlur=0,m.fillStyle="#ffffff",m.beginPath(),m.arc(F.x,F.y,2.5,0,Math.PI*2),m.fill(),m.restore()})}function g(){const m=s.value;if(!m)return;const w=m.parentElement;if(!w)return;const T=w.getBoundingClientRect(),R=window.devicePixelRatio||1;m.width=Math.max(1,Math.round(T.width*R)),m.height=Math.max(1,Math.round(T.height*R)),m.style.width=`${T.width}px`,m.style.height=`${T.height}px`}function A(){const m=s.value;if(!m)return;const w=m.getContext("2d");if(!w)return;const T=m.clientWidth,R=m.clientHeight,U=window.devicePixelRatio||1;w.setTransform(U,0,0,U,0,0),w.fillStyle=o[t.preset],w.fillRect(0,0,T,R),t.showGrid&&c(w,T,R),t.modality==="CT"?(t.orientation==="axial"&&u(w,T,R),t.orientation==="coronal"&&d(w,T,R),t.orientation==="sagittal"&&h(w,T,R),t.orientation==="projection"&&b(w,T,R)):t.modality==="MRI"?f(w,T,R):b(w,T,R),y(w,T,R)}function S(m){const w=s.value;if(!w)return;const T=w.getBoundingClientRect(),R=(m.clientX-T.left)/t.zoom,U=(m.clientY-T.top)/t.zoom,M=r.value.find(C=>Math.hypot(C.x-R,C.y-U)<18);M&&i("selectFinding",M.finding.id)}return sn(()=>{a=new ResizeObserver(()=>{g(),A()}),s.value&&(a.observe(s.value.parentElement),g(),A())}),Bt(()=>[t.modality,t.orientation,t.sliceIndex,t.preset,t.showGrid,t.findings],()=>A(),{deep:!0}),ns(()=>{a==null||a.disconnect()}),(m,w)=>(Z(),de("canvas",{ref_key:"canvasRef",ref:s,class:"slice-canvas",onClick:S},null,512))}}),Ga=at(lM,[["__scopeId","data-v-68c8ba1b"]]);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const hd="172",dr={ROTATE:0,DOLLY:1,PAN:2},ar={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},cM=0,Hh=1,uM=2,Hm=1,dM=2,gi=3,Qi=0,yn=1,Ln=2,Xi=0,hr=1,$h=2,Gh=3,Wh=4,hM=5,gs=100,fM=101,pM=102,mM=103,gM=104,vM=200,_M=201,yM=202,bM=203,Kc=204,Zc=205,xM=206,SM=207,MM=208,EM=209,wM=210,AM=211,TM=212,RM=213,CM=214,Jc=0,Qc=1,eu=2,Sr=3,tu=4,nu=5,iu=6,su=7,$m=0,PM=1,IM=2,qi=0,DM=1,LM=2,UM=3,vl=4,NM=5,OM=6,FM=7,Gm=300,Mr=301,Er=302,ru=303,au=304,_l=306,ou=1e3,bs=1001,lu=1002,Wn=1003,kM=1004,Wa=1005,Hn=1006,Yl=1007,xs=1008,Ci=1009,Wm=1010,Xm=1011,ba=1012,fd=1013,Ts=1014,xi=1015,Pa=1016,pd=1017,md=1018,wr=1020,qm=35902,Ym=1021,jm=1022,$n=1023,Km=1024,Zm=1025,fr=1026,Ar=1027,Jm=1028,gd=1029,Qm=1030,vd=1031,_d=1033,Ao=33776,To=33777,Ro=33778,Co=33779,cu=35840,uu=35841,du=35842,hu=35843,fu=36196,pu=37492,mu=37496,gu=37808,vu=37809,_u=37810,yu=37811,bu=37812,xu=37813,Su=37814,Mu=37815,Eu=37816,wu=37817,Au=37818,Tu=37819,Ru=37820,Cu=37821,Po=36492,Pu=36494,Iu=36495,eg=36283,Du=36284,Lu=36285,Uu=36286,BM=3200,zM=3201,tg=0,VM=1,$i="",un="srgb",Tr="srgb-linear",Xo="linear",St="srgb",Fs=7680,Xh=519,HM=512,$M=513,GM=514,ng=515,WM=516,XM=517,qM=518,YM=519,Nu=35044,qh="300 es",Si=2e3,qo=2001;class Ds{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],sa=Math.PI/180,Ou=180/Math.PI;function Yi(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]+"-"+en[e&255]+en[e>>8&255]+"-"+en[e>>16&15|64]+en[e>>24&255]+"-"+en[t&63|128]+en[t>>8&255]+"-"+en[t>>16&255]+en[t>>24&255]+en[i&255]+en[i>>8&255]+en[i>>16&255]+en[i>>24&255]).toLowerCase()}function nt(n,e,t){return Math.max(e,Math.min(t,n))}function jM(n,e){return(n%e+e)%e}function jl(n,e,t){return(1-t)*n+t*e}function ni(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Mt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const KM={DEG2RAD:sa};class Ee{constructor(e=0,t=0){Ee.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(nt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Qe{constructor(e,t,i,s,r,a,o,l,c){Qe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c)}set(e,t,i,s,r,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=i,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],u=i[4],d=i[7],h=i[2],f=i[5],b=i[8],x=s[0],y=s[3],g=s[6],A=s[1],S=s[4],m=s[7],w=s[2],T=s[5],R=s[8];return r[0]=a*x+o*A+l*w,r[3]=a*y+o*S+l*T,r[6]=a*g+o*m+l*R,r[1]=c*x+u*A+d*w,r[4]=c*y+u*S+d*T,r[7]=c*g+u*m+d*R,r[2]=h*x+f*A+b*w,r[5]=h*y+f*S+b*T,r[8]=h*g+f*m+b*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-i*r*u+i*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=u*a-o*c,h=o*l-u*r,f=c*r-a*l,b=t*d+i*h+s*f;if(b===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/b;return e[0]=d*x,e[1]=(s*c-u*i)*x,e[2]=(o*i-s*a)*x,e[3]=h*x,e[4]=(u*t-s*l)*x,e[5]=(s*r-o*t)*x,e[6]=f*x,e[7]=(i*l-c*t)*x,e[8]=(a*t-i*r)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Kl.makeScale(e,t)),this}rotate(e){return this.premultiply(Kl.makeRotation(-e)),this}translate(e,t){return this.premultiply(Kl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Kl=new Qe;function ig(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Yo(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function ZM(){const n=Yo("canvas");return n.style.display="block",n}const Yh={};function sr(n){n in Yh||(Yh[n]=!0,console.warn(n))}function JM(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}function QM(n){const e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function eE(n){const e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const jh=new Qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Kh=new Qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function tE(){const n={enabled:!0,workingColorSpace:Tr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===St&&(s.r=wi(s.r),s.g=wi(s.g),s.b=wi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===St&&(s.r=pr(s.r),s.g=pr(s.g),s.b=pr(s.b))),s},fromWorkingColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},toWorkingColorSpace:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===$i?Xo:this.spaces[s].transfer},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Tr]:{primaries:e,whitePoint:i,transfer:Xo,toXYZ:jh,fromXYZ:Kh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:un},outputColorSpaceConfig:{drawingBufferColorSpace:un}},[un]:{primaries:e,whitePoint:i,transfer:St,toXYZ:jh,fromXYZ:Kh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:un}}}),n}const ht=tE();function wi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function pr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let ks;class nE{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ks===void 0&&(ks=Yo("canvas")),ks.width=e.width,ks.height=e.height;const i=ks.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=ks}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Yo("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=wi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(wi(t[i]/255)*255):t[i]=wi(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let iE=0;class sg{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:iE++}),this.uuid=Yi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Zl(s[a].image)):r.push(Zl(s[a]))}else r=Zl(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function Zl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?nE.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let sE=0;class fn extends Ds{constructor(e=fn.DEFAULT_IMAGE,t=fn.DEFAULT_MAPPING,i=bs,s=bs,r=Hn,a=xs,o=$n,l=Ci,c=fn.DEFAULT_ANISOTROPY,u=$i){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:sE++}),this.uuid=Yi(),this.name="",this.source=new sg(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ee(0,0),this.repeat=new Ee(1,1),this.center=new Ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Gm)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ou:e.x=e.x-Math.floor(e.x);break;case bs:e.x=e.x<0?0:1;break;case lu:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ou:e.y=e.y-Math.floor(e.y);break;case bs:e.y=e.y<0?0:1;break;case lu:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}fn.DEFAULT_IMAGE=null;fn.DEFAULT_MAPPING=Gm;fn.DEFAULT_ANISOTROPY=1;class Lt{constructor(e=0,t=0,i=0,s=1){Lt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],f=l[5],b=l[9],x=l[2],y=l[6],g=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-x)<.01&&Math.abs(b-y)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+x)<.1&&Math.abs(b+y)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const S=(c+1)/2,m=(f+1)/2,w=(g+1)/2,T=(u+h)/4,R=(d+x)/4,U=(b+y)/4;return S>m&&S>w?S<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(S),s=T/i,r=R/i):m>w?m<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(m),i=T/s,r=U/s):w<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),i=R/r,s=U/r),this.set(i,s,r,t),this}let A=Math.sqrt((y-b)*(y-b)+(d-x)*(d-x)+(h-u)*(h-u));return Math.abs(A)<.001&&(A=1),this.x=(y-b)/A,this.y=(d-x)/A,this.z=(h-u)/A,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class rE extends Ds{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Lt(0,0,e,t),this.scissorTest=!1,this.viewport=new Lt(0,0,e,t);const s={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Hn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const r=new fn(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;const t=Object.assign({},e.texture.image);return this.texture.source=new sg(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Rs extends rE{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class rg extends fn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Wn,this.minFilter=Wn,this.wrapR=bs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class aE extends fn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Wn,this.minFilter=Wn,this.wrapR=bs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Cs{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let l=i[s+0],c=i[s+1],u=i[s+2],d=i[s+3];const h=r[a+0],f=r[a+1],b=r[a+2],x=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d;return}if(o===1){e[t+0]=h,e[t+1]=f,e[t+2]=b,e[t+3]=x;return}if(d!==x||l!==h||c!==f||u!==b){let y=1-o;const g=l*h+c*f+u*b+d*x,A=g>=0?1:-1,S=1-g*g;if(S>Number.EPSILON){const w=Math.sqrt(S),T=Math.atan2(w,g*A);y=Math.sin(y*T)/w,o=Math.sin(o*T)/w}const m=o*A;if(l=l*y+h*m,c=c*y+f*m,u=u*y+b*m,d=d*y+x*m,y===1-o){const w=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=w,c*=w,u*=w,d*=w}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,s,r,a){const o=i[s],l=i[s+1],c=i[s+2],u=i[s+3],d=r[a],h=r[a+1],f=r[a+2],b=r[a+3];return e[t]=o*b+u*d+l*f-c*h,e[t+1]=l*b+u*h+c*d-o*f,e[t+2]=c*b+u*f+o*h-l*d,e[t+3]=u*b-o*d-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),u=o(s/2),d=o(r/2),h=l(i/2),f=l(s/2),b=l(r/2);switch(a){case"XYZ":this._x=h*u*d+c*f*b,this._y=c*f*d-h*u*b,this._z=c*u*b+h*f*d,this._w=c*u*d-h*f*b;break;case"YXZ":this._x=h*u*d+c*f*b,this._y=c*f*d-h*u*b,this._z=c*u*b-h*f*d,this._w=c*u*d+h*f*b;break;case"ZXY":this._x=h*u*d-c*f*b,this._y=c*f*d+h*u*b,this._z=c*u*b+h*f*d,this._w=c*u*d-h*f*b;break;case"ZYX":this._x=h*u*d-c*f*b,this._y=c*f*d+h*u*b,this._z=c*u*b-h*f*d,this._w=c*u*d+h*f*b;break;case"YZX":this._x=h*u*d+c*f*b,this._y=c*f*d+h*u*b,this._z=c*u*b-h*f*d,this._w=c*u*d-h*f*b;break;case"XZY":this._x=h*u*d-c*f*b,this._y=c*f*d-h*u*b,this._z=c*u*b+h*f*d,this._w=c*u*d+h*f*b;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=i+o+d;if(h>0){const f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(i>o&&i>d){const f=2*Math.sqrt(1+i-o-d);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>d){const f=2*Math.sqrt(1+o-i-d);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+d-i-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-i*c,this._z=r*u+a*c+i*l-s*o,this._w=a*u-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,s=this._y,r=this._z,a=this._w;let o=a*e._w+i*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const f=1-t;return this._w=f*a+t*this._w,this._x=f*i+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,o),d=Math.sin((1-t)*u)/c,h=Math.sin(t*u)/c;return this._w=a*d+this._w*h,this._x=i*d+this._x*h,this._y=s*d+this._y*h,this._z=r*d+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class V{constructor(e=0,t=0,i=0){V.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Zh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Zh.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*i),u=2*(o*t-r*s),d=2*(r*i-a*t);return this.x=t+l*c+a*d-o*u,this.y=i+l*u+o*c-r*d,this.z=s+l*d+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Jl.copy(this).projectOnVector(e),this.sub(Jl)}reflect(e){return this.sub(Jl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(nt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Jl=new V,Zh=new Cs;class Ia{constructor(e=new V(1/0,1/0,1/0),t=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(kn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(kn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=kn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,kn):kn.fromBufferAttribute(r,a),kn.applyMatrix4(e.matrixWorld),this.expandByPoint(kn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Xa.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Xa.copy(i.boundingBox)),Xa.applyMatrix4(e.matrixWorld),this.union(Xa)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,kn),kn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Br),qa.subVectors(this.max,Br),Bs.subVectors(e.a,Br),zs.subVectors(e.b,Br),Vs.subVectors(e.c,Br),Li.subVectors(zs,Bs),Ui.subVectors(Vs,zs),os.subVectors(Bs,Vs);let t=[0,-Li.z,Li.y,0,-Ui.z,Ui.y,0,-os.z,os.y,Li.z,0,-Li.x,Ui.z,0,-Ui.x,os.z,0,-os.x,-Li.y,Li.x,0,-Ui.y,Ui.x,0,-os.y,os.x,0];return!Ql(t,Bs,zs,Vs,qa)||(t=[1,0,0,0,1,0,0,0,1],!Ql(t,Bs,zs,Vs,qa))?!1:(Ya.crossVectors(Li,Ui),t=[Ya.x,Ya.y,Ya.z],Ql(t,Bs,zs,Vs,qa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,kn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(kn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(di[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),di[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),di[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),di[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),di[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),di[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),di[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),di[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(di),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const di=[new V,new V,new V,new V,new V,new V,new V,new V],kn=new V,Xa=new Ia,Bs=new V,zs=new V,Vs=new V,Li=new V,Ui=new V,os=new V,Br=new V,qa=new V,Ya=new V,ls=new V;function Ql(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){ls.fromArray(n,r);const o=s.x*Math.abs(ls.x)+s.y*Math.abs(ls.y)+s.z*Math.abs(ls.z),l=e.dot(ls),c=t.dot(ls),u=i.dot(ls);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const oE=new Ia,zr=new V,ec=new V;class yl{constructor(e=new V,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):oE.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;zr.subVectors(e,this.center);const t=zr.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(zr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ec.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(zr.copy(e.center).add(ec)),this.expandByPoint(zr.copy(e.center).sub(ec))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const hi=new V,tc=new V,ja=new V,Ni=new V,nc=new V,Ka=new V,ic=new V;class bl{constructor(e=new V,t=new V(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,hi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=hi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(hi.copy(this.origin).addScaledVector(this.direction,t),hi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){tc.copy(e).add(t).multiplyScalar(.5),ja.copy(t).sub(e).normalize(),Ni.copy(this.origin).sub(tc);const r=e.distanceTo(t)*.5,a=-this.direction.dot(ja),o=Ni.dot(this.direction),l=-Ni.dot(ja),c=Ni.lengthSq(),u=Math.abs(1-a*a);let d,h,f,b;if(u>0)if(d=a*l-o,h=a*o-l,b=r*u,d>=0)if(h>=-b)if(h<=b){const x=1/u;d*=x,h*=x,f=d*(d+a*h+2*o)+h*(a*d+h+2*l)+c}else h=r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h<=-b?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c):h<=b?(d=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(tc).addScaledVector(ja,h),f}intersectSphere(e,t){hi.subVectors(e.center,this.origin);const i=hi.dot(this.direction),s=hi.dot(hi)-i*i,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(o=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,hi)!==null}intersectTriangle(e,t,i,s,r){nc.subVectors(t,e),Ka.subVectors(i,e),ic.crossVectors(nc,Ka);let a=this.direction.dot(ic),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ni.subVectors(this.origin,e);const l=o*this.direction.dot(Ka.crossVectors(Ni,Ka));if(l<0)return null;const c=o*this.direction.dot(nc.cross(Ni));if(c<0||l+c>a)return null;const u=-o*Ni.dot(ic);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Tt{constructor(e,t,i,s,r,a,o,l,c,u,d,h,f,b,x,y){Tt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c,u,d,h,f,b,x,y)}set(e,t,i,s,r,a,o,l,c,u,d,h,f,b,x,y){const g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=u,g[10]=d,g[14]=h,g[3]=f,g[7]=b,g[11]=x,g[15]=y,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Tt().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,s=1/Hs.setFromMatrixColumn(e,0).length(),r=1/Hs.setFromMatrixColumn(e,1).length(),a=1/Hs.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const h=a*u,f=a*d,b=o*u,x=o*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=f+b*c,t[5]=h-x*c,t[9]=-o*l,t[2]=x-h*c,t[6]=b+f*c,t[10]=a*l}else if(e.order==="YXZ"){const h=l*u,f=l*d,b=c*u,x=c*d;t[0]=h+x*o,t[4]=b*o-f,t[8]=a*c,t[1]=a*d,t[5]=a*u,t[9]=-o,t[2]=f*o-b,t[6]=x+h*o,t[10]=a*l}else if(e.order==="ZXY"){const h=l*u,f=l*d,b=c*u,x=c*d;t[0]=h-x*o,t[4]=-a*d,t[8]=b+f*o,t[1]=f+b*o,t[5]=a*u,t[9]=x-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const h=a*u,f=a*d,b=o*u,x=o*d;t[0]=l*u,t[4]=b*c-f,t[8]=h*c+x,t[1]=l*d,t[5]=x*c+h,t[9]=f*c-b,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const h=a*l,f=a*c,b=o*l,x=o*c;t[0]=l*u,t[4]=x-h*d,t[8]=b*d+f,t[1]=d,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*d+b,t[10]=h-x*d}else if(e.order==="XZY"){const h=a*l,f=a*c,b=o*l,x=o*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+x,t[5]=a*u,t[9]=f*d-b,t[2]=b*d-f,t[6]=o*u,t[10]=x*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(lE,e,cE)}lookAt(e,t,i){const s=this.elements;return xn.subVectors(e,t),xn.lengthSq()===0&&(xn.z=1),xn.normalize(),Oi.crossVectors(i,xn),Oi.lengthSq()===0&&(Math.abs(i.z)===1?xn.x+=1e-4:xn.z+=1e-4,xn.normalize(),Oi.crossVectors(i,xn)),Oi.normalize(),Za.crossVectors(xn,Oi),s[0]=Oi.x,s[4]=Za.x,s[8]=xn.x,s[1]=Oi.y,s[5]=Za.y,s[9]=xn.y,s[2]=Oi.z,s[6]=Za.z,s[10]=xn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],u=i[1],d=i[5],h=i[9],f=i[13],b=i[2],x=i[6],y=i[10],g=i[14],A=i[3],S=i[7],m=i[11],w=i[15],T=s[0],R=s[4],U=s[8],M=s[12],C=s[1],F=s[5],G=s[9],B=s[13],$=s[2],j=s[6],Y=s[10],re=s[14],K=s[3],Se=s[7],Re=s[11],De=s[15];return r[0]=a*T+o*C+l*$+c*K,r[4]=a*R+o*F+l*j+c*Se,r[8]=a*U+o*G+l*Y+c*Re,r[12]=a*M+o*B+l*re+c*De,r[1]=u*T+d*C+h*$+f*K,r[5]=u*R+d*F+h*j+f*Se,r[9]=u*U+d*G+h*Y+f*Re,r[13]=u*M+d*B+h*re+f*De,r[2]=b*T+x*C+y*$+g*K,r[6]=b*R+x*F+y*j+g*Se,r[10]=b*U+x*G+y*Y+g*Re,r[14]=b*M+x*B+y*re+g*De,r[3]=A*T+S*C+m*$+w*K,r[7]=A*R+S*F+m*j+w*Se,r[11]=A*U+S*G+m*Y+w*Re,r[15]=A*M+S*B+m*re+w*De,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],f=e[14],b=e[3],x=e[7],y=e[11],g=e[15];return b*(+r*l*d-s*c*d-r*o*h+i*c*h+s*o*f-i*l*f)+x*(+t*l*f-t*c*h+r*a*h-s*a*f+s*c*u-r*l*u)+y*(+t*c*d-t*o*f-r*a*d+i*a*f+r*o*u-i*c*u)+g*(-s*o*u-t*l*d+t*o*h+s*a*d-i*a*h+i*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],f=e[11],b=e[12],x=e[13],y=e[14],g=e[15],A=d*y*c-x*h*c+x*l*f-o*y*f-d*l*g+o*h*g,S=b*h*c-u*y*c-b*l*f+a*y*f+u*l*g-a*h*g,m=u*x*c-b*d*c+b*o*f-a*x*f-u*o*g+a*d*g,w=b*d*l-u*x*l-b*o*h+a*x*h+u*o*y-a*d*y,T=t*A+i*S+s*m+r*w;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/T;return e[0]=A*R,e[1]=(x*h*r-d*y*r-x*s*f+i*y*f+d*s*g-i*h*g)*R,e[2]=(o*y*r-x*l*r+x*s*c-i*y*c-o*s*g+i*l*g)*R,e[3]=(d*l*r-o*h*r-d*s*c+i*h*c+o*s*f-i*l*f)*R,e[4]=S*R,e[5]=(u*y*r-b*h*r+b*s*f-t*y*f-u*s*g+t*h*g)*R,e[6]=(b*l*r-a*y*r-b*s*c+t*y*c+a*s*g-t*l*g)*R,e[7]=(a*h*r-u*l*r+u*s*c-t*h*c-a*s*f+t*l*f)*R,e[8]=m*R,e[9]=(b*d*r-u*x*r-b*i*f+t*x*f+u*i*g-t*d*g)*R,e[10]=(a*x*r-b*o*r+b*i*c-t*x*c-a*i*g+t*o*g)*R,e[11]=(u*o*r-a*d*r-u*i*c+t*d*c+a*i*f-t*o*f)*R,e[12]=w*R,e[13]=(u*x*s-b*d*s+b*i*h-t*x*h-u*i*y+t*d*y)*R,e[14]=(b*o*s-a*x*s-b*i*l+t*x*l+a*i*y-t*o*y)*R,e[15]=(a*d*s-u*o*s+u*i*l-t*d*l-a*i*h+t*o*h)*R,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+i,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,d=o+o,h=r*c,f=r*u,b=r*d,x=a*u,y=a*d,g=o*d,A=l*c,S=l*u,m=l*d,w=i.x,T=i.y,R=i.z;return s[0]=(1-(x+g))*w,s[1]=(f+m)*w,s[2]=(b-S)*w,s[3]=0,s[4]=(f-m)*T,s[5]=(1-(h+g))*T,s[6]=(y+A)*T,s[7]=0,s[8]=(b+S)*R,s[9]=(y-A)*R,s[10]=(1-(h+x))*R,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;let r=Hs.set(s[0],s[1],s[2]).length();const a=Hs.set(s[4],s[5],s[6]).length(),o=Hs.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Bn.copy(this);const c=1/r,u=1/a,d=1/o;return Bn.elements[0]*=c,Bn.elements[1]*=c,Bn.elements[2]*=c,Bn.elements[4]*=u,Bn.elements[5]*=u,Bn.elements[6]*=u,Bn.elements[8]*=d,Bn.elements[9]*=d,Bn.elements[10]*=d,t.setFromRotationMatrix(Bn),i.x=r,i.y=a,i.z=o,this}makePerspective(e,t,i,s,r,a,o=Si){const l=this.elements,c=2*r/(t-e),u=2*r/(i-s),d=(t+e)/(t-e),h=(i+s)/(i-s);let f,b;if(o===Si)f=-(a+r)/(a-r),b=-2*a*r/(a-r);else if(o===qo)f=-a/(a-r),b=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=h,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=b,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=Si){const l=this.elements,c=1/(t-e),u=1/(i-s),d=1/(a-r),h=(t+e)*c,f=(i+s)*u;let b,x;if(o===Si)b=(a+r)*d,x=-2*d;else if(o===qo)b=r*d,x=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-h,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=x,l[14]=-b,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Hs=new V,Bn=new Tt,lE=new V(0,0,0),cE=new V(1,1,1),Oi=new V,Za=new V,xn=new V,Jh=new Tt,Qh=new Cs;class ai{constructor(e=0,t=0,i=0,s=ai.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],d=s[2],h=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(nt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-nt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(nt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Jh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Jh,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Qh.setFromEuler(this),this.setFromQuaternion(Qh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ai.DEFAULT_ORDER="XYZ";class yd{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let uE=0;const ef=new V,$s=new Cs,fi=new Tt,Ja=new V,Vr=new V,dE=new V,hE=new Cs,tf=new V(1,0,0),nf=new V(0,1,0),sf=new V(0,0,1),rf={type:"added"},fE={type:"removed"},Gs={type:"childadded",child:null},sc={type:"childremoved",child:null};class $t extends Ds{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:uE++}),this.uuid=Yi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=$t.DEFAULT_UP.clone();const e=new V,t=new ai,i=new Cs,s=new V(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Tt},normalMatrix:{value:new Qe}}),this.matrix=new Tt,this.matrixWorld=new Tt,this.matrixAutoUpdate=$t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=$t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new yd,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return $s.setFromAxisAngle(e,t),this.quaternion.multiply($s),this}rotateOnWorldAxis(e,t){return $s.setFromAxisAngle(e,t),this.quaternion.premultiply($s),this}rotateX(e){return this.rotateOnAxis(tf,e)}rotateY(e){return this.rotateOnAxis(nf,e)}rotateZ(e){return this.rotateOnAxis(sf,e)}translateOnAxis(e,t){return ef.copy(e).applyQuaternion(this.quaternion),this.position.add(ef.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(tf,e)}translateY(e){return this.translateOnAxis(nf,e)}translateZ(e){return this.translateOnAxis(sf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(fi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Ja.copy(e):Ja.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Vr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?fi.lookAt(Vr,Ja,this.up):fi.lookAt(Ja,Vr,this.up),this.quaternion.setFromRotationMatrix(fi),s&&(fi.extractRotation(s.matrixWorld),$s.setFromRotationMatrix(fi),this.quaternion.premultiply($s.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(rf),Gs.child=e,this.dispatchEvent(Gs),Gs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(fE),sc.child=e,this.dispatchEvent(sc),sc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),fi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),fi.multiply(e.parent.matrixWorld)),e.applyMatrix4(fi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(rf),Gs.child=e,this.dispatchEvent(Gs),Gs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Vr,e,dE),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Vr,hE,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),d=a(e.shapes),h=a(e.skeletons),f=a(e.animations),b=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),d.length>0&&(i.shapes=d),h.length>0&&(i.skeletons=h),f.length>0&&(i.animations=f),b.length>0&&(i.nodes=b)}return i.object=s,i;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}$t.DEFAULT_UP=new V(0,1,0);$t.DEFAULT_MATRIX_AUTO_UPDATE=!0;$t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const zn=new V,pi=new V,rc=new V,mi=new V,Ws=new V,Xs=new V,af=new V,ac=new V,oc=new V,lc=new V,cc=new Lt,uc=new Lt,dc=new Lt;class En{constructor(e=new V,t=new V,i=new V){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),zn.subVectors(e,t),s.cross(zn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){zn.subVectors(s,t),pi.subVectors(i,t),rc.subVectors(e,t);const a=zn.dot(zn),o=zn.dot(pi),l=zn.dot(rc),c=pi.dot(pi),u=pi.dot(rc),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;const h=1/d,f=(c*l-o*u)*h,b=(a*u-o*l)*h;return r.set(1-f-b,b,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,mi)===null?!1:mi.x>=0&&mi.y>=0&&mi.x+mi.y<=1}static getInterpolation(e,t,i,s,r,a,o,l){return this.getBarycoord(e,t,i,s,mi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,mi.x),l.addScaledVector(a,mi.y),l.addScaledVector(o,mi.z),l)}static getInterpolatedAttribute(e,t,i,s,r,a){return cc.setScalar(0),uc.setScalar(0),dc.setScalar(0),cc.fromBufferAttribute(e,t),uc.fromBufferAttribute(e,i),dc.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(cc,r.x),a.addScaledVector(uc,r.y),a.addScaledVector(dc,r.z),a}static isFrontFacing(e,t,i,s){return zn.subVectors(i,t),pi.subVectors(e,t),zn.cross(pi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return zn.subVectors(this.c,this.b),pi.subVectors(this.a,this.b),zn.cross(pi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return En.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return En.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return En.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return En.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return En.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let a,o;Ws.subVectors(s,i),Xs.subVectors(r,i),ac.subVectors(e,i);const l=Ws.dot(ac),c=Xs.dot(ac);if(l<=0&&c<=0)return t.copy(i);oc.subVectors(e,s);const u=Ws.dot(oc),d=Xs.dot(oc);if(u>=0&&d<=u)return t.copy(s);const h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(i).addScaledVector(Ws,a);lc.subVectors(e,r);const f=Ws.dot(lc),b=Xs.dot(lc);if(b>=0&&f<=b)return t.copy(r);const x=f*c-l*b;if(x<=0&&c>=0&&b<=0)return o=c/(c-b),t.copy(i).addScaledVector(Xs,o);const y=u*b-f*d;if(y<=0&&d-u>=0&&f-b>=0)return af.subVectors(r,s),o=(d-u)/(d-u+(f-b)),t.copy(s).addScaledVector(af,o);const g=1/(y+x+h);return a=x*g,o=h*g,t.copy(i).addScaledVector(Ws,a).addScaledVector(Xs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const ag={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Fi={h:0,s:0,l:0},Qa={h:0,s:0,l:0};function hc(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class rt{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=un){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ht.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=ht.workingColorSpace){return this.r=e,this.g=t,this.b=i,ht.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=ht.workingColorSpace){if(e=jM(e,1),t=nt(t,0,1),i=nt(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=hc(a,r,e+1/3),this.g=hc(a,r,e),this.b=hc(a,r,e-1/3)}return ht.toWorkingColorSpace(this,s),this}setStyle(e,t=un){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=un){const i=ag[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=wi(e.r),this.g=wi(e.g),this.b=wi(e.b),this}copyLinearToSRGB(e){return this.r=pr(e.r),this.g=pr(e.g),this.b=pr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=un){return ht.fromWorkingColorSpace(tn.copy(this),e),Math.round(nt(tn.r*255,0,255))*65536+Math.round(nt(tn.g*255,0,255))*256+Math.round(nt(tn.b*255,0,255))}getHexString(e=un){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ht.workingColorSpace){ht.fromWorkingColorSpace(tn.copy(this),t);const i=tn.r,s=tn.g,r=tn.b,a=Math.max(i,s,r),o=Math.min(i,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const d=a-o;switch(c=u<=.5?d/(a+o):d/(2-a-o),a){case i:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-i)/d+2;break;case r:l=(i-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ht.workingColorSpace){return ht.fromWorkingColorSpace(tn.copy(this),t),e.r=tn.r,e.g=tn.g,e.b=tn.b,e}getStyle(e=un){ht.fromWorkingColorSpace(tn.copy(this),e);const t=tn.r,i=tn.g,s=tn.b;return e!==un?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Fi),this.setHSL(Fi.h+e,Fi.s+t,Fi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Fi),e.getHSL(Qa);const i=jl(Fi.h,Qa.h,t),s=jl(Fi.s,Qa.s,t),r=jl(Fi.l,Qa.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const tn=new rt;rt.NAMES=ag;let pE=0;class Ls extends Ds{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:pE++}),this.uuid=Yi(),this.name="",this.type="Material",this.blending=hr,this.side=Qi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Kc,this.blendDst=Zc,this.blendEquation=gs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new rt(0,0,0),this.blendAlpha=0,this.depthFunc=Sr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Xh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Fs,this.stencilZFail=Fs,this.stencilZPass=Fs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==hr&&(i.blending=this.blending),this.side!==Qi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Kc&&(i.blendSrc=this.blendSrc),this.blendDst!==Zc&&(i.blendDst=this.blendDst),this.blendEquation!==gs&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Sr&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Xh&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Fs&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Fs&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Fs&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class ra extends Ls{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new rt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ai,this.combine=$m,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Ft=new V,eo=new Ee;class Xn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Nu,this.updateRanges=[],this.gpuType=xi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)eo.fromBufferAttribute(this,t),eo.applyMatrix3(e),this.setXY(t,eo.x,eo.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix3(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix4(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyNormalMatrix(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.transformDirection(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=ni(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Mt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ni(t,this.array)),t}setX(e,t){return this.normalized&&(t=Mt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ni(t,this.array)),t}setY(e,t){return this.normalized&&(t=Mt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ni(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Mt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ni(t,this.array)),t}setW(e,t){return this.normalized&&(t=Mt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Mt(t,this.array),i=Mt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=Mt(t,this.array),i=Mt(i,this.array),s=Mt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=Mt(t,this.array),i=Mt(i,this.array),s=Mt(s,this.array),r=Mt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Nu&&(e.usage=this.usage),e}}class og extends Xn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class lg extends Xn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Gt extends Xn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let mE=0;const Dn=new Tt,fc=new $t,qs=new V,Sn=new Ia,Hr=new Ia,qt=new V;class Cn extends Ds{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:mE++}),this.uuid=Yi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ig(e)?lg:og)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Qe().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Dn.makeRotationFromQuaternion(e),this.applyMatrix4(Dn),this}rotateX(e){return Dn.makeRotationX(e),this.applyMatrix4(Dn),this}rotateY(e){return Dn.makeRotationY(e),this.applyMatrix4(Dn),this}rotateZ(e){return Dn.makeRotationZ(e),this.applyMatrix4(Dn),this}translate(e,t,i){return Dn.makeTranslation(e,t,i),this.applyMatrix4(Dn),this}scale(e,t,i){return Dn.makeScale(e,t,i),this.applyMatrix4(Dn),this}lookAt(e){return fc.lookAt(e),fc.updateMatrix(),this.applyMatrix4(fc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(qs).negate(),this.translate(qs.x,qs.y,qs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Gt(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ia);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];Sn.setFromBufferAttribute(r),this.morphTargetsRelative?(qt.addVectors(this.boundingBox.min,Sn.min),this.boundingBox.expandByPoint(qt),qt.addVectors(this.boundingBox.max,Sn.max),this.boundingBox.expandByPoint(qt)):(this.boundingBox.expandByPoint(Sn.min),this.boundingBox.expandByPoint(Sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new yl);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new V,1/0);return}if(e){const i=this.boundingSphere.center;if(Sn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Hr.setFromBufferAttribute(o),this.morphTargetsRelative?(qt.addVectors(Sn.min,Hr.min),Sn.expandByPoint(qt),qt.addVectors(Sn.max,Hr.max),Sn.expandByPoint(qt)):(Sn.expandByPoint(Hr.min),Sn.expandByPoint(Hr.max))}Sn.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)qt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(qt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)qt.fromBufferAttribute(o,c),l&&(qs.fromBufferAttribute(e,c),qt.add(qs)),s=Math.max(s,i.distanceToSquared(qt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Xn(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let U=0;U<i.count;U++)o[U]=new V,l[U]=new V;const c=new V,u=new V,d=new V,h=new Ee,f=new Ee,b=new Ee,x=new V,y=new V;function g(U,M,C){c.fromBufferAttribute(i,U),u.fromBufferAttribute(i,M),d.fromBufferAttribute(i,C),h.fromBufferAttribute(r,U),f.fromBufferAttribute(r,M),b.fromBufferAttribute(r,C),u.sub(c),d.sub(c),f.sub(h),b.sub(h);const F=1/(f.x*b.y-b.x*f.y);isFinite(F)&&(x.copy(u).multiplyScalar(b.y).addScaledVector(d,-f.y).multiplyScalar(F),y.copy(d).multiplyScalar(f.x).addScaledVector(u,-b.x).multiplyScalar(F),o[U].add(x),o[M].add(x),o[C].add(x),l[U].add(y),l[M].add(y),l[C].add(y))}let A=this.groups;A.length===0&&(A=[{start:0,count:e.count}]);for(let U=0,M=A.length;U<M;++U){const C=A[U],F=C.start,G=C.count;for(let B=F,$=F+G;B<$;B+=3)g(e.getX(B+0),e.getX(B+1),e.getX(B+2))}const S=new V,m=new V,w=new V,T=new V;function R(U){w.fromBufferAttribute(s,U),T.copy(w);const M=o[U];S.copy(M),S.sub(w.multiplyScalar(w.dot(M))).normalize(),m.crossVectors(T,M);const F=m.dot(l[U])<0?-1:1;a.setXYZW(U,S.x,S.y,S.z,F)}for(let U=0,M=A.length;U<M;++U){const C=A[U],F=C.start,G=C.count;for(let B=F,$=F+G;B<$;B+=3)R(e.getX(B+0)),R(e.getX(B+1)),R(e.getX(B+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Xn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,f=i.count;h<f;h++)i.setXYZ(h,0,0,0);const s=new V,r=new V,a=new V,o=new V,l=new V,c=new V,u=new V,d=new V;if(e)for(let h=0,f=e.count;h<f;h+=3){const b=e.getX(h+0),x=e.getX(h+1),y=e.getX(h+2);s.fromBufferAttribute(t,b),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,y),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),o.fromBufferAttribute(i,b),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,y),o.add(u),l.add(u),c.add(u),i.setXYZ(b,o.x,o.y,o.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(y,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),i.setXYZ(h+0,u.x,u.y,u.z),i.setXYZ(h+1,u.x,u.y,u.z),i.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)qt.fromBufferAttribute(e,t),qt.normalize(),e.setXYZ(t,qt.x,qt.y,qt.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,d=o.normalized,h=new c.constructor(l.length*u);let f=0,b=0;for(let x=0,y=l.length;x<y;x++){o.isInterleavedBufferAttribute?f=l[x]*o.data.stride+o.offset:f=l[x]*u;for(let g=0;g<u;g++)h[b++]=c[f++]}return new Xn(h,u,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Cn,i=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,i);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,d=c.length;u<d;u++){const h=c[u],f=e(h,i);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){const f=c[d];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],d=r[c];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const of=new Tt,cs=new bl,to=new yl,lf=new V,no=new V,io=new V,so=new V,pc=new V,ro=new V,cf=new V,ao=new V;class yt extends $t{constructor(e=new Cn,t=new ra){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){ro.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],d=r[l];u!==0&&(pc.fromBufferAttribute(d,e),a?ro.addScaledVector(pc,u):ro.addScaledVector(pc.sub(t),u))}t.add(ro)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),to.copy(i.boundingSphere),to.applyMatrix4(r),cs.copy(e.ray).recast(e.near),!(to.containsPoint(cs.origin)===!1&&(cs.intersectSphere(to,lf)===null||cs.origin.distanceToSquared(lf)>(e.far-e.near)**2))&&(of.copy(r).invert(),cs.copy(e.ray).applyMatrix4(of),!(i.boundingBox!==null&&cs.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,cs)))}_computeIntersections(e,t,i){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let b=0,x=h.length;b<x;b++){const y=h[b],g=a[y.materialIndex],A=Math.max(y.start,f.start),S=Math.min(o.count,Math.min(y.start+y.count,f.start+f.count));for(let m=A,w=S;m<w;m+=3){const T=o.getX(m),R=o.getX(m+1),U=o.getX(m+2);s=oo(this,g,e,i,c,u,d,T,R,U),s&&(s.faceIndex=Math.floor(m/3),s.face.materialIndex=y.materialIndex,t.push(s))}}else{const b=Math.max(0,f.start),x=Math.min(o.count,f.start+f.count);for(let y=b,g=x;y<g;y+=3){const A=o.getX(y),S=o.getX(y+1),m=o.getX(y+2);s=oo(this,a,e,i,c,u,d,A,S,m),s&&(s.faceIndex=Math.floor(y/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let b=0,x=h.length;b<x;b++){const y=h[b],g=a[y.materialIndex],A=Math.max(y.start,f.start),S=Math.min(l.count,Math.min(y.start+y.count,f.start+f.count));for(let m=A,w=S;m<w;m+=3){const T=m,R=m+1,U=m+2;s=oo(this,g,e,i,c,u,d,T,R,U),s&&(s.faceIndex=Math.floor(m/3),s.face.materialIndex=y.materialIndex,t.push(s))}}else{const b=Math.max(0,f.start),x=Math.min(l.count,f.start+f.count);for(let y=b,g=x;y<g;y+=3){const A=y,S=y+1,m=y+2;s=oo(this,a,e,i,c,u,d,A,S,m),s&&(s.faceIndex=Math.floor(y/3),t.push(s))}}}}function gE(n,e,t,i,s,r,a,o){let l;if(e.side===yn?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,e.side===Qi,o),l===null)return null;ao.copy(o),ao.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(ao);return c<t.near||c>t.far?null:{distance:c,point:ao.clone(),object:n}}function oo(n,e,t,i,s,r,a,o,l,c){n.getVertexPosition(o,no),n.getVertexPosition(l,io),n.getVertexPosition(c,so);const u=gE(n,e,t,i,no,io,so,cf);if(u){const d=new V;En.getBarycoord(cf,no,io,so,d),s&&(u.uv=En.getInterpolatedAttribute(s,o,l,c,d,new Ee)),r&&(u.uv1=En.getInterpolatedAttribute(r,o,l,c,d,new Ee)),a&&(u.normal=En.getInterpolatedAttribute(a,o,l,c,d,new V),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new V,materialIndex:0};En.getNormal(no,io,so,h.normal),u.face=h,u.barycoord=d}return u}class Lr extends Cn{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],d=[];let h=0,f=0;b("z","y","x",-1,-1,i,t,e,a,r,0),b("z","y","x",1,-1,i,t,-e,a,r,1),b("x","z","y",1,1,e,i,t,s,a,2),b("x","z","y",1,-1,e,i,-t,s,a,3),b("x","y","z",1,-1,e,t,i,s,r,4),b("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new Gt(c,3)),this.setAttribute("normal",new Gt(u,3)),this.setAttribute("uv",new Gt(d,2));function b(x,y,g,A,S,m,w,T,R,U,M){const C=m/R,F=w/U,G=m/2,B=w/2,$=T/2,j=R+1,Y=U+1;let re=0,K=0;const Se=new V;for(let Re=0;Re<Y;Re++){const De=Re*F-B;for(let Ve=0;Ve<j;Ve++){const st=Ve*C-G;Se[x]=st*A,Se[y]=De*S,Se[g]=$,c.push(Se.x,Se.y,Se.z),Se[x]=0,Se[y]=0,Se[g]=T>0?1:-1,u.push(Se.x,Se.y,Se.z),d.push(Ve/R),d.push(1-Re/U),re+=1}}for(let Re=0;Re<U;Re++)for(let De=0;De<R;De++){const Ve=h+De+j*Re,st=h+De+j*(Re+1),fe=h+(De+1)+j*(Re+1),xe=h+(De+1)+j*Re;l.push(Ve,st,xe),l.push(st,fe,xe),K+=6}o.addGroup(f,K,M),f+=K,h+=re}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Lr(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Rr(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function ln(n){const e={};for(let t=0;t<n.length;t++){const i=Rr(n[t]);for(const s in i)e[s]=i[s]}return e}function vE(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function cg(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ht.workingColorSpace}const _E={clone:Rr,merge:ln};var yE=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,bE=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class es extends Ls{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=yE,this.fragmentShader=bE,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Rr(e.uniforms),this.uniformsGroups=vE(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class ug extends $t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Tt,this.projectionMatrix=new Tt,this.projectionMatrixInverse=new Tt,this.coordinateSystem=Si}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ki=new V,uf=new Ee,df=new Ee;class _n extends ug{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ou*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(sa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ou*2*Math.atan(Math.tan(sa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){ki.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ki.x,ki.y).multiplyScalar(-e/ki.z),ki.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(ki.x,ki.y).multiplyScalar(-e/ki.z)}getViewSize(e,t){return this.getViewBounds(e,uf,df),t.subVectors(df,uf)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(sa*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ys=-90,js=1;class xE extends $t{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new _n(Ys,js,e,t);s.layers=this.layers,this.add(s);const r=new _n(Ys,js,e,t);r.layers=this.layers,this.add(r);const a=new _n(Ys,js,e,t);a.layers=this.layers,this.add(a);const o=new _n(Ys,js,e,t);o.layers=this.layers,this.add(o);const l=new _n(Ys,js,e,t);l.layers=this.layers,this.add(l);const c=new _n(Ys,js,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===Si)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===qo)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),b=e.xr.enabled;e.xr.enabled=!1;const x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,a),e.setRenderTarget(i,2,s),e.render(t,o),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),e.render(t,u),e.setRenderTarget(d,h,f),e.xr.enabled=b,i.texture.needsPMREMUpdate=!0}}class dg extends fn{constructor(e,t,i,s,r,a,o,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:Mr,super(e,t,i,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class SE extends Rs{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new dg(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Hn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Lr(5,5,5),r=new es({name:"CubemapFromEquirect",uniforms:Rr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:yn,blending:Xi});r.uniforms.tEquirect.value=t;const a=new yt(s,r),o=t.minFilter;return t.minFilter===xs&&(t.minFilter=Hn),new xE(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,i,s){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}}class bd extends $t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ai,this.environmentIntensity=1,this.environmentRotation=new ai,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class ME{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Nu,this.updateRanges=[],this.version=0,this.uuid=Yi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[i+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Yi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Yi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const an=new V;class jo{constructor(e,t,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)an.fromBufferAttribute(this,t),an.applyMatrix4(e),this.setXYZ(t,an.x,an.y,an.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)an.fromBufferAttribute(this,t),an.applyNormalMatrix(e),this.setXYZ(t,an.x,an.y,an.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)an.fromBufferAttribute(this,t),an.transformDirection(e),this.setXYZ(t,an.x,an.y,an.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=ni(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Mt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=Mt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ni(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ni(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ni(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ni(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Mt(t,this.array),i=Mt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Mt(t,this.array),i=Mt(i,this.array),s=Mt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Mt(t,this.array),i=Mt(i,this.array),s=Mt(s,this.array),r=Mt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Xn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new jo(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class hg extends Ls{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new rt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Ks;const $r=new V,Zs=new V,Js=new V,Qs=new Ee,Gr=new Ee,fg=new Tt,lo=new V,Wr=new V,co=new V,hf=new Ee,mc=new Ee,ff=new Ee;class EE extends $t{constructor(e=new hg){if(super(),this.isSprite=!0,this.type="Sprite",Ks===void 0){Ks=new Cn;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new ME(t,5);Ks.setIndex([0,1,2,0,2,3]),Ks.setAttribute("position",new jo(i,3,0,!1)),Ks.setAttribute("uv",new jo(i,2,3,!1))}this.geometry=Ks,this.material=e,this.center=new Ee(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Zs.setFromMatrixScale(this.matrixWorld),fg.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Js.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Zs.multiplyScalar(-Js.z);const i=this.material.rotation;let s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));const a=this.center;uo(lo.set(-.5,-.5,0),Js,a,Zs,s,r),uo(Wr.set(.5,-.5,0),Js,a,Zs,s,r),uo(co.set(.5,.5,0),Js,a,Zs,s,r),hf.set(0,0),mc.set(1,0),ff.set(1,1);let o=e.ray.intersectTriangle(lo,Wr,co,!1,$r);if(o===null&&(uo(Wr.set(-.5,.5,0),Js,a,Zs,s,r),mc.set(0,1),o=e.ray.intersectTriangle(lo,co,Wr,!1,$r),o===null))return;const l=e.ray.origin.distanceTo($r);l<e.near||l>e.far||t.push({distance:l,point:$r.clone(),uv:En.getInterpolation($r,lo,Wr,co,hf,mc,ff,new Ee),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function uo(n,e,t,i,s,r){Qs.subVectors(n,t).addScalar(.5).multiply(i),s!==void 0?(Gr.x=r*Qs.x-s*Qs.y,Gr.y=s*Qs.x+r*Qs.y):Gr.copy(Qs),n.copy(e),n.x+=Gr.x,n.y+=Gr.y,n.applyMatrix4(fg)}const gc=new V,wE=new V,AE=new Qe;class Hi{constructor(e=new V(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=gc.subVectors(i,t).cross(wE.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(gc),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||AE.getNormalMatrix(e),s=this.coplanarPoint(gc).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const us=new yl,ho=new V;class xd{constructor(e=new Hi,t=new Hi,i=new Hi,s=new Hi,r=new Hi,a=new Hi){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Si){const i=this.planes,s=e.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],u=s[5],d=s[6],h=s[7],f=s[8],b=s[9],x=s[10],y=s[11],g=s[12],A=s[13],S=s[14],m=s[15];if(i[0].setComponents(l-r,h-c,y-f,m-g).normalize(),i[1].setComponents(l+r,h+c,y+f,m+g).normalize(),i[2].setComponents(l+a,h+u,y+b,m+A).normalize(),i[3].setComponents(l-a,h-u,y-b,m-A).normalize(),i[4].setComponents(l-o,h-d,y-x,m-S).normalize(),t===Si)i[5].setComponents(l+o,h+d,y+x,m+S).normalize();else if(t===qo)i[5].setComponents(o,d,x,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),us.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),us.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(us)}intersectsSprite(e){return us.center.set(0,0,0),us.radius=.7071067811865476,us.applyMatrix4(e.matrixWorld),this.intersectsSphere(us)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(ho.x=s.normal.x>0?e.max.x:e.min.x,ho.y=s.normal.y>0?e.max.y:e.min.y,ho.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(ho)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class pg extends Ls{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new rt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ko=new V,Zo=new V,pf=new Tt,Xr=new bl,fo=new yl,vc=new V,mf=new V;class TE extends $t{constructor(e=new Cn,t=new pg){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)Ko.fromBufferAttribute(t,s-1),Zo.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=Ko.distanceTo(Zo);e.setAttribute("lineDistance",new Gt(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),fo.copy(i.boundingSphere),fo.applyMatrix4(s),fo.radius+=r,e.ray.intersectsSphere(fo)===!1)return;pf.copy(s).invert(),Xr.copy(e.ray).applyMatrix4(pf);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=i.index,h=i.attributes.position;if(u!==null){const f=Math.max(0,a.start),b=Math.min(u.count,a.start+a.count);for(let x=f,y=b-1;x<y;x+=c){const g=u.getX(x),A=u.getX(x+1),S=po(this,e,Xr,l,g,A);S&&t.push(S)}if(this.isLineLoop){const x=u.getX(b-1),y=u.getX(f),g=po(this,e,Xr,l,x,y);g&&t.push(g)}}else{const f=Math.max(0,a.start),b=Math.min(h.count,a.start+a.count);for(let x=f,y=b-1;x<y;x+=c){const g=po(this,e,Xr,l,x,x+1);g&&t.push(g)}if(this.isLineLoop){const x=po(this,e,Xr,l,b-1,f);x&&t.push(x)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function po(n,e,t,i,s,r){const a=n.geometry.attributes.position;if(Ko.fromBufferAttribute(a,s),Zo.fromBufferAttribute(a,r),t.distanceSqToSegment(Ko,Zo,vc,mf)>i)return;vc.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(vc);if(!(l<e.near||l>e.far))return{distance:l,point:mf.clone().applyMatrix4(n.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:n}}const gf=new V,vf=new V;class _f extends TE{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)gf.fromBufferAttribute(t,s),vf.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+gf.distanceTo(vf);e.setAttribute("lineDistance",new Gt(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class jr extends $t{constructor(){super(),this.isGroup=!0,this.type="Group"}}class RE extends fn{constructor(e,t,i,s,r,a,o,l,c){super(e,t,i,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class mg extends fn{constructor(e,t,i,s,r,a,o,l,c,u=fr){if(u!==fr&&u!==Ar)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===fr&&(i=Ts),i===void 0&&u===Ar&&(i=wr),super(null,s,r,a,o,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:Wn,this.minFilter=l!==void 0?l:Wn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class oi{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let s=0;const r=i.length;let a;t?a=t:a=e*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===a)return s/(r-1);const u=i[s],h=i[s+1]-u,f=(a-u)/h;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new Ee:new V);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new V,s=[],r=[],a=[],o=new V,l=new Tt;for(let f=0;f<=e;f++){const b=f/e;s[f]=this.getTangentAt(b,new V)}r[0]=new V,a[0]=new V;let c=Number.MAX_VALUE;const u=Math.abs(s[0].x),d=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=c&&(c=u,i.set(1,0,0)),d<=c&&(c=d,i.set(0,1,0)),h<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();const b=Math.acos(nt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,b))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(nt(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let b=1;b<=e;b++)r[b].applyMatrix4(l.makeRotationAxis(s[b],f*b)),a[b].crossVectors(s[b],r[b])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Sd extends oi{constructor(e=0,t=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new Ee){const i=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const u=Math.cos(this.aRotation),d=Math.sin(this.aRotation),h=l-this.aX,f=c-this.aY;l=h*u-f*d+this.aX,c=h*d+f*u+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class CE extends Sd{constructor(e,t,i,s,r,a){super(e,t,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Md(){let n=0,e=0,t=0,i=0;function s(r,a,o,l){n=r,e=o,t=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,d){let h=(a-r)/c-(o-r)/(c+u)+(o-a)/u,f=(o-a)/u-(l-a)/(u+d)+(l-o)/d;h*=u,f*=u,s(a,o,h,f)},calc:function(r){const a=r*r,o=a*r;return n+e*r+t*a+i*o}}}const mo=new V,_c=new Md,yc=new Md,bc=new Md;class PE extends oi{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new V){const i=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(mo.subVectors(s[0],s[1]).add(s[0]),c=mo);const d=s[o%r],h=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(mo.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=mo),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let b=Math.pow(c.distanceToSquared(d),f),x=Math.pow(d.distanceToSquared(h),f),y=Math.pow(h.distanceToSquared(u),f);x<1e-4&&(x=1),b<1e-4&&(b=x),y<1e-4&&(y=x),_c.initNonuniformCatmullRom(c.x,d.x,h.x,u.x,b,x,y),yc.initNonuniformCatmullRom(c.y,d.y,h.y,u.y,b,x,y),bc.initNonuniformCatmullRom(c.z,d.z,h.z,u.z,b,x,y)}else this.curveType==="catmullrom"&&(_c.initCatmullRom(c.x,d.x,h.x,u.x,this.tension),yc.initCatmullRom(c.y,d.y,h.y,u.y,this.tension),bc.initCatmullRom(c.z,d.z,h.z,u.z,this.tension));return i.set(_c.calc(l),yc.calc(l),bc.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new V().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function yf(n,e,t,i,s){const r=(i-e)*.5,a=(s-t)*.5,o=n*n,l=n*o;return(2*t-2*i+r+a)*l+(-3*t+3*i-2*r-a)*o+r*n+t}function IE(n,e){const t=1-n;return t*t*e}function DE(n,e){return 2*(1-n)*n*e}function LE(n,e){return n*n*e}function aa(n,e,t,i){return IE(n,e)+DE(n,t)+LE(n,i)}function UE(n,e){const t=1-n;return t*t*t*e}function NE(n,e){const t=1-n;return 3*t*t*n*e}function OE(n,e){return 3*(1-n)*n*n*e}function FE(n,e){return n*n*n*e}function oa(n,e,t,i,s){return UE(n,e)+NE(n,t)+OE(n,i)+FE(n,s)}class gg extends oi{constructor(e=new Ee,t=new Ee,i=new Ee,s=new Ee){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new Ee){const i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(oa(e,s.x,r.x,a.x,o.x),oa(e,s.y,r.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class kE extends oi{constructor(e=new V,t=new V,i=new V,s=new V){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new V){const i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(oa(e,s.x,r.x,a.x,o.x),oa(e,s.y,r.y,a.y,o.y),oa(e,s.z,r.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class vg extends oi{constructor(e=new Ee,t=new Ee){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Ee){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Ee){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class BE extends oi{constructor(e=new V,t=new V){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new V){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new V){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class _g extends oi{constructor(e=new Ee,t=new Ee,i=new Ee){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new Ee){const i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(aa(e,s.x,r.x,a.x),aa(e,s.y,r.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class zE extends oi{constructor(e=new V,t=new V,i=new V){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new V){const i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(aa(e,s.x,r.x,a.x),aa(e,s.y,r.y,a.y),aa(e,s.z,r.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class yg extends oi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Ee){const i=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return i.set(yf(o,l.x,c.x,u.x,d.x),yf(o,l.y,c.y,u.y,d.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new Ee().fromArray(s))}return this}}var bf=Object.freeze({__proto__:null,ArcCurve:CE,CatmullRomCurve3:PE,CubicBezierCurve:gg,CubicBezierCurve3:kE,EllipseCurve:Sd,LineCurve:vg,LineCurve3:BE,QuadraticBezierCurve:_g,QuadraticBezierCurve3:zE,SplineCurve:yg});class VE extends oi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new bf[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=i){const a=s[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let s=0,r=this.curves;s<r.length;s++){const a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){const u=l[c];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(new bf[s.type]().fromJSON(s))}return this}}class HE extends VE{constructor(e){super(),this.type="Path",this.currentPoint=new Ee,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new vg(this.currentPoint.clone(),new Ee(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){const r=new _g(this.currentPoint.clone(),new Ee(e,t),new Ee(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,a){const o=new gg(this.currentPoint.clone(),new Ee(e,t),new Ee(i,s),new Ee(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new yg(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,i,s,r,a),this}absarc(e,t,i,s,r,a){return this.absellipse(e,t,i,i,s,r,a),this}ellipse(e,t,i,s,r,a,o,l){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,i,s,r,a,o,l),this}absellipse(e,t,i,s,r,a,o,l){const c=new Sd(e,t,i,s,r,a,o,l);if(this.curves.length>0){const d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);const u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Ed extends Cn{constructor(e=[new Ee(0,-.5),new Ee(.5,0),new Ee(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=nt(s,0,Math.PI*2);const r=[],a=[],o=[],l=[],c=[],u=1/t,d=new V,h=new Ee,f=new V,b=new V,x=new V;let y=0,g=0;for(let A=0;A<=e.length-1;A++)switch(A){case 0:y=e[A+1].x-e[A].x,g=e[A+1].y-e[A].y,f.x=g*1,f.y=-y,f.z=g*0,x.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(x.x,x.y,x.z);break;default:y=e[A+1].x-e[A].x,g=e[A+1].y-e[A].y,f.x=g*1,f.y=-y,f.z=g*0,b.copy(f),f.x+=x.x,f.y+=x.y,f.z+=x.z,f.normalize(),l.push(f.x,f.y,f.z),x.copy(b)}for(let A=0;A<=t;A++){const S=i+A*u*s,m=Math.sin(S),w=Math.cos(S);for(let T=0;T<=e.length-1;T++){d.x=e[T].x*m,d.y=e[T].y,d.z=e[T].x*w,a.push(d.x,d.y,d.z),h.x=A/t,h.y=T/(e.length-1),o.push(h.x,h.y);const R=l[3*T+0]*m,U=l[3*T+1],M=l[3*T+0]*w;c.push(R,U,M)}}for(let A=0;A<t;A++)for(let S=0;S<e.length-1;S++){const m=S+A*e.length,w=m,T=m+e.length,R=m+e.length+1,U=m+1;r.push(w,T,U),r.push(R,U,T)}this.setIndex(r),this.setAttribute("position",new Gt(a,3)),this.setAttribute("uv",new Gt(o,2)),this.setAttribute("normal",new Gt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ed(e.points,e.segments,e.phiStart,e.phiLength)}}class la extends Ed{constructor(e=1,t=1,i=4,s=8){const r=new HE;r.absarc(0,-t/2,e,Math.PI*1.5,0),r.absarc(0,t/2,e,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:i,radialSegments:s}}static fromJSON(e){return new la(e.radius,e.length,e.capSegments,e.radialSegments)}}class ca extends Cn{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],d=[],h=[],f=[];let b=0;const x=[],y=i/2;let g=0;A(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(u),this.setAttribute("position",new Gt(d,3)),this.setAttribute("normal",new Gt(h,3)),this.setAttribute("uv",new Gt(f,2));function A(){const m=new V,w=new V;let T=0;const R=(t-e)/i;for(let U=0;U<=r;U++){const M=[],C=U/r,F=C*(t-e)+e;for(let G=0;G<=s;G++){const B=G/s,$=B*l+o,j=Math.sin($),Y=Math.cos($);w.x=F*j,w.y=-C*i+y,w.z=F*Y,d.push(w.x,w.y,w.z),m.set(j,R,Y).normalize(),h.push(m.x,m.y,m.z),f.push(B,1-C),M.push(b++)}x.push(M)}for(let U=0;U<s;U++)for(let M=0;M<r;M++){const C=x[M][U],F=x[M+1][U],G=x[M+1][U+1],B=x[M][U+1];(e>0||M!==0)&&(u.push(C,F,B),T+=3),(t>0||M!==r-1)&&(u.push(F,G,B),T+=3)}c.addGroup(g,T,0),g+=T}function S(m){const w=b,T=new Ee,R=new V;let U=0;const M=m===!0?e:t,C=m===!0?1:-1;for(let G=1;G<=s;G++)d.push(0,y*C,0),h.push(0,C,0),f.push(.5,.5),b++;const F=b;for(let G=0;G<=s;G++){const $=G/s*l+o,j=Math.cos($),Y=Math.sin($);R.x=M*Y,R.y=y*C,R.z=M*j,d.push(R.x,R.y,R.z),h.push(0,C,0),T.x=j*.5+.5,T.y=Y*.5*C+.5,f.push(T.x,T.y),b++}for(let G=0;G<s;G++){const B=w+G,$=F+G;m===!0?u.push($,$+1,B):u.push($+1,$,B),U+=3}c.addGroup(g,U,m===!0?1:2),g+=U}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ca(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}const go=new V,vo=new V,xc=new V,_o=new En;class $E extends Cn{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const s=Math.pow(10,4),r=Math.cos(sa*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],u=["a","b","c"],d=new Array(3),h={},f=[];for(let b=0;b<l;b+=3){a?(c[0]=a.getX(b),c[1]=a.getX(b+1),c[2]=a.getX(b+2)):(c[0]=b,c[1]=b+1,c[2]=b+2);const{a:x,b:y,c:g}=_o;if(x.fromBufferAttribute(o,c[0]),y.fromBufferAttribute(o,c[1]),g.fromBufferAttribute(o,c[2]),_o.getNormal(xc),d[0]=`${Math.round(x.x*s)},${Math.round(x.y*s)},${Math.round(x.z*s)}`,d[1]=`${Math.round(y.x*s)},${Math.round(y.y*s)},${Math.round(y.z*s)}`,d[2]=`${Math.round(g.x*s)},${Math.round(g.y*s)},${Math.round(g.z*s)}`,!(d[0]===d[1]||d[1]===d[2]||d[2]===d[0]))for(let A=0;A<3;A++){const S=(A+1)%3,m=d[A],w=d[S],T=_o[u[A]],R=_o[u[S]],U=`${m}_${w}`,M=`${w}_${m}`;M in h&&h[M]?(xc.dot(h[M].normal)<=r&&(f.push(T.x,T.y,T.z),f.push(R.x,R.y,R.z)),h[M]=null):U in h||(h[U]={index0:c[A],index1:c[S],normal:xc.clone()})}}for(const b in h)if(h[b]){const{index0:x,index1:y}=h[b];go.fromBufferAttribute(o,x),vo.fromBufferAttribute(o,y),f.push(go.x,go.y,go.z),f.push(vo.x,vo.y,vo.z)}this.setAttribute("position",new Gt(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class Es extends Cn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(s),c=o+1,u=l+1,d=e/o,h=t/l,f=[],b=[],x=[],y=[];for(let g=0;g<u;g++){const A=g*h-a;for(let S=0;S<c;S++){const m=S*d-r;b.push(m,-A,0),x.push(0,0,1),y.push(S/o),y.push(1-g/l)}}for(let g=0;g<l;g++)for(let A=0;A<o;A++){const S=A+c*g,m=A+c*(g+1),w=A+1+c*(g+1),T=A+1+c*g;f.push(S,m,T),f.push(m,w,T)}this.setIndex(f),this.setAttribute("position",new Gt(b,3)),this.setAttribute("normal",new Gt(x,3)),this.setAttribute("uv",new Gt(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Es(e.width,e.height,e.widthSegments,e.heightSegments)}}class ji extends Cn{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(a+o,Math.PI);let c=0;const u=[],d=new V,h=new V,f=[],b=[],x=[],y=[];for(let g=0;g<=i;g++){const A=[],S=g/i;let m=0;g===0&&a===0?m=.5/t:g===i&&l===Math.PI&&(m=-.5/t);for(let w=0;w<=t;w++){const T=w/t;d.x=-e*Math.cos(s+T*r)*Math.sin(a+S*o),d.y=e*Math.cos(a+S*o),d.z=e*Math.sin(s+T*r)*Math.sin(a+S*o),b.push(d.x,d.y,d.z),h.copy(d).normalize(),x.push(h.x,h.y,h.z),y.push(T+m,1-S),A.push(c++)}u.push(A)}for(let g=0;g<i;g++)for(let A=0;A<t;A++){const S=u[g][A+1],m=u[g][A],w=u[g+1][A],T=u[g+1][A+1];(g!==0||a>0)&&f.push(S,m,T),(g!==i-1||l<Math.PI)&&f.push(m,w,T)}this.setIndex(f),this.setAttribute("position",new Gt(b,3)),this.setAttribute("normal",new Gt(x,3)),this.setAttribute("uv",new Gt(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ji(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class mr extends Ls{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new rt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new rt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=tg,this.normalScale=new Ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ai,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class GE extends Ls{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=BM,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class WE extends Ls{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class bg extends $t{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new rt(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class wd extends bg{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy($t.DEFAULT_UP),this.updateMatrix(),this.groundColor=new rt(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Sc=new Tt,xf=new V,Sf=new V;class XE{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ee(512,512),this.map=null,this.mapPass=null,this.matrix=new Tt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new xd,this._frameExtents=new Ee(1,1),this._viewportCount=1,this._viewports=[new Lt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;xf.setFromMatrixPosition(e.matrixWorld),t.position.copy(xf),Sf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Sf),t.updateMatrixWorld(),Sc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Sc),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Sc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class xg extends ug{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,a=i+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class qE extends XE{constructor(){super(new xg(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class xa extends bg{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy($t.DEFAULT_UP),this.updateMatrix(),this.target=new $t,this.shadow=new qE}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class YE extends _n{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}const Mf=new Tt;class Ad{constructor(e,t,i=0,s=1/0){this.ray=new bl(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new yd,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Mf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Mf),this}intersectObject(e,t=!0,i=[]){return Fu(e,this,i,t),i.sort(Ef),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Fu(e[s],this,i,t);return i.sort(Ef),i}}function Ef(n,e){return n.distance-e.distance}function Fu(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){const r=n.children;for(let a=0,o=r.length;a<o;a++)Fu(r[a],e,t,!0)}}class wf{constructor(e=1,t=0,i=0){return this.radius=e,this.phi=t,this.theta=i,this}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=nt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(nt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class jE extends Ds{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}function Af(n,e,t,i){const s=KE(i);switch(t){case Ym:return n*e;case Km:return n*e;case Zm:return n*e*2;case Jm:return n*e/s.components*s.byteLength;case gd:return n*e/s.components*s.byteLength;case Qm:return n*e*2/s.components*s.byteLength;case vd:return n*e*2/s.components*s.byteLength;case jm:return n*e*3/s.components*s.byteLength;case $n:return n*e*4/s.components*s.byteLength;case _d:return n*e*4/s.components*s.byteLength;case Ao:case To:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Ro:case Co:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case uu:case hu:return Math.max(n,16)*Math.max(e,8)/4;case cu:case du:return Math.max(n,8)*Math.max(e,8)/2;case fu:case pu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case mu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case gu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case vu:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case _u:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case yu:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case bu:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case xu:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Su:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Mu:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Eu:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case wu:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Au:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Tu:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Ru:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Cu:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Po:case Pu:case Iu:return Math.ceil(n/4)*Math.ceil(e/4)*16;case eg:case Du:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Lu:case Uu:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function KE(n){switch(n){case Ci:case Wm:return{byteLength:1,components:1};case ba:case Xm:case Pa:return{byteLength:2,components:1};case pd:case md:return{byteLength:2,components:4};case Ts:case fd:case xi:return{byteLength:4,components:1};case qm:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:hd}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=hd);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Sg(){let n=null,e=!1,t=null,i=null;function s(r,a){t(r,a),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function ZE(n){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,d=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){const u=l.array,d=l.updateRanges;if(n.bindBuffer(c,o),d.length===0)n.bufferSubData(c,0,u);else{d.sort((f,b)=>f.start-b.start);let h=0;for(let f=1;f<d.length;f++){const b=d[h],x=d[f];x.start<=b.start+b.count+1?b.count=Math.max(b.count,x.start+x.count-b.start):(++h,d[h]=x)}d.length=h+1;for(let f=0,b=d.length;f<b;f++){const x=d[f];n.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var JE=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,QE=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ew=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,tw=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,nw=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,iw=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,sw=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,rw=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,aw=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,ow=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,lw=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,cw=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,uw=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,dw=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,hw=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,fw=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,pw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,mw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,gw=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,vw=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,_w=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,yw=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,bw=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,xw=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Sw=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Mw=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Ew=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,ww=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Aw=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Tw=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Rw="gl_FragColor = linearToOutputTexel( gl_FragColor );",Cw=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Pw=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Iw=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Dw=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Lw=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Uw=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Nw=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ow=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Fw=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,kw=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Bw=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,zw=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Vw=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Hw=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$w=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Gw=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Ww=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Xw=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,qw=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Yw=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,jw=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Kw=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Zw=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Jw=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Qw=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,eA=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,tA=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,nA=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,iA=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,sA=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,rA=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,aA=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,oA=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lA=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,cA=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,uA=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,dA=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,hA=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,fA=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,pA=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mA=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,gA=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,vA=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,_A=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,yA=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,bA=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,xA=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,SA=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,MA=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,EA=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,wA=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,AA=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,TA=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,RA=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,CA=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,PA=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,IA=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,DA=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,LA=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,UA=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,NA=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,OA=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,FA=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,kA=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,BA=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,zA=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,VA=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,HA=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,$A=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,GA=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,WA=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,XA=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,qA=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,YA=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,jA=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,KA=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const ZA=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,JA=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,QA=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,eT=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nT=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,iT=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,sT=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,rT=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,aT=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,oT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lT=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cT=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,uT=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,dT=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,hT=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fT=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,pT=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mT=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,gT=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vT=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,_T=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,yT=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bT=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xT=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ST=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,MT=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ET=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wT=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,AT=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,TT=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,RT=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,CT=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,PT=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,et={alphahash_fragment:JE,alphahash_pars_fragment:QE,alphamap_fragment:ew,alphamap_pars_fragment:tw,alphatest_fragment:nw,alphatest_pars_fragment:iw,aomap_fragment:sw,aomap_pars_fragment:rw,batching_pars_vertex:aw,batching_vertex:ow,begin_vertex:lw,beginnormal_vertex:cw,bsdfs:uw,iridescence_fragment:dw,bumpmap_pars_fragment:hw,clipping_planes_fragment:fw,clipping_planes_pars_fragment:pw,clipping_planes_pars_vertex:mw,clipping_planes_vertex:gw,color_fragment:vw,color_pars_fragment:_w,color_pars_vertex:yw,color_vertex:bw,common:xw,cube_uv_reflection_fragment:Sw,defaultnormal_vertex:Mw,displacementmap_pars_vertex:Ew,displacementmap_vertex:ww,emissivemap_fragment:Aw,emissivemap_pars_fragment:Tw,colorspace_fragment:Rw,colorspace_pars_fragment:Cw,envmap_fragment:Pw,envmap_common_pars_fragment:Iw,envmap_pars_fragment:Dw,envmap_pars_vertex:Lw,envmap_physical_pars_fragment:Gw,envmap_vertex:Uw,fog_vertex:Nw,fog_pars_vertex:Ow,fog_fragment:Fw,fog_pars_fragment:kw,gradientmap_pars_fragment:Bw,lightmap_pars_fragment:zw,lights_lambert_fragment:Vw,lights_lambert_pars_fragment:Hw,lights_pars_begin:$w,lights_toon_fragment:Ww,lights_toon_pars_fragment:Xw,lights_phong_fragment:qw,lights_phong_pars_fragment:Yw,lights_physical_fragment:jw,lights_physical_pars_fragment:Kw,lights_fragment_begin:Zw,lights_fragment_maps:Jw,lights_fragment_end:Qw,logdepthbuf_fragment:eA,logdepthbuf_pars_fragment:tA,logdepthbuf_pars_vertex:nA,logdepthbuf_vertex:iA,map_fragment:sA,map_pars_fragment:rA,map_particle_fragment:aA,map_particle_pars_fragment:oA,metalnessmap_fragment:lA,metalnessmap_pars_fragment:cA,morphinstance_vertex:uA,morphcolor_vertex:dA,morphnormal_vertex:hA,morphtarget_pars_vertex:fA,morphtarget_vertex:pA,normal_fragment_begin:mA,normal_fragment_maps:gA,normal_pars_fragment:vA,normal_pars_vertex:_A,normal_vertex:yA,normalmap_pars_fragment:bA,clearcoat_normal_fragment_begin:xA,clearcoat_normal_fragment_maps:SA,clearcoat_pars_fragment:MA,iridescence_pars_fragment:EA,opaque_fragment:wA,packing:AA,premultiplied_alpha_fragment:TA,project_vertex:RA,dithering_fragment:CA,dithering_pars_fragment:PA,roughnessmap_fragment:IA,roughnessmap_pars_fragment:DA,shadowmap_pars_fragment:LA,shadowmap_pars_vertex:UA,shadowmap_vertex:NA,shadowmask_pars_fragment:OA,skinbase_vertex:FA,skinning_pars_vertex:kA,skinning_vertex:BA,skinnormal_vertex:zA,specularmap_fragment:VA,specularmap_pars_fragment:HA,tonemapping_fragment:$A,tonemapping_pars_fragment:GA,transmission_fragment:WA,transmission_pars_fragment:XA,uv_pars_fragment:qA,uv_pars_vertex:YA,uv_vertex:jA,worldpos_vertex:KA,background_vert:ZA,background_frag:JA,backgroundCube_vert:QA,backgroundCube_frag:eT,cube_vert:tT,cube_frag:nT,depth_vert:iT,depth_frag:sT,distanceRGBA_vert:rT,distanceRGBA_frag:aT,equirect_vert:oT,equirect_frag:lT,linedashed_vert:cT,linedashed_frag:uT,meshbasic_vert:dT,meshbasic_frag:hT,meshlambert_vert:fT,meshlambert_frag:pT,meshmatcap_vert:mT,meshmatcap_frag:gT,meshnormal_vert:vT,meshnormal_frag:_T,meshphong_vert:yT,meshphong_frag:bT,meshphysical_vert:xT,meshphysical_frag:ST,meshtoon_vert:MT,meshtoon_frag:ET,points_vert:wT,points_frag:AT,shadow_vert:TT,shadow_frag:RT,sprite_vert:CT,sprite_frag:PT},Ce={common:{diffuse:{value:new rt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qe}},envmap:{envMap:{value:null},envMapRotation:{value:new Qe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qe},normalScale:{value:new Ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new rt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new rt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0},uvTransform:{value:new Qe}},sprite:{diffuse:{value:new rt(16777215)},opacity:{value:1},center:{value:new Ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}}},ei={basic:{uniforms:ln([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.fog]),vertexShader:et.meshbasic_vert,fragmentShader:et.meshbasic_frag},lambert:{uniforms:ln([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new rt(0)}}]),vertexShader:et.meshlambert_vert,fragmentShader:et.meshlambert_frag},phong:{uniforms:ln([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new rt(0)},specular:{value:new rt(1118481)},shininess:{value:30}}]),vertexShader:et.meshphong_vert,fragmentShader:et.meshphong_frag},standard:{uniforms:ln([Ce.common,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.roughnessmap,Ce.metalnessmap,Ce.fog,Ce.lights,{emissive:{value:new rt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag},toon:{uniforms:ln([Ce.common,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.gradientmap,Ce.fog,Ce.lights,{emissive:{value:new rt(0)}}]),vertexShader:et.meshtoon_vert,fragmentShader:et.meshtoon_frag},matcap:{uniforms:ln([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,{matcap:{value:null}}]),vertexShader:et.meshmatcap_vert,fragmentShader:et.meshmatcap_frag},points:{uniforms:ln([Ce.points,Ce.fog]),vertexShader:et.points_vert,fragmentShader:et.points_frag},dashed:{uniforms:ln([Ce.common,Ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:et.linedashed_vert,fragmentShader:et.linedashed_frag},depth:{uniforms:ln([Ce.common,Ce.displacementmap]),vertexShader:et.depth_vert,fragmentShader:et.depth_frag},normal:{uniforms:ln([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,{opacity:{value:1}}]),vertexShader:et.meshnormal_vert,fragmentShader:et.meshnormal_frag},sprite:{uniforms:ln([Ce.sprite,Ce.fog]),vertexShader:et.sprite_vert,fragmentShader:et.sprite_frag},background:{uniforms:{uvTransform:{value:new Qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:et.background_vert,fragmentShader:et.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qe}},vertexShader:et.backgroundCube_vert,fragmentShader:et.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:et.cube_vert,fragmentShader:et.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:et.equirect_vert,fragmentShader:et.equirect_frag},distanceRGBA:{uniforms:ln([Ce.common,Ce.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:et.distanceRGBA_vert,fragmentShader:et.distanceRGBA_frag},shadow:{uniforms:ln([Ce.lights,Ce.fog,{color:{value:new rt(0)},opacity:{value:1}}]),vertexShader:et.shadow_vert,fragmentShader:et.shadow_frag}};ei.physical={uniforms:ln([ei.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qe},clearcoatNormalScale:{value:new Ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qe},sheen:{value:0},sheenColor:{value:new rt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qe},transmissionSamplerSize:{value:new Ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qe},attenuationDistance:{value:0},attenuationColor:{value:new rt(0)},specularColor:{value:new rt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qe},anisotropyVector:{value:new Ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qe}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag};const yo={r:0,b:0,g:0},ds=new ai,IT=new Tt;function DT(n,e,t,i,s,r,a){const o=new rt(0);let l=r===!0?0:1,c,u,d=null,h=0,f=null;function b(S){let m=S.isScene===!0?S.background:null;return m&&m.isTexture&&(m=(S.backgroundBlurriness>0?t:e).get(m)),m}function x(S){let m=!1;const w=b(S);w===null?g(o,l):w&&w.isColor&&(g(w,1),m=!0);const T=n.xr.getEnvironmentBlendMode();T==="additive"?i.buffers.color.setClear(0,0,0,1,a):T==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||m)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function y(S,m){const w=b(m);w&&(w.isCubeTexture||w.mapping===_l)?(u===void 0&&(u=new yt(new Lr(1,1,1),new es({name:"BackgroundCubeMaterial",uniforms:Rr(ei.backgroundCube.uniforms),vertexShader:ei.backgroundCube.vertexShader,fragmentShader:ei.backgroundCube.fragmentShader,side:yn,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(T,R,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),ds.copy(m.backgroundRotation),ds.x*=-1,ds.y*=-1,ds.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(ds.y*=-1,ds.z*=-1),u.material.uniforms.envMap.value=w,u.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(IT.makeRotationFromEuler(ds)),u.material.toneMapped=ht.getTransfer(w.colorSpace)!==St,(d!==w||h!==w.version||f!==n.toneMapping)&&(u.material.needsUpdate=!0,d=w,h=w.version,f=n.toneMapping),u.layers.enableAll(),S.unshift(u,u.geometry,u.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new yt(new Es(2,2),new es({name:"BackgroundMaterial",uniforms:Rr(ei.background.uniforms),vertexShader:ei.background.vertexShader,fragmentShader:ei.background.fragmentShader,side:Qi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,c.material.toneMapped=ht.getTransfer(w.colorSpace)!==St,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(d!==w||h!==w.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,d=w,h=w.version,f=n.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function g(S,m){S.getRGB(yo,cg(n)),i.buffers.color.setClear(yo.r,yo.g,yo.b,m,a)}function A(){u!==void 0&&(u.geometry.dispose(),u.material.dispose()),c!==void 0&&(c.geometry.dispose(),c.material.dispose())}return{getClearColor:function(){return o},setClearColor:function(S,m=1){o.set(S),l=m,g(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(S){l=S,g(o,l)},render:x,addToRenderList:y,dispose:A}}function LT(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=h(null);let r=s,a=!1;function o(C,F,G,B,$){let j=!1;const Y=d(B,G,F);r!==Y&&(r=Y,c(r.object)),j=f(C,B,G,$),j&&b(C,B,G,$),$!==null&&e.update($,n.ELEMENT_ARRAY_BUFFER),(j||a)&&(a=!1,m(C,F,G,B),$!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get($).buffer))}function l(){return n.createVertexArray()}function c(C){return n.bindVertexArray(C)}function u(C){return n.deleteVertexArray(C)}function d(C,F,G){const B=G.wireframe===!0;let $=i[C.id];$===void 0&&($={},i[C.id]=$);let j=$[F.id];j===void 0&&(j={},$[F.id]=j);let Y=j[B];return Y===void 0&&(Y=h(l()),j[B]=Y),Y}function h(C){const F=[],G=[],B=[];for(let $=0;$<t;$++)F[$]=0,G[$]=0,B[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:G,attributeDivisors:B,object:C,attributes:{},index:null}}function f(C,F,G,B){const $=r.attributes,j=F.attributes;let Y=0;const re=G.getAttributes();for(const K in re)if(re[K].location>=0){const Re=$[K];let De=j[K];if(De===void 0&&(K==="instanceMatrix"&&C.instanceMatrix&&(De=C.instanceMatrix),K==="instanceColor"&&C.instanceColor&&(De=C.instanceColor)),Re===void 0||Re.attribute!==De||De&&Re.data!==De.data)return!0;Y++}return r.attributesNum!==Y||r.index!==B}function b(C,F,G,B){const $={},j=F.attributes;let Y=0;const re=G.getAttributes();for(const K in re)if(re[K].location>=0){let Re=j[K];Re===void 0&&(K==="instanceMatrix"&&C.instanceMatrix&&(Re=C.instanceMatrix),K==="instanceColor"&&C.instanceColor&&(Re=C.instanceColor));const De={};De.attribute=Re,Re&&Re.data&&(De.data=Re.data),$[K]=De,Y++}r.attributes=$,r.attributesNum=Y,r.index=B}function x(){const C=r.newAttributes;for(let F=0,G=C.length;F<G;F++)C[F]=0}function y(C){g(C,0)}function g(C,F){const G=r.newAttributes,B=r.enabledAttributes,$=r.attributeDivisors;G[C]=1,B[C]===0&&(n.enableVertexAttribArray(C),B[C]=1),$[C]!==F&&(n.vertexAttribDivisor(C,F),$[C]=F)}function A(){const C=r.newAttributes,F=r.enabledAttributes;for(let G=0,B=F.length;G<B;G++)F[G]!==C[G]&&(n.disableVertexAttribArray(G),F[G]=0)}function S(C,F,G,B,$,j,Y){Y===!0?n.vertexAttribIPointer(C,F,G,$,j):n.vertexAttribPointer(C,F,G,B,$,j)}function m(C,F,G,B){x();const $=B.attributes,j=G.getAttributes(),Y=F.defaultAttributeValues;for(const re in j){const K=j[re];if(K.location>=0){let Se=$[re];if(Se===void 0&&(re==="instanceMatrix"&&C.instanceMatrix&&(Se=C.instanceMatrix),re==="instanceColor"&&C.instanceColor&&(Se=C.instanceColor)),Se!==void 0){const Re=Se.normalized,De=Se.itemSize,Ve=e.get(Se);if(Ve===void 0)continue;const st=Ve.buffer,fe=Ve.type,xe=Ve.bytesPerElement,Te=fe===n.INT||fe===n.UNSIGNED_INT||Se.gpuType===fd;if(Se.isInterleavedBufferAttribute){const H=Se.data,me=H.stride,he=Se.offset;if(H.isInstancedInterleavedBuffer){for(let ye=0;ye<K.locationSize;ye++)g(K.location+ye,H.meshPerAttribute);C.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=H.meshPerAttribute*H.count)}else for(let ye=0;ye<K.locationSize;ye++)y(K.location+ye);n.bindBuffer(n.ARRAY_BUFFER,st);for(let ye=0;ye<K.locationSize;ye++)S(K.location+ye,De/K.locationSize,fe,Re,me*xe,(he+De/K.locationSize*ye)*xe,Te)}else{if(Se.isInstancedBufferAttribute){for(let H=0;H<K.locationSize;H++)g(K.location+H,Se.meshPerAttribute);C.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=Se.meshPerAttribute*Se.count)}else for(let H=0;H<K.locationSize;H++)y(K.location+H);n.bindBuffer(n.ARRAY_BUFFER,st);for(let H=0;H<K.locationSize;H++)S(K.location+H,De/K.locationSize,fe,Re,De*xe,De/K.locationSize*H*xe,Te)}}else if(Y!==void 0){const Re=Y[re];if(Re!==void 0)switch(Re.length){case 2:n.vertexAttrib2fv(K.location,Re);break;case 3:n.vertexAttrib3fv(K.location,Re);break;case 4:n.vertexAttrib4fv(K.location,Re);break;default:n.vertexAttrib1fv(K.location,Re)}}}}A()}function w(){U();for(const C in i){const F=i[C];for(const G in F){const B=F[G];for(const $ in B)u(B[$].object),delete B[$];delete F[G]}delete i[C]}}function T(C){if(i[C.id]===void 0)return;const F=i[C.id];for(const G in F){const B=F[G];for(const $ in B)u(B[$].object),delete B[$];delete F[G]}delete i[C.id]}function R(C){for(const F in i){const G=i[F];if(G[C.id]===void 0)continue;const B=G[C.id];for(const $ in B)u(B[$].object),delete B[$];delete G[C.id]}}function U(){M(),a=!0,r!==s&&(r=s,c(r.object))}function M(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:U,resetDefaultState:M,dispose:w,releaseStatesOfGeometry:T,releaseStatesOfProgram:R,initAttributes:x,enableAttribute:y,disableUnusedAttributes:A}}function UT(n,e,t){let i;function s(c){i=c}function r(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function a(c,u,d){d!==0&&(n.drawArraysInstanced(i,c,u,d),t.update(u,i,d))}function o(c,u,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,d);let f=0;for(let b=0;b<d;b++)f+=u[b];t.update(f,i,1)}function l(c,u,d,h){if(d===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let b=0;b<c.length;b++)a(c[b],u[b],h[b]);else{f.multiDrawArraysInstancedWEBGL(i,c,0,u,0,h,0,d);let b=0;for(let x=0;x<d;x++)b+=u[x]*h[x];t.update(b,i,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function NT(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==$n&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){const U=R===Pa&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==Ci&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==xi&&!U)}function l(R){if(R==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const d=t.logarithmicDepthBuffer===!0,h=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),b=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),y=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),g=n.getParameter(n.MAX_VERTEX_ATTRIBS),A=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),S=n.getParameter(n.MAX_VARYING_VECTORS),m=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),w=b>0,T=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reverseDepthBuffer:h,maxTextures:f,maxVertexTextures:b,maxTextureSize:x,maxCubemapSize:y,maxAttributes:g,maxVertexUniforms:A,maxVaryings:S,maxFragmentUniforms:m,vertexTextures:w,maxSamples:T}}function OT(n){const e=this;let t=null,i=0,s=!1,r=!1;const a=new Hi,o=new Qe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){const f=d.length!==0||h||i!==0||s;return s=h,i=d.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,f){const b=d.clippingPlanes,x=d.clipIntersection,y=d.clipShadows,g=n.get(d);if(!s||b===null||b.length===0||r&&!y)r?u(null):c();else{const A=r?0:i,S=A*4;let m=g.clippingState||null;l.value=m,m=u(b,h,S,f);for(let w=0;w!==S;++w)m[w]=t[w];g.clippingState=m,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=A}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(d,h,f,b){const x=d!==null?d.length:0;let y=null;if(x!==0){if(y=l.value,b!==!0||y===null){const g=f+x*4,A=h.matrixWorldInverse;o.getNormalMatrix(A),(y===null||y.length<g)&&(y=new Float32Array(g));for(let S=0,m=f;S!==x;++S,m+=4)a.copy(d[S]).applyMatrix4(A,o),a.normal.toArray(y,m),y[m+3]=a.constant}l.value=y,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,y}}function FT(n){let e=new WeakMap;function t(a,o){return o===ru?a.mapping=Mr:o===au&&(a.mapping=Er),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===ru||o===au)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new SE(l.height);return c.fromEquirectangularTexture(n,a),e.set(a,c),a.addEventListener("dispose",s),t(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}const or=4,Tf=[.125,.215,.35,.446,.526,.582],vs=20,Mc=new xg,Rf=new rt;let Ec=null,wc=0,Ac=0,Tc=!1;const ps=(1+Math.sqrt(5))/2,er=1/ps,Cf=[new V(-ps,er,0),new V(ps,er,0),new V(-er,0,ps),new V(er,0,ps),new V(0,ps,-er),new V(0,ps,er),new V(-1,1,-1),new V(1,1,-1),new V(-1,1,1),new V(1,1,1)];class Pf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){Ec=this._renderer.getRenderTarget(),wc=this._renderer.getActiveCubeFace(),Ac=this._renderer.getActiveMipmapLevel(),Tc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,i,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Lf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Df(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ec,wc,Ac),this._renderer.xr.enabled=Tc,e.scissorTest=!1,bo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Mr||e.mapping===Er?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ec=this._renderer.getRenderTarget(),wc=this._renderer.getActiveCubeFace(),Ac=this._renderer.getActiveMipmapLevel(),Tc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Hn,minFilter:Hn,generateMipmaps:!1,type:Pa,format:$n,colorSpace:Tr,depthBuffer:!1},s=If(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=If(e,t,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=kT(r)),this._blurMaterial=BT(r,e,t)}return s}_compileMaterial(e){const t=new yt(this._lodPlanes[0],e);this._renderer.compile(t,Mc)}_sceneToCubeUV(e,t,i,s){const o=new _n(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,h=u.toneMapping;u.getClearColor(Rf),u.toneMapping=qi,u.autoClear=!1;const f=new ra({name:"PMREM.Background",side:yn,depthWrite:!1,depthTest:!1}),b=new yt(new Lr,f);let x=!1;const y=e.background;y?y.isColor&&(f.color.copy(y),e.background=null,x=!0):(f.color.copy(Rf),x=!0);for(let g=0;g<6;g++){const A=g%3;A===0?(o.up.set(0,l[g],0),o.lookAt(c[g],0,0)):A===1?(o.up.set(0,0,l[g]),o.lookAt(0,c[g],0)):(o.up.set(0,l[g],0),o.lookAt(0,0,c[g]));const S=this._cubeSize;bo(s,A*S,g>2?S:0,S,S),u.setRenderTarget(s),x&&u.render(b,o),u.render(e,o)}b.geometry.dispose(),b.material.dispose(),u.toneMapping=h,u.autoClear=d,e.background=y}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===Mr||e.mapping===Er;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Lf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Df());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new yt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;bo(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,Mc)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Cf[(s-r-1)%Cf.length];this._blur(e,r-1,r,a,o)}t.autoClear=i}_blur(e,t,i,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,s,"latitudinal",r),this._halfBlur(a,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,d=new yt(this._lodPlanes[s],c),h=c.uniforms,f=this._sizeLods[i]-1,b=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*vs-1),x=r/b,y=isFinite(r)?1+Math.floor(u*x):vs;y>vs&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${y} samples when the maximum is set to ${vs}`);const g=[];let A=0;for(let R=0;R<vs;++R){const U=R/x,M=Math.exp(-U*U/2);g.push(M),R===0?A+=M:R<y&&(A+=2*M)}for(let R=0;R<g.length;R++)g[R]=g[R]/A;h.envMap.value=e.texture,h.samples.value=y,h.weights.value=g,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);const{_lodMax:S}=this;h.dTheta.value=b,h.mipInt.value=S-i;const m=this._sizeLods[s],w=3*m*(s>S-or?s-S+or:0),T=4*(this._cubeSize-m);bo(t,w,T,3*m,2*m),l.setRenderTarget(t),l.render(d,Mc)}}function kT(n){const e=[],t=[],i=[];let s=n;const r=n-or+1+Tf.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);t.push(o);let l=1/o;a>n-or?l=Tf[a-n+or-1]:a===0&&(l=0),i.push(l);const c=1/(o-2),u=-c,d=1+c,h=[u,u,d,u,d,d,u,u,d,d,u,d],f=6,b=6,x=3,y=2,g=1,A=new Float32Array(x*b*f),S=new Float32Array(y*b*f),m=new Float32Array(g*b*f);for(let T=0;T<f;T++){const R=T%3*2/3-1,U=T>2?0:-1,M=[R,U,0,R+2/3,U,0,R+2/3,U+1,0,R,U,0,R+2/3,U+1,0,R,U+1,0];A.set(M,x*b*T),S.set(h,y*b*T);const C=[T,T,T,T,T,T];m.set(C,g*b*T)}const w=new Cn;w.setAttribute("position",new Xn(A,x)),w.setAttribute("uv",new Xn(S,y)),w.setAttribute("faceIndex",new Xn(m,g)),e.push(w),s>or&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function If(n,e,t){const i=new Rs(n,e,t);return i.texture.mapping=_l,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function bo(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function BT(n,e,t){const i=new Float32Array(vs),s=new V(0,1,0);return new es({name:"SphericalGaussianBlur",defines:{n:vs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Td(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Xi,depthTest:!1,depthWrite:!1})}function Df(){return new es({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Td(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Xi,depthTest:!1,depthWrite:!1})}function Lf(){return new es({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Td(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Xi,depthTest:!1,depthWrite:!1})}function Td(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function zT(n){let e=new WeakMap,t=null;function i(o){if(o&&o.isTexture){const l=o.mapping,c=l===ru||l===au,u=l===Mr||l===Er;if(c||u){let d=e.get(o);const h=d!==void 0?d.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==h)return t===null&&(t=new Pf(n)),d=c?t.fromEquirectangular(o,d):t.fromCubemap(o,d),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),d.texture;if(d!==void 0)return d.texture;{const f=o.image;return c&&f&&f.height>0||u&&f&&s(f)?(t===null&&(t=new Pf(n)),d=c?t.fromEquirectangular(o):t.fromCubemap(o),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),o.addEventListener("dispose",r),d.texture):null}}}return o}function s(o){let l=0;const c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:a}}function VT(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&sr("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function HT(n,e,t,i){const s={},r=new WeakMap;function a(d){const h=d.target;h.index!==null&&e.remove(h.index);for(const b in h.attributes)e.remove(h.attributes[b]);h.removeEventListener("dispose",a),delete s[h.id];const f=r.get(h);f&&(e.remove(f),r.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(d,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function l(d){const h=d.attributes;for(const f in h)e.update(h[f],n.ARRAY_BUFFER)}function c(d){const h=[],f=d.index,b=d.attributes.position;let x=0;if(f!==null){const A=f.array;x=f.version;for(let S=0,m=A.length;S<m;S+=3){const w=A[S+0],T=A[S+1],R=A[S+2];h.push(w,T,T,R,R,w)}}else if(b!==void 0){const A=b.array;x=b.version;for(let S=0,m=A.length/3-1;S<m;S+=3){const w=S+0,T=S+1,R=S+2;h.push(w,T,T,R,R,w)}}else return;const y=new(ig(h)?lg:og)(h,1);y.version=x;const g=r.get(d);g&&e.remove(g),r.set(d,y)}function u(d){const h=r.get(d);if(h){const f=d.index;f!==null&&h.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:u}}function $T(n,e,t){let i;function s(h){i=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function l(h,f){n.drawElements(i,f,r,h*a),t.update(f,i,1)}function c(h,f,b){b!==0&&(n.drawElementsInstanced(i,f,r,h*a,b),t.update(f,i,b))}function u(h,f,b){if(b===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,r,h,0,b);let y=0;for(let g=0;g<b;g++)y+=f[g];t.update(y,i,1)}function d(h,f,b,x){if(b===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let g=0;g<h.length;g++)c(h[g]/a,f[g],x[g]);else{y.multiDrawElementsInstancedWEBGL(i,f,0,r,h,0,x,0,b);let g=0;for(let A=0;A<b;A++)g+=f[A]*x[A];t.update(g,i,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function GT(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function WT(n,e,t){const i=new WeakMap,s=new Lt;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0;let h=i.get(o);if(h===void 0||h.count!==d){let M=function(){R.dispose(),i.delete(o),o.removeEventListener("dispose",M)};h!==void 0&&h.texture.dispose();const f=o.morphAttributes.position!==void 0,b=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,y=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],A=o.morphAttributes.color||[];let S=0;f===!0&&(S=1),b===!0&&(S=2),x===!0&&(S=3);let m=o.attributes.position.count*S,w=1;m>e.maxTextureSize&&(w=Math.ceil(m/e.maxTextureSize),m=e.maxTextureSize);const T=new Float32Array(m*w*4*d),R=new rg(T,m,w,d);R.type=xi,R.needsUpdate=!0;const U=S*4;for(let C=0;C<d;C++){const F=y[C],G=g[C],B=A[C],$=m*w*4*C;for(let j=0;j<F.count;j++){const Y=j*U;f===!0&&(s.fromBufferAttribute(F,j),T[$+Y+0]=s.x,T[$+Y+1]=s.y,T[$+Y+2]=s.z,T[$+Y+3]=0),b===!0&&(s.fromBufferAttribute(G,j),T[$+Y+4]=s.x,T[$+Y+5]=s.y,T[$+Y+6]=s.z,T[$+Y+7]=0),x===!0&&(s.fromBufferAttribute(B,j),T[$+Y+8]=s.x,T[$+Y+9]=s.y,T[$+Y+10]=s.z,T[$+Y+11]=B.itemSize===4?s.w:1)}}h={count:d,texture:R,size:new Ee(m,w)},i.set(o,h),o.addEventListener("dispose",M)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let f=0;for(let x=0;x<c.length;x++)f+=c[x];const b=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",b),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:r}}function XT(n,e,t,i){let s=new WeakMap;function r(l){const c=i.render.frame,u=l.geometry,d=e.get(l,u);if(s.get(d)!==c&&(e.update(d),s.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;s.get(h)!==c&&(h.update(),s.set(h,c))}return d}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}const Mg=new fn,Uf=new mg(1,1),Eg=new rg,wg=new aE,Ag=new dg,Nf=[],Of=[],Ff=new Float32Array(16),kf=new Float32Array(9),Bf=new Float32Array(4);function Ur(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=Nf[s];if(r===void 0&&(r=new Float32Array(s),Nf[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function Wt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Xt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function xl(n,e){let t=Of[e];t===void 0&&(t=new Int32Array(e),Of[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function qT(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function YT(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;n.uniform2fv(this.addr,e),Xt(t,e)}}function jT(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Wt(t,e))return;n.uniform3fv(this.addr,e),Xt(t,e)}}function KT(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;n.uniform4fv(this.addr,e),Xt(t,e)}}function ZT(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Wt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,i))return;Bf.set(i),n.uniformMatrix2fv(this.addr,!1,Bf),Xt(t,i)}}function JT(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Wt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,i))return;kf.set(i),n.uniformMatrix3fv(this.addr,!1,kf),Xt(t,i)}}function QT(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Wt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,i))return;Ff.set(i),n.uniformMatrix4fv(this.addr,!1,Ff),Xt(t,i)}}function e2(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function t2(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;n.uniform2iv(this.addr,e),Xt(t,e)}}function n2(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Wt(t,e))return;n.uniform3iv(this.addr,e),Xt(t,e)}}function i2(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;n.uniform4iv(this.addr,e),Xt(t,e)}}function s2(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function r2(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;n.uniform2uiv(this.addr,e),Xt(t,e)}}function a2(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Wt(t,e))return;n.uniform3uiv(this.addr,e),Xt(t,e)}}function o2(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;n.uniform4uiv(this.addr,e),Xt(t,e)}}function l2(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Uf.compareFunction=ng,r=Uf):r=Mg,t.setTexture2D(e||r,s)}function c2(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||wg,s)}function u2(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Ag,s)}function d2(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Eg,s)}function h2(n){switch(n){case 5126:return qT;case 35664:return YT;case 35665:return jT;case 35666:return KT;case 35674:return ZT;case 35675:return JT;case 35676:return QT;case 5124:case 35670:return e2;case 35667:case 35671:return t2;case 35668:case 35672:return n2;case 35669:case 35673:return i2;case 5125:return s2;case 36294:return r2;case 36295:return a2;case 36296:return o2;case 35678:case 36198:case 36298:case 36306:case 35682:return l2;case 35679:case 36299:case 36307:return c2;case 35680:case 36300:case 36308:case 36293:return u2;case 36289:case 36303:case 36311:case 36292:return d2}}function f2(n,e){n.uniform1fv(this.addr,e)}function p2(n,e){const t=Ur(e,this.size,2);n.uniform2fv(this.addr,t)}function m2(n,e){const t=Ur(e,this.size,3);n.uniform3fv(this.addr,t)}function g2(n,e){const t=Ur(e,this.size,4);n.uniform4fv(this.addr,t)}function v2(n,e){const t=Ur(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function _2(n,e){const t=Ur(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function y2(n,e){const t=Ur(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function b2(n,e){n.uniform1iv(this.addr,e)}function x2(n,e){n.uniform2iv(this.addr,e)}function S2(n,e){n.uniform3iv(this.addr,e)}function M2(n,e){n.uniform4iv(this.addr,e)}function E2(n,e){n.uniform1uiv(this.addr,e)}function w2(n,e){n.uniform2uiv(this.addr,e)}function A2(n,e){n.uniform3uiv(this.addr,e)}function T2(n,e){n.uniform4uiv(this.addr,e)}function R2(n,e,t){const i=this.cache,s=e.length,r=xl(t,s);Wt(i,r)||(n.uniform1iv(this.addr,r),Xt(i,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||Mg,r[a])}function C2(n,e,t){const i=this.cache,s=e.length,r=xl(t,s);Wt(i,r)||(n.uniform1iv(this.addr,r),Xt(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||wg,r[a])}function P2(n,e,t){const i=this.cache,s=e.length,r=xl(t,s);Wt(i,r)||(n.uniform1iv(this.addr,r),Xt(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Ag,r[a])}function I2(n,e,t){const i=this.cache,s=e.length,r=xl(t,s);Wt(i,r)||(n.uniform1iv(this.addr,r),Xt(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Eg,r[a])}function D2(n){switch(n){case 5126:return f2;case 35664:return p2;case 35665:return m2;case 35666:return g2;case 35674:return v2;case 35675:return _2;case 35676:return y2;case 5124:case 35670:return b2;case 35667:case 35671:return x2;case 35668:case 35672:return S2;case 35669:case 35673:return M2;case 5125:return E2;case 36294:return w2;case 36295:return A2;case 36296:return T2;case 35678:case 36198:case 36298:case 36306:case 35682:return R2;case 35679:case 36299:case 36307:return C2;case 35680:case 36300:case 36308:case 36293:return P2;case 36289:case 36303:case 36311:case 36292:return I2}}class L2{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=h2(t.type)}}class U2{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=D2(t.type)}}class N2{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],i)}}}const Rc=/(\w+)(\])?(\[|\.)?/g;function zf(n,e){n.seq.push(e),n.map[e.id]=e}function O2(n,e,t){const i=n.name,s=i.length;for(Rc.lastIndex=0;;){const r=Rc.exec(i),a=Rc.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){zf(t,c===void 0?new L2(o,n,e):new U2(o,n,e));break}else{let d=t.map[o];d===void 0&&(d=new N2(o),zf(t,d)),t=d}}}class Io{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);O2(r,a,this)}}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&i.push(a)}return i}}function Vf(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const F2=37297;let k2=0;function B2(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}const Hf=new Qe;function z2(n){ht._getMatrix(Hf,ht.workingColorSpace,n);const e=`mat3( ${Hf.elements.map(t=>t.toFixed(4))} )`;switch(ht.getTransfer(n)){case Xo:return[e,"LinearTransferOETF"];case St:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function $f(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),s=n.getShaderInfoLog(e).trim();if(i&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+B2(n.getShaderSource(e),a)}else return s}function V2(n,e){const t=z2(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function H2(n,e){let t;switch(e){case DM:t="Linear";break;case LM:t="Reinhard";break;case UM:t="Cineon";break;case vl:t="ACESFilmic";break;case OM:t="AgX";break;case FM:t="Neutral";break;case NM:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const xo=new V;function $2(){ht.getLuminanceCoefficients(xo);const n=xo.x.toFixed(4),e=xo.y.toFixed(4),t=xo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function G2(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Kr).join(`
`)}function W2(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function X2(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),a=r.name;let o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Kr(n){return n!==""}function Gf(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Wf(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const q2=/^[ \t]*#include +<([\w\d./]+)>/gm;function ku(n){return n.replace(q2,j2)}const Y2=new Map;function j2(n,e){let t=et[e];if(t===void 0){const i=Y2.get(e);if(i!==void 0)t=et[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return ku(t)}const K2=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Xf(n){return n.replace(K2,Z2)}function Z2(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function qf(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function J2(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Hm?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===dM?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===gi&&(e="SHADOWMAP_TYPE_VSM"),e}function Q2(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Mr:case Er:e="ENVMAP_TYPE_CUBE";break;case _l:e="ENVMAP_TYPE_CUBE_UV";break}return e}function eR(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Er:e="ENVMAP_MODE_REFRACTION";break}return e}function tR(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case $m:e="ENVMAP_BLENDING_MULTIPLY";break;case PM:e="ENVMAP_BLENDING_MIX";break;case IM:e="ENVMAP_BLENDING_ADD";break}return e}function nR(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function iR(n,e,t,i){const s=n.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=J2(t),c=Q2(t),u=eR(t),d=tR(t),h=nR(t),f=G2(t),b=W2(r),x=s.createProgram();let y,g,A=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(y=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,b].filter(Kr).join(`
`),y.length>0&&(y+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,b].filter(Kr).join(`
`),g.length>0&&(g+=`
`)):(y=[qf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,b,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Kr).join(`
`),g=[qf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,b,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==qi?"#define TONE_MAPPING":"",t.toneMapping!==qi?et.tonemapping_pars_fragment:"",t.toneMapping!==qi?H2("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",et.colorspace_pars_fragment,V2("linearToOutputTexel",t.outputColorSpace),$2(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Kr).join(`
`)),a=ku(a),a=Gf(a,t),a=Wf(a,t),o=ku(o),o=Gf(o,t),o=Wf(o,t),a=Xf(a),o=Xf(o),t.isRawShaderMaterial!==!0&&(A=`#version 300 es
`,y=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+y,g=["#define varying in",t.glslVersion===qh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===qh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const S=A+y+a,m=A+g+o,w=Vf(s,s.VERTEX_SHADER,S),T=Vf(s,s.FRAGMENT_SHADER,m);s.attachShader(x,w),s.attachShader(x,T),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function R(F){if(n.debug.checkShaderErrors){const G=s.getProgramInfoLog(x).trim(),B=s.getShaderInfoLog(w).trim(),$=s.getShaderInfoLog(T).trim();let j=!0,Y=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(j=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,w,T);else{const re=$f(s,w,"vertex"),K=$f(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+F.name+`
Material Type: `+F.type+`

Program Info Log: `+G+`
`+re+`
`+K)}else G!==""?console.warn("THREE.WebGLProgram: Program Info Log:",G):(B===""||$==="")&&(Y=!1);Y&&(F.diagnostics={runnable:j,programLog:G,vertexShader:{log:B,prefix:y},fragmentShader:{log:$,prefix:g}})}s.deleteShader(w),s.deleteShader(T),U=new Io(s,x),M=X2(s,x)}let U;this.getUniforms=function(){return U===void 0&&R(this),U};let M;this.getAttributes=function(){return M===void 0&&R(this),M};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(x,F2)),C},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=k2++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=w,this.fragmentShader=T,this}let sR=0;class rR{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new aR(e),t.set(e,i)),i}}class aR{constructor(e){this.id=sR++,this.code=e,this.usedTimes=0}}function oR(n,e,t,i,s,r,a){const o=new yd,l=new rR,c=new Set,u=[],d=s.logarithmicDepthBuffer,h=s.vertexTextures;let f=s.precision;const b={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(M){return c.add(M),M===0?"uv":`uv${M}`}function y(M,C,F,G,B){const $=G.fog,j=B.geometry,Y=M.isMeshStandardMaterial?G.environment:null,re=(M.isMeshStandardMaterial?t:e).get(M.envMap||Y),K=re&&re.mapping===_l?re.image.height:null,Se=b[M.type];M.precision!==null&&(f=s.getMaxPrecision(M.precision),f!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",f,"instead."));const Re=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,De=Re!==void 0?Re.length:0;let Ve=0;j.morphAttributes.position!==void 0&&(Ve=1),j.morphAttributes.normal!==void 0&&(Ve=2),j.morphAttributes.color!==void 0&&(Ve=3);let st,fe,xe,Te;if(Se){const _t=ei[Se];st=_t.vertexShader,fe=_t.fragmentShader}else st=M.vertexShader,fe=M.fragmentShader,l.update(M),xe=l.getVertexShaderID(M),Te=l.getFragmentShaderID(M);const H=n.getRenderTarget(),me=n.state.buffers.depth.getReversed(),he=B.isInstancedMesh===!0,ye=B.isBatchedMesh===!0,Be=!!M.map,O=!!M.matcap,z=!!re,I=!!M.aoMap,le=!!M.lightMap,ie=!!M.bumpMap,Q=!!M.normalMap,ce=!!M.displacementMap,ve=!!M.emissiveMap,ae=!!M.metalnessMap,p=!!M.roughnessMap,v=M.anisotropy>0,P=M.clearcoat>0,E=M.dispersion>0,N=M.iridescence>0,k=M.sheen>0,ee=M.transmission>0,oe=v&&!!M.anisotropyMap,ge=P&&!!M.clearcoatMap,Fe=P&&!!M.clearcoatNormalMap,pe=P&&!!M.clearcoatRoughnessMap,we=N&&!!M.iridescenceMap,Ne=N&&!!M.iridescenceThicknessMap,He=k&&!!M.sheenColorMap,Ae=k&&!!M.sheenRoughnessMap,Xe=!!M.specularMap,Ze=!!M.specularColorMap,vt=!!M.specularIntensityMap,W=ee&&!!M.transmissionMap,Pe=ee&&!!M.thicknessMap,ue=!!M.gradientMap,_e=!!M.alphaMap,Ue=M.alphaTest>0,Le=!!M.alphaHash,Je=!!M.extensions;let Pt=qi;M.toneMapped&&(H===null||H.isXRRenderTarget===!0)&&(Pt=n.toneMapping);const Qt={shaderID:Se,shaderType:M.type,shaderName:M.name,vertexShader:st,fragmentShader:fe,defines:M.defines,customVertexShaderID:xe,customFragmentShaderID:Te,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:f,batching:ye,batchingColor:ye&&B._colorsTexture!==null,instancing:he,instancingColor:he&&B.instanceColor!==null,instancingMorph:he&&B.morphTexture!==null,supportsVertexTextures:h,outputColorSpace:H===null?n.outputColorSpace:H.isXRRenderTarget===!0?H.texture.colorSpace:Tr,alphaToCoverage:!!M.alphaToCoverage,map:Be,matcap:O,envMap:z,envMapMode:z&&re.mapping,envMapCubeUVHeight:K,aoMap:I,lightMap:le,bumpMap:ie,normalMap:Q,displacementMap:h&&ce,emissiveMap:ve,normalMapObjectSpace:Q&&M.normalMapType===VM,normalMapTangentSpace:Q&&M.normalMapType===tg,metalnessMap:ae,roughnessMap:p,anisotropy:v,anisotropyMap:oe,clearcoat:P,clearcoatMap:ge,clearcoatNormalMap:Fe,clearcoatRoughnessMap:pe,dispersion:E,iridescence:N,iridescenceMap:we,iridescenceThicknessMap:Ne,sheen:k,sheenColorMap:He,sheenRoughnessMap:Ae,specularMap:Xe,specularColorMap:Ze,specularIntensityMap:vt,transmission:ee,transmissionMap:W,thicknessMap:Pe,gradientMap:ue,opaque:M.transparent===!1&&M.blending===hr&&M.alphaToCoverage===!1,alphaMap:_e,alphaTest:Ue,alphaHash:Le,combine:M.combine,mapUv:Be&&x(M.map.channel),aoMapUv:I&&x(M.aoMap.channel),lightMapUv:le&&x(M.lightMap.channel),bumpMapUv:ie&&x(M.bumpMap.channel),normalMapUv:Q&&x(M.normalMap.channel),displacementMapUv:ce&&x(M.displacementMap.channel),emissiveMapUv:ve&&x(M.emissiveMap.channel),metalnessMapUv:ae&&x(M.metalnessMap.channel),roughnessMapUv:p&&x(M.roughnessMap.channel),anisotropyMapUv:oe&&x(M.anisotropyMap.channel),clearcoatMapUv:ge&&x(M.clearcoatMap.channel),clearcoatNormalMapUv:Fe&&x(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:pe&&x(M.clearcoatRoughnessMap.channel),iridescenceMapUv:we&&x(M.iridescenceMap.channel),iridescenceThicknessMapUv:Ne&&x(M.iridescenceThicknessMap.channel),sheenColorMapUv:He&&x(M.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&x(M.sheenRoughnessMap.channel),specularMapUv:Xe&&x(M.specularMap.channel),specularColorMapUv:Ze&&x(M.specularColorMap.channel),specularIntensityMapUv:vt&&x(M.specularIntensityMap.channel),transmissionMapUv:W&&x(M.transmissionMap.channel),thicknessMapUv:Pe&&x(M.thicknessMap.channel),alphaMapUv:_e&&x(M.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(Q||v),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!j.attributes.uv&&(Be||_e),fog:!!$,useFog:M.fog===!0,fogExp2:!!$&&$.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:me,skinning:B.isSkinnedMesh===!0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:De,morphTextureStride:Ve,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:n.shadowMap.enabled&&F.length>0,shadowMapType:n.shadowMap.type,toneMapping:Pt,decodeVideoTexture:Be&&M.map.isVideoTexture===!0&&ht.getTransfer(M.map.colorSpace)===St,decodeVideoTextureEmissive:ve&&M.emissiveMap.isVideoTexture===!0&&ht.getTransfer(M.emissiveMap.colorSpace)===St,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Ln,flipSided:M.side===yn,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Je&&M.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Je&&M.extensions.multiDraw===!0||ye)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Qt.vertexUv1s=c.has(1),Qt.vertexUv2s=c.has(2),Qt.vertexUv3s=c.has(3),c.clear(),Qt}function g(M){const C=[];if(M.shaderID?C.push(M.shaderID):(C.push(M.customVertexShaderID),C.push(M.customFragmentShaderID)),M.defines!==void 0)for(const F in M.defines)C.push(F),C.push(M.defines[F]);return M.isRawShaderMaterial===!1&&(A(C,M),S(C,M),C.push(n.outputColorSpace)),C.push(M.customProgramCacheKey),C.join()}function A(M,C){M.push(C.precision),M.push(C.outputColorSpace),M.push(C.envMapMode),M.push(C.envMapCubeUVHeight),M.push(C.mapUv),M.push(C.alphaMapUv),M.push(C.lightMapUv),M.push(C.aoMapUv),M.push(C.bumpMapUv),M.push(C.normalMapUv),M.push(C.displacementMapUv),M.push(C.emissiveMapUv),M.push(C.metalnessMapUv),M.push(C.roughnessMapUv),M.push(C.anisotropyMapUv),M.push(C.clearcoatMapUv),M.push(C.clearcoatNormalMapUv),M.push(C.clearcoatRoughnessMapUv),M.push(C.iridescenceMapUv),M.push(C.iridescenceThicknessMapUv),M.push(C.sheenColorMapUv),M.push(C.sheenRoughnessMapUv),M.push(C.specularMapUv),M.push(C.specularColorMapUv),M.push(C.specularIntensityMapUv),M.push(C.transmissionMapUv),M.push(C.thicknessMapUv),M.push(C.combine),M.push(C.fogExp2),M.push(C.sizeAttenuation),M.push(C.morphTargetsCount),M.push(C.morphAttributeCount),M.push(C.numDirLights),M.push(C.numPointLights),M.push(C.numSpotLights),M.push(C.numSpotLightMaps),M.push(C.numHemiLights),M.push(C.numRectAreaLights),M.push(C.numDirLightShadows),M.push(C.numPointLightShadows),M.push(C.numSpotLightShadows),M.push(C.numSpotLightShadowsWithMaps),M.push(C.numLightProbes),M.push(C.shadowMapType),M.push(C.toneMapping),M.push(C.numClippingPlanes),M.push(C.numClipIntersection),M.push(C.depthPacking)}function S(M,C){o.disableAll(),C.supportsVertexTextures&&o.enable(0),C.instancing&&o.enable(1),C.instancingColor&&o.enable(2),C.instancingMorph&&o.enable(3),C.matcap&&o.enable(4),C.envMap&&o.enable(5),C.normalMapObjectSpace&&o.enable(6),C.normalMapTangentSpace&&o.enable(7),C.clearcoat&&o.enable(8),C.iridescence&&o.enable(9),C.alphaTest&&o.enable(10),C.vertexColors&&o.enable(11),C.vertexAlphas&&o.enable(12),C.vertexUv1s&&o.enable(13),C.vertexUv2s&&o.enable(14),C.vertexUv3s&&o.enable(15),C.vertexTangents&&o.enable(16),C.anisotropy&&o.enable(17),C.alphaHash&&o.enable(18),C.batching&&o.enable(19),C.dispersion&&o.enable(20),C.batchingColor&&o.enable(21),M.push(o.mask),o.disableAll(),C.fog&&o.enable(0),C.useFog&&o.enable(1),C.flatShading&&o.enable(2),C.logarithmicDepthBuffer&&o.enable(3),C.reverseDepthBuffer&&o.enable(4),C.skinning&&o.enable(5),C.morphTargets&&o.enable(6),C.morphNormals&&o.enable(7),C.morphColors&&o.enable(8),C.premultipliedAlpha&&o.enable(9),C.shadowMapEnabled&&o.enable(10),C.doubleSided&&o.enable(11),C.flipSided&&o.enable(12),C.useDepthPacking&&o.enable(13),C.dithering&&o.enable(14),C.transmission&&o.enable(15),C.sheen&&o.enable(16),C.opaque&&o.enable(17),C.pointsUvs&&o.enable(18),C.decodeVideoTexture&&o.enable(19),C.decodeVideoTextureEmissive&&o.enable(20),C.alphaToCoverage&&o.enable(21),M.push(o.mask)}function m(M){const C=b[M.type];let F;if(C){const G=ei[C];F=_E.clone(G.uniforms)}else F=M.uniforms;return F}function w(M,C){let F;for(let G=0,B=u.length;G<B;G++){const $=u[G];if($.cacheKey===C){F=$,++F.usedTimes;break}}return F===void 0&&(F=new iR(n,C,M,r),u.push(F)),F}function T(M){if(--M.usedTimes===0){const C=u.indexOf(M);u[C]=u[u.length-1],u.pop(),M.destroy()}}function R(M){l.remove(M)}function U(){l.dispose()}return{getParameters:y,getProgramCacheKey:g,getUniforms:m,acquireProgram:w,releaseProgram:T,releaseShaderCache:R,programs:u,dispose:U}}function lR(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function cR(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Yf(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function jf(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(d,h,f,b,x,y){let g=n[e];return g===void 0?(g={id:d.id,object:d,geometry:h,material:f,groupOrder:b,renderOrder:d.renderOrder,z:x,group:y},n[e]=g):(g.id=d.id,g.object=d,g.geometry=h,g.material=f,g.groupOrder=b,g.renderOrder=d.renderOrder,g.z=x,g.group=y),e++,g}function o(d,h,f,b,x,y){const g=a(d,h,f,b,x,y);f.transmission>0?i.push(g):f.transparent===!0?s.push(g):t.push(g)}function l(d,h,f,b,x,y){const g=a(d,h,f,b,x,y);f.transmission>0?i.unshift(g):f.transparent===!0?s.unshift(g):t.unshift(g)}function c(d,h){t.length>1&&t.sort(d||cR),i.length>1&&i.sort(h||Yf),s.length>1&&s.sort(h||Yf)}function u(){for(let d=e,h=n.length;d<h;d++){const f=n[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:o,unshift:l,finish:u,sort:c}}function uR(){let n=new WeakMap;function e(i,s){const r=n.get(i);let a;return r===void 0?(a=new jf,n.set(i,[a])):s>=r.length?(a=new jf,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function dR(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new V,color:new rt};break;case"SpotLight":t={position:new V,direction:new V,color:new rt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new V,color:new rt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new V,skyColor:new rt,groundColor:new rt};break;case"RectAreaLight":t={color:new rt,position:new V,halfWidth:new V,halfHeight:new V};break}return n[e.id]=t,t}}}function hR(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let fR=0;function pR(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function mR(n){const e=new dR,t=hR(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new V);const s=new V,r=new Tt,a=new Tt;function o(c){let u=0,d=0,h=0;for(let M=0;M<9;M++)i.probe[M].set(0,0,0);let f=0,b=0,x=0,y=0,g=0,A=0,S=0,m=0,w=0,T=0,R=0;c.sort(pR);for(let M=0,C=c.length;M<C;M++){const F=c[M],G=F.color,B=F.intensity,$=F.distance,j=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)u+=G.r*B,d+=G.g*B,h+=G.b*B;else if(F.isLightProbe){for(let Y=0;Y<9;Y++)i.probe[Y].addScaledVector(F.sh.coefficients[Y],B);R++}else if(F.isDirectionalLight){const Y=e.get(F);if(Y.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const re=F.shadow,K=t.get(F);K.shadowIntensity=re.intensity,K.shadowBias=re.bias,K.shadowNormalBias=re.normalBias,K.shadowRadius=re.radius,K.shadowMapSize=re.mapSize,i.directionalShadow[f]=K,i.directionalShadowMap[f]=j,i.directionalShadowMatrix[f]=F.shadow.matrix,A++}i.directional[f]=Y,f++}else if(F.isSpotLight){const Y=e.get(F);Y.position.setFromMatrixPosition(F.matrixWorld),Y.color.copy(G).multiplyScalar(B),Y.distance=$,Y.coneCos=Math.cos(F.angle),Y.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),Y.decay=F.decay,i.spot[x]=Y;const re=F.shadow;if(F.map&&(i.spotLightMap[w]=F.map,w++,re.updateMatrices(F),F.castShadow&&T++),i.spotLightMatrix[x]=re.matrix,F.castShadow){const K=t.get(F);K.shadowIntensity=re.intensity,K.shadowBias=re.bias,K.shadowNormalBias=re.normalBias,K.shadowRadius=re.radius,K.shadowMapSize=re.mapSize,i.spotShadow[x]=K,i.spotShadowMap[x]=j,m++}x++}else if(F.isRectAreaLight){const Y=e.get(F);Y.color.copy(G).multiplyScalar(B),Y.halfWidth.set(F.width*.5,0,0),Y.halfHeight.set(0,F.height*.5,0),i.rectArea[y]=Y,y++}else if(F.isPointLight){const Y=e.get(F);if(Y.color.copy(F.color).multiplyScalar(F.intensity),Y.distance=F.distance,Y.decay=F.decay,F.castShadow){const re=F.shadow,K=t.get(F);K.shadowIntensity=re.intensity,K.shadowBias=re.bias,K.shadowNormalBias=re.normalBias,K.shadowRadius=re.radius,K.shadowMapSize=re.mapSize,K.shadowCameraNear=re.camera.near,K.shadowCameraFar=re.camera.far,i.pointShadow[b]=K,i.pointShadowMap[b]=j,i.pointShadowMatrix[b]=F.shadow.matrix,S++}i.point[b]=Y,b++}else if(F.isHemisphereLight){const Y=e.get(F);Y.skyColor.copy(F.color).multiplyScalar(B),Y.groundColor.copy(F.groundColor).multiplyScalar(B),i.hemi[g]=Y,g++}}y>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Ce.LTC_FLOAT_1,i.rectAreaLTC2=Ce.LTC_FLOAT_2):(i.rectAreaLTC1=Ce.LTC_HALF_1,i.rectAreaLTC2=Ce.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=d,i.ambient[2]=h;const U=i.hash;(U.directionalLength!==f||U.pointLength!==b||U.spotLength!==x||U.rectAreaLength!==y||U.hemiLength!==g||U.numDirectionalShadows!==A||U.numPointShadows!==S||U.numSpotShadows!==m||U.numSpotMaps!==w||U.numLightProbes!==R)&&(i.directional.length=f,i.spot.length=x,i.rectArea.length=y,i.point.length=b,i.hemi.length=g,i.directionalShadow.length=A,i.directionalShadowMap.length=A,i.pointShadow.length=S,i.pointShadowMap.length=S,i.spotShadow.length=m,i.spotShadowMap.length=m,i.directionalShadowMatrix.length=A,i.pointShadowMatrix.length=S,i.spotLightMatrix.length=m+w-T,i.spotLightMap.length=w,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=R,U.directionalLength=f,U.pointLength=b,U.spotLength=x,U.rectAreaLength=y,U.hemiLength=g,U.numDirectionalShadows=A,U.numPointShadows=S,U.numSpotShadows=m,U.numSpotMaps=w,U.numLightProbes=R,i.version=fR++)}function l(c,u){let d=0,h=0,f=0,b=0,x=0;const y=u.matrixWorldInverse;for(let g=0,A=c.length;g<A;g++){const S=c[g];if(S.isDirectionalLight){const m=i.directional[d];m.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),m.direction.sub(s),m.direction.transformDirection(y),d++}else if(S.isSpotLight){const m=i.spot[f];m.position.setFromMatrixPosition(S.matrixWorld),m.position.applyMatrix4(y),m.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),m.direction.sub(s),m.direction.transformDirection(y),f++}else if(S.isRectAreaLight){const m=i.rectArea[b];m.position.setFromMatrixPosition(S.matrixWorld),m.position.applyMatrix4(y),a.identity(),r.copy(S.matrixWorld),r.premultiply(y),a.extractRotation(r),m.halfWidth.set(S.width*.5,0,0),m.halfHeight.set(0,S.height*.5,0),m.halfWidth.applyMatrix4(a),m.halfHeight.applyMatrix4(a),b++}else if(S.isPointLight){const m=i.point[h];m.position.setFromMatrixPosition(S.matrixWorld),m.position.applyMatrix4(y),h++}else if(S.isHemisphereLight){const m=i.hemi[x];m.direction.setFromMatrixPosition(S.matrixWorld),m.direction.transformDirection(y),x++}}}return{setup:o,setupView:l,state:i}}function Kf(n){const e=new mR(n),t=[],i=[];function s(u){c.camera=u,t.length=0,i.length=0}function r(u){t.push(u)}function a(u){i.push(u)}function o(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function gR(n){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new Kf(n),e.set(s,[o])):r>=a.length?(o=new Kf(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const vR=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,_R=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function yR(n,e,t){let i=new xd;const s=new Ee,r=new Ee,a=new Lt,o=new GE({depthPacking:zM}),l=new WE,c={},u=t.maxTextureSize,d={[Qi]:yn,[yn]:Qi,[Ln]:Ln},h=new es({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ee},radius:{value:4}},vertexShader:vR,fragmentShader:_R}),f=h.clone();f.defines.HORIZONTAL_PASS=1;const b=new Cn;b.setAttribute("position",new Xn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new yt(b,h),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Hm;let g=this.type;this.render=function(T,R,U){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||T.length===0)return;const M=n.getRenderTarget(),C=n.getActiveCubeFace(),F=n.getActiveMipmapLevel(),G=n.state;G.setBlending(Xi),G.buffers.color.setClear(1,1,1,1),G.buffers.depth.setTest(!0),G.setScissorTest(!1);const B=g!==gi&&this.type===gi,$=g===gi&&this.type!==gi;for(let j=0,Y=T.length;j<Y;j++){const re=T[j],K=re.shadow;if(K===void 0){console.warn("THREE.WebGLShadowMap:",re,"has no shadow.");continue}if(K.autoUpdate===!1&&K.needsUpdate===!1)continue;s.copy(K.mapSize);const Se=K.getFrameExtents();if(s.multiply(Se),r.copy(K.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/Se.x),s.x=r.x*Se.x,K.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/Se.y),s.y=r.y*Se.y,K.mapSize.y=r.y)),K.map===null||B===!0||$===!0){const De=this.type!==gi?{minFilter:Wn,magFilter:Wn}:{};K.map!==null&&K.map.dispose(),K.map=new Rs(s.x,s.y,De),K.map.texture.name=re.name+".shadowMap",K.camera.updateProjectionMatrix()}n.setRenderTarget(K.map),n.clear();const Re=K.getViewportCount();for(let De=0;De<Re;De++){const Ve=K.getViewport(De);a.set(r.x*Ve.x,r.y*Ve.y,r.x*Ve.z,r.y*Ve.w),G.viewport(a),K.updateMatrices(re,De),i=K.getFrustum(),m(R,U,K.camera,re,this.type)}K.isPointLightShadow!==!0&&this.type===gi&&A(K,U),K.needsUpdate=!1}g=this.type,y.needsUpdate=!1,n.setRenderTarget(M,C,F)};function A(T,R){const U=e.update(x);h.defines.VSM_SAMPLES!==T.blurSamples&&(h.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Rs(s.x,s.y)),h.uniforms.shadow_pass.value=T.map.texture,h.uniforms.resolution.value=T.mapSize,h.uniforms.radius.value=T.radius,n.setRenderTarget(T.mapPass),n.clear(),n.renderBufferDirect(R,null,U,h,x,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,n.setRenderTarget(T.map),n.clear(),n.renderBufferDirect(R,null,U,f,x,null)}function S(T,R,U,M){let C=null;const F=U.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(F!==void 0)C=F;else if(C=U.isPointLight===!0?l:o,n.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const G=C.uuid,B=R.uuid;let $=c[G];$===void 0&&($={},c[G]=$);let j=$[B];j===void 0&&(j=C.clone(),$[B]=j,R.addEventListener("dispose",w)),C=j}if(C.visible=R.visible,C.wireframe=R.wireframe,M===gi?C.side=R.shadowSide!==null?R.shadowSide:R.side:C.side=R.shadowSide!==null?R.shadowSide:d[R.side],C.alphaMap=R.alphaMap,C.alphaTest=R.alphaTest,C.map=R.map,C.clipShadows=R.clipShadows,C.clippingPlanes=R.clippingPlanes,C.clipIntersection=R.clipIntersection,C.displacementMap=R.displacementMap,C.displacementScale=R.displacementScale,C.displacementBias=R.displacementBias,C.wireframeLinewidth=R.wireframeLinewidth,C.linewidth=R.linewidth,U.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const G=n.properties.get(C);G.light=U}return C}function m(T,R,U,M,C){if(T.visible===!1)return;if(T.layers.test(R.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&C===gi)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,T.matrixWorld);const B=e.update(T),$=T.material;if(Array.isArray($)){const j=B.groups;for(let Y=0,re=j.length;Y<re;Y++){const K=j[Y],Se=$[K.materialIndex];if(Se&&Se.visible){const Re=S(T,Se,M,C);T.onBeforeShadow(n,T,R,U,B,Re,K),n.renderBufferDirect(U,null,B,Re,T,K),T.onAfterShadow(n,T,R,U,B,Re,K)}}}else if($.visible){const j=S(T,$,M,C);T.onBeforeShadow(n,T,R,U,B,j,null),n.renderBufferDirect(U,null,B,j,T,null),T.onAfterShadow(n,T,R,U,B,j,null)}}const G=T.children;for(let B=0,$=G.length;B<$;B++)m(G[B],R,U,M,C)}function w(T){T.target.removeEventListener("dispose",w);for(const U in c){const M=c[U],C=T.target.uuid;C in M&&(M[C].dispose(),delete M[C])}}}const bR={[Jc]:Qc,[eu]:iu,[tu]:su,[Sr]:nu,[Qc]:Jc,[iu]:eu,[su]:tu,[nu]:Sr};function xR(n,e){function t(){let W=!1;const Pe=new Lt;let ue=null;const _e=new Lt(0,0,0,0);return{setMask:function(Ue){ue!==Ue&&!W&&(n.colorMask(Ue,Ue,Ue,Ue),ue=Ue)},setLocked:function(Ue){W=Ue},setClear:function(Ue,Le,Je,Pt,Qt){Qt===!0&&(Ue*=Pt,Le*=Pt,Je*=Pt),Pe.set(Ue,Le,Je,Pt),_e.equals(Pe)===!1&&(n.clearColor(Ue,Le,Je,Pt),_e.copy(Pe))},reset:function(){W=!1,ue=null,_e.set(-1,0,0,0)}}}function i(){let W=!1,Pe=!1,ue=null,_e=null,Ue=null;return{setReversed:function(Le){if(Pe!==Le){const Je=e.get("EXT_clip_control");Pe?Je.clipControlEXT(Je.LOWER_LEFT_EXT,Je.ZERO_TO_ONE_EXT):Je.clipControlEXT(Je.LOWER_LEFT_EXT,Je.NEGATIVE_ONE_TO_ONE_EXT);const Pt=Ue;Ue=null,this.setClear(Pt)}Pe=Le},getReversed:function(){return Pe},setTest:function(Le){Le?H(n.DEPTH_TEST):me(n.DEPTH_TEST)},setMask:function(Le){ue!==Le&&!W&&(n.depthMask(Le),ue=Le)},setFunc:function(Le){if(Pe&&(Le=bR[Le]),_e!==Le){switch(Le){case Jc:n.depthFunc(n.NEVER);break;case Qc:n.depthFunc(n.ALWAYS);break;case eu:n.depthFunc(n.LESS);break;case Sr:n.depthFunc(n.LEQUAL);break;case tu:n.depthFunc(n.EQUAL);break;case nu:n.depthFunc(n.GEQUAL);break;case iu:n.depthFunc(n.GREATER);break;case su:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}_e=Le}},setLocked:function(Le){W=Le},setClear:function(Le){Ue!==Le&&(Pe&&(Le=1-Le),n.clearDepth(Le),Ue=Le)},reset:function(){W=!1,ue=null,_e=null,Ue=null,Pe=!1}}}function s(){let W=!1,Pe=null,ue=null,_e=null,Ue=null,Le=null,Je=null,Pt=null,Qt=null;return{setTest:function(_t){W||(_t?H(n.STENCIL_TEST):me(n.STENCIL_TEST))},setMask:function(_t){Pe!==_t&&!W&&(n.stencilMask(_t),Pe=_t)},setFunc:function(_t,On,li){(ue!==_t||_e!==On||Ue!==li)&&(n.stencilFunc(_t,On,li),ue=_t,_e=On,Ue=li)},setOp:function(_t,On,li){(Le!==_t||Je!==On||Pt!==li)&&(n.stencilOp(_t,On,li),Le=_t,Je=On,Pt=li)},setLocked:function(_t){W=_t},setClear:function(_t){Qt!==_t&&(n.clearStencil(_t),Qt=_t)},reset:function(){W=!1,Pe=null,ue=null,_e=null,Ue=null,Le=null,Je=null,Pt=null,Qt=null}}}const r=new t,a=new i,o=new s,l=new WeakMap,c=new WeakMap;let u={},d={},h=new WeakMap,f=[],b=null,x=!1,y=null,g=null,A=null,S=null,m=null,w=null,T=null,R=new rt(0,0,0),U=0,M=!1,C=null,F=null,G=null,B=null,$=null;const j=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,re=0;const K=n.getParameter(n.VERSION);K.indexOf("WebGL")!==-1?(re=parseFloat(/^WebGL (\d)/.exec(K)[1]),Y=re>=1):K.indexOf("OpenGL ES")!==-1&&(re=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),Y=re>=2);let Se=null,Re={};const De=n.getParameter(n.SCISSOR_BOX),Ve=n.getParameter(n.VIEWPORT),st=new Lt().fromArray(De),fe=new Lt().fromArray(Ve);function xe(W,Pe,ue,_e){const Ue=new Uint8Array(4),Le=n.createTexture();n.bindTexture(W,Le),n.texParameteri(W,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(W,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Je=0;Je<ue;Je++)W===n.TEXTURE_3D||W===n.TEXTURE_2D_ARRAY?n.texImage3D(Pe,0,n.RGBA,1,1,_e,0,n.RGBA,n.UNSIGNED_BYTE,Ue):n.texImage2D(Pe+Je,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Ue);return Le}const Te={};Te[n.TEXTURE_2D]=xe(n.TEXTURE_2D,n.TEXTURE_2D,1),Te[n.TEXTURE_CUBE_MAP]=xe(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Te[n.TEXTURE_2D_ARRAY]=xe(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Te[n.TEXTURE_3D]=xe(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),H(n.DEPTH_TEST),a.setFunc(Sr),ie(!1),Q(Hh),H(n.CULL_FACE),I(Xi);function H(W){u[W]!==!0&&(n.enable(W),u[W]=!0)}function me(W){u[W]!==!1&&(n.disable(W),u[W]=!1)}function he(W,Pe){return d[W]!==Pe?(n.bindFramebuffer(W,Pe),d[W]=Pe,W===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=Pe),W===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=Pe),!0):!1}function ye(W,Pe){let ue=f,_e=!1;if(W){ue=h.get(Pe),ue===void 0&&(ue=[],h.set(Pe,ue));const Ue=W.textures;if(ue.length!==Ue.length||ue[0]!==n.COLOR_ATTACHMENT0){for(let Le=0,Je=Ue.length;Le<Je;Le++)ue[Le]=n.COLOR_ATTACHMENT0+Le;ue.length=Ue.length,_e=!0}}else ue[0]!==n.BACK&&(ue[0]=n.BACK,_e=!0);_e&&n.drawBuffers(ue)}function Be(W){return b!==W?(n.useProgram(W),b=W,!0):!1}const O={[gs]:n.FUNC_ADD,[fM]:n.FUNC_SUBTRACT,[pM]:n.FUNC_REVERSE_SUBTRACT};O[mM]=n.MIN,O[gM]=n.MAX;const z={[vM]:n.ZERO,[_M]:n.ONE,[yM]:n.SRC_COLOR,[Kc]:n.SRC_ALPHA,[wM]:n.SRC_ALPHA_SATURATE,[MM]:n.DST_COLOR,[xM]:n.DST_ALPHA,[bM]:n.ONE_MINUS_SRC_COLOR,[Zc]:n.ONE_MINUS_SRC_ALPHA,[EM]:n.ONE_MINUS_DST_COLOR,[SM]:n.ONE_MINUS_DST_ALPHA,[AM]:n.CONSTANT_COLOR,[TM]:n.ONE_MINUS_CONSTANT_COLOR,[RM]:n.CONSTANT_ALPHA,[CM]:n.ONE_MINUS_CONSTANT_ALPHA};function I(W,Pe,ue,_e,Ue,Le,Je,Pt,Qt,_t){if(W===Xi){x===!0&&(me(n.BLEND),x=!1);return}if(x===!1&&(H(n.BLEND),x=!0),W!==hM){if(W!==y||_t!==M){if((g!==gs||m!==gs)&&(n.blendEquation(n.FUNC_ADD),g=gs,m=gs),_t)switch(W){case hr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case $h:n.blendFunc(n.ONE,n.ONE);break;case Gh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Wh:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",W);break}else switch(W){case hr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case $h:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Gh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Wh:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",W);break}A=null,S=null,w=null,T=null,R.set(0,0,0),U=0,y=W,M=_t}return}Ue=Ue||Pe,Le=Le||ue,Je=Je||_e,(Pe!==g||Ue!==m)&&(n.blendEquationSeparate(O[Pe],O[Ue]),g=Pe,m=Ue),(ue!==A||_e!==S||Le!==w||Je!==T)&&(n.blendFuncSeparate(z[ue],z[_e],z[Le],z[Je]),A=ue,S=_e,w=Le,T=Je),(Pt.equals(R)===!1||Qt!==U)&&(n.blendColor(Pt.r,Pt.g,Pt.b,Qt),R.copy(Pt),U=Qt),y=W,M=!1}function le(W,Pe){W.side===Ln?me(n.CULL_FACE):H(n.CULL_FACE);let ue=W.side===yn;Pe&&(ue=!ue),ie(ue),W.blending===hr&&W.transparent===!1?I(Xi):I(W.blending,W.blendEquation,W.blendSrc,W.blendDst,W.blendEquationAlpha,W.blendSrcAlpha,W.blendDstAlpha,W.blendColor,W.blendAlpha,W.premultipliedAlpha),a.setFunc(W.depthFunc),a.setTest(W.depthTest),a.setMask(W.depthWrite),r.setMask(W.colorWrite);const _e=W.stencilWrite;o.setTest(_e),_e&&(o.setMask(W.stencilWriteMask),o.setFunc(W.stencilFunc,W.stencilRef,W.stencilFuncMask),o.setOp(W.stencilFail,W.stencilZFail,W.stencilZPass)),ve(W.polygonOffset,W.polygonOffsetFactor,W.polygonOffsetUnits),W.alphaToCoverage===!0?H(n.SAMPLE_ALPHA_TO_COVERAGE):me(n.SAMPLE_ALPHA_TO_COVERAGE)}function ie(W){C!==W&&(W?n.frontFace(n.CW):n.frontFace(n.CCW),C=W)}function Q(W){W!==cM?(H(n.CULL_FACE),W!==F&&(W===Hh?n.cullFace(n.BACK):W===uM?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):me(n.CULL_FACE),F=W}function ce(W){W!==G&&(Y&&n.lineWidth(W),G=W)}function ve(W,Pe,ue){W?(H(n.POLYGON_OFFSET_FILL),(B!==Pe||$!==ue)&&(n.polygonOffset(Pe,ue),B=Pe,$=ue)):me(n.POLYGON_OFFSET_FILL)}function ae(W){W?H(n.SCISSOR_TEST):me(n.SCISSOR_TEST)}function p(W){W===void 0&&(W=n.TEXTURE0+j-1),Se!==W&&(n.activeTexture(W),Se=W)}function v(W,Pe,ue){ue===void 0&&(Se===null?ue=n.TEXTURE0+j-1:ue=Se);let _e=Re[ue];_e===void 0&&(_e={type:void 0,texture:void 0},Re[ue]=_e),(_e.type!==W||_e.texture!==Pe)&&(Se!==ue&&(n.activeTexture(ue),Se=ue),n.bindTexture(W,Pe||Te[W]),_e.type=W,_e.texture=Pe)}function P(){const W=Re[Se];W!==void 0&&W.type!==void 0&&(n.bindTexture(W.type,null),W.type=void 0,W.texture=void 0)}function E(){try{n.compressedTexImage2D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function N(){try{n.compressedTexImage3D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function k(){try{n.texSubImage2D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function ee(){try{n.texSubImage3D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function oe(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function ge(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Fe(){try{n.texStorage2D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function pe(){try{n.texStorage3D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function we(){try{n.texImage2D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Ne(){try{n.texImage3D.apply(n,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function He(W){st.equals(W)===!1&&(n.scissor(W.x,W.y,W.z,W.w),st.copy(W))}function Ae(W){fe.equals(W)===!1&&(n.viewport(W.x,W.y,W.z,W.w),fe.copy(W))}function Xe(W,Pe){let ue=c.get(Pe);ue===void 0&&(ue=new WeakMap,c.set(Pe,ue));let _e=ue.get(W);_e===void 0&&(_e=n.getUniformBlockIndex(Pe,W.name),ue.set(W,_e))}function Ze(W,Pe){const _e=c.get(Pe).get(W);l.get(Pe)!==_e&&(n.uniformBlockBinding(Pe,_e,W.__bindingPointIndex),l.set(Pe,_e))}function vt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},Se=null,Re={},d={},h=new WeakMap,f=[],b=null,x=!1,y=null,g=null,A=null,S=null,m=null,w=null,T=null,R=new rt(0,0,0),U=0,M=!1,C=null,F=null,G=null,B=null,$=null,st.set(0,0,n.canvas.width,n.canvas.height),fe.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:H,disable:me,bindFramebuffer:he,drawBuffers:ye,useProgram:Be,setBlending:I,setMaterial:le,setFlipSided:ie,setCullFace:Q,setLineWidth:ce,setPolygonOffset:ve,setScissorTest:ae,activeTexture:p,bindTexture:v,unbindTexture:P,compressedTexImage2D:E,compressedTexImage3D:N,texImage2D:we,texImage3D:Ne,updateUBOMapping:Xe,uniformBlockBinding:Ze,texStorage2D:Fe,texStorage3D:pe,texSubImage2D:k,texSubImage3D:ee,compressedTexSubImage2D:oe,compressedTexSubImage3D:ge,scissor:He,viewport:Ae,reset:vt}}function SR(n,e,t,i,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ee,u=new WeakMap;let d;const h=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(p,v){return f?new OffscreenCanvas(p,v):Yo("canvas")}function x(p,v,P){let E=1;const N=ae(p);if((N.width>P||N.height>P)&&(E=P/Math.max(N.width,N.height)),E<1)if(typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&p instanceof ImageBitmap||typeof VideoFrame<"u"&&p instanceof VideoFrame){const k=Math.floor(E*N.width),ee=Math.floor(E*N.height);d===void 0&&(d=b(k,ee));const oe=v?b(k,ee):d;return oe.width=k,oe.height=ee,oe.getContext("2d").drawImage(p,0,0,k,ee),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+N.width+"x"+N.height+") to ("+k+"x"+ee+")."),oe}else return"data"in p&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+N.width+"x"+N.height+")."),p;return p}function y(p){return p.generateMipmaps}function g(p){n.generateMipmap(p)}function A(p){return p.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:p.isWebGL3DRenderTarget?n.TEXTURE_3D:p.isWebGLArrayRenderTarget||p.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function S(p,v,P,E,N=!1){if(p!==null){if(n[p]!==void 0)return n[p];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+p+"'")}let k=v;if(v===n.RED&&(P===n.FLOAT&&(k=n.R32F),P===n.HALF_FLOAT&&(k=n.R16F),P===n.UNSIGNED_BYTE&&(k=n.R8)),v===n.RED_INTEGER&&(P===n.UNSIGNED_BYTE&&(k=n.R8UI),P===n.UNSIGNED_SHORT&&(k=n.R16UI),P===n.UNSIGNED_INT&&(k=n.R32UI),P===n.BYTE&&(k=n.R8I),P===n.SHORT&&(k=n.R16I),P===n.INT&&(k=n.R32I)),v===n.RG&&(P===n.FLOAT&&(k=n.RG32F),P===n.HALF_FLOAT&&(k=n.RG16F),P===n.UNSIGNED_BYTE&&(k=n.RG8)),v===n.RG_INTEGER&&(P===n.UNSIGNED_BYTE&&(k=n.RG8UI),P===n.UNSIGNED_SHORT&&(k=n.RG16UI),P===n.UNSIGNED_INT&&(k=n.RG32UI),P===n.BYTE&&(k=n.RG8I),P===n.SHORT&&(k=n.RG16I),P===n.INT&&(k=n.RG32I)),v===n.RGB_INTEGER&&(P===n.UNSIGNED_BYTE&&(k=n.RGB8UI),P===n.UNSIGNED_SHORT&&(k=n.RGB16UI),P===n.UNSIGNED_INT&&(k=n.RGB32UI),P===n.BYTE&&(k=n.RGB8I),P===n.SHORT&&(k=n.RGB16I),P===n.INT&&(k=n.RGB32I)),v===n.RGBA_INTEGER&&(P===n.UNSIGNED_BYTE&&(k=n.RGBA8UI),P===n.UNSIGNED_SHORT&&(k=n.RGBA16UI),P===n.UNSIGNED_INT&&(k=n.RGBA32UI),P===n.BYTE&&(k=n.RGBA8I),P===n.SHORT&&(k=n.RGBA16I),P===n.INT&&(k=n.RGBA32I)),v===n.RGB&&P===n.UNSIGNED_INT_5_9_9_9_REV&&(k=n.RGB9_E5),v===n.RGBA){const ee=N?Xo:ht.getTransfer(E);P===n.FLOAT&&(k=n.RGBA32F),P===n.HALF_FLOAT&&(k=n.RGBA16F),P===n.UNSIGNED_BYTE&&(k=ee===St?n.SRGB8_ALPHA8:n.RGBA8),P===n.UNSIGNED_SHORT_4_4_4_4&&(k=n.RGBA4),P===n.UNSIGNED_SHORT_5_5_5_1&&(k=n.RGB5_A1)}return(k===n.R16F||k===n.R32F||k===n.RG16F||k===n.RG32F||k===n.RGBA16F||k===n.RGBA32F)&&e.get("EXT_color_buffer_float"),k}function m(p,v){let P;return p?v===null||v===Ts||v===wr?P=n.DEPTH24_STENCIL8:v===xi?P=n.DEPTH32F_STENCIL8:v===ba&&(P=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Ts||v===wr?P=n.DEPTH_COMPONENT24:v===xi?P=n.DEPTH_COMPONENT32F:v===ba&&(P=n.DEPTH_COMPONENT16),P}function w(p,v){return y(p)===!0||p.isFramebufferTexture&&p.minFilter!==Wn&&p.minFilter!==Hn?Math.log2(Math.max(v.width,v.height))+1:p.mipmaps!==void 0&&p.mipmaps.length>0?p.mipmaps.length:p.isCompressedTexture&&Array.isArray(p.image)?v.mipmaps.length:1}function T(p){const v=p.target;v.removeEventListener("dispose",T),U(v),v.isVideoTexture&&u.delete(v)}function R(p){const v=p.target;v.removeEventListener("dispose",R),C(v)}function U(p){const v=i.get(p);if(v.__webglInit===void 0)return;const P=p.source,E=h.get(P);if(E){const N=E[v.__cacheKey];N.usedTimes--,N.usedTimes===0&&M(p),Object.keys(E).length===0&&h.delete(P)}i.remove(p)}function M(p){const v=i.get(p);n.deleteTexture(v.__webglTexture);const P=p.source,E=h.get(P);delete E[v.__cacheKey],a.memory.textures--}function C(p){const v=i.get(p);if(p.depthTexture&&(p.depthTexture.dispose(),i.remove(p.depthTexture)),p.isWebGLCubeRenderTarget)for(let E=0;E<6;E++){if(Array.isArray(v.__webglFramebuffer[E]))for(let N=0;N<v.__webglFramebuffer[E].length;N++)n.deleteFramebuffer(v.__webglFramebuffer[E][N]);else n.deleteFramebuffer(v.__webglFramebuffer[E]);v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer[E])}else{if(Array.isArray(v.__webglFramebuffer))for(let E=0;E<v.__webglFramebuffer.length;E++)n.deleteFramebuffer(v.__webglFramebuffer[E]);else n.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&n.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let E=0;E<v.__webglColorRenderbuffer.length;E++)v.__webglColorRenderbuffer[E]&&n.deleteRenderbuffer(v.__webglColorRenderbuffer[E]);v.__webglDepthRenderbuffer&&n.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const P=p.textures;for(let E=0,N=P.length;E<N;E++){const k=i.get(P[E]);k.__webglTexture&&(n.deleteTexture(k.__webglTexture),a.memory.textures--),i.remove(P[E])}i.remove(p)}let F=0;function G(){F=0}function B(){const p=F;return p>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+p+" texture units while this GPU supports only "+s.maxTextures),F+=1,p}function $(p){const v=[];return v.push(p.wrapS),v.push(p.wrapT),v.push(p.wrapR||0),v.push(p.magFilter),v.push(p.minFilter),v.push(p.anisotropy),v.push(p.internalFormat),v.push(p.format),v.push(p.type),v.push(p.generateMipmaps),v.push(p.premultiplyAlpha),v.push(p.flipY),v.push(p.unpackAlignment),v.push(p.colorSpace),v.join()}function j(p,v){const P=i.get(p);if(p.isVideoTexture&&ce(p),p.isRenderTargetTexture===!1&&p.version>0&&P.__version!==p.version){const E=p.image;if(E===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(E.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{fe(P,p,v);return}}t.bindTexture(n.TEXTURE_2D,P.__webglTexture,n.TEXTURE0+v)}function Y(p,v){const P=i.get(p);if(p.version>0&&P.__version!==p.version){fe(P,p,v);return}t.bindTexture(n.TEXTURE_2D_ARRAY,P.__webglTexture,n.TEXTURE0+v)}function re(p,v){const P=i.get(p);if(p.version>0&&P.__version!==p.version){fe(P,p,v);return}t.bindTexture(n.TEXTURE_3D,P.__webglTexture,n.TEXTURE0+v)}function K(p,v){const P=i.get(p);if(p.version>0&&P.__version!==p.version){xe(P,p,v);return}t.bindTexture(n.TEXTURE_CUBE_MAP,P.__webglTexture,n.TEXTURE0+v)}const Se={[ou]:n.REPEAT,[bs]:n.CLAMP_TO_EDGE,[lu]:n.MIRRORED_REPEAT},Re={[Wn]:n.NEAREST,[kM]:n.NEAREST_MIPMAP_NEAREST,[Wa]:n.NEAREST_MIPMAP_LINEAR,[Hn]:n.LINEAR,[Yl]:n.LINEAR_MIPMAP_NEAREST,[xs]:n.LINEAR_MIPMAP_LINEAR},De={[HM]:n.NEVER,[YM]:n.ALWAYS,[$M]:n.LESS,[ng]:n.LEQUAL,[GM]:n.EQUAL,[qM]:n.GEQUAL,[WM]:n.GREATER,[XM]:n.NOTEQUAL};function Ve(p,v){if(v.type===xi&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Hn||v.magFilter===Yl||v.magFilter===Wa||v.magFilter===xs||v.minFilter===Hn||v.minFilter===Yl||v.minFilter===Wa||v.minFilter===xs)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(p,n.TEXTURE_WRAP_S,Se[v.wrapS]),n.texParameteri(p,n.TEXTURE_WRAP_T,Se[v.wrapT]),(p===n.TEXTURE_3D||p===n.TEXTURE_2D_ARRAY)&&n.texParameteri(p,n.TEXTURE_WRAP_R,Se[v.wrapR]),n.texParameteri(p,n.TEXTURE_MAG_FILTER,Re[v.magFilter]),n.texParameteri(p,n.TEXTURE_MIN_FILTER,Re[v.minFilter]),v.compareFunction&&(n.texParameteri(p,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(p,n.TEXTURE_COMPARE_FUNC,De[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Wn||v.minFilter!==Wa&&v.minFilter!==xs||v.type===xi&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){const P=e.get("EXT_texture_filter_anisotropic");n.texParameterf(p,P.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function st(p,v){let P=!1;p.__webglInit===void 0&&(p.__webglInit=!0,v.addEventListener("dispose",T));const E=v.source;let N=h.get(E);N===void 0&&(N={},h.set(E,N));const k=$(v);if(k!==p.__cacheKey){N[k]===void 0&&(N[k]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,P=!0),N[k].usedTimes++;const ee=N[p.__cacheKey];ee!==void 0&&(N[p.__cacheKey].usedTimes--,ee.usedTimes===0&&M(v)),p.__cacheKey=k,p.__webglTexture=N[k].texture}return P}function fe(p,v,P){let E=n.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(E=n.TEXTURE_2D_ARRAY),v.isData3DTexture&&(E=n.TEXTURE_3D);const N=st(p,v),k=v.source;t.bindTexture(E,p.__webglTexture,n.TEXTURE0+P);const ee=i.get(k);if(k.version!==ee.__version||N===!0){t.activeTexture(n.TEXTURE0+P);const oe=ht.getPrimaries(ht.workingColorSpace),ge=v.colorSpace===$i?null:ht.getPrimaries(v.colorSpace),Fe=v.colorSpace===$i||oe===ge?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Fe);let pe=x(v.image,!1,s.maxTextureSize);pe=ve(v,pe);const we=r.convert(v.format,v.colorSpace),Ne=r.convert(v.type);let He=S(v.internalFormat,we,Ne,v.colorSpace,v.isVideoTexture);Ve(E,v);let Ae;const Xe=v.mipmaps,Ze=v.isVideoTexture!==!0,vt=ee.__version===void 0||N===!0,W=k.dataReady,Pe=w(v,pe);if(v.isDepthTexture)He=m(v.format===Ar,v.type),vt&&(Ze?t.texStorage2D(n.TEXTURE_2D,1,He,pe.width,pe.height):t.texImage2D(n.TEXTURE_2D,0,He,pe.width,pe.height,0,we,Ne,null));else if(v.isDataTexture)if(Xe.length>0){Ze&&vt&&t.texStorage2D(n.TEXTURE_2D,Pe,He,Xe[0].width,Xe[0].height);for(let ue=0,_e=Xe.length;ue<_e;ue++)Ae=Xe[ue],Ze?W&&t.texSubImage2D(n.TEXTURE_2D,ue,0,0,Ae.width,Ae.height,we,Ne,Ae.data):t.texImage2D(n.TEXTURE_2D,ue,He,Ae.width,Ae.height,0,we,Ne,Ae.data);v.generateMipmaps=!1}else Ze?(vt&&t.texStorage2D(n.TEXTURE_2D,Pe,He,pe.width,pe.height),W&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,pe.width,pe.height,we,Ne,pe.data)):t.texImage2D(n.TEXTURE_2D,0,He,pe.width,pe.height,0,we,Ne,pe.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Ze&&vt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Pe,He,Xe[0].width,Xe[0].height,pe.depth);for(let ue=0,_e=Xe.length;ue<_e;ue++)if(Ae=Xe[ue],v.format!==$n)if(we!==null)if(Ze){if(W)if(v.layerUpdates.size>0){const Ue=Af(Ae.width,Ae.height,v.format,v.type);for(const Le of v.layerUpdates){const Je=Ae.data.subarray(Le*Ue/Ae.data.BYTES_PER_ELEMENT,(Le+1)*Ue/Ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ue,0,0,Le,Ae.width,Ae.height,1,we,Je)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ue,0,0,0,Ae.width,Ae.height,pe.depth,we,Ae.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ue,He,Ae.width,Ae.height,pe.depth,0,Ae.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ze?W&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ue,0,0,0,Ae.width,Ae.height,pe.depth,we,Ne,Ae.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ue,He,Ae.width,Ae.height,pe.depth,0,we,Ne,Ae.data)}else{Ze&&vt&&t.texStorage2D(n.TEXTURE_2D,Pe,He,Xe[0].width,Xe[0].height);for(let ue=0,_e=Xe.length;ue<_e;ue++)Ae=Xe[ue],v.format!==$n?we!==null?Ze?W&&t.compressedTexSubImage2D(n.TEXTURE_2D,ue,0,0,Ae.width,Ae.height,we,Ae.data):t.compressedTexImage2D(n.TEXTURE_2D,ue,He,Ae.width,Ae.height,0,Ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ze?W&&t.texSubImage2D(n.TEXTURE_2D,ue,0,0,Ae.width,Ae.height,we,Ne,Ae.data):t.texImage2D(n.TEXTURE_2D,ue,He,Ae.width,Ae.height,0,we,Ne,Ae.data)}else if(v.isDataArrayTexture)if(Ze){if(vt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Pe,He,pe.width,pe.height,pe.depth),W)if(v.layerUpdates.size>0){const ue=Af(pe.width,pe.height,v.format,v.type);for(const _e of v.layerUpdates){const Ue=pe.data.subarray(_e*ue/pe.data.BYTES_PER_ELEMENT,(_e+1)*ue/pe.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,_e,pe.width,pe.height,1,we,Ne,Ue)}v.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,pe.width,pe.height,pe.depth,we,Ne,pe.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,He,pe.width,pe.height,pe.depth,0,we,Ne,pe.data);else if(v.isData3DTexture)Ze?(vt&&t.texStorage3D(n.TEXTURE_3D,Pe,He,pe.width,pe.height,pe.depth),W&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,pe.width,pe.height,pe.depth,we,Ne,pe.data)):t.texImage3D(n.TEXTURE_3D,0,He,pe.width,pe.height,pe.depth,0,we,Ne,pe.data);else if(v.isFramebufferTexture){if(vt)if(Ze)t.texStorage2D(n.TEXTURE_2D,Pe,He,pe.width,pe.height);else{let ue=pe.width,_e=pe.height;for(let Ue=0;Ue<Pe;Ue++)t.texImage2D(n.TEXTURE_2D,Ue,He,ue,_e,0,we,Ne,null),ue>>=1,_e>>=1}}else if(Xe.length>0){if(Ze&&vt){const ue=ae(Xe[0]);t.texStorage2D(n.TEXTURE_2D,Pe,He,ue.width,ue.height)}for(let ue=0,_e=Xe.length;ue<_e;ue++)Ae=Xe[ue],Ze?W&&t.texSubImage2D(n.TEXTURE_2D,ue,0,0,we,Ne,Ae):t.texImage2D(n.TEXTURE_2D,ue,He,we,Ne,Ae);v.generateMipmaps=!1}else if(Ze){if(vt){const ue=ae(pe);t.texStorage2D(n.TEXTURE_2D,Pe,He,ue.width,ue.height)}W&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,we,Ne,pe)}else t.texImage2D(n.TEXTURE_2D,0,He,we,Ne,pe);y(v)&&g(E),ee.__version=k.version,v.onUpdate&&v.onUpdate(v)}p.__version=v.version}function xe(p,v,P){if(v.image.length!==6)return;const E=st(p,v),N=v.source;t.bindTexture(n.TEXTURE_CUBE_MAP,p.__webglTexture,n.TEXTURE0+P);const k=i.get(N);if(N.version!==k.__version||E===!0){t.activeTexture(n.TEXTURE0+P);const ee=ht.getPrimaries(ht.workingColorSpace),oe=v.colorSpace===$i?null:ht.getPrimaries(v.colorSpace),ge=v.colorSpace===$i||ee===oe?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ge);const Fe=v.isCompressedTexture||v.image[0].isCompressedTexture,pe=v.image[0]&&v.image[0].isDataTexture,we=[];for(let _e=0;_e<6;_e++)!Fe&&!pe?we[_e]=x(v.image[_e],!0,s.maxCubemapSize):we[_e]=pe?v.image[_e].image:v.image[_e],we[_e]=ve(v,we[_e]);const Ne=we[0],He=r.convert(v.format,v.colorSpace),Ae=r.convert(v.type),Xe=S(v.internalFormat,He,Ae,v.colorSpace),Ze=v.isVideoTexture!==!0,vt=k.__version===void 0||E===!0,W=N.dataReady;let Pe=w(v,Ne);Ve(n.TEXTURE_CUBE_MAP,v);let ue;if(Fe){Ze&&vt&&t.texStorage2D(n.TEXTURE_CUBE_MAP,Pe,Xe,Ne.width,Ne.height);for(let _e=0;_e<6;_e++){ue=we[_e].mipmaps;for(let Ue=0;Ue<ue.length;Ue++){const Le=ue[Ue];v.format!==$n?He!==null?Ze?W&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Ue,0,0,Le.width,Le.height,He,Le.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Ue,Xe,Le.width,Le.height,0,Le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ze?W&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Ue,0,0,Le.width,Le.height,He,Ae,Le.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Ue,Xe,Le.width,Le.height,0,He,Ae,Le.data)}}}else{if(ue=v.mipmaps,Ze&&vt){ue.length>0&&Pe++;const _e=ae(we[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,Pe,Xe,_e.width,_e.height)}for(let _e=0;_e<6;_e++)if(pe){Ze?W&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,we[_e].width,we[_e].height,He,Ae,we[_e].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,Xe,we[_e].width,we[_e].height,0,He,Ae,we[_e].data);for(let Ue=0;Ue<ue.length;Ue++){const Je=ue[Ue].image[_e].image;Ze?W&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Ue+1,0,0,Je.width,Je.height,He,Ae,Je.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Ue+1,Xe,Je.width,Je.height,0,He,Ae,Je.data)}}else{Ze?W&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,He,Ae,we[_e]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,Xe,He,Ae,we[_e]);for(let Ue=0;Ue<ue.length;Ue++){const Le=ue[Ue];Ze?W&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Ue+1,0,0,He,Ae,Le.image[_e]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Ue+1,Xe,He,Ae,Le.image[_e])}}}y(v)&&g(n.TEXTURE_CUBE_MAP),k.__version=N.version,v.onUpdate&&v.onUpdate(v)}p.__version=v.version}function Te(p,v,P,E,N,k){const ee=r.convert(P.format,P.colorSpace),oe=r.convert(P.type),ge=S(P.internalFormat,ee,oe,P.colorSpace),Fe=i.get(v),pe=i.get(P);if(pe.__renderTarget=v,!Fe.__hasExternalTextures){const we=Math.max(1,v.width>>k),Ne=Math.max(1,v.height>>k);N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY?t.texImage3D(N,k,ge,we,Ne,v.depth,0,ee,oe,null):t.texImage2D(N,k,ge,we,Ne,0,ee,oe,null)}t.bindFramebuffer(n.FRAMEBUFFER,p),Q(v)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,E,N,pe.__webglTexture,0,ie(v)):(N===n.TEXTURE_2D||N>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&N<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,E,N,pe.__webglTexture,k),t.bindFramebuffer(n.FRAMEBUFFER,null)}function H(p,v,P){if(n.bindRenderbuffer(n.RENDERBUFFER,p),v.depthBuffer){const E=v.depthTexture,N=E&&E.isDepthTexture?E.type:null,k=m(v.stencilBuffer,N),ee=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,oe=ie(v);Q(v)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,oe,k,v.width,v.height):P?n.renderbufferStorageMultisample(n.RENDERBUFFER,oe,k,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,k,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ee,n.RENDERBUFFER,p)}else{const E=v.textures;for(let N=0;N<E.length;N++){const k=E[N],ee=r.convert(k.format,k.colorSpace),oe=r.convert(k.type),ge=S(k.internalFormat,ee,oe,k.colorSpace),Fe=ie(v);P&&Q(v)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Fe,ge,v.width,v.height):Q(v)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Fe,ge,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,ge,v.width,v.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function me(p,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,p),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const E=i.get(v.depthTexture);E.__renderTarget=v,(!E.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),j(v.depthTexture,0);const N=E.__webglTexture,k=ie(v);if(v.depthTexture.format===fr)Q(v)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,N,0,k):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,N,0);else if(v.depthTexture.format===Ar)Q(v)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,N,0,k):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,N,0);else throw new Error("Unknown depthTexture format")}function he(p){const v=i.get(p),P=p.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==p.depthTexture){const E=p.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),E){const N=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,E.removeEventListener("dispose",N)};E.addEventListener("dispose",N),v.__depthDisposeCallback=N}v.__boundDepthTexture=E}if(p.depthTexture&&!v.__autoAllocateDepthBuffer){if(P)throw new Error("target.depthTexture not supported in Cube render targets");me(v.__webglFramebuffer,p)}else if(P){v.__webglDepthbuffer=[];for(let E=0;E<6;E++)if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[E]),v.__webglDepthbuffer[E]===void 0)v.__webglDepthbuffer[E]=n.createRenderbuffer(),H(v.__webglDepthbuffer[E],p,!1);else{const N=p.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,k=v.__webglDepthbuffer[E];n.bindRenderbuffer(n.RENDERBUFFER,k),n.framebufferRenderbuffer(n.FRAMEBUFFER,N,n.RENDERBUFFER,k)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=n.createRenderbuffer(),H(v.__webglDepthbuffer,p,!1);else{const E=p.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,N=v.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,N),n.framebufferRenderbuffer(n.FRAMEBUFFER,E,n.RENDERBUFFER,N)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ye(p,v,P){const E=i.get(p);v!==void 0&&Te(E.__webglFramebuffer,p,p.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),P!==void 0&&he(p)}function Be(p){const v=p.texture,P=i.get(p),E=i.get(v);p.addEventListener("dispose",R);const N=p.textures,k=p.isWebGLCubeRenderTarget===!0,ee=N.length>1;if(ee||(E.__webglTexture===void 0&&(E.__webglTexture=n.createTexture()),E.__version=v.version,a.memory.textures++),k){P.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(v.mipmaps&&v.mipmaps.length>0){P.__webglFramebuffer[oe]=[];for(let ge=0;ge<v.mipmaps.length;ge++)P.__webglFramebuffer[oe][ge]=n.createFramebuffer()}else P.__webglFramebuffer[oe]=n.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){P.__webglFramebuffer=[];for(let oe=0;oe<v.mipmaps.length;oe++)P.__webglFramebuffer[oe]=n.createFramebuffer()}else P.__webglFramebuffer=n.createFramebuffer();if(ee)for(let oe=0,ge=N.length;oe<ge;oe++){const Fe=i.get(N[oe]);Fe.__webglTexture===void 0&&(Fe.__webglTexture=n.createTexture(),a.memory.textures++)}if(p.samples>0&&Q(p)===!1){P.__webglMultisampledFramebuffer=n.createFramebuffer(),P.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,P.__webglMultisampledFramebuffer);for(let oe=0;oe<N.length;oe++){const ge=N[oe];P.__webglColorRenderbuffer[oe]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,P.__webglColorRenderbuffer[oe]);const Fe=r.convert(ge.format,ge.colorSpace),pe=r.convert(ge.type),we=S(ge.internalFormat,Fe,pe,ge.colorSpace,p.isXRRenderTarget===!0),Ne=ie(p);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ne,we,p.width,p.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.RENDERBUFFER,P.__webglColorRenderbuffer[oe])}n.bindRenderbuffer(n.RENDERBUFFER,null),p.depthBuffer&&(P.__webglDepthRenderbuffer=n.createRenderbuffer(),H(P.__webglDepthRenderbuffer,p,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(k){t.bindTexture(n.TEXTURE_CUBE_MAP,E.__webglTexture),Ve(n.TEXTURE_CUBE_MAP,v);for(let oe=0;oe<6;oe++)if(v.mipmaps&&v.mipmaps.length>0)for(let ge=0;ge<v.mipmaps.length;ge++)Te(P.__webglFramebuffer[oe][ge],p,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ge);else Te(P.__webglFramebuffer[oe],p,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);y(v)&&g(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ee){for(let oe=0,ge=N.length;oe<ge;oe++){const Fe=N[oe],pe=i.get(Fe);t.bindTexture(n.TEXTURE_2D,pe.__webglTexture),Ve(n.TEXTURE_2D,Fe),Te(P.__webglFramebuffer,p,Fe,n.COLOR_ATTACHMENT0+oe,n.TEXTURE_2D,0),y(Fe)&&g(n.TEXTURE_2D)}t.unbindTexture()}else{let oe=n.TEXTURE_2D;if((p.isWebGL3DRenderTarget||p.isWebGLArrayRenderTarget)&&(oe=p.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(oe,E.__webglTexture),Ve(oe,v),v.mipmaps&&v.mipmaps.length>0)for(let ge=0;ge<v.mipmaps.length;ge++)Te(P.__webglFramebuffer[ge],p,v,n.COLOR_ATTACHMENT0,oe,ge);else Te(P.__webglFramebuffer,p,v,n.COLOR_ATTACHMENT0,oe,0);y(v)&&g(oe),t.unbindTexture()}p.depthBuffer&&he(p)}function O(p){const v=p.textures;for(let P=0,E=v.length;P<E;P++){const N=v[P];if(y(N)){const k=A(p),ee=i.get(N).__webglTexture;t.bindTexture(k,ee),g(k),t.unbindTexture()}}}const z=[],I=[];function le(p){if(p.samples>0){if(Q(p)===!1){const v=p.textures,P=p.width,E=p.height;let N=n.COLOR_BUFFER_BIT;const k=p.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ee=i.get(p),oe=v.length>1;if(oe)for(let ge=0;ge<v.length;ge++)t.bindFramebuffer(n.FRAMEBUFFER,ee.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ee.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ee.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ee.__webglFramebuffer);for(let ge=0;ge<v.length;ge++){if(p.resolveDepthBuffer&&(p.depthBuffer&&(N|=n.DEPTH_BUFFER_BIT),p.stencilBuffer&&p.resolveStencilBuffer&&(N|=n.STENCIL_BUFFER_BIT)),oe){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ee.__webglColorRenderbuffer[ge]);const Fe=i.get(v[ge]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Fe,0)}n.blitFramebuffer(0,0,P,E,0,0,P,E,N,n.NEAREST),l===!0&&(z.length=0,I.length=0,z.push(n.COLOR_ATTACHMENT0+ge),p.depthBuffer&&p.resolveDepthBuffer===!1&&(z.push(k),I.push(k),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,I)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,z))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),oe)for(let ge=0;ge<v.length;ge++){t.bindFramebuffer(n.FRAMEBUFFER,ee.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.RENDERBUFFER,ee.__webglColorRenderbuffer[ge]);const Fe=i.get(v[ge]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ee.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.TEXTURE_2D,Fe,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ee.__webglMultisampledFramebuffer)}else if(p.depthBuffer&&p.resolveDepthBuffer===!1&&l){const v=p.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[v])}}}function ie(p){return Math.min(s.maxSamples,p.samples)}function Q(p){const v=i.get(p);return p.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function ce(p){const v=a.render.frame;u.get(p)!==v&&(u.set(p,v),p.update())}function ve(p,v){const P=p.colorSpace,E=p.format,N=p.type;return p.isCompressedTexture===!0||p.isVideoTexture===!0||P!==Tr&&P!==$i&&(ht.getTransfer(P)===St?(E!==$n||N!==Ci)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",P)),v}function ae(p){return typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement?(c.width=p.naturalWidth||p.width,c.height=p.naturalHeight||p.height):typeof VideoFrame<"u"&&p instanceof VideoFrame?(c.width=p.displayWidth,c.height=p.displayHeight):(c.width=p.width,c.height=p.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=G,this.setTexture2D=j,this.setTexture2DArray=Y,this.setTexture3D=re,this.setTextureCube=K,this.rebindTextures=ye,this.setupRenderTarget=Be,this.updateRenderTargetMipmap=O,this.updateMultisampleRenderTarget=le,this.setupDepthRenderbuffer=he,this.setupFrameBufferTexture=Te,this.useMultisampledRTT=Q}function MR(n,e){function t(i,s=$i){let r;const a=ht.getTransfer(s);if(i===Ci)return n.UNSIGNED_BYTE;if(i===pd)return n.UNSIGNED_SHORT_4_4_4_4;if(i===md)return n.UNSIGNED_SHORT_5_5_5_1;if(i===qm)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Wm)return n.BYTE;if(i===Xm)return n.SHORT;if(i===ba)return n.UNSIGNED_SHORT;if(i===fd)return n.INT;if(i===Ts)return n.UNSIGNED_INT;if(i===xi)return n.FLOAT;if(i===Pa)return n.HALF_FLOAT;if(i===Ym)return n.ALPHA;if(i===jm)return n.RGB;if(i===$n)return n.RGBA;if(i===Km)return n.LUMINANCE;if(i===Zm)return n.LUMINANCE_ALPHA;if(i===fr)return n.DEPTH_COMPONENT;if(i===Ar)return n.DEPTH_STENCIL;if(i===Jm)return n.RED;if(i===gd)return n.RED_INTEGER;if(i===Qm)return n.RG;if(i===vd)return n.RG_INTEGER;if(i===_d)return n.RGBA_INTEGER;if(i===Ao||i===To||i===Ro||i===Co)if(a===St)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Ao)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===To)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ro)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Co)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Ao)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===To)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ro)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Co)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===cu||i===uu||i===du||i===hu)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===cu)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===uu)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===du)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===hu)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===fu||i===pu||i===mu)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===fu||i===pu)return a===St?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===mu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===gu||i===vu||i===_u||i===yu||i===bu||i===xu||i===Su||i===Mu||i===Eu||i===wu||i===Au||i===Tu||i===Ru||i===Cu)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===gu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===vu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===_u)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===yu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===bu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===xu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Su)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Mu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Eu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===wu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Au)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Tu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Ru)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Cu)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Po||i===Pu||i===Iu)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Po)return a===St?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Pu)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Iu)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===eg||i===Du||i===Lu||i===Uu)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Po)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Du)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Lu)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Uu)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===wr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const ER={type:"move"};class Cc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new jr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new jr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new jr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const x of e.hand.values()){const y=t.getJointPose(x,i),g=this._getHandJoint(c,x);y!==null&&(g.matrix.fromArray(y.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=y.radius),g.visible=y!==null}const u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,b=.005;c.inputState.pinching&&h>f+b?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-b&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ER)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new jr;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const wR=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,AR=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class TR{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const s=new fn,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!==i.depthNear||t.depthFar!==i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new es({vertexShader:wR,fragmentShader:AR,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new yt(new Es(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class RR extends Ds{constructor(e,t){super();const i=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,d=null,h=null,f=null,b=null;const x=new TR,y=t.getContextAttributes();let g=null,A=null;const S=[],m=[],w=new Ee;let T=null;const R=new _n;R.viewport=new Lt;const U=new _n;U.viewport=new Lt;const M=[R,U],C=new YE;let F=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(fe){let xe=S[fe];return xe===void 0&&(xe=new Cc,S[fe]=xe),xe.getTargetRaySpace()},this.getControllerGrip=function(fe){let xe=S[fe];return xe===void 0&&(xe=new Cc,S[fe]=xe),xe.getGripSpace()},this.getHand=function(fe){let xe=S[fe];return xe===void 0&&(xe=new Cc,S[fe]=xe),xe.getHandSpace()};function B(fe){const xe=m.indexOf(fe.inputSource);if(xe===-1)return;const Te=S[xe];Te!==void 0&&(Te.update(fe.inputSource,fe.frame,c||a),Te.dispatchEvent({type:fe.type,data:fe.inputSource}))}function $(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",$),s.removeEventListener("inputsourceschange",j);for(let fe=0;fe<S.length;fe++){const xe=m[fe];xe!==null&&(m[fe]=null,S[fe].disconnect(xe))}F=null,G=null,x.reset(),e.setRenderTarget(g),f=null,h=null,d=null,s=null,A=null,st.stop(),i.isPresenting=!1,e.setPixelRatio(T),e.setSize(w.width,w.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(fe){r=fe,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(fe){o=fe,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(fe){c=fe},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d},this.getFrame=function(){return b},this.getSession=function(){return s},this.setSession=async function(fe){if(s=fe,s!==null){if(g=e.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",$),s.addEventListener("inputsourceschange",j),y.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(w),s.enabledFeatures!==void 0&&s.enabledFeatures.includes("layers")){let Te=null,H=null,me=null;y.depth&&(me=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Te=y.stencil?Ar:fr,H=y.stencil?wr:Ts);const he={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:r};d=new XRWebGLBinding(s,t),h=d.createProjectionLayer(he),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),A=new Rs(h.textureWidth,h.textureHeight,{format:$n,type:Ci,depthTexture:new mg(h.textureWidth,h.textureHeight,H,void 0,void 0,void 0,void 0,void 0,void 0,Te),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1})}else{const Te={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,Te),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),A=new Rs(f.framebufferWidth,f.framebufferHeight,{format:$n,type:Ci,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil})}A.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),st.setContext(s),st.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function j(fe){for(let xe=0;xe<fe.removed.length;xe++){const Te=fe.removed[xe],H=m.indexOf(Te);H>=0&&(m[H]=null,S[H].disconnect(Te))}for(let xe=0;xe<fe.added.length;xe++){const Te=fe.added[xe];let H=m.indexOf(Te);if(H===-1){for(let he=0;he<S.length;he++)if(he>=m.length){m.push(Te),H=he;break}else if(m[he]===null){m[he]=Te,H=he;break}if(H===-1)break}const me=S[H];me&&me.connect(Te)}}const Y=new V,re=new V;function K(fe,xe,Te){Y.setFromMatrixPosition(xe.matrixWorld),re.setFromMatrixPosition(Te.matrixWorld);const H=Y.distanceTo(re),me=xe.projectionMatrix.elements,he=Te.projectionMatrix.elements,ye=me[14]/(me[10]-1),Be=me[14]/(me[10]+1),O=(me[9]+1)/me[5],z=(me[9]-1)/me[5],I=(me[8]-1)/me[0],le=(he[8]+1)/he[0],ie=ye*I,Q=ye*le,ce=H/(-I+le),ve=ce*-I;if(xe.matrixWorld.decompose(fe.position,fe.quaternion,fe.scale),fe.translateX(ve),fe.translateZ(ce),fe.matrixWorld.compose(fe.position,fe.quaternion,fe.scale),fe.matrixWorldInverse.copy(fe.matrixWorld).invert(),me[10]===-1)fe.projectionMatrix.copy(xe.projectionMatrix),fe.projectionMatrixInverse.copy(xe.projectionMatrixInverse);else{const ae=ye+ce,p=Be+ce,v=ie-ve,P=Q+(H-ve),E=O*Be/p*ae,N=z*Be/p*ae;fe.projectionMatrix.makePerspective(v,P,E,N,ae,p),fe.projectionMatrixInverse.copy(fe.projectionMatrix).invert()}}function Se(fe,xe){xe===null?fe.matrixWorld.copy(fe.matrix):fe.matrixWorld.multiplyMatrices(xe.matrixWorld,fe.matrix),fe.matrixWorldInverse.copy(fe.matrixWorld).invert()}this.updateCamera=function(fe){if(s===null)return;let xe=fe.near,Te=fe.far;x.texture!==null&&(x.depthNear>0&&(xe=x.depthNear),x.depthFar>0&&(Te=x.depthFar)),C.near=U.near=R.near=xe,C.far=U.far=R.far=Te,(F!==C.near||G!==C.far)&&(s.updateRenderState({depthNear:C.near,depthFar:C.far}),F=C.near,G=C.far),R.layers.mask=fe.layers.mask|2,U.layers.mask=fe.layers.mask|4,C.layers.mask=R.layers.mask|U.layers.mask;const H=fe.parent,me=C.cameras;Se(C,H);for(let he=0;he<me.length;he++)Se(me[he],H);me.length===2?K(C,R,U):C.projectionMatrix.copy(R.projectionMatrix),Re(fe,C,H)};function Re(fe,xe,Te){Te===null?fe.matrix.copy(xe.matrixWorld):(fe.matrix.copy(Te.matrixWorld),fe.matrix.invert(),fe.matrix.multiply(xe.matrixWorld)),fe.matrix.decompose(fe.position,fe.quaternion,fe.scale),fe.updateMatrixWorld(!0),fe.projectionMatrix.copy(xe.projectionMatrix),fe.projectionMatrixInverse.copy(xe.projectionMatrixInverse),fe.isPerspectiveCamera&&(fe.fov=Ou*2*Math.atan(1/fe.projectionMatrix.elements[5]),fe.zoom=1)}this.getCamera=function(){return C},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(fe){l=fe,h!==null&&(h.fixedFoveation=fe),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=fe)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(C)};let De=null;function Ve(fe,xe){if(u=xe.getViewerPose(c||a),b=xe,u!==null){const Te=u.views;f!==null&&(e.setRenderTargetFramebuffer(A,f.framebuffer),e.setRenderTarget(A));let H=!1;Te.length!==C.cameras.length&&(C.cameras.length=0,H=!0);for(let he=0;he<Te.length;he++){const ye=Te[he];let Be=null;if(f!==null)Be=f.getViewport(ye);else{const z=d.getViewSubImage(h,ye);Be=z.viewport,he===0&&(e.setRenderTargetTextures(A,z.colorTexture,h.ignoreDepthValues?void 0:z.depthStencilTexture),e.setRenderTarget(A))}let O=M[he];O===void 0&&(O=new _n,O.layers.enable(he),O.viewport=new Lt,M[he]=O),O.matrix.fromArray(ye.transform.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale),O.projectionMatrix.fromArray(ye.projectionMatrix),O.projectionMatrixInverse.copy(O.projectionMatrix).invert(),O.viewport.set(Be.x,Be.y,Be.width,Be.height),he===0&&(C.matrix.copy(O.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale)),H===!0&&C.cameras.push(O)}const me=s.enabledFeatures;if(me&&me.includes("depth-sensing")){const he=d.getDepthInformation(Te[0]);he&&he.isValid&&he.texture&&x.init(e,he,s.renderState)}}for(let Te=0;Te<S.length;Te++){const H=m[Te],me=S[Te];H!==null&&me!==void 0&&me.update(H,xe,c||a)}De&&De(fe,xe),xe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:xe}),b=null}const st=new Sg;st.setAnimationLoop(Ve),this.setAnimationLoop=function(fe){De=fe},this.dispose=function(){}}}const hs=new ai,CR=new Tt;function PR(n,e){function t(y,g){y.matrixAutoUpdate===!0&&y.updateMatrix(),g.value.copy(y.matrix)}function i(y,g){g.color.getRGB(y.fogColor.value,cg(n)),g.isFog?(y.fogNear.value=g.near,y.fogFar.value=g.far):g.isFogExp2&&(y.fogDensity.value=g.density)}function s(y,g,A,S,m){g.isMeshBasicMaterial||g.isMeshLambertMaterial?r(y,g):g.isMeshToonMaterial?(r(y,g),d(y,g)):g.isMeshPhongMaterial?(r(y,g),u(y,g)):g.isMeshStandardMaterial?(r(y,g),h(y,g),g.isMeshPhysicalMaterial&&f(y,g,m)):g.isMeshMatcapMaterial?(r(y,g),b(y,g)):g.isMeshDepthMaterial?r(y,g):g.isMeshDistanceMaterial?(r(y,g),x(y,g)):g.isMeshNormalMaterial?r(y,g):g.isLineBasicMaterial?(a(y,g),g.isLineDashedMaterial&&o(y,g)):g.isPointsMaterial?l(y,g,A,S):g.isSpriteMaterial?c(y,g):g.isShadowMaterial?(y.color.value.copy(g.color),y.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(y,g){y.opacity.value=g.opacity,g.color&&y.diffuse.value.copy(g.color),g.emissive&&y.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(y.map.value=g.map,t(g.map,y.mapTransform)),g.alphaMap&&(y.alphaMap.value=g.alphaMap,t(g.alphaMap,y.alphaMapTransform)),g.bumpMap&&(y.bumpMap.value=g.bumpMap,t(g.bumpMap,y.bumpMapTransform),y.bumpScale.value=g.bumpScale,g.side===yn&&(y.bumpScale.value*=-1)),g.normalMap&&(y.normalMap.value=g.normalMap,t(g.normalMap,y.normalMapTransform),y.normalScale.value.copy(g.normalScale),g.side===yn&&y.normalScale.value.negate()),g.displacementMap&&(y.displacementMap.value=g.displacementMap,t(g.displacementMap,y.displacementMapTransform),y.displacementScale.value=g.displacementScale,y.displacementBias.value=g.displacementBias),g.emissiveMap&&(y.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,y.emissiveMapTransform)),g.specularMap&&(y.specularMap.value=g.specularMap,t(g.specularMap,y.specularMapTransform)),g.alphaTest>0&&(y.alphaTest.value=g.alphaTest);const A=e.get(g),S=A.envMap,m=A.envMapRotation;S&&(y.envMap.value=S,hs.copy(m),hs.x*=-1,hs.y*=-1,hs.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(hs.y*=-1,hs.z*=-1),y.envMapRotation.value.setFromMatrix4(CR.makeRotationFromEuler(hs)),y.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,y.reflectivity.value=g.reflectivity,y.ior.value=g.ior,y.refractionRatio.value=g.refractionRatio),g.lightMap&&(y.lightMap.value=g.lightMap,y.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,y.lightMapTransform)),g.aoMap&&(y.aoMap.value=g.aoMap,y.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,y.aoMapTransform))}function a(y,g){y.diffuse.value.copy(g.color),y.opacity.value=g.opacity,g.map&&(y.map.value=g.map,t(g.map,y.mapTransform))}function o(y,g){y.dashSize.value=g.dashSize,y.totalSize.value=g.dashSize+g.gapSize,y.scale.value=g.scale}function l(y,g,A,S){y.diffuse.value.copy(g.color),y.opacity.value=g.opacity,y.size.value=g.size*A,y.scale.value=S*.5,g.map&&(y.map.value=g.map,t(g.map,y.uvTransform)),g.alphaMap&&(y.alphaMap.value=g.alphaMap,t(g.alphaMap,y.alphaMapTransform)),g.alphaTest>0&&(y.alphaTest.value=g.alphaTest)}function c(y,g){y.diffuse.value.copy(g.color),y.opacity.value=g.opacity,y.rotation.value=g.rotation,g.map&&(y.map.value=g.map,t(g.map,y.mapTransform)),g.alphaMap&&(y.alphaMap.value=g.alphaMap,t(g.alphaMap,y.alphaMapTransform)),g.alphaTest>0&&(y.alphaTest.value=g.alphaTest)}function u(y,g){y.specular.value.copy(g.specular),y.shininess.value=Math.max(g.shininess,1e-4)}function d(y,g){g.gradientMap&&(y.gradientMap.value=g.gradientMap)}function h(y,g){y.metalness.value=g.metalness,g.metalnessMap&&(y.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,y.metalnessMapTransform)),y.roughness.value=g.roughness,g.roughnessMap&&(y.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,y.roughnessMapTransform)),g.envMap&&(y.envMapIntensity.value=g.envMapIntensity)}function f(y,g,A){y.ior.value=g.ior,g.sheen>0&&(y.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),y.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(y.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,y.sheenColorMapTransform)),g.sheenRoughnessMap&&(y.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,y.sheenRoughnessMapTransform))),g.clearcoat>0&&(y.clearcoat.value=g.clearcoat,y.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(y.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,y.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(y.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,y.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(y.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,y.clearcoatNormalMapTransform),y.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===yn&&y.clearcoatNormalScale.value.negate())),g.dispersion>0&&(y.dispersion.value=g.dispersion),g.iridescence>0&&(y.iridescence.value=g.iridescence,y.iridescenceIOR.value=g.iridescenceIOR,y.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],y.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(y.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,y.iridescenceMapTransform)),g.iridescenceThicknessMap&&(y.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,y.iridescenceThicknessMapTransform))),g.transmission>0&&(y.transmission.value=g.transmission,y.transmissionSamplerMap.value=A.texture,y.transmissionSamplerSize.value.set(A.width,A.height),g.transmissionMap&&(y.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,y.transmissionMapTransform)),y.thickness.value=g.thickness,g.thicknessMap&&(y.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,y.thicknessMapTransform)),y.attenuationDistance.value=g.attenuationDistance,y.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(y.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(y.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,y.anisotropyMapTransform))),y.specularIntensity.value=g.specularIntensity,y.specularColor.value.copy(g.specularColor),g.specularColorMap&&(y.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,y.specularColorMapTransform)),g.specularIntensityMap&&(y.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,y.specularIntensityMapTransform))}function b(y,g){g.matcap&&(y.matcap.value=g.matcap)}function x(y,g){const A=e.get(g).light;y.referencePosition.value.setFromMatrixPosition(A.matrixWorld),y.nearDistance.value=A.shadow.camera.near,y.farDistance.value=A.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function IR(n,e,t,i){let s={},r={},a=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(A,S){const m=S.program;i.uniformBlockBinding(A,m)}function c(A,S){let m=s[A.id];m===void 0&&(b(A),m=u(A),s[A.id]=m,A.addEventListener("dispose",y));const w=S.program;i.updateUBOMapping(A,w);const T=e.render.frame;r[A.id]!==T&&(h(A),r[A.id]=T)}function u(A){const S=d();A.__bindingPointIndex=S;const m=n.createBuffer(),w=A.__size,T=A.usage;return n.bindBuffer(n.UNIFORM_BUFFER,m),n.bufferData(n.UNIFORM_BUFFER,w,T),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,S,m),m}function d(){for(let A=0;A<o;A++)if(a.indexOf(A)===-1)return a.push(A),A;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(A){const S=s[A.id],m=A.uniforms,w=A.__cache;n.bindBuffer(n.UNIFORM_BUFFER,S);for(let T=0,R=m.length;T<R;T++){const U=Array.isArray(m[T])?m[T]:[m[T]];for(let M=0,C=U.length;M<C;M++){const F=U[M];if(f(F,T,M,w)===!0){const G=F.__offset,B=Array.isArray(F.value)?F.value:[F.value];let $=0;for(let j=0;j<B.length;j++){const Y=B[j],re=x(Y);typeof Y=="number"||typeof Y=="boolean"?(F.__data[0]=Y,n.bufferSubData(n.UNIFORM_BUFFER,G+$,F.__data)):Y.isMatrix3?(F.__data[0]=Y.elements[0],F.__data[1]=Y.elements[1],F.__data[2]=Y.elements[2],F.__data[3]=0,F.__data[4]=Y.elements[3],F.__data[5]=Y.elements[4],F.__data[6]=Y.elements[5],F.__data[7]=0,F.__data[8]=Y.elements[6],F.__data[9]=Y.elements[7],F.__data[10]=Y.elements[8],F.__data[11]=0):(Y.toArray(F.__data,$),$+=re.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,G,F.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(A,S,m,w){const T=A.value,R=S+"_"+m;if(w[R]===void 0)return typeof T=="number"||typeof T=="boolean"?w[R]=T:w[R]=T.clone(),!0;{const U=w[R];if(typeof T=="number"||typeof T=="boolean"){if(U!==T)return w[R]=T,!0}else if(U.equals(T)===!1)return U.copy(T),!0}return!1}function b(A){const S=A.uniforms;let m=0;const w=16;for(let R=0,U=S.length;R<U;R++){const M=Array.isArray(S[R])?S[R]:[S[R]];for(let C=0,F=M.length;C<F;C++){const G=M[C],B=Array.isArray(G.value)?G.value:[G.value];for(let $=0,j=B.length;$<j;$++){const Y=B[$],re=x(Y),K=m%w,Se=K%re.boundary,Re=K+Se;m+=Se,Re!==0&&w-Re<re.storage&&(m+=w-Re),G.__data=new Float32Array(re.storage/Float32Array.BYTES_PER_ELEMENT),G.__offset=m,m+=re.storage}}}const T=m%w;return T>0&&(m+=w-T),A.__size=m,A.__cache={},this}function x(A){const S={boundary:0,storage:0};return typeof A=="number"||typeof A=="boolean"?(S.boundary=4,S.storage=4):A.isVector2?(S.boundary=8,S.storage=8):A.isVector3||A.isColor?(S.boundary=16,S.storage=12):A.isVector4?(S.boundary=16,S.storage=16):A.isMatrix3?(S.boundary=48,S.storage=48):A.isMatrix4?(S.boundary=64,S.storage=64):A.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",A),S}function y(A){const S=A.target;S.removeEventListener("dispose",y);const m=a.indexOf(S.__bindingPointIndex);a.splice(m,1),n.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function g(){for(const A in s)n.deleteBuffer(s[A]);a=[],s={},r={}}return{bind:l,update:c,dispose:g}}class Rd{constructor(e={}){const{canvas:t=ZM(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:h=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=a;const b=new Uint32Array(4),x=new Int32Array(4);let y=null,g=null;const A=[],S=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=un,this.toneMapping=qi,this.toneMappingExposure=1;const m=this;let w=!1,T=0,R=0,U=null,M=-1,C=null;const F=new Lt,G=new Lt;let B=null;const $=new rt(0);let j=0,Y=t.width,re=t.height,K=1,Se=null,Re=null;const De=new Lt(0,0,Y,re),Ve=new Lt(0,0,Y,re);let st=!1;const fe=new xd;let xe=!1,Te=!1;this.transmissionResolutionScale=1;const H=new Tt,me=new Tt,he=new V,ye=new Lt,Be={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let O=!1;function z(){return U===null?K:1}let I=i;function le(L,X){return t.getContext(L,X)}try{const L={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${hd}`),t.addEventListener("webglcontextlost",_e,!1),t.addEventListener("webglcontextrestored",Ue,!1),t.addEventListener("webglcontextcreationerror",Le,!1),I===null){const X="webgl2";if(I=le(X,L),I===null)throw le(X)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(L){throw console.error("THREE.WebGLRenderer: "+L.message),L}let ie,Q,ce,ve,ae,p,v,P,E,N,k,ee,oe,ge,Fe,pe,we,Ne,He,Ae,Xe,Ze,vt,W;function Pe(){ie=new VT(I),ie.init(),Ze=new MR(I,ie),Q=new NT(I,ie,e,Ze),ce=new xR(I,ie),Q.reverseDepthBuffer&&h&&ce.buffers.depth.setReversed(!0),ve=new GT(I),ae=new lR,p=new SR(I,ie,ce,ae,Q,Ze,ve),v=new FT(m),P=new zT(m),E=new ZE(I),vt=new LT(I,E),N=new HT(I,E,ve,vt),k=new XT(I,N,E,ve),He=new WT(I,Q,p),pe=new OT(ae),ee=new oR(m,v,P,ie,Q,vt,pe),oe=new PR(m,ae),ge=new uR,Fe=new gR(ie),Ne=new DT(m,v,P,ce,k,f,l),we=new yR(m,k,Q),W=new IR(I,ve,Q,ce),Ae=new UT(I,ie,ve),Xe=new $T(I,ie,ve),ve.programs=ee.programs,m.capabilities=Q,m.extensions=ie,m.properties=ae,m.renderLists=ge,m.shadowMap=we,m.state=ce,m.info=ve}Pe();const ue=new RR(m,I);this.xr=ue,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const L=ie.get("WEBGL_lose_context");L&&L.loseContext()},this.forceContextRestore=function(){const L=ie.get("WEBGL_lose_context");L&&L.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(L){L!==void 0&&(K=L,this.setSize(Y,re,!1))},this.getSize=function(L){return L.set(Y,re)},this.setSize=function(L,X,te=!0){if(ue.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=L,re=X,t.width=Math.floor(L*K),t.height=Math.floor(X*K),te===!0&&(t.style.width=L+"px",t.style.height=X+"px"),this.setViewport(0,0,L,X)},this.getDrawingBufferSize=function(L){return L.set(Y*K,re*K).floor()},this.setDrawingBufferSize=function(L,X,te){Y=L,re=X,K=te,t.width=Math.floor(L*te),t.height=Math.floor(X*te),this.setViewport(0,0,L,X)},this.getCurrentViewport=function(L){return L.copy(F)},this.getViewport=function(L){return L.copy(De)},this.setViewport=function(L,X,te,se){L.isVector4?De.set(L.x,L.y,L.z,L.w):De.set(L,X,te,se),ce.viewport(F.copy(De).multiplyScalar(K).round())},this.getScissor=function(L){return L.copy(Ve)},this.setScissor=function(L,X,te,se){L.isVector4?Ve.set(L.x,L.y,L.z,L.w):Ve.set(L,X,te,se),ce.scissor(G.copy(Ve).multiplyScalar(K).round())},this.getScissorTest=function(){return st},this.setScissorTest=function(L){ce.setScissorTest(st=L)},this.setOpaqueSort=function(L){Se=L},this.setTransparentSort=function(L){Re=L},this.getClearColor=function(L){return L.copy(Ne.getClearColor())},this.setClearColor=function(){Ne.setClearColor.apply(Ne,arguments)},this.getClearAlpha=function(){return Ne.getClearAlpha()},this.setClearAlpha=function(){Ne.setClearAlpha.apply(Ne,arguments)},this.clear=function(L=!0,X=!0,te=!0){let se=0;if(L){let q=!1;if(U!==null){const be=U.texture.format;q=be===_d||be===vd||be===gd}if(q){const be=U.texture.type,Ie=be===Ci||be===Ts||be===ba||be===wr||be===pd||be===md,Oe=Ne.getClearColor(),ke=Ne.getClearAlpha(),qe=Oe.r,Ke=Oe.g,$e=Oe.b;Ie?(b[0]=qe,b[1]=Ke,b[2]=$e,b[3]=ke,I.clearBufferuiv(I.COLOR,0,b)):(x[0]=qe,x[1]=Ke,x[2]=$e,x[3]=ke,I.clearBufferiv(I.COLOR,0,x))}else se|=I.COLOR_BUFFER_BIT}X&&(se|=I.DEPTH_BUFFER_BIT),te&&(se|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(se)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",_e,!1),t.removeEventListener("webglcontextrestored",Ue,!1),t.removeEventListener("webglcontextcreationerror",Le,!1),Ne.dispose(),ge.dispose(),Fe.dispose(),ae.dispose(),v.dispose(),P.dispose(),k.dispose(),vt.dispose(),W.dispose(),ee.dispose(),ue.dispose(),ue.removeEventListener("sessionstart",Dd),ue.removeEventListener("sessionend",Ld),is.stop()};function _e(L){L.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function Ue(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const L=ve.autoReset,X=we.enabled,te=we.autoUpdate,se=we.needsUpdate,q=we.type;Pe(),ve.autoReset=L,we.enabled=X,we.autoUpdate=te,we.needsUpdate=se,we.type=q}function Le(L){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",L.statusMessage)}function Je(L){const X=L.target;X.removeEventListener("dispose",Je),Pt(X)}function Pt(L){Qt(L),ae.remove(L)}function Qt(L){const X=ae.get(L).programs;X!==void 0&&(X.forEach(function(te){ee.releaseProgram(te)}),L.isShaderMaterial&&ee.releaseShaderCache(L))}this.renderBufferDirect=function(L,X,te,se,q,be){X===null&&(X=Be);const Ie=q.isMesh&&q.matrixWorld.determinant()<0,Oe=Lg(L,X,te,se,q);ce.setMaterial(se,Ie);let ke=te.index,qe=1;if(se.wireframe===!0){if(ke=N.getWireframeAttribute(te),ke===void 0)return;qe=2}const Ke=te.drawRange,$e=te.attributes.position;let ct=Ke.start*qe,ft=(Ke.start+Ke.count)*qe;be!==null&&(ct=Math.max(ct,be.start*qe),ft=Math.min(ft,(be.start+be.count)*qe)),ke!==null?(ct=Math.max(ct,0),ft=Math.min(ft,ke.count)):$e!=null&&(ct=Math.max(ct,0),ft=Math.min(ft,$e.count));const Ot=ft-ct;if(Ot<0||Ot===1/0)return;vt.setup(q,se,Oe,te,ke);let It,ut=Ae;if(ke!==null&&(It=E.get(ke),ut=Xe,ut.setIndex(It)),q.isMesh)se.wireframe===!0?(ce.setLineWidth(se.wireframeLinewidth*z()),ut.setMode(I.LINES)):ut.setMode(I.TRIANGLES);else if(q.isLine){let Ge=se.linewidth;Ge===void 0&&(Ge=1),ce.setLineWidth(Ge*z()),q.isLineSegments?ut.setMode(I.LINES):q.isLineLoop?ut.setMode(I.LINE_LOOP):ut.setMode(I.LINE_STRIP)}else q.isPoints?ut.setMode(I.POINTS):q.isSprite&&ut.setMode(I.TRIANGLES);if(q.isBatchedMesh)if(q._multiDrawInstances!==null)ut.renderMultiDrawInstances(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount,q._multiDrawInstances);else if(ie.get("WEBGL_multi_draw"))ut.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{const Ge=q._multiDrawStarts,jt=q._multiDrawCounts,pt=q._multiDrawCount,Fn=ke?E.get(ke).bytesPerElement:1,Us=ae.get(se).currentProgram.getUniforms();for(let bn=0;bn<pt;bn++)Us.setValue(I,"_gl_DrawID",bn),ut.render(Ge[bn]/Fn,jt[bn])}else if(q.isInstancedMesh)ut.renderInstances(ct,Ot,q.count);else if(te.isInstancedBufferGeometry){const Ge=te._maxInstanceCount!==void 0?te._maxInstanceCount:1/0,jt=Math.min(te.instanceCount,Ge);ut.renderInstances(ct,Ot,jt)}else ut.render(ct,Ot)};function _t(L,X,te){L.transparent===!0&&L.side===Ln&&L.forceSinglePass===!1?(L.side=yn,L.needsUpdate=!0,La(L,X,te),L.side=Qi,L.needsUpdate=!0,La(L,X,te),L.side=Ln):La(L,X,te)}this.compile=function(L,X,te=null){te===null&&(te=L),g=Fe.get(te),g.init(X),S.push(g),te.traverseVisible(function(q){q.isLight&&q.layers.test(X.layers)&&(g.pushLight(q),q.castShadow&&g.pushShadow(q))}),L!==te&&L.traverseVisible(function(q){q.isLight&&q.layers.test(X.layers)&&(g.pushLight(q),q.castShadow&&g.pushShadow(q))}),g.setupLights();const se=new Set;return L.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;const be=q.material;if(be)if(Array.isArray(be))for(let Ie=0;Ie<be.length;Ie++){const Oe=be[Ie];_t(Oe,te,q),se.add(Oe)}else _t(be,te,q),se.add(be)}),S.pop(),g=null,se},this.compileAsync=function(L,X,te=null){const se=this.compile(L,X,te);return new Promise(q=>{function be(){if(se.forEach(function(Ie){ae.get(Ie).currentProgram.isReady()&&se.delete(Ie)}),se.size===0){q(L);return}setTimeout(be,10)}ie.get("KHR_parallel_shader_compile")!==null?be():setTimeout(be,10)})};let On=null;function li(L){On&&On(L)}function Dd(){is.stop()}function Ld(){is.start()}const is=new Sg;is.setAnimationLoop(li),typeof self<"u"&&is.setContext(self),this.setAnimationLoop=function(L){On=L,ue.setAnimationLoop(L),L===null?is.stop():is.start()},ue.addEventListener("sessionstart",Dd),ue.addEventListener("sessionend",Ld),this.render=function(L,X){if(X!==void 0&&X.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),X.parent===null&&X.matrixWorldAutoUpdate===!0&&X.updateMatrixWorld(),ue.enabled===!0&&ue.isPresenting===!0&&(ue.cameraAutoUpdate===!0&&ue.updateCamera(X),X=ue.getCamera()),L.isScene===!0&&L.onBeforeRender(m,L,X,U),g=Fe.get(L,S.length),g.init(X),S.push(g),me.multiplyMatrices(X.projectionMatrix,X.matrixWorldInverse),fe.setFromProjectionMatrix(me),Te=this.localClippingEnabled,xe=pe.init(this.clippingPlanes,Te),y=ge.get(L,A.length),y.init(),A.push(y),ue.enabled===!0&&ue.isPresenting===!0){const be=m.xr.getDepthSensingMesh();be!==null&&Ml(be,X,-1/0,m.sortObjects)}Ml(L,X,0,m.sortObjects),y.finish(),m.sortObjects===!0&&y.sort(Se,Re),O=ue.enabled===!1||ue.isPresenting===!1||ue.hasDepthSensing()===!1,O&&Ne.addToRenderList(y,L),this.info.render.frame++,xe===!0&&pe.beginShadows();const te=g.state.shadowsArray;we.render(te,L,X),xe===!0&&pe.endShadows(),this.info.autoReset===!0&&this.info.reset();const se=y.opaque,q=y.transmissive;if(g.setupLights(),X.isArrayCamera){const be=X.cameras;if(q.length>0)for(let Ie=0,Oe=be.length;Ie<Oe;Ie++){const ke=be[Ie];Nd(se,q,L,ke)}O&&Ne.render(L);for(let Ie=0,Oe=be.length;Ie<Oe;Ie++){const ke=be[Ie];Ud(y,L,ke,ke.viewport)}}else q.length>0&&Nd(se,q,L,X),O&&Ne.render(L),Ud(y,L,X);U!==null&&R===0&&(p.updateMultisampleRenderTarget(U),p.updateRenderTargetMipmap(U)),L.isScene===!0&&L.onAfterRender(m,L,X),vt.resetDefaultState(),M=-1,C=null,S.pop(),S.length>0?(g=S[S.length-1],xe===!0&&pe.setGlobalState(m.clippingPlanes,g.state.camera)):g=null,A.pop(),A.length>0?y=A[A.length-1]:y=null};function Ml(L,X,te,se){if(L.visible===!1)return;if(L.layers.test(X.layers)){if(L.isGroup)te=L.renderOrder;else if(L.isLOD)L.autoUpdate===!0&&L.update(X);else if(L.isLight)g.pushLight(L),L.castShadow&&g.pushShadow(L);else if(L.isSprite){if(!L.frustumCulled||fe.intersectsSprite(L)){se&&ye.setFromMatrixPosition(L.matrixWorld).applyMatrix4(me);const Ie=k.update(L),Oe=L.material;Oe.visible&&y.push(L,Ie,Oe,te,ye.z,null)}}else if((L.isMesh||L.isLine||L.isPoints)&&(!L.frustumCulled||fe.intersectsObject(L))){const Ie=k.update(L),Oe=L.material;if(se&&(L.boundingSphere!==void 0?(L.boundingSphere===null&&L.computeBoundingSphere(),ye.copy(L.boundingSphere.center)):(Ie.boundingSphere===null&&Ie.computeBoundingSphere(),ye.copy(Ie.boundingSphere.center)),ye.applyMatrix4(L.matrixWorld).applyMatrix4(me)),Array.isArray(Oe)){const ke=Ie.groups;for(let qe=0,Ke=ke.length;qe<Ke;qe++){const $e=ke[qe],ct=Oe[$e.materialIndex];ct&&ct.visible&&y.push(L,Ie,ct,te,ye.z,$e)}}else Oe.visible&&y.push(L,Ie,Oe,te,ye.z,null)}}const be=L.children;for(let Ie=0,Oe=be.length;Ie<Oe;Ie++)Ml(be[Ie],X,te,se)}function Ud(L,X,te,se){const q=L.opaque,be=L.transmissive,Ie=L.transparent;g.setupLightsView(te),xe===!0&&pe.setGlobalState(m.clippingPlanes,te),se&&ce.viewport(F.copy(se)),q.length>0&&Da(q,X,te),be.length>0&&Da(be,X,te),Ie.length>0&&Da(Ie,X,te),ce.buffers.depth.setTest(!0),ce.buffers.depth.setMask(!0),ce.buffers.color.setMask(!0),ce.setPolygonOffset(!1)}function Nd(L,X,te,se){if((te.isScene===!0?te.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[se.id]===void 0&&(g.state.transmissionRenderTarget[se.id]=new Rs(1,1,{generateMipmaps:!0,type:ie.has("EXT_color_buffer_half_float")||ie.has("EXT_color_buffer_float")?Pa:Ci,minFilter:xs,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ht.workingColorSpace}));const be=g.state.transmissionRenderTarget[se.id],Ie=se.viewport||F;be.setSize(Ie.z*m.transmissionResolutionScale,Ie.w*m.transmissionResolutionScale);const Oe=m.getRenderTarget();m.setRenderTarget(be),m.getClearColor($),j=m.getClearAlpha(),j<1&&m.setClearColor(16777215,.5),m.clear(),O&&Ne.render(te);const ke=m.toneMapping;m.toneMapping=qi;const qe=se.viewport;if(se.viewport!==void 0&&(se.viewport=void 0),g.setupLightsView(se),xe===!0&&pe.setGlobalState(m.clippingPlanes,se),Da(L,te,se),p.updateMultisampleRenderTarget(be),p.updateRenderTargetMipmap(be),ie.has("WEBGL_multisampled_render_to_texture")===!1){let Ke=!1;for(let $e=0,ct=X.length;$e<ct;$e++){const ft=X[$e],Ot=ft.object,It=ft.geometry,ut=ft.material,Ge=ft.group;if(ut.side===Ln&&Ot.layers.test(se.layers)){const jt=ut.side;ut.side=yn,ut.needsUpdate=!0,Od(Ot,te,se,It,ut,Ge),ut.side=jt,ut.needsUpdate=!0,Ke=!0}}Ke===!0&&(p.updateMultisampleRenderTarget(be),p.updateRenderTargetMipmap(be))}m.setRenderTarget(Oe),m.setClearColor($,j),qe!==void 0&&(se.viewport=qe),m.toneMapping=ke}function Da(L,X,te){const se=X.isScene===!0?X.overrideMaterial:null;for(let q=0,be=L.length;q<be;q++){const Ie=L[q],Oe=Ie.object,ke=Ie.geometry,qe=se===null?Ie.material:se,Ke=Ie.group;Oe.layers.test(te.layers)&&Od(Oe,X,te,ke,qe,Ke)}}function Od(L,X,te,se,q,be){L.onBeforeRender(m,X,te,se,q,be),L.modelViewMatrix.multiplyMatrices(te.matrixWorldInverse,L.matrixWorld),L.normalMatrix.getNormalMatrix(L.modelViewMatrix),q.onBeforeRender(m,X,te,se,L,be),q.transparent===!0&&q.side===Ln&&q.forceSinglePass===!1?(q.side=yn,q.needsUpdate=!0,m.renderBufferDirect(te,X,se,q,L,be),q.side=Qi,q.needsUpdate=!0,m.renderBufferDirect(te,X,se,q,L,be),q.side=Ln):m.renderBufferDirect(te,X,se,q,L,be),L.onAfterRender(m,X,te,se,q,be)}function La(L,X,te){X.isScene!==!0&&(X=Be);const se=ae.get(L),q=g.state.lights,be=g.state.shadowsArray,Ie=q.state.version,Oe=ee.getParameters(L,q.state,be,X,te),ke=ee.getProgramCacheKey(Oe);let qe=se.programs;se.environment=L.isMeshStandardMaterial?X.environment:null,se.fog=X.fog,se.envMap=(L.isMeshStandardMaterial?P:v).get(L.envMap||se.environment),se.envMapRotation=se.environment!==null&&L.envMap===null?X.environmentRotation:L.envMapRotation,qe===void 0&&(L.addEventListener("dispose",Je),qe=new Map,se.programs=qe);let Ke=qe.get(ke);if(Ke!==void 0){if(se.currentProgram===Ke&&se.lightsStateVersion===Ie)return kd(L,Oe),Ke}else Oe.uniforms=ee.getUniforms(L),L.onBeforeCompile(Oe,m),Ke=ee.acquireProgram(Oe,ke),qe.set(ke,Ke),se.uniforms=Oe.uniforms;const $e=se.uniforms;return(!L.isShaderMaterial&&!L.isRawShaderMaterial||L.clipping===!0)&&($e.clippingPlanes=pe.uniform),kd(L,Oe),se.needsLights=Ng(L),se.lightsStateVersion=Ie,se.needsLights&&($e.ambientLightColor.value=q.state.ambient,$e.lightProbe.value=q.state.probe,$e.directionalLights.value=q.state.directional,$e.directionalLightShadows.value=q.state.directionalShadow,$e.spotLights.value=q.state.spot,$e.spotLightShadows.value=q.state.spotShadow,$e.rectAreaLights.value=q.state.rectArea,$e.ltc_1.value=q.state.rectAreaLTC1,$e.ltc_2.value=q.state.rectAreaLTC2,$e.pointLights.value=q.state.point,$e.pointLightShadows.value=q.state.pointShadow,$e.hemisphereLights.value=q.state.hemi,$e.directionalShadowMap.value=q.state.directionalShadowMap,$e.directionalShadowMatrix.value=q.state.directionalShadowMatrix,$e.spotShadowMap.value=q.state.spotShadowMap,$e.spotLightMatrix.value=q.state.spotLightMatrix,$e.spotLightMap.value=q.state.spotLightMap,$e.pointShadowMap.value=q.state.pointShadowMap,$e.pointShadowMatrix.value=q.state.pointShadowMatrix),se.currentProgram=Ke,se.uniformsList=null,Ke}function Fd(L){if(L.uniformsList===null){const X=L.currentProgram.getUniforms();L.uniformsList=Io.seqWithValue(X.seq,L.uniforms)}return L.uniformsList}function kd(L,X){const te=ae.get(L);te.outputColorSpace=X.outputColorSpace,te.batching=X.batching,te.batchingColor=X.batchingColor,te.instancing=X.instancing,te.instancingColor=X.instancingColor,te.instancingMorph=X.instancingMorph,te.skinning=X.skinning,te.morphTargets=X.morphTargets,te.morphNormals=X.morphNormals,te.morphColors=X.morphColors,te.morphTargetsCount=X.morphTargetsCount,te.numClippingPlanes=X.numClippingPlanes,te.numIntersection=X.numClipIntersection,te.vertexAlphas=X.vertexAlphas,te.vertexTangents=X.vertexTangents,te.toneMapping=X.toneMapping}function Lg(L,X,te,se,q){X.isScene!==!0&&(X=Be),p.resetTextureUnits();const be=X.fog,Ie=se.isMeshStandardMaterial?X.environment:null,Oe=U===null?m.outputColorSpace:U.isXRRenderTarget===!0?U.texture.colorSpace:Tr,ke=(se.isMeshStandardMaterial?P:v).get(se.envMap||Ie),qe=se.vertexColors===!0&&!!te.attributes.color&&te.attributes.color.itemSize===4,Ke=!!te.attributes.tangent&&(!!se.normalMap||se.anisotropy>0),$e=!!te.morphAttributes.position,ct=!!te.morphAttributes.normal,ft=!!te.morphAttributes.color;let Ot=qi;se.toneMapped&&(U===null||U.isXRRenderTarget===!0)&&(Ot=m.toneMapping);const It=te.morphAttributes.position||te.morphAttributes.normal||te.morphAttributes.color,ut=It!==void 0?It.length:0,Ge=ae.get(se),jt=g.state.lights;if(xe===!0&&(Te===!0||L!==C)){const rn=L===C&&se.id===M;pe.setState(se,L,rn)}let pt=!1;se.version===Ge.__version?(Ge.needsLights&&Ge.lightsStateVersion!==jt.state.version||Ge.outputColorSpace!==Oe||q.isBatchedMesh&&Ge.batching===!1||!q.isBatchedMesh&&Ge.batching===!0||q.isBatchedMesh&&Ge.batchingColor===!0&&q.colorTexture===null||q.isBatchedMesh&&Ge.batchingColor===!1&&q.colorTexture!==null||q.isInstancedMesh&&Ge.instancing===!1||!q.isInstancedMesh&&Ge.instancing===!0||q.isSkinnedMesh&&Ge.skinning===!1||!q.isSkinnedMesh&&Ge.skinning===!0||q.isInstancedMesh&&Ge.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&Ge.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&Ge.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&Ge.instancingMorph===!1&&q.morphTexture!==null||Ge.envMap!==ke||se.fog===!0&&Ge.fog!==be||Ge.numClippingPlanes!==void 0&&(Ge.numClippingPlanes!==pe.numPlanes||Ge.numIntersection!==pe.numIntersection)||Ge.vertexAlphas!==qe||Ge.vertexTangents!==Ke||Ge.morphTargets!==$e||Ge.morphNormals!==ct||Ge.morphColors!==ft||Ge.toneMapping!==Ot||Ge.morphTargetsCount!==ut)&&(pt=!0):(pt=!0,Ge.__version=se.version);let Fn=Ge.currentProgram;pt===!0&&(Fn=La(se,X,q));let Us=!1,bn=!1,Nr=!1;const Rt=Fn.getUniforms(),Pn=Ge.uniforms;if(ce.useProgram(Fn.program)&&(Us=!0,bn=!0,Nr=!0),se.id!==M&&(M=se.id,bn=!0),Us||C!==L){ce.buffers.depth.getReversed()?(H.copy(L.projectionMatrix),QM(H),eE(H),Rt.setValue(I,"projectionMatrix",H)):Rt.setValue(I,"projectionMatrix",L.projectionMatrix),Rt.setValue(I,"viewMatrix",L.matrixWorldInverse);const mn=Rt.map.cameraPosition;mn!==void 0&&mn.setValue(I,he.setFromMatrixPosition(L.matrixWorld)),Q.logarithmicDepthBuffer&&Rt.setValue(I,"logDepthBufFC",2/(Math.log(L.far+1)/Math.LN2)),(se.isMeshPhongMaterial||se.isMeshToonMaterial||se.isMeshLambertMaterial||se.isMeshBasicMaterial||se.isMeshStandardMaterial||se.isShaderMaterial)&&Rt.setValue(I,"isOrthographic",L.isOrthographicCamera===!0),C!==L&&(C=L,bn=!0,Nr=!0)}if(q.isSkinnedMesh){Rt.setOptional(I,q,"bindMatrix"),Rt.setOptional(I,q,"bindMatrixInverse");const rn=q.skeleton;rn&&(rn.boneTexture===null&&rn.computeBoneTexture(),Rt.setValue(I,"boneTexture",rn.boneTexture,p))}q.isBatchedMesh&&(Rt.setOptional(I,q,"batchingTexture"),Rt.setValue(I,"batchingTexture",q._matricesTexture,p),Rt.setOptional(I,q,"batchingIdTexture"),Rt.setValue(I,"batchingIdTexture",q._indirectTexture,p),Rt.setOptional(I,q,"batchingColorTexture"),q._colorsTexture!==null&&Rt.setValue(I,"batchingColorTexture",q._colorsTexture,p));const In=te.morphAttributes;if((In.position!==void 0||In.normal!==void 0||In.color!==void 0)&&He.update(q,te,Fn),(bn||Ge.receiveShadow!==q.receiveShadow)&&(Ge.receiveShadow=q.receiveShadow,Rt.setValue(I,"receiveShadow",q.receiveShadow)),se.isMeshGouraudMaterial&&se.envMap!==null&&(Pn.envMap.value=ke,Pn.flipEnvMap.value=ke.isCubeTexture&&ke.isRenderTargetTexture===!1?-1:1),se.isMeshStandardMaterial&&se.envMap===null&&X.environment!==null&&(Pn.envMapIntensity.value=X.environmentIntensity),bn&&(Rt.setValue(I,"toneMappingExposure",m.toneMappingExposure),Ge.needsLights&&Ug(Pn,Nr),be&&se.fog===!0&&oe.refreshFogUniforms(Pn,be),oe.refreshMaterialUniforms(Pn,se,K,re,g.state.transmissionRenderTarget[L.id]),Io.upload(I,Fd(Ge),Pn,p)),se.isShaderMaterial&&se.uniformsNeedUpdate===!0&&(Io.upload(I,Fd(Ge),Pn,p),se.uniformsNeedUpdate=!1),se.isSpriteMaterial&&Rt.setValue(I,"center",q.center),Rt.setValue(I,"modelViewMatrix",q.modelViewMatrix),Rt.setValue(I,"normalMatrix",q.normalMatrix),Rt.setValue(I,"modelMatrix",q.matrixWorld),se.isShaderMaterial||se.isRawShaderMaterial){const rn=se.uniformsGroups;for(let mn=0,El=rn.length;mn<El;mn++){const ss=rn[mn];W.update(ss,Fn),W.bind(ss,Fn)}}return Fn}function Ug(L,X){L.ambientLightColor.needsUpdate=X,L.lightProbe.needsUpdate=X,L.directionalLights.needsUpdate=X,L.directionalLightShadows.needsUpdate=X,L.pointLights.needsUpdate=X,L.pointLightShadows.needsUpdate=X,L.spotLights.needsUpdate=X,L.spotLightShadows.needsUpdate=X,L.rectAreaLights.needsUpdate=X,L.hemisphereLights.needsUpdate=X}function Ng(L){return L.isMeshLambertMaterial||L.isMeshToonMaterial||L.isMeshPhongMaterial||L.isMeshStandardMaterial||L.isShadowMaterial||L.isShaderMaterial&&L.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return U},this.setRenderTargetTextures=function(L,X,te){ae.get(L.texture).__webglTexture=X,ae.get(L.depthTexture).__webglTexture=te;const se=ae.get(L);se.__hasExternalTextures=!0,se.__autoAllocateDepthBuffer=te===void 0,se.__autoAllocateDepthBuffer||ie.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),se.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(L,X){const te=ae.get(L);te.__webglFramebuffer=X,te.__useDefaultFramebuffer=X===void 0};const Og=I.createFramebuffer();this.setRenderTarget=function(L,X=0,te=0){U=L,T=X,R=te;let se=!0,q=null,be=!1,Ie=!1;if(L){const ke=ae.get(L);if(ke.__useDefaultFramebuffer!==void 0)ce.bindFramebuffer(I.FRAMEBUFFER,null),se=!1;else if(ke.__webglFramebuffer===void 0)p.setupRenderTarget(L);else if(ke.__hasExternalTextures)p.rebindTextures(L,ae.get(L.texture).__webglTexture,ae.get(L.depthTexture).__webglTexture);else if(L.depthBuffer){const $e=L.depthTexture;if(ke.__boundDepthTexture!==$e){if($e!==null&&ae.has($e)&&(L.width!==$e.image.width||L.height!==$e.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");p.setupDepthRenderbuffer(L)}}const qe=L.texture;(qe.isData3DTexture||qe.isDataArrayTexture||qe.isCompressedArrayTexture)&&(Ie=!0);const Ke=ae.get(L).__webglFramebuffer;L.isWebGLCubeRenderTarget?(Array.isArray(Ke[X])?q=Ke[X][te]:q=Ke[X],be=!0):L.samples>0&&p.useMultisampledRTT(L)===!1?q=ae.get(L).__webglMultisampledFramebuffer:Array.isArray(Ke)?q=Ke[te]:q=Ke,F.copy(L.viewport),G.copy(L.scissor),B=L.scissorTest}else F.copy(De).multiplyScalar(K).floor(),G.copy(Ve).multiplyScalar(K).floor(),B=st;if(te!==0&&(q=Og),ce.bindFramebuffer(I.FRAMEBUFFER,q)&&se&&ce.drawBuffers(L,q),ce.viewport(F),ce.scissor(G),ce.setScissorTest(B),be){const ke=ae.get(L.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+X,ke.__webglTexture,te)}else if(Ie){const ke=ae.get(L.texture),qe=X;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,ke.__webglTexture,te,qe)}else if(L!==null&&te!==0){const ke=ae.get(L.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,ke.__webglTexture,te)}M=-1},this.readRenderTargetPixels=function(L,X,te,se,q,be,Ie){if(!(L&&L.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Oe=ae.get(L).__webglFramebuffer;if(L.isWebGLCubeRenderTarget&&Ie!==void 0&&(Oe=Oe[Ie]),Oe){ce.bindFramebuffer(I.FRAMEBUFFER,Oe);try{const ke=L.texture,qe=ke.format,Ke=ke.type;if(!Q.textureFormatReadable(qe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Q.textureTypeReadable(Ke)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}X>=0&&X<=L.width-se&&te>=0&&te<=L.height-q&&I.readPixels(X,te,se,q,Ze.convert(qe),Ze.convert(Ke),be)}finally{const ke=U!==null?ae.get(U).__webglFramebuffer:null;ce.bindFramebuffer(I.FRAMEBUFFER,ke)}}},this.readRenderTargetPixelsAsync=async function(L,X,te,se,q,be,Ie){if(!(L&&L.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Oe=ae.get(L).__webglFramebuffer;if(L.isWebGLCubeRenderTarget&&Ie!==void 0&&(Oe=Oe[Ie]),Oe){const ke=L.texture,qe=ke.format,Ke=ke.type;if(!Q.textureFormatReadable(qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Q.textureTypeReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(X>=0&&X<=L.width-se&&te>=0&&te<=L.height-q){ce.bindFramebuffer(I.FRAMEBUFFER,Oe);const $e=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,$e),I.bufferData(I.PIXEL_PACK_BUFFER,be.byteLength,I.STREAM_READ),I.readPixels(X,te,se,q,Ze.convert(qe),Ze.convert(Ke),0);const ct=U!==null?ae.get(U).__webglFramebuffer:null;ce.bindFramebuffer(I.FRAMEBUFFER,ct);const ft=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await JM(I,ft,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,$e),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,be),I.deleteBuffer($e),I.deleteSync(ft),be}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(L,X=null,te=0){L.isTexture!==!0&&(sr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),X=arguments[0]||null,L=arguments[1]);const se=Math.pow(2,-te),q=Math.floor(L.image.width*se),be=Math.floor(L.image.height*se),Ie=X!==null?X.x:0,Oe=X!==null?X.y:0;p.setTexture2D(L,0),I.copyTexSubImage2D(I.TEXTURE_2D,te,0,0,Ie,Oe,q,be),ce.unbindTexture()};const Fg=I.createFramebuffer(),kg=I.createFramebuffer();this.copyTextureToTexture=function(L,X,te=null,se=null,q=0,be=null){L.isTexture!==!0&&(sr("WebGLRenderer: copyTextureToTexture function signature has changed."),se=arguments[0]||null,L=arguments[1],X=arguments[2],be=arguments[3]||0,te=null),be===null&&(q!==0?(sr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),be=q,q=0):be=0);let Ie,Oe,ke,qe,Ke,$e,ct,ft,Ot;const It=L.isCompressedTexture?L.mipmaps[be]:L.image;if(te!==null)Ie=te.max.x-te.min.x,Oe=te.max.y-te.min.y,ke=te.isBox3?te.max.z-te.min.z:1,qe=te.min.x,Ke=te.min.y,$e=te.isBox3?te.min.z:0;else{const In=Math.pow(2,-q);Ie=Math.floor(It.width*In),Oe=Math.floor(It.height*In),L.isDataArrayTexture?ke=It.depth:L.isData3DTexture?ke=Math.floor(It.depth*In):ke=1,qe=0,Ke=0,$e=0}se!==null?(ct=se.x,ft=se.y,Ot=se.z):(ct=0,ft=0,Ot=0);const ut=Ze.convert(X.format),Ge=Ze.convert(X.type);let jt;X.isData3DTexture?(p.setTexture3D(X,0),jt=I.TEXTURE_3D):X.isDataArrayTexture||X.isCompressedArrayTexture?(p.setTexture2DArray(X,0),jt=I.TEXTURE_2D_ARRAY):(p.setTexture2D(X,0),jt=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,X.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,X.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,X.unpackAlignment);const pt=I.getParameter(I.UNPACK_ROW_LENGTH),Fn=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Us=I.getParameter(I.UNPACK_SKIP_PIXELS),bn=I.getParameter(I.UNPACK_SKIP_ROWS),Nr=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,It.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,It.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,qe),I.pixelStorei(I.UNPACK_SKIP_ROWS,Ke),I.pixelStorei(I.UNPACK_SKIP_IMAGES,$e);const Rt=L.isDataArrayTexture||L.isData3DTexture,Pn=X.isDataArrayTexture||X.isData3DTexture;if(L.isDepthTexture){const In=ae.get(L),rn=ae.get(X),mn=ae.get(In.__renderTarget),El=ae.get(rn.__renderTarget);ce.bindFramebuffer(I.READ_FRAMEBUFFER,mn.__webglFramebuffer),ce.bindFramebuffer(I.DRAW_FRAMEBUFFER,El.__webglFramebuffer);for(let ss=0;ss<ke;ss++)Rt&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,ae.get(L).__webglTexture,q,$e+ss),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,ae.get(X).__webglTexture,be,Ot+ss)),I.blitFramebuffer(qe,Ke,Ie,Oe,ct,ft,Ie,Oe,I.DEPTH_BUFFER_BIT,I.NEAREST);ce.bindFramebuffer(I.READ_FRAMEBUFFER,null),ce.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(q!==0||L.isRenderTargetTexture||ae.has(L)){const In=ae.get(L),rn=ae.get(X);ce.bindFramebuffer(I.READ_FRAMEBUFFER,Fg),ce.bindFramebuffer(I.DRAW_FRAMEBUFFER,kg);for(let mn=0;mn<ke;mn++)Rt?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,In.__webglTexture,q,$e+mn):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,In.__webglTexture,q),Pn?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,rn.__webglTexture,be,Ot+mn):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,rn.__webglTexture,be),q!==0?I.blitFramebuffer(qe,Ke,Ie,Oe,ct,ft,Ie,Oe,I.COLOR_BUFFER_BIT,I.NEAREST):Pn?I.copyTexSubImage3D(jt,be,ct,ft,Ot+mn,qe,Ke,Ie,Oe):I.copyTexSubImage2D(jt,be,ct,ft,qe,Ke,Ie,Oe);ce.bindFramebuffer(I.READ_FRAMEBUFFER,null),ce.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else Pn?L.isDataTexture||L.isData3DTexture?I.texSubImage3D(jt,be,ct,ft,Ot,Ie,Oe,ke,ut,Ge,It.data):X.isCompressedArrayTexture?I.compressedTexSubImage3D(jt,be,ct,ft,Ot,Ie,Oe,ke,ut,It.data):I.texSubImage3D(jt,be,ct,ft,Ot,Ie,Oe,ke,ut,Ge,It):L.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,be,ct,ft,Ie,Oe,ut,Ge,It.data):L.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,be,ct,ft,It.width,It.height,ut,It.data):I.texSubImage2D(I.TEXTURE_2D,be,ct,ft,Ie,Oe,ut,Ge,It);I.pixelStorei(I.UNPACK_ROW_LENGTH,pt),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Fn),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Us),I.pixelStorei(I.UNPACK_SKIP_ROWS,bn),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Nr),be===0&&X.generateMipmaps&&I.generateMipmap(jt),ce.unbindTexture()},this.copyTextureToTexture3D=function(L,X,te=null,se=null,q=0){return L.isTexture!==!0&&(sr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),te=arguments[0]||null,se=arguments[1]||null,L=arguments[2],X=arguments[3],q=arguments[4]||0),sr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(L,X,te,se,q)},this.initRenderTarget=function(L){ae.get(L).__webglFramebuffer===void 0&&p.setupRenderTarget(L)},this.initTexture=function(L){L.isCubeTexture?p.setTextureCube(L,0):L.isData3DTexture?p.setTexture3D(L,0):L.isDataArrayTexture||L.isCompressedArrayTexture?p.setTexture2DArray(L,0):p.setTexture2D(L,0),ce.unbindTexture()},this.resetState=function(){T=0,R=0,U=null,ce.reset(),vt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Si}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=ht._getDrawingBufferColorSpace(e),t.unpackColorSpace=ht._getUnpackColorSpace()}}const Zf={type:"change"},Cd={type:"start"},Tg={type:"end"},So=new bl,Jf=new Hi,DR=Math.cos(70*KM.DEG2RAD),zt=new V,gn=2*Math.PI,Et={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Pc=1e-6;class Pd extends jE{constructor(e,t=null){super(e,t),this.state=Et.NONE,this.enabled=!0,this.target=new V,this.cursor=new V,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:dr.ROTATE,MIDDLE:dr.DOLLY,RIGHT:dr.PAN},this.touches={ONE:ar.ROTATE,TWO:ar.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new V,this._lastQuaternion=new Cs,this._lastTargetPosition=new V,this._quat=new Cs().setFromUnitVectors(e.up,new V(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new wf,this._sphericalDelta=new wf,this._scale=1,this._panOffset=new V,this._rotateStart=new Ee,this._rotateEnd=new Ee,this._rotateDelta=new Ee,this._panStart=new Ee,this._panEnd=new Ee,this._panDelta=new Ee,this._dollyStart=new Ee,this._dollyEnd=new Ee,this._dollyDelta=new Ee,this._dollyDirection=new V,this._mouse=new Ee,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=UR.bind(this),this._onPointerDown=LR.bind(this),this._onPointerUp=NR.bind(this),this._onContextMenu=HR.bind(this),this._onMouseWheel=kR.bind(this),this._onKeyDown=BR.bind(this),this._onTouchStart=zR.bind(this),this._onTouchMove=VR.bind(this),this._onMouseDown=OR.bind(this),this._onMouseMove=FR.bind(this),this._interceptControlDown=$R.bind(this),this._interceptControlUp=GR.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Zf),this.update(),this.state=Et.NONE}update(e=null){const t=this.object.position;zt.copy(t).sub(this.target),zt.applyQuaternion(this._quat),this._spherical.setFromVector3(zt),this.autoRotate&&this.state===Et.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=gn:i>Math.PI&&(i-=gn),s<-Math.PI?s+=gn:s>Math.PI&&(s-=gn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(zt.setFromSpherical(this._spherical),zt.applyQuaternion(this._quatInverse),t.copy(this.target).add(zt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=zt.length();a=this._clampDistance(o*this._scale);const l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const o=new V(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new V(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=zt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(So.origin.copy(this.object.position),So.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(So.direction))<DR?this.object.lookAt(this.target):(Jf.setFromNormalAndCoplanarPoint(this.object.up,this.target),So.intersectPlane(Jf,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Pc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Pc||this._lastTargetPosition.distanceToSquared(this.target)>Pc?(this.dispatchEvent(Zf),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?gn/60*this.autoRotateSpeed*e:gn/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){zt.setFromMatrixColumn(t,0),zt.multiplyScalar(-e),this._panOffset.add(zt)}_panUp(e,t){this.screenSpacePanning===!0?zt.setFromMatrixColumn(t,1):(zt.setFromMatrixColumn(t,0),zt.crossVectors(this.object.up,zt)),zt.multiplyScalar(e),this._panOffset.add(zt)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;zt.copy(s).sub(this.target);let r=zt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,a=i.width,o=i.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(gn*this._rotateDelta.x/t.clientHeight),this._rotateUp(gn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(gn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-gn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(gn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-gn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(gn*this._rotateDelta.x/t.clientHeight),this._rotateUp(gn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ee,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function LR(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function UR(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function NR(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Tg),this.state=Et.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function OR(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case dr.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=Et.DOLLY;break;case dr.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Et.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Et.ROTATE}break;case dr.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Et.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Et.PAN}break;default:this.state=Et.NONE}this.state!==Et.NONE&&this.dispatchEvent(Cd)}function FR(n){switch(this.state){case Et.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case Et.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case Et.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function kR(n){this.enabled===!1||this.enableZoom===!1||this.state!==Et.NONE||(n.preventDefault(),this.dispatchEvent(Cd),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(Tg))}function BR(n){this.enabled!==!1&&this._handleKeyDown(n)}function zR(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case ar.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=Et.TOUCH_ROTATE;break;case ar.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=Et.TOUCH_PAN;break;default:this.state=Et.NONE}break;case 2:switch(this.touches.TWO){case ar.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=Et.TOUCH_DOLLY_PAN;break;case ar.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=Et.TOUCH_DOLLY_ROTATE;break;default:this.state=Et.NONE}break;default:this.state=Et.NONE}this.state!==Et.NONE&&this.dispatchEvent(Cd)}function VR(n){switch(this._trackPointer(n),this.state){case Et.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case Et.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case Et.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case Et.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=Et.NONE}}function HR(n){this.enabled!==!1&&n.preventDefault()}function $R(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function GR(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const WR={class:"scene-hint"},XR=it({__name:"VolumePreview",props:{examination:{},findings:{default:()=>[]},activeFindingId:{default:null}},emits:["selectFinding"],setup(n,{emit:e}){const t=n,i=e,s=ze(null);let r=null,a=null,o=null,l=null,c=0,u=[],d=new Map,h=null;function f(w){const T=w.side==="right"?1:-1,R=w.location.includes("upper")?.55:w.location.includes("lower")?-.55:0;return new V(T*.55,R,0)}function b(){if(!a)return;const w=new Lr(2.15,2.15,2.15),T=new $E(w),R=new _f(T,new pg({color:10339781,transparent:!0,opacity:.34}));a.add(R);const U=new yt(new Es(2.1,2.1),new ra({color:4957094,side:Ln,transparent:!0,opacity:.16}));U.position.z=0,a.add(U);const M=new yt(new Es(2.1,2.1),new ra({color:5405631,side:Ln,transparent:!0,opacity:.12}));M.rotation.x=Math.PI/2,M.position.y=0,a.add(M);const C=new yt(new Es(2.1,2.1),new ra({color:12944943,side:Ln,transparent:!0,opacity:.1}));C.rotation.y=Math.PI/2,C.position.x=0,a.add(C);const F=new ji(.09,28,18);(t.findings??[]).forEach(B=>{const $=new mr({color:16731996,roughness:.3,emissive:16720435,emissiveIntensity:.45}),j=new yt(F,$);j.position.copy(f(B)),j.userData.findingId=B.id,a==null||a.add(j),u.push(j),d.set(B.id,j)})}function x(w){d.forEach((T,R)=>{const U=T.material;U.emissiveIntensity=R===w?1.1:.45,T.scale.setScalar(R===w?1.4:1)})}function y(w){if(!s.value)return null;const T=s.value.getBoundingClientRect();return new Ee((w.clientX-T.left)/T.width*2-1,-((w.clientY-T.top)/T.height)*2+1)}function g(w){if(!o)return;const T=y(w);if(!T)return;const R=new Ad;R.setFromCamera(T,o);const U=R.intersectObjects(u,!1);U[0]&&i("selectFinding",U[0].object.userData.findingId)}function A(){if(!s.value||!r||!o)return;const w=s.value.clientWidth,T=s.value.clientHeight;r.setSize(w,T),o.aspect=w/Math.max(1,T),o.updateProjectionMatrix()}function S(){c=requestAnimationFrame(S),l&&l.update(),r&&a&&o&&r.render(a,o)}function m(){if(!s.value)return;const w=s.value.clientWidth,T=s.value.clientHeight;r=new Rd({antialias:!0,alpha:!0}),r.setPixelRatio(Math.min(window.devicePixelRatio,2)),r.setSize(w,T),r.outputColorSpace=un,r.toneMapping=vl,s.value.appendChild(r.domElement),a=new bd,a.background=new rt(792345),o=new _n(38,w/Math.max(1,T),.1,100),o.position.set(2.4,2.1,3.2),a.add(new wd(15661047,6716284,1.8));const R=new xa(16777215,3);R.position.set(2,3,3),a.add(R),b(),x(t.activeFindingId),l=new Pd(o,r.domElement),l.enableDamping=!0,l.enablePan=!1,l.minDistance=2.5,l.maxDistance=7,l.target.set(0,0,0),l.update(),r.domElement.addEventListener("pointerdown",g),h=new ResizeObserver(A),h.observe(s.value),S()}return Bt(()=>t.activeFindingId,w=>x(w)),Bt(()=>t.findings,()=>{u.forEach(w=>a==null?void 0:a.remove(w)),d.clear(),u=[],b(),x(t.activeFindingId)},{deep:!0}),sn(m),ns(()=>{cancelAnimationFrame(c),h==null||h.disconnect(),r==null||r.domElement.removeEventListener("pointerdown",g),u.forEach(w=>{w.geometry.dispose(),w.material.dispose()}),a==null||a.traverse(w=>{(w instanceof yt||w instanceof _f)&&(w.geometry.dispose(),Array.isArray(w.material)?w.material.forEach(T=>T.dispose()):w.material.dispose())}),l==null||l.dispose(),r==null||r.dispose(),r==null||r.domElement.remove()}),(w,T)=>(Z(),de("div",{ref_key:"hostRef",ref:s,class:"volume-preview"},[_("span",WR,D(w.$t("3D volume preview")),1)],512))}}),qR=at(XR,[["__scopeId","data-v-8563fd6a"]]),YR={class:"slicer-viewer"},jR={class:"viewer-toolbar"},KR={class:"toolbar-left"},ZR={class:"modality-badge"},JR={class:"study-copy"},QR={key:0,class:"toolbar-center"},eC={class:"toolbar-label"},tC=["max","aria-label"],nC={class:"slice-count"},iC={class:"toolbar-right"},sC={class:"preset-select"},rC={class:"sr-only"},aC={value:"lung"},oC={value:"brain"},lC={value:"bone"},cC={value:"soft"},uC=["aria-label"],dC={class:"zoom-value"},hC=["aria-label"],fC=["aria-label"],pC=["aria-label"],mC={key:0,class:"viewport projection-viewport"},gC={class:"viewport-label"},vC={class:"viewport axial-viewport"},_C={class:"viewport-label"},yC={class:"viewport coronal-viewport"},bC={class:"viewport-label"},xC={class:"viewport sagittal-viewport"},SC={class:"viewport-label"},MC={class:"viewport volume-viewport"},EC={class:"viewport-label"},wC={key:0,class:"finding-strip"},AC=it({__name:"SlicerViewer",props:{examination:{},findings:{}},emits:["selectFinding"],setup(n,{emit:e}){const t=n,i=e,s=ze(Math.max(1,Math.ceil(t.examination.sliceCount/2))),r=ze(t.examination.type==="MRI"?"brain":"lung"),a=ze(!0),o=ze(1),l=ze(null),c=Me(()=>t.examination.type==="X-Ray"),u=Me(()=>t.findings??[]),d=Me(()=>u.value.find(f=>f.id===l.value)??null);Bt(()=>t.examination.id,()=>{var f;s.value=Math.max(1,Math.ceil(t.examination.sliceCount/2)),r.value=t.examination.type==="MRI"?"brain":"lung",l.value=((f=u.value[0])==null?void 0:f.id)??null},{immediate:!0}),Bt(u,f=>{var b;f.some(x=>x.id===l.value)||(l.value=((b=f[0])==null?void 0:b.id)??null)},{immediate:!0});function h(f){o.value=Math.min(2.5,Math.max(1,Number((o.value+f).toFixed(1))))}return(f,b)=>(Z(),de("div",YR,[_("div",jR,[_("div",KR,[_("span",ZR,[ne(J(xr),{size:14}),ot(" "+D(f.$t(n.examination.type)),1)]),_("div",JR,[_("strong",null,D(f.$t(n.examination.organ))+" · "+D(f.$t(n.examination.bodyPart)),1),_("span",null,D(f.$t(c.value?"Projection viewer":"Multiplanar reconstruction")),1)])]),c.value?tt("",!0):(Z(),de("div",QR,[_("span",eC,D(f.$t("Slice")),1),Nt(_("input",{"onUpdate:modelValue":b[0]||(b[0]=x=>s.value=x),type:"range",min:1,max:n.examination.sliceCount,step:"1","aria-label":f.$t("Slice position")},null,8,tC),[[Wi,s.value,void 0,{number:!0}]]),_("span",nC,D(f.$t(s.value))+" / "+D(f.$t(n.examination.sliceCount)),1)])),_("div",iC,[_("label",sC,[_("span",rC,D(f.$t("Window preset")),1),Nt(_("select",{"onUpdate:modelValue":b[1]||(b[1]=x=>r.value=x),class:"select"},[_("option",aC,D(f.$t("Lung")),1),_("option",oC,D(f.$t("Brain")),1),_("option",lC,D(f.$t("Bone")),1),_("option",cC,D(f.$t("Soft tissue")),1)],512),[[Mn,r.value]])]),_("button",{type:"button",class:"viewer-button","aria-label":f.$t("Zoom out"),onClick:b[2]||(b[2]=x=>h(-.2))},[ne(J(od),{size:15})],8,uC),_("span",dC,D(f.$t(Math.round(o.value*100)))+"%",1),_("button",{type:"button",class:"viewer-button","aria-label":f.$t("Zoom in"),onClick:b[3]||(b[3]=x=>h(.2))},[ne(J(ld),{size:15})],8,hC),_("button",{type:"button",class:"viewer-button","aria-label":f.$t("Reset zoom"),onClick:b[4]||(b[4]=x=>o.value=1)},[ne(J(ad),{size:15})],8,fC),_("button",{type:"button",class:Yt(["viewer-button",{active:a.value}]),"aria-label":f.$t("Toggle grid"),onClick:b[5]||(b[5]=x=>a.value=!a.value)},[ne(J(Fy),{size:15})],10,pC)])]),_("div",{class:Yt(["viewer-grid",{projection:c.value}])},[c.value?(Z(),de("div",mC,[_("div",gC,D(f.$t("X-Ray Projection")),1),ne(Ga,{modality:"X-Ray",orientation:"projection","slice-index":1,"slice-count":1,preset:r.value,"show-grid":a.value,findings:[],zoom:o.value},null,8,["preset","show-grid","zoom"])])):(Z(),de(lt,{key:1},[_("div",vC,[_("div",_C,D(f.$t("Axial")),1),ne(Ga,{modality:n.examination.type,orientation:"axial","slice-index":s.value,"slice-count":n.examination.sliceCount,preset:r.value,"show-grid":a.value,findings:u.value,"active-finding-id":l.value,zoom:o.value,onSelectFinding:b[6]||(b[6]=x=>{l.value=x,i("selectFinding",x)})},null,8,["modality","slice-index","slice-count","preset","show-grid","findings","active-finding-id","zoom"])]),_("div",yC,[_("div",bC,D(f.$t("Coronal")),1),ne(Ga,{modality:n.examination.type,orientation:"coronal","slice-index":s.value,"slice-count":n.examination.sliceCount,preset:r.value,"show-grid":a.value,findings:u.value,"active-finding-id":l.value,zoom:o.value,onSelectFinding:b[7]||(b[7]=x=>{l.value=x,i("selectFinding",x)})},null,8,["modality","slice-index","slice-count","preset","show-grid","findings","active-finding-id","zoom"])]),_("div",xC,[_("div",SC,D(f.$t("Sagittal")),1),ne(Ga,{modality:n.examination.type,orientation:"sagittal","slice-index":s.value,"slice-count":n.examination.sliceCount,preset:r.value,"show-grid":a.value,findings:u.value,"active-finding-id":l.value,zoom:o.value,onSelectFinding:b[8]||(b[8]=x=>{l.value=x,i("selectFinding",x)})},null,8,["modality","slice-index","slice-count","preset","show-grid","findings","active-finding-id","zoom"])]),_("div",MC,[_("div",EC,D(f.$t("3D Volume")),1),ne(qR,{examination:n.examination,findings:u.value,"active-finding-id":l.value,onSelectFinding:b[9]||(b[9]=x=>{l.value=x,i("selectFinding",x)})},null,8,["examination","findings","active-finding-id"])])],64))],2),d.value&&!c.value?(Z(),de("div",wC,[b[10]||(b[10]=_("span",{class:"finding-dot"},null,-1)),_("strong",null,D(f.$t(d.value.label)),1),_("span",null,D(f.$t(d.value.side))+" "+D(f.$t(d.value.location.replaceAll("_"," "))),1)])):tt("",!0)]))}}),TC=at(AC,[["__scopeId","data-v-7895c953"]]),RC={class:"finding-panel"},CC={class:"panel-kicker"},PC={class:"panel-heading"},IC={class:"panel-description"},DC={class:"panel-actions"},LC=it({__name:"FindingPanel",props:{finding:{},hasReport:{type:Boolean}},emits:["viewCt","viewReport"],setup(n,{emit:e}){const t=e;return(i,s)=>(Z(),de("aside",RC,[_("div",CC,D(i.$t("AI Finding Marker")),1),_("div",PC,[_("div",null,[_("h3",null,D(i.$t(n.finding.label)),1),_("p",null,D(i.$t(n.finding.side))+" "+D(i.$t(n.finding.location.replaceAll("_"," "))),1)]),ne(Ca,{level:n.finding.severity},null,8,["level"])]),_("p",IC,D(i.$t(n.finding.description)),1),_("div",DC,[_("button",{type:"button",class:"btn btn-primary",onClick:s[0]||(s[0]=r=>t("viewCt"))},[ne(J(ad),{size:16}),ot(" "+D(i.$t("View CT")),1)]),n.hasReport?(Z(),de("button",{key:0,type:"button",class:"btn btn-secondary",onClick:s[1]||(s[1]=r=>t("viewReport"))},[ne(J(As),{size:16}),ot(" "+D(i.$t("View Report")),1)])):tt("",!0)])]))}}),Rg=at(LC,[["__scopeId","data-v-561f08b7"]]);var KL=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function UC(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}function NC(n){if(Object.prototype.hasOwnProperty.call(n,"__esModule"))return n;var e=n.default;if(typeof e=="function"){var t=function i(){return this instanceof i?Reflect.construct(e,arguments,this.constructor):e.apply(this,arguments)};t.prototype=e.prototype}else t={};return Object.defineProperty(t,"__esModule",{value:!0}),Object.keys(n).forEach(function(i){var s=Object.getOwnPropertyDescriptor(n,i);Object.defineProperty(t,i,s.get?s:{enumerable:!0,get:function(){return n[i]}})}),t}var Do={exports:{}};const OC={},FC=Object.freeze(Object.defineProperty({__proto__:null,default:OC},Symbol.toStringTag,{value:"Module"})),kC=NC(FC);/*! dicom-parser - 1.8.12 - 2023-02-20 | (c) 2017 Chris Hafey | https://github.com/cornerstonejs/dicomParser */var BC=Do.exports,Qf;function zC(){return Qf||(Qf=1,(function(n,e){(function(t,i){n.exports=i(kC)})(BC,function(t){return s=[function(a,o){a.exports=t},function(a,o,l){l.r(o),l.d(o,"isStringVr",function(){return u}),l.d(o,"isPrivateTag",function(){return d}),l.d(o,"parsePN",function(){return h}),l.d(o,"parseTM",function(){return f}),l.d(o,"parseDA",function(){return x}),l.d(o,"explicitElementToString",function(){return y}),l.d(o,"explicitDataSetToJS",function(){return g}),l.d(o,"createJPEGBasicOffsetTable",function(){return m}),l.d(o,"parseDicomDataSetExplicit",function(){return Ve}),l.d(o,"parseDicomDataSetImplicit",function(){return st}),l.d(o,"readFixedString",function(){return U}),l.d(o,"alloc",function(){return fe}),l.d(o,"version",function(){return xe}),l.d(o,"bigEndianByteArrayParser",function(){return Te}),l.d(o,"ByteStream",function(){return he}),l.d(o,"sharedCopy",function(){return H}),l.d(o,"DataSet",function(){return F}),l.d(o,"findAndSetUNElementLength",function(){return R}),l.d(o,"findEndOfEncapsulatedElement",function(){return T}),l.d(o,"findItemDelimitationItemAndSetElementLength",function(){return G}),l.d(o,"littleEndianByteArrayParser",function(){return ye}),l.d(o,"parseDicom",function(){return z}),l.d(o,"readDicomElementExplicit",function(){return De}),l.d(o,"readDicomElementImplicit",function(){return $}),l.d(o,"readEncapsulatedImageFrame",function(){return ce}),l.d(o,"readEncapsulatedPixelData",function(){return ae}),l.d(o,"readEncapsulatedPixelDataFromFragments",function(){return le}),l.d(o,"readPart10Header",function(){return Be}),l.d(o,"readSequenceItemsExplicit",function(){return Se}),l.d(o,"readSequenceItemsImplicit",function(){return re}),l.d(o,"readSequenceItem",function(){return j}),l.d(o,"readTag",function(){return w});var c={AE:!0,AS:!0,AT:!1,CS:!0,DA:!0,DS:!0,DT:!0,FL:!1,FD:!1,IS:!0,LO:!0,LT:!0,OB:!1,OD:!1,OF:!1,OW:!1,PN:!0,SH:!0,SL:!1,SQ:!1,SS:!1,ST:!0,TM:!0,UI:!0,UL:!1,UN:void 0,UR:!0,US:!1,UT:!0},u=function(p){return c[p]},d=function(p){if(p=parseInt(p[4],16),isNaN(p))throw"dicomParser.isPrivateTag: cannot parse last character of group";return p%2==1},h=function(p){if(p!==void 0)return p=p.split("^"),{familyName:p[0],givenName:p[1],middleName:p[2],prefix:p[3],suffix:p[4]}};function f(p,v){if(2<=p.length){var P=parseInt(p.substring(0,2),10),E=4<=p.length?parseInt(p.substring(2,4),10):void 0,N=6<=p.length?parseInt(p.substring(4,6),10):void 0,k=8<=p.length?p.substring(7,13):void 0,k=k?parseInt(k,10)*Math.pow(10,6-k.length):void 0;if(v&&(isNaN(P)||E!==void 0&&isNaN(E)||N!==void 0&&isNaN(N)||k!==void 0&&isNaN(k)||P<0||23<P||E&&(E<0||59<E)||N&&(N<0||59<N)||k&&(k<0||999999<k)))throw"invalid TM '".concat(p,"'");return{hours:P,minutes:E,seconds:N,fractionalSeconds:k}}if(v)throw"invalid TM '".concat(p,"'")}function b(p,v,P){return!isNaN(P)&&0<v&&v<=12&&0<p&&p<=(function(E,N){switch(E){case 2:return N%4==0&&N%100||N%400==0?29:28;case 9:case 4:case 6:case 11:return 30;default:return 31}})(v,P)}function x(p,v){if(p&&p.length===8){var P=parseInt(p.substring(0,4),10),E=parseInt(p.substring(4,6),10),N=parseInt(p.substring(6,8),10);if(v&&b(N,E,P)!==!0)throw"invalid DA '".concat(p,"'");return{year:P,month:E,day:N}}if(v)throw"invalid DA '".concat(p,"'")}function y(p,v){if(p===void 0||v===void 0)throw"dicomParser.explicitElementToString: missing required parameters";if(v.vr===void 0)throw"dicomParser.explicitElementToString: cannot convert implicit element to string";var P,E=v.vr,N=v.tag;function k(oe,ge){for(var Fe="",pe=0;pe<oe;pe++)pe!==0&&(Fe+="/"),Fe+=ge.call(p,N,pe).toString();return Fe}if(u(E)===!0)P=p.string(N);else{if(E==="AT"){var ee=p.uint32(N);return ee===void 0?void 0:"x".concat((ee=ee<0?4294967295+ee+1:ee).toString(16).toUpperCase())}E==="US"?P=k(v.length/2,p.uint16):E==="SS"?P=k(v.length/2,p.int16):E==="UL"?P=k(v.length/4,p.uint32):E==="SL"?P=k(v.length/4,p.int32):E==="FD"?P=k(v.length/8,p.double):E==="FL"&&(P=k(v.length/4,p.float))}return P}function g(p,v){if(p===void 0)throw"dicomParser.explicitDataSetToJS: missing required parameter dataSet";v=v||{omitPrivateAttibutes:!0,maxElementLength:128};var P,E={};for(P in p.elements){var N=p.elements[P];if(v.omitPrivateAttibutes!==!0||!d(P))if(N.items){for(var k=[],ee=0;ee<N.items.length;ee++)k.push(g(N.items[ee].dataSet,v));E[P]=k}else{var oe=void 0;N.length<v.maxElementLength&&(oe=y(p,N)),E[P]=oe!==void 0?oe:{dataOffset:N.dataOffset,length:N.length}}}return E}function A(p,v){return p.byteArray[v]===255&&p.byteArray[v+1]===217}function S(p,v,P){for(var E,N,k=P;k<v.fragments.length;k++)if(E=p,N=k,N=v.fragments[N],!(!A(E,N.position+N.length-2)&&!A(E,N.position+N.length-3)))return k}function m(p,v,P){if(p===void 0)throw"dicomParser.createJPEGBasicOffsetTable: missing required parameter dataSet";if(v===void 0)throw"dicomParser.createJPEGBasicOffsetTable: missing required parameter pixelDataElement";if(v.tag!=="x7fe00010")throw"dicomParser.createJPEGBasicOffsetTable: parameter 'pixelDataElement' refers to non pixel data tag (expected tag = x7fe00010'";if(v.encapsulatedPixelData!==!0||v.hadUndefinedLength!==!0||v.basicOffsetTable===void 0||v.fragments===void 0||v.fragments.length<=0)throw"dicomParser.createJPEGBasicOffsetTable: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data";if(P&&P.length<=0)throw"dicomParser.createJPEGBasicOffsetTable: parameter 'fragments' must not be zero length";P=P||v.fragments;for(var E=[],N=0;;){E.push(v.fragments[N].offset);var k=S(p,v,N);if(k===void 0||k===v.fragments.length-1)return E;N=k+1}}function w(P){if(P===void 0)throw"dicomParser.readTag: missing required parameter 'byteStream'";var v=256*P.readUint16()*256,P=P.readUint16();return"x".concat("00000000".concat((v+P).toString(16)).substr(-8))}function T(p,v,P){if(p===void 0)throw"dicomParser.findEndOfEncapsulatedElement: missing required parameter 'byteStream'";if(v===void 0)throw"dicomParser.findEndOfEncapsulatedElement: missing required parameter 'element'";if(v.encapsulatedPixelData=!0,v.basicOffsetTable=[],v.fragments=[],w(p)!=="xfffee000")throw"dicomParser.findEndOfEncapsulatedElement: basic offset table not found";for(var E=p.readUint32()/4,N=0;N<E;N++){var k=p.readUint32();v.basicOffsetTable.push(k)}for(var ee=p.position;p.position<p.byteArray.length;){var oe=w(p),ge=p.readUint32();if(oe==="xfffee0dd")return p.seek(ge),void(v.length=p.position-v.dataOffset);if(oe!=="xfffee000")return P&&P.push("unexpected tag ".concat(oe," while searching for end of pixel data element with undefined length")),ge>p.byteArray.length-p.position&&(ge=p.byteArray.length-p.position),v.fragments.push({offset:p.position-ee-8,position:p.position,length:ge}),p.seek(ge),void(v.length=p.position-v.dataOffset);v.fragments.push({offset:p.position-ee-8,position:p.position,length:ge}),p.seek(ge)}P&&P.push("pixel data element ".concat(v.tag," missing sequence delimiter tag xfffee0dd"))}function R(p,v){if(p===void 0)throw"dicomParser.findAndSetUNElementLength: missing required parameter 'byteStream'";for(var P=p.byteArray.length-8;p.position<=P;)if(p.readUint16()===65534){var E=p.readUint16();if(E===57565)return p.readUint32()!==0&&p.warnings("encountered non zero length following item delimiter at position ".concat(p.position-4," while reading element of undefined length with tag ").concat(v.tag)),void(v.length=p.position-v.dataOffset)}v.length=p.byteArray.length-v.dataOffset,p.seek(p.byteArray.length-p.position)}function U(p,v,P){if(P<0)throw"dicomParser.readFixedString - length cannot be less than 0";if(v+P>p.length)throw"dicomParser.readFixedString: attempt to read past end of buffer";for(var E,N="",k=0;k<P;k++){if((E=p[v+k])===0)return v+=P,N;N+=String.fromCharCode(E)}return N}function M(p,v){for(var P=0;P<v.length;P++){var E=v[P];E.enumerable=E.enumerable||!1,E.configurable=!0,"value"in E&&(E.writable=!0),Object.defineProperty(p,E.key,E)}}function C(p,v){return p.parser!==void 0?p.parser:v}var F=(function(){function p(E,N,k){(function(ee,oe){if(!(ee instanceof oe))throw new TypeError("Cannot call a class as a function")})(this,p),this.byteArrayParser=E,this.byteArray=N,this.elements=k}var v,P;return v=p,(P=[{key:"uint16",value:function(E,N){if(E=this.elements[E],N=N!==void 0?N:0,E&&E.length!==0)return C(E,this.byteArrayParser).readUint16(this.byteArray,E.dataOffset+2*N)}},{key:"int16",value:function(E,N){if(E=this.elements[E],N=N!==void 0?N:0,E&&E.length!==0)return C(E,this.byteArrayParser).readInt16(this.byteArray,E.dataOffset+2*N)}},{key:"uint32",value:function(E,N){if(E=this.elements[E],N=N!==void 0?N:0,E&&E.length!==0)return C(E,this.byteArrayParser).readUint32(this.byteArray,E.dataOffset+4*N)}},{key:"int32",value:function(E,N){if(E=this.elements[E],N=N!==void 0?N:0,E&&E.length!==0)return C(E,this.byteArrayParser).readInt32(this.byteArray,E.dataOffset+4*N)}},{key:"float",value:function(E,N){if(E=this.elements[E],N=N!==void 0?N:0,E&&E.length!==0)return C(E,this.byteArrayParser).readFloat(this.byteArray,E.dataOffset+4*N)}},{key:"double",value:function(E,N){if(E=this.elements[E],N=N!==void 0?N:0,E&&E.length!==0)return C(E,this.byteArrayParser).readDouble(this.byteArray,E.dataOffset+8*N)}},{key:"numStringValues",value:function(E){if(E=this.elements[E],E&&0<E.length)return E=U(this.byteArray,E.dataOffset,E.length).match(/\\/g),E===null?1:E.length+1}},{key:"string",value:function(E,N){if(E=this.elements[E],E&&E.Value)return E.Value;if(E&&0<E.length)return E=U(this.byteArray,E.dataOffset,E.length),0<=N?E.split("\\")[N].trim():E.trim()}},{key:"text",value:function(E,N){if(E=this.elements[E],E&&0<E.length)return E=U(this.byteArray,E.dataOffset,E.length),0<=N?E.split("\\")[N].replace(/ +$/,""):E.replace(/ +$/,"")}},{key:"floatString",value:function(E,N){var k=this.elements[E];if(k&&0<k.length&&(N=this.string(E,N=N!==void 0?N:0),N!==void 0))return parseFloat(N)}},{key:"intString",value:function(E,N){var k=this.elements[E];if(k&&0<k.length&&(N=this.string(E,N=N!==void 0?N:0),N!==void 0))return parseInt(N)}},{key:"attributeTag",value:function(E){var N=this.elements[E];if(N&&N.length===4){var k=C(N,this.byteArrayParser).readUint16,E=this.byteArray,N=N.dataOffset;return"x".concat("00000000".concat((256*k(E,N)*256+k(E,N+2)).toString(16)).substr(-8))}}}])&&M(v.prototype,P),Object.defineProperty(v,"prototype",{writable:!1}),p})();function G(p,v){if(p===void 0)throw"dicomParser.readDicomElementImplicit: missing required parameter 'byteStream'";for(var P=p.byteArray.length-8;p.position<=P;)if(p.readUint16()===65534){var E=p.readUint16();if(E===57357)return p.readUint32()!==0&&p.warnings("encountered non zero length following item delimiter at position ".concat(p.position-4," while reading element of undefined length with tag ").concat(v.tag)),void(v.length=p.position-v.dataOffset)}v.length=p.byteArray.length-v.dataOffset,p.seek(p.byteArray.length-p.position)}var B=function(p,v){return p.vr!==void 0?p.vr==="SQ":v.position+4<=v.byteArray.length?(p=w(v),v.seek(-4),p==="xfffee000"||p==="xfffee0dd"):(v.warnings.push("eof encountered before finding sequence item tag or sequence delimiter tag in peeking to determine VR"),!1)};function $(p,v,P){if(p===void 0)throw"dicomParser.readDicomElementImplicit: missing required parameter 'byteStream'";var E=w(p),E={tag:E,vr:P!==void 0?P(E):void 0,length:p.readUint32(),dataOffset:p.position};return E.length===4294967295&&(E.hadUndefinedLength=!0),E.tag===v||(!B(E,p)||d(E.tag)&&!E.hadUndefinedLength?E.hadUndefinedLength?G(p,E):p.seek(E.length):(re(p,E,P),d(E.tag)&&(E.items=void 0))),E}function j(p){if(p===void 0)throw"dicomParser.readSequenceItem: missing required parameter 'byteStream'";var v={tag:w(p),length:p.readUint32(),dataOffset:p.position};if(v.tag!=="xfffee000")throw"dicomParser.readSequenceItem: item tag (FFFE,E000) not found at offset ".concat(p.position);return v}function Y(p,v){var P=j(p);return P.length===4294967295?(P.hadUndefinedLength=!0,P.dataSet=(function(E,N){for(var k={};E.position<E.byteArray.length;){var ee=$(E,void 0,N);if((k[ee.tag]=ee).tag==="xfffee00d")return new F(E.byteArrayParser,E.byteArray,k)}return E.warnings.push("eof encountered before finding sequence item delimiter in sequence item of undefined length"),new F(E.byteArrayParser,E.byteArray,k)})(p,v),P.length=p.position-P.dataOffset):(P.dataSet=new F(p.byteArrayParser,p.byteArray,{}),st(P.dataSet,p,p.position+P.length,{vrCallback:v})),P}function re(p,v,P){if(p===void 0)throw"dicomParser.readSequenceItemsImplicit: missing required parameter 'byteStream'";if(v===void 0)throw"dicomParser.readSequenceItemsImplicit: missing required parameter 'element'";v.items=[],(v.length===4294967295?function(E,N,k){for(;E.position+4<=E.byteArray.length;){var ee=w(E);if(E.seek(-4),ee==="xfffee0dd")return N.length=E.position-N.dataOffset,E.seek(8);ee=Y(E,k),N.items.push(ee)}E.warnings.push("eof encountered before finding sequence delimiter in sequence of undefined length"),N.length=E.byteArray.length-N.dataOffset}:function(E,N,k){for(var ee=N.dataOffset+N.length;E.position<ee;){var oe=Y(E,k);N.items.push(oe)}})(p,v,P)}function K(p,v){var P=j(p);return P.length===4294967295?(P.hadUndefinedLength=!0,P.dataSet=(function(E,N){for(var k={};E.position<E.byteArray.length;){var ee=De(E,N);if((k[ee.tag]=ee).tag==="xfffee00d")return new F(E.byteArrayParser,E.byteArray,k)}return N.push("eof encountered before finding item delimiter tag while reading sequence item of undefined length"),new F(E.byteArrayParser,E.byteArray,k)})(p,v),P.length=p.position-P.dataOffset):(P.dataSet=new F(p.byteArrayParser,p.byteArray,{}),Ve(P.dataSet,p,p.position+P.length)),P}function Se(p,v,P){if(p===void 0)throw"dicomParser.readSequenceItemsExplicit: missing required parameter 'byteStream'";if(v===void 0)throw"dicomParser.readSequenceItemsExplicit: missing required parameter 'element'";v.items=[],(v.length===4294967295?function(E,N,k){for(;E.position+4<=E.byteArray.length;){var ee=w(E);if(E.seek(-4),ee==="xfffee0dd")return N.length=E.position-N.dataOffset,E.seek(8);ee=K(E,k),N.items.push(ee)}k.push("eof encountered before finding sequence delimitation tag while reading sequence of undefined length"),N.length=E.position-N.dataOffset}:function(E,N,k){for(var ee=N.dataOffset+N.length;E.position<ee;){var oe=K(E,k);N.items.push(oe)}})(p,v,P)}var Re=function(p){return p==="OB"||p==="OD"||p==="OL"||p==="OW"||p==="SQ"||p==="OF"||p==="UC"||p==="UR"||p==="UT"||p==="UN"?4:2};function De(p,v,P){if(p===void 0)throw"dicomParser.readDicomElementExplicit: missing required parameter 'byteStream'";var E={tag:w(p),vr:p.readFixedString(2)};return Re(E.vr)===2?E.length=p.readUint16():(p.seek(2),E.length=p.readUint32()),E.dataOffset=p.position,E.length===4294967295&&(E.hadUndefinedLength=!0),E.tag===P||(E.vr==="SQ"?Se(p,E,v):E.length===4294967295?E.tag==="x7fe00010"?T(p,E,v):(E.vr==="UN"?re:G)(p,E):p.seek(E.length)),E}function Ve(p,v,P){var E=3<arguments.length&&arguments[3]!==void 0?arguments[3]:{};if(P=P===void 0?v.byteArray.length:P,v===void 0)throw"dicomParser.parseDicomDataSetExplicit: missing required parameter 'byteStream'";if(P<v.position||P>v.byteArray.length)throw"dicomParser.parseDicomDataSetExplicit: invalid value for parameter 'maxP osition'";for(var N=p.elements;v.position<P;){var k=De(v,p.warnings,E.untilTag);if((N[k.tag]=k).tag===E.untilTag)return}if(v.position>P)throw"dicomParser:parseDicomDataSetExplicit: buffer overrun"}function st(p,v,P){var E=3<arguments.length&&arguments[3]!==void 0?arguments[3]:{};if(P=P===void 0?p.byteArray.length:P,v===void 0)throw"dicomParser.parseDicomDataSetImplicit: missing required parameter 'byteStream'";if(P<v.position||P>v.byteArray.length)throw"dicomParser.parseDicomDataSetImplicit: invalid value for parameter 'maxPosition'";for(var N=p.elements;v.position<P;){var k=$(v,E.untilTag,E.vrCallback);if((N[k.tag]=k).tag===E.untilTag)return}}function fe(p,v){if(typeof Buffer<"u"&&p instanceof Buffer)return Buffer.alloc(v);if(p instanceof Uint8Array)return new Uint8Array(v);throw"dicomParser.alloc: unknown type for byteArray"}var xe="1.8.12",Te={readUint16:function(p,v){if(v<0)throw"bigEndianByteArrayParser.readUint16: position cannot be less than 0";if(v+2>p.length)throw"bigEndianByteArrayParser.readUint16: attempt to read past end of buffer";return(p[v]<<8)+p[v+1]},readInt16:function(p,v){if(v<0)throw"bigEndianByteArrayParser.readInt16: position cannot be less than 0";if(v+2>p.length)throw"bigEndianByteArrayParser.readInt16: attempt to read past end of buffer";return v=(p[v]<<8)+p[v+1],v=32768&v?v-65535-1:v},readUint32:function(p,v){if(v<0)throw"bigEndianByteArrayParser.readUint32: position cannot be less than 0";if(v+4>p.length)throw"bigEndianByteArrayParser.readUint32: attempt to read past end of buffer";return 256*(256*(256*p[v]+p[v+1])+p[v+2])+p[v+3]},readInt32:function(p,v){if(v<0)throw"bigEndianByteArrayParser.readInt32: position cannot be less than 0";if(v+4>p.length)throw"bigEndianByteArrayParser.readInt32: attempt to read past end of buffer";return(p[v]<<24)+(p[v+1]<<16)+(p[v+2]<<8)+p[v+3]},readFloat:function(p,v){if(v<0)throw"bigEndianByteArrayParser.readFloat: position cannot be less than 0";if(v+4>p.length)throw"bigEndianByteArrayParser.readFloat: attempt to read past end of buffer";var P=new Uint8Array(4);return P[3]=p[v],P[2]=p[v+1],P[1]=p[v+2],P[0]=p[v+3],new Float32Array(P.buffer)[0]},readDouble:function(p,v){if(v<0)throw"bigEndianByteArrayParser.readDouble: position cannot be less than 0";if(v+8>p.length)throw"bigEndianByteArrayParser.readDouble: attempt to read past end of buffer";var P=new Uint8Array(8);return P[7]=p[v],P[6]=p[v+1],P[5]=p[v+2],P[4]=p[v+3],P[3]=p[v+4],P[2]=p[v+5],P[1]=p[v+6],P[0]=p[v+7],new Float64Array(P.buffer)[0]}};function H(p,v,P){if(typeof Buffer<"u"&&p instanceof Buffer)return p.slice(v,v+P);if(p instanceof Uint8Array)return new Uint8Array(p.buffer,p.byteOffset+v,P);throw"dicomParser.from: unknown type for byteArray"}function me(p,v){for(var P=0;P<v.length;P++){var E=v[P];E.enumerable=E.enumerable||!1,E.configurable=!0,"value"in E&&(E.writable=!0),Object.defineProperty(p,E.key,E)}}var he=(function(){function p(E,N,k){if((function(ee,oe){if(!(ee instanceof oe))throw new TypeError("Cannot call a class as a function")})(this,p),E===void 0)throw"dicomParser.ByteStream: missing required parameter 'byteArrayParser'";if(N===void 0)throw"dicomParser.ByteStream: missing required parameter 'byteArray'";if(!(N instanceof Uint8Array)&&(typeof Buffer>"u"||!(N instanceof Buffer)))throw"dicomParser.ByteStream: parameter byteArray is not of type Uint8Array or Buffer";if(k<0)throw"dicomParser.ByteStream: parameter 'position' cannot be less than 0";if(k>=N.length)throw"dicomParser.ByteStream: parameter 'position' cannot be greater than or equal to 'byteArray' length";this.byteArrayParser=E,this.byteArray=N,this.position=k||0,this.warnings=[]}var v,P;return v=p,(P=[{key:"seek",value:function(E){if(this.position+E<0)throw"dicomParser.ByteStream.prototype.seek: cannot seek to position < 0";this.position+=E}},{key:"readByteStream",value:function(E){if(this.position+E>this.byteArray.length)throw"dicomParser.ByteStream.prototype.readByteStream: readByteStream - buffer overread";var N=H(this.byteArray,this.position,E);return this.position+=E,new p(this.byteArrayParser,N)}},{key:"getSize",value:function(){return this.byteArray.length}},{key:"readUint16",value:function(){var E=this.byteArrayParser.readUint16(this.byteArray,this.position);return this.position+=2,E}},{key:"readUint32",value:function(){var E=this.byteArrayParser.readUint32(this.byteArray,this.position);return this.position+=4,E}},{key:"readFixedString",value:function(E){var N=U(this.byteArray,this.position,E);return this.position+=E,N}}])&&me(v.prototype,P),Object.defineProperty(v,"prototype",{writable:!1}),p})(),ye={readUint16:function(p,v){if(v<0)throw"littleEndianByteArrayParser.readUint16: position cannot be less than 0";if(v+2>p.length)throw"littleEndianByteArrayParser.readUint16: attempt to read past end of buffer";return p[v]+256*p[v+1]},readInt16:function(p,v){if(v<0)throw"littleEndianByteArrayParser.readInt16: position cannot be less than 0";if(v+2>p.length)throw"littleEndianByteArrayParser.readInt16: attempt to read past end of buffer";return v=p[v]+(p[v+1]<<8),v=32768&v?v-65535-1:v},readUint32:function(p,v){if(v<0)throw"littleEndianByteArrayParser.readUint32: position cannot be less than 0";if(v+4>p.length)throw"littleEndianByteArrayParser.readUint32: attempt to read past end of buffer";return p[v]+256*p[v+1]+256*p[v+2]*256+256*p[v+3]*256*256},readInt32:function(p,v){if(v<0)throw"littleEndianByteArrayParser.readInt32: position cannot be less than 0";if(v+4>p.length)throw"littleEndianByteArrayParser.readInt32: attempt to read past end of buffer";return p[v]+(p[v+1]<<8)+(p[v+2]<<16)+(p[v+3]<<24)},readFloat:function(p,v){if(v<0)throw"littleEndianByteArrayParser.readFloat: position cannot be less than 0";if(v+4>p.length)throw"littleEndianByteArrayParser.readFloat: attempt to read past end of buffer";var P=new Uint8Array(4);return P[0]=p[v],P[1]=p[v+1],P[2]=p[v+2],P[3]=p[v+3],new Float32Array(P.buffer)[0]},readDouble:function(p,v){if(v<0)throw"littleEndianByteArrayParser.readDouble: position cannot be less than 0";if(v+8>p.length)throw"littleEndianByteArrayParser.readDouble: attempt to read past end of buffer";var P=new Uint8Array(8);return P[0]=p[v],P[1]=p[v+1],P[2]=p[v+2],P[3]=p[v+3],P[4]=p[v+4],P[5]=p[v+5],P[6]=p[v+6],P[7]=p[v+7],new Float64Array(P.buffer)[0]}};function Be(p){var v=1<arguments.length&&arguments[1]!==void 0?arguments[1]:{};if(p===void 0)throw"dicomParser.readPart10Header: missing required parameter 'byteArray'";var P=v.TransferSyntaxUID,E=new he(ye,p);return(function(){var N=(function(){if(E.getSize()<=132&&P)return!1;if(E.seek(128),E.readFixedString(4)==="DICM")return!0;if(!(v||{}).TransferSyntaxUID)throw"dicomParser.readPart10Header: DICM prefix not found at location 132 - this is not a valid DICOM P10 file.";return E.seek(0),!1})(),k=[],ee={};if(!N)return E.position=0,{elements:{x00020010:{tag:"x00020010",vr:"UI",Value:P}},warnings:k};for(;E.position<E.byteArray.length;){var oe=E.position,ge=De(E,k);if("x0002ffff"<ge.tag){E.position=oe;break}ge.parser=ye,ee[ge.tag]=ge}return(N=new F(E.byteArrayParser,E.byteArray,ee)).warnings=E.warnings,N.position=E.position,N})()}var O="1.2.840.10008.1.2.2";function z(p){var v=1<arguments.length&&arguments[1]!==void 0?arguments[1]:{};if(p===void 0)throw new Error("dicomParser.parseDicom: missing required parameter 'byteArray'");var P,E=function(k){if(k.elements.x00020010===void 0)throw new Error("dicomParser.parseDicom: missing required meta header attribute 0002,0010");return k=k.elements.x00020010,k&&k.Value||U(p,k.dataOffset,k.length)};function N(ge){var oe=E(ge),ee=oe!=="1.2.840.10008.1.2",oe=(function(Fe,pe){var we=Object.prototype.toString.call(typeof process<"u"?process:0)==="[object process]";if(Fe!=="1.2.840.10008.1.2.1.99")return new he(Fe===O?Te:ye,p,pe);if(v&&v.inflater)return Fe=v.inflater(p,pe),new he(ye,Fe,0);if(we==!0){var Ne=l(0),He=H(p,pe,p.length-pe),Ne=Ne.inflateRawSync(He),He=fe(p,Ne.length+pe);return p.copy(He,0,0,pe),Ne.copy(He,pe),new he(ye,He,0)}if(typeof pako>"u")throw"dicomParser.parseDicom: no inflater available to handle deflate transfer syntax";return Ne=p.slice(pe),He=pako.inflateRaw(Ne),(Ne=fe(p,He.length+pe)).set(p.slice(0,pe),0),Ne.set(He,pe),new he(ye,Ne,0)})(oe,ge.position),ge=new F(oe.byteArrayParser,oe.byteArray,{});ge.warnings=oe.warnings;try{(ee?Ve:st)(ge,oe,oe.byteArray.length,v)}catch(Fe){throw{exception:Fe,dataSet:ge}}return ge}return(function(k,ee){for(var oe in k.elements)k.elements.hasOwnProperty(oe)&&(ee.elements[oe]=k.elements[oe]);return k.warnings!==void 0&&(ee.warnings=k.warnings.concat(ee.warnings)),ee})(P=Be(p,v),N(P))}var I=function(p,v,P){for(var E=0,N=v;N<v+P;N++)E+=p[N].length;return E};function le(p,ee,P,E,N){if(N=N||ee.fragments,p===void 0)throw"dicomParser.readEncapsulatedPixelDataFromFragments: missing required parameter 'dataSet'";if(ee===void 0)throw"dicomParser.readEncapsulatedPixelDataFromFragments: missing required parameter 'pixelDataElement'";if(P===void 0)throw"dicomParser.readEncapsulatedPixelDataFromFragments: missing required parameter 'startFragmentIndex'";if((E=E||1)===void 0)throw"dicomParser.readEncapsulatedPixelDataFromFragments: missing required parameter 'numFragments'";if(ee.tag!=="x7fe00010")throw"dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to non pixel data tag (expected tag = x7fe00010";if(ee.encapsulatedPixelData!==!0||ee.hadUndefinedLength!==!0||ee.basicOffsetTable===void 0||ee.fragments===void 0||ee.fragments.length<=0)throw"dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data";if(P<0)throw"dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'startFragmentIndex' must be >= 0";if(P>=ee.fragments.length)throw"dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'startFragmentIndex' must be < number of fragments";if(E<1)throw"dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'numFragments' must be > 0";if(P+E>ee.fragments.length)throw"dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'startFragment' + 'numFragments' < number of fragments";var k=new he(p.byteArrayParser,p.byteArray,ee.dataOffset),ee=j(k);if(ee.tag!=="xfffee000")throw"dicomParser.readEncapsulatedPixelData: missing basic offset table xfffee000";k.seek(ee.length);var oe=k.position;if(E===1)return H(k.byteArray,oe+N[P].offset+8,N[P].length);for(var ee=I(N,P,E),ge=fe(k.byteArray,ee),Fe=0,pe=P;pe<P+E;pe++)for(var we=oe+N[pe].offset+8,Ne=0;Ne<N[pe].length;Ne++)ge[Fe++]=k.byteArray[we++];return ge}var ie=function(p,v){for(var P=0;P<p.length;P++)if(p[P].offset===v)return P},Q=function(p,v,P,E){if(p===v.length-1)return P.length-E;for(var N=v[p+1],k=E+1;k<P.length;k++)if(P[k].offset===N)return k-E;throw"dicomParser.calculateNumberOfFragmentsForFrame: could not find fragment with offset matching basic offset table"};function ce(p,v,P,E,N){if(E=E||v.basicOffsetTable,N=N||v.fragments,p===void 0)throw"dicomParser.readEncapsulatedImageFrame: missing required parameter 'dataSet'";if(v===void 0)throw"dicomParser.readEncapsulatedImageFrame: missing required parameter 'pixelDataElement'";if(P===void 0)throw"dicomParser.readEncapsulatedImageFrame: missing required parameter 'frameIndex'";if(E===void 0)throw"dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' does not have basicOffsetTable";if(v.tag!=="x7fe00010")throw"dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to non pixel data tag (expected tag = x7fe00010)";if(v.encapsulatedPixelData!==!0)throw"dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data";if(v.hadUndefinedLength!==!0)throw"dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to pixel data element that does not have undefined length";if(v.fragments===void 0)throw"dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to pixel data element that does not have fragments";if(E.length===0)throw"dicomParser.readEncapsulatedImageFrame: basicOffsetTable has zero entries";if(P<0)throw"dicomParser.readEncapsulatedImageFrame: parameter 'frameIndex' must be >= 0";if(P>=E.length)throw"dicomParser.readEncapsulatedImageFrame: parameter 'frameIndex' must be < basicOffsetTable.length";var k=E[P],k=ie(N,k);if(k===void 0)throw"dicomParser.readEncapsulatedImageFrame: unable to find fragment that matches basic offset table entry";return le(p,v,k,Q(P,E,N,k),N)}var ve=!1;function ae(p,v,P){if(ve||(ve=!0,console&&console.log&&console.log("WARNING: dicomParser.readEncapsulatedPixelData() has been deprecated")),p===void 0)throw"dicomParser.readEncapsulatedPixelData: missing required parameter 'dataSet'";if(v===void 0)throw"dicomParser.readEncapsulatedPixelData: missing required parameter 'element'";if(P===void 0)throw"dicomParser.readEncapsulatedPixelData: missing required parameter 'frame'";if(v.tag!=="x7fe00010")throw"dicomParser.readEncapsulatedPixelData: parameter 'element' refers to non pixel data tag (expected tag = x7fe00010)";if(v.encapsulatedPixelData!==!0||v.hadUndefinedLength!==!0||v.basicOffsetTable===void 0||v.fragments===void 0)throw"dicomParser.readEncapsulatedPixelData: parameter 'element' refers to pixel data element that does not have encapsulated pixel data";if(P<0)throw"dicomParser.readEncapsulatedPixelData: parameter 'frame' must be >= 0";return v.basicOffsetTable.length!==0?ce(p,v,P):le(p,v,0,v.fragments.length)}o.default={isStringVr:u,isPrivateTag:d,parsePN:h,parseTM:f,parseDA:x,explicitElementToString:y,explicitDataSetToJS:g,createJPEGBasicOffsetTable:m,parseDicomDataSetExplicit:Ve,parseDicomDataSetImplicit:st,readFixedString:U,alloc:fe,version:xe,bigEndianByteArrayParser:Te,ByteStream:he,sharedCopy:H,DataSet:F,findAndSetUNElementLength:R,findEndOfEncapsulatedElement:T,findItemDelimitationItemAndSetElementLength:G,littleEndianByteArrayParser:ye,parseDicom:z,readDicomElementExplicit:De,readDicomElementImplicit:$,readEncapsulatedImageFrame:ce,readEncapsulatedPixelData:ae,readEncapsulatedPixelDataFromFragments:le,readPart10Header:Be,readSequenceItemsExplicit:Se,readSequenceItemsImplicit:re,readSequenceItem:j,readTag:w,LEI:"1.2.840.10008.1.2",LEE:"1.2.840.10008.1.2.1"}}],r={},i.m=s,i.c=r,i.d=function(a,o,l){i.o(a,o)||Object.defineProperty(a,o,{enumerable:!0,get:l})},i.r=function(a){typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(a,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(a,"__esModule",{value:!0})},i.t=function(a,o){if(1&o&&(a=i(a)),8&o||4&o&&typeof a=="object"&&a&&a.__esModule)return a;var l=Object.create(null);if(i.r(l),Object.defineProperty(l,"default",{enumerable:!0,value:a}),2&o&&typeof a!="string")for(var c in a)i.d(l,c,(function(u){return a[u]}).bind(null,c));return l},i.n=function(a){var o=a&&a.__esModule?function(){return a.default}:function(){return a};return i.d(o,"a",o),o},i.o=function(a,o){return Object.prototype.hasOwnProperty.call(a,o)},i.p="",i(i.s=1);function i(a){if(r[a])return r[a].exports;var o=r[a]={i:a,l:!1,exports:{}};return s[a].call(o.exports,o,o.exports,i),o.l=!0,o.exports}var s,r})})(Do)),Do.exports}var VC=zC();const HC=UC(VC),$C={CT:"CT",MR:"MRI",MRI:"MRI",XA:"X-Ray",CR:"X-Ray",DX:"X-Ray",RG:"X-Ray"};function Cr(n){return/\.(png|jpe?g|webp|bmp)$/i.test(n.name)||["image/png","image/jpeg","image/webp","image/bmp"].includes(n.type)}function GC(n){return Cr(n)||/\.dcm$/i.test(n.name)||n.type==="application/dicom"||!n.name.includes(".")}function WC(n){const e=n.toUpperCase();return/(\b|_|-)(MR|MRI|T1|T2|FLAIR)(\b|_|-)/.test(e)?"MRI":/(\b|_|-)(XR|XRAY|X-RAY|CR|DX)(\b|_|-)/.test(e)?"X-Ray":/(\b|_|-)(CT)(\b|_|-)/.test(e)?"CT":null}async function XC(n){var t;const e=new Set;for(const i of n){let s=null;if(!Cr(i))try{const r=new Uint8Array(await i.slice(0,2097152).arrayBuffer()),a=HC.parseDicom(r,{untilTag:"x00080061"});s=$C[((t=a.string("x00080060"))==null?void 0:t.trim().toUpperCase())??""]??null}catch{}s??(s=WC(i.name)),s&&e.add(s)}if(e.size>1)throw new Error("Mixed imaging types. Import CT, MRI, and X-Ray as separate studies.");return e.values().next().value??null}const qC="modulepreload",YC=function(n){return"/"+n},ep={},jC=function(e,t,i){let s=Promise.resolve();if(t&&t.length>0){let a=function(c){return Promise.all(c.map(u=>Promise.resolve(u).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));s=a(t.map(c=>{if(c=YC(c),c in ep)return;ep[c]=!0;const u=c.endsWith(".css"),d=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${d}`))return;const h=document.createElement("link");if(h.rel=u?"stylesheet":qC,u||(h.as="script"),h.crossOrigin="",h.href=c,l&&h.setAttribute("nonce",l),document.head.appendChild(h),u)return new Promise((f,b)=>{h.addEventListener("load",f),h.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${c}`)))})}))}function r(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return s.then(a=>{for(const o of a||[])o.status==="rejected"&&r(o.reason);return e().catch(r)})},KC={class:"uploaded-viewer"},ZC={class:"uploaded-heading"},JC={key:0,class:"empty-state"},QC={key:1,class:"empty-state",role:"alert"},eP={class:"image-tools"},tP=["aria-label"],nP=["aria-label"],iP={key:0},sP=["max"],rP={class:"raster-viewport"},aP=["src","alt"],oP={class:"file-caption"},lP=it({__name:"UploadedStudyViewer",props:{examination:{}},setup(n){const e=Ov(()=>jC(()=>import("./CornerstoneViewer-mfokm9So.js"),__vite__mapDeps([0,1]))),t=n,i=ze([]),s=ze([]),r=ze(0),a=ze(1),o=ze(!0),l=ze("");let c=!1;const u=Me(()=>i.value.length>0&&i.value.every(Cr));return sn(async()=>{try{const d=await ub(t.examination.id);if(c)return;i.value=d,d.length?d.every(Cr)&&(s.value=d.map(h=>URL.createObjectURL(h))):l.value="The uploaded files are not available. Import the study again."}catch{l.value="Could not load the uploaded study."}finally{o.value=!1}}),ns(()=>{c=!0,s.value.forEach(d=>URL.revokeObjectURL(d))}),(d,h)=>{var f,b;return Z(),de("section",KC,[_("div",ZC,[_("strong",null,D(d.$t(n.examination.type)),1),_("span",null,D(d.$t("Uploaded study")),1),_("span",null,D(d.$t(i.value.length))+" "+D(d.$t("files")),1)]),o.value?(Z(),de("div",JC,D(d.$t("Loading study...")),1)):l.value?(Z(),de("div",QC,D(d.$t(l.value)),1)):u.value?(Z(),de(lt,{key:2},[_("div",eP,[_("button",{type:"button",class:"icon-btn","aria-label":d.$t("Zoom out"),onClick:h[0]||(h[0]=x=>a.value=Math.max(.25,a.value-.25))},[ne(J(od),{size:17})],8,tP),_("span",null,D(d.$t(Math.round(a.value*100)))+"%",1),_("button",{type:"button",class:"icon-btn","aria-label":d.$t("Zoom in"),onClick:h[1]||(h[1]=x=>a.value=Math.min(4,a.value+.25))},[ne(J(ld),{size:17})],8,nP),_("button",{type:"button",class:"btn btn-sm btn-secondary",onClick:h[2]||(h[2]=x=>{a.value=1,r.value=0})},[ne(J(cd),{size:15}),ot(" "+D(d.$t("Reset view")),1)]),i.value.length>1?(Z(),de("label",iP,[ot(D(d.$t("Image"))+" ",1),Nt(_("input",{"onUpdate:modelValue":h[3]||(h[3]=x=>r.value=x),type:"range",min:"0",max:i.value.length-1},null,8,sP),[[Wi,r.value,void 0,{number:!0}]]),ot(" "+D(d.$t(r.value+1))+" / "+D(d.$t(i.value.length)),1)])):tt("",!0)]),_("div",rP,[_("img",{src:s.value[r.value],alt:(f=i.value[r.value])==null?void 0:f.name,style:Pi({transform:`scale(${a.value})`}),onError:h[4]||(h[4]=x=>l.value="Could not display this image.")},null,44,aP)]),_("div",oP,D(d.$t((b=i.value[r.value])==null?void 0:b.name)),1)],64)):i.value.length?(Z(),bt(J(e),{key:3,files:i.value},null,8,["files"])):tt("",!0)])}}}),Cg=at(lP,[["__scopeId","data-v-ad0163b7"]]),cP={class:"imaging-layout"},uP={class:"viewer-section card"},dP={class:"viewer-toolbar"},hP={class:"muted"},fP={class:"exam-switcher"},pP={key:0,class:"demo-label"},mP=["onClick"],gP={class:"finding-side"},vP={class:"card"},_P={class:"card-header"},yP={class:"muted"},bP={class:"card-body"},xP={key:1,class:"empty-state"},SP={class:"card"},MP={class:"card-header"},EP={class:"muted"},wP={class:"card-body stack"},AP={key:0,class:"empty-state"},TP={class:"upload-header"},RP={class:"muted"},CP=["aria-label"],PP={key:0,class:"upload-files"},IP={class:"upload-files-heading"},DP={key:0,class:"muted"},LP={key:1,class:"modality-control"},UP={value:"auto"},NP=["disabled"],OP=["disabled"],FP=["disabled"],kP={key:2,class:"upload-hint"},BP={key:3,class:"upload-error",role:"alert"},zP={class:"upload-footer"},VP=["disabled"],HP=["disabled"],$P=it({__name:"PatientImagingView",setup(n){const e=Ps(),t=Rn(),i=pn(),s=Me(()=>String(e.params.id)),r=Me({get:()=>{var B;return i.activeExamId??((B=i.examinations[0])==null?void 0:B.id)},set:B=>{i.activeExamId=B??null}}),a=ze(null),o=ze(!1),l=ze([]),c=ze(null),u=ze(null),d=ze("auto"),h=ze(!1),f=ze(!1),b=ze(""),x=ze(!1);let y=0;const g=Me(()=>i.examinations.some(B=>B.id.startsWith("UPLOAD-"))||x.value?i.examinations:i.examinations.filter(B=>B.id===r.value).slice(0,1)),A=Me(()=>i.examinations.find(B=>B.id===r.value)??i.examinations[0]),S=Me(()=>{var B;return((B=A.value)==null?void 0:B.id.startsWith("UPLOAD-"))??!1}),m=Me(()=>A.value?i.findings.filter(B=>{var $;return B.examinationId===(($=A.value)==null?void 0:$.id)}):[]),w=Me(()=>m.value.find(B=>B.id===a.value)??null);Bt(m,B=>{var $;B.some(j=>j.id===a.value)||(a.value=(($=B[0])==null?void 0:$.id)??null)},{immediate:!0});function T(B){r.value=B,t.replace({name:"doctor-patient-imaging",params:{id:s.value},query:{exam:B}})}function R(){l.value=[],b.value="",u.value=null,d.value="auto",o.value=!0}function U(){f.value||(y++,h.value=!1,o.value=!1,l.value=[])}async function M(){const B=++y;if(u.value=null,b.value="",!l.value.length){u.value=null;return}h.value=!0;try{if(l.value.some(j=>!GC(j)))throw new Error("Choose DICOM, PNG, JPEG, WebP, or BMP files. Extract archives before importing.");if(l.value.some(Cr)&&l.value.some(j=>!Cr(j)))throw new Error("Import DICOM and image files separately.");const $=await XC(l.value);B===y&&(u.value=$)}catch($){B===y&&(b.value=$ instanceof Error?$.message:"Could not read the selected files.")}finally{B===y&&(h.value=!1)}}function C(B){d.value="auto";const $=B.target;l.value=Array.from($.files??[]),$.value="",M()}function F(B){var $;f.value||(d.value="auto",l.value=Array.from((($=B.dataTransfer)==null?void 0:$.files)??[]),M())}async function G(){if(!l.value.length||h.value||f.value||b.value)return;const B=d.value==="auto"?u.value:d.value;if(!B)return;f.value=!0;const $=l.value[0],j=`UPLOAD-${Date.now()}-${crypto.randomUUID().slice(0,8)}`,Y={id:j,patientId:s.value,type:B,organ:"Unspecified",bodyPart:"Unspecified",date:new Date().toISOString().slice(0,10),status:"Pending Review",description:`Uploaded study: ${$.name}`,sliceCount:l.value.length};try{await cb({examination:Y,files:[...l.value]}),await i.loadPatientContext(s.value);const re=i.patients.find(K=>K.id===s.value);re&&(re.modality=B,re.lastExamDate=Y.date,re.organ=Y.organ,re.status="Pending Review"),r.value=j,o.value=!1,l.value=[],t.replace({name:"doctor-patient-imaging",params:{id:s.value},query:{exam:j}})}catch{b.value="Import failed. Check browser storage and try again."}finally{f.value=!1}}return(B,$)=>(Z(),de("div",cP,[_("section",uP,[_("div",dP,[_("div",null,[_("h3",null,D(B.$t("Imaging Study")),1),_("p",hP,D(B.$t("Load a patient study or import local CT / MRI / X-Ray files.")),1)]),_("button",{type:"button",class:"btn btn-primary btn-sm",onClick:R},[ne(J(kh),{size:15}),ot(" "+D(B.$t("Upload imaging")),1)])]),_("div",fP,[S.value?tt("",!0):(Z(),de("span",pP,D(B.$t("Sample study")),1)),(Z(!0),de(lt,null,kt(g.value,j=>{var Y;return Z(),de("button",{key:j.id,type:"button",class:Yt({active:j.id===((Y=A.value)==null?void 0:Y.id)}),onClick:re=>T(j.id)},D(B.$t(j.type))+" · "+D(B.$t(j.date)),11,mP)}),128)),!S.value&&J(i).examinations.length>1?(Z(),de("button",{key:1,type:"button",onClick:$[0]||($[0]=j=>x.value=!x.value)},D(B.$t(x.value?"Hide sample history":"Show sample history")),1)):tt("",!0)]),A.value&&!S.value?(Z(),bt(TC,{key:0,examination:A.value,findings:m.value,onSelectFinding:$[1]||($[1]=j=>a.value=j)},null,8,["examination","findings"])):A.value&&S.value?(Z(),bt(Cg,{key:A.value.id,examination:A.value},null,8,["examination"])):tt("",!0)]),_("aside",gP,[_("div",vP,[_("div",_P,[_("div",null,[_("h3",null,D(B.$t("Linked Finding")),1),_("p",yP,D(B.$t("Select a marker in the image.")),1)])]),_("div",bP,[w.value?(Z(),bt(Rg,{key:0,finding:w.value,"has-report":!!J(i).reports.find(j=>{var Y;return j.examinationId===((Y=A.value)==null?void 0:Y.id)}),onViewCt:$[2]||($[2]=j=>a.value=w.value.id),onViewReport:$[3]||($[3]=j=>J(t).push({name:"doctor-patient-report",params:{id:s.value}}))},null,8,["finding","has-report"])):(Z(),de("div",xP,D(B.$t("No marker is selected.")),1))])]),_("div",SP,[_("div",MP,[_("div",null,[_("h3",null,D(B.$t("AI Results")),1),_("p",EP,D(B.$t(m.value.length))+" "+D(B.$t("findings in this study.")),1)])]),_("div",wP,[(Z(!0),de(lt,null,kt(m.value,j=>(Z(),bt(dd,{key:j.id,finding:j,compact:""},null,8,["finding"]))),128)),m.value.length?tt("",!0):(Z(),de("div",AP,D(B.$t("No AI findings for this study.")),1))])])]),o.value?(Z(),de("div",{key:0,class:"upload-overlay",onClick:rr(U,["self"])},[_("form",{class:"upload-modal card",onSubmit:rr(G,["prevent"])},[_("div",TP,[_("div",null,[_("h3",null,D(B.$t("Import imaging study")),1),_("p",RP,D(B.$t("Add local imaging files to this patient record.")),1)]),_("button",{type:"button",class:"icon-btn","aria-label":B.$t("Close upload dialog"),onClick:U},[ne(J(Ta),{size:17})],8,CP)]),_("div",{class:"drop-zone",onDragover:$[5]||($[5]=rr(()=>{},["prevent"])),onDrop:rr(F,["prevent"])},[ne(J(kh),{size:26}),_("strong",null,D(B.$t("Drop DICOM or image files here")),1),_("span",null,D(B.$t("or")),1),_("input",{ref_key:"fileInput",ref:c,type:"file",accept:".dcm,application/dicom,image/png,image/jpeg,image/webp,image/bmp",multiple:"",class:"sr-only",onChange:C},null,544),_("button",{type:"button",class:"btn btn-secondary btn-sm",onClick:$[4]||($[4]=j=>{var Y;return(Y=c.value)==null?void 0:Y.click()})},D(B.$t("Choose files")),1)],32),l.value.length?(Z(),de("div",PP,[_("div",IP,[_("span",null,D(B.$t("Selected files")),1),_("span",null,D(B.$t(h.value?"Detecting...":u.value?`${l.value.length} · ${u.value}`:l.value.length)),1)]),(Z(!0),de(lt,null,kt(l.value.slice(0,6),j=>(Z(),de("div",{key:`${j.name}-${j.size}`,class:"upload-file"},[j.type.startsWith("image")?(Z(),bt(J(Oy),{key:0,size:16})):(Z(),bt(J(Ny),{key:1,size:16})),_("span",null,D(B.$t(j.name)),1),_("small",null,D(B.$t((j.size/1024/1024).toFixed(2)))+" "+D(B.$t("MB")),1)]))),128)),l.value.length>6?(Z(),de("p",DP,D(B.$t("and"))+" "+D(B.$t(l.value.length-6))+" "+D(B.$t("more files")),1)):tt("",!0)])):tt("",!0),l.value.length?(Z(),de("label",LP,[_("span",null,D(B.$t("Imaging type")),1),Nt(_("select",{"onUpdate:modelValue":$[6]||($[6]=j=>d.value=j),class:"select"},[_("option",UP,D(B.$t("Auto-detect")),1),_("option",{value:"CT",disabled:!!u.value&&u.value!=="CT"},D(B.$t("CT")),9,NP),_("option",{value:"MRI",disabled:!!u.value&&u.value!=="MRI"},D(B.$t("MRI")),9,OP),_("option",{value:"X-Ray",disabled:!!u.value&&u.value!=="X-Ray"},D(B.$t("X-Ray")),9,FP)],512),[[Mn,d.value]])])):tt("",!0),l.value.length&&!u.value&&!h.value&&!b.value?(Z(),de("p",kP,D(B.$t("No imaging type found. Select CT, MRI, or X-Ray to continue.")),1)):tt("",!0),b.value?(Z(),de("p",BP,D(B.$t(b.value)),1)):tt("",!0),_("div",zP,[_("button",{type:"button",class:"btn btn-secondary",disabled:f.value,onClick:U},D(B.$t("Cancel")),9,VP),_("button",{type:"submit",class:"btn btn-primary",disabled:!l.value.length||h.value||f.value||!!b.value||d.value==="auto"&&!u.value},D(B.$t(f.value?"Importing...":"Import study")),9,HP)])],32)])):tt("",!0)]))}}),GP=at($P,[["__scopeId","data-v-fdad165c"]]),WP={class:"ai-layout"},XP={class:"main-column"},qP={class:"card"},YP={class:"card-header"},jP={class:"muted"},KP={class:"review-summary"},ZP={class:"card-body stack"},JP={key:0,class:"empty-state"},QP={class:"side-column"},eI={class:"card review-guide"},tI={class:"card-header"},nI={class:"card-body"},iI={class:"check-item"},sI={class:"check-item"},rI={class:"check-item"},aI=it({__name:"PatientAIView",setup(n){const e=Ps(),t=Rn(),i=pn(),s=Me(()=>String(e.params.id)),r=Me(()=>{var c;return i.activeExamId??((c=i.examinations[0])==null?void 0:c.id)}),a=Me(()=>i.findings.filter(c=>c.examinationId===r.value)),o=Me(()=>a.value.filter(c=>c.status==="pending").length),l=Me(()=>a.value.filter(c=>c.status==="confirmed").length);return(c,u)=>(Z(),de("div",WP,[_("section",XP,[_("div",qP,[_("div",YP,[_("div",null,[_("h3",null,D(c.$t("AI Finding Review")),1),_("p",jP,D(c.$t("Confirm, modify, or dismiss each model-generated finding.")),1)]),_("div",KP,[_("span",null,[ne(J(rd),{size:14}),ot(" "+D(c.$t(o.value))+" "+D(c.$t("pending")),1)]),_("span",null,[ne(J(Lm),{size:14}),ot(" "+D(c.$t(l.value))+" "+D(c.$t("confirmed")),1)])])]),_("div",ZP,[(Z(!0),de(lt,null,kt(a.value,d=>(Z(),bt(dd,{key:d.id,finding:d},null,8,["finding"]))),128)),a.value.length?tt("",!0):(Z(),de("div",JP,D(c.$t("No AI findings are available for this examination.")),1))])])]),_("aside",QP,[_("div",eI,[_("div",tI,[_("h3",null,D(c.$t("Review Checklist")),1)]),_("div",nI,[_("div",iI,[ne(J(Gl),{size:17}),_("span",null,D(c.$t("Confirm findings that match the imaging evidence.")),1)]),_("div",sI,[ne(J(Gl),{size:17}),_("span",null,D(c.$t("Modify any finding text before it reaches the final report.")),1)]),_("div",rI,[ne(J(Gl),{size:17}),_("span",null,D(c.$t("Dismiss findings that are not clinically relevant.")),1)])])]),_("button",{type:"button",class:"btn btn-primary",onClick:u[0]||(u[0]=d=>J(t).push({name:"doctor-patient-report",params:{id:s.value}}))},D(c.$t("Continue to Report")),1)])]))}}),oI=at(aI,[["__scopeId","data-v-e14327fb"]]),lI={class:"report-layout"},cI={class:"editor-section card"},uI={class:"card-header"},dI={class:"report-eyebrow"},hI={class:"muted"},fI={class:"report-context"},pI=["aria-label","disabled"],mI=["value"],gI={class:"document-field"},vI={class:"label",for:"diagnosis"},_I=["placeholder","disabled"],yI={class:"document-field"},bI={class:"label",for:"description"},xI=["placeholder","disabled"],SI=["disabled"],MI={class:"document-field"},EI={class:"label",for:"recommendation"},wI=["placeholder","disabled"],AI={class:"form-actions"},TI=["disabled"],RI=["disabled"],CI=["disabled"],PI={key:0,class:"save-message",role:"status"},II={key:1,class:"error-message",role:"alert"},DI={class:"preview-section"},LI={class:"section-heading"},UI={class:"preview-note"},NI=it({__name:"PatientReportView",setup(n){const e=pn(),t=Nn(),i=Me(()=>{var A;return e.activeExamId??((A=e.examinations[0])==null?void 0:A.id)}),s=Me(()=>e.reports.find(A=>A.examinationId===i.value)),r=si({diagnosis:"",description:"",recommendation:""}),a=ze(!1),o=ze(""),l=ze(""),c=si({diagnosis:"",description:"",recommendation:""}),u=Me(()=>r.diagnosis!==c.diagnosis||r.description!==c.description||r.recommendation!==c.recommendation),d=Me(()=>{var A;return!!((A=s.value)!=null&&A.reviewed&&!u.value)}),h=Me(()=>{var A,S,m,w;return{id:((A=s.value)==null?void 0:A.id)??`R-${i.value}`,patientId:e.selectedPatientId??"",examinationId:i.value??"",...r,doctor:((S=s.value)==null?void 0:S.doctor)??((m=t.session)==null?void 0:m.name)??"",date:((w=s.value)==null?void 0:w.date)??new Date().toLocaleDateString("en-CA"),reviewed:d.value}}),f=Me(()=>e.findings.filter(A=>A.examinationId===i.value&&["confirmed","modified"].includes(A.status)));function b(A){r.diagnosis=ir((A==null?void 0:A.diagnosis)??""),r.description=ir((A==null?void 0:A.description)??""),r.recommendation=ir((A==null?void 0:A.recommendation)??""),Object.assign(c,r),o.value="",l.value=""}Bt([s,i],()=>b(s.value),{immediate:!0}),Bt(Ji,()=>{u.value||b(s.value)});function x(){b(s.value),o.value=s.value?"Restored the last saved report.":"Draft cleared."}function y(){r.description=f.value.map(A=>`${ir(A.label)}: ${ir(A.description)}`).join(`

`),o.value="Confirmed and modified findings added. Review the text before signing."}async function g(A){var m;if(a.value)return;if(l.value="",!i.value||!e.selectedPatientId){l.value="Select an examination first.";return}if(A&&(!r.diagnosis.trim()||!r.description.trim())){l.value="Enter a diagnosis and description before signing.";return}a.value=!0;const S={...h.value,diagnosis:r.diagnosis.trim(),description:r.description.trim(),recommendation:r.recommendation.trim(),doctor:((m=t.session)==null?void 0:m.name)??"",date:new Date().toLocaleDateString("en-CA"),reviewed:A};try{await e.saveReport(S),b(S),o.value=A?"Report signed and available in the patient portal.":"Draft saved."}catch{l.value="Save failed. Please try again."}finally{a.value=!1}}return(A,S)=>{var m;return Z(),de("div",lI,[_("section",cI,[_("div",uI,[_("div",null,[_("span",dI,D(A.$t("Clinical report")),1),_("h3",null,[ne(J(Gy),{size:22}),ot(" "+D(A.$t("Doctor Review")),1)]),_("p",hI,D(A.$t("Review, refine, and sign your clinical assessment.")),1)]),_("span",{class:Yt(["sign-status",{signed:d.value}])},[ne(J(Um),{size:15}),ot(" "+D(A.$t(d.value?"Signed":u.value?"Unsaved changes":"Draft")),1)],2)]),_("div",fI,[_("span",null,D(A.$t((m=J(e).selectedPatient)==null?void 0:m.name))+" · "+D(A.$t(J(e).selectedPatientId)),1),Nt(_("select",{"onUpdate:modelValue":S[0]||(S[0]=w=>J(e).activeExamId=w),class:"select","aria-label":A.$t("Report examination"),disabled:a.value},[(Z(!0),de(lt,null,kt(J(e).examinations,w=>(Z(),de("option",{key:w.id,value:w.id},D(A.$t(w.type))+" · "+D(A.$t(w.date)),9,mI))),128))],8,pI),[[Mn,J(e).activeExamId]])]),_("form",{class:"card-body report-form",onSubmit:S[5]||(S[5]=rr(w=>g(!0),["prevent"]))},[_("div",gI,[_("label",vI,D(A.$t("Final diagnosis")),1),Nt(_("textarea",{id:"diagnosis","onUpdate:modelValue":S[1]||(S[1]=w=>r.diagnosis=w),class:"textarea",rows:"2",placeholder:A.$t("Write your clinical impression..."),disabled:a.value},null,8,_I),[[Wi,r.diagnosis]])]),_("div",yI,[_("label",bI,D(A.$t("Description")),1),Nt(_("textarea",{id:"description","onUpdate:modelValue":S[2]||(S[2]=w=>r.description=w),class:"textarea",rows:"5",placeholder:A.$t("Describe the imaging findings..."),disabled:a.value},null,8,xI),[[Wi,r.description]]),f.value.length?(Z(),de("button",{key:0,type:"button",class:"findings-link",disabled:a.value,onClick:y},D(A.$t("Use reviewed AI findings")),9,SI)):tt("",!0)]),_("div",MI,[_("label",EI,D(A.$t("Recommendation")),1),Nt(_("textarea",{id:"recommendation","onUpdate:modelValue":S[3]||(S[3]=w=>r.recommendation=w),class:"textarea",rows:"3",placeholder:A.$t("Add follow-up recommendations..."),disabled:a.value},null,8,wI),[[Wi,r.recommendation]])]),_("div",AI,[_("button",{type:"submit",class:"btn btn-primary",disabled:a.value||d.value},[ne(J(Dm),{size:16}),ot(" "+D(A.$t(a.value?"Saving...":d.value?"Signed":"Mark reviewed and sign")),1)],8,TI),_("button",{type:"button",class:"btn btn-secondary",disabled:a.value||d.value,onClick:S[4]||(S[4]=w=>g(!1))},[ne(J(Xy),{size:16}),ot(" "+D(A.$t("Save draft")),1)],8,RI),_("button",{type:"button",class:"btn btn-secondary",disabled:a.value,onClick:x},[ne(J(cd),{size:16}),ot(" "+D(A.$t("Reset")),1)],8,CI)]),o.value?(Z(),de("p",PI,D(A.$t(o.value)),1)):tt("",!0),l.value?(Z(),de("p",II,D(A.$t(l.value)),1)):tt("",!0)],32)]),_("aside",DI,[_("div",LI,[_("h3",null,D(A.$t("Live preview")),1)]),ne(Dr,{report:h.value},null,8,["report"]),_("p",UI,D(A.$t("The patient sees this report after you sign it.")),1)])])}}}),OI=at(NI,[["__scopeId","data-v-81874adf"]]),FI={async getOrganModels(){return Vn(Go)}},kI={class:"scene-hint"},BI=it({__name:"DigitalHumanViewer",props:{selectedOrganId:{default:null},compact:{type:Boolean,default:!1}},emits:["select"],setup(n,{emit:e}){const t=n,i=e,s=ze(null);let r=null,a=null,o=null,l=null,c=0,u=[],d=new Map,h=[],f=null,b=null;const x={lung:[0,.55,.22],brain:[0,1.18,0],heart:[-.14,.46,.2],liver:[.16,.12,.22],kidney:[-.22,-.08,.23],bone:[0,-.45,0]};function y(M){const C=document.createElement("canvas");C.width=256,C.height=80;const F=C.getContext("2d");if(!F)return null;F.fillStyle="rgba(18, 37, 42, 0.86)",F.beginPath(),F.roundRect(12,12,232,56,14),F.fill(),F.fillStyle="#ffffff",F.font="600 25px Inter, sans-serif",F.textAlign="center",F.textBaseline="middle",F.fillText(M,128,42);const G=new RE(C);G.minFilter=Hn;const B=new hg({map:G,depthTest:!1,transparent:!0}),$=new EE(B);return $.scale.set(.82,.26,1),$}function g(){const M=new jr,C=new mr({color:15266803,roughness:.78,metalness:.02,transparent:!0,opacity:.34}),F=new yt(new ji(.34,48,24),C);F.position.set(0,1.18,0),F.scale.set(.82,1.04,.9),M.add(F);const G=new yt(new la(.44,.78,8,32),C);G.position.set(0,.34,0),M.add(G);const B=C.clone(),$=new la(.13,.52,4,18),j=new yt($,B);j.position.set(-.65,.34,0),j.rotation.z=.18,M.add(j);const Y=new yt($,B);Y.position.set(.65,.34,0),Y.rotation.z=-.18,M.add(Y);const re=new la(.2,.6,4,20),K=new yt(re,B);K.position.set(-.2,-.76,0),M.add(K);const Se=new yt(re,B);return Se.position.set(.2,-.76,0),M.add(Se),M}function A(M){a&&(u=[],d.clear(),h=[],M.forEach(C=>{const F=x[C.id]??[0,0,0],G=new ji(.18,32,20),B=new mr({color:new rt(C.color),roughness:.48,metalness:.04,emissive:new rt(C.color),emissiveIntensity:.08}),$=new yt(G,B);$.position.set(...F),$.userData.organId=C.id,a==null||a.add($),u.push($),d.set(C.id,$);const j=y(C.label);j&&(j.position.set(F[0],F[1]+.42,F[2]),a==null||a.add(j),h.push(j))}))}function S(M){d.forEach((C,F)=>{const G=C.material;G.emissiveIntensity=F===M?.5:.08,G.opacity=F===M?1:.82})}function m(){if(!s.value||!r||!o)return;const M=s.value.clientWidth,C=s.value.clientHeight;r.setSize(M,C),o.aspect=M/Math.max(1,C),o.updateProjectionMatrix()}function w(M){if(!s.value)return null;const C=s.value.getBoundingClientRect();return new Ee((M.clientX-C.left)/C.width*2-1,-((M.clientY-C.top)/C.height)*2+1)}function T(M){if(!o||!a)return;const C=w(M);if(!C)return;const F=new Ad;F.setFromCamera(C,o);const G=F.intersectObjects(u,!1);if(G[0]){const B=G[0].object.userData.organId;i("select",B)}}function R(){c=requestAnimationFrame(R),l&&l.update(),f&&(f.rotation.y+=.0025),r&&a&&o&&r.render(a,o)}async function U(){if(!s.value)return;const M=s.value.clientWidth,C=s.value.clientHeight;r=new Rd({antialias:!0,alpha:!0}),r.setPixelRatio(Math.min(window.devicePixelRatio,2)),r.setSize(M,C),r.outputColorSpace=un,r.toneMapping=vl,s.value.appendChild(r.domElement),a=new bd,a.background=new rt(16186363),o=new _n(42,M/Math.max(1,C),.1,100),o.position.set(0,.2,4.4),a.add(new wd(15661047,12046288,2.2));const F=new xa(16777215,3);F.position.set(2,3,3),a.add(F);const G=new xa(12444387,1.6);G.position.set(-2,.4,-2),a.add(G),f=g(),a.add(f),l=new Pd(o,r.domElement),l.enableDamping=!0,l.enablePan=!1,l.minDistance=2.6,l.maxDistance=7,l.target.set(0,.05,0),l.update();const B=await FI.getOrganModels();A(B),S(t.selectedOrganId),r.domElement.addEventListener("pointerdown",T),b=new ResizeObserver(()=>{m()}),b.observe(s.value),R()}return Bt(()=>t.selectedOrganId,M=>S(M)),sn(U),ns(()=>{cancelAnimationFrame(c),b==null||b.disconnect(),r==null||r.domElement.removeEventListener("pointerdown",T),h.forEach(M=>{var C;(C=M.material.map)==null||C.dispose(),M.material.dispose()}),u.forEach(M=>M.geometry.dispose()),f==null||f.traverse(M=>{M instanceof yt&&(M.geometry.dispose(),Array.isArray(M.material)?M.material.forEach(C=>C.dispose()):M.material.dispose())}),l==null||l.dispose(),r==null||r.dispose(),r==null||r.domElement.remove()}),(M,C)=>(Z(),de("div",{class:Yt(["digital-human",{compact:n.compact}]),ref_key:"hostRef",ref:s},[_("span",kI,D(M.$t("Drag to rotate · Scroll to zoom")),1)],2))}}),Id=at(BI,[["__scopeId","data-v-71389ec6"]]),zI={class:"scene-hint"},VI=it({__name:"LungViewer",props:{findings:{},activeFindingId:{default:null}},emits:["selectFinding"],setup(n,{emit:e}){const t=n,i=e,s=ze(null);let r=null,a=null,o=null,l=null,c=0,u=[],d=new Map,h=null;function f(){if(!a)return;const T=new mr({color:15235464,roughness:.62,metalness:.02}),R=new yt(new ji(1,64,40),T);R.position.set(-.72,.05,0),R.scale.set(.58,1.25,.66),a.add(R);const U=new yt(new ji(1,64,40),T.clone());U.position.set(.76,.05,0),U.scale.set(.66,1.34,.72),a.add(U);const M=new mr({color:7973290,roughness:.7}),C=new yt(new ca(.12,.12,1,24),M);C.position.set(0,.85,.06),a.add(C);const F=new yt(new ca(.08,.08,.72,24),M);F.position.set(-.26,.34,.18),F.rotation.z=.7,a.add(F);const G=new yt(new ca(.08,.08,.72,24),M);return G.position.set(.3,.34,.18),G.rotation.z=-.7,a.add(G),{leftLung:R,rightLung:U,trachea:C,leftBronchus:F,rightBronchus:G}}function b(T){const R=T.side==="right"?1:-1,U=T.location.includes("upper")?.78:T.location.includes("lower")?-.55:0,M=.72;return new V(R*.88,U,M)}function x(T){const R=a;R&&(d.clear(),u=[],T.forEach(U=>{const M=new ji(.14,28,18),C=new mr({color:16731996,roughness:.28,emissive:16720435,emissiveIntensity:.5}),F=new yt(M,C);F.position.copy(b(U)),F.userData.findingId=U.id,R.add(F),u.push(F),d.set(U.id,F)}))}function y(T){d.forEach((R,U)=>{const M=R.material;M.emissiveIntensity=U===T?1.1:.45,R.scale.setScalar(U===T?1.4:1)})}function g(T){if(!s.value)return null;const R=s.value.getBoundingClientRect();return new Ee((T.clientX-R.left)/R.width*2-1,-((T.clientY-R.top)/R.height)*2+1)}function A(T){if(!o)return;const R=g(T);if(!R)return;const U=new Ad;U.setFromCamera(R,o);const M=U.intersectObjects(u,!1);if(M[0]){const C=M[0].object.userData.findingId;i("selectFinding",C)}}function S(){if(!s.value||!r||!o)return;const T=s.value.clientWidth,R=s.value.clientHeight;r.setSize(T,R),o.aspect=T/Math.max(1,R),o.updateProjectionMatrix()}function m(){c=requestAnimationFrame(m),l&&l.update(),r&&a&&o&&r.render(a,o)}function w(){if(!s.value)return;const T=s.value.clientWidth,R=s.value.clientHeight;r=new Rd({antialias:!0,alpha:!0}),r.setPixelRatio(Math.min(window.devicePixelRatio,2)),r.setSize(T,R),r.outputColorSpace=un,r.toneMapping=vl,s.value.appendChild(r.domElement),a=new bd,a.background=new rt(16186363),o=new _n(40,T/Math.max(1,R),.1,100),o.position.set(0,.25,4.6),a.add(new wd(15661047,13096662,2.2));const U=new xa(16777215,2.8);U.position.set(2,2,3),a.add(U);const M=new xa(13627118,1.7);M.position.set(-2,0,-2),a.add(M),f(),x(t.findings),y(t.activeFindingId),l=new Pd(o,r.domElement),l.enableDamping=!0,l.enablePan=!1,l.minDistance=2.5,l.maxDistance=8,l.target.set(0,0,0),l.update(),r.domElement.addEventListener("pointerdown",A),h=new ResizeObserver(S),h.observe(s.value),m()}return Bt(()=>t.activeFindingId,T=>y(T)),Bt(()=>t.findings,T=>{u.forEach(R=>a==null?void 0:a.remove(R)),d.clear(),x(T),y(t.activeFindingId)},{deep:!0}),sn(w),ns(()=>{cancelAnimationFrame(c),h==null||h.disconnect(),r==null||r.domElement.removeEventListener("pointerdown",A),u.forEach(T=>{T.geometry.dispose(),T.material.dispose()}),a==null||a.traverse(T=>{T instanceof yt&&(T.geometry.dispose(),Array.isArray(T.material)?T.material.forEach(R=>R.dispose()):T.material.dispose())}),l==null||l.dispose(),r==null||r.dispose(),r==null||r.domElement.remove()}),(T,R)=>(Z(),de("div",{ref_key:"hostRef",ref:s,class:"lung-viewer"},[_("span",zI,D(T.$t("Drag to rotate · Scroll to zoom")),1)],512))}}),Pg=at(VI,[["__scopeId","data-v-6e36c6d4"]]),HI={class:"three-layout"},$I={class:"human-card card"},GI={class:"card-header"},WI={class:"muted"},XI={class:"card-body"},qI={class:"organ-view"},YI={class:"card"},jI={class:"card-header"},KI={class:"muted"},ZI={class:"organ-chip"},JI={class:"card-body"},QI={key:0,class:"marker-panel"},eD={key:1,class:"card future-organ"},tD={class:"future-icon"},nD={class:"muted"},iD=it({__name:"Patient3DView",setup(n){const e=Ps(),t=Rn(),i=pn(),s=Me(()=>String(e.params.id)),r=ze("lung"),a=ze(null),o=Me(()=>i.findings.filter(d=>d.organ==="Lung")),l=Me(()=>o.value.find(d=>d.id===a.value)??null),c=Me(()=>Go.find(d=>d.id===r.value));Bt(o,d=>{var h;d.some(f=>f.id===a.value)||(a.value=((h=d[0])==null?void 0:h.id)??null)},{immediate:!0});function u(d){r.value=d,d==="lung"&&o.value.length&&(a.value=o.value[0].id)}return(d,h)=>{var f,b;return Z(),de("div",HI,[_("section",$I,[_("div",GI,[_("div",null,[_("h3",null,D(d.$t("Digital Human")),1),_("p",WI,D(d.$t("Select an organ to open its visualization.")),1)])]),_("div",XI,[ne(Id,{"selected-organ-id":r.value,onSelect:u},null,8,["selected-organ-id"])])]),_("section",qI,[r.value==="lung"?(Z(),de(lt,{key:0},[_("div",YI,[_("div",jI,[_("div",null,[_("h3",null,D(d.$t("Lung 3D Model")),1),_("p",KI,D(d.$t("Standard anatomical model with AI finding marker.")),1)]),_("span",ZI,[ne(J(Pr),{size:14}),ot(" "+D(d.$t("Lung")),1)])]),_("div",JI,[ne(Pg,{findings:o.value,"active-finding-id":a.value,onSelectFinding:h[0]||(h[0]=x=>a.value=x)},null,8,["findings","active-finding-id"])])]),l.value?(Z(),de("div",QI,[ne(Rg,{finding:l.value,"has-report":!!J(i).reports.find(x=>{var y;return x.examinationId===((y=J(i).examinations[0])==null?void 0:y.id)}),onViewCt:h[1]||(h[1]=x=>J(t).push({name:"doctor-patient-imaging",params:{id:s.value}})),onViewReport:h[2]||(h[2]=x=>J(t).push({name:"doctor-patient-report",params:{id:s.value}}))},null,8,["finding","has-report"])])):tt("",!0)],64)):(Z(),de("div",eD,[_("div",tD,[ne(J(Yc),{size:26})]),_("h3",null,D(d.$t((f=c.value)==null?void 0:f.label)),1),_("p",null,D(d.$t((b=c.value)==null?void 0:b.description)),1),_("p",nD,D(d.$t("The clinical module for this organ is available in a future release.")),1)]))])])}}}),sD=at(iD,[["__scopeId","data-v-183a5b85"]]),rD={class:"exam-icon"},aD={class:"exam-main"},oD=it({__name:"ExaminationCard",props:{examination:{}},emits:["select"],setup(n,{emit:e}){const t=e;function i(s){return new Intl.DateTimeFormat("en",{month:"long",day:"2-digit",year:"numeric"}).format(new Date(`${s}T00:00:00`))}return(s,r)=>(Z(),de("button",{class:"exam-card",type:"button",onClick:r[0]||(r[0]=a=>t("select",n.examination))},[_("span",rD,[ne(J(xr),{size:20})]),_("span",aD,[_("strong",null,D(s.$t(n.examination.type))+" · "+D(s.$t(n.examination.bodyPart)),1),_("span",null,D(s.$t(n.examination.organ))+" · "+D(s.$t(i(n.examination.date))),1)]),ne(Is,{status:n.examination.status},null,8,["status"]),ne(J(Aa),{size:18,class:"exam-chevron"})]))}}),Ig=at(oD,[["__scopeId","data-v-21623118"]]),lD={class:"page"},cD={class:"patient-hero-grid"},uD={class:"health-overview card"},dD={class:"card-header"},hD={class:"muted"},fD={class:"card-body"},pD={key:0,class:"latest-exam"},mD={class:"health-icon"},gD={class:"latest-exam-copy"},vD={class:"kicker"},_D={class:"health-actions"},yD={class:"body-preview card"},bD={class:"card-header"},xD={class:"muted"},SD={class:"card-body body-preview-content"},MD={class:"patient-lower-grid"},ED={class:"card"},wD={class:"card-header"},AD={class:"muted"},TD={class:"card-body stack"},RD={key:0,class:"empty-state"},CD={class:"card"},PD={class:"card-header"},ID={class:"muted"},DD={class:"card-body"},LD={key:1,class:"empty-state"},UD=it({__name:"PatientDashboardView",setup(n){const e=Rn(),t=Nn(),i=pn(),s=ze(null),r=Me(()=>{var u;return((u=t.session)==null?void 0:u.id)??"P20260021"}),a=Me(()=>i.examinations[0]),o=Me(()=>i.reviewedReports[0]);function l(u){return u?new Intl.DateTimeFormat("en",{month:"long",day:"2-digit",year:"numeric"}).format(new Date(`${u}T00:00:00`)):""}function c(u){e.push({name:"patient-examination-detail",params:{id:u}})}return sn(async()=>{i.patients.length||await i.loadPatients(),await i.loadPatientContext(r.value)}),(u,d)=>{var h;return Z(),de("div",lD,[ne(Ir,{title:u.$t("My Health"),subtitle:u.$t(`Good morning, ${((h=J(t).session)==null?void 0:h.name)??"Patient"}. Here is your health overview.`)},null,8,["title","subtitle"]),_("section",cD,[_("article",uD,[_("div",dD,[_("div",null,[_("h3",null,D(u.$t("My Health Overview")),1),_("p",hD,D(u.$t("Your most recent doctor-reviewed examination.")),1)])]),_("div",fD,[a.value?(Z(),de("div",pD,[_("span",mD,[ne(J(ya),{size:23})]),_("div",gD,[_("span",vD,D(u.$t(a.value.type))+" · "+D(u.$t(a.value.bodyPart)),1),_("h2",null,D(u.$t(a.value.organ)),1),_("p",null,D(u.$t(l(a.value.date))),1)]),ne(Is,{status:o.value?"Reviewed":"Pending Review"},null,8,["status"])])):tt("",!0),_("div",_D,[_("button",{type:"button",class:"btn btn-primary",onClick:d[0]||(d[0]=f=>J(e).push({name:"patient-reports"}))},[ne(J(As),{size:16}),ot(" "+D(u.$t("View Reports")),1)]),_("button",{type:"button",class:"btn btn-secondary",onClick:d[1]||(d[1]=f=>J(e).push({name:"patient-body"}))},[ne(J(Pr),{size:16}),ot(" "+D(u.$t("My Body")),1)])])])]),_("article",yD,[_("div",bD,[_("div",null,[_("h3",null,D(u.$t("My Body")),1),_("p",xD,D(u.$t("Understand your body, starting with your lungs.")),1)])]),_("div",SD,[ne(Id,{compact:"","selected-organ-id":s.value,onSelect:d[2]||(d[2]=f=>J(e).push({name:"patient-body"}))},null,8,["selected-organ-id"])])])]),_("section",MD,[_("div",ED,[_("div",wD,[_("div",null,[_("h3",null,D(u.$t("Recent Examinations")),1),_("p",AD,D(u.$t("Your imaging history in one place.")),1)]),_("button",{type:"button",class:"btn btn-sm btn-secondary",onClick:d[3]||(d[3]=f=>J(e).push({name:"patient-examinations"}))},[ot(D(u.$t("View all"))+" ",1),ne(J(Aa),{size:14})])]),_("div",TD,[(Z(!0),de(lt,null,kt(J(i).examinations.slice(0,3),f=>(Z(),bt(Ig,{key:f.id,examination:f,onSelect:b=>c(f.id)},null,8,["examination","onSelect"]))),128)),J(i).examinations.length?tt("",!0):(Z(),de("div",RD,D(u.$t("No examinations are available.")),1))])]),_("div",CD,[_("div",PD,[_("div",null,[_("h3",null,D(u.$t("Doctor's Report")),1),_("p",ID,D(u.$t("Your latest reviewed final report.")),1)]),ne(J(sd),{size:18,class:"header-icon"})]),_("div",DD,[o.value?(Z(),bt(Dr,{key:0,report:o.value,"patient-facing":""},null,8,["report"])):(Z(),de("div",LD,D(u.$t("Your reviewed report will appear here.")),1))])])])])}}}),ND=at(UD,[["__scopeId","data-v-a69c934b"]]),OD={class:"page"},FD={class:"exams-grid"},kD={key:0,class:"card empty-state"},BD=it({__name:"ExaminationsView",setup(n){const e=Rn(),t=Nn(),i=pn(),s=Me(()=>{var a;return((a=t.session)==null?void 0:a.id)??"P20260021"});function r(a){e.push({name:"patient-examination-detail",params:{id:a}})}return sn(async()=>{i.examinations.length||await i.loadPatientContext(s.value)}),(a,o)=>(Z(),de("div",OD,[ne(Ir,{title:a.$t("My Examinations"),subtitle:a.$t("Your complete imaging history, shown in plain language.")},null,8,["title","subtitle"]),_("section",FD,[(Z(!0),de(lt,null,kt(J(i).examinations,l=>(Z(),bt(Ig,{key:l.id,examination:l,onSelect:c=>r(l.id)},null,8,["examination","onSelect"]))),128))]),!J(i).examinations.length&&!J(i).loading?(Z(),de("div",kD,D(a.$t("No examinations are available.")),1)):tt("",!0)]))}}),zD=at(BD,[["__scopeId","data-v-8545d6bd"]]),VD={class:"viewer"},HD={class:"viewer-info"},$D={class:"viewer-controls"},GD=["disabled","aria-label"],WD=["max","aria-label"],XD=["disabled","aria-label"],qD=["aria-label"],YD={class:"zoom-value"},jD=["aria-label"],KD=["aria-label"],ZD=it({__name:"MedicalImageViewer",props:{examination:{},findings:{}},emits:["selectFinding"],setup(n,{emit:e}){const t=n,i=e,s=ze(null),r=ze(Math.max(1,Math.ceil(t.examination.sliceCount/2))),a=ze(1),o=ze([]),l=Me(()=>r.value>1),c=Me(()=>r.value<t.examination.sliceCount);function u(){const S=s.value;if(!S)return;const m=S.parentElement;if(!m)return;const w=m.getBoundingClientRect(),T=window.devicePixelRatio||1;S.width=Math.max(1,Math.round(w.width*T)),S.height=Math.max(1,Math.round(w.height*T)),S.style.width=`${w.width}px`,S.style.height=`${w.height}px`}function d(S,m,w,T){S.save(),S.translate(m/2,w/2),S.fillStyle="#101a1e",S.fillRect(-m/2,-w/2,m,w),S.strokeStyle="rgba(255,255,255,0.08)",S.lineWidth=1;for(let M=-m/2;M<=m/2;M+=28)S.beginPath(),S.moveTo(M,-w/2),S.lineTo(M,w/2),S.stroke();for(let M=-w/2;M<=w/2;M+=28)S.beginPath(),S.moveTo(-m/2,M),S.lineTo(m/2,M),S.stroke();const R=Math.min(m,w)*.34,U=Math.sin(r.value*.55)*R*.035;if(T==="CT")S.beginPath(),S.ellipse(0,0,R*1.32,R*1.02,0,0,Math.PI*2),S.fillStyle="#27383b",S.fill(),S.strokeStyle="#435b5c",S.stroke(),S.fillStyle="rgba(0,0,0,0.78)",S.beginPath(),S.ellipse(-R*.42,0,R*.5,R*.73+U,0,0,Math.PI*2),S.fill(),S.beginPath(),S.ellipse(R*.42,0,R*.5,R*.73+U,0,0,Math.PI*2),S.fill(),S.strokeStyle="rgba(197,230,226,0.32)",S.lineWidth=1.2,S.beginPath(),S.ellipse(0,0,R*.15,R*.42,0,0,Math.PI*2),S.stroke(),h(S,R);else if(T==="MRI"){S.beginPath(),S.ellipse(0,0,R*.92,R*1.2,0,0,Math.PI*2),S.fillStyle="#26313b",S.fill(),S.strokeStyle="#4c5a69",S.lineWidth=3,S.stroke(),S.fillStyle="rgba(210,220,230,0.15)",S.beginPath(),S.ellipse(0,-R*.08,R*.48,R*.66,0,0,Math.PI*2),S.fill(),S.strokeStyle="rgba(230,240,244,0.2)",S.lineWidth=1;for(let M=1;M<5;M+=1)S.beginPath(),S.ellipse(0,0,R*M*.2,R*M*.26,0,0,Math.PI*2),S.stroke()}else S.fillStyle="#111b20",S.beginPath(),S.moveTo(-R*.65,-R*.55),S.quadraticCurveTo(-R*1.05,-R*.2,-R*.9,R*.25),S.lineTo(-R*.18,R*.55),S.lineTo(R*.18,R*.55),S.lineTo(R*.9,R*.25),S.quadraticCurveTo(R*1.05,-R*.2,R*.65,-R*.55),S.closePath(),S.fill(),S.strokeStyle="rgba(215,235,232,0.3)",S.stroke(),S.fillStyle="rgba(225,240,236,0.24)",S.beginPath(),S.ellipse(0,R*.05,R*.28,R*.4,0,0,Math.PI*2),S.fill();S.restore()}function h(S,m){S.strokeStyle="rgba(190,230,226,0.22)",S.lineWidth=1.2;for(let w=-1;w<=1;w+=2)for(let T=0;T<5;T+=1){const R=T/5*Math.PI-Math.PI*.2;S.beginPath(),S.moveTo(w*m*.15,m*.18*Math.cos(R)),S.lineTo(w*m*(.6+T*.06),m*(.32+T*.1)*Math.sin(R)),S.stroke()}}function f(S,m,w,T){const R=S.side==="right"?1:-1;if(T==="MRI")return{x:m/2+R*m*.13,y:w/2-w*.2};if(T==="X-Ray")return{x:m/2+R*m*.18,y:w/2-w*.08};const U=S.location.includes("upper")?-.2:S.location.includes("lower")?.23:0;return{x:m/2+R*m*.16,y:w/2+U*w}}function b(S,m,w){o.value=[],(t.findings??[]).filter(R=>R.organ==="Lung").forEach(R=>{if(!(t.examination.type==="CT"&&Math.abs(r.value-Math.ceil(t.examination.sliceCount*.58))<=2))return;const M=f(R,m,w,t.examination.type);o.value.push({finding:R,...M}),S.save(),S.shadowColor="rgba(255,90,102,0.9)",S.shadowBlur=12,S.strokeStyle="#ff6b75",S.fillStyle="rgba(255,107,117,0.26)",S.lineWidth=2,S.beginPath(),S.arc(M.x,M.y,8,0,Math.PI*2),S.fill(),S.stroke(),S.shadowBlur=0,S.fillStyle="#ffffff",S.beginPath(),S.arc(M.x,M.y,2.5,0,Math.PI*2),S.fill(),S.restore()})}function x(){const S=s.value;if(!S)return;const m=S.getContext("2d");if(!m)return;const w=S.clientWidth,T=S.clientHeight,R=window.devicePixelRatio||1;m.setTransform(R,0,0,R,0,0),d(m,w,T,t.examination.type),b(m,w,T)}function y(S){const m=Math.min(t.examination.sliceCount,Math.max(1,r.value+S));r.value=m}function g(S){a.value=Math.min(2.5,Math.max(1,Number((a.value+S).toFixed(1))))}function A(S){const m=s.value;if(!m)return;const w=m.getBoundingClientRect(),T=(S.clientX-w.left)/a.value,R=(S.clientY-w.top)/a.value,U=o.value.find(M=>Math.hypot(M.x-T,M.y-R)<18);U&&i("selectFinding",U.finding.id)}return sn(()=>{const S=new ResizeObserver(()=>{u(),x()});s.value&&(S.observe(s.value.parentElement),u(),x())}),Bt(()=>[r.value,a.value,t.examination.id],()=>x()),ns(()=>{o.value=[]}),(S,m)=>(Z(),de("div",VD,[_("div",{class:"viewer-canvas",style:Pi({transform:`scale(${a.value})`})},[_("canvas",{ref_key:"canvasRef",ref:s,onClick:A},null,512)],4),_("div",HD,[_("span",null,D(S.$t(n.examination.type))+" · "+D(S.$t(n.examination.organ)),1),_("span",null,D(S.$t("Slice"))+" "+D(S.$t(r.value))+" / "+D(S.$t(n.examination.sliceCount)),1)]),_("div",$D,[_("button",{type:"button",disabled:!l.value,"aria-label":S.$t("Previous slice"),onClick:m[0]||(m[0]=w=>y(-1))},[ne(J(Dy),{size:17})],8,GD),Nt(_("input",{"onUpdate:modelValue":m[1]||(m[1]=w=>r.value=w),type:"range",min:1,max:n.examination.sliceCount,step:"1","aria-label":S.$t("Slice position")},null,8,WD),[[Wi,r.value,void 0,{number:!0}]]),_("button",{type:"button",disabled:!c.value,"aria-label":S.$t("Next slice"),onClick:m[2]||(m[2]=w=>y(1))},[ne(J(Aa),{size:17})],8,XD),m[6]||(m[6]=_("span",{class:"control-divider"},null,-1)),_("button",{type:"button","aria-label":S.$t("Zoom out"),onClick:m[3]||(m[3]=w=>g(-.2))},[ne(J(od),{size:16})],8,qD),_("span",YD,D(S.$t(Math.round(a.value*100)))+"%",1),_("button",{type:"button","aria-label":S.$t("Zoom in"),onClick:m[4]||(m[4]=w=>g(.2))},[ne(J(ld),{size:16})],8,jD),_("button",{type:"button","aria-label":S.$t("Reset view"),onClick:m[5]||(m[5]=w=>a.value=1)},[ne(J(ad),{size:16})],8,KD)])]))}}),JD=at(ZD,[["__scopeId","data-v-414d9df0"]]),QD={class:"page"},eL={key:0,class:"exam-detail-grid"},tL={class:"card viewer-card"},nL={class:"card-header"},iL={class:"muted"},sL={class:"card-body"},rL={class:"exam-detail-side"},aL={class:"card"},oL={class:"card-header"},lL={class:"card-body"},cL={class:"exam-description"},uL={class:"exam-facts"},dL={class:"card"},hL={class:"card-header"},fL={class:"muted"},pL={class:"card-body"},mL={key:1,class:"empty-state"},gL=it({__name:"ExaminationDetailView",setup(n){const e=Ps(),t=Rn(),i=Nn(),s=pn(),r=Me(()=>{var u;return((u=i.session)==null?void 0:u.id)??"P20260021"}),a=Me(()=>String(e.params.id)),o=Me(()=>s.examinations.find(u=>u.id===a.value)),l=Me(()=>s.reviewedReports.find(u=>u.examinationId===a.value));function c(u){return u?new Intl.DateTimeFormat("en",{month:"long",day:"2-digit",year:"numeric"}).format(new Date(`${u}T00:00:00`)):""}return sn(async()=>{await s.loadPatientContext(r.value)}),(u,d)=>(Z(),de("div",QD,[_("button",{type:"button",class:"back-link",onClick:d[0]||(d[0]=h=>J(t).push({name:"patient-examinations"}))},[ne(J(Im),{size:16}),ot(" "+D(u.$t("My Examinations")),1)]),o.value?(Z(),de("section",eL,[_("div",tL,[_("div",nL,[_("div",null,[_("h3",null,D(u.$t(o.value.type))+" · "+D(u.$t(o.value.bodyPart)),1),_("p",iL,D(u.$t(c(o.value.date))),1)]),ne(Is,{status:o.value.status},null,8,["status"])]),_("div",sL,[o.value.id.startsWith("UPLOAD-")?(Z(),bt(Cg,{key:o.value.id,examination:o.value},null,8,["examination"])):(Z(),bt(JD,{key:1,examination:o.value,findings:[]},null,8,["examination"]))])]),_("aside",rL,[_("div",aL,[_("div",oL,[_("div",null,[_("h3",null,D(u.$t("About this examination")),1)]),ne(J(By),{size:18,class:"header-icon"})]),_("div",lL,[_("p",cL,D(u.$t(o.value.description)),1),_("dl",uL,[_("div",null,[_("dt",null,D(u.$t("Body region")),1),_("dd",null,D(u.$t(o.value.organ)),1)]),_("div",null,[_("dt",null,D(u.$t("Imaging type")),1),_("dd",null,D(u.$t(o.value.type)),1)]),_("div",null,[_("dt",null,D(u.$t("Images")),1),_("dd",null,D(u.$t(o.value.sliceCount)),1)])])])]),_("div",dL,[_("div",hL,[_("div",null,[_("h3",null,D(u.$t("Doctor's Report")),1),_("p",fL,D(u.$t("Only reviewed results are shown here.")),1)]),ne(J(As),{size:18,class:"header-icon"})]),_("div",pL,[l.value?(Z(),bt(Dr,{key:0,report:l.value,"patient-facing":""},null,8,["report"])):(Z(),de("div",mL,D(u.$t("Your doctor is still reviewing this examination.")),1))])])])])):tt("",!0)]))}}),vL=at(gL,[["__scopeId","data-v-106a834c"]]),_L={class:"page"},yL={class:"report-count"},bL={class:"reports-grid"},xL={key:0,class:"card empty-state"},SL=it({__name:"ReportsView",setup(n){const e=Nn(),t=pn(),i=Me(()=>{var s;return((s=e.session)==null?void 0:s.id)??"P20260021"});return sn(async()=>{await t.loadPatientContext(i.value)}),(s,r)=>(Z(),de("div",_L,[ne(Ir,{title:s.$t("My Reports"),subtitle:s.$t("Doctor-reviewed results, written for you.")},{actions:Zi(()=>[_("span",yL,[ne(J(Um),{size:15}),ot(" "+D(s.$t(J(t).reviewedReports.length))+" "+D(s.$t("reviewed")),1)])]),_:1},8,["title","subtitle"]),_("section",bL,[(Z(!0),de(lt,null,kt(J(t).reviewedReports,a=>(Z(),bt(Dr,{key:a.id,report:a,"patient-facing":""},null,8,["report"]))),128))]),!J(t).reviewedReports.length&&!J(t).loading?(Z(),de("div",xL,D(s.$t("No reviewed reports are available yet.")),1)):tt("",!0)]))}}),ML=at(SL,[["__scopeId","data-v-8ffc6633"]]),EL={class:"organ-copy"},wL=it({__name:"OrganCard",props:{organ:{},active:{type:Boolean}},emits:["select"],setup(n,{emit:e}){const t=e;return(i,s)=>(Z(),de("button",{class:Yt(["organ-card",{active:n.active}]),type:"button",onClick:s[0]||(s[0]=r=>t("select",n.organ))},[_("span",{class:"organ-dot",style:Pi({background:n.organ.color})},null,4),_("span",EL,[_("strong",null,D(i.$t(n.organ.label)),1),_("small",null,D(i.$t(n.organ.description)),1)]),ne(J(Aa),{size:17})],2))}}),AL=at(wL,[["__scopeId","data-v-e1ae771b"]]),TL={class:"page"},RL={class:"body-layout"},CL={class:"body-viewer card"},PL={class:"card-header"},IL={class:"muted"},DL={class:"card-body body-canvas"},LL={class:"organ-panel"},UL={class:"card"},NL={class:"card-header"},OL={class:"card-body organ-list"},FL={key:0,class:"lung-detail card"},kL={class:"card-header"},BL={class:"muted"},zL={class:"lung-chip"},VL={class:"card-body lung-detail-grid"},HL={class:"lung-report"},$L={class:"trust-note"},GL={key:1,class:"empty-state"},WL={key:1,class:"organ-detail card"},XL={class:"organ-detail-icon"},qL={class:"muted"},YL=it({__name:"BodyView",setup(n){const e=Nn(),t=pn(),i=ze("lung"),s=Me(()=>{var l;return((l=e.session)==null?void 0:l.id)??"P20260021"}),r=Me(()=>Go.find(l=>l.id===i.value)),a=Me(()=>t.reviewedReports[0]);function o(l){i.value=l}return sn(async()=>{t.reviewedReports.length||await t.loadPatientContext(s.value)}),(l,c)=>{var u,d;return Z(),de("div",TL,[ne(Ir,{title:l.$t("My Body"),subtitle:l.$t("Explore your digital human and understand your body.")},null,8,["title","subtitle"]),_("div",RL,[_("section",CL,[_("div",PL,[_("div",null,[_("h3",null,D(l.$t("Digital Human")),1),_("p",IL,D(l.$t("Select an organ for more information.")),1)])]),_("div",DL,[ne(Id,{"selected-organ-id":i.value,onSelect:o},null,8,["selected-organ-id"])])]),_("aside",LL,[_("div",UL,[_("div",NL,[_("h3",null,D(l.$t("Organs")),1)]),_("div",OL,[(Z(!0),de(lt,null,kt(J(Go),h=>(Z(),bt(AL,{key:h.id,organ:h,active:h.id===i.value,onSelect:f=>o(h.id)},null,8,["organ","active","onSelect"]))),128))])])])]),i.value==="lung"?(Z(),de("section",FL,[_("div",kL,[_("div",null,[_("h3",null,D(l.$t("Lung Examination")),1),_("p",BL,D(l.$t("Your latest doctor-reviewed lung information.")),1)]),_("span",zL,[ne(J(Pr),{size:14}),ot(" "+D(l.$t("Lung")),1)])]),_("div",VL,[ne(Pg,{findings:[]}),_("div",HL,[_("div",$L,[ne(J(Yy),{size:17}),_("span",null,D(l.$t("Only doctor-reviewed information is shown.")),1)]),a.value?(Z(),bt(Dr,{key:0,report:a.value,"patient-facing":""},null,8,["report"])):(Z(),de("div",GL,D(l.$t("Your lung report is being reviewed by your doctor.")),1))])])])):(Z(),de("section",WL,[_("div",XL,[ne(J(ya),{size:25})]),_("h3",null,D(l.$t((u=r.value)==null?void 0:u.label)),1),_("p",null,D(l.$t((d=r.value)==null?void 0:d.description)),1),_("span",qL,D(l.$t("The full organ module will be available in a future release.")),1)]))])}}}),jL=at(YL,[["__scopeId","data-v-0e2ce310"]]),Dg=wy({history:iy(),routes:[{path:"/",redirect:"/login"},{path:"/login",name:"login",component:sx,meta:{public:!0}},{path:"/doctor",component:Vh,meta:{portal:"doctor",requiresAuth:!0},children:[{path:"",redirect:"/doctor/dashboard"},{path:"dashboard",name:"doctor-dashboard",component:lS},{path:"patients",name:"doctor-patients",component:DS},{path:"patients/:id",component:GS,children:[{path:"",name:"doctor-patient-overview",component:oM},{path:"overview",redirect:{name:"doctor-patient-overview"}},{path:"imaging",name:"doctor-patient-imaging",component:GP},{path:"ai",name:"doctor-patient-ai",component:oI},{path:"report",name:"doctor-patient-report",component:OI},{path:"3d",name:"doctor-patient-3d",component:sD}]}]},{path:"/patient",component:Vh,meta:{portal:"patient",requiresAuth:!0},children:[{path:"",redirect:"/patient/dashboard"},{path:"dashboard",name:"patient-dashboard",component:ND},{path:"examinations",name:"patient-examinations",component:zD},{path:"examinations/:id",name:"patient-examination-detail",component:vL},{path:"reports",name:"patient-reports",component:ML},{path:"body",name:"patient-body",component:jL}]},{path:"/:pathMatch(.*)*",redirect:"/login"}]});Dg.beforeEach(n=>{const e=Nn(),t=!!n.meta.public;return!t&&!e.isAuthenticated?{name:"login",query:{redirect:n.fullPath}}:t&&e.isAuthenticated?e.portal==="doctor"?{name:"doctor-dashboard"}:{name:"patient-dashboard"}:n.meta.portal&&n.meta.portal!==e.portal?e.portal==="doctor"?{name:"doctor-dashboard"}:{name:"patient-dashboard"}:!0});const Sl=l0(y0);Sl.config.globalProperties.$t=ir;Sl.use(d0());Sl.use(Dg);Sl.mount("#app");export{jC as _,it as a,ns as b,KL as c,VC as d,Z as e,de as f,UC as g,_ as h,tt as i,ze as j,at as k,sn as o,kC as r,D as t};
