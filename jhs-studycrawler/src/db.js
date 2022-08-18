async function createTables(connection) {
    await createCourseTable(connection);
    await createSemesterTable(connection);
    await createSubjectTable(connection);
    await createActivities(connection);
}

async function createCourseTable(connection) {
    const sql = "CREATE TABLE IF NOT EXISTS courses (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, degree VARCHAR(30))";
    await connection.execute(sql);
    console.log("Courses table created!")
}

async function createSemesterTable(connection) {
    const sql = "CREATE TABLE IF NOT EXISTS semesters (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL)";
    await connection.execute(sql);
    console.log("Semesters table created!");
}

async function createSubjectTable(connection) {
    const sql = "CREATE TABLE IF NOT EXISTS subjects (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, courseId INT NOT NULL, semesterId INT NOT NULL, totalActivities SMALLINT NOT NULL)";
    await connection.execute(sql);
    console.log("Subjects table created!");
}

async function createActivities(connection) {
    const sql = `
    CREATE TABLE IF NOT EXISTS activities (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(255) NOT NULL, 
        subjectId INT NOT NULL, 
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        done BOOLEAN DEFAULT FALSE,
        doneDate TIMESTAMP
        )
    `;

    await connection.execute(sql);
    console.log("Activities table created!");
}

module.exports = { 
    createTables
}