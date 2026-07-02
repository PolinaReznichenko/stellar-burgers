export function getCookie(name: string): string | undefined {
  const matches = document.cookie.match(
    new RegExp(
      '(?:^|; )' +
        // eslint-disable-next-line no-useless-escape
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
        '=([^;]*)'
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(
  name: string, // имя куки
  value: string, // значение куки
  props: { [key: string]: string | number | Date | boolean } = {} // объект, содержащий дополнительные свойства куки
) {
  props = {
    path: '/',
    ...props
  };

  let exp = props.expires; // если в объекте props передано значение для свойства expires (время жизни куки), то оно обрабатывается
  //Если expires — число (предполагается, что это количество секунд), то к текущей дате прибавляется это количество секунд и устанавливается новая дата истечения
  if (exp && typeof exp === 'number') {
    const d = new Date();
    d.setTime(d.getTime() + exp * 1000);
    exp = props.expires = d;
  }
  //  Если expires — объект типа Date, то он преобразуется в строку в формате UTC
  if (exp && exp instanceof Date) {
    props.expires = exp.toUTCString();
  }
  //  Значение value кодируется с использованием encodeURIComponent, чтобы убедиться, что оно может быть использовано внутри куки без проблем
  value = encodeURIComponent(value);
  //  Создание строки updatedCookie, которая содержит имя и значение куки
  let updatedCookie = name + '=' + value;
  //  Проходим по всем свойствам объекта props. Каждое переданное свойство и его значение добавляем к строке updatedCookie , разеделяя их «;»
  for (const propName in props) {
    updatedCookie += '; ' + propName;
    const propValue = props[propName];
    if (propValue !== true) {
      updatedCookie += '=' + propValue;
    }
  }
  // Устанавливаем куку
  document.cookie = updatedCookie;
}

export function deleteCookie(name: string) {
  setCookie(name, '', { expires: -1 });
}
