import moment from "moment"

const formatDate = (date) => {
  if (!date instanceof Date) {
    throw new Error("Caught exception while formatting the date.\nExpected a date instead.")
  }
  return moment(date).format("MM/DD/YYYY")
}

// Month in JavaScript is 0-indexed (January is 0, February is 1, etc), 
// but by using 0 as the day it will give us the last day of the prior
// month. So passing in 1 as the month number will return the last day
// of January, not February
// @param {number} monthIndex - is the number denoting a month. In javascript it should be 0 based number
// @param {number} year - full year
const getNumberOfDaysInMonth = (monthIndex, year) => {
  if (isNaN(monthIndex) || isNaN(year)) {
    throw new Error("Caught excption in getNumberOfDaysInMonth. Expected arguments to be numbers.")
  }
  if (monthIndex < 1 || monthIndex > 12) {
    throw new Error("Invalid monthIndex provided. It should be between 0 and 11")
  }
  const d = new Date(year, monthIndex, 0)
  return d.getDate()
}

export { formatDate, getNumberOfDaysInMonth }
