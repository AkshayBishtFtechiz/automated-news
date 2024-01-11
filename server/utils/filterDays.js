const { format, subDays, parse } = require("date-fns");

const filterDays = () => {
  const currentDate = new Date();
  const formattedCurrentDate = format(currentDate, "MMMM dd, yyyy");

  const seventyFiveDaysBefore = subDays(formattedCurrentDate, 75);

  const formattedDateSeventyFive = format(
    seventyFiveDaysBefore,
    "MMMM dd, yyyy"
  );

  console.log("DaysBefore_75Days", formattedDateSeventyFive);

  const dateToCompare = new Date(formattedDateSeventyFive);
  return dateToCompare;
};

module.exports = filterDays;
