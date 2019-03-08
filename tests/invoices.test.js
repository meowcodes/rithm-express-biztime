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

describe("GET /invoices", async function () {
    test("Gets a list of 1 invoice", async function () {
        const response = await request(app).get(`/invoices`);
        const { invoices } = response.body;
        expect(response.statusCode).toEqual(200);
        expect(invoices).toHaveLength(1);
        expect(invoices[0].id).toEqual(invoice.id);
        expect(invoices[0].code).toEqual(invoice.code);
    });
});

describe("GET /invoices/:id", async function () {
    test("Gets a single invoice", async function () {
        const response = await request(app).get(`/invoices/${invoice.id}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body.invoice.id).toEqual(invoice.id);
        expect(response.body.invoice.amt).toEqual(invoice.amt);
    });

    test("Responds with 404 if can't find invoice", async function () {
        const response = await request(app).get('/invoices/0');
        expect(response.statusCode).toEqual(404);
    });
});

/** POST /invoices - create invoices from data; return `{invoice: invoice}` */
describe("POST /invoices", async function () {
    test("Creates a new invoice", async function () {
        const response = await request(app)
            .post(`/invoices`)
            .send({
                comp_code: "apple",
                amt: 300
            });
        expect(response.statusCode).toEqual(201);
        expect(response.body.invoice).toHaveProperty("comp_code");
        expect(response.body.invoice).toHaveProperty("id");
        expect(response.body.invoice.amt).toEqual(300);
        expect(response.body.invoice.paid).toEqual(false);
    });
    test("Responds with 400 if id or comp_code is invalid", async function () {
        const response = await request(app)
            .post(`/invoices`)
            .send({
                comp_code: "",
                amt: 300
            });
        expect(response.statusCode).toEqual(400);
    });
});

/** PUT /invoices/[id] - update invoice; return `{invoice: invoice}` */

describe("PUT /invoices/:id", async function () {
    test("Updates a single invoice", async function () {
        const response = await request(app)
            .put(`/invoices/${invoice.id}`)
            .send({
                amt: 4000
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.invoice).toHaveProperty("comp_code");
        expect(response.body.invoice.id).toEqual(invoice.id);
        expect(response.body.invoice.amt).toEqual(4000);
        expect(response.body.invoice.paid).toEqual(false);
    });

    test("Responds with 409 if amount is invalid", async function () {
        const response = await request(app)
            .put(`/invoices/${invoice.id}`)
            .send({
                amt: "NONE"
            });
        expect(response.statusCode).toEqual(400);
    });
    test("Responds with 404 if invoice cannot be found", async function () {
        const response = await request(app)
            .put(`/invoices/10000`)
            .send({
                amt: 3000
            });
        expect(response.statusCode).toEqual(404);
    });
    test("Responds with 404 if id is invalid", async function () {
        const response = await request(app)
            .put(`/invoices/banana`)
            .send({
                amt: 3000
            });
        expect(response.statusCode).toEqual(409);
    });
});

/** DELETE /invoices/[id] - delete invoice, 
 *  return `{message: "deleted"}` */

describe("DELETE /invoices/:id", async function () {
    test("Deletes a single a invoice", async function () {
        const response = await request(app)
            .delete(`/invoices/${invoice.id}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ message: "deleted" });
    });
    test("Responds with 400 if can't find invoice", async function() {
        const response = await request(app)
            .delete(`/invoices/1000`);
        expect(response.statusCode).toEqual(400);
    });
    test("Responds with 400 if id is invalid", async function() {
        const response = await request(app)
            .delete(`/invoices/banana`);
        expect(response.statusCode).toEqual(409);
    });
});