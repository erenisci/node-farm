/* 
// FILES
const fs = require('fs');

// Blocking synchronous way
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log('File readed!');

const textOut = `This is what we know about avocado: ${textIn}\nCreated on ${new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  hour: 'numeric',
  minute: 'numeric',
}).format(new Date())}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('File written!');


// Non-Blocking synchronous way
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
  if (err) return console.log('Error!');
  fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
    console.log(data2);
    fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
      console.log(data3);
      fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, err => {
        console.log('Your file has been written!');
      });
    });
  });
});
console.log('Will read file!');
*/

// SERVER
const fs = require('fs');
const http = require('http');
const url = require('url');
const dotenv = require('dotenv');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

dotenv.config({ path: './config.env' });

const templateCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const templateProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const templateOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);

const slugs = dataObject.map(data => slugify(data.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview Page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const cardsHtml = dataObject.map(el => replaceTemplate(templateCard, el)).join('');
    const output = templateOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);
    res.end(output);
  }

  // Product Page
  else if (pathname === '/product') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const product = dataObject[query.id];
    const output = replaceTemplate(templateProduct, product);

    res.end(output);
  }

  // API
  else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  }

  // Not Found
  else {
    res.writeHead(404, {
      'Content-Type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening to requests on port ${PORT}`);
});
