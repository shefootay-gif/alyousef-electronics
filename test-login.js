const fetch = require("node-fetch");

async function testLogin() {
  const res = await fetch("https://alyousef-electronics-1.onrender.com/api/trpc/auth.login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      json: {
        email: "admin@alyousef.com",
        password: "admin123"
      }
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  if (data.result && data.result.data && data.result.data.json && data.result.data.json.token) {
    const token = data.result.data.json.token;
    const meRes = await fetch("https://alyousef-electronics-1.onrender.com/api/trpc/auth.me", {
      headers: {
        "Cookie": `token=${token}`
      }
    });
    const meData = await meRes.json();
    console.log("ME:", JSON.stringify(meData, null, 2));
  }
}

testLogin().catch(console.error);
