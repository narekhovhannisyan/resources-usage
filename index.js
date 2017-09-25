const os = require('os')

/**
 * @returns {number} - Used RAM memory in bytes.
 * @description Subtracts free memory from total memory.
 */
const getUsedMemory = () => {
  return os.totalmem() - os.freemem()
}

/**
 * @param {number} byte - Byte to be converted.
 * @return {object} - Object that contains converted byte size and measure unit.
 * @description Converts byte into kb, mb, gb depending on size.
 */
const byteTo = (byte) => {
  const UNITS = ['byte', 'kb', 'mb', 'gb', 'tb']
  const getPowAndMult = (byte, counter = 0) => {
    if (byte >= 1024) {
      return getPowAndMult(byte / 1024, counter + 1)      
    } else {
      return {
        size: Number(byte).toFixed(3),
        unit: UNITS[counter]
      }
    }
  }
  return getPowAndMult(byte)
}

/**
 * @returns {object} - Object that contains cpu's idle mode time average and cpu's mode total time average.
 * @description Looking up cpu's modes for calculating idle mode time average and mode's total time and returns object with two properties idle and total.
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
 * @return {number} - average of array.
 * @description Calculating average of an array.
 */
const arrayAverage = (array) => {
  const sum = array.reduce((sum, current) => {
    return sum + current
  })
  return sum / array.length
}

/**
 * @param {number} callCount - Function call count per interval.
 * @param {number} interval -  Function call Interval in milliseconds.
 * @param {function} cb - Callback function.
 * @description Collects cpu load percentages and used memory sizes into arrays depending on interval and function call count. 
 * Calls arrayAverage function for computing average of this arrays. 
 * For memory usage average also used byteTo function for converting usage size unit. 
 * ~~ bitwise operation stands for number rounding like math.floor
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
      const cpuLoad = 100 - ~~(100 * idleDifference / totalDifference)
      cpuLoadPercs.push(cpuLoad)
    }, 100)
      const memoryUsage = getUsedMemory()
      usedMemorySizes.push(memoryUsage)
    } else {
      clearInterval(timerId)
      const stat = {
        cpuLoadPercentage: arrayAverage(cpuLoadPercs),
        memoryUsage: byteTo(arrayAverage(usedMemorySizes))
      }
      cb(null, stat)
    }
  }, interval)
}

/* test */
// resourcesUsage(5, 1000, (err, res) => { console.log(res) })

module.exports = {
  resourcesUsage
}
