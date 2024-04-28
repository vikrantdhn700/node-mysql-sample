const express = require('express');
const fs = require('fs').promises;

const deleteFile = async function(filePath){
    try {
        await fs.unlink(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

async function getDate(d) {
    let newDate = new Date(d);
    newDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    return newDate;
}


module.exports = {
    deleteFile,
    getDate
};
