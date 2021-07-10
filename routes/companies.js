// Routes for companies

const express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")

// GET /companies - Returns list of companies, like {companies: [{code, name}, ...]}

router.get("/", async function(req, res, next) {
    try {
        const companiesQuery = await db.query("SELECT code, name FROM companies");
        console.log(companiesQuery);
        return res.json({companies: companiesQuery.rows});
    } catch(err){
        return next(err)
    }
});

// GET /companies/[code] - Return obj of company: {company: {code, name, description}}

router.get("/:code", async function(req, res, next) {
    try {
        const companyQuery = await db.query(
        "SELECT code, name, description FROM companies WHERE code = $1", [req.params.code]);

        if (companyQuery.rows.length === 0) {
            let notFoundError = new Error(`There is no company with code '${req.params.code}`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.json({ company: companyQuery.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// POST /companies - This adds a company when given proper JSON and returns that
// companies given object representation.

router.post("/", async function(req, res, next) {
    try {
        const resultCompany = await db.query(
        `INSERT INTO companies (name, description) 
        VALUES ($1) 
        RETURNING code, name, description`,
        [req.body.name,req.body.description]);

        return res.status(201).json({company: resultCompany.rows[0]});  // 201 CREATED
    } catch (err) {
        return next(err);
    }
});

// PUT /companies/[code] - This route edits an existing company when given the
// proper JSON and returns the updated company object.

router.put("/:code", async function(req, res, next) {
    try {
        const result = await db.query(
        `UPDATE companies 
        SET name=$1
        WHERE code = $2
        RETURNING code, name`,
        [req.params.code, req.body.name, req.body.description]);

        if (result.rows.length === 0) {
            throw new ExpressError(`There is no company with code of '${req.params.code}`, 404);
        }

        return res.json({ company: result.rows[0]});
    } catch (err) {
        return next(err);
    }
});

// DELETE /companies/[code] - This route deletes a company and returns {status: "deleted"}

router.delete("/:code", async function(req, res, next) {
    try {
        const result = await db.query(
        "DELETE FROM companies WHERE code = $1 RETURNING code", [req.params.code]);

        if (result.rows.length === 0) {
            throw new ExpressError(`There is no company with code of '${req.params.code}`, 404);
        }
        return res.json({ message: "deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;