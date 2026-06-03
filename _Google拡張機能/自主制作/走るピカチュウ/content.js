(() => {
  if (document.getElementById('gif-stage')) return;

  const stage = document.createElement('div');
  stage.className = 'stage1';
  stage.id = 'gif-stage';

  const character = document.createElement('div');
  character.className = 'character1';

  stage.appendChild(character);
  document.body.appendChild(stage);

  let pos = -50;
  const speed = 1;

  function move() {
    pos += speed;
    character.style.left = pos + 'px';

    if (pos > window.innerWidth) {
      pos = -50;
    }
    requestAnimationFrame(move);
  }

  move();
})();
