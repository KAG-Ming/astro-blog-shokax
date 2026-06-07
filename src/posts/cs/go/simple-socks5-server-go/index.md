---
title: Implementing a Simple SOCKS5 Proxy Server with Golang
categories:
  - Computer Science
  - Go
tags:
  - go
  - proxy
  - network
author: Onirexus
date: 2026-06-06 16:23:34
description: Build a lightweight, functional SOCKS5 proxy server from scratch in Go, walking through RFC 1928 phase by phase to understand TCP stream handling.
draft: false
cover: ./cover.avif
---
While robust, production-grade SOCKS5 libraries like [GitHub - armon/go-socks5: SOCKS5 server in Golang · GitHub](https://github.com/armon/go-socks5) already exist in the Go ecosystem, I decided to build a minimalist SOCKS5 server from scratch as a learning project.  Please note that this version is meant for practice and may still contain bugs.

## 1 SOCKS5 Introduction

![socks5-diagram](cover.avif)

SOCKS5 is a session-layer proxy protocol designed to relay diverse network protocols. It offers robust proxy capabilities, supporting both TCP and UDP (note that the UDP part is omitted here) along with flexible authentication mechanisms.

According to RFC 1928, the client initially sends its version and supported methods to negotiate with the SOCKS5 server. After authentication, it issues a connect request. The proxy server then connects to the target server and forward the data back to the client. Unlike standard TCP  connections, SOCKS5 requires authentication to ensure security. 

### Ref: [RFC 1928 - SOCKS Protocol Version 5](https://datatracker.ietf.org/doc/html/rfc1928)

## 2 Overall Structure

Before diving into the protocol details, let's look at the overall structure of our SOCKS5 server. We define the essential protocol constants according to RFC 1928, and implement a standard TCP listener in the `main` function.

To handle multiple clients concurrently, the server spawns a new Goroutine for each incoming connection, directing it to `handleConnection`:
```go
const (
socks5Version = 0x05
methodNoAuth = 0x00
cmdConnect = 0x01
atypIPv4 = 0x01
atypDomain = 0x03
atypIPv6 = 0x04
statusSuccess = 0x00
statusFailure = 0x01
)
const timeoutDuration = 5 * time.Second

func main() {
	addr := "127.0.0.1:8080"
	listener, err := net.Listen("tcp", addr)
	if err != nil {
	log.Fatalf("Listen failed: %v", err)
	}

	defer listener.Close()
	log.Printf("SOCKS5 Server launched, listening at %s...", addr)  
	for {
		conn, err := listener.Accept()
		if err != nil {
		log.Printf("Accept connection failed: %v", err)
		continue
	}	
	go handleConnection(conn)
	}
}
```

The `handleConnection` function acts as the pipeline commander for each client. It perfectly mirrors the SOCKS5 lifecycle by breaking it down into four distinct phases: authentication, request parsing, destination connection, and data relaying.

```go
func handleConnection(conn net.Conn) {
	defer conn.Close()
	
	if err := socks5Auth(conn); err != nil {
		log.Printf("Auth failed from %s: %v", conn.RemoteAddr(), err)
		return
	}
	
	address, port, err := socks5ReadRequest(conn)
	if err != nil {
		log.Printf("Read request failed from %s: %v", conn.RemoteAddr(), err)
		return
	}
	  
	destConn, err := connectDestServer(conn, address, port)
	if err != nil {
		log.Printf("Connect to dest %s:%d failed: %v", address, port, err)
		return
	}
	
	defer destConn.Close()
	forward(conn, destConn)
}
```
With this overview in place, we can now implement each phase step by step.

## 3 Handshake & Authentication

First, the client sends a message with protocol version and authentication methods:

| Field | VER  | NMETHODS | METHODS |
| ----- | ---- | -------- | ------- |
| Byte  | 1    | 1        | 1-255   |
| Value | 0x05 |          |         |

```go
func socks5Auth(conn net.Conn) error {
	_ = conn.SetReadDeadline(time.Now().Add(timeoutDuration))
	
	var buf [2]byte
	if _, err := io.ReadFull(conn, buf[:2]); err != nil {
		return fmt.Errorf("read header failed: %w", err)
	}
	
	if buf[0] != socks5Version {
		return fmt.Errorf("unsupported version: 0x%02x", buf[0])
	}
	  
	numMethods := int(buf[1])
	var methodsBuf [256]byte
	methods := methodsBuf[:numMethods]
	if _, err := io.ReadFull(conn, methods); err != nil {
		return fmt.Errorf("read methods failed: %w", err)
	} 
	
	if !slices.Contains(methods, methodNoAuth) {
		return errors.New("no acceptable auth methods")
	}
	
	_ = conn.SetReadDeadline(time.Time{}) 
	
	if _, err := conn.Write([]byte{socks5Version, methodNoAuth}); err != nil {
		return fmt.Errorf("write auth response failed: %w", err)
	}
	return nil
}
```
## 4 Client Request Parsing
```go
func socks5ReadRequest(conn net.Conn) (string, int, error) {
	_ = conn.SetReadDeadline(time.Now().Add(timeoutDuration))
	
	var buf [4]byte
	if _, err := io.ReadFull(conn, buf[:4]); err != nil {
		return "", 0, fmt.Errorf("read request header failed: %w", err)
	}
	if buf[0] != socks5Version || buf[1] != cmdConnect || buf[2] != 0x00 {
		return "", 0, errors.New("invalid request header flags")
	}
	
	var host string
	atyp := buf[3]
	switch atyp {
		case atypIPv4:
			var ipBuf [4]byte
			if _, err := io.ReadFull(conn, ipBuf[:]); err != nil {
				return "", 0, fmt.Errorf("read IPv4 failed: %w", err)
			}
			host = net.IP(ipBuf[:]).String() 
			
		case atypDomain:
			var lenBuf [1]byte
			if _, err := io.ReadFull(conn, lenBuf[:]); err != nil {
				return "", 0, fmt.Errorf("read domain length failed: %w", err)
			}
			
			domainLen := int(lenBuf[0])
			domainBuf := make([]byte, domainLen)
			if _, err := io.ReadFull(conn, domainBuf); err != nil {
				return "", 0, fmt.Errorf("read domain name failed: %w", err)
			}
			host = string(domainBuf)
			
		case atypIPv6:
			var ipBuf [16]byte
			if _, err := io.ReadFull(conn, ipBuf[:]); err != nil {
				return "", 0, fmt.Errorf("read IPv6 failed: %w", err)
			}
			host = net.IP(ipBuf[:]).String()
			
		default:
			return "", 0, fmt.Errorf("unsupported address type: 0x%02x", atyp)
		}
		
	var portBuf [2]byte
	if _, err := io.ReadFull(conn, portBuf[:]); err != nil {
		return "", 0, fmt.Errorf("read port failed: %w", err)
	}
	
	_ = conn.SetReadDeadline(time.Time{})
	
	port := int(binary.BigEndian.Uint16(portBuf[:]))
	return host, port, nil
}
```
## 5 Connecting & Replying
```go
func connectDestServer(conn net.Conn, address string, port int) (net.Conn, error) {
	destAddr := net.JoinHostPort(address, strconv.Itoa(port))
	destConn, err := net.DialTimeout("tcp", destAddr, timeoutDuration)
	if err != nil {
		_, _ = conn.Write([]byte{socks5Version, statusFailure, 0x00, atypIPv4, 0, 0, 0, 0, 0, 0})
		return nil, err
	}
	
	if _, err := conn.Write([]byte{0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0}); err != nil {
	destConn.Close()
		return nil, fmt.Errorf("write success reply failed: %w", err)
	}
	
	return destConn, nil
}
```
## 6 Data Forwarding
```go
func forward(conn, destConn net.Conn) {
	go func() {
		_, _ = io.Copy(destConn, conn)
		destConn.Close()
	}()
	
	_, _ = io.Copy(conn, destConn)
}
```

## 7 Verifying
