import mocha from 'mocha'
import chai from 'chai'

const { describe, it } = mocha
const { expect } = chai

describe('twitter uses created at which might not sort as well as ISO8601', function () {
  it('converting from one to the other should be possible', function () {
    const createdAt = 'Fri Mar 06 17:16:29 +0000 2020'
    const expected = '2020-03-06T17:16:29.000Z'

    const actual = new Date(createdAt).toISOString()

    expect(actual).to.eql(expected)
  })

  it('can sort those timestamps', function () {
    const array = [
      { name: 'oldest', date: '2007-01-17T08:00:00Z' },
      { name: 'newest', date: '2011-01-28T08:00:00Z' },
      { name: 'old', date: '2009-11-25T08:00:00Z' }
    ]
    array.sort((a, b) => (a.date > b.date) ? -1 : ((a.date < b.date) ? 1 : 0))

    expect(array[0].date).to.eql('2011-01-28T08:00:00Z')
  })
})
