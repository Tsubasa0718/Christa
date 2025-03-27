'use strict';

const Hamburger = document.getElementById('js-hamburger-menu');
const Nav = document.querySelector('.nav')

Hamburger.addEventListener('click',()=>{
  const Expanded = Hamburger.getAttribute('aria-expanded');
  if(Expanded === 'false'){
    Hamburger.setAttribute('aria-expanded', 'true')
    Hamburger.classList.add('is-active')
    Nav.setAttribute('aria-hidden', 'false')
    Nav.classList.add('is-active')
  } else{
    Hamburger.setAttribute('aria-expanded', 'false')
    Hamburger.classList.remove('is-active')
    Nav.setAttribute('aria-hidden', 'true');
    Nav.classList.remove('is-active')
  }
})

// 画面幅でaria属性の切替
const mediaQuery = window.matchMedia('(min-width: 992px)');

const AriaHandler = (e) =>{
  if(e.matches){
    Nav.setAttribute('aria-hidden', 'false')
    Hamburger.setAttribute('aria-expanded', 'false')
    Hamburger.setAttribute('aria-hidden', 'true')
  } else{
    Nav.setAttribute('aria-hidden', 'false')
    Hamburger.setAttribute('aria-expanded', 'false')
    Hamburger.setAttribute('aria-hidden', 'false')
  }
}

mediaQuery.addEventListener('change',AriaHandler);
AriaHandler(mediaQuery);