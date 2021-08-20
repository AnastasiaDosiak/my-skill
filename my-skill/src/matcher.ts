import {checkForIsbn} from "./shared/check-for-isbn";

export default function matcher(
    browserTabWindow: Window
) {
    const hostName = browserTabWindow.location.host;
    if (hostName.endsWith('amazon.de')) {
        return false;
    }

    const pageContent = browserTabWindow.document.body.innerText;
    const isbnCodes = checkForIsbn(pageContent);
    if (isbnCodes.length) {
        return {isbnCodes}
    }
}

