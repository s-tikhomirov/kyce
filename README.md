# Our LuxBlock Hackathon project

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need the following software:

- jq  [1.5]
- geth [1.6.0-stable]
- solc [0.4.10]
- ruby [1.9.3]

#### Installing prerequisites on macOS using homebrew

```
$ brew update
$ brew upgrade
$ brew install jq 
$ brew tap ethereum/ethereum
$ brew install ethereum solidity
```

#### Install prerequisites on Debian/Ubuntu


#### Install `jq`
```
$ sudo apt-get update
$ sudo apt-get install jq
```

#### Install `geth` and `solc`

```
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository -y ppa:ethereum/ethereum
$ sudo apt-get update
$ sudo apt-get install ethereum solc
```

### Building

Initialize submodules and pull them by running (from the root of this repository)

```
$ git submodule init
$ git submodule update
```

Install all `node.js` packages and build the web app

```
npm install
npm run build
```