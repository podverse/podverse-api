const typeorm = require('typeorm')

jest.mock('typeorm')
jest.mock('~/entities', () => ({
  AccountClaimToken: jest.fn()
}))

const { getAccountClaimToken } = require('../accountClaimToken')

const id = 'testId'

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

        describe('but it has already been claimed', () => {
          test('it throws the expected error message', async () => {
            await expect(async () => {
              const findOneMock = jest.fn()
              typeorm.getRepository = jest.fn().mockReturnValue({
                findOne: findOneMock.mockReturnValue({
                  testKey: 'testVal',
                  claimed: true
                })
              })

              await getAccountClaimToken(id)
            }).rejects.toThrow('This token has already been claimed.')
          })
        })
      })

      describe('and an accountClaimToken is not found', () => {
        test('it throws the expected error message', async () => {
          await expect(async () => {
            const findOneMock = jest.fn()
            typeorm.getRepository = jest.fn().mockReturnValue({
              findOne: findOneMock.mockReturnValue(false)
            })

            await getAccountClaimToken(id)
          }).rejects.toThrow('AccountClaimToken not found')
        })
      })
    })
  })
})
