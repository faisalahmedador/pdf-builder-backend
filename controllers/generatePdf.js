const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const uuid = require('uuid-random');
const path = require('path');


function wrapHtmlTemplate(htmlTemplate) {
    return `
     <html lang="en">
    <head>
      <style>
        @font-face {
          font-family: 'Noto Sans Bengali';
          src: url(https://fonts.gstatic.com/s/notosansbengali/v20/Cn-fJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mc4I3mYvNY.woff2) format('woff2');
          font-weight: normal;
          font-style: normal;
        }
        body {
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 15px;
        }
      </style>
      <title>PDF</title>
    </head>
    <body>
      ${htmlTemplate}
    </body>
  </html>
`;
}

const generatePdf = async (req, res) => {
    try {
        const templates = req.body.templates;
        const htmlMainTemplate = templates.main;
        const htmlHeaderTemplate = templates.header;
        const htmlFooterTemplate = templates.footer;
        const jsonDataFile = req.body.jsonData;
        const margin = req.body.margin;
        const reportFormatType = req.body?.reportFormatType || 'pdf';

        if (!htmlMainTemplate) {
            return res.status(400).send({
                status: false,
                message: 'Invalid or missing HTML template file'
            });
        }

        // if (!jsonDataFile) {
        //     return res.status(400).send({
        //         status: false,
        //         message: 'Invalid or missing JSON data file'
        //     });
        // }
        const fileName = `prescription.${reportFormatType === 'html' ? 'html' : 'pdf'}`;

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
            timeout: 60000
        });

        const page = await browser.newPage();
        await page.setJavaScriptEnabled(false);


        // handlebars.registerHelper('check', function(value, comparator) {
        //     console.log(value, comparator);
        //     return (value === comparator) ? 'No content' : value;
        // });

        const mainTemplate = handlebars.compile(htmlMainTemplate);

        const htmlMain = mainTemplate(jsonDataFile);


        const headerTemplate = handlebars.compile(htmlHeaderTemplate);
        const htmlHeader = headerTemplate(jsonDataFile);

        const footerTemplate = handlebars.compile(htmlFooterTemplate);
        const htmlFooter = footerTemplate(jsonDataFile);

        await page.setContent(wrapHtmlTemplate(htmlMain), { waitUntil: [ "load" , "domcontentloaded" , "networkidle0" , "networkidle2"] });

        const options = {
            headerTemplate: htmlHeader,
            footerTemplate: htmlFooter,
            displayHeaderFooter: true,
            preferCSSPageSize: true,
            printBackground: true,
            format: 'A4',
            margin: margin,
        };


        const pdf = await page.pdf(options)

        await browser.close();

                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Length': pdf.length,
                    "Content-Disposition": `attachment; filename=${fileName}`,
                });

        return res.status(200).send(pdf);




    //     if (reportFormatType === 'pdf') {
    //         const options = {
    //             width: '1230px',
    //             headerTemplate: "<span></span>",
    //             displayHeaderFooter: true,
    //             margin: {
    //                 top: '20px',
    //                 bottom: '70px',
    //                 right: '20px',
    //                 left: '20px'
    //             },
    //             printBackground: true,
    //             format: 'A4',
    //             footerTemplate: `
    //                 <div style="margin-left:15px; margin-right:15px; border-top: 1px solid rgb(166, 166, 166); display:flex; justify-content:space-between; font-size:10px; padding-right:20px; width:100%">
    //                     <div style="padding-left:5px; padding-top:5px;">I am a Beautiful PDF</div>
    //                     <div style="padding-top:5px;"><span class="pageNumber"></span> of <span class="totalPages"></span></div>
    //                 </div>`
    //         };
    //         buffer = await page.pdf();
    //         console.log(buffer)
    //         res.set({
    //             'Content-Type': 'application/pdf',
    //             'Content-Length': buffer.length,
    //             "Content-Disposition": `attachment; filename=${fileName}`,
    //         });
    //     } else if (reportFormatType === 'html') {
    //         buffer = Buffer.from(html);
    //         res.set({
    //             'Content-Type': 'text/html',
    //             'Content-Length': buffer.length,
    //             "Content-Disposition": `attachment; filename=${fileName}`,
    //         });
    //     } else {
    //         return res.status(400).send({
    //             status: false,
    //             message: 'Invalid file format. Enter html/pdf'
    //         });
    //     }
    //
    //     await browser.close();
    //     res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(422).send({ error: 'Failed to generate document', details: error.message });
    }
};

exports.generatePdf = generatePdf;
