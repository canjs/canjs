var _zid = 1;

function zid(element) {
  return element._zid || (element._zid = _zid++);
}

module.exports = zid;
