const express = require('express');
const fs = require('fs'); 
// const https = require('https');
const Downloader = require('nodejs-file-downloader');
const { Validator } = require('node-input-validator');
const xlsx = require('xlsx');
const {createTask, getTasklist, getTask, updateTask, deleteTask, deleteAttach} = require('../models/taskModel');
const {uploadFile, multerErrorHandling} = require('../middlewares/fileuploadMiddleware');
const {getDate} = require('../global/global')
const router = express.Router();

router.post('/', uploadFile.single('file'), multerErrorHandling, async (req, res) => {
    try {
        const checkValidation = new Validator(req.body, {
            title: 'required',
            description: 'required',
            startdatetime: 'required|date',
            enddatetime: 'date',
        });

        const matched = await checkValidation.check();
        if (!matched) {
            let errorMsg = '';
            for(let key in checkValidation.errors) {
                errorMsg += checkValidation.errors[key].message+'<br>';
            }
            return res.status(422).send({"status" : "failed", "message": errorMsg,"result" : ""});
        }

        const {title, description, startdatetime, enddatetime} = req.body;

        let file = "";
        if(req.file){
            file = `/uploads/${req.file.filename}`
        }
        const insertarr = [
            title, description, startdatetime, enddatetime, file
        ]
        const result = await createTask(insertarr);
        return res.status(200).send({"status" : "success", "message": "Successfully submit", "result" : result });
    } catch (error) {
        return res.status(404).send({"status" : "failed", "message": error.message,"result" : ""});
    }    
});

router.post('/import', uploadFile.single('file'), multerErrorHandling, async (req, res) => {
    try {
        //console.log(req.file);
        if(!req.file) return res.status(422).send({"status" : "failed", "message": "File is required","result" : ""});

        const workbook = xlsx.readFile(req.file.path, {type:'binary', cellDates:true, dateNF:'dd.mm.yyyy'});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        let flag = 0;
        let index = 0;
        for (let row of data) {
            if(index != 0) {
                const [title, description, startdate, enddate, file] = row;
                if(title && description && startdate){
                    let newstartDate = await getDate(startdate);
                    let newendDate = '';
                    if(enddate) {
                        newendDate = await getDate(enddate);
                    }
                    
                    let uploadedURL = '';
                    if(file) {
                        const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9)+'-indx'+index +'-imported.pdf';
                        const uploadfilePath = `./public/uploads/`;

                        const downloader = new Downloader({
                            url: file,
                            directory: uploadfilePath,
                            fileName: fileName,
                        })
                        const {filePath,downloadStatus} = await downloader.download();
                        if(downloadStatus === 'COMPLETE') {
                            uploadedURL = `/uploads/${fileName}`;
                        }                        
                    }

                    const insertarr = [
                        title, description, newstartDate, newendDate, uploadedURL
                    ]
                    const result = await createTask(insertarr);
                    flag = 1;
                }
            }            
            index++;
        }
        if(flag) {
            return res.status(200).send({"status" : "success", "message": "Successfully submit", "result" : "result" });
        } else {
            return res.status(200).send({"status" : "failed", "message": "File not imported", "result" : "" });
        }        
    } catch (error) {
        return res.status(404).send({"status" : "failed", "message": error.message,"result" : ""});
    }    
});

router.get('/', async (req, res) => {
    const result = await getTasklist(req, res);
    res.return;
});

router.get('/:id', async (req, res) => {
    try {
        if(!req.params.id) return res.status(404).send({"status" : "failed", "message": "Invalid task","result" : ""});
        const id = req.params.id;
        const result = await getTask(id);
        return res.status(200).send({"status" : "success", "message": "Successfully", "result" : result});
    } catch (error) {
        return res.status(404).send({"status" : "failed", "message": error.message,"result" : "3"});
    }
    
})

router.patch('/:id', uploadFile.single('file'), multerErrorHandling, async(req, res) => {
    try {
        if(!req.params.id) return res.status(404).send({"status" : "failed", "message": "Invalid task","result" : ""});
        const id = req.params.id;

        const checkValidation = new Validator(req.body, {
            title: 'required',
            description: 'required',
            startdatetime: 'required|date',
            enddatetime: 'date',
        });

        const matched = await checkValidation.check();
        if (!matched) {
            let errorMsg = '';
            for(let key in checkValidation.errors) {
                errorMsg += checkValidation.errors[key].message+'<br>';
            }
            return res.status(422).send({"status" : "failed", "message": errorMsg,"result" : ""});
        }

        let file = "";
        if(req.file){
            file = `/uploads/${req.file.filename}`
        }

        const {title, description, startdatetime, enddatetime} = req.body;

        const updatearr = {
            title, 
            description, 
            startdatetime, 
            enddatetime,
            file
        }
        const result = await updateTask(updatearr, id);
        return res.status(200).send({"status" : "success", "message": "Successfully updated", "result" : result });
    } catch (error) {
        return res.status(404).send({"status" : "failed", "message": error.message,"result" : "3"});
    }
})

router.delete('/:id', async (req, res) => {
    try {
        if(!req.params.id) return res.status(404).send({"status" : "failed", "message": "Invalid task","result" : ""});
        const id = req.params.id;
        const result = await deleteTask(id);
        return res.status(200).send({"status" : "success", "message": "Successfully Deleted", "result" : result});
    } catch (error) {
        return res.status(404).send({"status" : "failed", "message": error.message,"result" : ""});
    }    
})

router.delete('/file/:id', async (req, res) => {
    try {
        if(!req.params.id) return res.status(404).send({"status" : "failed", "message": "Invalid task","result" : ""});
        const id = req.params.id;
        const result = await deleteAttach(id);
        return res.status(200).send({"status" : "success", "message": "Successfully Deleted", "result" : result});
    } catch (error) {
        return res.status(404).send({"status" : "failed", "message": error.message,"result" : ""});
    } 
})

module.exports = router;

