# ResourceUsage

## resourcesUsage(interval, count).

 * Interval is a total time in which you want to check statistics.
 * Count is call quantity in given interval.
 * Returns promise.

  ```javascript
    const ResourceUsage = require('ResourceUsage')

    ResourceUsage.resourcesUsage(interval, count).then((result) => {

      /**
       * result ->
       *    { cpuLoadPercentage: number
       *      busyMemoryPercentage: number }
       */
    }).catch()
  ```
