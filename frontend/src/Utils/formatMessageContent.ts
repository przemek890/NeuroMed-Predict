const formatMessageContent = (content: string, styleColor: string = "#5d8a94") => {
  const phoneRegex = /(\d{3})\s?(\d{3})\s?(\d{3})/g;
  content = content.replace(phoneRegex, (match) => {
    return `<a href="tel:${match}" style="color: ${styleColor}; text-decoration: underline; font-style: italic;">${match}</a>`;
  });

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  content = content.replace(emailRegex, (match) => {
    return `<a href="mailto:${match}" style="color: ${styleColor}; text-decoration: underline; font-style: italic;">${match}</a>`;
  });


  const boldRegex = /\*\*\*([^\*]+)\*\*\*/g; // eslint-disable-line no-useless-escape
  content = content.replace(boldRegex, (match, text) => {
    return `<strong>${text}</strong>`;
  });

  return content;
};

export default formatMessageContent;
