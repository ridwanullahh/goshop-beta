// BismiLLAH Ar-Rahman Ar-Raheem.
// auth-me — public function that enforces the app-level Bearer JWT itself.
// Port of apps/api/src/handlers/auth.ts (GET /api/auth).
// Headers (invoke envelope): { authorization: "Bearer <jwt>" }.
// Returns the safe user document (passwordHash stripped).

return handleSafe(async function () {
  var auth = (ctx.headers && (ctx.headers.authorization || ctx.headers['Authorization'])) || '';
  if (String(auth).indexOf('Bearer ') !== 0) return jerr('No token provided', 401);

  var decoded = await verifyToken(String(auth).slice(7));
  if (!decoded) return jerr('Invalid token', 401);

  var user = await qGet('users', decoded.userId);
  if (!user) return jerr('User not found', 404);

  var safeUser = {};
  for (var k in user) { if (k !== 'passwordHash') safeUser[k] = user[k]; }
  return json(safeUser, 200);
});
