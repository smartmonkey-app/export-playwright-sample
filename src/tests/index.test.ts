/**
 * The contents of this file are subject to the MIT license as set out below.
 *
 * Copyright © 2021 Ngô Thạch (https://www.smartmonkey.app)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import path from 'path'
import { test as baseTest, expect } from "@playwright/test"
import { 
    Page, 
    createIsolatedPage, 
    extendPageObj, 
    randomString, 
    requireJSON, 
    sleep,    
    UrlComparisonMode,
    StringComparisonMode,    
} from "../extension"
 
const test = baseTest.extend<{ page: Page }>({
    page: async ({ page }, use) => {
        await use(extendPageObj(page))
    }
})

const __RESOURCE_DIR__ = process.env.__RESOURCE_DIR__

const buttonClose                 = `xpath=//div[@id='exampleModal']//button[@data-dismiss]`
const buttonContinueToCheckout    = `xpath=//form[@id='checkout']//button[@type='submit']`
const buttonCrop                  = `xpath=//p[@id='actions']//button[@id='crop']`
const buttonDecode                = `xpath=//button[@id='btn-decode']`
const buttonEdit                  = `xpath=//p[@id='actions']//button[@id='edit']`
const buttonEncode                = `xpath=//button[@id='btn-encode']`
const buttonLaunchDemoModal       = `xpath=//button[@data-target='#exampleModal']`
const buttonRedeem                = `xpath=//form[@id='cart']//button[@id='promo-code-submit']`
const buttonShow                  = `xpath=//button[@id='btn-alert']`
const buttonShow__0               = `xpath=//button[@id='btn-confirm']`
const buttonShow__1               = `xpath=//button[@id='btn-prompt']`
const buttonSignIn                = `xpath=//div[@id='form-content']//button[@id='btn-signin'] | //form[@id='form-signin']//button[@id='btn-signin']` //NOTICE: multi-selector
const canvasResultImage           = `xpath=//div[@id='result']//canvas[@title='Result image']`
const checkbox1                   = `xpath=//input[@id='inlineCheckbox1']`
const checkbox2                   = `xpath=//input[@id='inlineCheckbox2']`
const divValidationResult         = `xpath=//form[@id='form-email-validator']//div[@id='result'][@title='Validation Result']`
const fileExampleFileInput        = `xpath=//input[@id='exampleFormControlFile1']`
const fileFileInput               = `xpath=//input[@id='file-input']`
const linkDownload                = `xpath=//div[@id='form-content']//a[@id='btn-download']`
const radio1                      = `xpath=//input[@id='inlineRadio1'][@name='inlineRadioOptions']`
const selectCountry               = `xpath=//form[@id='checkout']//select[@id='country']`
const selectExampleMultipleSelect = `xpath=//select[@id='exampleFormControlSelect2']`
const selectExampleSelect         = `xpath=//select[@id='exampleFormControlSelect1']`
const selectState                 = `xpath=//form[@id='checkout']//select[@id='state']`
const textboxAddress              = `xpath=//form[@id='checkout']//input[@id='address']`
const textboxCcCvv                = `xpath=//form[@id='checkout']//input[@id='cc-cvv']`
const textboxCreditCardNumber     = `xpath=//form[@id='checkout']//input[@id='cc-number']`
const textboxEmailAddress         = `xpath=//form[@id='form-email-validator']//input[@id='input-email'][@title='Email address'] | //form[@id='form-signin']//input[@id='input-email']` //NOTICE: multi-selector
const textboxEmailAddress__0      = `xpath=//input[@id='exampleFormControlInput1']`
const textboxExampleTextarea      = `xpath=//textarea[@id='exampleFormControlTextarea1']`
const textboxExpiration           = `xpath=//form[@id='checkout']//input[@id='cc-expiration']`
const textboxFirstName            = `xpath=//form[@id='checkout']//input[@id='firstName']`
const textboxLastName             = `xpath=//form[@id='checkout']//input[@id='lastName']`
const textboxNameOnCard           = `xpath=//form[@id='checkout']//input[@id='cc-name']`
const textboxPassword             = `xpath=//form[@id='form-signin']//input[@id='input-password']`
const textboxPromoCode            = `xpath=//form[@id='cart']//input[@id='promo-code']`
const textboxResult               = `xpath=//textarea[@id='result'][@title='Result']`
const textboxTextToDecode         = `xpath=//textarea[@id='text-to-decode'][@title='Text to decode']`
const textboxTextToEncode         = `xpath=//textarea[@id='text-to-encode'][@title='Text to encode']`
const textboxZip                  = `xpath=//form[@id='checkout']//input[@id='zip']`

let {
    encodedString,
    stringToEncode,
    testEmail,
    testEmailResult
} = process.env

test(`Base64 encode/decode`, async ({ browser, page }) => {
    try {
        // Generate random value for [{{stringToEncode}}]
        stringToEncode = randomString({
        	lowerCaseChars: true,
        	upperCaseChars: true,
        	numericDigits: true,
        	minLength: 25,
        	maxLength: 25
        })
        // Navigate to [https://www.smartmonkey.app/demo/base64-encode/]
        await page.goto(`https://www.smartmonkey.app/demo/base64-encode/`)
        // Focus [Text to encode]
        await page.focus(textboxTextToEncode)
        // Enter [{{stringToEncode}}] into [Text to encode]
        await page.fill(textboxTextToEncode, `${stringToEncode}`)
        // Click [Encode]
        await page.click(buttonEncode)
        // Set value for [{{encodedString}}] from [Result]
        encodedString = await page.pickValue(textboxResult, {
        	trimLeft: true,
        	trimRight: true
        })
        // Navigate to [https://www.smartmonkey.app/demo/base64-decode/]
        await page.goto(`https://www.smartmonkey.app/demo/base64-decode/`)
        // Focus [Text to decode]
        await page.focus(textboxTextToDecode)
        // Enter [{{encodedString}}] into [Text to decode]
        await page.fill(textboxTextToDecode, `${encodedString}`)
        // Click [Decode]
        await page.click(buttonDecode)
        // Stop execution in 3s
        await sleep(3000)
        // Check the value of [Result] equals to [{{stringToEncode}}]
        await expect(page.locator(textboxResult)).toMatchValue(`${stringToEncode}`)
    } finally {
        await page.close()
    }
})

for (let [index, __data] of requireJSON(path.join(__RESOURCE_DIR__, `{1FE7530B-3A02-43A1-AF80-E0FD1A6D6BEB}.smtestdata`)).data.entries()) {
    test(`Data-Driven Tests [${index+1}]`, async ({ browser, page }) => {
        testEmail = __data.testEmail
        testEmailResult = __data.testEmailResult

        try {
            // Navigate to [https://www.smartmonkey.app/demo/ddt/]
            await page.goto(`https://www.smartmonkey.app/demo/ddt/`)
            // Focus [Email address]
            await page.focus(textboxEmailAddress)
            // Enter [{{testEmail}}] into [Email address]
            await page.fill(textboxEmailAddress, `${testEmail}`)
            // Assert [Validation Result] contains [{{testEmailResult}}]
            await expect(page).toContainText(divValidationResult, `${testEmailResult}`)
        } finally {
            await page.close()
        }
    })

}

test(`Download`, async ({ browser, page }) => {
    try {
        // Navigate to [https://www.smartmonkey.app/demo/download/]
        await page.goto(`https://www.smartmonkey.app/demo/download/`)
        // Click [Download]
        await page.click(linkDownload)
        // Download [readme.7z]
        await expect(page).toDownload(`readme.7z`, StringComparisonMode.Contain)
    } finally {
        await page.close()
    }
})

test(`Form elements`, async ({ browser, page }) => {
    try {
        // Navigate to [https://www.smartmonkey.app/demo/form/]
        await page.goto(`https://www.smartmonkey.app/demo/form/`)
        // Focus [Email address]
        await page.focus(textboxEmailAddress__0)
        // Enter [testform@smartmonkey.app] into [Email address]
        await page.fill(textboxEmailAddress__0, `testform@smartmonkey.app`)
        // Select [7] from [Example select]
        await page.selectOption(selectExampleSelect, '7')
        // Select [2, 7, 8] from [Example multiple select]
        await page.selectOption(selectExampleMultipleSelect, ['2', '7', '8'])
        // Focus [Example textarea]
        await page.focus(textboxExampleTextarea)
        // Enter [Test] into [Example textarea]
        await page.fill(textboxExampleTextarea, `Test`)
        // Select [water-lily.jpg]
        await page.setInputFiles(fileExampleFileInput, [
        	path.join(__RESOURCE_DIR__, `{601618A1-74AA-44D3-94F9-EECD87C74460}`, `water-lily.jpg`)
        ])
        // Check [1]
        await page.check(checkbox1)
        // Check [2]
        await page.check(checkbox2)
        // Select [1]
        await page.check(radio1)
        // Click [Launch demo modal]
        await page.click(buttonLaunchDemoModal)
        // Assert [Current page] contains [Demo modal with transition!]
        await expect(page).toContainText(`Demo modal with transition!`)
        // Click [×]
        await page.click(buttonClose)
    } finally {
        await page.close()
    }
})

test(`Image crop`, async ({ browser, page }) => {
    try {
        // Navigate to [https://www.smartmonkey.app/demo/image-crop/]
        await page.goto(`https://www.smartmonkey.app/demo/image-crop/`)
        // Select [water-lily.jpg]
        await page.setInputFiles(fileFileInput, [
        	path.join(__RESOURCE_DIR__, `{15247585-1A44-466F-9C3C-FF92348898E5}`, `water-lily.jpg`)
        ])
        // Click [Edit]
        await page.click(buttonEdit)
        // Click [Crop]
        await page.click(buttonCrop)
        // Compare [Result image] with captured image
        await expect(await page.locator(canvasResultImage).screenshot()).toMatchSnapshot('{9C82CAFA-EB1A-4DBA-8FA8-5A1BB8E7C446}.png')
    } finally {
        await page.close()
    }
})

test(`Native Dialogs`, async ({ browser, page }) => {
    await page.makeDialogHandler([
    	{
    		type: 'alert',
    		message: `I do love Smart Monkey`,
    		messageValidation: false
    	},
    	{
    		type: 'confirm',
    		action: 'accept',
    		message: `Do you love Smart Monkey?`,
    		messageValidation: false
    	},
    	{
    		type: 'prompt',
    		action: 'accept',
    		message: `What do you think about Smart Monkey?`,
    		messageValidation: true,
    		default: `Awesome`,
    		defaultValidation: true,
    		input: `Awesome`
    	}
    ])
    try {
        // Navigate to [https://www.smartmonkey.app/demo/native-dialogs/]
        await page.goto(`https://www.smartmonkey.app/demo/native-dialogs/`)
        // Click [Show]
        await page.click(buttonShow)
        // Click [Show]
        await page.click(buttonShow__0)
        // Click [Show]
        await page.click(buttonShow__1)
    } finally {
        await page.close()
        expect(page.getDialogData()).toBeNull()
    }
})

test(`Multi-Windows and Popup`, async ({ browser, page }) => {
    try {
        let page2 = await createIsolatedPage(browser)
        try {
            // Navigate to [https://www.smartmonkey.app/demo/popup/]
            await page.goto(`https://www.smartmonkey.app/demo/popup/`)
            // Click [Sign in]
            await page.click(buttonSignIn)
            // page creates a popup
            var popup = await page.getPopup()
            // Make handler for handling dialogs for popup
            await popup.makeDialogHandler([
            	{
            		type: 'alert',
            		message: `Invalid email or password`,
            		messageValidation: false
            	}
            ])
            // Focus [Email address]
            await popup.focus(textboxEmailAddress)
            // Enter [demo1@smartmonkey.app] into [Email address]
            await popup.fill(textboxEmailAddress, `demo1@smartmonkey.app`)
            // Focus [Password]
            await popup.focus(textboxPassword)
            // Enter [wrongpassword] into [Password]
            await popup.fill(textboxPassword, `wrongpassword`)
            // Click [Sign in]
            await popup.click(buttonSignIn)
            // Focus [Password]
            await popup.focus(textboxPassword)
            // Enter [demo] into [Password]
            await popup.fill(textboxPassword, `demo`)
            // Click [Sign in]
            await popup.click(buttonSignIn)
            // Assert [Current page] contains [Welcome demo1@smartmonkey.app]
            await expect(page).toContainText(`Welcome demo1@smartmonkey.app`)
            // Navigate to [https://www.smartmonkey.app/demo/popup/]
            await page2.goto(`https://www.smartmonkey.app/demo/popup/`)
            // Click [Sign in]
            await page2.click(buttonSignIn)
            // page2 creates a popup
            var popup2 = await page2.getPopup()
            // Focus [Email address]
            await popup2.focus(textboxEmailAddress)
            // Enter [demo2@smartmonkey.app] into [Email address]
            await popup2.fill(textboxEmailAddress, `demo2@smartmonkey.app`)
            // Focus [Password]
            await popup2.focus(textboxPassword)
            // Enter [demo] into [Password]
            await popup2.fill(textboxPassword, `demo`)
            // Click [Sign in]
            await popup2.click(buttonSignIn)
            // Assert [Current page] contains [Welcome demo2@smartmonkey.app]
            await expect(page2).toContainText(`Welcome demo2@smartmonkey.app`)
        } finally {
            await page2.close()
        }
    } finally {
        await page.close()
    }
})

test(`Promo-code`, async ({ browser, page }) => {
    try {
        // Navigate to [https://www.smartmonkey.app/demo/promo-code/]
        await page.goto(`https://www.smartmonkey.app/demo/promo-code/`)
        // Focus [First name]
        await page.focus(textboxFirstName)
        // Enter [Thach] into [First name]
        await page.fill(textboxFirstName, `Thach`)
        // Focus [Last name]
        await page.focus(textboxLastName)
        // Enter [Ngo] into [Last name]
        await page.fill(textboxLastName, `Ngo`)
        // Focus [Address]
        await page.focus(textboxAddress)
        // Enter [1 Milky Way] into [Address]
        await page.fill(textboxAddress, `1 Milky Way`)
        // Select [Vietnam] from [Country]
        await page.selectOption(selectCountry, 'Vietnam')
        // Select [Hue] from [State]
        await page.selectOption(selectState, 'Hue')
        // Focus [Zip]
        await page.focus(textboxZip)
        // Enter [123456] into [Zip]
        await page.fill(textboxZip, `123456`)
        // Click [Continue to checkout]
        await page.click(buttonContinueToCheckout)
        // Assert [Current page] contains [Name on card is required]
        await expect(page).toContainText(`Name on card is required`)
        // Focus [Name on card]
        await page.focus(textboxNameOnCard)
        // Enter [Thach Ngo] into [Name on card]
        await page.fill(textboxNameOnCard, `Thach Ngo`)
        // Focus [Credit card number]
        await page.focus(textboxCreditCardNumber)
        // Enter [123456789] into [Credit card number]
        await page.fill(textboxCreditCardNumber, `123456789`)
        // Focus [Expiration]
        await page.focus(textboxExpiration)
        // Enter [12/25] into [Expiration]
        await page.fill(textboxExpiration, `12/25`)
        // Focus [cc-cvv]
        await page.focus(textboxCcCvv)
        // Enter [123] into [cc-cvv]
        await page.fill(textboxCcCvv, `123`)
        // Assert [Current page] contains [Total (USD)
        // $25]
        await expect(page).toContainText(`Total (USD)
$25`)
        // Focus [Promo code]
        await page.focus(textboxPromoCode)
        // Enter [5-OFF] into [Promo code]
        await page.fill(textboxPromoCode, `5-OFF`)
        // Click [Redeem]
        await page.click(buttonRedeem)
        // Assert [Current page] contains [Promo code
        // 5-OFF]
        await expect(page).toContainText(`Promo code
5-OFF`)
        // Assert [Current page] contains [Total (USD)
        // $20]
        await expect(page).toContainText(`Total (USD)
$20`)
        // Click [Continue to checkout]
        await page.click(buttonContinueToCheckout)
        // Submit data to [https://www.smartmonkey.app/demo/promo-code/confirmation.html]
        await expect(page).toSubmitFormTo(`https://www.smartmonkey.app/demo/promo-code/confirmation.html`)
        // Assert [Current page] contains [Thank you for your order]
        await expect(page).toContainText(`Thank you for your order`)
        // Assert [Current page] contains [Your order has been received and is now being processed.]
        await expect(page).toContainText(`Your order has been received and is now being processed.`)
    } finally {
        await page.close()
    }
})

test(`Promo-code 2`, async ({ browser, page }) => {
    try {
        // Navigate to [https://www.smartmonkey.app/demo/promo-code2/]
        await page.goto(`https://www.smartmonkey.app/demo/promo-code2/`)
        // Focus [First name]
        await page.focus(textboxFirstName)
        // Enter [Thach] into [First name]
        await page.fill(textboxFirstName, `Thach`)
        // Focus [Last name]
        await page.focus(textboxLastName)
        // Enter [Ngo] into [Last name]
        await page.fill(textboxLastName, `Ngo`)
        // Focus [Address]
        await page.focus(textboxAddress)
        // Enter [1 Milky Way] into [Address]
        await page.fill(textboxAddress, `1 Milky Way`)
        // Select [Vietnam] from [Country]
        await page.selectOption(selectCountry, 'Vietnam')
        // Select [Hue] from [State]
        await page.selectOption(selectState, 'Hue')
        // Focus [Zip]
        await page.focus(textboxZip)
        // Enter [123456] into [Zip]
        await page.fill(textboxZip, `123456`)
        // Focus [Name on card]
        await page.focus(textboxNameOnCard)
        // Enter [Thach Ngo] into [Name on card]
        await page.fill(textboxNameOnCard, `Thach Ngo`)
        // Focus [Credit card number]
        await page.focus(textboxCreditCardNumber)
        // Enter [123456789] into [Credit card number]
        await page.fill(textboxCreditCardNumber, `123456789`)
        // Focus [Expiration]
        await page.focus(textboxExpiration)
        // Enter [12/25] into [Expiration]
        await page.fill(textboxExpiration, `12/25`)
        // Focus [cc-cvv]
        await page.focus(textboxCcCvv)
        // Enter [123] into [cc-cvv]
        await page.fill(textboxCcCvv, `123`)
        // Assert [Current page] contains [Total (USD)
        // $25]
        await expect(page).toContainText(`Total (USD)
$25`)
        // Focus [Promo code]
        await page.focus(textboxPromoCode)
        // Enter [5-OFF] into [Promo code]
        await page.fill(textboxPromoCode, `5-OFF`)
        // Click [Redeem]
        await page.click(buttonRedeem)
        // Assert [Current page] contains [Promo code
        // 5-OFF]
        await expect(page).toContainText(`Promo code
5-OFF`)
        // Assert [Current page] contains [Total (USD)
        // $20]
        await expect(page).toContainText(`Total (USD)
$20`)
        // Focus [Promo code]
        await page.focus(textboxPromoCode)
        // Enter [9WEEKEND] into [Promo code]
        await page.fill(textboxPromoCode, `9WEEKEND`)
        // Click [Redeem]
        await page.click(buttonRedeem)
        // Assert [Current page] contains [Promo code
        // 9WEEKEND]
        await expect(page).toContainText(`Promo code
9WEEKEND`)
        // Assert [Current page] contains [Total (USD)
        // $22.5]
        await expect(page).toContainText(`Total (USD)
$22.5`)
        // Click [Continue to checkout]
        await page.click(buttonContinueToCheckout)
        // Submit data to [https://www.smartmonkey.app/demo/promo-code2/confirmation.html]
        await expect(page).toSubmitFormTo(`https://www.smartmonkey.app/demo/promo-code2/confirmation.html`)
        // Assert [Current page] contains [Thank you for your order]
        await expect(page).toContainText(`Thank you for your order`)
        // Assert [Current page] contains [Your order has been received and is now being processed.]
        await expect(page).toContainText(`Your order has been received and is now being processed.`)
    } finally {
        await page.close()
    }
})

