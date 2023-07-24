import { main } from '../src/main'

test('test', () => {
  const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

  main()

  expect(consoleLog).toHaveBeenCalledWith('hello world')
})
