import tap from 'tap'
import { formatDate } from '../date.js'

tap.test('should fomrat the date correctly', (assert) => {
  const date = formatDate(new Date(2022, 1, 21))
  assert.equal(date, '02/21/2022')
  assert.end()
})

