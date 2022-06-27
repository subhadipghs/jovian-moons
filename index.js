import * as cheerio from "cheerio"
import {JSDOM} from "jsdom"
import {setTimeout} from "node:timers/promises"
import {debuglog, inspect} from "node:util"
import puppeteer from "puppeteer"

var log = debuglog("debug")

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
    headless: false,
    slowMo: 20,
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

  var moons = await page.$eval("#moons", e => e.innerHTML)
  // append the positions in the html page
  var $ = cheerio.load(
    '<div id="moons" style="height: 77px; outline: 2px solid black;"></div>'
  )
  $("#moons").append(moons)
  var sourceDom = new JSDOM($.root().html())
  var dom = new JSDOM(
    `<html><body><div id="moons" style="height: 77px; outline: 2px solid black;"></div></body></html>`
  )

  const listOfMoons = [
    "#io",
    "#europa",
    "#ganymede",
    "#callisto",
  ]

  const moonColorMap = new Map([
    ["#io", "red"],
    ["#europa", "blue"],
    ["#ganymede", "pink"],
    ["#callisto", "orange"],
  ])

  listOfMoons.forEach(function (value) {
    var e = sourceDom.window.document.querySelector(value)
    e.innerHTML = ""
    var style = e.getAttribute("style")
    const modifiedStyle =
      style +
      "width: 4px; height: 4px; border-radius: 50%; background-color:" +
      moonColorMap.get(value) +
      ";"

    e.removeAttribute("style")
    e.setAttribute("style", modifiedStyle)
    log(modifiedStyle)
    const resultEl =
      dom.window.document.querySelector("#moons")
    resultEl.appendChild(e)
  })

  log(dom.window.document.querySelector("html").outerHTML)

  const resultPage = await browser.newPage()
  await resultPage.setViewport({
    height: 1920,
    width: 1080,
  })
  await resultPage.setContent(
    dom.window.document.querySelector("html").outerHTML,
    {
      waitUntil: "load",
    }
  )

  await setTimeout(30 * 1000)
  await browser.close()
}

main()
