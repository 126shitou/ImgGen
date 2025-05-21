import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


/**
 * 获取当前时间的函数，支持多种格式
 * @param format 时间格式，可选值：'date'(仅日期)、'time'(仅时间)、'datetime'(日期和时间)、'iso'(ISO格式)、'timestamp'(时间戳)
 * @returns 格式化后的时间字符串或时间戳
 */
export function getCurrentTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 月份从 0 开始，需要加 1
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const formattedTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;

  return formattedTime;
}