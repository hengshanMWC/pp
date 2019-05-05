

let onlineNumber = 1

module.exports = {
  online () {
    onlineNumber++
    // 默认为 online 事件类型
    this.everybody(onlineNumber)
    // 更改事件类型为 test
    this.type('test').everybody('测试')
    // 使用已注册的 test2 事件类型
    this.type('test2')
  },

  disconnect () {
    onlineNumber--
    this.everybody(onlineNumber)


  },

  error (e) {
    this.everybody(e)
  }
}