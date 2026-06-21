async function test() {
  const loginRes = await fetch('https://alyousef-electronics-1.onrender.com/api/trpc/auth.login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ json: { email: 'admin@alyousef.com', password: 'admin123' } })
  });
  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie:', cookieHeader);

  // Extract kimi_sid from cookieHeader
  const match = cookieHeader.match(/kimi_sid=([^;]+)/);
  if (match) {
    const token = match[1];
    const meRes = await fetch('https://alyousef-electronics-1.onrender.com/api/trpc/auth.me', {
      headers: { 'Cookie': `kimi_sid=${token}` }
    });
    const meData = await meRes.json();
    console.log('auth.me response:', JSON.stringify(meData));
  } else {
    console.log('No kimi_sid cookie found');
  }
}
test().catch(console.error);
