const puppeteer = require('puppeteer');
require('dotenv').config();

const log = (d) => console.log(d);

(async () => {
  log('INICIANDO BOOT!')
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  log('CARREGANDO PÁGINA DE LOGIN DO SIGAA...')
  await page.goto('https://sigaa.ufrn.br/sigaa/verTelaLogin.do')
  log('PÁGINA DE LOGIN CARREGADA...')

  await page.evaluate(async (user) => {
    document.querySelector('[name="user.login"]').value = user.username
    document.querySelector('[type="password"]').value = user.password
    document.querySelector('[name="loginForm"]').submit()
  }, { username: process.env.MY_USERNAME, password: process.env.MY_PASSWORD })

  await page.waitForNavigation()
  log('PÁGINA PRINCIPAL CARREGADA...')

  await page.evaluate(async () => {
    try {
      document.querySelector('.ThemeOfficeMenuItem').onmouseup()
    } catch (error) {}
  })

  log('CARREGANDO NOTAS...')
  await page.waitForNavigation()

  const notas = await page.evaluate(() => {
    const table = document.querySelector('.tabelaRelatorio')
    const list = Array.from(table.rows).map(a => a.outerText.split('\t'))
    const data = []

    for (let item of list) {
      let nota = {}
      nota.codigo = item[0]
      nota.disciplina = item[1]
      nota.un1 = item[2]
      nota.un2 = item[3]
      nota.un3 = item[4]
      nota.rec = item[5]
      nota.resultado = item[6]
      nota.faltas = item[7]
      data.push(nota)
    }

    return data
  })

  console.table(notas)

  await browser.close()
})()

