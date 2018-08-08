const resourceUsage = require('../resources-usage')

describe('resources usage: ', () => {
  describe('getBusyMemoryPercentage(): ', () => {
    test('should be valid. Must return number between 0 and 100.', () => {
      const result = resourceUsage.__tests__.getBusyMemoryPercentage()

      expect(typeof result).toBe('number')
      expect(result).toBeLessThanOrEqual(100)
      expect(result).toBeGreaterThanOrEqual(0)
    })
  })

  describe('statisticsGetter(): ', () => {
    test('should be valid. Must return object with number props.', () => {
      expect.assertions(2)
      return resourceUsage.__tests__.statisticsGetter(200)
          .then((stat) => {
            expect(typeof stat.cpuLoad).toBe('number')
            expect(typeof stat.busyMemory).toBe('number')
          })
    })

    test('should be valid. Must return object.', () => {
      expect.assertions(1)
      return resourceUsage.__tests__.statisticsGetter(200)
          .then((stat) => {
            expect(typeof stat).toBe('object')
          })
    })
  })

  describe('getCpuBusyLoad(): ', () => {
    test('should be valid. Must return number.', () => {
      expect.assertions(1)
      return resourceUsage.__tests__.getCpuBusyLoad(200).then((load) => expect(typeof load).toBe('number'))
    })
  })

  describe('intervalRunner(): ', () => {
    test('should be valid. Must return array.', () => {
      const fn = () => Promise.resolve(0)

      expect.assertions(1)
      return resourceUsage.__tests__.intervalRunner(fn, 100, 5)
          .then((arr) => expect(arr).toEqual([0, 0, 0, 0, 0]))
    })

    test('should be valid. Must return empty array when call count is 0.', () => {
      const fn = () => Promise.resolve(0)

      expect.assertions(1)
      return resourceUsage.__tests__.intervalRunner(fn, 100, 0)
          .then((arr) => expect(arr).toEqual([]))
    })
  })

  describe('resourcesUsage(): ', () => {
    test('should be valid. Checks if it returns object.', () => {
      expect.assertions(1)
      return resourceUsage.resourcesUsage(100, 5)
          .then((resourceUsage) => expect(typeof resourceUsage).toBe('object'))
    })

    test('should be valid. Must return object with number props.', () => {
      expect.assertions(2)
      return resourceUsage.resourcesUsage(100, 5)
          .then((resourceUsage) => {
            expect(typeof resourceUsage.busyMemoryPercentage).toBe('number')
            expect(typeof resourceUsage.cpuLoadPercentage).toBe('number')
          })
    })
  })

  describe('cpuAverage(): ', () => {
    test('should be valid. Must return object with number props.', () => {
      const result = resourceUsage.__tests__.cpuAverage()

      expect(typeof result).toBe('object')
      expect(typeof result.idle).toBe('number')
      expect(typeof result.total).toBe('number')
    })
  })

  describe('arrayAverage(): ', () => {
    test('should be valid. Ordinary case.', () => {
      const testArray = [
        {
          cpuLoad: 1,
          busyMemory: 200
        },
        {
          cpuLoad: 2,
          busyMemory: 400
        },
        {
          cpuLoad: 3,
          busyMemory: 600
        }
      ]
      const emptyArray = []
      const resultForTestArray = {
        cpuLoadPercentage: 2,
        busyMemoryPercentage: 400
      }
      const resultForEmptyArray = {
        cpuLoadPercentage: 0,
        busyMemoryPercentage: 0
      }

      expect(resourceUsage.__tests__.arrayAverage(testArray)).toEqual(resultForTestArray)
      expect(resourceUsage.__tests__.arrayAverage(emptyArray)).toEqual(resultForEmptyArray)
    })
  })
})
