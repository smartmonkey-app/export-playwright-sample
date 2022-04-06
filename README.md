# Exported Playwright code from Smart Monkey

This repository demos "Export as Playwright code" of Smart Monkey.
## Recorded Video
[![Watch the video](https://img.youtube.com/vi/TFH8OhdHr-k/default.jpg)](https://youtu.be/TFH8OhdHr-k)

## Result

```typescript
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
const buttonLaunchDemoModal       = `xpath=//button[@data-target='#exampleModal']`
const checkbox1                   = `xpath=//input[@id='inlineCheckbox1']`
const checkbox2                   = `xpath=//input[@id='inlineCheckbox2']`
const fileExampleFileInput        = `xpath=//input[@id='exampleFormControlFile1']`
const radio1                      = `xpath=//input[@id='inlineRadio1'][@name='inlineRadioOptions']`
const selectExampleMultipleSelect = `xpath=//select[@id='exampleFormControlSelect2']`
const selectExampleSelect         = `xpath=//select[@id='exampleFormControlSelect1']`
const textboxEmailAddress         = `xpath=//input[@id='exampleFormControlInput1']`
const textboxExampleTextarea      = `xpath=//textarea[@id='exampleFormControlTextarea1']`

let {
    baseUrl
} = process.env

baseUrl = baseUrl || `https://www.smartmonkey.app`

test(`Form elements`, async ({ browser, page }) => {
    try {
        // Navigate to [{{baseUrl}}/demo/form/]
        await page.goto(`${baseUrl}/demo/form/`)
        // Focus [Email address]
        await page.focus(textboxEmailAddress)
        // Enter [testform@smartmonkey.app] into [Email address]
        await page.fill(textboxEmailAddress, `testform@smartmonkey.app`)
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

```

As you see, the code is very clear and very easy to read. It is fully commented! Impressed :)

Click [here](https://github.com/smartmonkey-app/export-playwright-sample/tree/main/src) to see the full exported code!