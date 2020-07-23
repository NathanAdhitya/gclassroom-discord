/**
 * @file Enhances student laziness by automatically posting classroom announcements and assignments through a Discord Webhook.
 * @author Nathan Adhitya <me@natha.my.id>
 */

/*
Latest Changelogs (21/07/2020)
- Now supports when things get updated.
- added extra comments, needs more comedy though.
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
const hook = userProperties.getProperty("discordWebhook") || scriptProperties.getProperty("discordWebhook");
const locale = userProperties.getProperty("locale") || scriptProperties.getProperty("locale") || "id";

// Classroom related functions

/** Lists all courses of someone */
function listAllCourses() {
    const response = Classroom.Courses.list();
    const courses = response.courses;
    return courses.filter((element) => element.courseState === "ACTIVE");
}

/** Filters out new entries */
function getNewEntries(course: GoogleAppsScript.Classroom.Schema.Course) {
    // Compute property name
    const property = `${course.id}_lastUpdate`;
    // Catch weird google issues
    try {
        const responseA = Classroom.Courses.Announcements.list(course.id);
        const responseB = Classroom.Courses.CourseWork.list(course.id);
        const announcements = responseA.announcements;
        const courseWorks = responseB.courseWork;

        // Now, let's get the newest ones.
        const lastUpdate = Number(scriptProperties.getProperty(property));

        if (lastUpdate) {
            const filteredAnnouncements = !announcements ? null : cutLastUpdate(announcements, lastUpdate);
            const filteredCourseWorks = !courseWorks ? null : cutLastUpdate(courseWorks, lastUpdate);

            // Update the last update data.
            scriptProperties.setProperty(property, String(Date.now()));
            return { announcements: filteredAnnouncements, courseWorks: filteredCourseWorks }
        }

        // Update the last update data.
        scriptProperties.setProperty(property, String(Date.now()));
        return { announcements, courseWorks };
    } catch (e) {
        Logger.log(e);
    }
}

/** Ah yes, the running logic. WHY ARE YOU RUNNING 👀 */
function run() {
    const embeds: Discord.Embed[] = [];
    const courses = listAllCourses();
    courses.forEach((course) => {
        const { announcements, courseWorks } = getNewEntries(course);
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
