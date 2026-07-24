/**
 * Cloudflare Pages Function — POST /api/waitlist
 *
 * Görevi: formdan gelen e-postayı doğrular, spam'i eler ve sunucu tarafında
 * (gizli token ile) Google Apps Script webhook'una iletir. Apps Script de
 * satırı Google E-Tablo'ya yazar.
 *
 * Cloudflare Pages → Settings → Environment variables kısmında iki değer gerekir:
 *   SHEET_WEBHOOK_URL : Apps Script "Web App" /exec adresi
 *   SHEET_TOKEN       : Apps Script içindeki TOKEN ile birebir aynı gizli anahtar
 *
 * Ayrıntılı kurulum: proje kökündeki DEPLOY-WAITLIST.md
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1) Gövdeyi oku
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const email = String(body.email || "").trim().toLowerCase();
  const honeypot = String(body.company || "").trim();

  // 2) Honeypot doluysa: bot. Sessizce "başarılı" dön, hiçbir şey yazma.
  if (honeypot) return json({ ok: true });

  // 3) E-posta doğrulama
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  // 4) Yapılandırma kontrolü
  if (!env.SHEET_WEBHOOK_URL || !env.SHEET_TOKEN) {
    return json({ ok: false, error: "not_configured" }, 500);
  }

  // 5) Google E-Tablo'ya ilet (sunucu tarafı → endpoint ve token gizli kalır)
  const payload = {
    token: env.SHEET_TOKEN,
    email,
    source: "flagr-site",
    userAgent: request.headers.get("user-agent") || "",
    ip: request.headers.get("cf-connecting-ip") || "",
    country: request.headers.get("cf-ipcountry") || "",
    ts: new Date().toISOString(),
  };

  try {
    const res = await fetch(env.SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow", // Apps Script /exec 302 ile yönlenir
    });
    if (!res.ok) return json({ ok: false, error: "store_failed" }, 502);
  } catch {
    return json({ ok: false, error: "store_error" }, 502);
  }

  return json({ ok: true });
}

// POST dışındaki metotlar için 405
export async function onRequestGet() {
  return json({ ok: false, error: "method_not_allowed" }, 405);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
