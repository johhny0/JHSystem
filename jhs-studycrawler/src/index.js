const cheerio = require('cheerio');
const fs = require('fs');
const mysql = require('mysql2/promise');
const { createTables } = require('./db');


async function connectBD() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'study_monitor'
    });

    console.log("DB Connected!");

    return connection;
}

function getHtmlFiles(startDir) {
    let files = [];
    const items = fs.readdirSync(startDir, { withFileTypes: true });

    for (const item of items) {
        const currentFile = `${startDir}/${item.name}`;
        if (item.isDirectory()) {
            files = [
                ...files,
                ...getHtmlFiles(currentFile)
            ];
        } else {
            files.push(currentFile);
        }
    }

    return files;
}

async function resolveCourse(connection, course, degree) {

    let [courses] = await connection.execute('SELECT * FROM `courses` WHERE `name` = ? ', [course]);

    if (!courses.length) {

        [courses] = await connection.execute(
            'INSERT INTO `courses` (name, degree) VALUES (?, ?)',
            [course, degree]);

        console.log("Course add: ", course);
    }

    return courses[0];
}

async function resolveSemester(connection, semester) {
    let [semesters] = await connection.execute('SELECT * FROM `semesters` WHERE `name` = ? ', [semester]);

    if (!semesters.length) {

        [semesters] = await connection.execute(
            'INSERT INTO `semesters` (name) VALUES (?)',
            [semester]);

        console.log("Semester add: ", semester);
    }

    return semesters[0];
}

async function resolveSubject(connection, subject) {
    let [subjects] = await connection.execute('SELECT * FROM `subjects` WHERE `name` = ? ', [subject.name]);

    if (!subjects.length) {

        [subjects] = await connection.execute(
            'INSERT INTO `subjects` ' +
            '(name, courseId, semesterId, totalActivities) ' +
            'VALUES ' +
            '(?, ?, ?, ?)',
            [subject.name, subject.courseId, subject.semesterId, subject.totalActivities]);

        console.log("Subject add: ", subject.name)
    }

    return subjects[0];
}

async function resolveActivity(connection, activity) {
    let [activities] = await connection.query('SELECT * FROM `activities` WHERE `name` = ? ', [activity.name]);

    if (!activities.length) {

        [activities] = await connection.execute(
            'INSERT INTO `activities` ' +
            '(name, subjectId, startDate, endDate) ' +
            'VALUES ' +
            '(?, ?, ?, ?)',
            [
                activity.name,
                activity.subjectId,
                activity.startDate,
                activity.endDate,
            ]);

        console.log("Activity add: ", activity.name)
    }

    return activities[0];
}

async function main() {
    const connection = await connectBD();

    await createTables(connection);

    console.log("-------------------------------------------------------------------")

    const coursesHtml = getHtmlFiles("./courses")
    for (const subject of coursesHtml) {
        console.log("Scrapping: ", subject)

        const subHtml = fs.readFileSync(subject, 'utf-8');
        const $ = cheerio.load(subHtml);

        // Course
        const breadcrumb = $(".breadcrumb li a")[1].attribs.title;
        const [course, degree, semester] = breadcrumb.split(" - ")

        const currentCourse = await resolveCourse(connection, course, degree);
        console.log({ currentCourse })

        // // TODO: SEMESTER
        const currentSemester = await resolveSemester(connection, semester);
        console.log({ currentSemester })

        // // // Subject
        const subjectName = $(".breadcrumb li.active").first().text().trim()
        const subjectActivitiesCount = $(".timeline-title").length;

        const currentSubject = await resolveSubject(connection, {
            name: subjectName,
            courseId: currentCourse.id,
            semesterId: currentSemester.id,
            totalActivities: subjectActivitiesCount
        })

        console.log({ currentSubject })

        // Activity
        const activitiesHtml = $("#js-activities-container > li");

        for (const activityHtml of activitiesHtml) {

            const $2 = cheerio.load(activityHtml)

            const activityName = $2(".timeline-title small").first().text().trim();
            let [startDate, endDate] = $2(".timeline-heading p em").first().text().split(" - ");

            if (!endDate) {
                [startDate, endDate] = $2(".timeline-heading p:nth-child(3) em").text().split(" - ");
            }

            const [startDay, startMonth, startYear] = startDate.split("/");
            const finalStartDate = `20${startYear}/${startMonth}/${startDay}`;

            const [endDay, endMonth, endYear] = endDate.split("/");
            const finalEndDate = `20${endYear}/${endMonth}/${endDay}`;

            const currentActivity = {
                name: activityName,
                subjectId: currentSubject.id,
                startDate: finalStartDate,
                endDate: finalEndDate,
            }

            await resolveActivity(connection, currentActivity)
        }

        console.log("-------------------------------------------------------------------")
    }

    return connection;
}


main().then(connection => {
    connection.end();
    console.log("Completed!");
})