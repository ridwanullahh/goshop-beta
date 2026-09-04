// BismiLLAH Ar-Rahman Ar-Raheem.
// emails — contact / newsletter / referral-invite. Port of
// apps/api/src/handlers/emails.ts (POST /api/emails/{contact,newsletter,referral-invite}).
//
// The old chain emitted fire-and-forget email events and no-op'd without an
// SMTP transport. Here every accepted request is recorded into the
// `email_events` collection (queued) so a lightbase email relay can pick it
// up; the HTTP response contract is unchanged.
//
// Body: { op: 'contact'|'newsletter'|'referral-invite', ...payload }.
// referral-invite requires a valid GoShop JWT.

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200;
}

return handleSafe(async function () {
  var body = ctx.body || {};
  var op = body.op;

  if (op === 'contact') {
    var cName = String(body.name || '').trim();
    var cEmail = String(body.email || '').trim();
    var cMessage = String(body.message || '').trim();
    if (!cName || cName.length > 120) return jerr('Invalid input: name', 400);
    if (!validateEmail(cEmail)) return jerr('Invalid input: email', 400);
    if (!cMessage || cMessage.length > 5000) return jerr('Invalid input: message', 400);

    var adminEmail = (ctx.env && (ctx.env.ADMIN_EMAIL || ctx.env.SUPPORT_EMAIL)) || 'support@goshop.com';
    await recordEmailEvent('contactForm', adminEmail, {
      name: cName, email: cEmail, message: cMessage,
    }, { replyTo: cEmail, subject: 'Contact form: ' + cName });

    return json({ success: true, message: 'Your message has been received. We will get back to you soon.' }, 200);
  }

  if (op === 'newsletter') {
    var nEmail = String(body.email || '').trim();
    var nName = body.name ? String(body.name) : '';
    if (!validateEmail(nEmail)) return jerr('Invalid input: email', 400);
    if (nName.length > 120) return jerr('Invalid input: name', 400);

    var appUrl = (ctx.env && ctx.env.APP_URL) || '';
    var unsubscribeLink = appUrl
      ? appUrl + '/unsubscribe?email=' + encodeURIComponent(nEmail)
      : '/unsubscribe';
    await recordEmailEvent('newsletterWelcome', nEmail, {
      email: nEmail, name: nName, unsubscribeLink: unsubscribeLink,
    }, { subject: 'Welcome to the GoShop newsletter', listUnsubscribe: true });

    return json({ success: true, message: 'You are subscribed. Check your inbox for a welcome email.' }, 200);
  }

  if (op === 'referral-invite') {
    var user = await requireUser();
    var toEmail = String(body.toEmail || '').trim();
    var reward = body.rewardDescription ? String(body.rewardDescription) : '';
    if (!validateEmail(toEmail)) return jerr('Invalid input: toEmail', 400);
    if (reward.length > 280) return jerr('Invalid input: rewardDescription', 400);

    if (user.email && user.email.toLowerCase() === toEmail.toLowerCase()) {
      return jerr('You cannot send a referral invite to your own email address.', 400);
    }

    var referralCode = user.referralCode || '';
    var base = ((ctx.env && ctx.env.APP_URL) || '').replace(/\/$/, '');
    var referralLink = referralCode
      ? base + '/?ref=' + encodeURIComponent(referralCode)
      : base || '/';

    await recordEmailEvent('referralInvite', toEmail, {
      inviterName: user.name || user.firstName || 'A GoShop member',
      referralLink: referralLink,
      rewardDescription: reward || 'Earn rewards when your friends shop on GoShop.',
    }, { subject: (user.name || 'Your friend') + ' invited you to GoShop', listUnsubscribe: true });

    return json({ success: true, message: 'Invitation sent.' }, 200);
  }

  return jerr('Email endpoint not found', 404);
});
