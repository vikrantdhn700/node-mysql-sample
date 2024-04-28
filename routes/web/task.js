const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('./task-lists');
});

router.get('/edit/:id', async (req, res) => {
    if(!req.params.id) return res.status(404).send({"status" : "failed", "message": "Invalid task","result" : ""});
    let data= {
        id: req.params.id
    };
    res.render('./task-edit', data);
});

router.get('/add', async (req, res) => {
    res.render('./task-add');
});

router.get('/import', async (req, res) => {
    res.render('./task-import');
});

module.exports = router;