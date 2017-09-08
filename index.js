const os = require('os')
const Promise = require('bluebird')
const execFile = require('child_process').execFile
const execFileSync = require('child_process').execFileSync
const platform = require('os').platform()
const path = require('path')
const wmic = platform === 'win32' ? path.join(process.env.SystemRoot, 'System32', 'wbem', 'wmic.exe') : null

const getCpuPercentage = () => {
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

const logResourcesUsage = (callCount, interval) => {
  const cpuLoadPercentages = []
  const memoryUsagePercentages = []
  const timerId = setInterval(() => {
    if (cpuLoadPercentages.length < callCount) {
      const cpuPercentage = getCpuPercentage()
      cpuLoadPercentages.push(cpuPercentage)
      const memoryUsage = getMemoryUsage()
      memoryUsagePercentages.push(memoryUsage)
    } else {
      clearInterval(timerId)
      const cpuPercentage = average(cpuLoadPercentages)
      const memoryUsagePercentage = average(memoryUsagePercentages)
      console.log('CPU usage percentage: ' + (cpuPercentage / cpuLoadPercentages.length).toFixed(2))
      console.log('Memory usage in GB: ' + (memoryUsagePercentage / memoryUsagePercentages.length).toFixed(2))
    }
  }, interval)
}

module.exports = {
  logResourcesUsage
}
