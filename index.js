const os = require('os')
const execFileSync = require('child_process').execFileSync
const platform = require('os').platform()
const path = require('path')
const wmic = platform === 'win32' ? path.join(process.env.SystemRoot, 'System32', 'wbem', 'wmic.exe') : null

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

const resourcesUsage = (callCount, interval, cb) => {
  const cpuLoadPercentages = []
  const memoryUsagePercentages = []
  const timerId = setInterval(() => {
    if (cpuLoadPercentages.length < callCount) {
      const cpuPercentage = getWindowsCpuPercentage()
      cpuLoadPercentages.push(cpuPercentage)
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
