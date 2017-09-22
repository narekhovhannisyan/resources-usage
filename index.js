const os = require('os')
const path = require('path')
const platform = require('os').platform()
const execFileSync = require('child_process').execFileSync
const wmic = platform === 'win32' ? path.join(process.env.SystemRoot, 'System32', 'wbem', 'wmic.exe') : null

const cpuAverage = () => {
  let totalIdle = 0, totalTick = 0
  const cpus = os.cpus()
  for(let i = 0, len = cpus.length; i < len; i++) {
    const cpu = cpus[i]
    for(type in cpu.times) {
      totalTick += cpu.times[type]
    }     
    totalIdle += cpu.times.idle
  }
  return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length}
}

const getWindowsCpuPercentage = () => {
  const cpuLoadPercentage = execFileSync(wmic, ['cpu', 'get', 'loadpercentage'])
  return cpuLoadPercentage.toString().match(/\d+/g)[0]
}

const getMemoryUsage = () => {
  return ((os.totalmem() - os.freemem()) / (1024 * 1024 * 1024)).toFixed(2)
}

const average = (arr) => {
  return arr.reduce((sum, current) => {
    return Number(sum) + Number(current)
  })
}

/**
 * gets object with two properties: cpuPercentage and memoryUsage
 * cpuPercentages shows usage in percents
 * memoryUsage shows RAM memory usage in gb's
 * @param {*} callCount call count in interval
 * @param {*} interval interval in milliseconds
 * @param {*} cb call back function
 */
const resourcesUsage = (callCount, interval, cb) => {
  const cpuLoadPercentages = []
  const memoryUsagePercentages = []
  const timerId = setInterval(() => {
    if (cpuLoadPercentages.length < callCount) {
    var startMeasure = cpuAverage()
    setTimeout(() => { 
      const endMeasure = cpuAverage(); 
      const idleDifference = endMeasure.idle - startMeasure.idle
      const totalDifference = endMeasure.total - startMeasure.total
      const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference)
      cpuLoadPercentages.push(percentageCPU)
    }, 100)
      const memoryUsage = getMemoryUsage()
      memoryUsagePercentages.push(memoryUsage)
    } else {
      clearInterval(timerId)
      const cpuPercentage = average(cpuLoadPercentages)
      const memoryUsagePercentage = average(memoryUsagePercentages)
      const statistics = {
        cpuPercentage: Number((cpuPercentage / cpuLoadPercentages.length).toFixed(2)),
        memoryUsage: Number((memoryUsagePercentage / memoryUsagePercentages.length).toFixed(2))
      }
      cb(null, statistics)
    }
  }, interval)
}

// test
// resourcesUsage(5, 1000, (err, res) => { console.log(res) })

module.exports = {
  resourcesUsage
}
