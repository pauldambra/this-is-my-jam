import mocha from 'mocha'
import chai from 'chai'

const { describe, it } = mocha
const { expect } = chai

describe('twitter oembed gets toot html', function () {
  it('but it is encoded html passed in json', function () {
    const exampleHTML = '<blockquote class=\\"twitter-tweet\\" data-dnt=\\"true\\">'
    const actual = exampleHTML.replace(/\\"/g, '"')
    expect(actual).to.eql('<blockquote class="twitter-tweet" data-dnt="true">')
  })
})
