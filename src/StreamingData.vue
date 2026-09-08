<script setup async lang="ts">
import ky from 'ky'
const url = "https://docs.google.com/spreadsheets/d/1O0UMu-EMvgm5JPCyKQk_R-5sQOK7DQSEWhi0G47J9YQ/export?format=csv&gid=0#gid=0"

function parseCSV(rawString){
  return rawString
    .split("\n")
    .map(line => line.split(","))
}

function extractTitleInURL(url){
  let title = url.match(/\(.+\)/)?.[0]
  if (title) {
    url = url.replace(title, "")
    title = title.replace("(", "").replace(")", "")
  }
  return [title, url]
}

function parseURLs(urls) {
  let parsedURLs = urls.map((url, i) => {
    let title
    if (url.includes("playlist")) {
      return { title: "實況清單", url }
    } else if (/youtube\.com\/live\/[a-zA-Z0-9\-_]+/.test(url) || /twitch\.tv\/videos\/\d+/.test(url)) {
      [title, url] = extractTitleInURL(url)
      return { title: title || "實況存檔", url }
    } else if (/youtube\.com\/watch\?v=[a-zA-Z0-9\-_]+/.test(url) || /youtu\.be\/[a-zA-Z\-_]+/.test(url)) {
      [title, url] = extractTitleInURL(url)
      return { title: title || "實況影片", url }
    } else if (!url || url === "\r") {
      return null
    } else { return { title: "這啥", url }}
  }).filter(url => url && url !== "\r")
  return parsedURLs
}

const textData = await ky.get(url).text()
const csvData = parseCSV(textData)
const streamingData = csvData.map(cells => {
  let [streamTitle, platform, streamedAt, isPopular, isCollab, ...urls] = cells
  isPopular = isPopular === "√"
  isCollab = isCollab === "√"
  urls = parseURLs(urls)

  return { streamTitle, platform, streamedAt, isPopular, isCollab, urls }
})
</script>

<template>
<Suspense>
<div v-for="data in streamingData">
    <p>標題: {{data.streamTitle}}</p>
    <p>平臺: {{data.platform}}</p>
    <p>直播年份: {{data.streamedAt}}</p>
    <p>紅嗎: {{data.isPopular}}</p>
    <p>聯動嗎: {{data.isCollab}}</p>
    <fragment v-for="url in data.urls">
        <a target="_blank" :href="url.url">{{url.title}}</a>
    </fragment>
    <hr></hr>
</div>
<template #fallback>Loading...</template>
</Suspense>
</template>
