/**
 * 1. Render songs
 * 2. Scroll top 
 * 3. Play / pause / seek 
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song 
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'CONG_PLAYER';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cDThemb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const volumeDrag = $('#volume');
const volumeBtn = $('.seek-volume');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: '佛系少女',
            singer: '冯提莫',
            path: './assets/music/冯提莫《佛系少女》Phật-hệ-thiếu-nữ-.mp3',
            image: './assets/img/fengtimo.jpg'
        },
        {
            name: '窥',
            singer: '冯提莫',
            path: './assets/music/冯提莫《窥》.mp3',
            image: './assets/img/fengtimo.jpg'
        },
        {
            name: '青梅雨水',
            singer: '冯提莫',
            path: './assets/music/冯提莫-《青梅雨水》.mp3',
            image: './assets/img/fengtimo.jpg'
        },
        {
            name: '放空',
            singer: '冯提莫',
            path: './assets/music/放空_FengTimo.mp3',
            image: './assets/img/fengtimo.jpg'
        },
        {
            name: 'What are word',
            singer: '冯提莫 - cover',
            path: './assets/music/冯提莫_What-Are-Word.mp3',
            image: './assets/img/fengtimo.jpg'
        },
        {
            name: '勾指起誓',
            singer: '冯提莫',
            path: './assets/music/《勾指起誓》.mp3',
            image: './assets/img/fengtimo.jpg'
        },
        {
            name: 'Faded',
            singer: 'Alan Walker',
            path: './assets/music/Alan_Walker_-_FadedMP3_128K.mp3',
            image: './assets/img/alw.jpg'
        },
        {
            name: 'Đường đến ngày vinh quang',
            singer: 'Bức Tường',
            path: './assets/music/DuongDenNgayVinhQuang-BucTuong-553864.mp3',
            image: './assets/img/buctuong.jpg'
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            const duration = song.duration ? this.formatTime(song.duration) : '--:--'
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <p class="song-duration">${duration}</p>
                </div>
            </div>
            `;
        })

        playList.innerHTML = htmls.join('');
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function () {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý CD quay / dừng
        const cdThembAnimate = cDThemb.animate([
            { transform: 'rotate(360deg)' } // hiệu ứng quay
        ], {
            duration: 10000, // quay trong 10 seconds
            iterations: Infinity // lặp lại vô hạn
        });

        cdThembAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        // khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThembAnimate.play();
        }

        // khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThembAnimate.pause();
        }

        // Xử lý khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua bài
        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        audio.onvolumechange = function () {
            if (audio.volume === 0) {
                volumeBtn.classList.add('active');
            } else {
                volumeBtn.classList.remove('active');
            }
        }

        // Xử lý khi điều chỉnh âm lượng
        volumeDrag.oninput = function (e) {
            const seekVolume = e.target.value;
            audio.volume = seekVolume / 100;
        }

        // Xử lý khi next bài hát
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }

            audio.play();
            _this.render();

            _this.scrollToActiveSong();
        }

        // Xử lý khi prev bài hát
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }

            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý bật / tắt random bài hát
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            randomBtn.classList.toggle('active', _this.isRandom); // nếu isRandom là true -> add, còn false là -> xóa
            _this.setConfig('isRandom', _this.isRandom);
        }

        // Xử lý khi repeat bài hát
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle('active', _this.isRepeat);
            _this.setConfig('isRepeat', _this.isRepeat);
        }

        // Xử lý next bài hát khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Lắng nghe click vào playlist
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');

            if (songNode || e.target.closest('.option')) {

                // Xử lý khi click vào bài hát              
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Xử lý khi click vào option
            }
        }

        // audio.addEventListener('loadedmetadata', (e) => {
        //     const duration = e.target.duration
        //     const musicDurations = $$('.song-duration');

        //     // Cập nhật tổng thời lượng bài hát
        //     if (!isNaN(duration)) {
        //         let totalMin = Math.floor(duration / 60)
        //         let totalSec = Math.floor(duration % 60)
        //         if (totalMin < 10) {
        //             totalMin = `0${totalMin}`
        //         }
        //         if (totalSec < 10) {
        //             totalSec = `0${totalSec}`
        //         }

        //         musicDurations.forEach((song) => {
        //             song.innerText = `${totalMin}:${totalSec}`
        //         })
        //     }
        // })
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            if (this.currentIndex === 0) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            } else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }, 200);
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cDThemb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function () {
        this.currentIndex++;

        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        };

        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;

        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        };

        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex;

        do {
            newIndex = Math.floor(Math.random() * this.songs.length);

        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex;

        this.loadCurrentSong();
    },

    start: function () {
        // Gán cấu hình từ confif vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button random, repeat
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start()