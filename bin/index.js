#!/usr/bin/env node

import meow from "meow"
import { generateImage } from "../index.js"
import { formatDate, getNumberOfDaysInMonth } from "../date.js"

async function main() {

  const cli = meow(`
Jovian Moons 🪐
---------------
Usage
  $ npm i -g jupiter
  $ jupiter <input>
  
Options
  --year,  -y   full year in number format
  --name,  -n   name of the generate image 
  --month, -m   month in form of number. it should 0 based. January should be 0, Februrary 1 and so on

Examples
  $ jupiter --month 8 --year 2022 --name september-image
`, {
    importMeta: import.meta,
    flags: {
      month: {
        alias: 'm',
        type: 'number',
        isRequired: true
      },
      year: {
        alias: 'y',
        type: 'number',
        isRequired: true
      },
      name: {
        alias: 'n',
        type: 'string',
        isRequired: true
      }
    },
  })
  try {
    const { month, year, name } = cli.flags
    if (isNaN(month) || month < 0 || month > 11) {
      throw new Error("Invalid month provided. It should be between 0 and 11")
    }
    if (isNaN(year)) {
      throw new Error("Invalid year provided")
    }
    if (name.length <= 0) {
      throw new Error("Invalid image name provided")
    }
    const date = new Date(2022, 8, 1)
    const formattedDate = formatDate(new Date(2022, 8, 1))
    const numberOfDays = getNumberOfDaysInMonth(date.getMonth(), date.getFullYear())
    await generateImage(formattedDate, numberOfDays, name)
  } catch (e) {
    console.error(e)
    console.log(cli.help)
  }
}

main()
