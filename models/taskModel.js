const conn = require('../global/db');
const {deleteFile} = require('../global/global');

async function getTasklist(req,res) {
    try {
        const orderBy = req.query.orderby || 'created';
        const order = req.query.order || 'DESC';
        const limit = parseInt(req.query.limit) || 2;
        const page = parseInt(req.query.page) || 1;

        const skip = (page - 1) * limit;

        const [totalTask] = await conn.query(`SELECT count(*) as total FROM tasks`);
        const totalCount = totalTask[0].total

        const qry = conn.format(`SELECT id, title, startdatetime, enddatetime, file, created FROM tasks ORDER BY ${orderBy} ${order} LIMIT ?,?`,[skip, limit]);
        const [rows] = await conn.query(qry);

        let currentLength = 0;
        if(rows && rows.length > 0) {
            currentLength = rows.length;
        }
        const results = {
            "page": page,
            "limit" : limit,
            "currentLength" : currentLength,
            "totalLength" : totalCount,
            "totalPage": Math.ceil(totalCount/limit),
            "data" : rows,
        };
        return res.status(200).send({"status" : "success", "message": "Successfully", "result" : results});
    } catch (error) {
        return res.status(404).send({"status" : "failed", "message": error.message,"result" : ""});
    }
}

async function getTask(id) {
    const qry = conn.format(`SELECT * FROM tasks WHERE id= ?`,[id]);
    const [rows] = await conn.query(qry);
    return rows;
}

async function createTask(body) {
    const result = await conn.query('INSERT INTO `tasks` (`title`, `description`, `startdatetime`, `enddatetime`, `file`) VALUES (?, ?, ?, ?, ?)',body);
    return result;
}

async function updateTask(body, id) {
    const {title, description, startdatetime, enddatetime, file} = body;
    let qry = ""
    if(file) {
         qry = conn.format(`UPDATE tasks SET title= ?, description = ?, startdatetime= ?, enddatetime= ?, file= ?  WHERE id = ?`,[title, description, startdatetime, enddatetime, file, id]);
    } else {
         qry = conn.format(`UPDATE tasks SET title= ?, description = ?, startdatetime= ?, enddatetime= ? WHERE id = ?`,[title, description, startdatetime, enddatetime, id]);
    }  
    const result = await conn.query(qry);
    return result;
}

async function deleteTask(id) {
    const task = await getTask(id);
    if(task && task.length > 0) {
        if(task[0].file != "") {
            const isFileDel = await deleteFile("./public/"+task[0].file)
        }          
        const qry = conn.format(`DELETE FROM tasks WHERE id= ?`,[id]);
        const [rows] = await conn.query(qry);
        return rows;
    }    
}

async function deleteAttach(id) {
    const task = await getTask(id);
    if(task && task.length > 0) {
        if(task[0].file != "") {
            const isFileDel = await deleteFile("./public/"+task[0].file)
            if(isFileDel) {
                const qry = conn.format(`UPDATE tasks SET file='' WHERE id = ? `,[id]);
                const [rows] = await conn.query(qry);
            }
        }        
    } 
}


module.exports = {
    createTask, 
    getTasklist,
    getTask,
    updateTask,
    deleteTask,
    deleteAttach
}