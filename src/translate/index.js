import React, { Fragment } from 'react';

import en from './en';

// Add translate file
export const localeConfig = {
  locale: 'en',
  setLocale(locale) {
    this.locale = locale;
  },
  getLocale() {
    return this.locale;
  }
};

const locales = {
  en,
};

const patterns = [
  {
    symbol: '**',
    toHtml: s => <b>{s}</b>,
    selfClosing: false
  },
  {
    symbol: '||',
    toHtml: () => <br />,
    selfClosing: true
  }
];

/* eslint no-useless-escape: 0 */
const escapeRegex = str => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
const handleBuildRegex = (r, p) => (r ? (`${r}|${escapeRegex(p.symbol)}`) : escapeRegex(p.symbol));
const regexPatternStr = `(${patterns.reduce(handleBuildRegex, '')})`;
const regexPatterns = new RegExp(regexPatternStr);

const parsePatterns = str => {
  const split = str.split(regexPatterns);
  const buffer = [];
  if (split.length === 1)
    return str;
  let i = 0;
  while (i < split.length) {
    const toMatch = split[i];
    let matched = false;

    for (let j = 0; j < patterns.length; j += 1) {
      const { symbol, toHtml, selfClosing } = patterns[j];
      if (toMatch === symbol) {
        buffer.push(<Fragment key={i}>{toHtml(split[i + 1])}</Fragment>);
        i += selfClosing ? 1 : 3;
        matched = true;
        break;
      }
    }

    if (!matched) {
      buffer.push(<Fragment key={i}>{toMatch}</Fragment>);
      i += 1;
    }
  }
  return <Fragment>{buffer}</Fragment>;
};

/**
 * Parse key for nested objects
 * @param {!String} key     Id translate string
 * @param {!Object} from    Locale object
*/
const keyParse = (key, from) => key.split('.').reduce((b, e) => (b ? b[e] : null), from);

/**
 * Translate function
 * @param  {!String} key            Id translate string
 * @param  {?Object} args           Variables for dynamic translation
 * @param  {?Object} options        Options object
 * @param  {?Object} otpions.locale Override globale locale
 * @return {String}                Formated value
 */
const tr = (key, args = {}, options = {}) => {
  const trLocale = options.locale || localeConfig.getLocale();
  const translation = keyParse(key, locales[trLocale]);

  if (!translation && trLocale !== 'en')
    return tr(key, args, { ...options, locale: 'en' });
  else if (translation) {
    const str = (typeof translation === 'function') ? translation(args) : translation;
    return parsePatterns(str);
  }
  return `{{ ${key} }}`;
};

export default tr;