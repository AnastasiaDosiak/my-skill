import uniq from 'lodash-es/uniq';

export const checkForIsbn = (content: string) => {
    const bookIsbnRegex = /\b(?:ISBN(?:: ?| ))?((?:97[89])?\d{9}[\dx])\b/i;

    const isbnCodes = (content || '').match(bookIsbnRegex) || [];

    return uniq(isbnCodes)
}
