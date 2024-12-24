'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState({})

  const examples = [
    'https://example.com/api?refresh=0&start=0&count=20&selected_categories=%7B%7D&uncollect=false&tags=2020%E5%B9%B4%E4%BB%A3',
    'refresh=0&start=0&count=20&selected_categories=%7B%7D&uncollect=false&tags=2020%E5%B9%B4%E4%BB%A3',
    'selected_categories: {"类型":""}, refresh: 0, start: 0, count: 20, uncollect: false, tags: 2020年代',
    `refresh: 0
start: 0
count: 20
selected_categories: {"类型":""}
uncollect: false
tags: 
sort: S`
  ]

  const parseURL = () => {
    try {
      let params = {};
      
      if (url.includes('://')) {
        // 处理完整 URL
        const urlObj = new URL(url)
        urlObj.searchParams.forEach((value, key) => {
          params[key] = parseValue(value)
        })
      } else if (url.includes('=') && !url.includes(':')) {
        // 处理查询字符串
        const searchParams = new URLSearchParams(url)
        searchParams.forEach((value, key) => {
          params[key] = parseValue(value)
        })
      } else {
        // 处理 key: value 格式（支持逗号分隔或换行分隔）
        const pairs = url.includes(',') 
          ? url.split(/,(?![^{]*})/).map(pair => pair.trim())
          : url.split('\n').map(pair => pair.trim()).filter(Boolean)

        pairs.forEach(pair => {
          const colonIndex = pair.indexOf(':')
          if (colonIndex !== -1) {
            const key = pair.slice(0, colonIndex).trim()
            const value = pair.slice(colonIndex + 1).trim()
            if (key) {
              // 如果值为空，设置为空字符串
              params[key] = value ? parseValue(value) : ''
            }
          }
        })
      }

      setResult(params)
    } catch (error) {
      alert('请输入有效的格式')
      console.error(error)
    }
  }

  const parseValue = (value) => {
    try {
      // 先解码 URL 编码
      const decodedValue = decodeURIComponent(value)
      
      // 如果值为空，返回空字符串
      if (!decodedValue) return ''
      
      // 尝试解析不同格式
      if (decodedValue.startsWith('{') || decodedValue.startsWith('[')) {
        // 确保是完整的 JSON 字符串
        const cleanJson = decodedValue.replace(/^\s*|\s*$/g, '')
        return JSON.parse(cleanJson)
      } else if (decodedValue === 'true' || decodedValue === 'false') {
        return decodedValue === 'true'
      } else if (!isNaN(decodedValue) && decodedValue !== '') {
        return Number(decodedValue)
      }
      return decodedValue
    } catch {
      return value
    }
  }

  return (
    <main className={styles.main}>
      <h1>URL 参数解析工具</h1>
      <div className={styles.container}>
        <div className={styles.examples}>
          <p>示例：</p>
          {examples.map((example, index) => (
            <button 
              key={index} 
              onClick={() => setUrl(example)}
              className={styles.exampleButton}
            >
              示例 {index + 1}
            </button>
          ))}
        </div>
        <textarea 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={styles.input}
          placeholder="支持四种格式：
1. 完整URL
2. 参数字符串 key=value
3. 键值对格式 key: value（逗号分隔）
4. 键值对格式 key: value（换行分隔）"
        />
        <button onClick={parseURL} className={styles.button}>
          解析
        </button>
        <pre className={styles.output}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </main>
  )
} 