
const defaultOptions = {
  typeName: 'type',
  pushEvent: 'push',
  pullEvent: 'pull'
}


module.exports = class PP {
  constructor (io, maps, options) {
    this.options = Object.assign(defaultOptions, options)
    this.maps = maps
    this.io = io
    this.socket = null
    this.ctx = {}
    this.eventType = null

    this._init()
  }

  name (type, ...args) {
    this._execute(type, this.socket, ...args)
    return this
  }




  _types(event, data, id) {
    const {io, socket, options, eventType} = this
    const { pullEvent, typeName} = options
    data = { [typeName]: eventType,  data }
    switch (event) {
      case 'oneself':
        socket.emit(pullEvent, data)
        break;
      case 'everybody':
        io.emit(pullEvent, data)
        break;
      case 'without':
        socket.broadcast.emit(pullEvent, data)
        break;
      case 'one':
        io.to(id).emit(pullEvent, data)
        break;
      case 'room':
        socket.broadcast.to(id).emit(pullEvent, data)
        break;
    }
  }


  oneself (...args) {
    this._types('oneself', ...args)
    return this
  }

  everybody (...args) {
    this._types('everybody', ...args)
    return this
  }


  without (...args) {
    this._types('without', ...args)
    return this
  }

  one (...args) {
    this._types('one', ...args)
    return this
  }

  room (...args) {
    this._types('room', ...args)
    return this
  }

  _execute (type, socket, ...args) {
    this.socket = socket
    this.eventType = type
    const {maps} = this
    try {
      if (type in maps && typeof maps[type] === 'function') maps[type].apply(this, args)
      else if (!['connection', 'disconnect', 'error'].includes(type) && typeof maps.default === 'function') maps.default.apply(this, args)
    } catch (e) {
      if (typeof maps.error === 'function') maps.error.call(this, e)
    }
  }


  _init () {
    const {io, options, maps} = this
    const {pushEvent, typeName} = options
    io.on('connection', socket => {
      this._execute('connection', socket)

      socket.on(pushEvent, (msg, fn) => {
        const type = msg[typeName]
        const data = msg.data
        this._execute(type, socket, data, fn)
      })

      socket.on('disconnect', () => {
        this._execute('disconnect', socket)
      })
    })
  }
}