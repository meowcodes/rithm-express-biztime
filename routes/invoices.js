const express = require("express");
const router = new express.Router();

const db = require("../db");

const ExpressError = require("../expressError")

/** Get invoices: {invoices: [{id, comp_code}, ...]}} */
router.get("", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT id, comp_code FROM invoices`);
  
        return res.json({invoices: results.rows});
    }
  
    catch (err) {
      return next(err);
    }
});

/** Get one invoice: {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}} */
router.get("/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        const result = await db.query(`
            SELECT *
            FROM invoices
            WHERE id=$1`, [id]
        );

        let invoice = result.rows[0];
        let compCode = invoice.comp_code;
        delete invoice.comp_code;

        const company = await db.query(`
            SELECT * FROM companies 
            WHERE code=$1`, [compCode]
        );

        if(!result.rowCount){
            throw new ExpressError("Company not found.", 404)
        }

        return res.json({invoice: {invoice, company: company.rows[0]}});
    }
    catch (err) {
      return next(err);
    }
});

module.exports = router;