
 - [pp](#pp)
 - [pp-client](#pp-client)
 - [回流](#回流)

# pp

[![GitHub](https://img.shields.io/badge/GitHub-yeshimei-green.svg)](https://github.com/yeshimei/pp) [![npm](https://img.shields.io/npm/v/@ntbl/pp.svg)](https://www.npmjs.com/package/@ntbl/pp) [![MIT](https://img.shields.io/npm/l/express.svg)](https://github.com/yeshimei/pp)

pp 使用了一种小技巧解耦了 [socket.io](https://github.com/socketio/socket.io) 的使用，让代码更易于复用和维护。


## Installation

```bash
npm i @ntbl/pp --save
```

## Usage

```javascript
const http = require('http')
const socket = require('socket.io')
const Koa = require('koa')
const PP = require('@ntbl/pp')
const maps = require('./maps')

const app = new Koa()
const server = http.Server(app.callback())
const io = socket(server)


// 传入 socket.io 的实例 io 和事件对象
new PP(io, maps)


server.listen(3000)
```

## Maps

pp 的 mpas 事件对象用来接收前端推送的数据。

```js
// maps.js

module.exports = {
  // 自定一个 online 的事件
  online (data) {
    // 发送给所有人，事件名默认为 online
    this.everybody(onlineNumber)
    // 更改事件名为 test
    this.name('test').everybody('测试')
    // 使用已存在的 test2 事件
    this.name('test2')
  },
  
  test2 () {
    this.everybody('测试2')
  }
  
  // socket connection 触发后执行
  connection () { },
  // socket disconnect 触发后执行
  disconnect () { },
  // 当不存在指定的函数时执行
  default () { }
  // 当抛出异常时执行
  error (err) {}
}
```

## 特性

pp 提供了几个方便使用一对一，一对多，广播和房间的函数。

- **oneself(data)** - 向自己发送
- **everybody(data)** - 向所有人发送（包括自己）
- **without(data)** - 向所有人发送（不包括自己）
- **one(data, roomName)** - 发送给指定用户
- **room(data, id)** - 发送广播到某个房间


另外，你还可以在事件函数中直接使用当前的 `socket` 和 `io` 对象。

```js
module.exports = {
  online (data) {
    const socket = this.socket
    
    /** 某些处理 **/
    
    // 发送给指定用户
    this.one(data, id)
  },
}
```


如果你要在事件函数之间共享数据，可以放到 `this.ctx` 中。

```js
module.exports = {
  test1 () {
    this.ctx.number = 1
  },
  test2 () {
    console.log(this.ctx.number) // 1  
  }
}
```

# pp-client

[![GitHub](https://img.shields.io/badge/GitHub-yeshimei-green.svg)](https://github.com/yeshimei/pp) [![npm](https://img.shields.io/npm/v/@ntbl/pp-client.svg)](https://www.npmjs.com/package/@ntbl/pp-client) [![MIT](https://img.shields.io/npm/l/express.svg)](https://github.com/yeshimei/pp)


pp-client 是 [socket.io-cilent](https://github.com/Automattic/socket.io-client) 前端的封装类，与配合 pp 使用可搭建一套完整的流程模型。

## Installation

```bash
npm i @ntbl/pp-client --save
```

## Usage

```js
import PP from '@ntbl/pp-client'
import io from 'socket.io-client'
const socket = io('localhost:3000')

const pp = new PP(socket, maps)

// 推送事件
pp.send('online', userData)
```

浏览器通过以下方式引入使用 pp-client。

```html
<script src="node_moudels/@ntbl/pp-client/dist/pp-client.umd.js"></script>
```

## Maps

pp-client 的 mpas 事件对象用于接收后端返回的数据。

```js
module.exports = {

  online (data) {
    // 注意，pp-client 的 this 指向当前对象
    // 它不同于 pp 把 this 绑定到 实例上
  },
 
  // socket disconnect 触发后执行
  disconnect () { },
  // 当不存在指定的函数时执行
  default () { }
  // 当抛出异常时执行
  error (err) {}
}
```

## 特性

使用实例 `send` 方法推送一个事件。

```js
pp.send('online', userData)
```


这将会触发后端 maps 事件对象中同名（`online`） 的函数。一般情况下（不使用 pp 的 this.name 修改事件名） `online` 会作为后端向前端发送数据的事件名，又将会触发前端的 maps 对象中的 `online` 的函数。如此一来，就形成了一个回流。

# 回流

前端推送数据到后端并立即触发后端的一个事件函数，事件函数返回数据到前端又立即触发前端的一个事件函数。请你仔细思考一下，这可以让很容易陷入杂乱（对于前端存在一套推送与监听的逻辑，对于后端也有一套推送和监听的逻辑，并且只要两套逻辑彼此交接才能让程序运行良好）的代码变的更清晰。

```js
// 前端把 userData 推送到后端
pp.send('online', userData)
```

```js
// 后端的 online 事件函数被触发

function online (userData) {
  // 一些处理
  // 然后把处理后的数据发送给每个人
  // 默认情况下，仍然会使用 online 事件名
  this.everybody(newUserData)
}


```

```js
// 后端返回数据并要求触发前端的 online 事件
function online (newUserData) {
  // 一些处理
  // 最后，回流结束
}
```

