const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.resolve(__dirname,'../../views/pdf.html'), "utf8");
const options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "45mm",
        contents: '<div style="text-align: center;">Author: sourabh lodhi</div>'
    },
    footer: {
        height: "28mm",
        contents: {
            first: 'Cover page',
            2: 'Second page', 
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', 
            last: 'Last Page'
        }
    }
};

 exports.sendPdf = (data)=>{
     const array = new Array(data) 
    const document = {
        html: html,
        data: {
          users:data,
        },
        path: "./output.pdf",
        type: "",
      };
    
      pdf
      .create(document, options)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
}