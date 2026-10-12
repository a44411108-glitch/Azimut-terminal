const DONATION_URL = ''

export function initSupport() {
  if (document.getElementById('azimut-support')) return

  const panel = document.createElement('section')
  panel.id = 'azimut-support'
  panel.className = 'panel'
  panel.innerHTML = `
    <div class="panel-head">
      <span>05 / PROJECT SUPPORT</span>
      <span>OPTIONAL</span>
    </div>
    <h2>Поддержать AZIMUT</h2>
    <p>Твой вклад помогает развивать AZIMUT // POCKET LAB.</p>
    <button id="azimut-donate" type="button">
      ♥ Поддержать проект
    </button>
    <p id="azimut-support-note" aria-live="polite">
      Донаты пока не подключены. Ссылка появится позже.
    </p>
  `

  document.querySelector('#app')?.append(panel)

  document.getElementById('azimut-donate').addEventListener('click', () => {
    const note = document.getElementById('azimut-support-note')

    if (/^https:\/\/\S+$/i.test(DONATION_URL)) {
      window.open(DONATION_URL, '_blank', 'noopener,noreferrer')
    } else {
      note.textContent =
        'Рассказчик AZIMUT: спасибо за желание поддержать проект! Платёжная ссылка пока настраивается.'
    }
  })
}
