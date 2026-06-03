---
author: Onirexus
date: 2025-03-03 23:14:31
sticky: false
title: Golang Basic
tags:
  - go
categories:
  - Computer Science
  - Go
cover: ./cover.png
description: My personal go cheatsheet.
draft: false
---
# Command-Line Arguments
`os.Args`: slice. `os.Args[0]` refers to the program itself, and we often use `os.Args[1:]`. 
```go
package main

import (
	"fmt"
	"os"
	"strings"
)
func main() {
    fmt.Println(strings.Join(os.Args[1:], " ")) // "s +" is inefficient
}
```


#  Format Output `fmt.Printf()`
## Verbs

| Verb | Meaning                                                          | Example                         |
| ---- | ---------------------------------------------------------------- | ------------------------------- |
| %v   | Print the value in its default format                            |                                 |
| %+v  | If printing a struct, it adds the field names.                   | {Name:Alice Age:30}             |
| %#v  | Prints the value as it would be written in Go code.              | main.User{Name:"Alice", Age:30} |
| %T   | The type of the value.                                           |                                 |
| %%   | Prints %                                                         | %                               |
| %s   | String                                                           |                                 |
| %q   | Quoted string                                                    | "Hello, world"                  |
| %x   | Hexadecimal dump of the string's bytes (lowercase).              |                                 |
| %b   | Binary                                                           |                                 |
| %d   | Decimal                                                          |                                 |
| %o   | Octal                                                            |                                 |
| %x   | Hex(Lowercase)                                                   |                                 |
| %X   | Hex(Uppercase)                                                   |                                 |
| %f   | Defaults to 6 decimal places.                                    |                                 |
| %.2f | Restricts the output to exactly n decimal places.                | 3.14                            |
| %g   | Drops trailing zeros and decides between %f or %e based on size. | 3.14159                         |
| %e   | Scientific notation (exponential).                               | 3.141590e+00                    |
| %t   | bool                                                             | true                            |
| %p   | pointer                                                          | 0xc0000b2008                    |
## Index Explicitly `[n]`
Reuses the $n$-th argument past the format string. Saves you from typing the same variable over and over.
*eg: o:=0666; %[1]o $\rightarrow$ 666*

## Alternative Format `#`
Forces the output to include its sharp, recognizable base prefix (0 for octal, 0x for hex).
*eg: o:=0666; %#o $\rightarrow$ 0666*

## Sizing and Padding
You can insert numbers between the `%` and the verb to control spacing and alignment, which is great for building text-based tables or logs.
```go
fmt.Printf("|%5s|\n", "Go")   // Right-aligned, width 5:  |   Go|
fmt.Printf("|%-5s|\n", "Go")  // Left-aligned, width 5:   |Go   |
fmt.Printf("|%05d|\n", 42)    // Pad with leading zeros:  |00042|
```

# `iota`
Rules:
1. Only can be used in `const` group.
2. From 0, every line +1.

# `crypto/sha256`
## Short Text Encryption
```go
sum := sha256.Sum256([]byte(password))
```
Return a [32]byte array.

Add salt:
```go
sha256.Sum256([]byte(password + "Random_Salt_#9823"))
```

## Large Files Streaming
```go
package main

import (
	"crypto/sha256"
	"fmt"
	"io"
	"strings"
)

func main() {
	// Emulate a large file source
	largeData := strings.NewReader("Large data 1...Large data 2...")

	// 1. Create a hash writer
	h := sha256.New()

	// 2. Use io.Copy to transmit chunked data to the hash writer
	if _, err := io.Copy(h, largeData); err != nil {
		fmt.Println("Failed to read data:", err)
		return
	}

	// 3. h.Sum(nil) to get final result
	result := h.Sum(nil)

	fmt.Printf("Large files' SHA256 is: %x\n", result)
}
```
## Recursively Adding Data
```go
h := sha256.New()
for {
    buf := make([]byte, 1024)
    n, err := file.Read(buf)
    if n > 0 {
        h.Write(buf[:n])
    }
    if err == io.EOF {
        break
    }
}

finalHash := h.Sum(nil)
```

eg1: Write a function that counts the number of bits that are different in two SHA256
hashes.
```go
package main

import {
	"fmt"
	"crypto/sha256"
}

func diffBits (s1, s2 []byte) int {
	count := 0
	for i := 0; i < len(s1); i++ {
		xorResult := s1[i] ^ s2[i]
		count += popCount(xorResult)
	}
	return count
}

// A helper function to count '1' bits in a single byte
func popCount(b byte) int {
	bits := 0
	for b > 0 {
		if b&1 == 1 {
			bits++
		}
		b >>= 1 // shift right to check the next bit
	}
	return bits
}

func main() {
	c1 := sha256.Sum256([]byte("x"))
	c2 := sha256.Sum256([]byte("X"))
	fmt.Printf("Different bits: %d\n", diffBits(c1, c2))
}

```
eg2: Write a program that prints the SHA256 hash of its standard input by default but
supports a command-line flag to print the SHA384 or SHA512 hash instead.

```go
package main

import (
	"crypto/sha256"
	"crypto/sha512"
	"flag"
	"fmt"
	"hash"
	"io"
	"os"
)

func main() {
	// 1. Define the command-line flag
	// -algo is the flag name, "sha256" is the default value
	algoPtr := flag.String("algo", "sha256", "The hash algorithm to use (sha256, sha384, sha512)")

	// 2. Parse the flags from the command line
	flag.Parse()

	// 3. Declare a generic hash interface variable
	var h hash.Hash

	// 4. Select the algorithm based on the user's flag input
	switch *algoPtr {
	case "sha384":
		h = sha512.New384() // SHA384 lives inside the sha512 package
	case "sha512":
		h = sha512.New()
	case "sha256":
		h = sha256.New()
	default:
		// If the user types something invalid, print an error and exit
		fmt.Fprintf(os.Stderr, "Error: unsupported algorithm '%s'\n", *algoPtr)
		os.Exit(1)
	}

	// 5. Pipe standard input (os.Stdin) into our hash object
	// This streams the data efficiently without overloading memory
	if _, err := io.Copy(h, os.Stdin); err != nil {
		fmt.Fprintf(os.Stderr, "Error reading input: %v\n", err)
		os.Exit(1)
	}

	// 6. Calculate and print the final checksum
	// h.Sum(nil) extracts the bytes, and %x formats them into a hex string
	fmt.Printf("%x\n", h.Sum(nil))
}
```
# String & []byte & Rune
In golang, a `string` is actually a `[]byte`, `len()` returns the number of bytes not runes. To get runes, use `utf8.RuneCountInString()`.
# Slice
When delivering a slice to a function, the copied slice also has its pointer pointed to the original array, so any change of the slice in the function will cause the original slice to change.

# Maps
K[V]
- K must be comparable using == , floating number and NaN are bad choices
- K & V can't be the same type
The zero value for a map type is `nil`.
## Basic Operations
### Create
```go
ages := make(map[string]int)
ages["alice"] = 31
ages["charlie"] = 34
```

or

```go
ages := map[string]int {
	"alice": 31,
	"charlie": 34,
}
```

A empty map: `map[string]int{}`
### Delete
```go
delete(ages, "alice")
```

### Enumerate
Go intentionally to "shuffle" the map, so the result will be different in every run:
```go
for name, age := range ages {
	fmt.Printf("%s\t%d\n", name, age)
}
```

To enumerate the key/value pairs in order, we must sort
the keys explicitly.
```go
keys := make([]string, 0, len(ages))
for name := range ages {
    keys = append(keys, name)
}
sort.Strings(key)
for _, name := range keys {
    fmt.Printf("%s\t%d\n", name, ages[name])
}
```

## Safety
If the element isn't in the map, the map will returns the zero value for its type. 

And a map element is not a variable, and we cannot take its address:
```go
_ = &ages["bob"] // compile error: cannot take address of map element
```

Most operations on maps are safe to perform on a nil map reference, but storing to a nil map causes a panic:
```go
ages["carol"] = 21 // panic: assignment to entry in nil map
```
**You must allocate the map before you can store into it.**

To distinguish between a nonexistent element and an element that happens to have the value zero:
```go
age, ok := ages["bob"]
if !ok { /* "bob" is not a key in this map; age == 0. */}
```

## Act Like `set`
```go
// Using a map as a set
registeredUsers := map[string]bool{
    "alice": true,
    "bob":   true,
}
```

To check one element:
```go
if registeredUsers["alice"] {
    fmt.Println("Alice is registered!")
}
```

However, not all map[string]bool values are simple sets; some may contain both true and false values. To check a element in this kind of map, run this:
```go
_, ok := userStatus["bob"]
```

# Ref
[edu.anarcho-copy.org/Programming Languages/Go/The Go Programming Language - Donovan, Alan A. A. \_ Kernigha\_6127.pdf](https://edu.anarcho-copy.org/Programming%20Languages/Go/The%20Go%20Programming%20Language%20-%20Donovan,%20Alan%20A.%20A.%20_%20Kernigha_6127.pdf)
