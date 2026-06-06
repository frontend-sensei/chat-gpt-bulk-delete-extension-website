export default {
  eleventyComputed: {
    locale(data) {
      return data.localesByCode[data.site.defaultLocale];
    }
  }
};
