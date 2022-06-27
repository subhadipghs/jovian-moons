import {debuglog, inspect} from "node:util"
import puppeteer from "puppeteer"

var log = debuglog("app")

var url =
  "https://skyandtelescope.org/wp-content/plugins/observing-tools/jupiter_moons/jupiter.html"

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

async function main() {
  // for some reason we are about to go to the moons 🚀
  var browser = await puppeteer.launch({
    headless: true,
    slowMo: 50,
  })
  var page = await browser.newPage()
  // go to skyandtelescope website
  await page.goto(url, {
    waitUntil: "load",
  })
  var header = await page.$("#header")
  var text = await header.$eval(
    ".title-text",
    node => node.innerHTML
  )
  log(inspect(text.trim()))

  await page.waitForSelector("#date_time")

  var form = await page.$("#date_time")

  var inpMaps = new Map([
    ["date_txt", "06/06/2022"],
    ["ut_h_m", "04:40"],
    ["timezone", "5.5"],
  ])

  for (var [key, value] of inpMaps) {
    log(inspect({key: `input[name=${key}]`, value}))
    var input = await form.waitForSelector(
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
  var button = await page.$(".calcBtn")
  await button.focus()
  await button.click()

  for (var [key, _] of inpMaps) {
    var value = await page.$eval(
      `input[name=${key}]`,
      e => e.value
    )
    log("%s - %s", key, value)
  }
  await browser.close()
}

main()
