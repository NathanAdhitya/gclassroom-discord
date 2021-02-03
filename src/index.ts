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
        const responseC = Classroom.Courses.CourseWorkMaterials.list(course.id);
        const announcements = responseA.announcements;
        const courseWorks = responseB.courseWork;
        const courseWorkMaterials = responseC.courseWorkMaterial;

        if (lastUpdate) {
            const filteredAnnouncements = !announcements ? null : cutLastUpdate(announcements, lastUpdate);
            const filteredCourseWorks = !courseWorks ? null : cutLastUpdate(courseWorks, lastUpdate);
            const filteredCourseWorkMaterials = !courseWorkMaterials ? null : cutLastUpdate(courseWorkMaterials, lastUpdate);

            return { announcements: filteredAnnouncements, courseWorks: filteredCourseWorks, materials: filteredCourseWorkMaterials }
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
        const { announcements, courseWorks, materials } = getNewEntries(course, lastUpdate);
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
                        url: course.alternateLink
                    },
                    timestamp: updateTime,
                });
            });
        }

        if (courseWorks && courseWorks.length > 0) {
            courseWorks.forEach((courseWork) => {
                const { title, alternateLink, updateTime, creationTime, dueDate, dueTime } = courseWork;
                const isNew = Math.abs(new Date(creationTime).getTime() - new Date(updateTime).getTime()) < 2000;
                embeds.push({
                    title: (isNew ? "[New Assignment]" : "[Assignment Updated]") + " " + title,
                    url: alternateLink,
                    description: generateEmbedContent(courseWork),
                    color: isNew ? 15105570 : 11027200,
                    author: {
                        name: course.name,
                        url: course.alternateLink
                    },
                    footer: {
                        text: dueDate && dueTime ? "Due: " + convertDue(dueDate, dueTime).toLocaleString(locale) : "No due date specified",
                    },
                    timestamp: updateTime,
                });
            });
        }

        if (materials && materials.length > 0) {
            materials.forEach((material) => {
                const { title, alternateLink, updateTime, creationTime } = material;
                const isNew = Math.abs(new Date(creationTime).getTime() - new Date(updateTime).getTime()) < 2000;
                embeds.push({
                    title: (isNew ? "[New Material]" : "[Material Updated]") + " " + title,
                    url: alternateLink,
                    description: generateEmbedContent(material),
                    color: isNew ? 15844367 : 12745742,
                    author: {
                        name: course.name,
                        url: course.alternateLink
                    },
                    timestamp: updateTime,
                });
            });
        }
    });

    if (embeds.length > 0)
    postEmbeds(hook, embeds);
}
