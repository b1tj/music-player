/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / Pause / Seek
 * 4. CD rotate
 * 5. Next / Prev song
 * 6. Shuffle song
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'MY_PLAYER'

const player = $('.player')
const playlist = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const cd = $('.cd')
const progress = $('#progress')
const prevBtn = $('.btn-backward-step')
const nextBtn = $('.btn-forward-step')
const shuffleBtn = $('.btn-shuffle')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    playedList: [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Bad Habit',
            artist: 'Ed Sheeran',
            path: './asset/music/Ed Sheeran - Bad Habit.mp3',
            image: './asset/image/BadHabit.jfif',
        },
        {
            name: 'Photograph',
            artist: 'Ed Sheeran',
            path: './asset/music/Ed Sheeran - Photograph.mp3',
            image: './asset/image/photograph.jfif',
        },
        {
            name: 'Shape Of You',
            artist: 'Ed Sheeran',
            path: './asset/music/Ed Sheeran - Shape of You.mp3',
            image: './asset/image/ShapeOfYou.jfif',
        },
        {
            name: 'Shivers',
            artist: 'Ed Sheeran',
            path: './asset/music/Ed Sheeran - Shivers.mp3',
            image: './asset/image/Shiver.jfif',
        },
        {
            name: 'Hero',
            artist: 'Cash Cash ft. Christina Perri',
            path: './asset/music/SnapInsta.io - Hero - Cash Cash ft. Christina Perri ( Slowed + reverb ) (320 kbps).mp3',
            image: './asset/image/hero.jfif',
        },
        {
            name: 'STAY',
            artist: 'The Kid LAROI, Justin Bieber',
            path: './asset/music/SnapInsta.io - The Kid LAROI, Justin Bieber - STAY (Official Video) (256 kbps).mp3',
            image: './asset/image/STAY.jfif',
        },
    ],

    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                    <div class="thumb" 
                    style="background-image: url('${song.image}');"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.artist}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            },
        })
    },

    handleEvent: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý cd quay/ dừng
        const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
            duration: 10000,
            iterations: Infinity,
        })

        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercentage = Math.floor((audio.currentTime / audio.duration) * 100)
                progress.value = progressPercentage
            }
        }

        // Xử lý seeking song
        progress.oninput = function () {
            const seekTime = audio.duration * progress.value * 0.01
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
        }

        // Xử lý bật / tắt shuffle song
        shuffleBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            shuffleBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý lặp lại 1 song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next song khi ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // select song in playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')

            if (songNode || e.target.closest('.option')) {
                //Xử lý click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    setTimeout(() => {
                        _this.loadCurrentSong()
                        _this.render()
                        audio.play()
                    }, 100)
                }

                //Xử lý click vào option
                if (e.target.closest('.option')) {
                }
            }
        }
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    prevSong: function () {
        app.currentIndex--
        if (app.currentIndex < 0) {
            app.currentIndex = app.songs.length - 1
        }
        app.loadCurrentSong()
    },

    nextSong: function () {
        app.currentIndex++
        if (app.currentIndex >= app.songs.length) {
            app.currentIndex = 0
        }
        app.loadCurrentSong()
    },

    randomSong() {
        let newIndex
        if (this.playedList.length === this.songs.length) {
            this.playedList = []
        }

        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (this.currentIndex === newIndex && this.playedList.includes(newIndex))

        this.playedList.push(newIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 300)
    },

    loadConfig() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    start: function () {
        // Gán cấu hình config vào app
        this.loadConfig()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        //Lắng nghe xử lý các sự kiện
        this.handleEvent()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy app
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của random & repeat
        shuffleBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    },
}

app.start()
