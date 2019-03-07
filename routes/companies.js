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

/** Get one company: {company: {code, name, description}} */
router.get("/:code", async function (req, res, next) {
    try {
        code = req.params.code

        const result = await db.query(`
            SELECT code, name, description 
            FROM companies
            WHERE code=$1`, [code]
        );

        if(!result.rowCount){
            throw new ExpressError("Company not found.", 404)
        }

        return res.json({company: result.rows[0]});
    }
    catch (err) {
      return next(err);
    }
});

/** Adds a company: {company: {code, name, description}} */
router.post("", async function (req, res, next) {
    try {
        code = req.body.code
        name = req.body.name
        description = req.body.description || null

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






module.exports = router;