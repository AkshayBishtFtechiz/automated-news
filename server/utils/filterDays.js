// const { format, subDays, parse } = require("date-fns");

// const filterDays = () => {
//   const currentDate = new Date();
//   const formattedCurrentDate = format(currentDate, "MMMM dd, yyyy");

//   const seventyFiveDaysBefore = subDays(formattedCurrentDate, 75);

//   const formattedDateSeventyFive = format(
//     seventyFiveDaysBefore,
//     "MMMM dd, yyyy"
//   );

//   const dateToCompare = new Date(formattedDateSeventyFive);
//   return dateToCompare;
// };

// module.exports = filterDays;

const { format, subDays } = require("date-fns");

const filterDays = (daysToSubtract) => {
  const currentDate = new Date();
  const formattedCurrentDate = format(currentDate, "MMMM dd, yyyy");

  const targetDate = subDays(currentDate, daysToSubtract);
  const formattedTargetDate = format(targetDate, "MMMM dd, yyyy");

  return {
    currentDate: currentDate,
    formattedCurrentDate: formattedCurrentDate,
    targetDate: targetDate,
    formattedTargetDate: formattedTargetDate,
    isBefore: targetDate < currentDate,
    isAfter: targetDate > currentDate,
    isEqual: targetDate.getTime() === currentDate.getTime(),
  };
};

module.exports = { filterDays };

