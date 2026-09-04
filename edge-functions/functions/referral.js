// BismiLLAH Ar-Rahman Ar-Raheem.
// referral — inherent per-user referral stats + click tracking. Port of
// apps/api/src/handlers/referral.ts.
//
// op === 'track' (public click tracking): { op: 'track', code }.
// Default (stats): requires a GoShop JWT — { } with Authorization header.

return handleSafe(async function () {
  var body = ctx.body || {};

  // POST { code } — anonymous click tracking (no auth in the old handler).
  if (body.op === 'track') {
    var tcode = body.code;
    if (!tcode) return jerr('Referral code required', 400);
    var tReferrer = await qOne('users', { referralCode: String(tcode) });
    if (!tReferrer) return jerr('Invalid referral code', 404);
    var tRc = await qOne('referral_codes', { userId: tReferrer.id });
    if (tRc) {
      await qUpdate('referral_codes', tRc.id, { clicks: (tRc.clicks || 0) + 1 });
    }
    return json({ success: true }, 200);
  }

  // GET — authenticated referral stats.
  var user = await requireUser();
  var rc = await qOne('referral_codes', { userId: user.id });
  var referrals = await qAll('users', { referredBy: user.id }, 1000);
  var safeReferrals = [];
  for (var i = 0; i < referrals.length; i++) {
    var r = {};
    for (var k in referrals[i]) { if (k !== 'passwordHash') r[k] = referrals[i][k]; }
    safeReferrals.push(r);
  }

  var appUrl = (ctx.env && ctx.env.APP_URL) || '';
  return json({
    code: user.referralCode,
    clicks: (rc && rc.clicks) || 0,
    signups: (rc && rc.signups) || 0,
    earnings: (rc && rc.earnings) || user.referralEarnings || 0,
    referralCount: user.referralCount || 0,
    referralLink: appUrl + '/?ref=' + user.referralCode,
    referrals: safeReferrals,
  }, 200);
});
