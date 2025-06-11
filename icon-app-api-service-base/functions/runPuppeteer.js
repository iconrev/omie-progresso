const chromium = require("@sparticuz/chromium-min")
const puppeteer = require("puppeteer-core")
const fs = require("fs").promises;

const aws = require("aws-sdk");


exports.handler = async (event) => {

    console.log("Iniciando a função!")

    console.log("event", JSON.stringify(event))

    let htmlText = ''

    try {

        console.info("Launch Browser")
        const browser = await puppeteer.launch(
            {
                headless: true,
                // args: [
                // '--no-sandbox',
                // '--disable-setuid-sandbox',
                // '--no-zygote',
                // '--disable-gpu',
                // '--no-first-run',
                // '--deterministic-fetch',
                // '--disable-dev-shm-usage',
                // '--disable-site-isolation-trials',
                // '--disable-features=IsolateOrigins',
                // ],
                args: chromium.args,
                executablePath: await chromium.executablePath(
                    "https://chrome-puppeter.s3.sa-east-1.amazonaws.com/lambda-chromium-v114.0.0-pack.tar"
                ),
            },
        );
        console.info("New Page")
        const page = await browser.newPage();

        const reqId = "40881276-e588-4345-87a5-9ab4f84d6efe"
        const keyVerify = "Master-Of-Universe-021e7cf9-b126-49c8-96cd-a0f7c6c79959"

        // const urlPath = `http://localhost:4001/#/reports?req_id=${reqId}&key_verify=${keyVerify}`
        const urlPath = `https://simbiose-preview.omie.com.br/#/reports?req_id=${reqId}&key_verify=${keyVerify}`
        // const urlPath = 'http://127.0.0.1:5500/icon-app-api-service-base/localFiles/eita.html'
        // const urlPath = 'http://localhost:4001/#/gerarGraficos'

        console.info("Goto Page")
        await page.goto(urlPath);
        await page.setViewport({ width: 1080, height: 1024 });
        console.info("Input Campo")
        // await page.type('input[id="eita"]', '');
        // await page.type('input[id="eita"]', percentagem);
        // await page.click('button[type="submit"]');
        // await page.click('button[type="reset"]');

        pdf_path = '/tmp/html.pdf'

        await page.waitForTimeout(7000)
        await page.pdf({
            path: pdf_path, format: 'A4', preferCSSPageSize: true,
            printBackground: true,
        })

        const s3 = new aws.S3({ region: "sa-east-1" });
        // const { BUCKET_DIAG_REPORTS } = process.env;

        let BUCKET_DIAG_REPORTS = 'relatorios-diagnostico-qa'

        const readPDF = await fs.readFile(pdf_path, "base64")

        const buffer = Buffer.from(readPDF, "base64");
        const { Key } = await s3
            .upload({
                Bucket: BUCKET_DIAG_REPORTS,
                Key: pdf_path,
                Body: buffer,
                ContentEncoding: "base64",
                ContentType: "application/pdf",
            })
            .promise();

        console.info("Upload feito com sucesso");
        const url = await s3.getSignedUrlPromise("getObject", {
            Bucket: BUCKET_DIAG_REPORTS,
            Key,
            Expires: 60,
        });
        htmlText = {
            message: "Documento disponível",
            url,
        };
        // const gaugeElement = await page.$("#vish")
        // htmlText = (await gaugeElement.getProperty('outerHTML')).toString().replace("JSHandle:", "")

        // console.log('HTML Gauge Text ->', htmlText);

        let browserPid = browser.process()?.pid
        if (browserPid) {
            process.kill(browserPid)
        }

        await browser.close();

    } catch (e) {
        console.log(e)
        console.error(error);
    }

    console.log(htmlText)

    return {
        statusCode: 200,
        body: JSON.stringify({ html: htmlText }),
    };

}