import './style.css'

document.querySelector('#app').innerHTML = `
  <main class="shell">
    <header class="top">
      <div class="brand"><span class="led"></span> AZIMUT<span class="dim">/LAB</span></div>
      <div class="live"><i></i> POCKET SYSTEM</div>
    </header>

    <section class="intro">
      <div class="eyebrow">FIELD TERMINAL // REV 02</div>
      <h1>YOUR OWN<br><span>DIRECTION.</span></h1>
      <p>Ориентируйся. Исследуй. Действуй.</p>
    </section>

    <section class="panel compass-panel">
      <div class="panel-head"><span>01 / NAVIGATION</span><span id="sensorState">STANDBY</span></div>
      <div class="compass">
        <div class="ticks"></div>
        <div class="circle c1"></div><div class="circle c2"></div>
        <span class="cardinal n">N</span><span class="cardinal e">E</span>
        <span class="cardinal s">S</span><span class="cardinal w">W</span>
        <div class="needle" id="needle"><span></span></div>
        <div class="hub"></div>
      </div>
      <div class="bearing"><strong id="degrees">---</strong><span>DEG</span></div>
      <div class="direction" id="direction">КУРС НЕ ОПРЕДЕЛЁН</div>
      <button id="startCompass">◈ АКТИВИРОВАТЬ КОМПАС</button>
      <p class="hint" id="sensorHint">Ожидание разрешения датчика устройства</p>
    </section>

    <section class="section-title"><span>02 / TELEMETRY</span><span>LIVE DATA</span></section>
    <section class="metrics">
      <article class="metric"><span>GPS STATUS</span><b id="gpsState">OFFLINE</b><small>Местоположение</small></article>
      <article class="metric"><span>ACCURACY</span><b id="accuracy">---</b><small>Точность GPS</small></article>
      <article class="metric wide"><span>COORDINATES / LAT · LON</span><b id="coords">ОЖИДАНИЕ GPS</b><small id="gpsHint">Данные не запрашивались</small></article>
    </section>

    <button class="secondary" id="startGPS">⌖ ЗАПРОСИТЬ КООРДИНАТЫ GPS</button>

    <section class="log panel">
      <div class="panel-head"><span>03 / SYSTEM LOG</span><span>LOCAL</span></div>
      <div id="logs"><p><i>●</i> AZIMUT interface initialized</p><p><i>●</i> Waiting for sensor input...</p></div>
    </section>

    <footer><span>AZIMUT // POCKET LAB</span><span>REV. 02</span></footer>
  </main>
`

const $ = id => document.getElementById(id)
let compassActive = false
let gpsWatch = null
let lastHeading = null

function log(message) {
  const line = document.createElement('p')
  const dot = document.createElement('i')
  dot.textContent = '●'
  line.append(dot, document.createTextNode(' ' + message))
  $('logs').prepend(line)
  while ($('logs').children.length > 5) $('logs').lastElementChild.remove()
}

function setHeading(deg) {
  if (!Number.isFinite(deg)) return
  const heading = ((deg % 360) + 360) % 360
  lastHeading = heading
  $('needle').style.transform = `translate(-50%, -85%) rotate(${heading}deg)`
  $('degrees').textContent = String(Math.round(heading)).padStart(3, '0')
  const directions = ['С','СВ','В','ЮВ','Ю','ЮЗ','З','СЗ']
  $('direction').textContent = directions[Math.round(heading / 45) % 8] + ' · ' + Math.round(heading) + '°'
  $('sensorState').textContent = 'ACTIVE'
}

function onOrientation(event) {
  if (typeof event.webkitCompassHeading === 'number') {
    setHeading(event.webkitCompassHeading)
  } else if (typeof event.alpha === 'number') {
    setHeading(360 - event.alpha)
    $('sensorHint').textContent = event.absolute
      ? 'Получен абсолютный курс датчика'
      : 'Получена относительная ориентация; север может не совпадать'
  }
}

$('startCompass').addEventListener('click', async () => {
  if (!('DeviceOrientationEvent' in window)) {
    $('sensorHint').textContent = 'Датчик ориентации не поддерживается этим браузером'
    log('Orientation sensor unavailable')
    return
  }

  try {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission !== 'granted') throw new Error('Доступ к датчику отклонён')
    }

    if (!compassActive) {
      window.addEventListener('deviceorientation', onOrientation, true)
      compassActive = true
      $('startCompass').textContent = '◈ КОМПАС АКТИВЕН'
      $('sensorHint').textContent = 'Поверни телефон и проверь изменение курса'
      log('Orientation sensor requested')
    }
  } catch (error) {
    $('sensorHint').textContent = error.message || 'Не удалось включить датчик'
    log('Compass permission unavailable')
  }
})

$('startGPS').addEventListener('click', () => {
  if (!navigator.geolocation) {
    $('gpsHint').textContent = 'Геолокация не поддерживается'
    return
  }

  if (gpsWatch !== null) navigator.geolocation.clearWatch(gpsWatch)
  $('gpsState').textContent = 'SEARCHING'
  $('gpsHint').textContent = 'Ожидание спутников и разрешения...'
  log('GPS location request started')

  gpsWatch = navigator.geolocation.watchPosition(position => {
    const c = position.coords
    $('coords').textContent = `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`
    $('accuracy').textContent = `±${Math.round(c.accuracy)} m`
    $('gpsState').textContent = 'ACTIVE'
    $('gpsHint').textContent = 'Обновлено: ' + new Date().toLocaleTimeString()
  }, error => {
    $('gpsState').textContent = 'UNAVAILABLE'
    $('gpsHint').textContent = error.code === 1
      ? 'Доступ запрещён пользователем'
      : 'Не удалось получить координаты'
    log('GPS unavailable: ' + error.message)
  }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 })
})

window.addEventListener('pagehide', () => {
  if (gpsWatch !== null) navigator.geolocation.clearWatch(gpsWatch)
})
