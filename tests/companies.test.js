// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let company;
let invoice;

beforeEach(async function () {
    let comRes = await db.query(`
        INSERT INTO 
        companies (code, name, description) 
        VALUES ('apple', 'Apple', 'fruit producing company')  
        RETURNING code, name, description`
    );
    company = comRes.rows[0];
    let invRes = await db.query(`
        INSERT INTO invoices (comp_code, amt)
        VALUES ('apple', '0.75' )
        RETURNING *`
    );
    invoice = invRes.rows[0];
});

afterEach(async function () {
    // delete any data created by test
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM invoices");
});

afterAll(async function () {
    // close db connection
    await db.end();
});

describe("GET /companies", async function () {
    test("Gets a list of 1 company", async function () {
        const response = await request(app).get(`/companies`);
        const { companies } = response.body;
        expect(response.statusCode).toEqual(200);
        expect(companies).toHaveLength(1);
        expect(companies[0].name).toEqual(company.name);
        expect(companies[0].code).toEqual(company.code);
    });
});

describe("GET /companies/:code", async function () {
    test("Gets a single company", async function () {
        const response = await request(app).get(`/companies/${company.code}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body.company.code).toEqual(company.code);
        expect(response.body.company.description).toEqual(company.description);
    });

    test("Responds with 404 if can't find company", async function () {
        const response = await request(app).get('/companies/0');
        expect(response.statusCode).toEqual(404);
    });
});

/** POST /companies - create companys from data; return `{company: company}` */
describe("POST /companies", async function () {
    test("Creates a new company", async function () {
        const response = await request(app)
            .post(`/companies`)
            .send({
                code: "whiskey",
                name: "Whiskey Co.",
                description: "Begs for food."
            });
        expect(response.statusCode).toEqual(201);
        expect(response.body.company).toHaveProperty("code");
        expect(response.body.company).toHaveProperty("name");
        expect(response.body.company.name).toEqual("Whiskey Co.");
    });
    test("Responds with 400 if name or code is invalid", async function () {
        const response = await request(app)
            .post(`/companies`)
            .send({
                code: "",
                name: "Whiskey Co."
            });
        expect(response.statusCode).toEqual(400);
    });
    test("Responds with 409 if code already exists", async function () {
        const response = await request(app)
            .post(`/companies`)
            .send({
                code: "apple",
                name: "Apple"
            });
        expect(response.statusCode).toEqual(409);
    });
});

/** PUT /companies/[code] - update company; return `{company: company}` */

describe("PUT /companies/:code", async function () {
    test("Updates a single company", async function () {
        const response = await request(app)
            .put(`/companies/${company.code}`)
            .send({
                name: "Banana"
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.company).toEqual({
            code: company.code,
            description: company.description,
            name: "Banana"
        });
    });

    test("Responds with 409 if can't find company", async function () {
        const response = await request(app)
            .put(`/companies/applesss`);
        expect(response.statusCode).toEqual(409);
    });
});

/** DELETE /companies/[code] - delete company, 
 *  return `{message: "deleted"}` */

describe("DELETE /companies/:code", async function () {
    test("Deletes a single a company", async function () {
        const response = await request(app)
            .delete(`/companies/${company.code}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ message: "deleted" });
    });
    test("Responds with 400 if can't find company", async function() {
        const response = await request(app)
            .delete(`/companies/banana`);
        expect(response.statusCode).toEqual(400);
    })
});