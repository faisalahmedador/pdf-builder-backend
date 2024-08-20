const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const uuid = require('uuid-random');
const path = require('path');

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
            headless: true
        });

        const page = await browser.newPage();
        await page.setJavaScriptEnabled(false);

        const headerTemplate = handlebars.compile(htmlHeaderTemplate);
        const mainTemplate = handlebars.compile(htmlMainTemplate);
        const footerTemplate = handlebars.compile(htmlFooterTemplate);
        const htmlHeader = headerTemplate(jsonDataFile);
        const htmlFooter = footerTemplate(jsonDataFile);
        const htmlMain = mainTemplate(jsonDataFile);

        console.log(htmlHeader);

        // console.log(template())
        await page.setContent(htmlMain, { waitUntil: ['load'] });

        const options = {
            headerTemplate: htmlHeader,
            footerTemplate: htmlFooter,
            displayHeaderFooter: true,
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
