export const dB = (x) => (Math.log10(x) * 10);
export const Bd = (x) => (Math.pow(10, x / 10));

export function softmax(arr) {
    // Find the maximum value in the array for numerical stability
    const max = Math.max(...arr);
    
    // Compute the exponential of all elements in the input array
    const expArr = arr.map(x => Math.exp(x - max));
    
    // Compute the sum of the exponential values
    const sumExp = expArr.reduce((a, b) => a + b, 0);
    
    // Compute the softmax probabilities
    const softmaxProbs = expArr.map(x => x / sumExp);
    
    return softmaxProbs;
}

// timeUtils.js
export function formatTimeToLocal(timeT, type = "full") {
    const date = new Date(timeT * 1000); // timeT 是秒，需要转换为毫秒
  
    const pad = (num) => num.toString().padStart(2, '0');
  
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // 月份从0开始，需要加1
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
  
    if (type === "full")
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    else if (type == "hms")
    return `${hours}:${minutes}:${seconds}`;
  }


// 将本地时间字符串转换为 time_t
export const convertToTimeT = (timeStr) => {
    const date = new Date(timeStr);
    return Math.floor(date.getTime() / 1000);
};


export const isValidTime = (time) => {
    // 正则表达式检查格式
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(time)) {
      return false;
    }
  
    // 使用 Date 对象进一步验证
    const [datePart, timePart] = time.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
  
    // 检查日期的有效性
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
      return false;
    }
  
    // 检查时间的有效性
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      return false;
    }
  
    return true;
  };
  

  export function decimalToDMS(deg, precision = 4) {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = (minutesNotTruncated - minutes) * 60;
  
    const dms = `${degrees}° ${minutes}' ${seconds.toFixed(precision)}"`;
    return deg >= 0 ? dms : `-${dms}`;
  }
  