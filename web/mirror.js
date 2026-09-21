/* Mirrored Care — 환자가 고른 항목만 담은 스냅샷 링크 (서버 없음)
   payload: { v:1, n:name|null, d:days, s:'latest'|'trend', at:'YYYY-MM-DD', i:['egfr','bp',...], e:[ [date, egfr, cr, sbp, dbp, wt, [sym], [foodtags], note] ... ], f:{tag:count} }
   encode: JSON → UTF-8 → deflate-raw (CompressionStream) → base64url. fallback: base64url JSON with prefix 'j.' */
window.Mirror = (() => {
  const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
  async function pipe(u8, kind, mode) {
    const cs = new (mode === 'c' ? CompressionStream : DecompressionStream)(kind);
    const w = cs.writable.getWriter(); w.write(u8); w.close();
    return new Uint8Array(await new Response(cs.readable).arrayBuffer());
  }
  async function encode(obj) {
    const json = JSON.stringify(obj), u8 = new TextEncoder().encode(json);
    if (typeof CompressionStream === 'function') { try { return 'z.' + b64u(await pipe(u8, 'deflate-raw', 'c')); } catch (e) {} }
    return 'j.' + b64u(u8);
  }
  async function decode(str) {
    const [k, body] = [str.slice(0, 2), str.slice(2)];
    const u8 = unb64u(body);
    const raw = k === 'z.' ? await pipe(u8, 'deflate-raw', 'd') : u8;
    return JSON.parse(new TextDecoder().decode(raw));
  }
  // build payload from state
  function build(S, opts) {
    const { items, days, depth, showName } = opts;
    const from = new Date(); from.setDate(from.getDate() - days); const f = from.toISOString().slice(0, 10);
    let es = [...S.entries].filter(e => e.date > f).sort((a, b) => a.date < b.date ? -1 : 1);
    const has = k => items.includes(k);
    const rows = es.map(e => [e.date,
      has('egfr') ? (e.egfr ?? null) : null, has('egfr') ? (e.cr ?? null) : null,
      has('bp') ? (e.sbp ?? null) : null, has('bp') ? (e.dbp ?? null) : null,
      has('wt') ? (e.wt ?? null) : null,
      has('sym') ? (e.sym || []) : [],
      has('food') ? ((e.food && e.food.tags) || []) : [],
      has('notes') ? (e.note || '') : '',
    ]).filter(r => r[1] != null || r[3] != null || r[5] != null || r[6].length || r[7].length || r[8]);
    let out = rows;
    if (depth === 'latest') {
      // keep only the last row that has each kind of value
      const pick = idx => [...rows].reverse().find(r => (Array.isArray(r[idx]) ? r[idx].length : (r[idx] != null && r[idx] !== '')));
      const keep = new Set([pick(1), pick(3), pick(5), pick(6), pick(7), pick(8)].filter(Boolean).map(r => r[0]));
      out = rows.filter(r => keep.has(r[0]));
    }
    return { v: 1, n: showName ? S.profile.name : null, d: days, s: depth, at: new Date().toISOString().slice(0, 10), i: items, e: out };
  }
  return { encode, decode, build };
})();
