const rp = require('request-promise')
const cheerio = require('cheerio')
const express = require('express')

const app = express()

app.set("view engine", "ejs");

const REQUEST_URL = 'https://book24.ua'

app.get('*', async function (req, res) {
  res.render("app", {
    title: "Web Scrapping Application",
    books: await start()
  });
})

app.listen(process.env.APP_PORT || 3000, process.env.APP_IP || '127.0.0.1', function () {
  console.log('happy web scrapping!')
})

async function start() {
  const result = await rp(REQUEST_URL)
  const $ = cheerio.load(result)

  const books = $('.catalog-item-card')

  const parsed = books.map(function () {
    const src = $(this).find('.item_img').attr('src')
    const imageSrc = `${REQUEST_URL}${src}`

    const title = $(this).find('.item-title').text().trim()
    const author = $(this).find('.article > a').text().trim()

    const rating = $(this).find('.rating td').not('.vote-result').map(function () {
      return !!$(this).find('div').hasClass('star-voted')
    }).get().reduce(function (acc, item) {
      return item ? ++acc : acc
    }, 0)

    const price = $(this).find('.catalog-item-price').text().trim()

    return {
      imageSrc,
      title,
      author,
      rating,
      price: price.replace(/\n|\t|[а-яА-я]/g, '').replace(/' '/g, '')
    }
  }).get();

  return parsed
}


