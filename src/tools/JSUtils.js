// Degrees to radians
const degToRad = (degrees) => {
  let rad = degrees * (3.1415 / 180);
  return rad;
};

// Increment String
const incrementString = (str) => {
  // Find the trailing number or it will match the empty string
  var count = str.match(/\d*$/);

  // Take the substring up until where the integer was matched
  // Concatenate it to the matched count incremented by 1
  return str.substr(0, count.index) + ++count[0];
};

// Lerp
const lerp = (value1, value2, amount) => {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
};

// Name from path
const nameFromPath = (str) => {
  str = str.replace(/\s/g, "");
  let newName = str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")); // +1 WHY?
  return newName;
};

const clamp = (val, min, max) => {
  return Math.min(Math.max(min, val), max);
};

const arrayContainsArray = (superset, subset) => {
  if (0 === subset.length) {
    return false;
  }
  return subset.every(function (value) {
    return superset.indexOf(value) >= 0;
  });
};

const traverseArray = (arr) => {
  arr.forEach(function (x) {
    traverse(x);
  });
};

const traverseObject = (obj) => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      traverse(obj[key]);
    }
  }
};

const isArray = (o) => {
  return Object.prototype.toString.call(o) === "[object Array]";
};

const traverse = (x) => {
  if (isArray(x)) {
    traverseArray(x);
  } else if (typeof x === "object" && x !== null) {
    traverseObject(x);
  } else {
    console.log(x);
  }
};

export {
  degToRad,
  incrementString,
  lerp,
  nameFromPath,
  clamp,
  arrayContainsArray,
  traverseArray,
  traverseObject,
  isArray,
  traverse,
};
