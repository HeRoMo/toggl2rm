# Toggl2Rm

This is a Google Sheets add-on.
By using this add-on, you can import time tracking data in Toggl to your Redmine as time entries.

Toggl2Rm has the following features,

- Get detail report from Toggl, and write them to active sheet.
- Add time entries to Redmine from active sheet.

## Installation

1. Clone this repository
   ```bash
   $ git clone https://github.com/HeRoMo/toggl2rm.git
   $ cd toggl2rm
   ```
2. Install packages
   ```bash
   $ npm install
   ```
3. Login to Google.
   ```bash
   $ npm run login
   ```
4. Turn ON your Google Apps Script API<br>
   Access to https://script.google.com/home/usersettings and turn on Google Apps Script API.
   If already ON, skip this step.
5. Create Google Apps Script for toggl2rm
   ```bash
   $ npm run create_gas
   ```
   The script file named 'taggl2rm' is created in your Google Apps Script.
6. Upload files to Google Apps Script.
   ```bash
   $ npm run deploy
   ```
7. Run as test.<br>
   see [Test an Add\-on](https://developers.google.com/apps-script/add-ons/test)
   - Non-published add-on can be executed as only test.

## How to use

### Get detail report from Toggl

1. Setting Toggl and Redmine properties<br>
   Open Setting Dialog by Menu `Add-on > Toggl2Rm > 設定`<br>
   Set the following properties,
   - Toggl API TOKEN
   - Redmine Server
   - Redmine API KEY
2. Open sidebar<br>
   You can open sidebar by menu `Add-on > Toggl2Rm > サイドバーを開く`
3. Select Workspace and 年月, which you want to get report.
4. Select which all data or ticket data.
5. Push `読み出し` button.<br>
   **Notice: Active sheet will be overwritten by add-on.**

### Add time entries to Redmine

1. Push `時間を登録` Button<br>
   All rows in active sheet send to your Redmine server.

   **Notice: only data that has ticketId are sent to Redmine.**

## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
