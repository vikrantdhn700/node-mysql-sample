const taskappend = document.getElementById("taskappend");
const inpt_current_page = document.getElementById("inpt_current_page");
const prevpage = document.getElementById("prevpage");
const nextpage = document.getElementById("nextpage");
const returnMsg = document.getElementById("return-msg");

async function getTasks(data = {}) {
    try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let query = "";
        if(data) {
            query = new URLSearchParams(data);
        }
        
        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
        };

        const response = await fetch(`${site_url}/api/task?`+query, requestOptions);
        const results = await response.json();
        if(results.status === 'success') {
            let page = results.result.page;
            let limit = results.result.limit;
            let totalPage = results.result.totalPage;

            const totalRep = page * limit; 
            const loopRep = totalRep - limit;
            if(results.result.data.length > 0){
                let appendHTML = '';
                results.result.data.map((item, index) => {
                    let slno = parseInt(loopRep) + parseInt(index) + 1;

                    let startDate = '';
                    if(item.startdatetime) {
                        startDate = getDate(item.startdatetime);
                    }

                    let endDate = 'N/A';
                    if(item.enddatetime) {
                        endDate = getDate(item.enddatetime);
                    }

                    let fileLink = 'N/A';
                    if(item.file) {
                        fileLink = `<a href="${site_url+item.file}" class="file-imglnk" target="_blank"><img src="${site_url}/img/pdfimg.png"/></a>`
                    }

                    const createdDate = getDate(item.created);
                    appendHTML += `<tr>
                        <td>${slno}</td>
                        <td class="task-title">${item.title}</td>
                        <td>${startDate}</td>
                        <td>${endDate}</td>
                        <td>${fileLink}</td>
                        <td>${createdDate}</td>
                        <td><a href="${site_url}/web/tasks/edit/${item.id}">Edit</a> | <a href="" onclick="deleteTask(event);" data-id="${item.id}">Delete</a></td>
                        </tr>`
                })
                taskappend.innerHTML = appendHTML;
            }

            prevpage.parentElement.classList.remove("disabled");
            nextpage.parentElement.classList.remove("disabled");

            if(totalPage <= 1){
                prevpage.parentElement.classList.add("disabled");
                nextpage.parentElement.classList.add("disabled");
            } else if(totalPage > 1) {
                if(page <= 1) {
                    prevpage.parentElement.classList.add("disabled");
                } else if(page >= totalPage) {
                    nextpage.parentElement.classList.add("disabled");
                }
            }
            inpt_current_page.value = page;

            let newprevPage= parseInt(page) - 1;
            let newnextPage= parseInt(page) + 1;

            prevpage.setAttribute("data-page",newprevPage);
            nextpage.setAttribute("data-page",newnextPage);
        }
    } catch (error) {
        console.log(error.message);
    }
}

const pagerClick = document.querySelectorAll("ul.pagination li a");
if(pagerClick){
    pagerClick.forEach((item) => {
        item.addEventListener("click", async function(event) {
            event.preventDefault();
            const currentTarget = event.currentTarget;
            const page = currentTarget.getAttribute("data-page");
            await getTasks({"page" : page});
        })
    })
}

const task_title = document.getElementById("task_title");
const task_content = document.getElementById("task_content");
const task_startdate = document.getElementById("task_startdate");
const task_enddate = document.getElementById("task_enddate");
const file = document.getElementById("file");

async function getTask(id) {
    try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
        };

        const response = await fetch(`${site_url}/api/task/${id}`, requestOptions);
        const results = await response.json();
        if(results.status === 'success') {
            if(results.result.length > 0){
                task_title.value = results.result[0].title;
                task_content.value = results.result[0].description;

                if(results.result[0].startdatetime) {
                    let newDate = getDate(results.result[0].startdatetime);  
                    task_startdate.value = newDate;
                }

                if(results.result[0].enddatetime) {
                    if(results.result[0].enddatetime != "0000-00-00") {
                        let newEndDate = getDate(results.result[0].enddatetime);                    
                        task_enddate.value = newEndDate;
                    }                    
                }

                if(results.result[0].file !="") {
                    const fileLink = `<a href="${site_url+results.result[0].file}" target="_blank">Click to view file</a>`
                    document.getElementById("file-lnk-bx").innerHTML = fileLink;
                }

            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const form_update = document.getElementById("form-update");
if(form_update) {
    form_update.addEventListener("submit", async (event) => {
        event.preventDefault();
        returnMsg.innerHTML = '';

        let formData = new FormData();
        formData.append("title",task_title.value);
        formData.append("description",task_content.value);
        formData.append("startdatetime",task_startdate.value);
        formData.append("enddatetime",task_enddate.value);
        formData.append("file",file.files[0]);

        try {
            let requestOptions = {
                method: 'PATCH',
                body: formData
            };
            const response = await fetch(`${site_url}/api/task/${id}`, requestOptions);
            const results = await response.json();
            if(results.status === "success"){
                if(results.result[0].affectedRows === 1) {
                    returnMsg.innerHTML = `<div class="alert alert-success">${results.message}</div>`;
                    await getTask(id)
                } else {
                    returnMsg.innerHTML = `<div class="alert alert-danger">Error in update</div>`;
                }
            } else {
                returnMsg.innerHTML = `<div class="alert alert-danger">${results.message}</div>`;
            }
        } catch (error) {
            console.log(error);
        }
    })
}

async function deleteTask(event) {
    event.preventDefault();
    const currentTarget = event.currentTarget;
    let confirmMsg = "";
    if (confirm("Are you sure to delete!")) {
        confirmMsg = "yes";
    } else {
        confirmMsg = "no";
    }
    if(confirmMsg == "yes") {
        const id = currentTarget.getAttribute("data-id");
        let requestOptions = {
            method: 'DELETE',
        };

        const response = await fetch(`${site_url}/api/task/${id}`, requestOptions);
        const results = await response.json();
        if(results.status === "success") {
            await getTasks({"page" : inpt_current_page.value });
        }
    }
}

const form_add = document.getElementById("form-add");
if(form_add) {
    form_add.addEventListener("submit", async (event) => {
        event.preventDefault();
        returnMsg.innerHTML = '';

        let formData = new FormData();
        formData.append("title",task_title.value);
        formData.append("description",task_content.value);
        formData.append("startdatetime",task_startdate.value);
        formData.append("enddatetime",task_enddate.value);
        formData.append("file",file.files[0]);

        try {
            let requestOptions = {
                method: 'POST',
                body: formData
            };
            const response = await fetch(`${site_url}/api/task/`, requestOptions);
            const results = await response.json();
            if(results.status === "success"){
                if(results.result[0].affectedRows === 1) {
                    returnMsg.innerHTML = `<div class="alert alert-success">${results.message}</div>`;
                    form_add.reset();
                } else {
                    returnMsg.innerHTML = `<div class="alert alert-danger">Error in update</div>`;
                }
            } else {
                returnMsg.innerHTML = `<div class="alert alert-danger">${results.message}</div>`;
            }
        } catch (error) {
            console.log(error);
        }
    })
}

const form_import = document.getElementById("form-import");
if(form_import) {
    form_import.addEventListener("submit", async (event) => {
        event.preventDefault();
        returnMsg.innerHTML = '';

        let formData = new FormData();
        formData.append("file",file.files[0]);
        try {
            let requestOptions = {
                method: 'POST',
                body: formData
            };
            const response = await fetch(`${site_url}/api/task/import/`, requestOptions);
            const results = await response.json();
            if(results.status === "success"){
                returnMsg.innerHTML = `<div class="alert alert-success">${results.message}</div>`;
                form_add.reset();
            } else {
                returnMsg.innerHTML = `<div class="alert alert-danger">${results.message}</div>`;
            }
        } catch (error) {
            console.log(error);
        }
    })
}

function getDate(d) {
    let newDate = new Date(d);
    newDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    return newDate;
}

(function() {
    
    if(taskappend) {
        getTasks()
    }
    if(form_update) {
        getTask(id)
    }
})();