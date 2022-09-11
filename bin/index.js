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
  --date,  -d   date of the day 
  --name,  -n   name of the generate image 
  --month, -m   month in form of number. it should 0 based. January should be 0, Februrary 1 and so on
  --debug,      if true then will open the brower while scrapping otherwise it'll do it headless way

Examples
  $ jupiter --date 12 --month 8 --year 2022 --name september-image
`, {
    importMeta: import.meta,
    flags: {
      month: {
        alias: 'm',
        type: 'number',
        isRequired: true
      },
      date: {
        alias: 'd',
        type: 'number',
        isRequired: false,
        default: 1,
      },
      debug: {
        type: 'boolean',
        isRequired: false,
        default: false
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
    const { month, date, year, name, debug } = cli.flags
    if (isNaN(month) || month < 0 || month > 11) {
      throw new Error("Invalid month provided. It should be between 0 and 11")
    }
    if (isNaN(year)) {
      throw new Error("Invalid year provided")
    }
    if (name.length <= 0) {
      throw new Error("Invalid image name provided")
    }
    const d = new Date(year, month, date)
    const formattedDate = formatDate(d)
    const numberOfDays = getNumberOfDaysInMonth(d.getMonth() + 1, d.getFullYear())
    await generateImage(formattedDate, numberOfDays, name, debug)
  } catch (e) {
    console.error(e)
    console.log(cli.help)
  }
}

main()
