const os = require('os')
const Promise = require('bluebird')

/**
 * @typedef {import('./resources-usage.types').CPUArrayAverage} CPUArrayAverage
 * @typedef {import('./resources-usage.types').CPUAverage} CPUAverage
 * @typedef {import('./resources-usage.types').StatisticsData} StatisticsData
 */

/**
 * @private
 * Gets busy memory percentage.
 * @returns {Number} Busy memory (buffer/cache included) percentage.
 */
const getBusyMemoryPercentage = () => 100 - (os.freemem() / os.totalmem() * 100)

/**
 * @private
 * Looking up cpu's modes for calculating idle mode time average and mode's total time and returns
 *  object with two properties idle and total.
 * @returns {CPUAverage} Object that contains cpu's idle mode time average and cpu's mode total time average.
 */
const cpuAverage = () => {
  const cpus = os.cpus()

  const addTwoNumbers = (num1, num2) => num1 + num2
  const cpuModesSum = (core) => Object.keys(core.times).map((key) => core.times[key]).reduce(addTwoNumbers, 0)
  const cpuIdleMode = (core) => core.times.idle

  const totalTime = cpus.reduce((totalTime, core) => totalTime + cpuModesSum(core), 0)
  const idleModeTime = cpus.reduce((idleModeTime, core) => idleModeTime + cpuIdleMode(core), 0)

  return ({
    idle: idleModeTime / cpus.length,
    total: totalTime / cpus.length
  })
}

/**
 * @private
 * Calculates average value for given items.
 * @param {Array} array
 * @return {CPUArrayAverage}
 */
const arrayAverage = (array) => {
  const cpuLoadSum = array.reduce((sum, current) => sum + current.cpuLoad, 0)
  const busyMemorySum = array.reduce((sum, current) => sum + current.busyMemory, 0)

  const result = {
    cpuLoadPercentage: array.length !== 0 ? Number((cpuLoadSum / array.length).toFixed(3)) : 0,
    busyMemoryPercentage: array.length !== 0 ? Number((busyMemorySum / array.length).toFixed(3)) : 0
  }

  return result
}

/**
 * @private
 * Asynchronously measures cpu's state, calculates difference between two measures and gets cpu busy load.
 * @param {Number} delay Delay between cpu load measures
 * @returns {Promise.<Number>} Cpu's current load
 */
const getCpuBusyLoad = (delay) => Promise.resolve().delay(delay).then(() => cpuAverage())
  .then((startMeasure) => {
    const endMeasure = cpuAverage()
    const idleDifference = endMeasure.idle - startMeasure.idle
    const totalDifference = endMeasure.total - startMeasure.total

    return totalDifference === 0 ? 0 : 100 - (100 * idleDifference / totalDifference)
  })

/**
 * @private
 * Calls getBusyMemoryPercentage function to get busy memory and
 *  getCpuBusyLoad function to get cpu's load
 *  Returns object with two properties cpuLoad and busyMemory.
 * @param {Number} delay Delay between cpu load measures
 * @returns {Promise.<StatisticsData>}
 */
const statisticsGetter = (delay) => {
  const busyMemory = getBusyMemoryPercentage()

  return getCpuBusyLoad(delay).then((cpuLoad) => ({
    cpuLoad,
    busyMemory: busyMemory
  }))
}

/**
 * @private
 * Recursively calls given function with given interval between function calls.
 *  Collects given function's results in array
 * @param {Function} fn The function that must be called
 * @param {Number} interval Time between function calls
 * @param {Number} count Function's call count
 * @param {*} arr Array for collecting the results (optional)
 * @return {Promise.<*>}
 */
const intervalRunner = (fn, interval, count, arr = []) => {
  if (count <= 0) {
    return Promise.resolve(arr)
  }

  return fn().then((res) => Promise.delay(interval)
    .then(() => intervalRunner(fn, interval, count - 1, [...arr, res]))
  )
}

/**
 * Calls intervalRunner function with statisticsGetter function, interval and count as argument
 *  for getting array of cpu load and busy memory load measures. Then computes average of measures.
 * @param {Number} interval Time between statisticsGetter function calls
 * @param {Number} count Statistics getter function's call count
 * @returns {Promise.<CPUArrayAverage>}
 */
const resourcesUsage = (interval, count) => {
  const timeBetweenMeasures = Math.floor(interval / count)

  return intervalRunner(() => statisticsGetter(timeBetweenMeasures), timeBetweenMeasures, count)
    .then(arrayAverage)
}

module.exports = {
  resourcesUsage,
  __tests__: {
    getBusyMemoryPercentage,
    getCpuBusyLoad,
    statisticsGetter,
    intervalRunner,
    arrayAverage,
    cpuAverage
  }
}
