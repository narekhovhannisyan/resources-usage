const execFile = require('child_process').execFile
const exec = require('child_process').exec
const platform = require('os').platform()
const path = require('path')
const wmic = platform === 'win32' ? path.join(process.env.SystemRoot, 'System32', 'wbem', 'wmic.exe') : null
const cmd = 'tasklist /FO csv /nh'

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

const getMemoryUsage = (cb) => {
  try {
    exec(cmd, (error, res, stderr) => {
      if (error || stderr) {
        throw error
      } else {
        let result = res.match(/[^\r\n]+/g).map((x) => {
          let sum = +x.split('","')[4].replace(/[^\d]/g, '')
          return (!isNaN(sum) && typeof sum === 'number') ? sum : 0
        }).reduce((prev, current) => {
          return prev + current
        })
        cb(null, result / (1024 * 1024))
      }
    })
  } catch (error) {
    console.log(error)
  }
}

getMemoryUsage((err, size) => {
  if (err) return console.log('fuck')
  console.log('RAM usage: ' + size + ' GB')
})

getPercentage((err, percentage) => {
  if (err) return console.log('fuck')
  console.log('CPU usage: ' + percentage + '%')
})
