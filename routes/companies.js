const express = require("express");
const router = new express.Router();

const db = require("../db");

const ExpressError = require("../expressError")

/** Get companies: {companies: [{code, name}, ...]} */
router.get("", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, name FROM companies`);
  
        return res.json({companies: results.rows});
    }
  
    catch (err) {
      return next(err);
    }
});

/** Get one company: {company: {code, name, description, invoices: [id, ...]}}*/
router.get("/:code", async function (req, res, next) {
    try {
        let code = req.params.code

        const compRes = await db.query(`
            SELECT code, name, description 
            FROM companies
            WHERE code=$1`, [code]
        );

        if(!compRes.rowCount){
            throw new ExpressError("Company not found.", 404)
        }

        const invoiceRes = await db.query (`
            SELECT *
            FROM invoices
            WHERE comp_code=$1`, [code]
        )

        const company = compRes.rows[0];
        company.invoices = invoiceRes.rows

        return res.json({company});
    }
    catch (err) {
      return next(err);
    }
});

/** Adds a company: {company: {code, name, description}} */
router.post("", async function (req, res, next) {
    try {
        let code = req.body.code
        let name = req.body.name
        let description = req.body.description || null

        if(name.length === 0 || code.length === 0){
            throw new ExpressError("Invalid Input.", 400)
        }

        const result = await db.query(`
            INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, 
            [code, name, description]
        );

        return res.json({company: result.rows[0]});
    }
    catch (err) {
        if(!(err instanceof ExpressError)){
            const dbError = new ExpressError("Code taken.", 409)
            return next(dbError);
        }
        return next(err)
    }
});

/** Updates a company: {company: {code, name, description}} */
router.put("/:code", async function (req, res, next) {
    try {
        let code = req.params.code;
        
        const original = await db.query(`
            SELECT name, description 
            FROM companies 
            WHERE code=$1`, [code]
        );
        let name = req.body.name || original.rows[0].name;
        let description = req.body.description || original.rows[0].description;

        if(name.length === 0 || code.length === 0){
            throw new ExpressError("Invalid Input.", 400);
        }

        const result = await db.query(`
            UPDATE companies SET name=$1, description=$2
            WHERE code=$3
            RETURNING code, name, description`, 
            [name, description, code]
        );

        if(!result.rowCount){
            throw new ExpressError("Company not found.", 404)
        }


        return res.json({company: result.rows[0]});
    }
    catch (err) {
        if(!(err instanceof ExpressError)){
            const dbError = new ExpressError("Invalid Code.", 409)
            return next(dbError);
        }
        return next(err)
    }
});

/** Deletes company, returning {message: "deleted"} */
router.delete("/:code", async function (req, res, next) {
    try {
        const result = await db.query(
            `DELETE FROM companies WHERE code=$1`,
            [req.params.code]
        );
        if (!result.rowCount){
            throw new ExpressError("Invalid code.", 400);
        }
        return res.json({message: "deleted"});
    }
  
    catch (err) {
        return next(err);
    }
});


module.exports = router;