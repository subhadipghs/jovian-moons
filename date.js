import moment from "moment"

const formatDate = (date) => {
  if (!date instanceof Date) {
    throw new Error("Caught exception while formatting the date.\nExpected a date instead.")
  }
  return moment(date).format("MM/DD/YYYY")
}


export { formatDate }
