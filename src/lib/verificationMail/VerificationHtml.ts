export default function VerificationHtml(verificationUrl: string) {
  const origin = new URL(verificationUrl).origin;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background-color:#1f1f1f;color:#fff;font-family:'Funnel Sans',sans-serif;">
  <div style="max-width:600px;margin:40px auto;padding:20px;background-color:#25282b;border-radius:8px;">
    <div style="text-align:center;margin-bottom:20px;">
      <img src="${origin}/assets/logow.png" alt="IoT Hub" width="120" style="display:block;margin:0 auto;" />
    </div>
    <h1 style="color:#3498db;text-align:center;">Verify Your Email</h1>
    <p style="font-size:16px;line-height:1.5;">Thank you for signing up! Please verify your email address by clicking the button below.</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${verificationUrl}" style="background-color:#3498db;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:600;">Verify Email</a>
    </div>
    <p> Or copy and paste the following link into your browser: <a href="${verificationUrl}" style="color:#3498db;text-decoration:none;">${verificationUrl}</a></p>
    <p style="font-size:12px;color:#aaa;text-align:center;">This link will expire in 30 minutes.</p>
    <hr style="border:none;border-top:1px solid #444;margin:20px 0;" />
    <p style="font-size:12px;color:#aaa;text-align:center;">If you did not create an account, you can ignore this email.</p>
  </div>
</body>
</html>`;
}
