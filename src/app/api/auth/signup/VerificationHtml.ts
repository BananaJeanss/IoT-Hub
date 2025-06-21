export default function VerificationHtml(verificationUrl: string) {
  return `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>
    <p>This link will expire in 30 minutes.</p>
    <br />
    <p>If you did not create an account, you can ignore this email.</p>
    `;
}
