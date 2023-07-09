
// Close/Open menu
const headerMenu = document.getElementById('header-menu');
const mobileMenu = document.getElementById('header-icon');
const menuHeight = headerMenu.clientHeight;

mobileMenu.onclick = () => {
    const isClosed = headerMenu.clientHeight === menuHeight;

    if (isClosed) {
        headerMenu.style.height = '120px';
        headerMenu.style.padding = '8px';
    } else {
        headerMenu.style.height = '0px';
        headerMenu.style.padding = '0px';
    }
    console.log(1, 2, 3)
}

// Auto close menu
const menuItems = document.querySelectorAll('li a[href*="#"]');

for (var i = 0; i < menuItems.length; i++) {
    const menuItem = menuItems[i];

    menuItem.onclick = (even) => {
        headerMenu.style.height = '0px';
        headerMenu.style.padding = '0px';
    }
}

// open/close option form
const optionElement = document.querySelector('.form-options__btn.active');
const optionFormElement = document.querySelector('.option-form')
var isOpenForm = false;

optionElement.onclick = (even) => {
    if (isOpenForm) {
        optionFormElement.style.display = 'none'
        isOpenForm = false;
    } else {
        optionFormElement.style.display = 'flex'
        isOpenForm = true;
    }
}