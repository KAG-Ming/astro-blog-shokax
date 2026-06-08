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
description: Build a lightweight SOCKS5 proxy server from scratch in Go, walking through RFC 1928 phase by phase to understand TCP stream handling.
draft: false
cover: ./cover.avif
---
The complete source code for this project is available on GitHub: [GitHub - KAG-Ming/simple-socks5-go: A simple implementation of SOCKS5 with Golang. · GitHub](https://github.com/KAG-Ming/simple-socks5-go)

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
	addr := "127.0.0.1:1080"
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

The protocol begins with a negotiation phase. The client connects to the proxy server and sends an initial request specifying its protocol version and all supported authentication methods.

| **Field** |      VER      |             NMETHODS             |              METHODS              |
|:---------:|:-------------:|:--------------------------------:|:---------------------------------:|
| **Bytes** |       1       |                 1                |              1 to 255             |
| **Value** | fixed to 0x05 | Number of supported auth methods | List of supported auth method IDs |

`METHODS` means specific methods to authenticate. For example, `0x00` for NO AUTHENTICATION, `0x02` for USERNAME/PASSWORD.

Upon receiving this request, the server must first validate the protocol version. If verified, it parses the method list to select an acceptable authentication method.

Here we create a [2]byte variable to serve as a buffer, receiving the `VERSION` and `NMETHODS` field. Notice that we use `io.ReadFull` rather than a standard `Read`. This ensures that our server blocks and waits until both bytes are completely read from the socket, preventing errors caused by partial tcp reads. If the protocol version is incorrect, we abort the connection immediately.
```go
var buf [2]byte
if _, err := io.ReadFull(conn, buf[:2]); err != nil {
	return fmt.Errorf("read header failed: %w", err)
}
// verify VERSION == 0x05
if buf[0] != socks5Version {
	return fmt.Errorf("unsupported version: 0x%02x", buf[0])
}  
numMethods := int(buf[1])
```

Next, we need to read the `METHODS` field. Since `NMETHODS` is represented by a single byte, its maximum value can never exceed 255. Therefore, we can safely allocate a 256-byte array on the stack. By slicing it down to the exact length needed (`methodsBuf[:numMethods]`), we can efficiently read the data without triggering any dynamic dynamic-heap allocation.
```go
var methodsBuf [256]byte
methods := methodsBuf[:numMethods]
if _, err := io.ReadFull(conn, methods); err != nil {
	return fmt.Errorf("read methods failed: %w", err)
} 
	
if !slices.Contains(methods, methodNoAuth) {
	return errors.New("no acceptable auth methods")
}
```

To keep it simple, here I just used the no-auth method. Finally, the handshake ends with the server sending its choice back to the client.

| **Field** |  VER |           METHOD           |
|:---------:|:----:|:--------------------------:|
|  **Size** |   1  |              1             |
| **Value** | 0x05 | Chosen method (e.g., 0x00) |

We construct this 2-byte response packet and write it back to the client connection to complete the handshake:
```go
if _, err := conn.Write([]byte{socks5Version, methodNoAuth}); err != nil {
	return fmt.Errorf("write auth response failed: %w", err)
}
return nil
```

The whole function is like this:
```go
func socks5Auth(conn net.Conn) error {
	_ = conn.SetReadDeadline(time.Now().Add(timeoutDuration))
	
	// receive VERSION and NMETHODS
	var buf [2]byte
	if _, err := io.ReadFull(conn, buf[:2]); err != nil {
		return fmt.Errorf("read header failed: %w", err)
	}
	
	if buf[0] != socks5Version {
		return fmt.Errorf("unsupported version: 0x%02x", buf[0])
	}  
	numMethods := int(buf[1])
	
	// choose a method to authenticate
	var methodsBuf [256]byte
	methods := methodsBuf[:numMethods]
	if _, err := io.ReadFull(conn, methods); err != nil {
		return fmt.Errorf("read methods failed: %w", err)
	} 
	
	if !slices.Contains(methods, methodNoAuth) {
		return errors.New("no acceptable auth methods")
	}
	
	_ = conn.SetReadDeadline(time.Time{}) 
	
	// write back to the client
	if _, err := conn.Write([]byte{socks5Version, methodNoAuth}); err != nil {
		return fmt.Errorf("write auth response failed: %w", err)
	}
	return nil
}
```

Once the handshake is complete, usually an authentication sub-negotiation stage would occur here. However, since we selected the no-auth method, we skip straight to parsing the client's connection request.

## 4 Client Request Parsing

According to RFC 1928, the client sends a request packet formatted as follows:

| **Field** |   VER  |                       CMD                       |   RSV  |                  ATYP                 |           DST.ADDR          |                     DST.PORT                    |
|:---------:|:------:|:-----------------------------------------------:|:------:|:-------------------------------------:|:---------------------------:|:-----------------------------------------------:|
| **Bytes** |    1   |                        1                        |    1   |                   1                   |           Variable          |                        2                        |
| **Value** | `0x05` | CONNECT `0x01` BIND `0x02` UDP ASSOCIATE `0x03` | `0x00` | IPV4 `0x01` DOMAIN `0x03` IPV6 `0x04` | desired destination address | desired destination port in network octet order |
To begin parsing, we read the first 4 bytes (`VER`, `CMD`, `RSV`, and `ATYP`) into a static buffer and validate the flags immediately.
```go
var buf [4]byte
if _, err := io.ReadFull(conn, buf[:4]); err != nil {
	return "", 0, fmt.Errorf("read request header failed: %w", err)
}
// validate version, command (CONNECT only), and the reserved
if buf[0] != socks5Version || buf[1] != cmdConnect || buf[2] != 0x00 {
	return "", 0, errors.New("invalid request header flags")
}
```

Next, we extract the destination `host` based on the address type. Since the length and structure of `DST.ADDR` depend entirely on `ATYP`, we use a switch statement to process each case.
```go
var host string
atyp := buf[3]

switch atyp {
case atypIPv4:
	// ipv4 address has a fixed size of 4 bytes
	var ipBuf [4]byte
	if _, err := io.ReadFull(conn, ipBuf[:]); err != nil {
		return "", 0, fmt.Errorf("read IPv4 failed: %w", err)
	}
	host = net.IP(ipBuf[:]).String() 

case atypDomain:
	// for domain names, the first byte indicates the length of the domain string
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
	// ipv6 address has a fixed size of 16 bytes
	var ipBuf [16]byte
	if _, err := io.ReadFull(conn, ipBuf[:]); err != nil {
		return "", 0, fmt.Errorf("read IPv6 failed: %w", err)
	}
	host = net.IP(ipBuf[:]).String()

default:
	return "", 0, fmt.Errorf("unsupported address type: 0x%02x", atyp)
}
```

Finally, we read the last 2 bytes containing the destination port. Because network protocols transmit data using Big-Endian byte order, we leverage Go's `binary.BigEndian.Uint16` to decode the raw bytes into a standard native integer.
```go
var portBuf [2]byte
if _, err := io.ReadFull(conn, portBuf[:]); err != nil {
	return "", 0, fmt.Errorf("read port failed: %w", err)
}
	
port := int(binary.BigEndian.Uint16(portBuf[:]))
return host, port, nil
```

The function in this part:
```go
func socks5ReadRequest(conn net.Conn) (string, int, error) {
	// Set a read deadline to prevent slow-loris attacks or hung connections
	_ = conn.SetReadDeadline(time.Now().Add(timeoutDuration))
	
	// read and validate the fixed 4-byte header
	var buf [4]byte
	if _, err := io.ReadFull(conn, buf[:4]); err != nil {
		return "", 0, fmt.Errorf("read request header failed: %w", err)
	}
	if buf[0] != socks5Version || buf[1] != cmdConnect || buf[2] != 0x00 {
		return "", 0, errors.New("invalid request header flags")
	}
	
	// parse the target destination address based on ATYP
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
	
	// read and decode the 2-byte port number
	var portBuf [2]byte
	if _, err := io.ReadFull(conn, portBuf[:]); err != nil {
		return "", 0, fmt.Errorf("read port failed: %w", err)
	}
	
	// reset the deadline before returning control to the connection pipeline
	_ = conn.SetReadDeadline(time.Time{})
	
	port := int(binary.BigEndian.Uint16(portBuf[:]))
	return host, port, nil
}
```

## 5 Connecting & Replying

Now that the target address and port have been successfully extracted from the client's request, our proxy server enters the execution phase. Its mission here is two-fold: establish a real tcp connection to the remote destination server, and report the outcome back to the client.

First, we combine the destination address and integer port into a standard network string using `net.JoinHostPort` (which handles both IPv4 and IPv6 formatting gracefully). Then, we initiate a standard tcp connection using `net.DialTimeout` to prevent the proxy worker from hanging indefinitely on dead remote servers.
```go
destAddr := net.JoinHostPort(address, strconv.Itoa(port))
destConn, err := net.DialTimeout("tcp", destAddr, timeoutDuration)
```

If the connection attempt fails (e.g., due to a network timeout, a blocked port, or an invalid address), the proxy server must inform the client before aborting. This error reporting is done by sending a reply packet back to the client with an appropriate error status code (`0x01` for general failure).

According to RFC 1928, the server's reply packet is structured as follows:

| **Field** |      VER      |        REP       |   RSV  |         ATYP         |       BND.ADDR       |                 BND.PORT                 |
|:---------:|:-------------:|:----------------:|:------:|:--------------------:|:--------------------:|:----------------------------------------:|
| **Bytes** |       1       |         1        |    1   |           1          |       Variable       |                     2                    |
| **Value** | fixed to 0x05 | succeeded `0x00` | `0x00` | `0x01` `0x03` `0x04` | server bound address | server bound port in network octet order |

The final 2 fields represent the specific local IP address and ephemeral port that the proxy server used on its outbound interface to connect to the target server. In a minimalist implementation, the client rarely needs to know which local port the proxy assigned for the outbound connection. Therefore, we can safely set `ATYP` to `0x01` and fill both `BND.ADDR` and `BND.PORT`  entirely with zeros.

```go
if err != nil {
	_, _ = conn.Write([]byte{socks5Version, statusFailure, 0x00, atypIPv4, 0, 0, 0, 0, 0, 0})
	return nil, err
}
```

If the proxy server successfully establishes the tcp connection with the target server, it must send a success reply to the client. This handshake reply allows the client to know that the control channel is ready to transition into a pure data-relaying pipeline.

```go
if _, err := conn.Write([]byte{0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0}); err != nil {
destConn.Close()
	return nil, fmt.Errorf("write success reply failed: %w", err)
}
return destConn, nil
```

The complete function in this part:
```go
func connectDestServer(conn net.Conn, address string, port int) (net.Conn, error) {
	// format the destination address and dial the target server
	destAddr := net.JoinHostPort(address, strconv.Itoa(port))
	destConn, err := net.DialTimeout("tcp", destAddr, timeoutDuration)
	// handle connection failure by replying to the client
	if err != nil {
		_, _ = conn.Write([]byte{socks5Version, statusFailure, 0x00, atypIPv4, 0, 0, 0, 0, 0, 0})
		return nil, err
	}
	
	// confirm success to the client
	if _, err := conn.Write([]byte{0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0}); err != nil {
	destConn.Close()
		return nil, fmt.Errorf("write success reply failed: %w", err)
	}
	
	return destConn, nil
}
```

## 6 Data Forwarding

After establishing the connection to the destination server, the proxy server just needs to do bidirectional data forwarding. 

Go provides `io.Copy(dst, src)`, which is ideal for this task. It continuously reads data from a source and writes it to a destination until it encounters an EOF or a network error.

Since a tcp connection is full-duplex, we need to handle the two separate data streams simultaneously. Because `io.Copy` is a synchronous, blocking function, it will not return until the stream is closed. If we try to run both copy operations sequentially in a single execution thread, the first line will block the program, and the second line will never execute:
```go
io.Copy(destConn, conn)
io.Copy(conn, destConn)
```

To enable both data streams to run concurrently, we use a new Goroutine, which offloads one of the `io.Copy` operations to the background, allowing both upload and download traffic to flow at the same time:
```go
func forward(conn, destConn net.Conn) {
	go func() {
		_, _ = io.Copy(destConn, conn)
		destConn.Close() // close the destination connection when the upload ends
	}()
	
	_, _ = io.Copy(conn, destConn)
}
```

Now we've completed this simple SOCKS5 server with Golang.

## 7 Testing

To verify that the server works correctly, execute the following command in your local terminal (adjust the address if your proxy server is running on a different host or port):
```bash
curl --socks5 127.0.0.1:1080 http://httpbin.org/ip
```

If the command successfully returns the proxy server's outbound ip address and no error logs appear in your server's console, your simple SOCKS5 server is fully functional.

The complete source code: [GitHub - KAG-Ming/simple-socks5-go: A simple implementation of SOCKS5 with Golang. · GitHub](https://github.com/KAG-Ming/simple-socks5-go)

## TODO
- Authentication sub-negotiation
- UDP support
- Graceful Shutdown
- ...