---
title: Announcement
---
Welcome! You are currently browsing from 
<span id="visitor-geo" style="color: #10b981; font-weight: bold;">Loading...</span> 
(IP: <span id="visitor-ip" style="color: #10b981; font-weight: bold;">Loading...</span>).

<script>
  fetch('https://ipapi.is/')
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

This widget is **purely client-side**:
* Static site with no database.
* Queries `ipapi.co` directly under a strict no-log policy.
* Press `F12` > `Network` to verify no data leaks back here.

*Feel free to block it via VPN or ad-blocker.*