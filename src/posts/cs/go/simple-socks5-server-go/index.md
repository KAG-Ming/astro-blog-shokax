---
title: Implement a Simple SOCKS5 Server By Golang
categories:
  - Computer Science
  - Go
tags:
  - go
  - proxy
  - network
author: Onirexus
date: 2026-06-06 16:23:34
description: My implementation of a simple SOCKS5 server by Golang.
draft: true
cover: ./cover.avif
---
There already has been a number of mature industry-level implementation of SOCKS5-go, like [GitHub - armon/go-socks5: SOCKS5 server in Golang · GitHub](https://github.com/armon/go-socks5) Of course my version below is much worse than them, but it's just a practice during golang learning. And there may be some bugs.

## 1 SOCKS5 Introduction