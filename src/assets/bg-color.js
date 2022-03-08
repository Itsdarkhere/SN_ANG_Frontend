const colorsBg = ['', 'mainBg', 'blackBg', 'mainBg', 'blackBg', 'blackBg']

const sections = [...document.getElementsByTagName('section')]

window.addEventListener('scroll', function () {

  const scrollFromTop = window.pageYOffset

  for (let i = 0; sections.length > i; i++) {

    if (scrollFromTop <= sections[i].offsetTop) {
      document.body.className = colorsBg[i] 
      break
    } 

  }

})

