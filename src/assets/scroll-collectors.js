// COLLECTORS
/*
const spaceHolder2 = document.querySelector('.space-holder__collectors');
const horizontal2 = document.querySelector('.horizontal__collectors');
spaceHolder2.style.height = `${calcDynamicHeight(horizontal2)}px`;

function calcDynamicHeight(ref2) {
  const vw2 = window.innerWidth;
  const vh2 = window.innerHeight;
  const objectWidth2 = ref2.scrollWidth;
  return objectWidth2 - vw2 + vh2 + 150; // 150 is the padding (in pixels) desired on the right side of the .cards container. This can be set to whatever your styles dictate
}

window.addEventListener('scroll', () => {
  const sticky2 = document.querySelector('.sticky__collectors');
  horizontal2.style.transform = `translateX(-${sticky2.offsetTop}px)`;
});

window.addEventListener('resize', () => {
  spaceHolder2.style.height = `${calcDynamicHeight(horizontal2)}px`;
});*/