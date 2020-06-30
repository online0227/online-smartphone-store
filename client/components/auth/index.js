import Cookies from 'js-cookie';

export const isServer = !(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  );

export const isAuthenticated = () => {
    const cookie = Cookies.getJSON('mywebsite');
    if (typeof window == "undefined") {        return false;
    }

    if (cookie) {        return cookie;
    } else {        return false;
    }
};