// BismiLLAH Ar-Rahman Ar-Raheem.
// translate — public translation endpoint. Port of
// apps/api/src/handlers/translate.ts.
//
// The old handler dynamically imported google-translate-api-x and no-op'd
// (returned the original text) wherever the import was unavailable (CF
// Workers). The sandbox has no module loader either, so this port calls the
// same public endpoint the library used, via the sandbox `fetch`, and falls
// back to the original text on ANY failure — identical observable behaviour,
// real translation when the network allows it. No secrets involved.
//
// Body: { text, targetLang, sourceLang? }. Returns { translatedText, ... }.

return handleSafe(async function () {
  var body = ctx.body || {};
  var text = body.text;
  var targetLang = body.targetLang;
  var sourceLang = body.sourceLang || 'en';

  if (!text || !targetLang) return jerr('Text and targetLang are required', 400);
  if (sourceLang === targetLang) return json({ translatedText: text }, 200);

  try {
    var url = 'https://translate.googleapis.com/translate_a/single' +
      '?client=gtx&sl=' + encodeURIComponent(sourceLang) +
      '&tl=' + encodeURIComponent(targetLang) +
      '&dt=t&q=' + encodeURIComponent(text);
    var res = await fetch(url);
    if (!res.ok) return json({ translatedText: text, error: 'Translation service unavailable' }, 200);
    var data = await res.json();
    var segments = data && data[0];
    var out = '';
    if (Array.isArray(segments)) {
      for (var i = 0; i < segments.length; i++) {
        if (Array.isArray(segments[i]) && typeof segments[i][0] === 'string') out += segments[i][0];
      }
    }
    if (!out) return json({ translatedText: text, error: 'Translation failed' }, 200);
    return json({ translatedText: out, sourceLang: data && data[2] }, 200);
  } catch (e) {
    return json({ translatedText: text, error: 'Translation failed' }, 200);
  }
});
