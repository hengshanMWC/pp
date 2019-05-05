// * Released under the MIT License.

var defaultOptions = {
  typeName: 'type',
  pushEvent: 'push',
  pullEvent: 'pull'
};
var src = /*@__PURE__*/(function () {
  function PP(socket, maps, options) {
    this.options = Object.assign(defaultOptions, options);
    this.maps = maps;
    this.socket = socket;

    this._init();
  }

  PP.prototype.send = function send (type, data) {
    var ref = this;
    var socket = ref.socket;
    var options = ref.options;
    var pushEvent = options.pushEvent;
    socket.emit(pushEvent, {
      type: type,
      data: data
    });
  };

  PP.prototype._init = function _init () {
    var ref = this;
    var socket = ref.socket;
    var options = ref.options;
    var maps = ref.maps;
    var typeName = options.typeName;
    var pullEvent = options.pullEvent;

    try {
      socket.on(pullEvent, function (msg) {
        var type = msg[typeName];
        var data = msg.data;
        if (type in maps && typeof maps[type] === 'function') { maps[type](data); }else if (!['connection', 'disconnect', 'error'].includes(type) && typeof maps.default === 'function') { maps.default(data); }
      });
    } catch (e) {
      if (typeof maps.error === 'function') { maps.error.call(this, e); }
    }
  };

  return PP;
}());

export default src;
