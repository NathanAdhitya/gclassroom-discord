# gclassroom-discord
Enhances student laziness by automatically posting classroom announcements and assignments through a Discord Webhook.

## Self Deploy Guide
1. Create a Script App Project https://script.google.com/
2. Follow the guide on installing `clasp` https://github.com/google/clasp
3. Clone this git locally `git clone git@github.com:NathanAdhitya/glclassroom-discord.git`
4. Create a .clasp.json, fill in with `{"scriptId": "your script id here"}`, replace "your script id here" with script id obtained by going to `File > Project Properties > Info`
5. Push the project to google apps script using `clasp push`
6. Follow the Project Setup Guide
7. You're done.


## Project Setup Guide
1. Set webhook link in `File > Project properties > Script properties`. Property: `discordWebhook`, insert discord webhook link as value.
2. Enable **Google Classroom API** in `Resources > Advanced Google Services`
3. If you have not, create a per-minute execution by going to `Edit > Current project's triggers`
4. Create a new trigger
5. ```
    Function to run: run
    Choose which deployment should run: Head
    Select event source: Time-driven
    Select type of time based trigger: Minutes timer
    Select minute interval: Every minute
    Failure notification settings: Notify me daily
   ```
6. Save the trigger. This will execute the script every minute.

## Development Guide
1. Follow the Self-Deploy guide, with the project setup guide being optional.
2. After cloning, use `npm install` to install all dependencies.
3. If you are using Visual Studio Code, make sure you have the TSLint plugin and Jest plugin.
4. If you wish to keep your google apps script in sync, you can use `clasp push --watch`
5. You can now start editing and testing.
