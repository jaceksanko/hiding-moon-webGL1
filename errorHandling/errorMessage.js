const errorMessage = function whenConditionFalseSetsErrorMessage(condition, message) {
  if (condition) {
    return console.log(message);
  }
  return null
};

export default errorMessage;