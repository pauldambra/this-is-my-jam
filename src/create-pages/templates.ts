
const head = (): string => {
  return `<head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>JS Bin</title>
    </head>`
}

const footer = (): string => {
  return `<footer>
        <p>Made by <a href="twitter.com/pauldambra">Paul D'Ambra</a> See <a href="https://github.com/pauldambra/this-is-my-jam">the code on Github</a> </p> <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
      </footer>`
}
const header = (): string => {
  return `<header>
          <h1>
            This is our Jams
          </h1>
      </header>`
}

const cards = (toots: string): string => `<article class="card"><p>${toots}</p></article>`

const content = (toots: string): string => {
  return `        <div id="content">
          <div class="centered">
            <h1>Most Recent Jam</h1>
             <section class="cards"> ${cards(toots)} </section>
          </div>
        </div>`
}

export const htmlPage = (toots: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    ${head()}
      <body>
        <div id="wrapper">
          ${header()}
          ${content(toots)}
          ${footer()}
        </div>
      </body>
    </html>
  `
}
