// MIT License

// Copyright (c) 2020 Max Schmitt
// https://github.com/playwright-community/expect-playwright

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


import type { Page, ElementHandle, Frame, Locator } from "playwright-core"
import { convertWildcardToRegExp } from "."

export enum StringComparisonMode {
  Equal, 
  Contain, 
  Wildcard
}

export enum UrlComparisonMode {
  Default,
  Identical,  
}

export type Handle = Page | Frame | ElementHandle | Locator
export type ExpectInputType = Handle | Promise<Handle>

const isElementHandle = (value: Handle): value is ElementHandle => {
  return value.constructor.name === "ElementHandle"
}

const isLocator = (value: Handle): value is Locator => {
  return value.constructor.name === "Locator"
}

export const getFrame = async (value: ExpectInputType) => {
  const resolved = await value

  return isElementHandle(resolved)
    ? resolved.contentFrame()
    : (resolved as Page | Frame)
}

const isObject = (value: unknown) =>
  typeof value === "object" && !(value instanceof RegExp)

export interface PageWaitForSelectorOptions {
  /**
   * Defaults to `'visible'`. Can be either:
   * - `'attached'` - wait for element to be present in DOM.
   * - `'detached'` - wait for element to not be present in DOM.
   * - `'visible'` - wait for element to have non-empty bounding box and no `visibility:hidden`. Note that element without
   *   any content or with `display:none` has an empty bounding box and is not considered visible.
   * - `'hidden'` - wait for element to be either detached from DOM, or have an empty bounding box or `visibility:hidden`.
   *   This is opposite to the `'visible'` option.
   */
  state?: "attached" | "detached" | "visible" | "hidden"

  /**
   * Maximum time in milliseconds, defaults to 30 seconds, pass `0` to disable timeout. The default value can be changed by
   * using the
   * [browserContext.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-default-timeout)
   * or [page.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-page#page-set-default-timeout) methods.
   */
  timeout?: number
}

export type InputArguments = [
  ExpectInputType,
  string?,
  (string | PageWaitForSelectorOptions)?,
  PageWaitForSelectorOptions?
]

export const getElementHandle = async (
  args: InputArguments,
  valueArgCount = 1
) => {
  // Pluck the options off the end first
  const options =
    args.length > 1 && isObject(args[args.length - 1])
      ? (args.pop() as PageWaitForSelectorOptions)
      : {}

  // Next, pluck the number of args required by the matcher (defaults to 1)
  const expectedValue = args.splice(-valueArgCount, valueArgCount) as string[]

  // Finally, we can find the element handle
  let handle = await args[0]
  handle = (await getFrame(handle)) ?? handle

  if (isLocator(handle)) {
    handle = (await handle.elementHandle())!
  }
  // If the user provided a page or iframe, we need to locate the provided
  // selector or the `body` element if none was provided.
  else if (!isElementHandle(handle)) {
    const selector = args[1] ?? "body"

    try {
      handle = (await handle.waitForSelector(selector, options))!
    } catch (err) {
      throw new Error(`Timeout exceed for element ${quote(selector)}`)
    }
  }

  return [handle, expectedValue] as const
}

export const quote = (val: string | null) => (val === null ? "" : `'${val}'`)

export const getMessage = (
  { isNot, promise, utils, expand }: jest.MatcherContext,
  matcher: string,
  expected: unknown,
  received: unknown,
  expectedHint: string | undefined = undefined
) => {
  const message = isNot
    ? `Expected: not ${utils.printExpected(expected)}`
    : utils.printDiffOrStringify(
        expected,
        received,
        "Expected",
        "Received",
        expand
      )

  return (
    utils.matcherHint(matcher, undefined, expectedHint, { isNot, promise }) +
    "\n\n" +
    message
  )
}

export const compareArray = (
  expectedValue: Array<string>,
  actualValue: Array<string>
) => {
  if (expectedValue.length === actualValue.length) {
    for (let i = 0; i < expectedValue.length; i++) {
      if (expectedValue[i] !== actualValue[i]) {
        return false
      }
    }
    return true
  }

  return false
}

export const compareText = (
  expectedValue: string | RegExp,
  actualValue: string | null
) => {
  return typeof expectedValue === "string"
    ? expectedValue === actualValue
    : expectedValue.test(actualValue ?? "")
}

export const compareTextEx = (
  expectedValue: string | RegExp,
  actualValue: string | null,
  comparisonMode?: StringComparisonMode
) => {
  if (typeof comparisonMode !== undefined) {
    switch (+comparisonMode) {
      case StringComparisonMode.Equal: return actualValue === expectedValue
      case StringComparisonMode.Contain: return actualValue && (actualValue ?? "").indexOf(String(expectedValue)) >= 0
      case StringComparisonMode.Wildcard: return convertWildcardToRegExp(String(expectedValue)).test(actualValue ?? "")
    }
  } else {
    return compareText(expectedValue, actualValue)
  }
}

/**
 * Test simple URL
 */
export const defaultUrlComparison = (
  url1: string, 
  url2: string
) => {
  let urlParts1 = new URL(url1)
  let urlParts2 = new URL(url2)

  return (urlParts1.protocol === urlParts2.protocol)
    && (urlParts1.host === urlParts2.host)
    && (urlParts1.pathname === urlParts2.pathname)
    && (urlParts1.port === urlParts2.port)
}

export const compareURL = (
  expectedValue: string | RegExp,
  actualValue: string | null,
  comparisonMode: UrlComparisonMode
) => {
  return typeof expectedValue === "string"
    ? typeof comparisonMode === 'undefined' || comparisonMode === UrlComparisonMode.Default? 
        defaultUrlComparison(expectedValue, actualValue)
        : expectedValue === actualValue
    : expectedValue.test(actualValue ?? "")
}
