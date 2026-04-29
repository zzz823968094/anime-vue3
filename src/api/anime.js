import axios from 'axios'
import {API_BASE_URL} from '@/config/env'

const http = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
})

// 請求攔截：自動帶 token
http.interceptors.request.use(config => {
    const token = localStorage.getItem('ms_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// 響應攔截：統一解包
http.interceptors.response.use(
    res => res.data,
    err => Promise.reject(err)
)

/* ── 番劇 ── */
export const animeApi = {
    getLatest(page = 1, size = 24) {
        return http.get('/api/anime/list', {params: {page, size, sort: 'latest', sign: 'web'}})
    },
    getList(params) {
        return http.get('/api/anime/list', {params})
    },
    search(keyword, page = 1, size = 24) {
        return http.get('/api/anime/search', {params: {keyword, page, size}})
    },
    getHot(size = 20) {
        return http.get('/api/anime/recommend/hot', {params: {size}})
    },
    getCarousel() {
        return http.get('/api/anime/carousel/list')
    },
    getDetail(id) {
        return http.get(`/api/anime/${id}`)
    },
}

/* ── 影片 ── */
export const videoApi = {
    getByAnime(animeId) {
        return http.get(`/api/video/anime/${animeId}`)
    },
    getOne(videoId) {
        return http.get(`/api/video/${videoId}`)
    },
}

/* ── 收藏 ── */
export const favoriteApi = {
    check(animeId) {
        return http.get(`/api/favorite/${animeId}/check`)
    },
    add(animeId) {
        return http.post(`/api/favorite/${animeId}`)
    },
    remove(animeId) {
        return http.delete(`/api/favorite/${animeId}`)
    },
    list() {
        return http.get('/api/favorite/list')
    },
}

/* ── 使用者 ── */
export const userApi = {
    me() {
        return http.get('/api/user/me')
    },
}

/* ── 認證 ── */
export const authApi = {
    login(username, password) {
        return http.post('/api/auth/login', {username, password})
    },
    register(username, password) {
        return http.post('/api/auth/register', {username, password})
    },
}

/* ── 觀看歷史 ── */
export const historyApi = {
    save(data) {
        return http.post('/api/history/save', data)
    },
    list(limit = 100) {
        return http.get('/api/history/list', {params: {limit}})
    },
    remove(animeId) {
        return http.delete(`/api/history/${animeId}`)
    },
    clear() {
        return http.delete('/api/history/clear')
    },
    count() {
        return http.get('/api/history/count')
    },
}

/* ── App 版本 ── */
export const appVersionApi = {
    getLatest(platform) {
        return http.get('/api/admin/app-versions/latest', {params: {platform}})
    },
}