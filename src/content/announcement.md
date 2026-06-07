---
title: Announcement
---

Welcome! You are currently browsing from
<span id="visitor-geo" style="color: #10b981; font-weight: bold;">Loading...</span>
<span id="visitor-ip" style="color: #10b981; font-weight: bold;">Loading...</span>.

<script>
  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      document.getElementById('visitor-geo').innerText = `${data.city}, ${data.country_name}`;
      document.getElementById('visitor-ip').innerText = data.ip;
    })
    .catch(() => {
      document.getElementById('visitor-geo').innerText = "the internet";
      document.getElementById('visitor-ip').innerText = "hidden";
    });
</script>

**[Data Policy]** Client-side IP fetch via `ipapi.co` (no-log). No data leaks or saves to this server.
**[Credits]** Avatar art by [缘霜 @ LOFTER](https://woyoudongle.lofter.com/post/30b9bb4c_2bf02f659?incantation=rzqgK6lX7N0f). Cover images rotate from web sources for layout testing only (non-commercial). Contact via email for opt-out.

<details>
<summary style="font-size: 0.85em; color: #6b7280; cursor: pointer; font-style: italic;">View all featured cover artists</summary>

- [夢遊戰士 @ LOFTER](https://476307015.lofter.com/post/485b67_2bd951345?incantation=rzYzQYj6BicX)
- [葡萄酪酪冰 @ LOFTER](https://putaolaolaoww.lofter.com/post/20142db9_2bdaf7a7e?incantation=rzSKsP9FqJgL)
- [肆久49 @ LOFTER](https://huinileimuamao.lofter.com/post/1e320600_2bcbc2f0c?incantation=rzYrErJb6iMA)
- [豆油 @ LOFTER](https://shoutiyijinyuanyedexiaoshige.lofter.com/post/31d49761_2bdfb58e4?incantation=rzBXnJOjhgAZ)
</details>
