import { JSDOM } from "jsdom"
import puppeteer from "puppeteer"
import { debuglog, inspect } from "node:util"

let log = debuglog("debug")

let url =
  "https://skyandtelescope.org/wp-content/plugins/observing-tools/jupiter_moons/jupiter.html"

const moonColorMap = new Map([
  ["#io", "red"],
  ["#europa", "blue"],
  ["#ganymede", "green"],
  ["#callisto", "orange"],
])

async function clearInput(page, id) {
  log("clearing text for %s", id)
  const inputValue = await page.$eval(id, el => el.value)
  log("got value %s", inputValue)
  await page.focus(id)
  for (let i = 0; i < inputValue.length; i++) {
    await page.keyboard.down("Control")
    await page.keyboard.press("A")
    await page.keyboard.up("Control")
    await page.keyboard.press("Backspace")
  }
}

function appendMoonsHtml({
  id,
  date,
  sourceDom,
  dom = new JSDOM(),
}) {
  // append the positions in the html page
  const listOfMoons = [
    "#io",
    "#europa",
    "#ganymede",
    "#callisto",
  ]
  let dateDiv = dom.window.document.createElement("div")
  const [month, day, year] = date.split("/")
  dateDiv.innerHTML = `${day}/${month}/${year}`
  const resultId = `result-${id}`
  let resultElement =
    dom.window.document.createElement("div")
  resultElement.setAttribute("id", resultId)
  resultElement.style.position = "relative"
  resultElement.style.height = "40px"
  resultElement.style.outline = "1px solid black"

  resultElement.innerHTML = ` 
    <div class="jove" style="position: absolute; top: 10px; left: 328px; background-color: brown; width: 20px; height: 20px; border-radius: 50%; z-index:11;">
    </div>
  `

  log("result element html %s", resultElement.outerHTML)

  dom.window.document.body.appendChild(dateDiv)
  dom.window.document.body.appendChild(resultElement)

  listOfMoons.forEach(value => {
    let e = sourceDom.window.document.querySelector(value)
    e.innerHTML = ""
    let style = e.getAttribute("style")
    e.removeAttribute("id")
    e.setAttribute("class", value)

    style = style
      .split("; ")
      .map(s => {
        if (s.startsWith("top")) {
          return "top: 20px"
        } else {
          return s
        }
      })
      .join("; ")

    const modifiedStyle =
      style +
      "width: 10px; height: 10px; border-radius: 50%; background-color:" +
      moonColorMap.get(value) +
      ";"

    e.removeAttribute("style")
    e.setAttribute("style", modifiedStyle)
    const resultEl = dom.window.document.querySelector(
      `#${resultId}`
    )
    resultEl.appendChild(e)
  })
}

async function generateImage(startDate, numberOfDays, imageName) {
  // for some reason we are about to go to the jupiter 🚀
  let browser = await puppeteer.launch({
    headless: false,
    slowMo: 20,
  })
  let page = await browser.newPage()
  // go to skyandtelescope website
  await page.goto(url, {
    waitUntil: "load",
  })
  let header = await page.$("#header")
  let text = await header.$eval(
    ".title-text",
    node => node.innerHTML
  )
  log(inspect(text.trim()))

  await page.waitForSelector("#date_time")

  let form = await page.$("#date_time")

  let inpMaps = new Map([
    ["date_txt", startDate],
    ["ut_h_m", "14:30"],
    ["timezone", "5.5"],
  ])

  for (let [key, value] of inpMaps) {
    log(inspect({ key: `input[name=${key}]`, value }))
    let input = await form.waitForSelector(
      `input[name=${key}]`
    )
    // clear the input first
    await clearInput(page, `#${key}2`)
    await input.type(value)
    if (key == "date_txt") {
      await page.keyboard.press("Escape")
    }
  }

  // click on the calculate button
  let button = await page.$(".calcBtn")
  await button.focus()
  await button.click()

  const addOneHourButton = await page.$(
    "tr td:last-child button"
  )

  // get html contating the position of the moons
  let dom = new JSDOM(`
    <html>
      <body>
      </body>
    </html>
  `)

  for (let i = 0; i < numberOfDays; i++) {
    if (i !== 0) {
      await addOneHourButton.click()
    }
    let moons = await page.$eval("#moons", e => e.innerHTML)
    let date = await page.$eval(
      "#date_txt2",
      el => el.value
    )
    log("generating moon position for %s", date)
    let sourceDom = new JSDOM(moons)
    appendMoonsHtml({
      id: i,
      dom,
      sourceDom,
      date,
    })
  }

  let info = dom.window.document.createElement("div")
  info.className = "info"
  info.style.cssText = `
    display: flex;
    width: 100%;, 
    padding: 20px;
    margin: 20px;
    justify-content: center;
    align-items: center;
  `

  info.innerHTML = `
    <div style="margin: 10">
      Jupiter - <span style="background-color: brown; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
    </div>
    <div style="margin: 10">
      IO - <span style="background-color: ${moonColorMap.get(
    "#io"
  )}; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
    </div>
    <div style="margin: 10">
      Europa - <span style="background-color: ${moonColorMap.get(
    "#europa"
  )}; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
    </div>
    <div style="margin: 10">
      Ganymede - <span style="background-color: ${moonColorMap.get(
    "#ganymede"
  )}; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
    </div>
    <div style="margin: 10">
      Callisto - <span style="background-color: ${moonColorMap.get(
    "#callisto"
  )}; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
    </div>
    `

  const time = dom.window.document.createElement("div")
  time.innerHTML = `
    <div>
      Local Time: 08:00 PM IST
    </div>
  `
  time.style.cssText = `
    display: flex;
    width: 100%;, 
    padding: 20px;
    margin: 20px;
    justify-content: center;
    align-items: center;

  `
  dom.window.document.body.appendChild(info)
  dom.window.document.body.appendChild(time)

  const resultPage = await browser.newPage()
  await resultPage.setContent(
    dom.window.document.querySelector("html").outerHTML,
    {
      waitUntil: "load",
    }
  )

  await resultPage.screenshot({
    path: `${imageName}.jpg` || "jovian-moons.jpg",
    fullPage: true,
  })

  await browser.close()
}

export { generateImage }
