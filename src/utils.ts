import { Discord } from "./typings";

/**
 * Turns due date and time into a Date object.
 */
export function convertDue(date: GoogleAppsScript.Classroom.Schema.Date, time: GoogleAppsScript.Classroom.Schema.TimeOfDay): Date {
    const d = new Date();
    d.setUTCDate(date.day);
    d.setUTCMonth(date.month - 1);
    d.setUTCFullYear(date.year);
    d.setUTCHours(time.hours || 0);
    d.setUTCMinutes(time.minutes || 0);
    d.setUTCSeconds(time.seconds || 0);
    d.setUTCMilliseconds(0);
    return d;
}

export interface MaterialData {
    title: string;
    url: string;
}

/** Gets a link from the material. */
export function getMaterialData(from: GoogleAppsScript.Classroom.Schema.Material): MaterialData {
    if (from.youtubeVideo) return { title: from.youtubeVideo.title, url: from.youtubeVideo.alternateLink };
    if (from.form) return { title: from.form.title, url: from.form.formUrl };
    if (from.link) return { title: from.link.title, url: from.link.url };
    if (from.driveFile) return { title: from.driveFile.driveFile.title, url: from.driveFile.driveFile.alternateLink };
}

/** Handles cutting of content, and adding in attachments/materials */
export function generateEmbedContent(from: GoogleAppsScript.Classroom.Schema.CourseWork | GoogleAppsScript.Classroom.Schema.Announcement) {
    const { materials } = from;
    const text = "text" in from ? from.text : "description" in from ? from.description : "*No description specified*";

    if (!materials) return text.substr(0, 1900) + (text.length > 1900 ? "..." : "");

    const materialText = materials.map((material) => {
        const data = getMaterialData(material);
        return `${data.title} - ${data.url}`
    }).join("\n");
    return `
        ${text.substr(0, 1900 - materialText.length)}${text.length > 1900 - materialText.length ? "..." : ""}

        **Attachments: **
        ${materialText}
    `;
}

/** Since google automatically sorts by last update, then cut the rest after the last update. */
export function cutLastUpdate<T extends {updateTime?: string}>(arr: T[], lastUpdate?: number): T[] {
    if (lastUpdate)
        for (let i = 0, len = arr.length; i < len; i++) {
            if (new Date(arr[i].updateTime).getTime() <= lastUpdate) {
                return arr.slice(0, i);
            }
        }
    return arr;
}

/** Post Embed to Discord's API */
export function postEmbeds(hook: string, embeds: Discord.Embed[]) {
    while (embeds.length > 0) {
        const data = embeds.slice(0, 10);

        // Remove 10 elements from embeds
        embeds = embeds.splice(10);

        // Logger.log(data);
        const options = {
            "method": "post" as GoogleAppsScript.URL_Fetch.HttpMethod,
            "contentType": "application/json",
            "payload": JSON.stringify({ embeds: data }),
        };
        UrlFetchApp.fetch(hook, options);
    }
}
