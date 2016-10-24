module.exports.pad = function (str, length) {
  var newStr, len;

  if (str.length >= length) {
    return str;
  }
  len = length - str.length;
  newStr = str;
  for (var i = 0; i < len ; i++) {
    newStr += ' ';
  }
  return newStr;
}

module.exports.itemIdList = function (result) {
    var list = result.map(function (item) {
        return item.item_id;
    });
    return list;
}