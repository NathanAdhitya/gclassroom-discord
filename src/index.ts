/**
 * @file Enhances student laziness by automatically posting classroom announcements and assignments through a Discord Webhook.
 * @author Nathan Adhitya <me@natha.my.id>
 */

/*
Latest Changelogs (24/07/2020)
- fixed hogging google's script properties API
*/

/*
KNOWN THINGS THIS THING WON'T ACCOUNT FOR:
- Google servers cutting the amount of data returned is not accounted for. thanks, google.
- Support for class material? google why u no gib api!?
*/

import { Discord } from "./typings";
import { convertDue, generateEmbedContent, postEmbeds, cutLastUpdate } from "./utils";

// Globals?
const scriptProperties = PropertiesService.getScriptProperties();
const userProperties = PropertiesService.getUserProperties();

// Some settings.
const hook = scriptProperties.getProperty("discordWebhook");
const ignores = scriptProperties.getProperty("ignoredClasses");
const ignored = ignores ? JSON.parse(ignores) as number[] : [];
const locale = scriptProperties.getProperty("locale") || "id";

// Classroom related functions

/** Lists all courses of someone */
function listAllCourses() {
    const response = Classroom.Courses.list();
    const courses = response.courses;
    return courses.filter((element) => element.courseState === "ACTIVE" && !ignored.includes(Number(element.id)));
}

/** Filters out new entries */
function getNewEntries(course: GoogleAppsScript.Classroom.Schema.Course, lastUpdate?: number) {
    // Catch weird google issues
    try {
        const responseA = Classroom.Courses.Announcements.list(course.id);
        const responseB = Classroom.Courses.CourseWork.list(course.id);
        const announcements = responseA.announcements;
        const courseWorks = responseB.courseWork;

        if (lastUpdate) {
            const filteredAnnouncements = !announcements ? null : cutLastUpdate(announcements, lastUpdate);
            const filteredCourseWorks = !courseWorks ? null : cutLastUpdate(courseWorks, lastUpdate);

            return { announcements: filteredAnnouncements, courseWorks: filteredCourseWorks }
        }

        return { announcements, courseWorks };
    } catch (e) {
        Logger.log(e);
    }
}

/** Ah yes, the running logic. WHY ARE YOU RUNNING 👀 */
function run() {
    const embeds: Discord.Embed[] = [];
    const courses = listAllCourses();

    // Now, let's get the newest ones.
    const lastUpdate = Number(scriptProperties.getProperty("lastUpdate"));

    // Update the last update data.
    scriptProperties.setProperty("lastUpdate", String(Date.now()));

    courses.forEach((course) => {
        const { announcements, courseWorks } = getNewEntries(course, lastUpdate);
        if (announcements && announcements.length > 0) {
            announcements.forEach((announcement) => {
                const { alternateLink, updateTime, creationTime } = announcement;
                const isNew = Math.abs(new Date(creationTime).getTime() - new Date(updateTime).getTime()) < 2000;
                embeds.push({
                    title: isNew ? "New Announcement" : "Announcement Updated",
                    url: alternateLink,
                    description: generateEmbedContent(announcement),
                    color: isNew ? 3066993 : 2067276,
                    author: {
                        name: course.name,
                        url: alternateLink
                    },
                    timestamp: updateTime,
                });
            });
        }

        if (courseWorks && courseWorks.length > 0) {
            courseWorks.forEach((courseWork) => {
                const { alternateLink, updateTime, creationTime, dueDate, dueTime } = courseWork;
                const isNew = Math.abs(new Date(creationTime).getTime() - new Date(updateTime).getTime()) < 2000;
                embeds.push({
                    title: isNew ? "New Assignment" : "Assignment Updated",
                    url: alternateLink,
                    description: generateEmbedContent(courseWork),
                    color: isNew ? 15105570 : 11027200,
                    author: {
                        name: course.name,
                        url: alternateLink
                    },
                    footer: {
                        text: dueDate && dueTime ? "Due: " + convertDue(dueDate, dueTime).toLocaleString(locale) : "No due date specified",
                    },
                    timestamp: updateTime,
                });
            });
        }
    });

    if (embeds.length > 0)
    postEmbeds(hook, embeds);
}
