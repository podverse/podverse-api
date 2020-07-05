const typeorm = require('typeorm')

jest.mock('typeorm')
jest.mock('~/entities', () => ({
  AccountClaimToken: jest.fn()
}))
// jest.mock('~/lib/errors')
// jest.mock('../user')
// jest.mock('http-errors')

const { getAccountClaimToken } = require('../accountClaimToken')

const id ='testId'

describe('controller accountClaimToken', () => {
  describe('getAccountClaimToken', () => {
    describe('when an id is provided', () => {
      describe('and an accountClaimToken is found', () => {
        test('it returns the accountClaimToken', async () => {
          const findOneMock = jest.fn()
          typeorm.getRepository = jest.fn().mockReturnValue({
            findOne: findOneMock.mockReturnValue({ testKey: 'testVal' })
          })
          const accountClaimToken = await getAccountClaimToken(id)

          expect(findOneMock).toHaveBeenCalledWith(
            { id },
            {
              select: ['id', 'claimed', 'yearsToAdd']
            }
          )
          expect(accountClaimToken).toEqual({ testKey: 'testVal' })
        })
      })
      // describe('and an accountClaimToken is not found', () => {

      // })
      // describe('and an accountClaimToken that has already been claimed', () => {

      // })
    })
  })
})
