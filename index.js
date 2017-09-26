const os = require('os')

/**
 * @returns {number} - Free memory (buffer/cache included) percentage.
 * @description Gets free memory percentage rounding with ~~ bitwise operation.
 */
const getfreeMemoryPercentage = () => os.freemem() / os.totalmem() * 100

/**
 * @returns {object} - Object that contains cpu's idle mode time average and cpu's mode total time average.
 * @description Looking up cpu's modes for calculating idle mode time average and mode's total time and returns 
 *  object with two properties idle and total.
 */
const cpuAverage = () => {
  let idleModeTime = 0
  let totalTime = 0
  const cpus = os.cpus()
  for (let i = 0; i < cpus.length; i++) {
    for (mode in cpus[i].times) {
      totalTime += cpus[i].times[mode]
    }     
    idleModeTime += cpus[i].times.idle
  }
  return { 
    idle: idleModeTime / cpus.length,
    total: totalTime / cpus.length
  }
}

/**
 * @param {number|Array} arr - Array of numbers.
 * @return {number} - Average of array.
 * @description Calculating average of an array.
 */
const arrayAverage = (array) => {
  const sum = array.reduce((sum, current) => {
    return sum + current
  })
  return sum / array.length
}

/**
 * @param {number} callCount - Measuring times per interval.
 * @param {number} interval - Measuring interval in milliseconds.
 * @param {function} cb - Callback function.
 * @description Collects cpu load percentages and used memory sizes into arrays depending on interval and function call count. 
 *  Calls arrayAverage function for computing average of this arrays. 
 *  ~~ bitwise operation stands for number rounding like math.floor
 */
const resourcesUsage = (callCount, interval, cb) => {
  /* cpuLoadPercs - array of cpu load percentages, usedMemorySizes - array of usedMemory percentages */
  const cpuLoadPercs = [], usedMemorySizes = []
  const timerId = setInterval(() => {
    if (cpuLoadPercs.length < callCount) {
      /* calculating cpuLoad with two measures */
    const startMeasure = cpuAverage()
    setTimeout(() => { 
      const endMeasure = cpuAverage()
      const idleDifference = endMeasure.idle - startMeasure.idle
      const totalDifference = endMeasure.total - startMeasure.total
      const cpuLoad = Number((100 - 100 * idleDifference / totalDifference).toFixed(3))
      cpuLoadPercs.push(cpuLoad)
    }, 100)
      const memoryUsage = 100 - getfreeMemoryPercentage()
      usedMemorySizes.push(memoryUsage)
    } else {
      clearInterval(timerId)
      const stat = {
        cpuLoadPercentage: arrayAverage(cpuLoadPercs),
        memoryUsagePercentage: arrayAverage(usedMemorySizes)
      }
      cb(null, stat)
    }
  }, interval)
}

module.exports = resourcesUsage
