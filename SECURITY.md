# Security Policy

Level 100 runs entirely in the browser: there is no backend, no account and no upload.
Rulesets are shared by encoding them into the URL.

If you discover a vulnerability (for example in how shared links are parsed, the
Content Security Policy, or the build/deploy pipeline), please report it privately.

- Email: lvl100@9xb.de
- Please include steps to reproduce and, if possible, an example link.

You will receive a response within 7 days. Please do not open a public issue
for security reports until a fix has been released.

Dependencies are monitored with Dependabot and `yarn npm audit` runs in CI.
