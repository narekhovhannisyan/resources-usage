# resources-usage

Module is designed to get worker load.

## How to use

`interval` is a total time in which you want to check statistics. `count` is call quantity in given interval.

```javascript
  const { resroucesUsage } = require('resources-usage')

  resourcesUsage(interval, count).then((result) => {
    /**
     * result -> { cpuLoadPercentage: number busyMemoryPercentage: number }
     */
  }).catch()
```
