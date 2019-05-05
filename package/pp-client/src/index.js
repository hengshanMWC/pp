
const defaultOptions = {
  typeName: 'type',
  pushEvent: 'push',
  pullEvent: 'pull'
}


module.exports = class PP {
  constructor (socket, maps, options) {
    this.options = Object.assign(defaultOptions, options)
    this.maps = maps
    this.socket = socket
    this._init()
  }

  send (type, data) {
    const {socket, options} = this
    const {pushEvent} = options
    socket.emit(pushEvent, {
      type,
      data
    })
  }

  _init () {
    const {socket, options, maps} = this
    const {typeName, pullEvent} = options
    try {
      socket.on(pullEvent, msg => {
        const type = msg[typeName]
        const data = msg.data
        if (type in maps && typeof maps[type] === 'function') maps[type](data)
        else if (!['connection', 'disconnect', 'error'].includes(type) && typeof maps.default === 'function') maps.default(data)
      })
    } catch (e) {
      if (typeof maps.error === 'function') maps.error.call(this, e)
    }
  }
}