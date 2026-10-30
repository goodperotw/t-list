export type URLSource = 'youtube' | 'twitch' | 'other'

export type URLType = '實況存檔' | '實況影片' | '實況清單' | '這啥'

export interface StreamURL {
  title: string
  url: string
  source: URLSource
  type: URLType
}

export interface Stream {
  streamTitle: string
  platform: string
  streamedAt: string
  isPopular: boolean
  isCollab: boolean
  urls: StreamURL[]
  firstYouTubeURL?: string
}

export interface FilterState {
  platforms: string[]
  sources: URLSource[]
  years: string[]
  isPopular: boolean | null
  isCollab: boolean | null
}
