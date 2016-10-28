// This file contains functions called by other functions in mutiple files
// Factoring the codes here to reduce redundancy

// 
// Padding ' ' at the end of str to the length
// If str length is greater or equals to length, return str
// else padding ' ' at the end of str to the length
//
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

//
// Return an array of item_id from MySQL result
// for UI to validate if the user input of item_id is correct
//
module.exports.itemIdList = function (result) {
    var list = result.map(function (item) {
        return item.item_id;
    });
    return list;
}