# service-modules-common

## Services

### Resource Usage API

ResourceUsage.resourcesUsage(interval, count). 

Interval is total time in wich you want resoucesUsage function to check statistics. Count is call quantity in given interval. 
Returns promise wich contains: 

  ```
  {
    cpuLoadPercentage: number
    busyMemoryPercentage: number
  }
  ```
   