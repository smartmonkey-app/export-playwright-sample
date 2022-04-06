// MIT License
// Copyright © 2021 Ngô Thạch (https://www.smartmonkey.app). All rights reserved.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { Page as basePage, expect, Browser } from '@playwright/test'
import { ElementHandle } from 'playwright-core'
import {
  compareArray,
  compareText,
  compareTextEx,
  compareURL,
  ExpectInputType,
  getElementHandle,
  getFrame,
  getMessage,
  InputArguments,
  PageWaitForSelectorOptions,
  StringComparisonMode,
  UrlComparisonMode
} from './utils'
import { exec } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const RETRY_COUNT: number = process.env.RETRY_COUNT?
  parseInt(process.env.RETRY_COUNT): 30 // * 100 = 3s

const TIME_CHECK_DELTA: number = process.env.TIME_CHECK_DELTA?
  parseInt(process.env.TIME_CHECK_DELTA): 1000 // 1s

const __RESOURCE_DIR__ = process.env.__RESOURCE_DIR__

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      /**
       * Will check if the element on the page determined by the selector is checked.
       */
      toBeChecked(
        selector: string,
        options?: PageWaitForSelectorOptions
      ): Promise<R>
      /**
       * Will check if the element is checked.
       */
      toBeChecked(options?: PageWaitForSelectorOptions): Promise<R>
      /**
       * Will check if the element's textContent on the page determined by the selector matches the given pattern.
       */
      toContainText(
        selector: string,
        text: string,
        options?: PageWaitForSelectorOptions
      ): Promise<R>
      /**
       * Will check if the element's textContent on the page determined by the selector matches the given pattern.
       */
      toContainText(
        text: string,
        options?: PageWaitForSelectorOptions
      ): Promise<R>
      /**
       * Will check if the element's textContent on the page determined by the selector matches the given pattern.
       */
      toMatchText(
        selector: string,
        pattern: RegExp | string,
        options?: PageWaitForSelectorOptions
      ): Promise<R>
      /**
       * Will check if the element's textContent on the page determined by the selector matches the given pattern.
       */
      toMatchText(
        pattern: RegExp | string,
        options?: PageWaitForSelectorOptions
      ): Promise<R>
      /**
       * Will check an element's value on the page determined by the selector matches the given pattern.
       */
      toMatchValue(
        selector: string,
        value: RegExp | string | string[],
        options?: PageWaitForSelectorOptions
      ): Promise<R>
      /**
       * Will check an element's value matches the given pattern.
       */
      toMatchValue(
        value: RegExp | string | string[],
        options?: PageWaitForSelectorOptions
      ): Promise<R>
      /**
       * Will check if the page URL matches the given pattern.
       */
      toMatchURL(
        value: RegExp | string,
        comparisonMode?: UrlComparisonMode
      ): Promise<R>
      /**
       * Will check if the page URL downloads "filename"
       */
      toDownload(
        filename: string,
        comparisonMode?: StringComparisonMode
      ): Promise<R>
      /**
       * Will check if the page is redirect to an URL
       */
      toBeRedirectedTo(
        value: RegExp | string,
        comparisonMode?: UrlComparisonMode
      ): Promise<R>
      /**
       * Will check if the page submits data to an URL
       */
      toSubmitFormTo(
        value: RegExp | string,
        comparisonMode?: UrlComparisonMode
      ): Promise<R>
    }
  }
}

export { StringComparisonMode, UrlComparisonMode } from './utils'

export declare type SyncExpectationResult = {
  pass: boolean;
  message: () => string;
}

export declare type ASyncExpectationResult = Promise<SyncExpectationResult>

export interface Page extends basePage {
  getPopup(): Promise<Page>
  getDialogData(): Array<Object>
  makeDialogHandler(dialogData: Array<object>): Promise<void>
  pickValue(selector: string, options: object): Promise<string>
}

/**
 * Get unix timestamp
 * @returns
 */
export function time(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 *
 * @param ms
 * @returns
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

/**
 * Load JSON from file
 * @param filename
 */
export function requireJSON(filename: string) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'))
}

/**
 * Compare images
 * @param file1
 * @param file2
 */
export function compareImage(
  file1: string,
  file2: string,
  threshold: number,
  negative: boolean,
  mode: string
): Promise<boolean> {

  function getImgCmpAppPath() {
    let result = null
    let dir = __dirname
    while (dir.length) {
      let binFolder = path.join(dir, 'node_modules', '.bin')
      if (fs.existsSync(binFolder)) {
        result = binFolder
      } else {
        binFolder = path.join(dir, '.bin')
        if (fs.existsSync(binFolder)) {
          result = binFolder
        }
      }
      let parentDir = path.dirname(dir)
      if (parentDir !== dir) {
        dir = parentDir
      } else {
        break
      }
    }
    if (result) {
      return path.join(result, 'imgcmp')
    } else {
      throw new Error('Image Comparision tool not found')
    }
  }

  return new Promise(async (resolve, reject) => {
    try {
      let imgcmp = getImgCmpAppPath()
      exec(`${imgcmp} --compare "${file1}" "${file2}" --${mode}`, (error, stdout, stderr) => {
        if (error && error.code) {
          return reject(error)
        }
        let similarity = parseInt(stdout)
        if ((similarity >= threshold) !== negative) {
          return resolve(true)
        } else {
          if (negative) {
            return reject(new Error(`Image not match: similarity ratio ${similarity}?  greater than ${threshold}?`))
          } else {
            return reject(new Error(`Image not match: similarity ratio ${similarity}?  less than ${threshold}?`))
          }
        }
      })
    } catch (e) {
      return reject(e)
    }
  })
}

/**
 * Convert wildcard to regular expression
 * @param wildcardStr
 */
export function convertWildcardToRegExp(wildcardStr: string): RegExp {
  let result = ''
  for (let i = 0; i < wildcardStr.length; i++) {
    let c = wildcardStr.charAt(i)
    if (c == '*') {
      result = result + '.*'
    } else if (c == '?') {
      result = result + '.?'
    } else if (c == '.') {
      result = result + '\.'
    } else {
      result = result + c
    }
  }
  return new RegExp(result)
}

/**
 * Generate random string with options
 * @param options
 */
export function randomString(options: {
  lowerCaseChars?: boolean,
  upperCaseChars?: boolean,
  numericDigits?: boolean,
  otherChars?: boolean,
  minLength?: number,
  maxLength?: number,
}): string {
  let result = ''
  let characters = options.lowerCaseChars ? 'abcdefghijklmnopqrstuvwxyz' : ''
    + options.upperCaseChars ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''
      + options.numericDigits ? '0123456789' : ''
        + options.otherChars ? ',./<>?;:"[]\\{}|`~!@#$%^&*()_+=-' : ''
  let length = Math.floor(Math.random() * options.maxLength) + options.minLength
  let charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 *
 */
export function randomeID() {
  return crypto.randomBytes(16).toString('hex')
}

/**
 *
 * @param page
 * @returns
 */
export function extendPageObj(page: any) {
  //
  page.__requests = []
  page.on('request', (request) => {
    page.__requests.push({
      url: request.url(),
      method: request.method(),
      redirectedFrom: request.redirectedFrom()?.url(),
      time: time()
    })
  })
  //
  page.__responses = []
  page.on('response', (response) => {
    page.__responses.push({
      url: response.url(),
      status: response.status(),
      time: time()
    })
  })
  //
  page.__downloads = []
  page.on('download', (download) => {
    page.__downloads.push({
      suggestedFilename: download.suggestedFilename(),
      time: time()
    })
  })
  //
  page.on('popup', (popup: any) => {
    extendPageObj(popup)
  })
  // Get all popups when they open
  page.getPopup = async () => {
    for (let i = 0; i < RETRY_COUNT; i++) {
      for (let p of page.context().pages()) {
        let openner = await p.opener()
        if (openner === page) {
          return p
        }
      }
      // Wait for the popup appears
      await sleep(100)
    }

    return null
  }
  //
  page.getDialogData = () => {
    if (page.__dialogData && page.__dialogData.length) {
      return page.__dialogData
    }

    return null
  }
  //
  page.makeDialogHandler = async (dialogData: Array<object>) => {
    page.__dialogData = dialogData
  }
  //
  page.on('dialog', async (dialog) => {
    let type = dialog.type()
    let data = page.__dialogData.shift()
    if (data) {
      async function validateMessage() {
        if (data.messageValidation && dialog.message() !== data.message) {
          throw new Error(`Expecting message "${data.message}" but found "${dialog.message()}"`)
        }
      }

      async function validateDefaultValue() {
        if (data.defaultValidation && dialog.defaultValue() !== data.default) {
          throw new Error(`Expecting default value "${data.default}" but found "${dialog.defaultValue()}"`)
        }
      }

      async function processDialogResult() {
        switch (type) {
          case 'alert':
            await dialog.accept()
            break
          default:
            if (data.action === 'accept') {
              await dialog.accept(type === 'prompt'? data.input: '')
            } else {
              await dialog.dismiss()
            }
            break
        }
      }

      if (type !== data.type) {
        throw new Error(`Dialog type not match: expecting [${data.type}] but found [${type}]`)
      }

      switch (type) {
        case 'alert':
          await validateMessage()
          await processDialogResult()
          break

        case 'beforeunload':
          await processDialogResult()
          break

        case 'confirm':
          await validateMessage()
          await processDialogResult()
          break

        case 'prompt':
          await validateMessage()
          await validateDefaultValue()
          await processDialogResult()
          break
      }
    } else {
      await dialog.dismiss()
      throw new Error(`Unexpected ${type} dialog is shown!`)
    }
  })
  //
	/**
	 * Pick value from an element
	 * @param {By} selector CSS selector of element to pick value from
	 * @param {Object} options Options
	 */
  page.pickValue = async (selector, options) => {
    const elementHandle = await (page.locator(selector)).elementHandle()
		let text = await elementHandle.evaluate((el) => el.value || el.textContent)

    if (options.dataType === 'regExp') {
			let flags = options.ignoreCase ? 'i' : '' + options.multiLine ? 'm' : ''
			let regExp = new RegExp(options.regExp, flags)
			let match = regExp.exec(text)
			if (match.length > 0) {
				return match[options.matchIndex]
			}
			throw new Error('RegExp not match')
		} else {
			if (options.trimLeft) {
				text = text.trimLeft()
			}
			if (options.trimRight) {
				text = text.trimRight()
			}
			return text
		}
	}


  return page
}

/**
 *
 * @param browser
 * @returns
 */
export async function createIsolatedPage(browser: Browser) {
  let page = await (await browser.newContext()).newPage()
  return extendPageObj(page)
}

/**
 *
 * @param fn
 * @param args
 * @returns
 */
async function loop(fn: jest.CustomMatcher, context: jest.MatcherContext, retryCount: Number, ...args: InputArguments): ASyncExpectationResult {
  let result: SyncExpectationResult
  for (let i = 0; i < retryCount; i++) {
    result = await fn.apply(context, args)
    if (result.pass) {
      break
    } else {
      await sleep(100)
    }
  }

  return result
}

const toBeChecked: jest.CustomMatcher = async function (
  ...args: InputArguments
): Promise<SyncExpectationResult> {
  try {
    const [elementHandle] = await getElementHandle(args, 0)
    const isChecked = await elementHandle.isChecked()

    return {
      pass: isChecked,
      message: () => getMessage(this, "toBeChecked", true, isChecked, ""),
    }
  } catch (err) {
    return {
      pass: false,
      message: () => err.toString(),
    }
  }
}

const toContainText: jest.CustomMatcher = async function (
  ...args: InputArguments
): ASyncExpectationResult {
  try {
    const [elementHandle, [expectedValue]] = await getElementHandle(args)
    /* istanbul ignore next */
    const actualValue = await elementHandle.evaluate((el: HTMLElement) => el.innerText)
    const pass = actualValue.indexOf(expectedValue) >= 0

    return {
      pass,
      message: () =>
        getMessage(this, "toMatchText", expectedValue, actualValue),
    }
  } catch (err) {
    return {
      pass: false,
      message: () => err.toString(),
    }
  }
}

const toMatchText: jest.CustomMatcher = async function (
  ...args: InputArguments
): ASyncExpectationResult {
  try {
    const [elementHandle, [expectedValue]] = await getElementHandle(args)
    /* istanbul ignore next */
    const actualValue = await elementHandle.evaluate((el) => el.textContent)
    const pass = compareText(expectedValue, actualValue)

    return {
      pass,
      message: () =>
        getMessage(this, "toMatchText", expectedValue, actualValue),
    }
  } catch (err) {
    return {
      pass: false,
      message: () => err.toString(),
    }
  }
}

const toMatchScreenshot: jest.CustomMatcher = async function (
  ...args: InputArguments
): ASyncExpectationResult {
  try {
    const [elementHandle, [screenshotFilename, threshold, comparisonMode]] = await getElementHandle(args)
    let screenshotPath = path.join(__RESOURCE_DIR__, 'screenshots', `${randomeID()}.png`)
    await (elementHandle as Page | ElementHandle).screenshot({ path: screenshotPath, fullPage: true})
    try {
      let pass = await compareImage(screenshotPath, screenshotFilename, Number.parseFloat(threshold), this.isNot, comparisonMode)
      return {
        pass,
        message: () =>
          getMessage(this, "toMatchScreenshot", '', ''),
      }
    } finally {
      fs.unlinkSync(screenshotPath)
    }
  } catch (err) {
    return {
      pass: false,
      message: () => err.toString(),
    }
  }
}

const toMatchValue: jest.CustomMatcher = async function (
  ...args: InputArguments
): Promise<SyncExpectationResult> {
  try {
    const [elementHandle, expectedValue] = await getElementHandle(args)
    /* istanbul ignore next */
    const actualValue = await elementHandle.evaluate(
      (el: HTMLElement) => {
        if (el.tagName.toLowerCase() == 'select') {
          let selected = []
          for (let s of (el as HTMLSelectElement).selectedOptions) {
            selected.push(s.value)
          }
          return selected
        }
        return (el as HTMLInputElement).value
      }
    )

    return {
      pass: Array.isArray(actualValue)
          ? compareArray(expectedValue, actualValue)
          : compareText(expectedValue[0], String(actualValue)),
      message: () =>
        getMessage(this, "toMatchValue", expectedValue, actualValue),
    }
  } catch (err) {
    return {
      pass: false,
      message: () => err.toString(),
    }
  }
}

const toMatchURL: jest.CustomMatcher = async function (
  page: ExpectInputType,
  expectedUrl: RegExp | string,
  comparisonMode: UrlComparisonMode = UrlComparisonMode.Default
): Promise<SyncExpectationResult> {
  const frame = await getFrame(page)
  const actualUrl = frame!.url()

  return {
    pass: compareURL(expectedUrl, actualUrl, comparisonMode),
    message: () => getMessage(this, "toMatchURL", expectedUrl, actualUrl),
  }
}

const toDownload: jest.CustomMatcher = async function (
  page: any,
  expectedFilename: string,
  comparisonMode?: StringComparisonMode
): Promise<SyncExpectationResult> {
  let now = time()
  for (let d of page.__downloads) {
    if (d.time + TIME_CHECK_DELTA >= now) {
      if (compareTextEx(expectedFilename, d.suggestedFilename, comparisonMode) === true) {
        return {
          pass: true,
          message: () => getMessage(this, "toDownload", expectedFilename, d.suggestedFilename),
        }
      }
    }
  }

  return {
    pass: false,
    message: () => getMessage(this, "toDownload", expectedFilename, 'not found'),
  }
}

const toBeRedirectedTo: jest.CustomMatcher = async function (
  page: any,
  expectedUrl: RegExp | string,
  comparisonMode: UrlComparisonMode = UrlComparisonMode.Default
): Promise<SyncExpectationResult> {
  let now = time()
  for (let d of page.__requests) {
    if (d.time + TIME_CHECK_DELTA >= now) {
      if (d.redirectedFrom && compareURL(expectedUrl, d.url, comparisonMode) === true) {
        return {
          pass: true,
          message: () => getMessage(this, "toBeRedirectedTo", expectedUrl, d.url),
        }
      }
    }
  }

  return {
    pass: false,
    message: () => getMessage(this, "toBeRedirectedTo", expectedUrl, 'not found'),
  }
}

const toSubmitFormTo: jest.CustomMatcher = async function (
  page: any,
  expectedUrl: RegExp | string,
  comparisonMode: UrlComparisonMode = UrlComparisonMode.Default
): Promise<SyncExpectationResult> {
  let now = time()
  for (let d of page.__requests) {
    if (d.time + TIME_CHECK_DELTA >= now) {
      if (compareURL(expectedUrl, d.url, comparisonMode) === true) {
        return {
          pass: true,
          message: () => getMessage(this, "toSubmitFormTo", expectedUrl, d.url),
        }
      }
    }
  }

  return {
    pass: false,
    message: () => getMessage(this, "toSubmitFormTo", expectedUrl, 'not found'),
  }
}

expect.extend({
  async toBeChecked(...args: InputArguments): ASyncExpectationResult {
    return await loop(toBeChecked, this, RETRY_COUNT, ...args)
  },

  async toBeRedirectedTo(...args: InputArguments): ASyncExpectationResult {
    return await loop(toBeRedirectedTo, this, RETRY_COUNT, ...args)
  },

  async toContainText(...args: InputArguments): ASyncExpectationResult {
    return await loop(toContainText, this, RETRY_COUNT, ...args)
  },

  async toDownload(...args: InputArguments): ASyncExpectationResult {
    return await loop(toDownload, this, RETRY_COUNT, ...args)
  },

  async toMatchText(...args: InputArguments): ASyncExpectationResult {
    return await loop(toMatchText, this, RETRY_COUNT, ...args)
  },

  async toMatchValue(...args: InputArguments): ASyncExpectationResult {
    return await loop(toMatchValue, this, RETRY_COUNT, ...args)
  },

  async toMatchURL(...args: InputArguments): ASyncExpectationResult {
    return await loop(toMatchURL, this, RETRY_COUNT, ...args)
  },

  async toMatchScreenshot(...args: InputArguments): ASyncExpectationResult {
    return await loop(toMatchScreenshot, this, RETRY_COUNT, ...args)
  },

  async toSubmitFormTo(...args: InputArguments): ASyncExpectationResult {
    return await loop(toSubmitFormTo, this, RETRY_COUNT, ...args)
  }
})
