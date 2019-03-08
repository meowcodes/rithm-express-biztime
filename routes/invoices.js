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

        if(!result.rowCount){
            throw new ExpressError("Invoice not found.", 404)
        }

        let invoice = result.rows[0];
        let compCode = invoice.comp_code;
        delete invoice.comp_code;

        const company = await db.query(`
            SELECT * FROM companies 
            WHERE code=$1`, [compCode]
        );

        invoice.company = company.rows[0]

        return res.json({invoice});
    }
    catch (err) {
      return next(err);
    }
});

/** Adds an invoice {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.post("", async function (req, res, next) {
    try {
        let compCode = req.body.comp_code
        let amt = Number(req.body.amt)
        
        if(!compCode){
            throw new ExpressError("Must enter company code.", 400)
        }

        if(isNaN(amt) || !amt){
            throw new ExpressError("Invalid amount.", 400)
        }

        const result = await db.query(`
            INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
            [compCode, amt]
        );

        return res.status(201).json({invoice: result.rows[0]});
    }
    catch (err) {
        if(!(err instanceof ExpressError)){
            const dbError = new ExpressError("Invalid company code.", 400)
            return next(dbError);
        }
        return next(err)
    }
});

/** Updates an invoice: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.put("/:id", async function (req, res, next) {
    try {
        let id = req.params.id;
        let amt = Number(req.body.amt);

        if(!id){
            throw new ExpressError("Must enter invoice ID.", 400)
        }

        if(isNaN(amt) || !amt){
            throw new ExpressError("Invalid amount.", 400)
        }

        const result = await db.query(`
            UPDATE invoices SET amt=$1
            WHERE id=$2
            RETURNING *`, 
            [amt, id]
        );

        if(!result.rowCount){
            throw new ExpressError("Invoice not found.", 404)
        }

        return res.json({invoice: result.rows[0]});
    }
    catch (err) {
        if(!(err instanceof ExpressError)){
            const dbError = new ExpressError("Invalid invoice ID.", 409)
            return next(dbError);
        }
        return next(err)
    }
});


/** Deletes an invoice, returning {message: "deleted"} */
router.delete("/:id", async function (req, res, next) {
    try {
        const result = await db.query(
            `DELETE FROM invoices WHERE id=$1`,
            [req.params.id]
        );
        if (!result.rowCount){
            throw new ExpressError("Invalid invoice ID.", 400);
        }
        return res.json({message: "deleted"});
    }
  
    catch (err) {
        if(!(err instanceof ExpressError)){
            const dbError = new ExpressError("Invalid invoice ID.", 409)
            return next(dbError);
        }
        return next(err);
    }
});


module.exports = router;