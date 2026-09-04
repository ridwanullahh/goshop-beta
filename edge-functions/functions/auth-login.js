// BismiLLAH Ar-Rahman Ar-Raheem.
// auth-login — public function; enforces its own credential check.
// Port of apps/api/src/handlers/auth.ts (action=login).
// Body: { email, password }. Returns { user, token }.

return handleSafe(async function () {
  var body = ctx.body || {};
  var email = String(body.email || '').trim().toLowerCase();
  var password = String(body.password || '');

  if (!email || email.indexOf('@') === -1) return jerr('Invalid input: email', 400);
  if (!password) return jerr('Invalid input: password is required', 400);

  var user = await qOne('users', { email: email });
  if (!user || !user.passwordHash) return jerr('Invalid credentials', 401);

  var isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return jerr('Invalid credentials', 401);

  var token = await generateToken(user.id);
  var safeUser = {};
  for (var k in user) { if (k !== 'passwordHash') safeUser[k] = user[k]; }

  return json({ user: safeUser, token: token }, 200);
});
