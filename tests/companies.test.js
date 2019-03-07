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

describe("/companies", async function () {
    test("Gets a list of 1 company", async function () {
        const response = await request(app).get(`/companies`);
        const { companies } = response.body;
        expect(response.statusCode).toEqual(200);
        expect(companies).toHaveLength(1);
        expect(companies[0].name).toEqual(company.name);
        expect(companies[0].code).toEqual(company.code);
    });
});

describe("/companies/:code", async function () {
    test("Gets a single company", async function () {
        const response = await request(app).get(`/companies/${company.code}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body.company.code).toEqual(company.code);
        expect(response.body.company.description).toEqual(company.description);
    });

    test("Responds with 404 if can't find cat", async function(){
        const response = await request(app).get('/companies/0');
        expect(response.statusCode).toEqual(404);
    });
});