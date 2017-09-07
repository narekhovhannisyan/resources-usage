const os = require('os')
const Promise = require('bluebird')
const execFile = require('child_process').execFile
const platform = require('os').platform()
const path = require('path')
const wmic = platform === 'win32' ? path.join(process.env.SystemRoot, 'System32', 'wbem', 'wmic.exe') : null

const caller = () => {
  const percentages = []
  const timerId = setInterval(() => {
    if (percentages.length <= 20) {
      getPercentage((err, res) => { if (err) { console.error(err) } percentages.push(res) })
    } else {
      const average = percentages.reduce((previous, current) => {
        return current + previous
      }, 0) / percentages.length
      console.log(average)
      clearInterval(timerId)
    }
  }, 1000)
  return percentages
}

const getPercentage = (cb) => {
  try {
    execFile(wmic, ['cpu', 'get', 'loadpercentage'], (error, res, stderr) => {
      if (error || stderr) {
        throw error
      } else {
        const percentage = res.match(/\d+/g)[0]
        return cb(null, percentage)
      }
    })
  } catch (error) {
    console.error(error)
  }
}

const getMemoryUsage = () => {
  console.log(((os.totalmem() - os.freemem()) / (1024 * 1024 * 1024)).toFixed(2))
  return Promise.resolve(((os.totalmem() - os.freemem()) / (1024 * 1024 * 1024)).toFixed(2))
}

caller()
