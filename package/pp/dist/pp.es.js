// * Released under the MIT License.

var defaultOptions = {
  typeName: 'type',
  pushEvent: 'push',
  pullEvent: 'pull'
};
var src = /*@__PURE__*/(function () {
  function PP(io, maps, options) {
    this.options = Object.assign(defaultOptions, options);
    this.maps = maps;
    this.io = io;
    this.socket = null;
    this.ctx = {};
    this.eventType = null;

    this._init();
  }

  PP.prototype.name = function name (type) {
    var ref;

    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
    (ref = this)._execute.apply(ref, [ type, this.socket ].concat( args ));

    return this;
  };

  PP.prototype._types = function _types (event, data, id) {
    var ref = this;
    var io = ref.io;
    var socket = ref.socket;
    var options = ref.options;
    var eventType = ref.eventType;
    var pullEvent = options.pullEvent;
    var typeName = options.typeName;
    data = {};
    data[typeName] = eventType;
    data.data = data;

    switch (event) {
      case 'oneself':
        socket.emit(pullEvent, data);
        break;

      case 'everybody':
        io.emit(pullEvent, data);
        break;

      case 'without':
        socket.broadcast.emit(pullEvent, data);
        break;

      case 'one':
        io.to(id).emit(pullEvent, data);
        break;

      case 'room':
        socket.broadcast.to(id).emit(pullEvent, data);
        break;
    }
  };

  PP.prototype.oneself = function oneself () {
    var ref;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    (ref = this)._types.apply(ref, [ 'oneself' ].concat( args ));

    return this;
  };

  PP.prototype.everybody = function everybody () {
    var ref;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    (ref = this)._types.apply(ref, [ 'everybody' ].concat( args ));

    return this;
  };

  PP.prototype.without = function without () {
    var ref;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    (ref = this)._types.apply(ref, [ 'without' ].concat( args ));

    return this;
  };

  PP.prototype.one = function one () {
    var ref;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    (ref = this)._types.apply(ref, [ 'one' ].concat( args ));

    return this;
  };

  PP.prototype.room = function room () {
    var ref;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    (ref = this)._types.apply(ref, [ 'room' ].concat( args ));

    return this;
  };

  PP.prototype._execute = function _execute (type, socket) {
    var args = [], len = arguments.length - 2;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 2 ];

    this.socket = socket;
    this.eventType = type;
    var ref = this;
    var maps = ref.maps;

    try {
      if (type in maps && typeof maps[type] === 'function') { maps[type].apply(this, args); }else if (!['connection', 'disconnect', 'error'].includes(type) && typeof maps.default === 'function') { maps.default.apply(this, args); }
    } catch (e) {
      if (typeof maps.error === 'function') { maps.error.call(this, e); }
    }
  };

  PP.prototype._init = function _init () {
    var this$1 = this;

    var ref = this;
    var io = ref.io;
    var options = ref.options;
    var maps = ref.maps;
    var pushEvent = options.pushEvent;
    var typeName = options.typeName;
    io.on('connection', function (socket) {
      this$1._execute('connection', socket);

      socket.on(pushEvent, function (msg, fn) {
        var type = msg[typeName];
        var data = msg.data;

        this$1._execute(type, socket, data, fn);
      });
      socket.on('disconnect', function () {
        this$1._execute('disconnect', socket);
      });
    });
  };

  return PP;
}());

export default src;
