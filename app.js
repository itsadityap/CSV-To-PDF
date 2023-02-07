const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fileExtLimiter = require("./middleware/fileExtLimiter");
const filesPayloadExists = require('./middleware/filesPayloadExists');
const fs = require('fs');
const csvtojson = require('csvtojson');
//const glob = require("glob")

const PORT = process.env.PORT || 3000;

const app = express();

//GET ROUTES
app.get("/", (req,res) =>
{
    res.sendFile(path.join(__dirname, "index.html"));
})

//FUNCTIONS
const ReadCSV = async () => {

    // glob(__dirname + '/files/*.csv', {}, (err, files)=>{
    //     console.log(files)
    // })

    const csvfilepath = "./files/data.csv"
    csvtojson()
    .fromFile(csvfilepath)
    .then((json) => {
        fs.writeFileSync('./files/op.json', JSON.stringify(json));
    })
    .catch((err) => {console.log(err)})
}

const DeleteFileCSV = async () => 
{
    try 
    {
        fs.unlinkSync("./files/data.csv")
        console.log("CSV File Deleted");
    }
    catch(err)
    {
        console.log("Cannot Delete File Doesn't Exist or any other error");
    }
}

//POST ROUTES
app.post('/upload',
        fileUpload({ createParentPath: true }),
        fileExtLimiter(['.csv']),
        filesPayloadExists,
        (req, res) => {
            const files = req.files
            console.log(files)

            Object.keys(files).forEach(key => {
                const filepath = path.join(__dirname, 'files', files[key].name)
                files[key].mv(filepath, (err) => {
                    if (err) return res.status(500).json({ status: "error", message: err })
                })
            })

            ReadCSV()

            return res.json({ status: 'success', message: Object.keys(files).toString() })
    }
)


app.post("/download", (req,res) => {

    const filePath = 'Data.xlsx' 

    res.download(
        filePath, 
        "Data-PDF.pdf",

        (err) => {
            if (err) {
                res.send({
                    error : err,
                    msg   : "Problem downloading the file"
                })
            }
    });
    
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));