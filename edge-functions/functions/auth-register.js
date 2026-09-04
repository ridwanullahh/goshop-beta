// BismiLLAH Ar-Rahman Ar-Raheem.
// auth-register — public function; enforces its own validation (no engine
// principal required). Port of apps/api/src/handlers/auth.ts (action=register).
// Body: { email, password, name, firstName?, lastName?, role?, roles?,
//         businessName?, phone?, onboardingCompleted?, referralCode? }
// Returns { user, token } (201).

return handleSafe(async function () {
  var body = ctx.body || {};
  var email = String(body.email || '').trim().toLowerCase();
  var password = String(body.password || '');
  var name = String(body.name || '').trim();

  if (!email || email.indexOf('@') === -1) return jerr('Invalid input: email', 400);
  if (password.length < 6) return jerr('Invalid input: password must be at least 6 characters', 400);
  if (!name) return jerr('Invalid input: name is required', 400);

  var role = body.role ? String(body.role) : 'customer';
  var roles = Array.isArray(body.roles) && body.roles.length > 0 ? body.roles.map(String) : [role];

  var existing = await qOne('users', { email: email });
  if (existing) return jerr('User already exists with this email', 409);

  var passwordHash = await hashPassword(password);

  var referralSeed = String(name).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  var user = await qInsert('users', {
    email: email,
    passwordHash: passwordHash,
    name: name,
    firstName: body.firstName ? String(body.firstName) : undefined,
    lastName: body.lastName ? String(body.lastName) : undefined,
    role: role,
    roles: roles,
    businessName: body.businessName ? String(body.businessName) : undefined,
    phone: body.phone ? String(body.phone) : undefined,
    onboardingCompleted: !!body.onboardingCompleted,
    verified: false,
    referralCode: referralSeed + Math.floor(1000 + Math.random() * 9000),
  });

  // Wallet + inherent referral code record (best-effort, like the old handler).
  try { await qInsert('wallets', { userId: user.id, balance: 0 }); } catch (e) {}
  try {
    await qInsert('referral_codes', { userId: user.id, code: user.referralCode, userType: role, isActive: true });
  } catch (e) {}

  // Inherent referral linking.
  if (body.referralCode) {
    try {
      var referrer = await qOne('users', { referralCode: String(body.referralCode) });
      if (referrer && referrer.id !== user.id) {
        await qUpdate('users', user.id, { referredBy: referrer.id });
        await qUpdate('users', referrer.id, { referralCount: (referrer.referralCount || 0) + 1 });
        var rc = await qOne('referral_codes', { userId: referrer.id });
        if (rc) await qUpdate('referral_codes', rc.id, { signups: (rc.signups || 0) + 1 });
      }
    } catch (err) {
      console.error('[auth-register] referral application failed:', String(err && err.message ? err.message : err));
    }
  }

  var token = await generateToken(user.id);
  var safeUser = {};
  for (var k in user) { if (k !== 'passwordHash') safeUser[k] = user[k]; }

  // Welcome email event (+ seller agreement copy for sellers) — recorded, not sent.
  var appUrl = (ctx.env && ctx.env.APP_URL) || '';
  var dashboardLink = appUrl ? appUrl.replace(/\/$/, '') + '/dashboard' : '/dashboard';
  await recordEmailEvent('welcome', user.email, { name: user.name || user.firstName || '', role: role, dashboardLink: dashboardLink });
  if (role === 'seller') {
    await recordEmailEvent('sellerAgreement', user.email, {
      name: user.name || user.firstName || '',
      commissionRate: 5,
      agreementContent:
        'As a GoShop seller, you agree to: (1) list only authentic products, ' +
        '(2) ship orders within the stated handling time, (3) honor refunds per our return policy, ' +
        '(4) pay the platform commission on each completed sale, and (5) maintain honest communication ' +
        'with buyers. Violations may result in store suspension.',
    });
  }

  return json({ user: safeUser, token: token }, 201);
});
