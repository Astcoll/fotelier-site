// Keep the no-JavaScript form action in sync with the sole username setting.
import { readFileSync, writeFileSync } from 'node:fs';
const script = readFileSync(new URL('../assets/site.js', import.meta.url), 'utf8');
const user = script.match(/const BUTTONDOWN_USER = "([a-zA-Z0-9_-]+)";/)?.[1];
if (!user) throw new Error('Set BUTTONDOWN_USER to a valid Buttondown username.');
const path = new URL('../index.html', import.meta.url);
const html = readFileSync(path, 'utf8');
const endpoint = 'https://buttondown.com/api/emails/embed-subscribe/' + encodeURIComponent(user);
const updated = html.replace(/(class="waitlist" action=")[^"]+/, '$1' + endpoint);
if (updated === html && !html.includes('class="waitlist" action="' + endpoint + '"')) {
  throw new Error('Could not find the waitlist form action.');
}
writeFileSync(path, updated);
console.log('HTML waitlist action synchronized.');
