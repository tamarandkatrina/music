import * as flexatious from './flexatious.js'
const $ = flexatious.$

import * as music from './music.json.js'
const albums = music.get().albums.map((value, index) => {
   return {
      key: (index < 9 ? '0' : '') + (index + 1),
      title: value.title,
      tracks: value.tracks.map((value, index) => {
         return {
            key: (index < 9 ? '0' : '') + (index + 1),
            title: value.title,
            length: value.length
         }
      })
   }
})

const template1 = `\`${$('template#album')[0].innerHTML}\``
const template2 = `\`${$('template#track')[0].innerHTML}\``
const catalogue = $('block#catalogue')[0]
Object.defineProperty(window, 'audio', {
   get () { return $('audio')[0] }
});
const tracks = []
let current = 0
let time_active = false
let vol_active = false;
let old_volume = 1;
let old_pos = '100%';

albums.reverse()
for (let album of albums) {
   catalogue.innerHTML += eval(template1)
   let container = $(`.album[key="${album.key}"] > .album-tracks`)[0]
   for (let track of album.tracks) {
      tracks.push({ album: album, track: track });
      container.innerHTML += eval(template2)
   }
}

albums.reverse()
$('.track').map((element, index) => {
   const key1 = +element.parentNode.parentNode.getAttribute('key')
   const key2 = +element.getAttribute('key')
   const album = albums[key1 - 1]
   const track = album.tracks[key2 - 1]
   const node = index;
   element.addEventListener('click', () => {
      const active = $('.track[active]')[0]
      if (active) active.removeAttribute('active');
      element.setAttribute('active', '');
      $('#total-time')[0].innerText = track.length;
      audio.src = `./music/${album.key}/${track.key}.mp3`
      if (active) audio.play()
      current = index;
      if (active) $('#play')[0].innerText = 'pause_circle_outline';
   })
})

const seek = (num) => {
   $('.track[active]')[0].removeAttribute('active');
   current += num;
   if (current === tracks.length) current = 0;
   else if (current === -1) current = tracks.length - 1;
   const node = tracks[current];
   $('#total-time')[0].innerText = node.track.length;
   audio.src = `./music/${node.album.key}/${node.track.key}.mp3`
   audio.play()
   $('#play')[0].innerText = 'pause_circle_outline';
   let element = $(`.album[key="${node.album.key}"] > .album-tracks > .track[key="${node.track.key}"]`)[0]
   element.setAttribute('active', '')
}

audio.addEventListener('ended', () => {
   seek(1);
});

$('#previous')[0].addEventListener('click', () => {
   seek(-1);
})

$('#next')[0].addEventListener('click', () => {
   seek(1);
})

$('#play')[0].addEventListener('click', () => {
   console.log(audio);
   if (audio.paused) {
      $('#play')[0].innerText = 'pause_circle_outline';
      audio.play();
   } else {
      $('#play')[0].innerText = 'play_circle_outline';
      audio.pause();
   }
});

$('#time')[0].addEventListener('mousedown', (event) => {
   time_active = true;
   audio.pause();
   let rect1 = $('#time-fill')[0].getBoundingClientRect();
   let rect2 = $('#time')[0].getBoundingClientRect();
   let position = event.clientX - rect1.left;
   if (position < 0) position = 0;
   if (position > rect2.width) position = rect1.width;
   $('#time-fill')[0].style.width = `${position}px`;
   let time = audio.duration / (rect2.width / position);
   if (isFinite(time) && !isNaN(time)) {
      audio.currentTime = time;
   }
});

$('#vol')[0].addEventListener('mousedown', (event) => {
   vol_active = true;
   let rect1 = $('#vol-fill')[0].getBoundingClientRect();
   let rect2 = $('#vol')[0].getBoundingClientRect();
   let position = event.clientX - rect1.left;
   if (position < 0) position = 0;
   if (position > rect2.width) position = rect1.width;
   $('#vol-fill')[0].style.width = `${position}px`;
   let vol = 100 / (rect2.width / position);
   if (isFinite(vol) && !isNaN(vol)) {
      audio.volume = vol / 100;
   }
});

window.addEventListener('mouseup', () => {
   if (time_active) {
      time_active = false;
      audio.play();
      $('#play')[0].innerText = 'pause_circle_outline';
   }
   if (vol_active) {
      vol_active = false;
   }
});

window.addEventListener('mousemove', () => {
   if (time_active) {
      let rect1 = $('#time-fill')[0].getBoundingClientRect();
      let rect2 = $('#time')[0].getBoundingClientRect();
      let position = event.clientX - rect1.left;
      if (position < 0) position = 0;
      if (position > rect2.width) position = rect1.width;
      $('#time-fill')[0].style.width = `${position}px`;
      let time = audio.duration / (rect2.width / position);
      if (isFinite(time) && !isNaN(time)) {
         audio.currentTime = time;
      }
   }
   if (vol_active) {
      let rect1 = $('#vol-fill')[0].getBoundingClientRect();
      let rect2 = $('#vol')[0].getBoundingClientRect();
      let position = event.clientX - rect1.left;
      if (position < 0) position = 0;
      if (position > rect2.width) position = rect1.width;
      $('#vol-fill')[0].style.width = `${position}px`;
      let vol = 100 / (rect2.width / position);
      if (isFinite(vol) && !isNaN(vol)) {
         audio.volume = vol / 100;
         if (vol > 50) {
            $('#volume')[0].innerText = 'volume_up';
         } else if (vol === 0) {
            $('#volume')[0].innerText = 'volume_off';
         } else {
            $('#volume')[0].innerText = 'volume_down';
         }
      }
   }
});

$('#volume')[0].addEventListener('click', () => {
   if (audio.volume === 0) {
      audio.volume = old_volume;
      $('#vol-fill')[0].style.width = old_pos;
   } else {
      old_volume = audio.volume;
      old_pos = $('#vol-fill')[0].style.width;
      audio.volume = 0;
      $('#vol-fill')[0].style.width = '0';
   }
   if (audio.volume > 0.5) {
      $('#volume')[0].innerText = 'volume_up';
   } else if (audio.volume === 0) {
      $('#volume')[0].innerText = 'volume_off';
   } else {
      $('#volume')[0].innerText = 'volume_down';
   }
});

setInterval(() => {
   let rect2 = $('#time')[0].getBoundingClientRect();
   if (!time_active) {
      let current = Math.floor(audio.currentTime);
      let total = audio.duration;
      let seconds = String(current % 60);
      let minutes = String((current - Number(seconds)) / 60);
      minutes.length === 1 && (minutes = `0${minutes}`);
      seconds.length === 1 && (seconds = `0${seconds}`);
      let currentText = $('#current-time')[0];
      let newText = `${minutes}:${seconds}`;
      if (currentText !== newText) {
         $('#current-time')[0].innerText = newText;
      }
      let position = rect2.width / (total / current);
      $('#time-fill')[0].style.width = `${position}px`;
   }
}, 20);

$('.track')[0].click();



/*
calc1: () => {
   if (control.seek.state > 0) {
      let rect1 = $('#time-fill').getBoundingClientRect();
      let rect2 = $('#time-rail').getBoundingClientRect();
      let height = window.innerHeight
         || document.documentElement.clientHeight
         || document.body.clientHeight;
      let width = window.innerWidth
         || document.documentElement.clientWidth
         || document.body.clientWidth;
      let position = event.clientX - rect1.left;
      if (position < 0) position = 0;
      if (position > rect2.width) position = rect1.width;
      if (height <= 520 && height >= 270 && width >= 365) {
         position /= 1.3;
      }
      $('#time-fill').css({ width: `${position}px` });
      if (height <= 520 && height >= 270 && width >= 365) {
         position *= 1.3;
      }
      if (control.volume.state === 0) {
         let time = $('video').duration / (rect2.width / position);
         if (isFinite(time) && !isNaN(time)) {
            $('video').currentTime = time;
         }
      } else {
         let vol = 1 / (rect2.width / position);
         $('video').volume = vol;
      }
   }
},
calc2: () => {
   let current = null, total = null;
   if (control.volume.state === 0) {
      current = Math.floor($('video').currentTime);
      total = $('video').duration;
      let seconds = String(current % 60);
      let minutes = String((current - Number(seconds)) / 60);
      minutes.length === 1 && (minutes = `0${minutes}`);
      seconds.length === 1 && (seconds = `0${seconds}`);
      let currentText = $('#current-time');
      let newText = `${minutes}:${seconds}`;
      if (currentText !== newText) {
         $('#current-time').innerText = newText;
      }
   } else {
      current = Math.round($('video').volume * 100);
      total = 100;
      $('#current-time').innerText = `${current}%`;
   }
   control.audio.time = Math.floor($('video').currentTime);
   control.audio.volume = Math.round($('video').volume * 100);
   if (control.seek.state === 0) {
      let rect = $('#time-rail').getBoundingClientRect();
      let height = window.innerHeight
         || document.documentElement.clientHeight
         || document.body.clientHeight;
      let width = window.innerWidth
         || document.documentElement.clientWidth
         || document.body.clientWidth;
      if (height <= 520 && height >= 270 && width <= 365) {
         rect.width /= 1.3;
      }
      let position = rect.width / (total / current);
      $('#time-fill').css({ width: `${position}px` });
   }
},
state: 0
*/