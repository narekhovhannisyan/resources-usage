const os = require('os')

/**
 * @returns {number} - used memory
 * @description getUsedMemory function returns used RAM memory
 */
const getUsedMemory = () => {
  return os.totalmem() - os.freemem()
}

/**
 * @param {number} byte - byte to convert
 * @return {object} - object that contains byte size and unit
 * @description byteTo function converts byte into kb, mb, gb depending from size
 */
const byteTo = (byte) => {
  const arr = ['byte', 'kb', 'mb', 'gb', 'tb']
  const counter = 0
  const getPowAndMult = (byte, counter) => {
    if (byte >= 1024) {
      return getPowAndMult(byte / 1024, counter + 1)      
    } else {
      return {
        size: Number(byte).toFixed(3),
        unit: arr[counter]
      }
    }
  }
  return getPowAndMult(byte, 0)
}
/**
 * @returns {object}
 * @description cpuAverage function returns object that contains average of idle mode and total per cpus
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
 * @param {array} arr - array of numbers
 * @return {number} - average of array
 * @description arrayAverage function returns average of an array (converting every character to number)
 */
const arrayAverage = (arr) => {
  const sum = arr.reduce((sum, current) => {
    return Number(sum) + Number(current)
  })
  return sum / arr.length
}

/**
 * @param {number} callCount - call count in interval
 * @param {number} interval -  interval in milliseconds
 * @param {function} cb - call back function
 * @description gets object with two properties: cpuPercentage and memoryUsage
 */
const resourcesUsage = (callCount, interval, cb) => {
  /* cpuLoadPercs - array of cpu load percentages, usedMemoryPercs - array of usedMemory percentages */
  const cpuLoadPercs = [], usedMemoryPercs = []
  const timerId = setInterval(() => {
    if (cpuLoadPercs.length < callCount) {
    const startMeasure = cpuAverage()
    setTimeout(() => { 
      const endMeasure = cpuAverage()
      const idleDifference = endMeasure.idle - startMeasure.idle
      const totalDifference = endMeasure.total - startMeasure.total
      const cpuLoad = 100 - ~~(100 * idleDifference / totalDifference)
      cpuLoadPercs.push(cpuLoad)
    }, 100)
      const memoryUsage = getUsedMemory()
      usedMemoryPercs.push(memoryUsage)
    } else {
      clearInterval(timerId)
      const stat = {
        cpuLoadPercentage: arrayAverage(cpuLoadPercs),
        memoryUsage: byteTo(arrayAverage(usedMemoryPercs))
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
